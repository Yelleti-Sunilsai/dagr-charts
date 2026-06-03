import { create } from 'zustand';

export type WorkspaceWidget = {
  id: string;
  type: string;
  x: number; // grid column (0 to 23)
  y: number; // grid row (0 to N)
  w: number; // width in grid columns (1 to 24)
  h: number; // height in grid rows (each row is e.g. 50px)
  config?: any;
};

export type DashboardPage = {
  id: string;
  name: string;
  widgets: WorkspaceWidget[];
};

export type DashboardConfig = {
  activePageId: string;
  pages: DashboardPage[];
};

// AWS Console-style collision resolution and vertical compaction algorithm
export function compactLayout(widgets: WorkspaceWidget[], activeId?: string): WorkspaceWidget[] {
  // Sort widgets so the active widget is placed first and does not move.
  // The rest are sorted by y, then by x to maintain their relative position.
  const sorted = [...widgets].sort((a, b) => {
    if (a.id === activeId) return -1;
    if (b.id === activeId) return 1;
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  const placed: WorkspaceWidget[] = [];

  for (const widget of sorted) {
    const copy = { ...widget };
    if (copy.id === activeId) {
      placed.push(copy);
      continue;
    }

    // Attempt to compact upward by placing at y = 0 and shifting down only on collisions
    let currentY = 0;
    copy.y = currentY;

    let hasCollision = true;
    while (hasCollision) {
      hasCollision = false;
      for (const placedWidget of placed) {
        const overlapX = copy.x < placedWidget.x + placedWidget.w && copy.x + copy.w > placedWidget.x;
        const overlapY = copy.y < placedWidget.y + placedWidget.h && copy.y + copy.h > placedWidget.y;
        
        if (overlapX && overlapY) {
          copy.y = placedWidget.y + placedWidget.h;
          hasCollision = true;
          break; // Restart collision check with new y
        }
      }
    }
    placed.push(copy);
  }

  return placed;
}

interface WorkspaceStore {
  pages: DashboardPage[];
  activePageId: string;
  widgets: WorkspaceWidget[]; // Kept for backward compatibility, synced with active page
  isEditing: boolean;
  backupWidgets: WorkspaceWidget[];
  draggedWidget: { id: string; x: number; y: number; w: number; h: number } | null;
  setEditing: (isEditing: boolean) => void;
  setDraggedWidget: (widget: { id: string; x: number; y: number; w: number; h: number } | null) => void;
  saveLayout: () => Promise<void>;
  saveLayoutDirect: (pagesList: DashboardPage[], activeId: string) => Promise<void>;
  cancelChanges: () => void;
  loadLayout: () => Promise<void>;
  
  // Page operations
  setActivePage: (pageId: string) => void;
  addPage: (name?: string) => void;
  renamePage: (pageId: string, name: string) => void;
  removePage: (pageId: string) => void;
  movePage: (pageId: string, direction: 'left' | 'right') => void;

  // Widget operations (affect active page)
  addWidget: (widget: Omit<WorkspaceWidget, 'id'>) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  updateWidgetSize: (id: string, w: number, h: number) => void;
  updateWidgetConfig: (id: string, config: any) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  pages: [],
  activePageId: '',
  widgets: [],
  isEditing: true, // Always editing/resizable by default
  backupWidgets: [],
  draggedWidget: null,
  
  setEditing: (isEditing) => {
    set({ isEditing });
  },

  setDraggedWidget: (draggedWidget) => set({ draggedWidget }),

  saveLayoutDirect: async (pagesList: DashboardPage[], activeId: string) => {
    const config = { activePageId: activeId, pages: pagesList };
    try {
      const response = await fetch('http://localhost:8000/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        localStorage.setItem('dagr-dashboard-config', JSON.stringify(config));
      } else {
        console.error('Failed to save dashboard config to backend');
        localStorage.setItem('dagr-dashboard-config', JSON.stringify(config));
      }
    } catch (err) {
      console.error('Error auto-saving dashboard config:', err);
      localStorage.setItem('dagr-dashboard-config', JSON.stringify(config));
    }
  },

  saveLayout: async () => {
    await get().saveLayoutDirect(get().pages, get().activePageId);
  },

  cancelChanges: () => {
    // No-op in direct editing mode
  },

  loadLayout: async () => {
    try {
      const response = await fetch('http://localhost:8000/api/layout');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          let activePageId = data.activePageId;
          let pages = data.pages;
          
          // Legacy array loaded from backend
          if (Array.isArray(data)) {
            pages = [{
              id: 'default-page-1',
              name: 'Page 1',
              widgets: data
            }];
            activePageId = 'default-page-1';
          }
          
          if (Array.isArray(pages) && pages.length > 0) {
            const formattedPages = pages.map((page: any) => ({
              ...page,
              widgets: compactLayout((page.widgets || []).map((item: any) => ({
                ...item,
                w: item.w || item.width || 8,
                h: item.h || item.height || 6,
              })))
            }));
            
            if (!formattedPages.some((p) => p.id === activePageId)) {
              activePageId = formattedPages[0].id;
            }
            
            const activePage = formattedPages.find((p) => p.id === activePageId);
            const activeWidgets = activePage ? activePage.widgets : [];
            
            set({
              pages: formattedPages,
              activePageId,
              widgets: activeWidgets,
            });
            return;
          }
        }
      }
    } catch (err) {
      console.error('Error loading layout from backend:', err);
    }

    // Fallback to localStorage
    let saved = localStorage.getItem('dagr-dashboard-config');
    if (!saved) {
      saved = localStorage.getItem('dagr-dashboard-layout');
    }
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let activePageId = 'default-page-1';
        let pages: any[] = [];
        
        if (Array.isArray(parsed)) {
          pages = [{
            id: 'default-page-1',
            name: 'Page 1',
            widgets: parsed
          }];
        } else if (parsed && typeof parsed === 'object') {
          pages = parsed.pages || [];
          activePageId = parsed.activePageId || (pages[0]?.id || 'default-page-1');
        }
        
        if (pages.length > 0) {
          const formattedPages = pages.map((page: any) => ({
            ...page,
            widgets: compactLayout((page.widgets || []).map((item: any) => ({
              ...item,
              w: item.w || item.width || 8,
              h: item.h || item.height || 6,
            })))
          }));
          
          if (!formattedPages.some((p) => p.id === activePageId)) {
            activePageId = formattedPages[0].id;
          }
          
          const activePage = formattedPages.find((p) => p.id === activePageId);
          set({
            pages: formattedPages,
            activePageId,
            widgets: activePage ? activePage.widgets : [],
          });
          return;
        }
      } catch (e) {
        console.error('Error parsing saved layout:', e);
      }
    }

    // Completely empty fallback: create 1 default page
    const defaultPage: DashboardPage = {
      id: 'default-page-1',
      name: 'Page 1',
      widgets: [],
    };
    set({
      pages: [defaultPage],
      activePageId: 'default-page-1',
      widgets: [],
    });
  },

  // Page Operations
  setActivePage: (pageId) => {
    set((state) => {
      const page = state.pages.find((p) => p.id === pageId);
      if (!page) return {};
      get().saveLayoutDirect(state.pages, pageId);
      return { activePageId: pageId, widgets: page.widgets };
    });
  },

  addPage: (name) => {
    set((state) => {
      const newPageId = crypto.randomUUID();
      const newPageName = name || `Page ${state.pages.length + 1}`;
      const newPage: DashboardPage = {
        id: newPageId,
        name: newPageName,
        widgets: [],
      };
      const updatedPages = [...state.pages, newPage];
      get().saveLayoutDirect(updatedPages, newPageId);
      return {
        pages: updatedPages,
        activePageId: newPageId,
        widgets: [],
      };
    });
  },

  renamePage: (pageId, name) => {
    set((state) => {
      const updatedPages = state.pages.map((page) =>
        page.id === pageId ? { ...page, name } : page
      );
      get().saveLayoutDirect(updatedPages, state.activePageId);
      return { pages: updatedPages };
    });
  },

  removePage: (pageId) => {
    set((state) => {
      if (state.pages.length <= 1) return {};
      
      const updatedPages = state.pages.filter((page) => page.id !== pageId);
      let nextActiveId = state.activePageId;
      
      if (state.activePageId === pageId) {
        const deletedIndex = state.pages.findIndex((page) => page.id === pageId);
        const nextIndex = Math.max(0, deletedIndex - 1);
        nextActiveId = updatedPages[nextIndex].id;
      }
      
      const nextActivePage = updatedPages.find((p) => p.id === nextActiveId);
      const nextWidgets = nextActivePage ? nextActivePage.widgets : [];
      
      get().saveLayoutDirect(updatedPages, nextActiveId);
      return {
        pages: updatedPages,
        activePageId: nextActiveId,
        widgets: nextWidgets,
      };
    });
  },

  movePage: (pageId, direction) => {
    set((state) => {
      const index = state.pages.findIndex((page) => page.id === pageId);
      if (index === -1) return {};
      
      const newPages = [...state.pages];
      if (direction === 'left' && index > 0) {
        const temp = newPages[index];
        newPages[index] = newPages[index - 1];
        newPages[index - 1] = temp;
      } else if (direction === 'right' && index < newPages.length - 1) {
        const temp = newPages[index];
        newPages[index] = newPages[index + 1];
        newPages[index + 1] = temp;
      } else {
        return {};
      }
      
      get().saveLayoutDirect(newPages, state.activePageId);
      return { pages: newPages };
    });
  },

  // Widget Operations (acting on active page)
  addWidget: (widget) =>
    set((state) => {
      const newWidget = { ...widget, id: crypto.randomUUID() };
      const updated = [...state.widgets, newWidget];
      const compacted = compactLayout(updated, newWidget.id);
      
      const updatedPages = state.pages.map((page) =>
        page.id === state.activePageId ? { ...page, widgets: compacted } : page
      );
      
      get().saveLayoutDirect(updatedPages, state.activePageId);
      return { widgets: compacted, pages: updatedPages };
    }),

  removeWidget: (id) =>
    set((state) => {
      const updated = state.widgets.filter((widget) => widget.id !== id);
      const compacted = compactLayout(updated);
      
      const updatedPages = state.pages.map((page) =>
        page.id === state.activePageId ? { ...page, widgets: compacted } : page
      );
      
      get().saveLayoutDirect(updatedPages, state.activePageId);
      return { widgets: compacted, pages: updatedPages };
    }),

  updateWidgetPosition: (id, x, y) =>
    set((state) => {
      const updated = state.widgets.map((widget) =>
        widget.id === id ? { ...widget, x, y } : widget
      );
      const compacted = compactLayout(updated, id);
      
      const updatedPages = state.pages.map((page) =>
        page.id === state.activePageId ? { ...page, widgets: compacted } : page
      );
      
      get().saveLayoutDirect(updatedPages, state.activePageId);
      return { widgets: compacted, pages: updatedPages };
    }),

  updateWidgetSize: (id, w, h) =>
    set((state) => {
      const updated = state.widgets.map((widget) =>
        widget.id === id ? { ...widget, w, h } : widget
      );
      const compacted = compactLayout(updated, id);
      
      const updatedPages = state.pages.map((page) =>
        page.id === state.activePageId ? { ...page, widgets: compacted } : page
      );
      
      get().saveLayoutDirect(updatedPages, state.activePageId);
      return { widgets: compacted, pages: updatedPages };
    }),

  updateWidgetConfig: (id, config) =>
    set((state) => {
      const updated = state.widgets.map((widget) =>
        widget.id === id ? { ...widget, config: { ...widget.config, ...config } } : widget
      );
      
      const updatedPages = state.pages.map((page) =>
        page.id === state.activePageId ? { ...page, widgets: updated } : page
      );
      
      return { widgets: updated, pages: updatedPages };
    }),
}));



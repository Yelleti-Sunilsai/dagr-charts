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

  // Sort back by ID or just return the compacted list
  return placed;
}

interface WorkspaceStore {
  widgets: WorkspaceWidget[];
  isEditing: boolean;
  backupWidgets: WorkspaceWidget[];
  draggedWidget: { id: string; x: number; y: number; w: number; h: number } | null;
  setEditing: (isEditing: boolean) => void;
  setDraggedWidget: (widget: { id: string; x: number; y: number; w: number; h: number } | null) => void;
  saveLayout: () => Promise<void>;
  saveLayoutDirect: (widgets: WorkspaceWidget[]) => Promise<void>;
  cancelChanges: () => void;
  loadLayout: () => Promise<void>;
  addWidget: (widget: Omit<WorkspaceWidget, 'id'>) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  updateWidgetSize: (id: string, w: number, h: number) => void;
  updateWidgetConfig: (id: string, config: any) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  widgets: [],
  isEditing: true, // Always editing/resizable by default
  backupWidgets: [],
  draggedWidget: null,
  
  setEditing: (isEditing) => {
    set({ isEditing });
  },

  setDraggedWidget: (draggedWidget) => set({ draggedWidget }),

  saveLayoutDirect: async (widgetsList: WorkspaceWidget[]) => {
    try {
      const response = await fetch('http://localhost:8000/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgetsList),
      });
      if (response.ok) {
        localStorage.setItem('dagr-dashboard-layout', JSON.stringify(widgetsList));
      } else {
        console.error('Failed to save layout to backend');
        localStorage.setItem('dagr-dashboard-layout', JSON.stringify(widgetsList));
      }
    } catch (err) {
      console.error('Error auto-saving layout:', err);
      localStorage.setItem('dagr-dashboard-layout', JSON.stringify(widgetsList));
    }
  },

  saveLayout: async () => {
    await get().saveLayoutDirect(get().widgets);
  },

  cancelChanges: () => {
    // No-op in direct editing mode
  },

  loadLayout: async () => {
    try {
      const response = await fetch('http://localhost:8000/api/layout');
      if (response.ok) {
        const layout = await response.json();
        if (Array.isArray(layout) && layout.length > 0) {
          const validLayout = layout.map((item: any) => ({
            ...item,
            w: item.w || item.width || 8,
            h: item.h || item.height || 6,
          }));
          set({ widgets: compactLayout(validLayout) });
          return;
        }
      }
    } catch (err) {
      console.error('Error loading layout from backend:', err);
    }

    // Fallback to localStorage
    const saved = localStorage.getItem('dagr-dashboard-layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validLayout = parsed.map((item: any) => ({
            ...item,
            w: item.w || item.width || 8,
            h: item.h || item.height || 6,
          }));
          set({ widgets: compactLayout(validLayout) });
        }
      } catch (e) {
        console.error('Error parsing saved layout:', e);
      }
    }
  },

  addWidget: (widget) =>
    set((state) => {
      const newWidget = { ...widget, id: crypto.randomUUID() };
      const updated = [...state.widgets, newWidget];
      const compacted = compactLayout(updated, newWidget.id);
      get().saveLayoutDirect(compacted);
      return { widgets: compacted };
    }),

  removeWidget: (id) =>
    set((state) => {
      const updated = state.widgets.filter((widget) => widget.id !== id);
      const compacted = compactLayout(updated);
      get().saveLayoutDirect(compacted);
      return { widgets: compacted };
    }),

  updateWidgetPosition: (id, x, y) =>
    set((state) => {
      const updated = state.widgets.map((widget) =>
        widget.id === id ? { ...widget, x, y } : widget
      );
      const compacted = compactLayout(updated, id);
      get().saveLayoutDirect(compacted);
      return { widgets: compacted };
    }),

  updateWidgetSize: (id, w, h) =>
    set((state) => {
      const updated = state.widgets.map((widget) =>
        widget.id === id ? { ...widget, w, h } : widget
      );
      const compacted = compactLayout(updated, id);
      get().saveLayoutDirect(compacted);
      return { widgets: compacted };
    }),

  updateWidgetConfig: (id, config) =>
    set((state) => {
      const updated = state.widgets.map((widget) =>
        widget.id === id ? { ...widget, config: { ...widget.config, ...config } } : widget
      );
      get().saveLayoutDirect(updated);
      return { widgets: updated };
    }),
}));

import { create } from 'zustand';

export type WorkspaceWidget = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config?: any;
};

interface WorkspaceStore {
  widgets: WorkspaceWidget[];
  addWidget: (widget: Omit<WorkspaceWidget, 'id'>) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  updateWidgetSize: (id: string, width: number, height: number) => void;
  updateWidgetConfig: (id: string, config: any) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  widgets: [],
  addWidget: (widget) =>
    set((state) => ({
      widgets: [
        ...state.widgets,
        { ...widget, id: crypto.randomUUID() },
      ],
    })),
  removeWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    })),
  updateWidgetPosition: (id, x, y) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })),
  updateWidgetSize: (id, width, height) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),
  updateWidgetConfig: (id, config) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, config: { ...w.config, ...config } } : w
      ),
    })),
}));

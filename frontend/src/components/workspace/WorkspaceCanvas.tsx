"use client";

import { useDroppable } from '@dnd-kit/core';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WidgetContainer } from '../widgets/WidgetContainer';

export function WorkspaceCanvas() {
  const { widgets } = useWorkspaceStore();
  const { setNodeRef, isOver } = useDroppable({
    id: 'workspace-canvas',
  });

  return (
    <main 
      ref={setNodeRef}
      className={`
        flex-1 relative overflow-hidden bg-neutral-950 transition-colors
        ${isOver ? 'bg-neutral-900/50' : ''}
      `}
      style={{
        backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      {widgets.map((widget) => (
        <WidgetContainer key={widget.id} {...widget} />
      ))}
      
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-neutral-500 text-center">
            <p className="text-xl font-medium mb-2">Canvas is empty</p>
            <p className="text-sm">Drag widgets from the sidebar to get started</p>
          </div>
        </div>
      )}
    </main>
  );
}

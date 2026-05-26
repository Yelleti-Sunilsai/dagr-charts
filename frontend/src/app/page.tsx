"use client";

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { WorkspaceCanvas } from '@/components/workspace/WorkspaceCanvas';
import { useWorkspaceStore } from '@/store/workspaceStore';

export default function Home() {
  const { addWidget } = useWorkspaceStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (over && over.id === 'workspace-canvas') {
      // Get data from dragged item
      const type = active.data.current?.type;
      const dataset = active.data.current?.dataset;
      
      if (type) {
        // Drop coordinates roughly based on delta and a fixed offset from sidebar
        // In a real app we'd compute exact relative offset using mouse position over canvas ref
        // For simplicity, placing near center or relative to delta
        addWidget({
          type,
          x: Math.max(0, 250 + delta.x),
          y: Math.max(0, 100 + delta.y),
          width: 400,
          height: 300,
          config: dataset ? { dataset } : undefined,
        });
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
        <Sidebar />
        <WorkspaceCanvas />
      </div>
    </DndContext>
  );
}

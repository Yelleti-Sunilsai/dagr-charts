"use client";

import { useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { WorkspaceCanvas } from '@/components/workspace/WorkspaceCanvas';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { LayoutGrid } from 'lucide-react';

export default function Home() {
  const { addWidget, loadLayout } = useWorkspaceStore();

  // Load layout on initial mount
  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'workspace-canvas') {
      const type = active.data.current?.type;
      const dataset = active.data.current?.dataset;
      
      if (type) {
        // We get the original event to locate pointer position
        const activator = event.activatorEvent as MouseEvent;
        const clientX = activator.clientX;
        const clientY = activator.clientY;

        const canvasElement = document.getElementById('workspace-canvas');
        if (canvasElement && clientX !== undefined && clientY !== undefined) {
          const rect = canvasElement.getBoundingClientRect();
          const relativeX = clientX - rect.left;
          const relativeY = clientY - rect.top;

          const canvasWidth = rect.width;
          const colWidth = Math.floor(canvasWidth / 24);
          const rowHeight = 50; // Row unit

          // Default width: 8 columns, height: 7 rows
          const defaultW = 8;
          const defaultH = 7;

          // Convert client offsets to grid cell indices
          // Subtract half the width/height to center the drop on the cursor
          let gridX = Math.round((relativeX - (defaultW * colWidth) / 2) / colWidth);
          let gridY = Math.round((relativeY - (defaultH * rowHeight) / 2) / rowHeight);

          // Boundaries clamp
          gridX = Math.max(0, Math.min(24 - defaultW, gridX));
          gridY = Math.max(0, gridY);

          addWidget({
            type,
            x: gridX,
            y: gridY,
            w: defaultW,
            h: defaultH,
            config: dataset ? { dataset } : undefined,
          });
        } else {
          // Fallback placement
          addWidget({
            type,
            x: 0,
            y: 0,
            w: 8,
            h: 7,
            config: dataset ? { dataset } : undefined,
          });
        }
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Dashboard Title Header (No Edit/Save Buttons) */}
          <header className="h-16 border-b border-neutral-800 bg-neutral-950 px-6 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">
                  CloudWatch Dashboard
                </h1>
                <p className="text-xs text-neutral-500">Resizing and grid snapping layout manager</p>
              </div>
            </div>
            
            <div className="text-xs text-neutral-500 font-medium">
              Autosaved
            </div>
          </header>

          <WorkspaceCanvas />
        </div>
      </div>
    </DndContext>
  );
}

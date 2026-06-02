"use client";

import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useWorkspaceStore, compactLayout } from '@/store/workspaceStore';
import { WidgetContainer } from '../widgets/WidgetContainer';

export function WorkspaceCanvas() {
  const { widgets, isEditing, draggedWidget } = useWorkspaceStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(1200); // Default fallback

  // Hook into Dnd Droppable
  const { setNodeRef, isOver } = useDroppable({
    id: 'workspace-canvas',
  });

  // Track resizing of canvas to compute responsive column widths
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Combine drop target and measurement refs
  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (containerRef as any).current = node;
  };

  const rowHeight = 50; // Grid row unit height
  const colWidth = Math.floor(canvasWidth / 24);
  const gap = 12; // Visual Gap between graphs

  // Compute real-time compacted layout to show widgets rearranging during drag/resize
  const displayWidgets = draggedWidget 
    ? compactLayout(
        widgets.map(w => 
          w.id === draggedWidget.id 
            ? { ...w, x: draggedWidget.x, y: draggedWidget.y, w: draggedWidget.w, h: draggedWidget.h } 
            : w
        ), 
        draggedWidget.id
      )
    : widgets;

  // Dynamic grid background
  const gridStyle = isEditing
    ? {
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: `${colWidth}px ${rowHeight}px`,
      }
    : {
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      };

  return (
    <main 
      id="workspace-canvas"
      ref={setRefs}
      className={`
        flex-1 relative overflow-y-auto overflow-x-hidden bg-neutral-950 transition-colors select-none
        ${isOver && isEditing ? 'bg-neutral-900/40' : ''}
      `}
      style={{
        ...gridStyle,
        minHeight: '100%',
        paddingBottom: '200px', // Extra scrolling space at the bottom
      }}
    >
      {/* Visual Snap Preview Ghost: AWS Console Solid Blue Block */}
      {isEditing && draggedWidget && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/30 rounded-xl pointer-events-none transition-all duration-100 z-0 shadow-lg shadow-blue-500/15"
          style={{
            left: draggedWidget.x * colWidth + gap / 2,
            top: draggedWidget.y * rowHeight + gap / 2,
            width: draggedWidget.w * colWidth - gap,
            height: draggedWidget.h * rowHeight - gap,
          }}
        />
      )}

      {/* Render Widgets */}
      {displayWidgets.map((widget) => (
        <WidgetContainer 
          key={widget.id} 
          {...widget} 
          colWidth={colWidth} 
          rowHeight={rowHeight}
        />
      ))}
      
      {/* Empty State */}
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

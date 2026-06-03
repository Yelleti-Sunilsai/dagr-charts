"use client";

import { useEffect, useState, useRef } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { WorkspaceCanvas } from '@/components/workspace/WorkspaceCanvas';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { LayoutGrid, Plus, X, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';

export default function Home() {
  const { 
    pages, 
    activePageId, 
    setActivePage, 
    addPage, 
    renamePage, 
    removePage, 
    movePage,
    addWidget, 
    loadLayout 
  } = useWorkspaceStore();

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load layout on initial mount
  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  useEffect(() => {
    if (editingPageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPageId]);

  const handleStartRename = (pageId: string, name: string) => {
    setEditingPageId(pageId);
    setEditingName(name);
  };

  const handleSaveRename = (pageId: string) => {
    if (editingName.trim()) {
      renamePage(pageId, editingName.trim());
    }
    setEditingPageId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, pageId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(pageId);
    } else if (e.key === 'Escape') {
      setEditingPageId(null);
    }
  };

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

          {/* Page Management Sub-header Tab Bar */}
          <div className="h-12 border-b border-neutral-800 bg-neutral-950 px-6 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pr-4 max-w-[calc(100%-140px)]">
              {pages.map((page) => {
                const isActive = page.id === activePageId;
                const isEditingName = page.id === editingPageId;
                
                return (
                  <div
                    key={page.id}
                    onClick={() => !isActive && setActivePage(page.id)}
                    className={`group relative flex items-center gap-2 h-8 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 select-none
                      ${isActive 
                        ? 'bg-neutral-900 border-blue-500/80 text-white shadow-md shadow-blue-500/5' 
                        : 'bg-neutral-950/20 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }
                    `}
                  >
                    {isEditingName ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveRename(page.id)}
                        onKeyDown={(e) => handleKeyDown(e, page.id)}
                        className="bg-neutral-800 text-white outline-none border border-neutral-700 px-1 py-0.5 rounded w-24 font-normal text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span 
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(page.id, page.name);
                        }}
                        className="truncate max-w-[120px]"
                      >
                        {page.name}
                      </span>
                    )}

                    {/* Active/Hover Actions: Rename, Move, Delete */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1">
                      {isActive && !isEditingName && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRename(page.id, page.name);
                            }}
                            className="p-0.5 hover:bg-neutral-800 hover:text-neutral-200 text-neutral-500 rounded transition-colors"
                            title="Rename page"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              movePage(page.id, 'left');
                            }}
                            className="p-0.5 hover:bg-neutral-800 hover:text-neutral-200 text-neutral-500 rounded transition-colors"
                            title="Move page left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              movePage(page.id, 'right');
                            }}
                            className="p-0.5 hover:bg-neutral-800 hover:text-neutral-200 text-neutral-500 rounded transition-colors"
                            title="Move page right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePage(page.id);
                          }}
                          className="p-0.5 hover:bg-red-500/20 hover:text-red-400 text-neutral-500 rounded transition-colors"
                          title="Delete page"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => addPage()}
              className="flex items-center gap-1.5 px-3 h-7.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/15 transition-all duration-200 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Page</span>
            </button>
          </div>

          <WorkspaceCanvas />
        </div>
      </div>
    </DndContext>
  );
}


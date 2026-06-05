"use client";

import { useEffect, useState, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { Sidebar, CHARTS } from '@/components/sidebar/Sidebar';
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
    loadLayout,
    title,
    description,
    setTitle,
    setDescription,
    hasUnsavedChanges,
    saveLayout
  } = useWorkspaceStore();

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Active dragging card state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Dashboard Title & Description renaming state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [titleInputVal, setTitleInputVal] = useState('');
  const [descInputVal, setDescInputVal] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);

  // Load layout on initial mount
  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  // Keyboard shortcut listener for Ctrl+S
  useEffect(() => {
    const handleSaveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveLayout();
      }
    };
    window.addEventListener('keydown', handleSaveShortcut);
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut);
    };
  }, [saveLayout]);

  useEffect(() => {
    if (editingPageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPageId]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDesc && descInputRef.current) {
      descInputRef.current.focus();
      descInputRef.current.select();
    }
  }, [isEditingDesc]);

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

  const handleStartEditTitle = () => {
    setTitleInputVal(title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (titleInputVal.trim()) {
      setTitle(titleInputVal.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleStartEditDesc = () => {
    setDescInputVal(description);
    setIsEditingDesc(true);
  };

  const handleSaveDesc = () => {
    setDescription(descInputVal.trim());
    setIsEditingDesc(false);
  };

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveDesc();
    } else if (e.key === 'Escape') {
      setIsEditingDesc(false);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
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
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd} 
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Dashboard Title Header (No Edit/Save Buttons) */}
          <header className="h-16 border-b border-neutral-800 bg-neutral-950 px-6 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                {/* Dashboard Title */}
                <div className="flex items-center gap-2 group/title h-7">
                  {isEditingTitle ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={titleInputVal}
                      onChange={(e) => setTitleInputVal(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={handleTitleKeyDown}
                      className="bg-neutral-900 text-white outline-none border border-neutral-700 px-2 py-0.5 rounded font-bold text-base w-64 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  ) : (
                    <div 
                      onClick={handleStartEditTitle}
                      className="flex items-center gap-1.5 cursor-pointer hover:bg-neutral-900/60 hover:text-neutral-100 rounded px-1.5 py-0.5 -ml-1.5 transition-all duration-150 max-w-xs sm:max-w-md truncate"
                      title="Click to rename dashboard"
                    >
                      <h1 className="text-base font-bold tracking-tight text-white truncate">
                        {title}
                      </h1>
                      <Edit2 className="w-3.5 h-3.5 text-neutral-500 opacity-0 group-hover/title:opacity-100 transition-opacity duration-150 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Dashboard Description */}
                <div className="flex items-center gap-2 group/desc h-5">
                  {isEditingDesc ? (
                    <input
                      ref={descInputRef}
                      type="text"
                      value={descInputVal}
                      onChange={(e) => setDescInputVal(e.target.value)}
                      onBlur={handleSaveDesc}
                      onKeyDown={handleDescKeyDown}
                      className="bg-neutral-900 text-neutral-300 outline-none border border-neutral-800 px-2 py-0.5 rounded text-xs w-80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  ) : (
                    <div 
                      onClick={handleStartEditDesc}
                      className="flex items-center gap-1.5 cursor-pointer hover:bg-neutral-900/60 hover:text-neutral-300 rounded px-1.5 py-0.5 -ml-1.5 transition-all duration-150 truncate max-w-sm sm:max-w-xl"
                      title="Click to edit description"
                    >
                      <p className="text-xs text-neutral-500 truncate">
                        {description || "Add a description..."}
                      </p>
                      <Edit2 className="w-3 h-3 text-neutral-600 opacity-0 group-hover/desc:opacity-100 transition-opacity duration-150 shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              {hasUnsavedChanges ? (
                <button
                  onClick={() => saveLayout()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 shadow-lg shadow-amber-500/5 transition-all duration-150 cursor-pointer"
                  title="Click to save layout changes"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Unsaved changes (Ctrl+S)</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 transition-all duration-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Saved</span>
                </div>
              )}
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

          {/* Keyboard shortcut instruction floating banner */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none select-none">
            <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-2xl shadow-black/80 pointer-events-auto">
              <span className="text-xs font-semibold text-neutral-400">Save structure:</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-300">
                <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 rounded shadow">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 rounded shadow">S</kbd>
              </div>
              <div className="h-3 w-[1px] bg-neutral-800" />
              <button
                onClick={() => saveLayout()}
                className={`text-[10px] font-semibold transition-all duration-150 cursor-pointer
                  ${hasUnsavedChanges 
                    ? 'text-amber-400 hover:text-amber-300 hover:scale-105' 
                    : 'text-neutral-500 cursor-default'
                  }
                `}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? 'Save now' : 'All saved'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeDragId ? (
          (() => {
            const chart = CHARTS.find((c) => c.id === activeDragId);
            if (!chart) return null;
            const Icon = chart.icon;
            return (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/50 bg-neutral-900 shadow-2xl shadow-blue-500/10 cursor-grabbing w-56 opacity-90 scale-105 transform pointer-events-none select-none">
                <div className="p-2 bg-neutral-800 rounded-md text-neutral-300">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-neutral-300">{chart.label}</span>
              </div>
            );
          })()
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}


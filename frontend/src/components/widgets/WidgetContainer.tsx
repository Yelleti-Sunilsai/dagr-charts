"use client";

import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ChartRenderer } from '../renderer/ChartRenderer';
import { Trash2, GripHorizontal } from 'lucide-react';
import { Card } from '../ui/card';

const DATASET_LABELS: Record<string, string> = {
  daily_performance: 'Daily Performance',
  portfolio_returns: 'Portfolio Returns',
  attribution_summary: 'Attribution Summary',
  factor_attribution: 'Factor Attribution',
  attribution_trend: 'Attribution Trend',
  asset_attribution: 'Asset Attribution',
  asset_exposure_analysis: 'Asset Exposure',
  attribution_data_1: 'Attribution Data 1',
  attribution_data_2: 'Attribution Data 2',
  currency_attribution: 'Currency Attribution',
  factor_exposure_analysis: 'Factor Exposure',
  group_attribution_trend: 'Group Attr Trend',
  group_exposure_analysis: 'Group Exposure',
};

export function WidgetContainer({ id, type, x, y, w, h, config, colWidth, rowHeight }: any) {
  const { 
    updateWidgetPosition, 
    updateWidgetSize, 
    removeWidget, 
    isEditing,
    setDraggedWidget 
  } = useWorkspaceStore();
  
  const [data, setData] = useState<any>(config?.data || null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const dataset = config?.dataset;
    if (dataset && !config?.data) {
      fetch(`http://localhost:8000/api/data/${dataset}`)
        .then(res => res.json())
        .then(json => setData(json))
        .catch(err => console.error("Error fetching data:", err));
    }
  }, [type, config?.dataset, config?.data]);

  // Visual Gap configuration between graphs
  const gap = 12;

  // Convert grid coordinates to pixel values, subtracting/adding offsets to enforce grid gaps
  const x_px = x * colWidth + gap / 2;
  const y_px = y * rowHeight + gap / 2;
  const width_px = w * colWidth - gap;
  const height_px = h * rowHeight - gap;

  const title = config?.dataset ? DATASET_LABELS[config.dataset] || 'Analytics Widget' : 'Analytics Widget';

  return (
    <Rnd
      size={isInteracting ? undefined : { width: width_px, height: height_px }}
      position={isInteracting ? undefined : { x: x_px, y: y_px }}
      minWidth={200 - gap}
      minHeight={150 - gap}
      bounds="parent"
      dragHandleClassName="drag-handle"
      disableDragging={!isEditing}
      enableResizing={isEditing ? {
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false
      } : false}
      dragGrid={[colWidth, rowHeight]}
      resizeGrid={[colWidth, rowHeight]}
      onDragStart={() => {
        setIsInteracting(true);
      }}
      onDrag={(e, d) => {
        // Adjust for gap offset when calculating grid snaps
        let snapX = Math.round((d.x - gap / 2) / colWidth);
        let snapY = Math.round((d.y - gap / 2) / rowHeight);
        snapX = Math.max(0, Math.min(24 - w, snapX));
        snapY = Math.max(0, snapY);
        setDraggedWidget({ id, x: snapX, y: snapY, w, h });
      }}
      onDragStop={(e, d) => {
        setDraggedWidget(null);
        setIsInteracting(false);
        let snapX = Math.round((d.x - gap / 2) / colWidth);
        let snapY = Math.round((d.y - gap / 2) / rowHeight);
        snapX = Math.max(0, Math.min(24 - w, snapX));
        snapY = Math.max(0, snapY);
        updateWidgetPosition(id, snapX, snapY);
      }}
      onResizeStart={() => {
        setIsInteracting(true);
      }}
      onResize={(e, direction, ref, delta, position) => {
        let snapW = Math.round((ref.offsetWidth + gap) / colWidth);
        let snapH = Math.round((ref.offsetHeight + gap) / rowHeight);
        snapW = Math.max(2, Math.min(24, snapW));
        snapH = Math.max(2, snapH);
        
        let snapX = Math.round((position.x - gap / 2) / colWidth);
        let snapY = Math.round((position.y - gap / 2) / rowHeight);
        
        setDraggedWidget({ id, x: snapX, y: snapY, w: snapW, h: snapH });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setDraggedWidget(null);
        setIsInteracting(false);
        let snapW = Math.round((ref.offsetWidth + gap) / colWidth);
        let snapH = Math.round((ref.offsetHeight + gap) / rowHeight);
        snapW = Math.max(2, Math.min(24, snapW));
        snapH = Math.max(2, snapH);
        
        let snapX = Math.round((position.x - gap / 2) / colWidth);
        let snapY = Math.round((position.y - gap / 2) / rowHeight);
        
        updateWidgetSize(id, snapW, snapH);
        updateWidgetPosition(id, snapX, snapY);
      }}
      className="absolute z-10"
    >
      <Card 
        className={`h-full w-full flex flex-col overflow-hidden bg-neutral-900 border transition-all duration-200 relative
          ${isInteracting
            ? 'border-blue-500 shadow-2xl shadow-blue-500/20 bg-neutral-900/90'
            : isEditing 
              ? 'border-neutral-700/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5' 
              : 'border-neutral-800/80 shadow-md'
          }
        `}
      >
        {/* Semi-transparent blue overlay shown on the active card while rearranging */}
        {isInteracting && (
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none rounded-xl z-20 border border-blue-500/20" />
        )}

        {/* Widget Header */}
        <div className={`flex items-center justify-between p-3 border-b border-neutral-800/60 bg-neutral-950/40 select-none
          ${isInteracting ? 'border-blue-500/30' : ''}
        `}>
          <div className="flex items-center gap-2 overflow-hidden">
            {isEditing && (
              <div className="drag-handle cursor-move p-1 hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 rounded shrink-0 transition-colors">
                <GripHorizontal className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="text-xs font-semibold text-neutral-200 truncate capitalize">
              {title}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-neutral-500 border border-neutral-800 rounded px-1.5 py-0.5 bg-neutral-950 font-medium uppercase">
              {type}
            </span>
            {isEditing && (
              <button 
                onClick={() => removeWidget(id)}
                className="p-1 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                title="Remove widget"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Widget Chart Content */}
        <div className="flex-1 p-4 min-h-0 relative">
          <ChartRenderer type={type} data={data} dataset={config?.dataset} />
          
          {/* Resize Corner Handle Overlay */}
          {isEditing && (
            <div className="absolute bottom-1 right-1 pointer-events-none text-neutral-600 transition-colors group-hover:text-neutral-400">
              <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-60">
                <line x1="8" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="10" y1="3" x2="3" y2="10" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </div>
      </Card>
    </Rnd>
  );
}

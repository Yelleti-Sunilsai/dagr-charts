"use client";

import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ChartRenderer } from '../renderer/ChartRenderer';
import { Trash2, GripHorizontal } from 'lucide-react';
import { Card } from '../ui/card';

export function WidgetContainer({ id, type, x, y, width, height, config }: any) {
  const { updateWidgetPosition, updateWidgetSize, removeWidget } = useWorkspaceStore();
  const [data, setData] = useState<any>(config?.data || null);

  useEffect(() => {
    // Fetch data from backend using the dataset name if provided
    const dataset = config?.dataset;
    if (dataset && !config?.data) {
      fetch(`http://localhost:8000/api/data/${dataset}`)
        .then(res => res.json())
        .then(json => setData(json))
        .catch(err => console.error("Error fetching data:", err));
    }
  }, [type, config?.dataset, config?.data]);

  return (
    <Rnd
      default={{ x, y, width, height }}
      minWidth={200}
      minHeight={150}
      bounds="parent"
      dragHandleClassName="drag-handle"
      onDragStop={(e, d) => updateWidgetPosition(id, d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWidgetSize(id, parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
        updateWidgetPosition(id, position.x, position.y);
      }}
      className="absolute group z-10"
    >
      <Card className="h-full w-full flex flex-col overflow-hidden bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between p-2 border-b border-neutral-800 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="drag-handle cursor-move p-1 hover:bg-neutral-800 rounded">
            <GripHorizontal className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xs text-neutral-400 font-medium capitalize">{type} Chart</div>
          <button 
            onClick={() => removeWidget(id)}
            className="p-1 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 p-4 min-h-0">
          <ChartRenderer type={type} data={data} dataset={config?.dataset} />
        </div>
      </Card>
    </Rnd>
  );
}

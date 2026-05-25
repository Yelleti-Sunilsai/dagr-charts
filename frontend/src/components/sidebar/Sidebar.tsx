"use client";

import { useDraggable } from '@dnd-kit/core';
import { BarChart3, LineChart, PieChart, Activity } from 'lucide-react';

const CHARTS = [
  { id: 'line-chart-tool', type: 'line', label: 'Line Chart', icon: LineChart },
  { id: 'bar-chart-tool', type: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { id: 'area-chart-tool', type: 'area', label: 'Area Chart', icon: Activity },
];

function DraggableChartCard({ id, type, label, icon: Icon }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900 cursor-grab hover:border-neutral-700 transition-colors
        ${isDragging ? 'opacity-50 border-blue-500' : ''}
      `}
    >
      <div className="p-2 bg-neutral-800 rounded-md text-neutral-300">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-neutral-300">{label}</span>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-neutral-800 bg-black p-4 flex flex-col h-full z-20">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Analytics Builder</h2>
        <p className="text-xs text-neutral-500 mt-1">Drag widgets to canvas</p>
      </div>
      
      <div className="flex flex-col gap-3">
        {CHARTS.map((chart) => (
          <DraggableChartCard key={chart.id} {...chart} />
        ))}
      </div>
    </aside>
  );
}

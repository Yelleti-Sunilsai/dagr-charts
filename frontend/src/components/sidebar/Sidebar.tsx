"use client";

import { useDraggable } from '@dnd-kit/core';
import { BarChart3, LineChart, PieChart, Activity } from 'lucide-react';

export const CHARTS = [
  { id: 'daily-performance', type: 'line', dataset: 'daily_performance', label: 'Daily Performance', icon: LineChart },
  { id: 'portfolio-returns', type: 'area', dataset: 'portfolio_returns', label: 'Portfolio Returns', icon: Activity },
  { id: 'attribution-summary', type: 'bar', dataset: 'attribution_summary', label: 'Attribution Summary', icon: BarChart3 },
  { id: 'factor-attribution', type: 'bar', dataset: 'factor_attribution', label: 'Factor Attribution', icon: BarChart3 },
  { id: 'attribution-trend', type: 'line', dataset: 'attribution_trend', label: 'Attribution Trend', icon: LineChart },
  { id: 'asset-attribution', type: 'bar', dataset: 'asset_attribution', label: 'Asset Attribution', icon: BarChart3 },
  { id: 'asset-exposure', type: 'bar', dataset: 'asset_exposure_analysis', label: 'Asset Exposure', icon: BarChart3 },
  { id: 'attribution-data-1', type: 'bar', dataset: 'attribution_data_1', label: 'Attribution Data 1', icon: BarChart3 },
  { id: 'attribution-data-2', type: 'bar', dataset: 'attribution_data_2', label: 'Attribution Data 2', icon: BarChart3 },
  { id: 'currency-attribution', type: 'bar', dataset: 'currency_attribution', label: 'Currency Attribution', icon: BarChart3 },
  { id: 'factor-exposure', type: 'bar', dataset: 'factor_exposure_analysis', label: 'Factor Exposure', icon: BarChart3 },
  { id: 'group-attr-trend', type: 'line', dataset: 'group_attribution_trend', label: 'Group Attr Trend', icon: LineChart },
  { id: 'group-exposure', type: 'bar', dataset: 'group_exposure_analysis', label: 'Group Exposure', icon: BarChart3 },
];

function DraggableChartCard({ id, type, dataset, label, icon: Icon }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type, dataset },
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

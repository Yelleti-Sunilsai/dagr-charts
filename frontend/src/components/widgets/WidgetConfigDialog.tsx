"use client";

import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { X, Sliders, Settings, Check, HelpCircle } from 'lucide-react';

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

const COLOR_THEMES = [
  { value: 'blue', label: 'Classic Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
  { value: 'green', label: 'Emerald Green', hex: '#10b981', bg: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber Gold', hex: '#f59e0b', bg: 'bg-amber-500' },
  { value: 'purple', label: 'Royal Purple', hex: '#8b5cf6', bg: 'bg-purple-500' },
  { value: 'rose', label: 'Rose Red', hex: '#f43f5e', bg: 'bg-rose-500' },
  { value: 'teal', label: 'Vibrant Teal', hex: '#14b8a6', bg: 'bg-teal-500' },
];

const AXIS_OPTIONS = [
  { value: 'default', label: 'Default Column' },
  { value: 'date', label: 'Date / Time' },
  { value: 'category', label: 'Category Name' },
  { value: 'security_name', label: 'Security / Asset Name' },
  { value: 'factor_name', label: 'Factor Name' },
  { value: 'currency', label: 'Currency Code' },
];

const Y_AXIS_OPTIONS = [
  { value: 'default', label: 'Default Metric' },
  { value: 'value', label: 'Direct Value' },
  { value: 'daily_return', label: 'Daily Return (%)' },
  { value: 'weight', label: 'Position Weight' },
  { value: 'attribution_value', label: 'Attribution Value' },
  { value: 'factor_return', label: 'Factor Return' },
  { value: 'local_return', label: 'Local Return' },
  { value: 'active_weight_avg', label: 'Avg Active Weight' },
];

export function WidgetConfigDialog() {
  const { 
    widgets, 
    activeConfigWidgetId, 
    setActiveConfigWidgetId, 
    updateWidgetConfig, 
    saveLayout 
  } = useWorkspaceStore();

  const widget = widgets.find((w) => w.id === activeConfigWidgetId);

  // Local state for the settings form
  const [dataset, setDataset] = useState('');
  const [xAxis, setXAxis] = useState('default');
  const [yAxis, setYAxis] = useState('default');
  const [series, setSeries] = useState('');
  const [colorTheme, setColorTheme] = useState('blue');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Sync local state when the active widget changes
  useEffect(() => {
    if (widget) {
      const config = widget.config || {};
      setDataset(config.dataset || '');
      setXAxis(config.xAxis || 'default');
      setYAxis(config.yAxis || 'default');
      setSeries(config.series || '');
      setColorTheme(config.colorTheme || 'blue');
      setShowGrid(config.showGrid !== undefined ? config.showGrid : true);
      setShowLegend(config.showLegend !== undefined ? config.showLegend : false);
      setShowTooltip(config.showTooltip !== undefined ? config.showTooltip : true);
    }
  }, [widget, activeConfigWidgetId]);

  if (!widget) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedConfig = {
      dataset,
      xAxis,
      yAxis,
      series,
      colorTheme,
      showGrid,
      showLegend,
      showTooltip,
    };

    // Update state in store
    updateWidgetConfig(widget.id, updatedConfig);
    
    // Persist changes to backend (/api/layout)
    await saveLayout();

    // Close dialog
    setActiveConfigWidgetId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glassmorphic Backdrop Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setActiveConfigWidgetId(null)}
      />

      {/* Settings Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/80 transition-all duration-300 transform scale-100 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 bg-neutral-950 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Widget Configuration</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">ID: {widget.id.substring(0, 8)}... ({widget.type})</p>
            </div>
          </div>
          <button
            onClick={() => setActiveConfigWidgetId(null)}
            className="rounded-lg p-1.5 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
          {/* Data Source Configuration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <span>Data Source</span>
              <span className="text-[10px] text-neutral-500 font-normal">(Required)</span>
            </label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 text-neutral-200 text-sm rounded-lg px-3 py-2 outline-none transition-all"
              required
            >
              <option value="" disabled>Select a dataset...</option>
              {Object.entries(DATASET_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Axes Grid: Two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* X-Axis */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300">X-Axis Column</label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 text-neutral-200 text-sm rounded-lg px-3 py-2 outline-none transition-all"
              >
                {AXIS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Y-Axis */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300">Y-Axis Metric</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 text-neutral-200 text-sm rounded-lg px-3 py-2 outline-none transition-all"
              >
                {Y_AXIS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Series Configuration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300">Series Display Name</label>
            <input
              type="text"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="e.g. Daily Performance Return"
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 text-neutral-200 text-sm rounded-lg px-3 py-2 outline-none transition-all placeholder-neutral-600"
            />
          </div>

          {/* Color/Theme Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300">Color Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEMES.map((theme) => {
                const isSelected = colorTheme === theme.value;
                return (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => setColorTheme(theme.value)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all duration-150 text-left
                      ${isSelected 
                        ? 'bg-neutral-900 border-blue-500/80 text-white shadow-md shadow-blue-500/5' 
                        : 'bg-neutral-950/40 border-neutral-850 text-neutral-450 hover:bg-neutral-900/40 hover:text-neutral-200'
                      }
                    `}
                  >
                    <span className={`w-3 h-3 rounded-full ${theme.bg} shrink-0`} />
                    <span className="truncate">{theme.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Chart Options (Grid, Legend, Tooltip) */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-neutral-300">Display Settings</label>
            <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-4 space-y-4">
              {/* Show Grid */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Show Grid Lines</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Render background grid coordinate lines</p>
                </div>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-950 bg-neutral-900 border-neutral-800"
                />
              </div>

              {/* Show Legend */}
              <div className="flex items-center justify-between border-t border-neutral-900/60 pt-3">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Show Legend</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Display label key descriptions for chart series</p>
                </div>
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-950 bg-neutral-900 border-neutral-800"
                />
              </div>

              {/* Show Tooltip */}
              <div className="flex items-center justify-between border-t border-neutral-900/60 pt-3">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Enable Hover Tooltips</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Show detailed values on mouse hover</p>
                </div>
                <input
                  type="checkbox"
                  checked={showTooltip}
                  onChange={(e) => setShowTooltip(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-950 bg-neutral-900 border-neutral-800"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="border-t border-neutral-900 bg-neutral-950 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveConfigWidgetId(null)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Save Config</span>
          </button>
        </div>
      </div>
    </div>
  );
}

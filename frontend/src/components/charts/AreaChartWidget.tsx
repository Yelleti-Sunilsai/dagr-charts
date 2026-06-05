import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface ChartWidgetProps {
  data?: any[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    series?: string;
    colorTheme?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    [key: string]: any;
  };
}

const THEME_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  rose: '#f43f5e',
  teal: '#14b8a6',
};

export function AreaChartWidget({ data, config }: ChartWidgetProps) {
  const defaultData = data || [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  const areaColor = config?.colorTheme ? THEME_COLORS[config.colorTheme] || '#10b981' : '#10b981';
  const showGrid = config?.showGrid !== false;
  const showTooltip = config?.showTooltip !== false;
  const showLegend = config?.showLegend === true;
  const seriesName = config?.series || 'Value';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={defaultData}>
        <defs>
          <linearGradient id={`colorValue-${areaColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={areaColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={areaColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
        <XAxis dataKey="name" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        {showTooltip && (
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
        )}
        {showLegend && <Legend wrapperStyle={{ paddingTop: '8px' }} />}
        <Area 
          type="monotone" 
          dataKey="value" 
          name={seriesName}
          stroke={areaColor} 
          fillOpacity={1} 
          fill={`url(#colorValue-${areaColor.replace('#', '')})`} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

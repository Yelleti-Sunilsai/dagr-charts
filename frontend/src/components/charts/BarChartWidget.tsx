import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

export function BarChartWidget({ data, config }: ChartWidgetProps) {
  const defaultData = data || [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  const barColor = config?.colorTheme ? THEME_COLORS[config.colorTheme] || '#8b5cf6' : '#8b5cf6';
  const showGrid = config?.showGrid !== false;
  const showTooltip = config?.showTooltip !== false;
  const showLegend = config?.showLegend === true;
  const seriesName = config?.series || 'Value';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={defaultData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />}
        <XAxis dataKey="name" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        {showTooltip && (
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: '#222' }}
          />
        )}
        {showLegend && <Legend wrapperStyle={{ paddingTop: '8px' }} />}
        <Bar 
          dataKey="value" 
          name={seriesName}
          fill={barColor} 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

import { LineChartWidget } from '../charts/LineChartWidget';
import { BarChartWidget } from '../charts/BarChartWidget';
import { AreaChartWidget } from '../charts/AreaChartWidget';
// scatter omitted for brevity, fallback to line if needed

export function ChartRenderer({ type, data }: { type: string; data?: any }) {
  switch (type) {
    case 'line':
      return <LineChartWidget data={data} />;
    case 'bar':
      return <BarChartWidget data={data} />;
    case 'area':
      return <AreaChartWidget data={data} />;
    default:
      return <div className="flex h-full w-full items-center justify-center text-neutral-500">Unknown chart type</div>;
  }
}

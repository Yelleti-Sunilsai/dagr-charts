import { LineChartWidget } from '../charts/LineChartWidget';
import { BarChartWidget } from '../charts/BarChartWidget';
import { AreaChartWidget } from '../charts/AreaChartWidget';

function transformChartData(datasetName: string | undefined, rawData: any) {
  if (!rawData) return null;
  
  if (datasetName === 'daily_performance' && rawData.daily_return) {
    return rawData.daily_return.map((d: any) => ({
      name: new Date(d.date).toLocaleDateString(),
      value: d.daily_return
    }));
  }
  
  if (['portfolio_returns', 'asset_exposure_analysis', 'factor_exposure_analysis', 'group_exposure_analysis'].includes(datasetName || '') && rawData.positions_weighted) {
    return rawData.positions_weighted.slice(0, 30).map((d: any) => ({
      name: d.security_name,
      value: d.weight
    }));
  }
  
  if (datasetName === 'attribution_summary' && rawData.attribution?.[0]?.drill_down) {
    return rawData.attribution[0].drill_down.map((d: any) => ({
      name: d.category,
      value: d.attribution_value
    }));
  }

  if (['attribution_data_1', 'attribution_data_2'].includes(datasetName || '') && rawData.attribution?.drill_down) {
    return rawData.attribution.drill_down.map((d: any) => ({
      name: d.category,
      value: d.attribution_value
    }));
  }
  
  if (datasetName === 'factor_attribution' && rawData.attribution_factor?.factor_details) {
    return rawData.attribution_factor.factor_details.slice(0, 30).map((d: any) => ({
      name: d.factor_name,
      value: d.factor_return
    }));
  }
  
  if (datasetName === 'attribution_trend' && rawData.attribution_trend) {
    return rawData.attribution_trend.map((d: any) => ({
      name: d.month_name,
      value: d.attribution_total
    }));
  }
  
  if (datasetName === 'asset_attribution' && rawData.attribution_asset?.asset_details) {
    return rawData.attribution_asset.asset_details.slice(0, 30).map((d: any) => ({
      name: d.asset_id,
      value: d.local_return
    }));
  }

  if (datasetName === 'currency_attribution' && rawData.attribution_currency?.currency_details) {
    return rawData.attribution_currency.currency_details.map((d: any) => ({
      name: d.currency || 'Base',
      value: d.active_weight_avg
    }));
  }

  if (datasetName === 'group_attribution_trend' && rawData.attribution_group_trend?.[0]?.monthly_results) {
    return rawData.attribution_group_trend[0].monthly_results.map((d: any) => ({
      name: d.month_name,
      value: d.active_return
    }));
  }

  if (Array.isArray(rawData)) return rawData;
  return null;
}

export function ChartRenderer({ type, data, dataset }: { type: string; data?: any; dataset?: string }) {
  const transformedData = transformChartData(dataset, data);

  switch (type) {
    case 'line':
      return <LineChartWidget data={transformedData} />;
    case 'bar':
      return <BarChartWidget data={transformedData} />;
    case 'area':
      return <AreaChartWidget data={transformedData} />;
    default:
      return <div className="flex h-full w-full items-center justify-center text-neutral-500">Unknown chart type</div>;
  }
}

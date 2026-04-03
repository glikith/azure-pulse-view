import React from 'react';
import { formatMetricValue } from '@/utils/formatMetric';
import MetricTrendBadge from './MetricTrendBadge';
import MetricSparkline from './MetricSparkline';
import LoadingState from '@/components/shared/LoadingState';
import { MetricValue } from '@/azure/azureSchemas';

interface AzureMetricCardProps {
  title: string;
  metric: MetricValue | null;
  sparklineData: number[];
  resourceCount: number;
  loading: boolean;
  noDataMessage?: string;
  lastUpdated?: string;
  icon: React.ReactNode;
}

const AzureMetricCard: React.FC<AzureMetricCardProps> = React.memo(({
  title, metric, sparklineData, resourceCount, loading, noDataMessage, lastUpdated, icon
}) => {
  if (loading) return <LoadingState type="card" />;

  const hasData = metric !== null && metric !== undefined;

  return (
    <div className="p-4 rounded-lg bg-card border border-border animate-fade-in hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        </div>
        {hasData && metric.trend && <MetricTrendBadge trend={metric.trend} />}
      </div>

      {hasData ? (
        <>
          <div className="text-2xl font-bold font-mono text-foreground mb-1">
            {formatMetricValue(metric.value, metric.unit)}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{resourceCount} resource{resourceCount !== 1 ? 's' : ''}</span>
            {lastUpdated && <span className="font-mono">{new Date(lastUpdated).toLocaleTimeString()}</span>}
          </div>
          {sparklineData.length > 1 && <MetricSparkline data={sparklineData} />}
        </>
      ) : (
        <p className="text-xs text-muted-foreground mt-2">
          {noDataMessage || 'Waiting for Azure Monitor data...'}
        </p>
      )}
    </div>
  );
});

AzureMetricCard.displayName = 'AzureMetricCard';
export default AzureMetricCard;

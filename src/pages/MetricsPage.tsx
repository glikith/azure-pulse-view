import React from 'react';
import { useAppSelector } from '@/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import LoadingState from '@/components/shared/LoadingState';
import { formatMetricValue } from '@/utils/formatMetric';
import MetricTrendBadge from '@/components/metrics/MetricTrendBadge';

const COLORS = ['hsl(207, 90%, 54%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)'];

const MetricsPage: React.FC = () => {
  const { data, loading, error } = useAppSelector((s) => s.azureMetrics);
  const metrics = Object.values(data);
  const [selectedResource, setSelectedResource] = React.useState<string>('');

  const displayed = selectedResource ? metrics.filter((m) => m.resourceId === selectedResource) : metrics;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Metrics Explorer</h1>
      </div>

      <select value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)}
        className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 w-64 focus:outline-none focus:ring-1 focus:ring-ring">
        <option value="">All Resources</option>
        {metrics.map((m) => <option key={m.resourceId} value={m.resourceId}>{m.resourceName}</option>)}
      </select>

      {error && <ErrorState message={error} compact />}

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <LoadingState type="chart" /><LoadingState type="chart" />
        </div>
      ) : displayed.length > 0 ? (
        <>
          {/* Metric summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            {displayed.slice(0, 1).map((m) =>
              Object.entries(m.metrics).filter(([, v]) => v).map(([key, val]) => {
                const metric = val as { value: number | null; unit: string; trend: 'rising' | 'falling' | 'stable' };
                return (
                  <div key={key} className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-lg font-bold font-mono text-foreground">{formatMetricValue(metric.value, metric.unit)}</p>
                    <MetricTrendBadge trend={metric.trend} />
                  </div>
                );
              })
            )}
          </div>

          {/* Time series chart */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Time Series</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 44%, 8%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend />
                  {displayed.map((m, idx) => (
                    <Line key={m.resourceId} data={m.timeSeries} type="monotone" dataKey="cpuUsage" stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} name={m.resourceName} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <EmptyState message="Connect your Azure backend to explore resource metrics." />
      )}
    </div>
  );
};

export default MetricsPage;

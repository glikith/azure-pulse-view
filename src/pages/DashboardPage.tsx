import React from 'react';
import { Cpu, HardDrive, Wifi, Bell } from 'lucide-react';
import AzureMetricCard from '@/components/metrics/AzureMetricCard';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import LoadingState from '@/components/shared/LoadingState';
import ResourceHealthBadge from '@/components/resources/ResourceHealthBadge';
import SeverityBadge from '@/components/alerts/SeverityBadge';
import { useAppSelector } from '@/store';
import { RESOURCE_TYPE_LABELS } from '@/azure/azureConstants';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = ['hsl(207, 90%, 54%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(190, 80%, 50%)', 'hsl(330, 70%, 55%)'];
const VM_TYPE = 'Microsoft.Compute/virtualMachines';

const DashboardPage: React.FC = () => {
  const { data: metricsData, loading: metricsLoading, error: metricsError } = useAppSelector((s) => s.azureMetrics);
  const { active: activeAlerts } = useAppSelector((s) => s.azureAlerts);
  const { resources, loading: resourcesLoading } = useAppSelector((s) => s.azureResources);

  const metrics = Object.values(metricsData);

  // Compute KPI aggregates
  const avgCpu = metrics.length > 0 ? metrics.reduce((sum, m) => sum + (m.metrics.cpuUsage?.value || 0), 0) / metrics.length : null;
  const avgMem = metrics.length > 0 ? metrics.reduce((sum, m) => sum + (m.metrics.memoryUsage?.value || 0), 0) / metrics.length : null;
  const totalNetIn = metrics.reduce((sum, m) => sum + (m.metrics.networkIn?.value || 0), 0);
  const totalNetOut = metrics.reduce((sum, m) => sum + (m.metrics.networkOut?.value || 0), 0);

  // Time series for charts
  const timeSeriesData = metrics.flatMap((m) =>
    m.timeSeries.map((ts) => ({ ...ts, resourceName: m.resourceName }))
  );

  // Resource type distribution
  const typeDistribution = resources.reduce((acc, r) => {
    const label = RESOURCE_TYPE_LABELS[r.resourceType] || r.resourceType;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));

  const noBackendConnected = !metricsLoading && !metricsError && metrics.length === 0 && resources.length === 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <AzureMetricCard
          title="CPU Usage"
          icon={<Cpu className="h-4 w-4" />}
          metric={avgCpu !== null ? { value: avgCpu, unit: 'Percent', trend: 'stable' } : null}
          sparklineData={metrics.flatMap((m) => m.timeSeries.map((ts) => (ts as Record<string, unknown>).cpuUsage as number || 0)).slice(-10)}
          resourceCount={metrics.length}
          loading={metricsLoading}
          noDataMessage={noBackendConnected ? 'Connect backend to view live CPU metrics' : undefined}
          lastUpdated={metrics[0]?.lastUpdated}
        />
        <AzureMetricCard
          title="Memory Usage"
          icon={<HardDrive className="h-4 w-4" />}
          metric={avgMem !== null ? { value: avgMem, unit: 'Bytes', trend: 'stable' } : null}
          sparklineData={metrics.flatMap((m) => m.timeSeries.map((ts) => (ts as Record<string, unknown>).memoryUsage as number || 0)).slice(-10)}
          resourceCount={metrics.length}
          loading={metricsLoading}
          noDataMessage={noBackendConnected ? 'Connect backend to view live memory metrics' : undefined}
          lastUpdated={metrics[0]?.lastUpdated}
        />
        <AzureMetricCard
          title="Network Traffic"
          icon={<Wifi className="h-4 w-4" />}
          metric={totalNetIn + totalNetOut > 0 ? { value: totalNetIn + totalNetOut, unit: 'Bytes', trend: 'stable' } : null}
          sparklineData={[]}
          resourceCount={metrics.length}
          loading={metricsLoading}
          noDataMessage={noBackendConnected ? 'Connect backend to view network metrics' : undefined}
          lastUpdated={metrics[0]?.lastUpdated}
        />
        <AzureMetricCard
          title="Active Alerts"
          icon={<Bell className="h-4 w-4" />}
          metric={activeAlerts.length > 0 ? { value: activeAlerts.length, unit: 'Count', trend: 'stable' } : null}
          sparklineData={[]}
          resourceCount={0}
          loading={false}
          noDataMessage={noBackendConnected ? 'Connect backend to view alerts' : 'No active alerts'}
          lastUpdated={undefined}
        />
      </div>

      {metricsError && (
        <ErrorState message={metricsError} compact />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* CPU Line Chart */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">CPU Usage Over Time</h3>
          {metrics.length > 0 && timeSeriesData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 44%, 8%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="cpuUsage" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} name="CPU %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message={noBackendConnected ? 'Connect your Azure backend to see CPU time-series' : 'No time-series data returned from Azure Monitor for the selected time range'} />
          )}
        </div>

        {/* Memory Area Chart */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Memory Usage Over Time</h3>
          {metrics.length > 0 && timeSeriesData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 44%, 8%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '6px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="memoryUsage" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.2} name="Memory %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message={noBackendConnected ? 'Connect your Azure backend to see memory time-series' : 'No time-series data returned from Azure Monitor for the selected time range'} />
          )}
        </div>

        {/* Network Bar Chart */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Network Traffic</h3>
          {metrics.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.map((m) => ({ name: m.resourceName, in: m.metrics.networkIn?.value || 0, out: m.metrics.networkOut?.value || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 44%, 8%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="in" fill="hsl(190, 80%, 50%)" name="Network In" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="out" fill="hsl(330, 70%, 55%)" name="Network Out" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message={noBackendConnected ? 'Connect your Azure backend to see network data' : 'No network metric data available'} />
          )}
        </div>

        {/* Resource Donut */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Resource Distribution</h3>
          {pieData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(222, 44%, 8%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '6px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message={noBackendConnected ? 'Connect your Azure backend to see resource distribution' : 'No resources found'} />
          )}
        </div>
      </div>

      {/* Resource Table */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Azure Resources</h3>
        </div>
        {resourcesLoading ? (
          <LoadingState type="table" rows={5} />
        ) : resources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Region</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Resource Group</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Health</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.resourceId} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-4 py-2 font-medium text-foreground">{r.resourceName}</td>
                    <td className="px-4 py-2 text-muted-foreground">{RESOURCE_TYPE_LABELS[r.resourceType] || r.resourceType}</td>
                    <td className="px-4 py-2 text-muted-foreground font-mono">{r.region}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.resourceGroup}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.status}</td>
                    <td className="px-4 py-2"><ResourceHealthBadge health={r.healthState} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message={noBackendConnected ? 'Connect your Azure backend to view resources' : 'No resources found for the selected scope'} />
        )}
      </div>

      {/* Alerts Summary */}
      {activeAlerts.length > 0 && (
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Active Alerts</h3>
            <span className="text-xs text-destructive font-medium">{activeAlerts.length} active</span>
          </div>
          <div className="divide-y divide-border/50">
            {activeAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`px-4 py-3 flex items-center gap-3 ${alert.severity <= 1 ? 'bg-destructive/5' : ''}`}>
                <SeverityBadge severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{alert.name}</p>
                  <p className="text-xs text-muted-foreground">{alert.affectedResource}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{new Date(alert.firedTime).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

import React from 'react';
import { useAppSelector } from '@/store';
import SeverityBadge from '@/components/alerts/SeverityBadge';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import LoadingState from '@/components/shared/LoadingState';

const AlertsPage: React.FC = () => {
  const { active, historical, loading, error } = useAppSelector((s) => s.azureAlerts);
  const [sevFilter, setSevFilter] = React.useState<number | null>(null);
  const [stateFilter, setStateFilter] = React.useState('');
  const [tab, setTab] = React.useState<'active' | 'history'>('active');

  const alerts = tab === 'active' ? active : historical;
  const filtered = alerts
    .filter((a) => sevFilter === null || a.severity === sevFilter)
    .filter((a) => !stateFilter || a.state === stateFilter);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Alerts</h1>
        <div className="flex gap-1 bg-secondary rounded-md p-0.5">
          <button onClick={() => setTab('active')} className={`px-3 py-1 rounded text-xs transition-colors ${tab === 'active' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground'}`}>
            Active ({active.length})
          </button>
          <button onClick={() => setTab('history')} className={`px-3 py-1 rounded text-xs transition-colors ${tab === 'history' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground'}`}>
            History ({historical.length})
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <select value={sevFilter ?? ''} onChange={(e) => setSevFilter(e.target.value ? Number(e.target.value) : null)}
          className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">All Severities</option>
          {[0, 1, 2, 3, 4].map((s) => <option key={s} value={s}>Sev {s}</option>)}
        </select>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
          className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">All States</option>
          <option value="New">New</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {error && <ErrorState message={error} compact />}

      {loading ? (
        <LoadingState type="table" rows={6} />
      ) : filtered.length > 0 ? (
        <div className="rounded-lg bg-card border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Alert Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Severity</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">State</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Fired</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Affected Resource</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Resource Group</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${alert.severity <= 1 ? 'bg-destructive/5' : ''}`}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{alert.name}</td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={alert.severity} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{alert.state}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono">{new Date(alert.firedTime).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[200px]">{alert.affectedResource}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{alert.resourceGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message={alerts.length === 0 ? 'No alerts returned from Azure Monitor for the selected scope.' : 'No alerts match the current filters.'} />
      )}
    </div>
  );
};

export default AlertsPage;

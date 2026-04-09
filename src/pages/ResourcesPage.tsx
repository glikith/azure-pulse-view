import React from 'react';
import { useAppSelector } from '@/store';
import ResourceHealthBadge from '@/components/resources/ResourceHealthBadge';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import LoadingState from '@/components/shared/LoadingState';

const VM_TYPE = 'Microsoft.Compute/virtualMachines';

const ResourcesPage: React.FC = () => {
  const { resources, loading, error } = useAppSelector((s) => s.azureResources);
  const [healthFilter, setHealthFilter] = React.useState('');
  const [search, setSearch] = React.useState('');

  const vmResources = resources.filter((r) => r.resourceType === VM_TYPE);
  const filtered = vmResources
    .filter((r) => !healthFilter || r.healthState === healthFilter)
    .filter((r) => !search || r.resourceName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Virtual Machines</h1>
        <span className="text-xs text-muted-foreground">{filtered.length} VMs</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          type="text" placeholder="Search VMs..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 rounded-md bg-secondary border border-border text-xs text-foreground px-3 w-48 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
        <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}
          className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">All Health</option>
          <option value="Healthy">Healthy</option>
          <option value="Degraded">Degraded</option>
          <option value="Unavailable">Unavailable</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {error && <ErrorState message={error} compact />}

      {loading ? (
        <LoadingState type="table" rows={8} />
      ) : filtered.length > 0 ? (
        <div className="rounded-lg bg-card border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Region</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Resource Group</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Health</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Last Metric</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.resourceId} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.resourceName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono">{r.region}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.resourceGroup}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.status}</td>
                  <td className="px-4 py-2.5"><ResourceHealthBadge health={r.healthState} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono">{r.lastMetricTime ? new Date(r.lastMetricTime).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No virtual machines found. Connect your Azure backend to view VMs." />
      )}
    </div>
  );
};

export default ResourcesPage;

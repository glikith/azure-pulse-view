import React from 'react';
import TimeRangePicker from '@/components/shared/TimeRangePicker';
import ConnectionStatus from '@/components/shared/ConnectionStatus';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedSubscription, setSelectedResourceGroup, setSelectedRegion } from '@/store/slices/uiSlice';

const TopHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const subscriptions = useAppSelector((s) => s.azureSubscriptions.list);
  const resourceGroups = useAppSelector((s) => s.azureResources.resourceGroups);
  const selectedSub = useAppSelector((s) => s.ui.selectedSubscription);
  const selectedRg = useAppSelector((s) => s.ui.selectedResourceGroup);
  const selectedRegion = useAppSelector((s) => s.ui.selectedRegion);
  const resources = useAppSelector((s) => s.azureResources.resources);
  const vmResources = resources.filter((r) => r.resourceType === 'Microsoft.Compute/virtualMachines');
  const vmResourceGroups = [...new Set(vmResources.map((r) => r.resourceGroup))];

  const regions = [...new Set(vmResources.map((r) => r.region))].sort();

  return (
    <header className="h-12 flex items-center gap-3 px-4 border-b border-border bg-card/50 backdrop-blur shrink-0">
      <select
        value={selectedSub || ''}
        onChange={(e) => dispatch(setSelectedSubscription(e.target.value || null))}
        className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 max-w-[200px] focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">All Subscriptions</option>
        {subscriptions.map((s) => (
          <option key={s.subscriptionId} value={s.subscriptionId}>{s.displayName}</option>
        ))}
      </select>

      <select
        value={selectedRg || ''}
        onChange={(e) => dispatch(setSelectedResourceGroup(e.target.value || null))}
        className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 max-w-[180px] focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">All Resource Groups</option>
        {resourceGroups.map((rg) => (
          <option key={rg.name} value={rg.name}>{rg.name}</option>
        ))}
      </select>

      <TimeRangePicker />

      <select
        value={selectedRegion || ''}
        onChange={(e) => dispatch(setSelectedRegion(e.target.value || null))}
        className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 max-w-[140px] focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">All Regions</option>
        {regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <div className="ml-auto">
        <ConnectionStatus />
      </div>
    </header>
  );
};

export default TopHeader;

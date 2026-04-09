import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchSubscriptions } from '@/store/slices/azureSubscriptionsSlice';
import { fetchResources, fetchResourceGroups } from '@/store/slices/azureResourcesSlice';
import { fetchAlerts } from '@/store/slices/azureAlertsSlice';
import { fetchMetrics } from '@/store/slices/azureMetricsSlice';
import { setSelectedSubscription, setLastRefreshed } from '@/store/slices/uiSlice';

// Resource types that support Azure Monitor metrics
const METRIC_RESOURCE_TYPES = [
  'Microsoft.Compute/virtualMachines',
  'Microsoft.Web/sites',
  'Microsoft.ContainerService/managedClusters',
  'Microsoft.Storage/storageAccounts',
];

const METRIC_NAMES_BY_TYPE: Record<string, string> = {
  'Microsoft.Compute/virtualMachines': 'Percentage CPU,Available Memory Bytes,Network In Total,Network Out Total,Disk Read Operations/Sec,Disk Write Operations/Sec',
  'Microsoft.Web/sites': 'CpuPercentage,MemoryPercentage,HttpResponseTime,Requests,Http5xx',
  'Microsoft.ContainerService/managedClusters': 'node_cpu_usage_percentage,node_memory_rss_percentage,kube_pod_status_ready',
  'Microsoft.Storage/storageAccounts': 'UsedCapacity,Transactions,Ingress,Egress',
};

export function useAzureDataLoader() {
  const dispatch = useAppDispatch();
  const { selectedSubscription, selectedTimeRange, pollingInterval } = useAppSelector((s) => s.ui);
  const { list: subscriptions } = useAppSelector((s) => s.azureSubscriptions);
  const { resources } = useAppSelector((s) => s.azureResources);
  const initialLoadDone = useRef(false);
  const resourcesRef = useRef(resources);

  // Keep ref in sync without triggering effects
  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  // 1. Fetch subscriptions on mount
  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  // 2. Auto-select first subscription
  useEffect(() => {
    if (subscriptions.length > 0 && !selectedSubscription) {
      dispatch(setSelectedSubscription(subscriptions[0].subscriptionId));
    }
  }, [subscriptions, selectedSubscription, dispatch]);

  // 3. Fetch resources, resource groups, and alerts when subscription selected
  useEffect(() => {
    if (!selectedSubscription) return;
    dispatch(fetchResources({ subscriptionId: selectedSubscription }));
    dispatch(fetchResourceGroups({ subscriptionId: selectedSubscription }));
    dispatch(fetchAlerts({ subscriptionId: selectedSubscription, timeRange: selectedTimeRange }));
    dispatch(setLastRefreshed(new Date().toISOString()));
  }, [selectedSubscription, selectedTimeRange, dispatch]);

  // 4. Fetch metrics for metric-capable resources (only on initial resource load)
  useEffect(() => {
    if (resources.length === 0) return;
    const metricResources = resources.filter((r) =>
      METRIC_RESOURCE_TYPES.includes(r.resourceType)
    );
    metricResources.forEach((r) => {
      const metricNames = METRIC_NAMES_BY_TYPE[r.resourceType] || '';
      if (metricNames) {
        dispatch(fetchMetrics({
          resourceId: r.resourceId,
          metricNames,
          timeRange: selectedTimeRange,
        }));
      }
    });
    initialLoadDone.current = true;
  }, [resources, selectedTimeRange, dispatch]);

  // 5. Polling interval for refresh — uses ref to avoid cascading re-renders
  useEffect(() => {
    if (!selectedSubscription || !initialLoadDone.current) return;
    const interval = setInterval(() => {
      dispatch(fetchAlerts({ subscriptionId: selectedSubscription, timeRange: selectedTimeRange }));
      const metricResources = resourcesRef.current.filter((r) =>
        METRIC_RESOURCE_TYPES.includes(r.resourceType)
      );
      metricResources.forEach((r) => {
        const metricNames = METRIC_NAMES_BY_TYPE[r.resourceType] || '';
        if (metricNames) {
          dispatch(fetchMetrics({ resourceId: r.resourceId, metricNames, timeRange: selectedTimeRange }));
        }
      });
      dispatch(setLastRefreshed(new Date().toISOString()));
    }, pollingInterval);
    return () => clearInterval(interval);
  }, [selectedSubscription, selectedTimeRange, pollingInterval, dispatch]);
}

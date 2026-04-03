export const TIME_RANGES = [
  { label: 'Last 15 min', value: 'PT15M' },
  { label: 'Last 1 hour', value: 'PT1H' },
  { label: 'Last 6 hours', value: 'PT6H' },
  { label: 'Last 24 hours', value: 'P1D' },
  { label: 'Last 7 days', value: 'P7D' },
  { label: 'Last 30 days', value: 'P30D' },
] as const;

export const RESOURCE_TYPES = {
  VM: 'Microsoft.Compute/virtualMachines',
  APP_SERVICE: 'Microsoft.Web/sites',
  STORAGE: 'Microsoft.Storage/storageAccounts',
  AKS: 'Microsoft.ContainerService/managedClusters',
} as const;

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  'Microsoft.Compute/virtualMachines': 'Virtual Machines',
  'Microsoft.Web/sites': 'App Services',
  'Microsoft.Storage/storageAccounts': 'Storage Accounts',
  'Microsoft.ContainerService/managedClusters': 'AKS Clusters',
};

export const AZURE_REGIONS = [
  'eastus', 'eastus2', 'westus', 'westus2', 'westus3',
  'centralus', 'northcentralus', 'southcentralus',
  'northeurope', 'westeurope', 'uksouth', 'ukwest',
  'eastasia', 'southeastasia', 'japaneast', 'japanwest',
  'australiaeast', 'australiasoutheast',
  'canadacentral', 'canadaeast',
  'brazilsouth', 'koreacentral', 'koreasouth',
  'francecentral', 'germanywestcentral', 'norwayeast',
  'switzerlandnorth', 'uaenorth', 'southafricanorth',
] as const;

export const SEVERITY_LABELS: Record<number, string> = {
  0: 'Critical',
  1: 'Error',
  2: 'Warning',
  3: 'Informational',
  4: 'Verbose',
};

export const SEVERITY_COLORS: Record<number, string> = {
  0: 'destructive',
  1: 'destructive',
  2: 'warning',
  3: 'primary',
  4: 'muted',
};

export const DEFAULT_POLLING_INTERVAL = 5000;
export const MIN_POLLING_INTERVAL = 5000;
export const MAX_POLLING_INTERVAL = 60000;
export const BACKGROUND_POLLING_INTERVAL = 30000;
export const DEFAULT_API_BASE_URL = '/api/azure';
export const DEFAULT_WS_URL = 'ws://localhost:3001/ws/azure/metrics-stream';

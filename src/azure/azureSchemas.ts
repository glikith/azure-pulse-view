import { z } from 'zod';

export const MetricValueSchema = z.object({
  value: z.number().nullable(),
  unit: z.string(),
  trend: z.enum(['rising', 'falling', 'stable']),
});

export const TimeSeriesPointSchema = z.object({
  timestamp: z.string(),
}).passthrough();

export const AzureResourceMetricSchema = z.object({
  resourceId: z.string().min(1),
  resourceName: z.string().optional().default(''),
  resourceType: z.string().optional().default(''),
  subscriptionId: z.string().optional().default(''),
  resourceGroup: z.string().optional().default(''),
  region: z.string().optional().default(''),
  metrics: z.object({
    cpuUsage: MetricValueSchema.optional(),
    memoryUsage: MetricValueSchema.optional(),
    networkIn: MetricValueSchema.optional(),
    networkOut: MetricValueSchema.optional(),
    diskReadOps: MetricValueSchema.optional(),
    diskWriteOps: MetricValueSchema.optional(),
  }).passthrough(),
  timeSeries: z.array(TimeSeriesPointSchema),
  status: z.string().optional().default('Unknown'),
  healthState: z.enum(['Healthy', 'Degraded', 'Unavailable', 'Unknown']).default('Unknown'),
  lastUpdated: z.string().optional().default(''),
  dataAvailable: z.boolean().default(true),
});

export const AzureSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  displayName: z.string(),
  state: z.string(),
  tenantId: z.string().optional().default(''),
});

export const AzureResourceSchema = z.object({
  resourceId: z.string(),
  resourceName: z.string(),
  resourceType: z.string(),
  resourceGroup: z.string(),
  subscriptionId: z.string(),
  region: z.string(),
  status: z.string().optional().default('Unknown'),
  healthState: z.enum(['Healthy', 'Degraded', 'Unavailable', 'Unknown']).default('Unknown'),
  lastMetricTime: z.string().optional(),
  tags: z.record(z.string()).optional(),
});

// Alerts come back with string severity (Sev0–Sev4) and numeric-equivalent state
export const AzureAlertSchema = z.object({
  alertId: z.string().optional(),
  id: z.string().optional(),
  alertName: z.string().optional(),
  name: z.string().optional(),
  severity: z.union([z.number(), z.string()]).transform((v) => {
    if (typeof v === 'number') return v;
    const map: Record<string, number> = { Sev0: 0, Sev1: 1, Sev2: 2, Sev3: 3, Sev4: 4 };
    return map[v] ?? 3;
  }),
  alertState: z.string().optional(),
  state: z.string().optional(),
  firedTime: z.string().nullable().optional(),
  targetResource: z.string().nullable().optional(),
  affectedResource: z.string().optional(),
  targetResourceGroup: z.string().nullable().optional(),
  resourceGroup: z.string().optional(),
  description: z.string().nullable().optional(),
  linkedKqlQuery: z.string().optional(),
}).transform((a) => ({
  id: a.alertId || a.id || '',
  name: a.alertName || a.name || '',
  severity: a.severity as number,
  state: (a.alertState || a.state || 'New') as 'New' | 'Acknowledged' | 'Closed',
  firedTime: a.firedTime || new Date().toISOString(),
  affectedResource: a.targetResource || a.affectedResource || '',
  resourceGroup: a.targetResourceGroup || a.resourceGroup || '',
  description: a.description || undefined,
  linkedKqlQuery: a.linkedKqlQuery,
}));

// Logs: Edge Function returns array-of-objects rows, not array-of-arrays
export const AzureLogResultSchema = z.object({
  columns: z.array(z.object({ name: z.string(), type: z.string() })),
  rows: z.union([
    z.array(z.array(z.unknown())),   // array-of-arrays (original shape)
    z.array(z.record(z.unknown())),  // array-of-objects (Edge Function shape)
  ]).transform((rows) => {
    if (rows.length === 0) return [];
    // If already array-of-arrays, keep as-is
    if (Array.isArray(rows[0])) return rows as unknown[][];
    // Convert array-of-objects to array-of-arrays (values only)
    return (rows as Record<string, unknown>[]).map((row) => Object.values(row));
  }),
  rowCount: z.number().optional(),
  executedAt: z.string().optional(),
  workspaceId: z.string().optional(),
  query: z.string().optional(),
  timeRange: z.string().optional(),
});

export const AzureResourceGroupSchema = z.object({
  name: z.string(),
  location: z.string(),
  subscriptionId: z.string().optional().default(''),
  provisioningState: z.string().optional(),
});

export type MetricValue = z.infer<typeof MetricValueSchema>;
export type AzureResourceMetric = z.infer<typeof AzureResourceMetricSchema>;
export type AzureSubscription = z.infer<typeof AzureSubscriptionSchema>;
export type AzureResource = z.infer<typeof AzureResourceSchema>;
export type AzureAlert = ReturnType<typeof AzureAlertSchema['parse']>;
export type AzureLogResult = z.infer<typeof AzureLogResultSchema>;
export type AzureResourceGroup = z.infer<typeof AzureResourceGroupSchema>;

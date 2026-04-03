import { z } from 'zod';

export const MetricValueSchema = z.object({
  value: z.number(),
  unit: z.string(),
  trend: z.enum(['rising', 'falling', 'stable']),
});

export const TimeSeriesPointSchema = z.object({
  timestamp: z.string(),
}).passthrough();

export const AzureResourceMetricSchema = z.object({
  resourceId: z.string().min(1),
  resourceName: z.string(),
  resourceType: z.string(),
  subscriptionId: z.string(),
  resourceGroup: z.string(),
  region: z.string(),
  metrics: z.object({
    cpuUsage: MetricValueSchema.optional(),
    memoryUsage: MetricValueSchema.optional(),
    networkIn: MetricValueSchema.optional(),
    networkOut: MetricValueSchema.optional(),
    diskReadOps: MetricValueSchema.optional(),
    diskWriteOps: MetricValueSchema.optional(),
  }),
  timeSeries: z.array(TimeSeriesPointSchema),
  status: z.string(),
  healthState: z.enum(['Healthy', 'Degraded', 'Unavailable', 'Unknown']),
  lastUpdated: z.string(),
  dataAvailable: z.boolean().default(true),
});

export const AzureSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  displayName: z.string(),
  state: z.string(),
});

export const AzureResourceSchema = z.object({
  resourceId: z.string(),
  resourceName: z.string(),
  resourceType: z.string(),
  resourceGroup: z.string(),
  subscriptionId: z.string(),
  region: z.string(),
  status: z.string(),
  healthState: z.enum(['Healthy', 'Degraded', 'Unavailable', 'Unknown']),
  lastMetricTime: z.string().optional(),
});

export const AzureAlertSchema = z.object({
  id: z.string(),
  name: z.string(),
  severity: z.number().min(0).max(4),
  state: z.enum(['New', 'Acknowledged', 'Closed']),
  firedTime: z.string(),
  affectedResource: z.string(),
  resourceGroup: z.string(),
  description: z.string().optional(),
  linkedKqlQuery: z.string().optional(),
});

export const AzureLogResultSchema = z.object({
  columns: z.array(z.object({ name: z.string(), type: z.string() })),
  rows: z.array(z.array(z.unknown())),
});

export const AzureResourceGroupSchema = z.object({
  name: z.string(),
  location: z.string(),
  subscriptionId: z.string(),
});

export type MetricValue = z.infer<typeof MetricValueSchema>;
export type AzureResourceMetric = z.infer<typeof AzureResourceMetricSchema>;
export type AzureSubscription = z.infer<typeof AzureSubscriptionSchema>;
export type AzureResource = z.infer<typeof AzureResourceSchema>;
export type AzureAlert = z.infer<typeof AzureAlertSchema>;
export type AzureLogResult = z.infer<typeof AzureLogResultSchema>;
export type AzureResourceGroup = z.infer<typeof AzureResourceGroupSchema>;

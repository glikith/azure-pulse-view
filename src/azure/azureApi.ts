import { supabase } from '@/integrations/supabase/client';

let apiBaseUrl = '/api/azure'; // kept for Settings page compatibility only
export const setApiBaseUrl = (url: string) => { apiBaseUrl = url; };
export const getApiBaseUrl = () => apiBaseUrl;

// Core Edge Function invoker — all API calls go through here
async function invoke<T>(fnName: string, body: Record<string, unknown> = {}): Promise<{ data: T }> {
  const { data, error } = await supabase.functions.invoke(fnName, { body });

  if (error) {
    const status = (error as any)?.context?.status;
    let message = error.message || `Edge Function "${fnName}" failed.`;

    if (status === 401) message = 'Azure authentication failed. Your session may have expired.';
    else if (status === 403) message = 'You do not have permission to access this resource. Contact your Azure admin.';
    else if (status === 404) message = 'Resource not found in Azure. It may have been deleted or moved.';
    else if (status === 429) message = `Azure Monitor rate limit reached. ${message}`;
    else if (!status) message = 'Could not reach the backend. Check your network connection.';

    const enriched = { message, status, isNetworkError: !status };
    return Promise.reject(enriched);
  }

  if (data?.error) {
    return Promise.reject({ message: data.userMessage || data.message || 'Azure API error', isNetworkError: false });
  }

  return { data: data as T };
}

export interface QueryParams {
  subscriptionId?: string;
  resourceGroupName?: string;
  resourceId?: string;
  timeRange?: string;
  metricNames?: string;
  query?: string;
  workspaceId?: string;
}

export const azureApi = {
  getSubscriptions: () =>
    invoke('azure-subscriptions', {}),

  getResources: (params: QueryParams) =>
    invoke('azure-resources', params as Record<string, unknown>),

  getResourceGroups: (params: QueryParams) =>
    invoke('azure-resource-groups', params as Record<string, unknown>),

  getMetrics: (params: QueryParams) =>
    invoke('azure-metrics', {
      ...params as Record<string, unknown>,
      metricNames: params.metricNames ? params.metricNames.split(',').map((s) => s.trim()) : [],
    }),

  getLogs: (params: QueryParams) =>
    invoke('azure-logs', params as Record<string, unknown>),

  getAlerts: (params: QueryParams) =>
    invoke('azure-alerts', params as Record<string, unknown>),

  getHealth: (params: QueryParams) =>
    invoke('azure-health', params as Record<string, unknown>),
};

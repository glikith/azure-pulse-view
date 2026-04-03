import axios, { AxiosError } from 'axios';
import { DEFAULT_API_BASE_URL } from './azureConstants';

let apiBaseUrl = DEFAULT_API_BASE_URL;

export const setApiBaseUrl = (url: string) => { apiBaseUrl = url; };
export const getApiBaseUrl = () => apiBaseUrl;

const client = axios.create({ timeout: 30000 });

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message = (data?.message as string) || error.message;

    const enriched: Record<string, unknown> = {
      status,
      message,
      isNetworkError: !error.response,
    };

    if (status === 401) enriched.message = 'Azure authentication failed. Your session may have expired.';
    else if (status === 403) enriched.message = `You do not have permission to access this resource. Contact your Azure admin.`;
    else if (status === 404) enriched.message = 'Resource not found in Azure. It may have been deleted or moved.';
    else if (status === 429) enriched.message = `Azure Monitor rate limit reached. ${message}`;
    else if (!error.response) enriched.message = 'Could not reach the backend server. Check your VPN or network connection.';

    return Promise.reject(enriched);
  }
);

interface QueryParams {
  subscriptionId?: string;
  resourceGroupName?: string;
  resourceId?: string;
  timeRange?: string;
  metricNames?: string;
  query?: string;
  workspaceId?: string;
}

const buildParams = (params: QueryParams) => {
  const p: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => { if (v) p[k] = v; });
  return p;
};

export const azureApi = {
  getSubscriptions: () =>
    client.get(`${apiBaseUrl}/subscriptions`),

  getResources: (params: QueryParams) =>
    client.get(`${apiBaseUrl}/resources`, { params: buildParams(params) }),

  getResourceGroups: (params: QueryParams) =>
    client.get(`${apiBaseUrl}/resource-groups`, { params: buildParams(params) }),

  getMetrics: (params: QueryParams) =>
    client.get(`${apiBaseUrl}/metrics`, { params: buildParams(params) }),

  getLogs: (params: QueryParams) =>
    client.get(`${apiBaseUrl}/logs`, { params: buildParams(params) }),

  getAlerts: (params: QueryParams) =>
    client.get(`${apiBaseUrl}/alerts`, { params: buildParams(params) }),

  getHealth: (params: QueryParams) =>
    client.get(`${apiBaseUrl}/health`, { params: buildParams(params) }),
};

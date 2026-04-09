import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { azureApi } from '@/azure/azureApi';
import { AzureResourceMetricSchema, AzureResourceMetric } from '@/azure/azureSchemas';
import { parseError } from '@/utils/errorParser';
import { z } from 'zod';

interface MetricsState {
  data: Record<string, AzureResourceMetric>;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: MetricsState = { data: {}, loading: false, error: null, lastFetched: null };

export const fetchMetrics = createAsyncThunk(
  'azureMetrics/fetch',
  async (params: { subscriptionId?: string; resourceGroupName?: string; resourceId?: string; timeRange?: string; metricNames?: string }, { rejectWithValue }) => {
    try {
      const response = await azureApi.getMetrics(params);
      const raw = response.data as any;
      // Edge function returns a single resource metric object
      if (raw?.resourceId) {
        const parsed = AzureResourceMetricSchema.safeParse(raw);
        if (parsed.success) return [parsed.data];
        console.warn('Metric parse warning:', parsed.error.message, raw);
        // Return a minimal valid object so dashboard doesn't break
        return [{
          resourceId: raw.resourceId,
          metrics: raw.metrics || {},
          timeSeries: raw.timeSeries || [],
          dataAvailable: raw.dataAvailable ?? false,
          lastUpdated: raw.lastUpdated || new Date().toISOString(),
        } as any];
      }
      // Batch results
      const arr = raw?.results ?? (Array.isArray(raw) ? raw : [raw]);
      const results: any[] = [];
      for (const item of arr) {
        const parsed = AzureResourceMetricSchema.safeParse(item);
        if (parsed.success) results.push(parsed.data);
        else console.warn('Metric parse warning:', parsed.error.message);
      }
      return results;
    } catch (error) {
      return rejectWithValue(parseError(error).message);
    }
  }
);

const azureMetricsSlice = createSlice({
  name: 'azureMetrics',
  initialState,
  reducers: {
    updateMetricFromStream: (state, action: PayloadAction<AzureResourceMetric>) => {
      state.data[action.payload.resourceId] = action.payload;
      state.lastFetched = new Date().toISOString();
    },
    clearMetrics: (state) => { state.data = {}; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = new Date().toISOString();
        action.payload.forEach((m) => { state.data[m.resourceId] = m; });
      })
      .addCase(fetchMetrics.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { updateMetricFromStream, clearMetrics } = azureMetricsSlice.actions;
export default azureMetricsSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { azureApi } from '@/azure/azureApi';
import { AzureAlertSchema, AzureAlert } from '@/azure/azureSchemas';
import { parseError } from '@/utils/errorParser';
import { z } from 'zod';

interface AlertsState {
  active: AzureAlert[];
  historical: AzureAlert[];
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = { active: [], historical: [], loading: false, error: null };

export const fetchAlerts = createAsyncThunk(
  'azureAlerts/fetch',
  async (params: { subscriptionId?: string; timeRange?: string }, { rejectWithValue }) => {
    try {
      const response = await azureApi.getAlerts(params);
      return z.array(AzureAlertSchema).parse(response.data);
    } catch (error) {
      return rejectWithValue(parseError(error).message);
    }
  }
);

const azureAlertsSlice = createSlice({
  name: 'azureAlerts',
  initialState,
  reducers: {
    clearAlerts: (state) => { state.active = []; state.historical = []; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload.filter((a) => a.state !== 'Closed');
        state.historical = action.payload.filter((a) => a.state === 'Closed');
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAlerts } = azureAlertsSlice.actions;
export default azureAlertsSlice.reducer;

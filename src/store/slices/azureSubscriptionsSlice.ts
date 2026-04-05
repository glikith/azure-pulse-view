import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { azureApi } from '@/azure/azureApi';
import { AzureSubscriptionSchema, AzureSubscription } from '@/azure/azureSchemas';
import { parseError } from '@/utils/errorParser';
import { z } from 'zod';

interface SubscriptionsState {
  list: AzureSubscription[];
  selected: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = { list: [], selected: null, loading: false, error: null };

export const fetchSubscriptions = createAsyncThunk(
  'azureSubscriptions/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await azureApi.getSubscriptions();
      const raw = (response.data as any)?.subscriptions ?? response.data;
      return z.array(AzureSubscriptionSchema).parse(raw);
    } catch (error) {
      return rejectWithValue(parseError(error).message);
    }
  }
);

const azureSubscriptionsSlice = createSlice({
  name: 'azureSubscriptions',
  initialState,
  reducers: {
    setSelectedSubscription: (state, action) => { state.selected = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchSubscriptions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { setSelectedSubscription } = azureSubscriptionsSlice.actions;
export default azureSubscriptionsSlice.reducer;

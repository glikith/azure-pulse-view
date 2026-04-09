import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { azureApi } from '@/azure/azureApi';
import { AzureResourceSchema, AzureResourceGroupSchema, AzureResource, AzureResourceGroup } from '@/azure/azureSchemas';
import { parseError } from '@/utils/errorParser';
import { z } from 'zod';

interface ResourcesState {
  resources: AzureResource[];
  resourceGroups: AzureResourceGroup[];
  selectedResource: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ResourcesState = { resources: [], resourceGroups: [], selectedResource: null, loading: false, error: null };

export const fetchResources = createAsyncThunk(
  'azureResources/fetch',
  async (params: { subscriptionId?: string; resourceGroupName?: string }, { rejectWithValue }) => {
    try {
      const response = await azureApi.getResources(params);
      const raw = (response.data as any)?.resources ?? response.data;
      return z.array(AzureResourceSchema).parse(raw);
    } catch (error) {
      return rejectWithValue(parseError(error).message);
    }
  }
);

export const fetchResourceGroups = createAsyncThunk(
  'azureResources/fetchGroups',
  async (params: { subscriptionId?: string }, { rejectWithValue }) => {
    try {
      const response = await azureApi.getResourceGroups(params);
      const raw = (response.data as any)?.resourceGroups ?? response.data;
      return z.array(AzureResourceGroupSchema).parse(raw);
    } catch (error) {
      return rejectWithValue(parseError(error).message);
    }
  }
);

const azureResourcesSlice = createSlice({
  name: 'azureResources',
  initialState,
  reducers: {
    setSelectedResource: (state, action) => { state.selectedResource = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => { if (state.resources.length === 0) state.loading = true; state.error = null; })
      .addCase(fetchResources.fulfilled, (state, action) => { state.loading = false; state.resources = action.payload; })
      .addCase(fetchResources.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchResourceGroups.fulfilled, (state, action) => { state.resourceGroups = action.payload; });
  },
});

export const { setSelectedResource } = azureResourcesSlice.actions;
export default azureResourcesSlice.reducer;

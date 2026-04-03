import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { azureApi } from '@/azure/azureApi';
import { AzureLogResultSchema, AzureLogResult } from '@/azure/azureSchemas';
import { parseError } from '@/utils/errorParser';

interface LogsState {
  results: AzureLogResult | null;
  query: string;
  loading: boolean;
  error: string | null;
}

const initialState: LogsState = { results: null, query: '', loading: false, error: null };

export const executeKqlQuery = createAsyncThunk(
  'azureLogs/execute',
  async (params: { query: string; workspaceId?: string; timeRange?: string }, { rejectWithValue }) => {
    try {
      const response = await azureApi.getLogs(params);
      return AzureLogResultSchema.parse(response.data);
    } catch (error) {
      return rejectWithValue(parseError(error).message);
    }
  }
);

const azureLogsSlice = createSlice({
  name: 'azureLogs',
  initialState,
  reducers: {
    setQuery: (state, action) => { state.query = action.payload; },
    clearLogs: (state) => { state.results = null; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeKqlQuery.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(executeKqlQuery.fulfilled, (state, action) => { state.loading = false; state.results = action.payload; })
      .addCase(executeKqlQuery.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { setQuery, clearLogs } = azureLogsSlice.actions;
export default azureLogsSlice.reducer;

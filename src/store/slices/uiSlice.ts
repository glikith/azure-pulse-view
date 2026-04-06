import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  selectedSubscription: string | null;
  selectedResourceGroup: string | null;
  selectedTimeRange: string;
  selectedRegion: string | null;
  sidebarOpen: boolean;
  darkMode: boolean;
  pollingInterval: number;
  wsUrl: string;
  apiBaseUrl: string;
  alertSeverityThreshold: number;
  kqlWorkspaceId: string;
  wsConnectionState: 'connected' | 'reconnecting' | 'disconnected';
  lastRefreshed: string | null;
}

const initialState: UiState = {
  selectedSubscription: null,
  selectedResourceGroup: null,
  selectedTimeRange: 'PT1H',
  selectedRegion: null,
  sidebarOpen: true,
  darkMode: true,
  pollingInterval: 5000,
  wsUrl: 'ws://localhost:3001/ws/azure/metrics-stream',
  apiBaseUrl: '/api/azure',
  alertSeverityThreshold: 4,
  kqlWorkspaceId: '',
  wsConnectionState: 'disconnected',
  lastRefreshed: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedSubscription: (state, action: PayloadAction<string | null>) => {
      state.selectedSubscription = action.payload;
      state.selectedResourceGroup = null;
    },
    setSelectedResourceGroup: (state, action: PayloadAction<string | null>) => {
      state.selectedResourceGroup = action.payload;
    },
    setSelectedTimeRange: (state, action: PayloadAction<string>) => {
      state.selectedTimeRange = action.payload;
    },
    setSelectedRegion: (state, action: PayloadAction<string | null>) => {
      state.selectedRegion = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setPollingInterval: (state, action: PayloadAction<number>) => {
      state.pollingInterval = action.payload;
    },
    setWsUrl: (state, action: PayloadAction<string>) => {
      state.wsUrl = action.payload;
    },
    setApiBaseUrl: (state, action: PayloadAction<string>) => {
      state.apiBaseUrl = action.payload;
    },
    setAlertSeverityThreshold: (state, action: PayloadAction<number>) => {
      state.alertSeverityThreshold = action.payload;
    },
    setKqlWorkspaceId: (state, action: PayloadAction<string>) => {
      state.kqlWorkspaceId = action.payload;
    },
    setWsConnectionState: (state, action: PayloadAction<'connected' | 'reconnecting' | 'disconnected'>) => {
      state.wsConnectionState = action.payload;
    },
    setLastRefreshed: (state, action: PayloadAction<string>) => {
      state.lastRefreshed = action.payload;
    },
  },
});

export const {
  setSelectedSubscription, setSelectedResourceGroup, setSelectedTimeRange,
  setSelectedRegion, toggleSidebar, setPollingInterval, setWsUrl, setApiBaseUrl,
  setAlertSeverityThreshold, setKqlWorkspaceId, setWsConnectionState, setLastRefreshed,
} = uiSlice.actions;
export default uiSlice.reducer;

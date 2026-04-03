import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import uiReducer from './slices/uiSlice';
import azureMetricsReducer from './slices/azureMetricsSlice';
import azureAlertsReducer from './slices/azureAlertsSlice';
import azureResourcesReducer from './slices/azureResourcesSlice';
import azureSubscriptionsReducer from './slices/azureSubscriptionsSlice';
import azureLogsReducer from './slices/azureLogsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    azureMetrics: azureMetricsReducer,
    azureAlerts: azureAlertsReducer,
    azureResources: azureResourcesReducer,
    azureSubscriptions: azureSubscriptionsReducer,
    azureLogs: azureLogsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

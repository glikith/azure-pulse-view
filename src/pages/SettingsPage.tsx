import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  setPollingInterval, setWsUrl, setApiBaseUrl,
  setAlertSeverityThreshold, setKqlWorkspaceId,
} from '@/store/slices/uiSlice';
import { MIN_POLLING_INTERVAL, MAX_POLLING_INTERVAL } from '@/azure/azureConstants';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((s) => s.ui);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-lg font-semibold text-foreground">Settings</h1>

      <div className="space-y-5">
        {/* Polling Interval */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-2">
          <label className="text-sm font-medium text-foreground">Polling Interval</label>
          <p className="text-xs text-muted-foreground">How often to fetch fresh data from Azure Monitor ({ui.pollingInterval / 1000}s)</p>
          <input
            type="range"
            min={MIN_POLLING_INTERVAL} max={MAX_POLLING_INTERVAL} step={1000}
            value={ui.pollingInterval}
            onChange={(e) => dispatch(setPollingInterval(Number(e.target.value)))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5s</span><span>60s</span>
          </div>
        </div>

        {/* API Base URL */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-2">
          <label className="text-sm font-medium text-foreground">API Base URL</label>
          <p className="text-xs text-muted-foreground">Backend endpoint for Azure API proxy</p>
          <input
            type="text" value={ui.apiBaseUrl}
            onChange={(e) => dispatch(setApiBaseUrl(e.target.value))}
            className="w-full h-8 rounded-md bg-secondary border border-border text-xs text-foreground px-3 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* WebSocket URL */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-2">
          <label className="text-sm font-medium text-foreground">WebSocket URL</label>
          <p className="text-xs text-muted-foreground">Real-time metrics stream endpoint</p>
          <input
            type="text" value={ui.wsUrl}
            onChange={(e) => dispatch(setWsUrl(e.target.value))}
            className="w-full h-8 rounded-md bg-secondary border border-border text-xs text-foreground px-3 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Alert Severity Threshold */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-2">
          <label className="text-sm font-medium text-foreground">Alert Severity Threshold</label>
          <p className="text-xs text-muted-foreground">Minimum severity to display (0 = Critical only, 4 = All)</p>
          <select value={ui.alertSeverityThreshold} onChange={(e) => dispatch(setAlertSeverityThreshold(Number(e.target.value)))}
            className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring">
            {[0, 1, 2, 3, 4].map((s) => <option key={s} value={s}>Sev {s}+</option>)}
          </select>
        </div>

        {/* KQL Workspace ID */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-2">
          <label className="text-sm font-medium text-foreground">Log Analytics Workspace ID</label>
          <p className="text-xs text-muted-foreground">Default workspace for KQL queries</p>
          <input
            type="text" value={ui.kqlWorkspaceId}
            onChange={(e) => dispatch(setKqlWorkspaceId(e.target.value))}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full h-8 rounded-md bg-secondary border border-border text-xs text-foreground px-3 font-mono focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

import React from 'react';
import { useAppSelector } from '@/store';
import { formatFullTimestamp } from '@/utils/formatMetric';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const wsState = useAppSelector((s) => s.ui.wsConnectionState);
  const lastRefreshed = useAppSelector((s) => s.ui.lastRefreshed);

  const stateConfig = {
    connected: { icon: Wifi, color: 'text-success', label: 'Connected' },
    reconnecting: { icon: Loader2, color: 'text-warning', label: 'Reconnecting' },
    disconnected: { icon: WifiOff, color: 'text-muted-foreground', label: 'Disconnected' },
  };

  const config = stateConfig[wsState];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${wsState === 'connected' ? 'bg-success' : wsState === 'reconnecting' ? 'bg-warning animate-pulse' : 'bg-muted-foreground'}`} />
        <Icon className={`h-3.5 w-3.5 ${config.color} ${wsState === 'reconnecting' ? 'animate-spin' : ''}`} />
        <span className={`${config.color} hidden sm:inline`}>{config.label}</span>
      </div>
      {lastRefreshed && (
        <span className="text-muted-foreground hidden md:inline">
          Last: {formatFullTimestamp(lastRefreshed)}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;

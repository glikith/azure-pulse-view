import React from 'react';

interface ResourceHealthBadgeProps {
  health: 'Healthy' | 'Degraded' | 'Unavailable' | 'Unknown';
}

const ResourceHealthBadge: React.FC<ResourceHealthBadgeProps> = React.memo(({ health }) => {
  const config: Record<string, string> = {
    Healthy: 'bg-success/15 text-success border-success/30',
    Degraded: 'bg-warning/15 text-warning border-warning/30',
    Unavailable: 'bg-destructive/15 text-destructive border-destructive/30',
    Unknown: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${config[health]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${health === 'Healthy' ? 'bg-success' : health === 'Degraded' ? 'bg-warning' : health === 'Unavailable' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
      {health}
    </span>
  );
});

ResourceHealthBadge.displayName = 'ResourceHealthBadge';
export default ResourceHealthBadge;

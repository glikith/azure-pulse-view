import React from 'react';
import { SEVERITY_LABELS } from '@/azure/azureConstants';

interface SeverityBadgeProps {
  severity: number;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = React.memo(({ severity }) => {
  const colors: Record<number, string> = {
    0: 'bg-destructive/20 text-destructive border-destructive/40',
    1: 'bg-destructive/15 text-destructive border-destructive/30',
    2: 'bg-warning/15 text-warning border-warning/30',
    3: 'bg-primary/15 text-primary border-primary/30',
    4: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[severity] || colors[4]}`}>
      Sev {severity} · {SEVERITY_LABELS[severity] || 'Unknown'}
    </span>
  );
});

SeverityBadge.displayName = 'SeverityBadge';
export default SeverityBadge;

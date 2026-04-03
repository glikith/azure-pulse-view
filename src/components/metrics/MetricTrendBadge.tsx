import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricTrendBadgeProps {
  trend: 'rising' | 'falling' | 'stable';
  delta?: string;
}

const MetricTrendBadge: React.FC<MetricTrendBadgeProps> = React.memo(({ trend, delta }) => {
  const config = {
    rising: { icon: TrendingUp, className: 'text-destructive' },
    falling: { icon: TrendingDown, className: 'text-success' },
    stable: { icon: Minus, className: 'text-muted-foreground' },
  };
  const { icon: Icon, className } = config[trend];

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono ${className}`}>
      <Icon className="h-3 w-3" />
      {delta && <span>{delta}</span>}
    </span>
  );
});

MetricTrendBadge.displayName = 'MetricTrendBadge';
export default MetricTrendBadge;

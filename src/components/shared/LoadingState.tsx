import React from 'react';

interface LoadingStateProps {
  rows?: number;
  type?: 'card' | 'table' | 'chart';
}

const LoadingState: React.FC<LoadingStateProps> = ({ rows = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="p-4 rounded-lg bg-card border border-border">
        <div className="h-4 w-24 rounded animate-shimmer mb-3" />
        <div className="h-8 w-20 rounded animate-shimmer mb-2" />
        <div className="h-3 w-32 rounded animate-shimmer" />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="p-4 rounded-lg bg-card border border-border h-64 flex items-end gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 animate-shimmer rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <div className="h-10 border-b border-border animate-shimmer" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 border-b border-border/50 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
};

export default LoadingState;

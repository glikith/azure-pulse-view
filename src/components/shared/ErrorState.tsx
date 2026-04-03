import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = React.memo(({ message, onRetry, compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive p-2 rounded-md bg-destructive/10 border border-destructive/20">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span className="truncate">{message}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="ml-auto shrink-0 h-6 px-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-destructive/5 border border-destructive/20">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-destructive text-center max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      )}
    </div>
  );
});

ErrorState.displayName = 'ErrorState';
export default ErrorState;

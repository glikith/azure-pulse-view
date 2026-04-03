import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  resourceId?: string;
}

const EmptyState: React.FC<EmptyStateProps> = React.memo(({ message, resourceId }) => (
  <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
    <Inbox className="h-10 w-10" />
    <p className="text-sm text-center">{message}</p>
    {resourceId && <p className="text-xs font-mono opacity-60">{resourceId}</p>}
  </div>
));

EmptyState.displayName = 'EmptyState';
export default EmptyState;

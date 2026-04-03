import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setQuery, clearLogs } from '@/store/slices/azureLogsSlice';
import { executeKqlQuery } from '@/store/slices/azureLogsSlice';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import LoadingState from '@/components/shared/LoadingState';
import { Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { results, query, loading, error } = useAppSelector((s) => s.azureLogs);
  const timeRange = useAppSelector((s) => s.ui.selectedTimeRange);
  const workspaceId = useAppSelector((s) => s.ui.kqlWorkspaceId);

  const handleExecute = () => {
    if (!query.trim()) return;
    dispatch(executeKqlQuery({ query, workspaceId, timeRange }));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Log Analytics</h1>
      </div>

      {/* KQL Query Input */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">KQL Query</span>
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => dispatch(clearLogs())} className="h-7 px-2 text-xs">
              <Trash2 className="h-3 w-3 mr-1" /> Clear
            </Button>
            <Button size="sm" onClick={handleExecute} disabled={loading || !query.trim()} className="h-7 px-3 text-xs">
              <Play className="h-3 w-3 mr-1" /> Execute
            </Button>
          </div>
        </div>
        <textarea
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
          placeholder="Enter KQL query... e.g. AzureActivity | where Level == 'Error' | take 50"
          className="w-full h-32 p-3 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground resize-y focus:outline-none"
        />
      </div>

      {error && <ErrorState message={error} compact />}

      {/* Results */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : results ? (
        <div className="rounded-lg bg-card border border-border overflow-x-auto">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-xs text-muted-foreground">{results.rows.length} rows returned</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {results.columns.map((col) => (
                  <th key={col.name} className="text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-foreground font-mono whitespace-nowrap max-w-xs truncate">{String(cell ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="Enter a KQL query above and click Execute to query your Log Analytics workspace." />
      )}
    </div>
  );
};

export default LogsPage;

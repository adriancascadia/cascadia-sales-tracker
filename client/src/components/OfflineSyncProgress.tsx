import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface OfflineSyncProgressProps {
  isVisible: boolean;
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  isSyncing: boolean;
  onRetry?: () => void;
  onClose?: () => void;
}

/**
 * Component to display offline sync progress for batch operations
 */
export function OfflineSyncProgress({
  isVisible,
  totalOperations,
  completedOperations,
  failedOperations,
  isSyncing,
  onRetry,
  onClose,
}: OfflineSyncProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (totalOperations > 0) {
      const newProgress = (completedOperations / totalOperations) * 100;
      setProgress(newProgress);
    }
  }, [completedOperations, totalOperations]);

  if (!isVisible) return null;

  const pendingOperations = totalOperations - completedOperations - failedOperations;
  const hasErrors = failedOperations > 0;

  return (
    <Card className="fixed bottom-4 right-4 w-96 p-4 shadow-lg z-50 bg-white dark:bg-slate-950">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : hasErrors ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            <h3 className="font-semibold">
              {isSyncing ? 'Syncing...' : hasErrors ? 'Sync Failed' : 'Sync Complete'}
            </h3>
          </div>
          {!isSyncing && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">{completedOperations}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-yellow-600">{pendingOperations}</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">{failedOperations}</div>
            <div className="text-gray-600">Failed</div>
          </div>
        </div>

        {/* Error Message */}
        {hasErrors && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
            <p className="text-sm text-red-700 dark:text-red-300">
              {failedOperations} operation(s) failed. Please check your connection and retry.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {hasErrors && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isSyncing}
            >
              Retry Failed
            </Button>
          )}
          {!isSyncing && onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Close
            </Button>
          )}
        </div>

        {/* Sync Info */}
        {isSyncing && (
          <div className="text-xs text-gray-500 text-center">
            Syncing {completedOperations + 1} of {totalOperations}...
          </div>
        )}
      </div>
    </Card>
  );
}

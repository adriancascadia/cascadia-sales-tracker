import { useState } from 'react';
import { useOfflineFeature } from '@/hooks/useOfflineFeature';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2, RefreshCw, ChevronDown } from 'lucide-react';

export default function OfflineSyncPanel() {
  const { pendingOperations, syncNow, clearPendingOperations, isSyncing, getPendingCount } = useOfflineFeature();
  const [isOpen, setIsOpen] = useState(false);
  const pendingCount = getPendingCount();

  if (pendingCount === 0) {
    return null;
  }

  const featureGroups = pendingOperations.reduce(
    (acc, op) => {
      if (!acc[op.feature]) {
        acc[op.feature] = [];
      }
      acc[op.feature].push(op);
      return acc;
    },
    {} as Record<string, typeof pendingOperations>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" size="sm">
          <AlertCircle className="h-4 w-4" />
          {pendingCount} Pending
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pending Operations</DialogTitle>
          <DialogDescription>
            {pendingCount} operation{pendingCount !== 1 ? 's' : ''} waiting to sync
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(featureGroups).map(([feature, operations]) => (
            <Card key={feature}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm capitalize">{feature}</CardTitle>
                  <Badge variant="secondary">{operations.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {operations.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-start justify-between p-2 bg-muted rounded text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium capitalize">{op.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(op.timestamp).toLocaleTimeString()}
                      </p>
                      {op.error && (
                        <p className="text-xs text-destructive mt-1">Error: {op.error}</p>
                      )}
                      {op.retries > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Retries: {op.retries}/{3}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={syncNow}
            disabled={isSyncing}
            className="flex-1 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button
            onClick={clearPendingOperations}
            variant="destructive"
            size="icon"
            title="Clear all pending operations"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

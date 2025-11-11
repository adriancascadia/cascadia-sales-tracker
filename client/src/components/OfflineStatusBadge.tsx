import { useOfflineFeature } from '@/hooks/useOfflineFeature';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface OfflineStatusBadgeProps {
  feature?: string;
  showDetails?: boolean;
}

export default function OfflineStatusBadge({ feature, showDetails = true }: OfflineStatusBadgeProps) {
  const { isOnline, isSyncing, pendingOperations, getPendingCount } = useOfflineFeature();
  const pendingCount = getPendingCount();
  const featurePending = feature
    ? pendingOperations.filter((op) => op.feature === feature).length
    : pendingOperations.length;

  if (isOnline && !isSyncing && pendingCount === 0) {
    return null;
  }

  if (!isOnline) {
    return (
      <Badge variant="outline" className="gap-1 bg-yellow-50 border-yellow-200 text-yellow-800">
        <WifiOff className="h-3 w-3" />
        Offline
        {showDetails && featurePending > 0 && <span className="ml-1">({featurePending})</span>}
      </Badge>
    );
  }

  if (isSyncing) {
    return (
      <Badge variant="outline" className="gap-1 bg-blue-50 border-blue-200 text-blue-800 animate-pulse">
        <Clock className="h-3 w-3" />
        Syncing...
      </Badge>
    );
  }

  if (featurePending > 0) {
    return (
      <Badge variant="outline" className="gap-1 bg-orange-50 border-orange-200 text-orange-800">
        <AlertCircle className="h-3 w-3" />
        {featurePending} pending
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 bg-green-50 border-green-200 text-green-800">
      <CheckCircle className="h-3 w-3" />
      Synced
    </Badge>
  );
}

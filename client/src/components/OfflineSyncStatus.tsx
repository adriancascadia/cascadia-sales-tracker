import { useOfflineRouteSync } from "@/_core/hooks/useOfflineRouteSync";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Wifi, WifiOff, Loader } from "lucide-react";

export default function OfflineSyncStatus() {
  const { isOnline, isSyncing, syncError, syncStatus } = useOfflineRouteSync();

  if (isOnline && !syncStatus.needsSync) {
    return (
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-green-600" />
        <Badge variant="outline" className="text-green-600">
          Online & Synced
        </Badge>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-600" />
        <Badge variant="outline" className="text-amber-600">
          Offline Mode
          {syncStatus.queueLength > 0 && ` (${syncStatus.queueLength} pending)`}
        </Badge>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2">
        <Loader className="h-4 w-4 text-blue-600 animate-spin" />
        <Badge variant="outline" className="text-blue-600">
          Syncing...
        </Badge>
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <Badge variant="outline" className="text-red-600">
          Sync Error
        </Badge>
      </div>
    );
  }

  if (syncStatus.needsSync) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <Badge variant="outline" className="text-amber-600">
          {syncStatus.queueLength} changes pending
        </Badge>
      </div>
    );
  }

  return null;
}

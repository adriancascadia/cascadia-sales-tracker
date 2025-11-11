import { useEffect, useState } from "react";
import { AlertCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSyncQueue } from "@/lib/offlineStorage";
import { getSyncProgress, onSyncProgress } from "@/lib/offlineSync";
import { toast } from "sonner";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingOperations, setPendingOperations] = useState(0);
  const [syncProgress, setSyncProgress] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
  });

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Connection lost - working offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Subscribe to sync progress updates
    const unsubscribe = onSyncProgress((progress) => {
      setSyncProgress(progress);
    });

    // Update pending count periodically
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updatePendingCount = async () => {
    try {
      const queue = await getSyncQueue();
      setPendingOperations(queue.length);
    } catch (error) {
      console.error("Error checking sync queue:", error);
    }
  };

  if (isOnline && pendingOperations === 0 && !syncProgress.inProgress) {
    return null; // Don't show indicator when everything is fine
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Offline Mode</h3>
              <p className="text-sm text-yellow-800 mt-1">
                You're working offline. Changes will sync when connection returns.
              </p>
              {pendingOperations > 0 && (
                <p className="text-xs text-yellow-700 mt-2">
                  {pendingOperations} pending operation{pendingOperations !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : syncProgress.inProgress ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Syncing Data</h3>
              <p className="text-sm text-blue-800 mt-1">
                Uploading {syncProgress.completed} of {syncProgress.total} changes...
              </p>
            </div>
          </div>
        </div>
      ) : pendingOperations > 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Pending Changes</h3>
              <p className="text-sm text-orange-800 mt-1">
                {pendingOperations} change{pendingOperations !== 1 ? "s" : ""} waiting to sync
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs"
                onClick={() => {
                  toast.info("Sync will start automatically when connection is available");
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-start gap-3">
            <Wifi className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Back Online</h3>
              <p className="text-sm text-green-800 mt-1">
                All changes have been synced successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

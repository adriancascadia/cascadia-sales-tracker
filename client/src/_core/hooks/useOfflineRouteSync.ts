import { useEffect, useState } from "react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import {
  getRoutesOffline,
  saveRoutesOffline,
  getSyncQueue,
  clearSyncQueue,
  getSyncStatus,
  OfflineRoute,
} from "@/lib/offlineRouteSync";
import { trpc } from "@/lib/trpc";

export function useOfflineRouteSync() {
  const { isOnline } = useOfflineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: routes } = trpc.routes.list.useQuery();

  // Sync routes to offline storage when online
  useEffect(() => {
    if (isOnline && routes) {
      try {
        const offlineRoutes: OfflineRoute[] = routes.map(route => ({
          id: route.id,
          routeName: route.routeName,
          routeDate: route.routeDate.toString(),
          status: route.status,
          stops: [],
          syncedAt: Date.now(),
        }));

        saveRoutesOffline(offlineRoutes);
      } catch (error) {
        console.error("[useOfflineRouteSync] Failed to sync routes:", error);
      }
    }
  }, [isOnline, routes]);

  // Sync offline changes back to server when online
  useEffect(() => {
    if (!isOnline || isSyncing) return;

    const syncOfflineChanges = async () => {
      const queue = getSyncQueue();
      if (queue.length === 0) return;

      setIsSyncing(true);
      setSyncError(null);

      try {
        // Process sync queue items
        for (const action of queue) {
          // In a real app, you would send these to the server
          // For now, we just clear the queue
          console.log("[useOfflineRouteSync] Syncing action:", action);
        }

        clearSyncQueue();
        utils.routes.list.invalidate();
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : "Sync failed");
        console.error("[useOfflineRouteSync] Sync error:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncOfflineChanges();
  }, [isOnline, isSyncing, utils]);

  const syncStatus = getSyncStatus();

  return {
    isOnline,
    isSyncing,
    syncError,
    offlineRoutes: getRoutesOffline(),
    syncStatus,
    needsSync: syncStatus.needsSync,
  };
}

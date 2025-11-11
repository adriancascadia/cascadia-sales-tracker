/**
 * Offline Sync Service
 * Handles syncing queued operations when connection is restored
 */

import { getSyncQueue, removeSyncQueueItem, updateSyncQueueItem, logOfflineActivity } from "./offlineStorage";

export interface SyncResult {
  success: boolean;
  itemId: string;
  error?: string;
  timestamp: number;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}

let syncProgress: SyncProgress = {
  total: 0,
  completed: 0,
  failed: 0,
  inProgress: false,
};

let syncCallbacks: ((progress: SyncProgress) => void)[] = [];

/**
 * Register callback for sync progress updates
 */
export function onSyncProgress(callback: (progress: SyncProgress) => void): () => void {
  syncCallbacks.push(callback);
  return () => {
    syncCallbacks = syncCallbacks.filter((cb) => cb !== callback);
  };
}

/**
 * Notify all listeners of sync progress
 */
function notifySyncProgress(): void {
  syncCallbacks.forEach((cb) => cb(syncProgress));
}

/**
 * Sync all pending operations
 */
export async function syncOfflineData(trpcClient: any): Promise<SyncResult[]> {
  if (syncProgress.inProgress) {
    console.warn("Sync already in progress");
    return [];
  }

  syncProgress.inProgress = true;
  syncProgress.completed = 0;
  syncProgress.failed = 0;

  const results: SyncResult[] = [];

  try {
    const queue = await getSyncQueue();
    syncProgress.total = queue.length;
    notifySyncProgress();

    if (queue.length === 0) {
      console.log("No pending operations to sync");
      syncProgress.inProgress = false;
      notifySyncProgress();
      return results;
    }

    console.log(`Starting sync of ${queue.length} pending operations`);

    for (const item of queue) {
      try {
        const result = await syncQueueItem(item, trpcClient);
        results.push(result);

        if (result.success) {
          await removeSyncQueueItem(item.id);
          syncProgress.completed++;
          await logOfflineActivity("sync_success", {
            itemId: item.id,
            resource: item.resource,
            operation: item.operation,
          });
        } else {
          syncProgress.failed++;
          item.retries = (item.retries || 0) + 1;

          // Retry up to 3 times
          if (item.retries < 3) {
            await updateSyncQueueItem(item.id, {
              retries: item.retries,
              lastError: result.error,
            });
            await logOfflineActivity("sync_retry", {
              itemId: item.id,
              resource: item.resource,
              retries: item.retries,
              error: result.error,
            });
          } else {
            // Max retries exceeded, keep in queue for manual review
            await updateSyncQueueItem(item.id, {
              lastError: `Max retries exceeded: ${result.error}`,
            });
            await logOfflineActivity("sync_failed", {
              itemId: item.id,
              resource: item.resource,
              error: result.error,
            });
          }
        }

        notifySyncProgress();
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        syncProgress.failed++;
        notifySyncProgress();

        results.push({
          success: false,
          itemId: item.id,
          error: String(error),
          timestamp: Date.now(),
        });
      }
    }

    console.log(
      `Sync completed: ${syncProgress.completed} successful, ${syncProgress.failed} failed`
    );
    await logOfflineActivity("sync_completed", {
      total: syncProgress.total,
      completed: syncProgress.completed,
      failed: syncProgress.failed,
    });
  } finally {
    syncProgress.inProgress = false;
    notifySyncProgress();
  }

  return results;
}

/**
 * Sync a single queue item
 */
async function syncQueueItem(item: any, trpcClient: any): Promise<SyncResult> {
  try {
    const { operation, resource, data } = item;

    // Map resource to tRPC procedure
    const [module, action] = resource.split(".");

    if (!trpcClient[module]) {
      throw new Error(`Unknown module: ${module}`);
    }

    let mutation;
    if (operation === "create") {
      mutation = trpcClient[module].create;
    } else if (operation === "update") {
      mutation = trpcClient[module].update;
    } else if (operation === "delete") {
      mutation = trpcClient[module].delete;
    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }

    if (!mutation || !mutation.useMutation) {
      throw new Error(`No mutation found for ${resource}`);
    }

    // Execute the mutation
    // Note: In a real implementation, you'd need to handle this differently
    // since useMutation is a React hook. For now, we'll simulate the API call.
    const response = await fetch("/api/trpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: item.id,
        method: `${module}.${action}`,
        params: { input: data },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Sync failed");
    }

    return {
      success: true,
      itemId: item.id,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      itemId: item.id,
      error: String(error),
      timestamp: Date.now(),
    };
  }
}

/**
 * Get current sync progress
 */
export function getSyncProgress(): SyncProgress {
  return { ...syncProgress };
}

/**
 * Reset sync progress
 */
export function resetSyncProgress(): void {
  syncProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
  };
  notifySyncProgress();
}

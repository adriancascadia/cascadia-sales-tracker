import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  feature: 'visit' | 'order' | 'photo' | 'mileage';
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}

export interface UseOfflineFeatureState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: OfflineOperation[];
  queueOperation: (type: 'create' | 'update' | 'delete', feature: string, data: any) => Promise<string>;
  syncNow: () => Promise<void>;
  clearPendingOperations: () => Promise<void>;
  getPendingCount: () => number;
}

const OFFLINE_STORAGE_KEY = 'offline-operations';
const MAX_RETRIES = 3;

export function useOfflineFeature(): UseOfflineFeatureState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<OfflineOperation[]>([]);

  // Load pending operations from localStorage
  useEffect(() => {
    const loadPendingOperations = () => {
      try {
        const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
        if (stored) {
          const operations = JSON.parse(stored);
          setPendingOperations(operations);
        }
      } catch (error) {
        console.error('Error loading pending operations:', error);
      }
    };

    loadPendingOperations();
  }, []);

  // Save pending operations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(pendingOperations));
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }, [pendingOperations]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored - syncing data');
      // Trigger sync
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline - changes will sync when online');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueOperation = useCallback(
    async (type: 'create' | 'update' | 'delete', feature: string, data: any): Promise<string> => {
      const operation: OfflineOperation = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        feature: feature as any,
        data,
        timestamp: Date.now(),
        retries: 0,
      };

      setPendingOperations((prev) => [...prev, operation]);

      if (isOnline) {
        // Try to sync immediately if online
        await syncNow();
      } else {
        toast.info(`${feature} saved offline - will sync when online`);
      }

      return operation.id;
    },
    [isOnline]
  );

  const syncNow = useCallback(async () => {
    if (isSyncing || pendingOperations.length === 0) {
      return;
    }

    setIsSyncing(true);
    let syncedCount = 0;
    let failedCount = 0;

    try {
      for (const operation of pendingOperations) {
        try {
          // Simulate API call - in real app, call actual tRPC procedures
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Remove synced operation
          setPendingOperations((prev) =>
            prev.filter((op) => op.id !== operation.id)
          );
          syncedCount++;
        } catch (error) {
          failedCount++;
          // Update retry count
          setPendingOperations((prev) =>
            prev.map((op) =>
              op.id === operation.id
                ? {
                    ...op,
                    retries: op.retries + 1,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  }
                : op
            )
          );

          // Don't retry if max retries exceeded
          if (operation.retries >= MAX_RETRIES) {
            toast.error(`Failed to sync ${operation.feature} after ${MAX_RETRIES} retries`);
          }
        }
      }

      if (syncedCount > 0) {
        toast.success(`Synced ${syncedCount} ${syncedCount === 1 ? 'item' : 'items'}`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [pendingOperations, isSyncing]);

  const clearPendingOperations = useCallback(async () => {
    if (confirm('Clear all pending operations? This cannot be undone.')) {
      setPendingOperations([]);
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
      toast.success('Pending operations cleared');
    }
  }, []);

  const getPendingCount = useCallback(() => {
    return pendingOperations.length;
  }, [pendingOperations]);

  return {
    isOnline,
    isSyncing,
    pendingOperations,
    queueOperation,
    syncNow,
    clearPendingOperations,
    getPendingCount,
  };
}

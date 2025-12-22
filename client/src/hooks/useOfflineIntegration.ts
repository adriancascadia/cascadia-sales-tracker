import { useEffect, useState, useCallback } from 'react';
import { useOfflineStatus } from './useOfflineStatus';
import { useOfflineFeature } from './useOfflineFeature';
import { cacheCustomers, getCachedCustomers, cacheProducts, getCachedProducts } from '@/lib/offlineCache';
import { toast } from 'sonner';

interface OfflineIntegrationState {
  isOnline: boolean;
  hasPendingOperations: boolean;
  pendingCount: number;
  isSyncing: boolean;
  cachedDataAvailable: boolean;
  lastSyncTime: Date | null;
}

/**
 * Enhanced offline integration hook for feature pages
 * Handles offline queuing, caching, and sync management
 */
export function useOfflineIntegration(feature: string) {
  const { isOnline } = useOfflineStatus();
  const { pendingOperations, isSyncing, syncNow: sync } = useOfflineFeature();
  const pendingCount = pendingOperations.length;
  const [state, setState] = useState<OfflineIntegrationState>({
    isOnline: true,
    hasPendingOperations: false,
    pendingCount: 0,
    isSyncing: false,
    cachedDataAvailable: false,
    lastSyncTime: null,
  });

  // Update state when online status changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isOnline,
      hasPendingOperations: pendingCount > 0,
      pendingCount,
      isSyncing,
    }));
  }, [isOnline, pendingCount, isSyncing]);

  // Check for cached data on mount
  useEffect(() => {
    const checkCachedData = async () => {
      const customers = await getCachedCustomers();
      const products = await getCachedProducts();

      setState(prev => ({
        ...prev,
        cachedDataAvailable: !!(customers || products),
      }));
    };

    checkCachedData();
  }, []);

  // Cache data when online
  const cacheData = useCallback(async (customers?: any[], products?: any[]) => {
    try {
      if (customers) {
        await cacheCustomers(customers);
      }
      if (products) {
        await cacheProducts(products);
      }

      setState(prev => ({
        ...prev,
        cachedDataAvailable: true,
        lastSyncTime: new Date(),
      }));

      if (!isOnline) {
        toast.success('Data cached for offline use');
      }
    } catch (error) {
      console.error('Failed to cache data:', error);
      toast.error('Failed to cache data');
    }
  }, [isOnline]);

  // Get cached data
  const getCachedData = useCallback(async () => {
    try {
      const customers = await getCachedCustomers();
      const products = await getCachedProducts();

      return { customers, products };
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return { customers: null, products: null };
    }
  }, []);

  // Sync pending operations
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      setState(prev => ({ ...prev, isSyncing: true }));
      await sync();

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
      }));

      toast.success('All pending operations synced successfully');
    } catch (error) {
      console.error('Failed to sync operations:', error);
      toast.error('Failed to sync operations');
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isOnline, sync]);

  // Show offline indicator
  const showOfflineIndicator = useCallback(() => {
    if (!isOnline && state.hasPendingOperations) {
      toast.info(`${state.pendingCount} operation(s) queued for sync`);
    }
  }, [isOnline, state.hasPendingOperations, state.pendingCount]);

  return {
    ...state,
    cacheData,
    getCachedData,
    syncPendingOperations,
    showOfflineIndicator,
  };
}

/**
 * Hook to handle offline operations with optimistic updates
 */
export function useOfflineOperation(feature: string) {
  const { isOnline } = useOfflineStatus();
  const { queueOperation } = useOfflineFeature();
  const [isLoading, setIsLoading] = useState(false);

  const executeOfflineAware = useCallback(
    async (
      operation: 'create' | 'update' | 'delete',
      data: any,
      onlineCallback?: () => Promise<any>
    ) => {
      try {
        setIsLoading(true);

        if (isOnline && onlineCallback) {
          // Execute online operation
          const result = await onlineCallback();
          return result;
        } else {
          // Queue offline operation
          await queueOperation(operation, feature, data);
          toast.info('Operation queued for sync when online');
          return { queued: true };
        }
      } catch (error) {
        console.error(`Failed to execute ${operation} operation:`, error);

        if (!isOnline) {
          // Queue operation on error if offline
          await queueOperation(operation, feature, data);
          toast.info('Operation queued for sync when online');
        } else {
          toast.error(`Failed to ${operation} ${feature}`);
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline, queueOperation, feature]
  );

  return {
    isLoading,
    executeOfflineAware,
    isOnline,
  };
}

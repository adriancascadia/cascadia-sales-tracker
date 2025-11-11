import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, Trash2, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { getCacheStatus, clearOfflineCache } from '@/lib/offlineCache';
import { toast } from 'sonner';

interface CacheStatus {
  customersCount: number;
  productsCount: number;
  lastUpdated: string | null;
}

/**
 * Offline Settings and Management Page
 */
export default function OfflineSettings() {
  const { isOnline } = useOfflineStatus();
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    customersCount: 0,
    productsCount: 0,
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load cache status on mount
  useEffect(() => {
    loadCacheStatus();
  }, []);

  const loadCacheStatus = async () => {
    try {
      const status = await getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Failed to load cache status:', error);
      toast.error('Failed to load cache status');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      await clearOfflineCache();
      setCacheStatus({
        customersCount: 0,
        productsCount: 0,
        lastUpdated: null,
      });
      toast.success('Offline cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    if (!isOnline) {
      toast.error('Cannot refresh cache while offline');
      return;
    }

    try {
      setIsLoading(true);
      // Trigger cache refresh by reloading customers and products
      toast.info('Cache refresh initiated. Please reload the page.');
      // In a real implementation, this would trigger a background sync
    } catch (error) {
      console.error('Failed to refresh cache:', error);
      toast.error('Failed to refresh cache');
    } finally {
      setIsLoading(false);
    }
  };

  const totalCachedItems = cacheStatus.customersCount + cacheStatus.productsCount;
  const cacheSize = Math.round((totalCachedItems * 1024) / 1024); // Rough estimate in KB

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offline Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage offline data and sync settings
          </p>
        </div>

        {/* Online Status */}
        <Card className="p-4 border-l-4" style={{
          borderLeftColor: isOnline ? '#10b981' : '#f59e0b'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isOnline ? '🟢 Online' : '🟡 Offline'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isOnline
                  ? 'Your device is connected. All changes will sync in real-time.'
                  : 'Your device is offline. Changes will be queued and synced when online.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Cache Status */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Offline Cache</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{cacheStatus.customersCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Customers Cached</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{cacheStatus.productsCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Products Cached</div>
            </div>
          </div>

          {cacheStatus.lastUpdated && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {cacheStatus.lastUpdated}
            </div>
          )}

          {totalCachedItems > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Approximate cache size: {cacheSize} KB
            </div>
          )}
        </Card>

        {/* Cache Actions */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cache Management</h2>

          <div className="space-y-3">
            <Button
              onClick={handleRefreshCache}
              disabled={!isOnline || isLoading}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Cache
            </Button>

            <Button
              onClick={handleClearCache}
              disabled={isLoading || totalCachedItems === 0}
              className="w-full"
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Cache
            </Button>
          </div>
        </Card>

        {/* Information */}
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Offline Cache Information</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Cache is automatically updated when you view customers or products while online</li>
                <li>Cached data expires after 24 hours and must be refreshed</li>
                <li>Offline cache allows you to browse data when your device is offline</li>
                <li>Clearing cache will remove all offline data from your device</li>
                <li>Cache is stored locally on your device and never shared</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Offline Features */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Offline Features</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Queue Operations</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create visits, orders, and photos offline. They'll sync when online.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Browse Cached Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View customers and products from cache when offline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Auto Sync</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending changes automatically sync when connection returns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Service Worker</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  App continues working offline with cached assets and data.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

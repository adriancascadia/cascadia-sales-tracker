/**
 * Offline Route Sync Service
 * Manages route data synchronization for offline-first mobile experience
 */

export interface OfflineRoute {
  id: number;
  routeName: string;
  routeDate: string;
  status: "planned" | "in_progress" | "completed";
  stops: OfflineRouteStop[];
  syncedAt: number;
}

export interface OfflineRouteStop {
  id: number;
  routeId: number;
  customerId: number;
  stopOrder: number;
  customer?: {
    id: number;
    name: string;
    address?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    phone?: string;
  };
  visitedAt?: number;
  notes?: string;
}

const OFFLINE_ROUTES_KEY = "offline_routes";
const OFFLINE_SYNC_QUEUE_KEY = "offline_sync_queue";
const LAST_SYNC_KEY = "last_route_sync";

/**
 * Save routes to local storage for offline access
 */
export function saveRoutesOffline(routes: OfflineRoute[]): void {
  try {
    const data = {
      routes,
      syncedAt: Date.now(),
    };
    localStorage.setItem(OFFLINE_ROUTES_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to save routes:", error);
  }
}

/**
 * Get routes from local storage
 */
export function getRoutesOffline(): OfflineRoute[] {
  try {
    const data = localStorage.getItem(OFFLINE_ROUTES_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.routes || [];
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to get routes:", error);
    return [];
  }
}

/**
 * Get a specific route from offline storage
 */
export function getRouteOffline(routeId: number): OfflineRoute | null {
  const routes = getRoutesOffline();
  return routes.find(r => r.id === routeId) || null;
}

/**
 * Update route stop as visited
 */
export function markStopVisited(routeId: number, stopId: number, notes?: string): void {
  try {
    const routes = getRoutesOffline();
    const route = routes.find(r => r.id === routeId);
    
    if (route) {
      const stop = route.stops.find(s => s.id === stopId);
      if (stop) {
        stop.visitedAt = Date.now();
        if (notes) stop.notes = notes;
        
        // Add to sync queue
        addToSyncQueue({
          type: "mark_visited",
          routeId,
          stopId,
          visitedAt: stop.visitedAt,
          notes,
        });
        
        saveRoutesOffline(routes);
      }
    }
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to mark stop visited:", error);
  }
}

/**
 * Update route status
 */
export function updateRouteStatusOffline(routeId: number, status: "planned" | "in_progress" | "completed"): void {
  try {
    const routes = getRoutesOffline();
    const route = routes.find(r => r.id === routeId);
    
    if (route) {
      route.status = status;
      
      // Add to sync queue
      addToSyncQueue({
        type: "update_status",
        routeId,
        status,
      });
      
      saveRoutesOffline(routes);
    }
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to update route status:", error);
  }
}

/**
 * Add action to sync queue
 */
export function addToSyncQueue(action: any): void {
  try {
    const queue = getSyncQueue();
    queue.push({
      ...action,
      queuedAt: Date.now(),
    });
    localStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to add to sync queue:", error);
  }
}

/**
 * Get sync queue
 */
export function getSyncQueue(): any[] {
  try {
    const data = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to get sync queue:", error);
    return [];
  }
}

/**
 * Clear sync queue after successful sync
 */
export function clearSyncQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_SYNC_QUEUE_KEY);
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to clear sync queue:", error);
  }
}

/**
 * Get last sync time
 */
export function getLastSyncTime(): number {
  try {
    const time = localStorage.getItem(LAST_SYNC_KEY);
    return time ? parseInt(time) : 0;
  } catch (error) {
    console.error("[OfflineRouteSync] Failed to get last sync time:", error);
    return 0;
  }
}

/**
 * Check if routes need sync
 */
export function needsSync(): boolean {
  const queue = getSyncQueue();
  return queue.length > 0;
}

/**
 * Get sync status
 */
export function getSyncStatus(): {
  needsSync: boolean;
  queueLength: number;
  lastSyncTime: number;
  timeSinceSync: number;
} {
  const queue = getSyncQueue();
  const lastSync = getLastSyncTime();
  const now = Date.now();

  return {
    needsSync: queue.length > 0,
    queueLength: queue.length,
    lastSyncTime: lastSync,
    timeSinceSync: now - lastSync,
  };
}

/**
 * Calculate route statistics from offline data
 */
export function getRouteStats(routeId: number): {
  totalStops: number;
  visitedStops: number;
  completionPercentage: number;
  estimatedTimeRemaining: number;
} {
  const route = getRouteOffline(routeId);
  
  if (!route) {
    return {
      totalStops: 0,
      visitedStops: 0,
      completionPercentage: 0,
      estimatedTimeRemaining: 0,
    };
  }

  const totalStops = route.stops.length;
  const visitedStops = route.stops.filter(s => s.visitedAt).length;
  const completionPercentage = totalStops > 0 ? (visitedStops / totalStops) * 100 : 0;
  
  // Estimate 30 minutes per stop
  const remainingStops = totalStops - visitedStops;
  const estimatedTimeRemaining = remainingStops * 30;

  return {
    totalStops,
    visitedStops,
    completionPercentage: Math.round(completionPercentage),
    estimatedTimeRemaining,
  };
}

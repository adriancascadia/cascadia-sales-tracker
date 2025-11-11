/**
 * Offline Storage Service
 * Manages IndexedDB for local caching and sync queue
 */

const DB_NAME = "salesforce-tracker-offline";
const DB_VERSION = 1;

interface StoredData {
  key: string;
  data: any;
  timestamp: number;
  type: "cache" | "sync";
}

interface SyncQueueItem {
  id: string;
  operation: "create" | "update" | "delete";
  resource: string;
  data: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initOfflineStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create cache store
      if (!database.objectStoreNames.contains("cache")) {
        database.createObjectStore("cache", { keyPath: "key" });
      }

      // Create sync queue store
      if (!database.objectStoreNames.contains("syncQueue")) {
        const syncStore = database.createObjectStore("syncQueue", { keyPath: "id" });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
        syncStore.createIndex("resource", "resource", { unique: false });
      }

      // Create offline logs store
      if (!database.objectStoreNames.contains("offlineLogs")) {
        database.createObjectStore("offlineLogs", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

/**
 * Get database instance
 */
async function getDb(): Promise<IDBDatabase> {
  if (!db) {
    db = await initOfflineStorage();
  }
  return db;
}

/**
 * Cache data locally
 */
export async function cacheData(key: string, data: any): Promise<void> {
  const database = await getDb();
  const transaction = database.transaction(["cache"], "readwrite");
  const store = transaction.objectStore("cache");

  const storedData: StoredData = {
    key,
    data,
    timestamp: Date.now(),
    type: "cache",
  };

  return new Promise((resolve, reject) => {
    const request = store.put(storedData);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get cached data
 */
export async function getCachedData(key: string): Promise<any | null> {
  const database = await getDb();
  const transaction = database.transaction(["cache"], "readonly");
  const store = transaction.objectStore("cache");

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.data : null);
    };
  });
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  const database = await getDb();
  const transaction = database.transaction(["cache"], "readwrite");
  const store = transaction.objectStore("cache");

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Add operation to sync queue
 */
export async function addToSyncQueue(
  operation: "create" | "update" | "delete",
  resource: string,
  data: any
): Promise<string> {
  const database = await getDb();
  const transaction = database.transaction(["syncQueue"], "readwrite");
  const store = transaction.objectStore("syncQueue");

  const id = `${resource}-${Date.now()}-${Math.random()}`;
  const queueItem: SyncQueueItem = {
    id,
    operation,
    resource,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const request = store.add(queueItem);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(id);
  });
}

/**
 * Get all pending sync operations
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const database = await getDb();
  const transaction = database.transaction(["syncQueue"], "readonly");
  const store = transaction.objectStore("syncQueue");

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Remove item from sync queue
 */
export async function removeSyncQueueItem(id: string): Promise<void> {
  const database = await getDb();
  const transaction = database.transaction(["syncQueue"], "readwrite");
  const store = transaction.objectStore("syncQueue");

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Update sync queue item (e.g., increment retries)
 */
export async function updateSyncQueueItem(
  id: string,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  const database = await getDb();
  const transaction = database.transaction(["syncQueue"], "readwrite");
  const store = transaction.objectStore("syncQueue");

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        const updated = { ...item, ...updates };
        const putRequest = store.put(updated);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      } else {
        reject(new Error("Item not found"));
      }
    };
  });
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  const database = await getDb();
  const transaction = database.transaction(["syncQueue"], "readwrite");
  const store = transaction.objectStore("syncQueue");

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Log offline activity
 */
export async function logOfflineActivity(action: string, details: any): Promise<void> {
  const database = await getDb();
  const transaction = database.transaction(["offlineLogs"], "readwrite");
  const store = transaction.objectStore("offlineLogs");

  const logEntry = {
    action,
    details,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(logEntry);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get offline logs
 */
export async function getOfflineLogs(): Promise<any[]> {
  const database = await getDb();
  const transaction = database.transaction(["offlineLogs"], "readonly");
  const store = transaction.objectStore("offlineLogs");

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Clear offline logs
 */
export async function clearOfflineLogs(): Promise<void> {
  const database = await getDb();
  const transaction = database.transaction(["offlineLogs"], "readwrite");
  const store = transaction.objectStore("offlineLogs");

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get database size estimate
 */
export async function getStorageSize(): Promise<{ usage: number; quota: number }> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { usage: 0, quota: 0 };
  }

  const estimate = await navigator.storage.estimate();
  return {
    usage: estimate.usage || 0,
    quota: estimate.quota || 0,
  };
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }

  try {
    return await navigator.storage.persist();
  } catch (error) {
    console.error("Failed to request persistent storage:", error);
    return false;
  }
}

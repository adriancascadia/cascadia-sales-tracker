/**
 * Mobile Features Service
 * Handles offline mode, push notifications, and biometric authentication
 */

// ============================================================================
// OFFLINE MODE
// ============================================================================

export interface OfflineData {
  visits: any[];
  orders: any[];
  photos: any[];
  mileage: any[];
  gpsTracking: any[];
}

const OFFLINE_DB_KEY = "cascadia_offline_db";
const OFFLINE_QUEUE_KEY = "cascadia_offline_queue";
const OFFLINE_SYNC_KEY = "cascadia_offline_sync";

/**
 * Initialize offline storage
 */
export async function initializeOfflineStorage(): Promise<void> {
  if (!("indexedDB" in window)) {
    console.warn("IndexedDB not supported, using localStorage fallback");
    return;
  }

  const db = indexedDB.open("CascadiaDB", 1);

  db.onerror = () => console.error("IndexedDB error:", db.error);

  db.onupgradeneeded = (event) => {
    const idb = (event.target as IDBOpenDBRequest).result;

    // Create object stores
    if (!idb.objectStoreNames.contains("visits")) {
      idb.createObjectStore("visits", { keyPath: "id" });
    }
    if (!idb.objectStoreNames.contains("orders")) {
      idb.createObjectStore("orders", { keyPath: "id" });
    }
    if (!idb.objectStoreNames.contains("photos")) {
      idb.createObjectStore("photos", { keyPath: "id" });
    }
    if (!idb.objectStoreNames.contains("mileage")) {
      idb.createObjectStore("mileage", { keyPath: "id" });
    }
    if (!idb.objectStoreNames.contains("syncQueue")) {
      idb.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
    }
  };
}

/**
 * Save data to offline storage
 */
export async function saveOfflineData(
  storeName: string,
  data: any
): Promise<void> {
  if (!("indexedDB" in window)) {
    localStorage.setItem(`${OFFLINE_DB_KEY}_${storeName}`, JSON.stringify(data));
    return;
  }

  const db = indexedDB.open("CascadiaDB");
  db.onsuccess = () => {
    const transaction = db.result.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    store.put(data);
  };
}

/**
 * Get offline data
 */
export async function getOfflineData(storeName: string): Promise<any[]> {
  if (!("indexedDB" in window)) {
    const data = localStorage.getItem(`${OFFLINE_DB_KEY}_${storeName}`);
    return data ? JSON.parse(data) : [];
  }

  return new Promise((resolve, reject) => {
    const db = indexedDB.open("CascadiaDB");
    db.onsuccess = () => {
      const transaction = db.result.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    };
    db.onerror = () => reject(db.error);
  });
}

/**
 * Queue action for sync when online
 */
export async function queueOfflineAction(
  action: string,
  data: any,
  endpoint: string
): Promise<void> {
  const queueItem = {
    action,
    data,
    endpoint,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  if (!("indexedDB" in window)) {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    queue.push(queueItem);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return;
  }

  const db = indexedDB.open("CascadiaDB");
  db.onsuccess = () => {
    const transaction = db.result.transaction(["syncQueue"], "readwrite");
    const store = transaction.objectStore("syncQueue");
    store.add(queueItem);
  };
}

/**
 * Get pending sync queue
 */
export async function getPendingSyncQueue(): Promise<any[]> {
  if (!("indexedDB" in window)) {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
  }

  return new Promise((resolve, reject) => {
    const db = indexedDB.open("CascadiaDB");
    db.onsuccess = () => {
      const transaction = db.result.transaction(["syncQueue"], "readonly");
      const store = transaction.objectStore("syncQueue");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result.filter((item) => !item.synced));
      request.onerror = () => reject(request.error);
    };
    db.onerror = () => reject(db.error);
  });
}

/**
 * Mark item as synced
 */
export async function markAsSynced(queueItemId: number): Promise<void> {
  if (!("indexedDB" in window)) {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    const item = queue.find((q: any) => q.id === queueItemId);
    if (item) item.synced = true;
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return;
  }

  const db = indexedDB.open("CascadiaDB");
  db.onsuccess = () => {
    const transaction = db.result.transaction(["syncQueue"], "readwrite");
    const store = transaction.objectStore("syncQueue");
    const request = store.get(queueItemId);

    request.onsuccess = () => {
      const item = request.result;
      item.synced = true;
      store.put(item);
    };
  };
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

/**
 * Request push notification permission
 */
export async function requestPushNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Send push notification
 */
export function sendPushNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/cascadia-icon.png",
      badge: "/cascadia-icon.png",
      ...options,
    });
  }
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  swRegistration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!("pushManager" in swRegistration)) {
    console.warn("Push Manager not supported");
    return null;
  }

  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
    });
    console.log("Push subscription:", subscription);
    return subscription;
  } catch (error) {
    console.error("Push subscription failed:", error);
    return null;
  }
}

// ============================================================================
// BIOMETRIC AUTHENTICATION
// ============================================================================

/**
 * Check if biometric authentication is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!("PublicKeyCredential" in window)) {
    return false;
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error("Biometric check failed:", error);
    return false;
  }
}

/**
 * Register biometric credential
 */
export async function registerBiometric(
  userId: number,
  userName: string
): Promise<boolean> {
  if (!("PublicKeyCredential" in window)) {
    console.warn("WebAuthn not supported");
    return false;
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: {
          name: "Cascadia Sales Tracker",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(8),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
        },
      },
    });

    if (credential) {
      localStorage.setItem(`biometric_${userId}`, JSON.stringify(credential));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Biometric registration failed:", error);
    return false;
  }
}

/**
 * Authenticate with biometric
 */
export async function authenticateWithBiometric(userId: number): Promise<boolean> {
  if (!("PublicKeyCredential" in window)) {
    console.warn("WebAuthn not supported");
    return false;
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: "preferred",
      },
    });

    return !!assertion;
  } catch (error) {
    console.error("Biometric authentication failed:", error);
    return false;
  }
}

/**
 * Check if biometric is registered for user
 */
export function isBiometricRegistered(userId: number): boolean {
  return !!localStorage.getItem(`biometric_${userId}`);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onlineStatusListener(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

/**
 * Sync offline data when online
 */
export async function syncOfflineData(): Promise<void> {
  if (!isOnline()) {
    console.log("Device is offline, skipping sync");
    return;
  }

  const queue = await getPendingSyncQueue();

  for (const item of queue) {
    try {
      const response = await fetch(item.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.data),
      });

      if (response.ok) {
        await markAsSynced(item.id);
        sendPushNotification("Sync Complete", {
          body: `${item.action} synced successfully`,
        });
      }
    } catch (error) {
      console.error("Sync failed for item:", item, error);
    }
  }
}

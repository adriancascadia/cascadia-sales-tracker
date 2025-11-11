import { useState, useEffect } from "react";

export interface OfflineStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  syncInProgress: boolean;
  pendingOperations: number;
}

/**
 * Hook to track online/offline status
 */
export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);

  useEffect(() => {
    // Set initial online status
    if (navigator.onLine) {
      setLastOnline(new Date());
    }

    const handleOnline = () => {
      console.log("Connection restored");
      setIsOnline(true);
      setLastOnline(new Date());
    };

    const handleOffline = () => {
      console.log("Connection lost");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    lastOnline,
    syncInProgress,
    pendingOperations,
  };
}

/**
 * Hook to check if specific feature is available offline
 */
export function useOfflineFeature(feature: string): boolean {
  const offlineFeatures = [
    "visits.checkIn",
    "visits.checkOut",
    "visits.logActivity",
    "photos.upload",
    "mileage.start",
    "mileage.end",
    "customers.view",
    "orders.create",
  ];

  return offlineFeatures.includes(feature);
}

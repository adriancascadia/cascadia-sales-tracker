import { useEffect, useState, useCallback } from "react";
import {
  checkGeofenceEvents,
  createAlert,
  GeofenceAlert,
  GeofenceEvent,
} from "@/lib/geofencingService";

interface RouteStop {
  id: number;
  customerId: number;
  stopOrder: number;
  customer?: {
    id: number;
    name: string;
    latitude?: string | null;
    longitude?: string | null;
  } | null;
}

interface RepLocation {
  userId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
  status: "active" | "idle" | "offline";
}

export function useGeofenceAlerts(
  stops: RouteStop[],
  repLocations: RepLocation[],
  routePath: Array<{ lat: number; lng: number }>
) {
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check for geofence events
  useEffect(() => {
    const newAlerts: GeofenceAlert[] = [];

    repLocations.forEach(rep => {
      const events = checkGeofenceEvents(
        { lat: rep.latitude, lng: rep.longitude },
        stops,
        routePath,
        rep.userId
      );

      events.forEach(event => {
        const alert = createAlert(event);
        // Only add if not already in alerts
        if (!alerts.find(a => a.id === alert.id)) {
          newAlerts.push(alert);
        }
      });
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
      setUnreadCount(prev => prev + newAlerts.length);
    }
  }, [repLocations, stops, routePath]);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  return {
    alerts,
    unreadCount,
    markAsRead,
    dismissAlert,
    clearAllAlerts,
  };
}

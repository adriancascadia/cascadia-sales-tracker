/**
 * Geofencing Service
 * Detects when reps arrive/depart customer locations and deviate from planned routes
 */

export interface GeofenceEvent {
  type: "arrival" | "departure" | "deviation";
  repId: number;
  customerId?: number;
  customerName?: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  distance?: number; // Distance from route in meters
  message: string;
}

export interface GeofenceAlert {
  id: string;
  event: GeofenceEvent;
  severity: "info" | "warning" | "critical";
  read: boolean;
  createdAt: Date;
}

const GEOFENCE_RADIUS_METERS = 100; // 100 meters for arrival/departure
const ROUTE_DEVIATION_THRESHOLD = 500; // 500 meters for route deviation

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if rep has arrived at a customer location
 */
export function checkArrival(
  repLocation: { lat: number; lng: number },
  customerLocation: { lat: number; lng: number },
  customerName: string,
  repId: number,
  customerId: number
): GeofenceEvent | null {
  const distance = calculateDistance(
    repLocation.lat,
    repLocation.lng,
    customerLocation.lat,
    customerLocation.lng
  );

  if (distance <= GEOFENCE_RADIUS_METERS) {
    return {
      type: "arrival",
      repId,
      customerId,
      customerName,
      timestamp: new Date(),
      location: repLocation,
      distance,
      message: `Rep arrived at ${customerName}`,
    };
  }

  return null;
}

/**
 * Check if rep has deviated from planned route
 */
export function checkDeviation(
  repLocation: { lat: number; lng: number },
  routePath: Array<{ lat: number; lng: number }>,
  repId: number
): GeofenceEvent | null {
  if (routePath.length < 2) return null;

  // Find minimum distance from rep to any point on the route
  let minDistance = Infinity;

  for (let i = 0; i < routePath.length - 1; i++) {
    const distance = pointToLineDistance(
      repLocation,
      routePath[i],
      routePath[i + 1]
    );
    minDistance = Math.min(minDistance, distance);
  }

  if (minDistance > ROUTE_DEVIATION_THRESHOLD) {
    return {
      type: "deviation",
      repId,
      timestamp: new Date(),
      location: repLocation,
      distance: minDistance,
      message: `Rep deviated ${Math.round(minDistance)}m from planned route`,
    };
  }

  return null;
}

/**
 * Calculate perpendicular distance from a point to a line segment
 */
function pointToLineDistance(
  point: { lat: number; lng: number },
  lineStart: { lat: number; lng: number },
  lineEnd: { lat: number; lng: number }
): number {
  const A = point.lat - lineStart.lat;
  const B = point.lng - lineStart.lng;
  const C = lineEnd.lat - lineStart.lat;
  const D = lineEnd.lng - lineStart.lng;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.lat;
    yy = lineStart.lng;
  } else if (param > 1) {
    xx = lineEnd.lat;
    yy = lineEnd.lng;
  } else {
    xx = lineStart.lat + param * C;
    yy = lineStart.lng + param * D;
  }

  const dx = point.lat - xx;
  const dy = point.lng - yy;

  return calculateDistance(point.lat, point.lng, xx, yy);
}

/**
 * Check for multiple geofence events
 */
export function checkGeofenceEvents(
  repLocation: { lat: number; lng: number },
  stops: Array<{
    id: number;
    customerId: number;
    customer?: { id: number; name: string; latitude?: string; longitude?: string };
  }>,
  routePath: Array<{ lat: number; lng: number }>,
  repId: number
): GeofenceEvent[] {
  const events: GeofenceEvent[] = [];

  // Check for arrivals at customer locations
  stops.forEach(stop => {
    if (stop.customer?.latitude && stop.customer?.longitude) {
      const arrival = checkArrival(
        repLocation,
        {
          lat: parseFloat(stop.customer.latitude),
          lng: parseFloat(stop.customer.longitude),
        },
        stop.customer.name,
        repId,
        stop.customerId
      );

      if (arrival) {
        events.push(arrival);
      }
    }
  });

  // Check for route deviations
  const deviation = checkDeviation(repLocation, routePath, repId);
  if (deviation) {
    events.push(deviation);
  }

  return events;
}

/**
 * Generate alert from geofence event
 */
export function createAlert(event: GeofenceEvent): GeofenceAlert {
  let severity: "info" | "warning" | "critical" = "info";

  if (event.type === "arrival") {
    severity = "info";
  } else if (event.type === "deviation") {
    severity = event.distance && event.distance > 1000 ? "critical" : "warning";
  }

  return {
    id: `${event.type}-${event.repId}-${event.timestamp.getTime()}`,
    event,
    severity,
    read: false,
    createdAt: event.timestamp,
  };
}

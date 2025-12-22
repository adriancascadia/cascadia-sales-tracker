/**
 * Directions Service
 * Provides turn-by-turn navigation between route stops using Google Directions API
 */

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

export interface RouteDirections {
  origin: string;
  destination: string;
  totalDistance: string;
  totalDistanceValue: number; // in meters
  totalDuration: string;
  totalDurationValue: number; // in seconds
  steps: DirectionStep[];
  polyline: string;
  warnings: string[];
}

/**
 * Get directions between two points using Google Directions API
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints?: Array<{ lat: number; lng: number }>
): Promise<RouteDirections | null> {
  if (!window.google) {
    console.error("Google Maps not loaded");
    return null;
  }

  return new Promise((resolve) => {
    const directionsService = new window.google!.maps.DirectionsService();

    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };

    if (waypoints && waypoints.length > 0) {
      request.waypoints = waypoints.map(wp => ({
        location: wp,
        stopover: true,
      }));
    }

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        const route = result.routes[0];
        const leg = route.legs[0];

        const steps: DirectionStep[] = [];
        route.legs.forEach(leg => {
          leg.steps.forEach(step => {
            steps.push({
              instruction: step.instructions,
              distance: step.distance?.text || "",
              duration: step.duration?.text || "",
              distanceValue: step.distance?.value || 0,
              durationValue: step.duration?.value || 0,
            });
          });
        });

        resolve({
          origin: leg.start_address,
          destination: leg.end_address,
          totalDistance: route.legs.reduce((sum, l) => sum + (l.distance?.value || 0), 0).toString(),
          totalDistanceValue: route.legs.reduce((sum, l) => sum + (l.distance?.value || 0), 0),
          totalDuration: route.legs.reduce((sum, l) => sum + (l.duration?.value || 0), 0).toString(),
          totalDurationValue: route.legs.reduce((sum, l) => sum + (l.duration?.value || 0), 0),
          steps,
          polyline: route.overview_polyline,
          warnings: result.routes[0].warnings || [],
        });
      } else {
        console.error("Directions request failed:", status);
        resolve(null);
      }
    });
  });
}

/**
 * Get directions for entire route with multiple stops
 */
export async function getRouteDirections(
  stops: Array<{ lat: number; lng: number; name: string }>
): Promise<RouteDirections | null> {
  if (stops.length < 2) return null;

  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1);

  return getDirections(
    { lat: origin.lat, lng: origin.lng },
    { lat: destination.lat, lng: destination.lng },
    waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }))
  );
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format distance in meters to readable string
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Decode polyline string to coordinates
 */
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}

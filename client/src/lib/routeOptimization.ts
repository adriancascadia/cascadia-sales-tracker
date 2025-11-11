/**
 * Route Optimization Service
 * Implements algorithms for optimal route planning and sequencing
 */

export interface RouteLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  visitDuration?: number; // minutes
  priority?: number; // 1-5, higher = more important
}

export interface OptimizedRoute {
  locations: RouteLocation[];
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  efficiency: number; // 0-100 score
  stops: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total route distance
 */
export function calculateRouteDistance(locations: RouteLocation[]): number {
  let totalDistance = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    totalDistance += calculateDistance(
      locations[i].latitude,
      locations[i].longitude,
      locations[i + 1].latitude,
      locations[i + 1].longitude
    );
  }
  return totalDistance;
}

/**
 * Nearest Neighbor algorithm for route optimization
 * Fast approximation for TSP (Traveling Salesman Problem)
 */
export function optimizeRouteNearestNeighbor(
  locations: RouteLocation[],
  startLocation?: RouteLocation
): RouteLocation[] {
  if (locations.length === 0) return [];
  if (locations.length === 1) return locations;

  const unvisited = [...locations];
  const route: RouteLocation[] = [];

  // Start from specified location or first location
  let current = startLocation || unvisited.shift()!;
  route.push(current);

  while (unvisited.length > 0) {
    // Find nearest unvisited location
    let nearest = unvisited[0];
    let minDistance = calculateDistance(
      current.latitude,
      current.longitude,
      nearest.latitude,
      nearest.longitude
    );

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = unvisited[i];
      }
    }

    // Move to nearest location
    route.push(nearest);
    current = nearest;
    unvisited.splice(unvisited.indexOf(nearest), 1);
  }

  return route;
}

/**
 * Priority-based route optimization
 * Prioritizes high-priority locations while minimizing distance
 */
export function optimizeRoutePriority(
  locations: RouteLocation[]
): RouteLocation[] {
  if (locations.length === 0) return [];

  // Sort by priority (descending) then by distance from start
  const sorted = [...locations].sort((a, b) => {
    const priorityA = a.priority || 3;
    const priorityB = b.priority || 3;
    if (priorityA !== priorityB) return priorityB - priorityA;
    return 0;
  });

  // Apply nearest neighbor to sorted list
  return optimizeRouteNearestNeighbor(sorted, sorted[0]);
}

/**
 * Calculate route efficiency score (0-100)
 * Based on distance, time, and stops
 */
export function calculateEfficiencyScore(
  route: OptimizedRoute,
  avgKmPerStop: number = 15,
  avgMinPerStop: number = 30
): number {
  // Ideal metrics
  const idealDistance = route.stops * avgKmPerStop;
  const idealDuration = route.stops * avgMinPerStop;

  // Distance efficiency (0-50 points)
  const distanceEfficiency = Math.min(50, (idealDistance / route.totalDistance) * 50);

  // Time efficiency (0-30 points)
  const timeEfficiency = Math.min(30, (idealDuration / route.estimatedDuration) * 30);

  // Stop efficiency (0-20 points)
  const stopsPerKm = route.stops / route.totalDistance;
  const stopEfficiency = Math.min(20, stopsPerKm * 20);

  return Math.round(distanceEfficiency + timeEfficiency + stopEfficiency);
}

/**
 * Build optimized route with all metrics
 */
export function buildOptimizedRoute(
  locations: RouteLocation[],
  method: 'nearest-neighbor' | 'priority' = 'nearest-neighbor'
): OptimizedRoute {
  let optimizedLocations: RouteLocation[];

  if (method === 'priority') {
    optimizedLocations = optimizeRoutePriority(locations);
  } else {
    optimizedLocations = optimizeRouteNearestNeighbor(locations);
  }

  const totalDistance = calculateRouteDistance(optimizedLocations);

  // Calculate estimated duration
  // Average: 50 km/h travel + visit duration
  const travelTime = (totalDistance / 50) * 60; // minutes
  const visitTime = optimizedLocations.reduce((sum, loc) => sum + (loc.visitDuration || 30), 0);
  const estimatedDuration = travelTime + visitTime;

  const route: OptimizedRoute = {
    locations: optimizedLocations,
    totalDistance: Math.round(totalDistance * 10) / 10,
    estimatedDuration: Math.round(estimatedDuration),
    stops: optimizedLocations.length,
    efficiency: 0, // Will be calculated below
  };

  route.efficiency = calculateEfficiencyScore(route);

  return route;
}

/**
 * Compare two routes and return efficiency difference
 */
export function compareRoutes(
  route1: OptimizedRoute,
  route2: OptimizedRoute
): {
  distanceSaved: number;
  timeSaved: number;
  efficiencyGain: number;
} {
  return {
    distanceSaved: Math.round((route1.totalDistance - route2.totalDistance) * 10) / 10,
    timeSaved: route1.estimatedDuration - route2.estimatedDuration,
    efficiencyGain: route2.efficiency - route1.efficiency,
  };
}

/**
 * Split locations into multiple routes based on territory or time windows
 */
export function splitIntoMultipleRoutes(
  locations: RouteLocation[],
  maxStopsPerRoute: number = 10
): OptimizedRoute[] {
  const routes: OptimizedRoute[] = [];
  const chunks = [];

  for (let i = 0; i < locations.length; i += maxStopsPerRoute) {
    chunks.push(locations.slice(i, i + maxStopsPerRoute));
  }

  for (const chunk of chunks) {
    routes.push(buildOptimizedRoute(chunk));
  }

  return routes;
}

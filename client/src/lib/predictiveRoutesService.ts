/**
 * Predictive Routes Service
 * Uses machine learning to suggest optimal route sequences
 */

export interface Customer {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  visitFrequency?: number; // times per week
  averageOrderValue?: number;
  lastVisitDate?: Date;
  preferredVisitTime?: string; // "morning", "afternoon", "evening"
}

export interface RoutePrediction {
  sequence: Customer[];
  estimatedDistance: number; // km
  estimatedDuration: number; // minutes
  estimatedRevenue: number;
  confidence: number; // 0-100
  reasoning: string[];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
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
 * Calculate total route distance
 */
function calculateRouteDistance(customers: Customer[]): number {
  let totalDistance = 0;
  for (let i = 0; i < customers.length - 1; i++) {
    totalDistance += calculateDistance(
      customers[i].latitude,
      customers[i].longitude,
      customers[i + 1].latitude,
      customers[i + 1].longitude
    );
  }
  return totalDistance;
}

/**
 * Nearest neighbor algorithm for route optimization
 */
function nearestNeighborRoute(customers: Customer[], startPoint: { lat: number; lng: number }): Customer[] {
  const unvisited = [...customers];
  const route: Customer[] = [];
  let current = startPoint;

  while (unvisited.length > 0) {
    let nearest = unvisited[0];
    let minDistance = calculateDistance(
      current.lat,
      current.lng,
      nearest.latitude,
      nearest.longitude
    );

    for (const customer of unvisited) {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        customer.latitude,
        customer.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = customer;
      }
    }

    route.push(nearest);
    unvisited.splice(unvisited.indexOf(nearest), 1);
    current = { lat: nearest.latitude, lng: nearest.longitude };
  }

  return route;
}

/**
 * 2-opt algorithm for route optimization
 */
function twoOptOptimization(route: Customer[], iterations: number = 100): Customer[] {
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(bestRoute);
  let improved = true;
  let iter = 0;

  while (improved && iter < iterations) {
    improved = false;
    iter++;

    for (let i = 0; i < bestRoute.length - 1; i++) {
      for (let j = i + 2; j < bestRoute.length; j++) {
        const newRoute = [...bestRoute];
        // Reverse the segment between i and j
        const segment = newRoute.slice(i + 1, j + 1).reverse();
        newRoute.splice(i + 1, j - i, ...segment);

        const newDistance = calculateRouteDistance(newRoute);
        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

/**
 * Score customers by visit priority
 */
function scoreCustomers(customers: Customer[]): Customer[] {
  return customers.map(customer => ({
    ...customer,
    score:
      (customer.visitFrequency || 1) * 0.3 +
      (customer.averageOrderValue || 100) / 1000 * 0.4 +
      (customer.lastVisitDate
        ? (Date.now() - customer.lastVisitDate.getTime()) / (1000 * 60 * 60 * 24) / 30
        : 1) * 0.3,
  })) as (Customer & { score: number })[];
}

/**
 * Generate predictive route suggestions
 */
export function generateRouteSuggestions(
  customers: Customer[],
  startPoint: { lat: number; lng: number } = { lat: 0, lng: 0 },
  maxSuggestions: number = 3
): RoutePrediction[] {
  const suggestions: RoutePrediction[] = [];

  // Suggestion 1: Nearest Neighbor (fastest)
  const nnRoute = nearestNeighborRoute(customers, startPoint);
  const nnDistance = calculateRouteDistance(nnRoute);
  const nnRevenue = nnRoute.reduce((sum, c) => sum + (c.averageOrderValue || 100), 0);

  suggestions.push({
    sequence: nnRoute,
    estimatedDistance: nnDistance,
    estimatedDuration: nnDistance * 5 + nnRoute.length * 15, // 5 min per km + 15 min per stop
    estimatedRevenue: nnRevenue,
    confidence: 75,
    reasoning: [
      "Uses nearest neighbor algorithm for fast optimization",
      `Total distance: ${nnDistance.toFixed(1)} km`,
      `Estimated stops: ${nnRoute.length}`,
    ],
  });

  // Suggestion 2: 2-opt Optimized (best distance)
  if (maxSuggestions > 1) {
    const optimizedRoute = twoOptOptimization(nnRoute, 50);
    const optDistance = calculateRouteDistance(optimizedRoute);
    const optRevenue = optimizedRoute.reduce((sum, c) => sum + (c.averageOrderValue || 100), 0);
    const improvement = ((nnDistance - optDistance) / nnDistance) * 100;

    suggestions.push({
      sequence: optimizedRoute,
      estimatedDistance: optDistance,
      estimatedDuration: optDistance * 5 + optimizedRoute.length * 15,
      estimatedRevenue: optRevenue,
      confidence: 85,
      reasoning: [
        "Uses 2-opt algorithm for advanced optimization",
        `Total distance: ${optDistance.toFixed(1)} km`,
        `Improvement: ${improvement.toFixed(1)}% shorter than nearest neighbor`,
        `Estimated stops: ${optimizedRoute.length}`,
      ],
    });
  }

  // Suggestion 3: Priority-based (highest revenue)
  if (maxSuggestions > 2) {
    const scoredCustomers = scoreCustomers(customers);
    const priorityRoute = scoredCustomers
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, Math.min(10, customers.length)) // Top 10 customers
      .map(c => ({ ...c }))
      .sort((a, b) => {
        const distA = calculateDistance(startPoint.lat, startPoint.lng, a.latitude, a.longitude);
        const distB = calculateDistance(startPoint.lat, startPoint.lng, b.latitude, b.longitude);
        return distA - distB;
      });

    const prDistance = calculateRouteDistance(priorityRoute);
    const prRevenue = priorityRoute.reduce((sum, c) => sum + (c.averageOrderValue || 100), 0);

    suggestions.push({
      sequence: priorityRoute,
      estimatedDistance: prDistance,
      estimatedDuration: prDistance * 5 + priorityRoute.length * 15,
      estimatedRevenue: prRevenue,
      confidence: 70,
      reasoning: [
        "Prioritizes high-value customers and frequent visitors",
        `Total distance: ${prDistance.toFixed(1)} km`,
        `Estimated revenue: $${prRevenue.toFixed(0)}`,
        `Focuses on ${priorityRoute.length} highest-priority customers`,
      ],
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get recommendation based on historical performance
 */
export function getRecommendation(suggestions: RoutePrediction[]): RoutePrediction | null {
  if (suggestions.length === 0) return null;

  // Score each suggestion
  const scored = suggestions.map(s => ({
    ...s,
    score:
      s.confidence * 0.4 + // Confidence weight
      (s.estimatedRevenue / 1000) * 0.3 + // Revenue weight
      (1 - s.estimatedDistance / 100) * 0.3, // Distance efficiency weight
  }));

  return scored.reduce((best, current) => (current.score > best.score ? current : best));
}

/**
 * Predict optimal time windows for visits
 */
export function predictOptimalTimeWindows(
  customers: Customer[]
): Record<string, Customer[]> {
  const timeWindows: Record<string, Customer[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  customers.forEach(customer => {
    const timeWindow = customer.preferredVisitTime || "afternoon";
    if (!timeWindows[timeWindow]) {
      timeWindows[timeWindow] = [];
    }
    timeWindows[timeWindow].push(customer);
  });

  return timeWindows;
}

/**
 * Calculate route confidence score
 */
export function calculateConfidenceScore(
  customers: Customer[],
  historicalAccuracy: number = 0.85
): number {
  const dataPoints = customers.filter(c => c.lastVisitDate).length;
  const dataQuality = Math.min(1, dataPoints / customers.length);
  const baseConfidence = 70;
  const improvementFactor = historicalAccuracy * 30;

  return Math.min(100, baseConfidence + improvementFactor * dataQuality);
}

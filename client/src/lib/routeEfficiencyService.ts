/**
 * Route Efficiency Service
 * Calculates route efficiency metrics and scoring
 */

export interface RouteMetrics {
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  stopsCount: number;
  averageTimePerStop: number; // in seconds
  averageDistanceBetweenStops: number; // in meters
  efficiencyScore: number; // 0-100
  stopsPerHour: number;
  estimatedCost: number; // in dollars, assuming $0.58 per mile
  recommendations: string[];
}

/**
 * Calculate route efficiency metrics
 */
export function calculateRouteMetrics(
  totalDistance: number,
  totalDuration: number,
  stopsCount: number,
  actualTimeSpentAtStops: number = 0
): RouteMetrics {
  const distanceInMiles = totalDistance / 1609.34;
  const durationInHours = totalDuration / 3600;
  const drivingTime = totalDuration - actualTimeSpentAtStops;

  const averageTimePerStop = stopsCount > 0 ? totalDuration / stopsCount : 0;
  const averageDistanceBetweenStops = stopsCount > 1 ? totalDistance / (stopsCount - 1) : totalDistance;
  const stopsPerHour = durationInHours > 0 ? stopsCount / durationInHours : 0;
  const estimatedCost = distanceInMiles * 0.58; // IRS standard mileage rate

  // Calculate efficiency score (0-100)
  let efficiencyScore = 100;

  // Deduct points for long distances between stops
  if (averageDistanceBetweenStops > 5000) {
    efficiencyScore -= 10;
  } else if (averageDistanceBetweenStops > 3000) {
    efficiencyScore -= 5;
  }

  // Deduct points for low stops per hour
  if (stopsPerHour < 2) {
    efficiencyScore -= 15;
  } else if (stopsPerHour < 3) {
    efficiencyScore -= 10;
  } else if (stopsPerHour < 4) {
    efficiencyScore -= 5;
  }

  // Deduct points for excessive driving time
  if (durationInHours > 8) {
    efficiencyScore -= 10;
  }

  // Bonus points for excellent efficiency
  if (stopsPerHour >= 5 && averageDistanceBetweenStops < 2000) {
    efficiencyScore = Math.min(100, efficiencyScore + 10);
  }

  efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

  // Generate recommendations
  const recommendations: string[] = [];

  if (averageDistanceBetweenStops > 5000) {
    recommendations.push("Consider reordering stops to reduce travel distance");
  }

  if (stopsPerHour < 3) {
    recommendations.push("Increase stops per hour to improve efficiency");
  }

  if (durationInHours > 8) {
    recommendations.push("Consider splitting this route across multiple days");
  }

  if (averageTimePerStop > 1800) {
    // 30 minutes
    recommendations.push("Average time per stop is high - check for delays");
  }

  if (recommendations.length === 0) {
    recommendations.push("Route efficiency is excellent!");
  }

  return {
    totalDistance,
    totalDuration,
    stopsCount,
    averageTimePerStop,
    averageDistanceBetweenStops,
    efficiencyScore,
    stopsPerHour,
    estimatedCost,
    recommendations,
  };
}

/**
 * Get efficiency score color
 */
export function getEfficiencyScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get efficiency score background color
 */
export function getEfficiencyScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-yellow-100";
  if (score >= 40) return "bg-orange-100";
  return "bg-red-100";
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: RouteMetrics): {
  distance: string;
  duration: string;
  stopsPerHour: string;
  avgTimePerStop: string;
  cost: string;
} {
  const distanceInMiles = metrics.totalDistance / 1609.34;
  const hours = Math.floor(metrics.totalDuration / 3600);
  const minutes = Math.floor((metrics.totalDuration % 3600) / 60);
  const avgMinutes = Math.floor(metrics.averageTimePerStop / 60);

  return {
    distance: `${distanceInMiles.toFixed(1)} mi`,
    duration: `${hours}h ${minutes}m`,
    stopsPerHour: `${metrics.stopsPerHour.toFixed(1)} stops/hr`,
    avgTimePerStop: `${avgMinutes} min`,
    cost: `$${metrics.estimatedCost.toFixed(2)}`,
  };
}

/**
 * Compare two routes and return improvement suggestions
 */
export function compareRoutes(
  route1: RouteMetrics,
  route2: RouteMetrics
): {
  distanceImprovement: number;
  timeImprovement: number;
  efficiencyImprovement: number;
  recommendation: string;
} {
  const distanceImprovement = ((route1.totalDistance - route2.totalDistance) / route1.totalDistance) * 100;
  const timeImprovement = ((route1.totalDuration - route2.totalDuration) / route1.totalDuration) * 100;
  const efficiencyImprovement = route2.efficiencyScore - route1.efficiencyScore;

  let recommendation = "";
  if (distanceImprovement > 10) {
    recommendation = `Route 2 is ${distanceImprovement.toFixed(1)}% shorter`;
  } else if (timeImprovement > 10) {
    recommendation = `Route 2 is ${timeImprovement.toFixed(1)}% faster`;
  } else if (efficiencyImprovement > 10) {
    recommendation = `Route 2 has ${efficiencyImprovement.toFixed(0)} points higher efficiency`;
  } else {
    recommendation = "Routes are similarly efficient";
  }

  return {
    distanceImprovement,
    timeImprovement,
    efficiencyImprovement,
    recommendation,
  };
}

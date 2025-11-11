/**
 * Route Analytics Service
 * Provides historical route performance analytics and insights
 */

export interface RoutePerformance {
  routeId: number;
  routeName: string;
  date: Date;
  repId: number;
  repName: string;
  totalDistance: number; // km
  totalDuration: number; // minutes
  stopsCompleted: number;
  totalStops: number;
  efficiencyScore: number;
  averageTimePerStop: number; // minutes
  averageDistanceBetweenStops: number; // km
  stopsPerHour: number;
  mileageCost: number; // dollars
  customersVisited: number;
  ordersCreated: number;
  revenue: number; // dollars
}

export interface RepPerformanceMetrics {
  repId: number;
  repName: string;
  totalRoutes: number;
  averageEfficiencyScore: number;
  totalDistance: number;
  totalStops: number;
  averageStopsPerHour: number;
  totalMileageCost: number;
  totalRevenue: number;
  topPerformingDay: string;
  consistencyScore: number; // 0-100
  trend: "improving" | "stable" | "declining";
}

export interface RouteAnalyticsTrend {
  date: string;
  efficiencyScore: number;
  stopsPerHour: number;
  averageTimePerStop: number;
  routeCount: number;
}

export interface ComparisonMetrics {
  metric: string;
  current: number;
  previous: number;
  change: number; // percentage
  trend: "up" | "down" | "stable";
}

/**
 * Calculate rep performance metrics from historical data
 */
export function calculateRepPerformanceMetrics(
  routes: RoutePerformance[]
): RepPerformanceMetrics {
  if (routes.length === 0) {
    return {
      repId: 0,
      repName: "Unknown",
      totalRoutes: 0,
      averageEfficiencyScore: 0,
      totalDistance: 0,
      totalStops: 0,
      averageStopsPerHour: 0,
      totalMileageCost: 0,
      totalRevenue: 0,
      topPerformingDay: "",
      consistencyScore: 0,
      trend: "stable",
    };
  }

  const totalDistance = routes.reduce((sum, r) => sum + r.totalDistance, 0);
  const totalStops = routes.reduce((sum, r) => sum + r.stopsCompleted, 0);
  const averageEfficiencyScore =
    routes.reduce((sum, r) => sum + r.efficiencyScore, 0) / routes.length;
  const averageStopsPerHour =
    routes.reduce((sum, r) => sum + r.stopsPerHour, 0) / routes.length;
  const totalMileageCost = routes.reduce((sum, r) => sum + r.mileageCost, 0);
  const totalRevenue = routes.reduce((sum, r) => sum + r.revenue, 0);

  // Find top performing day
  const dayPerformance: Record<string, number[]> = {};
  routes.forEach(r => {
    const day = new Date(r.date).toLocaleDateString();
    if (!dayPerformance[day]) dayPerformance[day] = [];
    dayPerformance[day].push(r.efficiencyScore);
  });

  let topPerformingDay = "";
  let topScore = 0;
  Object.entries(dayPerformance).forEach(([day, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > topScore) {
      topScore = avg;
      topPerformingDay = day;
    }
  });

  // Calculate consistency score (lower variance = higher consistency)
  const variance =
    routes.reduce((sum, r) => sum + Math.pow(r.efficiencyScore - averageEfficiencyScore, 2), 0) /
    routes.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - stdDev * 2);

  // Determine trend
  const recentRoutes = routes.slice(-5);
  const recentAvg =
    recentRoutes.reduce((sum, r) => sum + r.efficiencyScore, 0) / recentRoutes.length;
  const olderRoutes = routes.slice(0, Math.max(1, routes.length - 5));
  const olderAvg =
    olderRoutes.reduce((sum, r) => sum + r.efficiencyScore, 0) / olderRoutes.length;

  let trend: "improving" | "stable" | "declining" = "stable";
  if (recentAvg > olderAvg + 5) trend = "improving";
  else if (recentAvg < olderAvg - 5) trend = "declining";

  return {
    repId: routes[0].repId,
    repName: routes[0].repName,
    totalRoutes: routes.length,
    averageEfficiencyScore,
    totalDistance,
    totalStops,
    averageStopsPerHour,
    totalMileageCost,
    totalRevenue,
    topPerformingDay,
    consistencyScore,
    trend,
  };
}

/**
 * Generate analytics trends over time
 */
export function generateAnalyticsTrends(
  routes: RoutePerformance[],
  groupBy: "day" | "week" | "month" = "day"
): RouteAnalyticsTrend[] {
  const grouped: Record<string, RoutePerformance[]> = {};

  routes.forEach(route => {
    const date = new Date(route.date);
    let key: string;

    if (groupBy === "day") {
      key = date.toLocaleDateString();
    } else if (groupBy === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toLocaleDateString();
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(route);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, routeGroup]) => ({
      date,
      efficiencyScore:
        routeGroup.reduce((sum, r) => sum + r.efficiencyScore, 0) / routeGroup.length,
      stopsPerHour: routeGroup.reduce((sum, r) => sum + r.stopsPerHour, 0) / routeGroup.length,
      averageTimePerStop:
        routeGroup.reduce((sum, r) => sum + r.averageTimePerStop, 0) / routeGroup.length,
      routeCount: routeGroup.length,
    }));
}

/**
 * Compare current period with previous period
 */
export function comparePerformancePeriods(
  currentRoutes: RoutePerformance[],
  previousRoutes: RoutePerformance[]
): ComparisonMetrics[] {
  const currentMetrics = calculateRepPerformanceMetrics(currentRoutes);
  const previousMetrics = calculateRepPerformanceMetrics(previousRoutes);

  const metrics: ComparisonMetrics[] = [
    {
      metric: "Efficiency Score",
      current: currentMetrics.averageEfficiencyScore,
      previous: previousMetrics.averageEfficiencyScore,
      change:
        ((currentMetrics.averageEfficiencyScore - previousMetrics.averageEfficiencyScore) /
          previousMetrics.averageEfficiencyScore) *
        100,
      trend:
        currentMetrics.averageEfficiencyScore > previousMetrics.averageEfficiencyScore
          ? "up"
          : "down",
    },
    {
      metric: "Stops Per Hour",
      current: currentMetrics.averageStopsPerHour,
      previous: previousMetrics.averageStopsPerHour,
      change:
        ((currentMetrics.averageStopsPerHour - previousMetrics.averageStopsPerHour) /
          previousMetrics.averageStopsPerHour) *
        100,
      trend:
        currentMetrics.averageStopsPerHour > previousMetrics.averageStopsPerHour
          ? "up"
          : "down",
    },
    {
      metric: "Total Revenue",
      current: currentMetrics.totalRevenue,
      previous: previousMetrics.totalRevenue,
      change:
        ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) /
          previousMetrics.totalRevenue) *
        100,
      trend: currentMetrics.totalRevenue > previousMetrics.totalRevenue ? "up" : "down",
    },
    {
      metric: "Consistency Score",
      current: currentMetrics.consistencyScore,
      previous: previousMetrics.consistencyScore,
      change:
        ((currentMetrics.consistencyScore - previousMetrics.consistencyScore) /
          previousMetrics.consistencyScore) *
        100,
      trend: currentMetrics.consistencyScore > previousMetrics.consistencyScore ? "up" : "down",
    },
  ];

  return metrics;
}

/**
 * Get top performing reps
 */
export function getTopPerformingReps(
  allRoutes: RoutePerformance[],
  limit: number = 5
): RepPerformanceMetrics[] {
  const repMap: Record<number, RoutePerformance[]> = {};

  allRoutes.forEach(route => {
    if (!repMap[route.repId]) repMap[route.repId] = [];
    repMap[route.repId].push(route);
  });

  return Object.values(repMap)
    .map(routes => calculateRepPerformanceMetrics(routes))
    .sort((a, b) => b.averageEfficiencyScore - a.averageEfficiencyScore)
    .slice(0, limit);
}

/**
 * Get routes that need improvement
 */
export function getRoutesNeedingImprovement(
  routes: RoutePerformance[],
  threshold: number = 60
): RoutePerformance[] {
  return routes
    .filter(r => r.efficiencyScore < threshold)
    .sort((a, b) => a.efficiencyScore - b.efficiencyScore);
}

/**
 * Calculate ROI from route optimization
 */
export function calculateOptimizationROI(
  before: RoutePerformance[],
  after: RoutePerformance[]
): {
  savingsPerRoute: number;
  savingsPercentage: number;
  totalSavings: number;
  paybackPeriodDays: number;
} {
  const beforeMetrics = calculateRepPerformanceMetrics(before);
  const afterMetrics = calculateRepPerformanceMetrics(after);

  const savingsPerRoute = beforeMetrics.totalMileageCost / before.length - 
                          afterMetrics.totalMileageCost / after.length;
  const savingsPercentage = (savingsPerRoute / (beforeMetrics.totalMileageCost / before.length)) * 100;
  const totalSavings = beforeMetrics.totalMileageCost - afterMetrics.totalMileageCost;

  // Assume implementation cost of $5000
  const implementationCost = 5000;
  const paybackPeriodDays = implementationCost / (totalSavings / 365);

  return {
    savingsPerRoute,
    savingsPercentage,
    totalSavings,
    paybackPeriodDays,
  };
}

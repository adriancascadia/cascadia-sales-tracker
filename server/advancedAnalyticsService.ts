/**
 * Advanced Analytics Service
 * Provides predictive analytics, rep performance rankings, and revenue forecasting
 */

import { getDb } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import { visits, orders, mileageLogs, gpsTracks } from "../drizzle/schema";

export interface RepPerformance {
  userId: number;
  name: string;
  email: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  visitsCompleted: number;
  conversionRate: number; // Orders / Visits
  efficiencyScore: number; // 0-100
  trend: "up" | "down" | "stable";
  ranking: number;
}

export interface RevenueForcast {
  date: string;
  predictedRevenue: number;
  confidence: number; // 0-100
  trend: "increasing" | "decreasing" | "stable";
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalVisits: number;
  conversionRate: number;
  topPerformers: RepPerformance[];
  revenueForecast: RevenueForcast[];
  growthRate: number; // Percentage
}

/**
 * Get rep performance rankings
 */
export async function getRepPerformanceRankings(
  companyId: number,
  days: number = 30
): Promise<RepPerformance[]> {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all visits and orders for the period
  const visitsData = await db
    .select()
    .from(visits)
    .where(and(eq(visits.companyId, companyId), gte(visits.createdAt, startDate)));

  const ordersData = await db
    .select()
    .from(orders)
    .where(and(eq(orders.companyId, companyId), gte(orders.createdAt, startDate)));

  // Group by rep and calculate metrics
  const repMetrics = new Map<
    number,
    {
      name: string;
      email: string;
      totalOrders: number;
      totalRevenue: number;
      visitsCompleted: number;
    }
  >();

  // Process visits
  visitsData.forEach((visit) => {
    if (!repMetrics.has(visit.userId)) {
      repMetrics.set(visit.userId, {
        name: "",
        email: "",
        totalOrders: 0,
        totalRevenue: 0,
        visitsCompleted: 0,
      });
    }
    const metrics = repMetrics.get(visit.userId)!;
    if (visit.checkOutTime) {
      metrics.visitsCompleted++;
    }
  });

  // Process orders
  ordersData.forEach((order) => {
    if (!repMetrics.has(order.userId)) {
      repMetrics.set(order.userId, {
        name: "",
        email: "",
        totalOrders: 0,
        totalRevenue: 0,
        visitsCompleted: 0,
      });
    }
    const metrics = repMetrics.get(order.userId)!
    metrics.totalOrders++;
    metrics.totalRevenue += (typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount || 0);
  });

  // Convert to array and calculate rankings
  const performances: RepPerformance[] = Array.from(repMetrics.entries())
    .map(([userId, metrics]) => {
      const conversionRate =
        metrics.visitsCompleted > 0 ? (metrics.totalOrders / metrics.visitsCompleted) * 100 : 0;
      const efficiencyScore = Math.min(100, (conversionRate * 1.5 + (metrics.totalOrders * 5)) / 2);

      return {
        userId,
        name: metrics.name,
        email: metrics.email,
        totalOrders: metrics.totalOrders,
        totalRevenue: metrics.totalRevenue,
        averageOrderValue: metrics.totalOrders > 0 ? metrics.totalRevenue / metrics.totalOrders : 0,
        visitsCompleted: metrics.visitsCompleted,
        conversionRate,
        efficiencyScore,
        trend: "stable" as const,
        ranking: 0,
      };
    })
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .map((perf, index) => ({ ...perf, ranking: index + 1 }));

  return performances;
}

/**
 * Get revenue forecast for next 30 days
 */
export async function getRevenueForecast(
  companyId: number,
  days: number = 30
): Promise<RevenueForcast[]> {
  const db = await getDb();
  if (!db) return [];

  // Get historical data for last 90 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const ordersData = await db
    .select()
    .from(orders)
    .where(and(eq(orders.companyId, companyId), gte(orders.createdAt, startDate)));

  // Calculate daily revenue
  const dailyRevenue = new Map<string, number>();
  ordersData.forEach((order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];
    const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : (order.totalAmount || 0);
    dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + amount);
  });

  // Calculate average daily revenue and trend
  const revenues = Array.from(dailyRevenue.values());
  const avgRevenue = revenues.length > 0 ? revenues.reduce((a, b) => a + (b || 0), 0) / revenues.length : 0;
  const recentAvg = revenues.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const trend = recentAvg > avgRevenue * 1.1 ? "increasing" : recentAvg < avgRevenue * 0.9 ? "decreasing" : "stable";

  // Generate forecast
  const forecast: RevenueForcast[] = [];
  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Simple linear forecast with trend adjustment
      const trendMultiplier = trend === "increasing" ? 1.05 : trend === "decreasing" ? 0.95 : 1;
    const predictedRevenue = (avgRevenue || 0) * trendMultiplier;
    const confidence = 75 - Math.abs(i - 15) * 2; // Confidence decreases over time

    forecast.push({
      date: dateStr,
      predictedRevenue: Math.round(predictedRevenue),
      confidence: Math.max(40, confidence),
      trend,
    });
  }

  return forecast;
}

/**
 * Get comprehensive analytics metrics
 */
export async function getAnalyticsMetrics(
  companyId: number,
  days: number = 30
): Promise<AnalyticsMetrics> {
  const db = await getDb();
  if (!db) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalVisits: 0,
      conversionRate: 0,
      topPerformers: [],
      revenueForecast: [],
      growthRate: 0,
    };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - days);

  // Get current period data
  const currentOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.companyId, companyId), gte(orders.createdAt, startDate)));

  const currentVisits = await db
    .select()
    .from(visits)
    .where(and(eq(visits.companyId, companyId), gte(visits.createdAt, startDate)));

  // Get previous period data for growth calculation
  const previousOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.companyId, companyId),
        gte(orders.createdAt, previousStartDate),
        lte(orders.createdAt, startDate)
      )
    );

    const totalRevenue = currentOrders.reduce((sum, order) => sum + (typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount || 0), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + (typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount || 0), 0);
  const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const topPerformers = await getRepPerformanceRankings(companyId, days);

  const revenueForecast = await getRevenueForecast(companyId, 30);

  return {
    totalRevenue,
    totalOrders: currentOrders.length,
    averageOrderValue: currentOrders.length > 0 ? totalRevenue / currentOrders.length : 0,
    totalVisits: currentVisits.length,
    conversionRate: currentVisits.length > 0 ? (currentOrders.length / currentVisits.length) * 100 : 0,
    topPerformers: topPerformers.slice(0, 5),
    revenueForecast,
    growthRate,
  };
}

/**
 * Get customer churn prediction
 */
export async function getPredictedChurnCustomers(companyId: number): Promise<Array<{ customerId: number; churnRisk: number }>> {
  // Simplified churn prediction: customers with no visits in last 30 days
  const db = await getDb();
  if (!db) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // This would need more complex logic in production
  // For now, return empty array
  return [];
}

/**
 * Predictive Analytics Service
 * Implements forecasting, trend analysis, and churn prediction algorithms
 */

export interface TimeSeriesData {
  date: Date;
  value: number;
}

export interface ForecastResult {
  date: Date;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  rSquared: number;
  seasonality: boolean;
}

export interface ChurnRiskAssessment {
  customerId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
}

/**
 * Simple Moving Average
 */
export function calculateMovingAverage(data: TimeSeriesData[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.value, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Exponential Moving Average (more weight to recent data)
 */
export function calculateExponentialMovingAverage(data: TimeSeriesData[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[0].value);
    } else if (i < period) {
      const sum = data.slice(0, i + 1).reduce((acc, d) => acc + d.value, 0);
      result.push(sum / (i + 1));
    } else {
      result.push(data[i].value * multiplier + result[i - 1] * (1 - multiplier));
    }
  }
  return result;
}

/**
 * Linear Regression for trend analysis
 */
export function linearRegression(data: TimeSeriesData[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = data.length;
  const xValues = data.map((_, i) => i);
  const yValues = data.map(d => d.value);

  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
  const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared
  const yPredicted = xValues.map(x => slope * x + intercept);
  const ssRes = yValues.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);

  return { slope, intercept, rSquared };
}

/**
 * Simple forecast using linear regression
 */
export function forecastLinear(data: TimeSeriesData[], periods: number): ForecastResult[] {
  const { slope, intercept, rSquared } = linearRegression(data);
  const results: ForecastResult[] = [];

  const lastDate = new Date(data[data.length - 1].date);
  const dayInMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate.getTime() + i * dayInMs);
    const xValue = data.length + i - 1;
    const predicted = slope * xValue + intercept;

    // Calculate confidence interval (simplified)
    const residuals = data.map((d, idx) => d.value - (slope * idx + intercept));
    const stdError = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (data.length - 2));
    const margin = 1.96 * stdError; // 95% confidence

    results.push({
      date: forecastDate,
      predicted: Math.max(0, predicted),
      lower: Math.max(0, predicted - margin),
      upper: predicted + margin,
      confidence: Math.min(95, rSquared * 100),
    });
  }

  return results;
}

/**
 * Exponential Smoothing forecast
 */
export function forecastExponentialSmoothing(
  data: TimeSeriesData[],
  periods: number,
  alpha: number = 0.3
): ForecastResult[] {
  const smoothed = calculateExponentialMovingAverage(data, 1);
  const results: ForecastResult[] = [];

  const lastDate = new Date(data[data.length - 1].date);
  const dayInMs = 24 * 60 * 60 * 1000;
  const lastValue = smoothed[smoothed.length - 1];

  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate.getTime() + i * dayInMs);
    // Exponential smoothing forecasts constant value
    const predicted = lastValue;
    const margin = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.value - lastValue, 2), 0) / data.length);

    results.push({
      date: forecastDate,
      predicted,
      lower: Math.max(0, predicted - margin),
      upper: predicted + margin,
      confidence: 70,
    });
  }

  return results;
}

/**
 * Detect seasonality in data
 */
export function detectSeasonality(data: TimeSeriesData[], minPeriod: number = 7): boolean {
  if (data.length < minPeriod * 2) return false;

  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  // Check for repeating patterns
  for (let period = minPeriod; period <= Math.floor(values.length / 3); period++) {
    let correlation = 0;
    let count = 0;

    for (let i = 0; i < values.length - period; i++) {
      const diff1 = values[i] - mean;
      const diff2 = values[i + period] - mean;
      correlation += diff1 * diff2;
      count++;
    }

    correlation /= count;
    if (correlation > 0.5) return true;
  }

  return false;
}

/**
 * Analyze trends in time series data
 */
export function analyzeTrends(data: TimeSeriesData[]): TrendAnalysis {
  const { slope, rSquared } = linearRegression(data);
  const hasSeasonality = detectSeasonality(data);

  let trend: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(slope) < 0.1) {
    trend = 'stable';
  } else if (slope > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }

  return {
    trend,
    slope,
    rSquared,
    seasonality: hasSeasonality,
  };
}

/**
 * Calculate customer churn risk
 */
export function assessChurnRisk(
  customerId: string,
  visitHistory: TimeSeriesData[],
  orderHistory: TimeSeriesData[],
  lastVisitDaysAgo: number,
  averageOrderValue: number,
  recentOrderTrend: number
): ChurnRiskAssessment {
  let riskScore = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Factor 1: Visit frequency decline
  if (visitHistory.length >= 2) {
    const recentVisits = visitHistory.slice(-4).length;
    const previousVisits = visitHistory.slice(-8, -4).length;
    if (recentVisits < previousVisits) {
      riskScore += 20;
      factors.push('Visit frequency declining');
      recommendations.push('Schedule proactive visit with customer');
    }
  }

  // Factor 2: Time since last visit
  if (lastVisitDaysAgo > 60) {
    riskScore += 25;
    factors.push(`No visit for ${lastVisitDaysAgo} days`);
    recommendations.push('Contact customer immediately');
  } else if (lastVisitDaysAgo > 30) {
    riskScore += 10;
    factors.push(`Last visit ${lastVisitDaysAgo} days ago`);
  }

  // Factor 3: Order value decline
  if (recentOrderTrend < -0.2) {
    riskScore += 20;
    factors.push('Order values declining');
    recommendations.push('Review pricing and product mix with customer');
  }

  // Factor 4: Order frequency
  if (orderHistory.length === 0) {
    riskScore += 15;
    factors.push('No orders placed');
    recommendations.push('Offer special promotion or product demo');
  } else if (orderHistory.length < 3) {
    riskScore += 10;
    factors.push('Low order frequency');
  }

  // Factor 5: Low average order value
  if (averageOrderValue < 100) {
    riskScore += 10;
    factors.push('Low average order value');
    recommendations.push('Cross-sell or upsell opportunities');
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore >= 80) {
    riskLevel = 'critical';
  } else if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    customerId,
    riskScore: Math.min(100, riskScore),
    riskLevel,
    factors,
    recommendations,
  };
}

/**
 * Calculate customer lifetime value (CLV)
 */
export function calculateCLV(
  totalSpent: number,
  orderCount: number,
  monthsActive: number,
  retentionRate: number = 0.8
): number {
  if (monthsActive === 0) return 0;

  const monthlyValue = totalSpent / monthsActive;
  const avgOrderValue = totalSpent / orderCount;
  const customerLifespan = 1 / (1 - retentionRate); // months

  return monthlyValue * customerLifespan;
}

/**
 * Identify high-value customers
 */
export function identifyHighValueCustomers(
  customers: Array<{
    id: string;
    totalSpent: number;
    orderCount: number;
    monthsActive: number;
  }>,
  percentile: number = 80
): string[] {
  const clvs = customers.map(c => calculateCLV(c.totalSpent, c.orderCount, c.monthsActive));
  const threshold = clvs.sort((a, b) => b - a)[Math.floor(customers.length * (1 - percentile / 100))];

  return customers
    .filter((_, i) => clvs[i] >= threshold)
    .map(c => c.id);
}

/**
 * Calculate anomaly score for unusual patterns
 */
export function detectAnomalies(data: TimeSeriesData[]): Array<{ index: number; score: number }> {
  if (data.length < 3) return [];

  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

  const anomalies: Array<{ index: number; score: number }> = [];

  for (let i = 0; i < values.length; i++) {
    const zScore = Math.abs((values[i] - mean) / stdDev);
    if (zScore > 2.5) {
      anomalies.push({
        index: i,
        score: Math.min(100, zScore * 20),
      });
    }
  }

  return anomalies;
}

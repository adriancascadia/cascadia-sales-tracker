import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  calculateRepPerformanceMetrics,
  generateAnalyticsTrends,
  getTopPerformingReps,
  getRoutesNeedingImprovement,
  RoutePerformance,
  RepPerformanceMetrics,
} from "@/lib/routeAnalyticsService";
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";

interface RouteAnalyticsDashboardProps {
  routes: RoutePerformance[];
  timeRange?: "week" | "month" | "quarter" | "year";
}

export default function RouteAnalyticsDashboard({
  routes,
  timeRange = "month",
}: RouteAnalyticsDashboardProps) {
  const metrics = calculateRepPerformanceMetrics(routes);
  const trends = generateAnalyticsTrends(routes, timeRange === "week" ? "day" : "week");
  const topReps = getTopPerformingReps(routes, 5);
  const needsImprovement = getRoutesNeedingImprovement(routes, 60);

  const getTrendIcon = (trend: string) => {
    return trend === "improving" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : trend === "declining" ? (
      <TrendingDown className="h-4 w-4 text-red-600" />
    ) : (
      <TrendingUp className="h-4 w-4 text-gray-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Avg Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.averageEfficiencyScore.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Stops/Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.averageStopsPerHour.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">average productivity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalRoutes}</p>
            <p className="text-xs text-muted-foreground mt-1">in this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.consistencyScore.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">performance stability</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTrendIcon(metrics.trend)}
            Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{trend.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {trend.routeCount} routes • {trend.stopsPerHour.toFixed(1)} stops/hr
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{trend.efficiencyScore.toFixed(0)}</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        trend.efficiencyScore >= 80
                          ? "bg-green-600"
                          : trend.efficiencyScore >= 60
                            ? "bg-yellow-600"
                            : "bg-red-600"
                      }`}
                      style={{ width: `${trend.efficiencyScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Reps */}
      {topReps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              Top Performing Reps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReps.map((rep, idx) => (
                <div key={rep.repId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">#{idx + 1}</Badge>
                      <p className="font-medium">{rep.repName}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rep.totalRoutes} routes • ${rep.totalRevenue.toFixed(0)} revenue
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {rep.averageEfficiencyScore.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">efficiency</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routes Needing Improvement */}
      {needsImprovement.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Routes Needing Improvement ({needsImprovement.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsImprovement.slice(0, 5).map(route => (
                <Alert key={route.routeId} className="border-orange-200 bg-orange-50">
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{route.routeName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rep: {route.repName} • Efficiency: {route.efficiencyScore.toFixed(0)}/100
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        {route.efficiencyScore.toFixed(0)}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">{(metrics.totalDistance / 1000).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Stops</p>
            <p className="text-2xl font-bold">{metrics.totalStops}</p>
            <p className="text-xs text-muted-foreground">completed</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mileage Cost</p>
            <p className="text-2xl font-bold">${metrics.totalMileageCost.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">reimbursement</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${metrics.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">generated</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

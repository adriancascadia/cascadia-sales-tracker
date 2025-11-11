import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  calculateRouteMetrics,
  formatMetrics,
  getEfficiencyScoreColor,
  getEfficiencyScoreBgColor,
  RouteMetrics,
} from "@/lib/routeEfficiencyService";
import { TrendingUp, AlertTriangle, CheckCircle, Zap } from "lucide-react";

interface RouteEfficiencyPanelProps {
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  stopsCount: number;
  actualTimeSpentAtStops?: number; // in seconds
}

export default function RouteEfficiencyPanel({
  totalDistance,
  totalDuration,
  stopsCount,
  actualTimeSpentAtStops = 0,
}: RouteEfficiencyPanelProps) {
  const metrics = calculateRouteMetrics(
    totalDistance,
    totalDuration,
    stopsCount,
    actualTimeSpentAtStops
  );

  const formatted = formatMetrics(metrics);
  const scoreColor = getEfficiencyScoreColor(metrics.efficiencyScore);
  const scoreBgColor = getEfficiencyScoreBgColor(metrics.efficiencyScore);

  return (
    <div className="space-y-4">
      {/* Main Efficiency Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Route Efficiency
            </span>
            <div className={`text-3xl font-bold ${scoreColor}`}>
              {metrics.efficiencyScore}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`rounded-lg p-4 ${scoreBgColor}`}>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metrics.efficiencyScore >= 80
                    ? "bg-green-600"
                    : metrics.efficiencyScore >= 60
                      ? "bg-yellow-600"
                      : metrics.efficiencyScore >= 40
                        ? "bg-orange-600"
                        : "bg-red-600"
                }`}
                style={{ width: `${metrics.efficiencyScore}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {metrics.efficiencyScore >= 80
                ? "Excellent route efficiency"
                : metrics.efficiencyScore >= 60
                  ? "Good route efficiency"
                  : metrics.efficiencyScore >= 40
                    ? "Fair route efficiency - improvements needed"
                    : "Poor route efficiency - significant improvements needed"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatted.distance}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatted.duration}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stops Per Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatted.stopsPerHour}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatted.cost}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Average Time Per Stop
            </span>
            <span className="font-medium">{formatted.avgTimePerStop}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Average Distance Between Stops
            </span>
            <span className="font-medium">
              {(metrics.averageDistanceBetweenStops / 1609.34).toFixed(1)} mi
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Stops</span>
            <span className="font-medium">{metrics.stopsCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {metrics.recommendations.length > 0 && (
        <div className="space-y-2">
          {metrics.recommendations.map((rec, idx) => (
            <Alert
              key={idx}
              className={
                rec.includes("excellent")
                  ? "border-green-200 bg-green-50"
                  : "border-yellow-200 bg-yellow-50"
              }
            >
              <div className="flex items-start gap-2">
                {rec.includes("excellent") ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                )}
                <AlertDescription className="text-sm">{rec}</AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

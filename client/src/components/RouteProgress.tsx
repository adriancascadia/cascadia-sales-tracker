import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle, Circle } from "lucide-react";

interface RouteStop {
  id: number;
  customerId: number;
  stopOrder: number;
  customer?: {
    id: number;
    name: string;
    address?: string | null;
    city?: string | null;
  } | null;
}

interface RouteProgressProps {
  stops: RouteStop[];
  completedStops: number;
  currentStopId?: number;
  totalDistance?: number;
  estimatedTimeRemaining?: number;
}

export default function RouteProgress({
  stops,
  completedStops,
  currentStopId,
  totalDistance,
  estimatedTimeRemaining,
}: RouteProgressProps) {
  const progressPercentage = (completedStops / stops.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Route Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {completedStops} of {stops.length} stops completed
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {totalDistance && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Distance</p>
                  <p className="font-semibold">{totalDistance.toFixed(1)} km</p>
                </div>
              </div>
            )}
            {estimatedTimeRemaining && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Est. Time Left</p>
                  <p className="font-semibold">{estimatedTimeRemaining} min</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Route Stops Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Route Stops</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stops.map((stop, index) => {
              const isCompleted = index < completedStops;
              const isCurrent = stop.id === currentStopId;

              return (
                <div key={stop.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${isCompleted
                          ? "bg-green-100 text-green-600"
                          : isCurrent
                            ? "bg-blue-100 text-blue-600 animate-pulse"
                            : "bg-gray-100 text-gray-400"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    {index < stops.length - 1 && (
                      <div
                        className={`w-0.5 h-12 mt-2 ${isCompleted ? "bg-green-200" : "bg-gray-200"
                          }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Stop {stop.stopOrder}: {stop.customer?.name || "Unknown"}
                        </p>
                        {stop.customer?.address && (
                          <p className="text-sm text-muted-foreground">
                            {stop.customer.address}
                            {stop.customer.city && `, ${stop.customer.city}`}
                          </p>
                        )}
                      </div>
                      {isCurrent && (
                        <Badge variant="default" className="animate-pulse">
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="outline" className="text-green-600">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

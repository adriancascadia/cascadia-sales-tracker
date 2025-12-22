import { useEffect, useState } from "react";
import RouteMapView from "@/components/RouteMapView";
import RouteEfficiencyPanel from "@/components/RouteEfficiencyPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGeofenceAlerts } from "@/_core/hooks/useGeofenceAlerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, AlertCircle, RefreshCw, Bell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepLocation {
  userId: number;
  userName?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
  status: "active" | "idle" | "offline";
}

interface RouteStop {
  id: number;
  customerId: number;
  stopOrder: number;
  customer?: {
    id: number;
    name: string;
    latitude?: string | null;
    longitude?: string | null;
  } | null;
}

interface RouteMapTrackingProps {
  routeId: number;
  stops: RouteStop[];
  repLocations: RepLocation[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onSaveOptimizedOrder?: (orderedStopIds: number[]) => Promise<void>;
}

export default function RouteMapTracking({
  routeId,
  stops,
  repLocations,
  isLoading = false,
  onRefresh,
  onSaveOptimizedOrder,
}: RouteMapTrackingProps) {
  const [selectedRep, setSelectedRep] = useState<RepLocation | null>(
    repLocations[0] || null
  );
  const [showAlerts, setShowAlerts] = useState(true);

  // Build route path from stops
  const routePath = stops
    .filter(s => s.customer?.latitude && s.customer?.longitude)
    .map(s => ({
      lat: parseFloat(s.customer!.latitude!),
      lng: parseFloat(s.customer!.longitude!),
    }));

  // Get geofence alerts
  const { alerts, unreadCount, dismissAlert } = useGeofenceAlerts(
    stops,
    repLocations,
    routePath
  );

  useEffect(() => {
    if (repLocations.length > 0 && !selectedRep) {
      setSelectedRep(repLocations[0]);
    }
  }, [repLocations, selectedRep]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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
  };

  const findNearestStop = (rep: RepLocation) => {
    if (!stops.length) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const stop of stops) {
      if (!stop.customer?.latitude || !stop.customer?.longitude) continue;

      const distance = calculateDistance(
        rep.latitude,
        rep.longitude,
        parseFloat(stop.customer.latitude),
        parseFloat(stop.customer.longitude)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { stop, distance };
      }
    }

    return nearest;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "idle":
        return "bg-yellow-100 text-yellow-700";
      case "offline":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Calculate route metrics
  const totalDistance = routePath.length > 1
    ? routePath.reduce((sum, point, idx) => {
      if (idx === 0) return 0;
      const prev = routePath[idx - 1];
      const dLat = ((point.lat - prev.lat) * Math.PI) / 180;
      const dLng = ((point.lng - prev.lng) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prev.lat * Math.PI) / 180) *
        Math.cos((point.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return sum + 6371 * c;
    }, 0)
    : 0;

  // Estimate total duration (1 hour per 50km + 15 min per stop)
  const estimatedDuration = (totalDistance / 50) * 3600 + stops.length * 900;

  return (
    <div className="space-y-6">
      {/* Geofence Alerts */}
      {showAlerts && alerts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              Route Alerts ({unreadCount} new)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAlerts(false)}
            >
              Dismiss
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <Alert
                key={alert.id}
                className={`${alert.severity === "critical"
                  ? "border-red-200 bg-red-50"
                  : alert.severity === "warning"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-green-200 bg-green-50"
                  }`}
              >
                <AlertDescription className="text-sm">
                  <div className="flex justify-between items-start">
                    <span>{alert.event.message}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      ×
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Route Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Route Efficiency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RouteEfficiencyPanel
            totalDistance={totalDistance * 1000}
            totalDuration={estimatedDuration}
            stopsCount={stops.length}
          />
        </CardContent>
      </Card>

      {/* Google Maps Integration */}
      <RouteMapView
        routeId={routeId}
        stops={stops}
        repLocations={repLocations}
        routeName="Live Route Tracking"
        isLoading={isLoading}
        onSaveOptimizedOrder={onSaveOptimizedOrder}
      />

      {/* Rep Locations List and Details */}
      <Card>
        <CardHeader>
          <CardTitle>Active Representatives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {repLocations.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p>No active representatives on this route</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repLocations.map((rep) => {
                const nearest = findNearestStop(rep);
                const isSelected = selectedRep?.userId === rep.userId;

                return (
                  <div
                    key={rep.userId}
                    onClick={() => setSelectedRep(rep)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold">{rep.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {rep.latitude.toFixed(4)}, {rep.longitude.toFixed(4)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(rep.status)}>
                        {rep.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      {rep.speed && (
                        <div>
                          <p className="text-muted-foreground">Speed</p>
                          <p className="font-medium">{rep.speed} km/h</p>
                        </div>
                      )}
                      {rep.accuracy && (
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <p className="font-medium">±{rep.accuracy}m</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Last Update</p>
                        <p className="font-medium">{formatTime(rep.timestamp)}</p>
                      </div>
                    </div>

                    {nearest && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-blue-600" />
                          <p className="text-sm">
                            <span className="font-medium">
                              {nearest.distance.toFixed(2)} km
                            </span>
                            {" from "}
                            <span className="font-medium">
                              Stop {nearest.stop.stopOrder}: {nearest.stop.customer?.name}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Rep Details */}
      {selectedRep && (
        <Card>
          <CardHeader>
            <CardTitle>Rep Details - {selectedRep.userName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge className={getStatusColor(selectedRep.status)}>
                  {selectedRep.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="font-medium">{formatTime(selectedRep.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-medium">{selectedRep.latitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-medium">{selectedRep.longitude.toFixed(6)}</p>
              </div>
              {selectedRep.speed && (
                <div>
                  <p className="text-sm text-muted-foreground">Speed</p>
                  <p className="font-medium">{selectedRep.speed} km/h</p>
                </div>
              )}
              {selectedRep.heading && (
                <div>
                  <p className="text-sm text-muted-foreground">Heading</p>
                  <p className="font-medium">{selectedRep.heading}°</p>
                </div>
              )}
              {selectedRep.accuracy && (
                <div>
                  <p className="text-sm text-muted-foreground">GPS Accuracy</p>
                  <p className="font-medium">±{selectedRep.accuracy} meters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

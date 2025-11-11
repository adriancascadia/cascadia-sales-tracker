import { useEffect, useRef, useState } from "react";
import { MapView } from "./Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Navigation, MapPin, Users } from "lucide-react";

interface RouteStop {
  id: number;
  customerId: number;
  stopOrder: number;
  customer?: {
    id: number;
    name: string;
    latitude?: string;
    longitude?: string;
  };
}

interface RepLocation {
  userId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
  status: "active" | "idle" | "offline";
  userName?: string;
}

interface RouteMapViewProps {
  stops: RouteStop[];
  repLocations: RepLocation[];
  routeName?: string;
  isLoading?: boolean;
}

export default function RouteMapView({
  stops,
  repLocations,
  routeName = "Route",
  isLoading = false,
}: RouteMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Calculate center of all locations
  const calculateCenter = (): google.maps.LatLngLiteral => {
    const allLocations = [
      ...stops
        .filter(s => s.customer?.latitude && s.customer?.longitude)
        .map(s => ({
          lat: parseFloat(s.customer!.latitude!),
          lng: parseFloat(s.customer!.longitude!),
        })),
      ...repLocations.map(r => ({
        lat: r.latitude,
        lng: r.longitude,
      })),
    ];

    if (allLocations.length === 0) {
      return { lat: 40.7128, lng: -74.006 }; // Default to NYC
    }

    const avgLat = allLocations.reduce((sum, loc) => sum + loc.lat, 0) / allLocations.length;
    const avgLng = allLocations.reduce((sum, loc) => sum + loc.lng, 0) / allLocations.length;

    return { lat: avgLat, lng: avgLng };
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  };

  // Draw route polyline
  useEffect(() => {
    if (!mapRef.current || !mapReady || stops.length === 0) return;

    const routeCoordinates = stops
      .filter(s => s.customer?.latitude && s.customer?.longitude)
      .map(s => ({
        lat: parseFloat(s.customer!.latitude!),
        lng: parseFloat(s.customer!.longitude!),
      }));

    if (routeCoordinates.length < 2) return;

    // Remove old polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create new polyline
    polylineRef.current = new window.google!.maps.Polyline({
      path: routeCoordinates,
      geodesic: true,
      strokeColor: "#4F46E5",
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map: mapRef.current,
    });

    // Fit bounds to route
    const bounds = new window.google!.maps.LatLngBounds();
    routeCoordinates.forEach(coord => bounds.extend(coord));
    mapRef.current.fitBounds(bounds);
  }, [mapReady, stops]);

  // Add customer stop markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Add customer stop markers
    stops.forEach((stop, index) => {
      if (!stop.customer?.latitude || !stop.customer?.longitude) return;

      const position = {
        lat: parseFloat(stop.customer.latitude),
        lng: parseFloat(stop.customer.longitude),
      };

      const marker = new window.google!.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        title: `Stop ${stop.stopOrder}: ${stop.customer.name}`,
        content: createCustomerMarkerContent(stop.stopOrder, stop.customer.name),
      });

      marker.addListener("click", () => {
        setSelectedMarker(`stop-${stop.id}`);
      });

      markersRef.current.push(marker);
    });
  }, [mapReady, stops]);

  // Add rep location markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    repLocations.forEach(rep => {
      const position = {
        lat: rep.latitude,
        lng: rep.longitude,
      };

      const marker = new window.google!.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        title: `Rep: ${rep.userName || `User ${rep.userId}`}`,
        content: createRepMarkerContent(rep.status),
      });

      marker.addListener("click", () => {
        setSelectedMarker(`rep-${rep.userId}`);
      });

      markersRef.current.push(marker);
    });
  }, [mapReady, repLocations]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {routeName} - Live Map
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{stops.length} stops</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {repLocations.length} reps
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            <MapView
              initialCenter={calculateCenter()}
              initialZoom={13}
              onMapReady={handleMapReady}
              className="h-96"
            />
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600">
                1
              </div>
              <span className="text-sm">Customer Stops</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full border-2 border-green-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <span className="text-sm">Active Rep</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              </div>
              <span className="text-sm">Idle Rep</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded-full border-2 border-red-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
              <span className="text-sm">Offline Rep</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="h-0.5 w-8 bg-blue-500" />
            <span className="text-sm">Planned Route</span>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      {selectedMarker && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Location</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMarker.startsWith("stop-") ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {stops.find(s => `stop-${s.id}` === selectedMarker)?.customer?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stops.find(s => `stop-${s.id}` === selectedMarker)?.customer?.address}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">
                  {repLocations.find(r => `rep-${r.userId}` === selectedMarker)?.userName ||
                    `Rep ${repLocations.find(r => `rep-${r.userId}` === selectedMarker)?.userId}`}
                </p>
                <Badge
                  variant="outline"
                  className={
                    repLocations.find(r => `rep-${r.userId}` === selectedMarker)?.status ===
                    "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {repLocations.find(r => `rep-${r.userId}` === selectedMarker)?.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4 animate-spin" />
          <p className="text-sm">Loading map data...</p>
        </div>
      )}
    </div>
  );
}

// Helper function to create custom marker content for customers
function createCustomerMarkerContent(stopOrder: number, customerName: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded border-2 border-blue-500 text-xs font-bold text-blue-600 cursor-pointer hover:scale-110 transition-transform">
      ${stopOrder}
    </div>
  `;
  return div;
}

// Helper function to create custom marker content for reps
function createRepMarkerContent(status: string): HTMLElement {
  const div = document.createElement("div");
  const bgColor = status === "active" ? "bg-green-100" : status === "idle" ? "bg-yellow-100" : "bg-red-100";
  const borderColor = status === "active" ? "border-green-500" : status === "idle" ? "border-yellow-500" : "border-red-500";
  const dotColor = status === "active" ? "bg-green-500" : status === "idle" ? "bg-yellow-500" : "bg-red-500";

  div.innerHTML = `
    <div class="flex items-center justify-center w-8 h-8 ${bgColor} rounded-full border-2 ${borderColor} cursor-pointer hover:scale-110 transition-transform">
      <div class="w-2 h-2 ${dotColor} rounded-full"></div>
    </div>
  `;
  return div;
}

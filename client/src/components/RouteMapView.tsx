import { useEffect, useRef, useState, useMemo } from "react";
import { MapView } from "./Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Navigation, MapPin, Users, Zap, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface RouteStop {
  id: number;
  customerId: number;
  stopOrder: number;
  customer?: {
    id: number;
    name: string;
    latitude?: string | null;
    longitude?: string | null;
    address?: string | null;
  } | null;
}

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

interface RouteMapViewProps {
  routeId?: number;
  stops: RouteStop[];
  repLocations: RepLocation[];
  routeName?: string;
  isLoading?: boolean;
  onSaveOptimizedOrder?: (orderedStopIds: number[]) => Promise<void>;
}

export default function RouteMapView({
  routeId,
  stops,
  repLocations,
  routeName = "Route",
  isLoading = false,
  onSaveOptimizedOrder,
}: RouteMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedOrder, setOptimizedOrder] = useState<number[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter stops that have valid coordinates
  const validStops = useMemo(() =>
    stops.filter(s => s.customer?.latitude && s.customer?.longitude),
    [stops]);

  // Calculate center of all locations
  const calculateCenter = (): google.maps.LatLngLiteral => {
    const allLocations = [
      ...validStops.map(s => ({
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

  // Initialize DirectionsRenderer and TrafficLayer
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4F46E5",
          strokeOpacity: 0.8,
          strokeWeight: 5,
        }
      });
    }

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }

    trafficLayerRef.current.setMap(showTraffic ? mapRef.current : null);
  }, [mapReady, showTraffic]);

  // Handle Route Calculation
  const calculateRoute = async (optimize: boolean = false) => {
    if (!mapRef.current || !window.google || validStops.length < 2) return;

    if (optimize) setIsOptimizing(true);

    const directionsService = new window.google.maps.DirectionsService();

    // Sort stops by current order or use optimize flag
    const currentStops = [...validStops].sort((a, b) => a.stopOrder - b.stopOrder);

    const origin = {
      lat: parseFloat(currentStops[0].customer!.latitude!),
      lng: parseFloat(currentStops[0].customer!.longitude!),
    };
    const destination = {
      lat: parseFloat(currentStops[currentStops.length - 1].customer!.latitude!),
      lng: parseFloat(currentStops[currentStops.length - 1].customer!.longitude!),
    };
    const waypoints = currentStops.slice(1, -1).map(stop => ({
      location: {
        lat: parseFloat(stop.customer!.latitude!),
        lng: parseFloat(stop.customer!.longitude!),
      },
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: optimize,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);

          if (optimize && result.routes[0].waypoint_order) {
            // Map optimized order back to stop IDs
            // waypoint_order is the order of the waypoints array we passed
            const innerOptimize = result.routes[0].waypoint_order;
            const newOrder = [currentStops[0].id]; // Start

            innerOptimize.forEach(idx => {
              newOrder.push(currentStops[idx + 1].id);
            });

            newOrder.push(currentStops[currentStops.length - 1].id); // End
            setOptimizedOrder(newOrder);
            toast.success("Route optimized! Review the new path on the map.");
          }
        } else {
          console.error("Directions request failed:", status);
          toast.error("Failed to calculate driving route");
        }
        setIsOptimizing(false);
      }
    );
  };

  // Initial route calculation
  useEffect(() => {
    if (mapReady && validStops.length >= 2) {
      calculateRoute(false);
    }
  }, [mapReady, validStops.length]);

  // Markers handling
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];

    // Customer markers
    stops.forEach((stop) => {
      if (!stop.customer?.latitude || !stop.customer?.longitude) return;

      const position = {
        lat: parseFloat(stop.customer.latitude),
        lng: parseFloat(stop.customer.longitude),
      };

      const isOptimized = optimizedOrder?.includes(stop.id);
      const displayOrder = optimizedOrder
        ? optimizedOrder.indexOf(stop.id) + 1
        : stop.stopOrder;

      const marker = new window.google!.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        title: `Stop ${displayOrder}: ${stop.customer.name}`,
        content: createCustomerMarkerContent(displayOrder, stop.customer.name, optimizedOrder !== null),
      });

      marker.addListener("click", () => setSelectedMarker(`stop-${stop.id}`));
      markersRef.current.push(marker);
    });

    // Rep markers
    repLocations.forEach((rep) => {
      const marker = new window.google!.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: rep.latitude, lng: rep.longitude },
        title: rep.userName || `Rep ${rep.userId}`,
        content: createRepMarkerContent(rep.status),
      });

      marker.addListener("click", () => setSelectedMarker(`rep-${rep.userId}`));
      markersRef.current.push(marker);
    });
  }, [mapReady, stops, repLocations, optimizedOrder]);

  const handleSaveOptimization = async () => {
    if (!optimizedOrder || !onSaveOptimizedOrder) return;
    setIsSaving(true);
    try {
      await onSaveOptimizedOrder(optimizedOrder);
      setOptimizedOrder(null);
      toast.success("Optimized order saved successfully");
    } catch (error) {
      toast.error("Failed to save optimized order");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {routeName}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showTraffic ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTraffic(!showTraffic)}
                className="text-xs"
              >
                Traffic {showTraffic ? "ON" : "OFF"}
              </Button>

              {!optimizedOrder ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => calculateRoute(true)}
                  disabled={isOptimizing || validStops.length < 3}
                  className="text-xs gap-1"
                >
                  <Zap className={`h-3 w-3 ${isOptimizing ? "animate-pulse" : ""}`} />
                  {isOptimizing ? "Optimizing..." : "Suggest Best Route"}
                </Button>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveOptimization}
                    disabled={isSaving}
                    className="text-xs gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-3 w-3" />
                    {isSaving ? "Saving..." : "Apply New Order"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOptimizedOrder(null);
                      calculateRoute(false);
                    }}
                    className="text-xs gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            <MapView
              initialCenter={calculateCenter()}
              initialZoom={13}
              onMapReady={handleMapReady}
              className="h-[400px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Map Legend & Selection Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-0 pb-4 px-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded border border-blue-500 flex items-center justify-center text-[10px] font-bold text-blue-600">
                  1
                </div>
                <span className="text-xs">Stops</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full border border-green-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                </div>
                <span className="text-xs">Active Rep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-yellow-100 rounded-full border border-yellow-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                </div>
                <span className="text-xs">Idle Rep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-100 rounded-full border border-red-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                </div>
                <span className="text-xs">Offline</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <div className="h-1 w-8 bg-indigo-600 rounded" />
              <span className="text-xs">Driving Route</span>
            </div>
          </CardContent>
        </Card>

        {selectedMarker && (
          <Card className="border-primary/50">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs uppercase tracking-wider text-primary font-semibold">Selected Info</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-4 px-4">
              {selectedMarker.startsWith("stop-") ? (
                <>
                  <p className="font-semibold text-sm">
                    {stops.find(s => `stop-${s.id}` === selectedMarker)?.customer?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stops.find(s => `stop-${s.id}` === selectedMarker)?.customer?.address}
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">
                    {repLocations.find(r => `rep-${r.userId}` === selectedMarker)?.userName || "Representative"}
                  </p>
                  <Badge variant="outline" className="text-[10px] h-5 uppercase">
                    {repLocations.find(r => `rep-${r.userId}` === selectedMarker)?.status}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function createCustomerMarkerContent(order: number, name: string, isPreview: boolean): HTMLElement {
  const div = document.createElement("div");
  div.className = "flex flex-col items-center group";
  div.innerHTML = `
    <div class="flex items-center justify-center w-8 h-8 ${isPreview ? 'bg-green-100 border-green-600 text-green-700' : 'bg-blue-100 border-blue-600 text-blue-700'} rounded border-2 text-xs font-bold shadow-md transform transition-all group-hover:scale-110 cursor-pointer">
      ${order}
    </div>
    <div class="hidden group-hover:block absolute top-[100%] mt-1 bg-white border border-gray-200 px-2 py-1 rounded text-[10px] whitespace-nowrap z-10 shadow-lg font-medium">
      ${name}
    </div>
  `;
  return div;
}

function createRepMarkerContent(status: string): HTMLElement {
  const div = document.createElement("div");
  const bgColor = status === "active" ? "bg-green-100" : status === "idle" ? "bg-yellow-100" : "bg-red-100";
  const borderColor = status === "active" ? "border-green-500" : status === "idle" ? "border-yellow-500" : "border-red-500";
  const dotColor = status === "active" ? "bg-green-500" : status === "idle" ? "bg-yellow-500" : "bg-red-500";

  div.innerHTML = `
    <div class="flex items-center justify-center w-8 h-8 ${bgColor} rounded-full border-2 ${borderColor} shadow-sm cursor-pointer transform transition-all hover:scale-110">
      <div class="w-2 h-2 ${dotColor} rounded-full animate-pulse"></div>
    </div>
  `;
  return div;
}

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { MapPin, Navigation, RefreshCw, X, CheckCircle2, Circle, Target } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function LiveTracking() {
  const { data: activeGpsTracks, refetch } = trpc.gps.getAllActive.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const { data: allUsers } = trpc.analytics.getAllUsers.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: allVisits } = trpc.visitData.list.useQuery();
  const { data: activeVisits } = trpc.visitData.getAllActive.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const routeMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  const { data: selectedRoute } = trpc.routes.getTodayByUser.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  const { data: routeStops } = trpc.routes.getStops.useQuery(
    { routeId: selectedRoute?.id! },
    { enabled: !!selectedRoute?.id }
  );

  // Combine real GPS tracks with "virtual" tracks from active visits
  // This ensures users appear on the map even if they haven't moved (GPS stale) but are checked in
  const derivedActiveTracks = useMemo(() => {
    const tracks = activeGpsTracks || [];
    const visits = activeVisits || [];

    // Start with all real GPS tracks
    const allTracks = tracks.map(track => {
      // Find if user has an active visit
      const activeVisit = visits.find(v => v.userId === track.userId);
      const customer = activeVisit ? customers?.find(c => c.id === activeVisit.customerId) : null;

      return {
        ...track,
        activeCustomerName: customer?.name || null
      };
    });

    const userIdsWithTrack = new Set(tracks.map(t => t.userId));

    // Add virtual tracks for users with active visits who don't have a recent GPS track
    visits.forEach(visit => {
      if (!userIdsWithTrack.has(visit.userId) && visit.checkInLatitude && visit.checkInLongitude) {
        const customer = customers?.find(c => c.id === visit.customerId);
        allTracks.push({
          id: -visit.id, // Negative ID to distinguish virtual track
          userId: visit.userId,
          companyId: visit.companyId,
          latitude: visit.checkInLatitude,
          longitude: visit.checkInLongitude,
          timestamp: new Date(visit.checkInTime), // Use check-in time as "last update"
          accuracy: 0,
          speed: "0",
          heading: "0",
          isVirtual: true, // Marker flag
          activeCustomerName: customer?.name || null
        } as any);
      }
    });

    return allTracks;
  }, [activeGpsTracks, activeVisits, customers]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate distance between two GPS coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Determine stop status based on visits and GPS proximity
  const getStopStatus = (stop: any, customer: any, userGpsTrack: any) => {
    // Check if there's a completed visit for this customer today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const visit = allVisits?.find(v =>
      v.customerId === customer.id &&
      v.userId === selectedUserId &&
      new Date(v.checkInTime) >= todayStart &&
      v.checkOutTime !== null
    );

    if (visit) {
      return 'completed';
    }

    // Check if user is currently near this location (within 100 meters)
    if (userGpsTrack && customer.latitude && customer.longitude) {
      const distance = calculateDistance(
        parseFloat(userGpsTrack.latitude),
        parseFloat(userGpsTrack.longitude),
        parseFloat(customer.latitude),
        parseFloat(customer.longitude)
      );

      if (distance < 100) {
        return 'active';
      }
    }

    return 'pending';
  };

  // Update main GPS markers
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    derivedActiveTracks.forEach((track) => {
      const user = allUsers?.find(u => u.id === track.userId);
      const position = {
        lat: parseFloat(track.latitude),
        lng: parseFloat(track.longitude),
      };

      const markerContent = document.createElement('div');
      markerContent.className = 'flex flex-col items-center cursor-pointer';

      markerContent.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg mb-1 whitespace-nowrap">
            ${(track as any).activeCustomerName}
          </div>
          <div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div>
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        content: markerContent,
        title: user?.name || `User ${track.userId}`,
      });

      marker.addListener('click', () => {
        setSelectedUserId(track.userId);
      });

      markersRef.current.push(marker);
    });

    if (derivedActiveTracks.length > 0 && !selectedUserId) {
      const bounds = new google.maps.LatLngBounds();
      derivedActiveTracks.forEach(track => {
        bounds.extend({
          lat: parseFloat(track.latitude),
          lng: parseFloat(track.longitude),
        });
      });
      mapRef.current.fitBounds(bounds);

      if (derivedActiveTracks.length === 1) {
        mapRef.current.setZoom(15);
      }
    }
  }, [derivedActiveTracks, allUsers, selectedUserId]);

  // Display route with progress tracking
  useEffect(() => {
    if (!mapRef.current || !window.google || !selectedRoute || !routeStops || !customers) return;

    // Clear previous route visualization
    routeMarkersRef.current.forEach(marker => marker.map = null);
    routeMarkersRef.current = [];
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
    }
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
    if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(null);
    }

    const routePositions: google.maps.LatLng[] = [];
    const bounds = new google.maps.LatLngBounds();
    const userGpsTrack = derivedActiveTracks?.find(t => t.userId === selectedUserId);

    // Initialize traffic layer if not already done
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }
    trafficLayerRef.current.setMap(mapRef.current);

    // Create markers for each stop with status-based styling
    routeStops.forEach((stop, index) => {
      const customer = customers.find(c => c.id === stop.customerId);
      if (!customer || !customer.latitude || !customer.longitude) return;

      const position = {
        lat: parseFloat(customer.latitude),
        lng: parseFloat(customer.longitude),
      };

      routePositions.push(new google.maps.LatLng(position.lat, position.lng));
      bounds.extend(position);

      const status = getStopStatus(stop, customer, userGpsTrack);

      const stopMarkerContent = document.createElement('div');
      stopMarkerContent.className = 'flex flex-col items-center';

      let markerHtml = '';
      if (status === 'completed') {
        markerHtml = `
          <div class="bg-green-500 border-2 border-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg text-white">
            ✓
          </div>
        `;
      } else if (status === 'active') {
        markerHtml = `
          <div class="bg-yellow-500 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-base shadow-lg text-white animate-pulse">
            ${index + 1}
          </div>
        `;
      } else {
        markerHtml = `
          <div class="bg-gray-400 border-2 border-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg text-white">
            ${index + 1}
          </div>
        `;
      }

      stopMarkerContent.innerHTML = markerHtml;

      const stopMarker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        content: stopMarkerContent,
        title: customer.name,
      });

      const statusText = status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : 'Pending';
      const statusColor = status === 'completed' ? 'green' : status === 'active' ? 'orange' : 'gray';

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold mb-1">Stop ${index + 1}: ${customer.name}</h3>
            <div class="text-sm space-y-1">
              <div>${customer.address || 'No address'}</div>
              ${stop.plannedArrival ? `<div><strong>Planned:</strong> ${new Date(stop.plannedArrival).toLocaleTimeString()}</div>` : ''}
              <div><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></div>
            </div>
          </div>
        `,
      });

      stopMarker.addListener('click', () => {
        infoWindow.open(mapRef.current, stopMarker);
      });

      routeMarkersRef.current.push(stopMarker);
    });

    // Draw road-based route connecting stops
    if (routePositions.length >= 2) {
      const directionsService = new google.maps.DirectionsService();

      // Initialize or reuse DirectionsRenderer
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: mapRef.current,
          suppressMarkers: true, // We use our own custom markers
          polylineOptions: {
            strokeColor: '#3B82F6',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          }
        });
      } else {
        directionsRendererRef.current.setMap(mapRef.current);
      }

      const origin = routePositions[0];
      const destination = routePositions[routePositions.length - 1];
      const waypoints = routePositions.slice(1, -1).map(pos => ({
        location: pos,
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          }
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result);
          } else {
            console.error('Directions request failed due to ' + status);
            // Fallback to simple polyline if directions fail (e.g. over query limit or no route found)
            const polyline = new google.maps.Polyline({
              path: routePositions,
              geodesic: true,
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 3,
              map: mapRef.current,
            });
            routePolylineRef.current = polyline;
          }
        }
      );
    } else if (routePositions.length === 1) {
      // Just center on the single stop
      mapRef.current.panTo(routePositions[0]);
      mapRef.current.setZoom(14);
    }

    // Fit map to show entire route (handled by directionsRenderer usually, but good to have as backup or for single points)
    if (routePositions.length > 0 && !directionsRendererRef.current) {
      mapRef.current.fitBounds(bounds);
    }
  }, [selectedRoute, routeStops, customers, derivedActiveTracks, selectedUserId, allVisits]);

  const getTimeSince = (dateString: string | Date) => {
    const diff = currentTime.getTime() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleClearRoute = () => {
    setSelectedUserId(null);
    routeMarkersRef.current.forEach(marker => marker.map = null);
    routeMarkersRef.current = [];
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
    }
  };

  const getInitialCenter = () => {
    if (derivedActiveTracks && derivedActiveTracks.length > 0) {
      const firstTrack = derivedActiveTracks[0];
      return {
        lat: parseFloat(firstTrack.latitude),
        lng: parseFloat(firstTrack.longitude),
      };
    }
    return { lat: 39.8283, lng: -98.5795 };
  };

  const selectedUser = allUsers?.find(u => u.id === selectedUserId);
  const userGpsTrack = derivedActiveTracks?.find(t => t.userId === selectedUserId);

  // Calculate route progress
  const routeProgress = routeStops && customers && userGpsTrack ? routeStops.map(stop => {
    const customer = customers.find(c => c.id === stop.customerId);
    if (!customer) return null;
    return {
      stop,
      customer,
      status: getStopStatus(stop, customer, userGpsTrack),
    };
  }).filter(Boolean) : [];

  const completedStops = routeProgress.filter(p => p?.status === 'completed').length;
  const totalStops = routeProgress.length;
  const progressPercentage = totalStops > 0 ? (completedStops / totalStops) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Tracking</h1>
            <p className="text-muted-foreground">Real-time GPS tracking of field sales reps</p>
          </div>
          <div className="flex gap-2">
            {selectedUserId && (
              <Button onClick={handleClearRoute} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear Route
              </Button>
            )}
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {selectedUserId && selectedRoute && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Route: {selectedRoute.routeName}</span>
                  <Badge>{totalStops} stops</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{completedStops} of {totalStops} completed</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing route for {selectedUser?.name}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {routeProgress.map((item: any, index) => (
                    <div key={item.stop.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : item.status === 'active' ? (
                        <Target className="h-5 w-5 text-yellow-500 flex-shrink-0 animate-pulse" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.customer.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.customer.address}</div>
                      </div>
                      <Badge variant={item.status === 'completed' ? 'default' : item.status === 'active' ? 'secondary' : 'outline'} className="flex-shrink-0">
                        {item.status === 'completed' ? 'Done' : item.status === 'active' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[600px] w-full">
              <MapView
                initialCenter={getInitialCenter()}
                initialZoom={derivedActiveTracks && derivedActiveTracks.length > 0 ? 12 : 4}
                onMapReady={(map) => {
                  mapRef.current = map;
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Active Sales Reps ({derivedActiveTracks?.length || 0})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {derivedActiveTracks && derivedActiveTracks.length > 0 ? (
              derivedActiveTracks.map((track) => {
                const user = allUsers?.find(u => u.id === track.userId);
                const isSelected = selectedUserId === track.userId;
                return (
                  <Card
                    key={track.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'border-primary shadow-md' : 'hover:shadow-md'}`}
                    onClick={() => setSelectedUserId(track.userId)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        {(track as any).activeCustomerName}
                        {isSelected && <Badge variant="default">Viewing Route</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-mono text-xs">
                            {parseFloat(track.latitude).toFixed(4)}, {parseFloat(track.longitude).toFixed(4)}
                          </span>
                        </div>
                        {(track as any).isVirtual && (
                          <Badge variant="secondary" className="mb-2">Checked In (GPS Idle)</Badge>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Update:</span>
                          <span>{getTimeSince(track.timestamp)}</span>
                        </div>
                        {track.speed && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Speed:</span>
                            <span>{parseFloat(track.speed).toFixed(1)} mph</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    GPS locations will appear here when sales reps are active
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import RouteProgress from "@/components/RouteProgress";
import RouteMapTracking from "@/components/RouteMapTracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Users, MapPin, Package, FileText, TrendingUp, Clock, Plus, ChevronRight, ArrowLeft, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useRouteGpsTracking } from "@/_core/hooks/useRouteGpsTracking";


export default function Routes() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: routes, isLoading } = trpc.routes.list.useQuery();
  const { data: selectedRoute } = trpc.routes.getById.useQuery(
    { id: selectedRouteId! },
    { enabled: selectedRouteId !== null }
  );

  const { data: routeWithStops } = trpc.routes.getWithStops.useQuery(
    { routeId: selectedRouteId! },
    { enabled: selectedRouteId !== null }
  );

  const { repLocations, isLoading: gpsLoading } = useRouteGpsTracking(
    selectedRouteId || 0,
    5000
  );

  const autoAssignMutation = trpc.routes.autoAssignCustomers.useMutation({
    onSuccess: () => {
      utils.routes.getWithStops.invalidate({ routeId: selectedRouteId! });
      toast.success("Customers assigned to route successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign customers");
    },
  });

  const createMutation = trpc.routes.create.useMutation({
    onSuccess: () => {
      utils.routes.list.invalidate();
      setIsCreateDialogOpen(false);
      toast.success("Route created successfully");
    },
  });

  const reorderMutation = trpc.routes.reorderStops.useMutation({
    onSuccess: () => {
      utils.routes.getWithStops.invalidate({ routeId: selectedRouteId! });
    },
  });

  const handleSaveOptimizedOrder = async (orderedStopIds: number[]) => {
    if (!selectedRouteId) return;

    const stops = orderedStopIds.map((id, index) => ({
      id,
      stopOrder: index + 1,
    }));

    await reorderMutation.mutateAsync({
      routeId: selectedRouteId,
      stops,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      routeName: formData.get("routeName") as string,
      routeDate: formData.get("routeDate") as string,
    });
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Show route details view if a route is selected
  if (selectedRouteId !== null && selectedRoute && routeWithStops) {
    const isManager = true; // In a real app, check user role
    const completedStops = routeWithStops.stops?.filter(s => {
      // In a real app, you'd track which stops have been visited
      return false;
    }).length || 0;

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRouteId(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Routes
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{selectedRoute.routeName}</h1>
              <p className="text-muted-foreground">
                {formatDate(selectedRoute.routeDate)} • Status: {selectedRoute.status}
              </p>
            </div>
          </div>

          {/* GPS Tracking for Managers */}
          {isManager && (
            <RouteMapTracking
              routeId={selectedRouteId}
              stops={routeWithStops.stops || []}
              repLocations={repLocations}
              isLoading={gpsLoading}
              onSaveOptimizedOrder={handleSaveOptimizedOrder}
            />
          )}

          {/* Route Progress */}
          {routeWithStops.stops && routeWithStops.stops.length > 0 ? (
            <RouteProgress
              stops={routeWithStops.stops}
              completedStops={completedStops}
              totalDistance={15.5}
              estimatedTimeRemaining={120}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Route Name</p>
                    <p className="font-semibold">{selectedRoute.routeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{formatDate(selectedRoute.routeDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={
                      selectedRoute.status === "completed" ? "default" :
                        selectedRoute.status === "in_progress" ? "secondary" : "outline"
                    }>
                      {selectedRoute.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Route Stops</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {routeWithStops.stops?.length || 0} customers assigned to this route
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeWithStops.stops && routeWithStops.stops.length > 0 ? (
                  <div className="space-y-2">
                    {routeWithStops.stops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Stop {index + 1}: {stop.customer?.name}</p>
                          {stop.customer?.address && (
                            <p className="text-sm text-muted-foreground">{stop.customer.address}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No customers assigned to this route yet</p>
                    <Button
                      onClick={() => autoAssignMutation.mutate({ routeId: selectedRouteId })}
                      disabled={autoAssignMutation.isPending}
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {autoAssignMutation.isPending ? "Assigning..." : "Auto-Assign Customers"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Routes</h1>
            <p className="text-muted-foreground">Plan and manage daily routes</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Route</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Route</DialogTitle>
                <DialogDescription>Plan a route for a specific date</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Route Name *</Label>
                    <Input name="routeName" required placeholder="e.g., Downtown Route" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Date *</Label>
                    <Input name="routeDate" type="date" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Route"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : routes && routes.length > 0 ? (
          <div className="space-y-4">
            {routes.map((route) => (
              <Card
                key={route.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedRouteId(route.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {route.routeName}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(route.routeDate)}
                      </p>
                    </div>
                    <Badge variant={
                      route.status === "completed" ? "default" :
                        route.status === "in_progress" ? "secondary" : "outline"
                    }>
                      {route.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No routes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first route</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />Create Route
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

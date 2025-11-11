import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import RouteAnalyticsDashboard from "@/components/RouteAnalyticsDashboard";
import PredictiveRouteSuggestions from "@/components/PredictiveRouteSuggestions";
import { BarChart3, Lightbulb, Bell } from "lucide-react";

// Mock data for demonstration
const mockRoutes = [
  {
    routeId: 1,
    routeName: "Downtown Route A",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    repId: 1,
    repName: "John Smith",
    totalDistance: 45.2,
    totalDuration: 480,
    stopsCompleted: 8,
    totalStops: 10,
    efficiencyScore: 82,
    averageTimePerStop: 45,
    averageDistanceBetweenStops: 5.65,
    stopsPerHour: 10,
    mileageCost: 135.6,
    customersVisited: 8,
    ordersCreated: 5,
    revenue: 2400,
  },
  {
    routeId: 2,
    routeName: "Suburban Route B",
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    repId: 2,
    repName: "Sarah Johnson",
    totalDistance: 52.1,
    totalDuration: 520,
    stopsCompleted: 9,
    totalStops: 10,
    efficiencyScore: 78,
    averageTimePerStop: 52,
    averageDistanceBetweenStops: 5.79,
    stopsPerHour: 10.4,
    mileageCost: 156.3,
    customersVisited: 9,
    ordersCreated: 6,
    revenue: 2800,
  },
  {
    routeId: 3,
    routeName: "Downtown Route A",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    repId: 1,
    repName: "John Smith",
    totalDistance: 43.8,
    totalDuration: 450,
    stopsCompleted: 8,
    totalStops: 10,
    efficiencyScore: 85,
    averageTimePerStop: 42,
    averageDistanceBetweenStops: 5.48,
    stopsPerHour: 10.7,
    mileageCost: 131.4,
    customersVisited: 8,
    ordersCreated: 5,
    revenue: 2500,
  },
];

const mockCustomers = [
  {
    id: 1,
    name: "ABC Grocery Store",
    latitude: 40.7128,
    longitude: -74.006,
    visitFrequency: 2,
    averageOrderValue: 450,
    lastVisitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    preferredVisitTime: "morning",
  },
  {
    id: 2,
    name: "XYZ Restaurant",
    latitude: 40.758,
    longitude: -73.9855,
    visitFrequency: 3,
    averageOrderValue: 650,
    lastVisitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    preferredVisitTime: "morning",
  },
  {
    id: 3,
    name: "Local Cafe",
    latitude: 40.7489,
    longitude: -73.968,
    visitFrequency: 1,
    averageOrderValue: 250,
    lastVisitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    preferredVisitTime: "afternoon",
  },
  {
    id: 4,
    name: "Downtown Deli",
    latitude: 40.7614,
    longitude: -73.9776,
    visitFrequency: 2,
    averageOrderValue: 380,
    lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    preferredVisitTime: "afternoon",
  },
];

export default function RouteOptimizationHub() {
  const [selectedTab, setSelectedTab] = useState("analytics");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Route Optimization Hub</h1>
          <p className="text-muted-foreground mt-2">
            Analyze route performance, get AI-powered suggestions, and manage notifications
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <RouteAnalyticsDashboard routes={mockRoutes} timeRange="month" />
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <PredictiveRouteSuggestions
              customers={mockCustomers}
              startPoint={{ lat: 40.7128, lng: -74.006 }}
              onSelectRoute={(route) => {
                console.log("Selected route:", route);
              }}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Arrival Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when reps arrive at customer locations
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Deviation Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Alert when reps deviate from planned routes
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Completion Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Notify when routes are completed
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via SMS for critical events
                      </p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get browser push notifications for alerts
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <p className="font-medium text-sm">✓ John Smith arrived at ABC Grocery Store</p>
                  <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                </div>

                <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <p className="font-medium text-sm">⚠️ Sarah Johnson deviated 250m from route</p>
                  <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                </div>

                <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <p className="font-medium text-sm">✓ Route Downtown A completed by John Smith</p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

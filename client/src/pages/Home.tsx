import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, MapPin, Package, FileText, TrendingUp, Clock, Bell, BarChart3, Map, Image, Gauge, Brain, Smartphone } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: overview, isLoading } = trpc.analytics.getOverview.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">SalesForce Tracker</CardTitle>
            <CardDescription>Track your field sales team in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Real-time GPS tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Check-in/Check-out logging</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>Order management</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Photo documentation</span>
              </div>
            </div>
            <Button className="w-full" asChild>
              <a href={import.meta.env.VITE_OAUTH_PORTAL_URL}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      navItems={[
        { href: "/", label: "Dashboard", icon: TrendingUp },
        { href: "/customers", label: "Customers", icon: Users },
        { href: "/customers-map", label: "Customer Map", icon: Map },
        { href: "/routes", label: "Routes", icon: MapPin },
        { href: "/visits", label: "Visits", icon: Clock },
        { href: "/orders", label: "Orders", icon: Package },
        { href: "/products", label: "Products", icon: Package },
        { href: "/photo-gallery", label: "Photo Gallery", icon: Image },
        { href: "/mileage-tracking", label: "Mileage Tracking", icon: Gauge },
        { href: "/tracking", label: "Live Tracking", icon: MapPin },
        { href: "/alerts", label: "Alerts", icon: Bell },
        { href: "/manager", label: "Manager Dashboard", icon: BarChart3 },
        { href: "/mileage-reports", label: "Mileage Reports", icon: Gauge },
        { href: "/internal-notes", label: "Internal Notes History", icon: FileText },
        { href: "/reports", label: "Reports", icon: FileText },
        { href: "/predictive-analytics", label: "Predictive Analytics", icon: Brain },
        { href: "/sales-coach", label: "AI Sales Coach", icon: Brain },
        { href: "/mobile-settings", label: "Mobile Settings", icon: Smartphone },
        { href: "/hubspot-settings", label: "HubSpot Integration", icon: Package },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview?.totalCustomers || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview?.todayVisits || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview?.totalVisits || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview?.completedVisits || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview?.pendingOrders || 0} pending
                </p>
              </CardContent>
            </Card>

            <Link href="/visits">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="default">
                    Start New Visit
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tracking">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Live Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View Team Locations
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

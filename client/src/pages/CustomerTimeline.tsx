import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Users, MapPin, Package, Image, FileText, Clock, Phone, Mail, MapPinIcon, TrendingUp, Plus } from "lucide-react";
import { Link } from "wouter";

interface TimelineEvent {
  id: string;
  type: "visit" | "order" | "photo" | "note";
  date: Date;
  title: string;
  description: string;
  details?: any;
  icon: any;
  color: string;
}

export default function CustomerTimeline() {
  const [, setLocation] = useLocation();
  const [activityFilter, setActivityFilter] = useState<"all" | "visit" | "order" | "photo" | "note">("all");
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");

  // Get customer ID from URL params
  const params = new URLSearchParams(window.location.search);
  const customerId = parseInt(params.get("customerId") || "0");

  // Fetch data
  const { data: customer } = trpc.customers.getById.useQuery(customerId, {
    enabled: customerId > 0,
  });

  const { data: visits = [] } = trpc.visits.getByCustomerId.useQuery(customerId, {
    enabled: customerId > 0,
  });

  const { data: orders = [] } = trpc.orders.list.useQuery(undefined, {
    enabled: customerId > 0,
  });

  const { data: photos = [] } = trpc.photos.list.useQuery(undefined, {
    enabled: customerId > 0,
  });

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(end.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    return { start, end };
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  // Build timeline events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add visits
    visits.forEach((visit: any) => {
      const visitDate = new Date(visit.checkInTime);
      if (visitDate >= dateStart && visitDate <= dateEnd) {
        const duration = visit.checkOutTime
          ? Math.round((new Date(visit.checkOutTime).getTime() - visitDate.getTime()) / 60000)
          : null;

        events.push({
          id: `visit-${visit.id}`,
          type: "visit",
          date: visitDate,
          title: "Visit",
          description: `Check-in at ${visitDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          details: {
            duration,
            status: visit.status,
            notes: visit.notes,
          },
          icon: Clock,
          color: "bg-blue-100 text-blue-700",
        });
      }
    });

    // Add orders
    orders
      .filter((o: any) => o.customerId === customerId)
      .forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= dateStart && orderDate <= dateEnd) {
          events.push({
            id: `order-${order.id}`,
            type: "order",
            date: orderDate,
            title: "Order",
            description: `Order #${order.id} - ${order.items?.length || 0} items`,
            details: {
              total: order.totalAmount,
              status: order.status,
              items: order.items,
            },
            icon: Package,
            color: "bg-green-100 text-green-700",
          });
        }
      });

    // Add photos
    photos
      .filter((p: any) => p.customerId === customerId)
      .forEach((photo: any) => {
        const photoDate = new Date(photo.uploadedAt);
        if (photoDate >= dateStart && photoDate <= dateEnd) {
          events.push({
            id: `photo-${photo.id}`,
            type: "photo",
            date: photoDate,
            title: "Photo",
            description: `${photo.photoType} photo uploaded`,
            details: {
              photoType: photo.photoType,
              caption: photo.caption,
            },
            icon: Image,
            color: "bg-purple-100 text-purple-700",
          });
        }
      });

    // Sort by date descending (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [visits, orders, photos, customerId, dateStart, dateEnd]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (activityFilter === "all") return timelineEvents;
    return timelineEvents.filter((e) => e.type === activityFilter);
  }, [timelineEvents, activityFilter]);

  // Calculate engagement metrics
  const metrics = useMemo(() => {
    const visitsCount = visits.length;
    const ordersCount = orders.filter((o: any) => o.customerId === customerId).length;
    const photosCount = photos.filter((p: any) => p.customerId === customerId).length;
    const lastVisit = visits.length > 0 ? new Date(visits[0].checkInTime) : null;
    const totalSpent = orders
      .filter((o: any) => o.customerId === customerId)
      .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || 0), 0);

    return { visitsCount, ordersCount, photosCount, lastVisit, totalSpent };
  }, [visits, orders, photos, customerId]);

  if (!customer) {
    return (
      <DashboardLayout
        navItems={[
          { href: "/", label: "Dashboard", icon: TrendingUp },
          { href: "/customers", label: "Customers", icon: Users },
        ]}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground">Customer not found</p>
          <Link href="/customers">
            <Button className="mt-4">Back to Customers</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={[
        { href: "/", label: "Dashboard", icon: TrendingUp },
        { href: "/customers", label: "Customers", icon: Users },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">Interaction Timeline & History</p>
          </div>
          <Link href={`/orders?customerId=${customerId}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>

        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{customer.address || "N/A"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${customer.phone}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  {customer.phone || "N/A"}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${customer.email}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {customer.email || "N/A"}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="text-sm font-medium mt-1">{customer.contactPerson || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.visitsCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.ordersCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.photosCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Visit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {metrics.lastVisit ? metrics.lastVisit.toLocaleDateString() : "Never"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Activity Type</label>
                <Select value={activityFilter} onValueChange={(value: any) => setActivityFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="visit">Visits</SelectItem>
                    <SelectItem value="order">Orders</SelectItem>
                    <SelectItem value="photo">Photos</SelectItem>
                    <SelectItem value="note">Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">Last 90 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>{filteredEvents.length} activities found</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No activities found</p>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full ${event.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="w-0.5 h-12 bg-border mt-2" />
                      </div>

                      {/* Event content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <Badge variant="outline">{event.date.toLocaleDateString()}</Badge>
                        </div>

                        {/* Event details */}
                        {event.type === "visit" && event.details && (
                          <div className="mt-2 text-sm text-muted-foreground space-y-1">
                            {event.details.duration && (
                              <p>Duration: {event.details.duration} minutes</p>
                            )}
                            <p>Status: <span className="capitalize font-medium">{event.details.status}</span></p>
                            {event.details.notes && (
                              <p>Notes: {event.details.notes}</p>
                            )}
                          </div>
                        )}

                        {event.type === "order" && event.details && (
                          <div className="mt-2 text-sm text-muted-foreground space-y-1">
                            <p>Total: ${parseFloat(event.details.total).toFixed(2)}</p>
                            <p>Items: {event.details.items?.length || 0}</p>
                            <p>Status: <span className="capitalize font-medium">{event.details.status}</span></p>
                          </div>
                        )}

                        {event.type === "photo" && event.details && (
                          <div className="mt-2 text-sm text-muted-foreground space-y-1">
                            <p>Type: <span className="capitalize font-medium">{event.details.photoType}</span></p>
                            {event.details.caption && (
                              <p>Caption: {event.details.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

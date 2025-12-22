import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  BarChart3,
  Download,
} from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch all data
  const { data: overview } = trpc.analytics.getOverview.useQuery();
  const { data: visits = [] } = trpc.visitData.list.useQuery();
  const { data: orders = [] } = trpc.orders.list.useQuery();
  const { data: users = [] } = trpc.system.listUsers.useQuery();
  const { data: photos = [] } = trpc.photos.list.useQuery();
  const { data: customers = [] } = trpc.customers.list.useQuery();

  // Calculate date range
  const getDateRange = () => {
    const end = endDate ? new Date(endDate) : new Date();
    let start = startDate ? new Date(startDate) : new Date();

    if (!startDate) {
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
    }
    return { start, end };
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  // Filter data by date range
  const filteredVisits = useMemo(() => {
    return visits.filter((v: any) => {
      const visitDate = new Date(v.checkInTime);
      return visitDate >= dateStart && visitDate <= dateEnd;
    });
  }, [visits, dateStart, dateEnd]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= dateStart && orderDate <= dateEnd;
    });
  }, [orders, dateStart, dateEnd]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((p: any) => {
      const photoDate = new Date(p.uploadedAt);
      return photoDate >= dateStart && photoDate <= dateEnd;
    });
  }, [photos, dateStart, dateEnd]);

  // Sales Performance by Rep
  const repPerformance = useMemo(() => {
    const performance: { [key: number]: any } = {};

    filteredVisits.forEach((visit: any) => {
      if (!performance[visit.userId]) {
        const user = users.find((u: any) => u.id === visit.userId);
        performance[visit.userId] = {
          userId: visit.userId,
          userName: user?.name || user?.email || "Unknown",
          visits: 0,
          completedVisits: 0,
          totalDuration: 0,
          orders: 0,
          revenue: 0,
        };
      }
      performance[visit.userId].visits += 1;
      if (visit.status === "completed") {
        performance[visit.userId].completedVisits += 1;
        performance[visit.userId].totalDuration += visit.visitDuration || 0;
      }
    });

    filteredOrders.forEach((order: any) => {
      const userId = order.userId;
      if (performance[userId]) {
        performance[userId].orders += 1;
        performance[userId].revenue += parseFloat(order.totalAmount) || 0;
      }
    });

    return Object.values(performance)
      .map((p: any) => ({
        ...p,
        avgDuration:
          p.completedVisits > 0 ? (p.totalDuration / p.completedVisits).toFixed(0) : 0,
        completionRate:
          p.visits > 0 ? ((p.completedVisits / p.visits) * 100).toFixed(1) : 0,
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue);
  }, [filteredVisits, filteredOrders, users]);

  // Customer Visit Frequency
  const customerVisitFrequency = useMemo(() => {
    const frequency: { [key: number]: any } = {};

    filteredVisits.forEach((visit: any) => {
      if (!frequency[visit.customerId]) {
        const customer = customers.find((c: any) => c.id === visit.customerId);
        frequency[visit.customerId] = {
          customerId: visit.customerId,
          customerName: customer?.name || "Unknown",
          visits: 0,
          lastVisit: null,
        };
      }
      frequency[visit.customerId].visits += 1;
      const visitDate = new Date(visit.checkInTime);
      if (
        !frequency[visit.customerId].lastVisit ||
        visitDate > new Date(frequency[visit.customerId].lastVisit)
      ) {
        frequency[visit.customerId].lastVisit = visit.checkInTime;
      }
    });

    return Object.values(frequency)
      .sort((a: any, b: any) => b.visits - a.visits)
      .slice(0, 10);
  }, [filteredVisits, customers]);

  // Order Volume by Distributor
  const orderByDistributor = useMemo(() => {
    const distribution: { [key: string]: any } = {};

    filteredOrders.forEach((order: any) => {
      const distributorName = order.distributorName || "Unknown";
      if (!distribution[distributorName]) {
        distribution[distributorName] = {
          distributorName,
          orderCount: 0,
          totalValue: 0,
          itemCount: 0,
        };
      }
      distribution[distributorName].orderCount += 1;
      distribution[distributorName].totalValue += parseFloat(order.totalAmount) || 0;
      distribution[distributorName].itemCount += order.items?.length || 0;
    });

    return Object.values(distribution)
      .sort((a: any, b: any) => b.totalValue - a.totalValue);
  }, [filteredOrders]);

  // Route Efficiency Metrics
  const routeEfficiency = useMemo(() => {
    const totalVisits = filteredVisits.length;
    const completedVisits = filteredVisits.filter((v: any) => v.status === "completed").length;
    const totalDuration = filteredVisits.reduce((sum: number, v: any) => sum + (v.visitDuration || 0), 0);
    const avgDuration = completedVisits > 0 ? (totalDuration / completedVisits).toFixed(0) : 0;

    const visitsPerDay = filteredVisits.length > 0
      ? (filteredVisits.length / Math.ceil((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24))).toFixed(1)
      : 0;

    return {
      totalVisits,
      completedVisits,
      completionRate: totalVisits > 0 ? ((completedVisits / totalVisits) * 100).toFixed(1) : 0,
      avgDuration,
      visitsPerDay,
    };
  }, [filteredVisits, dateStart, dateEnd]);

  // Photo Documentation
  const photoDocumentation = useMemo(() => {
    const byRep: { [key: number]: any } = {};
    const byType: { [key: string]: number } = {
      before: 0,
      after: 0,
      other: 0,
    };

    filteredPhotos.forEach((photo: any) => {
      if (!byRep[photo.userId]) {
        const user = users.find((u: any) => u.id === photo.userId);
        byRep[photo.userId] = {
          userId: photo.userId,
          userName: user?.name || user?.email || "Unknown",
          photoCount: 0,
        };
      }
      byRep[photo.userId].photoCount += 1;

      const photoType = photo.photoType || "other";
      byType[photoType] = (byType[photoType] || 0) + 1;
    });

    return {
      byRep: Object.values(byRep)
        .sort((a: any, b: any) => b.photoCount - a.photoCount)
        .slice(0, 10),
      byType,
      totalPhotos: filteredPhotos.length,
    };
  }, [filteredPhotos, users]);

  const handleExportReport = (reportName: string) => {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${reportName}-${timestamp}.csv`;

    let csvContent = "";
    let data: any[] = [];

    switch (reportName) {
      case "sales-performance":
        csvContent = "Rep Name,Visits,Completed,Completion Rate,Avg Duration (min),Orders,Revenue\n";
        data = repPerformance;
        csvContent += data
          .map(
            (r) =>
              `"${r.userName}",${r.visits},${r.completedVisits},${r.completionRate}%,${r.avgDuration},${r.orders},$${r.revenue.toFixed(2)}`
          )
          .join("\n");
        break;

      case "customer-visits":
        csvContent = "Customer Name,Visit Count,Last Visit\n";
        data = customerVisitFrequency;
        csvContent += data
          .map(
            (c) =>
              `"${c.customerName}",${c.visits},${new Date(c.lastVisit).toLocaleDateString()}`
          )
          .join("\n");
        break;

      case "order-volume":
        csvContent = "Distributor,Order Count,Total Value,Item Count\n";
        data = orderByDistributor;
        csvContent += data
          .map((d) => `"${d.distributorName}",${d.orderCount},$${d.totalValue.toFixed(2)},${d.itemCount}`)
          .join("\n");
        break;

      case "photo-documentation":
        csvContent = "Rep Name,Photo Count\n";
        data = photoDocumentation.byRep;
        csvContent += data.map((p: any) => `"${p.userName}",${p.photoCount}`).join("\n");
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance and operational insights</p>
        </div>

        {/* Date Range Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Range</label>
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
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  {dateStart.toLocaleDateString()} - {dateEnd.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{routeEfficiency.totalVisits}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {routeEfficiency.completionRate}% completed
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
              <div className="text-3xl font-bold">{filteredOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${filteredOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0).toFixed(0)} revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Photos Uploaded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{photoDocumentation.totalPhotos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Documentation rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Visit Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{routeEfficiency.avgDuration} min</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per completed visit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Performance by Rep */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales Performance by Rep</CardTitle>
              <CardDescription>Individual rep metrics and rankings</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportReport("sales-performance")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {repPerformance.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Rep Name</th>
                      <th className="text-right py-3 px-4 font-semibold">Visits</th>
                      <th className="text-right py-3 px-4 font-semibold">Completed</th>
                      <th className="text-right py-3 px-4 font-semibold">Rate</th>
                      <th className="text-right py-3 px-4 font-semibold">Avg Duration</th>
                      <th className="text-right py-3 px-4 font-semibold">Orders</th>
                      <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repPerformance.map((rep, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{rep.userName}</td>
                        <td className="text-right py-3 px-4">{rep.visits}</td>
                        <td className="text-right py-3 px-4">{rep.completedVisits}</td>
                        <td className="text-right py-3 px-4">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            {rep.completionRate}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">{rep.avgDuration} min</td>
                        <td className="text-right py-3 px-4">{rep.orders}</td>
                        <td className="text-right py-3 px-4 font-semibold text-green-600">
                          ${rep.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Visit Frequency */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Visited Customers</CardTitle>
              <CardDescription>Customer visit frequency and engagement</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportReport("customer-visits")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {customerVisitFrequency.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Customer</th>
                      <th className="text-right py-3 px-4 font-semibold">Visits</th>
                      <th className="text-left py-3 px-4 font-semibold">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerVisitFrequency.map((customer: any, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{customer.customerName}</td>
                        <td className="text-right py-3 px-4">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                            {customer.visits}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(customer.lastVisit).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Volume by Distributor */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Order Volume by Distributor</CardTitle>
              <CardDescription>Distributor breakdown and order metrics</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportReport("order-volume")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {orderByDistributor.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Distributor</th>
                      <th className="text-right py-3 px-4 font-semibold">Orders</th>
                      <th className="text-right py-3 px-4 font-semibold">Items</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderByDistributor.map((dist: any, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{dist.distributorName}</td>
                        <td className="text-right py-3 px-4">{dist.orderCount}</td>
                        <td className="text-right py-3 px-4">{dist.itemCount}</td>
                        <td className="text-right py-3 px-4 font-semibold text-green-600">
                          ${dist.totalValue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Documentation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Photo Documentation</CardTitle>
              <CardDescription>Photo uploads by rep and type</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportReport("photo-documentation")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Photos by Type</h3>
                <div className="space-y-3">
                  {Object.entries(photoDocumentation.byType).map(([type, count]: [string, any]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize text-muted-foreground">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Top Photo Contributors</h3>
                {photoDocumentation.byRep.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No photos uploaded</p>
                ) : (
                  <div className="space-y-3">
                    {photoDocumentation.byRep.slice(0, 5).map((rep: any, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{rep.userName}</span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                          {rep.photoCount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

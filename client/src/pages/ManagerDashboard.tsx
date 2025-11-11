import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Package, CheckCircle, Clock, Send, DollarSign, Users, Filter, Download } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function ManagerDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [distributorFilter, setDistributorFilter] = useState<string>("all");
  const [repFilter, setRepFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [internalNotesSearch, setInternalNotesSearch] = useState<string>("");

  const { data: orders, isLoading } = trpc.orders.list.useQuery();
  const { data: distributors } = trpc.distributors.list.useQuery();
  const { data: users } = trpc.system.listUsers.useQuery();

  // Filter orders
  const filteredOrders = orders?.filter((order: any) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (distributorFilter !== "all" && order.distributorId?.toString() !== distributorFilter) return false;
    if (repFilter !== "all" && order.userId?.toString() !== repFilter) return false;
    if (startDate && new Date(order.orderDate) < new Date(startDate)) return false;
    if (endDate && new Date(order.orderDate) > new Date(endDate)) return false;
    
    // Internal notes search
    if (internalNotesSearch && internalNotesSearch.trim()) {
      const searchLower = internalNotesSearch.toLowerCase();
      const internalNotes = (order.internalNotes || "").toLowerCase();
      if (!internalNotes.includes(searchLower)) return false;
    }
    
    return true;
  }) || [];

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const sentOrders = filteredOrders.filter((o: any) => o.sentToDistributor).length;
  const pendingOrders = filteredOrders.filter((o: any) => o.status === "pending").length;
  const completedOrders = filteredOrders.filter((o: any) => o.status === "completed").length;
  const totalRevenue = filteredOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"), 0);

  // Distributor breakdown
  const distributorStats = distributors?.map((dist: any) => {
    const distOrders = filteredOrders.filter((o: any) => o.distributorId === dist.id);
    const distRevenue = distOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"), 0);
    return {
      name: dist.name,
      orderCount: distOrders.length,
      revenue: distRevenue,
    };
  }).filter((stat: any) => stat.orderCount > 0) || [];

  // Sales rep performance
  const repStats = users?.map((user: any) => {
    const repOrders = filteredOrders.filter((o: any) => o.userId === user.id);
    const repRevenue = repOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"), 0);
    return {
      name: user.name || user.email,
      orderCount: repOrders.length,
      revenue: repRevenue,
    };
  }).filter((stat: any) => stat.orderCount > 0) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">Track order status and distributor submissions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent to Distributors</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentOrders}</div>
              <p className="text-xs text-muted-foreground">{totalOrders > 0 ? Math.round((sentOrders / totalOrders) * 100) : 0}% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Distributor</Label>
                <Select value={distributorFilter} onValueChange={setDistributorFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Distributors</SelectItem>
                    {distributors?.map((dist: any) => (
                      <SelectItem key={dist.id} value={dist.id.toString()}>
                        {dist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sales Rep</Label>
                <Select value={repFilter} onValueChange={setRepFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reps</SelectItem>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Search Internal Notes</Label>
                <Input 
                  type="text" 
                  placeholder="Search private notes..." 
                  value={internalNotesSearch} 
                  onChange={(e) => setInternalNotesSearch(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">
                  Find orders with specific keywords in internal notes
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setDistributorFilter("all");
                  setRepFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setInternalNotesSearch("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Distributor Breakdown */}
        {distributorStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Orders by Distributor</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distributor</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributorStats.map((stat: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell className="text-right">{stat.orderCount}</TableCell>
                      <TableCell className="text-right">${stat.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Sales Rep Performance */}
        {repStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sales Rep Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sales Rep</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repStats.map((stat: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell className="text-right">{stat.orderCount}</TableCell>
                      <TableCell className="text-right">${stat.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Sales Rep</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Distributor</TableHead>
                      <TableHead>Email Status</TableHead>
                      <TableHead>Internal Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: any) => {
                      const distributor = distributors?.find((d: any) => d.id === order.distributorId);
                      const rep = users?.find((u: any) => u.id === order.userId);
                      
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                          <TableCell>{order.customerId}</TableCell>
                          <TableCell>{rep?.name || rep?.email || "Unknown"}</TableCell>
                          <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{distributor?.name || "—"}</TableCell>
                          <TableCell>
                            {order.sentToDistributor ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                  Sent {order.sentAt ? new Date(order.sentAt).toLocaleString() : ""}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="secondary">Not Sent</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {order.internalNotes ? (
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground truncate" title={order.internalNotes}>
                                  {internalNotesSearch && internalNotesSearch.trim() ? (
                                    <span>
                                      {order.internalNotes.split(new RegExp(`(${internalNotesSearch})`, 'gi')).map((part: string, i: number) => 
                                        part.toLowerCase() === internalNotesSearch.toLowerCase() ? (
                                          <mark key={i} className="bg-yellow-200 font-semibold">{part}</mark>
                                        ) : (
                                          <span key={i}>{part}</span>
                                        )
                                      )}
                                    </span>
                                  ) : (
                                    order.internalNotes
                                  )}
                                </div>
                                {order.internalNotesAuthor && order.internalNotesTimestamp && (
                                  <div className="text-xs text-muted-foreground/70">
                                    Added by {order.internalNotesAuthor} on {new Date(order.internalNotesTimestamp).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

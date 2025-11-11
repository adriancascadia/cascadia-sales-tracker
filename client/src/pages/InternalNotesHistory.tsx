import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, FileText, User, Calendar, DollarSign, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function InternalNotesHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRep, setSelectedRep] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Fetch all orders
  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery();
  
  // Fetch all users for filter
  const { data: users } = trpc.system.listUsers.useQuery();

  // Filter orders that have internal notes
  const ordersWithNotes = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => 
      order.internalNotes && order.internalNotes.trim() !== ""
    );
  }, [orders]);

  // Apply filters and search
  const filteredOrders = useMemo(() => {
    let filtered = [...ordersWithNotes];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.internalNotes?.toLowerCase().includes(term) ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.internalNotesAuthor?.toLowerCase().includes(term)
      );
    }

    // Sales rep filter
    if (selectedRep !== "all") {
      filtered = filtered.filter(order => 
        order.internalNotesAuthor === selectedRep
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.internalNotesTimestamp || b.orderDate).getTime() - 
                 new Date(a.internalNotesTimestamp || a.orderDate).getTime();
        case "oldest":
          return new Date(a.internalNotesTimestamp || a.orderDate).getTime() - 
                 new Date(b.internalNotesTimestamp || b.orderDate).getTime();
        case "rep":
          return (a.internalNotesAuthor || "").localeCompare(b.internalNotesAuthor || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [ordersWithNotes, searchTerm, selectedRep, sortBy]);

  // Get unique sales reps who have written notes
  const salesReps = useMemo(() => {
    const reps = new Set(ordersWithNotes.map(o => o.internalNotesAuthor).filter(Boolean));
    return Array.from(reps);
  }, [ordersWithNotes]);

  // Highlight search terms in text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : 
        part
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRep("all");
    setSortBy("newest");
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Internal Notes History</h1>
          <p className="text-muted-foreground mt-2">
            View all internal notes from sales representatives across all orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersWithNotes.length}</div>
              <p className="text-xs text-muted-foreground">
                Orders with internal notes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reps</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesReps.length}</div>
              <p className="text-xs text-muted-foreground">
                Sales reps with notes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                Matching current filters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>Filter and search through internal notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Search Notes</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by note content, order number, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sales Rep</label>
                <Select value={selectedRep} onValueChange={setSelectedRep}>
                  <SelectTrigger>
                    <SelectValue placeholder="All reps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sales Reps</SelectItem>
                    {salesReps.map((rep) => (
                      <SelectItem key={rep} value={rep || ""}>
                        {rep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="rep">By Sales Rep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchTerm || selectedRep !== "all") && (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes List */}
        {ordersLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No internal notes found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm || selectedRep !== "all"
                  ? "Try adjusting your filters"
                  : "Internal notes will appear here when sales reps add them to orders"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.internalNotesAuthor || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {order.internalNotesTimestamp
                            ? new Date(order.internalNotesTimestamp).toLocaleString()
                            : new Date(order.orderDate).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${order.totalAmount}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Internal Note:
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {searchTerm
                        ? highlightText(order.internalNotes || "", searchTerm)
                        : order.internalNotes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

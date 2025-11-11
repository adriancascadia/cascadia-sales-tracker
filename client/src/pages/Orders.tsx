import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Users, MapPin, Package, FileText, TrendingUp, Clock, Plus, DollarSign, Trash2, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ProductSelector } from "@/components/ProductSelector";
import { useAuth } from "@/_core/hooks/useAuth";
import OfflineStatusBadge from "@/components/OfflineStatusBadge";
import OfflineSyncPanel from "@/components/OfflineSyncPanel";

export default function Orders() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
  // Check for customer ID in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get('customer');
    if (customerId) {
      setSelectedCustomerId(customerId);
      setIsCreateDialogOpen(true);
    }
  }, [location]);
  const [orderItems, setOrderItems] = useState<Array<{ productId: number; quantity: number; unitPrice: string }>>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");
  
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const { data: distributors } = trpc.distributors.list.useQuery();
  
  const createMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      utils.analytics.getOverview.invalidate();
      setIsCreateDialogOpen(false);
      setSelectedCustomerId("");
      setOrderItems([]);
      setSpecialInstructions("");
      setInternalNotes("");
      toast.success("Order created successfully");
    },
  });
  
  const submitMutation = trpc.orders.submitOrder.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      toast.success("Order submitted to distributor");
    },
  });

  const generateInvoiceMutation = trpc.orders.generateInvoice.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate invoice");
    },
  });
  
  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: 0, quantity: 1, unitPrice: "0" }]);
  };
  
  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };
  
  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };
  
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);
  };
  
  const handleCreateOrder = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    
    if (orderItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    
    const total = calculateTotal();
    const orderNumber = `ORD-${Date.now()}`;
    
    createMutation.mutate({
      customerId: parseInt(selectedCustomerId),
      orderNumber,
      totalAmount: total.toFixed(2),
      specialInstructions: specialInstructions || undefined,
      internalNotes: internalNotes || undefined,
      internalNotesAuthor: internalNotes ? (user?.name || user?.email || "Unknown") : undefined,
      internalNotesTimestamp: internalNotes ? new Date() : undefined,
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
      })),
    });
  };
  
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout
      navItems={[
        { href: "/", label: "Dashboard", icon: TrendingUp },
        { href: "/customers", label: "Customers", icon: Users },
        { href: "/routes", label: "Routes", icon: MapPin },
        { href: "/visits", label: "Visits", icon: Clock },
        { href: "/orders", label: "Orders", icon: Package },
        { href: "/products", label: "Products", icon: Package },
        { href: "/tracking", label: "Live Tracking", icon: MapPin },
        { href: "/reports", label: "Reports", icon: FileText },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>
          <div className="flex items-center gap-2">
            <OfflineStatusBadge feature="order" />
            <OfflineSyncPanel />
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Create Order</Button>
              </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>Add products and submit order</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Customer *</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Order Items</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addOrderItem}>
                      <Plus className="h-4 w-4 mr-1" />Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {orderItems.map((item, index) => {
                      const lineTotal = item.quantity * parseFloat(item.unitPrice || "0");
                      return (
                        <div key={index} className="border rounded-lg p-3 bg-muted/30">
                          <div className="flex gap-2 items-start mb-2">
                            <div className="flex-1">
                              <ProductSelector
                                products={products || []}
                                distributors={distributors || []}
                                value={item.productId}
                                onSelect={(productId, price) => {
                                  updateOrderItem(index, "productId", productId);
                                  updateOrderItem(index, "unitPrice", price);
                                }}
                                placeholder="Search products..."
                              />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOrderItem(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2 items-center">
                            <div className="flex items-center gap-1">
                              <Label className="text-xs text-muted-foreground">Qty:</Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateOrderItem(index, "quantity", Math.max(1, item.quantity - 1))}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateOrderItem(index, "quantity", parseInt(e.target.value) || 1)}
                                  className="w-16 h-8 text-center"
                                  min="1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateOrderItem(index, "quantity", item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-xs text-muted-foreground">Unit Price:</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateOrderItem(index, "unitPrice", e.target.value)}
                                className="w-24 h-8"
                              />
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Line Total:</Label>
                              <span className="text-lg font-bold text-primary">
                                ${lineTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Special Instructions (Customer-Facing)</Label>
                    <p className="text-xs text-muted-foreground">These notes will appear on the PDF invoice sent to the customer</p>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g., Deliver to back door, Fragile items, etc."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Internal Notes (Private)</Label>
                    <p className="text-xs text-muted-foreground">Private notes only visible to you and managers - will NOT appear on customer invoices</p>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g., Customer mentioned competitor pricing, Follow up next week, etc."
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                {orderItems.length > 0 && (
                  <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Total</p>
                        <p className="text-xs text-muted-foreground">{orderItems.length} item(s)</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateOrder} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Order"}
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
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
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const customer = customers?.find(c => c.id === order.customerId);
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{order.orderNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {customer?.name} • {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${parseFloat(order.totalAmount).toFixed(2)}</div>
                        <Badge variant={order.status === "submitted" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => submitMutation.mutate({ orderId: order.id })}
                          disabled={submitMutation.isPending}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Submit to Distributor
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateInvoiceMutation.mutate({ orderId: order.id })}
                        disabled={generateInvoiceMutation.isPending}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {generateInvoiceMutation.isPending ? "Generating..." : "Download Invoice"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first order</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />Create Order
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

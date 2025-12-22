import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, Users, Briefcase } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";

export default function HubSpotSettings() {
  const { user } = useAuth();
  const [syncingCustomers, setSyncingCustomers] = useState(false);
  const [syncingOrders, setSyncingOrders] = useState(false);

  // Check if HubSpot is configured
  const { data: configStatus } = trpc.hubspot.isConfigured.useQuery();

  // Get customers for syncing
  const { data: customersData } = trpc.customers.list.useQuery();

  // Get orders for syncing
  const { data: ordersData } = trpc.orders.list.useQuery();

  // Sync all customers
  const syncCustomersMutation = trpc.hubspot.syncAllCustomers.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Synced ${result.successful}/${result.total} customers to HubSpot`
      );
      setSyncingCustomers(false);
    },
    onError: (error) => {
      toast.error(`Failed to sync customers: ${error.message}`);
      setSyncingCustomers(false);
    },
  });

  // Sync all orders
  const syncOrdersMutation = trpc.hubspot.syncAllOrders.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Synced ${result.successful}/${result.total} orders to HubSpot`
      );
      setSyncingOrders(false);
    },
    onError: (error) => {
      toast.error(`Failed to sync orders: ${error.message}`);
      setSyncingOrders(false);
    },
  });

  const handleSyncCustomers = async () => {
    if (!customersData || customersData.length === 0) {
      toast.info("No customers to sync");
      return;
    }

    setSyncingCustomers(true);
    const customersToSync = customersData.map((customer: any) => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      industry: customer.industry,
    }));

    syncCustomersMutation.mutate({ customers: customersToSync });
  };

  const handleSyncOrders = async () => {
    if (!ordersData || ordersData.length === 0) {
      toast.info("No orders to sync");
      return;
    }

    setSyncingOrders(true);
    const ordersToSync = ordersData.map((order: any) => ({
      id: order.id.toString(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: new Date(order.createdAt),
    }));

    syncOrdersMutation.mutate({ orders: ordersToSync });
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">HubSpot Integration</h1>
          <p className="text-muted-foreground">
            Sync your SalesForce Tracker data with HubSpot CRM
          </p>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {configStatus?.configured ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  HubSpot Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  HubSpot Not Configured
                </>
              )}
            </CardTitle>
            <CardDescription>
              {configStatus?.configured
                ? "Your HubSpot API is configured and ready to sync"
                : "Add your HubSpot API key to enable syncing"}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Sync Options */}
        {configStatus?.configured && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sync Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sync Customers
                </CardTitle>
                <CardDescription>
                  Export all customers to HubSpot contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {customersData?.length || 0} customers ready to sync
                </div>
                <Button
                  onClick={handleSyncCustomers}
                  disabled={syncingCustomers || !customersData?.length}
                  className="w-full"
                >
                  {syncingCustomers ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Customers
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will create or update contacts in HubSpot based on your
                  customer data
                </p>
              </CardContent>
            </Card>

            {/* Sync Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Sync Orders
                </CardTitle>
                <CardDescription>
                  Export all orders to HubSpot deals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {ordersData?.length || 0} orders ready to sync
                </div>
                <Button
                  onClick={handleSyncOrders}
                  disabled={syncingOrders || !ordersData?.length}
                  className="w-full"
                >
                  {syncingOrders ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Orders
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will create or update deals in HubSpot based on your order
                  data
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Features</CardTitle>
            <CardDescription>
              What you can do with HubSpot integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Sync customers as HubSpot contacts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Sync orders as HubSpot deals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Automatic contact-deal associations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Create notes and activities in HubSpot
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Bulk sync operations
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Customers → Contacts</h4>
              <p className="text-muted-foreground">
                Your SalesForce Tracker customers are synced to HubSpot as
                contacts. Each customer becomes a contact with their name, email,
                phone, and company information.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Orders → Deals</h4>
              <p className="text-muted-foreground">
                Your orders are synced to HubSpot as deals. Each order becomes a
                deal associated with the customer contact, with the order amount,
                status, and date.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Automatic Associations</h4>
              <p className="text-muted-foreground">
                When syncing orders, contacts are automatically associated with
                their corresponding deals in HubSpot.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { MapView } from "@/components/Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MapPin, Store, Filter, X, Phone, Mail, User, MapPinIcon, Edit2, ShoppingCart, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

interface SelectedCustomer {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  latitude: string;
  longitude: string;
}

export default function CustomersMap() {
  const { data: customers, isLoading } = trpc.customers.list.useQuery();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  // Filter customers by selected state
  const filteredCustomers = selectedState === "all" 
    ? customers 
    : customers?.filter((c: any) => c.state === selectedState);

  useEffect(() => {
    if (!map || !filteredCustomers) return;

    // Clear existing markers and info windows
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());

    const newMarkers: google.maps.Marker[] = [];
    const newInfoWindows: google.maps.InfoWindow[] = [];
    const bounds = new google.maps.LatLngBounds();

    // Add marker for each customer
    filteredCustomers.forEach((customer: any) => {
      if (!customer.latitude || !customer.longitude) return;

      const lat = parseFloat(customer.latitude);
      const lng = parseFloat(customer.longitude);
      const position = { lat, lng };

      // Create custom marker icon
      const marker = new google.maps.Marker({
        position,
        map,
        title: customer.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${customer.name}</h3>
            <div style="font-size: 14px; color: #6b7280;">
              <p style="margin: 4px 0;"><strong>Address:</strong> ${customer.address}</p>
              <p style="margin: 4px 0;">${customer.city}, ${customer.state} ${customer.zipCode}</p>
              ${customer.phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${customer.phone}</p>` : ''}
              ${customer.email ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${customer.email}</p>` : ''}
              <p style="margin: 8px 0 4px 0; font-size: 12px; color: #9ca3af;">
                📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}
              </p>
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close all other info windows
        newInfoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
        
        // Show detailed card
        setSelectedCustomer({
          id: customer.id,
          name: customer.name,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode,
          phone: customer.phone,
          email: customer.email,
          contactPerson: customer.contactPerson,
          notes: customer.notes,
          latitude: customer.latitude,
          longitude: customer.longitude,
        });
      });

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);
      bounds.extend(position);
    });

    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Adjust zoom if only one marker
      if (newMarkers.length === 1) {
        map.setZoom(12);
      }
    }
  }, [map, filteredCustomers]);

  // Group customers by state for statistics
  const customersByState = customers?.reduce((acc: Record<string, number>, customer: any) => {
    const state = customer.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {}) || {};

  const statesList = Object.entries(customersByState)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([state, count]) => ({ state, count }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Locations</h1>
          <p className="text-muted-foreground">Geographical distribution of all customers</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {selectedState === "all" ? "Total Customers" : `Customers in ${selectedState}`}
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCustomers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {selectedState === "all" ? `Across ${statesList.length} states` : "In selected state"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geocoded Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredCustomers?.filter((c: any) => c.latitude && c.longitude).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">With GPS coordinates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top State</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statesList[0]?.state || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {statesList[0]?.count || 0} customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter by State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="state-filter" className="whitespace-nowrap">Select State:</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger id="state-filter" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States ({customers?.length || 0})</SelectItem>
                  {statesList.map(({ state, count }) => (
                    <SelectItem key={state} value={state}>
                      {state} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedState !== "all" && (
                <span className="text-sm text-muted-foreground">
                  Showing {filteredCustomers?.length || 0} of {customers?.length || 0} customers
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map and Customer Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution Map</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[600px] rounded-lg overflow-hidden border">
                    <MapView onMapReady={handleMapReady} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Details Card */}
          <div className="lg:col-span-1">
            {selectedCustomer ? (
              <Card className="sticky top-6 border-2 border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg">{selectedCustomer.name}</CardTitle>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">{selectedCustomer.address}</p>
                        <p className="text-muted-foreground">
                          {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedCustomer.phone}`} className="text-sm text-primary hover:underline">
                        {selectedCustomer.phone}
                      </a>
                    </div>
                  )}

                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedCustomer.email}`} className="text-sm text-primary hover:underline">
                        {selectedCustomer.email}
                      </a>
                    </div>
                  )}

                  {selectedCustomer.contactPerson && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">Contact Person</p>
                        <p className="text-muted-foreground">{selectedCustomer.contactPerson}</p>
                      </div>
                    </div>
                  )}

                  {/* GPS Coordinates */}
                  <div className="bg-muted p-2 rounded text-xs">
                    <p className="font-mono text-muted-foreground">
                      📍 {parseFloat(selectedCustomer.latitude).toFixed(4)}, {parseFloat(selectedCustomer.longitude).toFixed(4)}
                    </p>
                  </div>

                  {/* Notes */}
                  {selectedCustomer.notes && (
                    <div className="bg-muted p-2 rounded text-sm">
                      <p className="font-medium mb-1">Notes</p>
                      <p className="text-muted-foreground text-xs">{selectedCustomer.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Link href={`/visits?customer=${selectedCustomer.id}`}>
                      <Button className="w-full" size="sm" variant="default">
                        <Clock className="h-4 w-4 mr-2" />
                        Start Visit
                      </Button>
                    </Link>
                    <Link href={`/orders?customer=${selectedCustomer.id}`}>
                      <Button className="w-full" size="sm" variant="outline">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Create Order
                      </Button>
                    </Link>
                    <Link href={`/customers?edit=${selectedCustomer.id}`}>
                      <Button className="w-full" size="sm" variant="outline">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Customer
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-6 flex items-center justify-center h-[600px] text-center">
                <CardContent>
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Click on a store pin to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* State Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Customers by State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statesList.map(({ state, count }) => (
                <button
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedState === state
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="font-medium">{state}</span>
                  <span className="text-2xl font-bold">{count}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

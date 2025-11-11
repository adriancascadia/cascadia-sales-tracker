import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Users, MapPin, Package, FileText, TrendingUp, Clock, Plus, Search, Edit, Trash2, Phone, Mail, MapPinIcon, Upload, Download, Bell, User, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  
  const utils = trpc.useUtils();
  const { data: customers, isLoading } = trpc.customers.list.useQuery();
  
  const createMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setIsAddDialogOpen(false);
      toast.success("Customer created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create customer: " + error.message);
    },
  });
  
  const updateMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setEditingCustomer(null);
      toast.success("Customer updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update customer: " + error.message);
    },
  });
  
  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Customer deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete customer: " + error.message);
    },
  });
  
  const bulkImportMutation = trpc.customers.bulkImport.useMutation({
    onSuccess: (result) => {
      toast.success(`Import complete: ${result.success} succeeded, ${result.failed} failed`);
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
      setIsImportDialogOpen(false);
      setImportPreview([]);
      utils.customers.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      contactPerson: formData.get("contactPerson") as string,
      notes: formData.get("notes") as string,
    };
    
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const mapped = data.map((row: any) => ({
          name: row.Name || row.name || "",
          address: row.Address || row.address || "",
          city: row.City || row.city || "",
          state: row.State || row.state || "",
          zipCode: row['Zip Code'] || row.zipCode || row['ZIP'] || "",
          phone: row.Phone || row.phone || row.Telephone || row.telephone || "",
          email: row.Email || row.email || "",
          contactPerson: row['Contact Person'] || row.contactPerson || row.Contact || row.contact || "",
          notes: row.Notes || row.notes || "",
        }));
        
        setImportPreview(mapped);
        toast.success(`Loaded ${mapped.length} customers from file`);
      } catch (error) {
        toast.error("Failed to parse file. Please ensure it's a valid Excel or CSV file.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (importPreview.length === 0) {
      toast.error("No data to import");
      return;
    }
    bulkImportMutation.mutate({ customers: importPreview });
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: "Example Customer",
        "Contact Person": "John Doe",
        Address: "123 Main St",
        City: "Springfield",
        State: "IL",
        "Zip Code": "62701",
        Phone: "555-1234",
        Email: "customer@example.com",
        Notes: "VIP customer",
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customer_import_template.xlsx");
    toast.success("Template downloaded");
  };
  
  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        { href: "/alerts", label: "Alerts", icon: Bell },
        { href: "/reports", label: "Reports", icon: FileText },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage your customer accounts</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Excel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Customers from Excel/CSV</DialogTitle>
                  <DialogDescription>
                    Upload a file with customer data to bulk import
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Button onClick={downloadTemplate} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Download the template to see the required format
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="file-upload">Upload File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                  </div>
                  
                  {importPreview.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Preview ({importPreview.length} customers)</h3>
                      <div className="border rounded-lg overflow-auto max-h-60">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">Contact Person</th>
                              <th className="p-2 text-left">Phone</th>
                              <th className="p-2 text-left">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.slice(0, 10).map((customer, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="p-2">{customer.name}</td>
                                <td className="p-2">{customer.contactPerson}</td>
                                <td className="p-2">{customer.phone}</td>
                                <td className="p-2">{customer.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {importPreview.length > 10 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Showing first 10 of {importPreview.length} customers
                        </p>
                      )}
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={importPreview.length === 0 || bulkImportMutation.isPending}>
                      {bulkImportMutation.isPending ? "Importing..." : "Import"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Enter customer details below
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input id="name" name="name" required />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input id="contactPerson" name="contactPerson" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" name="state" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input id="zipCode" name="zipCode" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Customer"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCustomers && filteredCustomers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <div className="flex gap-1">
                      <Dialog open={editingCustomer?.id === customer.id} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Customer</DialogTitle>
                            <DialogDescription>
                              Update customer details
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Customer Name *</Label>
                                <Input id="edit-name" name="name" defaultValue={customer.name} required />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-contactPerson">Contact Person</Label>
                                <Input id="edit-contactPerson" name="contactPerson" defaultValue={customer.contactPerson || ""} />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Input id="edit-address" name="address" defaultValue={customer.address || ""} />
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-city">City</Label>
                                  <Input id="edit-city" name="city" defaultValue={customer.city || ""} />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-state">State</Label>
                                  <Input id="edit-state" name="state" defaultValue={customer.state || ""} />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-zipCode">ZIP Code</Label>
                                  <Input id="edit-zipCode" name="zipCode" defaultValue={customer.zipCode || ""} />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-phone">Phone</Label>
                                  <Input id="edit-phone" name="phone" type="tel" defaultValue={customer.phone || ""} />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input id="edit-email" name="email" type="email" defaultValue={customer.email || ""} />
                                </div>
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea id="edit-notes" name="notes" rows={3} defaultValue={customer.notes || ""} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setEditingCustomer(null)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Updating..." : "Update Customer"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this customer?")) {
                            deleteMutation.mutate({ id: customer.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.location.href = `/customer-timeline?customerId=${customer.id}`}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customer.contactPerson && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{customer.contactPerson}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPinIcon className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        {customer.address}
                        {customer.city && `, ${customer.city}`}
                        {customer.state && `, ${customer.state}`}
                        {customer.zipCode && ` ${customer.zipCode}`}
                      </span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Get started by adding your first customer or import from Excel"}
              </p>
              {!searchQuery && (
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

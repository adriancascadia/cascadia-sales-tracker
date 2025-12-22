import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPinIcon, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Distributors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: distributors, isLoading } = trpc.distributors.list.useQuery();

  const createMutation = trpc.distributors.create.useMutation({
    onSuccess: () => {
      utils.distributors.list.invalidate();
      setIsAddDialogOpen(false);
      toast.success("Distributor created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create distributor: " + error.message);
    },
  });

  const updateMutation = trpc.distributors.update.useMutation({
    onSuccess: () => {
      utils.distributors.list.invalidate();
      setEditingDistributor(null);
      toast.success("Distributor updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update distributor: " + error.message);
    },
  });

  const deleteMutation = trpc.distributors.delete.useMutation({
    onSuccess: () => {
      utils.distributors.list.invalidate();
      toast.success("Distributor deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete distributor: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      contactPerson: formData.get("contactPerson") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      notes: formData.get("notes") as string,
    };

    if (editingDistributor) {
      updateMutation.mutate({ id: editingDistributor.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredDistributors = distributors?.filter(dist =>
    dist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dist.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Distributors</h1>
            <p className="text-muted-foreground">Manage distributor companies and contacts</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Distributor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Distributor</DialogTitle>
                <DialogDescription>
                  Enter distributor details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input id="name" name="name" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" name="contactPerson" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required />
                      <p className="text-xs text-muted-foreground">Orders will be sent to this email</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" />
                    </div>
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
                    {createMutation.isPending ? "Creating..." : "Create Distributor"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search distributors..."
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
        ) : filteredDistributors && filteredDistributors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDistributors.map((distributor: any) => (
              <Card key={distributor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {distributor.name}
                      </CardTitle>
                      {distributor.isActive === 1 ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={editingDistributor?.id === distributor.id} onOpenChange={(open) => !open && setEditingDistributor(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingDistributor(distributor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Distributor</DialogTitle>
                            <DialogDescription>
                              Update distributor details
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Company Name *</Label>
                                <Input id="edit-name" name="name" defaultValue={distributor.name} required />
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="edit-contactPerson">Contact Person</Label>
                                <Input id="edit-contactPerson" name="contactPerson" defaultValue={distributor.contactPerson || ""} />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-email">Email *</Label>
                                  <Input id="edit-email" name="email" type="email" defaultValue={distributor.email} required />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-phone">Phone</Label>
                                  <Input id="edit-phone" name="phone" type="tel" defaultValue={distributor.phone || ""} />
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Input id="edit-address" name="address" defaultValue={distributor.address || ""} />
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-city">City</Label>
                                  <Input id="edit-city" name="city" defaultValue={distributor.city || ""} />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-state">State</Label>
                                  <Input id="edit-state" name="state" defaultValue={distributor.state || ""} />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-zipCode">ZIP Code</Label>
                                  <Input id="edit-zipCode" name="zipCode" defaultValue={distributor.zipCode || ""} />
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea id="edit-notes" name="notes" rows={3} defaultValue={distributor.notes || ""} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setEditingDistributor(null)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Updating..." : "Update Distributor"}
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
                          if (confirm("Are you sure you want to delete this distributor?")) {
                            deleteMutation.mutate({ id: distributor.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {distributor.contactPerson && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{distributor.contactPerson}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{distributor.email}</span>
                  </div>
                  {distributor.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{distributor.phone}</span>
                    </div>
                  )}
                  {distributor.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPinIcon className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        {distributor.address}
                        {distributor.city && `, ${distributor.city}`}
                        {distributor.state && `, ${distributor.state}`}
                        {distributor.zipCode && ` ${distributor.zipCode}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No distributors found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Get started by adding your first distributor"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Distributor
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

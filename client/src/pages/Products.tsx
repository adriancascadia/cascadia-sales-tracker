import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Users, MapPin, Package, FileText, TrendingUp, Clock, Plus, Search, Edit, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { data: distributors } = trpc.distributors.list.useQuery();
  
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setIsAddDialogOpen(false);
      toast.success("Product created successfully");
    },
  });
  
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setEditingProduct(null);
      toast.success("Product updated successfully");
    },
  });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      category: formData.get("category") as string,
      distributorId: formData.get("distributorId") ? parseInt(formData.get("distributorId") as string) : undefined,
    };
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
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
        { href: "/reports", label: "Reports", icon: FileText },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>SKU *</Label>
                    <Input name="sku" required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Product Name *</Label>
                    <Input name="name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea name="description" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Price *</Label>
                      <Input name="price" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Input name="category" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Distributor</Label>
                    <Select name="distributorId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select distributor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {distributors?.map((dist: any) => (
                          <SelectItem key={dist.id} value={dist.id.toString()}>
                            {dist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Orders for this product will be sent to this distributor</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts?.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {parseFloat(product.price).toFixed(2)}
                </div>
                {product.category && <Badge variant="secondary" className="mt-2">{product.category}</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

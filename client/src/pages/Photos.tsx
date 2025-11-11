import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Users, MapPin, Package, FileText, TrendingUp, Clock, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Photos() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.photos.getByVisit.useQuery({ visitId: selectedVisitId ? parseInt(selectedVisitId) : 0 }, { enabled: false });
  const { data: visits } = trpc.visits.list.useQuery();
  
  const uploadMutation = trpc.photos.upload.useMutation({
    onSuccess: () => {
      utils.photos.getByVisit.invalidate();
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedVisitId("");
      toast.success("Photo uploaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to upload photo: " + error.message);
    },
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        toast.error("File size must be less than 16MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a photo");
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const photoType = formData.get("photoType") as string;
    const caption = formData.get("caption") as string;
    
    setIsUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        uploadMutation.mutate({
          visitId: selectedVisitId ? parseInt(selectedVisitId) : undefined,
          photoType: photoType as any,
          imageData: base64,
          mimeType: selectedFile.type,
          caption,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Failed to process photo");
      setIsUploading(false);
    }
  };
  
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getPhotoTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      before: "Before",
      after: "After",
      merchandising: "Merchandising",
      pos: "Point of Sale",
      product: "Product",
      other: "Other",
    };
    return labels[type] || type;
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
        { href: "/photos", label: "Photos", icon: Camera },
        { href: "/tracking", label: "Live Tracking", icon: MapPin },
        { href: "/reports", label: "Reports", icon: FileText },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Photos</h1>
            <p className="text-muted-foreground">Document visits with before/after photos</p>
          </div>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Photo</DialogTitle>
                <DialogDescription>
                  Take or upload a photo to document your visit
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Visit (Optional)</Label>
                    <Select value={selectedVisitId} onValueChange={setSelectedVisitId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visit" />
                      </SelectTrigger>
                      <SelectContent>
                        {visits?.map((visit) => (
                          <SelectItem key={visit.id} value={visit.id.toString()}>
                            Visit #{visit.id} - {formatDate(visit.checkInTime)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Photo Type *</Label>
                    <Select name="photoType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                        <SelectItem value="merchandising">Merchandising</SelectItem>
                        <SelectItem value="pos">Point of Sale</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Caption</Label>
                    <Textarea name="caption" rows={2} placeholder="Add a description..." />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Photo</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  {previewUrl && (
                    <div className="grid gap-2">
                      <Label>Preview</Label>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsUploadDialogOpen(false);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!selectedFile || isUploading}>
                    {isUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : photos && photos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo: any) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || "Photo"}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2">
                    {getPhotoTypeLabel(photo.photoType)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  {photo.caption && (
                    <p className="text-sm mb-2">{photo.caption}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatDate(photo.uploadedAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start documenting your visits with photos
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

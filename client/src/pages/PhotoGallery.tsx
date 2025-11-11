import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, X, Image as ImageIcon, Calendar, User, MapPin } from "lucide-react";

export default function PhotoGallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRep, setSelectedRep] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch photos
  const { data: photos = [], refetch } = trpc.photos.list.useQuery();
  
  // Fetch users for rep filter
  const { data: users = [] } = trpc.system.listUsers.useQuery();

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Filter photos
  const filteredPhotos = photos.filter((photo: any) => {
    const matchesSearch = 
      searchTerm === "" ||
      (photo.customerName && photo.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (photo.userName && photo.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRep = selectedRep === "all" || photo.userId === parseInt(selectedRep);
    const matchesType = selectedType === "all" || photo.photoType === selectedType;

    return matchesSearch && matchesRep && matchesType;
  });

  // Statistics
  const stats = {
    total: filteredPhotos.length,
    before: filteredPhotos.filter((p: any) => p.photoType === "before").length,
    after: filteredPhotos.filter((p: any) => p.photoType === "after").length,
    other: filteredPhotos.filter((p: any) => p.photoType === "other").length,
  };

  const handleDownload = async (photoUrl: string, photoId: number) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo-${photoId}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download photo:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Photo Gallery</h1>
          <p className="text-muted-foreground">View all photos uploaded by sales reps</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Photos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div>
            <p className="text-sm text-muted-foreground">Before Photos</p>
            <p className="text-2xl font-bold text-orange-600">{stats.before}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div>
            <p className="text-sm text-muted-foreground">After Photos</p>
            <p className="text-2xl font-bold text-green-600">{stats.after}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div>
            <p className="text-sm text-muted-foreground">Other Photos</p>
            <p className="text-2xl font-bold text-gray-600">{stats.other}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by customer or rep name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Sales Rep</label>
            <Select value={selectedRep} onValueChange={setSelectedRep}>
              <SelectTrigger>
                <SelectValue placeholder="All Reps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reps</SelectItem>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Photo Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">No photos found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || selectedRep !== "all" || selectedType !== "all"
              ? "Try adjusting your filters"
              : "Photos will appear here when sales reps upload them"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo: any) => (
            <Card
              key={photo.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || "Photo"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      photo.photoType === "before"
                        ? "bg-orange-100 text-orange-700"
                        : photo.photoType === "after"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {photo.photoType}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">{photo.userName || "Unknown Rep"}</span>
                </div>
                {photo.customerName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{photo.customerName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(photo.createdAt).toLocaleString()}</span>
                </div>
                {photo.caption && (
                  <p className="text-sm mt-2 line-clamp-2">{photo.caption}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Photo Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          selectedPhoto.photoType === "before"
                            ? "bg-orange-100 text-orange-700"
                            : selectedPhoto.photoType === "after"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedPhoto.photoType}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Uploaded by:</span> {selectedPhoto.userName || "Unknown"}
                    </p>
                    {selectedPhoto.customerName && (
                      <p>
                        <span className="font-medium">Customer:</span> {selectedPhoto.customerName}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Date:</span> {new Date(selectedPhoto.createdAt).toLocaleString()}
                    </p>
                    {selectedPhoto.caption && (
                      <p>
                        <span className="font-medium">Caption:</span> {selectedPhoto.caption}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedPhoto.photoUrl, selectedPhoto.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedPhoto(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.caption || "Photo"}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

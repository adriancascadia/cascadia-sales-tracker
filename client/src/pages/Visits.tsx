import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Users,
  MapPin,
  FileText,
  Clock,
  LogIn,
  LogOut,
  Activity,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { LocationService } from "@/lib/location";

export default function Visits() {
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: string;
    longitude: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: visits, isLoading } = trpc.visitData.list.useQuery();
  const { data: activeVisit } = trpc.visitData.getActive.useQuery();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Request permissions first
        await LocationService.requestPermissions();
        const position = await LocationService.getCurrentPosition();
        setCurrentLocation({
          latitude: position.latitude.toString(),
          longitude: position.longitude.toString(),
        });
      } catch (error) {
        console.error("Error getting location:", error);
        toast.error(
          "Unable to get GPS location. Please enable location services."
        );
      }
    };

    fetchLocation();
  }, []);

  const checkInMutation = trpc.visitData.checkIn.useMutation({
    onSuccess: () => {
      utils.visitData.list.invalidate();
      utils.visitData.getActive.invalidate();
      utils.analytics.getOverview.invalidate();
      setIsCheckInDialogOpen(false);
      setSelectedCustomerId("");
      toast.success("Checked in successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to check in: " + error.message);
    },
  });

  const checkOutMutation = trpc.visitData.checkOut.useMutation({
    onSuccess: (data: any) => {
      utils.visitData.list.invalidate();
      utils.visitData.getActive.invalidate();
      utils.analytics.getOverview.invalidate();
      toast.success(
        `Checked out successfully. Visit duration: ${data.duration} minutes`
      );
    },
    onError: (error: any) => {
      toast.error("Failed to check out: " + error.message);
    },
  });

  const addActivityMutation = trpc.visitData.addActivity.useMutation({
    onSuccess: () => {
      utils.visitData.getActivities.invalidate();
      setIsActivityDialogOpen(false);
      toast.success("Activity logged successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to log activity: " + error.message);
    },
  });

  const handleCheckIn = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!currentLocation) {
      toast.error("GPS location not available");
      return;
    }

    checkInMutation.mutate({
      customerId: parseInt(selectedCustomerId),
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      visitType: "scheduled",
    });
  };

  const handleCheckOut = () => {
    if (!activeVisit || !currentLocation) {
      toast.error("Unable to check out");
      return;
    }

    checkOutMutation.mutate({
      visitId: activeVisit.id,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    });
  };

  const handleAddActivity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVisitId) return;

    const formData = new FormData(e.currentTarget);
    addActivityMutation.mutate({
      visitId: selectedVisitId,
      activityType: formData.get("activityType") as any,
      notes: formData.get("notes") as string,
      outcome: formData.get("outcome") as any,
      competitorInfo: formData.get("competitorInfo") as string,
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visitPhoto, setVisitPhoto] = useState<File | null>(null);
  const [visitPhotoPreview, setVisitPhotoPreview] = useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setVisitPhoto(file);

    // preview (opcional)
    if (file) {
      const url = URL.createObjectURL(file);
      setVisitPhotoPreview(url);
    } else {
      setVisitPhotoPreview(null);
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Visits</h1>
            <p className="text-muted-foreground">
              Track customer visits and activities
            </p>
          </div>
        </div>

        {activeVisit ? (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                Active Visit
              </CardTitle>
              <CardDescription>You are currently checked in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">
                    {customers?.find(
                      (c: any) => c.id === activeVisit.customerId
                    )?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check-in Time:</span>
                  <span className="font-medium">
                    {formatDateTime(activeVisit.checkInTime)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog
                  open={isActivityDialogOpen}
                  onOpenChange={setIsActivityDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedVisitId(activeVisit.id)}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Log Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Visit Activity</DialogTitle>
                      <DialogDescription>
                        Record what happened during this visit
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddActivity}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="activityType">Activity Type *</Label>
                          <Select name="activityType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sales_call">
                                Sales Call
                              </SelectItem>
                              <SelectItem value="merchandising">
                                Merchandising
                              </SelectItem>
                              <SelectItem value="service">Service</SelectItem>
                              <SelectItem value="delivery">Delivery</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="outcome">Outcome</Label>
                          <Select name="outcome">
                            <SelectTrigger>
                              <SelectValue placeholder="Select outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="order_placed">
                                Order Placed
                              </SelectItem>
                              <SelectItem value="follow_up">
                                Follow-up Needed
                              </SelectItem>
                              <SelectItem value="no_action">
                                No Action
                              </SelectItem>
                              <SelectItem value="issue_resolved">
                                Issue Resolved
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea id="notes" name="notes" rows={4} />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="competitorInfo">
                            Competitor Information
                          </Label>
                          <Textarea
                            id="competitorInfo"
                            name="competitorInfo"
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsActivityDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={addActivityMutation.isPending}
                        >
                          {addActivityMutation.isPending
                            ? "Saving..."
                            : "Save Activity"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isPending}
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {checkOutMutation.isPending ? "Checking Out..." : "Check Out"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Start a Visit</CardTitle>
              <CardDescription>
                Check in at a customer location to begin tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog
                open={isCheckInDialogOpen}
                onOpenChange={setIsCheckInDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Check In</DialogTitle>
                    <DialogDescription>
                      Select a customer to check in
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="customer">Customer *</Label>
                      <Select
                        value={selectedCustomerId}
                        onValueChange={setSelectedCustomerId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers?.map((customer: any) => (
                            <SelectItem
                              key={customer.id}
                              value={customer.id.toString()}
                            >
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentLocation && (
                      <>
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          GPS Location:{" "}
                          {parseFloat(currentLocation.latitude).toFixed(
                            6
                          )}, {parseFloat(currentLocation.longitude).toFixed(6)}
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleButtonClick}
                          >
                            Upload Photo
                          </Button>

                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                        </div>

                        {visitPhotoPreview && (
                          <img
                            src={visitPhotoPreview}
                            alt="Preview"
                            className="mt-2 w-full max-w-xs rounded-md border"
                          />
                        )}
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCheckInDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCheckIn}
                      disabled={checkInMutation.isPending || !currentLocation}
                    >
                      {checkInMutation.isPending
                        ? "Checking In..."
                        : "Check In"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Visit History</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : visits && visits.length > 0 ? (
            <div className="space-y-4">
              {visits.map((visit: any) => {
                const customer = customers?.find(
                  (c: any) => c.id === visit.customerId
                );
                return (
                  <Card key={visit.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {visit.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-yellow-600" />
                            )}
                            <h3 className="font-semibold text-lg">
                              {customer?.name || "Unknown Customer"}
                            </h3>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              Check-in: {formatDateTime(visit.checkInTime)}
                            </div>
                            {visit.checkOutTime && (
                              <div>
                                Check-out: {formatDateTime(visit.checkOutTime)}
                              </div>
                            )}
                            {visit.visitDuration && (
                              <div>
                                Duration: {formatDuration(visit.visitDuration)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVisitId(visit.id);
                              setIsActivityDialogOpen(true);
                            }}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Add Activity
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No visits yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking by checking in at a customer location
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

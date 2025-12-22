import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Play, Square, Trash2, Edit2, MapPin, Clock, Gauge } from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";

export default function MileageTracking() {
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [endOdometer, setEndOdometer] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch active mileage log
  const { data: activeLog, refetch: refetchActive } = trpc.mileage.getActive.useQuery();

  // Fetch all mileage logs for current user
  const { data: allLogs = [], refetch: refetchAll } = trpc.mileage.list.useQuery();

  // Mutations
  const startMileageMutation = trpc.mileage.start.useMutation({
    onSuccess: () => {
      toast.success("Mileage tracking started");
      refetchActive();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to start mileage tracking: ${error.message}`);
    },
  });

  const endMileageMutation = trpc.mileage.end.useMutation({
    onSuccess: () => {
      toast.success("Mileage tracking ended");
      setShowEndDialog(false);
      setEndOdometer("");
      setNotes("");
      refetchActive();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to end mileage tracking: ${error.message}`);
    },
  });

  const deleteMileageMutation = trpc.mileage.delete.useMutation({
    onSuccess: () => {
      toast.success("Mileage log deleted");
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to delete mileage log: ${error.message}`);
    },
  });

  const handleStartMileage = async () => {
    const startLocation = "Current Location";
    startMileageMutation.mutate({
      startLocation,
      routeId: undefined,
    });
  };

  const handleEndMileage = async () => {
    if (!activeLog) {
      toast.error("No active mileage log");
      return;
    }

    if (!endOdometer) {
      toast.error("Please enter end odometer reading");
      return;
    }

    const startOdometer = parseFloat((activeLog as any).startOdometer || "0");
    const end = parseFloat(endOdometer);

    if (end < startOdometer) {
      toast.error("End odometer must be greater than start odometer");
      return;
    }

    const totalDistance = (end - startOdometer).toFixed(2);

    endMileageMutation.mutate({
      logId: activeLog.id,
      endLocation: "Current Location",
      totalDistance,
    });
  };

  const handleDeleteLog = (logId: number) => {
    if (confirm("Are you sure you want to delete this mileage log?")) {
      deleteMileageMutation.mutate({ logId });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const calculateDuration = (startTime: Date, endTime?: Date) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mileage Tracking</h1>
          <p className="text-muted-foreground">Log your daily mileage for reimbursement</p>
        </div>

        {/* Active Mileage Log */}
        {activeLog ? (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Gauge className="h-5 w-5" />
                Active Mileage Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-semibold">{formatDate(activeLog.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Odometer</p>
                  <p className="font-semibold text-lg">{(activeLog as any).startOdometer} mi</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{calculateDuration(activeLog.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold text-blue-600">Active</p>
                </div>
              </div>

              <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Square className="h-4 w-4 mr-2" />
                    End Mileage Log
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>End Mileage Log</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Start Odometer</label>
                      <Input
                        type="number"
                        value={(activeLog as any).startOdometer}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">End Odometer (miles)</label>
                      <Input
                        type="number"
                        placeholder="Enter end odometer reading"
                        value={endOdometer}
                        onChange={(e) => setEndOdometer(e.target.value)}
                        step="0.1"
                      />
                    </div>
                    {endOdometer && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Distance</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {(parseFloat(endOdometer) - parseFloat((activeLog as any).startOdometer || "0")).toFixed(2)} mi
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                      <Textarea
                        placeholder="Add any notes about your route or stops..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowEndDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEndMileage}
                        disabled={endMileageMutation.isPending}
                        className="flex-1"
                      >
                        {endMileageMutation.isPending ? "Saving..." : "End Log"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-500" />
                No Active Mileage Log
              </CardTitle>
              <CardDescription>Start tracking your mileage for the day</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleStartMileage}
                disabled={startMileageMutation.isPending}
                size="lg"
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {startMileageMutation.isPending ? "Starting..." : "Start Mileage Log"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mileage History */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Mileage History</h2>

          {allLogs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No mileage logs yet</p>
                <p className="text-sm text-muted-foreground">Start tracking to see your history</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {allLogs.map((log: any) => (
                <Card key={log.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{formatDate(log.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Distance</p>
                        <p className="font-semibold text-lg">
                          {log.totalDistance ? `${log.totalDistance} mi` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">
                          {log.endTime ? calculateDuration(log.startTime, log.endTime) : "Active"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p
                          className={`font-semibold ${log.status === "completed"
                            ? "text-green-600"
                            : log.status === "active"
                              ? "text-blue-600"
                              : "text-gray-600"
                            }`}
                        >
                          {log.status === "completed" ? "Completed" : "Active"}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {log.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLog(log.id)}
                            disabled={deleteMileageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {log.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{log.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gauge, TrendingUp, Users, DollarSign, Download } from "lucide-react";
import { toast } from "sonner";

const MILEAGE_REIMBURSEMENT_RATE = 0.655; // IRS standard mileage rate

export default function MileageReports() {
  const [selectedRep, setSelectedRep] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch all mileage logs (admin view)
  const { data: allLogs = [] } = trpc.mileage.getAllLogs.useQuery();

  // Fetch all users for rep filter
  const { data: users = [] } = trpc.system.listUsers.useQuery();

  // Filter logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log: any) => {
      const matchesRep = selectedRep === "all" || log.userId === parseInt(selectedRep);
      
      let matchesDate = true;
      if (startDate || endDate) {
        const logDate = new Date(log.startTime);
        if (startDate) {
          const start = new Date(startDate);
          matchesDate = matchesDate && logDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && logDate <= end;
        }
      }

      return matchesRep && matchesDate;
    });
  }, [allLogs, selectedRep, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedLogs = filteredLogs.filter((log: any) => log.status === "completed");
    const totalMiles = completedLogs.reduce((sum: number, log: any) => {
      return sum + (parseFloat(log.totalDistance) || 0);
    }, 0);
    
    const totalReps = new Set(filteredLogs.map((log: any) => log.userId)).size;
    const totalReimbursement = totalMiles * MILEAGE_REIMBURSEMENT_RATE;

    return {
      totalMiles: totalMiles.toFixed(2),
      totalReps,
      totalReimbursement: totalReimbursement.toFixed(2),
      completedLogs: completedLogs.length,
      activeLogs: filteredLogs.filter((log: any) => log.status === "active").length,
    };
  }, [filteredLogs]);

  // Group logs by rep
  const logsByRep = useMemo(() => {
    const grouped: { [key: number]: any[] } = {};
    filteredLogs.forEach((log: any) => {
      if (!grouped[log.userId]) {
        grouped[log.userId] = [];
      }
      grouped[log.userId].push(log);
    });
    return grouped;
  }, [filteredLogs]);

  // Calculate rep summaries
  const repSummaries = useMemo(() => {
    return Object.entries(logsByRep).map(([userId, logs]: [string, any[]]) => {
      const completedLogs = logs.filter((log: any) => log.status === "completed");
      const totalMiles = completedLogs.reduce((sum: number, log: any) => {
        return sum + (parseFloat(log.totalDistance) || 0);
      }, 0);
      const totalReimbursement = totalMiles * MILEAGE_REIMBURSEMENT_RATE;
      const user = users.find((u: any) => u.id === parseInt(userId));

      return {
        userId: parseInt(userId),
        userName: user?.name || user?.email || "Unknown",
        totalMiles: totalMiles.toFixed(2),
        totalReimbursement: totalReimbursement.toFixed(2),
        logCount: completedLogs.length,
        avgDistance: (totalMiles / completedLogs.length).toFixed(2),
      };
    });
  }, [logsByRep, users]);

  const handleExportCSV = () => {
    const headers = ["Date", "Rep Name", "Start Odometer", "End Odometer", "Distance (mi)", "Status", "Notes"];
    const rows = filteredLogs.map((log: any) => {
      const user = users.find((u: any) => u.id === log.userId);
      return [
        new Date(log.startTime).toLocaleString(),
        user?.name || user?.email || "Unknown",
        log.startOdometer || "—",
        log.endOdometer || "—",
        log.totalDistance || "—",
        log.status,
        log.notes || "",
      ];
    });

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mileage-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Report exported successfully");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mileage Reports</h1>
        <p className="text-muted-foreground">Track mileage and calculate reimbursements</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Total Miles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalMiles}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.completedLogs} completed logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Reimbursement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.totalReimbursement}</p>
            <p className="text-xs text-muted-foreground mt-1">@ ${MILEAGE_REIMBURSEMENT_RATE}/mi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sales Reps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalReps}</p>
            <p className="text-xs text-muted-foreground mt-1">with mileage logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeLogs}</p>
            <p className="text-xs text-muted-foreground mt-1">in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rep Summary Table */}
      {repSummaries.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rep Summary</CardTitle>
            <CardDescription>Mileage and reimbursement by sales representative</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Rep Name</th>
                    <th className="text-right py-3 px-4 font-semibold">Logs</th>
                    <th className="text-right py-3 px-4 font-semibold">Total Miles</th>
                    <th className="text-right py-3 px-4 font-semibold">Avg Distance</th>
                    <th className="text-right py-3 px-4 font-semibold">Reimbursement</th>
                  </tr>
                </thead>
                <tbody>
                  {repSummaries.map((rep) => (
                    <tr key={rep.userId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{rep.userName}</td>
                      <td className="text-right py-3 px-4">{rep.logCount}</td>
                      <td className="text-right py-3 px-4 font-semibold">{rep.totalMiles} mi</td>
                      <td className="text-right py-3 px-4">{rep.avgDistance} mi</td>
                      <td className="text-right py-3 px-4 font-semibold text-green-600">
                        ${rep.totalReimbursement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Detailed Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Mileage Logs</CardTitle>
          <CardDescription>Detailed view of all mileage entries</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No mileage logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Rep Name</th>
                    <th className="text-right py-3 px-4 font-semibold">Start Odometer</th>
                    <th className="text-right py-3 px-4 font-semibold">End Odometer</th>
                    <th className="text-right py-3 px-4 font-semibold">Distance</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Reimbursement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log: any) => {
                    const user = users.find((u: any) => u.id === log.userId);
                    const distance = parseFloat(log.totalDistance) || 0;
                    const reimbursement = (distance * MILEAGE_REIMBURSEMENT_RATE).toFixed(2);

                    return (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(log.startTime)}</td>
                        <td className="py-3 px-4">{user?.name || user?.email || "Unknown"}</td>
                        <td className="text-right py-3 px-4">{log.startOdometer || "—"}</td>
                        <td className="text-right py-3 px-4">{log.endOdometer || "—"}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {log.totalDistance ? `${log.totalDistance} mi` : "—"}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {log.status === "completed" ? "Completed" : "Active"}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {log.status === "completed" ? `$${reimbursement}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

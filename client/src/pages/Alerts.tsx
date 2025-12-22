import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { MapPin, Clock, AlertTriangle, CheckCircle2, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Alerts() {
  const { data: alerts, refetch } = trpc.alerts.list.useQuery();
  const { data: unreadAlerts } = trpc.alerts.unread.useQuery();
  const utils = trpc.useUtils();

  const markAsReadMutation = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.alerts.unread.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.alerts.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.alerts.unread.invalidate();
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'route_deviation':
        return <MapPin className="h-5 w-5" />;
      case 'significant_delay':
        return <Clock className="h-5 w-5" />;
      case 'missed_stop':
        return <AlertTriangle className="h-5 w-5" />;
      case 'extended_visit':
        return <Clock className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'route_deviation':
        return 'Route Deviation';
      case 'significant_delay':
        return 'Significant Delay';
      case 'missed_stop':
        return 'Missed Stop';
      case 'extended_visit':
        return 'Extended Visit';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Alerts</h1>
            <p className="text-muted-foreground">Monitor route deviations and delays</p>
          </div>
          {unreadAlerts && unreadAlerts.length > 0 && (
            <Button onClick={() => markAllAsReadMutation.mutate()}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreadAlerts?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {alerts?.filter(a => a.severity === 'high').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${alert.isRead === 0 ? 'bg-muted/50 border-primary' : 'bg-background'
                      }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getAlertTypeIcon(alert.alertType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {getAlertTypeLabel(alert.alertType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm mb-2">{alert.message}</p>

                      {alert.metadata && (
                        <div className="text-xs text-muted-foreground">
                          <details className="cursor-pointer">
                            <summary>View details</summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(JSON.parse(alert.metadata), null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>

                    {alert.isRead === 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate({ id: alert.id })}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts</h3>
                <p className="text-sm text-muted-foreground">
                  All routes are running smoothly
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

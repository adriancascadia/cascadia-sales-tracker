import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface RepLocation {
  userId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
  status: "active" | "idle" | "offline";
}

export function useRouteGpsTracking(routeId: number, pollInterval: number = 5000) {
  const [repLocations, setRepLocations] = useState<RepLocation[]>([]);
  const [isPolling, setIsPolling] = useState(true);

  // Use polling to get GPS tracking data
  const { data: gpsData, isLoading, refetch } = trpc.gpsTracking.getGpsTracking.useQuery(
    { routeId },
    {
      refetchInterval: isPolling ? pollInterval : false,
      enabled: isPolling,
    }
  );

  useEffect(() => {
    if (gpsData?.repLocations) {
      setRepLocations(
        gpsData.repLocations.map(rep => ({
          ...rep,
          userName: `Rep ${rep.userId}`, // In a real app, fetch the user name
        }))
      );
    }
  }, [gpsData]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);

  return {
    repLocations,
    isLoading,
    isPolling,
    startPolling,
    stopPolling,
    refetch,
  };
}

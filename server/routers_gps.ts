import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const gpsTrackingRouter = {
  getGpsTracking: protectedProcedure
    .input(z.object({ routeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const route = await db.getRouteById(input.routeId);
      if (!route) throw new Error("Route not found");
      if (route.userId !== ctx.user.id) throw new Error("Unauthorized");
      
      const gpsTrack = await db.getLatestGpsTrackByUserId(route.userId);
      
      if (!gpsTrack) {
        return { repLocations: [], lastUpdate: null };
      }
      
      return {
        repLocations: [
          {
            userId: gpsTrack.userId,
            latitude: parseFloat(gpsTrack.latitude),
            longitude: parseFloat(gpsTrack.longitude),
            speed: gpsTrack.speed ? parseFloat(gpsTrack.speed) : undefined,
            heading: gpsTrack.heading ? parseFloat(gpsTrack.heading) : undefined,
            accuracy: gpsTrack.accuracy || undefined,
            timestamp: gpsTrack.timestamp.getTime(),
            status: "active",
          },
        ],
        lastUpdate: gpsTrack.timestamp,
      };
    }),
};

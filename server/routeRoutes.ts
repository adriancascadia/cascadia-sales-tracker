import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const routeAutoAssignRouter = router({
  getWithStops: protectedProcedure
    .input(z.object({ routeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getRouteWithStops(input.routeId);
    }),
  
  autoAssignCustomers: protectedProcedure
    .input(z.object({
      routeId: z.number(),
      method: z.enum(["nearest-neighbor", "priority"]).default("nearest-neighbor"),
    }))
    .mutation(async ({ ctx, input }) => {
      const route = await db.getRouteById(input.routeId);
      if (!route) throw new Error("Route not found");
      if (route.userId !== ctx.user.id) throw new Error("Unauthorized");
      
      const customers = await db.getCustomersByUserId(ctx.user.id);
      const customerIds = customers
        .filter(c => c.latitude && c.longitude)
        .map(c => c.id);
      
      if (customerIds.length === 0) {
        throw new Error("No customers with location data available");
      }
      
      return await db.assignCustomersToRoute(input.routeId, customerIds);
    }),
});

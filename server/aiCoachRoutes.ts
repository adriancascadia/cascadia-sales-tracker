import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getObjectionHandling,
  getCustomerStrategy,
  getSalesCoaching,
  CoachingContext,
} from "./aiCoach";

export const aiCoachRouter = router({
  /**
   * Get coaching advice for handling a sales objection
   */
  handleObjection: protectedProcedure
    .input(
      z.object({
        objection: z.string().describe("The sales objection to handle"),
        customerName: z.string().optional(),
        industry: z.string().optional(),
        lastVisit: z.string().optional(),
        orderHistory: z.string().optional(),
        repExperience: z.enum(["junior", "mid", "senior"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const context: CoachingContext = {
        customerName: input.customerName,
        industry: input.industry,
        lastVisit: input.lastVisit,
        orderHistory: input.orderHistory,
        repExperience: input.repExperience,
      };

      return await getObjectionHandling(input.objection, context);
    }),

  /**
   * Get personalized customer strategy
   */
  getCustomerStrategy: protectedProcedure
    .input(
      z.object({
        customerName: z.string().optional(),
        industry: z.string().optional(),
        lastVisit: z.string().optional(),
        orderHistory: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const context: CoachingContext = {
        customerName: input.customerName,
        industry: input.industry,
        lastVisit: input.lastVisit,
        orderHistory: input.orderHistory,
      };

      return await getCustomerStrategy(context);
    }),

  /**
   * Get general sales coaching on a topic
   */
  getSalesCoaching: protectedProcedure
    .input(
      z.object({
        topic: z.string().describe("The sales topic or challenge"),
        customerName: z.string().optional(),
        industry: z.string().optional(),
        repExperience: z.enum(["junior", "mid", "senior"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const context: CoachingContext = {
        customerName: input.customerName,
        industry: input.industry,
        repExperience: input.repExperience,
      };

      return await getSalesCoaching(input.topic, context);
    }),
});

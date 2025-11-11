import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const companyRouter = router({
  // Get company information
  getInfo: protectedProcedure.query(async ({ ctx }) => {
    return await db.getCompanyById(ctx.user.companyId);
  }),

  // Get team members for the company
  getTeamMembers: adminProcedure.query(async ({ ctx }) => {
    return await db.getUsersByCompanyId(ctx.user.companyId);
  }),

  // Add team member (admin only)
  addTeamMember: adminProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create user with company context
      await db.createUser({
        email: input.email,
        companyId: ctx.user.companyId,
        role: input.role,
        name: input.email.split("@")[0],
        openId: `pending-${Date.now()}`, // Placeholder until user signs up
      });
      return { success: true };
    }),

  // Remove team member (admin only)
  removeTeamMember: adminProcedure
    .input(z.object({ memberId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify member belongs to company
      const member = await db.getUserById(input.memberId);
      if (!member || member.companyId !== ctx.user.companyId) {
        throw new Error("Unauthorized");
      }
      await db.deleteUser(input.memberId);
      return { success: true };
    }),

  // Update team member role (admin only)
  updateTeamMemberRole: adminProcedure
    .input(z.object({
      memberId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify member belongs to company
      const member = await db.getUserById(input.memberId);
      if (!member || member.companyId !== ctx.user.companyId) {
        throw new Error("Unauthorized");
      }
      await db.updateUser(input.memberId, { role: input.role });
      return { success: true };
    }),

  // Get company analytics
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const company = await db.getCompanyById(ctx.user.companyId);
    const teamMembers = await db.getUsersByCompanyId(ctx.user.companyId);
    const totalCustomers = await db.getCustomerCountByCompanyId(ctx.user.companyId);
    const totalOrders = await db.getOrderCountByCompanyId(ctx.user.companyId);
    const totalVisits = await db.getVisitCountByCompanyId(ctx.user.companyId);

    return {
      company,
      teamSize: teamMembers.length,
      totalCustomers,
      totalOrders,
      totalVisits,
    };
  }),
});

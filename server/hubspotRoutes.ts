import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { hubspotService } from "./hubspot";
import { z } from "zod";

export const hubspotRouter = router({
  /**
   * Check if HubSpot is configured
   */
  isConfigured: publicProcedure.query(() => {
    return {
      configured: hubspotService.isConfigured(),
    };
  }),

  /**
   * Get all HubSpot contacts
   */
  getContacts: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const contacts = await hubspotService.getContacts(input.limit);
      return {
        success: true,
        count: contacts.length,
        contacts,
      };
    }),

  /**
   * Get HubSpot contact by email
   */
  getContactByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const contact = await hubspotService.getContactByEmail(input.email);
      return {
        success: !!contact,
        contact,
      };
    }),

  /**
   * Sync customer to HubSpot
   */
  syncCustomer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contact = await hubspotService.syncCustomerToHubSpot(input);
      return {
        success: !!contact,
        contact,
      };
    }),

  /**
   * Get all HubSpot deals
   */
  getDeals: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const deals = await hubspotService.getDeals(input.limit);
      return {
        success: true,
        count: deals.length,
        deals,
      };
    }),

  /**
   * Sync order to HubSpot deal
   */
  syncOrder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        customerName: z.string(),
        customerEmail: z.string().email().optional(),
        totalAmount: z.number(),
        status: z.string(),
        createdAt: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const deal = await hubspotService.syncOrderToHubSpot(input);
      return {
        success: !!deal,
        deal,
      };
    }),

  /**
   * Create note in HubSpot
   */
  createNote: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        noteText: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await hubspotService.createNote(
        input.contactId,
        input.noteText
      );
      return {
        success,
      };
    }),

  /**
   * Sync all customers to HubSpot
   */
  syncAllCustomers: protectedProcedure
    .input(
      z.object({
        customers: z.array(
          z.object({
            name: z.string(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            industry: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results = await Promise.all(
        input.customers.map((customer) =>
          hubspotService.syncCustomerToHubSpot(customer)
        )
      );

      const successful = results.filter((r) => r !== null).length;
      return {
        success: true,
        total: input.customers.length,
        successful,
        failed: input.customers.length - successful,
      };
    }),

  /**
   * Sync all orders to HubSpot
   */
  syncAllOrders: protectedProcedure
    .input(
      z.object({
        orders: z.array(
          z.object({
            id: z.string(),
            customerName: z.string(),
            customerEmail: z.string().email().optional(),
            totalAmount: z.number(),
            status: z.string(),
            createdAt: z.date(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results = await Promise.all(
        input.orders.map((order) =>
          hubspotService.syncOrderToHubSpot(order)
        )
      );

      const successful = results.filter((r) => r !== null).length;
      return {
        success: true,
        total: input.orders.length,
        successful,
        failed: input.orders.length - successful,
      };
    }),
});

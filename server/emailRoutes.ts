import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { sendOrderConfirmationEmail, sendVisitReminderEmail, sendAlertEmail } from "./email";

export const emailRouter = router({
  sendOrderConfirmation: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      customerEmail: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      try {
        const order = await db.getOrderById(input.orderId);
        const customer = order ? await db.getCustomerById(order.customerId) : null;
        
        if (!order || !customer) {
          throw new Error('Order or customer not found');
        }
        
        const items = await db.getOrderItemsByOrderId(input.orderId);
        const success = await sendOrderConfirmationEmail(input.customerEmail, {
          orderNumber: order.orderNumber,
          customerName: customer.name || 'Valued Customer',
          totalAmount: order.totalAmount,
          itemCount: items.length,
          specialInstructions: order.specialInstructions || undefined,
          repName: 'Your Sales Representative',
        });
        
        if (!success) {
          throw new Error('Failed to send email');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send confirmation email',
        });
      }
    }),

  sendVisitReminder: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      customerEmail: z.string().email(),
      visitDate: z.string(),
      visitTime: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const customer = await db.getCustomerById(input.customerId);
        
        if (!customer) {
          throw new Error('Customer not found');
        }
        
        const success = await sendVisitReminderEmail(input.customerEmail, {
          customerName: customer.name || 'Valued Customer',
          visitDate: input.visitDate,
          visitTime: input.visitTime,
          repName: 'Your Sales Representative',
          address: customer.address || undefined,
        });
        
        if (!success) {
          throw new Error('Failed to send email');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Failed to send visit reminder:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send visit reminder',
        });
      }
    }),

  sendAlert: protectedProcedure
    .input(z.object({
      managerEmail: z.string().email(),
      title: z.string(),
      message: z.string(),
      severity: z.enum(['info', 'warning', 'error']),
      actionUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const success = await sendAlertEmail(input.managerEmail, {
          title: input.title,
          message: input.message,
          severity: input.severity,
          actionUrl: input.actionUrl,
        });
        
        if (!success) {
          throw new Error('Failed to send email');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Failed to send alert email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send alert email',
        });
      }
    }),
});

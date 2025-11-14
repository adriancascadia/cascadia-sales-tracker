import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { companyRouter } from "./companyRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import { generateInvoicePDF } from "./pdfService";
import * as db from "./db";
import { sendOrderEmailsMultiDistributor } from "./emailService";
import { notifyOwner } from "./_core/notification";
import { sendOrderConfirmationEmail, sendVisitReminderEmail, sendAlertEmail } from "./email";
import { emailRouter } from "./emailRoutes";
import { aiCoachRouter } from "./aiCoachRoutes";
import { hubspotRouter } from "./hubspotRoutes";
import { gpsTrackingRouter } from "./routers_gps";
import { playbookRouter } from "./playbookRoutes";

// ============= CUSTOMER ROUTER =============

const customerRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") {
      return await db.getAllCustomers();
    }
    return await db.getCustomersByUserId(ctx.user.id);
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createCustomer({
        ...input,
        companyId: ctx.user.companyId,
        userId: ctx.user.id,
      });
      return { success: true };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCustomer(id, data);
      return { success: true };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCustomer(input.id);
      return { success: true };
    }),
  
  bulkImport: protectedProcedure
    .input(z.object({
      customers: z.array(z.object({
        name: z.string(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        contactPerson: z.string().optional(),
        notes: z.string().optional(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const results = { success: 0, failed: 0, errors: [] as string[] };
      
      for (const customer of input.customers) {
        try {
          await db.createCustomer({
            companyId: ctx.user.companyId,
            userId: ctx.user.id,
            ...customer,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to import ${customer.name}: ${error}`);
        }
      }
      
      return results;
    }),
});

// ============= ROUTE ROUTER =============

const routeRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getRoutesByUserId(ctx.user.id);
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getRouteById(input.id);
    }),
  
  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db.getRoutesByDate(ctx.user.id, input.date);
    }),
  
  getTodayByUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const today = new Date().toISOString().split('T')[0];
      const routes = await db.getRoutesByDate(input.userId, today);
      return routes.length > 0 ? routes[0] : null;
    }),
  
  create: protectedProcedure
    .input(z.object({
      routeName: z.string(),
      routeDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createRoute({
        companyId: ctx.user.companyId,
        routeName: input.routeName,
        routeDate: new Date(input.routeDate),
        userId: ctx.user.id,
        status: "planned",
      });
      return { success: true };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      routeName: z.string().optional(),
      routeDate: z.string().optional(),
      status: z.enum(["planned", "in_progress", "completed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, routeDate, ...data } = input;
      const updateData = {
        ...data,
        ...(routeDate ? { routeDate: new Date(routeDate) } : {}),
      };
      await db.updateRoute(id, updateData);
      return { success: true };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteRoute(input.id);
      return { success: true };
    }),
  
  // Route stops
  getStops: protectedProcedure
    .input(z.object({ routeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getRouteStopsByRouteId(input.routeId);
    }),
  
  addStop: protectedProcedure
    .input(z.object({
      routeId: z.number(),
      customerId: z.number(),
      stopOrder: z.number(),
      plannedArrival: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { plannedArrival, ...data } = input;
      await db.createRouteStop({
        ...data,
        ...(plannedArrival ? { plannedArrival: new Date(plannedArrival) } : {}),
      });
      return { success: true };
    }),
  
  updateStop: protectedProcedure
    .input(z.object({
      id: z.number(),
      stopOrder: z.number().optional(),
      plannedArrival: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, plannedArrival, ...data } = input;
      const updateData = {
        ...data,
        ...(plannedArrival ? { plannedArrival: new Date(plannedArrival) } : {}),
      };
      await db.updateRouteStop(id, updateData);
      return { success: true };
    }),
  
  deleteStop: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteRouteStop(input.id);
      return { success: true };
    }),
  
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

// ============= VISIT ROUTER =============

const visitRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getVisitsByUserId(ctx.user.id);
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getVisitById(input.id);
    }),
  
  getByCustomer: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getVisitsByCustomerId(input.customerId);
    }),
  
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return await db.getActiveVisitByUserId(ctx.user.id);
  }),
  
  checkIn: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      routeStopId: z.number().optional(),
      latitude: z.string(),
      longitude: z.string(),
      visitType: z.enum(["scheduled", "unscheduled"]).default("scheduled"),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createVisit({
        companyId: ctx.user.companyId,
        userId: ctx.user.id,
        customerId: input.customerId,
        routeStopId: input.routeStopId,
        checkInTime: new Date(),
        checkInLatitude: input.latitude,
        checkInLongitude: input.longitude,
        visitType: input.visitType,
        status: "in_progress",
      });
      return { success: true };
    }),
  
  checkOut: protectedProcedure
    .input(z.object({
      visitId: z.number(),
      latitude: z.string(),
      longitude: z.string(),
    }))
    .mutation(async ({ input }) => {
      const visit = await db.getVisitById(input.visitId);
      if (!visit) {
        throw new Error("Visit not found");
      }
      
      const checkOutTime = new Date();
      const checkInTime = new Date(visit.checkInTime);
      const durationMinutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 60000);
      
      await db.updateVisit(input.visitId, {
        checkOutTime: checkOutTime,
        checkOutLatitude: input.latitude,
        checkOutLongitude: input.longitude,
        visitDuration: durationMinutes,
        status: "completed",
      });
      
      return { success: true, duration: durationMinutes };
    }),
  
  // Visit activities
  getActivities: protectedProcedure
    .input(z.object({ visitId: z.number() }))
    .query(async ({ input }) => {
      return await db.getVisitActivitiesByVisitId(input.visitId);
    }),
  
  addActivity: protectedProcedure
    .input(z.object({
      visitId: z.number(),
      activityType: z.enum(["sales_call", "merchandising", "service", "delivery", "other"]),
      notes: z.string().optional(),
      outcome: z.enum(["order_placed", "follow_up", "no_action", "issue_resolved"]).optional(),
      competitorInfo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createVisitActivity(input);
      return { success: true };
    }),
});

// ============= PRODUCT ROUTER =============

const productRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllProducts();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      sku: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.string(),
      category: z.string().optional(),
      distributorId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createProduct({
        ...input,
        active: true,
      });
      return { success: true };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      sku: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      category: z.string().optional(),
      distributorId: z.number().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateProduct(id, data);
      return { success: true };
    }),
});

// ============= ORDER ROUTER =============

const orderRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getOrdersByUserId(ctx.user.id);
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrderById(input.id);
    }),
  
  getByCustomer: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrdersByCustomerId(input.customerId);
    }),
  
  create: protectedProcedure
    .input(z.object({
      visitId: z.number().optional(),
      customerId: z.number(),
      orderNumber: z.string(),
      totalAmount: z.string(),
      specialInstructions: z.string().optional(),
      internalNotes: z.string().optional(),
      internalNotesAuthor: z.string().optional(),
      internalNotesTimestamp: z.date().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitPrice: z.string(),
        lineTotal: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input;
      
      const result = await db.createOrder({
        ...orderData,
        companyId: ctx.user.companyId,
        userId: ctx.user.id,
        orderDate: new Date(),
        status: "pending",
      });
      
      const orderId = Number(result[0].insertId);
      
      for (const item of items) {
        await db.createOrderItem({
          orderId,
          ...item,
        });
      }
      
      // Automatically determine distributor from products and send email
      const firstItem = items[0];
      if (firstItem) {
        const product = await db.getProductById(firstItem.productId);
        if (product?.distributorId) {
          // Update order with distributor
          await db.updateOrder(orderId, { distributorId: product.distributorId });
          
          // Send emails to all distributors (automatically splits if multiple)
          try {
            const sentDistributors = await sendOrderEmailsMultiDistributor(orderId);
            if (sentDistributors.length > 0) {
              console.log(`✅ Order #${input.orderNumber} sent to ${sentDistributors.length} distributor(s)`);
            } else {
              console.error(`❌ No distributors received order #${input.orderNumber}`);
            }
          } catch (error) {
            console.error(`❌ Failed to send order emails for order #${input.orderNumber}:`, error);
          }
        }
      }
      
      // Send notification to managers if internal notes were added
      if (input.internalNotes && input.internalNotes.trim()) {
        try {
          const customer = await db.getCustomerById(input.customerId);
          await notifyOwner({
            title: `New Internal Note on Order ${input.orderNumber}`,
            content: `${input.internalNotesAuthor || ctx.user.name || 'A sales rep'} added an internal note to order ${input.orderNumber} for ${customer?.name || 'a customer'}:\n\n"${input.internalNotes}"\n\nOrder Total: $${input.totalAmount}`,
          });
          console.log(`✅ Manager notified about internal note on order #${input.orderNumber}`);
        } catch (error) {
          console.error(`❌ Failed to send notification for order #${input.orderNumber}:`, error);
        }
      }
      
      return { success: true, orderId };
    }),
  
    generateInvoice: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const pdfBuffer = await generateInvoicePDF(input.orderId);
          return {
            success: true,
            pdf: pdfBuffer.toString('base64'),
          };
        } catch (error) {
          console.error("Failed to generate invoice:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate invoice PDF",
          });
        }
      }),
    submitOrder: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      distributorId: z.number().optional(),
    })).mutation(async ({ input }) => {
      await db.updateOrder(input.orderId, {
        status: "submitted",
        submittedAt: new Date(),
        distributorId: input.distributorId,
      });
      return { success: true };
    }),
  
  getItems: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrderItemsByOrderId(input.orderId);
    }),
});

// ============= PHOTO ROUTER =============

const photoRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllPhotos();
  }),
  
  getByVisit: protectedProcedure
    .input(z.object({ visitId: z.number() }))
    .query(async ({ input }) => {
      return await db.getPhotosByVisitId(input.visitId);
    }),
  
  getByCustomer: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getPhotosByCustomerId(input.customerId);
    }),
  
  upload: protectedProcedure
    .input(z.object({
      visitId: z.number().optional(),
      customerId: z.number().optional(),
      photoType: z.enum(["before", "after", "merchandising", "pos", "display", "other"]),
      caption: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      imageData: z.string(), // base64 encoded image
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { imageData, mimeType, ...photoData } = input;
      
      // Decode base64 image
      const buffer = Buffer.from(imageData, 'base64');
      
      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const extension = mimeType.split('/')[1];
      const fileKey = `photos/${ctx.user.id}/${timestamp}-${randomSuffix}.${extension}`;
      
      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, mimeType);
      
      // Save to database
      await db.createPhoto({
        ...photoData,
        companyId: ctx.user.companyId,
        userId: ctx.user.id,
        fileKey,
        url,
        takenAt: new Date(),
      });
      
      return { success: true, url };
    }),
});

// ============= GPS TRACKING ROUTER =============

const gpsRouter = router({
  track: protectedProcedure
    .input(z.object({
      latitude: z.string(),
      longitude: z.string(),
      accuracy: z.number().optional(),
      speed: z.string().optional(),
      heading: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createGpsTrack({
        companyId: ctx.user.companyId,
        userId: ctx.user.id,
        ...input,
        timestamp: new Date(),
      });
      return { success: true };
    }),
  
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    return await db.getLatestGpsTrackByUserId(ctx.user.id);
  }),
  
  getAllActive: protectedProcedure.query(async () => {
    return await db.getAllActiveGpsTracks();
  }),
  
  getHistory: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      startTime: z.string(),
      endTime: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user.id;
      return await db.getGpsTracksByUserIdAndTimeRange(
        userId,
        new Date(input.startTime),
        new Date(input.endTime)
      );
    }),
});

// ============= MILEAGE ROUTER =============

const mileageRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getMileageLogsByUserId(ctx.user.id);
  }),
  
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return await db.getActiveMileageLogByUserId(ctx.user.id);
  }),
  
  start: protectedProcedure
    .input(z.object({
      routeId: z.number().optional(),
      startLocation: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createMileageLog({
        companyId: ctx.user.companyId,
        userId: ctx.user.id,
        ...input,
        startTime: new Date(),
        status: "active",
      });
      return { success: true };
    }),
  
  end: protectedProcedure
    .input(z.object({
      logId: z.number(),
      endLocation: z.string(),
      totalDistance: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.updateMileageLog(input.logId, {
        endTime: new Date(),
        endLocation: input.endLocation,
        totalDistance: input.totalDistance,
        status: "completed",
      });
      return { success: true };
    }),
  
  getAllLogs: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all mileage logs");
    }
    return await db.getAllMileageLogs();
  }),
  
  delete: protectedProcedure
    .input(z.object({ logId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteMileageLog(input.logId);
      return { success: true };
    }),
});

// ============= DASHBOARD/ANALYTICS ROUTER =============

const analyticsRouter = router({
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const visits = await db.getVisitsByUserId(ctx.user.id);
    const orders = await db.getOrdersByUserId(ctx.user.id);
    const customers = await db.getCustomersByUserId(ctx.user.id);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVisits = visits.filter(v => new Date(v.checkInTime) >= today);
    const completedVisits = visits.filter(v => v.status === "completed");
    
    return {
      totalCustomers: customers.length,
      totalVisits: visits.length,
      todayVisits: todayVisits.length,
      completedVisits: completedVisits.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
    };
  }),
  
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await db.getAllUsers();
  }),
});

// ============= MAIN APP ROUTER =============

// ============= DISTRIBUTORS ROUTER =============

const distributorsRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllDistributors();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getDistributorById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      contactPerson: z.string().optional(),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createDistributor({
        ...input,
        companyId: ctx.user.companyId,
      });
      return { success: true, id };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      contactPerson: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      notes: z.string().optional(),
      isActive: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateDistributor(id, data);
      return { success: true };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteDistributor(input.id);
      return { success: true };
    }),
});
export const appRouter = router({
  system: systemRouter,
  company: companyRouter,
  aiCoach: aiCoachRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    getCompanyByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const emailDomain = input.email.split('@')[1];
        const company = await db.getCompanyByDomain(emailDomain);
        if (!company) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Company not found' });
        }
        return {
          id: company.id,
          name: company.name,
          logo: company.logo,
        };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1, "Password is required"),
        companyId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.loginUser(input.email, input.password);
        
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }
        
        const { SignJWT } = await import("jose");
        const token = await new SignJWT({ userId: user.id, email: user.email })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('7d')
          .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'secret'));
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        
        return {
          success: true,
          user,
          token,
        };
      }),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        companyId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }
        
        const result = await db.createLocalUser({
          companyId: input.companyId,
          name: input.name,
          email: input.email,
          password: input.password,
          role: "user",
        });
        
        return {
          success: true,
          message: "User registered successfully",
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  customers: customerRouter,
  routes: routeRouter,
  visitData: visitRouter,
  products: productRouter,
  orders: orderRouter,
  distributors: distributorsRouter,
  photos: photoRouter,
  gps: gpsRouter,
  gpsTracking: router(gpsTrackingRouter),
  playbook: playbookRouter,
  mileage: mileageRouter,
  analytics: analyticsRouter,
  email: emailRouter,
  hubspot: hubspotRouter,
  alerts: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAlerts();
    }),
    
    unread: protectedProcedure.query(async () => {
      return await db.getUnreadAlerts();
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markAlertAsRead(input.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure
      .mutation(async () => {
        await db.markAllAlertsAsRead();
        return { success: true };
      }),
    
    addNotes: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        notes: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateAlertNotes(input.id, input.notes);
        return { success: true };
      }),
    
    getMyAlerts: protectedProcedure
      .query(async ({ ctx }) => {
        const allAlerts = await db.getAllAlerts();
        return allAlerts.filter(alert => alert.userId === ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;

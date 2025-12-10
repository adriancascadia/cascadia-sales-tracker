import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  companies, Company,
  customers, InsertCustomer, Customer,
  routes, InsertRoute, Route,
  routeStops, InsertRouteStop, RouteStop,
  visits, InsertVisit, Visit,
  visitActivities, InsertVisitActivity, VisitActivity,
  products, InsertProduct, Product,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem, OrderItem,
  photos, InsertPhoto, Photo,
  gpsTracks, InsertGpsTrack, GpsTrack,
  mileageLogs, InsertMileageLog, MileageLog,
  alerts, InsertAlert, Alert,
  distributors, InsertDistributor, Distributor,
  playbookCategories, InsertPlaybookCategory, PlaybookCategory,
  playbookEntries, InsertPlaybookEntry, PlaybookEntry,
  playbookBookmarks, InsertPlaybookBookmark, PlaybookBookmark,
  notificationPreferences, InsertNotificationPreference, NotificationPreference
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { logger } from './_core/logger';
import { MySqlUpdateSetSource } from 'drizzle-orm/mysql-core';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      _db = drizzle(process.env.DATABASE_URL!);
    } catch (error) {
      logger.warn("[Database] Failed to connect:", { error });
      _db = null;
    }
  }
  return _db;
}

// ============= USER FUNCTIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      companyId: user.companyId || 1, // Default to company 1 for now
    };

    const updateSet: MySqlUpdateSetSource<typeof users> = {
      companyId: values.companyId,
    };

    if (user.name !== undefined) {
      values.name = user.name;
      updateSet.name = user.name;
    }
    if (user.email !== undefined) {
      values.email = user.email;
      updateSet.email = user.email;
    }
    if (user.loginMethod !== undefined) {
      values.loginMethod = user.loginMethod;
      updateSet.loginMethod = user.loginMethod;
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    logger.error("[Database] Failed to upsert user:", { error });
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    logger.error("[Database] Failed to get user:", { error });
    return undefined;
  }
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ============= CUSTOMER FUNCTIONS =============

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(customers).values(customer);
  return result;
}

export async function getCustomersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(asc(customers.name));
}

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(customers)
    .orderBy(asc(customers.name));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(customers)
    .set(data)
    .where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(customers).where(eq(customers.id, id));
}

// ============= ROUTE FUNCTIONS =============

export async function createRoute(route: InsertRoute) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(routes).values(route);
  return result;
}

export async function getRoutesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(routes)
    .where(eq(routes.userId, userId))
    .orderBy(desc(routes.routeDate));
}

export async function getRoutesByDate(userId: number, date: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(routes)
    .where(and(
      eq(routes.userId, userId),
      sql`${routes.routeDate} = ${date}`
    ))
    .orderBy(asc(routes.routeName));
}

export async function getRouteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(routes)
    .where(eq(routes.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateRoute(id: number, data: Partial<InsertRoute>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(routes)
    .set(data)
    .where(eq(routes.id, id));
}

export async function deleteRoute(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(routes).where(eq(routes.id, id));
}

// ============= ROUTE STOP FUNCTIONS =============

export async function createRouteStop(stop: InsertRouteStop) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(routeStops).values(stop);
  return result;
}

export async function getRouteStopsByRouteId(routeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(routeStops)
    .where(eq(routeStops.routeId, routeId))
    .orderBy(asc(routeStops.stopOrder));
}

export async function updateRouteStop(id: number, data: Partial<InsertRouteStop>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(routeStops)
    .set(data)
    .where(eq(routeStops.id, id));
}

export async function deleteRouteStop(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(routeStops).where(eq(routeStops.id, id));
}

// ============= VISIT FUNCTIONS =============

export async function createVisit(visit: InsertVisit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(visits).values(visit);
  return result;
}

export async function getVisitsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(visits)
    .where(eq(visits.userId, userId))
    .orderBy(desc(visits.checkInTime));
}

export async function getVisitsByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(visits)
    .where(eq(visits.customerId, customerId))
    .orderBy(desc(visits.checkInTime));
}

export async function getActiveVisitByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(visits)
    .where(and(
      eq(visits.userId, userId),
      eq(visits.status, "in_progress")
    ))
    .orderBy(desc(visits.checkInTime))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getVisitById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(visits)
    .where(eq(visits.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateVisit(id: number, data: Partial<InsertVisit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(visits)
    .set(data)
    .where(eq(visits.id, id));
}

// ============= VISIT ACTIVITY FUNCTIONS =============

export async function createVisitActivity(activity: InsertVisitActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(visitActivities).values(activity);
  return result;
}

export async function getVisitActivitiesByVisitId(visitId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(visitActivities)
    .where(eq(visitActivities.visitId, visitId))
    .orderBy(desc(visitActivities.createdAt));
}

// ============= PRODUCT FUNCTIONS =============

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values(product);
  return result;
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.name));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(products)
    .where(eq(products.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(products)
    .set(data)
    .where(eq(products.id, id));
}

// ============= ORDER FUNCTIONS =============

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(order);
  return result;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.orderDate));
}

export async function getOrdersByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.orderDate));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(orders)
    .set(data)
    .where(eq(orders.id, id));
}

// ============= ORDER ITEM FUNCTIONS =============

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orderItems).values(item);
  return result;
}

export async function getOrderItemsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}

// ============= PHOTO FUNCTIONS =============

export async function createPhoto(photo: InsertPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(photos).values(photo);
  return result;
}

export async function getPhotosByVisitId(visitId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(photos)
    .where(eq(photos.visitId, visitId))
    .orderBy(desc(photos.takenAt));
}

export async function getPhotosByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(photos)
    .where(eq(photos.customerId, customerId))
    .orderBy(desc(photos.takenAt));
}

export async function getPhotosByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(photos)
    .where(eq(photos.userId, userId))
    .orderBy(desc(photos.takenAt));
}

export async function getAllPhotos() {
  const db = await getDb();
  if (!db) return [];
  
  const allPhotos = await db.select().from(photos).orderBy(desc(photos.takenAt));
  
  const enrichedPhotos = await Promise.all(
    allPhotos.map(async (photo) => {
      let userName = null;
      let customerName = null;
      
      if (photo.userId) {
        const userList = await db.select().from(users).where(eq(users.id, photo.userId)).limit(1);
        if (userList.length > 0) {
          userName = userList[0].name || userList[0].email || null;
        }
      }
      
      if (photo.customerId) {
        const customerList = await db.select().from(customers).where(eq(customers.id, photo.customerId)).limit(1);
        if (customerList.length > 0) {
          customerName = customerList[0].name || null;
        }
      }
      
      return {
        ...photo,
        userName,
        customerName,
      };
    })
  );
  
  return enrichedPhotos;
}

// ============= GPS TRACK FUNCTIONS =============

export async function createGpsTrack(track: InsertGpsTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(gpsTracks).values(track);
  return result;
}

export async function getLatestGpsTrackByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(gpsTracks)
    .where(eq(gpsTracks.userId, userId))
    .orderBy(desc(gpsTracks.timestamp))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getGpsTracksByUserIdAndTimeRange(userId: number, startTime: Date, endTime: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(gpsTracks)
    .where(and(
      eq(gpsTracks.userId, userId),
      sql`${gpsTracks.timestamp} >= ${startTime.toISOString()}`,
      sql`${gpsTracks.timestamp} <= ${endTime.toISOString()}`
    ))
    .orderBy(asc(gpsTracks.timestamp));
}

export async function getAllActiveGpsTracks() {
  const db = await getDb();
  if (!db) return [];
  
  // Get the latest GPS track for each user from the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  return await db.select().from(gpsTracks)
    .where(sql`${gpsTracks.timestamp} >= ${fiveMinutesAgo.toISOString()}`)
    .orderBy(desc(gpsTracks.timestamp));
}

// ============= MILEAGE LOG FUNCTIONS =============

export async function createMileageLog(log: InsertMileageLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mileageLogs).values(log);
  return result;
}

export async function getActiveMileageLogByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(mileageLogs)
    .where(and(
      eq(mileageLogs.userId, userId),
      eq(mileageLogs.status, "active")
    ))
    .orderBy(desc(mileageLogs.startTime))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getMileageLogsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(mileageLogs)
    .where(eq(mileageLogs.userId, userId))
    .orderBy(desc(mileageLogs.startTime));
}

export async function updateMileageLog(id: number, data: Partial<InsertMileageLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(mileageLogs)
    .set(data)
    .where(eq(mileageLogs.id, id));
}

export async function getAllMileageLogs() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(mileageLogs)
    .orderBy(desc(mileageLogs.startTime));
}

export async function deleteMileageLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(mileageLogs)
    .where(eq(mileageLogs.id, id));
}

// ============= ALERT FUNCTIONS =============

export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(alerts).values(data);
  return result;
}

export async function getUnreadAlerts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alerts)
    .where(eq(alerts.isRead, 0))
    .orderBy(desc(alerts.createdAt));
}

export async function getAllAlerts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alerts)
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(alerts)
    .set({ isRead: 1 })
    .where(eq(alerts.id, alertId));
}

export async function markAllAlertsAsRead() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(alerts)
    .set({ isRead: 1 })
    .where(eq(alerts.isRead, 0));
}

export async function updateAlertNotes(alertId: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(alerts)
    .set({ notes })
    .where(eq(alerts.id, alertId));
}


// ============= DISTRIBUTOR FUNCTIONS =============

export async function getAllDistributors() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(distributors);
}

export async function getDistributorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(distributors).where(eq(distributors.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createDistributor(data: InsertDistributor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(distributors).values(data);
  return result[0].insertId;
}

export async function updateDistributor(id: number, data: Partial<InsertDistributor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(distributors)
    .set(data)
    .where(eq(distributors.id, id));
}

export async function deleteDistributor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(distributors).where(eq(distributors.id, id));
}

// ============= ROUTE WITH STOPS FUNCTIONS =============

export async function getRouteWithStops(routeId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const route = await getRouteById(routeId);
  if (!route) return null;
  
  const stops = await getRouteStopsByRouteId(routeId);
  
  // Enrich stops with customer data
  const enrichedStops = await Promise.all(
    stops.map(async (stop) => {
      const customer = await getCustomerById(stop.customerId);
      return {
        ...stop,
        customer
      };
    })
  );
  
  return {
    ...route,
    stops: enrichedStops
  };
}

export async function assignCustomersToRoute(routeId: number, customerIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete existing stops for this route
  await db.delete(routeStops).where(eq(routeStops.routeId, routeId));
  
  // Add new stops in order
  for (let i = 0; i < customerIds.length; i++) {
    await createRouteStop({
      routeId,
      customerId: customerIds[i],
      stopOrder: i + 1,
      plannedArrival: undefined
    });
  }
  
  return { success: true, stopsCreated: customerIds.length };
}

export async function getLatestGpsTracksForRoute(routeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get the route
  const route = await getRouteById(routeId);
  if (!route) return [];
  
  // Get the latest GPS track for the route owner
  const latestTrack = await getLatestGpsTrackByUserId(route.userId);
  return latestTrack ? [latestTrack] : [];
}

export async function getGpsTracksForRouteWithinTimeRange(routeId: number, startTime: Date, endTime: Date) {
  const db = await getDb();
  if (!db) return [];
  
  // Get the route
  const route = await getRouteById(routeId);
  if (!route) return [];
  
  // Get GPS tracks for the route owner within time range
  return await getGpsTracksByUserIdAndTimeRange(route.userId, startTime, endTime);
}


// ============= COMPANY FUNCTIONS =============

export async function getCompanyByDomain(domain: string): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot get company: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(companies).where(eq(companies.domain, domain)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    logger.error("[Database] Failed to get company by domain:", { error });
    return undefined;
  }
}

export async function getPlaybookEntriesByCategory(companyId: number, categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(playbookEntries)
    .where(and(
      eq(playbookEntries.companyId, companyId),
      eq(playbookEntries.categoryId, categoryId),
      eq(playbookEntries.isActive, true)
    ))
    .orderBy(asc(playbookEntries.displayOrder));
}

export async function searchPlaybookEntries(companyId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(playbookEntries)
    .where(and(
      eq(playbookEntries.companyId, companyId),
      eq(playbookEntries.isActive, true),
      sql`(${playbookEntries.title} LIKE ${'%' + query + '%'} OR ${playbookEntries.description} LIKE ${'%' + query + '%'} OR ${playbookEntries.tags} LIKE ${'%' + query + '%'})`
    ))
    .orderBy(asc(playbookEntries.displayOrder));
}

export async function getPlaybookEntryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(playbookEntries)
    .where(eq(playbookEntries.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getUserPlaybookBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({ entry: playbookEntries }).from(playbookBookmarks)
    .innerJoin(playbookEntries, eq(playbookBookmarks.entryId, playbookEntries.id))
    .where(eq(playbookBookmarks.userId, userId))
    .orderBy(desc(playbookBookmarks.createdAt));
}

export async function addPlaybookBookmark(userId: number, entryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(playbookBookmarks).values({
    userId,
    entryId,
  });
}

export async function removePlaybookBookmark(userId: number, entryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(playbookBookmarks)
    .where(and(
      eq(playbookBookmarks.userId, userId),
      eq(playbookBookmarks.entryId, entryId)
    ));
}

export async function isPlaybookBookmarked(userId: number, entryId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(playbookBookmarks)
    .where(and(
      eq(playbookBookmarks.userId, userId),
      eq(playbookBookmarks.entryId, entryId)
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function createPlaybookCategory(category: InsertPlaybookCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(playbookCategories).values(category);
}

export async function createPlaybookEntry(entry: InsertPlaybookEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(playbookEntries).values(entry);
}

export async function updatePlaybookEntry(id: number, data: Partial<InsertPlaybookEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(playbookEntries)
    .set(data)
    .where(eq(playbookEntries.id, id));
}

export async function deletePlaybookEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(playbookEntries).where(eq(playbookEntries.id, id));
}

// ============= AUTHENTICATION FUNCTIONS =============

import bcryptjs from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function createLocalUser(data: {
  companyId: number;
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin" | "manager" | "rep";
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const hashedPassword = await hashPassword(data.password);

  const result = await db.insert(users).values({
    companyId: data.companyId,
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role || "user",
    openId: `local_${data.email}`,
    loginMethod: "local",
    lastSignedIn: new Date(),
  });

  return result;
}

export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const isPasswordValid = await verifyPassword(password, user[0].password || "");

  if (!isPasswordValid) {
    return null;
  }

  // Actualizar lastSignedIn
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user[0].id));

  return user[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date, datetime, index, unique } from "drizzle-orm/mysql-core";

/**
 * Companies using the platform
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  logo: text("logo"),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise"]).default("starter").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  password: varchar("password", { length: 255 }).default(""),
  role: mysqlEnum("role", ["user", "admin", "manager", "rep"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("users_companyId_idx").on(table.companyId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Customer/Account information
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  latitude: text("latitude"),
  longitude: text("longitude"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("customers_companyId_idx").on(table.companyId),
  userIdIdx: index("customers_userId_idx").on(table.userId),
}));

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Daily route planning
 */
export const routes = mysqlTable("routes", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  routeName: varchar("routeName", { length: 255 }).notNull(),
  routeDate: date("routeDate").notNull(),
  status: mysqlEnum("status", ["planned", "in_progress", "completed"]).default("planned").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("routes_companyId_idx").on(table.companyId),
  userIdIdx: index("routes_userId_idx").on(table.userId),
  routeDateIdx: index("routes_routeDate_idx").on(table.routeDate),
  statusIdx: index("routes_status_idx").on(table.status),
}));

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

/**
 * Individual stops in a route
 */
export const routeStops = mysqlTable("route_stops", {
  id: int("id").autoincrement().primaryKey(),
  routeId: int("routeId").notNull(),
  customerId: int("customerId").notNull(),
  stopOrder: int("stopOrder").notNull(),
  plannedArrival: datetime("plannedArrival"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  routeIdIdx: index("routeStops_routeId_idx").on(table.routeId),
  customerIdIdx: index("routeStops_customerId_idx").on(table.customerId),
}));

export type RouteStop = typeof routeStops.$inferSelect;
export type InsertRouteStop = typeof routeStops.$inferInsert;

/**
 * Check-in/check-out records
 */
export const visits = mysqlTable("visits", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  customerId: int("customerId").notNull(),
  routeStopId: int("routeStopId"),
  checkInTime: datetime("checkInTime").notNull(),
  checkInLatitude: text("checkInLatitude"),
  checkInLongitude: text("checkInLongitude"),
  checkOutTime: datetime("checkOutTime"),
  checkOutLatitude: text("checkOutLatitude"),
  checkOutLongitude: text("checkOutLongitude"),
  visitDuration: int("visitDuration"),
  visitType: mysqlEnum("visitType", ["scheduled", "unscheduled"]).default("scheduled").notNull(),
  status: mysqlEnum("status", ["in_progress", "completed"]).default("in_progress").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("visits_companyId_idx").on(table.companyId),
  userIdIdx: index("visits_userId_idx").on(table.userId),
  customerIdIdx: index("visits_customerId_idx").on(table.customerId),
  checkInTimeIdx: index("visits_checkInTime_idx").on(table.checkInTime),
  statusIdx: index("visits_status_idx").on(table.status),
}));

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = typeof visits.$inferInsert;

/**
 * Sales call details and notes
 */
export const visitActivities = mysqlTable("visit_activities", {
  id: int("id").autoincrement().primaryKey(),
  visitId: int("visitId").notNull(),
  activityType: mysqlEnum("activityType", ["sales_call", "merchandising", "service", "delivery", "other"]).notNull(),
  notes: text("notes"),
  outcome: mysqlEnum("outcome", ["order_placed", "follow_up", "no_action", "issue_resolved"]),
  competitorInfo: text("competitorInfo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  visitIdIdx: index("visitActivities_visitId_idx").on(table.visitId),
}));

export type VisitActivity = typeof visitActivities.$inferSelect;
export type InsertVisitActivity = typeof visitActivities.$inferInsert;

/**
 * Product catalog
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: text("price").notNull(),
  category: varchar("category", { length: 100 }),
  distributorId: int("distributorId"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Order records
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  visitId: int("visitId"),
  userId: int("userId").notNull(),
  customerId: int("customerId").notNull(),
  orderNumber: varchar("orderNumber", { length: 100 }).notNull().unique(),
  orderDate: datetime("orderDate").notNull(),
  totalAmount: text("totalAmount").notNull(),
  status: mysqlEnum("status", ["pending", "submitted", "confirmed", "cancelled"]).default("pending").notNull(),
  distributorId: int("distributorId"),
  submittedAt: datetime("submittedAt"),
  sentToDistributor: int("sentToDistributor").default(0).notNull(),
  sentAt: timestamp("sentAt"),
  specialInstructions: text("specialInstructions"),
  internalNotes: text("internalNotes"),
  internalNotesAuthor: varchar("internalNotesAuthor", { length: 255 }),
  internalNotesTimestamp: timestamp("internalNotesTimestamp"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("orders_companyId_idx").on(table.companyId),
  userIdIdx: index("orders_userId_idx").on(table.userId),
  customerIdIdx: index("orders_customerId_idx").on(table.customerId),
  orderDateIdx: index("orders_orderDate_idx").on(table.orderDate),
  statusIdx: index("orders_status_idx").on(table.status),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Line items for orders
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: text("unitPrice").notNull(),
  lineTotal: text("lineTotal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index("orderItems_orderId_idx").on(table.orderId),
  productIdIdx: index("orderItems_productId_idx").on(table.productId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Photo documentation
 */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  visitId: int("visitId"),
  userId: int("userId").notNull(),
  customerId: int("customerId"),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  photoType: mysqlEnum("photoType", ["before", "after", "merchandising", "pos", "display", "other"]).notNull(),
  caption: text("caption"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  takenAt: datetime("takenAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("photos_companyId_idx").on(table.companyId),
  visitIdIdx: index("photos_visitId_idx").on(table.visitId),
  userIdIdx: index("photos_userId_idx").on(table.userId),
  customerIdIdx: index("photos_customerId_idx").on(table.customerId),
}));

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

/**
 * GPS location history for real-time tracking
 */
export const gpsTracks = mysqlTable("gps_tracks", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  accuracy: int("accuracy"),
  speed: text("speed"),
  heading: text("heading"),
  timestamp: datetime("timestamp").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("gpsTracks_companyId_idx").on(table.companyId),
  userIdIdx: index("gpsTracks_userId_idx").on(table.userId),
  timestampIdx: index("gpsTracks_timestamp_idx").on(table.timestamp),
}));

export type GpsTrack = typeof gpsTracks.$inferSelect;
export type InsertGpsTrack = typeof gpsTracks.$inferInsert;

/**
 * Mileage tracking
 */
export const mileageLogs = mysqlTable("mileage_logs", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  routeId: int("routeId"),
  startTime: datetime("startTime").notNull(),
  endTime: datetime("endTime"),
  startLocation: text("startLocation"),
  endLocation: text("endLocation"),
  totalDistance: text("totalDistance"),
  status: mysqlEnum("status", ["active", "completed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("mileageLogs_companyId_idx").on(table.companyId),
  userIdIdx: index("mileageLogs_userId_idx").on(table.userId),
  routeIdIdx: index("mileageLogs_routeId_idx").on(table.routeId),
}));

export type MileageLog = typeof mileageLogs.$inferSelect;
export type InsertMileageLog = typeof mileageLogs.$inferInsert;

/**
 * Automated alerts for managers
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  routeId: int("routeId"),
  alertType: mysqlEnum("alertType", ["route_deviation", "significant_delay", "missed_stop", "extended_visit"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium").notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"),
  notes: text("notes"),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("alerts_companyId_idx").on(table.companyId),
  userIdIdx: index("alerts_userId_idx").on(table.userId),
  routeIdIdx: index("alerts_routeId_idx").on(table.routeId),
  isReadIdx: index("alerts_isRead_idx").on(table.isRead),
}));

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Distributors
 */
export const distributors = mysqlTable("distributors", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  notes: text("notes"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("distributors_companyId_idx").on(table.companyId),
}));

export type Distributor = typeof distributors.$inferSelect;
export type InsertDistributor = typeof distributors.$inferInsert;

/**
 * Sales Playbook - Product strategies and tactics
 */
export const playbookCategories = mysqlTable("playbook_categories", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("playbookCategories_companyId_idx").on(table.companyId),
}));

export type PlaybookCategory = typeof playbookCategories.$inferSelect;
export type InsertPlaybookCategory = typeof playbookCategories.$inferInsert;

/**
 * Sales Playbook - Individual playbook entries
 */
export const playbookEntries = mysqlTable("playbook_entries", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  entryType: mysqlEnum("entryType", ["product_strategy", "objection_handling", "cafe_tactic", "launch_strategy", "quick_reference"]).notNull(),
  productId: int("productId"),
  tags: varchar("tags", { length: 500 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdIdx: index("playbookEntries_companyId_idx").on(table.companyId),
  categoryIdIdx: index("playbookEntries_categoryId_idx").on(table.categoryId),
  productIdIdx: index("playbookEntries_productId_idx").on(table.productId),
}));

export type PlaybookEntry = typeof playbookEntries.$inferSelect;
export type InsertPlaybookEntry = typeof playbookEntries.$inferInsert;

/**
 * Sales Playbook - User bookmarks/favorites
 */
export const playbookBookmarks = mysqlTable("playbook_bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryId: int("entryId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("playbookBookmarks_userId_idx").on(table.userId),
  entryIdIdx: index("playbookBookmarks_entryId_idx").on(table.entryId),
  uniqueBookmark: index("playbookBookmarks_unique").on(table.userId, table.entryId),
}));

export type PlaybookBookmark = typeof playbookBookmarks.$inferSelect;
export type InsertPlaybookBookmark = typeof playbookBookmarks.$inferInsert;

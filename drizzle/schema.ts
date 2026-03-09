import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // ZimPass Flow specific fields
  nationalId: varchar("nationalId", { length: 50 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vehicle table - stores vehicle information for each user
 */
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Vehicle details
  plateName: varchar("plateName", { length: 50 }).notNull(),
  vehicleType: varchar("vehicleType", { length: 50 }).notNull(), // car, truck, bus, etc.
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Wallet table - stores wallet balance for each user
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  lowBalanceThreshold: decimal("lowBalanceThreshold", { precision: 10, scale: 2 }).notNull().default("10.00"),
  lastLowBalanceNotificationAt: timestamp("lastLowBalanceNotificationAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Transaction table - stores all wallet transactions (top-ups and toll deductions)
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Transaction details
  type: mysqlEnum("type", ["topup", "toll_deduction"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  
  // For toll transactions
  vehicleId: int("vehicleId"),
  tollgateName: varchar("tollgateName", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Notification table - stores user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Notification details
  type: mysqlEnum("type", ["toll_payment", "low_balance", "vehicle_update"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tollgate table - stores information about toll collection points
 */
export const tollgates = mysqlTable("tollgates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Tollgate details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Location
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: text("address"),
  
  // Toll information
  tollFee: decimal("tollFee", { precision: 10, scale: 2 }).notNull(),
  tollFeeType: varchar("tollFeeType", { length: 50 }).notNull(),
  vehicleTypes: text("vehicleTypes"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  operatingHours: text("operatingHours"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tollgate = typeof tollgates.$inferSelect;
export type InsertTollgate = typeof tollgates.$inferInsert;

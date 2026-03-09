import { eq, desc, and, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vehicles, wallets, transactions, notifications, tollgates } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "nationalId", "phoneNumber"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

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
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Vehicle queries
export async function getUserVehicles(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
}

export async function getVehicleById(vehicleId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(vehicles).where(
    and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId))
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createVehicle(userId: number, vehicleData: Omit<typeof vehicles.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vehicles).values({
    ...vehicleData,
    userId,
  });

  return result;
}

export async function updateVehicle(vehicleId: number, userId: number, vehicleData: Partial<Omit<typeof vehicles.$inferInsert, 'id' | 'userId'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(vehicles).set(vehicleData).where(
    and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId))
  );
}

export async function deleteVehicle(vehicleId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(vehicles).where(
    and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId))
  );
}

// Wallet queries
export async function getUserWallet(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createWallet(userId: number, initialBalance: string = "0") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(wallets).values({
    userId,
    balance: initialBalance,
  });
}

export async function updateWalletBalance(userId: number, newBalance: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.userId, userId));
}

// Transaction queries
export async function getUserTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function createTransaction(transactionData: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(transactions).values(transactionData);
}

// Notification queries
export async function getUserNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function createNotification(notificationData: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notifications).values(notificationData);
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(notifications).set({ isRead: true }).where(
    and(eq(notifications.id, notificationId), eq(notifications.userId, userId))
  );
}

// Tollgate queries
export async function getAllTollgates() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tollgates).where(eq(tollgates.isActive, true));
}

export async function getTollgateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tollgates).where(eq(tollgates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTollgate(tollgateData: typeof tollgates.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(tollgates).values(tollgateData);
}

export async function getTollgatesByBounds(minLat: number, maxLat: number, minLng: number, maxLng: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tollgates).where(eq(tollgates.isActive, true));
}

// Low balance notification helpers
export async function updateWalletLowBalanceThreshold(userId: number, threshold: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(wallets).set({ lowBalanceThreshold: threshold.toString() }).where(eq(wallets.userId, userId));
}

export async function checkAndCreateLowBalanceNotification(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (wallet.length === 0) return null;

  const currentWallet = wallet[0];
  const balance = parseFloat(currentWallet.balance);
  const threshold = parseFloat(currentWallet.lowBalanceThreshold);
  const lastNotificationAt = currentWallet.lastLowBalanceNotificationAt;

  // Check if balance is below threshold
  if (balance < threshold) {
    // Check if we already sent a notification in the last hour
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (!lastNotificationAt || lastNotificationAt < oneHourAgo) {
      // Create notification
      const notification = await createNotification({
        userId,
        type: "low_balance",
        title: "Low Wallet Balance",
        message: `Your wallet balance is $${balance.toFixed(2)}, which is below your threshold of $${threshold.toFixed(2)}. Please top up your wallet.`,
        isRead: false,
      });

      // Update last notification timestamp
      await db.update(wallets).set({ lastLowBalanceNotificationAt: now }).where(eq(wallets.userId, userId));

      return notification;
    }
  }

  return null;
}

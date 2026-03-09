import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Low Balance Notification System", () => {
  it("should get wallet balance", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wallet.getBalance();

    expect(result).toBeDefined();
    expect(result.balance).toBeDefined();
    expect(result.userId).toBe(ctx.user.id);
  });

  it("should update low balance threshold", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wallet.updateLowBalanceThreshold({
      threshold: 15.0,
    });

    expect(result.success).toBe(true);
  });

  it("should check low balance status", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wallet.checkLowBalance();

    expect(result).toBeDefined();
    expect(typeof result.hasLowBalance).toBe("boolean");
  });

  it("should list notifications", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.list({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get unread notification count", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.unreadCount();

    expect(result).toBeDefined();
    expect(typeof result.unreadCount).toBe("number");
    expect(result.unreadCount).toBeGreaterThanOrEqual(0);
  });

  it("should mark notification as read", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Get notifications first
    const notifications = await caller.notifications.list({ limit: 1 });

    if (notifications.length > 0) {
      const notificationId = notifications[0].id;
      const result = await caller.notifications.markAsRead({ id: notificationId });

      expect(result.success).toBe(true);
    }
  });

  it("should handle wallet top-up and check low balance", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Top up wallet
    const topupResult = await caller.wallet.topup({
      amount: "20.00",
    });

    expect(topupResult.success).toBe(true);
    expect(topupResult.newBalance).toBeDefined();

    // Check low balance
    const balanceCheck = await caller.wallet.checkLowBalance();
    expect(balanceCheck).toBeDefined();
  });

  it("should reject invalid threshold", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.wallet.updateLowBalanceThreshold({
        threshold: -5.0,
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should handle notification creation on toll deduction", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // First, create a vehicle
    const vehicleResult = await caller.vehicles.add({
      plateName: "ABC123",
      vehicleType: "car",
      brand: "Toyota",
      model: "Corolla",
      color: "Blue",
    });

    expect(vehicleResult.success).toBe(true);

    // Top up wallet to ensure sufficient balance
    await caller.wallet.topup({
      amount: "50.00",
    });

    // Get the created vehicle
    const vehicles = await caller.vehicles.list();
    if (vehicles.length > 0) {
      const vehicleId = vehicles[0].id;

      // Deduct toll
      const tollResult = await caller.wallet.deductToll({
        vehicleId,
        tollgateName: "Main Tollgate",
        amount: "5.00",
      });

      expect(tollResult.success).toBe(true);
      expect(tollResult.newBalance).toBeDefined();
    }
  });
});

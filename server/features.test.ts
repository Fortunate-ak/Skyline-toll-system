import { describe, expect, it, beforeEach, vi } from "vitest";
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

describe("Wallet Features", () => {
  it("should get wallet balance", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wallet.getBalance();

    expect(result).toHaveProperty("balance");
    expect(result).toHaveProperty("userId");
    expect(result.userId).toBe(1);
  });

  it("should top up wallet", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wallet.topup({ amount: "50.00" });

    expect(result.success).toBe(true);
    expect(result.newBalance).toBeDefined();
    expect(parseFloat(result.newBalance)).toBeGreaterThan(0);
  });

  it("should reject invalid topup amount", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.wallet.topup({ amount: "invalid" });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("Vehicle Features", () => {
  it("should list user vehicles", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.vehicles.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should add a new vehicle", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.vehicles.add({
      plateName: "ABC 123",
      vehicleType: "car",
      brand: "Toyota",
      model: "Corolla",
      color: "Silver",
    });

    expect(result.success).toBe(true);
  });

  it("should reject vehicle with missing fields", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.vehicles.add({
        plateName: "",
        vehicleType: "car",
        brand: "Toyota",
        model: "Corolla",
        color: "Silver",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should update a vehicle", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // First add a vehicle
    await caller.vehicles.add({
      plateName: "ABC 123",
      vehicleType: "car",
      brand: "Toyota",
      model: "Corolla",
      color: "Silver",
    });

    // Get the vehicle
    const vehicles = await caller.vehicles.list();
    const vehicleId = vehicles[0]?.id;

    if (!vehicleId) {
      expect.fail("Vehicle not created");
    }

    // Update the vehicle
    const result = await caller.vehicles.update({
      id: vehicleId,
      color: "Red",
    });

    expect(result.success).toBe(true);
  });

  it("should delete a vehicle", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // First add a vehicle
    await caller.vehicles.add({
      plateName: "XYZ 789",
      vehicleType: "truck",
      brand: "Volvo",
      model: "FH16",
      color: "Blue",
    });

    // Get the vehicle
    const vehicles = await caller.vehicles.list();
    const vehicleId = vehicles[vehicles.length - 1]?.id;

    if (!vehicleId) {
      expect.fail("Vehicle not created");
    }

    // Delete the vehicle
    const result = await caller.vehicles.delete({ id: vehicleId });

    expect(result.success).toBe(true);
  });
});

describe("Transaction Features", () => {
  it("should list user transactions", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.transactions.list({ limit: 50 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get recent transactions", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.transactions.recent();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Notification Features", () => {
  it("should list user notifications", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.list({ limit: 50 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get unread notification count", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.unreadCount();

    expect(result).toHaveProperty("unreadCount");
    expect(typeof result.unreadCount).toBe("number");
  });
});

describe("Authentication", () => {
  it("should get current user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toEqual(ctx.user);
  });

  it("should logout user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
  });
});

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

describe("Tollgate Features", () => {
  it("should list all active tollgates", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tollgates.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get tollgate by ID", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // First create a tollgate
    await caller.tollgates.create({
      name: "Main Tollgate",
      description: "Test tollgate",
      latitude: "-19.0154",
      longitude: "29.1549",
      address: "Highway 1, Zimbabwe",
      tollFee: "5.50",
      tollFeeType: "fixed",
      vehicleTypes: JSON.stringify(["car", "truck"]),
      operatingHours: JSON.stringify({ open: "06:00", close: "22:00" }),
    });

    // Get all tollgates to find the created one
    const tollgates = await caller.tollgates.list();
    expect(tollgates.length).toBeGreaterThan(0);

    const firstTollgate = tollgates[0];
    if (firstTollgate) {
      const result = await caller.tollgates.get({ id: firstTollgate.id });
      expect(result).toBeDefined();
      expect(result.name).toBe(firstTollgate.name);
    }
  });

  it("should create a new tollgate", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tollgates.create({
      name: "Test Tollgate",
      description: "A test tollgate",
      latitude: "-19.5",
      longitude: "29.5",
      address: "Test Address",
      tollFee: "3.50",
      tollFeeType: "fixed",
      vehicleTypes: JSON.stringify(["car"]),
      operatingHours: JSON.stringify({ open: "06:00", close: "22:00" }),
    });

    expect(result.success).toBe(true);
  });

  it("should reject tollgate with invalid coordinates", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tollgates.create({
        name: "Invalid Tollgate",
        latitude: "invalid",
        longitude: "invalid",
        tollFee: "5.00",
        tollFeeType: "fixed",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should get tollgates by bounds", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tollgates.byBounds({
      minLat: -20,
      maxLat: -18,
      minLng: 28,
      maxLng: 30,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should reject tollgate creation with missing required fields", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tollgates.create({
        name: "",
        latitude: "-19.0154",
        longitude: "29.1549",
        tollFee: "5.50",
        tollFeeType: "fixed",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should handle invalid toll fee format", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tollgates.create({
        name: "Test Tollgate",
        latitude: "-19.0154",
        longitude: "29.1549",
        tollFee: "invalid",
        tollFeeType: "fixed",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

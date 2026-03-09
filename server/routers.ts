import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getUserWallet,
  createWallet,
  updateWalletBalance,
  getUserTransactions,
  createTransaction,
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  getAllTollgates,
  getTollgateById,
  createTollgate,
  getTollgatesByBounds,
  updateWalletLowBalanceThreshold,
  checkAndCreateLowBalanceNotification,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Vehicle Management
  vehicles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserVehicles(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const vehicle = await getVehicleById(input.id, ctx.user.id);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }
        return vehicle;
      }),

    add: protectedProcedure
      .input(
        z.object({
          plateName: z.string().min(1),
          vehicleType: z.string().min(1),
          brand: z.string().min(1),
          model: z.string().min(1),
          color: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createVehicle(ctx.user.id, {
          plateName: input.plateName,
          vehicleType: input.vehicleType,
          brand: input.brand,
          model: input.model,
          color: input.color,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          plateName: z.string().min(1).optional(),
          vehicleType: z.string().min(1).optional(),
          brand: z.string().min(1).optional(),
          model: z.string().min(1).optional(),
          color: z.string().min(1).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vehicle = await getVehicleById(input.id, ctx.user.id);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }

        const updateData: Record<string, unknown> = {};
        if (input.plateName) updateData.plateName = input.plateName;
        if (input.vehicleType) updateData.vehicleType = input.vehicleType;
        if (input.brand) updateData.brand = input.brand;
        if (input.model) updateData.model = input.model;
        if (input.color) updateData.color = input.color;

        await updateVehicle(input.id, ctx.user.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const vehicle = await getVehicleById(input.id, ctx.user.id);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }

        await deleteVehicle(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Wallet Management
  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      let wallet = await getUserWallet(ctx.user.id);
      
      if (!wallet) {
        await createWallet(ctx.user.id);
        wallet = await getUserWallet(ctx.user.id);
      }

      return wallet || { balance: "0", userId: ctx.user.id, lowBalanceThreshold: "10.00" };
    }),

    topup: protectedProcedure
      .input(
        z.object({
          amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let wallet = await getUserWallet(ctx.user.id);

        if (!wallet) {
          await createWallet(ctx.user.id);
          wallet = await getUserWallet(ctx.user.id);
        }

        const currentBalance = parseFloat(wallet?.balance || "0");
        const topupAmount = parseFloat(input.amount);
        const newBalance = (currentBalance + topupAmount).toFixed(2);

        await updateWalletBalance(ctx.user.id, newBalance);

        // Record transaction
        await createTransaction({
          userId: ctx.user.id,
          type: "topup",
          amount: input.amount,
          description: `Wallet top-up: ${input.amount}`,
          status: "completed",
        });

        // Create notification
        await createNotification({
          userId: ctx.user.id,
          type: "toll_payment",
          title: "Wallet Top-up Successful",
          message: `Your wallet has been credited with ${input.amount}`,
        });

        return {
          success: true,
          newBalance,
        };
      }),

    deductToll: protectedProcedure
      .input(
        z.object({
          vehicleId: z.number(),
          tollgateName: z.string(),
          amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Verify vehicle belongs to user
        const vehicle = await getVehicleById(input.vehicleId, ctx.user.id);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }

        let wallet = await getUserWallet(ctx.user.id);
        if (!wallet) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Wallet not found" });
        }

        const currentBalance = parseFloat(wallet.balance || "0");
        const tollAmount = parseFloat(input.amount);

        if (currentBalance < tollAmount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient wallet balance" });
        }

        const newBalance = (currentBalance - tollAmount).toFixed(2);

        await updateWalletBalance(ctx.user.id, newBalance);

        // Record transaction
        await createTransaction({
          userId: ctx.user.id,
          vehicleId: input.vehicleId,
          type: "toll_deduction",
          amount: input.amount,
          tollgateName: input.tollgateName,
          description: `Toll payment at ${input.tollgateName}`,
          status: "completed",
        });

        // Create notification
        await createNotification({
          userId: ctx.user.id,
          type: "toll_payment",
          title: "Toll Payment Successful",
          message: `Toll of ${input.amount} deducted for vehicle ${vehicle.plateName} at ${input.tollgateName}`,
        });

        // Check if balance is low and create alert
        const notification = await checkAndCreateLowBalanceNotification(ctx.user.id);

        return {
          success: true,
          newBalance,
          lowBalanceAlert: notification !== null,
        };
      }),

    updateLowBalanceThreshold: protectedProcedure
      .input(z.object({ threshold: z.number().min(0) }))
      .mutation(async ({ ctx, input }) => {
        await updateWalletLowBalanceThreshold(ctx.user.id, input.threshold);
        return { success: true };
      }),

    checkLowBalance: protectedProcedure.query(async ({ ctx }) => {
      const notification = await checkAndCreateLowBalanceNotification(ctx.user.id);
      return { hasLowBalance: notification !== null, notification };
    }),
  }),

  // Transaction History
  transactions: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await getUserTransactions(ctx.user.id, input.limit);
      }),

    recent: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTransactions(ctx.user.id, 10);
    }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await getUserNotifications(ctx.user.id, input.limit);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const notifications = await getUserNotifications(ctx.user.id, 1000);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { unreadCount };
    }),
  }),

  // User Profile (update registration info)
  profile: router({
    update: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          phoneNumber: z.string().optional(),
          nationalId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Note: In a real app, you'd update the user in the database
        // For now, this is a placeholder that would be implemented with a user update function
        return { success: true };
      }),
  }),



  // Tollgate Management
  tollgates: router({
    list: publicProcedure.query(async () => {
      return await getAllTollgates();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tollgate = await getTollgateById(input.id);
        if (!tollgate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tollgate not found" });
        }
        return tollgate;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
          longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
          address: z.string().optional(),
          tollFee: z.string().regex(/^\d+(\.\d{1,2})?$/),
          tollFeeType: z.enum(["fixed", "variable"]),
          vehicleTypes: z.string().optional(),
          operatingHours: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Only admin can create tollgates
        // For MVP, we'll allow this but in production should check admin role
        await createTollgate({
          name: input.name,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          tollFee: input.tollFee,
          tollFeeType: input.tollFeeType,
          vehicleTypes: input.vehicleTypes,
          operatingHours: input.operatingHours,
        });
        return { success: true };
      }),

    byBounds: publicProcedure
      .input(
        z.object({
          minLat: z.number(),
          maxLat: z.number(),
          minLng: z.number(),
          maxLng: z.number(),
        })
      )
      .query(async ({ input }) => {
        return await getTollgatesByBounds(input.minLat, input.maxLat, input.minLng, input.maxLng);
      }),
  }),
});

export type AppRouter = typeof appRouter;

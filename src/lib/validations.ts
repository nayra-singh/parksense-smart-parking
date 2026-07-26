import { z } from "zod";

export const deviceStatusSchema = z.object({
  deviceId: z.string().min(1).max(100),
  slots: z
    .array(
      z.object({
        slotCode: z.string().min(1).max(20),
        occupied: z.boolean(),
        distanceCm: z.number().min(0).max(1000),
      })
    )
    .min(1)
    .max(100),
});

export const deviceHeartbeatSchema = z.object({
  deviceId: z.string().min(1).max(100),
  status: z.string().max(50).optional(),
});

export const parkingLotSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
});

export const parkingZoneSchema = z.object({
  lotId: z.string().min(1),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
});

export const parkingSlotSchema = z.object({
  zoneId: z.string().min(1),
  code: z.string().min(1).max(20),
});

export const deviceRegistrationSchema = z.object({
  deviceIdentifier: z.string().min(1).max(100),
  name: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const analyticsOccupancyQuery = z.object({
  zoneId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(["hourly", "daily", "weekly"]).optional(),
});

export const alertResolveSchema = z.object({
  resolved: z.boolean(),
});

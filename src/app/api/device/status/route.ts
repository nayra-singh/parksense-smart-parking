import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { deviceStatusSchema } from "@/lib/validations";
import { authenticateDevice } from "@/lib/device-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-utils";
import { createAlert } from "@/lib/alerts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = deviceStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid request body", 422);
    }

    const { deviceId, slots } = parsed.data;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    const authResult = await authenticateDevice(deviceId, apiKey);

    if (!authResult.authenticated || !authResult.device) {
      if (authResult.reason === "Invalid credentials") {
        await createAlert(
          "AUTH_FAILURE",
          "CRITICAL",
          "Device Authentication Failure",
          `Device ${deviceId} failed authentication`,
          "Device",
          undefined
        );
      }
      return apiError(authResult.reason || "Unauthorized", 401);
    }

    const device = authResult.device;

    const results = [];

    for (const slotData of slots) {
      const sensor = await prisma.sensor.findFirst({
        where: {
          deviceId: device.id,
          parkingSlot: { code: slotData.slotCode, isActive: true },
        },
        include: { parkingSlot: true },
      });

      if (!sensor || !sensor.isActive) {
        results.push({
          slotCode: slotData.slotCode,
          status: "SKIPPED",
          reason: "Sensor not found or inactive",
        });
        continue;
      }

      let newStatus: string;
      if (slotData.distanceCm < 0 || slotData.distanceCm > 1000) {
        newStatus = "UNKNOWN";
      } else if (
        slotData.distanceCm >= sensor.thresholdCm ||
        slotData.distanceCm === 0
      ) {
        newStatus = "AVAILABLE";
      } else {
        newStatus = "OCCUPIED";
      }

      const previousStatus = sensor.parkingSlot.status;

      if (newStatus === "UNKNOWN" && previousStatus !== "UNKNOWN") {
        await createAlert(
          "SENSOR_FAILURE",
          "WARNING",
          "Sensor Invalid Reading",
          `Sensor for slot ${slotData.slotCode} reported invalid distance: ${slotData.distanceCm} cm`,
          "Sensor",
          sensor.id
        );
      }

      if (newStatus !== previousStatus) {
        let durationSec: number | null = null;
        if (
          previousStatus === "OCCUPIED" &&
          newStatus === "AVAILABLE"
        ) {
          const lastOccupiedEvent = await prisma.parkingEvent.findFirst({
            where: {
              parkingSlotId: sensor.parkingSlot.id,
              newStatus: "OCCUPIED",
            },
            orderBy: { timestamp: "desc" },
          });

          if (lastOccupiedEvent) {
            durationSec = Math.floor(
              (Date.now() - lastOccupiedEvent.timestamp.getTime()) / 1000
            );
          }
        }

        await prisma.parkingEvent.create({
          data: {
            parkingSlotId: sensor.parkingSlot.id,
            previousStatus: previousStatus as any,
            newStatus: newStatus as any,
            distanceCm: slotData.distanceCm,
            durationSec,
          },
        });

        await prisma.parkingSlot.update({
          where: { id: sensor.parkingSlot.id },
          data: { status: newStatus as any, updatedAt: new Date() },
        });
      }

      results.push({
        slotCode: slotData.slotCode,
        status: newStatus,
        distanceCm: slotData.distanceCm,
      });
    }

    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date(), status: "ONLINE" },
    });

    return apiSuccess({ received: true, results });
  } catch (error) {
    return handleApiError(error);
  }
}

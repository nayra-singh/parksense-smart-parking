import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { deviceHeartbeatSchema } from "@/lib/validations";
import { authenticateDevice } from "@/lib/device-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = deviceHeartbeatSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid request body", 422);
    }

    const { deviceId } = parsed.data;

    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    const { authenticated, reason, device } = await authenticateDevice(
      deviceId,
      apiKey
    );

    if (!authenticated || !device) {
      return apiError(reason || "Unauthorized", 401);
    }

    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(),
        status: "ONLINE",
      },
    });

    await prisma.deviceHeartbeat.create({
      data: {
        deviceId: device.id,
        status: "ONLINE",
      },
    });

    return apiSuccess({ received: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}

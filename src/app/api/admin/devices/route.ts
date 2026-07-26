import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { deviceRegistrationSchema } from "@/lib/validations";
import { requireApiAuth, apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { hashDeviceCredential } from "@/lib/device-auth";
import { randomBytes } from "crypto";

export async function GET() {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const devices = await prisma.device.findMany({
      include: {
        sensors: {
          include: { parkingSlot: true },
        },
        heartbeats: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const safeDevices = devices.map((d) => ({
      id: d.id,
      deviceIdentifier: d.deviceIdentifier,
      name: d.name,
      location: d.location,
      isActive: d.isActive,
      status: d.status,
      lastSeenAt: d.lastSeenAt,
      createdAt: d.createdAt,
      sensors: d.sensors,
      lastHeartbeat: d.heartbeats[0] || null,
    }));

    return apiSuccess({ devices: safeDevices });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = deviceRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid input", 422);
    }

    const existing = await prisma.device.findUnique({
      where: { deviceIdentifier: parsed.data.deviceIdentifier },
    });

    if (existing) {
      return apiError("Device identifier already exists", 409);
    }

    const credential = `park-${randomBytes(16).toString("hex")}`;
    const credentialHash = hashDeviceCredential(credential);

    const device = await prisma.device.create({
      data: {
        deviceIdentifier: parsed.data.deviceIdentifier,
        name: parsed.data.name,
        location: parsed.data.location,
        credentialHash,
      },
    });

    return apiSuccess(
      {
        device: {
          id: device.id,
          deviceIdentifier: device.deviceIdentifier,
          name: device.name,
          location: device.location,
          isActive: device.isActive,
          createdAt: device.createdAt,
        },
        credential,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}

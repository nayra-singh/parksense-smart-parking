import { prisma } from "@/lib/db/prisma";

type AlertType = "DEVICE_OFFLINE" | "SENSOR_FAILURE" | "INVALID_MEASUREMENT" | "AUTH_FAILURE" | "SYSTEM";
type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export async function createAlert(
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  entityType?: string,
  entityId?: string
) {
  try {
    await prisma.alert.create({
      data: {
        type,
        severity,
        title,
        message,
        entityType,
        entityId,
      },
    });
  } catch (error) {
    console.error("Failed to create alert:", error);
  }
}

export async function checkDeviceOffline(
  deviceId: string,
  deviceName: string,
  heartbeatTimeoutMinutes: number = 2
) {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device || !device.lastSeenAt) return;

  const elapsed =
    (Date.now() - device.lastSeenAt.getTime()) / (1000 * 60);

  if (elapsed > heartbeatTimeoutMinutes && device.status === "ONLINE") {
    await prisma.device.update({
      where: { id: deviceId },
      data: { status: "OFFLINE" },
    });

    await createAlert(
      "DEVICE_OFFLINE",
      "CRITICAL",
      "Device Offline",
      `Device ${deviceName} (${deviceId}) has not sent heartbeat for ${Math.floor(elapsed)} minutes`,
      "Device",
      deviceId
    );
  }
}

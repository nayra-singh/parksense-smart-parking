import { prisma } from "@/lib/db/prisma";
import { createHash } from "crypto";

export async function authenticateDevice(deviceId: string, apiKey?: string) {
  const device = await prisma.device.findUnique({
    where: { deviceIdentifier: deviceId },
    include: { sensors: true },
  });

  if (!device) {
    return { authenticated: false, reason: "Device not found", device: null };
  }

  if (!device.isActive) {
    return { authenticated: false, reason: "Device is disabled", device: null };
  }

  if (apiKey) {
    const hash = createHash("sha256").update(apiKey).digest("hex");
    if (hash !== device.credentialHash) {
      return { authenticated: false, reason: "Invalid credentials", device: null };
    }
  }

  return { authenticated: true, reason: null, device };
}

export function hashDeviceCredential(credential: string): string {
  return createHash("sha256").update(credential).digest("hex");
}

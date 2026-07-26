import { PrismaClient, SlotStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { hashDeviceCredential } from "../src/lib/device-auth";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@parksense.io" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@parksense.io",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const operatorPassword = await hash("operator123", 12);

  await prisma.user.upsert({
    where: { email: "operator@parksense.io" },
    update: {},
    create: {
      name: "Operator User",
      email: "operator@parksense.io",
      passwordHash: operatorPassword,
      role: "OPERATOR",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@parksense.io" },
    update: {},
    create: {
      name: "Viewer User",
      email: "viewer@parksense.io",
      passwordHash: await hash("viewer123", 12),
      role: "VIEWER",
    },
  });

  const lot = await prisma.parkingLot.upsert({
    where: { id: "seed-lot-001" },
    update: {},
    create: {
      id: "seed-lot-001",
      name: "Main Parking Lot",
      address: "123 University Avenue, Engineering Campus",
      description: "Primary parking facility for engineering block",
    },
  });

  const zoneA = await prisma.parkingZone.upsert({
    where: { id: "seed-zone-a" },
    update: {},
    create: {
      id: "seed-zone-a",
      lotId: lot.id,
      name: "Zone A",
      code: "A",
    },
  });

  const zoneB = await prisma.parkingZone.upsert({
    where: { id: "seed-zone-b" },
    update: {},
    create: {
      id: "seed-zone-b",
      lotId: lot.id,
      name: "Zone B",
      code: "B",
    },
  });

  const slotConfigs = [
    { id: "seed-slot-a1", zoneId: zoneA.id, code: "A1", status: "OCCUPIED" as SlotStatus },
    { id: "seed-slot-a2", zoneId: zoneA.id, code: "A2", status: "AVAILABLE" as SlotStatus },
    { id: "seed-slot-a3", zoneId: zoneA.id, code: "A3", status: "OCCUPIED" as SlotStatus },
    { id: "seed-slot-a4", zoneId: zoneA.id, code: "A4", status: "AVAILABLE" as SlotStatus },
    { id: "seed-slot-b1", zoneId: zoneB.id, code: "B1", status: "AVAILABLE" as SlotStatus },
    { id: "seed-slot-b2", zoneId: zoneB.id, code: "B2", status: "AVAILABLE" as SlotStatus },
    { id: "seed-slot-b3", zoneId: zoneB.id, code: "B3", status: "OCCUPIED" as SlotStatus },
    { id: "seed-slot-b4", zoneId: zoneB.id, code: "B4", status: "AVAILABLE" as SlotStatus },
  ];

  for (const slot of slotConfigs) {
    await prisma.parkingSlot.upsert({
      where: { id: slot.id },
      update: {},
      create: slot,
    });
  }

  const credentialHash = hashDeviceCredential("dev-api-key-park-esp32-001");

  const device = await prisma.device.upsert({
    where: { deviceIdentifier: "PARK-ESP32-001" },
    update: {},
    create: {
      deviceIdentifier: "PARK-ESP32-001",
      name: "Main ESP32 Controller",
      location: "Zone A - Parking Structure",
      credentialHash,
      status: "ONLINE",
      lastSeenAt: new Date(),
    },
  });

  const sensorSlots = ["A1", "A2", "A3", "A4"];
  for (const slotCode of sensorSlots) {
    const slot = await prisma.parkingSlot.findFirst({
      where: { code: slotCode, zoneId: zoneA.id },
    });
    if (slot) {
      await prisma.sensor.upsert({
        where: { parkingSlotId: slot.id },
        update: {},
        create: {
          deviceId: device.id,
          parkingSlotId: slot.id,
          sensorType: "HC-SR04",
          thresholdCm: 20.0,
        },
      });
    }
  }

  console.log("Seed data created successfully");
  console.log("Admin login: admin@parksense.io / admin123");
  console.log("Operator login: operator@parksense.io / operator123");
  console.log("Viewer login: viewer@parksense.io / viewer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

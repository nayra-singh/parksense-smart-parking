import {
  deviceStatusSchema,
  deviceHeartbeatSchema,
  parkingLotSchema,
  parkingZoneSchema,
  parkingSlotSchema,
  deviceRegistrationSchema,
  loginSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("deviceStatusSchema", () => {
    it("accepts valid device status", () => {
      const result = deviceStatusSchema.safeParse({
        deviceId: "PARK-ESP32-001",
        slots: [
          { slotCode: "A1", occupied: true, distanceCm: 8.4 },
          { slotCode: "A2", occupied: false, distanceCm: 42.7 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty deviceId", () => {
      const result = deviceStatusSchema.safeParse({
        deviceId: "",
        slots: [{ slotCode: "A1", occupied: true, distanceCm: 10 }],
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing slots", () => {
      const result = deviceStatusSchema.safeParse({
        deviceId: "PARK-ESP32-001",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative distance", () => {
      const result = deviceStatusSchema.safeParse({
        deviceId: "PARK-ESP32-001",
        slots: [{ slotCode: "A1", occupied: true, distanceCm: -1 }],
      });
      expect(result.success).toBe(false);
    });

    it("rejects distance over 1000", () => {
      const result = deviceStatusSchema.safeParse({
        deviceId: "PARK-ESP32-001",
        slots: [{ slotCode: "A1", occupied: true, distanceCm: 1001 }],
      });
      expect(result.success).toBe(false);
    });

    it("accepts single slot", () => {
      const result = deviceStatusSchema.safeParse({
        deviceId: "PARK-ESP32-001",
        slots: [{ slotCode: "A1", occupied: false, distanceCm: 50 }],
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty slots array", () => {
      const result = deviceStatusSchema.safeParse({
        deviceId: "PARK-ESP32-001",
        slots: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("deviceHeartbeatSchema", () => {
    it("accepts valid heartbeat", () => {
      const result = deviceHeartbeatSchema.safeParse({
        deviceId: "PARK-ESP32-001",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing deviceId", () => {
      const result = deviceHeartbeatSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("parkingLotSchema", () => {
    it("accepts valid parking lot", () => {
      const result = parkingLotSchema.safeParse({
        name: "Main Lot",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = parkingLotSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("parkingZoneSchema", () => {
    it("accepts valid zone", () => {
      const result = parkingZoneSchema.safeParse({
        lotId: "lot-1",
        name: "Zone A",
        code: "A",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("parkingSlotSchema", () => {
    it("accepts valid slot", () => {
      const result = parkingSlotSchema.safeParse({
        zoneId: "zone-1",
        code: "A1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("deviceRegistrationSchema", () => {
    it("accepts valid registration", () => {
      const result = deviceRegistrationSchema.safeParse({
        deviceIdentifier: "PARK-ESP32-001",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

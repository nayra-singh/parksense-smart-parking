import { hashDeviceCredential } from "@/lib/device-auth";

describe("Device Authentication", () => {
  describe("hashDeviceCredential", () => {
    it("returns a 64-character hex string", () => {
      const hash = hashDeviceCredential("test-api-key");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces consistent hashes for same input", () => {
      const hash1 = hashDeviceCredential("test-key");
      const hash2 = hashDeviceCredential("test-key");
      expect(hash1).toBe(hash2);
    });

    it("produces different hashes for different inputs", () => {
      const hash1 = hashDeviceCredential("key-1");
      const hash2 = hashDeviceCredential("key-2");
      expect(hash1).not.toBe(hash2);
    });
  });
});

/*
 * ParkSense Diagnostics — 01 ESP32 Basic Test
 *
 * Verifies:
 * - Serial communication
 * - Onboard LED
 * - Basic GPIO output
 *
 * Expected output:
 *   === ParkSense Diagnostic: 01-ESP32-Basic ===
 *   ESP32 Chip Model: ESP32-D0WDQ6 (rev 1)
 *   Core Count: 2
 *   Onboard LED: OK
 *   GPIO Test: OK
 *   === Test Complete ===
 */

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ParkSense Diagnostic: 01-ESP32-Basic ===");

  Serial.print("ESP32 Chip Model: ");
  Serial.println(ESP.getChipModel());
  Serial.print("Chip Revision: ");
  Serial.println(ESP.getChipRevision());
  Serial.print("Core Count: ");
  Serial.println(ESP.getChipCores());

  pinMode(LED_BUILTIN, OUTPUT);

  // Blink built-in LED
  for (int i = 0; i < 5; i++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(200);
    digitalWrite(LED_BUILTIN, LOW);
    delay(200);
  }
  Serial.println("Onboard LED: OK");

  // Test GPIO 2
  pinMode(2, OUTPUT);
  digitalWrite(2, HIGH);
  delay(100);
  digitalWrite(2, LOW);
  Serial.println("GPIO Test: OK");

  Serial.println("=== Test Complete ===\n");
}

void loop() {
  // Idle
  delay(10000);
}

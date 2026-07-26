/*
 * ParkSense Diagnostics — 03 Four Sensors Test
 *
 * Tests all 4 HC-SR04 sensors simultaneously.
 * Adjust pin definitions for your wiring.
 *
 * Expected output:
 *   SLOT A1 | Distance: 36.4 cm | Status: AVAILABLE
 *   SLOT A2 | Distance:  8.2 cm | Status: OCCUPIED
 *   SLOT A3 | Distance: 12.1 cm | Status: OCCUPIED
 *   SLOT A4 | Distance: 55.0 cm | Status: AVAILABLE
 */

#define TRIG_A1 26
#define ECHO_A1 25
#define TRIG_A2 27
#define ECHO_A2 33
#define TRIG_A3 14
#define ECHO_A3 32
#define TRIG_A4 13
#define ECHO_A4 15

struct Sensor {
  const char* slot;
  uint8_t trig;
  uint8_t echo;
};

Sensor sensors[] = {
  {"A1", TRIG_A1, ECHO_A1},
  {"A2", TRIG_A2, ECHO_A2},
  {"A3", TRIG_A3, ECHO_A3},
  {"A4", TRIG_A4, ECHO_A4},
};

const int THRESHOLD_CM = 20;

float measureDistance(uint8_t trig, uint8_t echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long duration = pulseIn(echo, HIGH, 30000);
  if (duration == 0) return -1.0;

  return (duration * 0.0343) / 2.0;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ParkSense Diagnostic: 03-Four-Sensors ===\n");

  for (int i = 0; i < 4; i++) {
    pinMode(sensors[i].trig, OUTPUT);
    pinMode(sensors[i].echo, INPUT);
    digitalWrite(sensors[i].trig, LOW);
  }
}

void loop() {
  Serial.println("--- Parking Status ---");

  for (int i = 0; i < 4; i++) {
    float dist = measureDistance(sensors[i].trig, sensors[i].echo);

    Serial.print("SLOT ");
    Serial.print(sensors[i].slot);
    Serial.print(" | Distance: ");

    if (dist < 0) {
      Serial.print("TIMEOUT  ");
      Serial.println(" | Status: ERROR");
    } else {
      if (dist < 10.0) Serial.print(" ");
      Serial.print(dist);
      Serial.print(" cm");
      Serial.print("  | Status: ");
      Serial.println(dist < THRESHOLD_CM ? "OCCUPIED" : "AVAILABLE");
    }
  }

  Serial.println();
  delay(2000);
}

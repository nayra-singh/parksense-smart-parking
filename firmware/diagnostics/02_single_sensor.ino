/*
 * ParkSense Diagnostics — 02 Single Sensor Test
 *
 * Tests one HC-SR04 ultrasonic sensor.
 * Adjust TRIG_PIN and ECHO_PIN for your wiring.
 *
 * IMPORTANT: Use voltage divider on Echo pin (5V -> 3.3V)
 *
 * Expected output:
 *   Distance: 12.3 cm
 *   Status: OCCUPIED
 *   ---
 *   Distance: 45.8 cm
 *   Status: AVAILABLE
 *   ---
 */

#define TRIG_PIN 26
#define ECHO_PIN 25

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) return -1.0;

  float distance = (duration * 0.0343) / 2.0;
  return distance;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ParkSense Diagnostic: 02-Single-Sensor ===");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  Serial.println("HC-SR04 Ultrasonic Sensor Test");
  Serial.println("Place an object at varying distances.");
  Serial.println();
}

void loop() {
  float dist = measureDistance();

  Serial.print("Distance: ");
  if (dist < 0) {
    Serial.println("TIMEOUT");
    Serial.println("Status: ERROR");
  } else {
    Serial.print(dist);
    Serial.println(" cm");

    if (dist < 20.0) {
      Serial.println("Status: OCCUPIED");
    } else {
      Serial.println("Status: AVAILABLE");
    }
  }

  Serial.println("---");
  delay(1000);
}

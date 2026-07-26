// ============================================================
// ParkSense — ESP32 Main Firmware
// ============================================================
// Monitors 4 parking slots using HC-SR04 ultrasonic sensors.
// Sends status updates to ParkSense backend via REST API.
// ============================================================

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

// ---- Data Structures ----
struct ParkingSlot {
  const char* code;
  uint8_t trigPin;
  uint8_t echoPin;
  float thresholdCm;
  float currentDistance;
  bool isOccupied;
  bool lastStableOccupied;
  int stableCount;
  unsigned long lastReadTime;
};

// ---- Global State ----
ParkingSlot slots[] = {
  {"A1", TRIG_A1, ECHO_A1, THRESHOLD_A1, 0, false, false, 0, 0},
  {"A2", TRIG_A2, ECHO_A2, THRESHOLD_A2, 0, false, false, 0, 0},
  {"A3", TRIG_A3, ECHO_A3, THRESHOLD_A3, 0, false, false, 0, 0},
  {"A4", TRIG_A4, ECHO_A4, THRESHOLD_A4, 0, false, false, 0, 0},
};

const int SLOT_COUNT = sizeof(slots) / sizeof(slots[0]);

unsigned long lastHeartbeatTime = 0;
unsigned long lastStatusTime = 0;
unsigned long lastSensorReadTime = 0;
unsigned long lastWifiCheckTime = 0;
bool wifiConnected = false;

// ---- Function Prototypes ----
float measureDistance(uint8_t trigPin, uint8_t echoPin);
void readAllSensors();
void updateSlotStates();
bool sendStatusUpdate();
bool sendHeartbeat();
void connectToWiFi();
void setLEDs();

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ParkSense ESP32 Starting ===");

  // Configure sensor pins
  for (int i = 0; i < SLOT_COUNT; i++) {
    pinMode(slots[i].trigPin, OUTPUT);
    pinMode(slots[i].echoPin, INPUT);
    digitalWrite(slots[i].trigPin, LOW);
  }

  // Configure LEDs
  pinMode(LED_ONBOARD, OUTPUT);
  pinMode(LED_WIFI, OUTPUT);
  pinMode(LED_ERROR, OUTPUT);
  digitalWrite(LED_ONBOARD, HIGH);
  digitalWrite(LED_WIFI, LOW);
  digitalWrite(LED_ERROR, LOW);

  // Connect to Wi-Fi
  connectToWiFi();

  Serial.println("=== ParkSense ESP32 Ready ===\n");
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  unsigned long now = millis();

  // ---- Read Sensors (non-blocking) ----
  if (now - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    readAllSensors();
    updateSlotStates();
    lastSensorReadTime = now;
  }

  // ---- Check Wi-Fi ----
  if (!WiFi.isConnected()) {
    if (now - lastWifiCheckTime >= 5000) {
      Serial.println("Wi-Fi disconnected, reconnecting...");
      connectToWiFi();
      lastWifiCheckTime = now;
    }
    return;
  }

  // ---- Send Status Update ----
  if (now - lastStatusTime >= STATUS_INTERVAL) {
    bool sent = sendStatusUpdate();
    if (!sent) {
      Serial.println("Status update failed");
    }
    lastStatusTime = now;
  }

  // ---- Send Heartbeat ----
  if (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeatTime = now;
  }

  // ---- Update LEDs ----
  setLEDs();
}

// ============================================================
// DISTANCE MEASUREMENT
// ============================================================
// Sends a 10us trigger pulse and measures echo pulse duration.
// Converts time to distance: distance = (duration * speed of sound) / 2
// Speed of sound ~343 m/s = 0.0343 cm/us
//
// Voltage Divider Note:
// HC-SR04 Echo pin outputs ~5V. ESP32 GPIO is 3.3V tolerant only.
// A voltage divider (e.g., 1kΩ + 2kΩ) MUST be used between Echo and
// the ESP32 GPIO pin to step down 5V to ~3.3V.
// See docs/HARDWARE.md for resistor calculations.
// ============================================================
float measureDistance(uint8_t trigPin, uint8_t echoPin) {
  // Ensure trigger is low
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  // Send 10us trigger pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure echo pulse duration (timeout at 30ms = ~5m range)
  long duration = pulseIn(echoPin, HIGH, 30000);

  if (duration == 0) {
    // No echo received (timeout)
    return -1.0;
  }

  // Calculate distance in cm
  // Speed of sound = 343 m/s = 0.0343 cm/us
  // Distance = (duration * 0.0343) / 2
  float distance = (duration * 0.0343) / 2.0;

  return distance;
}

// ============================================================
// SENSOR READING
// ============================================================
void readAllSensors() {
  for (int i = 0; i < SLOT_COUNT; i++) {
    float dist = measureDistance(slots[i].trigPin, slots[i].echoPin);
    slots[i].currentDistance = dist;

    Serial.print("Slot ");
    Serial.print(slots[i].code);
    Serial.print(": ");
    if (dist < 0) {
      Serial.println("Distance: TIMEOUT");
    } else {
      Serial.print("Distance: ");
      Serial.print(dist);
      Serial.println(" cm");
    }
  }
}

// ============================================================
// STATE DETECTION WITH DEBOUNCING
// ============================================================
// Algorithm:
// 1. Read raw distance from sensor
// 2. Validate reading (check for timeout, out-of-range)
// 3. Determine desired state from distance vs threshold:
//    - distance < threshold  → OCCUPIED
//    - distance >= threshold → AVAILABLE
//    - invalid reading        → UNKNOWN
// 4. If desired state matches last desired state for N consecutive
//    readings (DEBOUNCE_COUNT), apply the state change.
// 5. This prevents rapid toggling from noise or transient readings.
// ============================================================
void updateSlotStates() {
  for (int i = 0; i < SLOT_COUNT; i++) {
    bool desiredOccupied;

    if (slots[i].currentDistance < 0) {
      // Sensor timeout or error — detect as UNKNOWN
      desiredOccupied = slots[i].lastStableOccupied; // Hold last stable state
      Serial.print("Slot ");
      Serial.print(slots[i].code);
      Serial.println(": WARNING — Sensor error (timeout or invalid reading)");
      continue;
    }

    // Determine desired state based on threshold
    // OCCUPIED when distance is below threshold
    desiredOccupied = (slots[i].currentDistance < slots[i].thresholdCm);

    if (desiredOccupied == slots[i].isOccupied) {
      // State matches — increment stable count
      if (slots[i].stableCount < DEBOUNCE_COUNT) {
        slots[i].stableCount++;
      }

      // If stable count threshold reached and state differs from last stable
      if (slots[i].stableCount >= DEBOUNCE_COUNT &&
          desiredOccupied != slots[i].lastStableOccupied) {
        slots[i].lastStableOccupied = desiredOccupied;
        Serial.print("Slot ");
        Serial.print(slots[i].code);
        Serial.print(": State changed to ");
        Serial.println(desiredOccupied ? "OCCUPIED" : "AVAILABLE");
      }
    } else {
      // State differs — reset stable count
      slots[i].stableCount = 0;
    }

    slots[i].isOccupied = desiredOccupied;
  }
}

// ============================================================
// STATUS UPDATE (REST API)
// ============================================================
bool sendStatusUpdate() {
  HTTPClient http;
  String url = String(SERVER_URL) + String(API_STATUS_PATH);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_API_KEY));

  // Build JSON payload
  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;

  JsonArray slotsArray = doc["slots"].to<JsonArray>();

  for (int i = 0; i < SLOT_COUNT; i++) {
    JsonObject slotObj = slotsArray.add<JsonObject>();
    slotObj["slotCode"] = slots[i].code;
    slotObj["occupied"] = slots[i].lastStableOccupied;
    slotObj["distanceCm"] = slots[i].currentDistance;
  }

  String payload;
  serializeJson(doc, payload);

  Serial.println("Sending status update...");
  int httpCode = http.POST(payload);

  bool success = false;
  if (httpCode > 0) {
    Serial.print("HTTP Response: ");
    Serial.println(httpCode);
    if (httpCode == 200) {
      success = true;
    }
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

// ============================================================
// HEARTBEAT
// ============================================================
bool sendHeartbeat() {
  HTTPClient http;
  String url = String(SERVER_URL) + String(API_HEARTBEAT_PATH);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_API_KEY));

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["status"] = "ONLINE";

  String payload;
  serializeJson(doc, payload);

  Serial.println("Sending heartbeat...");
  int httpCode = http.POST(payload);

  bool success = (httpCode == 200);
  if (success) {
    Serial.println("Heartbeat acknowledged");
  } else {
    Serial.print("Heartbeat failed: ");
    Serial.println(httpCode);
  }

  http.end();
  return success;
}

// ============================================================
// WI-FI CONNECTION
// ============================================================
void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
    digitalWrite(LED_WIFI, !digitalRead(LED_WIFI));
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_WIFI, HIGH);
    wifiConnected = true;
  } else {
    Serial.println("\nWi-Fi connection failed");
    digitalWrite(LED_WIFI, LOW);
    wifiConnected = false;
  }
}

// ============================================================
// LED INDICATORS
// ============================================================
void setLEDs() {
  // Onboard LED: heartbeat indicator (blink slowly when running)
  static unsigned long lastBlink = 0;
  if (millis() - lastBlink >= 2000) {
    digitalWrite(LED_ONBOARD, !digitalRead(LED_ONBOARD));
    lastBlink = millis();
  }

  // Error LED: on if Wi-Fi disconnected
  digitalWrite(LED_ERROR, WiFi.isConnected() ? LOW : HIGH);
}

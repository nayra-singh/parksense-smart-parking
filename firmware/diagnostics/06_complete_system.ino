/*
 * ParkSense Diagnostics — 06 Complete System Test
 *
 * Full system verification: sensors + Wi-Fi + API.
 * Run this after individual component tests pass.
 *
 * Configuration: Set credentials in config.h (do not commit)
 *
 * Expected output:
 *   === ParkSense System Test ===
 *   Sensor A1: 35.2 cm (AVAILABLE)
 *   Sensor A2:  7.8 cm (OCCUPIED)
 *   Sensor A3: 12.4 cm (OCCUPIED)
 *   Sensor A4: 48.1 cm (AVAILABLE)
 *   Wi-Fi: Connected (192.168.1.100)
 *   Status Update: 200 OK
 *   Heartbeat: 200 OK
 *   === System Test PASS ===
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---- Sensor Pins ----
#define TRIG_A1  26
#define ECHO_A1  25
#define TRIG_A2  27
#define ECHO_A2  33
#define TRIG_A3  14
#define ECHO_A3  32
#define TRIG_A4  13
#define ECHO_A4  15

// ---- Test Configuration (set before running) ----
#define WIFI_SSID       "your-wifi-ssid"
#define WIFI_PASSWORD   "your-wifi-password"
#define SERVER_URL      "http://192.168.1.100:3000"
#define DEVICE_ID       "PARK-ESP32-001"
#define DEVICE_API_KEY  "your-device-api-key"

struct Slot {
  const char* code;
  uint8_t trig;
  uint8_t echo;
};

Slot slots[] = {
  {"A1", TRIG_A1, ECHO_A1},
  {"A2", TRIG_A2, ECHO_A2},
  {"A3", TRIG_A3, ECHO_A3},
  {"A4", TRIG_A4, ECHO_A4},
};

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

bool testSensors() {
  Serial.println("\n--- Sensor Test ---");
  bool allOk = true;

  for (int i = 0; i < 4; i++) {
    float dist = measureDistance(slots[i].trig, slots[i].echo);
    Serial.print("  Sensor ");
    Serial.print(slots[i].code);
    Serial.print(": ");

    if (dist < 0) {
      Serial.println("TIMEOUT — FAIL");
      allOk = false;
    } else {
      Serial.print(dist);
      Serial.print(" cm (");
      Serial.print(dist < 20.0 ? "OCCUPIED" : "AVAILABLE");
      Serial.println(")");
    }
  }

  return allOk;
}

bool testWiFi() {
  Serial.println("\n--- Wi-Fi Test ---");
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("  NOT CONNECTED — FAIL");
    return false;
  }
  Serial.print("  Connected. IP: ");
  Serial.println(WiFi.localIP());
  return true;
}

bool testStatusAPI() {
  Serial.println("\n--- Status API Test ---");
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/device/status");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_API_KEY));

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  JsonArray arr = doc["slots"].to<JsonArray>();

  for (int i = 0; i < 4; i++) {
    float dist = measureDistance(slots[i].trig, slots[i].echo);
    JsonObject s = arr.add<JsonObject>();
    s["slotCode"] = slots[i].code;
    s["occupied"] = (dist > 0 && dist < 20.0);
    s["distanceCm"] = dist > 0 ? dist : 0;
  }

  String payload;
  serializeJson(doc, payload);

  int code = http.POST(payload);
  http.end();

  Serial.print("  HTTP ");
  Serial.print(code);
  if (code == 200) {
    Serial.println(" — PASS");
    return true;
  } else {
    Serial.println(" — FAIL");
    return false;
  }
}

bool testHeartbeat() {
  Serial.println("\n--- Heartbeat API Test ---");
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/device/heartbeat");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_API_KEY));

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["status"] = "ONLINE";

  String payload;
  serializeJson(doc, payload);

  int code = http.POST(payload);
  http.end();

  Serial.print("  HTTP ");
  Serial.print(code);
  if (code == 200) {
    Serial.println(" — PASS");
    return true;
  } else {
    Serial.println(" — FAIL");
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ParkSense System Test ===\n");

  for (int i = 0; i < 4; i++) {
    pinMode(slots[i].trig, OUTPUT);
    pinMode(slots[i].echo, INPUT);
    digitalWrite(slots[i].trig, LOW);
  }

  Serial.print("Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  bool passed = true;
  passed &= testSensors();
  passed &= testWiFi();
  if (WiFi.status() == WL_CONNECTED) {
    passed &= testStatusAPI();
    passed &= testHeartbeat();
  }

  Serial.println("\n=== System Test " + String(passed ? "PASS" : "FAIL") + " ===\n");
}

void loop() {
  delay(30000);

  // Periodic status update
  if (WiFi.status() == WL_CONNECTED) {
    testStatusAPI();
  }
}

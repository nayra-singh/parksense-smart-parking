/*
 * ParkSense Diagnostics — 05 API Test
 *
 * Tests communication with ParkSense backend.
 *
 * Configuration: Set WIFI_SSID, WIFI_PASSWORD, SERVER_URL
 * and DEVICE_API_KEY below (do not commit credentials)
 *
 * Expected output:
 *   Wi-Fi connected
 *   Sending test status...
 *   HTTP Response: 200
 *   API Test: PASS
 */

// TODO: Fill in your configuration (do not commit)
#define WIFI_SSID       "your-wifi-ssid"
#define WIFI_PASSWORD   "your-wifi-password"
#define SERVER_URL      "http://192.168.1.100:3000"
#define DEVICE_ID       "PARK-ESP32-001"
#define DEVICE_API_KEY  "your-device-api-key"

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void connectWiFi() {
  Serial.print("Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi FAILED");
    while (1) delay(1000);
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ParkSense Diagnostic: 05-API ===\n");

  connectWiFi();

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/device/status";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_API_KEY));

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  JsonArray slots = doc["slots"].to<JsonArray>();

  JsonObject s1 = slots.add<JsonObject>();
  s1["slotCode"] = "A1";
  s1["occupied"] = false;
  s1["distanceCm"] = 42.5;

  JsonObject s2 = slots.add<JsonObject>();
  s2["slotCode"] = "A2";
  s2["occupied"] = true;
  s2["distanceCm"] = 8.3;

  String payload;
  serializeJson(doc, payload);

  Serial.println("Sending test status...");
  Serial.println("Payload: " + payload);

  int httpCode = http.POST(payload);
  Serial.print("HTTP Response: ");
  Serial.println(httpCode);

  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Response: " + response);
    Serial.println("API Test: PASS");
  } else {
    Serial.print("API Test: FAIL (");
    Serial.print(httpCode);
    Serial.println(")");
    if (httpCode > 0) {
      Serial.println(http.getString());
    }
  }

  http.end();

  Serial.println("\n=== API Test Complete ===\n");
}

void loop() {
  delay(10000);
}

/*
 * ParkSense Diagnostics — 04 Wi-Fi Test
 *
 * Tests Wi-Fi connectivity.
 *
 * Configuration: Set SSID and PASSWORD below (DO NOT commit)
 *
 * Expected output:
 *   Connecting to Wi-Fi: YourNetwork
 *   ......
 *   Wi-Fi connected
 *   IP address: 192.168.1.100
 *   RSSI: -45 dBm
 *   === Wi-Fi Test Complete ===
 */

// TODO: Fill in your Wi-Fi credentials (do not commit)
#define WIFI_SSID      "your-wifi-ssid"
#define WIFI_PASSWORD  "your-wifi-password"

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ParkSense Diagnostic: 04-WiFi ===");

  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
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
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("Gateway: ");
    Serial.println(WiFi.gatewayIP());
  } else {
    Serial.println("Wi-Fi connection FAILED");
    Serial.println("Check SSID and password");
  }

  Serial.println("=== Wi-Fi Test Complete ===\n");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi connected. RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("Wi-Fi disconnected");
  }
  delay(10000);
}

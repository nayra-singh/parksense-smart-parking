#ifndef CONFIG_EXAMPLE_H
#define CONFIG_EXAMPLE_H

// ============================================================
// ParkSense — ESP32 Firmware Configuration Example
// ============================================================
// Copy this file to config.h and fill in your actual values.
// config.h is excluded from Git — do not commit it.
// ============================================================

// ---- Wi-Fi ----
#define WIFI_SSID        "your-wifi-network-name"
#define WIFI_PASSWORD    "your-wifi-password"

// ---- Server ----
#define SERVER_URL       "http://your-server-ip:3000"
#define API_STATUS_PATH  "/api/device/status"
#define API_HEARTBEAT_PATH "/api/device/heartbeat"

// ---- Device ----
#define DEVICE_ID        "PARK-ESP32-001"
#define DEVICE_API_KEY   "your-device-api-key"

// ---- Sensor Thresholds (cm) ----
// Distance below threshold = OCCUPIED
// Distance at or above threshold = AVAILABLE
#define THRESHOLD_A1  20.0
#define THRESHOLD_A2  20.0
#define THRESHOLD_A3  20.0
#define THRESHOLD_A4  20.0

// ---- Timing (milliseconds) ----
#define HEARTBEAT_INTERVAL  60000   // Send heartbeat every 60s
#define STATUS_INTERVAL     10000   // Send status update every 10s
#define SENSOR_READ_INTERVAL 500    // Read sensors every 500ms
#define DEBOUNCE_COUNT      5       // Stable readings before state change

// ---- Pin Mapping ----
// HC-SR04 Trig pins
#define TRIG_A1  26
#define TRIG_A2  27
#define TRIG_A3  14
#define TRIG_A4  13

// HC-SR04 Echo pins
#define ECHO_A1  25
#define ECHO_A2  33
#define ECHO_A3  32
#define ECHO_A4  15

// Status LEDs
#define LED_ONBOARD   2
#define LED_WIFI     4
#define LED_ERROR    16

// Optional OLED (I2C)
#define OLED_SDA      21
#define OLED_SCL      22

#endif // CONFIG_EXAMPLE_H

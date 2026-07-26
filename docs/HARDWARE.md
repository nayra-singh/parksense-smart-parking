# ParkSense Hardware Documentation

## Overview

This document describes the hardware components, wiring, and assembly for the ParkSense smart parking prototype. The prototype monitors 4 parking spaces using HC-SR04 ultrasonic sensors connected to an ESP32 microcontroller.

**⚠️ Firmware implemented — physical hardware verification required.**

## Bill of Materials

| Component | Quantity | Approx. Cost (USD) | Purpose |
|-----------|----------|-------------------|---------|
| ESP32 Development Board (ESP32-WROOM-32) | 1 | $8-12 | Main microcontroller |
| HC-SR04 Ultrasonic Sensor | 4 | $2-3 each | Distance measurement |
| 1kΩ Resistor | 4 | $0.10 each | Voltage divider |
| 2kΩ Resistor (or 2.2kΩ) | 4 | $0.10 each | Voltage divider |
| Red LED | 3 | $0.10 each | Status indicators |
| 220Ω Resistor | 3 | $0.10 each | LED current limiting |
| Breadboard | 1 | $3-5 | Prototyping |
| Jumper Wires (M-M, M-F) | 30+ | $3-5 | Connections |
| Micro USB Cable | 1 | $3-5 | Power + programming |
| USB Power Supply (5V, 2A) | 1 | $5-10 | Power source |

**Total approx: $35-60**

### Optional Components

| Component | Quantity | Purpose |
|-----------|----------|---------|
| OLED Display (128x64, I2C) | 1 | Local status display |
| Servo Motor (SG90) | 1 | Barrier control |
| RFID Reader (RC522) | 1 | Vehicle identification |

## Component Descriptions

### ESP32 Development Board
- Microcontroller: Xtensa dual-core 32-bit LX6
- Operating Voltage: 3.3V
- GPIO: 34 programmable pins (3.3V logic)
- Wi-Fi: 802.11 b/g/n
- Flash: 4MB
- RAM: 520KB SRAM
- Power: 5V via USB or 7-12V via VIN

### HC-SR04 Ultrasonic Sensor
- Operating Voltage: 5V DC
- Logic: 5V (Echo output is 5V)
- Current: ~15mA
- Range: 2cm – 400cm
- Resolution: 0.3cm
- Measurement Angle: ~15 degrees

**⚠️ IMPORTANT: The HC-SR04 Echo pin outputs 5V logic. ESP32 GPIO pins are 3.3V-tolerant (NOT 5V-tolerant on all pins). A voltage divider is REQUIRED.**

### Voltage Divider (HC-SR04 Echo → ESP32 GPIO)

Each HC-SR04 Echo pin must be connected to ESP32 GPIO through a voltage divider:

```
HC-SR04 Echo (5V)
     |
    [1kΩ Resistor]
     |
     +---→ ESP32 GPIO (3.3V)
     |
    [2kΩ Resistor]
     |
    GND
```

**Calculation:**
- Vout = Vin × (R2 / (R1 + R2))
- Vout = 5V × (2000 / (1000 + 2000))
- Vout = 5V × 0.667
- Vout = 3.33V ✓ (within 3.3V tolerance)

Alternative: Use a 2.2kΩ resistor for R2 (gives 3.44V, still acceptable).

## Pin Mapping

### Sensor Connections

| Slot | ESP32 GPIO | HC-SR04 Pin | Voltage Divider |
|------|-----------|-------------|-----------------|
| A1   | GPIO 26   | Trig        | Not required    |
| A1   | GPIO 25   | Echo        | Required        |
| A2   | GPIO 27   | Trig        | Not required    |
| A2   | GPIO 33   | Echo        | Required        |
| A3   | GPIO 14   | Trig        | Not required    |
| A3   | GPIO 32   | Echo        | Required        |
| A4   | GPIO 13   | Trig        | Not required    |
| A4   | GPIO 15   | Echo        | Required        |

### LED Connections

| LED | ESP32 GPIO | Resistor | Color  | Purpose        |
|-----|-----------|----------|--------|----------------|
| D1  | GPIO 2    | 220Ω     | Built-in | Heartbeat    |
| D2  | GPIO 4    | 220Ω     | Blue   | Wi-Fi status   |
| D3  | GPIO 16   | 220Ω     | Red    | Error indicator |

All LED anodes connect to GPIO via 220Ω resistor. Cathodes connect to GND.

### Power Connections

| Component | Power | Ground |
|-----------|-------|--------|
| ESP32     | USB (5V) or VIN | GND |
| HC-SR04 (VCC) | 5V (from ESP32 VIN or external) | GND |
| HC-SR04 (GND) | — | GND (common) |
| LEDs (via resistor) | GPIO | GND |
| Optional OLED (VCC) | 3.3V | GND |

**⚠️ Do not power all 4 HC-SR04 sensors from the ESP32 3.3V regulator.** Each HC-SR04 draws ~15mA, totaling ~60mA for 4 sensors. The ESP32 3.3V regulator can typically supply ~500mA, but the 5V pin can supply more. Connect HC-SR04 VCC to the 5V line (VIN/USB), not 3.3V.

## Breadboard Assembly

```
                    +-------------------------------+
                    |         BREADBOARD            |
                    |                               |
     ESP32          |  [HC-SR04 A1] [HC-SR04 A2]   |
   +--------+       |  [HC-SR04 A3] [HC-SR04 A4]   |
   |        |       |                               |
   |  GPIO  |-------|-> Trig/ Echo (via divider)    |
   |  ...   |       |                               |
   |  5V    |-------|-> VCC to sensors              |
   |  GND   |-------|-> Common GND                  |
   +--------+       |  [LEDs with resistors]        |
     |              +-------------------------------+
     |
   USB Cable
     |
   Power Supply
```

## Assembly Steps

1. **Prepare the breadboard**: Place the ESP32 at one end.
2. **Connect power rails**: Run 5V and GND along the breadboard.
3. **Install voltage dividers**: For each sensor's Echo pin, connect a 1kΩ in series and a 2kΩ to GND.
4. **Connect sensors**:
   - VCC → 5V rail
   - GND → GND rail
   - Trig → ESP32 GPIO (via jumper)
   - Echo → Voltage divider output → ESP32 GPIO
5. **Connect LEDs**: Each with 220Ω resistor between GPIO and LED anode.
6. **Double-check all connections** before powering on.
7. **Connect USB cable** to ESP32 for power and programming.

## Power Requirements

| Component | Voltage | Current (typical) |
|-----------|---------|------------------|
| ESP32 (active, Wi-Fi on) | 5V (USB) | ~80-200mA |
| HC-SR04 (per sensor) | 5V | ~15mA |
| Total (4 sensors + ESP32) | 5V | ~140-260mA |
| LEDs (3 × 20mA) | 3.3V | ~60mA |

A standard USB port (500mA+) is sufficient.

**If adding a servo barrier**: Do NOT power the servo from the ESP32 GPIO. Use an external 5V supply with common ground.

## Calibration

See [SETUP.md](SETUP.md) for the calibration procedure.

## Hardware Testing

After assembly, upload and run the diagnostic firmware in order:

1. `firmware/diagnostics/01_esp32_basic.ino` — Verify board functions
2. `firmware/diagnostics/02_single_sensor.ino` — Test one sensor
3. `firmware/diagnostics/03_four_sensors.ino` — Test all sensors
4. `firmware/diagnostics/04_wifi.ino` — Test Wi-Fi
5. `firmware/diagnostics/05_api.ino` — Test API communication
6. `firmware/diagnostics/06_complete_system.ino` — Full system test

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Sensor reads 0 always | Echo pin voltage too high/low | Check voltage divider |
| Sensor timeout | Wiring error | Check Trig/Echo connections |
| Unstable readings | Power insufficient | Use external 5V supply |
| ESP32 resets | Power dropout | Check USB cable and supply |
| Wi-Fi won't connect | Credentials wrong | Verify SSID/password |

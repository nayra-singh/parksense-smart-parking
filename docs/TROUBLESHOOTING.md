# ParkSense Troubleshooting Guide

## ESP32 Issues

### ESP32 Not Detected

**Symptoms:** "No serial port found" when uploading

**Causes:**
- USB cable is power-only (no data lines)
- Missing CP210x/VCP driver
- Wrong board selected in IDE

**Fixes:**
1. Try a different USB cable (data-capable)
2. Install USB-to-UART driver: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
3. In Arduino IDE: Tools → Board → ESP32 Dev Module
4. Check Device Manager for COM port

### Serial Port Unavailable

**Symptoms:** Port shows in IDE but "Access denied" when connecting

**Causes:**
- Another program using the port (Serial Monitor, Putty)
- Insufficient permissions

**Fixes:**
1. Close all other Serial Monitor windows
2. Unplug and reconnect ESP32
3. Restart Arduino IDE

### Firmware Upload Fails

**Symptoms:** "A fatal error occurred: Failed to connect to ESP32"

**Causes:**
- ESP32 not in flashing mode
- Wrong baud rate
- Board not powered

**Fixes:**
1. Hold BOOT button, press RESET, release BOOT
2. Reduce upload speed in Tools → Upload Speed (115200)
3. Ensure ESP32 is powered (LED on)

### Wi-Fi Won't Connect

**Symptoms:** Serial output shows repeated connection attempts

**Causes:**
- Wrong SSID or password in config.h
- Router not broadcasting 2.4GHz (ESP32 doesn't support 5GHz)
- Wi-Fi credentials contain special characters

**Fixes:**
1. Verify SSID/password in config.h
2. Ensure Wi-Fi network is 2.4GHz
3. Check router allows new devices
4. Test with smartphone or computer on same network

## Sensor Issues

### Sensor Always Reports 0

**Symptoms:** Distance always reads 0.00 cm

**Causes:**
- Echo pin voltage too low (divider issue)
- Wrong pin mapping
- Sensor not powered

**Fixes:**
1. Check Echo voltage divider resistors (1kΩ + 2kΩ)
2. Verify Trig/Echo pin numbers match wiring
3. Ensure HC-SR04 VCC connected to 5V, not 3.3V

### Sensor Timeout

**Symptoms:** Distance: TIMEOUT

**Causes:**
- Sensor not facing the right direction
- Object too far (>4m)
- Sensor defective
- Trig pin not pulsing correctly

**Fixes:**
1. Ensure sensor has clear line of sight
2. Check Trig pin connection
3. Test with diagnostic firmware 02-single-sensor
4. Replace sensor if defective

### Unstable Readings

**Symptoms:** Distance jumps between values rapidly

**Causes:**
- Power supply insufficient
- Sensor mounted on vibrating surface
- Acoustic interference from other sensors
- Object at edge of detection cone

**Fixes:**
1. Use external 5V supply (not USB)
2. Mount sensors stably
3. Stagger sensor readings (already implemented)
4. Increase debounce count in config

### False Occupancy

**Symptoms:** Slot shows OCCUPIED when empty

**Causes:**
- Threshold set too high
- Sensor angled toward ground
- Temperature/humidity affecting speed of sound

**Fixes:**
1. Recalibrate threshold (measure empty distance)
2. Adjust sensor angle
3. Add temperature compensation (future feature)

## Backend Issues

### Backend Unreachable

**Symptoms:** ESP32 shows "HTTP Error: connection refused"

**Causes:**
- Server not running
- Wrong SERVER_URL in config.h
- Firewall blocking port 3000
- ESP32 and server on different networks

**Fixes:**
1. Verify `npm run dev` is running
2. Check SERVER_URL includes port
3. Disable firewall temporarily for testing
4. Ensure both devices on same network

### 401 Device Unauthorized

**Symptoms:** HTTP 401 response

**Causes:**
- Wrong DEVICE_API_KEY in config.h
- Device not registered in admin panel
- Device disabled

**Fixes:**
1. Re-register device in admin panel
2. Copy the new credential to config.h
3. Ensure device isActive = true

### Database Unavailable

**Symptoms:** "Can't reach database server" in console

**Causes:**
- PostgreSQL not running
- Wrong DATABASE_URL in .env
- Port 5432 blocked
- Docker container not started

**Fixes:**
1. `docker compose up -d db` (Docker)
2. `pg_isready` (local PostgreSQL)
3. Check DATABASE_URL format
4. Verify PostgreSQL port

### Prisma Errors

**Symptoms:** "Schema not generated" or migration errors

**Causes:**
- Prisma client not generated
- Schema change after push
- Database mismatch

**Fixes:**
1. `npx prisma generate`
2. `npx prisma db push`
3. `npx prisma db push --force-reset` (destroys data)

## Dashboard Issues

### Dashboard Not Updating

**Symptoms:** Parking status stuck on old values

**Causes:**
- Polling interval (10s) not elapsed
- API returning stale data
- Browser cache

**Fixes:**
1. Wait for poll interval
2. Check Network tab in dev tools
3. Hard refresh (Ctrl+Shift+R)
4. Verify API returns current data

### Device Showing Offline

**Symptoms:** Device status = OFFLINE on dashboard

**Causes:**
- ESP32 not powered
- Wi-Fi disconnected
- Heartbeat timeout (default 2 minutes)
- Server not receiving heartbeats

**Fixes:**
1. Power cycle ESP32
2. Check Wi-Fi connectivity
3. Wait for next heartbeat interval
4. Verify device API endpoint

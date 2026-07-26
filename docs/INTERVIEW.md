# ParkSense — Interview Preparation

## Project Summary

**ParkSense** is an IoT smart parking monitoring system that uses ESP32 microcontrollers with HC-SR04 ultrasonic sensors to detect parking space occupancy. Sensor data is transmitted via REST API to a Next.js backend, stored in PostgreSQL, and displayed on a real-time dashboard with analytics.

## Key Technical Concepts

### What is ParkSense?
An end-to-end IoT system combining embedded C++ firmware on ESP32 with a full-stack Next.js web application to monitor parking space availability in real time.

### Problem Being Solved
Drivers waste time searching for parking. ParkSense provides real-time availability information to reduce search time and improve parking facility utilization.

### System Architecture
Hardware (sensors → ESP32) → Network (Wi-Fi → REST API) → Backend (Next.js → PostgreSQL) → Frontend (React dashboard with Recharts analytics).

### Why ESP32?
Low-cost ($8-12), built-in Wi-Fi/Bluetooth, dual-core processor, sufficient GPIO for 4+ sensors, Arduino-compatible, widely available.

### How Ultrasonic Sensing Works
HC-SR04 emits a 40kHz ultrasonic pulse from the Trig pin. The sound wave reflects off objects and returns to the Echo pin. Distance = (time × speed of sound) / 2.

### Trigger and Echo
- **Trigger**: ESP32 sends a 10-microsecond HIGH pulse to Trig pin
- **Echo**: HC-SR04 emits ultrasound and waits for echo. When echo returns, Echo pin goes HIGH for duration proportional to distance.

### Why Voltage Conversion is Required
HC-SR04 Echo pin outputs ~5V. ESP32 GPIO operates at 3.3V. Direct connection risks damaging the ESP32. A voltage divider (1kΩ + 2kΩ) steps down 5V to ~3.33V.

### Distance Calculation
`distance = (pulseDuration × 0.0343) / 2` where 0.0343 cm/μs is the speed of sound.

### Sensor Noise and Filtering
Sensor readings fluctuate due to electrical noise, surface irregularities, and environment. Debouncing requires N consecutive consistent readings before changing state.

### Threshold Calibration
Measure empty distance and occupied distance, then choose a threshold midway between them.

### REST vs MQTT
- **REST**: Simpler, stateless, easier to debug, no broker needed. Chosen for V1.
- **MQTT**: Publish/subscribe model, better for many devices, lower bandwidth, but requires broker infrastructure.

### Database Relationships
ParkingLot 1:N ParkingZone 1:N ParkingSlot 1:1 Sensor N:1 Device. ParkingSlot 1:N ParkingEvent.

### Real-Time Updates
Polling (10-second interval) — simplest reliable method. Sufficient for parking use case where sub-second updates aren't required.

## 30 Likely Technical Interview Questions

### IoT / Embedded Systems

1. **Q: How does the HC-SR04 ultrasonic sensor work?**
   A: Trig pin sends 10μs pulse, sensor emits 8 cycles of 40kHz ultrasound. Echo pin goes HIGH when echo is received. Duration of HIGH pulse is proportional to distance.

2. **Q: Why can't you connect HC-SR04 Echo directly to ESP32?**
   A: Echo outputs ~5V, ESP32 GPIO is 3.3V. Direct connection may damage the GPIO pin. A voltage divider is required.

3. **Q: Calculate the voltage divider resistor values for HC-SR04 to ESP32.**
   A: Using R1=1kΩ (series) and R2=2kΩ (to GND): Vout = 5V × (2000/(1000+2000)) = 3.33V.

4. **Q: How do you handle sensor noise in firmware?**
   A: Implement debouncing — require N consecutive consistent readings before changing state. Configurable via DEBOUNCE_COUNT.

5. **Q: What is the ParkSense detection algorithm?**
   A: Read distance → Validate reading → Compare against threshold → Apply debounce filter → Update state if stable.

6. **Q: How does the firmware avoid blocking delays?**
   A: Uses `millis()` timers instead of `delay()`. Each task (sensor read, status update, heartbeat, LED) runs at its own interval.

7. **Q: What happens if a sensor fails?**
   A: The sensor reports UNKNOWN status. A broken sensor does NOT show AVAILABLE — this would be unsafe.

8. **Q: What states does a parking slot support?**
   A: AVAILABLE, OCCUPIED, UNKNOWN (sensor error), OUT_OF_SERVICE (admin disabled).

9. **Q: How does the ESP32 authenticate with the server?**
   A: Bearer token in HTTP Authorization header. Token hashed (SHA-256) server-side. Never stored in plaintext.

10. **Q: What happens if Wi-Fi disconnects?**
    A: Firmware detects disconnection, attempts reconnect every 5 seconds. Continues measuring sensors locally. Re-sends data when reconnected.

### Backend / Database

11. **Q: Why Prisma over raw SQL?**
    A: Type safety, auto-generated queries, migration management, schema-as-source-of-truth, reduced boilerplate.

12. **Q: Explain the database schema relationships.**
    A: ParkingLot → ParkingZone → ParkingSlot → Sensor/ParkingEvent. Device → Sensor/DeviceHeartbeat. Hierarchical: lot contains zones, zones contain slots.

13. **Q: How is parking duration calculated?**
    A: When OCCUPIED→AVAILABLE transition occurs, find the previous OCCUPIED event for that slot. Calculate duration = currentTime - occupiedTimestamp.

14. **Q: Database indexes used and why?**
    A: parking_slots(zoneId, status) for filtering, parking_events(parkingSlotId, timestamp) for history, devices(deviceIdentifier) for auth lookup.

15. **Q: How is device offline detection implemented?**
    A: ESP32 sends heartbeat every 60s. Backend checks if lastSeenAt > timeout threshold (default 2 min). Creates alert and marks device OFFLINE.

16. **Q: What Zod validations are performed?**
    A: Device ID format, slot code length, distance range (0-1000cm), required fields, email format, string lengths.

### Frontend

17. **Q: Why polling over WebSockets?**
    A: Simpler implementation, sufficient for parking (sub-minute updates OK), works through proxies, easy to debug. Trade-off: higher latency and more HTTP requests.

18. **Q: How is the parking map rendered?**
    A: Fetches slot data via API, groups by zone, renders cards with color-coded borders and text status indicators (not color-dependent for accessibility).

19. **Q: What analytics are shown?**
    A: Current occupancy (total/available/occupied/rate), peak hours (bar chart), slot utilization (per-slot events), parking duration.

### Security

20. **Q: How is RBAC implemented?**
    A: Three roles (ADMIN, OPERATOR, VIEWER) with hierarchical permissions. Middleware and API route handlers check roles. Server-side enforcement on every request.

21. **Q: How are device credentials secured?**
    A: Generated server-side, hashed with SHA-256 before storage, displayed once at registration. Stored in config.h (excluded from Git).

22. **Q: What would you do to improve security?**
    A: Add rate limiting, enforce HTTPS, add HTTP security headers, implement audit logging, add brute-force protection.

### General Engineering

23. **Q: How would you scale this system?**
    A: Multiple ESP32 devices per facility, multiple facilities per backend, database indexing, read replicas for analytics, horizontal scaling of Next.js.

24. **Q: What testing is implemented?**
    A: Unit tests for validation schemas and device auth. Hardware diagnostics firmware for component testing.

25. **Q: How does Docker support deployment?**
    A: Multi-stage Dockerfile for optimized builds. Docker Compose orchestrates app + PostgreSQL with health checks.

26. **Q: What would you add for production?**
    A: HTTPS, rate limiting, monitoring/alerting (Prometheus), centralized logging, MQTT for larger deployments, mobile app.

27. **Q: How is the sensor threshold configured?**
    A: Per-sensor threshold in firmware config.h. Also stored in database Sensor model for backend reference.

28. **Q: Explain the event system.**
    A: Every AVAILABLE↔OCCUPIED transition creates a ParkingEvent. Events store previous and new status, distance, calculated duration, and timestamp.

29. **Q: How is the seed database populated?**
    A: prisma/seed.ts creates admin user, parking lot with two zones (A, B), 8 slots, 1 device with 4 sensors.

30. **Q: What are the project's limitations?**
    A: No rate limiting, no HTTPS in dev, single prototype scale (4 slots), no temperature compensation for sensors, no mobile app.

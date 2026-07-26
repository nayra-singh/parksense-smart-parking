# ParkSense Architecture

## System Overview

ParkSense is an IoT-based smart parking monitoring system that uses ESP32 microcontrollers with distance sensors to detect parking space occupancy. Data is transmitted via REST API to a Next.js backend, stored in PostgreSQL, and displayed on a real-time web dashboard.

## Architecture Diagram

```
                    VEHICLE
                       |
                PARKING SPACE
                       |
               DISTANCE SENSOR
                    (HC-SR04)
                       |
                     ESP32
                   (C/C++)
                       |
                     Wi-Fi
                   (802.11 b/g/n)
                       |
                REST API (JSON)
                       |
            Next.js Application
                  /        \
          PostgreSQL      Dashboard
        (Prisma ORM)    (React/Recharts)
                           |
                 Real-Time Status
                       +
                    Analytics
```

## Layers

### 1. Hardware Layer

- **ESP32 Development Board**: Main microcontroller that reads sensor data and communicates with the server.
- **HC-SR04 Ultrasonic Sensors**: One per parking slot, measures distance to detect vehicle presence.
- **Status LEDs**: Visual indicators for system status (Wi-Fi, errors, heartbeat).
- **Voltage Divider**: Required between HC-SR04 Echo (5V) and ESP32 GPIO (3.3V).

### 2. Firmware Layer (C/C++)

- **Sensor Reading**: Non-blocking distance measurement using `millis()` scheduling.
- **Debounce Filter**: Requires N consecutive stable readings before state change.
- **State Machine**: Tracks slot states (AVAILABLE, OCCUPIED, UNKNOWN) with configurable thresholds.
- **Wi-Fi Manager**: Automatic connection and reconnection.
- **REST Client**: Sends JSON payloads to the backend with device authentication.

### 3. Communication Layer

- **REST API over HTTP**: Chosen for simplicity and reliability over MQTT for V1.
- **JSON Payload**: Device status and heartbeat messages.
- **Bearer Token Auth**: ESP32 authenticates using API key in Authorization header.

### 4. Backend Layer (Next.js)

- **Route Handlers**: RESTful API endpoints for device communication, parking data, and analytics.
- **Prisma ORM**: Database abstraction with type-safe queries.
- **Zod Validation**: Server-side input validation for all endpoints.
- **NextAuth.js**: Authentication with JWT session strategy.
- **RBAC**: Role-based access control (ADMIN, OPERATOR, VIEWER).

### 5. Database Layer (PostgreSQL)

- Relational data model with 10+ models covering lots, zones, slots, devices, sensors, events, and alerts.

### 6. Frontend Layer (React/Next.js)

- **Server Components**: Landing page and authenticated layouts.
- **Client Components**: Dashboard with real-time polling, interactive parking map, and analytics charts.
- **Recharts**: Data visualization for occupancy trends and peak hours.

## Key Design Decisions

### REST over MQTT (V1)

REST was chosen for V1 because:
- Simpler to implement and debug
- No additional broker infrastructure required
- HTTP is stateless and easier to secure with standard API key auth
- Sufficient for the prototype scale (4 sensors per ESP32)

If MQTT is added later, topic structure would be:
- `parksense/device/{deviceId}/status`
- `parksense/device/{deviceId}/heartbeat`
- `parksense/device/{deviceId}/command`

### Polling over WebSockets/SSe

Polling (10-second interval) was chosen for real-time updates because:
- Simplest implementation with no persistent connection overhead
- Sufficient for parking use case (sub-minute updates are acceptable)
- Works reliably through proxies and load balancers
- Easy to debug and test

Trade-offs:
- Higher latency than WebSockets (up to 10s delay)
- More HTTP requests than necessary
- Not suitable for sub-second real-time requirements

### Debounce Algorithm

The firmware requires `DEBOUNCE_COUNT` (5) consecutive consistent readings before changing slot state. This prevents rapid toggling from:
- Sensor noise
- Transient objects (pedestrians, animals)
- Vibration
- Electrical interference

## Scalability Considerations

- Each ESP32 can monitor 4+ sensors (limited by GPIO pins)
- Multiple ESP32 devices can report to the same backend
- Database indexes on `parking_slot_id`, `timestamp`, and `status` support query performance
- Analytics queries use aggregation rather than raw event scanning

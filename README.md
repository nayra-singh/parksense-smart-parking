# ParkSense

**IoT Smart Parking & Real-Time Monitoring System**

[![CI](https://github.com/yourusername/parksense-smart-parking/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/parksense-smart-parking/actions/workflows/ci.yml)

---

## Overview

ParkSense is an IoT-based smart parking monitoring system that uses ESP32 microcontrollers with HC-SR04 ultrasonic sensors to detect parking space occupancy in real time. Sensor data is transmitted via REST API to a Next.js backend, stored in PostgreSQL, and displayed on a live web dashboard with analytics.

Built as a portfolio project demonstrating end-to-end IoT system development — from embedded C++ firmware on ESP32 to a full-stack TypeScript web application.

---

## Problem Statement

Drivers in congested parking facilities waste significant time searching for available spaces. Traditional parking systems lack real-time visibility at the individual space level. ParkSense provides per-space occupancy detection and a live dashboard to reduce search time and improve utilization.

---

## Solution

An end-to-end system combining:
- **ESP32** with ultrasonic sensors at each parking space
- **REST API** communication over Wi-Fi
- **PostgreSQL** database with event-driven occupancy tracking
- **Next.js dashboard** with real-time status and historical analytics

---

## Features

- **Real-Time Parking Monitoring** — Live status of individual parking spaces with 10-second polling updates
- **Visual Parking Map** — Color-coded layout with text indicators (accessible, not color-dependent)
- **Occupancy Analytics** — Historical occupancy, peak hours, parking duration, slot utilisation
- **Device Management** — ESP32 device registration, monitoring, online/offline status
- **Alert System** — Automatic alerts for device offline, sensor failures, authentication issues
- **Role-Based Access** — ADMIN, OPERATOR, VIEWER roles with server-side enforcement
- **Sensor Calibration** — Per-slot configurable distance thresholds with debounce filtering

---

## Architecture

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
                       |
                REST API (JSON)
                       |
                APPLICATION
                  /        \
          PostgreSQL     Dashboard
        (Prisma ORM)   (React/Recharts)
                           |
                 Real-Time Status
                       +
                    Analytics
```

---

## Hardware

### Required Components
| Component | Quantity |
|-----------|----------|
| ESP32 Development Board | 1 |
| HC-SR04 Ultrasonic Sensor | 4 |
| 1kΩ Resistors | 4 |
| 2kΩ Resistors | 4 |
| LEDs + 220Ω Resistors | 3 each |
| Breadboard | 1 |
| Jumper Wires | 30+ |
| Micro USB Cable | 1 |

**⚠️ Firmware implemented — physical hardware verification required.**

A voltage divider (1kΩ + 2kΩ) is required between each HC-SR04 Echo pin (5V) and ESP32 GPIO (3.3V).

See [docs/HARDWARE.md](docs/HARDWARE.md) for full details.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Microcontroller | ESP32 (ESP-WROOM-32) |
| Sensor | HC-SR04 Ultrasonic |
| Firmware | C/C++ (Arduino Framework) |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers, REST APIs |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (JWT) |
| Charts | Recharts |
| Validation | Zod |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Testing | Jest, React Testing Library |

---

## Parking Detection Algorithm

1. **Read Distance**: ESP32 sends 10μs trigger pulse, measures echo pulse duration.
2. **Calculate**: `distance = (duration × 0.0343) / 2` (speed of sound = 343 m/s)
3. **Validate**: Check for timeout (no echo) and out-of-range values.
4. **Threshold Compare**: `distance < threshold → OCCUPIED`, `distance >= threshold → AVAILABLE`
5. **Debounce**: Require 5 consecutive stable readings before changing state.
6. **Update**: Send new state to backend via REST API.

---

## Database

10 models: User, ParkingLot, ParkingZone, ParkingSlot, Device, Sensor, ParkingEvent, DeviceHeartbeat, Alert, AuditLog

```
ParkingLot → ParkingZone → ParkingSlot → Sensor/Event
Device → Sensor/Heartbeat
```

See [docs/DATABASE.md](docs/DATABASE.md) for schema details.

---

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/device/status | Bearer Token | Submit parking status |
| POST | /api/device/heartbeat | Bearer Token | Device heartbeat |
| GET | /api/parking/lots | Session | List parking lots |
| GET | /api/parking/zones | Session | List zones |
| GET | /api/parking/slots | Session | List slots |
| GET | /api/parking/slots/:id | Session | Slot details |
| GET | /api/analytics/occupancy | Session | Occupancy data |
| GET | /api/analytics/utilization | Session | Utilization data |
| GET | /api/alerts | Session | System alerts |
| POST/PATCH | /api/admin/* | ADMIN | Admin operations |

See [docs/API.md](docs/API.md) for full documentation.

---

## Installation

### Prerequisites
- Node.js 20+, npm, Git
- PostgreSQL (local or Docker)
- Arduino IDE or PlatformIO (for ESP32)

### Quick Start

```bash
# Clone
git clone https://github.com/yourusername/parksense-smart-parking.git
cd parksense-smart-parking

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your database URL and auth secret

# Database
npx prisma generate
npx prisma db push
npm run db:seed

# Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@parksense.io | admin123 |
| Operator | operator@parksense.io | operator123 |
| Viewer | viewer@parksense.io | viewer123 |

See [docs/SETUP.md](docs/SETUP.md) for complete setup including ESP32 flashing.

---

## ESP32 Setup

1. Copy `firmware/esp32/config.example.h` to `firmware/esp32/config.h`
2. Fill in Wi-Fi credentials and server URL
3. Register device in Admin panel
4. Copy device API key to config.h
5. Flash firmware via Arduino IDE or PlatformIO

See [docs/SETUP.md](docs/SETUP.md) for detailed steps.

---

## Calibration

For each parking slot:
1. Measure distance when empty
2. Measure distance when occupied (with representative vehicle)
3. Set threshold halfway between the two values
4. Test multiple parking/unparking cycles
5. Adjust as needed

---

## Testing

```bash
# Unit tests
npm test

# Lint
npm run lint

# TypeScript check
npm run typecheck
```

---

## Security

- Device authentication via Bearer tokens (SHA-256 hashed)
- User authentication via NextAuth.js (BCrypt passwords)
- Role-based access control with server-side enforcement
- Input validation via Zod schemas
- No secrets committed to Git (`.env` and `config.h` excluded)
- Firmware secrets in `config.h` (excluded from Git)

See [docs/SECURITY.md](docs/SECURITY.md) for full details.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and design decisions |
| [HARDWARE.md](docs/HARDWARE.md) | Bill of materials, wiring, assembly |
| [SETUP.md](docs/SETUP.md) | Installation and configuration |
| [API.md](docs/API.md) | API endpoint reference |
| [DATABASE.md](docs/DATABASE.md) | Database schema and relationships |
| [SECURITY.md](docs/SECURITY.md) | Security controls |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and fixes |
| [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) | Current project status |
| [INTERVIEW.md](docs/INTERVIEW.md) | Interview preparation |
| [CV.md](docs/CV.md) | CV-ready description |

---

## Known Limitations

- Rate limiting not yet implemented
- HTTPS only in production (not development)
- No temperature compensation for ultrasonic sensors
- Prototype scale: 4 parking spaces per ESP32
- No mobile application
- No reservation or payment system

---

## Future Improvements

- MQTT protocol for larger deployments
- ANPR / camera-based vehicle detection
- RFID vehicle identification
- Reservation and navigation system
- Mobile application (React Native)
- ML-based occupancy prediction
- Cloud deployment (Vercel/AWS)
- Multiple parking facility management
- EV charging integration

---

## Project Status

**Current Phase**: Software complete, firmware implemented. Hardware assembly and physical testing pending.

| Component | Status |
|-----------|--------|
| Software | ✅ Implemented & Tested |
| ESP32 Firmware | ⚠️ Implemented — Hardware Verification Required |
| Physical Hardware | ⚠️ Requires Physical Verification |
| Documentation | ✅ Complete |
| Docker | ✅ Configured |
| CI/CD | ✅ Configured |

---

## Learning Outcomes

- Embedded systems programming with ESP32 and Arduino framework
- Ultrasonic sensor integration and signal processing
- IoT device-to-cloud communication via REST APIs
- Full-stack web development with Next.js and TypeScript
- Database design with Prisma ORM and PostgreSQL
- Authentication and authorization patterns
- Real-time data visualization
- Docker containerization
- CI/CD pipeline setup
- Technical documentation writing

---

## License

MIT

---

## Repository

[GitHub](https://github.com/yourusername/parksense-smart-parking)

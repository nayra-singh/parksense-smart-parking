# ParkSense — CV Description

## Project Title

**ParkSense — IoT Smart Parking & Real-Time Monitoring System**

## Technologies

ESP32 • C/C++ • IoT • Next.js • TypeScript • PostgreSQL • Prisma • REST APIs • Docker • Git

## CV Bullet Points

- Developed an IoT smart parking prototype using ESP32 microcontroller and HC-SR04 ultrasonic distance sensors to determine real-time parking-space occupancy with configurable threshold detection and debounce filtering.

- Implemented device-to-server communication (REST API with Bearer token authentication) for transmitting parking status, sensor health data, and periodic heartbeats to a full-stack monitoring platform.

- Built a Next.js web dashboard with TypeScript displaying real-time parking availability, visual parking map, historical occupancy analytics, and slot-utilisation charts using Recharts.

- Designed PostgreSQL database schema (10 models) via Prisma ORM for parking lots, zones, slots, devices, sensors, occupancy events, heartbeats, alerts, and audit logs with appropriate indexes and relationships.

- Implemented role-based access control (ADMIN, OPERATOR, VIEWER) with NextAuth.js authentication, JWT session management, and server-side authorization middleware.

- Created ESP32 firmware in C++ (Arduino framework) with non-blocking scheduling, automatic Wi-Fi reconnection, sensor debounce algorithm, state detection, JSON serialization, and REST API client.

- Built Docker deployment configuration with multi-stage builds and Docker Compose orchestration for application and PostgreSQL services.

- Established CI/CD pipeline using GitHub Actions with automated linting, TypeScript type-checking, testing, and production build verification.

- Configured device authentication with hashed credentials, alert system for device offline and sensor failure detection, and comprehensive input validation using Zod schemas.

## Notes

- This is a portfolio/academic project. It has not been deployed in production.
- Hardware firmware is implemented but requires physical verification.
- Dashboard uses seed data for development demonstration.
- No performance benchmarks, accuracy percentages, or user numbers are claimed — these have not been measured.

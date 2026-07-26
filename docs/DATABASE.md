# ParkSense Database Schema

## Overview

PostgreSQL database managed via Prisma ORM. The schema supports parking lots organized into zones with individual parking slots, monitored by devices and sensors.

## Entity Relationship Diagram

```
ParkingLot
   |
   └── ParkingZone (1:N)
           |
           └── ParkingSlot (1:N)
                   |
                   ├── Sensor (1:1)
                   │       └── Device (N:1)
                   │
                   └── ParkingEvent (1:N)

Device (1:N) ── DeviceHeartbeat

User (1:N) ── AuditLog

Alert (standalone)
```

## Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String? | Display name |
| email | String (unique) | Login email |
| passwordHash | String? | BCrypt hash |
| role | Enum (ADMIN/OPERATOR/VIEWER) | Access level |
| isActive | Boolean | Account enabled |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### ParkingLot
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String | Lot name |
| address | String? | Location |
| description | String? | Notes |
| isActive | Boolean | |
| createdAt | DateTime | |

### ParkingZone
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| lotId | String (FK) | Parent lot |
| name | String | Display name |
| code | String | Short code (A, B, etc.) |
| isActive | Boolean | |
| Unique | [lotId, code] | |

### ParkingSlot
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| zoneId | String (FK) | Parent zone |
| code | String | Slot code (A1, A2, etc.) |
| status | Enum (AVAILABLE/OCCUPIED/UNKNOWN/OUT_OF_SERVICE) | Current status |
| isActive | Boolean | |
| Unique | [zoneId, code] | |
| Index | [zoneId, status] | |

### Device
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| deviceIdentifier | String (unique) | Human-readable ID |
| name | String? | Display name |
| location | String? | Physical location |
| credentialHash | String | SHA-256 of API key |
| isActive | Boolean | |
| status | Enum (ONLINE/OFFLINE/UNKNOWN) | |
| lastSeenAt | DateTime? | Last heartbeat |
| createdAt | DateTime | |

### Sensor
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| deviceId | String (FK) | Parent device |
| parkingSlotId | String (FK, unique) | Associated slot |
| sensorType | String | "HC-SR04" |
| thresholdCm | Float | Configurable threshold |
| isActive | Boolean | |

### ParkingEvent
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| parkingSlotId | String (FK) | |
| previousStatus | Enum | Status before change |
| newStatus | Enum | Status after change |
| distanceCm | Float? | Reading at event time |
| durationSec | Int? | Parking duration |
| timestamp | DateTime | Event time |
| Index | [parkingSlotId, timestamp] | |

### DeviceHeartbeat
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| deviceId | String (FK) | |
| status | String | "ONLINE" |
| timestamp | DateTime | |
| Index | [deviceId, timestamp] | |

### Alert
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| type | Enum | DEVICE_OFFLINE, SENSOR_FAILURE, INVALID_MEASUREMENT, AUTH_FAILURE, SYSTEM |
| severity | Enum | INFO, WARNING, CRITICAL |
| title | String | Short description |
| message | String | Details |
| entityType | String? | Related entity type |
| entityId | String? | Related entity ID |
| resolved | Boolean | |
| resolvedAt | DateTime? | |
| createdAt | DateTime | |

### AuditLog
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String? (FK) | |
| action | String | Action performed |
| entityType | String | Entity affected |
| entityId | String? | |
| metadata | Json? | Additional data |
| createdAt | DateTime | |

## Indexes

- `parking_slots`: zoneId, status
- `parking_events`: parkingSlotId, timestamp, newStatus
- `device_heartbeats`: deviceId, timestamp
- `devices`: deviceIdentifier
- `alerts`: type, resolved, createdAt
- `audit_logs`: userId, entityType, createdAt

## Key Relationships

```
ParkingLot 1──N ParkingZone
ParkingZone 1──N ParkingSlot
ParkingSlot 1──1 Sensor
Device 1──N Sensor
Device 1──N DeviceHeartbeat
ParkingSlot 1──N ParkingEvent
User 1──N AuditLog
```

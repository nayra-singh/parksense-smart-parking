# ParkSense API Documentation

## Base URL

Development: `http://localhost:3000`

## Authentication

### Device Authentication
Device endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <device-api-key>
```

The API key is generated when the device is registered in the admin panel.

### User Authentication
User endpoints use NextAuth.js JWT session cookies.

## Endpoints

### Device Status

**POST /api/device/status**

Receive parking slot status from ESP32.

```
Content-Type: application/json
Authorization: Bearer <device-api-key>
```

Request body:
```json
{
  "deviceId": "PARK-ESP32-001",
  "slots": [
    {
      "slotCode": "A1",
      "occupied": true,
      "distanceCm": 8.4
    },
    {
      "slotCode": "A2",
      "occupied": false,
      "distanceCm": 42.7
    }
  ]
}
```

Response `200`:
```json
{
  "received": true,
  "results": [
    { "slotCode": "A1", "status": "OCCUPIED", "distanceCm": 8.4 },
    { "slotCode": "A2", "status": "AVAILABLE", "distanceCm": 42.7 }
  ]
}
```

Errors:
- `401` — Unauthorized (invalid device credentials)
- `422` — Validation error

### Device Heartbeat

**POST /api/device/heartbeat**

```
Content-Type: application/json
Authorization: Bearer <device-api-key>
```

Request body:
```json
{
  "deviceId": "PARK-ESP32-001"
}
```

Response `200`:
```json
{
  "received": true,
  "timestamp": "2026-07-27T12:00:00.000Z"
}
```

### Parking Lots

**GET /api/parking/lots**

Returns all active parking lots with zones and slots.

Response `200`:
```json
{
  "lots": [
    {
      "id": "lot-id",
      "name": "Main Parking Lot",
      "zones": [
        {
          "id": "zone-id",
          "code": "A",
          "name": "Zone A",
          "slots": [
            {
              "id": "slot-id",
              "code": "A1",
              "status": "OCCUPIED"
            }
          ]
        }
      ]
    }
  ]
}
```

### Parking Zones

**GET /api/parking/zones?lotId={lotId}**

Returns zones filtered by lot if `lotId` provided.

### Parking Slots

**GET /api/parking/slots?zoneId={zoneId}&status={status}**

Returns slots with optional filtering by zone and status.

**GET /api/parking/slots/{id}**

Returns single slot with recent events.

### Analytics

**GET /api/analytics/occupancy?zoneId={zoneId}&period={daily|weekly|hourly}**

Returns current and historical occupancy data.

**GET /api/analytics/utilization?zoneId={zoneId}**

Returns per-slot utilization stats and peak hour data.

### Alerts

**GET /api/alerts?resolved={true|false}&type={type}**

Returns alerts with optional filtering (requires OPERATOR+ role).

**PATCH /api/alerts/{id}**

Resolve an alert (requires ADMIN role).

Request body:
```json
{
  "resolved": true
}
```

### Admin APIs (ADMIN role required)

**GET /api/admin/devices** — List all devices
**POST /api/admin/devices** — Register new device
**PATCH /api/admin/devices/{id}** — Update device (name, location, active)
**DELETE /api/admin/devices/{id}** — Deactivate device

**POST /api/admin/parking-lots** — Create parking lot
**POST /api/admin/zones** — Create parking zone
**POST /api/admin/slots** — Create parking slot

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Validation error |
| 429 | Rate limited |
| 500 | Internal server error |

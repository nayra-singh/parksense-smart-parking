# ParkSense Setup Guide

## Prerequisites

### Software
- **Git**: `git --version` (2.30+)
- **Node.js**: `node --version` (20.x LTS)
- **npm**: `npm --version` (9+)
- **PostgreSQL**: `psql --version` (14+) or Docker
- **Docker**: `docker --version` (24+) and `docker compose` (optional)
- **Arduino IDE** (2.x) or **PlatformIO** (VS Code extension)
- **ESP32 Board Package**: Install via Arduino Boards Manager

### Hardware
- See [HARDWARE.md](HARDWARE.md) for full bill of materials

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/parksense-smart-parking.git
cd parksense-smart-parking
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
DATABASE_URL="postgresql://parksense:parksense123@localhost:5432/parksense"
AUTH_SECRET="generate-a-random-secret-here"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a secure AUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Start PostgreSQL

#### Option A: Docker (recommended)

```bash
docker compose up -d db
```

#### Option B: Local PostgreSQL

```bash
# Create database
createdb parksense

# Or via psql
psql -U postgres -c "CREATE DATABASE parksense;"
```

### 5. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with demo data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 7. Login

Use seeded credentials:
- **Admin**: admin@parksense.io / admin123
- **Operator**: operator@parksense.io / operator123
- **Viewer**: viewer@parksense.io / viewer123

## ESP32 Setup

### 1. Install Arduino IDE / PlatformIO

**Arduino IDE:**
1. Download from https://www.arduino.cc/en/software
2. Open Arduino IDE
3. Go to File → Preferences
4. Add to "Additional Boards Manager URLs":
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
5. Go to Tools → Board → Boards Manager
6. Search for "ESP32" and install

**PlatformIO (VS Code):**
1. Install VS Code
2. Install PlatformIO extension
3. Open the `firmware/esp32` folder

### 2. Install Required Libraries

For Arduino IDE:
- Go to Tools → Manage Libraries
- Install "ArduinoJson" by Benoit Blanchon

For PlatformIO: Libraries are auto-installed from `platformio.ini`.

### 3. Configure Firmware

```bash
cp firmware/esp32/config.example.h firmware/esp32/config.h
```

Edit `firmware/esp32/config.h`:

```c
#define WIFI_SSID        "YourWiFiNetwork"
#define WIFI_PASSWORD    "YourWiFiPassword"
#define SERVER_URL       "http://192.168.1.100:3000"  // Your server IP
#define DEVICE_ID        "PARK-ESP32-001"
#define DEVICE_API_KEY   "your-device-api-key"        // From admin panel
```

### 4. Register Device in Web App

1. Login as Admin
2. Go to Admin → Devices
3. Click "Register Device"
4. Enter Device Identifier: `PARK-ESP32-001`
5. Copy the generated credential to `config.h`

### 5. Flash ESP32

**Arduino IDE:**
1. Open `firmware/esp32/src/main.cpp`
2. Select board: "ESP32 Dev Module"
3. Select correct COM port
4. Click Upload

**PlatformIO:**
```bash
cd firmware/esp32
pio run --target upload
```

### 6. Monitor Serial Output

**Arduino IDE:** Tools → Serial Monitor (115200 baud)

**PlatformIO:**
```bash
pio device monitor
```

## Sensor Calibration

For each parking space:

1. **Measure empty distance**: Park no vehicle, record reading (e.g., 45 cm)
2. **Measure occupied distance**: Park a representative vehicle, record reading (e.g., 8 cm)
3. **Choose threshold**: Pick a value between empty and occupied (e.g., 25 cm)
   - Threshold = (empty_distance + occupied_distance) / 2 is a good starting point
4. **Configure threshold**: Update `config.h` threshold value for the slot
5. **Test**: Verify detection with multiple parking/unparking cycles
6. **Adjust**: Increase threshold if false OCCUPIED, decrease if false AVAILABLE

## Verify

### API Test
```bash
curl -X POST http://localhost:3000/api/device/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-device-api-key" \
  -d '{"deviceId":"PARK-ESP32-001","slots":[{"slotCode":"A1","occupied":true,"distanceCm":8.4}]}'
```

### Dashboard Test
1. Open `http://localhost:3000/dashboard`
2. Verify parking slots display
3. Observe status changes when sensor data is received

## Docker Production Deployment

```bash
# Build and start all services
docker compose up -d --build

# Run database migrations
docker compose exec app npx prisma db push

# Seed database
docker compose exec app npx prisma db seed

# View logs
docker compose logs -f
```

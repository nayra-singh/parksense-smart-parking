# ParkSense Security Documentation

## Overview

ParkSense implements security controls across all layers: device authentication, user authentication, API security, and data protection.

## Device Security

### Device Authentication
- Each ESP32 has a unique `deviceIdentifier` and API key
- API key is generated server-side during device registration
- Key is hashed (SHA-256) before storage — plaintext is never stored
- Key is displayed only once at registration time
- All device API calls require `Authorization: Bearer <key>` header

### Firmware Secrets
- API key and Wi-Fi credentials stored in `firmware/esp32/config.h`
- `config.h` is excluded from Git (in `.gitignore`)
- `config.example.h` (with placeholders) is committed instead

### Device Status Monitoring
- Heartbeat mechanism detects offline devices
- Configurable timeout (default 2 minutes)
- Automatic alert creation on device timeout
- Device marked as OFFLINE after missed heartbeats

## User Authentication

### NextAuth.js
- JWT-based session strategy
- Credentials provider with email/password
- Passwords hashed with BCrypt (12 rounds)
- Session tokens signed with server secret

### Session Security
- JWT contains user ID and role
- Tokens validated on every request
- Session expiry enforced server-side
- HTTP-only cookies where applicable

## Authorization (RBAC)

Three roles with hierarchical permissions:

| Role | Permissions |
|------|------------|
| ADMIN | Full system access: manage devices, lots, zones, slots, users, alerts |
| OPERATOR | Monitoring dashboard, operational controls, view alerts |
| VIEWER | Read-only dashboard access |

### Server-Side Enforcement
- All API routes check authentication
- Admin routes check role via `requireApiAuth("ADMIN")`
- Sensitive endpoints require specific roles
- Role checks happen before any data operation

## API Security

### Input Validation
- Zod schemas validate all API inputs
- Device IDs, slot codes, distances validated
- String length limits enforced
- Numeric range checks (distance: 0-1000cm)

### Rate Limiting
- Not yet implemented (future improvement)
- Recommended: add rate limiting via middleware or API gateway

### Error Handling
- No sensitive data in error responses
- Stack traces never exposed in production
- Generic error messages for auth failures
- Validation errors return field-level details only

## Data Protection

### Environment Variables
- Database credentials in `.env` (excluded from Git)
- `AUTH_SECRET` must be unique per deployment
- Production secrets managed via environment variables

### Database
- Connection string with credentials in environment
- Prisma migrations tracked in Git (schema only, no data)
- Seed data contains demo credentials only

### HTTP Security Headers
- Not yet configured (future improvement)
- Recommended: CSP, X-Frame-Options, HSTS

## Security Checklist

- [x] No secrets committed to Git
- [x] `.env` and `config.h` in `.gitignore`
- [x] Passwords hashed (BCrypt)
- [x] Device credentials hashed (SHA-256)
- [x] Auth tokens signed server-side
- [x] Input validation (Zod)
- [x] Server-side authorization (RBAC)
- [x] No sensitive data in error responses
- [x] Device authentication for IoT endpoints
- [ ] Rate limiting (not yet implemented)
- [ ] HTTPS in production (requires certificate)
- [ ] HTTP security headers (CSP, HSTS)
- [ ] Audit logging of admin actions (model exists, implementation partial)

## Known Limitations

1. Rate limiting not yet implemented — production deployment should add this
2. No HTTPS in development — production must use TLS
3. Device API key rotation requires manual admin action
4. No brute-force protection on login endpoint
5. Session revocation requires AUTH_SECRET change

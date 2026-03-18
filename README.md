# Timelyx Backend

Express API for Timelyx lecture hall management.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Setup

```bash
npm install
cp .env.example .env
npm start
```

## Required Environment Variables

- `MONGODB_URI`
- `MONGODB_URI_FALLBACK`
- `JWT_SECRET`
- `FRONTEND_BASE_URL`
- `RESET_PASSWORD_EXPIRES_MINUTES`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_REDIRECT_URI`

## Key Route Groups

- `/users` - auth, profile, OAuth, password reset
- `/halls` - hall management
- `/bookings` - booking operations
- `/notifications` - notifications
- `/dashboard` - dashboard summaries
- `/hod` - HOD operations
- `/to` - TO operations
- `/student` - student operations

## Notes

- `authenticateUser` middleware runs globally and attaches user from JWT when present.
- OAuth callbacks redirect to frontend `/oauth/callback` with issued app JWT.

# messagekaro.com

Production-ready full-stack SMS Scheduling SaaS starter with Expo frontend + Node.js/Express backend.

## Architecture

- **Frontend:** Expo + React Native + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **ORM/DB:** Drizzle ORM + SQLite (development), schema is PostgreSQL-ready
- **Scheduler:** node-cron background scheduler (polls scheduled campaigns)
- **SMS Provider:** Twilio abstraction with mock fallback

## Folder Structure

```txt
messagekaro.com/
├── backend/
│   ├── src/
│   │   ├── config/            # env + logger
│   │   ├── db/                # drizzle client/schema/manual bootstrap
│   │   ├── middleware/        # error and 404 handlers
│   │   ├── modules/
│   │   │   ├── devices/       # POST/GET devices
│   │   │   ├── contacts/      # manual + CSV/XLSX upload
│   │   │   ├── sms/           # send/schedule/log APIs
│   │   │   └── dashboard/     # aggregate stats API
│   │   ├── providers/         # Twilio + mock providers
│   │   ├── scheduler/         # cron runner
│   │   └── utils/             # phone + message helpers
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/               # API integration layer
│   │   ├── components/        # reusable UI
│   │   ├── screens/           # dashboard/contacts/devices/schedule/logs
│   │   └── utils/             # word counter helper
│   └── .env.example
└── README.md
```

## Backend APIs

- `POST /devices`
- `GET /devices`
- `POST /contacts/manual`
- `POST /contacts/upload` (multipart form with `file`)
- `GET /contacts`
- `POST /sms/send`
- `POST /sms/schedule`
- `GET /sms/logs` (`?status=&from=&to=&format=csv`)
- `GET /dashboard/stats`

## Message Limit Rule

Backend and frontend enforce **maximum 20 words** per SMS.

## Environment Variables

Copy examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Important backend variables:
- `SMS_PROVIDER=mock|twilio`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## Local Development Setup

### 1) Install dependencies

```bash
npm install
npm run install:all
```

### 2) Start backend

```bash
npm run dev:backend
```

Backend runs on `http://localhost:4000`.

### 3) Start frontend

```bash
npm run dev:frontend
```

Use Expo QR scanner for mobile or run web preview.

## Testing Locally

- Check backend health: `GET /health`
- Add device from Devices screen
- Add contacts manually in E.164 format
- Upload `.csv` or `.xlsx` file to `/contacts/upload`
- Send instant SMS or schedule campaign from Schedule screen
- Track metrics and logs from Dashboard + Logs
- Export logs as CSV: `GET /sms/logs?format=csv`

## Deployment Guide (Cloud-ready)

### Backend
1. Use managed PostgreSQL (swap Drizzle dialect config + connection).
2. Set production env vars (Twilio keys, `NODE_ENV=production`, rate limits).
3. Deploy as container or Node service (Railway/Render/Fly/AWS ECS).
4. Run a single scheduler instance or move scheduling to queue workers.

### Frontend
1. Set `EXPO_PUBLIC_API_URL` to production API URL.
2. Build with EAS for iOS/Android.
3. Optionally publish Expo web build to static hosting.

## Security & Scalability Notes

- Helmet + CORS + global API rate limiting
- Strong input validation with Zod
- Centralized error handler + structured logs (Pino)
- Provider abstraction enables future SMS gateways
- Scheduler isolated from API routes for clean scaling

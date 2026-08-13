# WROS Backend

Express/Node.js backend for the WROS retail operations platform.

## Quick Start (development)

```bash
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

## Production Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect the `2bshaw-code/wros-backend` repository.
3. Render will auto-detect `render.yaml` and configure the service.
4. Set the following secret environment variables in the Render dashboard:
   - `MONGO_URI_PROD` – MongoDB Atlas connection string
   - `JWT_SECRET` – secure random string (min 32 chars)
   - `JWT_REFRESH_SECRET` – secure random string (min 32 chars)
   - `STRIPE_SECRET_KEY` – Stripe live secret key
   - `STRIPE_WEBHOOK_SECRET` – Stripe webhook signing secret
   - `WHATSAPP_VERIFY_TOKEN` – token used to verify the Meta webhook
   - `WHATSAPP_ACCESS_TOKEN` – Meta Cloud API access token
   - `WHATSAPP_PHONE_NUMBER_ID` – Meta phone number ID
   - `WHATSAPP_BUSINESS_ID` – Meta business account ID
   - `WHATSAPP_APP_SECRET` – Meta app secret (for webhook signature verification)
5. Deploy.

### Build & Start Commands

| Setting | Value |
|---|---|
| Build Command | `npm install --omit=dev` |
| Start Command | `node server.js` |

### Health Check

`GET /api/health` – returns `200 OK` when the service is running.
`GET /ready` – returns `200` with database connection status.

## Environment Variables

See `.env.example` for a full list with descriptions.

## API Routes

All routes are prefixed with `/api`:

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register admin user |
| POST | `/auth/login` | Login |
| POST | `/business/register` | Register a business |
| GET | `/health` | Health check |
| GET | `/status` | Service status |
| GET | `/products` | List products |
| GET | `/orders` | List orders |
| GET | `/customers` | List customers |
| GET | `/reports/sales` | Sales report |

## Feature Flags

Set these env vars to `true` or `false`:

- `ORDERS_ENABLED`
- `CRM_ENABLED`
- `INVOICES_ENABLED`
- `DELIVERY_ENABLED`
- `FAULTS_ENABLED`
- `DOWNLOADS_ENABLED`

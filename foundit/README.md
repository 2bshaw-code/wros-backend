# Found IT

Found IT is a standalone PostgreSQL-backed circular-commerce service managed through Founder OS. It does not share WROS tenant collections or automatically import data into WROS.

## Founder master account

Founder OS, WROS authentication, and Found IT use the shared MongoDB `AdminUser` collection selected by `MONGO_URI_PROD` or `MONGO_URI`. To synchronize the break-glass Founder account before startup, configure:

- `FOUNDER_MASTER_SEED_ENABLED=true`
- `FOUNDER_MASTER_EMAIL=bobby@founder.master`
- `FOUNDER_MASTER_PASSWORD=<secret managed by the deployment platform>`

The password is bcrypt-hashed and never logged. The account receives `founder_master` control-plane access to Founder OS and Found IT. Tenant-scoped merchant APIs still require an explicit authenticated tenant context; the role does not bypass tenant isolation.

The `prestart` npm lifecycle runs `npm run seed` before `server.js`. When seeding is enabled, a failed MongoDB connection or failed upsert stops startup. Render builds with `npm install`; start remains `npm start`. For local testing, put the values in an ignored `.env` or export them in the shell, then run:

```bash
npm run seed
npm start
```

Open `http://localhost:5173/auth/login`, sign in with the configured Founder master credentials, and confirm redirection to `http://localhost:5173/founder`. Found IT is available at `http://localhost:5173/founder/found-it`.

## Runtime configuration

- `FOUND_IT_DATABASE_URL`: optional PostgreSQL connection for the standalone Found IT data schema.
- `FOUND_IT_SCHEDULER_ENABLED=true`: enables hourly scraping.
- `FOUND_IT_CRON`: optional cron expression, default `0 * * * *`.
- `FOUND_IT_TIMEZONE`: defaults to `Europe/London`.
- `FOUND_IT_AUTO_MIGRATE=true`: runs the migration when the scheduler starts.
- `FOUND_IT_BROWSER_EXECUTABLE`: Chrome/Chromium path for Playwright platforms.
- `FOUND_IT_EBAY_TOKEN`: eBay Browse API OAuth token.
- `FOUND_IT_USER_AGENT`: identifiable scraper user agent.
- `FOUND_IT_THROTTLE_MS`: delay between listing writes, default `750`.
- `FOUND_IT_PLATFORM_THROTTLE_MS`: delay between platforms, default `1500`.

Run `npm run foundit:migrate` before first use. It creates the quoted PostgreSQL schema `FOUND_IT` and platform definitions.

Verify the master identity in MongoDB without returning its hash value:

```js
db.adminusers.findOne(
	{ email: "bobby@founder.master" },
	{ email: 1, role: 1, founder: 1 }
)
```

Freecycle regional feed URLs must be entered in the platform `config.feedUrls` array. Playwright and HTML selectors can be changed per platform through `config.selectors`. Found IT checks `robots.txt`; operators remain responsible for platform terms, rate limits, API licensing, and personal-data obligations.

## API

All endpoints are prefixed by `/api`, require a WROS access token, and return the standard `{ success, data }` envelope.

- `GET /foundit/status`
- `GET /foundit/listings`
- `GET /foundit/merchants`
- `POST /foundit/merchants`
- `POST /foundit/merchants/:id/export`
- `GET /foundit/platforms`
- `GET /foundit/runs`
- `POST /foundit/platforms/add`
- `PATCH /foundit/platforms/:id`
- `POST /foundit/scrape/run`
- `POST /foundit/listings`
- `PATCH /foundit/listings/:id`
- `POST /foundit/listings/:id/export`
- `POST /foundit/migrate`

Founder/founder_admin and admin can manage data and scrapers. Owners can view and export. Merchants have no Found IT access.

## Test access

Local/test only: set `WROS_TEST_MODE=true`, then run `npm run foundit:seed-test`. The account receives `founder_admin` access. Defaults are:

- Email: `foundit-tester@example.test`
- Password: `FoundItTest2026!`
- Login: `http://localhost:5173/auth/login`
- Dashboard: `http://localhost:5173/founder/found-it`

Override the credentials with `FOUND_IT_TEST_EMAIL` and `FOUND_IT_TEST_PASSWORD`. The seed refuses to run in production.
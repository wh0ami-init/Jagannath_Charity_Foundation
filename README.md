# Jagannath Charity Foundation Website

Public website and private administration console for Jagannath Charity Foundation. The application uses React, TypeScript and Vite for the frontend, FastAPI for the API, and SQLAlchemy with MySQL or SQLite for persistence.

## Features

- Public pages for the Foundation's programmes, team, gallery, contact, volunteering and pledge notes.
- Database-backed admin login with bcrypt password hashes; credentials are never configured in source code or hosting environment variables.
- Admin tools for editing selected site copy, replacing managed images and handling form submissions.
- Vercel frontend and Railway API deployment support.

Pledge forms record notes only. The site does not process payments or automatically send newsletter messages. Form submissions contain personal information; restrict database and hosting access and delete data according to the Foundation's retention policy.

## Architecture

```text
Browser ── HTTPS ── Vercel static frontend
                     │ VITE_API_URL
                     ▼
                 Railway FastAPI ── MySQL database
                     │
                     └── persistent volume for admin image uploads
```

## Requirements

- Python 3.11+
- Node.js 18+
- MySQL 8 for production (SQLite is suitable for local development)

## Local development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`. Set a unique `JWT_SECRET` of at least 32 characters. Generate one with:

```bash
python -c 'import secrets; print(secrets.token_urlsafe(48))'
```

For local use, the example uses SQLite. Create the database tables, create the initial administrator, and start the API:

```bash
python -m app.manage_admin
uvicorn app.main:app --reload --port 8010
```

The admin tool prompts for a username and password, then writes only a bcrypt password hash to the configured database. Use a password of at least 12 characters. Running the tool again rotates the single administrator's username and password. If multiple admins exist, enter the username to keep and type `DELETE` to confirm removing the other admin accounts.

Health endpoint: `http://localhost:8010/api/health`.

### Frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL=http://localhost:8010` in `frontend/.env`. Visit `http://localhost:5173`; the admin sign-in is at `/admin/login`.

## Deploy: Railway API + Vercel frontend

Deploy the database and API before the frontend so you can configure the API URL and CORS origin.

### 1. Railway: database and API

1. Create a Railway project from this GitHub repository and add a MySQL service. Attach a persistent volume to the API service for image uploads, mounted at `/app/uploads` (the backend's `uploads/` directory when the service root is `backend`).
2. Set the API service's **Root Directory** to `backend`.
3. Add these variables in the Railway API service settings:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Railway MySQL connection URL, using SQLAlchemy's `mysql+mysqlconnector://` format. Use Railway's internal host when both services are in the same project. |
   | `JWT_SECRET` | A newly generated random value of at least 32 characters. Keep it private. |
   | `ENVIRONMENT` | `production` |
   | `CORS_ORIGINS` | Exact Vercel origin, e.g. `https://your-project.vercel.app`; add a custom domain origin if you use one. |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` (or a shorter period your team prefers). |

   Do not set or commit `ADMIN_USERNAME` or `ADMIN_PASSWORD`; the application does not read those variables.
4. Configure the start command as:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. Deploy and confirm `https://<railway-api-domain>/api/health` responds with `{"status":"ok"}`.
6. Open a Railway shell for the API service and provision the first administrator interactively:

   ```bash
   python -m app.manage_admin
   ```

   This uses the service's configured database. Keep the username and password in your team's password manager. To rotate them, run the command again. The tool never prints the password.

Railway deployments may replace ephemeral files. The persistent volume is needed to preserve images uploaded through the admin interface. Database backups are also required for recovery.

### 2. Vercel: frontend

1. Import the same GitHub repository into Vercel and set **Root Directory** to `frontend`.
2. Set `VITE_API_URL` to the public Railway API origin, for example `https://your-api.up.railway.app` (no trailing slash).
3. Deploy. The included [`frontend/vercel.json`](frontend/vercel.json) routes application paths to the single-page app, so direct visits and refreshes work.
4. Put the resulting exact Vercel origin in Railway's `CORS_ORIGINS`, then redeploy the API. If you add a custom frontend domain, add its exact `https://` origin too.

Vite embeds `VITE_API_URL` at build time. Redeploy the frontend after changing it. Never put database URLs, JWT secrets, or other private values in `VITE_*` variables; frontend variables are public in the built JavaScript.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | SQLAlchemy database connection. Use MySQL in production; local SQLite is supported. |
| `JWT_SECRET` | Yes | Random signing key, minimum 32 characters. Changing it invalidates existing login tokens. |
| `ENVIRONMENT` | Production | Set to `production` to reject SQLite and missing CORS origins and enable production security headers. |
| `CORS_ORIGINS` | Production | Comma-separated exact browser origins, without paths. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Admin session lifetime; defaults to 60 minutes. |
| `COOKIE_SAMESITE` | No | `lax`, `strict` or `none`. Blank = `none` in production (cross-site Vercel + Railway), `lax` locally. |
| `TRUSTED_PROXY_COUNT` | No | Reverse proxies in front of the API, used to find the real client IP for rate limits. Blank = `1` in production (Railway), `0` locally. |
| `LOGIN_IP_LIMIT`, `LOGIN_USER_FAILURE_LIMIT`, `LOGIN_WINDOW_SECONDS` | No | Login limits: attempts per IP and failed attempts per account within the window. Defaults `10`, `10`, `900`. |
| `FORM_IP_LIMIT`, `FORM_WINDOW_SECONDS` | No | Public form submissions per IP within the window. Defaults `10`, `900`. |
| `VITE_API_URL` | Frontend | Public API origin, compiled into the frontend at build time. |

## Security and operations

- Admin identity is checked against the database. Passwords are bcrypt hashes; the application has no default admin account and does not provision credentials from environment variables.
- The admin session is a signed JWT stored in an `HttpOnly` cookie (`Secure` in production), so page scripts cannot read it, and nothing is kept in local storage. Because browsers send cookies automatically, every state-changing admin request must also carry an `X-CSRF-Token` header. The frontend keeps that token in memory only and restores it from `/api/auth/me` after a refresh.
- In production the frontend (`*.vercel.app`) and API (`*.up.railway.app`) are on different sites, so the cookie is sent as `SameSite=None; Secure`. Some browsers block third-party cookies, which can break admin sign-in. The robust fix is to serve both from one site (for example `www.example.org` and `api.example.org`) and set `COOKIE_SAMESITE=lax`.
- Rate limits (in memory, per API process): 10 login attempts per IP and 10 failed logins per account every 15 minutes, and 10 public form submissions per IP every 15 minutes. Over-limit requests get HTTP 429. The account limit also means someone can deliberately lock the administrator out for up to 15 minutes; the trade-off is that distributed guessing is capped. Set `TRUSTED_PROXY_COUNT` correctly or every visitor will share one IP bucket. If you run more than one API instance, limits apply per instance, so also add proxy/WAF limits.
- Admin routes require a valid token. CORS restricts browser origins, but it is not an API access control mechanism.
- Image uploads are size-limited and check file signatures as well as extensions. Keep the uploads volume writable only by the service.
- Do not expose database ports publicly. Restrict access to Railway/Vercel teams, enable provider MFA, rotate leaked credentials immediately, and back up the database and uploads.
- Public forms accept unauthenticated submissions, include a honeypot field, and are rate limited per IP. Add a managed rate limiter/WAF in front of the API before a high-traffic launch; proxy-level rate limiting should also cover login and public form submission.
- The database contains contact details and messages. Limit staff access, retain only what is needed, and ensure backups are protected and routinely tested.
- Before publishing this public repository, inspect Git history as well as the current tree for secrets. Removing a secret from the latest commit does not remove it from earlier commits; rotate any credential that was ever committed.

## API overview

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/login` | Public, rate limited; sets the session cookie and returns the CSRF token |
| `POST` | `/api/auth/logout` | Clears the session cookie |
| `GET` | `/api/auth/me` | Admin; returns username and CSRF token |
| `GET` | `/api/images` | Public |
| `POST` | `/api/images/{slot_key}` | Admin |
| `GET` | `/api/content` | Public |
| `PUT` | `/api/content/{content_key}` | Admin |
| `POST` | `/api/submissions` | Public, rate limited |
| `GET` | `/api/submissions` | Admin |
| `DELETE` | `/api/submissions/{submission_id}` | Admin |

## Repository layout

```text
backend/app/          FastAPI application, models, authentication and routes
backend/seed_images/  Source images used to populate managed image slots
backend/uploads/      Runtime uploads; use persistent storage in production
frontend/src/         React website and admin interface
frontend/public/      Static assets
frontend/vercel.json  SPA route rewrite for Vercel
```

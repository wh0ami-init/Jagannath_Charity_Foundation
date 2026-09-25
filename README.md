<div align="center">

# Jagannath Charity Foundation : Official Website & Admin Console

### Public Website, Content Management & Donor/Volunteer Intake System
**Jagannath Charity Foundation**

[![Backend](https://img.shields.io/badge/backend-FastAPI-005571?style=for-the-badge&logo=fastapi)](#architecture)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#architecture)
[![Database](https://img.shields.io/badge/database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](#requirements)
[![Python](https://img.shields.io/badge/python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](#requirements)
[![Node](https://img.shields.io/badge/node-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](#requirements)
[![License](https://img.shields.io/badge/status-official%20deployment-blue?style=for-the-badge)](#)

*This system serves as the official public website and administrative*
*console of the Jagannath Charity Foundation.*

</div>

---

## 📑 Table of Contents

- [Purpose &amp; Scope](#purpose--scope)
- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Production Deployment & Handover](#production-deployment--handover)
- [Admin Operations](#admin-operations)
- [API Summary](#api-summary)
- [Security Notes](#security-notes)
- [Project Structure](#project-structure)
- [Governance & Support](#governance--support)

---

## Purpose & Scope

This repository is the reference implementation of the official Jagannath
Charity Foundation website — a public-facing information site paired with a
private administrative console for the Foundation's own staff.

The system:

- presents the Foundation's mission, programs, team, and photo gallery to
  visitors;
- allows an authenticated administrator to replace photographs and edit
  homepage/introduction copy without a developer;
- collects contact enquiries, volunteer sign-ups, pledge notes, and
  newsletter sign-ups into a private inbox for staff follow-up; and
- supports local development and a controlled handover to production
  hosting before the Foundation's official domain is connected.

All configuration and credentials described in this document are intended
for **official, single-organisation use** and should be reviewed before
being reused for any other deployment.

> **Note:** Pledge submissions are recorded as notes only. The system does
> not process or collect payments. Contact, volunteer, and newsletter
> submissions are stored for staff follow-up; the system does not send
> automatic emails.

---

## Features

| Capability                    | Description |
|--------------------------------| --- |
| **Public website**            | A React + Vite site presents the Foundation's mission, programs, team, and gallery to visitors on desktop and mobile. |
| **Photo management**          | An administrator can replace any photograph placement (JPG, PNG, WEBP, or GIF, up to 8 MB) from the dashboard; changes go live immediately. |
| **Editable website copy**     | Homepage headlines, introductions, and the Foundation note can be edited and published field-by-field, without a code deployment. |
| **Submission inbox**          | Contact, volunteer, pledge, and newsletter form submissions are stored centrally, exportable as CSV, and reviewable only by an authenticated administrator. |
| **Single administrator account** | The administrator account is provisioned automatically from environment variables the first time the backend starts. |

---

## Architecture

```text
                     ┌────────────────────────────┐
                     │   React + Vite Frontend    │
                     │  (public website + admin)  │
                     └──────────────┬─────────────┘
                                    │  HTTPS (JSON API)
                                    ▼
                     ┌───────────────────────────────┐
                     │        FastAPI Backend        │
                     │                               │
                     │  ├─ Auth (JWT, admin login)   │
                     │  ├─ Image slot management     │
                     │  ├─ Editable site content      │
                     │  ├─ Form submissions inbox     │
                     │  └─ MySQL storage              │
                     └───────────────────────────────┘
```

During local development, the frontend calls the backend directly at
`VITE_API_URL` (no proxy). In production, the frontend is built with
`VITE_API_URL` pointing at the Railway-hosted backend's public URL — see
[Production Deployment & Handover](#production-deployment--handover).

---

## Requirements

- **Python 3.11** or newer
- **Node.js 18** or newer
- **MySQL 8** or newer

Every Python dependency is listed in
[`backend/requirements.txt`](backend/requirements.txt).

---

## Quick Start

### 1. Create the MySQL database

```bash
mysql -u root -e "CREATE DATABASE jagannath_foundation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Configure and start the API

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate.bat
pip install -r requirements.txt
cp .env.example .env
```

Open `backend/.env` and set a real `DATABASE_URL`, a strong
`ADMIN_USERNAME` / `ADMIN_PASSWORD`, and a long random `JWT_SECRET`. Then
start the API:

```bash
uvicorn app.main:app --reload --port 8010
```

Check `http://localhost:8010/api/health` for `{"status":"ok"}`. The
backend creates its tables, administrator account, and initial image
library the first time it starts.

### 3. Start the website

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` for the public website and
`http://localhost:5173/admin/login` for the administrator sign-in.

---

## Configuration

| Area | Variables | Notes |
| --- | --- | --- |
| Database | `DATABASE_URL` | MySQL is required for a real deployment; SQLite (`sqlite:///./app.db`) may be used only for a quick local preview. |
| Authentication | `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` | `JWT_SECRET` must be replaced with a long random value before any shared or production use. |
| Admin account | `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Read only when the administrator account is first created. Changing these afterwards does not change an account that already exists. |
| Browser access | `CORS_ORIGINS` | Comma-separated list of exact origins allowed to call the API. Must include the production frontend origin before launch. |
| Frontend | `VITE_API_URL` | The base URL the frontend uses to reach the backend. Baked in at build time — the frontend must be rebuilt after this changes. |

Generate a strong `JWT_SECRET` with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Production Deployment & Handover

The intended deployment topology is **Vercel (frontend) + Railway
(backend)**.

### 1. Backend on Railway

1. Create a new Railway service from the `backend/` directory (or the
   whole repository, with the root directory set to `backend/`).
2. Add a MySQL database (Railway's own MySQL plugin, or any external MySQL
   instance) and copy its connection string into `DATABASE_URL`.
3. Set the service's **start command** explicitly, since `backend/main.py`
   is written for local development only (it binds to `127.0.0.1` on a
   fixed port and is not used in production):

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. Set the following Railway environment variables at minimum:

   ```ini
   DATABASE_URL=<your production MySQL connection string>
   JWT_SECRET=<a long random secret>
   ADMIN_USERNAME=<the Foundation's chosen admin username>
   ADMIN_PASSWORD=<a strong password>
   CORS_ORIGINS=https://<your-vercel-domain>
   ```

5. Attach a persistent volume mounted at `backend/uploads`. Railway's
   filesystem is not persistent across deploys or restarts by default —
   without a volume, every uploaded photograph is lost on the next deploy.

### 2. Frontend on Vercel

1. Import the repository into Vercel with the project root set to
   `frontend/`.
2. Set the environment variable `VITE_API_URL` to the backend's public
   Railway URL (for example, `https://your-backend.up.railway.app`), then
   trigger a build — this value is compiled into the frontend at build
   time, so it will not take effect until the next deploy.
3. Add a `frontend/vercel.json` with a single-page-app rewrite, so that a
   direct visit or refresh on a route such as `/admin/login` does not
   return a 404:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### 3. Connect the two

- Update `CORS_ORIGINS` on Railway to the exact Vercel domain once it is
  known (and again if a custom domain is added later).
- Re-deploy the frontend any time `VITE_API_URL` changes.

### Foundation handover responsibilities

Before the site is connected to the Foundation's official domain, someone
on the Foundation's side should:

- confirm the final `CORS_ORIGINS` value and remove any placeholder or
  development origins;
- store `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and
  `DATABASE_URL` only as private environment variables, never in the
  repository;
- confirm the Railway upload volume is attached and back up the MySQL
  database on a regular schedule; and
- decide who holds the administrator credentials and how they will be
  rotated if a staff member changes.

---

## Admin Operations

An administrator signs in at `/admin/login` using the credentials set in
`backend/.env` (or the Railway environment, in production). From the
dashboard, they can:

- replace photographs in **Images** — the change appears on the public
  site immediately;
- edit homepage and introduction copy in **Website text**, publishing each
  field individually; and
- review, export (CSV, newest 200 rows), or delete entries in **Inbox**
  (contact, volunteer, pledge, and newsletter submissions).

Pledge notes are recorded for staff follow-up only; the system does not
process payments, and the newsletter list is stored but does not yet send
programme updates automatically.

---

## API Summary

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Reports service health. |
| `POST` | `/api/auth/login` | Authenticates the administrator and returns a JWT. |
| `GET` | `/api/auth/me` | Returns the signed-in administrator's identity. |
| `GET` | `/api/images` | Lists all image slots and their current photographs. |
| `GET` | `/api/images/{slot_key}` | Returns a single image slot. |
| `POST` | `/api/images/{slot_key}` | Replaces the photograph for a slot (admin only). |
| `GET` | `/api/content` | Returns the site's editable copy. |
| `PUT` | `/api/content/{content_key}` | Updates one editable content field (admin only). |
| `POST` | `/api/submissions` | Records a public contact, volunteer, pledge, or newsletter submission. |
| `GET` | `/api/submissions` | Lists submissions in the inbox (admin only). |
| `DELETE` | `/api/submissions/{submission_id}` | Deletes a submission (admin only). |

---

## Security Notes

- Passwords are hashed with bcrypt; sessions are authenticated with signed
  JWTs, not stored in a database table.
- `CORS_ORIGINS` should list exact production origins only — avoid
  wildcards once the site is live.
- Uploaded images are validated by file type and a maximum size (8 MB)
  before being written to disk.
- `backend/.env`, the local SQLite file, and uploaded images are excluded
  from version control by `.gitignore` — production values must be set
  directly in the hosting provider's environment settings.
- A WAF or rate-limiting layer is recommended in front of the public API
  before the site is announced widely, as the application does not
  currently implement its own rate limiting.

---

## Project Structure

```text
backend/
  app/
    routers/         auth, images, content, submissions
    config.py        Environment-backed settings
    database.py      SQLAlchemy engine/session
    models.py        ORM models
    startup.py       First-run admin account, image slots, site content
  uploads/           Uploaded photographs (not committed; needs a persistent volume in production)
  main.py            Local-development entry point only
  requirements.txt   Python dependency manifest
frontend/
  src/               React pages, components, and API client
  public/            Static frontend assets
  vercel.json        (add before deploying — see Production Deployment)
```

---

## Governance & Support

This system has been developed for the exclusive use of the **Jagannath
Charity Foundation** and is maintained under its authority. Any change
intended for production use should be reviewed against the
[Security Notes](#security-notes) and
[Production Deployment & Handover](#production-deployment--handover)
sections above before it is deployed.

<div align="center">

**Jagannath Charity Foundation**

</div>
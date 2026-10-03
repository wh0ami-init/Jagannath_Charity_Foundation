<div align="center">

<img src="frontend/public/images/logo-mark.png" alt="Jagannath Foundation emblem" width="112" />

# Jagannath Foundation

### Public website and administration console

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](#requirements)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#architecture)
[![React](https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white)](#architecture)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#architecture)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#architecture)

*A community-focused website for sharing the Foundation’s work, recording its impact,*
*and making it easier to connect with the team.*

</div>

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Administration](#administration)
- [API overview](#api-overview)
- [Security and privacy](#security-and-privacy)
- [Project structure](#project-structure)

## Overview

The Jagannath Foundation website brings public information and staff tools into one application. Visitors can learn about the Foundation, explore its programmes and projects, view impact stories, and contact the team. Staff can sign in to manage selected website copy, replace managed images, and review enquiries in a private inbox.

The frontend is a responsive single-page application. Its content and image endpoints are public; administration endpoints require a database-backed administrator account and a signed bearer token.

## Features

| Area | What it provides |
| --- | --- |
| Public pages | Home, Our Story, Programmes, Projects, Impact, People, Partners, Gallery, Donate, Volunteer, Community Portal, Contact, and Privacy Policy. |
| Programme and impact storytelling | Programme descriptions, impact measures, field records, and photo captions. |
| Responsive interactions | Mobile navigation, page transitions, scroll reveals, and reduced-motion-aware animations. |
| Community Portal | Enquiry forms for membership, beneficiary support, opportunities, complaints, donations, projects, events, and records. Requests are sent to the staff inbox for follow-up. |
| Contact and participation forms | Contact, volunteer, pledge, and newsletter submissions are recorded for staff follow-up. |
| Administration | Edit selected site text, replace managed images, and filter, export, or delete form submissions. |
| Image management | Seed images keep the site populated; administrators can replace supported images through the console. |
| Deployment support | Vercel and Netlify single-page routing files are included for the frontend. |

Pledge forms record a note only. The site does not process payments, issue or verify certificates, create member accounts, check application status, or automatically send newsletter messages. Community requests are enquiries; staff follow up separately.

## Architecture

```text
┌──────────────────────────────┐
│ Browser                      │
│ React + TypeScript + Vite    │
└──────────────┬───────────────┘
               │ HTTPS / JSON
               ▼
┌──────────────────────────────┐
│ FastAPI application          │
│ Auth · submissions · content │
│ image slots                  │
└──────────┬───────────┬───────┘
           │           │
           ▼           ▼
      MySQL/SQLite   Upload storage
```

The frontend calls the API at `VITE_API_URL`. The backend uses SQLAlchemy and supports SQLite for local development and MySQL for production. Administrator image uploads are stored under `backend/uploads`; production deployments need persistent storage for that directory.

## Requirements

- Python 3.11 or later
- Node.js 18 or later
- MySQL 8 for production; SQLite is supported for local development

## Run locally

### 1. Start the API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
```

Edit `backend/.env` and replace `JWT_SECRET` with a unique random value of at least 32 characters. For example:

```bash
python -c 'import secrets; print(secrets.token_urlsafe(48))'
```

Create the initial administrator, then start the API:

```bash
python -m app.manage_admin
uvicorn app.main:app --reload --port 8010
```

The administrator tool prompts for a username and password and stores a bcrypt hash in the configured database. Passwords must be at least 12 characters and no more than 72 UTF-8 bytes. Running the tool again rotates the administrator credentials. If multiple administrator accounts exist, the tool asks for confirmation before removing duplicates.

The API health endpoint is available at `http://localhost:8010/api/health`.

### 2. Start the frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env            # Windows: copy .env.example .env
npm run dev
```

Set `VITE_API_URL=http://localhost:8010` in `frontend/.env`. Open `http://localhost:5173`; the administrator sign-in page is at `/admin/login`.

To preview the optional welcome screen locally, set `VITE_ENABLE_WELCOME_SCREEN=true` before starting Vite. It is disabled by default.

### Production build

```bash
cd frontend
npm run build
npm run preview
```

The build runs the TypeScript compiler before creating the optimized Vite output in `frontend/dist`.

## Configuration

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Backend | SQLAlchemy database URL. Use MySQL in production; the example uses SQLite. |
| `JWT_SECRET` | Backend | Random signing key of at least 32 characters. Changing it invalidates existing tokens. |
| `ENVIRONMENT` | Backend | Set to `production` to reject SQLite and missing CORS origins and enable production security headers. |
| `CORS_ORIGINS` | Backend | Comma-separated exact browser origins, without paths. Required in production. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | Administrator bearer-token lifetime; defaults to 60 minutes. |
| `VITE_API_URL` | Frontend | Public API origin compiled into the frontend at build time. Do not put secrets in `VITE_*` variables. |
| `VITE_ENABLE_WELCOME_SCREEN` | Frontend | Set to `true` to enable the optional welcome screen. Defaults to disabled. |

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example) for templates. Never commit real environment files or credentials.

## Deployment

The repository supports a Vercel frontend and Railway API deployment. Deploy the database and API first so the frontend can be configured with the public API origin.

### Railway API

1. Set the service root directory to `backend` and attach a persistent volume at `/app/uploads`.
2. Configure `DATABASE_URL` with a MySQL SQLAlchemy URL, `JWT_SECRET` with a new random secret, `ENVIRONMENT=production`, and `CORS_ORIGINS` with the exact frontend origin. `ACCESS_TOKEN_EXPIRE_MINUTES` is optional.
3. Use this start command:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. Check `/api/health`, then create or rotate the administrator from a Railway shell with `python -m app.manage_admin`.

### Vercel frontend

1. Set the project root directory to `frontend`.
2. Set `VITE_API_URL` to the public Railway API origin, without a trailing slash.
3. Deploy and add the exact Vercel origin to the API's `CORS_ORIGINS` setting. Add the custom domain origin too, if used.

The included [`frontend/vercel.json`](frontend/vercel.json) and [`frontend/public/_redirects`](frontend/public/_redirects) route application paths to the single-page app. Vite embeds `VITE_API_URL` at build time, so redeploy the frontend after changing it.

Use persistent storage for uploads and configure database backups. Uploaded images are separate from database records and should be included in the recovery plan.

## Administration

The admin console is available at `/admin/login`. Create the first account interactively on the backend with `python -m app.manage_admin`; the application does not read administrator credentials from environment variables and does not ship with a default account.

Administrators can:

- update selected public-page copy;
- replace image files associated with managed image slots; and
- review, filter, export, and delete public form submissions.

The frontend currently stores the bearer token in browser local storage. Anyone able to run script on the site origin could access it, so keep site dependencies and managed content trusted. An HttpOnly-cookie session would provide stronger protection against token access through cross-site scripting.

## API overview

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/login` | Public; returns a bearer token |
| `GET` | `/api/auth/me` | Administrator |
| `GET` | `/api/images` | Public |
| `GET` | `/api/images/{slot_key}` | Public |
| `POST` | `/api/images/{slot_key}` | Administrator; replaces an image |
| `GET` | `/api/content` | Public |
| `PUT` | `/api/content/{content_key}` | Administrator |
| `POST` | `/api/submissions` | Public; records a form submission |
| `GET` | `/api/submissions` | Administrator; accepts a `limit` query parameter |
| `DELETE` | `/api/submissions/{submission_id}` | Administrator |

Submission kinds are `contact`, `volunteer`, `pledge`, `newsletter`, and `service`. The `service` kind uses `subject` for the selected community service. The API also requires consent for stored submissions and accepts a honeypot field for basic bot filtering.

## Security and privacy

- Administrator passwords are stored as bcrypt hashes. Login tokens are signed JWT bearer tokens; there is no default administrator account.
- CORS limits browser origins but does not replace API authentication or authorization.
- Image uploads are limited to 8 MB and checked against supported file signatures and extensions. Keep the upload directory writable only by the service.
- Public form submissions contain personal information. Restrict database and hosting access, retain only what is needed, and protect backups.
- Public forms include a honeypot, but the API does not provide distributed rate limiting. Add a managed rate limiter or WAF before a high-traffic launch, covering login and public submissions.
- Do not expose database ports publicly. Restrict hosting access, enable provider MFA, and rotate any leaked credentials immediately.
- Before making the repository public, inspect Git history for secrets. Removing a secret from the current files does not remove it from previous commits.

## Project structure

```text
backend/
  app/
    routers/          Authentication, content, images, and submissions APIs
    auth.py           Password hashing and JWT authentication
    config.py         Environment-backed settings and validation
    database.py       SQLAlchemy engine and session dependency
    models.py         Database tables
    schemas.py        Request and response validation
    startup.py        Initial image slots and site content
  seed_images/        Source images for managed image slots
  uploads/            Runtime uploads; persist this directory in production
  .env.example        Backend configuration template
  requirements.txt    Python dependencies
frontend/
  public/images/      Brand, page, gallery, and impact photography
  src/
    components/       Shared layout, navigation, forms, and animation helpers
    lib/              API client and shared content/image contexts
    pages/            Public pages and admin screens
  public/_redirects   Netlify single-page routing rule
  vercel.json         Vercel single-page routing rule
  package.json        Frontend scripts and dependencies
```

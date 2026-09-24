# Jagannath Foundation — Dynamic Website

Recreated from the original static site, on the same stack you used for the
Sikkim Tourism chatbot: **FastAPI (Python) + React/TypeScript/Vite/Tailwind**.

## What changed vs. the original site

The old site was static HTML — every image was hardcoded into the page, so
changing a photo meant editing code and redeploying. This version adds:

- A **FastAPI backend** with a database of "image slots" (e.g. `home-hero-education`,
  `team-samarendra-patra`) — each one is a named spot on the site that holds one image.
- An **admin panel** at `/admin` where the VC logs in and clicks "Replace image"
  on any photo. The new image goes live immediately, on every page that uses it —
  no code changes, no redeploy.
- The public site (`/`, `/about`, `/team`, etc.) fetches the current image for
  each slot from the API instead of having a filename baked into the HTML.

Page **text content** (bios, programme descriptions, donation details) is still
in the React components for now — see "What's not dynamic yet" below if you
want that editable too.

---

## 1. Install prerequisites (macOS)

Open Terminal and check what you already have:

```bash
python3 --version   # need 3.11+
node --version       # need 18+
```

If you don't have Homebrew yet:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install Python and Node if needed:
```bash
brew install python@3.12 node
```

---

## 2. Backend setup (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # every time you open a new terminal for this project
pip install -r requirements.txt

cp .env.example .env              # then open .env and change ADMIN_PASSWORD and JWT_SECRET
```

Run it:
```bash
uvicorn app.main:app --reload --port 8010
```

First run will:
- Create `app.db` (a SQLite file — this is your database, zero setup needed)
- Create your admin login using `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`
- Copy the original site's photos into `uploads/` and register all 44 image slots

Check it worked: open **http://localhost:8010/api/health** → should show `{"status":"ok"}`
Interactive API docs: **http://localhost:8010/docs**

> Leave this terminal tab running. Open a **new terminal tab** for the frontend.

---

## 3. Frontend setup (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env    # points the frontend at http://localhost:8010, fine for local dev
npm run dev
```

Open **http://localhost:5173** — the public site.
Open **http://localhost:5173/admin/login** — the admin panel. Log in with the
username/password you set in `backend/.env`.

---

## 4. Using the admin panel

1. Go to `/admin/login`, sign in.
2. You'll see every image on the site, grouped by page (Home, About, Team, Gallery...).
3. Click **"Replace image"** under any photo, pick a new JPG/PNG/WEBP (max 8MB).
4. It uploads, saves, and the live site shows the new image immediately — refresh
   any page and it's there. No deploy needed.

---

## Switching the database to MySQL (optional)

The backend defaults to SQLite so it runs with zero setup. If you'd rather use
MySQL (same as the chatbot project, and what your college may expect):

```bash
brew install mysql
brew services start mysql
mysql -u root -e "CREATE DATABASE vc_website;"
```

Then in `backend/.env`:
```
DATABASE_URL=mysql+mysqlconnector://root:yourpassword@localhost:3306/vc_website
```

And in `backend/requirements.txt`, uncomment:
```
mysql-connector-python>=9.0.0,<10.0.0
```

Reinstall (`pip install -r requirements.txt`) and restart the backend — same
code, different database, nothing else changes.

---

## Adding more image slots

Every editable image is one line in `backend/app/seed_data.py`:

```python
("your-slot-key", "Human-readable label", "Page name", "alt text", "seed-filename.jpg")
```

Add a row, drop the matching file in `backend/seed_images/`, restart the
backend — it appears in the admin panel automatically. There's no limit to
how many you add.

---

## What's not dynamic yet (scope for next steps)

- **Page text** (bios, programme copy, donation account details) lives in the
  React components, not the database. If your VC also wants to edit *text*
  from the admin panel later, that's a natural next feature — same pattern
  (a `content` table + admin form) as the images.
- **Forms** (newsletter, donate pledge, contact, volunteer) currently just
  show a confirmation message in the browser — they don't send an email or
  save anywhere yet. Wiring them to actually notify the office (e.g. save to
  the database, or send an email) is a good next step.

---

## Project structure

```
backend/
  app/
    main.py          FastAPI app entrypoint
    models.py         Database tables (ImageSlot, AdminUser)
    routers/
      images.py       GET/POST image endpoints
      auth.py          Login endpoint
    seed_data.py       List of every image slot — add rows here to add slots
  seed_images/          Original site's photos, copied in on first run
  uploads/               Where admin-uploaded replacement images are saved

frontend/
  src/
    pages/               One file per public page (Home.tsx, Team.tsx, etc.)
    pages/admin/          Login.tsx, Dashboard.tsx (the image manager)
    lib/ImagesContext.tsx  Fetches image slots once, provides <DynamicImage slotKey="..." />
    components/            Header, Footer, Newsletter, Layout
```

## Deploying (when you're ready to put this live)

- **Frontend**: `npm run build` produces `frontend/dist` — deploy as a static
  site (Netlify, Vercel, GitHub Pages).
- **Backend**: needs to run somewhere persistent (Render, Railway, or a VPS) —
  it's a live server, not a static export. Set `DATABASE_URL`, `JWT_SECRET`,
  `ADMIN_PASSWORD`, and `CORS_ORIGINS` (your real frontend domain) as
  environment variables there, and update `VITE_API_URL` in the frontend to
  point at the deployed backend's URL before you build it.

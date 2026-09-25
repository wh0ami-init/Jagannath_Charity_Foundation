# Jagannath Foundation

A warm, image-led website for Jagannath Foundation, with a React and Tailwind frontend, a FastAPI backend, MySQL storage, and a private admin area for updating photographs and selected website copy.

## What the administrator can do

- Sign in at `/admin/login` with credentials configured in `backend/.env`.
- Replace photographs used across the homepage, programs, team and gallery. Images go live as soon as the upload finishes.
- Edit homepage and introduction text, and publish individual changes immediately.
- Review contact, volunteer, pledge and newsletter submissions in a private inbox, export the newest 200 rows as CSV, or delete records.
- View the public site in a second tab while working in the dashboard.

Uploaded files, editable copy and form submissions are stored by the backend. They are not committed to Git, so keep a backup of the server's database and `backend/uploads` folder when you deploy. Only an authenticated administrator can view inbox entries.

## Requirements

- Python 3.11 or newer
- Node.js 18 or newer
- MySQL 8 or newer

## Run locally on macOS

### 1. Create the MySQL database

Start MySQL (or start MySQL from XAMPP), then create an empty database:

```bash
mysql -u root -e "CREATE DATABASE jagannath_foundation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

If your MySQL root account has a password, add `-p` and enter it when prompted.

### 2. Configure and start the API

Open a terminal in the project folder:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Open `backend/.env`. Set the actual MySQL password in `DATABASE_URL`, choose the administrator username and a strong password, and replace `JWT_SECRET` with a long random value. The admin account is created the first time the backend starts; changing credentials in `.env` later does not change an account that already exists in the database.

For a local MySQL account without a password, use:

```text
DATABASE_URL=mysql+mysqlconnector://root@127.0.0.1:3306/jagannath_foundation
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8010
```

Keep this terminal open. The API creates its tables, administrator account, and initial image library on first start. Check `http://localhost:8010/api/health` for `{"status":"ok"}`.

### 3. Start the website

Open another terminal in the project folder:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` for the public website and `http://localhost:5173/admin/login` for the administrator sign-in.

## Use the admin dashboard

1. Open `/admin/login` and sign in with the credentials in `backend/.env`.
2. In **Images**, choose a photo placement and select a JPG, PNG, WEBP or GIF file up to 8 MB. The replacement appears on the public site immediately.
3. In **Website text**, edit homepage headlines, introductions and the Foundation note. Save fields individually.
4. In **Inbox**, respond to contact and volunteer requests, follow up on pledge notes, or review requests for updates. Pledge notes do not make or process a payment. Delete records when they are no longer needed.

## GitHub

The project is ready for Git. If you start from the ZIP rather than this repository, extract it, open Terminal in the extracted project folder, and run:

```bash
git init
git add .
git commit -m "Rebuild Jagannath Foundation website"
```

Create an empty repository on GitHub, then connect and push it using the commands GitHub shows for that repository. Do not add `backend/.env`, database files, virtual environments, `node_modules` or uploaded images. The included `.gitignore` already excludes these.

## MySQL and deployment notes

`DATABASE_URL` selects the database. SQLAlchemy can also use SQLite for a quick local preview by setting `DATABASE_URL=sqlite:///./app.db`, though the included setup is configured for MySQL. The deployed API needs a persistent MySQL database and persistent storage for `backend/uploads`. Set `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `CORS_ORIGINS` as private environment variables on the server. Set `VITE_API_URL` to the deployed API origin and rebuild the frontend.

Forms save their submissions to the site's database and show confirmation after a successful save. The inbox does not send automatic email, the newsletter does not yet send programme updates, and pledge submissions do not make or process payments. Those actions need staff follow-up.

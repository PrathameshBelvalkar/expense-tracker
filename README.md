# Social Media Boosters Assignment

This repository contains a full-stack application: a React (Vite) frontend and a Flask API backend. Both must be running for the application to work.

---

## Prerequisites

Before running the project, install the following on your machine:

- **Node.js** (v18 or newer). Check with: `node --version`
- **npm** (comes with Node.js). Check with: `npm --version`
- **Python** (3.10 or newer). Check with: `python --version` or `python3 --version`
- **Supabase** account and a project (used by the backend for data)

---

## Local setup steps

1. Clone the repo and open the project root.
2. **Backend:** In `flask_server`, copy `.env.example` to `.env`, fill in the values (see **Environment variables** below), create a virtual environment, install dependencies, then run the backend (see **Backend** and **Running both**).
3. **Frontend:** In `client`, copy `.env.example` to `.env`, set `VITE_API_URL` if needed, run `npm install`, then start the dev server (see **Frontend** and **Running both**).
4. Create the database table in Supabase (see **Database + migrations**).

---

## Environment variables (.env.example)

Each app has an `.env.example` in its folder. Copy it to `.env` and set real values. Do not commit `.env`.

**Backend (`flask_server/.env`):**

| Key               | Description                              |
|-------------------|------------------------------------------|
| SUPABASE_URL      | Your Supabase project URL                |
| SUPABASE_KEY      | Supabase anon key or service role key    |
| OCR_SPACE_API_KEY | API key for OCR.space (receipt scanning) |

**Frontend (`client/.env`):**

| Key            | Description                    | Default              |
|----------------|--------------------------------|----------------------|
| VITE_API_URL   | Backend API base URL           | http://127.0.0.1:5000|

Example (backend): `cp flask_server/.env.example flask_server/.env` then edit. Same idea for `client/.env`.

---

## Database + migrations

In the Supabase dashboard, open **SQL Editor** and run the following. Replace `public` if you use a different schema.

```sql
create table if not exists public.expenses (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  amount     numeric not null check (amount >= 0),
  category   text not null default 'OTHER',
  expense_date date not null,
  description text not null default ''
);

create index if not exists idx_expenses_expense_date on public.expenses (expense_date desc);
create index if not exists idx_expenses_category on public.expenses (category);
```

Allowed categories used by the app: `RENT`, `FOOD`, `TRANSPORT`, `UTILITIES`, `ENTERTAINMENT`, `HEALTH`, `SHOPPING`, `EDUCATION`, `INSURANCE`, `OTHER`.

There are no migration runners; apply the SQL above once in the Supabase SQL Editor to create/update the schema.

---

## Third-party API integration

The app uses the following external services:

| Service     | Purpose                    | Configuration                    |
|-------------|----------------------------|----------------------------------|
| **Supabase**| Database and auth          | `SUPABASE_URL`, `SUPABASE_KEY`  |
| **OCR.space** | Receipt image text extraction | `OCR_SPACE_API_KEY`          |

- **Supabase:** Create a project at [supabase.com](https://supabase.com). Use **Project Settings > API** for the URL and anon/service role key.
- **OCR.space:** Used for the “upload receipt” flow to extract text from receipt images. Get a free API key at [ocr.space](https://ocr.space/ocrapi). Add `OCR_SPACE_API_KEY` to `flask_server/.env`. If this key is missing, receipt OCR endpoints will return an error.

---

## Backend (Flask API)

The backend serves the API at `http://127.0.0.1:5000` by default.

### 1. Open a terminal and go to the backend folder

```bash
cd flask_server
```

### 2. Create a virtual environment (recommended)

**Windows (Command Prompt):**

```bash
python -m venv venv
venv\Scripts\activate
```

**Windows (PowerShell):**

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Add backend environment variables

Create `.env` in the `flask_server` folder and set the keys listed under **Environment variables** (SUPABASE_URL, SUPABASE_KEY, OCR_SPACE_API_KEY). See **Third-party API integration** for where to obtain each value.

### 5. Start the backend

```bash
python app.py
```

Leave this terminal open. When it is running, you should see output indicating the Flask server is active (e.g. on `http://127.0.0.1:5000`).

---

## Frontend (React + Vite)

The frontend talks to the backend using the URL in `VITE_API_URL`. The default is `http://127.0.0.1:5000`. Ensure the backend is running first.

### 1. Open a new terminal and go to the client folder

```bash
cd client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add frontend environment variables

Create `.env` in the `client` folder and set VITE_API_URL to your backend URL (see **Environment variables**). If you omit it, the app uses `http://127.0.0.1:5000`.

### 4. Start the frontend

```bash
npm run dev
```

The terminal will show the local URL (e.g. `http://localhost:5173`). Open that URL in your browser to use the application.

---

## How to run Frontend & Backend locally

1. Start the **backend** first (in `flask_server`): `python app.py`
2. Start the **frontend** in a second terminal (in `client`): `npm run dev`
3. Open the URL shown by the frontend (e.g. `http://localhost:5173`) in your browser.

Both processes must stay running. Stop them with Ctrl+C in each terminal when you are done.

---

## Deployment notes

- **Frontend:** Deployed on **Vercel**. Build command: `npm run build`; output directory: `dist`. Configure `VITE_API_URL` in Vercel to point at the backend URL.
- **Backend:** Deployed on **AWS Elastic Beanstalk** (e.g. `expense-tracker-prod-311.eba-y4yuxegm.us-west-2.elasticbeanstalk.com`). The app runs with `gunicorn app:application` (see `flask_server/Procfile`). Set `SUPABASE_URL`, `SUPABASE_KEY`, and `OCR_SPACE_API_KEY` in the Elastic Beanstalk environment.
- In production, the Vercel app proxies `/expenses`, `/dashboard`, and `/ocr` to the Elastic Beanstalk backend via `client/vercel.json` rewrites.

---

## How to test

### UI flow to test CRUD (step-by-step)

1. Open the app (e.g. `http://localhost:5173` with backend running).
2. In the sidebar, click **My Expenses** (or go to `/expenses`).
3. **Create:** Click **Add**, fill title, amount, category, date, description, then save. The new row should appear in the table.
4. **Read:** Use the table and search box to filter; change sort by clicking column headers; use pagination to browse.
5. **Update:** Click the edit action on a row, change fields in the dialog, save. The table should show the updated values.
6. **Delete:** Click the delete action on a row, confirm. The row should disappear and the list refresh.

### Report / visualization page path

- **Path:** `/` (root). From the sidebar, click **Dashboard**.
- This page shows KPIs and charts (e.g. spending by category, trends) backed by the dashboard API.

### Third-party API feature path

- **Feature:** Receipt image upload and text extraction (OCR) via **OCR.space**.
- **Path in UI:** Go to **My Expenses** (`/expenses`), then click **Upload Receipt**. Choose an image; the app sends it to the backend, which calls OCR.space and returns extracted text. You can then create an expense from the parsed data (e.g. amount).
- **Backend route:** `POST /ocr/extract` (see `flask_server/controllers/ocr_controller.py`). Requires `OCR_SPACE_API_KEY` in `flask_server/.env`.


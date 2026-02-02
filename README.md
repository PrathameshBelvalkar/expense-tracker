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

## Environment variables

Add a `.env` file in each project with the following keys.

**Backend (`flask_server/.env`):**

| Key           | Description                          |
|---------------|--------------------------------------|
| SUPABASE_URL  | Your Supabase project URL            |
| SUPABASE_KEY  | Supabase anon key or service role key|

**Frontend (`client/.env`):**

| Key            | Description                    | Default              |
|----------------|--------------------------------|----------------------|
| VITE_API_URL   | Backend API base URL           | http://127.0.0.1:5000|

---

## Supabase: create the expenses table

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

Create `.env` in the `flask_server` folder and set the keys listed under **Environment variables** (SUPABASE_URL, SUPABASE_KEY). Get the values from Supabase: Project Settings > API.

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

## Running Both Projects

1. Start the **backend** first (in `flask_server`): `python app.py`
2. Start the **frontend** in a second terminal (in `client`): `npm run dev`
3. Open the URL shown by the frontend (e.g. `http://localhost:5173`) in your browser.

Both processes must stay running. Stop them with Ctrl+C in each terminal when you are done.


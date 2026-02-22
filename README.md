# ATS Fraud Detection

Full-stack resume analysis app:
- `backend`: Flask API for PDF analysis
- `frontend`: React + Vite single-page app

## Quick Start (Docker, recommended)

```bash
docker compose up --build
```

Then open `http://localhost:8080`.

## Local Dev (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on `http://127.0.0.1:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://127.0.0.1:5173` and proxies `/api/*` to backend.

## Deployment Notes

- Frontend expects API at `/api` by default.
- For split hosting, set `VITE_API_BASE_URL` in frontend environment to your backend URL (example: `https://your-api.example.com`).
- Backend runtime envs:
  - `CORS_ORIGINS` (comma separated, default `*`)
  - `MAX_UPLOAD_MB` (default `10`)

## Production Commands

- Backend: `gunicorn --bind 0.0.0.0:5000 app:app`
- Frontend: `npm run build` and serve `frontend/dist`

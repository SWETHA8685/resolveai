# ResolveAI Backend

FastAPI backend for the ResolveAI incident-management MVP.

## Included features

- FastAPI health and root endpoints
- SQLite persistence using SQLAlchemy
- Incident creation and analysis
- Gemini analysis when configured and available
- Transparent rule-based fallback when Gemini is unavailable
- Incident history, detail, status update, and deletion
- CORS for common local Vite development ports

## Setup on Windows (PowerShell)

Open a terminal in this `backend` folder.

```powershell
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Copy `.env.example` to `.env`, then add your own API key:

```env
GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-3.8-flash
```

Do not share `.env` or commit it to GitHub. If an API key has been exposed, revoke it and create a replacement.

Start the server:

```powershell
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000/docs`.

## Endpoints

- `GET /`
- `GET /api/health`
- `POST /api/incidents/analyze`
- `GET /api/incidents/`
- `GET /api/incidents/{incident_id}`
- `PATCH /api/incidents/{incident_id}/status`
- `DELETE /api/incidents/{incident_id}`

## Notes

The fallback is a simple keyword-based preliminary assessment, not an AI model or a confirmed diagnosis. Review all recommendations before acting. The MVP does not automatically remediate incidents.

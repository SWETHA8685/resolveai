# ResolveAI – AI-Powered IT Incident Management & Root Cause Analysis

ResolveAI is an intelligent IT incident management platform designed to help development and operations teams analyze technical incidents, identify potential root causes, and receive actionable troubleshooting recommendations.

By combining a modern web interface, a FastAPI backend, and Gemini-powered analysis, ResolveAI aims to simplify incident investigation and improve troubleshooting workflows.

## 🚀 Key Features

- **AI-Powered Incident Analysis:** Analyze technical incident descriptions using an AI integration.
- **Root Cause Analysis:** Identify potential causes behind reported technical issues.
- **Smart Recommendations:** Generate actionable troubleshooting suggestions.
- **Incident Management:** Save and review incident information.
- **Interactive Dashboard:** View incident information through a clean, user-friendly interface.
- **REST API:** Backend services built using FastAPI.
- **Modern User Interface:** Responsive frontend developed with React and TypeScript.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | SQLite |
| AI Integration | Google Gemini API |
| API Documentation | Swagger UI |
| Version Control | Git and GitHub |

## 🏗️ System Architecture

```text
                 USER
                   |
                   v
          React + TypeScript
             (Frontend)
                   |
                   v
             FastAPI Backend
                   |
          +--------+--------+
          |                 |
          v                 v
      SQLite DB        AI Engine
                            |
                            v
                      Gemini API
                            |
                            v
                  Incident Analysis
                            |
                            v
                 Root Cause & Actions
                            |
                            v
                   Frontend Dashboard
```

## 📂 Project Structure

```text
resolveai/
│
├── backend/
│   ├── main.py
│   ├── routes.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── ai_engine.py
│   ├── test_gemini.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/SWETHA8685/resolveai.git
cd resolveai
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder using `.env.example` as a template.

Add your own Google Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=your_supported_gemini_model
```

**Security:** Never upload your `.env` file or expose API keys in your source code or GitHub repository.

### 4. Run the Backend

From the backend directory:

```bash
uvicorn main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 5. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🧠 How ResolveAI Works

1. A user submits an IT incident description.
2. The frontend sends the incident details to the backend.
3. FastAPI processes the incoming request.
4. The AI engine analyzes the incident using the configured Gemini integration.
5. The system generates potential root causes and recommended actions.
6. The incident information is presented through the dashboard.

## 🎯 Project Objectives

- Reduce the effort required for initial incident investigation.
- Help developers understand technical failures.
- Provide structured troubleshooting recommendations.
- Demonstrate practical AI integration in a full-stack application.
- Explore the application of AI in IT operations and incident management.

## 🔮 Future Enhancements

- Incident priority classification and severity prediction.
- Historical incident pattern analysis.
- Similar incident detection.
- Knowledge-base integration.
- Advanced analytics and reporting.
- Multi-user collaboration and role-based access.

## 📸 Screenshots
https://drive.google.com/file/d/1_RizYO3FFOzTLl68NWudTuxolQeir_b6/view?usp=sharing

Screenshots of the application dashboard, incident analysis results, and incident details will be added here.

## 👩‍💻 Developer

**Swetha T.**

GitHub: [@SWETHA8685](https://github.com/SWETHA8685)

Project: [ResolveAI](https://github.com/SWETHA8685/resolveai)

---

⭐ If you find this project interesting, consider giving the repository a star!

**Built with curiosity, creativity, and a passion for AI-powered solutions.**

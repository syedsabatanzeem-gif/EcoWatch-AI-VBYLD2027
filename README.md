# EcoWatch AI — Cleaner Water • Healthier Tomorrow

An environmental technology platform for continuous water-quality monitoring, telemetry trend visualization, and explainable AI-assisted anomaly detection.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Capabilities](#key-capabilities)
3. [Technology Stack](#technology-stack)
4. [Windows PowerShell Setup & Run Instructions](#windows-powershell-setup--run-instructions)
5. [Starting Frontend & Backend in Separate Terminals](#starting-frontend--backend-in-separate-terminals)
6. [Single Terminal Full-Stack Quickstart (Node / Express)](#single-terminal-full-stack-quickstart-node--express)
7. [Running Backend Tests](#running-backend-tests)
8. [Data Schema & Sample Dataset](#data-schema--sample-dataset)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Responsible-Use & Regulatory Disclaimer](#responsible-use--regulatory-disclaimer)

---

## 1. Project Overview

EcoWatch AI provides water utilities, environmental researchers, and river basin conservancies with an end-to-end platform to inspect water quality readings, monitor spatial and temporal trends, flag unusual measurements using transparent statistical models (Z-score and IQR), and maintain an analyst review workflow.

---

## 2. Key Capabilities

- **Landing Page**: Environmental brand identity with hero illustration, core features, 3-step workflow, and regulatory disclaimer.
- **Operations Dashboard**: Dark navy sidebar (`#082B49`), light workspace (`#F8FAFC`), 4 live KPI summary cards, interactive Recharts time trends, and station comparison bar charts.
- **Water Quality Explorer**: Deep-dive into pH, Turbidity, TDS, Temperature, and Dissolved Oxygen with min/max/average/latest metrics, cross-station variance comparisons, and CSV export.
- **Explainable Anomaly Detection**: Transparent flagging of readings based on configurable thresholds, IQR boundaries, and Z-score standard deviations.
- **Human-in-the-Loop Triage**: Mark flagged readings as `Reviewed`, `Needs Further Investigation`, or `Normal` with analyst notes.
- **Parametric Limits Configuration**: Adjust pH min/max, turbidity limits, TDS limits, temperature bounds, and statistical sensitivities directly in the UI with instant dataset recalculation.
- **Drag-and-Drop CSV Ingestion**: File format validation, duplicate filtering, column mapping check, and live preview before commit.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React, Vite.
- **Backend Options**:
  - **Full-Stack Integrated Mode**: Node.js + Express with Vite middleware (`server.ts`) for single-port instant deployment on Port 3000.
  - **Python FastAPI Mode**: Python 3.10+, FastAPI, Pandas, NumPy, Pydantic v2, SQLite (`backend/`).

---

## 4. Windows PowerShell Setup & Run Instructions

Open **Windows PowerShell** (Run as Administrator or standard user) and follow these exact commands:

### Step 1: Clone or Navigate to the Project
```powershell
cd ecowatch-ai
```

### Step 2: Install Node.js Dependencies
Ensure Node.js (v18+) is installed:
```powershell
node -v
npm -v
npm install
```

### Step 3: Setup Python Virtual Environment (for FastAPI Backend)
Ensure Python (3.10+) is installed:
```powershell
python --version
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```
*(If PowerShell restricts script execution, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and re-run the activate command).*

---

## 5. Starting Frontend & Backend in Separate Terminals

To run the Python FastAPI backend on Port 8000 alongside the React Vite dev server:

### Terminal 1 — Python FastAPI Backend
```powershell
# In Windows PowerShell Terminal 1:
cd ecowatch-ai
.\venv\Scripts\Activate.ps1
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI Swagger documentation will be available at: `http://127.0.0.1:8000/docs`

### Terminal 2 — Frontend Application
```powershell
# In Windows PowerShell Terminal 2:
cd ecowatch-ai
npm run dev
```
Open your browser at: `http://localhost:3000`

---

## 6. Single Terminal Full-Stack Quickstart (Node / Express)

For zero-friction execution where Express serves both API routes (`/api/*`) and the React UI on a single unified port (3000):

```powershell
npm run dev
```
Visit `http://localhost:3000`. All REST endpoints, CSV uploads, anomaly recalculations, and interactive charts are immediately active.

---

## 7. Running Backend Tests

Run automated unit and integration tests for data validation, anomaly detection, and API endpoints:

```powershell
.\venv\Scripts\Activate.ps1
pytest backend/tests/ -v
```

---

## 8. Data Schema & Sample Dataset

The included `data/sample_water_quality.csv` provides representative sample data from 5 monitoring stations:
- Silver River Intake
- Cedar Creek Watershed
- Blue Lake Reservoir
- Pine Valley Estuary
- Highland Springs Run

### CSV Column Specification:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Optional | Unique sensor reading identifier (e.g. `EW-1001`). Auto-generated if omitted. |
| `location` | string | **Yes** | Monitoring station or watershed location name. |
| `timestamp` | ISO 8601 string | Optional | Measurement date and time (defaults to current time). |
| `ph` | float | **Yes** | pH measurement (6.5 – 8.5 standard). |
| `turbidity` | float | **Yes** | Nephelometric Turbidity Units (NTU). |
| `tds` | float | **Yes** | Total Dissolved Solids in mg/L. |
| `temperature` | float | **Yes** | Water temperature in degrees Celsius (°C). |
| `dissolved_oxygen` | float | Optional | Dissolved oxygen concentration in mg/L. |
| `status` | string | Optional | `Normal`, `Needs Review`, `High Priority`, `Reviewed`. |
| `review_notes` | string | Optional | Field or laboratory remarks. |

---

## 9. Troubleshooting Guide

### A. Missing Python Packages / ModuleNotFoundError
- **Cause**: Packages not installed in the active environment or virtual environment was not activated.
- **Fix**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  pip install --upgrade pip
  pip install -r backend/requirements.txt
  ```

### B. "Node.js / npm is not recognized"
- **Cause**: Node.js is not installed or not added to your system `PATH`.
- **Fix**: Download and install the latest LTS release from [nodejs.org](https://nodejs.org/). Re-open PowerShell after installation.

### C. PowerShell "Execution of scripts is disabled on this system"
- **Cause**: Windows PowerShell default security policy blocks script execution.
- **Fix**: Run:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
  Then reactivate `.\venv\Scripts\Activate.ps1`.

### D. API Connection / CORS Issues
- **Cause**: Port mismatch between frontend and backend.
- **Fix**: When using the separate FastAPI backend on port 8000, ensure CORS origins in `backend/app/config.py` include `http://localhost:3000`. When using the full-stack server (`npm run dev`), the client and API share port 3000 seamlessly.

### E. CSV Upload Errors
- **Error**: *"Missing required columns"*: Ensure your CSV contains header names matching `location`, `ph`, `turbidity`, `tds`, `temperature`.
- **Error**: *"Numeric values invalid"*: Ensure pH, turbidity, TDS, and temperature columns contain numeric values without currency symbols or trailing non-numeric characters. Use the **Download Template** button in the upload modal for a guaranteed valid structure.

---

## 10. Responsible-Use & Regulatory Disclaimer

**EcoWatch AI is an informational screening and decision-support platform.**
Statistical flags and anomaly alerts denote empirical deviations from configured baseline ranges or historical sensor norms. They do **not** represent proof that water is contaminated, toxic, or unsafe for drinking or recreation. Physical sensor drift, biofilm buildup, or temporary hydraulic turbulence can cause anomalous sensor readings. All automated alerts must be verified against applicable municipal health standards and validated through certified analytical laboratory spectrometry testing.

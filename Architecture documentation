# EcoWatch AI — Architecture & Engineering Specification

## 1. System Overview

EcoWatch AI is a full-stack water-quality intelligence platform designed to monitor physical and chemical freshwater parameters, detect anomalies using explainable statistical models, and assist environmental researchers in reviewing sensor data.

```
┌────────────────────────────────────────────────────────┐
│                   EcoWatch AI Frontend                 │
│        (React 19 + TypeScript + Tailwind CSS + Vite)   │
│   Landing Page | Dashboard | Explorer | Trends | Queue │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API (/api/*)
                           ▼
┌────────────────────────────────────────────────────────┐
│               EcoWatch AI Backend Services             │
│                                                        │
│  [Integrated Express Full-Stack Server (server.ts)]     │
│             OR [Python FastAPI Service (backend/)]     │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │         Anomaly Detection Engine               │   │
│   │  • Configurable Parametric Bounds (EPA/WHO)    │   │
│   │  • Gaussian Z-Score Model (|Z| > 2.5σ)         │   │
│   │  • Interquartile Range (IQR Outlier Envelopes) │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │               Data Persistence                 │   │
│   │  • SQLite Storage / In-Memory Seed Cache       │   │
│   │  • CSV Parser & Exporter (RFC 4180)            │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

## 2. Monitored Physicochemical Parameters

| Parameter | Unit | Target / Standard | Environmental Significance |
| :--- | :--- | :--- | :--- |
| **pH** | standard pH units | 6.50 – 8.50 | Acid rain, industrial effluent, or intense algal photosynthesis. |
| **Turbidity** | NTU | &le; 5.0 NTU (&lt; 1.0 drinking) | Suspended particulates, soil erosion, stormwater runoff. |
| **Total Dissolved Solids** | mg/L | &le; 500 mg/L | Dissolved mineral salts, road salting, fertilizer runoff. |
| **Temperature** | °C | 5.0°C – 25.0°C | Thermal pollution, cooling water discharges, solubility of gases. |
| **Dissolved Oxygen** | mg/L | &ge; 6.0 mg/L (&gt; 4.0 critical) | Aquatic life support; low values mark hypoxia / eutrophication. |

## 3. Anomaly Detection Algorithms

1. **Threshold Exceedance**:
   - Compares raw value $x$ directly to configured bounds $[T_{min}, T_{max}]$.
   - Triggers immediate warning if $x < T_{min}$ or $x > T_{max}$.
   - Severity elevated to *High Priority* if exceedance exceeds safety margin (e.g. turbidity $> 1.5 \times T_{max}$ or DO $< 4.0\text{ mg/L}$).

2. **Gaussian Standard Deviation (Z-Score)**:
   $$Z = \frac{x - \mu}{\sigma}$$
   Flags measurements where $|Z| > 2.5$. Highlights sharp, sudden deviations from the station's baseline even if within absolute statutory limits.

3. **Interquartile Range (IQR)**:
   $$\text{IQR} = Q_3 - Q_1$$
   $$\text{Lower Limit} = Q_1 - 1.5 \times \text{IQR}, \quad \text{Upper Limit} = Q_3 + 1.5 \times \text{IQR}$$
   Non-parametric outlier filter immune to skewed distributions.

## 4. API Endpoints

- `GET /api/health` — System status and dataset count.
- `GET /api/readings` — Paginated, searchable, filtered readings.
- `GET /api/summary` — High-level statistics (totals, stations, flagged count, averages).
- `GET /api/trends` — Chronological time-series points and station averages.
- `GET /api/alerts` — Flagged measurements with mathematical explanations.
- `PATCH /api/alerts/:id` — Analyst review status update.
- `GET /api/thresholds` — Retrieve active limits.
- `PUT /api/thresholds` — Update limits and recompute anomalies.
- `POST /api/upload` — Ingest and validate CSV data.
- `GET /api/export` — Download filtered CSV.

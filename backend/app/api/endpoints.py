import io
import json
import sqlite3
from typing import Optional, List
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Response
from ..config import settings, thresholds_config, ThresholdLimits
from ..database import get_db_connection
from ..schemas.water import (
    ReadingResponse, AlertUpdate, ThresholdUpdate, SummaryResponse,
    CommunityReportCreate, CommunityReportResponse, InvestigationPriorityItem
)
from ..services.anomaly_detector import AnomalyDetector

router = APIRouter()
detector = AnomalyDetector(thresholds_config)

@router.get("/health")
def get_health():
    conn = get_db_connection()
    try:
        count = conn.execute("SELECT COUNT(*) FROM readings").fetchone()[0]
    except Exception:
        count = 0
    conn.close()
    return {
        "status": "ok",
        "service": "EcoWatch AI Environmental Intelligence Service",
        "version": settings.app_version,
        "dataset_count": count,
        "is_demo_data": True
    }

@router.get("/stations")
def get_stations():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM readings", conn)
    conn.close()

    if df.empty:
        return {"stations": []}

    stations = []
    for loc, group in df.groupby("location"):
        sorted_group = group.sort_values(by="timestamp", ascending=False)
        latest = sorted_group.iloc[0]
        has_flag = bool((group["status"].isin(["High Priority", "Needs Review"])).any())
        stations.append({
            "id": latest["id"],
            "name": loc,
            "latitude": float(latest.get("latitude") or 45.5),
            "longitude": float(latest.get("longitude") or -122.6),
            "readingsCount": len(group),
            "latestReading": dict(latest),
            "status": latest["status"],
            "hasActiveFlag": has_flag,
            "source": latest.get("source", "Regional Station"),
            "is_illustrative": True
        })
    return {"stations": stations}

@router.get("/readings")
def get_readings(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    sortBy: str = Query("timestamp"),
    sortOrder: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000)
):
    conn = get_db_connection()
    query = "SELECT * FROM readings WHERE 1=1"
    params = []

    if search:
        query += " AND (id LIKE ? OR location LIKE ? OR review_notes LIKE ? OR source LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    if location and location != "all":
        query += " AND location = ?"
        params.append(location)

    if status and status != "all":
        query += " AND status = ?"
        params.append(status)

    if startDate:
        query += " AND timestamp >= ?"
        params.append(startDate)

    if endDate:
        query += " AND timestamp <= ?"
        params.append(endDate)

    valid_cols = ["id", "location", "timestamp", "ph", "turbidity", "tds", "temperature", "dissolved_oxygen", "nitrate_mg_l", "status"]
    sort_col = sortBy if sortBy in valid_cols else "timestamp"
    direction = "ASC" if sortOrder.lower() == "asc" else "DESC"
    query += f" ORDER BY {sort_col} {direction}"

    cursor = conn.cursor()
    cursor.execute(query, params)
    all_rows = cursor.fetchall()
    total = len(all_rows)

    offset = (page - 1) * limit
    paginated_rows = all_rows[offset:offset + limit]

    readings = []
    for r in paginated_rows:
        reasons = [x.strip() for x in r["anomaly_reasons"].split(";")] if r["anomaly_reasons"] else []
        try:
            z_sc = json.loads(r["z_scores"]) if r["z_scores"] else {}
        except:
            z_sc = {}
        readings.append({
            "id": r["id"],
            "location": r["location"],
            "timestamp": r["timestamp"],
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "ph": r["ph"],
            "turbidity": r["turbidity"],
            "tds": r["tds"],
            "temperature": r["temperature"],
            "dissolved_oxygen": r["dissolved_oxygen"],
            "nitrate_mg_l": r["nitrate_mg_l"] if "nitrate_mg_l" in r.keys() else None,
            "source": r["source"] if "source" in r.keys() else "Monitoring Station",
            "status": r["status"],
            "review_notes": r["review_notes"],
            "anomaly_reasons": reasons,
            "z_scores": z_sc,
            "ml_anomaly": bool(r["ml_anomaly"]) if "ml_anomaly" in r.keys() else False,
            "is_illustrative": True
        })

    loc_rows = conn.execute("SELECT DISTINCT location FROM readings ORDER BY location ASC").fetchall()
    locations = [lr["location"] for lr in loc_rows]
    conn.close()

    return {
        "readings": readings,
        "total": total,
        "page": page,
        "pageSize": limit,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
        "locations": locations
    }

@router.get("/summary", response_model=SummaryResponse)
def get_summary():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM readings", conn)
    conn.close()

    total = len(df)
    if total == 0:
        return SummaryResponse(
            totalReadings=0,
            locationsMonitored=0,
            locationsList=[],
            flaggedReadings=0,
            highPriorityCount=0,
            reviewedCount=0,
            normalCount=0,
            anomalyRate=0.0,
            locationsRequiringFollowUp=0,
            latestMeasurement=None,
            parameterStats={},
            isIllustrativeData=True
        )

    locations = sorted(df["location"].unique().tolist())
    flagged = int(df["status"].isin(["Needs Review", "High Priority", "Needs Further Investigation"]).sum())
    high_priority = int((df["status"] == "High Priority").sum())
    reviewed = int((df["status"] == "Reviewed").sum())
    normal = int((df["status"] == "Normal").sum())

    follow_up_locs = df[df["status"].isin(["Needs Review", "High Priority", "Needs Further Investigation"])]["location"].nunique()

    df["dt"] = pd.to_datetime(df["timestamp"])
    latest_row = df.sort_values(by="dt", ascending=False).iloc[0]
    latest_obj = ReadingResponse(
        id=latest_row["id"],
        location=latest_row["location"],
        timestamp=latest_row["timestamp"],
        latitude=float(latest_row["latitude"]) if pd.notna(latest_row.get("latitude")) else None,
        longitude=float(latest_row["longitude"]) if pd.notna(latest_row.get("longitude")) else None,
        ph=float(latest_row["ph"]),
        turbidity=float(latest_row["turbidity"]),
        tds=float(latest_row["tds"]),
        temperature=float(latest_row["temperature"]),
        dissolved_oxygen=float(latest_row["dissolved_oxygen"]) if pd.notna(latest_row["dissolved_oxygen"]) else None,
        nitrate_mg_l=float(latest_row["nitrate_mg_l"]) if "nitrate_mg_l" in latest_row and pd.notna(latest_row["nitrate_mg_l"]) else None,
        source=str(latest_row.get("source", "Regional Station")),
        status=latest_row["status"],
        review_notes=latest_row.get("review_notes", "")
    )

    stats = {}
    for p in ["ph", "turbidity", "tds", "temperature", "dissolved_oxygen", "nitrate_mg_l"]:
        if p in df.columns:
            s = pd.to_numeric(df[p], errors='coerce').dropna()
            if not s.empty:
                stats[p] = {
                    "avg": round(float(s.mean()), 2),
                    "min": round(float(s.min()), 2),
                    "max": round(float(s.max()), 2)
                }
            else:
                stats[p] = {"avg": 0.0, "min": 0.0, "max": 0.0}

    return SummaryResponse(
        totalReadings=total,
        locationsMonitored=len(locations),
        locationsList=locations,
        flaggedReadings=flagged,
        highPriorityCount=high_priority,
        reviewedCount=reviewed,
        normalCount=normal,
        anomalyRate=round((flagged / total) * 100, 1),
        locationsRequiringFollowUp=int(follow_up_locs),
        latestMeasurement=latest_obj,
        parameterStats=stats,
        isIllustrativeData=True
    )

@router.get("/priority")
def get_priority():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM readings", conn)
    conn.close()

    items = []
    if df.empty:
        return {"total": 0, "items": []}

    for idx, (loc, group) in enumerate(df.groupby("location")):
        sorted_g = group.sort_values(by="timestamp", ascending=False)
        latest = sorted_g.iloc[0]
        high_c = int((group["status"] == "High Priority").sum())
        rev_c = int((group["status"] == "Needs Review").sum())
        ml_c = int((group.get("ml_anomaly", 0) == 1).sum()) if "ml_anomaly" in group.columns else 0

        score = 20
        cat = "Nominal"
        action = "Check source records"
        step = "Maintain seasonal baseline surveillance."

        if high_c > 0:
            score = min(100, 80 + high_c * 6)
            cat = "Review recommended"
            action = "Consult certified environmental laboratory"
            step = "Collect secondary duplicate sample and dispatch for certified spectrometry."
        elif rev_c > 0 or ml_c > 0:
            score = min(79, 50 + rev_c * 5 + ml_c * 4)
            cat = "Further verification needed"
            action = "Repeat field measurement"
            step = "Recalibrate probe membrane and inspect upstream runoff channel."
        elif len(group) < 3:
            score = 35
            cat = "Insufficient data"
            action = "Check source records"
            step = "Collect additional samples to establish empirical baseline."

        meas = ["pH", "Turbidity", "TDS", "Temp"]
        if pd.notna(latest.get("dissolved_oxygen")): meas.append("DO")
        if pd.notna(latest.get("nitrate_mg_l")): meas.append("Nitrate")

        reasons = [r for sub in group["anomaly_reasons"].dropna() for r in sub.split(";") if r.strip()]

        items.append({
            "id": f"PRI-{100 + idx}",
            "location": loc,
            "station_id": str(latest["id"]),
            "latitude": float(latest.get("latitude") or 45.45),
            "longitude": float(latest.get("longitude") or -122.65),
            "basin": f"{loc} Sub-catchment",
            "priority_category": cat,
            "priority_score": score,
            "sampling_date": str(latest["timestamp"]),
            "available_measurements": meas,
            "data_completeness_pct": round(len(meas) / 6 * 100),
            "triggered_rules": list(set(reasons))[:3],
            "ml_anomaly_detected": ml_c > 0,
            "suggested_next_step": step,
            "recommended_action_type": action
        })

    items.sort(key=lambda x: x["priority_score"], reverse=True)
    return {"total": len(items), "items": items}

@router.get("/trends")
@router.get("/analysis")
def get_trends(location: Optional[str] = None):
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM readings ORDER BY timestamp ASC", conn)
    conn.close()

    if location and location != "all":
        df = df[df["location"] == location]

    trends = []
    for _, r in df.iterrows():
        trends.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "location": r["location"],
            "ph": float(r["ph"]),
            "turbidity": float(r["turbidity"]),
            "tds": float(r["tds"]),
            "temperature": float(r["temperature"]),
            "dissolved_oxygen": float(r["dissolved_oxygen"]) if pd.notna(r["dissolved_oxygen"]) else None,
            "nitrate_mg_l": float(r["nitrate_mg_l"]) if "nitrate_mg_l" in r and pd.notna(r["nitrate_mg_l"]) else None,
            "status": r["status"]
        })

    return {"trends": trends}

@router.get("/alerts")
@router.get("/flags")
def get_alerts(status: Optional[str] = "all"):
    conn = get_db_connection()
    query = "SELECT * FROM readings WHERE status IN ('Needs Review', 'High Priority', 'Needs Further Investigation', 'Reviewed') ORDER BY timestamp DESC"
    rows = conn.execute(query).fetchall()
    conn.close()

    alerts = []
    for r in rows:
        reasons = [x.strip() for x in r["anomaly_reasons"].split(";")] if r["anomaly_reasons"] else []
        try:
            z_sc = json.loads(r["z_scores"]) if r["z_scores"] else {}
        except:
            z_sc = {}
        alerts.append({
            "id": r["id"],
            "location": r["location"],
            "timestamp": r["timestamp"],
            "status": r["status"],
            "reasons": reasons,
            "z_scores": z_sc,
            "review_notes": r["review_notes"],
            "reading": dict(r)
        })

    return {"totalAlerts": len(alerts), "alerts": alerts}

@router.get("/reports")
def get_reports():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM community_reports ORDER BY submitted_at DESC").fetchall()
    conn.close()
    return {"reports": [dict(r) for r in rows], "total": len(rows)}

@router.post("/reports")
def create_report(payload: CommunityReportCreate):
    import uuid, datetime
    conn = get_db_connection()
    r_id = f"REP-{str(uuid.uuid4())[:6]}"
    now = datetime.datetime.utcnow().isoformat() + "Z"
    conn.execute("""
        INSERT INTO community_reports (id, location, water_body_name, type_of_concern, observation_date, description, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending Verification', ?)
    """, (r_id, payload.location, payload.water_body_name, payload.type_of_concern, payload.observation_date, payload.description, now))
    conn.commit()
    conn.close()
    return {
        "success": True,
        "report": {"id": r_id, "location": payload.location, "status": "Pending Verification", "submitted_at": now},
        "message": "Community observation logged for screening."
    }

@router.patch("/alerts/{alert_id}")
def update_alert(alert_id: str, payload: AlertUpdate):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM readings WHERE id = ?", (alert_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Alert reading not found")

    conn.execute(
        "UPDATE readings SET status = ?, review_notes = COALESCE(?, review_notes) WHERE id = ?",
        (payload.status, payload.review_notes, alert_id)
    )
    conn.commit()
    updated = conn.execute("SELECT * FROM readings WHERE id = ?", (alert_id,)).fetchone()
    conn.close()
    return {"success": True, "updated": dict(updated)}

@router.get("/thresholds")
def get_thresholds():
    return thresholds_config

@router.put("/thresholds")
def update_thresholds(payload: ThresholdUpdate):
    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(thresholds_config, field, val)
    return {"success": True, "thresholds": thresholds_config}

@router.post("/upload")
async def upload_readings(file: UploadFile = File(...)):
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if 'location' not in df.columns or 'ph' not in df.columns:
        raise HTTPException(status_code=400, detail="Missing required columns: location, ph")

    analyzed_df = detector.analyze(df)
    conn = get_db_connection()
    accepted = 0
    rejected = 0
    for idx, row in analyzed_df.iterrows():
        try:
            r_id = row.get("station_id") or row.get("id") or f"EW-{1000 + idx}"
            reasons_str = "; ".join(row.get("anomaly_reasons", []))
            z_scores_str = json.dumps(row.get("z_scores", {}))
            conn.execute("""
                INSERT OR REPLACE INTO readings
                (id, location, timestamp, latitude, longitude, ph, turbidity, tds, temperature, dissolved_oxygen, nitrate_mg_l, source, status, review_notes, anomaly_reasons, z_scores, ml_anomaly)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(r_id),
                str(row["location"]),
                str(row.get("sample_date") or row.get("timestamp", "")),
                float(row["latitude"]) if pd.notna(row.get("latitude")) else None,
                float(row["longitude"]) if pd.notna(row.get("longitude")) else None,
                float(row["ph"]),
                float(row.get("turbidity_ntu") or row.get("turbidity") or 1.0),
                float(row.get("tds", 220)),
                float(row.get("temperature_c") or row.get("temperature") or 15.0),
                float(row["dissolved_oxygen"]) if pd.notna(row.get("dissolved_oxygen")) else None,
                float(row["nitrate_mg_l"]) if pd.notna(row.get("nitrate_mg_l")) else None,
                str(row.get("source", "Uploaded Dataset")),
                str(row.get("status", "Normal")),
                str(row.get("review_notes", "")),
                reasons_str,
                z_scores_str,
                1 if row.get("ml_anomaly") else 0
            ))
            accepted += 1
        except Exception:
            rejected += 1

    conn.commit()
    conn.close()

    return {
        "success": True,
        "acceptedCount": accepted,
        "rejectedCount": rejected,
        "message": f"Successfully ingested {accepted} records ({rejected} rejected)."
    }

@router.get("/export")
def export_csv():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM readings ORDER BY timestamp DESC", conn)
    conn.close()

    stream = io.StringIO()
    df.to_csv(stream, index=False)
    response = Response(content=stream.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=ecowatch_water_quality_report.csv"
    return response

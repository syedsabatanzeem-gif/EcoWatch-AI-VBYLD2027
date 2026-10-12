import sqlite3
import os
from .config import settings

def get_db_connection():
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id TEXT PRIMARY KEY,
            location TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            ph REAL NOT NULL,
            turbidity REAL NOT NULL,
            tds REAL NOT NULL,
            temperature REAL NOT NULL,
            dissolved_oxygen REAL,
            nitrate_mg_l REAL,
            source TEXT DEFAULT 'Regional Watershed Station',
            status TEXT NOT NULL DEFAULT 'Normal',
            review_notes TEXT DEFAULT '',
            anomaly_reasons TEXT DEFAULT '',
            z_scores TEXT DEFAULT '{}',
            ml_anomaly INTEGER DEFAULT 0
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS community_reports (
            id TEXT PRIMARY KEY,
            location TEXT NOT NULL,
            water_body_name TEXT,
            type_of_concern TEXT NOT NULL,
            observation_date TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending Verification',
            submitted_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS thresholds (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            ph_min REAL,
            ph_max REAL,
            turbidity_max REAL,
            tds_max REAL,
            temp_min REAL,
            temp_max REAL,
            dissolved_oxygen_min REAL,
            nitrate_max REAL,
            z_score_threshold REAL,
            iqr_multiplier REAL,
            enable_ml_detection INTEGER
        )
    """)
    conn.commit()
    conn.close()

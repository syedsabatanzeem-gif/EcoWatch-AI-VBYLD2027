import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert data["is_demo_data"] is True

def test_get_thresholds():
    response = client.get("/api/thresholds")
    assert response.status_code == 200
    data = response.json()
    assert "ph_min" in data
    assert "turbidity_max" in data
    assert "nitrate_max" in data

def test_get_summary_structure():
    response = client.get("/api/summary")
    assert response.status_code == 200
    data = response.json()
    assert "totalReadings" in data
    assert "locationsMonitored" in data
    assert "flaggedReadings" in data
    assert "locationsRequiringFollowUp" in data

def test_get_priority_queue():
    response = client.get("/api/priority")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_community_report_submission():
    payload = {
        "location": "Upper Mill Creek Bridge",
        "water_body_name": "Mill Creek",
        "type_of_concern": "Discoloration",
        "observation_date": "2026-03-30",
        "description": "Noticeable grayish runoff entering stream from adjacent access road."
    }
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "report" in data

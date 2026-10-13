import pytest
import pandas as pd
from backend.app.config import ThresholdLimits
from backend.app.services.anomaly_detector import AnomalyDetector

def test_anomaly_detector_normal_readings():
    thresholds = ThresholdLimits()
    detector = AnomalyDetector(thresholds)
    
    data = {
        'id': ['1', '2', '3'],
        'location': ['River A', 'River B', 'River C'],
        'timestamp': ['2026-03-01', '2026-03-02', '2026-03-03'],
        'ph': [7.2, 7.4, 7.3],
        'turbidity': [1.5, 2.0, 1.8],
        'tds': [250, 260, 255],
        'temperature': [15.0, 16.0, 15.5],
        'dissolved_oxygen': [8.5, 8.2, 8.4],
        'nitrate_mg_l': [2.1, 2.5, 2.0],
        'status': ['Normal', 'Normal', 'Normal']
    }
    df = pd.DataFrame(data)
    result = detector.analyze(df)
    
    assert len(result) == 3
    assert all(status == 'Normal' for status in result['status'])

def test_anomaly_detector_nitrate_and_turbidity_violation():
    thresholds = ThresholdLimits(turbidity_max=5.0, nitrate_max=10.0)
    detector = AnomalyDetector(thresholds)
    
    data = {
        'id': ['1', '2'],
        'location': ['Runoff Site', 'Clear Lake'],
        'timestamp': ['2026-03-01', '2026-03-02'],
        'ph': [7.2, 7.4],
        'turbidity': [8.5, 1.2],        # 8.5 > 5.0
        'tds': [300, 180],
        'temperature': [14.0, 13.0],
        'dissolved_oxygen': [6.5, 9.0],
        'nitrate_mg_l': [14.2, 2.1],    # 14.2 > 10.0
        'status': ['Normal', 'Normal']
    }
    df = pd.DataFrame(data)
    result = detector.analyze(df)
    
    row0 = result.iloc[0]
    assert row0['status'] == 'High Priority'
    reasons_str = " ".join(row0['anomaly_reasons'])
    assert 'Turbidity' in reasons_str
    assert 'Nitrate' in reasons_str

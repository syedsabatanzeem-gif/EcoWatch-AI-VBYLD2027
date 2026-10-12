import os
from pydantic import BaseModel

class ThresholdLimits(BaseModel):
    ph_min: float = 6.5
    ph_max: float = 8.5
    turbidity_max: float = 5.0  # NTU
    tds_max: float = 500.0  # mg/L
    temp_min: float = 5.0  # Celsius
    temp_max: float = 25.0  # Celsius
    dissolved_oxygen_min: float = 6.0  # mg/L
    nitrate_max: float = 10.0  # mg/L as NO3-N (WHO/EPA standard)
    z_score_threshold: float = 2.5
    iqr_multiplier: float = 1.5
    enable_ml_detection: bool = True

class Settings(BaseModel):
    app_name: str = "EcoWatch AI Water Quality Platform API"
    app_version: str = "2.0.0-hackathon"
    db_path: str = os.getenv("DB_PATH", "ecowatch_water.db")
    sample_csv_path: str = os.getenv("SAMPLE_CSV_PATH", "../../data/sample_water_quality.csv")
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

settings = Settings()
thresholds_config = ThresholdLimits()

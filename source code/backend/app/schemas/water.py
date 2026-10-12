from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class ReadingBase(BaseModel):
    location: str
    timestamp: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ph: float
    turbidity: float
    tds: float
    temperature: float
    dissolved_oxygen: Optional[float] = None
    nitrate_mg_l: Optional[float] = None
    source: Optional[str] = "Regional Watershed Monitoring Station"
    review_notes: Optional[str] = ""

class ReadingCreate(ReadingBase):
    id: Optional[str] = None
    status: Optional[str] = "Normal"

class ReadingResponse(ReadingBase):
    id: str
    status: str
    anomaly_reasons: Optional[List[str]] = []
    z_scores: Optional[Dict[str, float]] = {}
    ml_anomaly: Optional[bool] = False
    is_illustrative: Optional[bool] = True

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: str = Field(..., description="Normal, Needs Review, High Priority, Reviewed, Needs Further Investigation")
    review_notes: Optional[str] = None

class ThresholdUpdate(BaseModel):
    ph_min: Optional[float] = None
    ph_max: Optional[float] = None
    turbidity_max: Optional[float] = None
    tds_max: Optional[float] = None
    temp_min: Optional[float] = None
    temp_max: Optional[float] = None
    dissolved_oxygen_min: Optional[float] = None
    nitrate_max: Optional[float] = None
    z_score_threshold: Optional[float] = None
    iqr_multiplier: Optional[float] = None
    enable_ml_detection: Optional[bool] = None

class CommunityReportCreate(BaseModel):
    location: str
    water_body_name: Optional[str] = None
    type_of_concern: str
    observation_date: str
    description: str

class CommunityReportResponse(CommunityReportCreate):
    id: str
    status: str = "Pending Verification"
    submitted_at: str
    is_verified: bool = False

class InvestigationPriorityItem(BaseModel):
    id: str
    location: str
    station_id: str
    latitude: float
    longitude: float
    basin: str
    priority_category: str
    priority_score: int
    sampling_date: str
    available_measurements: List[str]
    data_completeness_pct: int
    triggered_rules: List[str]
    ml_anomaly_detected: bool
    suggested_next_step: str
    recommended_action_type: str

class SummaryResponse(BaseModel):
    totalReadings: int
    locationsMonitored: int
    locationsList: List[str]
    flaggedReadings: int
    highPriorityCount: int
    reviewedCount: int
    normalCount: int
    anomalyRate: float
    locationsRequiringFollowUp: int = 0
    latestMeasurement: Optional[ReadingResponse] = None
    parameterStats: Dict[str, Dict[str, float]]
    isIllustrativeData: bool = True

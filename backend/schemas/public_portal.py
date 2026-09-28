from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AreaSectorInfo(BaseModel):
    sector_id: str
    node_id: str
    name: str
    description: str
    latitude: float
    longitude: float
    status: str
    current_risk_level: str
    overall_risk_score: float

class PublicTelemetryData(BaseModel):
    temperature: float
    humidity: float
    pressure: float
    air_quality: float
    rain_value: float
    battery_percentage: float
    timestamp: str

class PublicAreaTelemetryResponse(BaseModel):
    area: AreaSectorInfo
    telemetry: Optional[PublicTelemetryData] = None
    risk_assessment: Dict[str, Any]
    active_alerts: List[Dict[str, Any]]
    community_advisory: str
    last_updated: str

class PublicSubscribeRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20)
    citizen_name: Optional[str] = "Citizen"
    area_sector: str = "ALL"
    preferred_alert_types: Optional[str] = "ALL"

class PublicVerifyOtpRequest(BaseModel):
    phone_number: str
    otp: str

class PublicSubscriptionResponse(BaseModel):
    id: int
    phone_number: str
    citizen_name: str
    area_sector: str
    preferred_alert_types: str
    status: str
    is_verified: bool
    created_at: str
    simulation_otp_hint: Optional[str] = None
    message: str

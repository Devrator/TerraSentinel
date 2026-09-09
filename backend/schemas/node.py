from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict
from backend.schemas.sensor import SensorReadingResponse
from backend.schemas.risk import RiskScoreResponse

class SensorNodeBase(BaseModel):
    node_id: str
    name: str
    latitude: float
    longitude: float

class SensorNodeResponse(SensorNodeBase):
    id: int
    status: str
    battery_percentage: float
    last_seen: Optional[datetime] = None
    created_at: datetime
    latest_reading: Optional[SensorReadingResponse] = None
    latest_risk: Optional[RiskScoreResponse] = None
    sensor_health: Optional[Dict[str, str]] = None

    class Config:
        from_attributes = True

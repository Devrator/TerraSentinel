from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class RiskScoreResponse(BaseModel):
    id: Optional[int] = None
    node_id: str
    timestamp: datetime
    fire_risk: float = Field(..., ge=0, le=100)
    flood_risk: float = Field(..., ge=0, le=100)
    pollution_risk: float = Field(..., ge=0, le=100)
    overall_risk: float = Field(..., ge=0, le=100)
    fire_category: str
    flood_category: str
    pollution_category: str
    overall_category: str

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: int
    node_id: str
    risk_type: str
    severity: str
    risk_score: float
    message: str
    timestamp: datetime
    acknowledged: bool

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    total_nodes: int
    online_nodes: int
    offline_nodes: int
    active_alerts: int
    critical_alerts: int
    average_temperature: float
    average_humidity: float
    average_air_quality: float
    system_status: str
    demo_mode: bool

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import desc
from backend.database import get_db
from backend.models.anomaly import AnomalyEvent

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])

class AnomalyResponse(BaseModel):
    id: int
    node_id: str
    parameter: str
    previous_value: float
    current_value: float
    change_pct: float
    detected_at: str
    severity: str
    anomaly_type: str
    description: str
    resolved: bool

    class Config:
        from_attributes = True

@router.get("", response_model=List[AnomalyResponse], summary="Get detected environmental anomalies")
def get_anomalies(
    limit: int = Query(default=50, ge=1, le=200),
    node_id: Optional[str] = Query(default=None),
    severity: Optional[str] = Query(default=None),
    anomaly_type: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(AnomalyEvent)
    if node_id:
        query = query.filter(AnomalyEvent.node_id == node_id)
    if severity:
        query = query.filter(AnomalyEvent.severity == severity.upper())
    if anomaly_type:
        query = query.filter(AnomalyEvent.anomaly_type == anomaly_type.upper())
    
    anomalies = query.order_by(desc(AnomalyEvent.detected_at)).limit(limit).all()
    return [
        AnomalyResponse(
            id=a.id,
            node_id=a.node_id,
            parameter=a.parameter,
            previous_value=a.previous_value,
            current_value=a.current_value,
            change_pct=a.change_pct,
            detected_at=a.detected_at.isoformat() if a.detected_at else "",
            severity=a.severity,
            anomaly_type=a.anomaly_type,
            description=a.description,
            resolved=a.resolved
        )
        for a in anomalies
    ]

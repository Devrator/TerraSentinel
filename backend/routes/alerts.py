from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.schemas.risk import AlertResponse
from backend.services.alert_service import AlertService

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse], summary="Get active and historical alerts")
def get_alerts(
    limit: int = Query(default=50, ge=1, le=200),
    severity: Optional[str] = Query(default=None, description="Filter by severity: LOW, MODERATE, HIGH, CRITICAL"),
    risk_type: Optional[str] = Query(default=None, description="Filter by risk type: FIRE, FLOOD, POLLUTION, BATTERY"),
    node_id: Optional[str] = Query(default=None, description="Filter by node ID"),
    acknowledged: Optional[bool] = Query(default=None, description="Filter by acknowledged status"),
    db: Session = Depends(get_db)
):
    """
    Returns alerts filtered by parameters.
    """
    alerts = AlertService.get_alerts(
        db=db,
        limit=limit,
        severity=severity,
        risk_type=risk_type,
        node_id=node_id,
        acknowledged=acknowledged
    )
    return alerts

@router.post("/{alert_id}/acknowledge", response_model=AlertResponse, summary="Acknowledge an alert")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """
    Marks an alert as acknowledged by the operator.
    """
    alert = AlertService.acknowledge_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found.")
    return alert

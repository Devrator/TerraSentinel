from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.risk import DashboardSummaryResponse
from backend.services.risk_service import RiskService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse, summary="Get dashboard summary KPI metrics")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns real-time aggregated metrics for the top KPI ribbon:
    - total_nodes, online_nodes, offline_nodes
    - active_alerts, critical_alerts
    - average_temperature, average_humidity, average_air_quality
    - system_status, demo_mode
    """
    summary = RiskService.get_dashboard_summary(db)
    return summary

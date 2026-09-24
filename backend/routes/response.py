from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any, List
from backend.database import get_db
from backend.models.alert import Alert
from backend.models.risk_prediction import RiskPrediction
from backend.models.incident import Incident

router = APIRouter(prefix="/api/response", tags=["Response & Recommendations"])

@router.get("", summary="Get system-generated response protocols and checklists")
def get_response_recommendations(db: Session = Depends(get_db)) -> Dict[str, Any]:
    active_alerts = db.query(Alert).filter(
        Alert.severity.in_(["CRITICAL", "HIGH"]),
        Alert.acknowledged == False
    ).order_by(desc(Alert.timestamp)).limit(10).all()

    recommendations = []

    for alert in active_alerts:
        actions = []
        if alert.risk_type == "FIRE":
            actions = [
                {"step": 1, "task": "Cross-reference thermal trajectory with adjacent nodes to eliminate localized false-positives.", "status": "PENDING"},
                {"step": 2, "task": "Verify optical/particulate AQI smoke indicators to confirm combustion aerosol signature.", "status": "PENDING"},
                {"step": 3, "task": "Dispatch autonomous drone / field patrol team to GPS coordinates.", "status": "PENDING"},
                {"step": 4, "task": "Trigger regional forestry fire dispatch warning channel if risk persists > 5 minutes.", "status": "PENDING"}
            ]
        elif alert.risk_type == "FLOOD":
            actions = [
                {"step": 1, "task": "Verify barometric pressure depression drop and gauge tipping bucket accumulation.", "status": "PENDING"},
                {"step": 2, "task": "Inspect upstream river catchment drainage telemetry.", "status": "PENDING"},
                {"step": 3, "task": "Alert regional municipal stormwater management and drainage teams.", "status": "PENDING"},
                {"step": 4, "task": "Issue localized low-lying perimeter evacuation advisory if flood risk exceeds 80%.", "status": "PENDING"}
            ]
        elif alert.risk_type == "POLLUTION":
            actions = [
                {"step": 1, "task": "Evaluate particulate / VOC sensor reading baseline against humidity inversion profile.", "status": "PENDING"},
                {"step": 2, "task": "Check municipal industrial perimeter emissions logs.", "status": "PENDING"},
                {"step": 3, "task": "Issue localized air quality health advisory for sensitive demographic groups.", "status": "PENDING"}
            ]
        else: # BATTERY / SYSTEM
            actions = [
                {"step": 1, "task": "Check solar charging efficiency and battery degradation curves.", "status": "PENDING"},
                {"step": 2, "task": "Schedule field technician battery pack swap / hardware maintenance.", "status": "PENDING"}
            ]

        recommendations.append({
            "alert_id": alert.id,
            "node_id": alert.node_id,
            "risk_type": alert.risk_type,
            "severity": alert.severity,
            "risk_score": alert.risk_score,
            "message": alert.message,
            "triggered_at": alert.timestamp.isoformat() if alert.timestamp else "",
            "recommended_actions": actions,
            "disclaimer": "System-generated operational recommendation based on multi-variate environmental heuristics. Final decision rests with authorized command center personnel."
        })

    return {
        "active_recommendations_count": len(recommendations),
        "recommendations": recommendations
    }

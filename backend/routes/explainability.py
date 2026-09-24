from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any, Optional
from backend.database import get_db
from backend.models.sensor_reading import SensorReading
from backend.risk_engine import RiskEngine

router = APIRouter(prefix="/api/ai", tags=["AI Explainability"])

@router.get("/explainability", summary="Get transparent AI factor contributions for risk predictions")
def get_ai_explainability(
    node_id: str = Query(default="ENV-001"),
    risk_type: str = Query(default="FIRE"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    latest = db.query(SensorReading).filter(
        SensorReading.node_id == node_id
    ).order_by(desc(SensorReading.timestamp)).first()

    temp = latest.temperature if latest else 26.5
    hum = latest.humidity if latest else 48.0
    pres = latest.pressure if latest else 1013.25
    rain = latest.rain_value if latest else 0.0
    aqi = latest.air_quality if latest else 55.0

    explain_data = RiskEngine.calculate_explainability(
        temperature=temp,
        humidity=hum,
        pressure=pres,
        rain_value=rain,
        air_quality=aqi,
        risk_type=risk_type
    )

    explain_data["node_id"] = node_id
    explain_data["latest_telemetry"] = {
        "temperature": temp,
        "humidity": hum,
        "pressure": pres,
        "rain_value": rain,
        "air_quality": aqi
    }
    return explain_data

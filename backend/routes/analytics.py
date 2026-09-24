from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import numpy as np
from backend.database import get_db
from backend.models.sensor_reading import SensorReading
from backend.models.risk_prediction import RiskPrediction

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Trends"])

@router.get("/trends", summary="Get historical analytics trends for sensors and risks")
def get_analytics_trends(
    time_range: str = Query(default="24H", description="1H, 6H, 24H, 7D, 30D"),
    node_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    delta_map = {
        "1H": timedelta(hours=1),
        "6H": timedelta(hours=6),
        "24H": timedelta(hours=24),
        "7D": timedelta(days=7),
        "30D": timedelta(days=30)
    }
    cutoff = now - delta_map.get(time_range.upper(), timedelta(hours=24))

    query = db.query(SensorReading).filter(SensorReading.timestamp >= cutoff)
    if node_id:
        query = query.filter(SensorReading.node_id == node_id)
    
    readings = query.order_by(SensorReading.timestamp.asc()).all()

    if not readings:
        # Fallback to recent readings if sparse database
        readings = db.query(SensorReading).order_by(desc(SensorReading.timestamp)).limit(50).all()
        readings.reverse()

    timestamps = [r.timestamp.isoformat() for r in readings]
    temps = [r.temperature for r in readings] or [24.0]
    hums = [r.humidity for r in readings] or [50.0]
    press = [r.pressure for r in readings] or [1013.25]
    rains = [r.rain_value for r in readings] or [0.0]
    aqis = [r.air_quality for r in readings] or [45.0]

    # Calculate statistics helper
    def calc_stats(arr: List[float]):
        if not arr:
            return {"min": 0, "max": 0, "avg": 0, "rate_of_change": 0}
        rate = arr[-1] - arr[0] if len(arr) > 1 else 0.0
        return {
            "min": round(float(np.min(arr)), 1),
            "max": round(float(np.max(arr)), 1),
            "avg": round(float(np.mean(arr)), 1),
            "rate_of_change": round(float(rate), 1)
        }

    # Fetch corresponding risk predictions
    risk_query = db.query(RiskPrediction).filter(RiskPrediction.timestamp >= cutoff)
    if node_id:
        risk_query = risk_query.filter(RiskPrediction.node_id == node_id)
    risk_records = risk_query.order_by(RiskPrediction.timestamp.asc()).all()
    if not risk_records:
        risk_records = db.query(RiskPrediction).order_by(desc(RiskPrediction.timestamp)).limit(50).all()
        risk_records.reverse()

    fire_risks = [r.fire_risk for r in risk_records] or [15.0]
    flood_risks = [r.flood_risk for r in risk_records] or [10.0]
    pollution_risks = [r.pollution_risk for r in risk_records] or [20.0]

    return {
        "time_range": time_range.upper(),
        "node_id": node_id or "ALL",
        "sample_count": len(readings),
        "timestamps": timestamps,
        "temperature": {
            "values": temps,
            "stats": calc_stats(temps),
            "unit": "°C"
        },
        "humidity": {
            "values": hums,
            "stats": calc_stats(hums),
            "unit": "%"
        },
        "pressure": {
            "values": press,
            "stats": calc_stats(press),
            "unit": "hPa"
        },
        "rain": {
            "values": rains,
            "stats": calc_stats(rains),
            "unit": "Raw/mm"
        },
        "air_quality": {
            "values": aqis,
            "stats": calc_stats(aqis),
            "unit": "AQI"
        },
        "risks": {
            "fire": {"values": fire_risks, "stats": calc_stats(fire_risks)},
            "flood": {"values": flood_risks, "stats": calc_stats(flood_risks)},
            "pollution": {"values": pollution_risks, "stats": calc_stats(pollution_risks)}
        }
    }

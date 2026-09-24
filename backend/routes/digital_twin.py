from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from backend.database import get_db
from backend.models.sensor_node import SensorNode
from backend.models.sensor_reading import SensorReading
from backend.models.risk_prediction import RiskPrediction

router = APIRouter(prefix="/api/digital-twin", tags=["Digital Twin"])

@router.get("", summary="Get geographical digital twin state with time playback support")
def get_digital_twin_state(
    offset_minutes: int = Query(default=0, ge=0, le=1440, description="Time playback offset: 0=NOW, 15=-15m, 30=-30m, 60=-1h, 360=-6h, 1440=-24h"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    target_time = datetime.now(timezone.utc) - timedelta(minutes=offset_minutes)
    nodes = db.query(SensorNode).all()

    twin_nodes = []
    risk_zones = []

    for node in nodes:
        # Find closest reading at target_time
        reading = db.query(SensorReading).filter(
            SensorReading.node_id == node.node_id,
            SensorReading.timestamp <= target_time
        ).order_by(desc(SensorReading.timestamp)).first()

        # Fallback to latest if nothing older than target_time
        if not reading:
            reading = db.query(SensorReading).filter(
                SensorReading.node_id == node.node_id
            ).order_by(SensorReading.timestamp.asc()).first()

        risk = db.query(RiskPrediction).filter(
            RiskPrediction.node_id == node.node_id,
            RiskPrediction.timestamp <= target_time
        ).order_by(desc(RiskPrediction.timestamp)).first()

        if not risk:
            risk = db.query(RiskPrediction).filter(
                RiskPrediction.node_id == node.node_id
            ).order_by(RiskPrediction.timestamp.asc()).first()

        node_data = {
            "node_id": node.node_id,
            "name": node.name,
            "latitude": node.latitude,
            "longitude": node.longitude,
            "coverage_radius_meters": 500,
            "connectivity_status": node.status,
            "battery_percentage": node.battery_percentage,
            "playback_timestamp": target_time.isoformat(),
            "telemetry": {
                "temperature": reading.temperature if reading else 24.0,
                "humidity": reading.humidity if reading else 50.0,
                "pressure": reading.pressure if reading else 1013.25,
                "rain_value": reading.rain_value if reading else 0.0,
                "air_quality": reading.air_quality if reading else 45.0,
                "reading_timestamp": reading.timestamp.isoformat() if reading else None
            },
            "risk": {
                "fire_risk": risk.fire_risk if risk else 15.0,
                "flood_risk": risk.flood_risk if risk else 10.0,
                "pollution_risk": risk.pollution_risk if risk else 20.0,
                "overall_risk": risk.overall_risk if risk else 15.0
            }
        }
        twin_nodes.append(node_data)

        # Generate risk zones if risk is elevated
        ov_risk = risk.overall_risk if risk else 15.0
        if ov_risk > 40.0:
            dominant = "FIRE" if risk and risk.fire_risk >= risk.flood_risk and risk.fire_risk >= risk.pollution_risk \
                else ("FLOOD" if risk and risk.flood_risk >= risk.pollution_risk else "POLLUTION")
            risk_zones.append({
                "zone_id": f"TWIN-ZONE-{node.node_id}",
                "latitude": node.latitude,
                "longitude": node.longitude,
                "radius": 450,
                "risk_type": dominant,
                "intensity": ov_risk,
                "level": "CRITICAL" if ov_risk > 75 else ("HIGH" if ov_risk > 50 else "MODERATE")
            })

    return {
        "target_offset_minutes": offset_minutes,
        "playback_timestamp": target_time.isoformat(),
        "is_historical": offset_minutes > 0,
        "nodes": twin_nodes,
        "risk_zones": risk_zones,
        "coverage_summary": {
            "total_nodes_mapped": len(twin_nodes),
            "effective_monitoring_area_km2": round(len(twin_nodes) * 0.785, 2), # pi*r^2
            "spatial_density": "1.2 nodes/km²"
        }
    }

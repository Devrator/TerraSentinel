from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.database import get_db
from backend.models.sensor_node import SensorNode
from backend.models.sensor_reading import SensorReading
from backend.models.risk_prediction import RiskPrediction
from backend.models.alert import Alert
from backend.models.incident import Incident

router = APIRouter(prefix="/api/situation-room", tags=["Situation Room"])

@router.get("", summary="Get real-time situation room command center overview")
def get_situation_room(db: Session = Depends(get_db)) -> Dict[str, Any]:
    nodes = db.query(SensorNode).all()
    
    threat_hierarchy = {
        "CRITICAL": [],
        "HIGH": [],
        "MODERATE": [],
        "LOW": []
    }
    
    active_threat_zones = []
    offline_nodes = []
    
    for node in nodes:
        latest_risk = db.query(RiskPrediction).filter(
            RiskPrediction.node_id == node.node_id
        ).order_by(desc(RiskPrediction.timestamp)).first()

        latest_reading = db.query(SensorReading).filter(
            SensorReading.node_id == node.node_id
        ).order_by(desc(SensorReading.timestamp)).first()

        if node.status == "OFFLINE":
            offline_nodes.append({
                "node_id": node.node_id,
                "name": node.name,
                "latitude": node.latitude,
                "longitude": node.longitude,
                "last_seen": node.last_seen.isoformat() if node.last_seen else None
            })

        if latest_risk:
            category = latest_risk.overall_risk
            level = "LOW"
            if category > 75:
                level = "CRITICAL"
            elif category > 50:
                level = "HIGH"
            elif category > 25:
                level = "MODERATE"

            threat_item = {
                "node_id": node.node_id,
                "name": node.name,
                "latitude": node.latitude,
                "longitude": node.longitude,
                "overall_risk": latest_risk.overall_risk,
                "fire_risk": latest_risk.fire_risk,
                "flood_risk": latest_risk.flood_risk,
                "pollution_risk": latest_risk.pollution_risk,
                "temperature": latest_reading.temperature if latest_reading else 25.0,
                "humidity": latest_reading.humidity if latest_reading else 50.0,
                "air_quality": latest_reading.air_quality if latest_reading else 50.0,
                "battery": node.battery_percentage
            }
            threat_hierarchy[level].append(threat_item)

            if level in ["CRITICAL", "HIGH"]:
                active_threat_zones.append({
                    "zone_id": f"ZONE-{node.node_id}",
                    "node_id": node.node_id,
                    "latitude": node.latitude,
                    "longitude": node.longitude,
                    "radius_meters": 600 if level == "CRITICAL" else 400,
                    "severity": level,
                    "risk_type": "FIRE" if latest_risk.fire_risk >= latest_risk.flood_risk and latest_risk.fire_risk >= latest_risk.pollution_risk
                    else ("FLOOD" if latest_risk.flood_risk >= latest_risk.pollution_risk else "POLLUTION"),
                    "score": latest_risk.overall_risk
                })

    recent_alerts = db.query(Alert).order_by(desc(Alert.timestamp)).limit(10).all()
    open_incidents = db.query(Incident).filter(Incident.status != "RESOLVED").order_by(desc(Incident.detected_at)).limit(5).all()

    # Timeline synthesis
    timeline = []
    for a in recent_alerts[:6]:
        timeline.append({
            "timestamp": a.timestamp.strftime("%H:%M:%S") if a.timestamp else "",
            "node_id": a.node_id,
            "event": f"[{a.severity}] {a.risk_type} hazard alert generated ({a.risk_score:.0f}%)",
            "type": "ALERT",
            "severity": a.severity
        })

    for inc in open_incidents:
        timeline.append({
            "timestamp": inc.detected_at.strftime("%H:%M:%S") if inc.detected_at else "",
            "node_id": inc.origin_node_id,
            "event": f"Incident {inc.incident_number}: {inc.title} - Status: {inc.status}",
            "type": "INCIDENT",
            "severity": inc.severity
        })

    timeline.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "threat_hierarchy": {
            "critical_count": len(threat_hierarchy["CRITICAL"]),
            "high_count": len(threat_hierarchy["HIGH"]),
            "moderate_count": len(threat_hierarchy["MODERATE"]),
            "low_count": len(threat_hierarchy["LOW"]),
            "items": threat_hierarchy
        },
        "active_threat_zones": active_threat_zones,
        "offline_nodes": offline_nodes,
        "live_timeline": timeline[:12],
        "system_status": "CRITICAL" if len(threat_hierarchy["CRITICAL"]) > 0 else ("WARNING" if len(threat_hierarchy["HIGH"]) > 0 else "NOMINAL")
    }

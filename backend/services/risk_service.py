from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from backend.models.risk_prediction import RiskPrediction
from backend.models.sensor_reading import SensorReading
from backend.models.sensor_node import SensorNode
from backend.models.alert import Alert
from backend.risk_engine import get_risk_category
from backend.config import settings

class RiskService:
    @staticmethod
    def get_latest_risk_for_node(db: Session, node_id: str) -> Optional[Dict[str, Any]]:
        risk = db.query(RiskPrediction).filter(
            RiskPrediction.node_id == node_id
        ).order_by(desc(RiskPrediction.timestamp)).first()

        if not risk:
            return None

        return {
            "id": risk.id,
            "node_id": risk.node_id,
            "timestamp": risk.timestamp,
            "fire_risk": risk.fire_risk,
            "flood_risk": risk.flood_risk,
            "pollution_risk": risk.pollution_risk,
            "overall_risk": risk.overall_risk,
            "fire_category": get_risk_category(risk.fire_risk),
            "flood_category": get_risk_category(risk.flood_risk),
            "pollution_category": get_risk_category(risk.pollution_risk),
            "overall_category": get_risk_category(risk.overall_risk),
        }

    @staticmethod
    def get_node_health(db: Session, node: SensorNode, latest_reading: Optional[SensorReading]) -> Dict[str, str]:
        """
        Evaluate health of individual sensor sub-systems:
        Returns dictionary mapping sensor name to HEALTHY / WARNING / ERROR.
        """
        now = datetime.now(timezone.utc)
        
        # Default if no data
        if not latest_reading or not node.last_seen:
            return {
                "temperature": "ERROR",
                "humidity": "ERROR",
                "pressure": "ERROR",
                "rain": "ERROR",
                "air_quality": "ERROR",
                "gps": "ERROR",
                "battery": "ERROR",
                "overall": "ERROR"
            }

        # Stale check
        stale_threshold = timedelta(seconds=settings.NODE_OFFLINE_THRESHOLD_SECONDS * 2)
        # Normalize timezones
        last_seen = node.last_seen
        if last_seen.tzinfo is None:
            last_seen = last_seen.replace(tzinfo=timezone.utc)
            
        is_stale = (now - last_seen) > stale_threshold

        health = {}
        
        # Temperature (-20 to 60 C valid)
        if latest_reading.temperature < -20.0 or latest_reading.temperature > 65.0:
            health["temperature"] = "ERROR"
        elif is_stale or latest_reading.temperature > 50.0:
            health["temperature"] = "WARNING"
        else:
            health["temperature"] = "HEALTHY"

        # Humidity (0 to 100%)
        if latest_reading.humidity < 0.0 or latest_reading.humidity > 100.0:
            health["humidity"] = "ERROR"
        elif is_stale:
            health["humidity"] = "WARNING"
        else:
            health["humidity"] = "HEALTHY"

        # Pressure (800 to 1100 hPa)
        if latest_reading.pressure < 800.0 or latest_reading.pressure > 1150.0:
            health["pressure"] = "ERROR"
        elif is_stale:
            health["pressure"] = "WARNING"
        else:
            health["pressure"] = "HEALTHY"

        # Rain (0 to 1000)
        if latest_reading.rain_value < 0.0:
            health["rain"] = "ERROR"
        elif is_stale:
            health["rain"] = "WARNING"
        else:
            health["rain"] = "HEALTHY"

        # Air Quality (0 to 500)
        if latest_reading.air_quality < 0.0:
            health["air_quality"] = "ERROR"
        elif is_stale:
            health["air_quality"] = "WARNING"
        else:
            health["air_quality"] = "HEALTHY"

        # GPS
        if latest_reading.latitude == 0.0 and latest_reading.longitude == 0.0:
            health["gps"] = "ERROR"
        elif is_stale:
            health["gps"] = "WARNING"
        else:
            health["gps"] = "HEALTHY"

        # Battery
        if node.battery_percentage < 10.0:
            health["battery"] = "ERROR"
        elif node.battery_percentage < 25.0 or is_stale:
            health["battery"] = "WARNING"
        else:
            health["battery"] = "HEALTHY"

        # Overall health
        if any(v == "ERROR" for v in health.values()) or is_stale:
            health["overall"] = "ERROR" if is_stale else "WARNING"
        elif any(v == "WARNING" for v in health.values()):
            health["overall"] = "WARNING"
        else:
            health["overall"] = "HEALTHY"

        return health

    @staticmethod
    def get_dashboard_summary(db: Session) -> Dict[str, Any]:
        """
        Calculates high-level metrics for dashboard header and KPI cards.
        """
        now = datetime.now(timezone.utc)
        threshold = now - timedelta(seconds=settings.NODE_OFFLINE_THRESHOLD_SECONDS)

        nodes = db.query(SensorNode).all()
        total_nodes = len(nodes)
        online_nodes = 0
        
        for node in nodes:
            if node.last_seen:
                last_seen = node.last_seen
                if last_seen.tzinfo is None:
                    last_seen = last_seen.replace(tzinfo=timezone.utc)
                if last_seen >= threshold:
                    online_nodes += 1
                    node.status = "ONLINE"
                else:
                    node.status = "OFFLINE"
            else:
                node.status = "OFFLINE"
        
        db.commit()

        offline_nodes = max(0, total_nodes - online_nodes)

        # Alerts count
        active_alerts = db.query(Alert).filter(Alert.acknowledged == False).count()
        critical_alerts = db.query(Alert).filter(
            Alert.acknowledged == False,
            Alert.severity == "CRITICAL"
        ).count()

        # Averages from latest reading of each node
        temps, hums, aqis = [], [], []
        for node in nodes:
            latest = db.query(SensorReading).filter(
                SensorReading.node_id == node.node_id
            ).order_by(desc(SensorReading.timestamp)).first()
            if latest:
                temps.append(latest.temperature)
                hums.append(latest.humidity)
                aqis.append(latest.air_quality)

        avg_temp = round(sum(temps) / len(temps), 1) if temps else 0.0
        avg_hum = round(sum(hums) / len(hums), 1) if hums else 0.0
        avg_aqi = round(sum(aqis) / len(aqis), 1) if aqis else 0.0

        system_status = "OPERATIONAL"
        if online_nodes == 0 and total_nodes > 0:
            system_status = "STANDBY"
        elif critical_alerts > 0:
            system_status = "HAZARD_ALERT"

        return {
            "total_nodes": total_nodes,
            "online_nodes": online_nodes,
            "offline_nodes": offline_nodes,
            "active_alerts": active_alerts,
            "critical_alerts": critical_alerts,
            "average_temperature": avg_temp,
            "average_humidity": avg_hum,
            "average_air_quality": avg_aqi,
            "system_status": system_status,
            "demo_mode": settings.DEMO_MODE
        }

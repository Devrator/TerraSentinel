import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.models.sensor_node import SensorNode
from backend.models.sensor_reading import SensorReading
from backend.models.risk_prediction import RiskPrediction
from backend.schemas.sensor import SensorDataPayload
from backend.risk_engine import RiskEngine
from backend.services.alert_service import AlertService
from backend.services.websocket_manager import ws_manager
from backend.config import settings

logger = logging.getLogger("terrasentinal.sensor_service")

class SensorService:
    @staticmethod
    async def ingest_sensor_data(db: Session, payload: SensorDataPayload) -> Dict[str, Any]:
        """
        Main Ingestion Flow:
        1. Validate & Ensure node exists
        2. Update sensor_nodes table (status, last_seen, battery, coordinates)
        3. Save reading in sensor_readings
        4. Calculate multi-variate risk scores using RiskEngine
        5. Save risk prediction in risk_predictions
        6. Generate alerts if hazard thresholds are exceeded
        7. Broadcast update via WebSocket
        """
        now = payload.timestamp or datetime.now(timezone.utc)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)

        # 1. Check/Update Node
        node = db.query(SensorNode).filter(SensorNode.node_id == payload.node_id).first()
        if not node:
            logger.info(f"Auto-registering new sensor node: {payload.node_id}")
            node = SensorNode(
                node_id=payload.node_id,
                name=f"Sensor Node {payload.node_id}",
                latitude=payload.latitude,
                longitude=payload.longitude,
                status="ONLINE",
                battery_percentage=payload.battery_percentage,
                last_seen=now,
                created_at=now
            )
            db.add(node)
        else:
            node.status = "ONLINE"
            node.last_seen = now
            node.battery_percentage = payload.battery_percentage
            node.latitude = payload.latitude
            node.longitude = payload.longitude

        # 2. Store Sensor Reading
        reading = SensorReading(
            node_id=payload.node_id,
            timestamp=now,
            temperature=payload.temperature,
            humidity=payload.humidity,
            pressure=payload.pressure,
            rain_value=payload.rain_value,
            air_quality=payload.air_quality,
            latitude=payload.latitude,
            longitude=payload.longitude,
            battery_percentage=payload.battery_percentage
        )
        db.add(reading)
        db.commit()
        db.refresh(reading)
        db.refresh(node)

        # 3. Fetch recent history for trend analysis
        recent_records = db.query(SensorReading).filter(
            SensorReading.node_id == payload.node_id
        ).order_by(desc(SensorReading.timestamp)).limit(6).all()

        recent_dicts = [
            {
                "temperature": r.temperature,
                "humidity": r.humidity,
                "pressure": r.pressure,
                "rain_value": r.rain_value,
                "air_quality": r.air_quality,
                "timestamp": r.timestamp
            }
            for r in reversed(recent_records)
        ]

        # 4. Evaluate AI Risk Engine
        risk_result = RiskEngine.evaluate_all(
            temperature=payload.temperature,
            humidity=payload.humidity,
            pressure=payload.pressure,
            rain_value=payload.rain_value,
            air_quality=payload.air_quality,
            recent_readings=recent_dicts
        )

        # 5. Store Risk Prediction
        prediction = RiskPrediction(
            node_id=payload.node_id,
            timestamp=now,
            fire_risk=risk_result["fire_risk"],
            flood_risk=risk_result["flood_risk"],
            pollution_risk=risk_result["pollution_risk"],
            overall_risk=risk_result["overall_risk"]
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        # 6. Evaluate & Store Alerts
        created_alerts = AlertService.process_node_risks(
            db=db,
            node_id=payload.node_id,
            fire_risk=risk_result["fire_risk"],
            flood_risk=risk_result["flood_risk"],
            pollution_risk=risk_result["pollution_risk"],
            battery_percentage=payload.battery_percentage
        )

        # 7. Broadcast update via WebSocket to connected dashboard clients
        ws_payload = {
            "type": "SENSOR_UPDATE",
            "node_id": payload.node_id,
            "node": {
                "id": node.id,
                "node_id": node.node_id,
                "name": node.name,
                "latitude": node.latitude,
                "longitude": node.longitude,
                "status": node.status,
                "battery_percentage": node.battery_percentage,
                "last_seen": node.last_seen.isoformat() if node.last_seen else None,
            },
            "reading": {
                "id": reading.id,
                "node_id": reading.node_id,
                "timestamp": reading.timestamp.isoformat(),
                "temperature": reading.temperature,
                "humidity": reading.humidity,
                "pressure": reading.pressure,
                "rain_value": reading.rain_value,
                "air_quality": reading.air_quality,
                "latitude": reading.latitude,
                "longitude": reading.longitude,
                "battery_percentage": reading.battery_percentage,
            },
            "risk": {
                "id": prediction.id,
                "node_id": prediction.node_id,
                "timestamp": prediction.timestamp.isoformat(),
                "fire_risk": prediction.fire_risk,
                "flood_risk": prediction.flood_risk,
                "pollution_risk": prediction.pollution_risk,
                "overall_risk": prediction.overall_risk,
                "fire_category": risk_result["fire_category"],
                "flood_category": risk_result["flood_category"],
                "pollution_category": risk_result["pollution_category"],
                "overall_category": risk_result["overall_category"],
            },
            "new_alerts": [
                {
                    "id": a.id,
                    "node_id": a.node_id,
                    "risk_type": a.risk_type,
                    "severity": a.severity,
                    "risk_score": a.risk_score,
                    "message": a.message,
                    "timestamp": a.timestamp.isoformat(),
                    "acknowledged": a.acknowledged
                }
                for a in created_alerts
            ]
        }
        await ws_manager.broadcast(ws_payload)

        return {
            "status": "success",
            "message": "Sensor reading ingested and processed successfully",
            "node_id": payload.node_id,
            "risk": risk_result,
            "alerts_generated": len(created_alerts)
        }

    @staticmethod
    def get_latest_readings_for_all_nodes(db: Session) -> List[Dict[str, Any]]:
        nodes = db.query(SensorNode).all()
        results = []
        for node in nodes:
            latest_reading = db.query(SensorReading).filter(
                SensorReading.node_id == node.node_id
            ).order_by(desc(SensorReading.timestamp)).first()
            
            latest_risk = db.query(RiskPrediction).filter(
                RiskPrediction.node_id == node.node_id
            ).order_by(desc(RiskPrediction.timestamp)).first()

            results.append({
                "node": node,
                "reading": latest_reading,
                "risk": latest_risk
            })
        return results

    @staticmethod
    def get_historical_readings(
        db: Session,
        node_id: str,
        limit: int = 100,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[SensorReading]:
        query = db.query(SensorReading).filter(SensorReading.node_id == node_id)
        if start_time:
            query = query.filter(SensorReading.timestamp >= start_time)
        if end_time:
            query = query.filter(SensorReading.timestamp <= end_time)
        
        return query.order_by(desc(SensorReading.timestamp)).limit(limit).all()

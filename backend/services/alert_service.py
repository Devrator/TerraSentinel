import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.models.alert import Alert
from backend.config import settings

logger = logging.getLogger("terrasentinal.alerts")

class AlertService:
    @staticmethod
    def process_node_risks(
        db: Session,
        node_id: str,
        fire_risk: float,
        flood_risk: float,
        pollution_risk: float,
        battery_percentage: float
    ) -> List[Alert]:
        """
        Evaluate risk scores and battery levels to generate alerts with cooldown and deduplication.
        """
        created_alerts = []
        now = datetime.now(timezone.utc)
        cooldown_threshold = now - timedelta(seconds=settings.ALERT_COOLDOWN_SECONDS)

        # Risk evaluations: (risk_type, score, threshold, messages)
        hazards = [
            (
                "FIRE",
                fire_risk,
                "Elevated wildfire environmental conditions detected. Extreme heat and dry atmosphere." if fire_risk > 75
                else "Moderate-to-high forest fire vulnerability detected."
            ),
            (
                "FLOOD",
                flood_risk,
                "Critical precipitation accumulation and storm pressure drop detected." if flood_risk > 75
                else "Heavy rainfall and elevated moisture levels detected."
            ),
            (
                "POLLUTION",
                pollution_risk,
                "Hazardous air quality index spike and atmospheric trapping detected." if pollution_risk > 75
                else "Elevated particulate/gas concentration detected."
            ),
        ]

        for risk_type, score, message in hazards:
            if score > 50.0:
                severity = "CRITICAL" if score > 75.0 else "HIGH"

                # Check for recent active alert within cooldown window
                recent_alert = db.query(Alert).filter(
                    Alert.node_id == node_id,
                    Alert.risk_type == risk_type,
                    Alert.timestamp >= cooldown_threshold
                ).order_by(desc(Alert.timestamp)).first()

                if not recent_alert or (recent_alert.severity != "CRITICAL" and severity == "CRITICAL"):
                    alert = Alert(
                        node_id=node_id,
                        risk_type=risk_type,
                        severity=severity,
                        risk_score=score,
                        message=message,
                        timestamp=now,
                        acknowledged=False
                    )
                    db.add(alert)
                    created_alerts.append(alert)
                    logger.warning(f"ALERT GENERATED [{severity}] {risk_type} on {node_id} (Score: {score})")

        # Battery check
        if battery_percentage < 15.0:
            recent_bat_alert = db.query(Alert).filter(
                Alert.node_id == node_id,
                Alert.risk_type == "BATTERY",
                Alert.timestamp >= cooldown_threshold
            ).first()

            if not recent_bat_alert:
                bat_alert = Alert(
                    node_id=node_id,
                    risk_type="BATTERY",
                    severity="HIGH" if battery_percentage < 10.0 else "MODERATE",
                    risk_score=float(100 - battery_percentage),
                    message=f"Low node battery warning: {battery_percentage:.1f}% remaining.",
                    timestamp=now,
                    acknowledged=False
                )
                db.add(bat_alert)
                created_alerts.append(bat_alert)

        if created_alerts:
            db.commit()
            for a in created_alerts:
                db.refresh(a)

        return created_alerts

    @staticmethod
    def get_alerts(
        db: Session,
        limit: int = 50,
        severity: Optional[str] = None,
        risk_type: Optional[str] = None,
        node_id: Optional[str] = None,
        acknowledged: Optional[bool] = None
    ) -> List[Alert]:
        query = db.query(Alert)
        if severity:
            query = query.filter(Alert.severity == severity.upper())
        if risk_type:
            query = query.filter(Alert.risk_type == risk_type.upper())
        if node_id:
            query = query.filter(Alert.node_id == node_id)
        if acknowledged is not None:
            query = query.filter(Alert.acknowledged == acknowledged)

        return query.order_by(desc(Alert.timestamp)).limit(limit).all()

    @staticmethod
    def acknowledge_alert(db: Session, alert_id: int) -> Optional[Alert]:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.acknowledged = True
            db.commit()
            db.refresh(alert)
        return alert

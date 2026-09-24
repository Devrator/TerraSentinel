import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.models.incident import Incident
from backend.services.audit_service import AuditService

logger = logging.getLogger("terrasentinal.incidents")

class IncidentService:
    @staticmethod
    def create_or_update_incident(
        db: Session,
        node_id: str,
        risk_type: str,
        severity: str,
        risk_score: float,
        evidence_snapshot: Optional[str] = None
    ) -> Incident:
        """
        Creates a new incident or updates an active open incident for the given node and risk type.
        Ensures alert deduplication & incident correlation.
        """
        now = datetime.now(timezone.utc)

        # Check for existing non-resolved incident for this node & risk_type
        existing = db.query(Incident).filter(
            Incident.origin_node_id == node_id,
            Incident.risk_type == risk_type,
            Incident.status.in_(["NEW", "ACKNOWLEDGED", "INVESTIGATING", "ESCALATED"])
        ).order_by(desc(Incident.detected_at)).first()

        if existing:
            # Update current risk and evidence
            prev_risk = existing.current_risk
            existing.current_risk = risk_score
            if severity == "CRITICAL" and existing.severity != "CRITICAL":
                existing.severity = "CRITICAL"
            if evidence_snapshot:
                existing.evidence_snapshot = evidence_snapshot
            db.commit()
            db.refresh(existing)
            return existing

        # Generate unique incident number: INC-2026-XXXX
        total_count = db.query(Incident).count() + 1
        inc_number = f"INC-2026-{total_count:04d}"

        title = f"Potential {risk_type.capitalize()} Hazard Incident"
        if risk_type == "FIRE":
            title = "Thermal Surge & Wildfire Vulnerability Incident"
        elif risk_type == "FLOOD":
            title = "Hydrological Surge & Inflow Incident"
        elif risk_type == "POLLUTION":
            title = "Atmospheric Inversion & Gas Dispersion Incident"
        elif risk_type == "SYSTEM":
            title = "Sensor Hardware Telemetry Anomaly"

        incident = Incident(
            incident_number=inc_number,
            title=title,
            origin_node_id=node_id,
            risk_type=risk_type,
            severity=severity,
            current_risk=risk_score,
            status="NEW",
            assigned_operator="Unassigned",
            detected_at=now,
            evidence_snapshot=evidence_snapshot,
            notes=f"Auto-generated incident from {risk_type} hazard detection (Score: {risk_score:.1f}%)."
        )

        db.add(incident)
        db.commit()
        db.refresh(incident)

        AuditService.log_event(
            db=db,
            action="INCIDENT_CREATED",
            entity="INCIDENT",
            entity_id=inc_number,
            actor="AI_EARLY_WARNING_ENGINE",
            new_state="NEW",
            details=f"Created {inc_number} for {node_id} ({risk_type} - {severity} - {risk_score:.1f}%)"
        )

        logger.info(f"Incident created: {inc_number} ({title} on {node_id})")
        return incident

    @staticmethod
    def get_incidents(
        db: Session,
        limit: int = 50,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        risk_type: Optional[str] = None,
        node_id: Optional[str] = None
    ) -> List[Incident]:
        query = db.query(Incident)
        if status:
            query = query.filter(Incident.status == status.upper())
        if severity:
            query = query.filter(Incident.severity == severity.upper())
        if risk_type:
            query = query.filter(Incident.risk_type == risk_type.upper())
        if node_id:
            query = query.filter(Incident.origin_node_id == node_id)
        return query.order_by(desc(Incident.detected_at)).limit(limit).all()

    @staticmethod
    def update_incident_status(
        db: Session,
        incident_id: int,
        status: str,
        actor: str = "OPERATOR",
        operator_name: Optional[str] = None,
        note: Optional[str] = None
    ) -> Optional[Incident]:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return None

        prev_status = incident.status
        incident.status = status.upper()

        if status.upper() == "RESOLVED":
            incident.resolved_at = datetime.now(timezone.utc)

        if operator_name:
            incident.assigned_operator = operator_name

        if note:
            timestamp_str = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
            new_note = f"\n[{timestamp_str}] {actor}: {note}"
            incident.notes = (incident.notes or "") + new_note

        db.commit()
        db.refresh(incident)

        AuditService.log_event(
            db=db,
            action="INCIDENT_STATUS_UPDATED",
            entity="INCIDENT",
            entity_id=incident.incident_number,
            actor=actor,
            previous_state=prev_status,
            new_state=status.upper(),
            details=note or f"Status transitioned to {status.upper()}"
        )

        return incident

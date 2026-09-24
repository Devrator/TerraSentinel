from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from backend.database import get_db
from backend.services.incident_service import IncidentService

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

class IncidentResponse(BaseModel):
    id: int
    incident_number: str
    title: str
    origin_node_id: str
    risk_type: str
    severity: str
    current_risk: float
    status: str
    assigned_operator: str
    detected_at: str
    resolved_at: Optional[str] = None
    evidence_snapshot: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentCreatePayload(BaseModel):
    origin_node_id: str
    risk_type: str
    severity: str
    current_risk: float
    title: Optional[str] = None
    notes: Optional[str] = None

class IncidentUpdatePayload(BaseModel):
    status: Optional[str] = None
    assigned_operator: Optional[str] = None
    note: Optional[str] = None
    actor: Optional[str] = "OPERATOR"

@router.get("", response_model=List[IncidentResponse], summary="List all operational incidents")
def list_incidents(
    limit: int = Query(default=50, ge=1, le=200),
    status: Optional[str] = Query(default=None),
    severity: Optional[str] = Query(default=None),
    risk_type: Optional[str] = Query(default=None),
    node_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    incidents = IncidentService.get_incidents(
        db=db,
        limit=limit,
        status=status,
        severity=severity,
        risk_type=risk_type,
        node_id=node_id
    )
    return [
        IncidentResponse(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            origin_node_id=inc.origin_node_id,
            risk_type=inc.risk_type,
            severity=inc.severity,
            current_risk=inc.current_risk,
            status=inc.status,
            assigned_operator=inc.assigned_operator,
            detected_at=inc.detected_at.isoformat() if inc.detected_at else "",
            resolved_at=inc.resolved_at.isoformat() if inc.resolved_at else None,
            evidence_snapshot=inc.evidence_snapshot,
            notes=inc.notes
        )
        for inc in incidents
    ]

@router.post("", response_model=IncidentResponse, summary="Create a new incident")
def create_incident(
    payload: IncidentCreatePayload,
    db: Session = Depends(get_db)
):
    inc = IncidentService.create_or_update_incident(
        db=db,
        node_id=payload.origin_node_id,
        risk_type=payload.risk_type,
        severity=payload.severity,
        risk_score=payload.current_risk,
        evidence_snapshot=payload.notes
    )
    return IncidentResponse(
        id=inc.id,
        incident_number=inc.incident_number,
        title=inc.title,
        origin_node_id=inc.origin_node_id,
        risk_type=inc.risk_type,
        severity=inc.severity,
        current_risk=inc.current_risk,
        status=inc.status,
        assigned_operator=inc.assigned_operator,
        detected_at=inc.detected_at.isoformat() if inc.detected_at else "",
        resolved_at=inc.resolved_at.isoformat() if inc.resolved_at else None,
        evidence_snapshot=inc.evidence_snapshot,
        notes=inc.notes
    )

@router.patch("/{incident_id}", response_model=IncidentResponse, summary="Update incident status, operator, or notes")
def update_incident(
    incident_id: int,
    payload: IncidentUpdatePayload,
    db: Session = Depends(get_db)
):
    inc = IncidentService.update_incident_status(
        db=db,
        incident_id=incident_id,
        status=payload.status or "INVESTIGATING",
        actor=payload.actor or "OPERATOR",
        operator_name=payload.assigned_operator,
        note=payload.note
    )
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse(
        id=inc.id,
        incident_number=inc.incident_number,
        title=inc.title,
        origin_node_id=inc.origin_node_id,
        risk_type=inc.risk_type,
        severity=inc.severity,
        current_risk=inc.current_risk,
        status=inc.status,
        assigned_operator=inc.assigned_operator,
        detected_at=inc.detected_at.isoformat() if inc.detected_at else "",
        resolved_at=inc.resolved_at.isoformat() if inc.resolved_at else None,
        evidence_snapshot=inc.evidence_snapshot,
        notes=inc.notes
    )

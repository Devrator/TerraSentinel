from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from backend.database import get_db
from backend.models.audit_log import AuditLog

router = APIRouter(prefix="/api/audit", tags=["Audit Log"])

class AuditLogResponse(BaseModel):
    id: int
    timestamp: str
    actor: str
    action: str
    entity: str
    entity_id: str
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    details: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogResponse], summary="Get operational audit trail")
def get_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    actor: Optional[str] = Query(default=None),
    entity: Optional[str] = Query(default=None),
    action: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if actor:
        query = query.filter(AuditLog.actor == actor)
    if entity:
        query = query.filter(AuditLog.entity == entity.upper())
    if action:
        query = query.filter(AuditLog.action == action.upper())

    logs = query.order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return [
        AuditLogResponse(
            id=log.id,
            timestamp=log.timestamp.isoformat() if log.timestamp else "",
            actor=log.actor,
            action=log.action,
            entity=log.entity,
            entity_id=log.entity_id,
            previous_state=log.previous_state,
            new_state=log.new_state,
            details=log.details
        )
        for log in logs
    ]

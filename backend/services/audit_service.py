import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from backend.models.audit_log import AuditLog

logger = logging.getLogger("terrasentinal.audit")

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        action: str,
        entity: str,
        entity_id: str,
        actor: str = "SYSTEM",
        previous_state: Optional[str] = None,
        new_state: Optional[str] = None,
        details: Optional[str] = None
    ) -> AuditLog:
        """
        Records an audit event in the database.
        """
        try:
            log_entry = AuditLog(
                timestamp=datetime.now(timezone.utc),
                actor=actor,
                action=action,
                entity=entity,
                entity_id=str(entity_id),
                previous_state=previous_state,
                new_state=new_state,
                details=details
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return log_entry
        except Exception as e:
            logger.error(f"Failed to record audit log: {e}")
            db.rollback()
            return None

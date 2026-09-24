from sqlalchemy import Column, Integer, String, DateTime, Text, Index
from datetime import datetime, timezone
from backend.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    actor = Column(String(100), default="SYSTEM", nullable=False) # SYSTEM, OPERATOR_1, ADMIN, etc.
    action = Column(String(100), nullable=False) # ALERT_TRIGGERED, INCIDENT_CREATED, ALERT_ACKNOWLEDGED, CONFIG_CHANGED, etc.
    entity = Column(String(50), nullable=False) # SENSOR_NODE, ALERT, INCIDENT, SIMULATION, CONFIG
    entity_id = Column(String(100), nullable=False)
    previous_state = Column(String(100), nullable=True)
    new_state = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_audit_timestamp_entity", "timestamp", "entity"),
    )

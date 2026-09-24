from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Index
from datetime import datetime, timezone
from backend.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. INC-2026-0041
    title = Column(String(150), nullable=False)
    origin_node_id = Column(String(50), nullable=False, index=True)
    risk_type = Column(String(50), nullable=False, index=True) # FIRE, FLOOD, POLLUTION, SYSTEM
    severity = Column(String(20), nullable=False, index=True) # CRITICAL, HIGH, MODERATE, LOW
    current_risk = Column(Float, nullable=False)
    status = Column(String(30), default="NEW", nullable=False, index=True) # NEW, ACKNOWLEDGED, INVESTIGATING, ESCALATED, RESOLVED
    assigned_operator = Column(String(100), default="Unassigned", nullable=False)
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)
    evidence_snapshot = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_incidents_node_status", "origin_node_id", "status"),
    )

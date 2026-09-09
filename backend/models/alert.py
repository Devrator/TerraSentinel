from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Index
from datetime import datetime, timezone
from backend.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String(50), nullable=False, index=True)
    risk_type = Column(String(50), nullable=False) # FIRE, FLOOD, POLLUTION, SYSTEM
    severity = Column(String(20), nullable=False, index=True) # LOW, MODERATE, HIGH, CRITICAL
    risk_score = Column(Float, nullable=False)
    message = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    acknowledged = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        Index("idx_alerts_node_timestamp_severity", "node_id", "timestamp", "severity"),
    )

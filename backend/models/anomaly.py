from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Index
from datetime import datetime, timezone
from backend.database import Base

class AnomalyEvent(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String(50), nullable=False, index=True)
    parameter = Column(String(50), nullable=False) # temperature, humidity, pressure, rain_value, air_quality
    previous_value = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    change_pct = Column(Float, nullable=False)
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True) # CRITICAL, HIGH, MODERATE, LOW
    anomaly_type = Column(String(50), nullable=False) # SPIKE, FLATLINE, OUT_OF_BOUNDS, RATE_OF_CHANGE
    description = Column(String(255), nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        Index("idx_anomalies_node_time", "node_id", "detected_at"),
    )

from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from backend.database import Base

class SensorNode(Base):
    __tablename__ = "sensor_nodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(20), default="OFFLINE", nullable=False) # ONLINE / OFFLINE
    battery_percentage = Column(Float, default=100.0, nullable=False)
    last_seen = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from datetime import datetime, timezone
from backend.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.node_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    rain_value = Column(Float, nullable=False)
    air_quality = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    battery_percentage = Column(Float, nullable=False)

    __table_args__ = (
        Index("idx_sensor_readings_node_timestamp", "node_id", "timestamp"),
    )

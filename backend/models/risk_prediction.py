from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from datetime import datetime, timezone
from backend.database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    fire_risk = Column(Float, nullable=False) # 0 to 100
    flood_risk = Column(Float, nullable=False) # 0 to 100
    pollution_risk = Column(Float, nullable=False) # 0 to 100
    overall_risk = Column(Float, nullable=False) # 0 to 100

    __table_args__ = (
        Index("idx_risk_predictions_node_timestamp", "node_id", "timestamp"),
    )

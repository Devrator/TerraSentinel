from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from backend.database import Base

class PublicAlertSubscription(Base):
    __tablename__ = "public_alert_subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone_number = Column(String(30), unique=True, index=True, nullable=False)
    citizen_name = Column(String(100), nullable=True, default="Citizen")
    area_sector = Column(String(100), nullable=False, default="ALL")
    preferred_alert_types = Column(String(100), nullable=False, default="ALL") # ALL, FIRE, FLOOD, POLLUTION
    is_verified = Column(Boolean, default=True, nullable=False)
    verification_otp = Column(String(10), nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False) # ACTIVE, PAUSED, UNSUBSCRIBED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    last_alert_sent_at = Column(DateTime, nullable=True)

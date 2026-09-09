from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SensorDataPayload(BaseModel):
    node_id: str = Field(..., description="Unique identifier of the node (e.g. ENV-001)")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity in percentage")
    pressure: float = Field(..., description="Atmospheric pressure in hPa")
    rain_value: float = Field(..., description="Rain sensor reading (0-1000 analog / mm/hr proxy)")
    air_quality: float = Field(..., description="Air quality / gas index (0-500)")
    latitude: float = Field(..., description="GPS Latitude")
    longitude: float = Field(..., description="GPS Longitude")
    battery_percentage: float = Field(..., ge=0, le=100, description="Battery percentage (0-100)")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="ISO timestamp of the reading")

    class Config:
        json_schema_extra = {
            "example": {
                "node_id": "ENV-001",
                "temperature": 32.4,
                "humidity": 58.2,
                "pressure": 1008.5,
                "rain_value": 420,
                "air_quality": 315,
                "latitude": 25.2138,
                "longitude": 75.8648,
                "battery_percentage": 87.0,
                "timestamp": "2026-09-08T21:30:00"
            }
        }

class SensorReadingResponse(BaseModel):
    id: int
    node_id: str
    timestamp: datetime
    temperature: float
    humidity: float
    pressure: float
    rain_value: float
    air_quality: float
    latitude: float
    longitude: float
    battery_percentage: float

    class Config:
        from_attributes = True

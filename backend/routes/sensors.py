from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.database import get_db
from backend.schemas.sensor import SensorDataPayload, SensorReadingResponse
from backend.services.sensor_service import SensorService

router = APIRouter(prefix="/api", tags=["Sensors"])

@router.post("/sensor-data", summary="Ingest Sensor Telemetry (ESP32 Contract)")
async def ingest_sensor_data(
    payload: SensorDataPayload,
    db: Session = Depends(get_db)
):
    """
    Primary ingestion endpoint.
    Called by future ESP32 firmware and mock sensor generator.
    Processes reading, updates node status, runs AI risk engine, generates alerts, and broadcasts to WebSocket.
    """
    try:
        result = await SensorService.ingest_sensor_data(db, payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest sensor telemetry: {str(e)}")

@router.get("/latest-readings", summary="Get latest readings for all nodes")
def get_latest_readings(db: Session = Depends(get_db)):
    """
    Returns the latest sensor reading and risk scores for every node in the fleet.
    """
    readings = SensorService.get_latest_readings_for_all_nodes(db)
    return [
        {
            "node_id": item["node"].node_id,
            "name": item["node"].name,
            "status": item["node"].status,
            "battery_percentage": item["node"].battery_percentage,
            "last_seen": item["node"].last_seen,
            "latitude": item["node"].latitude,
            "longitude": item["node"].longitude,
            "reading": item["reading"],
            "risk": item["risk"]
        }
        for item in readings
    ]

@router.get("/readings/{node_id}", response_model=List[SensorReadingResponse], summary="Get historical readings for a node")
def get_historical_readings(
    node_id: str,
    limit: int = Query(default=50, ge=1, le=500),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Returns time-series historical telemetry for charts and analytics.
    """
    readings = SensorService.get_historical_readings(
        db=db,
        node_id=node_id,
        limit=limit,
        start_time=start_time,
        end_time=end_time
    )
    return readings

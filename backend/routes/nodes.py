from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from backend.database import get_db
from backend.models.sensor_node import SensorNode
from backend.models.sensor_reading import SensorReading
from backend.models.risk_prediction import RiskPrediction
from backend.schemas.node import SensorNodeResponse
from backend.services.risk_service import RiskService

router = APIRouter(prefix="/api/nodes", tags=["Nodes"])

@router.get("", response_model=List[SensorNodeResponse], summary="List all sensor nodes")
def get_all_nodes(db: Session = Depends(get_db)):
    """
    Returns all registered sensor nodes along with their latest readings and risk assessments.
    """
    nodes = db.query(SensorNode).all()
    results = []
    for node in nodes:
        latest_reading = db.query(SensorReading).filter(
            SensorReading.node_id == node.node_id
        ).order_by(desc(SensorReading.timestamp)).first()

        latest_risk = RiskService.get_latest_risk_for_node(db, node.node_id)
        health = RiskService.get_node_health(db, node, latest_reading)

        results.append(
            SensorNodeResponse(
                id=node.id,
                node_id=node.node_id,
                name=node.name,
                latitude=node.latitude,
                longitude=node.longitude,
                status=node.status,
                battery_percentage=node.battery_percentage,
                last_seen=node.last_seen,
                created_at=node.created_at,
                latest_reading=latest_reading,
                latest_risk=latest_risk,
                sensor_health=health
            )
        )
    return results

@router.get("/{node_id}", response_model=SensorNodeResponse, summary="Get single node detail")
def get_node_by_id(node_id: str, db: Session = Depends(get_db)):
    """
    Returns full diagnostics, telemetry, and health metrics for a specific sensor node.
    """
    node = db.query(SensorNode).filter(SensorNode.node_id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")

    latest_reading = db.query(SensorReading).filter(
        SensorReading.node_id == node.node_id
    ).order_by(desc(SensorReading.timestamp)).first()

    latest_risk = RiskService.get_latest_risk_for_node(db, node.node_id)
    health = RiskService.get_node_health(db, node, latest_reading)

    return SensorNodeResponse(
        id=node.id,
        node_id=node.node_id,
        name=node.name,
        latitude=node.latitude,
        longitude=node.longitude,
        status=node.status,
        battery_percentage=node.battery_percentage,
        last_seen=node.last_seen,
        created_at=node.created_at,
        latest_reading=latest_reading,
        latest_risk=latest_risk,
        sensor_health=health
    )

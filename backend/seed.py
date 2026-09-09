import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.models.sensor_node import SensorNode

logger = logging.getLogger("terrasentinal.seed")

INITIAL_NODES = [
    {
        "node_id": "ENV-001",
        "name": "North Valley Ridge Station",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "status": "OFFLINE",
        "battery_percentage": 98.0,
    },
    {
        "node_id": "ENV-002",
        "name": "River Basin Wetlands Sentinel",
        "latitude": 25.1845,
        "longitude": 75.8392,
        "status": "OFFLINE",
        "battery_percentage": 94.5,
    },
    {
        "node_id": "ENV-003",
        "name": "Dense Pine Forest Canopy Node",
        "latitude": 25.2391,
        "longitude": 75.8924,
        "status": "OFFLINE",
        "battery_percentage": 87.0,
    },
    {
        "node_id": "ENV-004",
        "name": "Industrial Perimeter Air Watch",
        "latitude": 25.1610,
        "longitude": 75.8510,
        "status": "OFFLINE",
        "battery_percentage": 92.0,
    },
    {
        "node_id": "ENV-005",
        "name": "Southern Hills Watershed Node",
        "latitude": 25.1432,
        "longitude": 75.8789,
        "status": "OFFLINE",
        "battery_percentage": 89.0,
    },
]

def seed_initial_nodes(db: Session):
    """
    Ensure the 5 initial nodes are present in the database.
    """
    for node_data in INITIAL_NODES:
        existing = db.query(SensorNode).filter(SensorNode.node_id == node_data["node_id"]).first()
        if not existing:
            new_node = SensorNode(
                node_id=node_data["node_id"],
                name=node_data["name"],
                latitude=node_data["latitude"],
                longitude=node_data["longitude"],
                status=node_data["status"],
                battery_percentage=node_data["battery_percentage"],
                created_at=datetime.now(timezone.utc),
            )
            db.add(new_node)
            logger.info(f"Seeded initial node: {node_data['node_id']} ({node_data['name']})")
    db.commit()

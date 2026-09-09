from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.risk import RiskScoreResponse
from backend.services.risk_service import RiskService

router = APIRouter(prefix="/api/risk", tags=["Risk Engine"])

@router.get("/{node_id}", response_model=RiskScoreResponse, summary="Get current risk scores for node")
def get_risk_for_node(node_id: str, db: Session = Depends(get_db)):
    """
    Returns the latest Fire, Flood, Pollution, and Overall risk assessment for a specific node.
    """
    risk = RiskService.get_latest_risk_for_node(db, node_id)
    if not risk:
        raise HTTPException(status_code=404, detail=f"No risk predictions found for node '{node_id}'.")
    return risk

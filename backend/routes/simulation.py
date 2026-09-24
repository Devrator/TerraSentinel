from fastapi import APIRouter, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
from backend.services.simulation_service import SimulationService

router = APIRouter(prefix="/api/simulation", tags=["Simulation Lab"])

class SimulationStartPayload(BaseModel):
    scenario: str = "FIRE" # NORMAL, FIRE, FLOOD, POLLUTION, EXTREME_WEATHER, SENSOR_FAILURE
    target_node_id: str = "ENV-004"
    intensity: str = "HIGH" # LOW, MEDIUM, HIGH

@router.get("/status", summary="Get simulation engine status")
def get_simulation_status() -> Dict[str, Any]:
    return SimulationService.get_status()

@router.post("/start", summary="Start simulation scenario")
def start_simulation(payload: SimulationStartPayload) -> Dict[str, Any]:
    return SimulationService.start_simulation(
        scenario=payload.scenario,
        target_node_id=payload.target_node_id,
        intensity=payload.intensity
    )

@router.post("/pause", summary="Pause or resume current simulation")
def pause_simulation() -> Dict[str, Any]:
    return SimulationService.pause_simulation()

@router.post("/stop", summary="Stop simulation and reset to baseline")
def stop_simulation() -> Dict[str, Any]:
    return SimulationService.stop_simulation()

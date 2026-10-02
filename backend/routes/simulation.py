from fastapi import APIRouter, Body, Query
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from backend.services.simulation_service import SimulationService

router = APIRouter(prefix="/api/simulation", tags=["Simulation Lab"])

class SimulationStartPayload(BaseModel):
    scenario: str = Field(default="FIRE", description="FIRE, FLOOD, CHEMICAL_PLUME, EXTREME_WEATHER, SENSOR_FAILURE, NETWORK_OUTAGE, LOW_BATTERY, MULTI_NODE_CONSENSUS, NORMAL")
    target_node_id: str = Field(default="ENV-001", description="Target sensor node ID")
    intensity: str = Field(default="HIGH", description="LOW, MEDIUM, HIGH")
    location: Optional[str] = Field(default="Chambal Riparian Sector", description="Scenario geographical location")

class CustomScenarioPayload(BaseModel):
    location: str = Field(default="River Basin Corridor", description="Scenario location")
    hazard_type: str = Field(default="FIRE", description="FIRE, FLOOD, POLLUTION, STORM, SENSOR_FAULT, LOW_BATTERY")
    duration_seconds: int = Field(default=60, ge=10, le=600, description="Duration in seconds")
    target_node_id: str = Field(default="ENV-001", description="Primary node ID")
    affected_node_ids: List[str] = Field(default=["ENV-001", "ENV-002"], description="List of affected node IDs")
    temperature: float = Field(default=35.0, ge=-20.0, le=70.0, description="Temperature in °C")
    humidity: float = Field(default=30.0, ge=0.0, le=100.0, description="Relative humidity in %")
    air_quality: float = Field(default=250.0, ge=0.0, le=500.0, description="AQI / VOC level")
    pressure: float = Field(default=1010.0, ge=850.0, le=1150.0, description="Barometric pressure in hPa")
    rain_value: float = Field(default=0.0, ge=0.0, le=1000.0, description="Rain ADC / mm value")
    battery_percentage: float = Field(default=90.0, ge=1.0, le=100.0, description="Battery level %")
    intensity: str = Field(default="HIGH", description="LOW, MEDIUM, HIGH")
    node_failure: bool = Field(default=False, description="Simulate flatline / sensor hardware fault")
    network_failure: bool = Field(default=False, description="Simulate gateway offline outage with edge buffering")

@router.get("/status", summary="Get simulation engine status and live execution metrics")
async def get_simulation_status() -> Dict[str, Any]:
    return SimulationService.get_status()

@router.post("/start", summary="Start predefined simulation scenario")
async def start_simulation(payload: SimulationStartPayload) -> Dict[str, Any]:
    return SimulationService.start_simulation(
        scenario=payload.scenario,
        target_node_id=payload.target_node_id,
        intensity=payload.intensity,
        location=payload.location or "Chambal Riparian Sector"
    )

@router.post("/start-custom", summary="Start custom evaluator-defined scenario")
async def start_custom_simulation(payload: CustomScenarioPayload) -> Dict[str, Any]:
    return SimulationService.start_custom_simulation(payload.model_dump())

@router.post("/evaluation/start", summary="Start SIH Evaluator Guided Tour")
async def start_evaluation_mode(auto_advance: bool = Query(default=True)) -> Dict[str, Any]:
    return SimulationService.start_evaluation_mode(auto_advance=auto_advance)

@router.post("/evaluation/next-step", summary="Advance to next step in SIH Evaluator Guided Tour")
async def next_evaluation_step() -> Dict[str, Any]:
    return await SimulationService.next_evaluation_step()

@router.post("/pause", summary="Pause or resume current simulation")
async def pause_simulation() -> Dict[str, Any]:
    return SimulationService.pause_simulation()

@router.post("/stop", summary="Stop simulation and compile scenario results")
async def stop_simulation() -> Dict[str, Any]:
    return SimulationService.stop_simulation()

@router.post("/reset", summary="Reset all nodes to nominal baseline readings")
async def reset_simulation() -> Dict[str, Any]:
    return await SimulationService.reset_to_baseline()

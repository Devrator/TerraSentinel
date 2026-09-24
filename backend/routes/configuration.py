from fastapi import APIRouter, Body
from typing import Dict, Any
from pydantic import BaseModel
from backend.config import settings

router = APIRouter(prefix="/api/configuration", tags=["Configuration Center"])

# Dynamic runtime config store
CONFIG_STORE = {
    "risk_thresholds": {
        "fire_critical": 75,
        "fire_high": 50,
        "flood_critical": 75,
        "flood_high": 50,
        "pollution_critical": 75,
        "pollution_high": 50
    },
    "alert_rules": {
        "cooldown_seconds": settings.ALERT_COOLDOWN_SECONDS,
        "auto_escalate_minutes": 10,
        "deduplication_enabled": True
    },
    "sensor_settings": {
        "sampling_interval_seconds": 15,
        "heartbeat_timeout_seconds": settings.NODE_OFFLINE_THRESHOLD_SECONDS,
        "max_outlier_rejection": True
    },
    "simulation_settings": {
        "default_intensity": "HIGH",
        "step_interval_seconds": 3
    }
}

class ConfigUpdatePayload(BaseModel):
    risk_thresholds: Dict[str, int] = None
    alert_rules: Dict[str, Any] = None
    sensor_settings: Dict[str, Any] = None
    simulation_settings: Dict[str, Any] = None

@router.get("", summary="Get platform configuration parameters")
def get_configuration() -> Dict[str, Any]:
    return CONFIG_STORE

@router.patch("", summary="Update platform configuration parameters")
def update_configuration(payload: ConfigUpdatePayload) -> Dict[str, Any]:
    if payload.risk_thresholds:
        CONFIG_STORE["risk_thresholds"].update(payload.risk_thresholds)
    if payload.alert_rules:
        CONFIG_STORE["alert_rules"].update(payload.alert_rules)
    if payload.sensor_settings:
        CONFIG_STORE["sensor_settings"].update(payload.sensor_settings)
    if payload.simulation_settings:
        CONFIG_STORE["simulation_settings"].update(payload.simulation_settings)
    
    return {
        "status": "success",
        "message": "Configuration updated successfully",
        "configuration": CONFIG_STORE
    }

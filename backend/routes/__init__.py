from backend.routes.sensors import router as sensors_router
from backend.routes.nodes import router as nodes_router
from backend.routes.risks import router as risks_router
from backend.routes.alerts import router as alerts_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.websocket import router as websocket_router
from backend.routes.incidents import router as incidents_router
from backend.routes.anomalies import router as anomalies_router
from backend.routes.data_quality import router as data_quality_router
from backend.routes.situation_room import router as situation_room_router
from backend.routes.digital_twin import router as digital_twin_router
from backend.routes.response import router as response_router
from backend.routes.network_topology import router as network_topology_router
from backend.routes.audit import router as audit_router
from backend.routes.simulation import router as simulation_router
from backend.routes.system import router as system_router
from backend.routes.configuration import router as configuration_router
from backend.routes.analytics import router as analytics_router
from backend.routes.explainability import router as explainability_router

__all__ = [
    "sensors_router",
    "nodes_router",
    "risks_router",
    "alerts_router",
    "dashboard_router",
    "websocket_router",
    "incidents_router",
    "anomalies_router",
    "data_quality_router",
    "situation_room_router",
    "digital_twin_router",
    "response_router",
    "network_topology_router",
    "audit_router",
    "simulation_router",
    "system_router",
    "configuration_router",
    "analytics_router",
    "explainability_router",
]

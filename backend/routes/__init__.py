from backend.routes.sensors import router as sensors_router
from backend.routes.nodes import router as nodes_router
from backend.routes.risks import router as risks_router
from backend.routes.alerts import router as alerts_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.websocket import router as websocket_router

__all__ = [
    "sensors_router",
    "nodes_router",
    "risks_router",
    "alerts_router",
    "dashboard_router",
    "websocket_router",
]

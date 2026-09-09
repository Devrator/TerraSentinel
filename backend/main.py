import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.seed import seed_initial_nodes
from backend.models.sensor_node import SensorNode
from backend.services.websocket_manager import ws_manager
from backend.routes import (
    sensors_router,
    nodes_router,
    risks_router,
    alerts_router,
    dashboard_router,
    websocket_router,
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("terrasentinal.main")

async def monitor_node_liveness():
    """
    Background worker that continuously evaluates node online/offline states based on last_seen.
    """
    while True:
        try:
            await asyncio.sleep(10)
            db = SessionLocal()
            try:
                now = datetime.now(timezone.utc)
                threshold = now - timedelta(seconds=settings.NODE_OFFLINE_THRESHOLD_SECONDS)
                nodes = db.query(SensorNode).all()
                status_changed = False
                for node in nodes:
                    if node.last_seen:
                        last_seen = node.last_seen
                        if last_seen.tzinfo is None:
                            last_seen = last_seen.replace(tzinfo=timezone.utc)
                        new_status = "ONLINE" if last_seen >= threshold else "OFFLINE"
                    else:
                        new_status = "OFFLINE"

                    if node.status != new_status:
                        node.status = new_status
                        status_changed = True
                        logger.info(f"Node {node.node_id} status transitioned to {new_status}")

                if status_changed:
                    db.commit()
                    # Notify dashboard
                    await ws_manager.broadcast({
                        "type": "NODE_STATUS_UPDATE",
                        "nodes": [
                            {
                                "node_id": n.node_id,
                                "status": n.status,
                                "last_seen": n.last_seen.isoformat() if n.last_seen else None
                            }
                            for n in nodes
                        ]
                    })
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in node liveness monitor: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database schema
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed initial 5 nodes
    logger.info("Checking & seeding initial sensor nodes (ENV-001 - ENV-005)...")
    db = SessionLocal()
    try:
        seed_initial_nodes(db)
    finally:
        db.close()
    
    # 3. Start node liveness monitor
    monitor_task = asyncio.create_task(monitor_node_liveness())
    logger.info("Node liveness background monitor started.")
    
    yield
    
    monitor_task.cancel()
    try:
        await monitor_task
    except asyncio.CancelledError:
        pass
    logger.info("Shutdown completed.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-Time Environmental Intelligence & Early Warning System (SIH26178)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(sensors_router)
app.include_router(nodes_router)
app.include_router(risks_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)
app.include_router(websocket_router)

@app.get("/", tags=["Health"])
def root_status():
    return {
        "project": settings.PROJECT_NAME,
        "problem_statement": settings.SIH_PROBLEM_STATEMENT,
        "status": "OPERATIONAL",
        "api_docs": "/docs",
        "websocket": "/ws/dashboard"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

import asyncio
import logging
import random
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from backend.database import SessionLocal
from backend.services.sensor_service import SensorService
from backend.schemas.sensor import SensorDataPayload
from backend.services.websocket_manager import ws_manager

logger = logging.getLogger("terrasentinal.simulation")

class SimulationService:
    _instance = None
    _task: Optional[asyncio.Task] = None
    _is_running: bool = False
    _is_paused: bool = False
    _scenario: str = "NORMAL"
    _target_node_id: str = "ENV-004"
    _intensity: str = "HIGH" # LOW, MEDIUM, HIGH
    _step_index: int = 0
    _timeline_events: List[Dict[str, Any]] = []

    @classmethod
    def get_status(cls) -> Dict[str, Any]:
        return {
            "is_running": cls._is_running,
            "is_paused": cls._is_paused,
            "scenario": cls._scenario,
            "target_node_id": cls._target_node_id,
            "intensity": cls._intensity,
            "step_index": cls._step_index,
            "timeline_events": cls._timeline_events[-15:]
        }

    @classmethod
    def start_simulation(
        cls,
        scenario: str = "FIRE",
        target_node_id: str = "ENV-004",
        intensity: str = "HIGH"
    ) -> Dict[str, Any]:
        cls._scenario = scenario.upper()
        cls._target_node_id = target_node_id
        cls._intensity = intensity.upper()
        cls._is_paused = False
        cls._step_index = 0
        cls._timeline_events = [
            {
                "time": "T+00s",
                "message": f"Simulation started: Scenario [{cls._scenario}] targeting {cls._target_node_id}",
                "level": "INFO"
            }
        ]

        if cls._task and not cls._task.done():
            cls._task.cancel()

        cls._is_running = True
        cls._task = asyncio.create_task(cls._run_simulation_loop())
        logger.info(f"Simulation engine started: Scenario {cls._scenario} on {cls._target_node_id}")
        return cls.get_status()

    @classmethod
    def pause_simulation(cls) -> Dict[str, Any]:
        cls._is_paused = not cls._is_paused
        status_text = "PAUSED" if cls._is_paused else "RESUMED"
        cls._timeline_events.append({
            "time": f"T+{cls._step_index * 3}s",
            "message": f"Simulation {status_text}",
            "level": "INFO"
        })
        return cls.get_status()

    @classmethod
    def stop_simulation(cls) -> Dict[str, Any]:
        cls._is_running = False
        cls._is_paused = False
        if cls._task and not cls._task.done():
            cls._task.cancel()
        cls._timeline_events.append({
            "time": f"T+{cls._step_index * 3}s",
            "message": "Simulation stopped. Returning to baseline normal telemetry.",
            "level": "WARNING"
        })
        logger.info("Simulation engine stopped.")
        return cls.get_status()

    @classmethod
    async def _run_simulation_loop(cls):
        """
        Runs step-by-step environmental scenario progression and injects telemetry
        through the identical SensorService ingestion API.
        """
        try:
            # Baseline parameters
            temp = 24.5
            hum = 55.0
            pres = 1013.25
            rain = 0.0
            aqi = 45.0
            lat = 28.6139
            lon = 77.2090

            while cls._is_running:
                if cls._is_paused:
                    await asyncio.sleep(1)
                    continue

                cls._step_index += 1
                t_str = f"T+{cls._step_index * 3}s"

                # Progress scenario
                if cls._scenario == "FIRE":
                    # Progression: Normal -> Temp rising -> Humidity dropping -> Smoke -> High Fire Alert
                    temp = min(46.8, 25.0 + cls._step_index * 1.8 + random.uniform(-0.3, 0.4))
                    hum = max(18.0, 55.0 - cls._step_index * 2.8 + random.uniform(-0.5, 0.5))
                    aqi = min(360.0, 45.0 + cls._step_index * 18.5 + random.uniform(-2, 3))
                    pres = 1011.0 + random.uniform(-0.2, 0.2)
                    rain = 0.0

                    if cls._step_index == 2:
                        cls._timeline_events.append({"time": t_str, "message": "Thermal rise detected (+4.2°C)", "level": "INFO"})
                    elif cls._step_index == 4:
                        cls._timeline_events.append({"time": t_str, "message": "Atmospheric humidity plummeted below 35%", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Particulate AQI surge detected (>200)", "level": "WARNING"})
                    elif cls._step_index == 8:
                        cls._timeline_events.append({"time": t_str, "message": "AI Fire Risk reached CRITICAL (84%)", "level": "CRITICAL"})

                elif cls._scenario == "FLOOD":
                    rain = min(850.0, cls._step_index * 65.0 + random.uniform(-10, 15))
                    hum = min(98.0, 60.0 + cls._step_index * 3.5)
                    pres = max(984.0, 1013.0 - cls._step_index * 2.5)
                    temp = max(18.0, 24.0 - cls._step_index * 0.5)
                    aqi = 35.0

                    if cls._step_index == 3:
                        cls._timeline_events.append({"time": t_str, "message": "Precipitation accumulation rate accelerating", "level": "WARNING"})
                    elif cls._step_index == 7:
                        cls._timeline_events.append({"time": t_str, "message": "Barometric depression & high inflow threshold reached", "level": "CRITICAL"})

                elif cls._scenario == "POLLUTION":
                    aqi = min(420.0, 45.0 + cls._step_index * 25.0 + random.uniform(-3, 5))
                    temp = 19.5
                    hum = 82.0 # Inversion condition
                    rain = 0.0

                    if cls._step_index == 3:
                        cls._timeline_events.append({"time": t_str, "message": "Gas/VOC spike detected. Thermal inversion active.", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Severe particulate pollution alert generated", "level": "CRITICAL"})

                elif cls._scenario == "EXTREME_WEATHER":
                    temp = 42.0 + random.uniform(-1, 2)
                    hum = 90.0 + random.uniform(-3, 3)
                    pres = 978.0 + random.uniform(-2, 2)
                    rain = 700.0 + random.uniform(-20, 20)
                    aqi = 180.0

                elif cls._scenario == "SENSOR_FAILURE":
                    temp = -999.0 # Out of bounds
                    hum = 150.0
                    pres = 400.0
                    rain = 0.0
                    aqi = 0.0
                    cls._timeline_events.append({"time": t_str, "message": "Malformed/Hardware fault telemetry received", "level": "CRITICAL"})

                else: # NORMAL
                    temp = 24.0 + random.uniform(-0.5, 0.5)
                    hum = 52.0 + random.uniform(-1, 1)
                    pres = 1013.25 + random.uniform(-0.3, 0.3)
                    rain = 0.0
                    aqi = 42.0 + random.uniform(-2, 2)

                # Send through ingestion
                payload = SensorDataPayload(
                    node_id=cls._target_node_id,
                    temperature=round(temp, 1),
                    humidity=round(hum, 1),
                    pressure=round(pres, 1),
                    rain_value=round(rain, 1),
                    air_quality=round(aqi, 1),
                    latitude=lat,
                    longitude=lon,
                    battery_percentage=88.0,
                    timestamp=datetime.now(timezone.utc)
                )

                db = SessionLocal()
                try:
                    await SensorService.ingest_sensor_data(db, payload)
                finally:
                    db.close()

                # Broadcast simulation status update
                await ws_manager.broadcast({
                    "type": "SIMULATION_STATUS",
                    "simulation": cls.get_status()
                })

                await asyncio.sleep(3)

        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error during simulation loop: {e}", exc_info=True)
        finally:
            cls._is_running = False

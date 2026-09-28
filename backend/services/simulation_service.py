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
    _target_node_id: str = "ENV-001"
    _intensity: str = "HIGH"  # LOW, MEDIUM, HIGH
    _step_index: int = 0
    _offline_buffer: List[SensorDataPayload] = []
    _is_offline_mode: bool = False
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
            "is_offline_mode": cls._is_offline_mode,
            "buffered_readings_count": len(cls._offline_buffer),
            "timeline_events": cls._timeline_events[-20:]
        }

    @classmethod
    def start_simulation(
        cls,
        scenario: str = "FIRE",
        target_node_id: str = "ENV-001",
        intensity: str = "HIGH"
    ) -> Dict[str, Any]:
        cls._scenario = scenario.upper()
        cls._target_node_id = target_node_id
        cls._intensity = intensity.upper()
        cls._is_paused = False
        cls._step_index = 0
        cls._offline_buffer = []
        cls._is_offline_mode = (cls._scenario == "NETWORK_OUTAGE")
        cls._timeline_events = [
            {
                "time": "T+00s",
                "message": f"Simulation Testbed Initialized: Scenario [{cls._scenario}] targeting sector around {cls._target_node_id}",
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
        cls._is_offline_mode = False
        if cls._task and not cls._task.done():
            cls._task.cancel()
        cls._timeline_events.append({
            "time": f"T+{cls._step_index * 3}s",
            "message": "Simulation stopped. Resetting cluster telemetry to nominal baseline.",
            "level": "WARNING"
        })
        logger.info("Simulation engine stopped.")
        return cls.get_status()

    @classmethod
    async def _run_simulation_loop(cls):
        """
        Runs step-by-step environmental scenario progression across virtual cluster nodes.
        Injects telemetry through the identical SensorService ingestion API.
        """
        try:
            # Cluster node coordinates (Kota / Chambal Riparian Corridor)
            node_coords = {
                "ENV-001": (25.2138, 75.8648),
                "ENV-002": (25.2312, 75.8790),
                "ENV-003": (25.1985, 75.8450),
                "ENV-004": (25.2450, 75.8920),
                "ENV-005": (25.1820, 75.8310),
            }

            while cls._is_running:
                if cls._is_paused:
                    await asyncio.sleep(1)
                    continue

                cls._step_index += 1
                t_str = f"T+{cls._step_index * 3:02d}s"

                # -------------------------------------------------------------
                # 1. WILDFIRE & FOREST CANOPY THERMAL SURGE
                # -------------------------------------------------------------
                if cls._scenario == "FIRE":
                    primary_temp = min(54.2, 28.0 + cls._step_index * 2.2 + random.uniform(-0.2, 0.4))
                    primary_hum = max(14.0, 50.0 - cls._step_index * 3.2 + random.uniform(-0.4, 0.4))
                    primary_aqi = min(380.0, 50.0 + cls._step_index * 24.0 + random.uniform(-2, 4))

                    if cls._step_index == 2:
                        cls._timeline_events.append({"time": t_str, "message": "Edge Check: Local Thermal Spike (+4.5°C) on ENV-001", "level": "INFO"})
                    elif cls._step_index == 4:
                        cls._timeline_events.append({"time": t_str, "message": "Adjacent node ENV-002 corroborates desiccation (<25% RH)", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Multi-Node Spatial Consensus: 3/4 peer nodes agree on High Wildfire Hazard (Consensus: 75%)", "level": "WARNING"})
                    elif cls._step_index == 8:
                        cls._timeline_events.append({"time": t_str, "message": "Regional Hazard Alert: CRITICAL WILDFIRE CLUSTER (88% Risk, 92% Confidence)", "level": "CRITICAL"})

                    cluster_payloads = [
                        SensorDataPayload(
                            node_id="ENV-001",
                            temperature=round(primary_temp, 1),
                            humidity=round(primary_hum, 1),
                            pressure=1010.5,
                            rain_value=0.0,
                            air_quality=round(primary_aqi, 1),
                            latitude=node_coords["ENV-001"][0],
                            longitude=node_coords["ENV-001"][1],
                            battery_percentage=91.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                        SensorDataPayload(
                            node_id="ENV-002",
                            temperature=round(primary_temp - 2.1 + random.uniform(-0.3, 0.3), 1),
                            humidity=round(primary_hum + 3.0, 1),
                            pressure=1011.0,
                            rain_value=0.0,
                            air_quality=round(primary_aqi * 0.85, 1),
                            latitude=node_coords["ENV-002"][0],
                            longitude=node_coords["ENV-002"][1],
                            battery_percentage=88.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                        SensorDataPayload(
                            node_id="ENV-004",
                            temperature=round(primary_temp - 4.5, 1),
                            humidity=round(primary_hum + 6.0, 1),
                            pressure=1011.5,
                            rain_value=0.0,
                            air_quality=round(primary_aqi * 0.65, 1),
                            latitude=node_coords["ENV-004"][0],
                            longitude=node_coords["ENV-004"][1],
                            battery_percentage=94.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                    ]
                    db = SessionLocal()
                    try:
                        for p in cluster_payloads:
                            await SensorService.ingest_sensor_data(db, p)
                    finally:
                        db.close()

                # -------------------------------------------------------------
                # 2. RIVER BASIN CLOUDBURST & FLASH FLOOD
                # -------------------------------------------------------------
                elif cls._scenario == "FLOOD":
                    rain = min(890.0, cls._step_index * 80.0 + random.uniform(-5, 15))
                    hum = min(98.0, 58.0 + cls._step_index * 4.2)
                    pres = max(980.0, 1013.0 - cls._step_index * 3.2)
                    temp = max(18.5, 26.0 - cls._step_index * 0.8)

                    if cls._step_index == 3:
                        cls._timeline_events.append({"time": t_str, "message": "Precipitation Inflow Spike (>480 ADC) on ENV-001 & ENV-003", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Multi-Node Flood Consensus: 3/4 Nodes confirm riparian runoff risk (86%)", "level": "CRITICAL"})

                    cluster_payloads = [
                        SensorDataPayload(
                            node_id="ENV-001",
                            temperature=round(temp, 1),
                            humidity=round(hum, 1),
                            pressure=round(pres, 1),
                            rain_value=round(rain, 1),
                            air_quality=38.0,
                            latitude=node_coords["ENV-001"][0],
                            longitude=node_coords["ENV-001"][1],
                            battery_percentage=85.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                        SensorDataPayload(
                            node_id="ENV-003",
                            temperature=round(temp - 0.5, 1),
                            humidity=round(hum - 2.0, 1),
                            pressure=round(pres + 0.8, 1),
                            rain_value=round(rain * 0.92, 1),
                            air_quality=35.0,
                            latitude=node_coords["ENV-003"][0],
                            longitude=node_coords["ENV-003"][1],
                            battery_percentage=89.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                    ]
                    db = SessionLocal()
                    try:
                        for p in cluster_payloads:
                            await SensorService.ingest_sensor_data(db, p)
                    finally:
                        db.close()

                # -------------------------------------------------------------
                # 3. INDUSTRIAL CHEMICAL PLUME / TOXIC INVERSION (GIDC Corridor)
                # -------------------------------------------------------------
                elif cls._scenario in ["CHEMICAL_PLUME", "POLLUTION"]:
                    aqi = min(460.0, 60.0 + cls._step_index * 38.0 + random.uniform(-3, 6))
                    pres = min(1022.0, 1012.0 + cls._step_index * 1.0)  # Inversion cap
                    hum = min(88.0, 48.0 + cls._step_index * 3.5)

                    if cls._step_index == 2:
                        cls._timeline_events.append({"time": t_str, "message": "Gas/VOC Concentration Spike: MQ-135 reading >280 on ENV-001", "level": "WARNING"})
                    elif cls._step_index == 5:
                        cls._timeline_events.append({"time": t_str, "message": "Atmospheric Inversion Trap: Chemical plume dispersing toward downwind node ENV-002", "level": "WARNING"})
                    elif cls._step_index == 7:
                        cls._timeline_events.append({"time": t_str, "message": "Toxic Dispersion Alert: Hazardous Gas Threat (AQI: 412, Severity: CRITICAL)", "level": "CRITICAL"})

                    cluster_payloads = [
                        SensorDataPayload(
                            node_id="ENV-001",
                            temperature=26.5,
                            humidity=round(hum, 1),
                            pressure=round(pres, 1),
                            rain_value=0.0,
                            air_quality=round(aqi, 1),
                            latitude=node_coords["ENV-001"][0],
                            longitude=node_coords["ENV-001"][1],
                            battery_percentage=92.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                        SensorDataPayload(
                            node_id="ENV-002",
                            temperature=26.2,
                            humidity=round(hum - 2.0, 1),
                            pressure=round(pres, 1),
                            rain_value=0.0,
                            air_quality=round(aqi * 0.82, 1),
                            latitude=node_coords["ENV-002"][0],
                            longitude=node_coords["ENV-002"][1],
                            battery_percentage=90.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                    ]
                    db = SessionLocal()
                    try:
                        for p in cluster_payloads:
                            await SensorService.ingest_sensor_data(db, p)
                    finally:
                        db.close()

                # -------------------------------------------------------------
                # 4. EXTREME WEATHER & MONSOON CYCLONIC DEPRESSION
                # -------------------------------------------------------------
                elif cls._scenario == "EXTREME_WEATHER":
                    pres = max(974.0, 1012.0 - cls._step_index * 4.5)
                    rain = min(750.0, cls._step_index * 65.0)
                    hum = min(96.0, 60.0 + cls._step_index * 3.8)
                    temp = max(17.0, 27.0 - cls._step_index * 1.1)

                    if cls._step_index == 3:
                        cls._timeline_events.append({"time": t_str, "message": "Severe Barometric Pressure Drop (<995 hPa) with High Wind Shear", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Compound Risk Alert: Extreme Monsoon Storm Depression (Flood + Wind Hazard: 82%)", "level": "CRITICAL"})

                    db = SessionLocal()
                    try:
                        await SensorService.ingest_sensor_data(db, SensorDataPayload(
                            node_id="ENV-001",
                            temperature=round(temp, 1),
                            humidity=round(hum, 1),
                            pressure=round(pres, 1),
                            rain_value=round(rain, 1),
                            air_quality=42.0,
                            latitude=node_coords["ENV-001"][0],
                            longitude=node_coords["ENV-001"][1],
                            battery_percentage=84.0,
                            timestamp=datetime.now(timezone.utc)
                        ))
                    finally:
                        db.close()

                # -------------------------------------------------------------
                # 5. SENSOR FAILURE / FLATLINE DEGRADATION
                # -------------------------------------------------------------
                elif cls._scenario == "SENSOR_FAILURE":
                    if cls._step_index == 1:
                        cls._timeline_events.append({"time": t_str, "message": "Injected frozen sensor output (flatline) on ENV-003 Air Quality", "level": "INFO"})
                    elif cls._step_index == 4:
                        cls._timeline_events.append({"time": t_str, "message": "Anomaly Detector: FLATLINE detected on ENV-003. Sensor health -> DEGRADED", "level": "WARNING"})
                    elif cls._step_index == 7:
                        cls._timeline_events.append({"time": t_str, "message": "Data Quality score penalized. Composite confidence degraded to 64%", "level": "WARNING"})

                    db = SessionLocal()
                    try:
                        await SensorService.ingest_sensor_data(db, SensorDataPayload(
                            node_id="ENV-003",
                            temperature=26.0,
                            humidity=50.0,
                            pressure=1013.25,
                            rain_value=0.0,
                            air_quality=115.0,  # Frozen constant
                            latitude=node_coords["ENV-003"][0],
                            longitude=node_coords["ENV-003"][1],
                            battery_percentage=90.0,
                            timestamp=datetime.now(timezone.utc)
                        ))
                    finally:
                        db.close()

                # -------------------------------------------------------------
                # 6. OFFLINE RESILIENCE / NETWORK OUTAGE
                # -------------------------------------------------------------
                elif cls._scenario == "NETWORK_OUTAGE":
                    sim_reading = SensorDataPayload(
                        node_id="ENV-001",
                        temperature=round(28.0 + cls._step_index * 0.4, 1),
                        humidity=round(45.0 - cls._step_index * 0.5, 1),
                        pressure=1012.0,
                        rain_value=0.0,
                        air_quality=round(65.0 + cls._step_index * 3.0, 1),
                        latitude=node_coords["ENV-001"][0],
                        longitude=node_coords["ENV-001"][1],
                        battery_percentage=90.0,
                        timestamp=datetime.now(timezone.utc)
                    )
                    cls._offline_buffer.append(sim_reading)

                    if cls._step_index == 1:
                        cls._timeline_events.append({"time": t_str, "message": "Cloud uplink severed. EDGE MONITORING ACTIVE. Local SPI flash buffering engaged.", "level": "WARNING"})
                    elif cls._step_index == 5:
                        cls._timeline_events.append({"time": t_str, "message": f"Local edge buffer: {len(cls._offline_buffer)} readings queued (0 data loss)", "level": "INFO"})
                    elif cls._step_index == 9:
                        cls._timeline_events.append({"time": t_str, "message": "Network connectivity restored! Replaying buffered telemetry batch...", "level": "INFO"})
                        db = SessionLocal()
                        try:
                            sync_res = await SensorService.ingest_batch_sensor_data(db, cls._offline_buffer)
                            cls._timeline_events.append({
                                "time": f"T+{cls._step_index * 3 + 1:02d}s",
                                "message": f"Synchronized {sync_res['synced_count']} readings with 0 data loss. Timeline reconciled.",
                                "level": "INFO"
                            })
                            cls._offline_buffer = []
                            cls._is_offline_mode = False
                        finally:
                            db.close()

                # -------------------------------------------------------------
                # 7. NOMINAL BASELINE RESTORATION
                # -------------------------------------------------------------
                else:
                    db = SessionLocal()
                    try:
                        for nid, coords in node_coords.items():
                            await SensorService.ingest_sensor_data(db, SensorDataPayload(
                                node_id=nid,
                                temperature=round(24.5 + random.uniform(-0.4, 0.4), 1),
                                humidity=round(52.0 + random.uniform(-1, 1), 1),
                                pressure=round(1013.25 + random.uniform(-0.2, 0.2), 1),
                                rain_value=0.0,
                                air_quality=round(45.0 + random.uniform(-2, 2), 1),
                                latitude=coords[0],
                                longitude=coords[1],
                                battery_percentage=94.0,
                                timestamp=datetime.now(timezone.utc)
                            ))
                    finally:
                        db.close()

                # Broadcast simulation status update to WebSocket subscribers
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

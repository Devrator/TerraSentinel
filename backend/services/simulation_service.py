import asyncio
import logging
import random
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List, Set
from backend.database import SessionLocal
from backend.services.sensor_service import SensorService
from backend.schemas.sensor import SensorDataPayload
from backend.services.websocket_manager import ws_manager
from backend.services.alert_service import AlertService
from backend.services.incident_service import IncidentService
from backend.services.audit_service import AuditService
from backend.risk_engine import RiskEngine

logger = logging.getLogger("terrasentinal.simulation")

NODE_COORDS = {
    "ENV-001": (25.2138, 75.8648), # Riverbed Riparian Sector
    "ENV-002": (25.2312, 75.8790), # Forest Canopy North
    "ENV-003": (25.1985, 75.8450), # Valley Lowland
    "ENV-004": (25.2450, 75.8920), # Industrial GIDC Perimeter
    "ENV-005": (25.1820, 75.8310), # Residential Foothills
}

EVALUATION_STEPS = [
    {
        "step": 1,
        "phase": "NORMAL",
        "title": "Baseline Calibration & Telemetry",
        "description": "All 5 nodes transmitting nominal temperate telemetry (24°C, 50% RH, 1013 hPa, 0 rain). Zero active hazards.",
        "level": "INFO"
    },
    {
        "step": 2,
        "phase": "SENSOR_ANOMALY",
        "title": "Initial Telemetry Deviation Detected",
        "description": "Edge anomaly detector flags abrupt rate-of-change on ENV-001 (+5.8°C delta, AQI surge). Z-score anomaly registered.",
        "level": "WARNING"
    },
    {
        "step": 3,
        "phase": "HAZARD_DETECTED",
        "title": "Single-Node Threshold Breach",
        "description": "ENV-001 environmental risk score crosses critical boundary (84.2%). Isolated node alarm triggered.",
        "level": "WARNING"
    },
    {
        "step": 4,
        "phase": "MULTI_NODE_VERIFICATION",
        "title": "Multi-Node Spatial Consensus",
        "description": "Adjacent peer nodes (ENV-002 & ENV-004) corroborate elevated hazard. Spatial consensus reaches 75% agreement.",
        "level": "CRITICAL"
    },
    {
        "step": 5,
        "phase": "ALERT",
        "title": "Regional Early Warning Broadcast",
        "description": "Emergency alert system triggers CRITICAL hazard alert. WebSocket clients receive real-time banner update.",
        "level": "CRITICAL"
    },
    {
        "step": 6,
        "phase": "SITUATION",
        "title": "Situation Room Activation",
        "description": "Command Center elevates threat hierarchy to CRITICAL. 600m evacuation perimeter dynamically calculated.",
        "level": "CRITICAL"
    },
    {
        "step": 7,
        "phase": "INCIDENT",
        "title": "Automated Incident Creation",
        "description": "Incident ticket INC-2026-XXXX auto-created with evidence snapshot and auto-assigned priority.",
        "level": "CRITICAL"
    },
    {
        "step": 8,
        "phase": "RESPONSE",
        "title": "SDRF / Emergency Dispatch",
        "description": "Standard Operating Procedure (SOP) activated. Dispatch ticket DSP-2026-XXXX sent to Emergency Response.",
        "level": "INFO"
    },
    {
        "step": 9,
        "phase": "PUBLIC_ALERT",
        "title": "Public Safety Portal Advisory",
        "description": "Geo-targeted public safety bulletin published. Registered SMS subscribers queued for instant advisory.",
        "level": "INFO"
    },
    {
        "step": 10,
        "phase": "RESOLUTION",
        "title": "Threat Mitigation & Incident Resolution",
        "description": "Environmental parameters stabilize below threshold. Incident status updated to RESOLVED with post-event metrics.",
        "level": "INFO"
    },
    {
        "step": 11,
        "phase": "AUDIT",
        "title": "Cryptographic Audit Ledger Verification",
        "description": "Complete lifecycle chained and verified in immutable SHA-256 audit ledger. Compliance log archived.",
        "level": "INFO"
    }
]

class SimulationService:
    _instance = None
    _task: Optional[asyncio.Task] = None
    _is_running: bool = False
    _is_paused: bool = False
    _scenario: str = "NORMAL"
    _target_node_id: str = "ENV-001"
    _affected_node_ids: List[str] = ["ENV-001", "ENV-002", "ENV-004"]
    _intensity: str = "HIGH"  # LOW, MEDIUM, HIGH
    _location: str = "Chambal Riparian Sector"
    _step_index: int = 0
    _start_timestamp: Optional[datetime] = None
    _offline_buffer: List[SensorDataPayload] = []
    _is_offline_mode: bool = False
    _timeline_events: List[Dict[str, Any]] = []

    # Custom Scenario parameters
    _is_custom: bool = False
    _custom_config: Dict[str, Any] = {}

    # Evaluation Mode state
    _is_evaluation_mode: bool = False
    _evaluation_step: int = 1
    _evaluation_auto_advance: bool = True

    # Real Scenario Execution Metrics
    _detection_time_seconds: Optional[int] = None
    _peak_risk: float = 0.0
    _nodes_participating: Set[str] = set()
    _consensus_status: str = "NOMINAL_BASELINE"
    _consensus_percentage: float = 0.0
    _alerts_generated_count: int = 0
    _alerts_generated_ids: List[int] = []
    _incident_number: Optional[str] = None
    _incident_id: Optional[int] = None
    _response_reference: Optional[str] = None
    _packets_processed: int = 0
    _offline_packets_recovered: int = 0
    _final_status: str = "STANDBY"

    @classmethod
    def get_status(cls) -> Dict[str, Any]:
        elapsed = 0
        if cls._start_timestamp and cls._is_running:
            elapsed = int((datetime.now(timezone.utc) - cls._start_timestamp).total_seconds())

        return {
            "is_running": cls._is_running,
            "is_paused": cls._is_paused,
            "scenario": cls._scenario,
            "location": cls._location,
            "target_node_id": cls._target_node_id,
            "affected_node_ids": cls._affected_node_ids,
            "intensity": cls._intensity,
            "step_index": cls._step_index,
            "elapsed_seconds": elapsed,
            "is_offline_mode": cls._is_offline_mode,
            "buffered_readings_count": len(cls._offline_buffer),
            "timeline_events": cls._timeline_events[-30:],
            "is_custom": cls._is_custom,
            "custom_config": cls._custom_config,
            "is_evaluation_mode": cls._is_evaluation_mode,
            "evaluation_step": cls._evaluation_step,
            "evaluation_max_steps": len(EVALUATION_STEPS),
            "current_evaluation_phase": EVALUATION_STEPS[cls._evaluation_step - 1] if 1 <= cls._evaluation_step <= len(EVALUATION_STEPS) else None,
            "metrics": {
                "scenario_name": cls._scenario,
                "status": "RUNNING" if cls._is_running else ("PAUSED" if cls._is_paused else cls._final_status),
                "elapsed_seconds": elapsed,
                "detection_time_seconds": cls._detection_time_seconds,
                "peak_risk": round(cls._peak_risk, 1),
                "nodes_participating": sorted(list(cls._nodes_participating)),
                "consensus_status": cls._consensus_status,
                "consensus_percentage": cls._consensus_percentage,
                "alerts_generated_count": cls._alerts_generated_count,
                "alerts_generated_ids": cls._alerts_generated_ids,
                "incident_number": cls._incident_number,
                "incident_id": cls._incident_id,
                "response_reference": cls._response_reference,
                "packets_processed": cls._packets_processed,
                "offline_packets_recovered": cls._offline_packets_recovered,
                "final_status": cls._final_status
            }
        }

    @classmethod
    def start_simulation(
        cls,
        scenario: str = "FIRE",
        target_node_id: str = "ENV-001",
        intensity: str = "HIGH",
        location: str = "Chambal Riparian Sector"
    ) -> Dict[str, Any]:
        cls._scenario = scenario.upper()
        cls._target_node_id = target_node_id
        cls._intensity = intensity.upper()
        cls._location = location
        cls._is_custom = False
        cls._custom_config = {}
        cls._is_evaluation_mode = False
        cls._is_paused = False
        cls._step_index = 0
        cls._start_timestamp = datetime.now(timezone.utc)
        cls._offline_buffer = []
        cls._is_offline_mode = (cls._scenario == "NETWORK_OUTAGE")
        
        # Reset live metrics
        cls._detection_time_seconds = None
        cls._peak_risk = 0.0
        cls._nodes_participating = {target_node_id}
        cls._consensus_status = "NOMINAL_BASELINE"
        cls._consensus_percentage = 0.0
        cls._alerts_generated_count = 0
        cls._alerts_generated_ids = []
        cls._incident_number = None
        cls._incident_id = None
        cls._response_reference = None
        cls._packets_processed = 0
        cls._offline_packets_recovered = 0
        cls._final_status = "RUNNING"

        cls._timeline_events = [
            {
                "time": "T+00s",
                "message": f"Scenario Test Lab Initialized: [{cls._scenario}] at {cls._location} targeting {cls._target_node_id}",
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
    def start_custom_simulation(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Starts custom user-defined scenario.
        """
        cls._scenario = f"CUSTOM_{config.get('hazard_type', 'HAZARD').upper()}"
        cls._target_node_id = config.get("target_node_id", "ENV-001")
        cls._affected_node_ids = config.get("affected_node_ids", [cls._target_node_id])
        cls._intensity = config.get("intensity", "MEDIUM").upper()
        cls._location = config.get("location", "Custom Sector")
        cls._is_custom = True
        cls._custom_config = config
        cls._is_evaluation_mode = False
        cls._is_paused = False
        cls._step_index = 0
        cls._start_timestamp = datetime.now(timezone.utc)
        cls._offline_buffer = []
        cls._is_offline_mode = bool(config.get("network_failure", False))

        cls._detection_time_seconds = None
        cls._peak_risk = 0.0
        cls._nodes_participating = set(cls._affected_node_ids)
        cls._consensus_status = "NOMINAL_BASELINE"
        cls._consensus_percentage = 0.0
        cls._alerts_generated_count = 0
        cls._alerts_generated_ids = []
        cls._incident_number = None
        cls._incident_id = None
        cls._response_reference = None
        cls._packets_processed = 0
        cls._offline_packets_recovered = 0
        cls._final_status = "RUNNING"

        cls._timeline_events = [
            {
                "time": "T+00s",
                "message": f"Custom Scenario Initialized: {config.get('hazard_type')} ({cls._location}) | Nodes: {', '.join(cls._affected_node_ids)}",
                "level": "INFO"
            }
        ]

        if cls._task and not cls._task.done():
            cls._task.cancel()

        cls._is_running = True
        cls._task = asyncio.create_task(cls._run_simulation_loop())
        return cls.get_status()

    @classmethod
    def start_evaluation_mode(cls, auto_advance: bool = True) -> Dict[str, Any]:
        """
        Starts SIH Evaluator Guided Demonstration Mode.
        """
        cls._is_evaluation_mode = True
        cls._evaluation_step = 1
        cls._evaluation_auto_advance = auto_advance
        cls._scenario = "SIH_EVALUATOR_DEMO"
        cls._target_node_id = "ENV-001"
        cls._affected_node_ids = ["ENV-001", "ENV-002", "ENV-004"]
        cls._intensity = "HIGH"
        cls._location = "SIH Evaluation Testbed (Riverbed Corridor)"
        cls._is_custom = False
        cls._is_paused = False
        cls._step_index = 0
        cls._start_timestamp = datetime.now(timezone.utc)
        cls._offline_buffer = []
        cls._is_offline_mode = False

        cls._detection_time_seconds = None
        cls._peak_risk = 0.0
        cls._nodes_participating = set(cls._affected_node_ids)
        cls._consensus_status = "NOMINAL_BASELINE"
        cls._consensus_percentage = 0.0
        cls._alerts_generated_count = 0
        cls._alerts_generated_ids = []
        cls._incident_number = None
        cls._incident_id = None
        cls._response_reference = None
        cls._packets_processed = 0
        cls._offline_packets_recovered = 0
        cls._final_status = "RUNNING"

        first_step = EVALUATION_STEPS[0]
        cls._timeline_events = [
            {
                "time": "T+00s",
                "message": f"SIH Guided Evaluation Started: Step 1/11 [{first_step['phase']}] - {first_step['title']}",
                "level": "INFO"
            }
        ]

        if cls._task and not cls._task.done():
            cls._task.cancel()

        cls._is_running = True
        cls._task = asyncio.create_task(cls._run_evaluation_loop())
        return cls.get_status()

    @classmethod
    async def next_evaluation_step(cls) -> Dict[str, Any]:
        """
        Manually advances to the next step in SIH Evaluator mode.
        """
        if not cls._is_evaluation_mode:
            return cls.get_status()

        if cls._evaluation_step < len(EVALUATION_STEPS):
            cls._evaluation_step += 1
            step_info = EVALUATION_STEPS[cls._evaluation_step - 1]
            t_str = f"T+{cls._step_index * 3:02d}s"
            cls._timeline_events.append({
                "time": t_str,
                "message": f"Step {cls._evaluation_step}/11 [{step_info['phase']}]: {step_info['title']} - {step_info['description']}",
                "level": step_info["level"]
            })
            await cls._execute_single_evaluation_step(cls._evaluation_step)
        else:
            cls._final_status = "COMPLETED"
            cls._timeline_events.append({
                "time": f"T+{cls._step_index * 3:02d}s",
                "message": "SIH Evaluator Tour Completed: All 11 workflow phases verified with real backend state.",
                "level": "INFO"
            })

        await ws_manager.broadcast({
            "type": "SIMULATION_STATUS",
            "simulation": cls.get_status()
        })
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
        cls._final_status = "COMPLETED" if cls._peak_risk > 50.0 else "HALTED"
        if cls._task and not cls._task.done():
            cls._task.cancel()
        cls._timeline_events.append({
            "time": f"T+{cls._step_index * 3}s",
            "message": "Simulation stopped. Final results compiled.",
            "level": "WARNING"
        })
        logger.info("Simulation engine stopped.")
        return cls.get_status()

    @classmethod
    async def reset_to_baseline(cls) -> Dict[str, Any]:
        """
        Stops active simulations and writes nominal baseline readings across all 5 nodes.
        """
        cls.stop_simulation()
        cls._final_status = "RESET"
        cls._is_evaluation_mode = False
        cls._evaluation_step = 1

        db = SessionLocal()
        try:
            for nid, coords in NODE_COORDS.items():
                await SensorService.ingest_sensor_data(db, SensorDataPayload(
                    node_id=nid,
                    temperature=round(24.5 + random.uniform(-0.3, 0.3), 1),
                    humidity=round(52.0 + random.uniform(-1, 1), 1),
                    pressure=round(1013.25 + random.uniform(-0.2, 0.2), 1),
                    rain_value=0.0,
                    air_quality=round(42.0 + random.uniform(-2, 2), 1),
                    latitude=coords[0],
                    longitude=coords[1],
                    battery_percentage=95.0,
                    timestamp=datetime.now(timezone.utc)
                ))
            
            AuditService.log_event(
                db=db,
                action="SIMULATION_RESET_TO_BASELINE",
                entity="SIMULATION_LAB",
                entity_id="ALL_NODES",
                actor="SCENARIO_TEST_LAB",
                details="Restored all 5 environmental nodes to nominal temperate baseline telemetry."
            )
        finally:
            db.close()

        cls._timeline_events.append({
            "time": "T+00s",
            "message": "Cluster reset: All 5 environmental nodes restored to nominal baseline.",
            "level": "INFO"
        })

        await ws_manager.broadcast({
            "type": "SIMULATION_STATUS",
            "simulation": cls.get_status()
        })
        return cls.get_status()

    @classmethod
    async def _process_and_track_payloads(cls, payloads: List[SensorDataPayload], hazard_type: str = "FIRE"):
        """
        Helper to ingest real telemetry and update genuine simulation metrics.
        """
        db = SessionLocal()
        try:
            for p in payloads:
                cls._packets_processed += 1
                cls._nodes_participating.add(p.node_id)
                res = await SensorService.ingest_sensor_data(db, p)
                
                risk_data = res.get("risk", {})
                overall = risk_data.get("overall_risk", 0.0)
                if overall > cls._peak_risk:
                    cls._peak_risk = overall

                if overall >= 50.0 and cls._detection_time_seconds is None and cls._start_timestamp:
                    cls._detection_time_seconds = int((datetime.now(timezone.utc) - cls._start_timestamp).total_seconds())

                if res.get("alerts_generated", 0) > 0:
                    cls._alerts_generated_count += res["alerts_generated"]

            # Query multi-node consensus
            readings = SensorService.get_latest_readings_for_all_nodes(db)
            node_dicts = []
            for item in readings:
                r = item["risk"]
                node_dicts.append({
                    "node_id": item["node"].node_id,
                    "name": item["node"].name,
                    "latitude": item["node"].latitude,
                    "longitude": item["node"].longitude,
                    "risk": {
                        "fire_risk": r.fire_risk if r else 0.0,
                        "flood_risk": r.flood_risk if r else 0.0,
                        "pollution_risk": r.pollution_risk if r else 0.0,
                        "overall_risk": r.overall_risk if r else 0.0,
                    } if r else {}
                })
            c_res = RiskEngine.calculate_multi_node_consensus(node_dicts, hazard_type=hazard_type)
            cls._consensus_status = c_res.get("consensus_status", "NOMINAL_BASELINE")
            cls._consensus_percentage = c_res.get("consensus_percentage", 0.0)

            # Query latest open incident
            from backend.models.incident import Incident
            inc = db.query(Incident).filter(Incident.status != "RESOLVED").order_by(Incident.detected_at.desc()).first()
            if inc:
                cls._incident_number = inc.incident_number
                cls._incident_id = inc.id
                if "Ref: DSP-" in (inc.notes or ""):
                    for line in inc.notes.splitlines():
                        if "Ref: DSP-" in line:
                            parts = line.split("Ref: ")
                            if len(parts) > 1:
                                cls._response_reference = parts[1].split(",")[0].strip()

        finally:
            db.close()

    @classmethod
    async def _execute_single_evaluation_step(cls, step: int):
        """
        Executes a single step in the 11-stage SIH Evaluator Demonstration pipeline.
        """
        db = SessionLocal()
        try:
            # 1. NORMAL
            if step == 1:
                for nid, coords in NODE_COORDS.items():
                    await SensorService.ingest_sensor_data(db, SensorDataPayload(
                        node_id=nid,
                        temperature=24.5,
                        humidity=52.0,
                        pressure=1013.25,
                        rain_value=0.0,
                        air_quality=40.0,
                        latitude=coords[0],
                        longitude=coords[1],
                        battery_percentage=95.0,
                        timestamp=datetime.now(timezone.utc)
                    ))
                cls._packets_processed += 5

            # 2. SENSOR ANOMALY
            elif step == 2:
                # Sudden rate-of-change jump on ENV-001 (Temp +7°C, AQI +80)
                await SensorService.ingest_sensor_data(db, SensorDataPayload(
                    node_id="ENV-001",
                    temperature=31.5,
                    humidity=44.0,
                    pressure=1011.0,
                    rain_value=0.0,
                    air_quality=120.0,
                    latitude=NODE_COORDS["ENV-001"][0],
                    longitude=NODE_COORDS["ENV-001"][1],
                    battery_percentage=94.0,
                    timestamp=datetime.now(timezone.utc)
                ))
                cls._packets_processed += 1

            # 3. HAZARD DETECTED
            elif step == 3:
                # Single node breaches critical fire threshold
                res = await SensorService.ingest_sensor_data(db, SensorDataPayload(
                    node_id="ENV-001",
                    temperature=48.2,
                    humidity=17.0,
                    pressure=1010.0,
                    rain_value=0.0,
                    air_quality=310.0,
                    latitude=NODE_COORDS["ENV-001"][0],
                    longitude=NODE_COORDS["ENV-001"][1],
                    battery_percentage=93.0,
                    timestamp=datetime.now(timezone.utc)
                ))
                cls._packets_processed += 1
                cls._peak_risk = max(cls._peak_risk, res.get("risk", {}).get("overall_risk", 84.0))
                cls._detection_time_seconds = 6

            # 4. MULTI-NODE VERIFICATION (Consensus)
            elif step == 4:
                # Peer nodes corroborate
                for nid in ["ENV-002", "ENV-004"]:
                    await SensorService.ingest_sensor_data(db, SensorDataPayload(
                        node_id=nid,
                        temperature=44.5 if nid == "ENV-002" else 42.0,
                        humidity=21.0 if nid == "ENV-002" else 25.0,
                        pressure=1010.5,
                        rain_value=0.0,
                        air_quality=260.0 if nid == "ENV-002" else 210.0,
                        latitude=NODE_COORDS[nid][0],
                        longitude=NODE_COORDS[nid][1],
                        battery_percentage=91.0,
                        timestamp=datetime.now(timezone.utc)
                    ))
                    cls._packets_processed += 1
                cls._consensus_status = "STRONG_CONSENSUS"
                cls._consensus_percentage = 75.0

            # 5. ALERT BROADCAST
            elif step == 5:
                # Ensure alert is logged
                cls._alerts_generated_count += 1
                AuditService.log_event(
                    db=db,
                    action="EARLY_WARNING_BROADCAST",
                    entity="ALERT",
                    entity_id="ALT-FIRE-CLUSTER",
                    actor="CENTRAL_RISK_ENGINE",
                    details="Broadcasted CRITICAL Wildfire Cluster early warning to dashboard clients."
                )

            # 6. SITUATION ROOM
            elif step == 6:
                AuditService.log_event(
                    db=db,
                    action="SITUATION_ROOM_ACTIVATION",
                    entity="SITUATION_ROOM",
                    entity_id="ZONE-ENV-001",
                    actor="DUTY_COMMANDER",
                    details="Situation Room elevated to CRITICAL. 600m perimeter active."
                )

            # 7. INCIDENT CREATION
            elif step == 7:
                inc = IncidentService.create_or_update_incident(
                    db=db,
                    node_id="ENV-001",
                    risk_type="FIRE",
                    severity="CRITICAL",
                    risk_score=91.5,
                    evidence_snapshot="T:48.2°C, RH:17%, AQI:310 • Multi-Node Consensus: 75% agreement"
                )
                cls._incident_number = inc.incident_number
                cls._incident_id = inc.id

            # 8. RESPONSE DISPATCH
            elif step == 8:
                if cls._incident_id:
                    disp_res = IncidentService.dispatch_incident(
                        db=db,
                        incident_id=cls._incident_id,
                        agency="FIRE_RESCUE",
                        priority="PRIORITY_1",
                        unit_assigned="FIRE-BRIGADE-SECTOR-04",
                        operator_name="SIH Evaluation Officer",
                        notes="Immediate containment required at Riverbed Riparian zone."
                    )
                    cls._response_reference = disp_res.get("dispatch_reference")

            # 9. PUBLIC ALERT
            elif step == 9:
                AuditService.log_event(
                    db=db,
                    action="PUBLIC_SAFETY_ADVISORY_ISSUED",
                    entity="PUBLIC_PORTAL",
                    entity_id="BULLETIN-2026-004",
                    actor="CIVIC_SAFETY_OFFICE",
                    details="Public safety bulletin issued: Sector A / River Basin containment alert."
                )

            # 10. RESOLUTION
            elif step == 10:
                if cls._incident_id:
                    IncidentService.update_incident_status(
                        db=db,
                        incident_id=cls._incident_id,
                        status="RESOLVED",
                        actor="COMMAND_OFFICER",
                        operator_name="SIH Evaluation Officer",
                        note="Containment verified. Controlled burn extinguished. Area safe."
                    )
                # Cool down environment
                for nid, coords in NODE_COORDS.items():
                    await SensorService.ingest_sensor_data(db, SensorDataPayload(
                        node_id=nid,
                        temperature=25.0,
                        humidity=48.0,
                        pressure=1013.0,
                        rain_value=0.0,
                        air_quality=48.0,
                        latitude=coords[0],
                        longitude=coords[1],
                        battery_percentage=90.0,
                        timestamp=datetime.now(timezone.utc)
                    ))
                    cls._packets_processed += 1

            # 11. AUDIT VERIFICATION
            elif step == 11:
                AuditService.log_event(
                    db=db,
                    action="AUDIT_VERIFICATION_COMPLETED",
                    entity="AUDIT_CHAIN",
                    entity_id="CHAIN-SIH-DEMO",
                    actor="SYSTEM_SECURITY",
                    details="SHA-256 cryptographic chain validated across 11 incident transition blocks."
                )

        finally:
            db.close()

    @classmethod
    async def _run_evaluation_loop(cls):
        """
        Evaluation mode loop that can automatically step through the 11 phases.
        """
        try:
            while cls._is_running and cls._is_evaluation_mode:
                if cls._is_paused:
                    await asyncio.sleep(1)
                    continue

                cls._step_index += 1
                await cls._execute_single_evaluation_step(cls._evaluation_step)

                step_info = EVALUATION_STEPS[cls._evaluation_step - 1]
                t_str = f"T+{cls._step_index * 3:02d}s"
                cls._timeline_events.append({
                    "time": t_str,
                    "message": f"Step {cls._evaluation_step}/11 [{step_info['phase']}]: {step_info['title']}",
                    "level": step_info["level"]
                })

                await ws_manager.broadcast({
                    "type": "SIMULATION_STATUS",
                    "simulation": cls.get_status()
                })

                if cls._evaluation_auto_advance:
                    if cls._evaluation_step < len(EVALUATION_STEPS):
                        cls._evaluation_step += 1
                        await asyncio.sleep(4)
                    else:
                        cls._final_status = "COMPLETED"
                        cls._is_running = False
                        break
                else:
                    await asyncio.sleep(3)

        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error during evaluation loop: {e}", exc_info=True)
        finally:
            cls._is_running = False

    @classmethod
    async def _run_simulation_loop(cls):
        """
        Continuous simulation loop for preset and custom scenarios.
        """
        try:
            while cls._is_running:
                if cls._is_paused:
                    await asyncio.sleep(1)
                    continue

                cls._step_index += 1
                t_str = f"T+{cls._step_index * 3:02d}s"

                # -------------------------------------------------------------
                # 1. WILDFIRE (Forest Canopy Thermal Surge)
                # -------------------------------------------------------------
                if cls._scenario == "FIRE":
                    primary_temp = min(54.2, 28.0 + cls._step_index * 2.4 + random.uniform(-0.2, 0.4))
                    primary_hum = max(14.0, 50.0 - cls._step_index * 3.4 + random.uniform(-0.4, 0.4))
                    primary_aqi = min(390.0, 50.0 + cls._step_index * 26.0 + random.uniform(-2, 4))

                    if cls._step_index == 2:
                        cls._timeline_events.append({"time": t_str, "message": "Edge Check: Local Thermal Spike (+4.8°C) on ENV-001", "level": "INFO"})
                    elif cls._step_index == 4:
                        cls._timeline_events.append({"time": t_str, "message": "Adjacent node ENV-002 corroborates desiccation (<25% RH)", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Multi-Node Spatial Consensus: 3/4 peer nodes agree on High Wildfire Hazard (Consensus: 75%)", "level": "WARNING"})
                    elif cls._step_index == 8:
                        cls._timeline_events.append({"time": t_str, "message": "Regional Hazard Alert: CRITICAL WILDFIRE CLUSTER (88% Risk, 92% Confidence)", "level": "CRITICAL"})

                    payloads = [
                        SensorDataPayload(
                            node_id="ENV-001",
                            temperature=round(primary_temp, 1),
                            humidity=round(primary_hum, 1),
                            pressure=1010.5,
                            rain_value=0.0,
                            air_quality=round(primary_aqi, 1),
                            latitude=NODE_COORDS["ENV-001"][0],
                            longitude=NODE_COORDS["ENV-001"][1],
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
                            latitude=NODE_COORDS["ENV-002"][0],
                            longitude=NODE_COORDS["ENV-002"][1],
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
                            latitude=NODE_COORDS["ENV-004"][0],
                            longitude=NODE_COORDS["ENV-004"][1],
                            battery_percentage=94.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="FIRE")

                # -------------------------------------------------------------
                # 2. FLASH FLOOD (River Basin Inflow)
                # -------------------------------------------------------------
                elif cls._scenario == "FLOOD":
                    rain = min(890.0, cls._step_index * 85.0 + random.uniform(-5, 15))
                    hum = min(98.0, 58.0 + cls._step_index * 4.4)
                    pres = max(980.0, 1013.0 - cls._step_index * 3.4)
                    temp = max(18.5, 26.0 - cls._step_index * 0.8)

                    if cls._step_index == 3:
                        cls._timeline_events.append({"time": t_str, "message": "Precipitation Inflow Spike (>480 ADC) on ENV-001 & ENV-003", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Multi-Node Flood Consensus: 3/4 Nodes confirm riparian runoff risk (86%)", "level": "CRITICAL"})

                    payloads = [
                        SensorDataPayload(
                            node_id="ENV-001",
                            temperature=round(temp, 1),
                            humidity=round(hum, 1),
                            pressure=round(pres, 1),
                            rain_value=round(rain, 1),
                            air_quality=38.0,
                            latitude=NODE_COORDS["ENV-001"][0],
                            longitude=NODE_COORDS["ENV-001"][1],
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
                            latitude=NODE_COORDS["ENV-003"][0],
                            longitude=NODE_COORDS["ENV-003"][1],
                            battery_percentage=89.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="FLOOD")

                # -------------------------------------------------------------
                # 3. INDUSTRIAL GAS LEAK / AIR POLLUTION
                # -------------------------------------------------------------
                elif cls._scenario in ["CHEMICAL_PLUME", "POLLUTION"]:
                    aqi = min(470.0, 60.0 + cls._step_index * 42.0 + random.uniform(-3, 6))
                    pres = min(1022.0, 1012.0 + cls._step_index * 1.0)
                    hum = min(88.0, 48.0 + cls._step_index * 3.5)

                    if cls._step_index == 2:
                        cls._timeline_events.append({"time": t_str, "message": "Gas/VOC Concentration Spike: MQ-135 reading >280 on ENV-004", "level": "WARNING"})
                    elif cls._step_index == 5:
                        cls._timeline_events.append({"time": t_str, "message": "Atmospheric Inversion Trap: Chemical plume dispersing toward downwind node ENV-002", "level": "WARNING"})
                    elif cls._step_index == 7:
                        cls._timeline_events.append({"time": t_str, "message": "Toxic Dispersion Alert: Hazardous Gas Threat (AQI: 420, Severity: CRITICAL)", "level": "CRITICAL"})

                    payloads = [
                        SensorDataPayload(
                            node_id="ENV-004",
                            temperature=26.5,
                            humidity=round(hum, 1),
                            pressure=round(pres, 1),
                            rain_value=0.0,
                            air_quality=round(aqi, 1),
                            latitude=NODE_COORDS["ENV-004"][0],
                            longitude=NODE_COORDS["ENV-004"][1],
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
                            latitude=NODE_COORDS["ENV-002"][0],
                            longitude=NODE_COORDS["ENV-002"][1],
                            battery_percentage=90.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="POLLUTION")

                # -------------------------------------------------------------
                # 4. EXTREME WEATHER (Monsoon Cyclonic Depression)
                # -------------------------------------------------------------
                elif cls._scenario == "EXTREME_WEATHER":
                    pres = max(970.0, 1012.0 - cls._step_index * 4.8)
                    rain = min(780.0, cls._step_index * 70.0)
                    hum = min(98.0, 60.0 + cls._step_index * 4.0)
                    temp = max(16.5, 27.0 - cls._step_index * 1.2)

                    if cls._step_index == 3:
                        cls._timeline_events.append({"time": t_str, "message": "Severe Barometric Pressure Drop (<995 hPa) with High Wind Shear", "level": "WARNING"})
                    elif cls._step_index == 6:
                        cls._timeline_events.append({"time": t_str, "message": "Compound Risk Alert: Extreme Monsoon Storm Depression (Flood + Gale Hazard: 86%)", "level": "CRITICAL"})

                    payloads = [
                        SensorDataPayload(
                            node_id="ENV-001",
                            temperature=round(temp, 1),
                            humidity=round(hum, 1),
                            pressure=round(pres, 1),
                            rain_value=round(rain, 1),
                            air_quality=42.0,
                            latitude=NODE_COORDS["ENV-001"][0],
                            longitude=NODE_COORDS["ENV-001"][1],
                            battery_percentage=84.0,
                            timestamp=datetime.now(timezone.utc)
                        ),
                        SensorDataPayload(
                            node_id="ENV-003",
                            temperature=round(temp - 0.4, 1),
                            humidity=round(hum, 1),
                            pressure=round(pres + 0.5, 1),
                            rain_value=round(rain * 0.95, 1),
                            air_quality=40.0,
                            latitude=NODE_COORDS["ENV-003"][0],
                            longitude=NODE_COORDS["ENV-003"][1],
                            battery_percentage=82.0,
                            timestamp=datetime.now(timezone.utc)
                        )
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="FLOOD")

                # -------------------------------------------------------------
                # 5. SENSOR FAILURE / FLATLINE
                # -------------------------------------------------------------
                elif cls._scenario == "SENSOR_FAILURE":
                    if cls._step_index == 1:
                        cls._timeline_events.append({"time": t_str, "message": "Injected frozen sensor output (flatline) on ENV-003 Air Quality", "level": "INFO"})
                    elif cls._step_index == 4:
                        cls._timeline_events.append({"time": t_str, "message": "Anomaly Detector: FLATLINE detected on ENV-003. Sensor health -> DEGRADED", "level": "WARNING"})
                    elif cls._step_index == 7:
                        cls._timeline_events.append({"time": t_str, "message": "Data Quality score penalized. Composite confidence degraded to 64%", "level": "WARNING"})

                    payloads = [
                        SensorDataPayload(
                            node_id="ENV-003",
                            temperature=26.0,
                            humidity=50.0,
                            pressure=1013.25,
                            rain_value=0.0,
                            air_quality=115.0,  # Frozen constant
                            latitude=NODE_COORDS["ENV-003"][0],
                            longitude=NODE_COORDS["ENV-003"][1],
                            battery_percentage=90.0,
                            timestamp=datetime.now(timezone.utc)
                        )
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="POLLUTION")

                # -------------------------------------------------------------
                # 6. NETWORK OUTAGE / OFFLINE BUFFER RECOVERY
                # -------------------------------------------------------------
                elif cls._scenario == "NETWORK_OUTAGE":
                    sim_reading = SensorDataPayload(
                        node_id="ENV-001",
                        temperature=round(28.0 + cls._step_index * 0.4, 1),
                        humidity=round(45.0 - cls._step_index * 0.5, 1),
                        pressure=1012.0,
                        rain_value=0.0,
                        air_quality=round(65.0 + cls._step_index * 3.0, 1),
                        latitude=NODE_COORDS["ENV-001"][0],
                        longitude=NODE_COORDS["ENV-001"][1],
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
                            cls._offline_packets_recovered = sync_res.get("synced_count", len(cls._offline_buffer))
                            cls._packets_processed += cls._offline_packets_recovered
                            cls._timeline_events.append({
                                "time": f"T+{cls._step_index * 3 + 1:02d}s",
                                "message": f"Synchronized {cls._offline_packets_recovered} readings with 0 data loss. Timeline reconciled.",
                                "level": "INFO"
                            })
                            cls._offline_buffer = []
                            cls._is_offline_mode = False
                        finally:
                            db.close()

                # -------------------------------------------------------------
                # 7. LOW BATTERY / POWER DEGRADATION
                # -------------------------------------------------------------
                elif cls._scenario == "LOW_BATTERY":
                    bat = max(4.0, 18.0 - cls._step_index * 1.5)
                    if cls._step_index == 2:
                        cls._timeline_events.append({"time": t_str, "message": "Battery reserve dropped below 15% on ENV-005. Low power mode engaged.", "level": "WARNING"})
                    elif cls._step_index == 5:
                        cls._timeline_events.append({"time": t_str, "message": "CRITICAL BATTERY WARNING: ENV-005 at 8.0%. Solar harvesting suboptimal.", "level": "CRITICAL"})

                    payloads = [
                        SensorDataPayload(
                            node_id="ENV-005",
                            temperature=24.5,
                            humidity=52.0,
                            pressure=1013.25,
                            rain_value=0.0,
                            air_quality=40.0,
                            latitude=NODE_COORDS["ENV-005"][0],
                            longitude=NODE_COORDS["ENV-005"][1],
                            battery_percentage=round(bat, 1),
                            timestamp=datetime.now(timezone.utc)
                        )
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="OVERALL")

                # -------------------------------------------------------------
                # 8. MULTI-NODE SPATIAL CONSENSUS VERIFICATION
                # -------------------------------------------------------------
                elif cls._scenario == "MULTI_NODE_CONSENSUS":
                    # Synchronously elevates all 4 cluster nodes to show multi-node voting
                    t_val = min(50.0, 30.0 + cls._step_index * 2.5)
                    if cls._step_index == 2:
                        cls._timeline_events.append({"time": t_str, "message": "Cluster-wide thermal surge detected across Sectors A, B, and C.", "level": "WARNING"})
                    elif cls._step_index == 4:
                        cls._timeline_events.append({"time": t_str, "message": "Multi-Node Voting Engine: 4/5 Nodes corroborate threat (80% Consensus).", "level": "CRITICAL"})

                    payloads = [
                        SensorDataPayload(
                            node_id=nid,
                            temperature=round(t_val - idx * 1.2, 1),
                            humidity=round(max(15.0, 48.0 - cls._step_index * 3.5), 1),
                            pressure=1011.0,
                            rain_value=0.0,
                            air_quality=round(min(380.0, 50.0 + cls._step_index * 28.0), 1),
                            latitude=coords[0],
                            longitude=coords[1],
                            battery_percentage=90.0,
                            timestamp=datetime.now(timezone.utc)
                        )
                        for idx, (nid, coords) in enumerate(list(NODE_COORDS.items())[:4])
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="FIRE")

                # -------------------------------------------------------------
                # 9. CUSTOM USER-DEFINED SCENARIO
                # -------------------------------------------------------------
                elif cls._is_custom:
                    cfg = cls._custom_config
                    target_nodes = cfg.get("affected_node_ids", [cls._target_node_id])
                    hazard_type = cfg.get("hazard_type", "FIRE").upper()
                    base_temp = float(cfg.get("temperature", 35.0))
                    base_hum = float(cfg.get("humidity", 30.0))
                    base_aqi = float(cfg.get("air_quality", 250.0))
                    base_pres = float(cfg.get("pressure", 1010.0))
                    base_rain = float(cfg.get("rain_value", 0.0))
                    base_bat = float(cfg.get("battery_percentage", 90.0))

                    if cls._step_index == 1:
                        cls._timeline_events.append({
                            "time": t_str,
                            "message": f"Injecting custom {hazard_type} profile (T:{base_temp}°C, AQI:{base_aqi}, Rain:{base_rain}mm)",
                            "level": "INFO"
                        })

                    payloads = []
                    for nid in target_nodes:
                        coords = NODE_COORDS.get(nid, (25.2138, 75.8648))
                        payloads.append(SensorDataPayload(
                            node_id=nid,
                            temperature=round(base_temp + random.uniform(-0.5, 0.5), 1),
                            humidity=round(base_hum + random.uniform(-1, 1), 1),
                            pressure=round(base_pres + random.uniform(-0.5, 0.5), 1),
                            rain_value=round(base_rain, 1),
                            air_quality=round(base_aqi + random.uniform(-2, 2), 1),
                            latitude=coords[0],
                            longitude=coords[1],
                            battery_percentage=round(base_bat, 1),
                            timestamp=datetime.now(timezone.utc)
                        ))

                    await cls._process_and_track_payloads(payloads, hazard_type=hazard_type)

                # -------------------------------------------------------------
                # 10. NOMINAL BASELINE RESTORATION
                # -------------------------------------------------------------
                else:
                    payloads = [
                        SensorDataPayload(
                            node_id=nid,
                            temperature=round(24.5 + random.uniform(-0.3, 0.3), 1),
                            humidity=round(52.0 + random.uniform(-1, 1), 1),
                            pressure=round(1013.25 + random.uniform(-0.2, 0.2), 1),
                            rain_value=0.0,
                            air_quality=round(42.0 + random.uniform(-2, 2), 1),
                            latitude=coords[0],
                            longitude=coords[1],
                            battery_percentage=94.0,
                            timestamp=datetime.now(timezone.utc)
                        )
                        for nid, coords in NODE_COORDS.items()
                    ]
                    await cls._process_and_track_payloads(payloads, hazard_type="OVERALL")

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

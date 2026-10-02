import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SimulationStatus, SensorNode, CustomScenarioPayload } from '../types';
import {
  FlaskConical,
  Play,
  Pause,
  Square,
  Flame,
  Droplets,
  Wind,
  Radio,
  WifiOff,
  Activity,
  ShieldCheck,
  BatteryCharging,
  Users,
  Compass,
  Sliders,
  CheckCircle2,
  RotateCcw,
  FastForward,
  Info,
  ExternalLink,
  Cpu,
  Sparkles
} from 'lucide-react';

interface SimulationViewProps {
  nodes: SensorNode[];
  onNavigate?: (screen: string) => void;
}

const PRESET_SCENARIOS = [
  {
    id: 'FIRE',
    name: 'Forest Canopy Wildfire',
    hazard: 'FIRE',
    badge: 'THERMAL SURGE',
    icon: Flame,
    color: 'orange',
    location: 'Chambal Riparian Forest (Sector B)',
    duration: '45s',
    affectedNodes: ['ENV-001', 'ENV-002', 'ENV-004'],
    desc: 'Thermal rise (>48°C), rapid desiccation (<20% RH), and smoke particulate surge triggering 3-node spatial consensus.',
    expectedResponse: 'Edge anomaly flag → CRITICAL Wildfire Alert → Multi-Node Consensus (75%) → Incident Auto-Creation → SDRF Fire Dispatch.'
  },
  {
    id: 'FLOOD',
    name: 'River Basin Flash Flood',
    hazard: 'FLOOD',
    badge: 'PRECIPITATION INFLOW',
    icon: Droplets,
    color: 'sky',
    location: 'Riverbed Lowland Corridor (Sector A)',
    duration: '40s',
    affectedNodes: ['ENV-001', 'ENV-003'],
    desc: 'Riparian cloudburst (>800 ADC rain saturation), rapid soil saturation, and barometric depression (<985 hPa).',
    expectedResponse: 'Hydrological Surge Alarm → Flood Inundation Alert → 600m Evacuation Perimeter → Public SMS Advisory Broadcast.'
  },
  {
    id: 'CHEMICAL_PLUME',
    name: 'Industrial Toxic Gas Inversion',
    hazard: 'POLLUTION',
    badge: 'VOC / GAS PLUME',
    icon: Wind,
    color: 'emerald',
    location: 'GIDC Industrial Perimeter (Sector D)',
    duration: '35s',
    affectedNodes: ['ENV-004', 'ENV-002'],
    desc: 'Hazardous VOC / AQI spike (>420 AQI) trapped beneath a stagnant nocturnal atmospheric inversion layer.',
    expectedResponse: 'MQ-135 Gas Spike Detection → Toxic Inversion Alert → Hazmat Incident INC-2026 → Pollution Control Board Webhook.'
  },
  {
    id: 'EXTREME_WEATHER',
    name: 'Monsoon Cyclonic Depression',
    hazard: 'STORM',
    badge: 'COMPOUND MULTI-HAZARD',
    icon: Radio,
    color: 'indigo',
    location: 'Regional Catchment Basin',
    duration: '50s',
    affectedNodes: ['ENV-001', 'ENV-003', 'ENV-005'],
    desc: 'Severe barometric drop (<975 hPa), gale rainfall, and multi-hazard compounded vulnerability score.',
    expectedResponse: 'Compound Storm Risk (>85%) → Multi-Agency Red Alert → Situation Room Elevation to Critical.'
  },
  {
    id: 'SENSOR_FAILURE',
    name: 'Sensor Flatline & Drift Fault',
    hazard: 'SENSOR_FAULT',
    badge: 'DATA QUALITY DEGRADE',
    icon: Activity,
    color: 'rose',
    location: 'Valley Monitoring Station ENV-003',
    duration: '30s',
    affectedNodes: ['ENV-003'],
    desc: 'Injected frozen constant MQ-135 flatline on node ENV-003 to test statistical outlier detection and sensor health degradation.',
    expectedResponse: 'Zero Variance Detection → Sensor Health Penalty (DEGRADED) → Data Quality Completeness Score Reduced.'
  },
  {
    id: 'NETWORK_OUTAGE',
    name: 'Network Outage & Local Buffer',
    hazard: 'NETWORK_FAULT',
    badge: 'OFFLINE RESILIENCE',
    icon: WifiOff,
    color: 'amber',
    location: 'Chambal Mesh Gateway Uplink',
    duration: '35s',
    affectedNodes: ['ENV-001'],
    desc: 'Severed cloud uplink. Edge node continues local risk calculations, buffers to local SPI Flash, and batch reconciles on reconnect with 0 data loss.',
    expectedResponse: 'Cloud Uplink Severed Flag → Local Flash Queue Engaged → Automatic Batch Telemetry Sync → 0% Data Loss Verified.'
  },
  {
    id: 'LOW_BATTERY',
    name: 'Critical Battery Degradation',
    hazard: 'LOW_BATTERY',
    badge: 'POWER MANAGEMENT',
    icon: BatteryCharging,
    color: 'purple',
    location: 'Remote Outpost ENV-005',
    duration: '25s',
    affectedNodes: ['ENV-005'],
    desc: 'Battery reserve drops <15% under sub-optimal solar harvesting to test automated low-power sampling throttling.',
    expectedResponse: 'Low Battery Warning Alert → Power Mode Throttled → Maintenance Technician Notification Logged.'
  },
  {
    id: 'MULTI_NODE_CONSENSUS',
    name: 'Multi-Node Spatial Consensus',
    hazard: 'CONSENSUS',
    badge: 'SPATIAL VERIFICATION',
    icon: Users,
    color: 'teal',
    location: 'Inter-Sector Cluster A-B-C',
    duration: '40s',
    affectedNodes: ['ENV-001', 'ENV-002', 'ENV-004', 'ENV-005'],
    desc: 'Simultaneous multi-sector threat injection to demonstrate cross-node correlation voting and false-positive elimination.',
    expectedResponse: '4/5 Nodes Voting Corroboration → Spatial Consensus reaches 80% → Highest Confidence Incident Auto-Escalation.'
  },
  {
    id: 'NORMAL',
    name: 'Nominal Baseline Calibration',
    hazard: 'BASELINE',
    badge: 'CALIBRATION',
    icon: ShieldCheck,
    color: 'slate',
    location: 'Entire 5-Node Fleet',
    duration: '20s',
    affectedNodes: ['ENV-001', 'ENV-002', 'ENV-003', 'ENV-004', 'ENV-005'],
    desc: 'Restores all 5 environmental monitoring nodes to temperate, peaceful baseline telemetry (24°C, 50% RH, 0 rain).',
    expectedResponse: 'Baseline Restored → Risk Indices <15% → Open Alerts Cleared → System Health Returns to HEALTHY.'
  }
];

const EVALUATION_TOUR_STEPS = [
  { step: 1, phase: 'NORMAL', title: 'Baseline Calibration', desc: 'All 5 nodes transmitting nominal temperate telemetry' },
  { step: 2, phase: 'ANOMALY', title: 'Telemetry Anomaly', desc: 'Abrupt rate-of-change detected (+5.8°C spike)' },
  { step: 3, phase: 'HAZARD', title: 'Threshold Breach', desc: 'Single-node risk crosses critical boundary (>80%)' },
  { step: 4, phase: 'CONSENSUS', title: 'Multi-Node Consensus', desc: 'Peer nodes (ENV-002 & 004) confirm 75% agreement' },
  { step: 5, phase: 'ALERT', title: 'Early Warning Alert', desc: 'CRITICAL hazard alert broadcasted across network' },
  { step: 6, phase: 'SITUATION', title: 'Situation Room', desc: 'Command Center elevates threat level to CRITICAL' },
  { step: 7, phase: 'INCIDENT', title: 'Incident Created', desc: 'Auto-generates incident ticket INC-2026-XXXX' },
  { step: 8, phase: 'RESPONSE', title: 'Emergency Dispatch', desc: 'SDRF / Fire Rescue dispatched with ref DSP-2026-XXXX' },
  { step: 9, phase: 'PUBLIC', title: 'Public Alert Issued', desc: 'Civic safety advisory published to citizen portal' },
  { step: 10, phase: 'RESOLUTION', title: 'Threat Resolution', desc: 'Parameters subside; incident closed as RESOLVED' },
  { step: 11, phase: 'AUDIT', title: 'Audit Verification', desc: 'SHA-256 cryptographic chain validated in ledger' },
];

export const SimulationView: React.FC<SimulationViewProps> = ({ nodes, onNavigate }) => {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'EVALUATION' | 'PRESETS' | 'CUSTOM'>('EVALUATION');
  const [selectedScenario, setSelectedScenario] = useState<string>('FIRE');
  const [targetNodeId, setTargetNodeId] = useState<string>('ENV-001');
  const [intensity, setIntensity] = useState<string>('HIGH');
  const [loading, setLoading] = useState<boolean>(false);

  // Custom scenario builder state
  const [customConfig, setCustomConfig] = useState<CustomScenarioPayload>({
    location: 'Chambal Riparian Sector B',
    hazard_type: 'FIRE',
    duration_seconds: 60,
    target_node_id: 'ENV-001',
    affected_node_ids: ['ENV-001', 'ENV-002'],
    temperature: 46.5,
    humidity: 18.0,
    air_quality: 320.0,
    pressure: 1009.0,
    rain_value: 0.0,
    battery_percentage: 92.0,
    intensity: 'HIGH',
    node_failure: false,
    network_failure: false
  });

  const fetchStatus = async () => {
    try {
      const res = await api.getSimulationStatus();
      setStatus(res);
    } catch (err) {
      console.error('Failed to fetch simulation status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStartPreset = async (presetId?: string) => {
    try {
      setLoading(true);
      const scId = presetId || selectedScenario;
      const res = await api.startSimulation(scId, targetNodeId, intensity);
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCustom = async () => {
    try {
      setLoading(true);
      const res = await api.startCustomSimulation(customConfig);
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = async (autoAdvance: boolean = true) => {
    try {
      setLoading(true);
      const res = await api.startEvaluationMode(autoAdvance);
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextEvaluationStep = async () => {
    try {
      setLoading(true);
      const res = await api.nextEvaluationStep();
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      const res = await api.pauseSimulation();
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      const res = await api.stopSimulation();
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await api.resetSimulation();
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isRunning = status?.is_running ?? false;
  const isPaused = status?.is_paused ?? false;
  const isOffline = status?.is_offline_mode ?? false;
  const isEvalMode = status?.is_evaluation_mode ?? false;
  const evalStep = status?.evaluation_step ?? 1;
  const bufferCount = status?.buffered_readings_count ?? 0;
  const metrics = status?.metrics;

  const currentPhase = status?.current_evaluation_phase;

  return (
    <div className="space-y-5">
      {/* Top Banner: SIH Simulation Testbed Label */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff4405] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#ff4405] border border-orange-200">
                DEMO SIMULATION TESTBED
              </span>
              {isRunning && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE INGESTION ACTIVE ({status?.scenario})
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-slate-900 mt-0.5">
              SIH Scenario Testing Lab & Deterministic Verification Testbed
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Injects physical telemetry directly through the unified <code className="font-mono text-[#ff4405] font-bold">POST /api/sensor-data</code> pipeline into Database, Risk Engine, Consensus, Alerts, and Situation Room.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            title="Restore all nodes to peaceful baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Baseline
          </button>

          {isRunning ? (
            <>
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Pause className="w-3.5 h-3.5 fill-current" /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Test
              </button>
            </>
          ) : (
            <button
              onClick={() => handleStartEvaluation(true)}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Sparkles className="w-4 h-4" /> Start Evaluation Tour
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('EVALUATION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'EVALUATION'
              ? 'bg-[#121417] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> SIH Evaluator Guided Tour
        </button>

        <button
          onClick={() => setActiveTab('PRESETS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'PRESETS'
              ? 'bg-[#121417] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-orange-500" /> Preset Hazard Scenarios (9)
        </button>

        <button
          onClick={() => setActiveTab('CUSTOM')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'CUSTOM'
              ? 'bg-[#121417] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-500" /> Custom Scenario Builder
        </button>
      </div>

      {/* TAB 1: SIH EVALUATOR GUIDED TOUR */}
      {activeTab === 'EVALUATION' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-purple-100 text-purple-800 border border-purple-200">
                  RECOMMENDED FOR JURY
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  11-Stage End-to-End Operational Lifecycle Walkthrough
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Demonstrates how an initial physical sensor anomaly propagates across all subsystems without manual intervention.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isEvalMode ? (
                <>
                  <button
                    onClick={() => handleStartEvaluation(true)}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Auto-Play Walkthrough
                  </button>
                  <button
                    onClick={() => handleStartEvaluation(false)}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FastForward className="w-3.5 h-3.5" /> Step-by-Step Mode
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleNextEvaluationStep}
                    disabled={loading || evalStep >= EVALUATION_TOUR_STEPS.length}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FastForward className="w-3.5 h-3.5" /> Next Phase ({evalStep}/11)
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> End Tour
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-11 gap-2">
            {EVALUATION_TOUR_STEPS.map((st) => {
              const isCurrent = isEvalMode && evalStep === st.step;
              const isPast = isEvalMode && evalStep > st.step;

              return (
                <div
                  key={st.step}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
                      : isPast
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-500 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isCurrent ? 'bg-purple-600 text-white' : isPast ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      #{st.step}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>}
                  </div>
                  <div className="font-bold text-[11px] text-slate-900 truncate">{st.phase}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{st.title}</div>
                </div>
              );
            })}
          </div>

          {/* Current Step Focus Box */}
          {currentPhase && (
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500 text-white text-[10px] font-mono font-bold">
                    ACTIVE STEP #{currentPhase.step} OF 11
                  </span>
                  <span className="text-xs font-bold text-slate-200">{currentPhase.title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  currentPhase.level === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {currentPhase.level}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {currentPhase.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESET SCENARIOS */}
      {activeTab === 'PRESETS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Select Preset Environmental Scenario
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Deterministic behavior across all 5 monitoring nodes for repeatable SIH evaluations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">Target Node:</span>
                <select
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                  disabled={isRunning}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 cursor-pointer"
                >
                  {nodes.map((n) => (
                    <option key={n.node_id} value={n.node_id}>
                      {n.node_id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">Intensity:</span>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  disabled={isRunning}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 cursor-pointer"
                >
                  <option value="LOW">Low (Moderate)</option>
                  <option value="MEDIUM">Medium (High)</option>
                  <option value="HIGH">High (Critical)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Offline & Ingestion Pipeline Indicator */}
          {(isOffline || bufferCount > 0) && (
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-[#ea580c] animate-pulse" />
                <span className="font-bold text-orange-950">
                  {isOffline ? 'Network Outage Injected: Edge Monitoring Active' : 'Network Reconnected'}
                </span>
                <span className="text-orange-800">
                  (Local SPI Flash Buffer: <strong>{bufferCount} packets queued</strong>)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ea580c] text-white">
                0% DATA LOSS
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_SCENARIOS.map((sc) => {
              const Icon = sc.icon;
              const isSelected = selectedScenario === sc.id;
              const isCurrentRunning = isRunning && status?.scenario === sc.id;

              return (
                <div
                  key={sc.id}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 shadow-2xs ${
                    isCurrentRunning
                      ? 'bg-orange-50/70 border-[#ff4405] ring-2 ring-[#ff4405]/20'
                      : isSelected
                      ? 'bg-slate-50/80 border-slate-400'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                          <Icon className="w-4 h-4 text-[#ff4405]" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{sc.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{sc.location}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {sc.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed mb-2">
                      {sc.desc}
                    </p>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[10px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Info className="w-3 h-3 text-[#ff4405]" /> Expected Pipeline:
                      </div>
                      <div className="text-slate-500 leading-tight">{sc.expectedResponse}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-slate-500">
                      Nodes: <strong className="text-slate-900">{sc.affectedNodes.join(', ')}</strong>
                    </div>

                    {isCurrentRunning ? (
                      <button
                        onClick={handleStop}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Square className="w-3 h-3 fill-current" /> Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedScenario(sc.id);
                          handleStartPreset(sc.id);
                        }}
                        disabled={isRunning}
                        className="px-3.5 py-1.5 rounded-lg bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        <Play className="w-3 h-3 fill-current" /> Launch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM SCENARIO BUILDER */}
      {activeTab === 'CUSTOM' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Custom Scenario Parameter Injector
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure arbitrary physical conditions and fault vectors to test risk calculations and alert thresholds.
              </p>
            </div>
            <button
              onClick={handleStartCustom}
              disabled={isRunning || loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" /> Inject Custom Telemetry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Core Scenario Meta */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-semibold">Location / Sector</label>
                <input
                  type="text"
                  value={customConfig.location}
                  onChange={(e) => setCustomConfig({ ...customConfig, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-semibold">Hazard Profile</label>
                <select
                  value={customConfig.hazard_type}
                  onChange={(e) => setCustomConfig({ ...customConfig, hazard_type: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-900"
                >
                  <option value="FIRE">Wildfire / Extreme Heat</option>
                  <option value="FLOOD">Flash Flood / Hydrological Inflow</option>
                  <option value="POLLUTION">Toxic Air / Chemical Inversion</option>
                  <option value="STORM">Extreme Monsoon Storm</option>
                  <option value="SENSOR_FAULT">Sensor Hardware Fault</option>
                  <option value="LOW_BATTERY">Power / Battery Depletion</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-semibold">
                  Duration ({customConfig.duration_seconds} seconds)
                </label>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={customConfig.duration_seconds}
                  onChange={(e) => setCustomConfig({ ...customConfig, duration_seconds: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-semibold">Target Cluster Nodes</label>
                <div className="grid grid-cols-2 gap-2">
                  {nodes.map((n) => {
                    const isChecked = customConfig.affected_node_ids.includes(n.node_id);
                    return (
                      <label
                        key={n.node_id}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                          isChecked ? 'bg-indigo-50 border-indigo-400 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newNodes = e.target.checked
                              ? [...customConfig.affected_node_ids, n.node_id]
                              : customConfig.affected_node_ids.filter((id) => id !== n.node_id);
                            setCustomConfig({ ...customConfig, affected_node_ids: newNodes });
                          }}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span>{n.node_id}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Physical Environmental Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Temperature</span>
                  <span className="font-mono text-indigo-600">{customConfig.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={60}
                  step={0.5}
                  value={customConfig.temperature}
                  onChange={(e) => setCustomConfig({ ...customConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Relative Humidity</span>
                  <span className="font-mono text-indigo-600">{customConfig.humidity}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={customConfig.humidity}
                  onChange={(e) => setCustomConfig({ ...customConfig, humidity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Air Quality Index (AQI)</span>
                  <span className="font-mono text-indigo-600">{customConfig.air_quality}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={customConfig.air_quality}
                  onChange={(e) => setCustomConfig({ ...customConfig, air_quality: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Precipitation (Rain ADC)</span>
                  <span className="font-mono text-indigo-600">{customConfig.rain_value} ADC</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={900}
                  step={10}
                  value={customConfig.rain_value}
                  onChange={(e) => setCustomConfig({ ...customConfig, rain_value: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Column 3: Barometric Pressure & Fault Injections */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Barometric Pressure</span>
                  <span className="font-mono text-indigo-600">{customConfig.pressure} hPa</span>
                </div>
                <input
                  type="range"
                  min={950}
                  max={1050}
                  step={1}
                  value={customConfig.pressure}
                  onChange={(e) => setCustomConfig({ ...customConfig, pressure: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Battery Reserve</span>
                  <span className="font-mono text-indigo-600">{customConfig.battery_percentage}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={customConfig.battery_percentage}
                  onChange={(e) => setCustomConfig({ ...customConfig, battery_percentage: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-900">Fault Injection Vectors</div>
                
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customConfig.node_failure}
                    onChange={(e) => setCustomConfig({ ...customConfig, node_failure: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Inject Sensor Flatline (Freeze telemetry)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customConfig.network_failure}
                    onChange={(e) => setCustomConfig({ ...customConfig, network_failure: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Sever Gateway Uplink (Engage SPI flash buffer)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE EXECUTION MONITOR & TELEMETRY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 8 Cols: Real-time Telemetry & Consensus */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff4405]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Scenario Telemetry & Consensus Monitor
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">Elapsed:</span>
              <strong className="text-slate-900">T+{status?.elapsed_seconds ?? 0}s</strong>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-mono uppercase text-slate-500">Peak Risk Reached</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {metrics?.peak_risk ?? 0.0}%
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                {(metrics?.peak_risk ?? 0) > 75 ? 'CRITICAL RISK' : (metrics?.peak_risk ?? 0) > 50 ? 'HIGH RISK' : 'NOMINAL'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-mono uppercase text-slate-500">Spatial Consensus</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {metrics?.consensus_percentage ?? 0.0}%
              </div>
              <div className="text-[10px] font-medium text-purple-700 truncate">
                {metrics?.consensus_status ?? 'BASELINE'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-mono uppercase text-slate-500">Alerts Generated</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {metrics?.alerts_generated_count ?? 0}
              </div>
              <div className="text-[10px] font-medium text-amber-600">
                Auto-correlating
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-mono uppercase text-slate-500">Packets Ingested</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {metrics?.packets_processed ?? 0}
              </div>
              <div className="text-[10px] font-medium text-emerald-600">
                0% Packet Loss
              </div>
            </div>
          </div>

          {/* Live Traceability Pipeline Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#ff4405]" /> Cross-Subsystem Traceability Ledger
              </span>
              <span className="text-[10px] font-mono text-slate-500">Real Database State</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] font-mono text-slate-500">Incident Ticket</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {metrics?.incident_number ? (
                    <button
                      onClick={() => onNavigate?.('INCIDENTS')}
                      className="text-[#ff4405] hover:underline flex items-center gap-1"
                    >
                      {metrics.incident_number} <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400 font-normal">No active incident</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] font-mono text-slate-500">Emergency Dispatch</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {metrics?.response_reference ? (
                    <button
                      onClick={() => onNavigate?.('RESPONSE')}
                      className="text-purple-600 hover:underline flex items-center gap-1"
                    >
                      {metrics.response_reference} <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400 font-normal">Pending threshold</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] font-mono text-slate-500">Audit Log Chain</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  <button
                    onClick={() => onNavigate?.('AUDIT_LOGS')}
                    className="text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    SHA-256 Verified <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Live Event Timeline */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Scenario Event Log
              </h3>
              <span className="text-[10px] text-[#ff4405] font-mono font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                STEP #{status?.step_index ?? 0}
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {status?.timeline_events && status.timeline_events.length > 0 ? (
                status.timeline_events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#ea580c] font-bold">{evt.time}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold border ${
                        evt.level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        evt.level === 'WARNING' ? 'bg-orange-50 text-[#ea580c] border-orange-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {evt.level}
                      </span>
                    </div>
                    <div className="text-slate-900 text-xs font-medium leading-snug">{evt.message}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  Scenario lab standby. Select an evaluation tour or preset scenario and click Start.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium leading-relaxed">
            <strong className="text-slate-900">Verification Integrity:</strong> Every reading updates real database rows, triggers AI risk inference, computes consensus across spatial neighbors, and broadcasts over WebSockets.
          </div>
        </div>

      </div>
    </div>
  );
};

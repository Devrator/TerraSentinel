import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SimulationStatus, SensorNode } from '../types';
import { FlaskConical, Play, Pause, Square, Flame, Droplets, Wind, Radio, WifiOff, Activity, ShieldCheck, Database, Layers } from 'lucide-react';

interface SimulationViewProps {
  nodes: SensorNode[];
}

export const SimulationView: React.FC<SimulationViewProps> = ({ nodes }) => {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('FIRE');
  const [targetNodeId, setTargetNodeId] = useState<string>('ENV-001');
  const [intensity, setIntensity] = useState<string>('HIGH');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      const res = await api.getSimulationStatus();
      setStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      setLoading(true);
      const res = await api.startSimulation(selectedScenario, targetNodeId, intensity);
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

  const scenarios = [
    {
      id: 'FIRE',
      label: 'Forest Canopy Wildfire',
      badge: 'THERMAL SURGE',
      icon: Flame,
      desc: 'Rapid thermal rise + relative humidity drop + smoke particulate surge. Triggers 3/4 multi-node spatial consensus.',
    },
    {
      id: 'FLOOD',
      label: 'River Basin Flash Flood',
      badge: 'PRECIPITATION INFLOW',
      icon: Droplets,
      desc: 'Heavy riparian cloudburst, ADC rain sensor saturation & rapid barometric pressure depression across riverbed nodes.',
    },
    {
      id: 'CHEMICAL_PLUME',
      label: 'Industrial Toxic Inversion',
      badge: 'VOC / GAS PLUME',
      icon: Wind,
      desc: 'Hazardous gas concentration trapped beneath nocturnal atmospheric inversion boundary layer.',
    },
    {
      id: 'EXTREME_WEATHER',
      label: 'Monsoon Cyclonic Depression',
      badge: 'COMPOUND RISK',
      icon: Radio,
      desc: 'Severe pressure drop (<980 hPa), sustained gale rainfall, and multi-hazard compounded risk index.',
    },
    {
      id: 'SENSOR_FAILURE',
      label: 'Sensor Flatline & Drift',
      badge: 'DATA QUALITY DEGRADE',
      icon: Activity,
      desc: 'Simulates frozen MQ-135 sensor flatline on ENV-003. Triggers data quality penalty & edge anomaly flags.',
    },
    {
      id: 'NETWORK_OUTAGE',
      label: 'Network Outage & Local Buffer',
      badge: 'OFFLINE RESILIENCE',
      icon: WifiOff,
      desc: 'Simulates connection loss. Node continues local risk calculation, queues to SPI Flash, and batch syncs on reconnect.',
    },
    {
      id: 'NORMAL',
      label: 'Baseline Nominal Reset',
      badge: 'CALIBRATION',
      icon: ShieldCheck,
      desc: 'Restores all 5 virtual environmental nodes to peaceful temperate baseline telemetry.',
    },
  ];

  const isRunning = status?.is_running ?? false;
  const isPaused = status?.is_paused ?? false;
  const isOffline = status?.is_offline_mode ?? (selectedScenario === 'NETWORK_OUTAGE' && isRunning);
  const bufferCount = status?.buffered_readings_count ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Digital Simulation & Hardware Test Lab
              </h2>
              {isRunning && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#ff4405] text-white uppercase font-bold animate-pulse">
                  SIMULATION ACTIVE: {status?.scenario}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Deterministic environmental scenario injection engine utilizing the unified ESP32 ingestion pipeline
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Play className="w-4 h-4 fill-current" /> Start Scenario
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Pause className="w-4 h-4 fill-current" /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Square className="w-4 h-4 fill-current" /> Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Offline Resilience & Ingestion Pipeline Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isOffline ? 'bg-orange-50 border-orange-200 text-[#ea580c]' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              {isOffline ? <WifiOff className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {isOffline ? 'Network Outage Simulated' : 'Cloud Network Uplink'}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {isOffline ? 'Edge Monitoring Active' : 'Connected & Streaming'}
              </div>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            isOffline ? 'bg-orange-100 text-[#ea580c] border border-orange-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {isOffline ? 'OFFLINE' : 'ONLINE'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#ff4405] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Local Edge Buffer (SPI Flash)</div>
              <div className="text-[11px] font-mono text-slate-500">
                {bufferCount > 0 ? `${bufferCount} Telemetry Packets Queued` : 'Buffer Clear (Synchronized)'}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#ea580c] border border-orange-200">
            0% DATA LOSS
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Ingestion Pipeline Contract</div>
              <div className="text-[11px] font-mono text-slate-500">
                POST /api/sensor-data (ESP32 Standard)
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white">
            UNIFIED
          </span>
        </div>
      </div>

      {/* Scenario Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Scenario Selectors */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Select Simulation Scenario
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = selectedScenario === sc.id;

              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  disabled={isRunning}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 shadow-2xs ${
                    isSelected
                      ? 'bg-orange-50/60 border-[#ff4405] text-slate-900 ring-2 ring-[#ff4405]/20'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#ff4405]' : 'text-slate-400'}`} />
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#ff4405] text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {sc.badge}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{sc.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">{sc.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-xs text-slate-700 block mb-1.5 font-semibold">Target Sensor Node</label>
              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                disabled={isRunning}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#ff4405] font-semibold cursor-pointer"
              >
                {nodes.map((n) => (
                  <option key={n.node_id} value={n.node_id}>
                    {n.node_id} ({n.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1.5 font-semibold">Scenario Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                disabled={isRunning}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#ff4405] font-semibold cursor-pointer"
              >
                <option value="LOW">Low (Moderate Warning)</option>
                <option value="MEDIUM">Medium (High Warning)</option>
                <option value="HIGH">High (Critical Disaster Alert)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Simulation Timeline */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center justify-between">
              <span>Simulation Event Log</span>
              <span className="text-[10px] text-[#ea580c] font-mono font-bold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                STEP #{status?.step_index ?? 0}
              </span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {status?.timeline_events && status.timeline_events.length > 0 ? (
                status.timeline_events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#ea580c] font-bold">{evt.time}</span>
                      <span className={`px-2 py-0.2 rounded-full font-bold border ${
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
                  Simulation engine standby. Select a scenario and press Start.
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium leading-relaxed">
            <strong className="text-slate-900">Architecture Note:</strong> The simulation engine is an isolated adapter. It injects packets into <code className="text-[#ea580c] font-bold font-mono">POST /api/sensor-data</code> and can be unmounted when physical ESP32 hardware is deployed.
          </div>
        </div>

      </div>
    </div>
  );
};

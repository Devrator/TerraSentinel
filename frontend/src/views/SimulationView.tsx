import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SimulationStatus, SensorNode } from '../types';
import { FlaskConical, Play, Pause, Square, Flame, Droplets, Wind, AlertTriangle, Radio } from 'lucide-react';

interface SimulationViewProps {
  nodes: SensorNode[];
}

export const SimulationView: React.FC<SimulationViewProps> = ({ nodes }) => {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('FIRE');
  const [targetNodeId, setTargetNodeId] = useState<string>('ENV-004');
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
    { id: 'NORMAL', label: 'Baseline Nominal', icon: Radio, desc: 'Normal temperate ambient conditions' },
    { id: 'FIRE', label: 'Wildfire Surge', icon: Flame, desc: 'Rapid thermal rise + humidity drop + smoke AQI spike' },
    { id: 'FLOOD', label: 'Flash Flood Inflow', icon: Droplets, desc: 'Heavy precipitation + barometric pressure depression' },
    { id: 'POLLUTION', label: 'Toxic AQI Inversion', icon: Wind, desc: 'Hazardous particulate surge trapped by cold inversion' },
    { id: 'EXTREME_WEATHER', label: 'Cyclone Storm Front', icon: AlertTriangle, desc: 'High winds + torrential rain + low pressure' },
    { id: 'SENSOR_FAILURE', label: 'Sensor Bus Fault', icon: AlertTriangle, desc: 'Out-of-bounds malformed telemetry test' },
  ];

  const isRunning = status?.is_running ?? false;
  const isPaused = status?.is_paused ?? false;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Digital Simulation & Test Lab
              {isRunning && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase animate-pulse">
                  SIMULATION ACTIVE: {status?.scenario}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
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
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" /> Start Scenario
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" /> Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scenario Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Scenario Selectors */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
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
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-purple-500/15 border-purple-500/50 text-white shadow-xs'
                      : 'bg-[#07110F] border-[#1B2D27] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                    {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{sc.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{sc.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1B2D27]">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Target Sensor Node</label>
              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {nodes.map((n) => (
                  <option key={n.node_id} value={n.node_id}>
                    {n.node_id} ({n.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Scenario Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="LOW">Low (Moderate Warning)</option>
                <option value="MEDIUM">Medium (High Warning)</option>
                <option value="HIGH">High (Critical Disaster Alert)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Simulation Timeline */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Simulation Event Log</span>
              <span className="text-[10px] text-purple-400 font-mono">STEP #{status?.step_index ?? 0}</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {status?.timeline_events && status.timeline_events.length > 0 ? (
                status.timeline_events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-purple-400 font-bold">{evt.time}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        evt.level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {evt.level}
                      </span>
                    </div>
                    <div className="text-slate-200 text-xs">{evt.message}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Simulation engine standby. Select a scenario and press Start.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] text-[11px] text-slate-400">
            <strong>Pipeline Note:</strong> All simulated data packets are passed through <code>SensorService.ingest_sensor_data()</code> exactly as physical ESP32 packets.
          </div>
        </div>

      </div>
    </div>
  );
};

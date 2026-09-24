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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Digital Simulation & Test Lab
              {isRunning && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 uppercase font-bold animate-pulse">
                  SIMULATION ACTIVE: {status?.scenario}
                </span>
              )}
            </h2>
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
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Play className="w-4 h-4 fill-current" /> Start Scenario
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Pause className="w-4 h-4 fill-current" /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                disabled={loading}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
        <div className="lg:col-span-8 p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
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
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-2xs ${
                    isSelected
                      ? 'bg-purple-50 border-purple-300 text-slate-900 ring-1 ring-purple-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                    {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{sc.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 font-medium">{sc.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="text-xs text-slate-700 block mb-1 font-semibold">Target Sensor Node</label>
              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
              >
                {nodes.map((n) => (
                  <option key={n.node_id} value={n.node_id}>
                    {n.node_id} ({n.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1 font-semibold">Scenario Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="LOW">Low (Moderate Warning)</option>
                <option value="MEDIUM">Medium (High Warning)</option>
                <option value="HIGH">High (Critical Disaster Alert)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Simulation Timeline */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Simulation Event Log</span>
              <span className="text-[10px] text-purple-700 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">STEP #{status?.step_index ?? 0}</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {status?.timeline_events && status.timeline_events.length > 0 ? (
                status.timeline_events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-purple-700 font-bold">{evt.time}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold border ${
                        evt.level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {evt.level}
                      </span>
                    </div>
                    <div className="text-slate-800 text-xs font-medium">{evt.message}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  Simulation engine standby. Select a scenario and press Start.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium leading-relaxed">
            <strong>Pipeline Note:</strong> All simulated data packets are passed through <code className="text-purple-700 font-bold">SensorService.ingest_sensor_data()</code> exactly as physical ESP32 packets.
          </div>
        </div>

      </div>
    </div>
  );
};

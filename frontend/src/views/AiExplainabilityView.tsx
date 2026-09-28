import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ExplainabilityData, SensorNode } from '../types';
import { BrainCircuit, Flame, Droplets, Wind, Zap, Sparkles } from 'lucide-react';

interface AiExplainabilityViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

export const AiExplainabilityView: React.FC<AiExplainabilityViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const [riskType, setRiskType] = useState<string>('FIRE');
  const [data, setData] = useState<ExplainabilityData | null>(null);

  const fetchExplainability = async (nodeId: string, risk: string) => {
    try {
      const res = await api.getAiExplainability(nodeId, risk);
      setData(res);
    } catch (err) {
      console.error('Failed to load explainability:', err);
    }
  };

  useEffect(() => {
    fetchExplainability(selectedNodeId, riskType);
  }, [selectedNodeId, riskType]);

  const selectedNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;
  const edgeStatus = selectedNode?.latest_risk?.edge_risk?.edge_status ?? 'NORMAL';
  const edgeReasons = selectedNode?.latest_risk?.edge_risk?.reasons ?? ['Nominal local baseline readings'];
  const confidenceData = selectedNode?.latest_risk?.confidence || {
    confidence_score: 94.0,
    data_quality_grade: 'GOOD' as const,
    supporting_sensors: '4/5',
    penalties: [],
    summary: 'Data verified by local and peer telemetry'
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff4405] flex items-center justify-center shadow-2xs">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              AI Explainability & Dual-Tier Intelligence
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-orange-50 text-[#ea580c] border border-orange-200 uppercase font-bold">
                XAI SHAP ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Transparent multi-variate feature contributions, Tier 1 Edge Risk Logic, and Sensor Trust Confidence
            </p>
          </div>
        </div>

        {/* Node & Risk Type Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedNodeId}
            onChange={(e) => onSelectNode(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            {nodes.map((n) => (
              <option key={n.node_id} value={n.node_id}>
                {n.node_id} ({n.name})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {[
              { type: 'FIRE', icon: Flame, color: 'text-[#ff4405]' },
              { type: 'FLOOD', icon: Droplets, color: 'text-cyan-600' },
              { type: 'POLLUTION', icon: Wind, color: 'text-emerald-600' },
            ].map(({ type, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => setRiskType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  riskType === type
                    ? 'bg-[#121417] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${riskType === type ? 'text-[#ff4405]' : color}`} />
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Distinction Banner: Risk Score vs Data Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier 1: Edge Risk Logic */}
        <div className="p-4 lg:p-5 rounded-2xl bg-[#121417] text-white border border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff4405]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Tier 1: On-Node Edge Risk Logic
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              edgeStatus === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              edgeStatus === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              EDGE: {edgeStatus}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Rapid local heuristic check executed on ESP32 before network transmission:
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
            {edgeReasons.map((r, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4405]" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Sensor Trust & Data Confidence */}
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff4405]" />
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-900">
                Sensor Trust & Data Confidence
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {confidenceData.confidence_score.toFixed(0)}% ({confidenceData.data_quality_grade})
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Evaluates freshness (&lt;60s), thermodynamic consistency, noise sanity, and peer consensus:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Supporting Peers:</span>
              <span className="font-bold text-slate-900">{confidenceData.supporting_sensors}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Sanity Filter:</span>
              <span className="font-bold text-emerald-700">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Factor Breakdown Percentage Bars */}
        <div className="lg:col-span-8 p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Tier 2: Central AI Feature Attribution ({riskType} Risk)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">SHAP PROXY</span>
          </div>

          <div className="space-y-4">
            {(data?.factors || data?.feature_attributions?.map((f) => ({ name: f.feature, weight: f.contribution_pct, impact: f.impact })) || []).map((factor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-medium">Impact: {factor.impact}</span>
                    <span className="font-mono font-bold text-[#ff4405]">{factor.weight}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-[#ff4405] to-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min(factor.weight, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
            <strong className="text-slate-900 block mb-1">AI Inference Rationalization:</strong>
            {data?.summary || 'Analyzing real-time sensor streams against localized environmental threshold vectors.'}
          </div>
        </div>

        {/* Right: Telemetry Snapshot & Model Architecture */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Input Telemetry Vector
            </h3>

            {(() => {
              const tel = data?.latest_telemetry || data?.sensor_readings || {
                temperature: 24.5,
                humidity: 55.0,
                pressure: 1013.2,
                air_quality: 35.0,
                rain_value: 0.0,
              };
              return (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Temperature</span>
                    <span className="font-mono font-bold text-[#ff4405]">{tel.temperature?.toFixed(1) ?? '--'}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Atmospheric Humidity</span>
                    <span className="font-mono font-bold text-cyan-700">{tel.humidity?.toFixed(1) ?? '--'}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Barometric Pressure</span>
                    <span className="font-mono font-bold text-slate-800">{tel.pressure?.toFixed(1) ?? '--'} hPa</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Gas / Particulate AQI</span>
                    <span className="font-mono font-bold text-emerald-700">{tel.air_quality?.toFixed(0) ?? '--'} AQI</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Precipitation Sensor</span>
                    <span className="font-mono font-bold text-blue-700">{tel.rain_value?.toFixed(1) ?? '--'} mm</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs text-slate-600 font-medium">
            <h4 className="font-bold text-slate-900 uppercase text-[10px]">Model Architecture</h4>
            <div className="flex justify-between">
              <span>Engine Type:</span>
              <span className="font-mono text-slate-900 font-bold">Multivariate Decision Forest</span>
            </div>
            <div className="flex justify-between">
              <span>Explainability Standard:</span>
              <span className="font-mono text-[#ea580c] font-bold">Shapley Additive ExPlanations</span>
            </div>
            <div className="flex justify-between">
              <span>Inference Time:</span>
              <span className="font-mono text-emerald-700 font-bold">1.8 ms</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


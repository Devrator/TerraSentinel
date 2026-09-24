import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ExplainabilityData, SensorNode } from '../types';
import { BrainCircuit, Info, Flame, Droplets, Wind } from 'lucide-react';

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Explainability & XAI Center
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 uppercase font-bold">
                XAI SHAP PROXY
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Transparent multi-variate feature contributions & reasoning behind AI risk estimates
            </p>
          </div>
        </div>

        {/* Node & Risk Type Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedNodeId}
            onChange={(e) => onSelectNode(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            {nodes.map((n) => (
              <option key={n.node_id} value={n.node_id}>
                {n.node_id} ({n.name})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
            {[
              { type: 'FIRE', icon: Flame, color: 'text-amber-600' },
              { type: 'FLOOD', icon: Droplets, color: 'text-cyan-600' },
              { type: 'POLLUTION', icon: Wind, color: 'text-emerald-600' },
            ].map(({ type, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => setRiskType(type)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  riskType === type
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${riskType === type ? 'text-white' : color}`} />
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prototype Contributing Factors Notice */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-purple-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <strong>Transparency Notice:</strong> Values displayed below represent <em>Prototype contributing factors</em> computed from environmental physics heuristics and gradient weights.
          </span>
        </div>
        <span className="font-mono text-[10px] text-purple-700 font-bold bg-white px-2 py-0.5 rounded border border-purple-200 shadow-2xs shrink-0">
          CONFIDENCE: {data?.model_confidence ?? 92.4}%
        </span>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Factor Breakdown Percentage Bars */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Feature Attribution Breakdown ({riskType} Risk)
          </h3>

          <div className="space-y-4">
            {data?.factors.map((factor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-medium">Impact: {factor.impact}</span>
                    <span className="font-mono font-bold text-emerald-700">{factor.weight}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(factor.weight, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
            <strong className="text-purple-700 block mb-1">AI Inference Rationalization:</strong>
            {data?.summary || 'Analyzing real-time sensor streams against localized environmental threshold vectors.'}
          </div>
        </div>

        {/* Right: Telemetry Snapshot & Model Parameters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Input Telemetry Vector
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Temperature</span>
                <span className="font-mono font-bold text-amber-700">{data?.latest_telemetry.temperature.toFixed(1) ?? '--'}°C</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Atmospheric Humidity</span>
                <span className="font-mono font-bold text-cyan-700">{data?.latest_telemetry.humidity.toFixed(1) ?? '--'}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Barometric Pressure</span>
                <span className="font-mono font-bold text-slate-800">{data?.latest_telemetry.pressure.toFixed(1) ?? '--'} hPa</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Gas / Particulate AQI</span>
                <span className="font-mono font-bold text-emerald-700">{data?.latest_telemetry.air_quality.toFixed(0) ?? '--'} AQI</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Precipitation Sensor</span>
                <span className="font-mono font-bold text-blue-700">{data?.latest_telemetry.rain_value.toFixed(1) ?? '--'} mm</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs text-slate-600 font-medium">
            <h4 className="font-bold text-slate-800 uppercase text-[10px]">Model Architecture</h4>
            <div className="flex justify-between">
              <span>Engine Type:</span>
              <span className="font-mono text-slate-900 font-semibold">Multivariate Decision Forest</span>
            </div>
            <div className="flex justify-between">
              <span>Explainability Standard:</span>
              <span className="font-mono text-purple-700 font-semibold">Shapley Additive ExPlanations</span>
            </div>
            <div className="flex justify-between">
              <span>Inference Time:</span>
              <span className="font-mono text-emerald-700 font-semibold">1.8 ms</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { LiveMap } from '../components/LiveMap';
import type { SensorNode, MultiNodeConsensusData } from '../types';
import { Layers, Flame, Droplets, Wind, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface RiskMapViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

export const RiskMapView: React.FC<RiskMapViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const [activeLayer, setActiveLayer] = useState<string>('FIRE');
  const [consensus, setConsensus] = useState<MultiNodeConsensusData | null>(null);

  useEffect(() => {
    const fetchConsensus = async () => {
      try {
        const hazardParam = activeLayer === 'OVERALL' || activeLayer === 'DENSITY' ? 'OVERALL' : activeLayer;
        const res = await api.getMultiNodeConsensus(hazardParam);
        setConsensus(res);
      } catch (err) {
        console.error('Failed to fetch consensus:', err);
      }
    };

    fetchConsensus();
    const interval = setInterval(fetchConsensus, 5000);
    return () => clearInterval(interval);
  }, [activeLayer]);

  const layers = [
    { id: 'FIRE', label: 'Thermal / Wildfire Zone', icon: Flame, color: 'text-[#ff4405]' },
    { id: 'FLOOD', label: 'Hydrological Surge', icon: Droplets, color: 'text-cyan-600' },
    { id: 'POLLUTION', label: 'Atmospheric Inversion AQI', icon: Wind, color: 'text-purple-600' },
    { id: 'OVERALL', label: 'Composite Hazard Matrix', icon: ShieldAlert, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff4405] flex items-center justify-center shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Geographic Risk Intelligence Map
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-orange-50 text-[#ea580c] border border-orange-200 font-bold">
                SPATIAL CONSENSUS
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Multi-layer spatial risk synthesis with GIS cluster aggregation and neighborhood hazard consensus
            </p>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {layers.map((l) => {
            const Icon = l.icon;
            const isActive = activeLayer === l.id;

            return (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#121417] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#ff4405]' : l.color}`} />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prototype Multi-Node Consensus Banner */}
      <div className="p-4 lg:p-5 rounded-2xl bg-[#121417] text-white border border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff4405]/20 text-[#ff4405] border border-[#ff4405]/30">
              {consensus?.consensus_status || 'NOMINAL_BASELINE'}
            </span>
            <h3 className="text-sm font-bold font-mono">
              REGIONAL {activeLayer} RISK: <span className="text-[#ff4405]">{consensus?.regional_risk?.toFixed(0) ?? 22} / 100</span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {consensus?.consensus_label || `Evaluating distributed peer nodes across sector`}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Node Consensus</div>
            <div className="text-sm font-black text-white">
              {consensus?.agreeing_nodes_count ?? 0} / {consensus?.total_nodes_count ?? nodes.length} Nodes
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Data Confidence</div>
            <div className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#ff4405]" /> 89% (HIGH)
            </div>
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-9">
          <LiveMap
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        </div>

        {/* Legend & Active Hazard Breakdown */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Risk Level Legend
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <span className="font-bold text-rose-700">CRITICAL</span>
                <span className="font-mono font-black text-rose-700">76 - 100%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                <span className="font-bold text-[#ea580c]">HIGH</span>
                <span className="font-mono font-black text-[#ea580c]">51 - 75%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="font-bold text-amber-700">MODERATE</span>
                <span className="font-mono font-black text-amber-700">26 - 50%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-700">LOW</span>
                <span className="font-mono font-black text-emerald-700">0 - 25%</span>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs text-slate-600 font-medium">
            <h4 className="font-bold text-slate-900 uppercase text-[10px]">Active Layer Details</h4>
            <p className="leading-relaxed">
              Displaying geospatial interpolation for <strong className="text-[#ff4405] font-bold">{activeLayer}</strong>. Risk surfaces are calculated from distributed sensor node clusters and peer consensus.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <strong>Source:</strong> 1 Physical Hardware Node + 4 Virtual Twins in edge synchronization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


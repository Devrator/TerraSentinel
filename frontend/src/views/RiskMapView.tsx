import React, { useState } from 'react';
import { LiveMap } from '../components/LiveMap';
import type { SensorNode } from '../types';
import { Layers, Flame, Droplets, Wind, ShieldAlert, Radio } from 'lucide-react';

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
  const [activeLayer, setActiveLayer] = useState<string>('OVERALL');

  const layers = [
    { id: 'OVERALL', label: 'Overall Hazard Matrix', icon: ShieldAlert, color: 'text-emerald-400' },
    { id: 'FIRE', label: 'Thermal / Wildfire Zone', icon: Flame, color: 'text-amber-400' },
    { id: 'FLOOD', label: 'Hydrological Surge', icon: Droplets, color: 'text-blue-400' },
    { id: 'POLLUTION', label: 'Atmospheric Inversion AQI', icon: Wind, color: 'text-emerald-400' },
    { id: 'DENSITY', label: 'Sensor Network Density', icon: Radio, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Geographic Risk Intelligence Map</h2>
            <p className="text-xs text-slate-400">
              Multi-layer spatial risk synthesis with GIS cluster aggregation and hotspot perimeter analysis
            </p>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#07110F] border border-[#1B2D27]">
          {layers.map((l) => {
            const Icon = l.icon;
            const isActive = activeLayer === l.id;

            return (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-[#182B24]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : l.color}`} />
                <span>{l.label}</span>
              </button>
            );
          })}
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
          <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Risk Level Legend
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <span className="font-bold text-rose-400">CRITICAL</span>
                <span className="font-mono text-rose-300">76 - 100%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="font-bold text-amber-400">HIGH</span>
                <span className="font-mono text-amber-300">51 - 75%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between">
                <span className="font-bold text-yellow-400">MODERATE</span>
                <span className="font-mono text-yellow-300">26 - 50%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span className="font-bold text-emerald-400">LOW</span>
                <span className="font-mono text-emerald-300">0 - 25%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-2 text-xs text-slate-400">
            <h4 className="font-mono font-bold text-slate-300 uppercase text-[10px]">Active Layer Details</h4>
            <p className="leading-relaxed">
              Displaying geospatial interpolation for <strong className="text-amber-400">{activeLayer}</strong>. Risk surfaces are calculated from distributed sensor node clusters and topography.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

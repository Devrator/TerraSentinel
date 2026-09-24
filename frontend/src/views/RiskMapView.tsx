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
    { id: 'OVERALL', label: 'Overall Hazard Matrix', icon: ShieldAlert, color: 'text-emerald-600' },
    { id: 'FIRE', label: 'Thermal / Wildfire Zone', icon: Flame, color: 'text-amber-600' },
    { id: 'FLOOD', label: 'Hydrological Surge', icon: Droplets, color: 'text-cyan-600' },
    { id: 'POLLUTION', label: 'Atmospheric Inversion AQI', icon: Wind, color: 'text-emerald-600' },
    { id: 'DENSITY', label: 'Sensor Network Density', icon: Radio, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Layers className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Geographic Risk Intelligence Map</h2>
            <p className="text-xs text-slate-500 font-medium">
              Multi-layer spatial risk synthesis with GIS cluster aggregation and hotspot perimeter analysis
            </p>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
          {layers.map((l) => {
            const Icon = l.icon;
            const isActive = activeLayer === l.id;

            return (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : l.color}`} />
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
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Risk Level Legend
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
                <span className="font-bold text-rose-700">CRITICAL</span>
                <span className="font-mono font-bold text-rose-700">76 - 100%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="font-bold text-amber-700">HIGH</span>
                <span className="font-mono font-bold text-amber-700">51 - 75%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between">
                <span className="font-bold text-yellow-700">MODERATE</span>
                <span className="font-mono font-bold text-yellow-700">26 - 50%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-700">LOW</span>
                <span className="font-mono font-bold text-emerald-700">0 - 25%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs text-slate-600 font-medium">
            <h4 className="font-bold text-slate-800 uppercase text-[10px]">Active Layer Details</h4>
            <p className="leading-relaxed">
              Displaying geospatial interpolation for <strong className="text-amber-700 font-bold">{activeLayer}</strong>. Risk surfaces are calculated from distributed sensor node clusters and topography.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

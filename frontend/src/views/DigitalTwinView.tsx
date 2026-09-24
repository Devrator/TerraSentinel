import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DigitalTwinData, SensorNode } from '../types';
import { Globe2 } from 'lucide-react';
import { LiveMap } from '../components/LiveMap';

interface DigitalTwinViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const [offsetMinutes, setOffsetMinutes] = useState<number>(0);
  const [twinData, setTwinData] = useState<DigitalTwinData | null>(null);

  const timeOptions = [
    { label: 'NOW', value: 0 },
    { label: '-15 MIN', value: 15 },
    { label: '-30 MIN', value: 30 },
    { label: '-1 HOUR', value: 60 },
    { label: '-6 HOURS', value: 360 },
    { label: '-24 HOURS', value: 1440 },
  ];

  const fetchTwinData = async (offset: number) => {
    try {
      const res = await api.getDigitalTwin(offset);
      setTwinData(res);
    } catch (err) {
      console.error('Failed to fetch digital twin:', err);
    }
  };

  useEffect(() => {
    fetchTwinData(offsetMinutes);
  }, [offsetMinutes]);

  const selectedTwinNode = twinData?.nodes.find((n) => n.node_id === selectedNodeId) || twinData?.nodes[0] || null;

  return (
    <div className="space-y-5">
      {/* Top Banner & Time Playback Controls */}
      <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Environmental Digital Twin</h2>
              {offsetMinutes > 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                  Historical Playback (-{offsetMinutes >= 60 ? `${offsetMinutes / 60}h` : `${offsetMinutes}m`})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                  Live Snapshot
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Spatial representation of monitored biome with state recreation from PostgreSQL timeseries
            </p>
          </div>
        </div>

        {/* Time Playback Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#07110F] border border-[#1B2D27]">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOffsetMinutes(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                offsetMinutes === opt.value
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-[#182B24]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Twin Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Twin Map */}
        <div className="lg:col-span-8">
          <LiveMap
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        </div>

        {/* Right: Digital Twin Spatial Metrics & State */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Spatial Coverage Card */}
          <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Biome Coverage Geometry
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                <div className="text-[10px] text-slate-500">Effective Area</div>
                <div className="font-mono text-base font-bold text-emerald-400">
                  {twinData?.coverage_summary.effective_monitoring_area_km2 ?? 3.92} km²
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                <div className="text-[10px] text-slate-500">Node Density</div>
                <div className="font-mono text-base font-bold text-white">
                  {twinData?.coverage_summary.spatial_density ?? '1.2 nodes/km²'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Coverage Radius Per Node:</span>
                <span className="font-mono text-slate-200">500 meters</span>
              </div>
              <div className="flex justify-between">
                <span>Total Mapped Nodes:</span>
                <span className="font-mono text-slate-200">{twinData?.nodes.length ?? 5} Nodes</span>
              </div>
            </div>
          </div>

          {/* Node Historical / Live State Snapshot */}
          <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Node State Snapshot</span>
              <span className="text-[10px] text-emerald-400">{selectedTwinNode?.node_id ?? selectedNodeId}</span>
            </h3>

            {selectedTwinNode ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                    <div className="text-[10px] text-slate-500">Temperature</div>
                    <div className="font-mono font-bold text-amber-400 text-sm">
                      {selectedTwinNode.telemetry.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                    <div className="text-[10px] text-slate-500">Humidity</div>
                    <div className="font-mono font-bold text-blue-400 text-sm">
                      {selectedTwinNode.telemetry.humidity.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                    <div className="text-[10px] text-slate-500">Pressure</div>
                    <div className="font-mono font-bold text-slate-200 text-sm">
                      {selectedTwinNode.telemetry.pressure.toFixed(1)} hPa
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                    <div className="text-[10px] text-slate-500">Air Quality</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      {selectedTwinNode.telemetry.air_quality.toFixed(0)} AQI
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] space-y-2">
                  <div className="text-[11px] font-bold text-slate-300">Composite Risk at Selected Time</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Fire Hazard:</span>
                      <span className="font-mono text-amber-400 font-bold">{selectedTwinNode.risk.fire_risk.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Flood Inflow:</span>
                      <span className="font-mono text-blue-400 font-bold">{selectedTwinNode.risk.flood_risk.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Pollution Index:</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedTwinNode.risk.pollution_risk.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-4">No node selected</div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

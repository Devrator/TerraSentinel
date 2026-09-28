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
    { label: 'LIVE NOW', value: 0 },
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
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Environmental Digital Twin</h2>
              {offsetMinutes > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-orange-50 text-[#ea580c] border border-orange-200 uppercase font-bold">
                  Historical Playback (-{offsetMinutes >= 60 ? `${offsetMinutes / 60}h` : `${offsetMinutes}m`})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-bold">
                  Live Spatial Snapshot
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Spatial representation of monitored biome with state recreation from PostgreSQL timeseries
            </p>
          </div>
        </div>

        {/* Time Playback Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOffsetMinutes(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                offsetMinutes === opt.value
                  ? 'bg-[#121417] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Biome Coverage Geometry
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-medium">Effective Area</div>
                <div className="font-mono text-base font-bold text-slate-900 mt-0.5">
                  {twinData?.coverage_summary.effective_monitoring_area_km2 ?? 3.92} km²
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-medium">Node Density</div>
                <div className="font-mono text-base font-bold text-[#ea580c] mt-0.5">
                  {twinData?.coverage_summary.spatial_density ?? '1.2 nodes/km²'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span>Coverage Radius Per Node:</span>
                <span className="font-mono text-slate-900 font-bold">500 meters</span>
              </div>
              <div className="flex justify-between">
                <span>Total Mapped Nodes:</span>
                <span className="font-mono text-slate-900 font-bold">{twinData?.nodes.length ?? 5} Nodes</span>
              </div>
            </div>
          </div>

          {/* Node Historical / Live State Snapshot */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>Node State Snapshot</span>
              <span className="text-[10px] font-mono text-[#ff4405] font-bold">{selectedTwinNode?.node_id ?? selectedNodeId}</span>
            </h3>

            {selectedTwinNode ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Temperature</div>
                    <div className="font-mono font-bold text-[#ea580c] text-sm mt-0.5">
                      {selectedTwinNode.telemetry.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Humidity</div>
                    <div className="font-mono font-bold text-blue-700 text-sm mt-0.5">
                      {selectedTwinNode.telemetry.humidity.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Pressure</div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {selectedTwinNode.telemetry.pressure.toFixed(1)} hPa
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Air Quality</div>
                    <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                      {selectedTwinNode.telemetry.air_quality.toFixed(0)} AQI
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-900">Composite Risk at Selected Time</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Fire Hazard:</span>
                      <span className="font-mono text-[#ea580c] font-bold">{selectedTwinNode.risk.fire_risk.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Flood Inflow:</span>
                      <span className="font-mono text-blue-700 font-bold">{selectedTwinNode.risk.flood_risk.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Pollution Index:</span>
                      <span className="font-mono text-emerald-700 font-bold">{selectedTwinNode.risk.pollution_risk.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-6 font-medium">No node selected</div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

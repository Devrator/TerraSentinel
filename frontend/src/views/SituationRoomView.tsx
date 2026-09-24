import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SituationRoomData, SensorNode } from '../types';
import { ShieldAlert, RefreshCw, Radio } from 'lucide-react';
import { LiveMap } from '../components/LiveMap';

interface SituationRoomViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

export const SituationRoomView: React.FC<SituationRoomViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const [data, setData] = useState<SituationRoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSituationRoom = async () => {
    try {
      setLoading(true);
      const res = await api.getSituationRoom();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSituationRoom();
    const interval = setInterval(fetchSituationRoom, 5000);
    return () => clearInterval(interval);
  }, []);

  const selectedNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Environmental Situation Room
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 uppercase font-bold">
                {data?.system_status || 'CRITICAL READINESS'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              High-level command-center interface for emergency environmental operators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSituationRoom}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Sync Ops
          </button>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Threat Hierarchy */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Threat Hierarchy
            </h3>

            <div className="space-y-2">
              {/* CRITICAL */}
              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-rose-700">CRITICAL</span>
                </div>
                <span className="font-mono text-sm font-bold text-rose-700">
                  {data?.threat_hierarchy.critical_count ?? 0}
                </span>
              </div>

              {/* HIGH */}
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-700">HIGH</span>
                </div>
                <span className="font-mono text-sm font-bold text-amber-700">
                  {data?.threat_hierarchy.high_count ?? 0}
                </span>
              </div>

              {/* MODERATE */}
              <div className="p-3 rounded-lg bg-yellow-50/70 border border-yellow-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="text-xs font-bold text-yellow-700">MODERATE</span>
                </div>
                <span className="font-mono text-sm font-bold text-yellow-700">
                  {data?.threat_hierarchy.moderate_count ?? 0}
                </span>
              </div>

              {/* LOW */}
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">LOW</span>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-700">
                  {data?.threat_hierarchy.low_count ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Active Threat Zones List */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Hazard Perimeters
            </h4>
            {data?.active_threat_zones && data.active_threat_zones.length > 0 ? (
              data.active_threat_zones.map((zone) => (
                <button
                  key={zone.zone_id}
                  onClick={() => onSelectNode(zone.node_id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    zone.node_id === selectedNodeId
                      ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{zone.node_id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold border border-rose-200">
                      {zone.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 font-medium">
                    <span>{zone.risk_type} Hazard</span>
                    <span>•</span>
                    <span className="font-mono text-rose-600 font-bold">{zone.score}%</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">
                No active critical hazard perimeters
              </div>
            )}
          </div>
        </div>

        {/* Center: Command Center Map */}
        <div className="lg:col-span-6">
          <LiveMap
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        </div>

        {/* Right: Selected Threat Detail */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Perimeter Telemetry
            </h3>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{selectedNode.node_id}</div>
                    <div className="text-[11px] text-slate-500">{selectedNode.name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedNode.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Temperature</div>
                    <div className="font-mono font-bold text-amber-700 text-sm">
                      {selectedNode.latest_reading?.temperature.toFixed(1) ?? '--'}°C
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Humidity</div>
                    <div className="font-mono font-bold text-cyan-700 text-sm">
                      {selectedNode.latest_reading?.humidity.toFixed(1) ?? '--'}%
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Air Quality</div>
                    <div className="font-mono font-bold text-emerald-700 text-sm">
                      {selectedNode.latest_reading?.air_quality.toFixed(0) ?? '--'} AQI
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Battery</div>
                    <div className="font-mono font-bold text-slate-800 text-sm">
                      {selectedNode.battery_percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-800">Composite Risk Rating</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">AI Hazard Score:</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      {selectedNode.latest_risk?.overall_risk.toFixed(1) ?? '15.0'}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium">Select a node from map</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom: Live Event Timeline */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Live Environmental Event Timeline
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">REAL-TIME TELEMETRY FEED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.live_timeline && data.live_timeline.length > 0 ? (
            data.live_timeline.map((event, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">{event.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold border ${
                    event.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {event.node_id}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {event.event}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-4 text-xs text-slate-400 font-medium">
              No recent hazard events logged. System nominal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

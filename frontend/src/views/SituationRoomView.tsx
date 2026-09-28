import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SituationRoomData, SensorNode, MultiNodeConsensusData } from '../types';
import { ShieldAlert, RefreshCw, Radio, Wifi, Zap, Sparkles, Layers, ShieldCheck } from 'lucide-react';
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
  const [consensus, setConsensus] = useState<MultiNodeConsensusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSituationRoom = async () => {
    try {
      setLoading(true);
      const [roomData, consensusData] = await Promise.all([
        api.getSituationRoom(),
        api.getMultiNodeConsensus('FIRE'),
      ]);
      setData(roomData);
      setConsensus(consensusData);
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
  const isAllOnline = nodes.every((n) => n.status === 'ONLINE');
  const edgeStatus = selectedNode?.latest_risk?.edge_risk?.edge_status ?? 'NORMAL';
  const confidenceScore = selectedNode?.latest_risk?.confidence?.confidence_score ?? 92;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff4405] flex items-center justify-center shadow-2xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Environmental Situation Room
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-orange-50 text-[#ea580c] border border-orange-200 uppercase font-bold">
                {data?.system_status || 'COMMAND ACTIVE'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              High-level command-center interface for emergency environmental operators & incident triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Offline Resilience State Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAllOnline ? 'NETWORK LIVE' : 'EDGE BUFFER ACTIVE'}</span>
          </div>

          <button
            onClick={fetchSituationRoom}
            className="px-3.5 py-1.5 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4405]' : ''}`} />
            Sync Ops
          </button>
        </div>
      </div>

      {/* Distributed Consensus & Resilience Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#ff4405]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Autonomous Spatial Consensus</div>
              <div className="text-xs font-extrabold text-slate-900">
                {consensus?.consensus_label || 'All nodes reporting nominal regional conditions'}
              </div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-slate-900 px-2.5 py-1 rounded-full bg-slate-100">
            {consensus?.agreeing_nodes_count ?? 0}/{consensus?.total_nodes_count ?? 5} Nodes
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Edge Offline Resilience</div>
              <div className="text-xs font-extrabold text-slate-900">
                Local SPI Flash Queue • Zero Data Loss Protocol
              </div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            100% RELIABLE
          </span>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Threat Hierarchy */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Threat Hierarchy
            </h3>

            <div className="space-y-2">
              {/* CRITICAL */}
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-rose-700">CRITICAL</span>
                </div>
                <span className="font-mono text-sm font-black text-rose-700">
                  {data?.threat_hierarchy?.critical_count ?? 0}
                </span>
              </div>

              {/* HIGH */}
              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-xs font-bold text-[#ea580c]">HIGH</span>
                </div>
                <span className="font-mono text-sm font-black text-[#ea580c]">
                  {data?.threat_hierarchy?.high_count ?? 0}
                </span>
              </div>

              {/* MODERATE */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-700">MODERATE</span>
                </div>
                <span className="font-mono text-sm font-black text-amber-700">
                  {data?.threat_hierarchy?.moderate_count ?? 0}
                </span>
              </div>

              {/* LOW */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">LOW</span>
                </div>
                <span className="font-mono text-sm font-black text-emerald-700">
                  {data?.threat_hierarchy?.low_count ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Active Threat Zones List */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Active Hazard Perimeters
            </h4>
            {data?.active_threat_zones && data.active_threat_zones.length > 0 ? (
              data.active_threat_zones.map((zone) => (
                <button
                  key={zone.zone_id}
                  onClick={() => onSelectNode(zone.node_id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    zone.node_id === selectedNodeId
                      ? 'bg-orange-50 border-orange-300 text-orange-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{zone.node_id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">
                      {zone.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-2 font-medium">
                    <span>{zone.risk_type} Hazard</span>
                    <span>•</span>
                    <span className="font-mono text-[#ff4405] font-bold">{zone.score}%</span>
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
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Perimeter Telemetry
            </h3>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      {selectedNode.node_id}
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-white font-bold">
                        {selectedNode.node_id.includes('005') ? 'ESP32' : 'TWIN'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{selectedNode.name}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    selectedNode.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>

                {/* Dual-Tier Intelligence Pills */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2.5 rounded-xl bg-[#121417] text-white">
                    <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <Zap className="w-3 h-3 text-[#ff4405]" /> Tier 1 Edge
                    </div>
                    <div className="font-bold text-[#ff4405]">{edgeStatus}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200">
                    <div className="text-slate-500 flex items-center gap-1 mb-0.5 font-bold">
                      <Sparkles className="w-3 h-3 text-[#ff4405]" /> Trust Score
                    </div>
                    <div className="font-bold">{confidenceScore.toFixed(0)}% (GOOD)</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Temperature</div>
                    <div className="font-mono font-bold text-[#ff4405] text-sm">
                      {selectedNode.latest_reading?.temperature.toFixed(1) ?? '--'}°C
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Humidity</div>
                    <div className="font-mono font-bold text-cyan-700 text-sm">
                      {selectedNode.latest_reading?.humidity.toFixed(1) ?? '--'}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Air Quality</div>
                    <div className="font-mono font-bold text-emerald-700 text-sm">
                      {selectedNode.latest_reading?.air_quality.toFixed(0) ?? '--'} AQI
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">Battery</div>
                    <div className="font-mono font-bold text-slate-800 text-sm">
                      {selectedNode.battery_percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-800">Composite Risk Rating</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">AI Hazard Score:</span>
                    <span className="font-mono font-bold text-[#ff4405] text-sm">
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
      <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Environmental Event Timeline
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">REAL-TIME TELEMETRY FEED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.live_timeline && data.live_timeline.length > 0 ? (
            data.live_timeline.map((event, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">{event.timestamp}</span>
                  <span className={`px-2 py-0.2 rounded-full font-bold border ${
                    event.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {event.node_id}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-2">
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


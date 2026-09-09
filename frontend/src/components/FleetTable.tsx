import React from 'react';
import { Cpu, Battery, Eye } from 'lucide-react';
import type { SensorNode } from '../types';

interface FleetTableProps {
  nodes: SensorNode[];
  onSelectNode: (nodeId: string) => void;
  onOpenDetailModal: (node: SensorNode) => void;
}

export const FleetTable: React.FC<FleetTableProps> = ({
  nodes,
  onSelectNode,
  onOpenDetailModal,
}) => {
  const getStatusBadge = (status: string) => {
    if (status === 'ONLINE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700/60 text-slate-400 border border-slate-600/40">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        OFFLINE
      </span>
    );
  };

  const getRiskBadge = (score?: number) => {
    const val = score ?? 0;
    if (val > 75) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">{val.toFixed(0)}% CRITICAL</span>;
    if (val > 50) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">{val.toFixed(0)}% HIGH</span>;
    if (val > 25) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">{val.toFixed(0)}% MODERATE</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">{val.toFixed(0)}% LOW</span>;
  };

  return (
    <div className="rounded-xl border border-dark-700 bg-dark-900 overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-dark-850 border-b border-dark-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Sensor Node Fleet Registry
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {nodes.length} Nodes Registered
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-dark-950/60 border-b border-dark-700/60 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4">Node ID</th>
              <th className="py-3 px-4">Location / Station</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Temperature</th>
              <th className="py-3 px-4">Humidity</th>
              <th className="py-3 px-4">Air Quality</th>
              <th className="py-3 px-4">Battery</th>
              <th className="py-3 px-4">Hazard Risk</th>
              <th className="py-3 px-4">Last Seen</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-750">
            {nodes.map((node) => (
              <tr
                key={node.node_id}
                className="hover:bg-dark-800/60 transition-colors group cursor-pointer"
                onClick={() => onSelectNode(node.node_id)}
              >
                <td className="py-3 px-4 font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                  {node.node_id}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  <div className="font-medium text-slate-200">{node.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {node.latitude.toFixed(4)}°N, {node.longitude.toFixed(4)}°E
                  </div>
                </td>
                <td className="py-3 px-4">{getStatusBadge(node.status)}</td>
                <td className="py-3 px-4 font-mono text-slate-200">
                  {node.latest_reading ? `${node.latest_reading.temperature.toFixed(1)} °C` : '--'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-200">
                  {node.latest_reading ? `${node.latest_reading.humidity.toFixed(1)} %` : '--'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-200">
                  {node.latest_reading ? `${node.latest_reading.air_quality.toFixed(0)} AQI` : '--'}
                </td>
                <td className="py-3 px-4 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-3.5 h-3.5 ${node.battery_percentage < 20 ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className={node.battery_percentage < 20 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                      {node.battery_percentage.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {getRiskBadge(node.latest_risk?.overall_risk)}
                </td>
                <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                  {node.last_seen ? new Date(node.last_seen).toLocaleTimeString() : 'Never'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetailModal(node);
                    }}
                    className="p-1.5 rounded-lg bg-dark-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-dark-700 hover:border-emerald-500/40 transition-all inline-flex items-center gap-1 text-[11px]"
                    title="View Node Diagnostics"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Details</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

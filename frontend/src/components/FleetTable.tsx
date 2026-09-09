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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ONLINE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        OFFLINE
      </span>
    );
  };

  const getRiskBadge = (score?: number) => {
    const val = score ?? 0;
    if (val > 75) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300 font-mono">{val.toFixed(0)}% CRITICAL</span>;
    if (val > 50) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-300 font-mono">{val.toFixed(0)}% HIGH</span>;
    if (val > 25) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 font-mono">{val.toFixed(0)}% MODERATE</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">{val.toFixed(0)}% LOW</span>;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Sensor Node Fleet Registry
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {nodes.length} Nodes Registered
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <th className="py-3 px-4 font-semibold">Node ID</th>
              <th className="py-3 px-4 font-semibold">Location / Station</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Temperature</th>
              <th className="py-3 px-4 font-semibold">Humidity</th>
              <th className="py-3 px-4 font-semibold">Air Quality</th>
              <th className="py-3 px-4 font-semibold">Battery</th>
              <th className="py-3 px-4 font-semibold">Hazard Risk</th>
              <th className="py-3 px-4 font-semibold">Last Sync</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nodes.map((node) => (
              <tr
                key={node.node_id}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => onSelectNode(node.node_id)}
              >
                <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {node.node_id}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  <div className="font-semibold text-slate-900">{node.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {node.latitude.toFixed(4)}°N, {node.longitude.toFixed(4)}°E
                  </div>
                </td>
                <td className="py-3 px-4">{getStatusBadge(node.status)}</td>
                <td className="py-3 px-4 font-mono text-slate-800">
                  {node.latest_reading ? `${node.latest_reading.temperature.toFixed(1)} °C` : '--'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-800">
                  {node.latest_reading ? `${node.latest_reading.humidity.toFixed(1)} %` : '--'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-800">
                  {node.latest_reading ? `${node.latest_reading.air_quality.toFixed(0)} AQI` : '--'}
                </td>
                <td className="py-3 px-4 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-3.5 h-3.5 ${node.battery_percentage < 20 ? 'text-rose-600' : 'text-emerald-600'}`} />
                    <span className={node.battery_percentage < 20 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {node.battery_percentage.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {getRiskBadge(node.latest_risk?.overall_risk)}
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                  {node.last_seen ? new Date(node.last_seen).toLocaleTimeString() : 'Never'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetailModal(node);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
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

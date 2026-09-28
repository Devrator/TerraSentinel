import React, { useState } from 'react';
import { Battery, Eye, Search, SlidersHorizontal, ChevronDown, ExternalLink } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('ALL');

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.node_id.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterSector === 'ONLINE') return matchesSearch && node.status === 'ONLINE';
    if (filterSector === 'OFFLINE') return matchesSearch && node.status !== 'ONLINE';
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'ONLINE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Edge Buffer
      </span>
    );
  };

  const getRiskBadge = (score?: number) => {
    const val = score ?? 0;
    if (val > 75) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">{val.toFixed(0)}% CRITICAL</span>;
    if (val > 50) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 font-mono">{val.toFixed(0)}% HIGH</span>;
    if (val > 25) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">{val.toFixed(0)}% MODERATE</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">{val.toFixed(0)}% LOW</span>;
  };

  const getNodeIcon = (nodeId: string, index: number) => {
    const colors = [
      'bg-blue-600 text-white',
      'bg-[#ff4405] text-white',
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
    ];
    const color = colors[index % colors.length];

    return (
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center font-bold text-xs shadow-2xs`}>
        {nodeId.includes('005') ? 'HW' : `E${index + 1}`}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
      {/* Top Search & Filter Bar (Matching Reference Image) */}
      <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Distributed Node Fleet Registry
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Active telemetry uplinks, hardware power metrics & edge consensus states
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search nodes or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setFilterSector(filterSector === 'ALL' ? 'ONLINE' : filterSector === 'ONLINE' ? 'OFFLINE' : 'ALL')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter: {filterSector}</span>
          </button>

          {/* Dropdown Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-2xs">
            <span>All Sectors</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
              <th className="py-3 px-4 font-bold">Node Identification</th>
              <th className="py-3 px-4 font-bold">Cluster Region</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4 font-bold">Temperature</th>
              <th className="py-3 px-4 font-bold">Moisture</th>
              <th className="py-3 px-4 font-bold">Air Quality</th>
              <th className="py-3 px-4 font-bold">Power</th>
              <th className="py-3 px-4 font-bold">Risk Assessment</th>
              <th className="py-3 px-4 text-right font-bold">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredNodes.map((node, index) => (
              <tr
                key={node.node_id}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => onSelectNode(node.node_id)}
              >
                {/* Number (e.g. 01, 02) */}
                <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-center">
                  {String(index + 1).padStart(2, '0')}
                </td>

                {/* Node Identification with Colored Circular Badge */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    {getNodeIcon(node.node_id, index)}
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{node.name}</span>
                        {node.node_id.includes('005') && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-purple-100 text-purple-800">
                            Physical
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: {node.node_id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="py-3.5 px-4 text-slate-700">
                  <div className="font-semibold text-slate-800">Sector {String.fromCharCode(65 + index)}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {node.latitude.toFixed(4)}°N, {node.longitude.toFixed(4)}°E
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">{getStatusBadge(node.status)}</td>

                {/* Temperature */}
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {node.latest_reading ? `${node.latest_reading.temperature.toFixed(1)}°C` : '--'}
                </td>

                {/* Humidity */}
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {node.latest_reading ? `${node.latest_reading.humidity.toFixed(0)}%` : '--'}
                </td>

                {/* Air Quality */}
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {node.latest_reading ? `${node.latest_reading.air_quality.toFixed(0)} AQI` : '--'}
                </td>

                {/* Battery */}
                <td className="py-3.5 px-4 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-3.5 h-3.5 ${node.battery_percentage < 20 ? 'text-rose-600' : 'text-emerald-600'}`} />
                    <span className={`font-bold ${node.battery_percentage < 20 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {node.battery_percentage.toFixed(0)}%
                    </span>
                  </div>
                </td>

                {/* Hazard Risk */}
                <td className="py-3.5 px-4">
                  {getRiskBadge(node.latest_risk?.overall_risk)}
                </td>

                {/* Actions (View & Modal) */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNode(node.node_id);
                      }}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                      title="Select Node"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetailModal(node);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-zinc-800 text-white transition-all cursor-pointer shadow-2xs"
                      title="Full Diagnostics Modal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


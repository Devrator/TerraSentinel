import React, { useState } from 'react';
import type { SensorNode } from '../types';
import { FleetTable } from '../components/FleetTable';
import { Boxes, Search } from 'lucide-react';

interface SensorNetworkViewProps {
  nodes: SensorNode[];
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
  onOpenDetailModal: (node: SensorNode) => void;
}

export const SensorNetworkView: React.FC<SensorNetworkViewProps> = ({
  nodes,
  onSelectNode,
  onOpenDetailModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredNodes = nodes.filter(
    (n) =>
      n.node_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Sensor Fleet Registry & Network</h2>
            <p className="text-xs text-slate-400">
              Manage distributed ESP32 IoT nodes, probe configurations, and real-time operational telemetry
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search node ID or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <FleetTable
        nodes={filteredNodes}
        onSelectNode={onSelectNode}
        onOpenDetailModal={onOpenDetailModal}
      />
    </div>
  );
};

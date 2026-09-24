import React from 'react';
import type { SensorNode, Alert } from '../types';
import { SensorOverview } from '../components/SensorOverview';
import { RiskPanel } from '../components/RiskPanel';
import { AlertPanel } from '../components/AlertPanel';
import { Radio } from 'lucide-react';

interface LiveMonitoringViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  alerts: Alert[];
  onAcknowledgeAlert: (id: number) => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  alerts,
  onAcknowledgeAlert,
}) => {
  const selectedNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Real-Time Sensor Telemetry Stream</h2>
            <p className="text-xs text-slate-500">
              High-frequency multi-sensor telemetry monitoring, atmospheric vectors, and composite AI hazard ratings
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700 font-bold">
          LIVE WEBSOCKET STREAM
        </span>
      </div>

      {/* Sensor Overview */}
      <SensorOverview
        selectedNode={selectedNode}
        nodes={nodes}
        onSelectNode={onSelectNode}
      />

      {/* Risk Panel & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <RiskPanel
            selectedNode={selectedNode}
            nodes={nodes}
            onSelectNode={onSelectNode}
            demoMode={true}
          />
        </div>
        <div className="lg:col-span-5">
          <AlertPanel
            alerts={alerts}
            onAcknowledge={onAcknowledgeAlert}
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { KpiCards } from '../components/KpiCards';
import { LiveMap } from '../components/LiveMap';
import { AlertPanel } from '../components/AlertPanel';
import { RiskPanel } from '../components/RiskPanel';
import { SensorOverview } from '../components/SensorOverview';
import { HistoricalCharts } from '../components/HistoricalCharts';
import { FleetTable } from '../components/FleetTable';
import type { SensorNode, Alert, DashboardSummary } from '../types';

interface DashboardViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  alerts: Alert[];
  onAcknowledgeAlert: (id: number) => void;
  summary: DashboardSummary | null;
  isLoading: boolean;
  onOpenDetailModal: (node: SensorNode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  alerts,
  onAcknowledgeAlert,
  summary,
  isLoading,
  onOpenDetailModal,
}) => {
  const selectedNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;

  return (
    <div className="space-y-5">
      {/* 1. Fleet KPI Ribbon */}
      <KpiCards summary={summary} loading={isLoading} />

      {/* 2. Geospatial Map & Real-Time Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <LiveMap
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        </div>
        <div className="lg:col-span-5">
          <AlertPanel
            alerts={alerts}
            onAcknowledge={onAcknowledgeAlert}
          />
        </div>
      </div>

      {/* 3. AI Environmental Risk Assessment Section */}
      <RiskPanel
        selectedNode={selectedNode}
        nodes={nodes}
        onSelectNode={onSelectNode}
        demoMode={summary?.demo_mode ?? true}
      />

      {/* 4. Live Sensor Metrics Overview Cards */}
      <SensorOverview
        selectedNode={selectedNode}
        nodes={nodes}
        onSelectNode={onSelectNode}
      />

      {/* 5. Historical Telemetry Analysis */}
      <HistoricalCharts selectedNodeId={selectedNodeId} />

      {/* 6. Fleet Registry Table */}
      <FleetTable
        nodes={nodes}
        onSelectNode={onSelectNode}
        onOpenDetailModal={onOpenDetailModal}
      />
    </div>
  );
};

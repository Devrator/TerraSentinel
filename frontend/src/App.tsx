import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { LiveMap } from './components/LiveMap';
import { SensorOverview } from './components/SensorOverview';
import { RiskPanel } from './components/RiskPanel';
import { HistoricalCharts } from './components/HistoricalCharts';
import { AlertPanel } from './components/AlertPanel';
import { FleetTable } from './components/FleetTable';
import { NodeDetailModal } from './components/NodeDetailModal';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';
import type { SensorNode, Alert, DashboardSummary, WebSocketSensorUpdate, WebSocketNodeStatusUpdate } from './types';
import { WifiOff, RefreshCw } from 'lucide-react';

export function App() {
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ENV-001');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [modalNode, setModalNode] = useState<SensorNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Initial data loader
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);
    try {
      const [summaryData, nodesData, alertsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getNodes(),
        api.getAlerts({ limit: 50 }),
      ]);

      setSummary(summaryData);
      setNodes(nodesData);
      setAlerts(alertsData);

      if (nodesData.length > 0 && !nodesData.some((n) => n.node_id === selectedNodeId)) {
        setSelectedNodeId(nodesData[0].node_id);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setBackendError(err.message || 'Unable to connect to FastAPI backend');
    } finally {
      setIsLoading(false);
    }
  }, [selectedNodeId]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // WebSocket event handlers
  const handleSensorUpdate = useCallback((data: WebSocketSensorUpdate) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.node_id === data.node_id) {
          return {
            ...n,
            status: 'ONLINE',
            last_seen: data.node.last_seen,
            battery_percentage: data.reading.battery_percentage,
            latitude: data.reading.latitude,
            longitude: data.reading.longitude,
            latest_reading: data.reading,
            latest_risk: data.risk,
          };
        }
        return n;
      })
    );

    // If new alerts were generated in this telemetry packet, prepend them
    if (data.new_alerts && data.new_alerts.length > 0) {
      setAlerts((prevAlerts) => {
        const newIds = new Set(data.new_alerts.map((a) => a.id));
        const filteredPrev = prevAlerts.filter((a) => !newIds.has(a.id));
        return [...data.new_alerts, ...filteredPrev];
      });
    }

    // Refresh KPI summary counters
    api.getDashboardSummary().then(setSummary).catch(console.error);
  }, []);

  const handleNodeStatusUpdate = useCallback((data: WebSocketNodeStatusUpdate) => {
    if (data.nodes) {
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          const match = data.nodes.find((item) => item.node_id === n.node_id);
          if (match) {
            return {
              ...n,
              status: match.status,
              last_seen: match.last_seen,
            };
          }
          return n;
        })
      );
    }
  }, []);

  const { isConnected, lastMessageTime } = useWebSocket({
    onSensorUpdate: handleSensorUpdate,
    onNodeStatusUpdate: handleNodeStatusUpdate,
  });

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await api.acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
      // Refresh summary
      api.getDashboardSummary().then(setSummary).catch(console.error);
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const selectedNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        summary={summary}
        isConnected={isConnected}
        lastUpdateTime={lastMessageTime}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />

      {/* Main Command Center Canvas */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Backend Connectivity Alert Banner */}
        {backendError && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center justify-between gap-4 text-rose-300 animate-fadeIn">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="font-bold text-sm">Backend Communication Offline</div>
                <div className="text-xs text-rose-400/80">
                  {backendError}. Ensure FastAPI is running at <code className="bg-dark-900 px-1.5 py-0.5 rounded font-mono">http://localhost:8000</code>.
                </div>
              </div>
            </div>
            <button
              onClick={loadDashboardData}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reconnect
            </button>
          </div>
        )}

        {/* 1. Fleet-Wide KPI Ribbon */}
        <KpiCards summary={summary} loading={isLoading} />

        {/* 2. Geospatial Map & Real-Time Alert Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <LiveMap
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>
          <div className="lg:col-span-5">
            <AlertPanel
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
            />
          </div>
        </div>

        {/* 3. AI Environmental Risk Assessment Engine */}
        <RiskPanel
          selectedNode={selectedNode}
          nodes={nodes}
          onSelectNode={setSelectedNodeId}
          demoMode={summary?.demo_mode ?? true}
        />

        {/* 4. Live Sensor Overview Metrics */}
        <SensorOverview
          selectedNode={selectedNode}
          nodes={nodes}
          onSelectNode={setSelectedNodeId}
        />

        {/* 5. Historical Analysis Area Chart */}
        <HistoricalCharts selectedNodeId={selectedNodeId} />

        {/* 6. Complete Fleet Management Registry */}
        <FleetTable
          nodes={nodes}
          onSelectNode={setSelectedNodeId}
          onOpenDetailModal={setModalNode}
        />

      </main>

      {/* Diagnostics Modal */}
      {modalNode && (
        <NodeDetailModal
          node={modalNode}
          onClose={() => setModalNode(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-[1600px] mx-auto gap-2">
          <div className="font-mono">
            SIH26178 — Distributed IoT Environmental Hazard Network
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI Backend Contract Active</span>
            <span>•</span>
            <span>Zero-Hardware Phase-1 Compatible</span>
            <span>•</span>
            <span className="text-emerald-400">ESP32 Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

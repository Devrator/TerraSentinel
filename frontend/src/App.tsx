import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NodeDetailModal } from './components/NodeDetailModal';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';
import type {
  SensorNode,
  Alert,
  DashboardSummary,
  WebSocketSensorUpdate,
  WebSocketNodeStatusUpdate,
  NavigationTab
} from './types';

// Import Views
import { DashboardView } from './views/DashboardView';
import { SituationRoomView } from './views/SituationRoomView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { AiExplainabilityView } from './views/AiExplainabilityView';
import { AnomaliesView } from './views/AnomaliesView';
import { RiskMapView } from './views/RiskMapView';
import { AnalyticsTrendsView } from './views/AnalyticsTrendsView';
import { EarlyWarningView } from './views/EarlyWarningView';
import { IncidentsView } from './views/IncidentsView';
import { ResponseRecommendationsView } from './views/ResponseRecommendationsView';
import { SensorNetworkView } from './views/SensorNetworkView';
import { SensorHealthView } from './views/SensorHealthView';
import { NetworkTopologyView } from './views/NetworkTopologyView';
import { DataQualityView } from './views/DataQualityView';
import { SimulationView } from './views/SimulationView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { SystemObservabilityView } from './views/SystemObservabilityView';
import { AuditLogView } from './views/AuditLogView';
import { ConfigurationView } from './views/ConfigurationView';
import { SustainabilityImpactView } from './views/SustainabilityImpactView';
import { SettingsView } from './views/SettingsView';

import { WifiOff, RefreshCw } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ENV-001');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [modalNode, setModalNode] = useState<SensorNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

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

    if (data.new_alerts && data.new_alerts.length > 0) {
      setAlerts((prevAlerts) => {
        const newIds = new Set(data.new_alerts.map((a) => a.id));
        const filteredPrev = prevAlerts.filter((a) => !newIds.has(a.id));
        return [...data.new_alerts, ...filteredPrev];
      });
    }

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
      api.getDashboardSummary().then(setSummary).catch(console.error);
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  // Demo Mode Runner for Hackathon Judges
  const handleTriggerDemo = async () => {
    try {
      setIsDemoRunning(true);
      await api.startSimulation('FIRE', 'ENV-004', 'HIGH');
      // Navigate to Simulation / Situation room
      setCurrentTab('situation-room');
    } catch (err) {
      console.error(err);
    }
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            summary={summary}
            isLoading={isLoading}
            onOpenDetailModal={setModalNode}
          />
        );
      case 'situation-room':
        return (
          <SituationRoomView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        );
      case 'live-monitoring':
        return (
          <LiveMonitoringView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        );
      case 'ai-explainability':
        return (
          <AiExplainabilityView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        );
      case 'anomalies':
        return <AnomaliesView />;
      case 'risk-map':
        return (
          <RiskMapView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        );
      case 'analytics-trends':
        return (
          <AnalyticsTrendsView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        );
      case 'alerts':
        return (
          <EarlyWarningView
            alerts={alerts}
            nodes={nodes}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onRefreshAlerts={loadDashboardData}
          />
        );
      case 'incidents':
        return <IncidentsView nodes={nodes} />;
      case 'response':
        return <ResponseRecommendationsView />;
      case 'sensor-network':
        return (
          <SensorNetworkView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onOpenDetailModal={setModalNode}
          />
        );
      case 'sensor-health':
        return (
          <SensorHealthView
            nodes={nodes}
            onOpenDetailModal={setModalNode}
          />
        );
      case 'network-topology':
        return <NetworkTopologyView />;
      case 'data-quality':
        return <DataQualityView />;
      case 'simulation':
        return <SimulationView nodes={nodes} />;
      case 'digital-twin':
        return (
          <DigitalTwinView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        );
      case 'system-health':
        return <SystemObservabilityView />;
      case 'audit-logs':
        return <AuditLogView />;
      case 'configuration':
        return <ConfigurationView />;
      case 'impact':
        return <SustainabilityImpactView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            summary={summary}
            isLoading={isLoading}
            onOpenDetailModal={setModalNode}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 flex font-sans antialiased">
      {/* Persistent SIH Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {/* Top Header (Clean, minimal, exact logo placement) */}
        <Header
          summary={summary}
          isConnected={isConnected}
          lastUpdateTime={lastMessageTime}
          onRefresh={loadDashboardData}
          isLoading={isLoading}
          onTriggerDemo={handleTriggerDemo}
          isDemoRunning={isDemoRunning}
        />

        {/* Dynamic Route Container */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 space-y-5">
          {/* Connection Error Banner */}
          {backendError && (
            <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 flex items-center justify-between gap-4 text-rose-300 shadow-xs">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-rose-200">Backend Communication Offline</div>
                  <div className="text-xs text-rose-400">
                    {backendError}. Ensure FastAPI is running at <code className="bg-rose-500/20 px-1.5 py-0.5 rounded font-mono text-rose-200">http://localhost:8000</code>.
                  </div>
                </div>
              </div>
              <button
                onClick={loadDashboardData}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Active View */}
          {renderActiveView()}
        </main>

        {/* Global Node Detail Diagnostics Modal */}
        {modalNode && (
          <NodeDetailModal
            node={modalNode}
            onClose={() => setModalNode(null)}
          />
        )}

        {/* Minimal Footer */}
        <footer className="border-t border-[#1B2D27] py-3.5 px-6 text-xs text-slate-500 bg-[#07110F]">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-[1600px] mx-auto gap-2">
            <div className="font-semibold text-slate-400">
              SIH26178 — AI Environmental Monitoring Network (TerraSentinel)
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span className="text-emerald-400">FastAPI Ingestion Active</span>
              <span>•</span>
              <span>WebSocket Hub Live</span>
              <span>•</span>
              <span className="text-emerald-400">ESP32 Ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

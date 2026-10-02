import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, type ActiveSituationInfo, type ActiveIncidentInfo } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { NodeDetailModal } from './components/NodeDetailModal';
import { AmbientBackground } from './components/AmbientBackground';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';
import type {
  SensorNode,
  Alert,
  DashboardSummary,
  WebSocketSensorUpdate,
  WebSocketNodeStatusUpdate,
  NavigationTab,
  UserRole,
  Incident
} from './types';

// Import Views
import { LandingLoginView } from './views/LandingLoginView';
import { PublicPortalView } from './views/PublicPortalView';
import { DashboardView } from './views/DashboardView';
import { SituationRoomView } from './views/SituationRoomView';
import { LiveMapFullView } from './views/LiveMapFullView';
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
import { HardwareSimulatorView } from './views/HardwareSimulatorView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { SystemObservabilityView } from './views/SystemObservabilityView';
import { AuditLogView } from './views/AuditLogView';
import { ConfigurationView } from './views/ConfigurationView';
import { SustainabilityImpactView } from './views/SustainabilityImpactView';
import { SettingsView } from './views/SettingsView';

import { WifiOff, RefreshCw } from 'lucide-react';

export function App() {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('ts_user_role');
    return (saved === 'public' || saved === 'agency') ? saved : null;
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>(() => {
    const savedTab = localStorage.getItem('ts_current_tab') as NavigationTab;
    return savedTab || 'dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ENV-001');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [modalNode, setModalNode] = useState<SensorNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Active Situation state (persisted & derived)
  const [activeSituation, setActiveSituation] = useState<ActiveSituationInfo | null>(() => {
    try {
      const saved = localStorage.getItem('ts_active_situation');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist current tab
  useEffect(() => {
    localStorage.setItem('ts_current_tab', currentTab);
  }, [currentTab]);

  const handleSelectRole = (role: UserRole) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem('ts_user_role', role);
    } else {
      localStorage.removeItem('ts_user_role');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('ts_user_role');
  };

  const handleActivateSituation = (situation: ActiveSituationInfo) => {
    setActiveSituation(situation);
    localStorage.setItem('ts_active_situation', JSON.stringify(situation));
  };

  const handleResolveSituation = (_situationId: string) => {
    setActiveSituation(null);
    localStorage.removeItem('ts_active_situation');
    // If currently on situation-room, transition gracefully to dashboard
    if (currentTab === 'situation-room') {
      setCurrentTab('dashboard');
    }
  };

  // Fetch incidents from backend
  const loadIncidents = useCallback(async () => {
    try {
      const res = await api.getIncidents({ limit: 50 });
      setIncidents(res);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    }
  }, []);

  // Initial data loader
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);
    try {
      const [summaryData, nodesData, alertsData, incidentsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getNodes(),
        api.getAlerts({ limit: 50 }),
        api.getIncidents({ limit: 50 }),
      ]);

      setSummary(summaryData);
      setNodes(nodesData);
      setAlerts(alertsData);
      setIncidents(incidentsData);

      if (nodesData.length > 0 && !nodesData.some((n) => n.node_id === selectedNodeId)) {
        setSelectedNodeId(nodesData[0].node_id);
      }

      // Check if there are active high threats that should auto-propose an active situation if none exists
      const criticalAlert = alertsData.find((a) => a.severity === 'CRITICAL' && !a.acknowledged);
      if (criticalAlert && !localStorage.getItem('ts_active_situation')) {
        const targetNode = nodesData.find((n) => n.node_id === criticalAlert.node_id);
        const autoSituation: ActiveSituationInfo = {
          id: `SIT-AUTO-${criticalAlert.node_id}`,
          title: `Autonomous Threat: ${criticalAlert.risk_type} Spike`,
          severity: 'CRITICAL',
          location: `${targetNode?.name || 'Sector'} (${criticalAlert.node_id})`,
          nodeId: criticalAlert.node_id,
          riskScore: criticalAlert.risk_score,
        };
        setActiveSituation(autoSituation);
        localStorage.setItem('ts_active_situation', JSON.stringify(autoSituation));
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

      // Auto-escalate if critical hazard detected over WebSocket
      const crit = data.new_alerts.find((a) => a.severity === 'CRITICAL');
      if (crit && !localStorage.getItem('ts_active_situation')) {
        const autoSituation: ActiveSituationInfo = {
          id: `SIT-LIVE-${crit.node_id}`,
          title: `Live Surge: ${crit.risk_type} Threat`,
          severity: 'CRITICAL',
          location: `Sensor ${crit.node_id}`,
          nodeId: crit.node_id,
          riskScore: crit.risk_score,
        };
        setActiveSituation(autoSituation);
        localStorage.setItem('ts_active_situation', JSON.stringify(autoSituation));
      }
    }

    api.getDashboardSummary().then(setSummary).catch(console.error);
    loadIncidents();
  }, [loadIncidents]);

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

  // Computed active context properties for Sidebar & Breadcrumbs
  const activeIncidentList: ActiveIncidentInfo[] = useMemo(() => {
    return incidents
      .filter((inc) => inc.status !== 'RESOLVED')
      .map((inc) => ({
        id: inc.id,
        incidentNumber: inc.incident_number,
        title: inc.title,
        severity: inc.severity,
        status: inc.status,
        nodeId: inc.origin_node_id,
      }));
  }, [incidents]);

  const alertCounts = useMemo(() => {
    const unacknowledged = alerts.filter((a) => !a.acknowledged).length;
    const critical = alerts.filter((a) => a.severity === 'CRITICAL' && !a.acknowledged).length;
    return {
      total: alerts.length,
      unacknowledged,
      critical,
    };
  }, [alerts]);

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
            onNavigateTab={setCurrentTab}
          />
        );
      case 'situation-room':
        return (
          <SituationRoomView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            activeSituation={activeSituation}
            onResolveSituation={handleResolveSituation}
            onActivateSituation={handleActivateSituation}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'live-map':
        return (
          <LiveMapFullView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onOpenDetailModal={setModalNode}
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
            onNavigateTab={setCurrentTab}
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
            onNavigateTab={setCurrentTab}
            onActivateSituation={handleActivateSituation}
          />
        );
      case 'incidents':
        return (
          <IncidentsView
            nodes={nodes}
            onNavigateTab={setCurrentTab}
            onRefreshIncidents={loadIncidents}
          />
        );
      case 'response':
        return (
          <ResponseRecommendationsView
            onNavigateTab={setCurrentTab}
            onRefreshIncidents={loadIncidents}
          />
        );
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
      case 'hardware-simulator':
        return (
          <HardwareSimulatorView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        );
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
            onNavigateTab={setCurrentTab}
          />
        );
    }
  };

  if (userRole === null) {
    return <LandingLoginView onSelectRole={handleSelectRole} />;
  }

  if (userRole === 'public') {
    return (
      <PublicPortalView
        onSwitchToAgency={() => handleSelectRole('agency')}
        onLogout={handleLogout}
        nodes={nodes}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased relative selection:bg-orange-500 selection:text-white">
      {/* Ambient Flame Glowing Shaded Spots (#ff4405) */}
      <AmbientBackground />

      {/* Context-Aware Emergency Operations Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeSituation={activeSituation}
        activeIncidents={activeIncidentList}
        alertCounts={alertCounts}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-24' : 'md:ml-72'
        }`}
      >
        {/* Top Header */}
        <Header
          summary={summary}
          isConnected={isConnected}
          lastUpdateTime={lastMessageTime}
          onRefresh={loadDashboardData}
          isLoading={isLoading}
          onSwitchToPublic={() => handleSelectRole('public')}
          onLogout={handleLogout}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onNavigateTab={setCurrentTab}
        />

        {/* Dynamic Route Container */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 space-y-4">
          
          {/* Breadcrumbs & Operational Context Banner */}
          <Breadcrumbs
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            activeSituation={activeSituation}
            activeIncidentCount={activeIncidentList.length}
            criticalAlertCount={alertCounts.critical}
          />

          {/* Connection Error Banner */}
          {backendError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between gap-4 text-rose-800 shadow-2xs">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-rose-900">Backend Communication Offline</div>
                  <div className="text-xs text-rose-600">
                    {backendError}. Ensure FastAPI is running at <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono text-rose-950">http://localhost:8000</code>.
                  </div>
                </div>
              </div>
              <button
                onClick={loadDashboardData}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
        <footer className="border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-[1600px] mx-auto gap-2">
            <div className="font-semibold text-slate-700">
              SIH26178 — AI Environmental Monitoring Network (TerraSentinel)
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span className="text-emerald-700 font-semibold">FastAPI Ingestion Active</span>
              <span>•</span>
              <span>WebSocket Hub Live</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">ESP32 Ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

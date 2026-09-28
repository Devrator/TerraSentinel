import type {
  SensorNode,
  SensorReading,
  RiskScore,
  Alert,
  DashboardSummary,
  Incident,
  Anomaly,
  DataQualityReport,
  SituationRoomData,
  DigitalTwinData,
  ResponseRecommendation,
  NetworkTopologyData,
  AuditLogEntry,
  SimulationStatus,
  SystemHealthData,
  ExplainabilityData,
  AnalyticsTrendsData,
  MultiNodeConsensusData
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  // --- Ingestion Pipeline (ESP32 Contract & Simulation Adapter) ---
  async ingestSensorData(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/sensor-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to ingest sensor telemetry: ${res.statusText}`);
    return res.json();
  },

  async ingestBatchSensorData(payloads: any[]): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/sensor-data/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloads)
    });
    if (!res.ok) throw new Error(`Failed to batch sync sensor telemetry: ${res.statusText}`);
    return res.json();
  },

  async getMultiNodeConsensus(hazardType: string = 'FIRE'): Promise<MultiNodeConsensusData> {
    const res = await fetch(`${API_BASE_URL}/api/consensus?hazard_type=${hazardType}`);
    if (!res.ok) throw new Error(`Failed to fetch multi-node consensus: ${res.statusText}`);
    return res.json();
  },

  // --- Core Dashboard & Fleet ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/summary`);
    if (!res.ok) throw new Error(`Failed to fetch dashboard summary: ${res.statusText}`);
    return res.json();
  },

  async getNodes(): Promise<SensorNode[]> {
    const res = await fetch(`${API_BASE_URL}/api/nodes`);
    if (!res.ok) throw new Error(`Failed to fetch nodes: ${res.statusText}`);
    return res.json();
  },

  async getNodeById(nodeId: string): Promise<SensorNode> {
    const res = await fetch(`${API_BASE_URL}/api/nodes/${nodeId}`);
    if (!res.ok) throw new Error(`Failed to fetch node ${nodeId}: ${res.statusText}`);
    return res.json();
  },

  async getLatestReadings(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/latest-readings`);
    if (!res.ok) throw new Error(`Failed to fetch latest readings: ${res.statusText}`);
    return res.json();
  },

  async getHistoricalReadings(nodeId: string, limit: number = 50): Promise<SensorReading[]> {
    const res = await fetch(`${API_BASE_URL}/api/readings/${nodeId}?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch readings for ${nodeId}: ${res.statusText}`);
    return res.json();
  },

  async getNodeRisk(nodeId: string): Promise<RiskScore> {
    const res = await fetch(`${API_BASE_URL}/api/risk/${nodeId}`);
    if (!res.ok) throw new Error(`Failed to fetch risk for ${nodeId}: ${res.statusText}`);
    return res.json();
  },

  // --- Alerts ---
  async getAlerts(params?: {
    limit?: number;
    severity?: string;
    risk_type?: string;
    node_id?: string;
    acknowledged?: boolean;
  }): Promise<Alert[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.risk_type) searchParams.append('risk_type', params.risk_type);
    if (params?.node_id) searchParams.append('node_id', params.node_id);
    if (params?.acknowledged !== undefined) searchParams.append('acknowledged', params.acknowledged.toString());

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/alerts${queryString}`);
    if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
    return res.json();
  },

  async acknowledgeAlert(alertId: number): Promise<Alert> {
    const res = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to acknowledge alert ${alertId}: ${res.statusText}`);
    return res.json();
  },

  // --- Situation Room ---
  async getSituationRoom(): Promise<SituationRoomData> {
    const res = await fetch(`${API_BASE_URL}/api/situation-room`);
    if (!res.ok) throw new Error(`Failed to fetch situation room data: ${res.statusText}`);
    return res.json();
  },

  // --- Digital Twin ---
  async getDigitalTwin(offsetMinutes: number = 0): Promise<DigitalTwinData> {
    const res = await fetch(`${API_BASE_URL}/api/digital-twin?offset_minutes=${offsetMinutes}`);
    if (!res.ok) throw new Error(`Failed to fetch digital twin: ${res.statusText}`);
    return res.json();
  },

  // --- Incidents ---
  async getIncidents(params?: {
    limit?: number;
    status?: string;
    severity?: string;
    risk_type?: string;
    node_id?: string;
  }): Promise<Incident[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.risk_type) searchParams.append('risk_type', params.risk_type);
    if (params?.node_id) searchParams.append('node_id', params.node_id);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/incidents${qs}`);
    if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
    return res.json();
  },

  async createIncident(data: {
    origin_node_id: string;
    risk_type: string;
    severity: string;
    current_risk: number;
    notes?: string;
  }): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to create incident: ${res.statusText}`);
    return res.json();
  },

  async updateIncident(incidentId: number, data: {
    status?: string;
    assigned_operator?: string;
    note?: string;
    actor?: string;
  }): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to update incident: ${res.statusText}`);
    return res.json();
  },

  async dispatchIncident(incidentId: number, data: {
    agency: string;
    priority?: string;
    unit_assigned?: string;
    operator_name?: string;
    notes?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to dispatch incident: ${res.statusText}`);
    return res.json();
  },

  // --- Anomalies ---
  async getAnomalies(limit: number = 50): Promise<Anomaly[]> {
    const res = await fetch(`${API_BASE_URL}/api/anomalies?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch anomalies: ${res.statusText}`);
    return res.json();
  },

  // --- Data Quality ---
  async getDataQuality(): Promise<DataQualityReport> {
    const res = await fetch(`${API_BASE_URL}/api/data-quality`);
    if (!res.ok) throw new Error(`Failed to fetch data quality report: ${res.statusText}`);
    return res.json();
  },

  // --- Response Recommendations ---
  async getResponseRecommendations(): Promise<{ active_recommendations_count: number; recommendations: ResponseRecommendation[] }> {
    const res = await fetch(`${API_BASE_URL}/api/response`);
    if (!res.ok) throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
    return res.json();
  },

  // --- Network Topology ---
  async getNetworkTopology(): Promise<NetworkTopologyData> {
    const res = await fetch(`${API_BASE_URL}/api/network/topology`);
    if (!res.ok) throw new Error(`Failed to fetch network topology: ${res.statusText}`);
    return res.json();
  },

  // --- Audit Logs ---
  async getAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    const res = await fetch(`${API_BASE_URL}/api/audit?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch audit logs: ${res.statusText}`);
    return res.json();
  },

  // --- Simulation Lab ---
  async getSimulationStatus(): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE_URL}/api/simulation/status`);
    if (!res.ok) throw new Error(`Failed to fetch simulation status: ${res.statusText}`);
    return res.json();
  },

  async startSimulation(scenario: string, target_node_id: string = "ENV-001", intensity: string = "HIGH"): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE_URL}/api/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, target_node_id, intensity })
    });
    if (!res.ok) throw new Error(`Failed to start simulation: ${res.statusText}`);
    return res.json();
  },

  async pauseSimulation(): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE_URL}/api/simulation/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to pause simulation: ${res.statusText}`);
    return res.json();
  },

  async stopSimulation(): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE_URL}/api/simulation/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to stop simulation: ${res.statusText}`);
    return res.json();
  },

  // --- System Observability ---
  async getSystemHealth(): Promise<SystemHealthData> {
    const res = await fetch(`${API_BASE_URL}/api/system/health`);
    if (!res.ok) throw new Error(`Failed to fetch system health: ${res.statusText}`);
    return res.json();
  },

  // --- Configuration ---
  async getConfiguration(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/configuration`);
    if (!res.ok) throw new Error(`Failed to fetch configuration: ${res.statusText}`);
    return res.json();
  },

  async updateConfiguration(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/configuration`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update configuration: ${res.statusText}`);
    return res.json();
  },

  // --- AI Explainability ---
  async getAiExplainability(nodeId: string = "ENV-001", riskType: string = "FIRE"): Promise<ExplainabilityData> {
    const res = await fetch(`${API_BASE_URL}/api/ai/explainability?node_id=${nodeId}&risk_type=${riskType}`);
    if (!res.ok) throw new Error(`Failed to fetch explainability: ${res.statusText}`);
    return res.json();
  },

  // --- Analytics Trends ---
  async getAnalyticsTrends(timeRange: string = "24H", nodeId?: string): Promise<AnalyticsTrendsData> {
    const qs = nodeId ? `?time_range=${timeRange}&node_id=${nodeId}` : `?time_range=${timeRange}`;
    const res = await fetch(`${API_BASE_URL}/api/analytics/trends${qs}`);
    if (!res.ok) throw new Error(`Failed to fetch analytics trends: ${res.statusText}`);
    return res.json();
  },

  // --- Public Portal Services ---
  async getPublicAreas(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/public/areas`);
    if (!res.ok) throw new Error(`Failed to fetch public areas: ${res.statusText}`);
    return res.json();
  },

  async getPublicAreaData(areaId: string = "ENV-001"): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/public/area-data?area=${areaId}`);
    if (!res.ok) throw new Error(`Failed to fetch area data: ${res.statusText}`);
    return res.json();
  },

  async subscribePublicAlerts(data: {
    phone_number: string;
    citizen_name?: string;
    area_sector: string;
    preferred_alert_types?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/public/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to register alert subscription: ${res.statusText}`);
    return res.json();
  },

  async verifyPublicOtp(data: { phone_number: string; otp: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/public/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to verify OTP: ${res.statusText}`);
    return res.json();
  },

  async getPublicSubscription(phone: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/public/subscriptions?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) throw new Error(`Failed to query subscription: ${res.statusText}`);
    return res.json();
  },

  async unsubscribePublicAlerts(phone_number: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/public/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number })
    });
    if (!res.ok) throw new Error(`Failed to deactivate alerts: ${res.statusText}`);
    return res.json();
  }
};

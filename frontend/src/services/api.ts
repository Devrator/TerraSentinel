import type { SensorNode, SensorReading, RiskScore, Alert, DashboardSummary } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
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
};

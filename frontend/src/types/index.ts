export interface SensorReading {
  id: number;
  node_id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  rain_value: number;
  air_quality: number;
  latitude: number;
  longitude: number;
  battery_percentage: number;
}

export interface RiskScore {
  id?: number;
  node_id: string;
  timestamp: string;
  fire_risk: number;
  flood_risk: number;
  pollution_risk: number;
  overall_risk: number;
  fire_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  flood_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  pollution_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  overall_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface Alert {
  id: number;
  node_id: string;
  risk_type: 'FIRE' | 'FLOOD' | 'POLLUTION' | 'BATTERY' | string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface SensorHealth {
  temperature: 'HEALTHY' | 'WARNING' | 'ERROR';
  humidity: 'HEALTHY' | 'WARNING' | 'ERROR';
  pressure: 'HEALTHY' | 'WARNING' | 'ERROR';
  rain: 'HEALTHY' | 'WARNING' | 'ERROR';
  air_quality: 'HEALTHY' | 'WARNING' | 'ERROR';
  gps: 'HEALTHY' | 'WARNING' | 'ERROR';
  battery: 'HEALTHY' | 'WARNING' | 'ERROR';
  overall: 'HEALTHY' | 'WARNING' | 'ERROR';
}

export interface SensorNode {
  id: number;
  node_id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'OFFLINE';
  battery_percentage: number;
  last_seen: string | null;
  created_at: string;
  latest_reading?: SensorReading | null;
  latest_risk?: RiskScore | null;
  sensor_health?: SensorHealth | null;
}

export interface DashboardSummary {
  total_nodes: number;
  online_nodes: number;
  offline_nodes: number;
  active_alerts: number;
  critical_alerts: number;
  average_temperature: number;
  average_humidity: number;
  average_air_quality: number;
  system_status: 'OPERATIONAL' | 'STANDBY' | 'HAZARD_ALERT';
  demo_mode: boolean;
}

export interface WebSocketSensorUpdate {
  type: 'SENSOR_UPDATE';
  node_id: string;
  node: SensorNode;
  reading: SensorReading;
  risk: RiskScore;
  new_alerts: Alert[];
}

export interface WebSocketNodeStatusUpdate {
  type: 'NODE_STATUS_UPDATE';
  nodes: {
    node_id: string;
    status: 'ONLINE' | 'OFFLINE';
    last_seen: string | null;
  }[];
}

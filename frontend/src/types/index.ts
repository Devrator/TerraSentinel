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

export interface Incident {
  id: number;
  incident_number: string;
  title: string;
  origin_node_id: string;
  risk_type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  current_risk: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  assigned_operator: string;
  detected_at: string;
  resolved_at?: string | null;
  evidence_snapshot?: string | null;
  notes?: string | null;
}

export interface Anomaly {
  id: number;
  node_id: string;
  parameter: string;
  previous_value: number;
  current_value: number;
  change_pct: number;
  detected_at: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  anomaly_type: 'SPIKE' | 'FLATLINE' | 'OUT_OF_BOUNDS' | 'RATE_OF_CHANGE' | string;
  description: string;
  resolved: boolean;
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

export interface SituationRoomData {
  threat_hierarchy: {
    critical_count: number;
    high_count: number;
    moderate_count: number;
    low_count: number;
    items: {
      CRITICAL: any[];
      HIGH: any[];
      MODERATE: any[];
      LOW: any[];
    };
  };
  active_threat_zones: {
    zone_id: string;
    node_id: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    severity: string;
    risk_type: string;
    score: number;
  }[];
  offline_nodes: any[];
  live_timeline: {
    timestamp: string;
    node_id: string;
    event: string;
    type: string;
    severity: string;
  }[];
  system_status: string;
}

export interface DigitalTwinData {
  target_offset_minutes: number;
  playback_timestamp: string;
  is_historical: boolean;
  nodes: {
    node_id: string;
    name: string;
    latitude: number;
    longitude: number;
    coverage_radius_meters: number;
    connectivity_status: string;
    battery_percentage: number;
    playback_timestamp: string;
    telemetry: {
      temperature: number;
      humidity: number;
      pressure: number;
      rain_value: number;
      air_quality: number;
      reading_timestamp?: string | null;
    };
    risk: {
      fire_risk: number;
      flood_risk: number;
      pollution_risk: number;
      overall_risk: number;
    };
  }[];
  risk_zones: {
    zone_id: string;
    latitude: number;
    longitude: number;
    radius: number;
    risk_type: string;
    intensity: number;
    level: string;
  }[];
  coverage_summary: {
    total_nodes_mapped: number;
    effective_monitoring_area_km2: number;
    spatial_density: string;
  };
}

export interface DataQualityReport {
  overall_quality_score: number;
  metrics: {
    completeness: number;
    freshness: number;
    validity: number;
    sensor_consistency: number;
    outliers_detected: number;
    total_samples_audited: number;
    rejected_packets_count: number;
  };
  validation_rules: {
    rule: string;
    status: string;
    enforced: boolean;
  }[];
  node_diagnostics: {
    node_id: string;
    name: string;
    status: string;
    stale_minutes: number;
    anomaly_count: number;
    battery: number;
    data_validity: number;
  }[];
}

export interface ResponseRecommendation {
  alert_id: number;
  node_id: string;
  risk_type: string;
  severity: string;
  risk_score: number;
  message: string;
  triggered_at: string;
  recommended_actions: {
    step: number;
    task: string;
    status: string;
  }[];
  disclaimer: string;
}

export interface NetworkTopologyData {
  architecture_layers: {
    edge_layer: {
      name: string;
      node_count: number;
      nodes: any[];
      status: string;
    };
    gateway_layer: {
      name: string;
      gateway_id: string;
      protocol: string;
      latency_ms: number;
      packet_success_rate: number;
      status: string;
    };
    ingestion_layer: {
      name: string;
      endpoint: string;
      throughput_req_per_sec: number;
      avg_response_time_ms: number;
      status: string;
    };
    intelligence_layer: {
      name: string;
      inference_time_ms: number;
      anomaly_detector: string;
      explainability_engine: string;
      status: string;
    };
    storage_layer: {
      name: string;
      pool_size: number;
      query_latency_ms: number;
      status: string;
    };
    distribution_layer: {
      name: string;
      active_clients: number;
      channel: string;
      status: string;
    };
  };
  scalability_metrics: {
    max_supported_nodes: number;
    distributed_broker: string;
    redundancy_mode: string;
  };
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  entity_id: string;
  previous_state?: string | null;
  new_state?: string | null;
  details?: string | null;
}

export interface SimulationStatus {
  is_running: boolean;
  is_paused: boolean;
  scenario: string;
  target_node_id: string;
  intensity: string;
  step_index: number;
  timeline_events: {
    time: string;
    message: string;
    level: string;
  }[];
}

export interface SystemHealthData {
  services: {
    backend: { status: string; version: string; framework: string };
    database: { status: string; latency_ms: number; engine: string };
    ai_engine: { status: string; model: string; inference_latency_ms: number };
    websocket: { status: string; active_connections: number; endpoint: string };
    simulation: { status: string; scenario: string };
  };
  metrics: {
    uptime_seconds: number;
    uptime_human: string;
    api_latency_ms: number;
    requests_per_minute: number;
    db_latency_ms: number;
    active_ws_connections: number;
    ingestion_rate_per_sec: number;
    error_rate_pct: number;
    last_successful_ingestion: string;
  };
}

export interface ExplainabilityData {
  risk_type: string;
  model_confidence: number;
  is_prototype: boolean;
  factors: {
    name: string;
    weight: number;
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }[];
  summary: string;
  node_id: string;
  latest_telemetry: {
    temperature: number;
    humidity: number;
    pressure: number;
    rain_value: number;
    air_quality: number;
  };
}

export interface AnalyticsTrendsData {
  time_range: string;
  node_id: string;
  sample_count: number;
  timestamps: string[];
  temperature: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number }; unit: string };
  humidity: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number }; unit: string };
  pressure: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number }; unit: string };
  rain: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number }; unit: string };
  air_quality: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number }; unit: string };
  risks: {
    fire: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number } };
    flood: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number } };
    pollution: { values: number[]; stats: { min: number; max: number; avg: number; rate_of_change: number } };
  };
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

export type NavigationTab =
  | 'dashboard'
  | 'situation-room'
  | 'live-monitoring'
  | 'ai-explainability'
  | 'anomalies'
  | 'risk-map'
  | 'analytics-trends'
  | 'alerts'
  | 'incidents'
  | 'response'
  | 'sensor-network'
  | 'sensor-health'
  | 'network-topology'
  | 'data-quality'
  | 'simulation'
  | 'digital-twin'
  | 'system-health'
  | 'audit-logs'
  | 'configuration'
  | 'impact'
  | 'settings';

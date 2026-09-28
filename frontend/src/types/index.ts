export type EdgeStatus = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type PowerMode = 'ACTIVE' | 'LOW_POWER' | 'SLEEP' | 'CRITICAL_BATTERY';

export interface EdgeRiskAssessment {
  edge_status: EdgeStatus;
  reasons: string[];
  summary: string;
}

export interface DataConfidenceAssessment {
  confidence_score: number;
  data_quality_grade: 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' | 'SUSPICIOUS';
  supporting_sensors: string;
  penalties: string[];
  summary: string;
}

export interface MultiNodeConsensusData {
  regional_risk: number;
  hazard_type: string;
  agreeing_nodes_count: number;
  total_nodes_count: number;
  consensus_percentage: number;
  consensus_status: 'STRONG_CONSENSUS' | 'MODERATE_CONSENSUS' | 'LOCALIZED_SPIKE' | 'NOMINAL_BASELINE' | string;
  consensus_label: string;
  high_threat_nodes: {
    node_id: string;
    name: string;
    score: number;
    latitude: number;
    longitude: number;
  }[];
}

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
  is_virtual?: boolean;
  source?: 'SIMULATED' | 'HARDWARE';
  edge_status?: EdgeStatus;
  power_mode?: PowerMode;
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
  edge_risk?: EdgeRiskAssessment;
  confidence?: DataConfidenceAssessment;
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
  edge_status?: EdgeStatus;
  confidence_score?: number;
}

export interface Incident {
  id: number;
  incident_number: string;
  title: string;
  origin_node_id: string;
  risk_type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  current_risk: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'ESCALATED' | 'DISPATCHED' | 'EN_ROUTE' | 'RESOLVED';
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
  is_virtual?: boolean;
  source?: 'SIMULATED' | 'HARDWARE';
  power_mode?: PowerMode;
  sampling_interval_sec?: number;
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
  highest_risk: {
    node_id: string;
    risk_score: number;
    risk_type: string;
    severity: string;
  } | null;
  spatial_consensus?: MultiNodeConsensusData;
  system_status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  timestamp: string;
}

export interface DataQualityReport {
  overall_quality_score: number;
  metrics: {
    completeness: number;
    freshness: number;
    validity: number;
    outliers_detected: number;
  };
  validation_rules: {
    rule: string;
    status: 'ENFORCED' | 'VIOLATED';
    description: string;
  }[];
  node_diagnostics: {
    node_id: string;
    name: string;
    stale_minutes: number;
    anomaly_count: number;
    battery: number;
    status: 'HEALTHY' | 'DEGRADED';
  }[];
}

export interface SituationRoomData {
  threat_level: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  active_hazard: string;
  primary_threat_score: number;
  spatial_consensus_percentage: number;
  consensus_summary: string;
  system_status?: string;
  threat_hierarchy?: {
    critical_count?: number;
    high_count?: number;
    moderate_count?: number;
    low_count?: number;
  };
  active_threat_zones?: {
    zone_id: string;
    node_id: string;
    hazard_type?: string;
    risk_type?: string;
    severity: string;
    radius_meters?: number;
    score?: number;
  }[];
  live_timeline?: {
    time?: string;
    timestamp?: string;
    message?: string;
    event?: string;
    level?: string;
    severity?: string;
    node_id?: string;
  }[];
  participating_nodes: {
    node_id: string;
    name: string;
    overall_risk: number;
    status: string;
    agreeing: boolean;
  }[];
  multi_hazard_matrix: {
    fire: number;
    flood: number;
    pollution: number;
  };
}

export interface DigitalTwinData {
  coverage_summary: {
    effective_monitoring_area_km2: number;
    spatial_density: string;
    total_active_nodes: number;
  };
  nodes: {
    node_id: string;
    name: string;
    coords: [number, number];
    telemetry: {
      temperature: number;
      humidity: number;
      pressure: number;
      air_quality: number;
    };
    risk: {
      fire_risk: number;
      flood_risk: number;
      pollution_risk: number;
    };
  }[];
}

export interface ResponseRecommendation {
  alert_id: number;
  node_id: string;
  risk_type: string;
  severity: string;
  message: string;
  evidence: string;
  triggered_at: string;
  recommended_actions: {
    step: number;
    task: string;
  }[];
  disclaimer: string;
}

export interface NetworkTopologyData {
  nodes: {
    id: string;
    label: string;
    type: string;
    status: string;
    details: string;
  }[];
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
  is_offline_mode: boolean;
  buffered_readings_count: number;
  timeline_events: {
    time: string;
    message: string;
    level: string;
  }[];
}

export interface SystemHealthData {
  services: {
    backend: { status: string; uptime_seconds: number };
    database: { status: string; latency_ms: number };
    ai_engine: { status: string; inference_latency_ms: number };
    websocket: { status: string; active_connections: number };
  };
  metrics: {
    uptime_human: string;
    api_latency_ms: number;
    requests_per_minute: number;
    ingestion_rate_per_sec: number;
    error_rate_pct: number;
    active_ws_connections: number;
    db_latency_ms: number;
  };
}

export interface ExplainabilityData {
  node_id: string;
  timestamp: string;
  overall_risk: number;
  risk_category: string;
  feature_attributions: {
    feature: string;
    contribution_pct: number;
    impact: string;
    current_value: number;
    baseline_value: number;
    unit: string;
  }[];
  factors?: {
    name: string;
    weight: number;
    impact: string;
  }[];
  summary?: string;
  latest_telemetry?: {
    temperature: number;
    humidity: number;
    pressure: number;
    rain_value: number;
    air_quality: number;
  };
  sub_risk_scores: {
    fire_risk: number;
    flood_risk: number;
    pollution_risk: number;
  };
  sensor_readings: {
    temperature: number;
    humidity: number;
    pressure: number;
    rain_value: number;
    air_quality: number;
  };
  edge_evaluation?: EdgeRiskAssessment;
  confidence_breakdown?: DataConfidenceAssessment;
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

// --- WebSerial Hardware Types ---
export type WebSerialConnectionStatus =
  | 'UNSUPPORTED'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'STREAMING'
  | 'ERROR';

export interface WebSerialPacketLog {
  timestamp: string;
  raw: string;
  parsed?: Partial<SensorReading>;
  valid: boolean;
}

// --- Emergency Response Dispatch Types ---
export type DispatchAgency = 'SDMA' | 'FIRE_RESCUE' | 'POLICE' | 'AMBULANCE_108';

export interface IncidentDispatchResult {
  incident_id: number;
  incident_number: string;
  agency: DispatchAgency | string;
  agency_name: string;
  dispatch_status: string;
  unit_assigned?: string;
  eta_minutes?: number;
  estimated_eta_minutes?: number;
  dispatch_reference?: string;
  dispatch_id?: string;
  dispatched_at: string;
  simulated: boolean;
  message?: string;
  payload_preview?: any;
}

// --- GIS Layer Types ---
export type GisBasemapLayer = 'osm' | 'satellite' | 'dark';

// --- 60-Second Evaluator Demo Types ---
export interface EvaluatorDemoStep {
  step: number;
  title: string;
  targetTab: NavigationTab;
  timeLabel: string;
  durationSec: number;
  description: string;
  scenarioName?: string;
  highlightCard?: string;
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
  | 'hardware-simulator'
  | 'digital-twin'
  | 'system-health'
  | 'audit-logs'
  | 'configuration'
  | 'impact'
  | 'settings';

// --- Portal Role & Public Community Types ---
export type UserRole = 'public' | 'agency' | null;

export interface PublicAreaSector {
  sector_id: string;
  node_id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  current_risk_level: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  overall_risk_score: number;
}

export interface PublicTelemetryData {
  temperature: number;
  humidity: number;
  pressure: number;
  air_quality: number;
  rain_value: number;
  battery_percentage: number;
  timestamp: string;
}

export interface PublicAreaTelemetryResponse {
  area: PublicAreaSector;
  telemetry: PublicTelemetryData | null;
  risk_assessment: {
    overall_risk: number;
    fire_risk: number;
    flood_risk: number;
    pollution_risk: number;
    risk_category: string;
    level: string;
  };
  active_alerts: {
    id: number;
    risk_type: string;
    severity: string;
    title: string;
    message: string;
    timestamp: string;
  }[];
  community_advisory: string;
  last_updated: string;
}

export interface PublicSubscriptionResponse {
  id: number;
  phone_number: string;
  citizen_name: string;
  area_sector: string;
  preferred_alert_types: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  simulation_otp_hint?: string;
  message: string;
}

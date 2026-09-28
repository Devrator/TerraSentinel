/**
 * TelemetrySource Data Abstraction Layer (SIH26178)
 * 
 * Clean separation between Core Platform and Ingestion Adapters:
 * 
 *                  TelemetrySource
 *                        │
 *          ┌─────────────┴─────────────┐
 *          ↓                           ↓
 *   SimulationSource            HardwareSource
 *   (Virtual Cluster)           (Physical ESP32 Node)
 * 
 * Both sources pipe through the identical pipeline contract:
 * Telemetry JSON -> POST /api/sensor-data -> Validation -> Central Risk Engine -> Dashboard
 */

import { api } from './api';

export interface TelemetryPayload {
  node_id: string;
  temperature: number;
  humidity: number;
  pressure: number;
  rain_value: number;
  air_quality: number;
  latitude: number;
  longitude: number;
  battery_percentage: number;
  timestamp?: string;
  edge_status?: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  is_virtual?: boolean;
  source?: 'SIMULATED' | 'HARDWARE';
}

export interface TelemetrySourceAdapter {
  readonly type: 'SIMULATION' | 'HARDWARE';
  readonly isSimulationEnabled: boolean;
  readonly label: string;
  ingest(payload: TelemetryPayload): Promise<any>;
  syncBatch(payloads: TelemetryPayload[]): Promise<any>;
}

/**
 * Simulation Source Adapter (Current Hackathon Demonstration Mode)
 * Ingests virtual multi-node telemetry into the real backend API pipeline.
 */
export class SimulationSource implements TelemetrySourceAdapter {
  readonly type = 'SIMULATION' as const;
  readonly isSimulationEnabled = true;
  readonly label = 'Demo Simulation Adapter (5 Virtual Nodes)';

  async ingest(payload: TelemetryPayload): Promise<any> {
    const enrichedPayload = {
      ...payload,
      is_virtual: true,
      source: 'SIMULATED' as const,
    };
    return api.ingestSensorData(enrichedPayload);
  }

  async syncBatch(payloads: TelemetryPayload[]): Promise<any> {
    const enrichedPayloads = payloads.map((p) => ({
      ...p,
      is_virtual: true,
      source: 'SIMULATED' as const,
    }));
    return api.ingestBatchSensorData(enrichedPayloads);
  }
}

/**
 * Hardware Source Adapter (Future Physical ESP32 Deployment Mode)
 * Directly interfaces with physical ESP32-WROOM-32 edge hardware gateway.
 */
export class HardwareSource implements TelemetrySourceAdapter {
  readonly type = 'HARDWARE' as const;
  readonly isSimulationEnabled = false;
  readonly label = 'Physical ESP32 Node Gateway (Direct Ingestion)';

  async ingest(payload: TelemetryPayload): Promise<any> {
    const hardwarePayload = {
      ...payload,
      is_virtual: false,
      source: 'HARDWARE' as const,
    };
    return api.ingestSensorData(hardwarePayload);
  }

  async syncBatch(payloads: TelemetryPayload[]): Promise<any> {
    const hardwarePayloads = payloads.map((p) => ({
      ...p,
      is_virtual: false,
      source: 'HARDWARE' as const,
    }));
    return api.ingestBatchSensorData(hardwarePayloads);
  }
}

// Global active source resolution based on feature flag
const isSimulationConfigured = import.meta.env.VITE_SIMULATION_ENABLED !== 'false';

export const activeTelemetrySource: TelemetrySourceAdapter = isSimulationConfigured
  ? new SimulationSource()
  : new HardwareSource();

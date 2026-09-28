import React, { useEffect, useState } from 'react';
import {
  X,
  Cpu,
  Wifi,
  MapPin,
  Battery,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ShieldAlert,
  Clock,
  Sparkles,
  Zap,
  Gauge
} from 'lucide-react';
import type { SensorNode, Alert } from '../types';
import { api } from '../services/api';

interface NodeDetailModalProps {
  node: SensorNode | null;
  onClose: () => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, onClose }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!node) return;

    const loadData = async () => {
      try {
        const alertsData = await api.getAlerts({ node_id: node.node_id, limit: 10 });
        setAlerts(alertsData);
      } catch (err) {
        console.error('Error fetching node details:', err);
      }
    };

    loadData();
  }, [node]);

  if (!node) return null;

  const health = node.sensor_health || {
    temperature: 'HEALTHY',
    humidity: 'HEALTHY',
    pressure: 'HEALTHY',
    rain: 'HEALTHY',
    air_quality: 'HEALTHY',
    gps: 'HEALTHY',
    battery: 'HEALTHY',
    overall: 'HEALTHY',
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> HEALTHY
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> WARNING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> ERROR
          </span>
        );
    }
  };

  const getPowerMode = () => {
    const bat = node.battery_percentage;
    if (bat < 15) return { mode: 'CRITICAL BATTERY', interval: '15 min (Beacon Only)', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (bat < 30) return { mode: 'LOW POWER MODE', interval: '5 min (Power Saving)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { mode: 'ACTIVE HIGH-FREQ', interval: '30 sec (Nominal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const powerInfo = getPowerMode();
  const confidenceScore = node.latest_risk?.confidence?.confidence_score ?? 94;
  const qualityGrade = node.latest_risk?.confidence?.data_quality_grade ?? 'GOOD';
  const edgeStatus = node.latest_risk?.edge_risk?.edge_status ?? 'NORMAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-800 flex flex-col">

        {/* Modal Header */}
        <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-2xs">
              <Cpu className="w-5 h-5 text-[#ff4405]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-mono text-slate-900">{node.node_id}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white">
                  {node.node_id.includes('005') ? 'PHYSICAL ESP32' : 'VIRTUAL TWIN'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  node.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {node.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{node.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">

          {/* Dual-Tier Intelligence & Power Architecture Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Edge Intelligence Logic */}
            <div className="p-4 rounded-2xl bg-[#121417] text-white border border-zinc-800 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 font-bold">
                  <Zap className="w-3.5 h-3.5 text-[#ff4405]" /> Tier 1: Edge Risk
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  edgeStatus === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  edgeStatus === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {edgeStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {node.latest_risk?.edge_risk?.summary || 'Local rule evaluation nominal'}
              </p>
            </div>

            {/* Sensor Trust & Data Confidence */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff4405]" /> Sensor Confidence
                </span>
                <span className="text-xs font-mono font-black text-slate-900">
                  {confidenceScore.toFixed(0)}% ({qualityGrade})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Supporting Peers: {node.latest_risk?.confidence?.supporting_sensors || '4/5 Nodes'}
              </p>
            </div>

            {/* Low-Power State */}
            <div className={`p-4 rounded-2xl border space-y-1.5 shadow-2xs ${powerInfo.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Battery className="w-3.5 h-3.5" /> Power Mode
                </span>
                <span className="text-[11px] font-mono font-black">
                  {node.battery_percentage.toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] font-mono font-medium">
                Sampling: {powerInfo.interval}
              </p>
            </div>
          </div>

          {/* Metadata & Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Connectivity</div>
              <div className="text-xs font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-600" />
                Wi-Fi / LoRa 868MHz
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">GPS Coordinates</div>
              <div className="text-xs font-extrabold text-slate-800 mt-1 flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Energy Storage</div>
              <div className="text-xs font-extrabold text-slate-800 mt-1 flex items-center gap-1.5 font-mono">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                18650 Li-Ion (3400mAh)
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Last Sync Ping</div>
              <div className="text-xs font-extrabold text-slate-800 mt-1 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#ff4405]" />
                {node.last_seen ? new Date(node.last_seen).toLocaleTimeString() : 'Offline'}
              </div>
            </div>
          </div>

          {/* Sensor Diagnostics Subsystem */}
          <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              On-Board Sensor Diagnostics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-700 font-semibold">Temperature (DHT22)</span>
                {getHealthBadge(health.temperature)}
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-700 font-semibold">Humidity (DHT22)</span>
                {getHealthBadge(health.humidity)}
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-700 font-semibold">Barometric Pressure</span>
                {getHealthBadge(health.pressure)}
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-700 font-semibold">Rainfall Array</span>
                {getHealthBadge(health.rain)}
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-700 font-semibold">Gas / Smoke (MQ-135)</span>
                {getHealthBadge(health.air_quality)}
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-700 font-semibold">GPS Engine (NEO-6M)</span>
                {getHealthBadge(health.gps)}
              </div>
            </div>
          </div>

          {/* AI Hazard Risk Assessment Breakdown */}
          <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ff4405]" />
              Central Multi-Variate Risk Scores
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200">
                <div className="text-[10px] font-bold text-[#ff4405] font-mono">FIRE RISK</div>
                <div className="text-2xl font-black font-mono text-orange-950 mt-1">
                  {node.latest_risk?.fire_risk.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-medium">
                  Category: {node.latest_risk?.fire_category ?? 'LOW'}
                </div>
              </div>

              <div className="p-3.5 bg-cyan-50/60 rounded-2xl border border-cyan-200">
                <div className="text-[10px] font-bold text-cyan-700 font-mono">FLOOD RISK</div>
                <div className="text-2xl font-black font-mono text-cyan-950 mt-1">
                  {node.latest_risk?.flood_risk.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-medium">
                  Category: {node.latest_risk?.flood_category ?? 'LOW'}
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200">
                <div className="text-[10px] font-bold text-purple-700 font-mono">POLLUTION RISK</div>
                <div className="text-2xl font-black font-mono text-purple-950 mt-1">
                  {node.latest_risk?.pollution_risk.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-medium">
                  Category: {node.latest_risk?.pollution_category ?? 'LOW'}
                </div>
              </div>
            </div>
          </div>

          {/* Alert History Section */}
          <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Recent Alerts for {node.node_id}
            </h3>
            {alerts.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center font-medium">
                No active hazard anomalies recorded for this node.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{a.risk_type} RISK: </span>
                      <span className="text-slate-600 font-medium">{a.message}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Source: Edge Telemetry Pipeline (ESP32 Ingestion Schema)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};


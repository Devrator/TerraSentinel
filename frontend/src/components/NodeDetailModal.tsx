import React, { useEffect, useState } from 'react';
import { X, Cpu, Wifi, MapPin, Battery, CheckCircle2, AlertTriangle, XCircle, Activity, ShieldAlert, Clock } from 'lucide-react';
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
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> HEALTHY
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" /> WARNING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
            <XCircle className="w-3.5 h-3.5" /> ERROR
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-dark-850 border-b border-dark-700 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-emerald-300">{node.node_id}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  node.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                }`}>
                  {node.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{node.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-slate-100 border border-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6">
          
          {/* Metadata & Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Connectivity</div>
              <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                Wi-Fi (802.11 b/g/n)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">GPS Coordinates</div>
              <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Power Source</div>
              <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5 font-mono">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                {node.battery_percentage.toFixed(0)}% (Li-Ion)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Last Sync</div>
              <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {node.last_seen ? new Date(node.last_seen).toLocaleTimeString() : 'Offline'}
              </div>
            </div>
          </div>

          {/* Sensor Diagnostics Subsystem */}
          <div className="p-4 rounded-xl bg-dark-850 border border-dark-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              On-Board Sensor Health & Diagnostic Subsystems
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-dark-900 rounded-lg border border-dark-750 flex items-center justify-between">
                <span className="text-xs text-slate-300">Temperature</span>
                {getHealthBadge(health.temperature)}
              </div>
              <div className="p-2.5 bg-dark-900 rounded-lg border border-dark-750 flex items-center justify-between">
                <span className="text-xs text-slate-300">Humidity</span>
                {getHealthBadge(health.humidity)}
              </div>
              <div className="p-2.5 bg-dark-900 rounded-lg border border-dark-750 flex items-center justify-between">
                <span className="text-xs text-slate-300">Barometric Pressure</span>
                {getHealthBadge(health.pressure)}
              </div>
              <div className="p-2.5 bg-dark-900 rounded-lg border border-dark-750 flex items-center justify-between">
                <span className="text-xs text-slate-300">Rain / Moisture</span>
                {getHealthBadge(health.rain)}
              </div>
              <div className="p-2.5 bg-dark-900 rounded-lg border border-dark-750 flex items-center justify-between">
                <span className="text-xs text-slate-300">Air Quality / Gas</span>
                {getHealthBadge(health.air_quality)}
              </div>
              <div className="p-2.5 bg-dark-900 rounded-lg border border-dark-750 flex items-center justify-between">
                <span className="text-xs text-slate-300">GPS Hardware</span>
                {getHealthBadge(health.gps)}
              </div>
            </div>
          </div>

          {/* AI Hazard Risk Assessment Breakdown */}
          <div className="p-4 rounded-xl bg-dark-850 border border-dark-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Calculated Hazard Risk Scores
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-dark-900 rounded-lg border border-orange-500/20">
                <div className="text-[10px] font-bold text-orange-400">FIRE RISK</div>
                <div className="text-2xl font-black font-mono text-orange-300 mt-1">
                  {node.latest_risk?.fire_risk.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Category: {node.latest_risk?.fire_category ?? 'LOW'}
                </div>
              </div>

              <div className="p-3 bg-dark-900 rounded-lg border border-cyan-500/20">
                <div className="text-[10px] font-bold text-cyan-400">FLOOD RISK</div>
                <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
                  {node.latest_risk?.flood_risk.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Category: {node.latest_risk?.flood_category ?? 'LOW'}
                </div>
              </div>

              <div className="p-3 bg-dark-900 rounded-lg border border-purple-500/20">
                <div className="text-[10px] font-bold text-purple-400">POLLUTION RISK</div>
                <div className="text-2xl font-black font-mono text-purple-300 mt-1">
                  {node.latest_risk?.pollution_risk.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Category: {node.latest_risk?.pollution_category ?? 'LOW'}
                </div>
              </div>
            </div>
          </div>

          {/* Alert History Section */}
          <div className="p-4 rounded-xl bg-dark-850 border border-dark-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Recent Alert Events Log ({node.node_id})
            </h3>
            {alerts.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 text-center">
                No active hazard anomalies recorded for this node.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-dark-900 border border-dark-750 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200">{a.risk_type} RISK: </span>
                      <span className="text-slate-300">{a.message}</span>
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
        <div className="p-4 bg-dark-850 border-t border-dark-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-dark-950 font-bold text-xs transition-colors"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};

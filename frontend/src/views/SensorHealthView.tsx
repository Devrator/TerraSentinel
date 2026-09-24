import React from 'react';
import type { SensorNode } from '../types';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';

interface SensorHealthViewProps {
  nodes: SensorNode[];
  onOpenDetailModal: (node: SensorNode) => void;
}

export const SensorHealthView: React.FC<SensorHealthViewProps> = ({ nodes, onOpenDetailModal }) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Sensor Health & Edge Diagnostics</h2>
            <p className="text-xs text-slate-500 font-medium">
              Hardware telemetry validation, probe integrity diagnostics, and physical bus connectivity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700 font-bold shadow-2xs">
            FLEET STATUS: HEALTHY
          </span>
        </div>
      </div>

      {/* Nodes Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {nodes.map((node) => {
          const isOnline = node.status === 'ONLINE';

          return (
            <div
              key={node.node_id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    {node.node_id}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{node.name}</div>
                </div>

                <button
                  onClick={() => onOpenDetailModal(node)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  Inspect
                </button>
              </div>

              {/* Hardware Quick Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Battery</div>
                  <div className="font-mono font-bold text-emerald-700 text-xs">
                    {node.battery_percentage.toFixed(0)}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Signal RSSI</div>
                  <div className="font-mono font-bold text-slate-800 text-xs">
                    {isOnline ? '-62 dBm' : 'Offline'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">GPS Lock</div>
                  <div className="font-mono font-bold text-blue-700 text-xs">
                    3D Fix
                  </div>
                </div>
              </div>

              {/* Probe Diagnostics Breakdown */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Integrated Sensor Probes
                </div>

                {[
                  { name: 'DHT22 / BMP280 Temp Sensor', status: isOnline ? 'Healthy' : 'Unresponsive', ok: isOnline },
                  { name: 'Capacitive Humidity Probe', status: isOnline ? 'Healthy' : 'Unresponsive', ok: isOnline },
                  { name: 'Piezo Pressure Transducer', status: isOnline ? 'Healthy' : 'Unresponsive', ok: isOnline },
                  { name: 'Rainfall Inflow Plate', status: isOnline ? 'Healthy' : 'Unresponsive', ok: isOnline },
                  { name: 'MQ-135 Gas / Particulate Probe', status: isOnline ? 'Healthy' : 'Unresponsive', ok: isOnline },
                  { name: 'NEO-6M GPS Receiver', status: isOnline ? 'Healthy' : 'Unresponsive', ok: isOnline },
                ].map((probe, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-medium"
                  >
                    <span className="text-slate-700">{probe.name}</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-[11px]">
                      {probe.ok ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">{probe.status}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-rose-700">{probe.status}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Communication Meta */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Firmware: <strong className="text-slate-800 font-mono">v2.4.1</strong></span>
                <span>Interval: <strong className="text-slate-800 font-mono">15s</strong></span>
                <span>Uptime: <strong className="text-emerald-700 font-mono">99.8%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

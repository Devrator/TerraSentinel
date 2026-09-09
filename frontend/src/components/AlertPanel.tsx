import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Flame, Waves, Wind, Battery, Bell } from 'lucide-react';
import type { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: number) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAcknowledge }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'ALL') return true;
    return a.risk_type.toUpperCase() === filterType.toUpperCase();
  });

  const getRiskIcon = (riskType: string) => {
    switch (riskType.toUpperCase()) {
      case 'FIRE':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'FLOOD':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'POLLUTION':
        return <Wind className="w-4 h-4 text-purple-400" />;
      case 'BATTERY':
        return <Battery className="w-4 h-4 text-rose-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="rounded-xl border border-dark-700 bg-dark-900 p-4 shadow-xl flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-dark-700/80">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Hazard Alert Stream
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-dark-800 text-slate-300 border border-dark-700">
            {filteredAlerts.length}
          </span>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1 bg-dark-850 p-1 rounded-lg border border-dark-700 text-xs">
          {['ALL', 'FIRE', 'FLOOD', 'POLLUTION'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                filterType === type
                  ? 'bg-emerald-500 text-dark-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
            <span>No active hazard alerts matching filter</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition-all ${
                alert.acknowledged
                  ? 'bg-dark-850/40 border-dark-800 opacity-60'
                  : alert.severity === 'CRITICAL'
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-dark-850 border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-dark-900 border border-dark-700">
                    {getRiskIcon(alert.risk_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-emerald-400">
                        {alert.node_id}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Score: {alert.risk_score.toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-200 mt-0.5">
                      {alert.risk_type} RISK ANOMALY
                    </div>
                  </div>
                </div>

                {/* Acknowledge Button */}
                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-dark-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-dark-700 hover:border-emerald-500/40 transition-all"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ack
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-dark-900/60 p-2 rounded-lg border border-dark-750">
                {alert.message}
              </p>

              <div className="mt-2 text-[10px] text-slate-500 text-right">
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

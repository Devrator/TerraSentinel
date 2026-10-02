import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Flame, Waves, Wind, Battery, Bell, ArrowUpRight } from 'lucide-react';
import type { Alert, NavigationTab } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: number) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAcknowledge, onNavigateTab }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'ALL') return true;
    return a.risk_type.toUpperCase() === filterType.toUpperCase();
  });

  const getRiskIcon = (riskType: string) => {
    switch (riskType.toUpperCase()) {
      case 'FIRE':
        return <Flame className="w-4 h-4 text-[#ff4405]" />;
      case 'FLOOD':
        return <Waves className="w-4 h-4 text-cyan-600" />;
      case 'POLLUTION':
        return <Wind className="w-4 h-4 text-purple-600" />;
      case 'BATTERY':
        return <Battery className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 lg:p-5 shadow-2xs flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 text-[#ff4405]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Real-Time Hazard Alert Stream
            </h2>
            <div className="text-[10px] text-slate-400 font-medium">
              Autonomous spatial triggers
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white ml-1">
            {filteredAlerts.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-[11px] font-bold text-[#ff4405] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Filter Badges */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['ALL', 'FIRE', 'FLOOD', 'POLLUTION'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-8">
            <CheckCircle2 className="w-9 h-9 text-emerald-500/80 mb-2" />
            <span className="font-bold text-slate-700">All Sectors Operational</span>
            <span className="text-[11px] text-slate-400 mt-0.5">No active anomaly threshold breaches</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                alert.acknowledged
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : alert.severity === 'CRITICAL'
                  ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    {getRiskIcon(alert.risk_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-xs text-slate-900">
                        {alert.node_id}
                      </span>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {alert.risk_score.toFixed(0)}% Score
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 mt-0.5">
                      {alert.risk_type} RISK DETECTED
                    </div>
                  </div>
                </div>

                {/* Acknowledge Button */}
                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-3 py-1 rounded-xl text-[10px] font-bold bg-[#121417] hover:bg-zinc-800 text-white transition-all cursor-pointer shadow-2xs"
                  >
                    Triage
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-150 font-medium">
                {alert.message}
              </p>

              <div className="mt-2 text-[10px] text-slate-400 text-right font-mono">
                Triggered: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

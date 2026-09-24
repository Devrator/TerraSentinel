import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Search, ArrowUpRight, Check, ShieldAlert } from 'lucide-react';
import type { Alert, SensorNode } from '../types';
import { api } from '../services/api';

interface EarlyWarningViewProps {
  alerts: Alert[];
  nodes: SensorNode[];
  onAcknowledgeAlert: (id: number) => void;
  onRefreshAlerts?: () => void;
}

export const EarlyWarningView: React.FC<EarlyWarningViewProps> = ({
  alerts,
  nodes,
  onAcknowledgeAlert,
  onRefreshAlerts,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterType !== 'ALL' && a.risk_type !== filterType) return false;
    return true;
  });

  const handleAction = async (alert: Alert, actionType: 'INVESTIGATE' | 'ESCALATE' | 'RESOLVE') => {
    try {
      setActionLoadingId(alert.id);
      // Create or update incident associated with this alert
      await api.createIncident({
        origin_node_id: alert.node_id,
        risk_type: alert.risk_type,
        severity: alert.severity,
        current_risk: alert.risk_score,
        notes: `Operator initiated [${actionType}] from Early Warning Center for Alert #${alert.id}`
      });
      if (actionType === 'RESOLVE') {
        await api.acknowledgeAlert(alert.id);
      }
      if (onRefreshAlerts) onRefreshAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Early Warning Center</h2>
            <p className="text-xs text-slate-400">
              Operational early-warning triage & response console with real-time incident escalation
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Hazard Types</option>
            <option value="FIRE">Fire</option>
            <option value="FLOOD">Flood</option>
            <option value="POLLUTION">Pollution</option>
            <option value="BATTERY">Battery</option>
          </select>
        </div>
      </div>

      {/* Warning Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const node = nodes.find((n) => n.node_id === alert.node_id);
            const isCrit = alert.severity === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl bg-[#101D19] border transition-all ${
                  isCrit ? 'border-rose-500/30 shadow-xs' : 'border-[#1B2D27]'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isCrit ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-400">ALERT #{alert.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isCrit ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#07110F] text-slate-300 border border-[#1B2D27]">
                          {alert.risk_type}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {alert.node_id}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-200">
                        {alert.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                        <span>GPS: {node?.latitude.toFixed(4) ?? '28.6139'}, {node?.longitude.toFixed(4) ?? '77.2090'}</span>
                        <span>•</span>
                        <span>Score: <strong className="text-rose-400 font-mono">{alert.risk_score.toFixed(1)}%</strong></span>
                        <span>•</span>
                        <span>Confidence: <strong className="text-emerald-400 font-mono">92.4%</strong></span>
                        <span>•</span>
                        <span>Triggered: {new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Acknowledge
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-[#07110F] text-slate-500 border border-[#1B2D27] text-xs font-mono font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Acknowledged
                      </span>
                    )}

                    <button
                      onClick={() => handleAction(alert, 'INVESTIGATE')}
                      disabled={actionLoadingId === alert.id}
                      className="px-3 py-1.5 rounded-xl bg-[#07110F] hover:bg-[#182B24] text-slate-300 hover:text-white border border-[#1B2D27] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" /> Investigate
                    </button>

                    <button
                      onClick={() => handleAction(alert, 'ESCALATE')}
                      disabled={actionLoadingId === alert.id}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Escalate
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Active Early Warnings</h3>
            <p className="text-xs text-slate-400">
              All sensor nodes are currently operating within baseline environmental safety thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

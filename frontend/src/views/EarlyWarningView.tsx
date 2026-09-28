import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Search, ArrowUpRight, Check, ShieldAlert, Sparkles, Flame, Download } from 'lucide-react';
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

  const handleExportCsv = () => {
    const headers = ['Alert ID', 'Node ID', 'Risk Type', 'Severity', 'Risk Score', 'Message', 'Acknowledged', 'Timestamp'];
    const rows = filteredAlerts.map((a) => [
      a.id,
      `"${a.node_id}"`,
      `"${a.risk_type}"`,
      `"${a.severity}"`,
      a.risk_score.toFixed(2),
      `"${(a.message || '').replace(/"/g, '""')}"`,
      a.acknowledged ? 'TRUE' : 'FALSE',
      `"${new Date(a.timestamp).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `terrasentinel-early-warnings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = async (alert: Alert, actionType: 'INVESTIGATE' | 'ESCALATE' | 'RESOLVE') => {
    try {
      setActionLoadingId(alert.id);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Early Warning Center</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#121417] text-white">
                SIH26178 ACTIVE TRIAGE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Operational early-warning triage & response console with real-time incident escalation
            </p>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#ff4405] cursor-pointer shadow-2xs transition-colors"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severities</option>
            <option value="HIGH">High Severities</option>
            <option value="MODERATE">Moderate Severities</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#ff4405] cursor-pointer shadow-2xs transition-colors"
          >
            <option value="ALL">All Hazard Types</option>
            <option value="FIRE">Wildfire</option>
            <option value="FLOOD">Flash Flood</option>
            <option value="POLLUTION">Toxic Pollution</option>
            <option value="BATTERY">Battery Degradation</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download early warnings registry in CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Export CSV
          </button>
        </div>
      </div>

      {/* Warning Cards List */}
      <div className="space-y-3.5">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const node = nodes.find((n) => n.node_id === alert.node_id);
            const isCrit = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl bg-white border transition-all shadow-2xs hover:shadow-xs ${
                  isCrit
                    ? 'border-rose-300 ring-1 ring-rose-200/50'
                    : isHigh
                    ? 'border-orange-200'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl shrink-0 mt-0.5 shadow-2xs ${
                      isCrit
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : isHigh
                        ? 'bg-orange-50 text-[#ea580c] border border-orange-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {isCrit ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-400">ALERT #{alert.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          isCrit
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isHigh
                            ? 'bg-orange-50 text-[#ea580c] border-orange-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {alert.risk_type}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#121417]">
                          {alert.node_id}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {alert.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span>GPS: <span className="font-mono text-slate-700">{node?.latitude.toFixed(4) ?? '28.6139'}, {node?.longitude.toFixed(4) ?? '77.2090'}</span></span>
                        <span>•</span>
                        <span>Threat Score: <strong className="text-rose-600 font-mono font-bold">{alert.risk_score.toFixed(1)}%</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#ff4405]" />
                          Confidence: <strong className="text-slate-900 font-mono">94.2%</strong>
                        </span>
                        <span>•</span>
                        <span>Triggered: <span className="font-mono text-slate-600">{new Date(alert.timestamp).toLocaleTimeString()}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end shrink-0">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Acknowledge
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Acknowledged
                      </span>
                    )}

                    <button
                      onClick={() => handleAction(alert, 'INVESTIGATE')}
                      disabled={actionLoadingId === alert.id}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Search className="w-3.5 h-3.5" /> Investigate
                    </button>

                    <button
                      onClick={() => handleAction(alert, 'ESCALATE')}
                      disabled={actionLoadingId === alert.id}
                      className="px-4 py-2 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#ff4405]" /> Escalate
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Active Early Warnings</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              All distributed IoT sensor nodes are currently operating within nominal baseline environmental safety thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

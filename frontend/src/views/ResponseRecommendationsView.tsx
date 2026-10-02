import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ResponseRecommendation, NavigationTab } from '../types';
import { CheckSquare, ShieldCheck, RefreshCw, Sparkles, CheckCircle2, Download, Send, ShieldAlert, FileSpreadsheet } from 'lucide-react';

interface ResponseRecommendationsViewProps {
  onNavigateTab?: (tab: NavigationTab) => void;
  onRefreshIncidents?: () => void;
}

export const ResponseRecommendationsView: React.FC<ResponseRecommendationsViewProps> = ({
  onNavigateTab,
  onRefreshIncidents,
}) => {
  const [recommendations, setRecommendations] = useState<ResponseRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<number | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.getResponseRecommendations();
      setRecommendations(res.recommendations);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const toggleTask = (alertId: number, step: number) => {
    const key = `${alertId}_${step}`;
    setCheckedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDispatchIncident = async (rec: ResponseRecommendation) => {
    try {
      setDispatchingId(rec.alert_id);
      const incident = await api.createIncident({
        origin_node_id: rec.node_id,
        risk_type: rec.risk_type,
        severity: rec.severity,
        current_risk: 85.0,
        notes: `Emergency response protocol initiated for Alert #${rec.alert_id}. Directives: ${rec.recommended_actions.map((a) => `${a.step}. ${a.task}`).join(' | ')}`
      });

      const dispatchRes = await api.dispatchIncident(incident.id, {
        agency: rec.risk_type === 'FIRE' ? 'FIRE_RESCUE' : rec.risk_type === 'FLOOD' ? 'SDMA' : 'POLICE',
        operator_name: 'Command Duty Officer',
        priority: rec.severity,
      });

      if (onRefreshIncidents) onRefreshIncidents();
      setDispatchSuccess(`Incident ${incident.incident_number} logged! Dispatched to ${dispatchRes.agency_name} (ETA: ${dispatchRes.estimated_eta_minutes} mins)`);
      setTimeout(() => setDispatchSuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to dispatch incident:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleExportDirectives = () => {
    if (recommendations.length === 0) return;
    let content = `# TerraSentinel Operational Standard Operating Procedures (SOP)\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;

    recommendations.forEach((rec) => {
      content += `## Alert #${rec.alert_id} — ${rec.severity} ${rec.risk_type} RISK\n`;
      content += `- **Target Node / Sector:** ${rec.node_id}\n`;
      content += `- **Trigger Timestamp:** ${rec.triggered_at}\n`;
      content += `- **Anomaly Description:** ${rec.message}\n`;
      content += `- **Corroborating Evidence:** ${rec.evidence}\n\n`;
      content += `### Standard Operating Checklist:\n`;
      rec.recommended_actions.forEach((act) => {
        const isDone = checkedTasks[`${rec.alert_id}_${act.step}`] ? '[x]' : '[ ]';
        content += `- ${isDone} **Step ${act.step}:** ${act.task}\n`;
      });
      content += `\n*${rec.disclaimer}*\n\n---\n\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(content);
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `terrasentinel-sop-directives.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Response Protocols & Action Directives
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#121417] text-white font-bold">
                DECISION SUPPORT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              System-generated operational action checklists and standard operating procedures linked to detected events
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('situation-room')}
              className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Return to Situation Room"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> War Room
            </button>
          )}

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('incidents')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title="Go to Incident Console"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Incidents
            </button>
          )}

          {recommendations.length > 0 && (
            <button
              onClick={handleExportDirectives}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title="Download full SOP directives in Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" /> Export SOP
            </button>
          )}

          <button
            onClick={fetchRecommendations}
            className="px-3.5 py-2 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4405]' : 'text-slate-400'}`} /> Sync
          </button>
        </div>
      </div>

      {/* Dispatch Success Alert */}
      {dispatchSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-3 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* Protocols List */}
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div
              key={rec.alert_id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5 hover:shadow-xs transition-shadow"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    rec.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-orange-50 text-[#ea580c] border-orange-200'
                  }`}>
                    {rec.severity} {rec.risk_type} RISK
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    Target Sector: <span className="text-[#121417] underline decoration-[#ff4405] decoration-2">{rec.node_id}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-400 font-mono">
                    Triggered: {new Date(rec.triggered_at).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() => handleDispatchIncident(rec)}
                    disabled={dispatchingId === rec.alert_id}
                    className="px-3.5 py-1.5 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{dispatchingId === rec.alert_id ? 'Dispatching...' : 'Dispatch Unit'}</span>
                  </button>
                </div>
              </div>

              {/* Message & Multi-Factor Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-500">Anomaly Description</div>
                  <div className="font-semibold text-slate-900 text-sm leading-snug">{rec.message}</div>
                </div>

                <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-200/60 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase text-[#ea580c] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff4405]" /> Corroborating Multi-Node Evidence
                  </div>
                  <div className="text-slate-800 font-mono text-xs font-medium">
                    {rec.evidence || 'Temperature ↑ • Humidity ↓ • Air Quality ↓ • 3/4 Peer Nodes Agree'}
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Standard Operating Procedures (Action Checklist)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Click items to mark completed
                  </span>
                </div>

                <div className="space-y-2">
                  {rec.recommended_actions.map((act) => {
                    const isCompleted = !!checkedTasks[`${rec.alert_id}_${act.step}`];
                    return (
                      <button
                        key={act.step}
                        type="button"
                        onClick={() => toggleTask(rec.alert_id, act.step)}
                        className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 text-xs transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5 shadow-2xs ${
                          isCompleted ? 'bg-emerald-600 text-white' : 'bg-[#121417] text-white'
                        }`}>
                          {act.step}
                        </div>
                        <div className={`flex-1 leading-relaxed font-semibold ${isCompleted ? 'line-through opacity-75' : ''}`}>
                          {act.task}
                        </div>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 italic">
                {rec.disclaimer}
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Active High-Risk Protocols Required</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              System operating in nominal baseline state. No emergency dispatch recommendations active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

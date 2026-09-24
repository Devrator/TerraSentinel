import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ResponseRecommendation } from '../types';
import { CheckSquare, ShieldCheck, RefreshCw } from 'lucide-react';

export const ResponseRecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<ResponseRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Response Protocols & Recommendations</h2>
            <p className="text-xs text-slate-500 font-medium">
              System-generated operational action checklists and standard operating procedures for incident response
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} /> Refresh Protocols
        </button>
      </div>

      {/* Protocols List */}
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div
              key={rec.alert_id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                    rec.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {rec.severity} {rec.risk_type} RISK
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {rec.node_id}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Triggered: {new Date(rec.triggered_at).toLocaleTimeString()}
                </div>
              </div>

              {/* Message */}
              <div className="text-xs text-slate-800 font-semibold">
                {rec.message}
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Recommended Action Steps
                </h4>

                <div className="space-y-2">
                  {rec.recommended_actions.map((act) => (
                    <div
                      key={act.step}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs font-medium"
                    >
                      <div className="w-5 h-5 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center font-mono font-bold text-blue-700 text-[10px] shrink-0 mt-0.5">
                        {act.step}
                      </div>
                      <div className="flex-1 text-slate-700">
                        {act.task}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 italic">
                {rec.disclaimer}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Active High-Risk Protocols Required</h3>
            <p className="text-xs text-slate-500 font-medium">
              System operating in nominal state. No emergency dispatch recommendations active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

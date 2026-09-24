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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Response Protocols & Recommendations</h2>
            <p className="text-xs text-slate-400">
              System-generated operational action checklists and standard operating procedures for incident response
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          className="px-3 py-1.5 rounded-xl bg-[#07110F] hover:bg-[#182B24] text-slate-300 hover:text-white border border-[#1B2D27] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} /> Refresh Protocols
        </button>
      </div>

      {/* Protocols List */}
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div
              key={rec.alert_id}
              className="p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1B2D27]">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    rec.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {rec.severity} {rec.risk_type} RISK
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {rec.node_id}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Triggered: {new Date(rec.triggered_at).toLocaleTimeString()}
                </div>
              </div>

              {/* Message */}
              <div className="text-xs text-slate-200 font-medium">
                {rec.message}
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Recommended Action Steps
                </h4>

                <div className="space-y-2">
                  {rec.recommended_actions.map((act) => (
                    <div
                      key={act.step}
                      className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] flex items-start gap-3 text-xs"
                    >
                      <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-blue-400 text-[10px] shrink-0 mt-0.5">
                        {act.step}
                      </div>
                      <div className="flex-1 text-slate-300">
                        {act.task}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-[#07110F]/60 border border-[#1B2D27] text-[11px] text-slate-500 italic">
                {rec.disclaimer}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Active High-Risk Protocols Required</h3>
            <p className="text-xs text-slate-400">
              System operating in nominal state. No emergency dispatch recommendations active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

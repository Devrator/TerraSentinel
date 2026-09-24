import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Anomaly } from '../types';
import { Zap, ShieldCheck, RefreshCw } from 'lucide-react';

export const AnomaliesView: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const res = await api.getAnomalies(50);
      setAnomalies(res);
    } catch (err) {
      console.error('Failed to load anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const filtered = anomalies.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Environmental Anomaly Detection</h2>
            <p className="text-xs text-slate-400">
              Automated temporal spike identification, sensor flatline detection, and physical boundary validation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            onClick={fetchAnomalies}
            className="px-3 py-1.5 rounded-xl bg-[#07110F] hover:bg-[#182B24] text-slate-300 hover:text-white border border-[#1B2D27] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} /> Sync
          </button>
        </div>
      </div>

      {/* Anomaly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((anom) => {
            const isCrit = anom.severity === 'CRITICAL';

            return (
              <div
                key={anom.id}
                className={`p-4 rounded-2xl bg-[#101D19] border space-y-3 transition-all ${
                  isCrit ? 'border-rose-500/30 shadow-xs' : 'border-[#1B2D27]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{anom.node_id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#07110F] text-slate-300 border border-[#1B2D27] uppercase">
                      {anom.parameter}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isCrit ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {anom.severity}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">Value Shift</div>
                    <div className="font-mono text-sm font-bold text-white">
                      {anom.previous_value.toFixed(1)} → {anom.current_value.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">Delta</div>
                    <div className="font-mono text-sm font-bold text-rose-400">
                      {anom.change_pct > 0 ? `+${anom.change_pct}%` : `${anom.change_pct}%`}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium line-clamp-2">
                  {anom.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-[#1B2D27]">
                  <span>Type: {anom.anomaly_type}</span>
                  <span>{new Date(anom.detected_at).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 p-12 text-center rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Environmental Anomalies Detected</h3>
            <p className="text-xs text-slate-400">
              The sensor network is currently operating within expected physical baseline thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

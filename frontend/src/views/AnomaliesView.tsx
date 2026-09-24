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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <Zap className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Environmental Anomaly Detection</h2>
            <p className="text-xs text-slate-500 font-medium">
              Automated temporal spike identification, sensor flatline detection, and physical boundary validation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
          </select>

          <button
            onClick={fetchAnomalies}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} /> Sync
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
                className={`p-4 rounded-xl bg-white border space-y-3 transition-all shadow-2xs ${
                  isCrit ? 'border-rose-300 ring-1 ring-rose-200/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700">{anom.node_id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase font-bold">
                      {anom.parameter}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isCrit ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {anom.severity}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Value Shift</div>
                    <div className="font-mono text-sm font-bold text-slate-900">
                      {anom.previous_value.toFixed(1)} → {anom.current_value.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-medium">Delta</div>
                    <div className="font-mono text-sm font-bold text-rose-600">
                      {anom.change_pct > 0 ? `+${anom.change_pct}%` : `${anom.change_pct}%`}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-semibold line-clamp-2">
                  {anom.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                  <span>Type: {anom.anomaly_type}</span>
                  <span>{new Date(anom.detected_at).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 p-12 text-center rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Environmental Anomalies Detected</h3>
            <p className="text-xs text-slate-500 font-medium">
              The sensor network is currently operating within expected physical baseline thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

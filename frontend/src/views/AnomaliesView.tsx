import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Anomaly } from '../types';
import { Zap, ShieldCheck, RefreshCw, Download, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const AnomaliesView: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [triagedIds, setTriagedIds] = useState<Record<number, boolean>>({});

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

  const handleExportCsv = () => {
    if (anomalies.length === 0) return;
    const headers = ['ID', 'Node_ID', 'Parameter', 'Severity', 'Anomaly_Type', 'Previous_Value', 'Current_Value', 'Change_Pct', 'Description', 'Detected_At'];
    const rows = filtered.map((a) => [
      a.id,
      a.node_id,
      a.parameter,
      a.severity,
      a.anomaly_type,
      a.previous_value,
      a.current_value,
      a.change_pct,
      `"${(a.description || '').replace(/"/g, '""')}"`,
      new Date(a.detected_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `terrasentinel-anomalies-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriageAnomaly = (id: number) => {
    setTriagedIds((prev) => ({ ...prev, [id]: true }));
  };

  const filtered = anomalies.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff4405] flex items-center justify-center shadow-2xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Environmental Anomaly Detection</h2>
            <p className="text-xs text-slate-500 font-medium">
              Automated temporal spike identification, sensor flatline detection, and physical boundary validation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download anomaly log in CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Export CSV
          </button>

          <button
            onClick={fetchAnomalies}
            className="px-3.5 py-1.5 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4405]' : 'text-slate-400'}`} /> Sync
          </button>
        </div>
      </div>

      {/* Anomaly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((anom) => {
            const isCrit = anom.severity === 'CRITICAL';
            const isTriaged = !!triagedIds[anom.id];

            return (
              <div
                key={anom.id}
                className={`p-4 rounded-2xl bg-white border space-y-3 transition-all shadow-2xs ${
                  isTriaged
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                    : isCrit
                    ? 'border-rose-300 ring-1 ring-rose-200/50'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900">{anom.node_id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase font-bold">
                      {anom.parameter}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${isCrit ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-orange-50 text-[#ea580c] border border-orange-200'
                    }`}>
                    {anom.severity}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Value Shift</div>
                    <div className="font-mono text-sm font-bold text-slate-900">
                      {anom.previous_value.toFixed(1)} → {anom.current_value.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-medium">Delta</div>
                    <div className="font-mono text-sm font-bold text-[#ff4405]">
                      {anom.change_pct > 0 ? `+${anom.change_pct}%` : `${anom.change_pct}%`}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-bold line-clamp-2">
                  {anom.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 font-medium">
                  <span>Type: {anom.anomaly_type}</span>
                  <span>{new Date(anom.detected_at).toLocaleTimeString()}</span>
                </div>

                {/* Triage Action Button */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  {!isTriaged ? (
                    <button
                      onClick={() => handleTriageAnomaly(anom.id)}
                      className="px-3 py-1 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <ArrowUpRight className="w-3 h-3 text-[#ff4405]" /> Triage Anomaly
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Triaged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
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


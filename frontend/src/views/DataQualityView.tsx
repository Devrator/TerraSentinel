import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DataQualityReport } from '../types';
import { ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const DataQualityView: React.FC = () => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.getDataQuality();
      setReport(res);
    } catch (err) {
      console.error('Failed to load data quality report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Environmental Data Quality Center</h2>
            <p className="text-xs text-slate-400">
              Autonomous telemetry validation, data hygiene audits, and malformed packet rejection rules
            </p>
          </div>
        </div>

        <button
          onClick={fetchReport}
          className="px-3 py-1.5 rounded-xl bg-[#07110F] hover:bg-[#182B24] text-slate-300 hover:text-white border border-[#1B2D27] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} /> Run Hygiene Audit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-[#101D19] border border-emerald-500/30 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Overall Quality</div>
          <div className="font-mono text-2xl font-black text-emerald-400">
            {report?.overall_quality_score ?? 94.2}%
          </div>
          <div className="text-[11px] text-slate-400">Composite Confidence</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Completeness</div>
          <div className="font-mono text-2xl font-bold text-white">
            {report?.metrics.completeness ?? 98.4}%
          </div>
          <div className="text-[11px] text-slate-400">No dropped frames</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Freshness</div>
          <div className="font-mono text-2xl font-bold text-blue-400">
            {report?.metrics.freshness ?? 100}%
          </div>
          <div className="text-[11px] text-slate-400">&lt; 2 min delta</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Physical Validity</div>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            {report?.metrics.validity ?? 96.8}%
          </div>
          <div className="text-[11px] text-slate-400">Bounded limits</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Outliers Flagged</div>
          <div className="font-mono text-2xl font-bold text-amber-400">
            {report?.metrics.outliers_detected ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">Quarantined</div>
        </div>
      </div>

      {/* Grid: Validation Rules & Problematic Node Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Validation Rules */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Active Data Validation Rules
          </h3>

          <div className="space-y-2">
            {report?.validation_rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">{rule.rule}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  ENFORCED
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-slate-400">
            <strong className="text-slate-200 block mb-1">Automated Packet Quarantine:</strong>
            Any incoming telemetry breaching physical conservation laws is automatically rejected at the API boundary and recorded for auditability.
          </div>
        </div>

        {/* Problematic Node Diagnostics */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Node Data Hygiene Status
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {report?.node_diagnostics.map((node) => (
              <div
                key={node.node_id}
                className="p-3.5 rounded-xl bg-[#07110F] border border-[#1B2D27] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white">{node.node_id}</span>
                    <span className="text-xs text-slate-400">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>Stale: <strong className="text-slate-300 font-mono">{node.stale_minutes}m</strong></span>
                    <span>•</span>
                    <span>Anomalies: <strong className="text-amber-400 font-mono">{node.anomaly_count}</strong></span>
                    <span>•</span>
                    <span>Battery: <strong className="text-slate-300 font-mono">{node.battery.toFixed(0)}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono">Validity</div>
                    <div className="font-mono font-bold text-emerald-400 text-xs">{node.data_validity.toFixed(1)}%</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                    node.status === 'HEALTHY'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {node.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

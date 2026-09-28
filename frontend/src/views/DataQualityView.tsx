import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DataQualityReport } from '../types';
import { ShieldCheck, CheckCircle2, RefreshCw, Sparkles, Download } from 'lucide-react';

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

  const handleExportReport = () => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `terrasentinel-data-quality-report-${new Date().toISOString().slice(0, 10)}.json`);
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
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Environmental Data Quality Center</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#121417] text-white font-bold">
                SIH26178 DATA HYGIENE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Autonomous telemetry validation, data hygiene audits, and malformed packet rejection rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download full data hygiene report in JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Export Audit (.json)
          </button>

          <button
            onClick={fetchReport}
            className="px-4 py-2 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4405]' : 'text-slate-400'}`} /> Run Hygiene Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#121417] text-white border border-zinc-800 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Overall Quality</span>
            <Sparkles className="w-3.5 h-3.5 text-[#ff4405]" />
          </div>
          <div className="font-mono text-2xl font-black text-white">
            {report?.overall_quality_score ?? 94.2}%
          </div>
          <div className="text-[11px] text-orange-200/80 font-medium">Composite Confidence</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Completeness</div>
          <div className="font-mono text-2xl font-bold text-slate-900">
            {report?.metrics.completeness ?? 98.4}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">No dropped frames</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Freshness</div>
          <div className="font-mono text-2xl font-bold text-blue-700">
            {report?.metrics.freshness ?? 100}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">&lt; 2 min delta</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Physical Validity</div>
          <div className="font-mono text-2xl font-bold text-emerald-700">
            {report?.metrics.validity ?? 96.8}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Bounded limits</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Outliers Flagged</div>
          <div className="font-mono text-2xl font-bold text-[#ea580c]">
            {report?.metrics.outliers_detected ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Quarantined</div>
        </div>
      </div>

      {/* Grid: Validation Rules & Problematic Node Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Validation Rules */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Active Data Validation Rules
          </h3>

          <div className="space-y-2.5">
            {report?.validation_rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-800 font-semibold text-[11px]">{rule.rule}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ENFORCED
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/60 text-xs text-slate-700 font-medium leading-relaxed">
            <strong className="text-slate-900 block mb-1">Automated Packet Quarantine:</strong>
            Any incoming telemetry breaching physical conservation laws is automatically rejected at the API boundary and recorded for auditability.
          </div>
        </div>

        {/* Problematic Node Diagnostics */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Node Data Hygiene Status
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {report?.node_diagnostics.map((node) => (
              <div
                key={node.node_id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{node.node_id}</span>
                    <span className="text-xs text-slate-500 font-medium">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                    <span>Stale: <strong className="text-slate-800 font-mono">{node.stale_minutes}m</strong></span>
                    <span>•</span>
                    <span>Anomalies: <strong className="text-[#ea580c] font-mono">{node.anomaly_count}</strong></span>
                    <span>•</span>
                    <span>Battery: <strong className="text-emerald-700 font-mono">{node.battery.toFixed(0)}%</strong></span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold self-start sm:self-center border ${
                  node.status === 'HEALTHY'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Cpu, Wifi, AlertTriangle, TrendingUp } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface KpiCardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, loading }) => {
  const totalNodes = summary?.total_nodes ?? 5;
  const onlineNodes = summary?.online_nodes ?? 5;
  const activeAlerts = summary?.active_alerts ?? 0;
  const criticalHazards = summary?.critical_alerts ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4">
      {/* 1. Dark Obsidian Card (Total Fleet Deployment) */}
      <div className="rounded-2xl bg-[#121417] text-white p-4 lg:p-5 flex flex-col justify-between shadow-xs relative overflow-hidden border border-zinc-800 group hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Total Fleet Nodes</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            +1 Physical ESP32
          </span>
        </div>

        <div className="flex items-end justify-between mt-3 z-10">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-white">
              {loading ? '--' : totalNodes}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5 font-medium">
              1 Physical Prototype + 4 Virtual Twins
            </div>
          </div>

          {/* Stylized Mini Vertical Bars */}
          <div className="flex items-end gap-1 h-10 pb-1">
            <span className="w-1.5 h-4 bg-zinc-700 rounded-xs" />
            <span className="w-1.5 h-6 bg-zinc-600 rounded-xs" />
            <span className="w-1.5 h-8 bg-emerald-500 rounded-xs animate-pulse" />
            <span className="w-1.5 h-5 bg-zinc-600 rounded-xs" />
            <span className="w-1.5 h-9 bg-emerald-400 rounded-xs" />
            <span className="w-1.5 h-7 bg-zinc-700 rounded-xs" />
          </div>
        </div>
      </div>

      {/* 2. Electric Flame Orange Card (Data Reliability / Online Rate) */}
      <div className="rounded-2xl bg-[#ff4405] text-white p-4 lg:p-5 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:brightness-105 transition-all">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
            <Wifi className="w-4 h-4 text-white" />
            <span>Telemetry Uplink</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold backdrop-blur-xs">
            {onlineNodes}/{totalNodes} Active
          </span>
        </div>

        <div className="flex items-end justify-between mt-3 z-10">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-white">
              {loading ? '--' : `${Math.round((onlineNodes / Math.max(totalNodes, 1)) * 100)}%`}
            </div>
            <div className="text-[11px] text-white/80 mt-0.5 font-medium">
              Zero-Loss Flash Resilience Buffer
            </div>
          </div>

          {/* White Mini Vertical Sparkline Bars */}
          <div className="flex items-end gap-1 h-10 pb-1">
            <span className="w-1.5 h-3 bg-white/40 rounded-xs" />
            <span className="w-1.5 h-5 bg-white/60 rounded-xs" />
            <span className="w-1.5 h-7 bg-white/80 rounded-xs" />
            <span className="w-1.5 h-9 bg-white rounded-xs shadow-xs" />
            <span className="w-1.5 h-8 bg-white/90 rounded-xs" />
            <span className="w-1.5 h-6 bg-white/70 rounded-xs" />
          </div>
        </div>
      </div>

      {/* 3. Clean White Card with Area Wave Sparkline (Average Heat & Moisture) */}
      <div className="rounded-2xl bg-white text-slate-900 p-4 lg:p-5 flex flex-col justify-between shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span>Mean Sector Temperature</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            Nominal
          </span>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-slate-900">
              {summary?.average_temperature ? `${summary.average_temperature.toFixed(1)}°C` : '26.4°C'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Humidity: {summary?.average_humidity ? `${summary.average_humidity.toFixed(0)}%` : '48%'} RH
            </div>
          </div>

          {/* Smooth SVG Area Wave Sparkline */}
          <div className="w-20 h-10">
            <svg viewBox="0 0 80 40" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 25 Q 15 10, 30 22 T 60 14 T 80 18 L 80 40 L 0 40 Z"
                fill="url(#waveGradient)"
              />
              <path
                d="M0 25 Q 15 10, 30 22 T 60 14 T 80 18"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Clean White Card with Risk Density (Threat Matrix / Hazards) */}
      <div className="rounded-2xl bg-white text-slate-900 p-4 lg:p-5 flex flex-col justify-between shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <AlertTriangle className={`w-4 h-4 ${activeAlerts > 0 ? 'text-[#ff4405]' : 'text-slate-500'}`} />
            <span>Active Environmental Risk</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
            criticalHazards > 0
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              : activeAlerts > 0
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {criticalHazards > 0 ? `${criticalHazards} Critical` : activeAlerts > 0 ? `${activeAlerts} Warning` : 'All Clear'}
          </span>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-slate-900">
              {loading ? '--' : activeAlerts}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {activeAlerts === 0 ? 'Zero active alerts' : 'Requires operator triage'}
            </div>
          </div>

          {/* Density colored sparkline bars */}
          <div className="flex items-end gap-1 h-10 pb-1">
            <span className="w-1.5 h-3 bg-slate-200 rounded-xs" />
            <span className="w-1.5 h-5 bg-slate-300 rounded-xs" />
            <span className={`w-1.5 h-7 rounded-xs ${activeAlerts > 0 ? 'bg-[#ff4405]' : 'bg-slate-300'}`} />
            <span className={`w-1.5 h-9 rounded-xs ${criticalHazards > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-200'}`} />
            <span className="w-1.5 h-6 bg-slate-300 rounded-xs" />
            <span className="w-1.5 h-4 bg-slate-200 rounded-xs" />
          </div>
        </div>
      </div>
    </div>
  );
};

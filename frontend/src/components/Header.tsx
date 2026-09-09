import React from 'react';
import { Radio, RefreshCw, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface HeaderProps {
  summary: DashboardSummary | null;
  isConnected: boolean;
  lastUpdateTime: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  isConnected,
  lastUpdateTime,
  onRefresh,
  isLoading,
}) => {
  const getStatusBadge = () => {
    if (!isConnected) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Disconnected</span>
        </div>
      );
    }
    if (summary?.critical_alerts && summary.critical_alerts > 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          <span>Hazard Alert ({summary.critical_alerts})</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>System Operational</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 pt-3 pb-2 px-4 lg:px-6">
      <div className="max-w-[1600px] mx-auto bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl px-4 lg:px-6 py-2.5 transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">

          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="TerraSentinel Logo"
              className="h-20 sm:h-21 w-auto object-contain transition-transform hover:scale-102"
            />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              {/* <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                SIH26178
              </span> */}
              <span className="text-[11px] font-medium text-slate-500">
                Early Warning Intelligence
              </span>
            </div>
          </div>

          {/* Controls & Telemetry Stats */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">

            {/* Mode Capsule */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400 text-[11px]">Mode:</span>
              <span className="font-semibold text-slate-800">
                {summary?.demo_mode ? 'Simulation' : 'Live ESP32'}
              </span>
            </div>

            {/* Live Stream Capsule */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs">
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span className={`font-semibold ${isConnected ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isConnected ? 'Live Telemetry' : 'Offline'}
              </span>
            </div>

            {/* Health Pill */}
            {getStatusBadge()}

            {/* Sync Timestamp & Action Button */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-[11px] text-slate-400 font-mono hidden xl:inline-block">
                {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : ''}
              </span>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                title="Sync Live Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

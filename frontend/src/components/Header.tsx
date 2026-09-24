import React from 'react';
import { Radio, RefreshCw, Cpu, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface HeaderProps {
  summary: DashboardSummary | null;
  isConnected: boolean;
  lastUpdateTime: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
  onTriggerDemo?: () => void;
  isDemoRunning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  isConnected,
  lastUpdateTime,
  onRefresh,
  isLoading,
  onTriggerDemo,
  isDemoRunning,
}) => {
  const getStatusBadge = () => {
    if (!isConnected) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
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
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>System Operational</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 pt-3 pb-2 px-4 lg:px-6">
      <div className="max-w-[1600px] mx-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl px-4 lg:px-6 py-3 transition-all shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">

          {/* Left: Minimal Platform & Problem Statement Badge */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 tracking-wider uppercase">
              SIH26178
            </span>
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block">
              AI Environmental Intelligence & Early Warning Network
            </span>
          </div>

          {/* Right: Telemetry Status Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">

            {/* Demo Mode Button for Judges */}
            {onTriggerDemo && (
              <button
                onClick={onTriggerDemo}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isDemoRunning
                    ? 'bg-purple-600 text-white shadow-2xs animate-pulse'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
                title="Trigger automated 3-minute hackathon demonstration"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDemoRunning ? 'Demo Active' : 'Demo Mode'}</span>
              </button>
            )}

            {/* Mode Capsule */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400 text-[11px]">Mode:</span>
              <span className="font-semibold text-slate-800">
                {summary?.demo_mode ? 'Simulation' : 'Live ESP32'}
              </span>
            </div>

            {/* Live Stream Capsule */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span className={`font-semibold ${isConnected ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isConnected ? 'Live Telemetry' : 'Offline'}
              </span>
            </div>

            {/* Health Status Pill */}
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

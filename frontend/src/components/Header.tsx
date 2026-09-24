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
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Disconnected</span>
        </div>
      );
    }
    if (summary?.critical_alerts && summary.critical_alerts > 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          <span>Hazard Alert ({summary.critical_alerts})</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>System Operational</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 pt-3 pb-2 px-4 lg:px-6">
      <div className="max-w-[1600px] mx-auto bg-[#101D19]/90 backdrop-blur-md border border-[#1B2D27] rounded-2xl px-4 lg:px-6 py-2.5 transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">

          {/* Operational Title & Identity */}


          {/* Controls & Telemetry Stats */}
          <div className="flex flex-wrap items-center gap-5 w-full md:w-auto justify-between md:justify-between ">

            {/* Demo Mode Button for Judges */}
            {onTriggerDemo && (
              <button
                onClick={onTriggerDemo}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isDemoRunning
                  ? 'bg-purple-500 text-slate-950 shadow-xs animate-pulse'
                  : 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30'
                  }`}
                title="Trigger automated 3-minute hackathon demonstration"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDemoRunning ? 'Demo Running' : 'Demo Mode'}</span>
              </button>
            )}

            {/* Mode Capsule */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-[11px]">Mode:</span>
              <span className="font-semibold text-emerald-400">
                {summary?.demo_mode ? 'Simulated Data' : 'Live Hardware'}
              </span>
            </div>



            {/* Health Pill */}
            {getStatusBadge()}



          </div>
        </div>
      </div>
    </header>
  );
};

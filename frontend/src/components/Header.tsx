import React from 'react';
import { Activity, Radio, RefreshCw, Cpu, Sparkles, AlertTriangle } from 'lucide-react';
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          DISCONNECTED
        </span>
      );
    }
    if (summary?.critical_alerts && summary.critical_alerts > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          HAZARD ALERT ({summary.critical_alerts})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        SYSTEM OPERATIONAL
      </span>
    );
  };

  return (
    <header className="bg-dark-900/90 backdrop-blur-md border-b border-dark-700/60 sticky top-0 z-50 px-4 lg:px-8 py-3.5 shadow-xl transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Title & Brand Section */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AI ENVIRONMENTAL MONITORING NETWORK
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                SIH26178
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-medium flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Real-Time Environmental Intelligence & Early Warning System
            </p>
          </div>
        </div>

        {/* Telemetry Status Bar & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Live vs Demo Mode Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-medium">Mode:</span>
            <span className="font-semibold text-cyan-300">
              {summary?.demo_mode ? 'PROTOTYPE SIMULATION' : 'LIVE ESP32 HARDWARE'}
            </span>
          </div>

          {/* WebSocket Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-slate-400 font-medium">Live Stream:</span>
            <span className={`font-semibold ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isConnected ? 'STREAMING' : 'OFFLINE'}
            </span>
          </div>

          {/* System Status Pill */}
          {getStatusBadge()}

          {/* Last Update & Manual Refresh */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
              {lastUpdateTime ? `Updated ${lastUpdateTime.toLocaleTimeString()}` : 'Syncing...'}
            </span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

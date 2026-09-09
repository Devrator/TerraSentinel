import React from 'react';
import { Cpu, Wifi, AlertTriangle, Flame } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface KpiCardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, loading }) => {
  const cards = [
    {
      title: 'TOTAL NODES',
      value: summary?.total_nodes ?? 0,
      subtext: `${summary?.offline_nodes ?? 0} standby/offline`,
      icon: Cpu,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'ONLINE NODES',
      value: summary?.online_nodes ?? 0,
      subtext: summary?.total_nodes ? `${Math.round(((summary.online_nodes) / summary.total_nodes) * 100)}% active fleet` : '0%',
      icon: Wifi,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'ACTIVE ALERTS',
      value: summary?.active_alerts ?? 0,
      subtext: 'Pending triage',
      icon: AlertTriangle,
      color: summary && summary.active_alerts > 0 ? 'text-amber-400' : 'text-slate-400',
      border: summary && summary.active_alerts > 0 ? 'border-amber-500/30' : 'border-dark-700',
      bg: summary && summary.active_alerts > 0 ? 'bg-amber-500/10' : 'bg-dark-800',
    },
    {
      title: 'CRITICAL HAZARDS',
      value: summary?.critical_alerts ?? 0,
      subtext: summary?.critical_alerts ? 'Immediate action required' : 'No critical anomalies',
      icon: Flame,
      color: summary && summary.critical_alerts > 0 ? 'text-rose-400' : 'text-slate-400',
      border: summary && summary.critical_alerts > 0 ? 'border-rose-500/40 animate-pulse' : 'border-dark-700',
      bg: summary && summary.critical_alerts > 0 ? 'bg-rose-500/15' : 'bg-dark-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl bg-dark-900/80 backdrop-blur-sm border ${card.border} p-4 transition-all duration-300 shadow-md group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 font-mono">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${card.color}`}>
                {loading ? '--' : card.value}
              </span>
            </div>

            <div className="mt-1 text-xs text-slate-400">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};

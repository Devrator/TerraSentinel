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
      subtext: `${summary?.offline_nodes ?? 0} offline nodes`,
      icon: Cpu,
      color: 'text-white',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border border-blue-500/20',
      border: 'border-[#1B2D27] hover:border-blue-500/30',
    },
    {
      title: 'ONLINE NODES',
      value: summary?.online_nodes ?? 0,
      subtext: summary?.total_nodes ? `${Math.round(((summary.online_nodes) / summary.total_nodes) * 100)}% active fleet` : '0%',
      icon: Wifi,
      color: 'text-emerald-400',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
      border: 'border-[#1B2D27] hover:border-emerald-500/30',
    },
    {
      title: 'ACTIVE ALERTS',
      value: summary?.active_alerts ?? 0,
      subtext: summary && summary.active_alerts > 0 ? 'Action required' : 'All clear',
      icon: AlertTriangle,
      color: summary && summary.active_alerts > 0 ? 'text-amber-400' : 'text-slate-200',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border border-amber-500/20',
      border: summary && summary.active_alerts > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-[#1B2D27]',
    },
    {
      title: 'CRITICAL HAZARDS',
      value: summary?.critical_alerts ?? 0,
      subtext: summary?.critical_alerts ? 'Immediate dispatch' : 'Zero hazard spikes',
      icon: Flame,
      color: summary && summary.critical_alerts > 0 ? 'text-rose-400' : 'text-slate-200',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border border-rose-500/20',
      border: summary && summary.critical_alerts > 0 ? 'border-rose-500/40 bg-rose-500/10 shadow-xs' : 'border-[#1B2D27]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl bg-[#101D19] border ${card.border} p-4 transition-all duration-200 shadow-xs hover:border-[#2A453C]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${card.color}`}>
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

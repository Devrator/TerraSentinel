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
      color: 'text-slate-900',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border border-blue-100',
      border: 'border-slate-200 hover:border-blue-300',
    },
    {
      title: 'ONLINE NODES',
      value: summary?.online_nodes ?? 0,
      subtext: summary?.total_nodes ? `${Math.round(((summary.online_nodes) / summary.total_nodes) * 100)}% active fleet` : '0%',
      icon: Wifi,
      color: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border border-emerald-100',
      border: 'border-slate-200 hover:border-emerald-300',
    },
    {
      title: 'ACTIVE ALERTS',
      value: summary?.active_alerts ?? 0,
      subtext: summary && summary.active_alerts > 0 ? 'Action required' : 'All clear',
      icon: AlertTriangle,
      color: summary && summary.active_alerts > 0 ? 'text-amber-700' : 'text-slate-900',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border border-amber-100',
      border: summary && summary.active_alerts > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200',
    },
    {
      title: 'CRITICAL HAZARDS',
      value: summary?.critical_alerts ?? 0,
      subtext: summary?.critical_alerts ? 'Immediate dispatch' : 'Zero hazard spikes',
      icon: Flame,
      color: summary && summary.critical_alerts > 0 ? 'text-rose-700' : 'text-slate-900',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border border-rose-100',
      border: summary && summary.critical_alerts > 0 ? 'border-rose-300 bg-rose-50/40 shadow-2xs' : 'border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl bg-white border ${card.border} p-4 transition-all duration-200 shadow-2xs hover:shadow-xs`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 font-mono uppercase">
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

            <div className="mt-1 text-xs text-slate-500">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};

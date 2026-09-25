import React from 'react';
import { Flame, Waves, Wind, ShieldAlert } from 'lucide-react';
import type { SensorNode } from '../types';

interface RiskPanelProps {
  selectedNode: SensorNode | null;
  nodes?: SensorNode[];
  onSelectNode?: (nodeId: string) => void;
  demoMode?: boolean;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({
  selectedNode,
  demoMode: _demoMode = true,
}) => {
  const risk = selectedNode?.latest_risk;

  const getCategoryBadge = (category: string = 'LOW') => {
    switch (category) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse font-bold';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-300 font-bold';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score > 75) return 'from-rose-500 to-rose-600';
    if (score > 50) return 'from-orange-500 to-amber-500';
    if (score > 25) return 'from-amber-400 to-amber-500';
    return 'from-emerald-400 to-teal-500';
  };

  const hazardCards = [
    {
      title: 'FOREST FIRE RISK',
      score: risk?.fire_risk ?? 0,
      category: risk?.fire_category ?? 'LOW',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-slate-200 hover:border-orange-200',
      description: 'Thermal spikes, low humidity & combustion gas detection',
      indicators: [
        { label: 'Thermal Index', status: (selectedNode?.latest_reading?.temperature ?? 0) > 38 ? 'High' : 'Normal' },
        { label: 'Drying Factor', status: (selectedNode?.latest_reading?.humidity ?? 50) < 25 ? 'Dry' : 'Normal' },
        { label: 'Combustion Gas', status: (selectedNode?.latest_reading?.air_quality ?? 0) > 250 ? 'Spike' : 'Normal' },
      ]
    },
    {
      title: 'FLOOD & SURGE RISK',
      score: risk?.flood_risk ?? 0,
      category: risk?.flood_category ?? 'LOW',
      icon: Waves,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-slate-200 hover:border-cyan-200',
      description: 'Rain intensity, moisture saturation & barometric drops',
      indicators: [
        { label: 'Rain Inflow', status: (selectedNode?.latest_reading?.rain_value ?? 0) > 500 ? 'Surge' : 'Normal' },
        { label: 'Moisture Saturation', status: (selectedNode?.latest_reading?.humidity ?? 0) > 85 ? 'High' : 'Normal' },
        { label: 'Barometric Drop', status: (selectedNode?.latest_reading?.pressure ?? 1013) < 1000 ? 'Low Front' : 'Stable' },
      ]
    },
    {
      title: 'POLLUTION RISK',
      score: risk?.pollution_risk ?? 0,
      category: risk?.pollution_category ?? 'LOW',
      icon: Wind,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-slate-200 hover:border-purple-200',
      description: 'Particulate air quality index & atmospheric trapping',
      indicators: [
        { label: 'Particulates', status: (selectedNode?.latest_reading?.air_quality ?? 0) > 200 ? 'Elevated' : 'Clean' },
        { label: 'Inversion', status: (selectedNode?.latest_reading?.humidity ?? 0) > 75 && (selectedNode?.latest_reading?.temperature ?? 30) < 22 ? 'Inversion' : 'Dispersed' },
        { label: 'AQI Level', status: (selectedNode?.latest_reading?.air_quality ?? 0) > 300 ? 'Hazard' : 'Moderate' },
      ]
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 lg:p-6 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                AI Environmental Risk Assessment
              </h2>

            </div>
            <p className="text-xs text-slate-500 font-medium">
              Multi-variate predictive hazard scoring for <span className="font-mono text-emerald-700 font-bold">{selectedNode?.node_id ?? 'None'}</span>
            </p>
          </div>
        </div>

        {/* Overall Composite Score Pill */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
          <span className="text-xs text-slate-600 font-medium">Composite Hazard:</span>
          <span className="text-base font-extrabold font-mono text-slate-900">
            {risk?.overall_risk.toFixed(1) ?? '0.0'}%
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] border ${getCategoryBadge(risk?.overall_category)}`}>
            {risk?.overall_category ?? 'LOW'}
          </span>
        </div>
      </div>

      {/* 3 Main Hazard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hazardCards.map((hazard, idx) => {
          const Icon = hazard.icon;
          return (
            <div
              key={idx}
              className={`rounded-xl bg-slate-50/50 border ${hazard.borderColor} p-4 flex flex-col justify-between shadow-2xs transition-all hover:bg-white hover:shadow-xs`}
            >
              <div>
                {/* Title & Category Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${hazard.bgColor}`}>
                      <Icon className={`w-4 h-4 ${hazard.color}`} />
                    </div>
                    <span className="text-xs font-bold tracking-wider text-slate-800">
                      {hazard.title}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getCategoryBadge(hazard.category)}`}>
                    {hazard.category}
                  </span>
                </div>

                {/* Score */}
                <div className="mt-4 mb-2 flex items-baseline justify-between">
                  <span className={`text-3xl font-black tracking-tight font-mono ${hazard.color}`}>
                    {hazard.score.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    0 - 100 Scale
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(hazard.score)} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, hazard.score))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed font-medium">
                  {hazard.description}
                </p>
              </div>

              {/* Indicators */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-1.5 text-center">
                {hazard.indicators.map((ind, i) => (
                  <div key={i} className="bg-white p-1.5 rounded-md border border-slate-200 shadow-2xs">
                    <div className="text-[9px] text-slate-500 truncate">{ind.label}</div>
                    <div className="text-[10px] font-mono font-bold text-slate-800 mt-0.5 truncate">{ind.status}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

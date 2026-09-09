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
  demoMode = true,
}) => {
  const risk = selectedNode?.latest_risk;

  const getCategoryBadge = (category: string = 'LOW') => {
    switch (category) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20 shadow-md animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score > 75) return 'from-rose-600 to-rose-400';
    if (score > 50) return 'from-orange-500 to-amber-400';
    if (score > 25) return 'from-amber-500 to-yellow-400';
    return 'from-emerald-600 to-teal-400';
  };

  const hazardCards = [
    {
      title: 'FOREST FIRE RISK',
      score: risk?.fire_risk ?? 0,
      category: risk?.fire_category ?? 'LOW',
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      description: 'Calculated from thermal peaks, low moisture & combustion gas levels',
      indicators: [
        { label: 'Thermal Index', status: (selectedNode?.latest_reading?.temperature ?? 0) > 38 ? 'Critical' : 'Normal' },
        { label: 'Drying Factor', status: (selectedNode?.latest_reading?.humidity ?? 50) < 25 ? 'High' : 'Normal' },
        { label: 'Combustion Gas', status: (selectedNode?.latest_reading?.air_quality ?? 0) > 250 ? 'Spike' : 'Normal' },
      ]
    },
    {
      title: 'FLOOD & SURGE RISK',
      score: risk?.flood_risk ?? 0,
      category: risk?.flood_category ?? 'LOW',
      icon: Waves,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      description: 'Calculated from rain intensity, barometric depressions & saturation trends',
      indicators: [
        { label: 'Rain Inflow', status: (selectedNode?.latest_reading?.rain_value ?? 0) > 500 ? 'Surge' : 'Normal' },
        { label: 'Humidity Saturation', status: (selectedNode?.latest_reading?.humidity ?? 0) > 85 ? 'Saturated' : 'Normal' },
        { label: 'Barometric Drop', status: (selectedNode?.latest_reading?.pressure ?? 1013) < 1000 ? 'Low Front' : 'Stable' },
      ]
    },
    {
      title: 'POLLUTION & HAZMAT RISK',
      score: risk?.pollution_risk ?? 0,
      category: risk?.pollution_category ?? 'LOW',
      icon: Wind,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description: 'Calculated from particulate indices and stagnant atmospheric trapping',
      indicators: [
        { label: 'Air Particulates', status: (selectedNode?.latest_reading?.air_quality ?? 0) > 200 ? 'Hazardous' : 'Clean' },
        { label: 'Thermal Inversion', status: (selectedNode?.latest_reading?.humidity ?? 0) > 75 && (selectedNode?.latest_reading?.temperature ?? 30) < 22 ? 'Inversion' : 'Dispersed' },
        { label: 'AQI Severity', status: (selectedNode?.latest_reading?.air_quality ?? 0) > 350 ? 'Severe' : 'Moderate' },
      ]
    },
  ];

  return (
    <div className="rounded-xl border border-dark-700 bg-dark-900 p-4 lg:p-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-dark-700/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                AI Environmental Risk Assessment Engine
              </h2>
              {demoMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Prototype Risk Simulation
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Multi-variate predictive hazard scoring for node <span className="font-mono text-emerald-400 font-bold">{selectedNode?.node_id ?? 'None'}</span>
            </p>
          </div>
        </div>

        {/* Overall Composite Score Pill */}
        <div className="flex items-center gap-3 bg-dark-850 border border-dark-700 px-3.5 py-1.5 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Composite Hazard:</span>
          <span className="text-lg font-black font-mono text-slate-100">
            {risk?.overall_risk.toFixed(1) ?? '0.0'}%
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(risk?.overall_category)}`}>
            {risk?.overall_category ?? 'LOW'}
          </span>
        </div>
      </div>

      {/* 3 Main Hazard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {hazardCards.map((hazard, idx) => {
          const Icon = hazard.icon;
          return (
            <div
              key={idx}
              className={`rounded-xl bg-dark-850/80 backdrop-blur-sm border ${hazard.borderColor} p-4 flex flex-col justify-between shadow-lg transition-all hover:bg-dark-800/90`}
            >
              <div>
                {/* Title & Category Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${hazard.bgColor}`}>
                      <Icon className={`w-4 h-4 ${hazard.color}`} />
                    </div>
                    <span className="text-xs font-bold tracking-wider text-slate-200">
                      {hazard.title}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(hazard.category)}`}>
                    {hazard.category}
                  </span>
                </div>

                {/* Main Percentage Score */}
                <div className="mt-4 mb-2 flex items-baseline justify-between">
                  <span className={`text-3xl lg:text-4xl font-black tracking-tight font-mono ${hazard.color}`}>
                    {hazard.score.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Scale: 0 - 100
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-dark-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-dark-700">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(hazard.score)} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, hazard.score))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  {hazard.description}
                </p>
              </div>

              {/* Multi-variate Indicator Diagnostics */}
              <div className="mt-4 pt-3 border-t border-dark-700/60 grid grid-cols-3 gap-1.5 text-center">
                {hazard.indicators.map((ind, i) => (
                  <div key={i} className="bg-dark-900/60 p-1.5 rounded-md border border-dark-700/40">
                    <div className="text-[9px] text-slate-400 truncate">{ind.label}</div>
                    <div className="text-[10px] font-mono font-bold text-slate-200 mt-0.5 truncate">{ind.status}</div>
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

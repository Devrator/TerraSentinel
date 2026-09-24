import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AnalyticsTrendsData, SensorNode } from '../types';
import { TrendingUp, Flame, Droplets, Wind, Gauge, CloudRain } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface AnalyticsTrendsViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

export const AnalyticsTrendsView: React.FC<AnalyticsTrendsViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const [timeRange, setTimeRange] = useState<string>('24H');
  const [activeMetric, setActiveMetric] = useState<string>('TEMPERATURE');
  const [trends, setTrends] = useState<AnalyticsTrendsData | null>(null);

  const fetchTrends = async (range: string, node: string) => {
    try {
      const res = await api.getAnalyticsTrends(range, node);
      setTrends(res);
    } catch (err) {
      console.error('Failed to load trends:', err);
    }
  };

  useEffect(() => {
    fetchTrends(timeRange, selectedNodeId);
  }, [timeRange, selectedNodeId]);

  const getMetricData = () => {
    if (!trends) return { values: [], stats: { min: 0, max: 0, avg: 0, rate_of_change: 0 }, color: '#63D89A', label: 'Telemetry', unit: '' };

    switch (activeMetric) {
      case 'TEMPERATURE':
        return { values: trends.temperature.values, stats: trends.temperature.stats, color: '#F59E0B', label: 'Temperature', unit: '°C' };
      case 'HUMIDITY':
        return { values: trends.humidity.values, stats: trends.humidity.stats, color: '#3B82F6', label: 'Humidity', unit: '%' };
      case 'PRESSURE':
        return { values: trends.pressure.values, stats: trends.pressure.stats, color: '#8B5CF6', label: 'Pressure', unit: 'hPa' };
      case 'RAIN':
        return { values: trends.rain.values, stats: trends.rain.stats, color: '#06B6D4', label: 'Precipitation', unit: 'mm' };
      case 'AIR_QUALITY':
        return { values: trends.air_quality.values, stats: trends.air_quality.stats, color: '#10B981', label: 'Air Quality', unit: 'AQI' };
      case 'FIRE_RISK':
        return { values: trends.risks.fire.values, stats: trends.risks.fire.stats, color: '#EF4444', label: 'Fire Hazard Rating', unit: '%' };
      case 'FLOOD_RISK':
        return { values: trends.risks.flood.values, stats: trends.risks.flood.stats, color: '#0284C7', label: 'Flood Inflow Risk', unit: '%' };
      case 'POLLUTION_RISK':
        return { values: trends.risks.pollution.values, stats: trends.risks.pollution.stats, color: '#10B981', label: 'Air Pollution Index', unit: '%' };
      default:
        return { values: trends.temperature.values, stats: trends.temperature.stats, color: '#F59E0B', label: 'Temperature', unit: '°C' };
    }
  };

  const currentMetric = getMetricData();

  const chartData = (trends?.timestamps || []).map((t, idx) => ({
    time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    val: currentMetric.values[idx] ?? 0,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Environmental Trend Analytics</h2>
            <p className="text-xs text-slate-400">
              Longitudinal timeseries regression, rate-of-change statistics, and multi-range hazard evolution
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Node Selector */}
          <select
            value={selectedNodeId}
            onChange={(e) => onSelectNode(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {nodes.map((n) => (
              <option key={n.node_id} value={n.node_id}>
                {n.node_id} ({n.name})
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#07110F] border border-[#1B2D27]">
            {['1H', '6H', '24H', '7D', '30D'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-[#182B24]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'TEMPERATURE', label: 'Temperature', icon: Flame, color: 'text-amber-400' },
          { id: 'HUMIDITY', label: 'Humidity', icon: Droplets, color: 'text-blue-400' },
          { id: 'PRESSURE', label: 'Pressure', icon: Gauge, color: 'text-purple-400' },
          { id: 'RAIN', label: 'Rainfall', icon: CloudRain, color: 'text-cyan-400' },
          { id: 'AIR_QUALITY', label: 'Air Quality', icon: Wind, color: 'text-emerald-400' },
          { id: 'FIRE_RISK', label: 'Fire Risk', icon: Flame, color: 'text-rose-400' },
          { id: 'FLOOD_RISK', label: 'Flood Risk', icon: Droplets, color: 'text-blue-500' },
          { id: 'POLLUTION_RISK', label: 'Pollution Risk', icon: Wind, color: 'text-emerald-400' },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeMetric === m.id;

          return (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold shadow-xs'
                  : 'bg-[#101D19] border-[#1B2D27] text-slate-400 hover:text-slate-200 hover:bg-[#182B24]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Minimum Recorded</div>
          <div className="font-mono text-xl font-bold text-white mt-0.5">
            {currentMetric.stats.min} {currentMetric.unit}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Maximum Recorded</div>
          <div className="font-mono text-xl font-bold text-rose-400 mt-0.5">
            {currentMetric.stats.max} {currentMetric.unit}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Period Average</div>
          <div className="font-mono text-xl font-bold text-emerald-400 mt-0.5">
            {currentMetric.stats.avg} {currentMetric.unit}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Net Rate of Change</div>
          <div className="font-mono text-xl font-bold text-amber-400 mt-0.5">
            {currentMetric.stats.rate_of_change > 0 ? `+${currentMetric.stats.rate_of_change}` : currentMetric.stats.rate_of_change} {currentMetric.unit}
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1B2D27]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            {currentMetric.label} Regression Timeline ({timeRange})
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            {trends?.sample_count ?? 0} Datapoints Audited
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#101D19" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#07110F', borderColor: '#1B2D27', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  name={`${currentMetric.label} (${currentMetric.unit})`}
                  stroke={currentMetric.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#metricGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading analytics timeseries...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

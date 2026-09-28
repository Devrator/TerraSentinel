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
    if (!trends) return { values: [], stats: { min: 0, max: 0, avg: 0, rate_of_change: 0 }, color: '#ff4405', label: 'Telemetry', unit: '' };

    switch (activeMetric) {
      case 'TEMPERATURE':
        return { values: trends.temperature.values, stats: trends.temperature.stats, color: '#ff4405', label: 'Temperature', unit: '°C' };
      case 'HUMIDITY':
        return { values: trends.humidity.values, stats: trends.humidity.stats, color: '#0891b2', label: 'Humidity', unit: '%' };
      case 'PRESSURE':
        return { values: trends.pressure.values, stats: trends.pressure.stats, color: '#9333ea', label: 'Pressure', unit: 'hPa' };
      case 'RAIN':
        return { values: trends.rain.values, stats: trends.rain.stats, color: '#2563eb', label: 'Precipitation', unit: 'mm' };
      case 'AIR_QUALITY':
        return { values: trends.air_quality.values, stats: trends.air_quality.stats, color: '#059669', label: 'Air Quality', unit: 'AQI' };
      case 'FIRE_RISK':
        return { values: trends.risks.fire.values, stats: trends.risks.fire.stats, color: '#ff4405', label: 'Fire Hazard Rating', unit: '%' };
      case 'FLOOD_RISK':
        return { values: trends.risks.flood.values, stats: trends.risks.flood.stats, color: '#0284C7', label: 'Flood Inflow Risk', unit: '%' };
      case 'POLLUTION_RISK':
        return { values: trends.risks.pollution.values, stats: trends.risks.pollution.stats, color: '#059669', label: 'Air Pollution Index', unit: '%' };
      default:
        return { values: trends.temperature.values, stats: trends.temperature.stats, color: '#ff4405', label: 'Temperature', unit: '°C' };
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff4405] flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Environmental Trend Analytics</h2>
            <p className="text-xs text-slate-500 font-medium">
              Longitudinal timeseries regression, rate-of-change statistics, and multi-range hazard evolution
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Node Selector */}
          <select
            value={selectedNodeId}
            onChange={(e) => onSelectNode(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            {nodes.map((n) => (
              <option key={n.node_id} value={n.node_id}>
                {n.node_id} ({n.name})
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {['1H', '6H', '24H', '7D', '30D'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-[#121417] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
          { id: 'TEMPERATURE', label: 'Temperature', icon: Flame, color: 'text-[#ff4405]' },
          { id: 'HUMIDITY', label: 'Humidity', icon: Droplets, color: 'text-blue-500' },
          { id: 'PRESSURE', label: 'Pressure', icon: Gauge, color: 'text-purple-500' },
          { id: 'RAIN', label: 'Precipitation', icon: CloudRain, color: 'text-cyan-500' },
          { id: 'AIR_QUALITY', label: 'Air Quality', icon: Wind, color: 'text-emerald-600' },
          { id: 'FIRE_RISK', label: 'Fire Risk', icon: Flame, color: 'text-rose-600' },
          { id: 'FLOOD_RISK', label: 'Flood Risk', icon: Droplets, color: 'text-blue-600' },
          { id: 'POLLUTION_RISK', label: 'Pollution Risk', icon: Wind, color: 'text-emerald-600' },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeMetric === m.id;

          return (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#121417] text-white border-zinc-900 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#ff4405]' : m.color}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Minimum Recorded</div>
          <div className="font-mono text-2xl font-black text-slate-900 mt-1">
            {currentMetric.stats.min} {currentMetric.unit}
          </div>
        </div>
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Maximum Recorded</div>
          <div className="font-mono text-2xl font-black text-rose-600 mt-1">
            {currentMetric.stats.max} {currentMetric.unit}
          </div>
        </div>
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Period Average</div>
          <div className="font-mono text-2xl font-black text-slate-900 mt-1">
            {currentMetric.stats.avg} {currentMetric.unit}
          </div>
        </div>
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Net Rate of Change</div>
          <div className="font-mono text-2xl font-black text-[#ea580c] mt-1">
            {currentMetric.stats.rate_of_change > 0 ? `+${currentMetric.stats.rate_of_change}` : currentMetric.stats.rate_of_change} {currentMetric.unit}
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            {currentMetric.label} Regression Timeline ({timeRange})
          </h3>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            {trends?.sample_count ?? 0} Datapoints Audited
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '1rem', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#0F172A', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748B', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  name={`${currentMetric.label} (${currentMetric.unit})`}
                  stroke={currentMetric.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#metricGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
              Loading analytics timeseries...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


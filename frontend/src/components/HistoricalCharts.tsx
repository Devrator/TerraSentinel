import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { LineChart as ChartIcon, Thermometer, Droplets, Gauge, CloudRain, Wind } from 'lucide-react';
import { api } from '../services/api';
import type { SensorReading } from '../types';

interface HistoricalChartsProps {
  selectedNodeId: string;
}

type MetricType = 'temperature' | 'humidity' | 'pressure' | 'rain_value' | 'air_quality';
type TimeFilter = '5m' | '30m' | '1h' | '24h';

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ selectedNodeId }) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [activeMetric, setActiveMetric] = useState<MetricType>('temperature');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('5m');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch readings when node or time filter changes
  useEffect(() => {
    let limit = 20;
    if (timeFilter === '5m') limit = 30;
    else if (timeFilter === '30m') limit = 60;
    else if (timeFilter === '1h') limit = 120;
    else if (timeFilter === '24h') limit = 300;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await api.getHistoricalReadings(selectedNodeId, limit);
        // Reverse array so time flows left-to-right (oldest -> newest)
        setReadings([...data].reverse());
      } catch (err) {
        console.error('Error fetching historical readings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 10000); // Polling sync
    return () => clearInterval(interval);
  }, [selectedNodeId, timeFilter]);

  const metricConfig = {
    temperature: {
      label: 'Temperature',
      unit: '°C',
      color: '#f59e0b',
      fill: 'url(#tempGradient)',
      icon: Thermometer,
      domain: ['dataMin - 2', 'dataMax + 2'],
    },
    humidity: {
      label: 'Humidity',
      unit: '%',
      color: '#06b6d4',
      fill: 'url(#humGradient)',
      icon: Droplets,
      domain: [0, 100],
    },
    pressure: {
      label: 'Pressure',
      unit: 'hPa',
      color: '#a855f7',
      fill: 'url(#pressGradient)',
      icon: Gauge,
      domain: ['dataMin - 5', 'dataMax + 5'],
    },
    rain_value: {
      label: 'Rainfall / Moisture',
      unit: 'analog',
      color: '#3b82f6',
      fill: 'url(#rainGradient)',
      icon: CloudRain,
      domain: [0, 'dataMax + 100'],
    },
    air_quality: {
      label: 'Air Quality / Gas',
      unit: 'AQI',
      color: '#10b981',
      fill: 'url(#aqiGradient)',
      icon: Wind,
      domain: [0, 'dataMax + 50'],
    },
  };

  const currentConfig = metricConfig[activeMetric];

  // Format data for chart
  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: r[activeMetric],
    fullDate: new Date(r.timestamp).toLocaleString(),
  }));

  return (
    <div className="rounded-xl border border-dark-700 bg-dark-900 p-4 shadow-xl">
      {/* Chart Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-dark-700/80">
        <div className="flex items-center gap-2">
          <ChartIcon className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Historical Environmental Telemetry Analysis ({selectedNodeId})
          </h2>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center gap-1 bg-dark-850 p-1 rounded-lg border border-dark-700">
          {(['5m', '30m', '1h', '24h'] as TimeFilter[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                timeFilter === tf
                  ? 'bg-emerald-500 text-dark-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(metricConfig) as MetricType[]).map((m) => {
          const cfg = metricConfig[m];
          const Icon = cfg.icon;
          const isActive = activeMetric === m;
          return (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-dark-800 border-emerald-500/50 text-white shadow-md'
                  : 'bg-dark-850/60 border-dark-700 text-slate-400 hover:bg-dark-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recharts Area Container */}
      <div className="h-[280px] w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            {loading ? 'Fetching historical readings...' : 'Awaiting sensor telemetry for historical charts...'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                domain={currentConfig.domain as any}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-dark-900 border border-dark-700 p-2.5 rounded-lg shadow-xl text-xs">
                        <div className="text-slate-400 text-[10px] mb-1">{data.fullDate}</div>
                        <div className="flex items-center gap-2 font-bold font-mono text-slate-100">
                          <span style={{ color: currentConfig.color }}>●</span>
                          <span>{currentConfig.label}:</span>
                          <span className="text-emerald-400">{data.value} {currentConfig.unit}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentConfig.color}
                strokeWidth={2}
                fill={currentConfig.fill}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

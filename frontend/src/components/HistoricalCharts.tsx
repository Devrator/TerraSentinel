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
        setReadings([...data].reverse());
      } catch (err) {
        console.error('Error fetching historical readings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [selectedNodeId, timeFilter]);

  const metricConfig = {
    temperature: {
      label: 'Temperature',
      unit: '°C',
      color: '#d97706',
      fill: 'url(#tempLightGradient)',
      icon: Thermometer,
      domain: ['dataMin - 2', 'dataMax + 2'],
    },
    humidity: {
      label: 'Humidity',
      unit: '%',
      color: '#0891b2',
      fill: 'url(#humLightGradient)',
      icon: Droplets,
      domain: [0, 100],
    },
    pressure: {
      label: 'Pressure',
      unit: 'hPa',
      color: '#9333ea',
      fill: 'url(#pressLightGradient)',
      icon: Gauge,
      domain: ['dataMin - 5', 'dataMax + 5'],
    },
    rain_value: {
      label: 'Rainfall',
      unit: 'analog',
      color: '#2563eb',
      fill: 'url(#rainLightGradient)',
      icon: CloudRain,
      domain: [0, 'dataMax + 100'],
    },
    air_quality: {
      label: 'Air Quality',
      unit: 'AQI',
      color: '#059669',
      fill: 'url(#aqiLightGradient)',
      icon: Wind,
      domain: [0, 'dataMax + 50'],
    },
  };

  const currentConfig = metricConfig[activeMetric];

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: r[activeMetric],
    fullDate: new Date(r.timestamp).toLocaleString(),
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ChartIcon className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Historical Telemetry Analysis ({selectedNodeId})
          </h2>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {(['5m', '30m', '1h', '24h'] as TimeFilter[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                timeFilter === tf
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#ffffff' : cfg.color }} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recharts Area Container */}
      <div className="h-[280px] w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
            {loading ? 'Fetching historical readings...' : 'Awaiting sensor telemetry...'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempLightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="humLightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pressLightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rainLightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="aqiLightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                domain={currentConfig.domain as any}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs">
                        <div className="text-slate-400 text-[10px] mb-1 font-mono">{data.fullDate}</div>
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span style={{ color: currentConfig.color }}>●</span>
                          <span>{currentConfig.label}:</span>
                          <span className="text-slate-900 font-mono">{data.value} {currentConfig.unit}</span>
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
                strokeWidth={2.5}
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

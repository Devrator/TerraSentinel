import React from 'react';
import { Thermometer, Droplets, Gauge, CloudRain, Wind, Battery, Clock, Radio } from 'lucide-react';
import type { SensorNode } from '../types';

interface SensorOverviewProps {
  selectedNode: SensorNode | null;
  nodes: SensorNode[];
  onSelectNode: (nodeId: string) => void;
}

export const SensorOverview: React.FC<SensorOverviewProps> = ({
  selectedNode,
  nodes,
  onSelectNode,
}) => {
  const reading = selectedNode?.latest_reading;

  const sensorMetrics = [
    {
      title: 'TEMPERATURE',
      value: reading ? reading.temperature.toFixed(1) : '--',
      unit: '°C',
      icon: Thermometer,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      description: 'Ambient thermal reading',
      optimal: 'Optimal: 20°C - 35°C',
    },
    {
      title: 'HUMIDITY',
      value: reading ? reading.humidity.toFixed(1) : '--',
      unit: '%',
      icon: Droplets,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      description: 'Relative atmospheric moisture',
      optimal: 'Optimal: 30% - 70%',
    },
    {
      title: 'PRESSURE',
      value: reading ? reading.pressure.toFixed(1) : '--',
      unit: 'hPa',
      icon: Gauge,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      description: 'Barometric surface pressure',
      optimal: 'Standard: 1013.25 hPa',
    },
    {
      title: 'RAIN ACCUMULATION',
      value: reading ? reading.rain_value.toFixed(1) : '--',
      unit: 'analog',
      icon: CloudRain,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      description: 'Precipitation surface proxy',
      optimal: 'Storm threshold: > 600',
    },
    {
      title: 'AIR QUALITY INDEX',
      value: reading ? reading.air_quality.toFixed(0) : '--',
      unit: 'AQI',
      icon: Wind,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      description: 'Particulate / VOC concentration',
      optimal: 'Good: < 100 | Hazardous: > 300',
    },
    {
      title: 'NODE BATTERY',
      value: selectedNode ? selectedNode.battery_percentage.toFixed(1) : '--',
      unit: '%',
      icon: Battery,
      color: (selectedNode?.battery_percentage ?? 100) < 20 ? 'text-rose-400' : 'text-emerald-400',
      bg: (selectedNode?.battery_percentage ?? 100) < 20 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
      border: (selectedNode?.battery_percentage ?? 100) < 20 ? 'border-rose-500/30' : 'border-emerald-500/20',
      description: 'Lithium power telemetry',
      optimal: 'Nominal operational range',
    },
  ];

  return (
    <div className="rounded-xl border border-dark-700 bg-dark-900 p-4 shadow-xl">
      {/* Node Selector Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-dark-700/80">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Node Telemetry Overview
          </h2>
        </div>

        {/* Node Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {nodes.map((n) => {
            const isSelected = selectedNode?.node_id === n.node_id;
            return (
              <button
                key={n.node_id}
                onClick={() => onSelectNode(n.node_id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-dark-800 text-slate-400 border border-dark-700 hover:text-slate-200 hover:bg-dark-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${n.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {n.node_id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {sensorMetrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`rounded-xl bg-dark-850 border ${item.border} p-3.5 flex flex-col justify-between transition-all hover:bg-dark-800/80`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 truncate">
                  {item.title}
                </span>
                <div className={`p-1.5 rounded-md ${item.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
              </div>

              <div className="my-2">
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl lg:text-2xl font-black tracking-tight ${item.color}`}>
                    {item.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {item.unit}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.optimal}
                </div>
              </div>

              <div className="text-[9px] text-slate-500 flex items-center gap-1 pt-1.5 border-t border-dark-700/60">
                <Clock className="w-2.5 h-2.5 text-slate-500" />
                {reading ? new Date(reading.timestamp).toLocaleTimeString() : 'Awaiting data'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

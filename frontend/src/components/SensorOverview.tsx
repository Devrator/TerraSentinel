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
      iconColor: 'text-[#ff4405]',
      iconBg: 'bg-orange-50',
      border: 'border-slate-200/80 hover:border-orange-300',
      description: 'Ambient thermal reading',
      optimal: 'Nominal: 20°C - 35°C',
    },
    {
      title: 'HUMIDITY',
      value: reading ? reading.humidity.toFixed(1) : '--',
      unit: '%',
      icon: Droplets,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
      border: 'border-slate-200/80 hover:border-cyan-300',
      description: 'Atmospheric moisture',
      optimal: 'Nominal: 30% - 70%',
    },
    {
      title: 'PRESSURE',
      value: reading ? reading.pressure.toFixed(1) : '--',
      unit: 'hPa',
      icon: Gauge,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      border: 'border-slate-200/80 hover:border-purple-300',
      description: 'Barometric surface pressure',
      optimal: 'Standard: 1013 hPa',
    },
    {
      title: 'PRECIPITATION',
      value: reading ? reading.rain_value.toFixed(1) : '--',
      unit: 'analog',
      icon: CloudRain,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      border: 'border-slate-200/80 hover:border-blue-300',
      description: 'Rainfall surface proxy',
      optimal: 'Storm limit: > 600',
    },
    {
      title: 'AIR QUALITY',
      value: reading ? reading.air_quality.toFixed(0) : '--',
      unit: 'AQI',
      icon: Wind,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      border: 'border-slate-200/80 hover:border-emerald-300',
      description: 'Particulate / gas index',
      optimal: 'Clean: < 100',
    },
    {
      title: 'BATTERY POWER',
      value: selectedNode ? selectedNode.battery_percentage.toFixed(1) : '--',
      unit: '%',
      icon: Battery,
      iconColor: (selectedNode?.battery_percentage ?? 100) < 20 ? 'text-rose-600' : 'text-emerald-600',
      iconBg: (selectedNode?.battery_percentage ?? 100) < 20 ? 'bg-rose-50' : 'bg-emerald-50',
      border: (selectedNode?.battery_percentage ?? 100) < 20 ? 'border-rose-200' : 'border-slate-200/80',
      description: 'Lithium power telemetry',
      optimal: 'Nominal voltage',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 lg:p-5 shadow-2xs">
      {/* Node Selector Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Edge Sensor Telemetry
            </h2>
            <div className="text-[10px] text-slate-400 font-medium">
              Real-time multi-channel sensor outputs
            </div>
          </div>
        </div>

        {/* Node Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {nodes.map((n) => {
            const isSelected = selectedNode?.node_id === n.node_id;
            return (
              <button
                key={n.node_id}
                onClick={() => onSelectNode(n.node_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${isSelected
                    ? 'bg-[#121417] text-white'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${n.status === 'ONLINE' ? (isSelected ? 'bg-emerald-400' : 'bg-emerald-500') : 'bg-slate-400'}`} />
                {n.node_id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {sensorMetrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl bg-slate-50/50 border ${item.border} p-3.5 flex flex-col justify-between transition-all hover:bg-white hover:shadow-xs`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono tracking-wider text-slate-500 truncate">
                  {item.title}
                </span>
                <div className={`p-1.5 rounded-xl ${item.iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                </div>
              </div>

              <div className="my-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                    {item.value}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {item.unit}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                  {item.optimal}
                </div>
              </div>

              <div className="text-[9px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-200/60 font-mono">
                <Clock className="w-2.5 h-2.5" />
                {reading ? new Date(reading.timestamp).toLocaleTimeString() : 'Awaiting sync'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


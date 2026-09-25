import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { SensorNode } from '../types';
import { MapPin, Battery, Thermometer, Droplets, Gauge, CloudRain, Wind } from 'lucide-react';

interface LiveMapProps {
  nodes: SensorNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ nodes, onSelectNode }) => {
  // Compute default center from node coordinates or fallback
  const mapCenter = useMemo<[number, number]>(() => {
    if (nodes.length > 0) {
      const avgLat = nodes.reduce((acc, n) => acc + n.latitude, 0) / nodes.length;
      const avgLon = nodes.reduce((acc, n) => acc + n.longitude, 0) / nodes.length;
      return [avgLat, avgLon];
    }
    return [25.20, 75.86];
  }, [nodes]);

  // Create custom marker icons depending on status & risk level
  const createCustomIcon = (node: SensorNode) => {
    const isOnline = node.status === 'ONLINE';
    const overallRisk = node.latest_risk?.overall_risk ?? 0;
    const category = node.latest_risk?.overall_category ?? 'LOW';

    let color = '#94a3b8'; // slate offline
    let ringColor = 'rgba(148, 163, 184, 0.4)';

    if (isOnline) {
      if (category === 'CRITICAL' || overallRisk > 75) {
        color = '#ef4444'; // red
        ringColor = 'rgba(239, 68, 68, 0.4)';
      } else if (category === 'HIGH' || overallRisk > 50) {
        color = '#f97316'; // orange
        ringColor = 'rgba(249, 115, 22, 0.4)';
      } else if (category === 'MODERATE' || overallRisk > 25) {
        color = '#f59e0b'; // amber
        ringColor = 'rgba(245, 158, 11, 0.4)';
      } else {
        color = '#10b981'; // emerald normal
        ringColor = 'rgba(16, 185, 129, 0.4)';
      }
    }

    const html = `
      <div class="node-pulse-marker" style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        ${isOnline ? `<div class="pulse-ring" style="background-color: ${ringColor};"></div>` : ''}
        <div class="node-pulse-dot" style="background-color: ${color}; width: 16px; height: 16px; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs flex flex-col h-[480px]">
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Geospatial Fleet Map
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical
          </span>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {nodes.map((node) => (
            <Marker
              key={node.node_id}
              position={[node.latitude, node.longitude]}
              icon={createCustomIcon(node)}
              eventHandlers={{
                click: () => onSelectNode(node.node_id),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[240px] text-slate-800 font-sans">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <div>
                      <div className="text-xs font-mono font-bold text-emerald-700">{node.node_id}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{node.name}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${node.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                      {node.status}
                    </span>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] py-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                      <span>{node.latest_reading?.temperature.toFixed(1) ?? '--'} °C</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{node.latest_reading?.humidity.toFixed(1) ?? '--'} %</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Gauge className="w-3.5 h-3.5 text-purple-600" />
                      <span>{node.latest_reading?.pressure.toFixed(1) ?? '--'} hPa</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                      <span>{node.latest_reading?.rain_value.toFixed(1) ?? '--'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Wind className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AQI: {node.latest_reading?.air_quality.toFixed(0) ?? '--'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{node.battery_percentage.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Risk Scores */}
                  <div className="mt-2 pt-2 border-t border-slate-200 bg-slate-50 p-2 rounded-lg">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600">Hazard Score:</span>
                      <span className={`font-mono ${(node.latest_risk?.overall_risk ?? 0) > 75 ? 'text-rose-600' :
                        (node.latest_risk?.overall_risk ?? 0) > 50 ? 'text-orange-600' :
                          (node.latest_risk?.overall_risk ?? 0) > 25 ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                        {node.latest_risk?.overall_risk.toFixed(1) ?? '0.0'}% ({node.latest_risk?.overall_category ?? 'LOW'})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 mt-1">
                      <div>Fire: <span className="text-slate-800 font-mono font-medium">{node.latest_risk?.fire_risk.toFixed(0) ?? 0}%</span></div>
                      <div>Flood: <span className="text-slate-800 font-mono font-medium">{node.latest_risk?.flood_risk.toFixed(0) ?? 0}%</span></div>
                      <div>Poll: <span className="text-slate-800 font-mono font-medium">{node.latest_risk?.pollution_risk.toFixed(0) ?? 0}%</span></div>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 text-right font-mono">
                    {node.last_seen ? `Sync: ${new Date(node.last_seen).toLocaleTimeString()}` : 'No sync'}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

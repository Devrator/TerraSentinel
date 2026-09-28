import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { SensorNode, GisBasemapLayer } from '../types';
import { MapPin, Battery, Thermometer, Droplets, Gauge, CloudRain, Wind, ShieldAlert, Sparkles, Zap } from 'lucide-react';

interface LiveMapProps {
  nodes: SensorNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  hazardZone?: {
    center: [number, number];
    radius: number;
    hazardType: string;
    intensity: number;
    consensusLabel?: string;
  } | null;
}

const TILE_SERVERS: Record<GisBasemapLayer, { url: string; attribution: string; name: string }> = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    name: 'ArcGIS Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  dark: {
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  }
};

export const LiveMap: React.FC<LiveMapProps> = ({ nodes, onSelectNode, hazardZone }) => {
  const [basemap, setBasemap] = useState<GisBasemapLayer>('osm');
  const [showPerimeter, setShowPerimeter] = useState<boolean>(true);

  // Compute default center from node coordinates or fallback
  const mapCenter = useMemo<[number, number]>(() => {
    if (nodes.length > 0) {
      const avgLat = nodes.reduce((acc, n) => acc + n.latitude, 0) / nodes.length;
      const avgLon = nodes.reduce((acc, n) => acc + n.longitude, 0) / nodes.length;
      return [avgLat, avgLon];
    }
    return [25.2138, 75.8648];
  }, [nodes]);

  // Determine active cluster hazard zone if not explicitly passed
  const activeClusterZone = useMemo(() => {
    if (hazardZone) return hazardZone;
    const elevated = nodes.filter((n) => (n.latest_risk?.overall_risk ?? 0) >= 50);
    if (elevated.length >= 2) {
      const avgLat = elevated.reduce((acc, n) => acc + n.latitude, 0) / elevated.length;
      const avgLon = elevated.reduce((acc, n) => acc + n.longitude, 0) / elevated.length;
      const maxScore = Math.max(...elevated.map((n) => n.latest_risk?.overall_risk ?? 0));
      return {
        center: [avgLat, avgLon] as [number, number],
        radius: 1200,
        hazardType: elevated[0]?.latest_risk?.fire_risk && elevated[0].latest_risk.fire_risk > 50 ? 'FIRE' : 'MULTI-HAZARD',
        intensity: maxScore,
        consensusLabel: `${elevated.length}/${nodes.length} Nodes Corroborating Threat`,
      };
    }
    return null;
  }, [nodes, hazardZone]);

  // Create custom marker icons depending on status & risk level
  const createCustomIcon = (node: SensorNode) => {
    const isOnline = node.status === 'ONLINE';
    const overallRisk = node.latest_risk?.overall_risk ?? 0;
    const category = node.latest_risk?.overall_category ?? 'LOW';
    const isHardware = node.source === 'HARDWARE' || node.node_id.includes('HARDWARE') || !node.is_virtual;

    let color = '#94a3b8'; // slate offline
    let ringColor = 'rgba(148, 163, 184, 0.4)';

    if (isOnline) {
      if (category === 'CRITICAL' || overallRisk > 75) {
        color = '#ff4405'; // electric flame orange / red
        ringColor = 'rgba(255, 68, 5, 0.4)';
      } else if (category === 'HIGH' || overallRisk > 50) {
        color = '#ea580c'; // deep orange
        ringColor = 'rgba(234, 88, 12, 0.4)';
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
        <div class="node-pulse-dot" style="background-color: ${color}; width: ${isHardware ? '18px' : '15px'}; height: ${isHardware ? '18px' : '15px'}; border: 2.5px solid ${isHardware ? '#ff4405' : '#ffffff'}; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
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
    <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs flex flex-col h-[520px] relative z-0 isolate">
      {/* GIS Header & Basemap Layer Switcher */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Multi-Layer GIS Map • Distributed Sector
              </h2>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#121417] text-white">
                LIVE GIS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">SPATIAL SENSOR TELEMETRY & CONSENSUS PERIMETERS</p>
          </div>
        </div>

        {/* GIS Controls: Basemap Selector & Overlays */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Basemap Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            {(['osm', 'satellite', 'dark'] as GisBasemapLayer[]).map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setBasemap(layerKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  basemap === layerKey
                    ? 'bg-[#121417] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {layerKey === 'osm' ? 'Street' : layerKey === 'satellite' ? 'Satellite' : 'Dark'}
              </button>
            ))}
          </div>

          {/* Toggle Hazard Perimeter */}
          <button
            onClick={() => setShowPerimeter(!showPerimeter)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showPerimeter
                ? 'bg-orange-50 text-[#ea580c] border-orange-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Perimeter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <MapContainer
          key={basemap}
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution={TILE_SERVERS[basemap].attribution}
            url={TILE_SERVERS[basemap].url}
          />

          {/* Geo-Spatial Consensus Hazard Zone Perimeter */}
          {showPerimeter && activeClusterZone && (
            <Circle
              center={activeClusterZone.center}
              radius={activeClusterZone.radius}
              pathOptions={{
                color: activeClusterZone.intensity > 75 ? '#ff4405' : '#ea580c',
                fillColor: activeClusterZone.intensity > 75 ? '#ff4405' : '#ea580c',
                fillOpacity: 0.22,
                weight: 2.5,
                dashArray: '6, 6',
              }}
            >
              <Popup>
                <div className="p-1 min-w-[220px] text-slate-800">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    SPATIAL HAZARD PERIMETER
                  </div>
                  <div className="text-[11px] text-slate-600 mb-1 font-medium">
                    {activeClusterZone.consensusLabel || 'Multi-node corroborated perimeter'}
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono font-bold text-rose-800">
                    Consensus Threat: {activeClusterZone.intensity.toFixed(0)}% • Multi-Node Verified
                  </div>
                </div>
              </Popup>
            </Circle>
          )}

          {nodes.map((node) => {
            const edgeStatus = node.latest_risk?.edge_risk?.edge_status ?? 'NORMAL';
            const confidenceScore = node.latest_risk?.confidence?.confidence_score ?? 94;
            const isHardware = node.source === 'HARDWARE' || node.node_id.includes('HARDWARE') || !node.is_virtual;

            return (
              <Marker
                key={node.node_id}
                position={[node.latitude, node.longitude]}
                icon={createCustomIcon(node)}
                eventHandlers={{
                  click: () => onSelectNode(node.node_id),
                }}
              >
                <Popup>
                  <div className="p-1.5 min-w-[260px] text-slate-800 font-sans">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                      <div>
                        <div className="text-xs font-mono font-bold text-[#121417] flex items-center gap-1.5">
                          {node.node_id}
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold border ${
                            isHardware
                              ? 'bg-orange-50 text-[#ff4405] border-orange-200 animate-pulse'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isHardware ? 'PHYSICAL ESP32' : 'VIRTUAL TWIN'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px] font-medium mt-0.5">{node.name}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        node.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {node.status}
                      </span>
                    </div>

                    {/* Edge & Trust Indicators */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2.5 text-[10px] font-mono">
                      <div className="p-2 rounded-xl bg-[#121417] text-white flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[#ff4405]" /> Edge
                        </span>
                        <span className="font-bold text-orange-300">{edgeStatus}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-orange-50 text-slate-900 border border-orange-200 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#ea580c] font-medium">
                          <Sparkles className="w-3 h-3 text-[#ff4405]" /> Trust
                        </span>
                        <span className="font-bold">{confidenceScore.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] py-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Thermometer className="w-3.5 h-3.5 text-[#ea580c]" />
                        <span className="font-mono font-semibold">{node.latest_reading?.temperature.toFixed(1) ?? '--'} °C</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-mono font-semibold">{node.latest_reading?.humidity.toFixed(1) ?? '--'} %</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Gauge className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-mono font-semibold">{node.latest_reading?.pressure.toFixed(1) ?? '--'} hPa</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-mono font-semibold">{node.latest_reading?.rain_value.toFixed(1) ?? '--'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Wind className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono font-semibold">AQI: {node.latest_reading?.air_quality.toFixed(0) ?? '--'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Battery className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono font-semibold">{node.battery_percentage.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Risk Scores */}
                    <div className="mt-2 pt-2 border-t border-slate-200/80 bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600">Hazard Score:</span>
                        <span className={`font-mono ${(node.latest_risk?.overall_risk ?? 0) > 75 ? 'text-[#ff4405]' :
                          (node.latest_risk?.overall_risk ?? 0) > 50 ? 'text-[#ea580c]' :
                            (node.latest_risk?.overall_risk ?? 0) > 25 ? 'text-amber-600' : 'text-emerald-700'
                          }`}>
                          {node.latest_risk?.overall_risk.toFixed(1) ?? '0.0'}% ({node.latest_risk?.overall_category ?? 'LOW'})
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 mt-1">
                        <div>Fire: <span className="text-slate-900 font-mono font-bold">{node.latest_risk?.fire_risk.toFixed(0) ?? 0}%</span></div>
                        <div>Flood: <span className="text-slate-900 font-mono font-bold">{node.latest_risk?.flood_risk.toFixed(0) ?? 0}%</span></div>
                        <div>Poll: <span className="text-slate-900 font-mono font-bold">{node.latest_risk?.pollution_risk.toFixed(0) ?? 0}%</span></div>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 text-right font-mono">
                      {isHardware ? 'PHYSICAL USB TELEMETRY' : 'SIMULATION ADAPTER'} • {node.last_seen ? `Sync: ${new Date(node.last_seen).toLocaleTimeString()}` : 'No sync'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

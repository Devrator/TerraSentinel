import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { SensorNode, GisBasemapLayer } from '../types';
import {
  MapPin,
  Battery,
  Thermometer,
  Droplets,
  Gauge,
  CloudRain,
  Wind,
  ShieldAlert,
  Sparkles,
  Activity,
  Crosshair,
  Download,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface LiveMapFullViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  onOpenDetailModal?: (node: SensorNode) => void;
}

const TILE_SERVERS: Record<GisBasemapLayer, { url: string; attribution: string; name: string }> = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    name: 'ArcGIS Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery'
  },
  dark: {
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri Dark Canvas'
  }
};

export const LiveMapFullView: React.FC<LiveMapFullViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onOpenDetailModal,
}) => {
  const [basemap, setBasemap] = useState<GisBasemapLayer>('satellite');
  const [showPerimeter, setShowPerimeter] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'HIGH_RISK'>('ALL');
  const [mapZoomKey, setMapZoomKey] = useState<number>(0);

  const selectedNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;

  // Filter nodes according to active toggle
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (statusFilter === 'ONLINE') return n.status === 'ONLINE';
      if (statusFilter === 'HIGH_RISK') return (n.latest_risk?.overall_risk ?? 0) >= 40;
      return true;
    });
  }, [nodes, statusFilter]);

  // Compute map center from selected node or overall fleet
  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedNode) {
      return [selectedNode.latitude, selectedNode.longitude];
    }
    if (nodes.length > 0) {
      const avgLat = nodes.reduce((acc, n) => acc + n.latitude, 0) / nodes.length;
      const avgLon = nodes.reduce((acc, n) => acc + n.longitude, 0) / nodes.length;
      return [avgLat, avgLon];
    }
    return [25.2138, 75.8648];
  }, [selectedNode, nodes, mapZoomKey]);

  // Determine active cluster hazard zone
  const activeClusterZone = useMemo(() => {
    const elevated = nodes.filter((n) => (n.latest_risk?.overall_risk ?? 0) >= 45);
    if (elevated.length >= 2) {
      const avgLat = elevated.reduce((acc, n) => acc + n.latitude, 0) / elevated.length;
      const avgLon = elevated.reduce((acc, n) => acc + n.longitude, 0) / elevated.length;
      const maxScore = Math.max(...elevated.map((n) => n.latest_risk?.overall_risk ?? 0));
      return {
        center: [avgLat, avgLon] as [number, number],
        radius: 1200,
        intensity: maxScore,
        consensusLabel: `${elevated.length}/${nodes.length} Nodes Corroborating Spatial Alert`,
      };
    }
    return null;
  }, [nodes]);

  // Create custom marker icon
  const createCustomIcon = (node: SensorNode) => {
    const isOnline = node.status === 'ONLINE';
    const overallRisk = node.latest_risk?.overall_risk ?? 0;
    const isSelected = node.node_id === selectedNodeId;
    const isHardware = node.source === 'HARDWARE' || node.node_id.includes('HARDWARE') || !node.is_virtual;

    let color = '#94a3b8';
    let ringColor = 'rgba(148, 163, 184, 0.4)';

    if (isOnline) {
      if (overallRisk > 75) {
        color = '#ff4405';
        ringColor = 'rgba(255, 68, 5, 0.5)';
      } else if (overallRisk > 45) {
        color = '#ea580c';
        ringColor = 'rgba(234, 88, 12, 0.5)';
      } else if (overallRisk > 20) {
        color = '#f59e0b';
        ringColor = 'rgba(245, 158, 11, 0.4)';
      } else {
        color = '#10b981';
        ringColor = 'rgba(16, 185, 129, 0.4)';
      }
    }

    const html = `
      <div class="node-pulse-marker" style="position: relative; width: ${isSelected ? '38px' : '32px'}; height: ${isSelected ? '38px' : '32px'}; display: flex; align-items: center; justify-content: center;">
        ${isOnline ? `<div class="pulse-ring" style="background-color: ${ringColor};"></div>` : ''}
        <div class="node-pulse-dot" style="background-color: ${color}; width: ${isSelected ? '20px' : isHardware ? '18px' : '15px'}; height: ${isSelected ? '20px' : isHardware ? '18px' : '15px'}; border: ${isSelected ? '3px solid #ff4405' : isHardware ? '2.5px solid #ffffff' : '2px solid #ffffff'}; box-shadow: 0 3px 10px rgba(0,0,0,0.5);"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [isSelected ? 38 : 32, isSelected ? 38 : 32],
      iconAnchor: [isSelected ? 19 : 16, isSelected ? 19 : 16],
      popupAnchor: [0, -18],
    });
  };

  const handleExportGeoJson = () => {
    if (!selectedNode) return;
    const geojson = {
      type: 'FeatureCollection',
      features: nodes.map((n) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [n.longitude, n.latitude],
        },
        properties: {
          node_id: n.node_id,
          name: n.name,
          status: n.status,
          battery_percentage: n.battery_percentage,
          telemetry: n.latest_reading,
          risk: n.latest_risk,
          last_seen: n.last_seen,
        },
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `terrasentinel-gis-fleet-${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCsv = () => {
    const headers = ['Node ID', 'Name', 'Status', 'Latitude', 'Longitude', 'Battery', 'Temp (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Rain', 'AQI', 'Overall Risk (%)', 'Category'];
    const rows = nodes.map((n) => [
      `"${n.node_id}"`,
      `"${n.name}"`,
      `"${n.status}"`,
      n.latitude.toFixed(6),
      n.longitude.toFixed(6),
      n.battery_percentage.toFixed(0),
      n.latest_reading?.temperature?.toFixed(1) ?? '--',
      n.latest_reading?.humidity?.toFixed(0) ?? '--',
      n.latest_reading?.pressure?.toFixed(1) ?? '--',
      n.latest_reading?.rain_value?.toFixed(1) ?? '--',
      n.latest_reading?.air_quality?.toFixed(0) ?? '--',
      n.latest_risk?.overall_risk?.toFixed(1) ?? '--',
      `"${n.latest_risk?.overall_category ?? 'LOW'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `terrasentinel-gis-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Ribbon */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Live Geospatial Network & Node Telemetry Inspector
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#121417] text-white">
                SIH26178 GIS FULLSCREEN
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              High-resolution spatial layer mapping with real-time multi-sensor telemetry HUD and node diagnostics
            </p>
          </div>
        </div>

        {/* Action Controls & Layer Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {(['ALL', 'ONLINE', 'HIGH_RISK'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === filterKey
                    ? 'bg-[#121417] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filterKey === 'ALL' ? 'All (5)' : filterKey === 'ONLINE' ? 'Online Fleet' : 'Elevated Risk'}
              </button>
            ))}
          </div>

          {/* Basemap Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {(['satellite', 'osm', 'dark'] as GisBasemapLayer[]).map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setBasemap(layerKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  basemap === layerKey
                    ? 'bg-[#121417] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {layerKey === 'satellite' ? 'Satellite' : layerKey === 'osm' ? 'Streets' : 'Dark'}
              </button>
            ))}
          </div>

          {/* Toggle Perimeter */}
          <button
            onClick={() => setShowPerimeter(!showPerimeter)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              showPerimeter
                ? 'bg-orange-50 text-[#ea580c] border-orange-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle Spatial Threat Perimeter Radius"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Hazard Perimeter</span>
          </button>

          {/* Export GIS GeoJSON */}
          <button
            onClick={handleExportGeoJson}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download GeoJSON Feature Collection"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> GeoJSON
          </button>

          {/* Export Telemetry CSV */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download CSV Fleet Telemetry"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> CSV
          </button>
        </div>
      </div>

      {/* Main Full GIS Map & Floating Deep Telemetry HUD Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[620px]">
        
        {/* Full Interactive Map Container (8 Cols) */}
        <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs relative flex flex-col">
          
          {/* Quick Node Selector Pills at Map Top */}
          <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
            <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-md">
              {nodes.map((n) => {
                const isSelected = n.node_id === selectedNodeId;
                const isOnline = n.status === 'ONLINE';
                const isHighRisk = (n.latest_risk?.overall_risk ?? 0) >= 40;

                return (
                  <button
                    key={n.node_id}
                    onClick={() => {
                      onSelectNode(n.node_id);
                      setMapZoomKey((k) => k + 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#121417] text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      !isOnline ? 'bg-slate-400' : isHighRisk ? 'bg-[#ff4405] animate-pulse' : 'bg-emerald-500'
                    }`} />
                    <span>{n.node_id}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMapZoomKey((k) => k + 1)}
              className="pointer-events-auto p-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-md cursor-pointer transition-all"
              title="Recenter Map on Fleet"
            >
              <Crosshair className="w-4 h-4 text-[#ff4405]" />
            </button>
          </div>

          {/* Leaflet Map */}
          <div className="flex-1 w-full h-full relative z-0 isolate">
            <MapContainer
              key={`${basemap}-${mapZoomKey}`}
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution={TILE_SERVERS[basemap].attribution}
                url={TILE_SERVERS[basemap].url}
              />

              {/* Hazard Perimeter Overlay */}
              {showPerimeter && activeClusterZone && (
                <Circle
                  center={activeClusterZone.center}
                  radius={activeClusterZone.radius}
                  pathOptions={{
                    color: activeClusterZone.intensity > 70 ? '#ff4405' : '#ea580c',
                    fillColor: activeClusterZone.intensity > 70 ? '#ff4405' : '#ea580c',
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
                        {activeClusterZone.consensusLabel}
                      </div>
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono font-bold text-rose-800">
                        Threat Level: {activeClusterZone.intensity.toFixed(0)}% • Cluster Corroborated
                      </div>
                    </div>
                  </Popup>
                </Circle>
              )}

              {/* Node Markers */}
              {filteredNodes.map((node) => {
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
                      <div className="p-1 min-w-[260px] text-slate-800 font-sans">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
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
                            <div className="text-[11px] text-slate-500 font-medium">{node.name}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            node.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {node.status}
                          </span>
                        </div>

                        {/* Edge & Trust Indicators */}
                        <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px] font-mono">
                          <div className="p-1.5 rounded-lg bg-[#121417] text-white flex justify-between">
                            <span className="text-slate-400">Edge:</span>
                            <span className="text-orange-300 font-bold">{edgeStatus}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-orange-50 text-slate-800 border border-orange-200 flex justify-between">
                            <span className="text-[#ea580c]">Trust:</span>
                            <span className="font-bold">{confidenceScore.toFixed(0)}%</span>
                          </div>
                        </div>

                        {/* Telemetry Summary */}
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                            Temp: <strong className="text-[#ea580c]">{node.latest_reading?.temperature.toFixed(1) ?? '--'}°C</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                            Humidity: <strong className="text-blue-700">{node.latest_reading?.humidity.toFixed(0) ?? '--'}%</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                            Pressure: <strong className="text-slate-800">{node.latest_reading?.pressure.toFixed(1) ?? '--'}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                            AQI: <strong className="text-emerald-700">{node.latest_reading?.air_quality.toFixed(0) ?? '--'}</strong>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-slate-500">Hazard: {node.latest_risk?.overall_risk.toFixed(1) ?? '0.0'}%</span>
                          {onOpenDetailModal && (
                            <button
                              onClick={() => onOpenDetailModal(node)}
                              className="text-[#ff4405] font-bold hover:underline cursor-pointer"
                            >
                              Inspect Node &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Detailed Node Telemetry & Hardware Diagnostics Sidebar (4 Cols) */}
        <div className="lg:col-span-4 h-full flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {selectedNode ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Header: Node Identity */}
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-slate-900">{selectedNode.node_id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      selectedNode.status === 'ONLINE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{selectedNode.name}</div>
                </div>

                {onOpenDetailModal && (
                  <button
                    onClick={() => onOpenDetailModal(selectedNode)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs"
                    title="Open Full Diagnostics Modal"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              {/* Geographic Coordinates & Location Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">GPS Coordinates</div>
                <div className="font-mono font-bold text-slate-800 flex items-center justify-between">
                  <span>Lat: {selectedNode.latitude.toFixed(6)}°</span>
                  <span>Lng: {selectedNode.longitude.toFixed(6)}°</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/60 font-medium">
                  <span>Altitude: 342m MSL</span>
                  <span>Fix: 3D DGPS Locked</span>
                </div>
              </div>

              {/* Real-Time Telemetry Grid (All 5 Sensor Parameters) */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span>Live Atmospheric Telemetry</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">INTERVAL: 15s</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {/* Temperature */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                      <Thermometer className="w-3.5 h-3.5 text-[#ff4405]" />
                      <span>Temperature</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-base">
                      {selectedNode.latest_reading?.temperature.toFixed(1) ?? '--'}°C
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>Humidity</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-base">
                      {selectedNode.latest_reading?.humidity.toFixed(1) ?? '--'}%
                    </div>
                  </div>

                  {/* Pressure */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                      <Gauge className="w-3.5 h-3.5 text-purple-600" />
                      <span>Pressure</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-base">
                      {selectedNode.latest_reading?.pressure.toFixed(1) ?? '--'} hPa
                    </div>
                  </div>

                  {/* Air Quality */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                      <Wind className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Gas / AQI</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-base">
                      {selectedNode.latest_reading?.air_quality.toFixed(0) ?? '--'} AQI
                    </div>
                  </div>
                </div>

                {/* Rainfall & Battery Row */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                      <CloudRain className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Rainfall Plate</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-base">
                      {selectedNode.latest_reading?.rain_value.toFixed(1) ?? '--'} mm
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Battery Life</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-700 text-base">
                      {selectedNode.battery_percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Hazard Risk Assessment Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#ff4405]" />
                    <span>Multi-Hazard Risk Assessment</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    (selectedNode.latest_risk?.overall_risk ?? 0) >= 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedNode.latest_risk?.overall_risk.toFixed(1) ?? '0.0'}% ({selectedNode.latest_risk?.overall_category ?? 'LOW'})
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Wildfire Hazard:</span>
                    <span className="font-mono font-bold text-[#ea580c]">{selectedNode.latest_risk?.fire_risk.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Flash Flood:</span>
                    <span className="font-mono font-bold text-blue-700">{selectedNode.latest_risk?.flood_risk.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Toxic Pollution:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedNode.latest_risk?.pollution_risk.toFixed(1) ?? 0}%</span>
                  </div>
                </div>
              </div>

              {/* Integrated Hardware Sensor Probe Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Hardware Probe Health</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DHT22 / BMP280
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> MQ-135 Gas
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Rain Plate
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> NEO-6M GPS
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMapZoomKey((k) => k + 1)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#ff4405]" /> Center Node
                </button>
                {onOpenDetailModal && (
                  <button
                    onClick={() => onOpenDetailModal(selectedNode)}
                    className="py-2 px-3 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#ff4405]" /> Diagnostics
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center text-xs">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <span>Select a sensor node on the map to inspect live telemetry and hardware diagnostics</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

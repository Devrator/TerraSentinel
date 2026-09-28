import React, { useState } from 'react';
import type { SensorNode } from '../types';
import { FleetTable } from '../components/FleetTable';
import { Boxes, Search, Battery, Usb, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWebSerial } from '../hooks/useWebSerial';

interface SensorNetworkViewProps {
  nodes: SensorNode[];
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
  onOpenDetailModal: (node: SensorNode) => void;
}

export const SensorNetworkView: React.FC<SensorNetworkViewProps> = ({
  nodes,
  onSelectNode,
  onOpenDetailModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  const {
    isSupported,
    status,
    baudRate,
    setBaudRate,
    packetCount,
    lastReading,
    logs,
    errorMessage,
    connectSerial,
    disconnectSerial,
  } = useWebSerial();

  const filteredNodes = nodes.filter(
    (n) =>
      n.node_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isConnected = status === 'CONNECTED' || status === 'STREAMING';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Sensor Fleet Registry & Hardware Profile
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#121417] text-white font-bold">
                1 PHYSICAL + 4 VIRTUAL TWINS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage distributed ESP32 IoT nodes, probe configurations, and real-time operational telemetry
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search node ID or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4405] focus:ring-1 focus:ring-[#ff4405] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Browser-Native WebSerial ESP32 Hardware Bridge */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#ff4405] flex items-center justify-center">
              <Usb className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">WebSerial Physical Hardware Bridge</h3>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold border ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {isConnected ? 'USB STREAMING' : 'NOT CONNECTED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Connect live ESP32 microcontroller via USB serial to feed real sensor readings through the ingestion pipeline
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
              disabled={isConnected}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono font-semibold focus:outline-none focus:border-[#ff4405] cursor-pointer"
            >
              <option value="115200">115200 Baud</option>
              <option value="9600">9600 Baud</option>
              <option value="57600">57600 Baud</option>
            </select>

            {!isConnected ? (
              <button
                onClick={() => connectSerial(baudRate)}
                disabled={!isSupported || status === 'CONNECTING'}
                className="px-4 py-1.5 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Usb className="w-3.5 h-3.5" />
                <span>{status === 'CONNECTING' ? 'Connecting...' : 'Connect USB ESP32'}</span>
              </button>
            ) : (
              <button
                onClick={disconnectSerial}
                className="px-4 py-1.5 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                Disconnect Port
              </button>
            )}

            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                showTerminal
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Terminal
            </button>
          </div>
        </div>

        {/* Status / Errors / Unsupported Banner */}
        {!isSupported && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>WebSerial API is not supported in this browser. To connect physical hardware via USB, please use Chrome, Edge, or Opera. Virtual nodes continue to stream seamlessly.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real-time Hardware Telemetry Strip (When Connected) */}
        {isConnected && lastReading && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono block">Node ID</span>
              <span className="font-bold text-slate-900 font-mono">{lastReading.node_id}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono block">Temperature</span>
              <span className="font-bold text-[#ea580c] font-mono">{lastReading.temperature?.toFixed(1)} °C</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono block">Humidity</span>
              <span className="font-bold text-blue-700 font-mono">{lastReading.humidity?.toFixed(1)} %</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono block">Air Quality</span>
              <span className="font-bold text-emerald-700 font-mono">{lastReading.air_quality?.toFixed(0)} AQI</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono block">Packets Ingested</span>
              <span className="font-bold text-purple-700 font-mono">{packetCount} rx</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono block">Status</span>
              <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pipeline Active
              </span>
            </div>
          </div>
        )}

        {/* Live Serial Log Terminal Drawer */}
        {showTerminal && (
          <div className="p-4 rounded-xl bg-[#0a0c0f] border border-zinc-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-zinc-800">
              <span>RAW SERIAL TERMINAL (USB PORT STREAM)</span>
              <span className="text-[10px] text-emerald-400 font-bold">LINE BUFFER READY</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin text-[11px]">
              {logs.length > 0 ? (
                logs.map((l, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">[{l.timestamp}]</span>
                    <span className={l.valid ? 'text-emerald-400' : 'text-slate-400'}>{l.raw}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic py-2">
                  No serial packets received yet. Connect an ESP32 microcontroller broadcasting JSON or CSV sensor telemetry.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Physical Hardware Prototype Representation Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Hardware Prototype Photo */}
          <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs group">
            <img
              src="/hardware-prototype.jpg"
              alt="TerraSentinel Physical ESP32 Hardware Enclosure"
              className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-4">
              <div className="text-white">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ff4405] text-white">
                  PHYSICAL PROTOTYPE ENCLOSURE
                </span>
                <div className="text-xs font-bold font-mono mt-1 text-slate-100">IP67 Polycarbonate Enclosure</div>
              </div>
            </div>
          </div>

          {/* Right: Technical Specifications & Power Modes */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#ff4405]">PHYSICAL EDGE PROTOTYPE</span>
                <h3 className="text-base font-bold text-slate-900">ESP32 Environmental Monitoring Node</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PROTOTYPE READY
              </span>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Microcontroller</span>
                <span className="font-bold text-slate-900 font-mono text-xs">ESP32-WROOM-32</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Sensors Onboard</span>
                <span className="font-bold text-slate-900 text-xs">DHT22, MQ-135, Rain, GPS</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Connectivity</span>
                <span className="font-bold text-slate-900 text-xs">Wi-Fi (802.11 b/g/n)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Power Source</span>
                <span className="font-bold text-slate-900 text-xs">18650 Li-Ion (3400mAh)</span>
              </div>
            </div>

            {/* Power States Architecture */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  Dynamic Power Management States:
                </span>
                <span className="text-[10px] font-mono text-slate-500">AUTONOMOUS INTERVAL TUNING</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                  ACTIVE: 30s interval
                </div>
                <div className="p-2 rounded-lg bg-white border border-orange-200 text-[#ea580c] font-bold shadow-2xs">
                  LOW POWER: 5m interval
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold shadow-2xs">
                  SLEEP: 15m interval
                </div>
                <div className="p-2 rounded-lg bg-white border border-rose-200 text-rose-800 font-bold shadow-2xs">
                  CRITICAL: Beacon only
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fleet Table */}
      <FleetTable
        nodes={filteredNodes}
        onSelectNode={onSelectNode}
        onOpenDetailModal={onOpenDetailModal}
      />
    </div>
  );
};

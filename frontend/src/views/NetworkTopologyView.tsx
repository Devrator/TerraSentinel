import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { NetworkTopologyData } from '../types';
import { Network, Cpu, Server, Database, Radio, BrainCircuit, RefreshCw } from 'lucide-react';

export const NetworkTopologyView: React.FC = () => {
  const [data, setData] = useState<NetworkTopologyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTopology = async () => {
    try {
      setLoading(true);
      const res = await api.getNetworkTopology();
      setData(res);
    } catch (err) {
      console.error('Failed to load topology:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Network className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">IoT Network Topology & Infrastructure</h2>
            <p className="text-xs text-slate-500 font-medium">
              End-to-end edge-to-cloud architectural topology, gateway latency, and pipeline health
            </p>
          </div>
        </div>

        <button
          onClick={fetchTopology}
          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} /> Ping Mesh
        </button>
      </div>

      {/* Visual Pipeline Graph */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Hardware-to-Cloud Distributed Data Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* 1. Edge Nodes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">ESP32 Nodes</div>
              <div className="text-[10px] text-slate-500 font-medium">
                {data?.architecture_layers.edge_layer.node_count ?? 5} Nodes Online
              </div>
            </div>
            <div className="text-[10px] font-mono text-emerald-700 font-bold pt-2 border-t border-slate-200">
              WiFi / HTTP Push
            </div>
          </div>

          {/* 2. Gateway */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <Network className="w-5 h-5 text-blue-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Mesh Gateway</div>
              <div className="text-[10px] text-slate-500 font-medium">GW-CENTRAL-01</div>
            </div>
            <div className="text-[10px] font-mono text-slate-700 font-semibold pt-2 border-t border-slate-200">
              Latency: 14ms
            </div>
          </div>

          {/* 3. Ingestion API */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <Server className="w-5 h-5 text-purple-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">FastAPI Ingestion</div>
              <div className="text-[10px] text-slate-500 font-medium">/api/sensor-data</div>
            </div>
            <div className="text-[10px] font-mono text-purple-700 font-bold pt-2 border-t border-slate-200">
              42.5 req/s
            </div>
          </div>

          {/* 4. AI Risk Engine */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <BrainCircuit className="w-5 h-5 text-amber-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">AI Risk Engine</div>
              <div className="text-[10px] text-slate-500 font-medium">XAI & Heuristics</div>
            </div>
            <div className="text-[10px] font-mono text-amber-700 font-bold pt-2 border-t border-slate-200">
              Inference: 1.8ms
            </div>
          </div>

          {/* 5. PostgreSQL DB */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-cyan-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">PostgreSQL DB</div>
              <div className="text-[10px] text-slate-500 font-medium">Timeseries + Audit</div>
            </div>
            <div className="text-[10px] font-mono text-cyan-700 font-bold pt-2 border-t border-slate-200">
              Query: 3.4ms
            </div>
          </div>

          {/* 6. WebSocket Broadcaster */}
          <div className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">WebSocket Hub</div>
              <div className="text-[10px] text-slate-500 font-medium">/ws/dashboard</div>
            </div>
            <div className="text-[10px] font-mono text-emerald-700 font-bold pt-2 border-t border-slate-200">
              Live Streaming
            </div>
          </div>

        </div>
      </div>

      {/* Architecture Scalability Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Maximum Node Capacity</div>
          <div className="font-mono text-xl font-bold text-slate-900">5,000+ Edge Nodes</div>
          <div className="text-[11px] text-slate-500 font-medium">Horizontal worker scaling</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Distributed Broker Architecture</div>
          <div className="font-mono text-xl font-bold text-emerald-700">Redis / RabbitMQ Ready</div>
          <div className="text-[11px] text-slate-500 font-medium">Zero-loss asynchronous queuing</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">High-Availability Mode</div>
          <div className="font-mono text-xl font-bold text-blue-700">Active-Active Redundancy</div>
          <div className="text-[11px] text-slate-500 font-medium">Automatic failover clustering</div>
        </div>
      </div>
    </div>
  );
};

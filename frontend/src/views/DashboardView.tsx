import React, { useEffect, useState } from 'react';
import { KpiCards } from '../components/KpiCards';
import { LiveMap } from '../components/LiveMap';
import { AlertPanel } from '../components/AlertPanel';
import { RiskPanel } from '../components/RiskPanel';
import { SensorOverview } from '../components/SensorOverview';
import { HistoricalCharts } from '../components/HistoricalCharts';
import { FleetTable } from '../components/FleetTable';
import {
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import type { SensorNode, Alert, DashboardSummary, MultiNodeConsensusData } from '../types';
import { api } from '../services/api';

interface DashboardViewProps {
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  alerts: Alert[];
  onAcknowledgeAlert: (id: number) => void;
  summary: DashboardSummary | null;
  isLoading: boolean;
  onOpenDetailModal: (node: SensorNode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  alerts,
  onAcknowledgeAlert,
  summary,
  isLoading,
  onOpenDetailModal,
}) => {
  const selectedNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;
  const [consensus, setConsensus] = useState<MultiNodeConsensusData | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    const fetchConsensus = async () => {
      try {
        const data = await api.getMultiNodeConsensus('FIRE');
        setConsensus(data);
      } catch (err) {
        console.error('Error fetching consensus:', err);
      }
    };
    fetchConsensus();
    const interval = setInterval(fetchConsensus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerConsensus = async () => {
    setIsEvaluating(true);
    try {
      const data = await api.getMultiNodeConsensus('FIRE');
      setConsensus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsEvaluating(false), 800);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Fleet KPI Ribbon (4 Cards Matching Reference Image) */}
      <KpiCards summary={summary} loading={isLoading} />

      {/* 2. Middle Section: AI Sector Focus & Priority Actions + Electric Flame Orange Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: AI Fleet Focus & Priority Insights (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-4 lg:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff4405]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                AI Sector Focus & Priority Actions
              </h3>
            </div>
            <button
              onClick={() => onSelectNode(nodes[nodes.length - 1]?.node_id || 'ENV-004')}
              className="text-[11px] font-bold text-[#ff4405] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Priority Nodes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-grid: Node Focus List on Left, AI Anomaly Advisory on Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-3.5">
            {/* Column 1: Node Priority Focus List */}
            <div className="space-y-2">
              {nodes.slice(0, 3).map((n) => {
                const isHighRisk = (n.latest_risk?.overall_risk ?? 0) > 40;
                const isSelected = n.node_id === selectedNodeId;
                return (
                  <div
                    key={n.node_id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-50 border-slate-400/80 shadow-2xs'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                        <span className="truncate">{n.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                          isHighRisk
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isHighRisk ? 'Need Triage' : 'Nominal'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        {n.latest_reading ? `${n.latest_reading.temperature.toFixed(1)}°C • ${n.latest_reading.humidity.toFixed(0)}% RH` : 'Syncing Telemetry...'}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectNode(n.node_id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                        isHighRisk
                          ? 'bg-[#121417] hover:bg-zinc-800 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isHighRisk ? 'Triage' : 'View'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Column 2: AI Attention Advisory Box */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl bg-[#fff7ed] border border-[#ffedd5]">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#ea580c]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>Autonomous AI Anomaly Advisory</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-1.5 leading-relaxed font-medium">
                  Spatial cross-correlation active. Multi-node edge filters suppress single-sensor transient spikes while guaranteeing zero-delay hazard alarms.
                </p>
                <div className="text-[10px] text-slate-600 font-mono mt-2 bg-white/70 px-2 py-1 rounded-md border border-orange-200/50">
                  Consensus Status: <span className="font-bold text-slate-900">{consensus?.consensus_status || 'NOMINAL'} ({consensus?.consensus_percentage ?? 80}%)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-orange-200/60">
                <button
                  onClick={() => onOpenDetailModal(selectedNode || nodes[0])}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all text-center cursor-pointer shadow-2xs"
                >
                  View Details
                </button>
                <button
                  onClick={handleTriggerConsensus}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-[#121417] hover:bg-zinc-800 text-white transition-all text-center cursor-pointer shadow-2xs"
                >
                  {isEvaluating ? 'Evaluating...' : 'Optimize All'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Hardware & Flash Status Footer Strip */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>1 Physical ESP32 + 4 Virtual Twins</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SPI Flash Resilience: Zero Data Loss</span>
            </div>
          </div>
        </div>

        {/* Right: Electric Flame Orange Hero Action Card (5 Cols) */}
        <div className="lg:col-span-5 bg-[#ff4405] text-white rounded-2xl p-4 lg:p-5 shadow-xs flex flex-col justify-between relative overflow-hidden bg-flame-pattern group hover:brightness-105 transition-all">
          <div className="flex items-center justify-between z-10">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white backdrop-blur-xs">
              Autonomous Consensus
            </span>
          </div>

          <div className="my-3.5 z-10">
            <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Instant Spatial Verification
            </h3>
            <p className="text-xs text-white/90 mt-1.5 leading-relaxed font-medium">
              Trigger instant multi-node voting across distributed cluster sensors. Cross-correlates thermal, smoke, and moisture gradients across edge zones.
            </p>
          </div>

          <div className="z-10 pt-2">
            <button
              onClick={handleTriggerConsensus}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#121417] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff4405]" />
              <span>{isEvaluating ? 'Evaluating Cluster...' : 'Start Spatial Verification'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Geospatial Map & Real-Time Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <LiveMap
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        </div>
        <div className="lg:col-span-5">
          <AlertPanel
            alerts={alerts}
            onAcknowledge={onAcknowledgeAlert}
          />
        </div>
      </div>

      {/* 4. AI Environmental Risk Assessment Section */}
      <RiskPanel
        selectedNode={selectedNode}
        nodes={nodes}
        onSelectNode={onSelectNode}
        demoMode={(summary as any)?.demo_mode ?? true}
      />

      {/* 5. Live Sensor Metrics Overview Cards */}
      <SensorOverview
        selectedNode={selectedNode}
        nodes={nodes}
        onSelectNode={onSelectNode}
      />

      {/* 6. Historical Telemetry Analysis */}
      <HistoricalCharts selectedNodeId={selectedNodeId} />

      {/* 7. Fleet Registry Table */}
      <FleetTable
        nodes={nodes}
        onSelectNode={onSelectNode}
        onOpenDetailModal={onOpenDetailModal}
      />
    </div>
  );
};


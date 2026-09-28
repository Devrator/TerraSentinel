import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '../types';
import { api } from '../services/api';

interface LandingLoginViewProps {
  onSelectRole: (role: UserRole) => void;
}

export const LandingLoginView: React.FC<LandingLoginViewProps> = ({ onSelectRole }) => {
  const [systemOnline, setSystemOnline] = useState<boolean>(true);
  const [nodeCount, setNodeCount] = useState<number>(5);
  const [agencyRoleName, setAgencyRoleName] = useState<string>('Chief Disaster Officer');

  useEffect(() => {
    api.getDashboardSummary()
      .then((s) => {
        setSystemOnline(true);
        if (s?.total_nodes) setNodeCount(s.total_nodes);
      })
      .catch(() => setSystemOnline(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#ff4405] selection:text-white">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ff4405]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-zinc-900/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Minimal Navigation Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ff4405] text-white flex items-center justify-center font-black text-base shadow-lg shadow-orange-500/25 shrink-0 border border-white/20">
            TS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                TerraSentinel
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff4405]/20 text-[#ff4405] border border-[#ff4405]/30">
                SIH26178
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium hidden sm:block">
              Distributed Edge Intelligence & Environmental Early Warning Platform
            </p>
          </div>
        </div>

        {/* Live Backend Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${systemOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-zinc-300 font-bold">{systemOnline ? 'CLUSTER LIVE' : 'CONNECTING'}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-orange-400 font-bold">{nodeCount} Nodes Mesh</span>
        </div>
      </header>

      {/* Main Hero & Portal Dual Selection */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-6 py-8 my-auto space-y-10">
        
        {/* Hero Title Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff4405]/10 border border-[#ff4405]/30 text-[#ff4405] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SELECT YOUR OPERATIONAL ACCESS GATEWAY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Environmental Safety & Incident Command
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
            TerraSentinel unifies real-time public micro-climate safety awareness with multi-node tactical disaster command and emergency response.
          </p>
        </div>

        {/* Dual Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* Card 1: Public Community Portal */}
          <div className="group rounded-3xl bg-zinc-900/80 hover:bg-zinc-900/95 border border-zinc-800 hover:border-orange-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl hover:shadow-orange-500/10 backdrop-blur-md relative overflow-hidden">
            <div className="space-y-6">
              
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff4405] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
                  Public Community
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">
                  Public Environmental Portal
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-2 leading-relaxed">
                  Dedicated interface for citizens, farmers, and local residents to monitor neighborhood micro-climate metrics, view live local risk ratings, and subscribe to emergency SMS alerts.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800/80 text-xs text-zinc-300 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Select specific sector/area (Kota North, Chambal, Mukundara, GIDC)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time Temperature, AQI, Rain Surge & Atmospheric Pressure</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Community Hazard Advisories & Focused Local GIS Map</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Register Mobile for Emergency SMS Notifications (Database Backed)</span>
                </div>
              </div>

            </div>

            {/* Action Button */}
            <div className="pt-6 mt-6 border-t border-zinc-800/80">
              <button
                onClick={() => onSelectRole('public')}
                id="btn-login-public"
                className="w-full py-3.5 px-5 rounded-2xl bg-zinc-800 hover:bg-[#ff4405] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg group-hover:bg-[#ff4405]"
              >
                <span>Enter Public Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Agency Tactical Command Center */}
          <div className="group rounded-3xl bg-zinc-900/80 hover:bg-zinc-900/95 border border-zinc-800 hover:border-orange-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl hover:shadow-orange-500/10 backdrop-blur-md relative overflow-hidden">
            <div className="space-y-6">
              
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#ff4405]/20 border border-[#ff4405]/40 text-[#ff4405] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#ff4405]/20 text-[#ff4405] border border-[#ff4405]/30 uppercase tracking-wider">
                  Tactical Command
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">
                  Agency Command Center
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-2 leading-relaxed">
                  Full-spectrum operational console for Disaster Authorities (SDMA), Fire & Rescue, and Incident Response Officers. Includes multi-node mesh, WebSerial hardware, and dispatch workflows.
                </p>
              </div>

              {/* Quick Profile Selector for Evaluation */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Select Officer Role Profile:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-semibold">
                  {[
                    { title: 'Chief Disaster Officer', desc: 'SDMA Control' },
                    { title: 'Hazmat Commander', desc: 'Fire & Rescue' },
                    { title: 'Field Incident Officer', desc: 'Cluster Ops' },
                  ].map((prof) => (
                    <button
                      key={prof.title}
                      type="button"
                      onClick={() => setAgencyRoleName(prof.title)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        agencyRoleName === prof.title
                          ? 'bg-[#ff4405]/20 border-[#ff4405] text-white'
                          : 'bg-zinc-800/60 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-bold truncate text-[11px]">{prof.title}</div>
                      <div className="text-[9px] text-zinc-500 font-mono truncate">{prof.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 text-xs text-zinc-300 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                  <span>Physical WebSerial USB Ingestion + Virtual Twin Mesh</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                  <span>Multi-Node Spatial Consensus & Offline SPI Flash Resilience</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                  <span>Multi-Layer GIS Map (OSM, ArcGIS Satellite & Dark Canvas)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                  <span>Emergency Dispatch Simulator (SDMA, Fire, Police, 108 EMS)</span>
                </div>
              </div>

            </div>

            {/* Action Button */}
            <div className="pt-6 mt-6 border-t border-zinc-800/80">
              <button
                onClick={() => onSelectRole('agency')}
                id="btn-login-agency"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#ff4405] hover:bg-[#e03b00] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/25"
              >
                <span>Launch Agency Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Info Strip */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-4 px-6 text-xs text-zinc-500 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-zinc-400">
            TerraSentinel (SIH26178) — Unified Dual-Portal Environmental Monitoring Platform
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">FastAPI SQLite Database</span>
            <span>•</span>
            <span className="text-orange-400 font-bold">WebSerial Ready</span>
            <span>•</span>
            <span className="text-zinc-400">Deterministic Simulation Testbed</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

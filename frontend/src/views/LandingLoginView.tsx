import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import {
  ShieldAlert,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Waves,
  Flame,
  Wind,
  Cpu,
  Workflow,
  ShieldCheck,
  Zap,
  Globe,
  Sun,
  Moon,
  ArrowUpRight,
  Radio,
  Layers,
  Activity,
  Radar,
  Network,
  Gauge,
  MapPin,
  Clock,
  Terminal,
  Server,
  Lock,
  Compass
} from 'lucide-react';
import type { UserRole } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { LandingThreeHero } from '../components/LandingThreeHero';

interface LandingLoginViewProps {
  onSelectRole: (role: UserRole) => void;
}

export const LandingLoginView: React.FC<LandingLoginViewProps> = ({ onSelectRole }) => {
  const { theme, toggleTheme } = useTheme();
  const [systemOnline, setSystemOnline] = useState<boolean>(true);
  const [nodeCount, setNodeCount] = useState<number>(5);
  const [agencyRoleName, setAgencyRoleName] = useState<string>('Chief Disaster Officer');
  const [activeVectorTab, setActiveVectorTab] = useState<'flood' | 'fire' | 'aqi'>('flood');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis Smooth Scrolling Engine
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    lenis.on('scroll', (e: { progress: number }) => {
      setScrollProgress(e.progress);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    api.getDashboardSummary()
      .then((s) => {
        setSystemOnline(true);
        if (s?.total_nodes) setNodeCount(s.total_nodes);
      })
      .catch(() => setSystemOnline(false));
  }, []);

  const scrollToSection = (id: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(`#${id}`, { offset: -90, duration: 1.3 });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 flex flex-col font-sans transition-colors duration-300 relative selection:bg-[#ff4405] selection:text-white">

      {/* 3D Interactive WebGL Mesh Background */}
      <LandingThreeHero />

      {/* Top Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ff4405] via-amber-400 to-cyan-500 z-50 transition-all duration-75 origin-left shadow-xs"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* =========================================================================
          1. NAVIGATION HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-30 pt-3 pb-2 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-5 lg:px-7 py-2.5 transition-all shadow-2xs flex items-center justify-between gap-4">

          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="TerraSentinel Logo"
              className="h-12 sm:h-14 lg:h-16 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105 cursor-pointer py-0.5"
              onClick={() => scrollToSection('hero')}
            />
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#121417] text-white tracking-wider shadow-xs">
                SIH26178
              </span>

            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <button onClick={() => scrollToSection('hero')} className="hover:text-[#ff4405] transition-colors cursor-pointer">
              System Overview
            </button>
            <button onClick={() => scrollToSection('vectors')} className="hover:text-[#ff4405] transition-colors cursor-pointer">
              Hazard Sentry
            </button>
            <button onClick={() => scrollToSection('gateways')} className="hover:text-[#ff4405] transition-colors cursor-pointer">
              Mission Portals
            </button>
            <button onClick={() => scrollToSection('pipeline')} className="hover:text-[#ff4405] transition-colors cursor-pointer">
              Telemetry Flow
            </button>
            <button onClick={() => scrollToSection('capabilities')} className="hover:text-[#ff4405] transition-colors cursor-pointer">
              Field Resilience
            </button>
            <button onClick={() => scrollToSection('benchmarks')} className="hover:text-[#ff4405] transition-colors cursor-pointer">
              AI Benchmarks
            </button>
          </nav>

          {/* Action Ribbon */}
          <div className="flex items-center gap-2.5">





            {/* Public Portal Button */}
            <button
              onClick={() => onSelectRole('public')}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] border border-orange-200 text-xs font-bold transition-all hidden sm:flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600" />
              <span>Public Portal</span>
            </button>

            {/* Tactical Login Button */}
            <button
              onClick={() => onSelectRole('agency')}
              id="btn-nav-login"
              className="px-3.5 py-1.5 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shadow-orange-500/25"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Tactical Command</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 space-y-12 relative z-10">

        {/* =========================================================================
            2. HERO SECTION: NEXT-GEN ENVIRONMENTAL SENTINEL
            ========================================================================= */}
        <section id="hero" className="py-8 lg:py-14 text-center space-y-6 max-w-5xl mx-auto relative">

          {/* Live System Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-orange-200 text-[#ea580c] text-xs font-mono font-bold shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-[#ff4405] animate-pulse" />
            <span>DISTRIBUTED EDGE AI DISASTER SENTRY • SIH26178</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12] uppercase">
            Autonomous Multi-Hazard <br className="hidden sm:inline" />
            <span className="text-[#ff4405] underline decoration-orange-300/40 underline-offset-8">
              Environmental Early Warning
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto backdrop-blur-xs">
            TerraSentinel unifies decentralized ESP32 sensor mesh hardware with spatiotemporal AI risk modeling — detecting wildfire ignitions, river storm surges, and toxic smog inversions with sub-second on-device inference before disasters escalate.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectRole('agency')}
              id="btn-hero-launch-agency"
              className="px-6 py-3.5 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>🚀 Launch Command Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('gateways')}
              className="px-5 py-3.5 rounded-xl bg-white/95 hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-2xs backdrop-blur-md hover:scale-102"
            >
              <Compass className="w-4 h-4 text-[#ff4405]" />
              <span>Select Access Portal</span>
            </button>

            <button
              onClick={() => onSelectRole('public')}
              className="px-5 py-3.5 rounded-xl bg-white/95 hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-2xs backdrop-blur-md hover:scale-102"
            >
              <Users className="w-4 h-4 text-cyan-600" />
              <span>Citizen Portal</span>
            </button>
          </div>

          {/* Live Field Telemetry Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs transition-transform hover:-translate-y-1 text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Active Mesh</span>
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">5 Nodes</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">1 HW + 4 Virtual Twins</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs transition-transform hover:-translate-y-1 text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Edge Latency</span>
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600">&lt; 180ms</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Zero-Cloud Dependency</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs transition-transform hover:-translate-y-1 text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Hazard Vectors</span>
                <ShieldAlert className="w-3.5 h-3.5 text-[#ff4405]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#ff4405]">3 Vectors</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Fire • Flood • Smog AQI</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs transition-transform hover:-translate-y-1 text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Forecast Window</span>
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div className="text-2xl font-black font-mono text-cyan-600">3–6 Hours</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">IDW Spatial Regression</div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs transition-transform hover:-translate-y-1 text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Data Reliability</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-600">99.8%</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">SPI Flash Resilience</div>
            </div>
          </div>

        </section>

        {/* =========================================================================
            3. INTERACTIVE MULTI-HAZARD SENTRY SHOWCASE
            ========================================================================= */}
        <section id="vectors" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-[#ff4405]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Multi-Hazard Detection Sentry • Real-Time Physical Telemetry
              </h3>
            </div>

            {/* Interactive Vector Selector Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveVectorTab('flood')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeVectorTab === 'flood' ? 'bg-[#121417] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                🌊 Hydrological Flood
              </button>
              <button
                onClick={() => setActiveVectorTab('fire')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeVectorTab === 'fire' ? 'bg-[#121417] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                🔥 Pyrogenic Wildfire
              </button>
              <button
                onClick={() => setActiveVectorTab('aqi')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeVectorTab === 'aqi' ? 'bg-[#121417] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                🌫️ Atmospheric Air Quality
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Flash Flood Card */}
            <div className={`p-6 rounded-2xl bg-white/95 backdrop-blur-md border transition-all shadow-2xs flex flex-col justify-between ${activeVectorTab === 'flood' ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-md' : 'border-slate-200/90'
              }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
                    <Waves className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-200">
                    HYDROLOGICAL
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Hydrological Wave Front Tracking
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    HC-SR04 sonar arrays and rain sensors monitor water level displacement at 500ms intervals. Rate-of-rise models compute upstream storm surge vectors 40 minutes before downstream flooding.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-bold text-cyan-700">
                <span>Ultrasonic Wave Sonar</span>
                <span>0.5s Sampling Rate</span>
              </div>
            </div>

            {/* Wildfire Card */}
            <div className={`p-6 rounded-2xl bg-white/95 backdrop-blur-md border transition-all shadow-2xs flex flex-col justify-between ${activeVectorTab === 'fire' ? 'border-orange-400 ring-2 ring-orange-400/20 shadow-md' : 'border-slate-200/90'
              }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#ff4405] flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-orange-50 text-[#ea580c] px-2 py-0.5 rounded border border-orange-200">
                    PYROGENIC
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Multi-Spectral Flame Co-Validation
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    Combines narrow-band IR flame flicker sensing with rapid DHT22 thermal gradient differentials (&gt;3°C/min) to detect smoldering understory combustion while suppressing ambient sunlight false triggers.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-bold text-[#ea580c]">
                <span>Dual IR + DHT22 Thermal</span>
                <span>Zero False-Trigger Filter</span>
              </div>
            </div>

            {/* Air Quality Card */}
            <div className={`p-6 rounded-2xl bg-white/95 backdrop-blur-md border transition-all shadow-2xs flex flex-col justify-between ${activeVectorTab === 'aqi' ? 'border-purple-400 ring-2 ring-purple-400/20 shadow-md' : 'border-slate-200/90'
              }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                    <Wind className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                    ATMOSPHERIC
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Toxic Smog & Chemical Gas Sentry
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    MQ135 electrochemical arrays track hazardous CO, combustible gases, and industrial particulate spikes. Automatically triggers geo-targeted civilian SMS broadcasts to threatened residential sectors.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-bold text-purple-700">
                <span>Continuous Gas Profiling</span>
                <span>Automated SMS Dispatch</span>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. MISSION ACCESS PORTALS (DUAL TERMINALS)
            ========================================================================= */}
        <section id="gateways" className="py-6 space-y-6">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] text-xs font-mono font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#ff4405]" />
              <span>AUTHENTICATED ACCESS CHANNELS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Operational Gateways & Incident Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              TerraSentinel unifies real-time public micro-climate safety awareness with multi-node tactical disaster command and emergency response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto items-stretch">

            {/* Card 1: Public Community Portal */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[#ff4405]">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    Public Community Portal
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Citizen Micro-Climate & Alert Portal
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    Dedicated interface for citizens, farmers, and local residents to monitor neighborhood micro-climate metrics, view live local risk ratings, and subscribe to emergency SMS alerts.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Select specific sector/area (Kota North, Chambal, Mukundara, GIDC)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time Temperature, AQI, Rain Surge & Atmospheric Pressure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Community Hazard Advisories & Focused Local GIS Map</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Register Mobile for Emergency SMS Notifications (Database Backed)</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100">
                <button
                  onClick={() => onSelectRole('public')}
                  id="btn-login-public"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>Enter Public Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Agency Tactical Command Center */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[#ff4405]">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-[#ea580c] border border-orange-200 uppercase">
                    Tactical Command Center
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Agency Command Operations Console
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    Full-spectrum operational console for Disaster Authorities (SDMA), Fire & Rescue, and Incident Response Officers. Includes multi-node mesh, WebSerial hardware, and dispatch workflows.
                  </p>
                </div>

                {/* Profile Selector */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
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
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${agencyRoleName === prof.title
                          ? 'bg-[#121417] text-white border-zinc-800 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                      >
                        <div className="font-bold truncate text-[11px]">{prof.title}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate">{prof.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                    <span>Physical WebSerial USB Ingestion + Virtual Twin Mesh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                    <span>Multi-Node Spatial Consensus & Offline SPI Flash Resilience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                    <span>Multi-Layer GIS Map (OSM, ArcGIS Satellite & Dark Canvas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff4405] shrink-0" />
                    <span>Emergency Dispatch Simulator (SDMA, Fire, Police, 108 EMS)</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100">
                <button
                  onClick={() => onSelectRole('agency')}
                  id="btn-login-agency"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5"
                >
                  <span>Launch Agency Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            5. TELEMETRY FLOW PIPELINE (6-STAGE DATA ENGINE)
            ========================================================================= */}
        <section id="pipeline" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-[#ff4405]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                End-to-End Data Pipeline • Zero-Cloud Edge Autonomy
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              DISTRIBUTED REAL-TIME INGESTION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">🔬</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  ESP32 · C/C++
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">1. Physical Sensor Ingestion</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                HC-SR04, DHT22, MQ135 & IR Flame sensors sample environmental telemetry every 2 seconds.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">🧠</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  TinyML Micro
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">2. On-Device TinyML Scoring</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Rate-of-change and statistical risk scoring runs locally in &lt;200ms with zero cloud connection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">📡</span>
                <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-200">
                  SX1278 · 433MHz
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">3. LoRa Multi-Hop Mesh Relay</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Multi-hop mesh forwarding hops packets node-to-node over a 15km mountain/valley perimeter.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">🌐</span>
                <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                  Raspberry Pi 4
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">4. IoT Gateway Bridge</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Aggregates mesh packets, bridges via WiFi/4G MQTT broker to cloud analytics backends.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">⚡</span>
                <span className="text-[10px] font-mono font-bold bg-orange-50 text-[#ff4405] px-2 py-0.5 rounded border border-orange-200">
                  Python Microservice
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">5. FastAPI Spatial Engine</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Performs Spatial IDW correlation, false-positive filtering, and 6-hour disaster progression forecasts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">🖥️</span>
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                  React 18 · WebSocket
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">6. Tactical Command Cockpit</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Real-time incident management dashboard with interactive GIS mapping and emergency SMS dispatch.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            6. FIELD RESILIENCE & HARDWARE CAPABILITIES
            ========================================================================= */}
        <section id="capabilities" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Field Resilience • Built for Extreme Environmental Conditions
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              SOLAR MPPT + DECENTRALIZED TOPOLOGY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="text-xl">🌊</div>
              <h4 className="text-xs font-bold text-slate-900">Catchment Surge Forewarning</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Upstream river catchment sensors calculate velocity vectors and rate-of-rise to alert downstream bridges and settlements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="text-xl">🔥</div>
              <h4 className="text-xs font-bold text-slate-900">Thermal Combustion Co-Validation</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Eliminates false alarms from ambient sunlight or dust by cross-validating IR spectral flickering against temperature jumps.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="text-xl">🔋</div>
              <h4 className="text-xs font-bold text-slate-900">Solar Autonomous Power Banks</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Integrated MPPT solar management and LiFePO4 battery banks ensure 24/7 continuous operation even through heavy monsoons.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="text-xl">🗺️</div>
              <h4 className="text-xs font-bold text-slate-900">Spatial IDW Neighborhood Consensus</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Inverse Distance Weighting correlates multiple neighboring sensor nodes to distinguish local anomalies from regional disasters.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="text-xl">📲</div>
              <h4 className="text-xs font-bold text-slate-900">Automated Civilian SMS Broadcasts</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Automatically formats and dispatches geo-targeted emergency warning alerts in Hindi and English via cellular SMS gateways.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="text-xl">📡</div>
              <h4 className="text-xs font-bold text-slate-900">Self-Healing Peer Mesh Topology</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                If any gateway or node is destroyed or submerged, surrounding nodes automatically discover alternate routing hops.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            7. AI BENCHMARKS & DUAL-TIER TECHNICAL COMPARISON
            ========================================================================= */}
        <section id="benchmarks" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Dual-Tier Intelligence Specifications • Edge TinyML vs Cloud AI
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              SUB-SECOND EDGE + REGIONAL SPATIAL CONSENSUS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Level 1: Edge TinyML */}
            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">
                    Tier 1 · Embedded Edge TinyML
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">ESP32 On-Device Inference Engine</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  0-DELAY LOCAL
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Lightweight statistical neural pipeline embedded inside ESP32 flash memory. Evaluates multi-parameter hazard curves with zero network roundtrip.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Target Hardware</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">ESP32 240MHz</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Memory Footprint</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">&lt; 50 KB Flash</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Inference Latency</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block text-[11px]">&lt; 180 ms</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Sampling Frequency</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">0.5 Hz (every 2s)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Hazard Vectors</span>
                  <span className="font-bold text-[#ff4405] mt-0.5 block text-[11px]">Flood, Fire, AQI</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Offline Capability</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">100% Autonomous</span>
                </div>
              </div>
            </div>

            {/* Level 2: Cloud AI Service */}
            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono text-[#ff4405] font-bold uppercase tracking-wider block">
                    Tier 2 · Central Cloud AI Service
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">FastAPI Spatial Correlation Engine</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-[#ff4405] border border-orange-200">
                  SPATIAL CONSENSUS
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                High-throughput microservice correlating regional node vectors, executing predictive forecast regressions, and filtering transient false triggers.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Framework</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">Python · FastAPI</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Spatial Model</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">IDW Clustering</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Catchment Radius</span>
                  <span className="font-bold text-cyan-700 mt-0.5 block text-[11px]">15 km Perimeter</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Forecast Horizon</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">3 to 6 Hours</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">False-Alarm Filter</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block text-[11px]">&gt; 94% Accuracy</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Transport Layer</span>
                  <span className="font-bold text-slate-900 mt-0.5 block text-[11px]">WebSocket Hub</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            8. BOTTOM HERO CALL-TO-ACTION CARD
            ========================================================================= */}
        <section className="bg-[#ff4405] text-white rounded-2xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 bg-flame-pattern">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMAND READINESS</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Ready to Access the Command Cockpit?
            </h3>
            <p className="text-xs text-white/90 leading-relaxed font-medium max-w-xl">
              Experience the TerraSentinel Command Operations center with live node telemetry, automated incident queues, and GIS risk mapping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectRole('agency')}
              id="btn-bottom-agency"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#121417] font-black text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>🚀 Access Command Cockpit</span>
              <ArrowUpRight className="w-4 h-4 text-[#ff4405]" />
            </button>
            <button
              onClick={() => onSelectRole('public')}
              className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <span>🌐 Citizen Portal</span>
            </button>
          </div>
        </section>

      </main>

      {/* =========================================================================
          9. FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 bg-white/90 backdrop-blur-md shadow-2xs mt-auto relative z-10">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">
            TerraSentinel (SIH26178) — Unified Dual-Portal Environmental Monitoring Platform
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span className="text-emerald-700 font-semibold">FastAPI Ingestion Active</span>
            <span>•</span>
            <span className="text-[#ff4405] font-semibold">WebSerial Ready</span>
            <span>•</span>
            <span>Deterministic Simulation</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

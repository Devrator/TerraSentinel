import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Radio,
  BrainCircuit,
  AlertTriangle,
  Layers,
  Network,
  ShieldCheck,
  FlaskConical,
  Globe2,
  Server,
  ClipboardList,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Boxes,
  Zap,
  Cpu,
  MapPin,
  Activity,
  ShieldAlert,
  FileSpreadsheet,
  ArrowUpRight,
  Settings,
  Leaf
} from 'lucide-react';
import type { NavigationTab } from '../types';
import { LogoAnimated } from './LogoAnimated';

export interface ActiveSituationInfo {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | string;
  location: string;
  nodeId?: string;
  riskScore?: number;
}

export interface ActiveIncidentInfo {
  id: number;
  incidentNumber: string;
  title: string;
  severity: string;
  status: string;
  nodeId?: string;
}

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeSituation?: ActiveSituationInfo | null;
  activeIncidents?: ActiveIncidentInfo[];
  alertCounts?: {
    total: number;
    unacknowledged: number;
    critical: number;
  };
}

interface NavGroup {
  category: string;
  label: string;
  icon: React.ElementType;
  items: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeVariant?: 'default' | 'danger' | 'warning' | 'success';
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  activeSituation,
  activeIncidents = [],
  alertCounts = { total: 0, unacknowledged: 0, critical: 0 },
}) => {
  // Collapsible category state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    INTELLIGENCE: false,
    INFRASTRUCTURE: false,
    TOOLS: false,
    ADMINISTRATION: false,
  });

  const intelligenceGroup: NavGroup = {
    category: 'INTELLIGENCE',
    label: 'Intelligence',
    icon: BrainCircuit,
    items: [
      { id: 'ai-explainability', label: 'AI Explainability', icon: BrainCircuit },
      { id: 'anomalies', label: 'Anomalies & Drift', icon: Zap },
      { id: 'analytics-trends', label: 'Analytics & Trends', icon: TrendingUp },
      { id: 'risk-map', label: 'Risk Map', icon: Layers },
    ],
  };

  const infrastructureGroup: NavGroup = {
    category: 'INFRASTRUCTURE',
    label: 'Infrastructure',
    icon: Boxes,
    items: [
      { id: 'sensor-network', label: 'Sensor Network', icon: Boxes },
      { id: 'sensor-health', label: 'Sensor Health', icon: Activity },
      { id: 'network-topology', label: 'Network Topology', icon: Network },
      { id: 'data-quality', label: 'Data Quality', icon: ShieldCheck, badge: '96%' },
    ],
  };

  const toolsGroup: NavGroup = {
    category: 'TOOLS',
    label: 'Tools',
    icon: FlaskConical,
    items: [
      { id: 'simulation', label: 'Simulation Lab', icon: FlaskConical },
      { id: 'digital-twin', label: 'Digital Twin', icon: Globe2 },
      { id: 'hardware-simulator', label: 'Hardware Simulator', icon: Cpu, badge: '3D Twin' },
    ],
  };

  const administrationGroup: NavGroup = {
    category: 'ADMINISTRATION',
    label: 'Administration',
    icon: Server,
    items: [
      { id: 'configuration', label: 'Configuration', icon: Sliders },
      { id: 'system-health', label: 'System Observability', icon: Server },
      { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'impact', label: 'Sustainability / Impact', icon: Leaf },
    ],
  };

  const expandableGroups = [intelligenceGroup, infrastructureGroup, toolsGroup, administrationGroup];

  // Auto-expand group if child is active
  useEffect(() => {
    expandableGroups.forEach((group) => {
      if (group.items.some((item) => item.id === currentTab)) {
        setExpandedCategories((prev) => ({ ...prev, [group.category]: true }));
      }
    });
  }, [currentTab]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const hasCritical = alertCounts.critical > 0;
  const hasAlerts = alertCounts.unacknowledged > 0 || alertCounts.total > 0;
  const hasActiveIncidents = activeIncidents.length > 0;

  return (
    <aside
      className={`fixed top-3.5 left-3.5 bottom-3.5 z-40 flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl text-slate-700 transition-all duration-300 select-none shadow-xl ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Floating Center Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-50 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-md items-center justify-center transition-all hover:scale-110 cursor-pointer"
        title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        aria-label="Toggle Navigation Collapse"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="h-20 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-center px-3 rounded-t-3xl shrink-0">
        {!isCollapsed ? (
          <div
            className="flex items-center justify-center overflow-hidden py-1 w-full cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectTab('dashboard')}
            title="Return to Command Center"
          >
            <LogoAnimated variant="full" className="h-12 w-auto drop-shadow-xs" />
          </div>
        ) : (
          <div
            className="flex items-center justify-center w-full py-1 cursor-pointer transition-transform hover:scale-110"
            onClick={() => onSelectTab('dashboard')}
            title="Return to Command Center"
          >
            <LogoAnimated variant="icon" className="h-10 w-10 drop-shadow-xs" />
          </div>
        )}
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* =========================================================================
            1. CONTEXTUAL: ACTIVE SITUATION (Shows only during emergency / escalation)
            ========================================================================= */}
        {activeSituation && (
          <div className="transition-all animate-fadeIn">
            {!isCollapsed ? (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-50 via-rose-50/40 to-amber-50/50 border border-orange-300/90 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff4405] animate-ping" />
                    <span className="text-[10px] font-mono font-black uppercase text-orange-950 tracking-wider">
                      ACTIVE SITUATION
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.2 rounded-full font-mono text-[9px] font-extrabold border ${
                      activeSituation.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-[#ea580c] text-white border-orange-700'
                    }`}
                  >
                    {activeSituation.severity}
                  </span>
                </div>

                <div className="font-extrabold text-xs text-slate-900 leading-snug mb-0.5 truncate" title={activeSituation.id}>
                  {activeSituation.id}
                </div>
                <div className="text-[11px] text-slate-600 truncate font-medium mb-2.5" title={activeSituation.location}>
                  📍 {activeSituation.location}
                </div>

                <button
                  onClick={() => onSelectTab('situation-room')}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer shadow-xs ${
                    currentTab === 'situation-room'
                      ? 'bg-[#121417] text-white'
                      : 'bg-[#ff4405] hover:bg-[#e03a00] text-white'
                  }`}
                >
                  <span>Open Situation Room</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectTab('situation-room')}
                title={`Active Situation: ${activeSituation.id} (${activeSituation.severity})`}
                className={`w-full p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  currentTab === 'situation-room'
                    ? 'bg-[#121417] text-white shadow-xs'
                    : 'bg-orange-500 text-white hover:bg-orange-600 animate-pulse'
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="text-[8px] font-mono font-bold mt-0.5">SIT</span>
              </button>
            )}
          </div>
        )}

        {/* =========================================================================
            2. CONTEXTUAL: ACTIVE INCIDENTS (Shows only when open incidents exist)
            ========================================================================= */}
        {hasActiveIncidents && (
          <div className="transition-all animate-fadeIn">
            {!isCollapsed ? (
              <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[10px] font-mono font-extrabold uppercase text-slate-300 tracking-wider">
                      ACTIVE INCIDENTS ({activeIncidents.length})
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                </div>

                <div className="space-y-1.5 mb-2.5">
                  {activeIncidents.slice(0, 2).map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectTab('incidents')}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer text-[11px]"
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-white">
                        <span>{inc.incidentNumber}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/30 text-orange-300 font-sans">
                          {inc.severity}
                        </span>
                      </div>
                      <div className="text-slate-300 truncate text-[10px] mt-0.5">
                        {inc.title}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onSelectTab('incidents')}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                    currentTab === 'incidents'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-white/15 hover:bg-white/20 text-white'
                  }`}
                >
                  <span>Open Incident Console</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectTab('incidents')}
                title={`Active Incidents: ${activeIncidents.length} open`}
                className={`w-full p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  currentTab === 'incidents'
                    ? 'bg-[#121417] text-white shadow-xs'
                    : 'bg-slate-900 text-white hover:bg-zinc-800'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-orange-400" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[8px] font-mono font-bold">
                  {activeIncidents.length}
                </span>
              </button>
            )}
          </div>
        )}

        {/* =========================================================================
            3. PERMANENT CORE OPERATIONAL NAVIGATION
            ========================================================================= */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
              CORE OPERATIONS
            </div>
          )}

          {/* 1. Command Center */}
          <button
            onClick={() => onSelectTab('dashboard')}
            title={isCollapsed ? '1. Command Center' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#121417] text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${currentTab === 'dashboard' ? 'text-[#ff4405]' : 'text-slate-400'}`} />
            {!isCollapsed && <span className="truncate flex-1 text-left">Command Center</span>}
          </button>

          {/* 2. Live Operations */}
          <button
            onClick={() => onSelectTab('live-monitoring')}
            title={isCollapsed ? '2. Live Operations' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-all cursor-pointer ${
              currentTab === 'live-monitoring'
                ? 'bg-[#121417] text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <Radio className={`w-4 h-4 shrink-0 ${currentTab === 'live-monitoring' ? 'text-[#ff4405]' : 'text-slate-400'}`} />
            {!isCollapsed && <span className="truncate flex-1 text-left">Live Operations</span>}
            {!isCollapsed && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
          </button>

          {/* 3. Alerts (Early Warning) with Live Badges */}
          <button
            onClick={() => onSelectTab('alerts')}
            title={isCollapsed ? `3. Alerts (${alertCounts.unacknowledged || alertCounts.total})` : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-all cursor-pointer ${
              currentTab === 'alerts'
                ? 'bg-[#121417] text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 shrink-0 ${
                currentTab === 'alerts'
                  ? 'text-[#ff4405]'
                  : hasCritical
                  ? 'text-rose-600 animate-bounce'
                  : 'text-slate-400'
              }`}
            />
            {!isCollapsed && <span className="truncate flex-1 text-left">Alerts</span>}
            {!isCollapsed && hasAlerts && (
              <div className="flex items-center gap-1 shrink-0">
                {hasCritical && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-600 text-white">
                    {alertCounts.critical}
                  </span>
                )}
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                    currentTab === 'alerts'
                      ? 'bg-white/20 text-white'
                      : 'bg-orange-50 text-[#ea580c] border border-orange-200'
                  }`}
                >
                  {alertCounts.unacknowledged > 0 ? alertCounts.unacknowledged : alertCounts.total}
                </span>
              </div>
            )}
            {isCollapsed && hasAlerts && (
              <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-[#ff4405] ring-2 ring-white" />
            )}
          </button>

          {/* 4. Map */}
          <button
            onClick={() => onSelectTab('live-map')}
            title={isCollapsed ? '4. Map (GIS)' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-all cursor-pointer ${
              currentTab === 'live-map'
                ? 'bg-[#121417] text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <MapPin className={`w-4 h-4 shrink-0 ${currentTab === 'live-map' ? 'text-[#ff4405]' : 'text-slate-400'}`} />
            {!isCollapsed && <span className="truncate flex-1 text-left">Map</span>}
            {!isCollapsed && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                GIS
              </span>
            )}
          </button>
        </div>

        {/* =========================================================================
            4. COLLAPSIBLE CONTEXT GROUPS: Intelligence, Infrastructure, Tools, Admin
            ========================================================================= */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          {expandableGroups.map((group) => {
            const GroupIcon = group.icon;
            const isGroupActive = group.items.some((i) => i.id === currentTab);
            const isExpanded = expandedCategories[group.category] ?? false;

            return (
              <div key={group.category} className="rounded-2xl transition-all">
                {!isCollapsed ? (
                  <div>
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(group.category)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                        isGroupActive
                          ? 'text-[#ea580c] bg-orange-50/70 border border-orange-200/80'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GroupIcon className={`w-3.5 h-3.5 shrink-0 ${isGroupActive ? 'text-[#ff4405]' : 'text-slate-400'}`} />
                        <span className="truncate">{group.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-0 text-slate-600' : '-rotate-90 text-slate-400'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Sub-items list */}
                    {isExpanded && (
                      <div className={`ml-3.5 pl-2.5 my-1 border-l-2 space-y-1 transition-all ${
                        isGroupActive ? 'border-[#ff4405]/50' : 'border-slate-200/80'
                      }`}>
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentTab === item.id;

                          return (
                            <button
                              key={item.id}
                              onClick={() => onSelectTab(item.id)}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#121417] text-white font-extrabold shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#ff4405]' : 'text-slate-400'}`} />
                              <span className="truncate flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <span
                                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-orange-50 text-[#ea580c] border border-orange-200'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Collapsed View */
                  <div className="space-y-1 py-1 border-b border-slate-100 last:border-b-0">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => onSelectTab(item.id)}
                          title={`${group.label} › ${item.label}`}
                          className={`w-full flex items-center justify-center p-2 rounded-xl text-xs transition-all cursor-pointer relative ${
                            isActive
                              ? 'bg-[#121417] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ff4405]' : ''}`} />
                          {isActive && (
                            <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-[#ff4405]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Fleet Status */}
      <div className="p-2.5 border-t border-slate-200/80 bg-slate-50/60 rounded-b-3xl shrink-0">
        {!isCollapsed ? (
          <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700 font-bold">Fleet Ready</span>
            </div>
            <span className="font-mono text-[#ff4405] font-black text-[10px]">5 NODES</span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Fleet Operational" />
          </div>
        )}
      </div>
    </aside>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Radio,
  BrainCircuit,
  AlertTriangle,
  FileSpreadsheet,
  Activity,
  Layers,
  CheckSquare,
  Network,
  ShieldCheck,
  FlaskConical,
  Globe2,
  Server,
  ClipboardList,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Boxes,
  Zap
} from 'lucide-react';
import type { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavGroup {
  category: string;
  items: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navGroups: NavGroup[] = [
    {
      category: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'situation-room', label: 'Situation Room', icon: Globe2, badge: 'OPS' },
        { id: 'live-monitoring', label: 'Live Monitoring', icon: Radio },
      ],
    },
    {
      category: 'INTELLIGENCE',
      items: [
        { id: 'ai-explainability', label: 'AI Explainability', icon: BrainCircuit },
        { id: 'anomalies', label: 'Anomalies', icon: Zap },
        { id: 'risk-map', label: 'Risk Heatmap', icon: Layers },
        { id: 'analytics-trends', label: 'Analytics & Trends', icon: TrendingUp },
      ],
    },
    {
      category: 'EARLY WARNING',
      items: [
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
        { id: 'incidents', label: 'Incident Mgmt', icon: FileSpreadsheet, badge: 'Live' },
        { id: 'response', label: 'Response Protocols', icon: CheckSquare },
      ],
    },
    {
      category: 'NETWORK',
      items: [
        { id: 'sensor-network', label: 'Sensor Network', icon: Boxes },
        { id: 'sensor-health', label: 'Sensor Health', icon: Activity },
        { id: 'network-topology', label: 'Network Topology', icon: Network },
        { id: 'data-quality', label: 'Data Quality', icon: ShieldCheck, badge: '94%' },
      ],
    },
    {
      category: 'SIMULATION',
      items: [
        { id: 'simulation', label: 'Simulation Lab', icon: FlaskConical },
        { id: 'digital-twin', label: 'Digital Twin', icon: Globe2 },
      ],
    },
    {
      category: 'SYSTEM',
      items: [
        { id: 'system-health', label: 'System Health', icon: Server },
        { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
        { id: 'configuration', label: 'Configuration', icon: Sliders },
      ],
    },
    {
      category: 'IMPACT',
      items: [
        { id: 'impact', label: 'Sustainability & Impact', icon: Sparkles },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-[#07110F] border-r border-[#1B2D27] text-slate-300 transition-all duration-300 select-none ${isCollapsed ? 'w-16' : 'w-64'
        }`}
    >
      {/* Sidebar Header Brand with Official Logo */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-[#1B2D27]">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/logo.png"
              alt="TerraSentinel Logo"
              className="h-10 w-auto object-contain shrink-0 transition-transform hover:scale-102"
            />
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <img
              src="/logo.png"
              alt="TerraSentinel Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg bg-[#101D19] hover:bg-[#182B24] border border-[#1B2D27] text-slate-400 hover:text-white transition-all cursor-pointer shrink-0 ml-1"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
                {group.category}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                      : 'hover:bg-[#101D19] text-slate-400 hover:text-slate-200 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-emerald-400 scale-105' : 'text-slate-400'
                      }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Node Summary */}
      <div className="p-2 border-t border-[#1B2D27] bg-[#0A1613]">
        {!isCollapsed ? (
          <div className="p-2 rounded-xl bg-[#101D19] border border-[#1B2D27] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Node Telemetry</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">5 ACTIVE</span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
          </div>
        )}
      </div>
    </aside>
  );
};

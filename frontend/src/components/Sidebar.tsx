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
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-white border-r border-slate-200 text-slate-700 transition-all duration-300 select-none shadow-2xs ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Floating Center-Border Collapse / Expand Button */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-50 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-md items-center justify-center transition-all hover:scale-110 cursor-pointer"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Sidebar Header Brand with Official Logo */}
      <div className="h-20 border-b border-slate-200 bg-slate-50/50 flex items-center justify-center px-2">
        {!isCollapsed ? (
          <div className="flex items-center justify-center overflow-hidden py-1 w-full">
            <img
              src="/logo.png"
              alt="TerraSentinel Logo"
              className="h-14 sm:h-15 w-auto object-contain transition-transform hover:scale-102"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full py-1">
            <img
              src="/logo-collapsed.png"
              alt="TerraSentinel Logo"
              className="h-10 w-10 object-contain transition-transform hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* Navigation Group Items (Scrollbar Hidden) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
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
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-2xs'
                      : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-transparent'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-emerald-700 scale-105' : 'text-slate-400'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
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
      <div className="p-2 border-t border-slate-200 bg-slate-50/60">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700 font-medium">Node Telemetry</span>
            </div>
            <span className="font-mono text-emerald-700 font-bold">5 ACTIVE</span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
          </div>
        )}
      </div>
    </aside>
  );
};

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  TrendingUp,
  Boxes,
  Zap,
  Cpu,
  Compass,
  ShieldAlert,
  Leaf
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
  icon: React.ElementType;
  items: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const isSimulationEnabled = import.meta.env.VITE_SIMULATION_ENABLED !== 'false';

  const rawNavGroups: NavGroup[] = [
    {
      category: 'OVERVIEW',
      icon: Compass,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'situation-room', label: 'Situation Room', icon: Globe2, badge: 'OPS' },
        { id: 'live-monitoring', label: 'Live Monitoring', icon: Radio },
      ],
    },
    {
      category: 'INTELLIGENCE',
      icon: BrainCircuit,
      items: [
        { id: 'ai-explainability', label: 'AI Explainability', icon: BrainCircuit },
        { id: 'anomalies', label: 'Anomalies', icon: Zap },
        { id: 'risk-map', label: 'Risk Heatmap', icon: Layers },
        { id: 'analytics-trends', label: 'Analytics & Trends', icon: TrendingUp },
      ],
    },
    {
      category: 'EARLY WARNING',
      icon: ShieldAlert,
      items: [
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
        { id: 'incidents', label: 'Incident Mgmt', icon: FileSpreadsheet, badge: 'Live' },
        { id: 'response', label: 'Response Protocols', icon: CheckSquare },
      ],
    },
    {
      category: 'NETWORK',
      icon: Boxes,
      items: [
        { id: 'sensor-network', label: 'Sensor Network', icon: Boxes },
        { id: 'sensor-health', label: 'Sensor Health', icon: Activity },
        { id: 'network-topology', label: 'Network Topology', icon: Network },
        { id: 'data-quality', label: 'Data Quality', icon: ShieldCheck, badge: '94%' },
      ],
    },
    ...(isSimulationEnabled
      ? [
          {
            category: 'SIMULATION',
            icon: FlaskConical,
            items: [
              { id: 'simulation' as NavigationTab, label: 'Simulation Lab', icon: FlaskConical },
              { id: 'hardware-simulator' as NavigationTab, label: '3D Hardware Twin', icon: Cpu, badge: '3D FX' },
              { id: 'digital-twin' as NavigationTab, label: 'Digital Twin', icon: Globe2 },
            ],
          },
        ]
      : []),
    {
      category: 'SYSTEM',
      icon: Server,
      items: [
        { id: 'system-health', label: 'System Health', icon: Server },
        { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
        { id: 'configuration', label: 'Configuration', icon: Sliders },
      ],
    },
    {
      category: 'IMPACT',
      icon: Leaf,
      items: [
        { id: 'impact', label: 'Sustainability & Impact', icon: Sparkles },
      ],
    },
  ];

  // Expanded sub-division state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    OVERVIEW: true,
    INTELLIGENCE: true,
    'EARLY WARNING': true,
    NETWORK: true,
    SIMULATION: true,
    SYSTEM: true,
    IMPACT: true,
  });

  // Automatically keep the category containing the active tab expanded
  useEffect(() => {
    const parentGroup = rawNavGroups.find((g) => g.items.some((i) => i.id === currentTab));
    if (parentGroup && !expandedGroups[parentGroup.category]) {
      setExpandedGroups((prev) => ({ ...prev, [parentGroup.category]: true }));
    }
  }, [currentTab]);

  const toggleGroup = (category: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-white border-r border-slate-200/90 text-slate-700 transition-all duration-300 select-none shadow-2xs ${
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
      <div className="h-20 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-center px-2">
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

      {/* Navigation Sub-Divisions (Scrollbar Hidden) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {rawNavGroups.map((group) => {
          const CategoryIcon = group.icon;
          const isGroupActive = group.items.some((i) => i.id === currentTab);
          const isExpanded = expandedGroups[group.category] ?? true;

          return (
            <div key={group.category} className="rounded-xl transition-colors">
              {!isCollapsed ? (
                <div>
                  {/* Category Header with Sub-Division Toggle */}
                  <button
                    onClick={() => toggleGroup(group.category)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                      isGroupActive
                        ? 'text-[#ea580c] bg-orange-50/70 border border-orange-200/80'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CategoryIcon className={`w-3.5 h-3.5 shrink-0 ${isGroupActive ? 'text-[#ff4405]' : 'text-slate-400'}`} />
                      <span className="truncate">{group.category}</span>
                      {isGroupActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4405] animate-pulse shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700 font-bold">
                        {group.items.length}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-0 text-slate-600' : '-rotate-90 text-slate-400'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Nested Sub-Divisions Tree with Left Connector Line */}
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
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer relative ${
                              isActive
                                ? 'bg-[#121417] text-white font-extrabold shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#ff4405]' : 'text-slate-400'}`} />
                            <span className="truncate flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`px-2 py-0.2 rounded-full text-[9px] font-mono font-bold ${
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
                /* Collapsed View: Group Icon Separator & Sub-item Icons */
                <div className="space-y-1 py-1 border-b border-slate-100 last:border-b-0">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        title={`${group.category} › ${item.label}`}
                        className={`w-full flex items-center justify-center p-2.5 rounded-xl text-xs transition-all cursor-pointer relative ${
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

      {/* Footer Node Summary */}
      <div className="p-2 border-t border-slate-200/80 bg-slate-50/60">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700 font-bold">Telemetry Fleet</span>
            </div>
            <span className="font-mono text-[#ff4405] font-black">5 NODES</span>
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


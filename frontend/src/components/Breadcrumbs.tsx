import React from 'react';
import {
  ChevronRight,
  Home,
  ShieldAlert,
  FileSpreadsheet,
  CheckSquare,
  AlertTriangle,
  Radio,
  MapPin,
  BrainCircuit,
  Boxes,
  FlaskConical,
  Server,
  ArrowLeft,
} from 'lucide-react';
import type { NavigationTab } from '../types';

interface BreadcrumbsProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  activeSituation?: {
    id: string;
    severity: string;
    location: string;
  } | null;
  activeIncidentCount?: number;
  criticalAlertCount?: number;
}

interface CrumbItem {
  id?: NavigationTab;
  label: string;
  icon?: React.ElementType;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentTab,
  onNavigate,
  activeSituation,
  activeIncidentCount = 0,
  criticalAlertCount = 0,
}) => {
  const getCrumbs = (): { category?: string; crumbs: CrumbItem[] } => {
    switch (currentTab) {
      case 'dashboard':
        return {
          category: 'CORE',
          crumbs: [{ label: 'Command Center', icon: Home }],
        };
      case 'live-monitoring':
        return {
          category: 'OPERATIONS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Live Operations', icon: Radio },
          ],
        };
      case 'alerts':
        return {
          category: 'OPERATIONS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Alerts & Early Warning', icon: AlertTriangle },
          ],
        };
      case 'live-map':
        return {
          category: 'OPERATIONS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Full GIS Map', icon: MapPin },
          ],
        };

      // Intelligence
      case 'ai-explainability':
        return {
          category: 'INTELLIGENCE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Intelligence' },
            { label: 'AI Explainability (SHAP)', icon: BrainCircuit },
          ],
        };
      case 'anomalies':
        return {
          category: 'INTELLIGENCE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Intelligence' },
            { label: 'Sensor Drift & Anomalies' },
          ],
        };
      case 'analytics-trends':
        return {
          category: 'INTELLIGENCE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Intelligence' },
            { label: 'Analytics & Spatiotemporal Trends' },
          ],
        };
      case 'risk-map':
        return {
          category: 'INTELLIGENCE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Intelligence' },
            { label: 'Multi-Hazard Risk Map' },
          ],
        };

      // Infrastructure
      case 'sensor-network':
        return {
          category: 'INFRASTRUCTURE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Infrastructure', icon: Boxes },
            { label: 'Sensor Fleet Inventory' },
          ],
        };
      case 'sensor-health':
        return {
          category: 'INFRASTRUCTURE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Infrastructure' },
            { label: 'Hardware Health Diagnostics' },
          ],
        };
      case 'network-topology':
        return {
          category: 'INFRASTRUCTURE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Infrastructure' },
            { label: 'LoRa Mesh Topology' },
          ],
        };
      case 'data-quality':
        return {
          category: 'INFRASTRUCTURE',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Infrastructure' },
            { label: 'Data Quality & Trust Score' },
          ],
        };

      // Tools
      case 'simulation':
        return {
          category: 'TOOLS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Tools', icon: FlaskConical },
            { label: 'Disaster Scenario Simulator' },
          ],
        };
      case 'digital-twin':
        return {
          category: 'TOOLS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Tools' },
            { label: '3D Spatiotemporal Digital Twin' },
          ],
        };
      case 'hardware-simulator':
        return {
          category: 'TOOLS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Tools' },
            { label: 'Virtual Hardware Simulator' },
          ],
        };

      // Administration
      case 'configuration':
        return {
          category: 'ADMINISTRATION',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Administration', icon: Server },
            { label: 'Thresholds & System Config' },
          ],
        };
      case 'system-health':
        return {
          category: 'ADMINISTRATION',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Administration' },
            { label: 'System Observability & Latencies' },
          ],
        };
      case 'audit-logs':
        return {
          category: 'ADMINISTRATION',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Administration' },
            { label: 'Immutable Audit Log' },
          ],
        };
      case 'settings':
        return {
          category: 'ADMINISTRATION',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Administration' },
            { label: 'User Preferences & Settings' },
          ],
        };
      case 'impact':
        return {
          category: 'ADMINISTRATION',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { label: 'Administration' },
            { label: 'Sustainability & Ecological Impact' },
          ],
        };

      // Contextual Emergency Operations Screens
      case 'situation-room':
        return {
          category: 'ACTIVE SITUATION',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            {
              label: activeSituation
                ? `Situation Room [${activeSituation.id}]`
                : 'Situation Room (War Room)',
              icon: ShieldAlert,
            },
          ],
        };
      case 'incidents':
        return {
          category: 'INCIDENT OPERATIONS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            ...(activeSituation ? [{ id: 'situation-room' as NavigationTab, label: 'Situation Room' }] : []),
            { label: 'Active Incident Management', icon: FileSpreadsheet },
          ],
        };
      case 'response':
        return {
          category: 'EMERGENCY PROTOCOLS',
          crumbs: [
            { id: 'dashboard', label: 'Command Center', icon: Home },
            ...(activeSituation ? [{ id: 'situation-room' as NavigationTab, label: 'Situation Room' }] : []),
            { id: 'incidents', label: 'Incidents', icon: FileSpreadsheet },
            { label: 'AI Response Recommendations & Dispatch', icon: CheckSquare },
          ],
        };

      default:
        return {
          crumbs: [{ label: 'Command Center', icon: Home }],
        };
    }
  };

  const { category, crumbs } = getCrumbs();
  const previousCrumb = crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
      {/* Left: Interactive Navigation Trail */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        {/* Quick Back Button when deep in hierarchy */}
        {previousCrumb && previousCrumb.id && (
          <button
            onClick={() => onNavigate(previousCrumb.id!)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer mr-1"
            title={`Back to ${previousCrumb.label}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Back</span>
          </button>
        )}

        {category && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600 tracking-wider">
            {category}
          </span>
        )}

        <nav className="flex items-center gap-1.5 font-medium text-slate-600 flex-wrap">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            const Icon = crumb.icon;

            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {isLast || !crumb.id ? (
                  <span className={`flex items-center gap-1.5 ${isLast ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                    {Icon && <Icon className="w-3.5 h-3.5 text-[#ff4405] shrink-0" />}
                    <span className="truncate max-w-[200px] sm:max-w-none">{crumb.label}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onNavigate(crumb.id!)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer hover:underline"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>{crumb.label}</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Live Operational Status Badges */}
      <div className="flex items-center gap-2 shrink-0">
        {criticalAlertCount > 0 && (
          <button
            onClick={() => onNavigate('alerts')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-[10px] animate-pulse cursor-pointer hover:bg-rose-100 transition-colors"
            title="View Critical Alerts"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Critical ({criticalAlertCount})</span>
          </button>
        )}

        {activeSituation && (
          <button
            onClick={() => onNavigate('situation-room')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-300 text-[#ea580c] font-mono font-bold text-[10px] cursor-pointer hover:bg-orange-100 transition-colors shadow-2xs"
            title="Open Active Situation Room"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff4405]" />
            <span>Active Situation: {activeSituation.id}</span>
          </button>
        )}

        {activeIncidentCount > 0 && (
          <button
            onClick={() => onNavigate('incidents')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white font-mono font-bold text-[10px] cursor-pointer hover:bg-zinc-800 transition-colors shadow-2xs"
            title="Open Incident Management"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-orange-400" />
            <span>Incidents ({activeIncidentCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

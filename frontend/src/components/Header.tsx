import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Users, LogOut, CheckCircle2, Flame, Waves, Wind, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { DashboardSummary, Alert, NavigationTab } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  summary: DashboardSummary | null;
  isConnected?: boolean;
  lastUpdateTime?: Date | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  isOfflineSimulated?: boolean;
  onSwitchToPublic?: () => void;
  onLogout?: () => void;
  alerts?: Alert[];
  onAcknowledgeAlert?: (id: number) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  onSwitchToPublic,
  onLogout,
  alerts = [],
  onAcknowledgeAlert,
  onNavigateTab,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const displayAlerts = alerts.slice(0, 5);

  const getRiskIcon = (riskType: string) => {
    switch (riskType.toUpperCase()) {
      case 'FIRE':
        return <Flame className="w-3.5 h-3.5 text-[#ff4405]" />;
      case 'FLOOD':
        return <Waves className="w-3.5 h-3.5 text-cyan-600" />;
      case 'POLLUTION':
        return <Wind className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 pt-3 pb-2 px-4 lg:px-6">
      <div className="max-w-[1600px] mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-5 lg:px-7 py-3 transition-all shadow-2xs">
        <div className="flex items-center justify-between gap-4">

          {/* Left: Brand Identity & SIH Project Badges */}
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="TerraSentinel Logo"
              className="h-12 sm:h-14 lg:h-16 w-auto object-contain drop-shadow-sm py-0.5"
            />
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#121417] text-white tracking-wider shadow-xs hidden sm:inline-block">
              AGENCY COMMAND
            </span>
          </div>

          {/* Right: Switch to Public Portal, Theme Toggle, Notification & Logout */}
          <div className="flex items-center gap-2.5">
            
            {/* Switch to Public Community Portal */}
            {onSwitchToPublic && (
              <button
                onClick={onSwitchToPublic}
                id="btn-switch-public-portal"
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] border border-orange-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Open Public Environmental Portal"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Portal</span>
              </button>
            )}

            {/* Theme Mode Toggle (Bright / Dark) */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 cursor-pointer transition-all shadow-2xs"
              title={`Switch to ${theme === 'bright' ? 'Dark' : 'Bright'} Mode`}
              aria-label="Toggle Bright/Dark Mode"
            >
              <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-all ${
                theme === 'bright'
                  ? 'bg-white text-amber-600 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}>
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline">Bright</span>
              </div>
              <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-[#121417] text-[#ff4405] shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}>
                <Moon className="w-3.5 h-3.5 text-[#ff4405] fill-[#ff4405]" />
                <span className="hidden sm:inline">Dark</span>
              </div>
            </button>

            {/* Notification Bell Dropdown Button */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                id="btn-header-notifications"
                className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  showNotifications
                    ? 'bg-[#121417] text-white border-zinc-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
                title="Notifications & Incident Alerts"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unacknowledgedAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff4405] text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unacknowledgedAlerts.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Flyout */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Alert Notifications
                      </span>
                      {unacknowledgedAlerts.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {unacknowledgedAlerts.length} Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Clear
                        </span>
                      )}
                    </div>
                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigateTab('alerts');
                        }}
                        className="text-[11px] text-[#ff4405] hover:text-[#ea580c] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Alert Center <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* List of Alerts */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {displayAlerts.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs space-y-1">
                        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                        <div className="font-bold text-slate-700">All Sectors Operational</div>
                        <div className="text-[11px]">No active hazard alerts detected</div>
                      </div>
                    ) : (
                      displayAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            alert.acknowledged
                              ? 'bg-slate-50/70 border-slate-200 opacity-70'
                              : 'bg-orange-50/30 border-orange-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {getRiskIcon(alert.risk_type)}
                              <span className="font-mono font-bold text-slate-900 text-[11px]">
                                {alert.node_id}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                                alert.severity === 'HIGH' ? 'bg-orange-100 text-[#ea580c]' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>

                            {!alert.acknowledged && onAcknowledgeAlert && (
                              <button
                                onClick={() => onAcknowledgeAlert(alert.id)}
                                className="px-2 py-0.5 rounded-lg bg-[#121417] hover:bg-zinc-800 text-white text-[10px] font-bold cursor-pointer transition-all shadow-2xs"
                              >
                                Triage
                              </button>
                            )}
                            {alert.acknowledged && (
                              <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1.5 leading-snug line-clamp-2">
                            {alert.message}
                          </p>
                          <div className="text-[9px] font-mono text-slate-400 mt-1 text-right">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer Actions */}
                  {onNavigateTab && (
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigateTab('situation-room');
                        }}
                        className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                      >
                        Situation Room
                      </button>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigateTab('incidents');
                        }}
                        className="py-1.5 px-2 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white font-bold transition-all cursor-pointer"
                      >
                        Incident Registry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout / Switch Role */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all cursor-pointer border border-slate-200"
                title="Return to Gateway Login"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};


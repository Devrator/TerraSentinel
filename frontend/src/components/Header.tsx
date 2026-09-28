import React from 'react';
import { Bell, Sun, Moon, Users, LogOut } from 'lucide-react';
import type { DashboardSummary } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  summary: DashboardSummary | null;
  isConnected?: boolean;
  lastUpdateTime?: Date | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  onTriggerDemo?: () => void;
  isDemoRunning?: boolean;
  isOfflineSimulated?: boolean;
  onSwitchToPublic?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ summary, onSwitchToPublic, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 pt-3 pb-2 px-4 lg:px-6">
      <div className="max-w-[1600px] mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-5 lg:px-7 py-3 transition-all shadow-2xs">
        <div className="flex items-center justify-between gap-4">

          {/* Left: Brand Identity & SIH Project Badges */}
          <div className="flex items-center gap-3">
            {/* Flame Accent Icon */}
            <div className="w-8 h-8 rounded-xl bg-[#ff4405] text-white flex items-center justify-center font-black text-sm shadow-xs shadow-orange-500/30 shrink-0">
              <span className="tracking-tighter">TS</span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  TerraSentinel
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#121417] text-white tracking-wider">
                  AGENCY COMMAND
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
                Distributed Edge Environmental Intelligence & Early Warning
              </span>
            </div>
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

            {/* Notification Bell Button */}
            <div className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 cursor-pointer transition-all shadow-2xs">
              <Bell className="w-4 h-4" />
              {(summary?.active_alerts ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff4405] ring-2 ring-white animate-pulse" />
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

import React, { useState } from 'react';
import { Lock, CheckCircle2, Shield, Sun, Moon, Palette, Activity, Trash2, Download, RefreshCw, Server, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'OPERATOR' | 'VIEWER'>('OPERATOR');
  const { theme, setTheme } = useTheme();

  const [testingPing, setTestingPing] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{
    latencyMs: number;
    status: string;
    services: any;
  } | null>(null);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

  const handleTestApiPing = async () => {
    try {
      setTestingPing(true);
      const start = performance.now();
      const health = await api.getSystemHealth();
      const latency = Math.round(performance.now() - start);
      setPingResult({
        latencyMs: latency,
        status: health.services?.backend?.status || 'ONLINE',
        services: health.services,
      });
    } catch (err: any) {
      console.error(err);
      setPingResult({
        latencyMs: 999,
        status: 'ERROR',
        services: null,
      });
    } finally {
      setTestingPing(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('ts_user_role');
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const handleExportDiagnostics = async () => {
    try {
      const [summary, health, config, topology] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getSystemHealth().catch(() => null),
        api.getConfiguration().catch(() => null),
        api.getNetworkTopology().catch(() => null),
      ]);

      const bundle = {
        diagnostics_title: 'TerraSentinel System Diagnostics Bundle',
        timestamp: new Date().toISOString(),
        client_theme: theme,
        active_role: selectedRole,
        dashboard_summary: summary,
        system_health: health,
        active_configuration: config,
        network_topology: topology,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `terrasentinel-diagnostics-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Access Control & Platform Settings</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#121417] text-white font-bold">
                SIH26178 RBAC
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Role-based authorization architecture (RBAC), theme preferences, and platform diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDiagnostics}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download full platform diagnostics dump"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Export Diagnostics
          </button>
        </div>
      </div>

      {/* Theme Selection Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#ff4405]" /> Display Theme & Visual Interface Mode
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bright Mode Card */}
          <button
            onClick={() => setTheme('bright')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              theme === 'bright'
                ? 'bg-orange-50/60 border-[#ff4405] ring-2 ring-[#ff4405]/20 text-slate-900 shadow-xs'
                : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Bright Light Mode</span>
                </div>
                {theme === 'bright' && <CheckCircle2 className="w-5 h-5 text-[#ff4405]" />}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mt-2">
                Crisp #f4f5f8 canvas with pure white surface cards, soft pastel status badges, and signature electric flame orange accents.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                theme === 'bright' ? 'bg-[#ff4405] text-white border-[#ff4405]' : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                {theme === 'bright' ? 'Active Theme' : 'Select'}
              </span>
            </div>
          </button>

          {/* Dark Mode Card */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              theme === 'dark'
                ? 'bg-orange-50/60 border-[#ff4405] ring-2 ring-[#ff4405]/20 text-slate-900 shadow-xs'
                : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[#ff4405]">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Obsidian Dark Mode</span>
                </div>
                {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-[#ff4405]" />}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mt-2">
                Deep #090a0c obsidian canvas with dark luminescent telemetry cards, dark inverted map tiles, and glowing neon accents.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                theme === 'dark' ? 'bg-[#ff4405] text-white border-[#ff4405]' : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                {theme === 'dark' ? 'Active Theme' : 'Select'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Live Server Diagnostics & Ping Tester */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ff4405]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Live Backend Connectivity & Ping Test
            </h3>
          </div>
          <button
            onClick={handleTestApiPing}
            disabled={testingPing}
            className="px-4 py-2 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin text-[#ff4405]' : ''}`} />
            <span>{testingPing ? 'Testing Roundtrip...' : 'Ping API Server'}</span>
          </button>
        </div>

        {pingResult && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#ff4405]" />
                <span className="font-semibold text-slate-700">Server Health:</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">{pingResult.status}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-700">Client RTT Latency:</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{pingResult.latencyMs} ms</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-700">Database Engine:</span>
              </div>
              <span className="font-mono font-bold text-purple-700">{pingResult.services?.database?.status || 'CONNECTED'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Role-Based Access Architecture */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Role-Based Access Control (RBAC) Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              role: 'ADMIN',
              title: 'Command Administrator',
              desc: 'Full read/write permissions. Modify thresholds, manage node deployments, purge database records.',
              badge: 'Full Access',
            },
            {
              role: 'OPERATOR',
              title: 'Incident Operator',
              desc: 'Operational access. Acknowledge alerts, triage incidents, trigger response protocols, assign notes.',
              badge: 'Operational Mode (Active)',
            },
            {
              role: 'VIEWER',
              title: 'Read-Only Observer',
              desc: 'Public/Stakeholder mode. Read-only dashboard telemetry, maps, and historical trend inspection.',
              badge: 'Read Only',
            },
          ].map((r) => {
            const isSelected = selectedRole === r.role;

            return (
              <button
                key={r.role}
                onClick={() => setSelectedRole(r.role as any)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-orange-50/60 border-[#ff4405] ring-2 ring-[#ff4405]/20 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">{r.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#ff4405]" />}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{r.desc}</p>
                </div>

                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold self-start border ${
                  isSelected ? 'bg-[#ff4405] text-white border-[#ff4405]' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {r.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Local Storage & Cache Management */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" /> Client Session & Cache Control
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Clear locally cached gateway role selections and reset client state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cacheCleared && (
            <span className="text-xs font-mono text-emerald-700 font-bold">Cache Cleared!</span>
          )}
          <button
            onClick={handleClearCache}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Local Session Cache
          </button>
        </div>
      </div>

      {/* Security & Endpoint Secrets Policy */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" /> Zero-Secret Environment Policy
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          In accordance with production security standards, all sensitive credentials (database strings, JWT secrets, and IoT master keys) are strictly managed through server-side environment variables (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-900 border border-slate-200">.env</code>) and are never exposed to client-side bundles.
        </p>
      </div>
    </div>
  );
};

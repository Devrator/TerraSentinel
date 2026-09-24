import React, { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'OPERATOR' | 'VIEWER'>('OPERATOR');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Access Control & Platform Settings</h2>
            <p className="text-xs text-slate-400">
              Role-based authorization architecture (RBAC), ingestion API credentials, and platform security
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Access Architecture */}
      <div className="p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
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
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-xs'
                    : 'bg-[#07110F] border-[#1B2D27] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{r.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold self-start ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#101D19] text-slate-500'
                }`}>
                  {r.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security & Endpoint Secrets Policy */}
      <div className="p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Zero-Secret Environment Policy
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          In accordance with production security standards, all sensitive credentials (database strings, JWT secrets, and IoT master keys) are strictly managed through server-side environment variables (<code>.env</code>) and are never exposed to client-side bundles.
        </p>
      </div>
    </div>
  );
};

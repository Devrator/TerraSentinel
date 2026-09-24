import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AuditLogEntry } from '../types';
import { ClipboardList, RefreshCw } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterEntity, setFilterEntity] = useState<string>('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs(50);
      setLogs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    if (filterEntity !== 'ALL' && l.entity !== filterEntity) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">System & Operator Audit Trail</h2>
            <p className="text-xs text-slate-400">
              Immutable chronological record of operator acknowledgements, incident updates, and AI state transitions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Entities</option>
            <option value="INCIDENT">Incident</option>
            <option value="ALERT">Alert</option>
            <option value="SENSOR_NODE">Sensor Node</option>
            <option value="SIMULATION">Simulation</option>
          </select>

          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 rounded-xl bg-[#07110F] hover:bg-[#182B24] text-slate-300 hover:text-white border border-[#1B2D27] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1B2D27] text-[10px] font-mono text-slate-400 uppercase">
                <th className="pb-3 px-3">Timestamp (UTC)</th>
                <th className="pb-3 px-3">Actor</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Entity</th>
                <th className="pb-3 px-3">State Transition</th>
                <th className="pb-3 px-3">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2D27]/60 font-medium text-slate-300">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#07110F]/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-400">{log.actor}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#07110F] border border-[#1B2D27] text-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {log.entity} ({log.entity_id})
                    </td>
                    <td className="py-3 px-3">
                      {log.previous_state && log.new_state ? (
                        <span className="text-[11px] font-mono text-slate-400">
                          {log.previous_state} → <strong className="text-white">{log.new_state}</strong>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                      {log.details || '--'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-slate-500">
                    No audit log records found for the selected entity filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

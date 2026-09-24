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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">System & Operator Audit Trail</h2>
            <p className="text-xs text-slate-500 font-medium">
              Immutable chronological record of operator acknowledgements, incident updates, and AI state transitions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Entities</option>
            <option value="INCIDENT">Incident</option>
            <option value="ALERT">Alert</option>
            <option value="SENSOR_NODE">Sensor Node</option>
            <option value="SIMULATION">Simulation</option>
          </select>

          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase bg-slate-50/70 font-semibold">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">State Transition</th>
                <th className="py-2.5 px-3">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-700">{log.actor}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {log.entity} ({log.entity_id})
                    </td>
                    <td className="py-3 px-3">
                      {log.previous_state && log.new_state ? (
                        <span className="text-[11px] font-mono text-slate-500">
                          {log.previous_state} → <strong className="text-slate-900 font-bold">{log.new_state}</strong>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate font-medium">
                      {log.details || '--'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-slate-400 font-medium">
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

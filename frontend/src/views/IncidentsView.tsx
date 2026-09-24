import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Incident, SensorNode } from '../types';
import { FileSpreadsheet, RefreshCw, Send } from 'lucide-react';

interface IncidentsViewProps {
  nodes?: SensorNode[];
}

export const IncidentsView: React.FC<IncidentsViewProps> = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [noteInput, setNoteInput] = useState<string>('');
  const [operatorInput, setOperatorInput] = useState<string>('');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.getIncidents({ limit: 50 });
      setIncidents(res);
      if (res.length > 0 && !selectedIncident) {
        setSelectedIncident(res[0]);
      } else if (selectedIncident) {
        const updated = res.find((i) => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedIncident) return;
    try {
      const updated = await api.updateIncident(selectedIncident.id, {
        status,
        note: `Status updated to ${status}`
      });
      setSelectedIncident(updated);
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !noteInput.trim()) return;
    try {
      const updated = await api.updateIncident(selectedIncident.id, {
        note: noteInput.trim(),
        assigned_operator: operatorInput.trim() || undefined
      });
      setSelectedIncident(updated);
      setNoteInput('');
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Incident Management</h2>
            <p className="text-xs text-slate-400">
              Operational trackable incident workflow, operator logs, and resolution lifecycles
            </p>
          </div>
        </div>

        <button
          onClick={fetchIncidents}
          className="px-3 py-1.5 rounded-xl bg-[#07110F] hover:bg-[#182B24] text-slate-300 hover:text-white border border-[#1B2D27] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} /> Sync Incidents
        </button>
      </div>

      {/* Main 2-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Incidents Registry List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] flex items-center justify-between text-xs text-slate-400">
            <span>ACTIVE INCIDENTS ({incidents.length})</span>
            <span className="text-[10px] font-mono text-emerald-400">AUTO-CORRELATED</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
            {incidents.length > 0 ? (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isCrit = inc.severity === 'CRITICAL';

                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-xs'
                        : 'bg-[#101D19] border-[#1B2D27] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {inc.incident_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : (isCrit ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300')
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white truncate mb-1">
                      {inc.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Node: <strong className="text-slate-200">{inc.origin_node_id}</strong></span>
                      <span>Risk: <strong className="text-rose-400 font-mono">{inc.current_risk.toFixed(1)}%</strong></span>
                      <span>Operator: <strong className="text-slate-200">{inc.assigned_operator}</strong></span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
                No active incidents recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Incident Detailed File & Operations */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-4">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1B2D27]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-emerald-400">{selectedIncident.incident_number}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#07110F] text-slate-300 border border-[#1B2D27]">
                      {selectedIncident.risk_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedIncident.title}</h3>
                </div>

                {/* Status Changer Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {['ACKNOWLEDGED', 'INVESTIGATING', 'ESCALATED', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        selectedIncident.status === st
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-[#07110F] hover:bg-[#182B24] text-slate-400 hover:text-white border-[#1B2D27]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                  <div className="text-[10px] text-slate-500">Origin Node</div>
                  <div className="font-mono font-bold text-white text-sm">{selectedIncident.origin_node_id}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                  <div className="text-[10px] text-slate-500">Current Risk</div>
                  <div className="font-mono font-bold text-rose-400 text-sm">{selectedIncident.current_risk.toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                  <div className="text-[10px] text-slate-500">Severity</div>
                  <div className="font-mono font-bold text-amber-400 text-sm">{selectedIncident.severity}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27]">
                  <div className="text-[10px] text-slate-500">Assigned Operator</div>
                  <div className="font-bold text-emerald-400 text-sm truncate">{selectedIncident.assigned_operator}</div>
                </div>
              </div>

              {/* Evidence Snapshot */}
              {selectedIncident.evidence_snapshot && (
                <div className="p-3 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Telemetry Evidence</span>
                  <code className="text-emerald-400 font-mono text-xs">{selectedIncident.evidence_snapshot}</code>
                </div>
              )}

              {/* Operator Notes & Incident Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Incident Audit Log & Operator Notes
                </h4>
                <div className="p-3.5 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
                  {selectedIncident.notes || 'No operational notes attached.'}
                </div>
              </div>

              {/* Add Note / Assign Operator Form */}
              <form onSubmit={handleAddNote} className="space-y-2.5 pt-2 border-t border-[#1B2D27]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Assign Operator (e.g. Officer Sharma)"
                    value={operatorInput}
                    onChange={(e) => setOperatorInput(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Add operational action note..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#07110F] border border-[#1B2D27] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Append Note & Update
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#101D19] border border-[#1B2D27] text-xs text-slate-500">
              Select an incident from the registry to view details and operational timeline.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

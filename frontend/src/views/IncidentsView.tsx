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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Incident Management</h2>
            <p className="text-xs text-slate-500 font-medium">
              Operational trackable incident workflow, operator logs, and resolution lifecycles
            </p>
          </div>
        </div>

        <button
          onClick={fetchIncidents}
          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} /> Sync Incidents
        </button>
      </div>

      {/* Main 2-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Incidents Registry List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs font-bold text-slate-700">
            <span>ACTIVE INCIDENTS ({incidents.length})</span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">AUTO-CORRELATED</span>
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
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        {inc.incident_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : (isCrit ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200')
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 truncate mb-1">
                      {inc.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Node: <strong className="text-slate-800">{inc.origin_node_id}</strong></span>
                      <span>Risk: <strong className="text-rose-600 font-mono">{inc.current_risk.toFixed(1)}%</strong></span>
                      <span>Operator: <strong className="text-slate-800">{inc.assigned_operator}</strong></span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium rounded-xl bg-white border border-slate-200 shadow-2xs">
                No active incidents recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Incident Detailed File & Operations */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-emerald-700">{selectedIncident.incident_number}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedIncident.risk_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedIncident.title}</h3>
                </div>

                {/* Status Changer Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {['ACKNOWLEDGED', 'INVESTIGATING', 'ESCALATED', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        selectedIncident.status === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Origin Node</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{selectedIncident.origin_node_id}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Current Risk</div>
                  <div className="font-mono font-bold text-rose-600 text-sm">{selectedIncident.current_risk.toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Severity</div>
                  <div className="font-mono font-bold text-amber-700 text-sm">{selectedIncident.severity}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Assigned Operator</div>
                  <div className="font-bold text-emerald-700 text-sm truncate">{selectedIncident.assigned_operator}</div>
                </div>
              </div>

              {/* Evidence Snapshot */}
              {selectedIncident.evidence_snapshot && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Telemetry Evidence</span>
                  <code className="text-emerald-700 font-mono text-xs font-medium">{selectedIncident.evidence_snapshot}</code>
                </div>
              )}

              {/* Operator Notes & Incident Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Incident Audit Log & Operator Notes
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
                  {selectedIncident.notes || 'No operational notes attached.'}
                </div>
              </div>

              {/* Add Note / Assign Operator Form */}
              <form onSubmit={handleAddNote} className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Assign Operator (e.g. Officer Sharma)"
                    value={operatorInput}
                    onChange={(e) => setOperatorInput(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Add operational action note..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Append Note & Update
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-400 font-medium">
              Select an incident from the registry to view details and operational timeline.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Incident, SensorNode, IncidentDispatchResult } from '../types';
import { FileSpreadsheet, RefreshCw, Send, AlertTriangle, UserCheck } from 'lucide-react';

interface IncidentsViewProps {
  nodes?: SensorNode[];
}

export const IncidentsView: React.FC<IncidentsViewProps> = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [noteInput, setNoteInput] = useState<string>('');
  const [operatorInput, setOperatorInput] = useState<string>('');
  const [dispatchLoading, setDispatchLoading] = useState<boolean>(false);
  const [lastDispatch, setLastDispatch] = useState<IncidentDispatchResult | null>(null);

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

  const handleSimulatedDispatch = async (agency: string) => {
    if (!selectedIncident) return;
    try {
      setDispatchLoading(true);
      const res = await api.dispatchIncident(selectedIncident.id, {
        agency,
        operator_name: operatorInput.trim() || 'Central Command',
        priority: selectedIncident.severity,
      });
      setLastDispatch(res);
      fetchIncidents();
    } catch (err) {
      console.error('Simulated dispatch failed:', err);
    } finally {
      setDispatchLoading(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Incident Lifecycle Management</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#121417] text-white">
                SIH26178 OPS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Operational trackable incident workflow, operator logs, and resolution lifecycles
            </p>
          </div>
        </div>

        <button
          onClick={fetchIncidents}
          className="px-4 py-2 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4405]' : 'text-slate-400'}`} /> Sync Incidents
        </button>
      </div>

      {/* Main 2-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Incidents Registry List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="flex items-center gap-2">
              <span>ACTIVE INCIDENTS</span>
              <span className="px-2 py-0.5 rounded-full bg-[#121417] text-white font-mono text-[10px]">
                {incidents.length}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              AUTO-CORRELATED
            </span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {incidents.length > 0 ? (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isCrit = inc.severity === 'CRITICAL';
                const isHigh = inc.severity === 'HIGH';

                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/50 border-[#ff4405] ring-2 ring-[#ff4405]/20 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#121417]">
                        {inc.incident_number}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : (isCrit ? 'bg-rose-50 text-rose-700 border-rose-200' : isHigh ? 'bg-orange-50 text-[#ea580c] border-orange-200' : 'bg-amber-50 text-amber-700 border-amber-200')
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 truncate mb-2">
                      {inc.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                      <span>Node: <strong className="text-slate-900 font-mono font-bold">{inc.origin_node_id}</strong></span>
                      <span>Risk: <strong className="text-rose-600 font-mono font-bold">{inc.current_risk.toFixed(1)}%</strong></span>
                      <span className="truncate max-w-[110px]">Op: <strong className="text-slate-800">{inc.assigned_operator || 'Unassigned'}</strong></span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 font-medium rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                No active incidents recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Incident Detailed File & Operations */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#ff4405]">{selectedIncident.incident_number}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedIncident.risk_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedIncident.title}</h3>
                </div>

                {/* Status Changer Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {['ACKNOWLEDGED', 'INVESTIGATING', 'ESCALATED', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        selectedIncident.status === st
                          ? 'bg-[#121417] text-white border-[#121417] shadow-xs'
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
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 font-medium">Origin Node</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedIncident.origin_node_id}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 font-medium">Current Threat</div>
                  <div className="font-mono font-bold text-rose-600 text-sm mt-0.5">{selectedIncident.current_risk.toFixed(1)}%</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 font-medium">Severity</div>
                  <div className="font-mono font-bold text-[#ea580c] text-sm mt-0.5">{selectedIncident.severity}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 font-medium">Assigned Officer</div>
                  <div className="font-bold text-slate-900 text-sm truncate mt-0.5">{selectedIncident.assigned_operator || 'Command'}</div>
                </div>
              </div>

              {/* Emergency Response Dispatch Simulator Layer */}
              <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff4405] animate-pulse" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Emergency Agency Dispatch Simulator
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#121417] text-white">
                    SIMULATED DISPATCH TESTBENCH
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Transmit structured incident telemetry & SOP response orders to regional emergency response agencies.
                </p>

                {/* Agency Selection Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'SDMA', name: 'SDMA Authority', desc: 'State Disaster Mgmt' },
                    { id: 'FIRE_RESCUE', name: 'Fire & Rescue', desc: 'Hazmat / Thermal' },
                    { id: 'POLICE', name: 'Police Control', desc: 'Cordon & Perimeter' },
                    { id: 'AMBULANCE_108', name: '108 Ambulance', desc: 'EMS & Casualty' },
                  ].map((ag) => (
                    <button
                      key={ag.id}
                      type="button"
                      onClick={() => handleSimulatedDispatch(ag.id)}
                      disabled={dispatchLoading}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#ff4405] hover:bg-orange-50/50 text-left transition-all cursor-pointer shadow-2xs group"
                    >
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#ff4405]">{ag.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{ag.desc}</div>
                      <div className="mt-1.5 text-[9px] font-mono font-bold text-[#ff4405] flex items-center gap-1">
                        Dispatch &rarr;
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Dispatch Feedback */}
                {lastDispatch && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Dispatched to {lastDispatch.agency_name}
                      </span>
                      <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        REF: {lastDispatch.dispatch_id}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      {lastDispatch.message} — Estimated Unit Response ETA: <strong className="font-mono font-bold">{lastDispatch.estimated_eta_minutes} mins</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence Snapshot */}
              {selectedIncident.evidence_snapshot && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Corroborating Telemetry Evidence</span>
                  <code className="text-[#ea580c] font-mono text-xs font-bold block">{selectedIncident.evidence_snapshot}</code>
                </div>
              )}

              {/* Operator Notes & Incident Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Incident Audit Log & Operator Notes</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">APPEND-ONLY LOG</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap scrollbar-thin leading-relaxed">
                  {selectedIncident.notes || 'No operational notes attached.'}
                </div>
              </div>

              {/* Add Note / Assign Operator Form */}
              <form onSubmit={handleAddNote} className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="relative">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Assign Operator..."
                      value={operatorInput}
                      onChange={(e) => setOperatorInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4405] focus:ring-1 focus:ring-[#ff4405]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Add operational action note..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4405] focus:ring-1 focus:ring-[#ff4405]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Append Note & Update Incident
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs text-slate-400 font-medium space-y-2">
              <AlertTriangle className="w-6 h-6 text-slate-300 mx-auto" />
              <p>Select an incident from the registry to view details and operational timeline.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

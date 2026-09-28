import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Sliders, Save, CheckCircle2, RotateCcw, Download, Upload, Sparkles } from 'lucide-react';

export const ConfigurationView: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchConfig = async () => {
    try {
      const res = await api.getConfiguration();
      setConfig(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await api.updateConfiguration(config);
      setSavedSuccess('Configuration saved successfully!');
      setTimeout(() => setSavedSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  const handleResetDefaults = async () => {
    const defaultConfig = {
      risk_thresholds: {
        fire_critical: 75,
        flood_critical: 75,
        pollution_critical: 75,
      },
      sensor_settings: {
        sampling_interval_seconds: 30,
        heartbeat_timeout_seconds: 90,
      },
      alert_rules: {
        cooldown_seconds: 120,
        auto_escalate_critical: true,
      },
    };
    setConfig(defaultConfig);
    try {
      await api.updateConfiguration(defaultConfig);
      setSavedSuccess('Reset to factory operational defaults!');
      setTimeout(() => setSavedSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to reset config:', err);
    }
  };

  const handleApplyPreset = (presetType: 'ARID' | 'MONSOON' | 'INDUSTRIAL') => {
    if (!config) return;
    let newConfig = { ...config };
    if (presetType === 'ARID') {
      newConfig.risk_thresholds.fire_critical = 65; // lower fire trigger threshold for high sensitivity
      newConfig.risk_thresholds.flood_critical = 85;
      newConfig.risk_thresholds.pollution_critical = 75;
      newConfig.sensor_settings.sampling_interval_seconds = 15;
    } else if (presetType === 'MONSOON') {
      newConfig.risk_thresholds.fire_critical = 85;
      newConfig.risk_thresholds.flood_critical = 60; // lower flood trigger threshold
      newConfig.risk_thresholds.pollution_critical = 75;
      newConfig.sensor_settings.sampling_interval_seconds = 10;
    } else if (presetType === 'INDUSTRIAL') {
      newConfig.risk_thresholds.fire_critical = 70;
      newConfig.risk_thresholds.flood_critical = 80;
      newConfig.risk_thresholds.pollution_critical = 55; // ultra-sensitive air quality trigger
      newConfig.sensor_settings.sampling_interval_seconds = 15;
    }
    setConfig(newConfig);
    setSavedSuccess(`Applied ${presetType} preset profile! Press Save to persist.`);
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  const handleExportJson = () => {
    if (!config) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `terrasentinel-system-config.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.risk_thresholds && imported.sensor_settings) {
          setConfig(imported);
          setSavedSuccess('Config imported from file! Press Save to persist.');
          setTimeout(() => setSavedSuccess(null), 3500);
        }
      } catch (err) {
        console.error('Invalid JSON file:', err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!config) {
    return (
      <div className="p-16 text-center text-xs text-slate-400 font-medium">
        Loading configuration parameters...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">System Configuration Center</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#121417] text-white font-bold">
                SIH26178 THRESHOLDS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Dynamic operational risk thresholds, sensor heartbeat intervals, and automated escalation parameters
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-mono text-emerald-700 flex items-center gap-1.5 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {savedSuccess}
            </span>
          )}

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            title="Export JSON Configuration"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            title="Import JSON Configuration"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            title="Reset to standard defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Quick Profile Presets Strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-[#ff4405]" />
          <span>Quick Operational Profile Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('ARID')}
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] border border-orange-200 text-xs font-bold cursor-pointer transition-all shadow-2xs"
          >
            🔥 High-Risk Wildfire (Arid Forest)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('MONSOON')}
            className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold cursor-pointer transition-all shadow-2xs"
          >
            🌊 Flood Inflow (Monsoon Riparian)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('INDUSTRIAL')}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold cursor-pointer transition-all shadow-2xs"
          >
            🏭 Toxic VOC (Industrial Air)
          </button>
        </div>
      </div>

      {/* Grid of Configuration Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Risk Thresholds */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Hazard Risk Score Thresholds
          </h3>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="flex justify-between text-slate-700 mb-1.5 font-semibold">
                <span>Wildfire Critical Trigger Threshold</span>
                <span className="font-mono text-[#ff4405] font-bold">{config.risk_thresholds.fire_critical}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={config.risk_thresholds.fire_critical}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    risk_thresholds: { ...config.risk_thresholds, fire_critical: Number(e.target.value) },
                  })
                }
                className="w-full accent-[#ff4405] cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-slate-700 mb-1.5 font-semibold">
                <span>Flash Flood Critical Trigger Threshold</span>
                <span className="font-mono text-blue-700 font-bold">{config.risk_thresholds.flood_critical}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={config.risk_thresholds.flood_critical}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    risk_thresholds: { ...config.risk_thresholds, flood_critical: Number(e.target.value) },
                  })
                }
                className="w-full accent-[#ff4405] cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-slate-700 mb-1.5 font-semibold">
                <span>Air Pollution Critical Trigger Threshold</span>
                <span className="font-mono text-emerald-700 font-bold">{config.risk_thresholds.pollution_critical}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={config.risk_thresholds.pollution_critical}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    risk_thresholds: { ...config.risk_thresholds, pollution_critical: Number(e.target.value) },
                  })
                }
                className="w-full accent-[#ff4405] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Sensor & Telemetry Settings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Sensor Telemetry & Health Rules
          </h3>

          <div className="space-y-3.5 text-xs font-medium">
            <div>
              <label className="text-slate-700 block mb-1 font-semibold">Edge Sampling Interval (Seconds)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={config.sensor_settings.sampling_interval_seconds}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sensor_settings: { ...config.sensor_settings, sampling_interval_seconds: Number(e.target.value) },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#ff4405]"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-semibold">Node Offline Timeout (Seconds)</label>
              <input
                type="number"
                min="10"
                max="600"
                value={config.sensor_settings.heartbeat_timeout_seconds}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sensor_settings: { ...config.sensor_settings, heartbeat_timeout_seconds: Number(e.target.value) },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#ff4405]"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-semibold">Alert Deduplication Cooldown (Seconds)</label>
              <input
                type="number"
                min="30"
                max="1800"
                value={config.alert_rules.cooldown_seconds}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    alert_rules: { ...config.alert_rules, cooldown_seconds: Number(e.target.value) },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#ff4405]"
              />
            </div>
          </div>
        </div>

      </div>
    </form>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, Save, CheckCircle2 } from 'lucide-react';

export const ConfigurationView: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateConfiguration(config);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  if (!config) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading configuration parameters...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101D19] border border-[#1B2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">System Configuration Center</h2>
            <p className="text-xs text-slate-400">
              Dynamic operational risk thresholds, sensor heartbeat intervals, and automated escalation parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Changes Applied
            </span>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </div>

      {/* Grid of Configuration Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Risk Thresholds */}
        <div className="p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Hazard Risk Score Thresholds
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="flex justify-between text-slate-300 mb-1">
                <span>Wildfire Critical Trigger Threshold</span>
                <span className="font-mono text-rose-400 font-bold">{config.risk_thresholds.fire_critical}%</span>
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
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-slate-300 mb-1">
                <span>Flash Flood Critical Trigger Threshold</span>
                <span className="font-mono text-blue-400 font-bold">{config.risk_thresholds.flood_critical}%</span>
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
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-slate-300 mb-1">
                <span>Air Pollution Critical Trigger Threshold</span>
                <span className="font-mono text-emerald-400 font-bold">{config.risk_thresholds.pollution_critical}%</span>
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
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Sensor & Telemetry Settings */}
        <div className="p-5 rounded-2xl bg-[#101D19] border border-[#1B2D27] space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Sensor Telemetry & Health Rules
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Edge Sampling Interval (Seconds)</label>
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
                className="w-full px-3 py-2 rounded-xl bg-[#07110F] border border-[#1B2D27] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Node Offline Timeout (Seconds)</label>
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
                className="w-full px-3 py-2 rounded-xl bg-[#07110F] border border-[#1B2D27] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Alert Deduplication Cooldown (Seconds)</label>
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
                className="w-full px-3 py-2 rounded-xl bg-[#07110F] border border-[#1B2D27] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

      </div>
    </form>
  );
};

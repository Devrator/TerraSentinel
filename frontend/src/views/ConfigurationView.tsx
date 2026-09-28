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

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-mono text-emerald-700 flex items-center gap-1.5 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes Applied
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Save className="w-4 h-4" /> Save Configuration
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

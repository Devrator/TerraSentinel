import React, { useState } from 'react';
import { Sparkles, Sun, Radio, Satellite, Zap, Download, Calculator } from 'lucide-react';

export const SustainabilityImpactView: React.FC = () => {
  const [fleetNodes, setFleetNodes] = useState<number>(5);
  const [hasSolar, setHasSolar] = useState<boolean>(true);
  const [sleepIntervalSec, setSleepIntervalSec] = useState<number>(30);

  // Dynamic calculations based on edge hardware power profile
  // ESP32 Active: 120mW, Deep Sleep: 0.15mW, Solar generates ~500mW average daylight
  const activePowerDrawMw = 120;
  const sleepPowerDrawMw = 0.15;
  const activeDutyCycle = Math.min(1, 1.2 / sleepIntervalSec); // 1.2s active cycle
  const avgPowerPerNodeMw = (activePowerDrawMw * activeDutyCycle) + (sleepPowerDrawMw * (1 - activeDutyCycle));
  const totalFleetPowerW = (avgPowerPerNodeMw * fleetNodes) / 1000;
  
  // Grid replacement CO2 savings (0.82 kg CO2 per kWh in India average grid baseline)
  const traditionalServerPowerW = fleetNodes * 25; // 25W traditional PLC/industrial station
  const annualEnergySavedKwh = ((traditionalServerPowerW - totalFleetPowerW) * 24 * 365) / 1000;
  const annualCo2SavedKg = Math.max(0, annualEnergySavedKwh * 0.82);
  const equivalentTreesPlanted = Math.round(annualCo2SavedKg / 21.77); // ~21.77 kg CO2 / tree / year

  // Battery life calculation (3400 mAh 18650 cell = 12.58 Wh)
  const batteryCapacityMwh = 12580;
  const dailyConsumptionMwh = avgPowerPerNodeMw * 24;
  const dailySolarHarvestMwh = hasSolar ? 2500 : 0;
  const netDailyDrainMwh = Math.max(0.1, dailyConsumptionMwh - dailySolarHarvestMwh);
  const batteryLifespanDays = hasSolar ? 3650 : Math.round(batteryCapacityMwh / netDailyDrainMwh);

  const handleExportReport = () => {
    const report = {
      report_title: 'TerraSentinel Ecological Sustainability & Carbon Footprint Assessment',
      standard: 'SIH26178 Environmental Impact Metric Protocol',
      generated_at: new Date().toISOString(),
      fleet_parameters: {
        fleet_nodes: fleetNodes,
        solar_harvesting_enabled: hasSolar,
        telemetry_interval_seconds: sleepIntervalSec,
        average_power_draw_per_node_mw: Number(avgPowerPerNodeMw.toFixed(2)),
        total_fleet_power_draw_watts: Number(totalFleetPowerW.toFixed(3)),
      },
      ecological_impact: {
        annual_energy_saved_kwh: Number(annualEnergySavedKwh.toFixed(1)),
        annual_co2_offset_kg: Number(annualCo2SavedKg.toFixed(1)),
        equivalent_trees_planted: equivalentTreesPlanted,
        estimated_battery_longevity_years: Number((batteryLifespanDays / 365).toFixed(1)),
        active_biome_coverage_km2: Number((fleetNodes * 0.784).toFixed(2)),
      },
      hardware_efficiency_profile: {
        microcontroller: 'ESP32 Dual-Core Tensilica LX6',
        deep_sleep_current_ua: 15,
        solar_cell: '5W Monocrystalline with MPPT Charging',
        battery_chemistry: '18650 Li-Ion (3400mAh, 3.7V)',
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `terrasentinel-sustainability-impact-report.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4405] shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Environmental Sustainability & Impact</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#121417] text-white font-bold">
                SIH26178 IMPACT AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ecological protection metrics, operational energy efficiency, and scalable regional expansion roadmap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download full sustainability impact audit report in JSON format"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Export Impact Report
          </button>
          <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold shadow-2xs">
            FLEET CARBON NEUTRAL
          </span>
        </div>
      </div>

      {/* Measured Prototype Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#121417] text-white border border-zinc-800 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Active Biome Coverage</div>
          <div className="font-mono text-3xl font-black text-white">{(fleetNodes * 0.784).toFixed(2)} km²</div>
          <div className="text-[11px] text-orange-200/80 font-medium">{fleetNodes}-node localized network</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Annual CO2 Offset</div>
          <div className="font-mono text-3xl font-bold text-emerald-700">{annualCo2SavedKg.toFixed(0)} kg</div>
          <div className="text-[11px] text-slate-500 font-medium">Equiv. to {equivalentTreesPlanted} mature trees</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Est. Battery Longevity</div>
          <div className="font-mono text-3xl font-bold text-blue-700">{hasSolar ? '10+ yrs' : `${(batteryLifespanDays / 365).toFixed(1)} yrs`}</div>
          <div className="text-[11px] text-slate-500 font-medium">{hasSolar ? 'Perpetual Solar Harvesting' : 'Single 3400mAh Charge'}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Edge Power Draw</div>
          <div className="font-mono text-3xl font-bold text-slate-900">{avgPowerPerNodeMw.toFixed(0)} mW</div>
          <div className="text-[11px] text-slate-500 font-medium">{sleepIntervalSec}s interval duty cycle</div>
        </div>
      </div>

      {/* Interactive Carbon & Battery Lifetime Simulator */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-[#ff4405]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Interactive Ecological & Power Life Simulator
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Adjust regional deployment parameters to model dynamic environmental savings and battery endurance
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            DYNAMIC MODEL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Node Count Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Fleet Deployment Size</span>
              <span className="font-mono font-bold text-[#ff4405] text-sm">{fleetNodes} Nodes</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={fleetNodes}
              onChange={(e) => setFleetNodes(Number(e.target.value))}
              className="w-full accent-[#ff4405] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 Node (Pilot)</span>
              <span>50 Nodes</span>
              <span>100 Nodes (Regional)</span>
            </div>
          </div>

          {/* Telemetry Interval Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Edge Sleep Cycle Interval</span>
              <span className="font-mono font-bold text-blue-700 text-sm">{sleepIntervalSec}s</span>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={sleepIntervalSec}
              onChange={(e) => setSleepIntervalSec(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5s (High Freq)</span>
              <span>60s (Standard)</span>
              <span>300s (Ultra Low Power)</span>
            </div>
          </div>

          {/* Solar Panel Harvesting Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Photovoltaic Solar Harvester</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${hasSolar ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                {hasSolar ? 'ENABLED (5W)' : 'OFF-GRID BATTERY ONLY'}
              </span>
            </div>
            <button
              onClick={() => setHasSolar(!hasSolar)}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                hasSolar
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>{hasSolar ? 'Solar Harvesting Active' : 'Enable Solar Harvesting'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scalability & Future Expansion Roadmap */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Regional Architecture Expansion Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-700" />
            </div>
            <div className="font-bold text-sm text-slate-900">Solar Energy Harvesting</div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              5W monocrystalline photovoltaic cells with MPPT battery charging for perpetual off-grid operation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Radio className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="font-bold text-sm text-slate-900">LoRa / LoRaWAN Mesh</div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Sub-GHz 868/915 MHz long-range telemetry covering up to 15km line-of-sight in dense forest canopies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-700" />
            </div>
            <div className="font-bold text-sm text-slate-900">Cellular NB-IoT / Cat-M1</div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Direct cellular fallback transmission for critical alert delivery in cellular-enabled regions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
              <Satellite className="w-5 h-5 text-purple-700" />
            </div>
            <div className="font-bold text-sm text-slate-900">Satellite GIS Fusion</div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Sentinel-2 & Landsat thermal infrared multi-spectral imagery overlay for validation of ground node alerts.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

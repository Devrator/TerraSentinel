import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Bell,
  Phone,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Sun,
  Moon,
  Sparkles,
  Send,
  Battery,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { LiveMap } from '../components/LiveMap';
import { useTheme } from '../context/ThemeContext';
import { AmbientBackground } from '../components/AmbientBackground';
import type { PublicAreaSector, PublicAreaTelemetryResponse, PublicSubscriptionResponse, SensorNode } from '../types';

interface PublicPortalViewProps {
  onSwitchToAgency: () => void;
  onLogout: () => void;
  nodes?: SensorNode[];
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  onSwitchToAgency,
  onLogout,
  nodes = []
}) => {
  const { theme, toggleTheme } = useTheme();

  const [areas, setAreas] = useState<PublicAreaSector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('ENV-001');
  const [areaData, setAreaData] = useState<PublicAreaTelemetryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // SMS Subscription Form State
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [citizenName, setCitizenName] = useState<string>('');
  const [alertType, setAlertType] = useState<string>('ALL');
  const [submittingSub, setSubmittingSub] = useState<boolean>(false);
  const [subResult, setSubResult] = useState<PublicSubscriptionResponse | null>(null);
  const [otpInput, setOtpInput] = useState<string>('');
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [activeSub, setActiveSub] = useState<PublicSubscriptionResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load available areas on mount
  useEffect(() => {
    api.getPublicAreas()
      .then((res) => {
        setAreas(res);
        if (res.length > 0) {
          setSelectedSectorId(res[0].node_id);
        }
      })
      .catch((err) => console.error('Failed to load public areas:', err));
  }, []);

  // Fetch live telemetry for selected area
  const fetchAreaData = useCallback(async (nodeId: string) => {
    try {
      setLoading(true);
      const res = await api.getPublicAreaData(nodeId);
      setAreaData(res);
    } catch (err) {
      console.error('Failed to load area data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSectorId) {
      fetchAreaData(selectedSectorId);
      const interval = setInterval(() => fetchAreaData(selectedSectorId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSectorId, fetchAreaData]);

  // Handle SMS Alert Subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    try {
      setSubmittingSub(true);
      const sectorObj = areas.find((a) => a.node_id === selectedSectorId);
      const sectorLabel = sectorObj ? `${sectorObj.sector_id}: ${sectorObj.name}` : selectedSectorId;

      const res = await api.subscribePublicAlerts({
        phone_number: phoneNumber.trim(),
        citizen_name: citizenName.trim() || 'Resident',
        area_sector: sectorLabel,
        preferred_alert_types: alertType,
      });

      setSubResult(res);
      setActiveSub(res);
      setIsSubscribed(true);
      if (res.simulation_otp_hint) {
        setOtpInput(res.simulation_otp_hint);
      }
      setToastMessage(`SMS alerts registered for ${res.phone_number}!`);
    } catch (err: any) {
      console.error(err);
      setToastMessage(`Registration error: ${err.message || 'Check input'}`);
    } finally {
      setSubmittingSub(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    if (!subResult || !otpInput.trim()) return;
    try {
      setVerifyingOtp(true);
      const res = await api.verifyPublicOtp({
        phone_number: subResult.phone_number,
        otp: otpInput.trim(),
      });
      setActiveSub(res);
      setToastMessage('Mobile number verified! Active SMS alerts enabled.');
    } catch (err: any) {
      console.error(err);
      setToastMessage(`OTP verification error: ${err.message}`);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Unsubscribe
  const handleUnsubscribe = async () => {
    if (!activeSub) return;
    try {
      await api.unsubscribePublicAlerts(activeSub.phone_number);
      setIsSubscribed(false);
      setActiveSub(null);
      setSubResult(null);
      setPhoneNumber('');
      setToastMessage('You have successfully unsubscribed from SMS notifications.');
    } catch (err: any) {
      console.error(err);
      setToastMessage(`Unsubscribe error: ${err.message}`);
    }
  };

  const currentArea = areaData?.area || areas.find((a) => a.node_id === selectedSectorId);
  const tel = areaData?.telemetry;
  const isCrit = areaData?.risk_assessment?.level === 'CRITICAL';
  const isElevated = areaData?.risk_assessment?.level === 'ELEVATED';

  // Map AQI into health advisory category
  const getAqiCategory = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good (Clean Air)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (aqi <= 200) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    if (aqi <= 300) return { label: 'Unhealthy', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    return { label: 'Hazardous (Immediate Threat)', color: 'text-purple-700 bg-purple-50 border-purple-200' };
  };

  const aqiInfo = getAqiCategory(tel?.air_quality ?? 35);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans flex flex-col justify-between selection:bg-[#ff4405] selection:text-white relative">
      <AmbientBackground />
      
      {/* 1. Dedicated Public Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff4405] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              TS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  TerraSentinel
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#ea580c] border border-orange-200">
                  PUBLIC PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Community Environmental Monitoring & Real-time Early Warning Network
              </p>
            </div>
          </div>

          {/* Center/Right: Sector Picker & Control Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Area Dropdown Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#ff4405]" />
              <label htmlFor="select-public-area" className="text-slate-500 text-[10px] uppercase font-bold">Area:</label>
              <select
                id="select-public-area"
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs"
              >
                {areas.map((sec) => (
                  <option key={sec.node_id} value={sec.node_id} className="text-slate-900">
                    {sec.sector_id}: {sec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchAreaData(selectedSectorId)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
              title="Refresh Area Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4405]' : ''}`} />
            </button>

            {/* Bright/Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
              title="Toggle Theme"
            >
              {theme === 'bright' ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </button>

            {/* Switch to Tactical Command */}
            <button
              onClick={onSwitchToAgency}
              id="btn-switch-agency-command"
              className="px-3.5 py-1.5 rounded-xl bg-[#121417] hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#ff4405]" />
              <span>Agency Command</span>
            </button>

            {/* Logout / Switch Role */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all cursor-pointer border border-slate-200"
              title="Return to Gateway"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8 mt-3">
          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff4405]" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-[1500px] w-full mx-auto px-4 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* 2. Selected Area Hero Banner & Civic Health Advisory */}
        <div className="p-5 lg:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#121417] text-white">
                  {currentArea?.sector_id || 'SEC-01'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                  NODE: {currentArea?.node_id || 'ENV-001'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  currentArea?.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-[#ea580c] border-orange-200'
                }`}>
                  {currentArea?.status === 'ONLINE' ? 'LIVE MONITORING ACTIVE' : 'CACHED FEED'}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                {currentArea?.name || 'Monitored Sector'}
              </h1>
              <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
                {currentArea?.description || 'Real-time environmental sensor coverage station.'}
              </p>
            </div>

            {/* Overall Risk Gauge Badge */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 shrink-0 ${
              isCrit
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : isElevated
                ? 'bg-orange-50 border-orange-200 text-[#ea580c]'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black ${
                isCrit ? 'bg-rose-200/80 text-rose-800' : isElevated ? 'bg-orange-200/80 text-[#ea580c]' : 'bg-emerald-200/80 text-emerald-800'
              }`}>
                {isCrit ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-extrabold tracking-wider opacity-80">
                  Current Threat Level
                </div>
                <div className="text-lg font-black tracking-tight leading-tight">
                  {areaData?.risk_assessment?.level || 'NOMINAL'}
                  <span className="text-xs font-mono font-bold ml-1.5">
                    ({areaData?.risk_assessment?.overall_risk ?? 12.0}%)
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Civic Community Advisory Banner */}
          <div className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed flex items-start gap-3 ${
            isCrit
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : isElevated
              ? 'bg-orange-50/70 border-orange-200 text-orange-950'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${isCrit ? 'text-rose-600' : isElevated ? 'text-[#ea580c]' : 'text-emerald-600'}`} />
            <div>
              <strong className="font-bold block mb-0.5">Civilian Safety Advisory:</strong>
              {areaData?.community_advisory || 'All environmental readings are nominal. Municipal air and hydrological conditions are within safe ranges.'}
            </div>
          </div>
        </div>

        {/* 3. Live Environmental Sensor Telemetry Grid (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Temperature */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Temperature</span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff4405] flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {tel?.temperature !== undefined ? `${tel.temperature.toFixed(1)}°C` : '--'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {tel?.temperature && tel.temperature > 40 ? 'High Thermal Surge' : 'Temperate & Stable'}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Sensor: DHT22</span>
              <span className="text-emerald-600 font-bold">100% Calibrated</span>
            </div>
          </div>

          {/* Air Quality AQI */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Air Quality (AQI)</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {tel?.air_quality !== undefined ? `${Math.round(tel.air_quality)} AQI` : '--'}
              </div>
              <div className="mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aqiInfo.color}`}>
                  {aqiInfo.label}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Sensor: MQ-135 Gas</span>
              <span className="text-purple-600 font-bold">VOC / Smoke</span>
            </div>
          </div>

          {/* Atmospheric Humidity */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Humidity</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {tel?.humidity !== undefined ? `${tel.humidity.toFixed(0)}% RH` : '--'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {tel?.humidity && tel.humidity < 20 ? 'Arid / Desiccation' : tel?.humidity && tel.humidity > 80 ? 'Heavy Moisture' : 'Comfortable Zone'}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Sensor: Relative RH</span>
              <span className="text-cyan-700 font-bold">Continuous</span>
            </div>
          </div>

          {/* Barometric Pressure */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pressure</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {tel?.pressure !== undefined ? `${tel.pressure.toFixed(1)} hPa` : '--'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {tel?.pressure && tel.pressure < 990 ? 'Storm Front Depression' : 'Standard Barometric'}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Sensor: BME280</span>
              <span className="text-slate-700 font-bold">Sea-Level Adj.</span>
            </div>
          </div>

          {/* Precipitation / Rain */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precipitation</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <CloudRain className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {tel?.rain_value !== undefined ? `${tel.rain_value.toFixed(1)} mm` : '--'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {tel?.rain_value && tel.rain_value > 200 ? 'Flash Runoff Inflow' : 'Zero Precipitation'}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Sensor: ADC Rain</span>
              <span className="text-blue-700 font-bold">Real-Time</span>
            </div>
          </div>

        </div>

        {/* 4. Two-Column Layout: GIS Area Map on Left + SMS Alerts & Active Alerts on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Focused Area GIS Map (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff4405]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Focused Community GIS Map
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {currentArea?.name} Sector
              </span>
            </div>

            {/* Live Map Component */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 h-[380px]">
              <LiveMap
                nodes={nodes}
                selectedNodeId={selectedSectorId}
                onSelectNode={(id) => setSelectedSectorId(id)}
                hazardZone={
                  isCrit || isElevated
                    ? {
                        center: [currentArea?.latitude ?? 25.2138, currentArea?.longitude ?? 75.8648],
                        radius: isCrit ? 1200 : 750,
                        hazardType: areaData?.risk_assessment?.risk_category || 'ENVIRONMENTAL',
                        intensity: areaData?.risk_assessment?.overall_risk || 50,
                        consensusLabel: `Public Advisory: ${currentArea?.name}`,
                      }
                    : null
                }
              />
            </div>

            {/* Footer context */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Coordinates: <strong className="font-mono text-slate-800">{currentArea?.latitude.toFixed(4)}°N, {currentArea?.longitude.toFixed(4)}°E</strong></span>
              <span className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                <span>Station Battery: <strong className="font-mono text-emerald-700">{tel?.battery_percentage ?? 95}%</strong></span>
              </span>
            </div>
          </div>

          {/* Right Column: SMS Emergency Subscription Hub & Active Alerts (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SMS Early Warning Registration Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff4405] flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Emergency SMS Alerts
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Free real-time civilian early warnings</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#121417] text-white">
                  SMS GATEWAY
                </span>
              </div>

              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mobile Number (with Country Code)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4405] font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4405] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Alert Type
                      </label>
                      <select
                        value={alertType}
                        onChange={(e) => setAlertType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#ff4405] font-semibold cursor-pointer"
                      >
                        <option value="ALL">All Emergencies</option>
                        <option value="FIRE">Wildfires Only</option>
                        <option value="FLOOD">Floods Only</option>
                        <option value="POLLUTION">Gas / AQI Only</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSub}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#ff4405] hover:bg-[#e03b00] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingSub ? 'Registering...' : 'Register for Free SMS Warnings'}</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Subscription Active</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      VERIFIED
                    </span>
                  </div>

                  <div className="space-y-1 text-emerald-900 font-medium text-[11px]">
                    <div>Registered Number: <strong className="font-mono font-bold">{activeSub?.phone_number}</strong></div>
                    <div>Sector: <strong className="font-bold">{activeSub?.area_sector}</strong></div>
                    <div>Preference: <strong className="font-bold">{activeSub?.preferred_alert_types}</strong></div>
                  </div>

                  {/* OTP Verification Box if simulated */}
                  {subResult?.simulation_otp_hint && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>SMS GATEWAY OTP (SIMULATED):</span>
                        <strong className="text-[#ea580c] font-bold text-xs">{subResult.simulation_otp_hint}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="6-digit OTP"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#ff4405]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp}
                          className="px-3 py-1.5 rounded-lg bg-[#121417] text-white text-[10px] font-bold hover:bg-zinc-800 cursor-pointer shrink-0"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700">Receive immediate SMS when hazard triggers.</span>
                    <button
                      onClick={handleUnsubscribe}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Community Warnings in Selected Area */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Active Area Warnings
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {areaData?.active_alerts?.length ?? 0} ALERTS
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {areaData?.active_alerts && areaData.active_alerts.length > 0 ? (
                  areaData.active_alerts.map((al) => (
                    <div
                      key={al.id}
                      className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{al.title}</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          {al.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-snug">
                        {al.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    Zero active critical hazards in this sector.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* 5. Emergency Contacts & Civic Hotlines Strip */}
        <div className="p-5 rounded-3xl bg-[#121417] text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#ff4405]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Civic Emergency Hotlines & Disaster Helplines
              </h4>
            </div>
            <span className="text-[10px] font-mono text-orange-400 font-bold">24x7 TOLL-FREE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-medium">National Emergency</div>
              <div className="text-base font-mono font-black text-white mt-0.5">112</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-medium">Fire & Rescue</div>
              <div className="text-base font-mono font-black text-orange-400 mt-0.5">101</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-medium">Ambulance / EMS</div>
              <div className="text-base font-mono font-black text-emerald-400 mt-0.5">108</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-medium">Disaster Control Room</div>
              <div className="text-base font-mono font-black text-cyan-400 mt-0.5">1070 / 1077</div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 bg-white shadow-2xs">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">
            TerraSentinel (SIH26178) — Public Environmental Early Warning Gateway
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>FastAPI Unified Pipeline</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">Public Node Telemetry Synchronized</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

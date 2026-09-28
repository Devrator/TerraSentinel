import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, ShieldCheck, Flame, Cpu, MapPin, FileCheck2, Send, Minimize2, Maximize2 } from 'lucide-react';
import type { NavigationTab } from '../types';
import { api } from '../services/api';

interface EvaluatorDemoControllerProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onSelectNode?: (nodeId: string) => void;
}

interface DemoStep {
  id: number;
  label: string;
  badge: string;
  targetTab: NavigationTab;
  targetNodeId: string;
  durationSeconds: number;
  icon: React.ComponentType<{ className?: string }>;
  scenarioAction?: string;
  description: string;
  highlightText: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    label: 'Nominal Baseline',
    badge: 'NORMAL STATE',
    targetTab: 'dashboard',
    targetNodeId: 'ENV-001',
    durationSeconds: 10,
    icon: ShieldCheck,
    scenarioAction: 'NORMAL',
    description: 'All 5 cluster nodes operate in peaceful temperate baseline. Zero hazard alerts active.',
    highlightText: 'Edge sensors report ~24°C, 55% RH, AQI 35 with healthy battery and 100% packet ingestion.',
  },
  {
    id: 2,
    label: 'Sensor Thermal Spike',
    badge: 'INGESTION INJECTION',
    targetTab: 'live-monitoring',
    targetNodeId: 'ENV-001',
    durationSeconds: 10,
    icon: Flame,
    scenarioAction: 'FIRE',
    description: 'Thermal rise to 48.5°C & particulate smoke AQI >280 detected on edge node ENV-001.',
    highlightText: 'Unified ESP32 ingestion contract (POST /api/sensor-data) receives rapid environmental telemetry surge.',
  },
  {
    id: 3,
    label: 'Edge AI Consensus',
    badge: 'SPATIAL VOTING',
    targetTab: 'ai-explainability',
    targetNodeId: 'ENV-001',
    durationSeconds: 10,
    icon: Cpu,
    description: 'Edge algorithm evaluates gradients; 3/4 peer nodes corroborate localized hazard.',
    highlightText: 'Multi-node spatial consensus triggers at 88% confidence, rejecting isolated sensor glitches or false alarms.',
  },
  {
    id: 4,
    label: 'GIS Hazard Perimeter',
    badge: 'MULTI-LAYER GIS',
    targetTab: 'situation-room',
    targetNodeId: 'ENV-001',
    durationSeconds: 10,
    icon: MapPin,
    description: 'Multi-layer GIS calculates and displays live hazard perimeter polygon and spatial radius.',
    highlightText: 'Switchable OpenStreetMap, Satellite, and Dark Canvas layers visualize real-time incident corridor.',
  },
  {
    id: 5,
    label: 'Automated SOP Protocols',
    badge: 'RESPONSE CHECKLIST',
    targetTab: 'response',
    targetNodeId: 'ENV-001',
    durationSeconds: 10,
    icon: FileCheck2,
    description: 'NDMA Standard Operating Procedure generates structured incident response checklist.',
    highlightText: 'Automated containment strategies and resource allocation recommendations prepared for command officers.',
  },
  {
    id: 6,
    label: 'Agency Dispatch & Resolution',
    badge: 'DISPATCH TESTBENCH',
    targetTab: 'incidents',
    targetNodeId: 'ENV-001',
    durationSeconds: 10,
    icon: Send,
    description: 'Simulated dispatch order transmitted to SDMA & Fire Services; lifecycle resolved.',
    highlightText: 'Simulated emergency dispatch payload transmitted with reference ID, ETA tracking, and complete audit trail.',
  },
];

const TOTAL_DEMO_SECONDS = DEMO_STEPS.reduce((sum, s) => sum + s.durationSeconds, 0); // 60s

export const EvaluatorDemoController: React.FC<EvaluatorDemoControllerProps> = ({
  onNavigate,
  onSelectNode,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];

  // Execute step actions (API calls & navigation)
  const executeStep = useCallback(async (stepIdx: number) => {
    const step = DEMO_STEPS[stepIdx];
    if (!step) return;

    onNavigate(step.targetTab);
    if (onSelectNode && step.targetNodeId) {
      onSelectNode(step.targetNodeId);
    }

    // Trigger backend scenario if defined
    if (step.scenarioAction) {
      try {
        if (step.scenarioAction === 'NORMAL') {
          await api.startSimulation('NORMAL', 'ENV-001', 'LOW');
        } else if (step.scenarioAction === 'FIRE') {
          await api.startSimulation('FIRE', 'ENV-001', 'HIGH');
        }
      } catch (err) {
        console.error('Demo simulation trigger error:', err);
      }
    }
  }, [onNavigate, onSelectNode]);

  // Start Demo
  const handleStartDemo = () => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setElapsedSeconds(0);
    executeStep(0);
  };

  // Pause / Resume Demo
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Reset Demo
  const handleResetDemo = async () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await api.startSimulation('NORMAL', 'ENV-001', 'LOW');
    } catch (e) {
      console.error(e);
    }
    onNavigate('dashboard');
  };

  // Next Step
  const handleNextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      // Calculate elapsed based on step starts
      const newElapsed = DEMO_STEPS.slice(0, nextIdx).reduce((sum, s) => sum + s.durationSeconds, 0);
      setElapsedSeconds(newElapsed);
      executeStep(nextIdx);
    } else {
      setIsActive(false);
    }
  };

  // Prev Step
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const newElapsed = DEMO_STEPS.slice(0, prevIdx).reduce((sum, s) => sum + s.durationSeconds, 0);
      setElapsedSeconds(newElapsed);
      executeStep(prevIdx);
    }
  };

  // Jump directly to step
  const handleJumpToStep = (idx: number) => {
    setCurrentStepIndex(idx);
    const newElapsed = DEMO_STEPS.slice(0, idx).reduce((sum, s) => sum + s.durationSeconds, 0);
    setElapsedSeconds(newElapsed);
    executeStep(idx);
  };

  // Timer progression effect
  useEffect(() => {
    if (!isActive || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSec = prev + 1;
        if (nextSec >= TOTAL_DEMO_SECONDS) {
          setIsActive(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return TOTAL_DEMO_SECONDS;
        }

        // Calculate which step should be active
        let accumulated = 0;
        let targetIdx = 0;
        for (let i = 0; i < DEMO_STEPS.length; i++) {
          accumulated += DEMO_STEPS[i].durationSeconds;
          if (nextSec < accumulated) {
            targetIdx = i;
            break;
          }
          if (i === DEMO_STEPS.length - 1) {
            targetIdx = i;
          }
        }

        if (targetIdx !== currentStepIndex) {
          setCurrentStepIndex(targetIdx);
          executeStep(targetIdx);
        }

        return nextSec;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, currentStepIndex, executeStep]);

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / TOTAL_DEMO_SECONDS) * 100));
  const StepIcon = currentStep.icon;

  if (!isActive) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        <button
          onClick={handleStartDemo}
          id="btn-start-evaluator-demo"
          className="group px-4 py-3 rounded-2xl bg-[#ff4405] hover:bg-[#e03b00] text-white font-extrabold text-xs shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2.5 cursor-pointer border border-white/20"
        >
          <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </div>
          <span>Start 60s Evaluator Demo</span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/30 uppercase tracking-wider font-bold">
            SIH26178
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl transition-all">
      <div className="rounded-2xl bg-[#121417]/95 backdrop-blur-md border border-zinc-700/80 text-white shadow-2xl p-4 space-y-3">
        
        {/* Top Bar: Step Title, Badge, Timer, & Window Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ff4405]/20 border border-[#ff4405]/40 flex items-center justify-center text-[#ff4405]">
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#ff4405] tracking-wider">
                  Step {currentStep.id} of {DEMO_STEPS.length}: {currentStep.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {currentStep.badge}
                </span>
              </div>
              {!isCollapsed && (
                <p className="text-[11px] text-zinc-300 font-medium line-clamp-1 mt-0.5">
                  {currentStep.highlightText}
                </p>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5">
            <div className="px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 font-mono text-[11px] font-bold text-orange-400">
              {elapsedSeconds}s / {TOTAL_DEMO_SECONDS}s
            </div>

            <button
              onClick={handleTogglePause}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer border border-zinc-700"
              title={isPaused ? 'Resume Demo' : 'Pause Demo'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white transition-all cursor-pointer border border-zinc-700"
              title="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNextStep}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer border border-zinc-700"
              title="Next Step"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetDemo}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-900/60 text-white transition-all cursor-pointer border border-zinc-700"
              title="Reset & Exit Demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-700"
              title={isCollapsed ? 'Expand Controller' : 'Minimize Controller'}
            >
              {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step Navigation Ribbon & Progress Indicator */}
        {!isCollapsed && (
          <>
            {/* Step Pills */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {DEMO_STEPS.map((s, idx) => {
                const isCur = idx === currentStepIndex;
                const isDone = idx < currentStepIndex;

                return (
                  <button
                    key={s.id}
                    onClick={() => handleJumpToStep(idx)}
                    className={`py-1.5 px-2 rounded-xl text-left text-[10px] font-bold transition-all cursor-pointer border truncate ${
                      isCur
                        ? 'bg-[#ff4405] text-white border-[#ff4405] shadow-sm'
                        : isDone
                        ? 'bg-zinc-800/90 text-emerald-400 border-zinc-700 hover:border-zinc-500'
                        : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="truncate font-mono">
                      {idx + 1}. {s.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continuous Progress Bar */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-orange-500 to-[#ff4405] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

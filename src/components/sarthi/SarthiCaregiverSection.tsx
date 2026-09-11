import React, { useState } from 'react';
import {
  Language,
  PatientProfile,
  CognitiveSession,
  SarthiPersonalBaseline,
  SarthiRecommendation,
  SarthiDemoScenario,
} from '../../types';
import {
  calculatePersonalBaseline,
  generateSarthiRecommendation,
} from '../../services/sarthiEngine';
import { sarthiMemory } from '../../services/sarthiMemory';
import {
  Compass,
  TrendingUp,
  Minus,
  AlertTriangle,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

interface SarthiCaregiverSectionProps {
  language: Language;
  patient: PatientProfile;
  sessions: CognitiveSession[];
  onScenarioChange?: (scenario: SarthiDemoScenario) => void;
}

export const SarthiCaregiverSection: React.FC<SarthiCaregiverSectionProps> = ({
  language,
  patient,
  sessions,
  onScenarioChange,
}) => {
  const [activeScenario, setActiveScenario] = useState<SarthiDemoScenario>(() =>
    sarthiMemory.getActiveDemoScenario()
  );

  const baseline: SarthiPersonalBaseline = calculatePersonalBaseline(
    patient.id,
    sessions,
    activeScenario
  );

  const recommendation: SarthiRecommendation = generateSarthiRecommendation({
    patient,
    language,
    recentSessions: sessions.slice(-5),
    allSessions: sessions,
    routineAdherence: 85,
    hydrationGlasses: 6,
    demoScenario: activeScenario,
  });

  const handleSelectScenario = (scenario: SarthiDemoScenario) => {
    setActiveScenario(scenario);
    sarthiMemory.setActiveDemoScenario(scenario);
    if (onScenarioChange) onScenarioChange(scenario);
  };

  const getTrendBadge = (trend: SarthiPersonalBaseline['trend']) => {
    switch (trend) {
      case 'improving':
        return {
          label: 'Improving Focus (Above Baseline)',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
        };
      case 'struggling':
        return {
          label: 'Slower Pace (Below Baseline)',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Minus className="w-4 h-4 text-amber-600" />,
        };
      case 'repeated_deviation':
        return {
          label: 'Pattern Deviation (Rest Recommended)',
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
        };
      case 'stable':
      default:
        return {
          label: 'Stable Personal Routine',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
        };
    }
  };

  const trendBadge = getTrendBadge(baseline.trend);

  return (
    <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#becabf]/60 space-y-6 font-sans">
      {/* Sarthi Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ecefea]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#032517] text-white flex items-center justify-center text-2xl shadow-md">
            <span className="material-symbols-outlined text-[28px] text-[#bfebba]">spa</span>
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#032517] flex items-center gap-2">
              <span>Sarthi Cognitive Care Insights</span>
              <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-[#bfebba]/50 text-[#032517] border border-[#83a590]/40">
                Personalized AI
              </span>
            </h3>
            <p className="text-xs text-[#3e4941] font-medium">
              Self-calibrated baseline engine • Transparent rules & non-diagnostic activity monitoring
            </p>
          </div>
        </div>

        {/* Current Trend Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${trendBadge.color}`}>
          {trendBadge.icon}
          <span>{trendBadge.label}</span>
        </div>
      </div>

      {/* SIH Presentation Demo Scenarios Panel */}
      <div className="bg-[#f7faf5] p-4 sm:p-5 rounded-2xl border border-[#becabf]/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#416740]" />
            <h4 className="text-xs font-bold text-[#032517] uppercase tracking-wider">
              SIH Presentation: Adaptive Demo Scenarios
            </h4>
          </div>
          <span className="text-[11px] font-bold text-[#6f7a70]">
            Interactive Rule-Based AI Verification
          </span>
        </div>

        <p className="text-xs text-stone-600 font-medium">
          Select a scenario below to observe how Sarthi dynamically adapts difficulty, patient voice prompts, and caregiver insights in real-time:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => handleSelectScenario('improving')}
            className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer text-left flex flex-col justify-between ${
              activeScenario === 'improving'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                : 'bg-white hover:bg-emerald-50 text-stone-800 border-stone-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>📈</span> Scenario A
            </span>
            <span className="text-[10px] font-medium opacity-90 mt-0.5">
              Improving Patient (Diff +1)
            </span>
          </button>

          <button
            onClick={() => handleSelectScenario('struggling')}
            className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer text-left flex flex-col justify-between ${
              activeScenario === 'struggling'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>📉</span> Scenario B
            </span>
            <span className="text-[10px] font-medium opacity-90 mt-0.5">
              Struggling (Ease Diff, Sound Game)
            </span>
          </button>

          <button
            onClick={() => handleSelectScenario('repeated_deviation')}
            className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer text-left flex flex-col justify-between ${
              activeScenario === 'repeated_deviation'
                ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                : 'bg-white hover:bg-rose-50 text-stone-800 border-stone-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>⚠️</span> Scenario C
            </span>
            <span className="text-[10px] font-medium opacity-90 mt-0.5">
              Repeated Deviation (Rest Alert)
            </span>
          </button>

          <button
            onClick={() => handleSelectScenario('baseline')}
            className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer text-left flex flex-col justify-between ${
              activeScenario === 'baseline'
                ? 'bg-stone-800 text-white border-stone-900 shadow-md ring-2 ring-stone-400'
                : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Live Data
            </span>
            <span className="text-[10px] font-medium opacity-90 mt-0.5">
              Reset to Recorded Baseline
            </span>
          </button>
        </div>
      </div>

      {/* 3 Personal Baseline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <span className="text-xs text-stone-500 font-bold block mb-1">
            Personal Baseline Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-stone-900">
              {baseline.averageScore}%
            </span>
            <span className="text-xs text-stone-400 font-semibold">
              from {baseline.totalSessions} sessions
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">
            Self-referenced benchmark (never compared to other patients).
          </p>
        </div>

        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <span className="text-xs text-stone-500 font-bold block mb-1">
            Motor Reaction Latency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-stone-900">
              {(baseline.averageReactionTimeMs / 1000).toFixed(1)}s
            </span>
            <span className="text-xs text-stone-400 font-semibold">avg speed</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">
            Tracks gentle motor reflex stability during interactive games.
          </p>
        </div>

        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <span className="text-xs text-stone-500 font-bold block mb-1">
            Adaptive Difficulty Assigned
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              Level {recommendation.difficulty || 2}
            </span>
            <span className="text-xs text-stone-400 font-semibold">of 5</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">
            Dynamic difficulty automatically adjusted to avoid frustration.
          </p>
        </div>
      </div>

      {/* Sarthi Current Adaptive Recommendation & Explainable Reason */}
      <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <h4 className="text-sm font-black text-emerald-950">
              Active Sarthi Recommendation for Patient
            </h4>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Priority: {recommendation.priority.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-stone-800 font-semibold">
          "{recommendation.patientMessage}"
        </p>

        {/* Explainability Callout for SIH Judges */}
        <div className="flex items-start gap-2 bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs text-stone-700 font-medium">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong className="text-emerald-900 font-bold">Why Sarthi Made This Recommendation:</strong>{' '}
            {recommendation.reason}
          </span>
        </div>
      </div>

      {/* Caregiver Observation Insight Card */}
      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider">
            Caregiver Activity Observation
          </h4>
        </div>
        <p className="text-sm text-stone-800 font-medium leading-relaxed">
          {recommendation.caregiverInsight}
        </p>
        <p className="text-[11px] text-stone-400 font-semibold italic pt-1">
          Note: Sarthi provides activity pattern observations and never issues clinical or diagnostic determinations.
        </p>
      </div>
    </div>
  );
};

export default SarthiCaregiverSection;

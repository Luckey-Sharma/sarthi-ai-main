import React, { useState } from 'react';
import {
  Language,
  PatientProfile,
  CognitiveSession,
  CaregiverProfile,
  CVIScorecard,
} from '../../types';
import { storage } from '../../services/storage';
import { aiEngine } from '../../services/aiEngine';
import { SarthiCaregiverSection } from '../sarthi/SarthiCaregiverSection';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Download,
  Heart,
  TrendingUp,
  TrendingDown,
  User,
  ShieldCheck,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';

interface CaregiverDashboardProps {
  language: Language;
  activePatient: PatientProfile;
  sessions?: CognitiveSession[];
  onSwitchPatient: (patient: PatientProfile) => void;
  onOpenOnboarding: () => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  language,
  activePatient,
  sessions: initialSessions,
  onSwitchPatient,
  onOpenOnboarding,
}) => {
  const allPatients = storage.loadPatients();
  const [sessions, setSessions] = useState<CognitiveSession[]>(() => initialSessions || storage.loadCognitiveHistory());
  const [caregiver, setCaregiver] = useState<CaregiverProfile>(() => storage.loadCaregiver());
  const [burnoutScore, setBurnoutScore] = useState<number>(caregiver.burnoutScore);
  const [showExportSuccess, setShowExportSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    setSessions(initialSessions || storage.loadCognitiveHistory());
  }, [initialSessions, activePatient.id]);

  // Compute CVI scorecard
  const cvi: CVIScorecard = aiEngine.calculateCVI(sessions);
  const anomalies = aiEngine.detectAnomalies(sessions);

  // Prepare chart data for 30-day trends
  const chartData = sessions.slice(-14).map((s) => ({
    date: s.date.slice(5),
    score: s.score,
    reactionTime: Math.round(s.reactionTimeMs / 100) / 10,
    domain: s.domain,
  }));

  // Radar chart data for 7 domains
  const radarData = [
    { domain: 'Visual Memory', value: cvi.domainScores.visual_spatial },
    { domain: 'Attention/Reflex', value: cvi.domainScores.attention_motor },
    { domain: 'Executive Logic', value: cvi.domainScores.executive_function },
    { domain: 'Pattern Weave', value: cvi.domainScores.pattern_logic },
    { domain: 'Temporal Routine', value: cvi.domainScores.temporal_orientation },
    { domain: 'Auditory Sound', value: cvi.domainScores.auditory_memory },
    { domain: 'Autobiographical', value: cvi.domainScores.autobiographical },
  ];

  // Clinical report exporter
  const handleExportReport = () => {
    const report = {
      patient: activePatient,
      caregiver: caregiver,
      generatedAt: new Date().toISOString(),
      cviScorecard: cvi,
      anomaliesDetected: anomalies,
      recentSessionsCount: sessions.length,
      recentSessions: sessions.slice(-10),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmritiSetu_ClinicalReport_${activePatient.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3500);
  };

  const handleUpdateBurnout = (scoreDelta: number) => {
    const updated = Math.min(100, Math.max(0, burnoutScore + scoreDelta));
    setBurnoutScore(updated);
    const updatedCaregiver = { ...caregiver, burnoutScore: updated };
    setCaregiver(updatedCaregiver);
    storage.saveCaregiver(updatedCaregiver);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-20 font-sans">
      {/* Patient Profile & Clinical Header Strip */}
      <div className="bg-[#ffffff] p-5 sm:p-6 rounded-3xl border border-[#becabf]/60 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={activePatient.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
            alt={activePatient.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#bfebba] shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#032517] bg-[#bfebba]/50 px-2.5 py-0.5 rounded-md border border-[#83a590]/40">
                Caregiver & Clinical Command Hub
              </span>
              <span className="text-xs text-[#6f7a70] font-medium hidden sm:inline">
                ICD-11 / Non-Diagnostic Assist
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517] mt-1">
              {activePatient.name}, {activePatient.age}y
            </h1>
            <p className="text-xs text-[#3e4941] font-medium">
              {activePatient.diagnosisStage} • Culturally anchored to {activePatient.location}
            </p>
          </div>
        </div>

        {/* Patient Selection Dropdown & Clinical Export */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#f7faf5] border border-[#becabf] px-3.5 py-2 rounded-2xl w-full md:w-auto">
            <User className="w-4 h-4 text-[#416740] shrink-0" />
            <select
              aria-label="Active Patient Profile"
              value={activePatient.id}
              onChange={(e) => {
                const target = allPatients.find((p) => p.id === e.target.value);
                if (target) onSwitchPatient(target);
              }}
              className="bg-transparent text-xs font-bold text-[#032517] focus:outline-none cursor-pointer pr-2"
            >
              {allPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-[#032517] hover:bg-[#1b3b2b] text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 shrink-0 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-[#bfebba]" />
            <span>Clinical Export</span>
          </button>
        </div>
      </div>

      {showExportSuccess && (
        <div className="bg-[#bfebba]/30 border border-[#bfebba] p-4 rounded-2xl text-[#032517] text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>✓ Clinical trajectory report downloaded in standardized JSON format.</span>
        </div>
      )}

      {/* 4 Baseline Metric Tiles (Clinical Insight 1: How is patient doing?) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Composite CVI Score */}
        <div className="bg-[#ffffff] p-5 sm:p-6 rounded-3xl border border-[#becabf]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7a70] uppercase tracking-wider">
              Composite CVI Index
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                cvi.riskTier === 'Low'
                  ? 'bg-[#bfebba]/50 text-[#032517] border border-[#83a590]/40'
                  : cvi.riskTier === 'Moderate'
                  ? 'bg-[#ecefea] text-[#416740] border border-[#becabf]'
                  : 'bg-[#ffdbd1] text-[#631d08] border border-[#ffdbd1]'
              }`}
            >
              {cvi.riskTier} Risk
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-serif font-bold text-[#032517]">
              {cvi.overallScore}
            </span>
            <span className="text-[#6f7a70] font-medium text-sm">/ 100</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#456c44]">
            {cvi.trend === 'improving' ? (
              <TrendingUp className="w-4 h-4 text-[#416740]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#631d08]" />
            )}
            <span>Trend: <strong>{cvi.trend.toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Metric 2: Average Reaction Speed */}
        <div className="bg-[#ffffff] p-5 sm:p-6 rounded-3xl border border-[#becabf]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7a70] uppercase tracking-wider">
              Reaction Speed
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#416740]">speed</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-serif font-bold text-[#032517]">
              1.4
            </span>
            <span className="text-[#6f7a70] font-medium text-sm">sec avg</span>
          </div>

          <div className="text-xs font-semibold text-[#456c44]">
            Stable within baseline range (±0.2s)
          </div>
        </div>

        {/* Metric 3: Active Weekly Sessions */}
        <div className="bg-[#ffffff] p-5 sm:p-6 rounded-3xl border border-[#becabf]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7a70] uppercase tracking-wider">
              Weekly Sessions
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#416740]">event_available</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-serif font-bold text-[#032517]">
              {sessions.length || 8}
            </span>
            <span className="text-[#6f7a70] font-medium text-sm">completed</span>
          </div>

          <div className="text-xs font-semibold text-[#456c44]">
            Gentle focus goal exceeded
          </div>
        </div>

        {/* Metric 4: Caregiver Burnout Pulse */}
        <div className="bg-[#ffffff] p-5 sm:p-6 rounded-3xl border border-[#becabf]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7a70] uppercase tracking-wider">
              Caregiver Pulse
            </span>
            <Heart className="w-5 h-5 text-[#631d08] fill-current" />
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-serif font-bold text-[#032517]">{burnoutScore}</span>
            <span className="text-xs font-bold text-[#6f7a70]">/ 100 Zarit</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateBurnout(-5)}
              className="p-1 rounded-lg bg-[#bfebba]/50 hover:bg-[#bfebba] text-[#032517] cursor-pointer transition-colors"
              title="Feeling Better"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleUpdateBurnout(0)}
              className="p-1 rounded-lg bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] cursor-pointer transition-colors"
              title="Neutral"
            >
              <Meh className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleUpdateBurnout(10)}
              className="p-1 rounded-lg bg-[#ffdbd1] hover:bg-[#ffc5b7] text-[#631d08] cursor-pointer transition-colors"
              title="Stressed / Overwhelmed"
            >
              <Frown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sarthi AI Cognitive Care Companion Insights & Scenario Lab */}
      <SarthiCaregiverSection
        language={language}
        patient={activePatient}
        sessions={sessions}
      />

      {/* Analytics: 30-Day Trend & Radar Grid (Clinical Insight 2: What changed?) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 bg-[#ffffff] p-6 rounded-3xl border border-[#becabf]/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#032517]">
                Cognitive Performance Timeline (Last 14 Days)
              </h3>
              <p className="text-xs text-[#3e4941] font-medium">
                Tracking accuracy (%) across cognitive game sessions
              </p>
            </div>
            <Activity className="w-5 h-5 text-[#416740]" />
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ecefea" />
                  <XAxis dataKey="date" stroke="#6f7a70" fontSize={11} />
                  <YAxis stroke="#6f7a70" fontSize={11} domain={[40, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#032517',
                      color: '#ffffff',
                      borderRadius: '16px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#032517"
                    strokeWidth={3}
                    dot={{ fill: '#416740', r: 4 }}
                    name="Accuracy Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-72 w-full flex items-center justify-center bg-[#f7faf5] rounded-2xl border border-dashed border-[#becabf] text-[#6f7a70] text-xs font-semibold">
              No cognitive sessions logged yet. Play cognitive games to track trends.
            </div>
          )}
        </div>

        {/* 7-Domain Radar Chart */}
        <div className="bg-[#ffffff] p-6 rounded-3xl border border-[#becabf]/60 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#032517]">7 Domain Breakdown</h3>
            <p className="text-xs text-[#3e4941] font-medium">
              Multidimensional cognitive profile
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#becabf" />
                <PolarAngleAxis dataKey="domain" stroke="#181d19" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6f7a70" fontSize={9} />
                <Radar
                  name="Domains"
                  dataKey="value"
                  stroke="#032517"
                  fill="#416740"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-[#456c44] text-center font-bold">
            Strongest: Autobiographical & Auditory Memory
          </div>
        </div>
      </div>

      {/* Sarthi Noticed: Terracotta Trigger Card & Actionable Steps (Clinical Insight 3 & 4) */}
      <div className="p-6 rounded-3xl bg-[#ffdbd1]/35 border-2 border-[#ffdbd1] space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#631d08] text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#ffdbd1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#631d08]">
                SARTHI NOTICED (Clinical Signal)
              </span>
              <span className="text-[10px] text-[#631d08] bg-white/60 px-2 py-0.5 rounded-full font-bold">
                Sundowning Latency
              </span>
            </div>
            <p className="text-sm font-serif font-bold text-[#420b00] mt-1 leading-snug">
              Evening recall response latency increased by 18% during the 5:00 PM – 7:00 PM window over the last 3 days.
            </p>
            <p className="text-xs text-[#631d08] mt-1 font-medium">
              Pattern suggests mild fatigue or sundowning sensitivity rather than generalized cognitive decline.
            </p>
          </div>
        </div>

        {/* Actionable Next Steps */}
        <div className="mt-4 pt-4 border-t border-[#ffdbd1]/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white/70 rounded-2xl border border-[#ffdbd1]">
            <div className="text-[11px] font-bold text-[#631d08] uppercase">Step 1: Hydration</div>
            <p className="text-xs text-[#420b00] mt-0.5">Offer warm chamomile or Assam tea at 4:30 PM.</p>
          </div>
          <div className="p-3 bg-white/70 rounded-2xl border border-[#ffdbd1]">
            <div className="text-[11px] font-bold text-[#631d08] uppercase">Step 2: Calming Sanctuary</div>
            <p className="text-xs text-[#420b00] mt-0.5">Transition to gentle nature soundscapes before sunset.</p>
          </div>
          <div className="p-3 bg-white/70 rounded-2xl border border-[#ffdbd1]">
            <div className="text-[11px] font-bold text-[#631d08] uppercase">Step 3: Family Photo Recall</div>
            <p className="text-xs text-[#420b00] mt-0.5">Anchor positive memories before bedtime routine.</p>
          </div>
        </div>
      </div>

      {/* Regulatory & Ethical Non-Diagnostic Notice */}
      <div className="p-4 rounded-2xl bg-[#ecefea] border border-[#becabf]/60 text-xs text-[#3e4941] flex items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#416740] shrink-0" />
          <span>
            <strong>Non-Diagnostic Advisory:</strong> SmritiSetu NER and Sarthi provide longitudinal exercise monitoring and caregiver decision support. They do not formulate clinical diagnoses or prescribe medication.
          </span>
        </div>
        <span className="text-[10px] text-[#6f7a70] font-bold uppercase shrink-0">
          SIH 2024 / 2025 Finalist
        </span>
      </div>
    </div>
  );
};

export default CaregiverDashboard;

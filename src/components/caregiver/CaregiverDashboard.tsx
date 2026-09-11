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
import { CaregiverPrivacyModal } from './CaregiverPrivacyModal';
import { UserRole } from '../../types/healthCompanion';
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
  Lock,
  Phone,
  MessageSquare,
  Plus,
  Clock,
  Pill,
  Coffee,
  Video,
  CheckCircle,
  Volume2,
  Mic,
  Calendar,
  Sparkles,
  Home,
  Shield,
  Stethoscope,
  X,
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
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>('caregiver');

  // Interactive Modals for Caregiver Portal (Reference 2)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState<boolean>(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState<boolean>(false);

  // Care schedule items
  const [scheduleItems, setScheduleItems] = useState([
    {
      id: 'sched-1',
      time: '8:00 AM',
      routine: 'Morning Routine',
      title: 'Amlodipine 5mg (Blood Pressure)',
      desc: 'Administered with ginger tea & whole grain roti. Verified by attendant Ratan.',
      status: 'Taken',
      verified: true,
      category: 'medicine',
    },
    {
      id: 'sched-2',
      time: '1:00 PM',
      routine: 'Upcoming in 2h',
      title: 'Vitamin D3 & Light Khichdi Lunch',
      desc: 'Soft meal, warm lentil broth. Auto gentle chime scheduled on simple screen.',
      status: 'Auto-Tablet Ping',
      verified: false,
      category: 'meal',
    },
    {
      id: 'sched-3',
      time: '4:30 PM',
      routine: 'Family Bonding',
      title: 'Video Call with Daughter Ananya',
      desc: 'Tablet auto-rings with gentle chime. Attendant assists in docking the screen at eye level.',
      status: '1-Touch Join',
      verified: false,
      category: 'call',
    },
    {
      id: 'sched-4',
      time: '9:30 PM',
      routine: 'Night Routine',
      title: 'Donepezil 5mg (Cognitive Support)',
      desc: 'White oblong pill with warm water before bed. Sleep tracker activates at 10:00 PM.',
      status: 'Pending',
      verified: false,
      category: 'medicine',
    },
  ]);

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
    a.download = `SmritiAI_ClinicalReport_${activePatient.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3500);
  };

  const handleToggleScheduleItem = (id: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextVerified = !item.verified;
          return {
            ...item,
            verified: nextVerified,
            status: nextVerified ? 'Taken / Done' : 'Pending',
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-[#1F342A]">
      {/* ─── HERO / STATUS CONTEXT BANNER (Reference 2) ─────────────────── */}
      <section
        className="relative overflow-hidden rounded-[20px] p-6 sm:p-8 border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
        style={{ backgroundColor: '#FBF7EF' }}
      >
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#E4EBDD]/40 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-[#EFE8DB]/50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE4] text-[#68736B] text-xs border border-[rgba(70,80,60,0.08)]">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#52745C] animate-pulse"></span>
              <span>Live Companion Stream • {activePatient.location || 'Guwahati, Assam'}</span>
              <span className="text-[#7E8A7F]/60">|</span>
              <span className="text-[#1F342A] font-semibold">21°C Gentle &amp; Clear</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#1F342A] tracking-tight font-bold">
              Caregiver Command Portal • {activePatient.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#68736B] leading-relaxed">
              Caring for <strong className="text-[#1F342A] font-semibold">{activePatient.name}</strong> • Morning routine is{' '}
              <span className="font-semibold text-[#365A46]">85% complete</span>. He is calm, receptive, and resting comfortably in the garden veranda.
            </p>
          </div>

          {/* Quick Top Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
            {/* Patient Selector */}
            <div className="flex items-center gap-2 bg-[#FAF5EB] border border-[rgba(70,80,60,0.12)] px-3 py-2 rounded-xl text-xs font-semibold">
              <User className="w-4 h-4 text-[#52745C]" />
              <select
                aria-label="Select Patient"
                value={activePatient.id}
                onChange={(e) => {
                  const target = allPatients.find((p) => p.id === e.target.value);
                  if (target) onSwitchPatient(target);
                }}
                className="bg-transparent text-xs font-bold text-[#1F342A] focus:outline-none cursor-pointer pr-1"
              >
                {allPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#FFFDF7] transition-all shadow-cognitiva-sm cursor-pointer hover:opacity-95"
              style={{ backgroundColor: '#52745C' }}
            >
              <Plus className="w-4 h-4" />
              <span>Log Care Entry</span>
            </button>

            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#1F342A] bg-[#E4EBDD] hover:bg-[#DCEADB] transition-all border border-[rgba(70,80,60,0.10)] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#52745C]" />
              <span>Clinical Export</span>
            </button>
          </div>
        </div>

        {/* Live Micro-Indicators strip */}
        <div className="mt-6 pt-4 border-t border-[rgba(70,80,60,0.08)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#1F342A]">
          <div className="p-3 rounded-xl bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm">
            <span className="block text-xs text-[#68736B]">Attendant on Duty</span>
            <span className="text-sm font-semibold flex items-center gap-1.5 mt-0.5 text-[#365A46]">
              <User className="w-4 h-4 text-[#52745C]" />
              Ratan D. (Assam Care)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm">
            <span className="block text-xs text-[#68736B]">Last Medication</span>
            <span className="text-sm font-semibold flex items-center gap-1.5 mt-0.5 text-[#365A46]">
              <CheckCircle className="w-4 h-4 text-[#52745C]" />
              Telmisartan (8:05 AM)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm">
            <span className="block text-xs text-[#68736B]">Next Engagement</span>
            <span className="text-sm font-semibold flex items-center gap-1.5 mt-0.5 text-[#365A46]">
              <Clock className="w-4 h-4 text-[#52745C]" />
              Granddaughter Call (4:30 PM)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm">
            <span className="block text-xs text-[#68736B]">Geofence Status</span>
            <span className="text-sm font-semibold flex items-center gap-1.5 mt-0.5 text-[#52745C]">
              <Home className="w-4 h-4 text-[#52745C]" />
              Inside Residence Zone
            </span>
          </div>
        </div>
      </section>

      {/* Export Success Message */}
      {showExportSuccess && (
        <div className="bg-[#E4EBDD] border border-[#CBD7C5] p-3.5 rounded-2xl text-[#365A46] text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>✓ Clinical trajectory report downloaded in standardized JSON format.</span>
        </div>
      )}

      {/* ─── PEACE OF MIND SNAPSHOT GRID (Reference 2) ─────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#1F342A]">Peace of Mind Snapshot</h2>
            <p className="text-xs text-[#68736B]">Live telemetry and emotional wellness signals updated recently.</p>
          </div>
          <span
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#365A46] px-3 py-1 rounded-full border border-[rgba(70,80,60,0.08)]"
            style={{ backgroundColor: '#E4EBDD' }}
          >
            <Activity className="w-3.5 h-3.5 text-[#52745C]" /> Smartband Synced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Reminiscence Activity Card */}
          <div
            className="rounded-[20px] p-5 border border-[rgba(70,80,60,0.08)] flex flex-col justify-between shadow-cognitiva hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[rgba(70,80,60,0.08)] text-[#365A46]"
                  style={{ backgroundColor: '#E4EBDD' }}
                >
                  <Volume2 className="w-3.5 h-3.5" /> Reminiscence Saathi
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#52745C]"></span>
              </div>
              <h3 className="font-serif font-bold text-base text-[#1F342A] mb-1">Morning Tea &amp; Raga</h3>
              <p className="text-xs text-[#68736B] leading-relaxed">
                Listening to <span className="font-semibold text-[#1F342A]">Borgeet vocal archives</span> via smart companion. Finished tea at 10:15 AM.
              </p>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#365A46] border-t border-[rgba(70,80,60,0.08)]">
              <span className="text-[#68736B]">Volume: Gentle (40%)</span>
              <span className="font-semibold">Active playback</span>
            </div>
          </div>

          {/* Card 2: Biometrics Card */}
          <div
            className="rounded-[20px] p-5 border border-[rgba(70,80,60,0.08)] flex flex-col justify-between shadow-cognitiva hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[rgba(70,80,60,0.08)] text-[#1F342A]"
                  style={{ backgroundColor: '#F5EFE4' }}
                >
                  <Activity className="w-3.5 h-3.5 text-[#52745C]" /> Biometrics
                </span>
                <span className="text-[11px] text-[#68736B]">8:00 AM Sync</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-[#FBF7EF] p-2 rounded-xl border border-[rgba(70,80,60,0.08)]">
                  <span className="text-[10px] text-[#68736B] block">Heart Rate</span>
                  <div className="font-serif font-bold text-sm text-[#1F342A]">72 <span className="text-[9px] font-normal text-[#68736B]">bpm</span></div>
                  <span className="text-[9px] font-semibold text-[#365A46]">Normal</span>
                </div>
                <div className="bg-[#FBF7EF] p-2 rounded-xl border border-[rgba(70,80,60,0.08)]">
                  <span className="text-[10px] text-[#68736B] block">Oxygen</span>
                  <div className="font-serif font-bold text-sm text-[#1F342A]">98%</div>
                  <span className="text-[9px] font-semibold text-[#365A46]">Normal</span>
                </div>
                <div className="bg-[#FBF7EF] p-2 rounded-xl border border-[rgba(70,80,60,0.08)]">
                  <span className="text-[10px] text-[#68736B] block">BP</span>
                  <div className="font-serif font-bold text-sm text-[#1F342A]">120 / 80</div>
                  <span className="text-[9px] font-semibold text-[#365A46]">Normal</span>
                </div>
                <div className="bg-[#FBF7EF] p-2 rounded-xl border border-[rgba(70,80,60,0.08)]">
                  <span className="text-[10px] text-[#68736B] block">Sleep</span>
                  <div className="font-serif font-bold text-sm text-[#1F342A]">7h 24m</div>
                  <span className="text-[9px] font-semibold text-[#365A46]">Good</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#68736B] border-t border-[rgba(70,80,60,0.08)] pt-2">
              <span>Verified by Attendant</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#52745C]" />
            </div>
          </div>

          {/* Card 3: Cognitive Ease Card */}
          <div
            className="rounded-[20px] p-5 border border-[rgba(70,80,60,0.08)] flex flex-col justify-between shadow-cognitiva hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[rgba(70,80,60,0.08)] text-[#1F342A]"
                  style={{ backgroundColor: '#EFE8DB' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#52745C]" /> Cognitive Ease
                </span>
                <span className="text-xs font-semibold text-[#68736B]">Weekly 82%</span>
              </div>

              <div className="flex items-center gap-3 my-2">
                <svg className="w-12 h-12 shrink-0 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#EFE8DB]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  ></path>
                  <path
                    className="text-[#52745C]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="82, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>
                </svg>
                <div>
                  <span className="block font-serif font-bold text-base text-[#1F342A] leading-none">
                    4 of 5
                  </span>
                  <span className="block text-xs text-[#68736B]">Daily memory games</span>
                </div>
              </div>

              <p className="text-xs text-[#68736B] mt-1 leading-snug">
                Recognized family photos promptly; cheerful emotional demeanor recorded.
              </p>
            </div>

            <div className="mt-3 text-xs text-[#365A46] font-semibold border-t border-[rgba(70,80,60,0.08)] pt-2">
              Next: Nature Sound Pairs (4:00 PM)
            </div>
          </div>

          {/* Card 4: Safe Haven Zone */}
          <div
            className="rounded-[20px] p-5 border border-[rgba(70,80,60,0.08)] flex flex-col justify-between shadow-cognitiva hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[rgba(70,80,60,0.08)] text-[#365A46]"
                  style={{ backgroundColor: '#E4EBDD' }}
                >
                  <Shield className="w-3.5 h-3.5" /> Safe Haven
                </span>
                <span className="text-xs text-[#52745C] font-semibold">GPS Stable</span>
              </div>

              <h3 className="font-serif font-bold text-base text-[#1F342A] mb-1">Guwahati Residence</h3>
              <p className="text-xs text-[#68736B] mb-2">
                Within 30m boundary radius. Zero wandering flags past 14 days.
              </p>

              <div className="h-14 w-full rounded-xl bg-[#F5EFE4] border border-[rgba(70,80,60,0.08)] flex items-center justify-center text-xs text-[#1F342A] gap-2">
                <Home className="w-4 h-4 text-[#52745C]" />
                <span className="font-semibold text-xs">Veranda • South Garden View</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs border-t border-[rgba(70,80,60,0.08)] pt-2">
              <span className="text-[#68736B]">Smart Tag Battery: 88%</span>
              <span className="text-[#365A46] font-semibold">Normal</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN WORKSPACE GRID: 2 COLUMNS (Reference 2) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Medication & Routine + Attendant Box (7 Cols) */}
        <section className="lg:col-span-7 space-y-6">
          <div
            className="p-5 sm:p-6 rounded-[20px] border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
            style={{ backgroundColor: '#FBF7EF' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#52745C] font-bold">
                  Caretaker Schedule
                </span>
                <h2 className="font-serif font-bold text-xl text-[#1F342A]">
                  Medication &amp; Daily Care Routine
                </h2>
              </div>

              <button
                onClick={() => setIsAddScheduleOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1F342A] bg-[#E4EBDD] hover:bg-[#DCEADB] transition-all border border-[rgba(70,80,60,0.08)] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#52745C]" />
                <span>+ Add Schedule Item</span>
              </button>
            </div>

            {/* Schedule Timeline List */}
            <div className="space-y-3">
              {scheduleItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-[rgba(70,80,60,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-cognitiva-sm"
                  style={{
                    backgroundColor: item.verified ? '#FAF5EB' : '#F5EFE4',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-[rgba(70,80,60,0.08)]"
                      style={{
                        backgroundColor: item.verified ? '#E4EBDD' : '#EFE8DB',
                        color: '#365A46',
                      }}
                    >
                      {item.category === 'medicine' ? (
                        <Pill className="w-5 h-5" />
                      ) : item.category === 'meal' ? (
                        <Coffee className="w-5 h-5" />
                      ) : (
                        <Video className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#68736B]">
                          {item.time} • {item.routine}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF5EB] text-[#1F342A] text-[10px] font-semibold border border-[rgba(70,80,60,0.08)]">
                          {item.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-[#1F342A] text-sm mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#68736B] mt-0.5">{item.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleScheduleItem(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        item.verified
                          ? 'bg-[#E4EBDD] text-[#365A46]'
                          : 'bg-[#52745C] text-[#FFFDF7] hover:bg-[#46654F]'
                      }`}
                    >
                      {item.verified ? '✓ Verified' : 'Mark Taken'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Dosage Note Alert */}
            <div className="mt-4 p-3 rounded-xl bg-[#E4EBDD]/60 border border-[rgba(70,80,60,0.08)] flex items-center justify-between text-xs text-[#365A46]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#52745C]" />
                <span>Refill reminder: Telmisartan 40mg stock has 8 days remaining.</span>
              </div>
              <button
                onClick={() => alert('Order dispatched to Silpukhuri Pharmacy.')}
                className="font-semibold underline hover:no-underline text-[#1F342A] cursor-pointer"
              >
                Order Refill
              </button>
            </div>
          </div>

          {/* Attendant Direct Communication Box */}
          <div
            className="p-5 sm:p-6 rounded-[20px] border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
            style={{ backgroundColor: '#FBF7EF' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full border border-[rgba(70,80,60,0.08)] flex items-center justify-center font-bold text-sm shadow-cognitiva-sm text-[#365A46]"
                  style={{ backgroundColor: '#E4EBDD' }}
                >
                  RD
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1F342A] leading-tight">
                    Ratan Deka (Day Attendant)
                  </h3>
                  <span className="text-xs text-[#52745C] font-semibold">
                    Active on duty since 7:30 AM • Silpukhuri Quarter
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:+919864012345"
                  className="w-9 h-9 rounded-xl bg-[#E4EBDD] hover:bg-[#DCEADB] border border-[rgba(70,80,60,0.08)] flex items-center justify-center text-[#365A46] transition-all"
                  title="Call Attendant"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => alert('Quick SMS dispatched to Attendant Ratan: Please check warm cardigan on veranda.')}
                  className="w-9 h-9 rounded-xl bg-[#E4EBDD] hover:bg-[#DCEADB] border border-[rgba(70,80,60,0.08)] flex items-center justify-center text-[#365A46] transition-all cursor-pointer"
                  title="Send SMS Quick Prompt"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Attendant Observation Note */}
            <div className="p-4 rounded-xl bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] text-[#1F342A]">
              <div className="flex items-center justify-between text-xs text-[#68736B] mb-1.5">
                <span>Attendant Shift Log Note</span>
                <span>Today, 10:20 AM</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#1F342A]">
                “Bhaben Da enjoyed the morning balcony sun and talked warmly about his Tezpur teaching days when he saw the garden birds. He drank all cardamom tea peacefully and completed 15 minutes of memory matching. Very cheerful and zero agitation today.”
              </p>
            </div>

            {/* Secondary Doctor Emergency Direct Line */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-[#68736B]">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#52745C]" />
                <span>Neurologist: Dr. Achyut Baruah (GNRC Guwahati)</span>
              </div>
              <div className="flex items-center gap-3">
                <a className="text-[#365A46] font-semibold hover:underline" href="tel:+919864012345">
                  Direct Clinic Dial
                </a>
                <span>•</span>
                <span>Next Review: 24th Nov</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Reminiscence & Memories Engine (5 Cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div
            className="p-5 sm:p-6 rounded-[20px] border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
            style={{ backgroundColor: '#FBF7EF' }}
          >
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider text-[#52745C] font-bold">
                Reminiscence Engine
              </span>
              <h2 className="font-serif font-bold text-xl text-[#1F342A]">
                Family Memories &amp; Prompts
              </h2>
              <p className="text-xs text-[#68736B] mt-1">
                Photos and audio snippets uploaded here are gently introduced during daily voice prompts.
              </p>
            </div>

            {/* Action Button: Add Memory */}
            <button
              onClick={() => setIsAddMemoryOpen(true)}
              className="w-full mb-4 py-3 rounded-xl text-[#FFFDF7] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-cognitiva-sm cursor-pointer hover:opacity-95"
              style={{ backgroundColor: '#52745C' }}
            >
              <Plus className="w-4 h-4" />
              <span>Upload Photo or Voice Prompt</span>
            </button>

            {/* Memory Cards Stream */}
            <div className="space-y-4">
              {/* Memory 1: Ward's Lake / Umiam Memory */}
              <div className="rounded-2xl overflow-hidden bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm">
                <div className="relative h-40 w-full bg-[#EFE8DB] overflow-hidden">
                  <img
                    alt="Family Trip Memory"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-[#365A46]/90 backdrop-blur text-[#FFFDF7] text-[10.5px] flex items-center gap-1 shadow-sm">
                    <Volume2 className="w-3 h-3" /> 45s Audio Note Attached
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-[#68736B] mb-1">
                    <span>Shillong Memory • Autumn</span>
                    <span className="text-[#52745C] font-semibold">Played 3x this week</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#1F342A]">
                    Trip to Ward’s Lake with Ananya
                  </h4>
                  <p className="text-xs text-[#68736B] mt-1 leading-snug">
                    Audio cue: <em>“Deuta, remember the cool autumn breeze by the wooden bridge?”</em> Spontaneous smile recorded.
                  </p>
                </div>
              </div>

              {/* Memory 2: Grandson Voice Note with Waveform */}
              <div className="p-4 rounded-2xl bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFE8DB] text-[#365A46] flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1F342A]">
                        Voice Note: Grandson Arnob
                      </h4>
                      <span className="text-[11px] text-[#68736B]">Scheduled 4:30 PM • 1m 12s</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#E4EBDD] text-[#1F342A] text-[10px] font-semibold">
                    Bilingual
                  </span>
                </div>

                <p className="text-xs text-[#68736B] mt-2">
                  “Koka, I scored two goals in soccer today! Baba said we will visit Guwahati this weekend.”
                </p>

                {/* Simulated Audio Waveform */}
                <div className="mt-3 p-2 rounded-xl bg-[#FBF7EF] border border-[rgba(70,80,60,0.08)] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#52745C] text-white flex items-center justify-center shrink-0 text-xs cursor-pointer">
                    ▶
                  </div>
                  <div className="flex-1 flex items-center gap-1 h-5">
                    <span className="w-1 h-2 bg-[#52745C] rounded-full"></span>
                    <span className="w-1 h-4 bg-[#52745C] rounded-full"></span>
                    <span className="w-1 h-2 bg-[#52745C] rounded-full"></span>
                    <span className="w-1 h-5 bg-[#365A46] rounded-full"></span>
                    <span className="w-1 h-3 bg-[#52745C] rounded-full"></span>
                    <span className="w-1 h-4 bg-[#52745C] rounded-full"></span>
                    <span className="w-1 h-2 bg-[#CBD7C5] rounded-full"></span>
                    <span className="w-1 h-3 bg-[#CBD7C5] rounded-full"></span>
                    <span className="w-1 h-2 bg-[#CBD7C5] rounded-full"></span>
                    <span className="w-1 h-4 bg-[#CBD7C5] rounded-full"></span>
                  </div>
                  <span className="text-[10px] font-mono text-[#68736B]">1:12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Caregiver Respite & Self-Care Micro Card */}
          <div className="bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] p-5 rounded-2xl shadow-cognitiva-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E4EBDD] text-[#365A46] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-[#52745C]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1F342A]">
                  Ananya, remember your rest too
                </h4>
                <p className="text-xs text-[#68736B] mt-0.5 leading-relaxed">
                  You have overseen 28 days of uninterrupted stability for your father. Attendant Ratan is on shift until 6:00 PM. Take a mindful pause.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ─── CLINICAL CVI TRAJECTORY & RADAR CHARTS ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 30-Day Cognitive Trajectory Line Chart */}
        <div
          className="lg:col-span-7 p-5 sm:p-6 rounded-[20px] border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
          style={{ backgroundColor: '#FBF7EF' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#52745C]">
                Clinical Trajectory
              </span>
              <h3 className="font-serif font-bold text-lg text-[#1F342A]">
                30-Day Cognitive Vitality Trend
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E4EBDD] text-[#365A46]">
              {cvi.trend === 'improving' ? '↑ Improving & Positive' : cvi.trend === 'stable' ? '→ Steady' : '↓ Attention Advised'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD7C5" opacity={0.4} />
                <XAxis dataKey="date" stroke="#68736B" fontSize={11} />
                <YAxis domain={[40, 100]} stroke="#68736B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF6EE',
                    borderRadius: '12px',
                    borderColor: 'rgba(70, 80, 60, 0.12)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#52745C"
                  strokeWidth={2.5}
                  dot={{ fill: '#365A46', r: 3 }}
                  name="CVI Vitality"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7 Cognitive Domains Radar Chart */}
        <div
          className="lg:col-span-5 p-5 sm:p-6 rounded-[20px] border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
          style={{ backgroundColor: '#FBF7EF' }}
        >
          <div className="mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52745C]">
              Cognitive Domains
            </span>
            <h3 className="font-serif font-bold text-lg text-[#1F342A]">
              Multidimensional Assessment
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#CBD7C5" />
                <PolarAngleAxis dataKey="domain" stroke="#1F342A" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#68736B" fontSize={9} />
                <Radar
                  name="Domains"
                  dataKey="value"
                  stroke="#365A46"
                  fill="#52745C"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── MODAL 1: ADD SCHEDULE ITEM ─────────────────────────────────── */}
      {isAddScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FBF7EF] rounded-[20px] p-6 max-w-lg w-full shadow-2xl border border-[rgba(70,80,60,0.08)] relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#1F342A]">
                Add Routine or Medicine
              </h3>
              <button
                onClick={() => setIsAddScheduleOpen(false)}
                className="p-1 text-[#68736B] hover:bg-[#F5EFE4] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddScheduleOpen(false);
                alert('Schedule item saved and synced.');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-[#68736B] mb-1">Item Title or Medicine</label>
                <input
                  required
                  placeholder="e.g. Donepezil 5mg or Afternoon Balcony Walk"
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF5EB] text-[#1F342A] text-sm border border-[rgba(70,80,60,0.12)] focus:outline-none focus:ring-2 focus:ring-[#52745C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#68736B] mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    defaultValue="14:00"
                    className="w-full h-11 px-3 rounded-xl bg-[#FAF5EB] text-[#1F342A] text-sm border border-[rgba(70,80,60,0.12)] focus:outline-none focus:ring-2 focus:ring-[#52745C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#68736B] mb-1">Category</label>
                  <select className="w-full h-11 px-3 rounded-xl bg-[#FAF5EB] text-[#1F342A] text-sm border border-[rgba(70,80,60,0.12)] focus:outline-none focus:ring-2 focus:ring-[#52745C]">
                    <option>Prescription Medicine</option>
                    <option>Meal &amp; Hydration</option>
                    <option>Physical Stroll</option>
                    <option>Family Call</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#68736B] hover:bg-[#F5EFE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#52745C] text-[#FFFDF7] text-xs font-semibold cursor-pointer shadow-sm hover:bg-[#46654F]"
                >
                  Save Schedule Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: UPLOAD MEMORY ──────────────────────────────────────── */}
      {isAddMemoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FBF7EF] rounded-[20px] p-6 max-w-lg w-full shadow-2xl border border-[rgba(70,80,60,0.08)] relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#1F342A]">
                Upload Memory for Saathi
              </h3>
              <button
                onClick={() => setIsAddMemoryOpen(false)}
                className="p-1 text-[#68736B] hover:bg-[#F5EFE4] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddMemoryOpen(false);
                alert('Memory uploaded! Saathi will gently weave this into your father’s day.');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-[#68736B] mb-1">Story Title / Description</label>
                <input
                  required
                  placeholder="e.g. Diwali celebration with Arnob at Umiam Lake"
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF5EB] text-[#1F342A] text-sm border border-[rgba(70,80,60,0.12)] focus:outline-none focus:ring-2 focus:ring-[#52745C]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#FAF5EB] border border-[rgba(70,80,60,0.08)] text-center">
                <span className="text-xs font-semibold text-[#1F342A] block">Select Old Family Photo</span>
                <input
                  type="file"
                  className="text-xs text-[#68736B] mt-2 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:bg-[#E4EBDD] file:text-[#1F342A] file:border-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemoryOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#68736B] hover:bg-[#F5EFE4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#52745C] text-[#FFFDF7] text-xs font-semibold cursor-pointer shadow-sm hover:bg-[#46654F]"
                >
                  Add to Story Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: QUICK LOG CARE ENTRY ───────────────────────────────── */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FBF7EF] rounded-[20px] p-6 max-w-sm w-full shadow-2xl border border-[rgba(70,80,60,0.08)] relative text-center">
            <h3 className="font-serif font-bold text-lg text-[#1F342A] mb-1">Log New Observation</h3>
            <p className="text-xs text-[#68736B] mb-4">Quickly record vitals, mood, or meal consumption.</p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <button
                onClick={() => {
                  alert('Logged BP reading (120/80)');
                  setIsQuickAddOpen(false);
                }}
                className="p-3 rounded-xl bg-[#FAF5EB] hover:bg-[#F5EFE4] border border-[rgba(70,80,60,0.08)] flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-5 h-5 text-[#52745C]" />
                <span className="font-semibold text-[#1F342A]">Log BP &amp; Pulse</span>
              </button>

              <button
                onClick={() => {
                  alert('Logged Meal status: Lunch completed');
                  setIsQuickAddOpen(false);
                }}
                className="p-3 rounded-xl bg-[#FAF5EB] hover:bg-[#F5EFE4] border border-[rgba(70,80,60,0.08)] flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Coffee className="w-5 h-5 text-[#52745C]" />
                <span className="font-semibold text-[#1F342A]">Log Meal</span>
              </button>

              <button
                onClick={() => {
                  alert('Recorded Cheerful Mood');
                  setIsQuickAddOpen(false);
                }}
                className="p-3 rounded-xl bg-[#FAF5EB] hover:bg-[#F5EFE4] border border-[rgba(70,80,60,0.08)] flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Smile className="w-5 h-5 text-[#52745C]" />
                <span className="font-semibold text-[#1F342A]">Record Mood</span>
              </button>

              <button
                onClick={() => {
                  alert('Dispatched note to Attendant Ratan');
                  setIsQuickAddOpen(false);
                }}
                className="p-3 rounded-xl bg-[#FAF5EB] hover:bg-[#F5EFE4] border border-[rgba(70,80,60,0.08)] flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-[#52745C]" />
                <span className="font-semibold text-[#1F342A]">Attendant Task</span>
              </button>
            </div>

            <button
              onClick={() => setIsQuickAddOpen(false)}
              className="w-full py-2 rounded-xl bg-[#E4EBDD] text-[#1F342A] text-xs font-semibold hover:bg-[#DCEADB] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Role-Based Privacy & Consent Modal */}
      <CaregiverPrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
      />
    </div>
  );
};

export default CaregiverDashboard;

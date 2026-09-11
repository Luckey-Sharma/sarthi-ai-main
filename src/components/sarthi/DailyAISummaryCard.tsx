import React from 'react';
import { PatientHealthRecord } from '../../types/healthCompanion';
import { Language, AppView, GameId } from '../../types';
import { Sparkles, ArrowRight, Play, CheckCircle2, Moon, Footprints, Pill, HeartPulse, Brain, Droplets } from 'lucide-react';

interface DailyAISummaryCardProps {
  patient: PatientHealthRecord;
  language: Language;
  onNavigate: (view: AppView, gameId?: GameId) => void;
  onOpenAISaathi: (initialQuery?: string) => void;
}

export const DailyAISummaryCard: React.FC<DailyAISummaryCardProps> = ({
  patient,
  language,
  onNavigate,
  onOpenAISaathi,
}) => {
  const vitals = patient.vitalsHistory?.[0];
  const steps = vitals?.steps || 1420;
  const sleepHours = vitals?.sleepHours || 6.3;
  const sleepH = Math.floor(sleepHours);
  const sleepM = Math.round((sleepHours - sleepH) * 60);
  const bp = vitals?.bloodPressure ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}` : '128/82';
  const morningMed = patient.currentMedications.find((m) => m.timeOfDay === 'morning');

  const greeting = {
    en: `Good day, ${patient.name}`,
    hi: `शुभ दिन, ${patient.name} जी`,
    as: `নমস্কাৰ, ${patient.name}`,
    bn: `সুপ্রভাত, ${patient.name}`,
    mni: `Khurumjari, ${patient.name}`,
  }[language] || `Good day, ${patient.name}`;

  const subtitle = {
    en: 'Your Day with AI Saathi',
    hi: 'एआई सारथी के साथ आपका दिन',
    as: 'এআই সাৰথীৰ সৈতে আপোনাৰ দিনটো',
    bn: 'এআই সারথীর সাথে আপনার দিন',
    mni: 'AI Saathi ga loinana nongma',
  }[language] || 'Your Day with AI Saathi';

  return (
    <div className="bg-gradient-to-br from-[#ffffff] via-[#f7faf5] to-[#edf4ea] p-6 sm:p-7 rounded-3xl border-2 border-[#bfebba] shadow-lg relative overflow-hidden font-sans">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#bfebba]/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#032517] text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#bfebba]" />
              <span>{subtitle}</span>
            </span>
            <span className="text-xs font-bold text-[#416740] bg-[#bfebba]/60 px-2.5 py-0.5 rounded-full border border-[#416740]/20">
              Personalized AI Summary
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#032517]">
            {greeting}
          </h2>

          {/* Key Insights Noticed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/80 border border-[#becabf]/60 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#ecefea] flex items-center justify-center text-indigo-700 shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#181d19]">
                You slept <strong>{sleepH}h {sleepM}m</strong> last night ({vitals?.sleepQuality || 'fair'}).
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/80 border border-[#becabf]/60 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#ecefea] flex items-center justify-center text-emerald-700 shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#181d19]">
                Morning <strong>{morningMed?.name || 'Telmisartan'}</strong> completed.
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/80 border border-[#becabf]/60 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#ecefea] flex items-center justify-center text-amber-700 shrink-0">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#181d19]">
                Activity: <strong>{steps.toLocaleString()} steps</strong> (light morning pace).
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/80 border border-[#becabf]/60 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#ecefea] flex items-center justify-center text-rose-700 shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#181d19]">
                Blood Pressure: <strong>{bp} mmHg</strong> (stable on routine).
              </span>
            </div>
          </div>

          {/* Suggested Next Action */}
          <div className="pt-2 text-xs sm:text-sm text-[#3e4941] font-medium flex items-center gap-2">
            <span className="font-bold text-[#032517]">Suggested Next Step:</span>
            <span>After breakfast, try the 5-minute Memory Match card activity.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('games', 'memory_match')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#032517] text-white hover:bg-[#416740] font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Activity</span>
          </button>

          <button
            onClick={() => onOpenAISaathi('What should I eat today to stay healthy?')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#f7faf5] text-[#032517] font-bold text-xs border border-[#becabf] shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#416740]" />
            <span>Ask AI Saathi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

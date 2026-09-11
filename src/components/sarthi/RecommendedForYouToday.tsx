import React from 'react';
import { PatientHealthRecord } from '../../types/healthCompanion';
import { Language, AppView, GameId } from '../../types';
import {
  Utensils,
  Footprints,
  Droplet,
  Brain,
  Moon,
  Pill,
  Heart,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface RecommendedForYouTodayProps {
  patient: PatientHealthRecord;
  language: Language;
  onNavigate: (view: AppView, gameId?: GameId) => void;
  onOpenAISaathiWithQuery: (query: string) => void;
}

export const RecommendedForYouToday: React.FC<RecommendedForYouTodayProps> = ({
  patient,
  language,
  onNavigate,
  onOpenAISaathiWithQuery,
}) => {
  const vitals = patient.vitalsHistory?.[0];
  const steps = vitals?.steps || 1420;
  const sleepHours = vitals?.sleepHours || 6.3;
  const isPoorSleep = vitals?.sleepQuality === 'poor' || sleepHours < 5.5;
  const isLowSteps = steps < 2500;
  const isVeg = patient.dietPreference === 'vegetarian';

  const cards = [
    {
      id: 'rec-breakfast',
      title: isVeg ? 'Vegetable Poha + Curd' : 'Steamed Fish & Green Vegetables',
      subtitle: isVeg
        ? 'Light vegetarian carbs + digestion-friendly protein'
        : 'High-protein, low-glycemic senior nutrition',
      tag: 'Breakfast',
      icon: <Utensils className="w-5 h-5 text-emerald-700" />,
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      query: 'What should I eat for breakfast today?',
    },
    {
      id: 'rec-hydration',
      title: `${vitals?.waterGlasses || 4} of 8 Glasses Logged`,
      subtitle: 'Drink 1 fresh glass before your morning activity',
      tag: 'Hydration',
      icon: <Droplet className="w-5 h-5 text-blue-700" />,
      tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
      query: 'How much water should I drink today?',
    },
    {
      id: 'rec-activity',
      title: isPoorSleep
        ? 'Gentle Seated Breathing & Arm Stretches'
        : isLowSteps
        ? '15-Minute Garden Stroll'
        : 'Restorative Post-Walk Stretch',
      subtitle: isPoorSleep
        ? 'Low exertion recommended after 4.8h sleep'
        : `${steps.toLocaleString()} steps today; safe for blood pressure`,
      tag: 'Activity',
      icon: <Footprints className="w-5 h-5 text-amber-700" />,
      tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
      query: 'Can I go for a walk today?',
    },
    {
      id: 'rec-game',
      title: 'Memory Match (Level 2)',
      subtitle: 'Stimulates visual-spatial recall and focus',
      tag: 'Brain Health',
      icon: <Brain className="w-5 h-5 text-purple-700" />,
      tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
      action: () => onNavigate('games', 'memory_match'),
    },
    {
      id: 'rec-lunch',
      title: isVeg ? 'Moong Dal Khichdi + Lauki Sabzi' : 'Light Fish Broth with Joha Rice',
      subtitle: 'Gentle on stomach, low added salt for blood pressure',
      tag: 'Lunch',
      icon: <Utensils className="w-5 h-5 text-teal-700" />,
      tagColor: 'bg-teal-100 text-teal-800 border-teal-300',
      query: 'What should I eat for lunch today?',
    },
    {
      id: 'rec-rest',
      title: isPoorSleep ? '30-Minute Restful Eye-Rest' : '20-Minute Calming Sound Session',
      subtitle: 'Supports glymphatic recovery and stress reduction',
      tag: 'Rest',
      icon: <Moon className="w-5 h-5 text-indigo-700" />,
      tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      action: () => onNavigate('calming'),
    },
    {
      id: 'rec-meds',
      title: 'Donepezil (5mg) at 09:00 PM',
      subtitle: 'Bedtime memory support • Morning Telmisartan taken',
      tag: 'Medicine',
      icon: <Pill className="w-5 h-5 text-rose-700" />,
      tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
      action: () => onNavigate('reminders'),
    },
    {
      id: 'rec-social',
      title: 'Family Recall with Ananya',
      subtitle: 'Review childhood photos and lake bicycle memory',
      tag: 'Connection',
      icon: <Heart className="w-5 h-5 text-pink-700" />,
      tagColor: 'bg-pink-100 text-pink-800 border-pink-300',
      action: () => onNavigate('family'),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#bfebba] text-[#032517] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#416740]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#032517]">
              Recommended for You Today
            </h3>
            <p className="text-xs text-[#6f7a70]">
              Personalized health actions derived from your 7-day vitals, diet, and sleep data.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAISaathiWithQuery('What activity should I do today?')}
          className="text-xs font-bold text-[#416740] hover:text-[#032517] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Ask AI Saathi</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((c) => (
          <div
            key={c.id}
            onClick={() => {
              if (c.query) onOpenAISaathiWithQuery(c.query);
              else if (c.action) c.action();
            }}
            className="group p-4 rounded-2xl bg-white hover:bg-[#f7faf5] border border-[#becabf]/60 hover:border-[#416740] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ecefea] flex items-center justify-center">
                  {c.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.tagColor}`}>
                  {c.tag}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#032517] group-hover:text-[#416740] transition-colors leading-snug">
                {c.title}
              </h4>
              <p className="text-xs text-[#6f7a70] mt-1 leading-relaxed">
                {c.subtitle}
              </p>
            </div>

            <div className="pt-3 mt-2 border-t border-[#becabf]/30 flex items-center justify-between text-[11px] font-bold text-[#416740]">
              <span>{c.query ? 'Explore with AI Saathi' : 'Open Section'}</span>
              <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

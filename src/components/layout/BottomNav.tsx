import React from 'react';
import { AppMode, AppView, Language } from '../../types';
import {
  Home,
  Gamepad2,
  Image,
  CalendarCheck,
  Sparkles,
  Activity,
} from 'lucide-react';

interface BottomNavProps {
  currentView: AppView;
  currentMode: AppMode;
  language: Language;
  onNavigate: (view: AppView) => void;
  onToggleMode: (mode: AppMode) => void;
  onOpenAISaathi: () => void;
  onOpenSOS: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  currentMode,
  language,
  onNavigate,
  onToggleMode,
  onOpenAISaathi,
}) => {
  const labels: Record<string, Record<Language, string>> = {
    home: {
      en: 'Home',
      hi: 'होम',
      as: 'মুখ্য',
      bn: 'হোম',
      mni: 'মায়ুম',
    },
    games: {
      en: 'Games',
      hi: 'खेल',
      as: 'খেল',
      bn: 'খেলা',
      mni: 'খেল',
    },
    saathi: {
      en: 'Saathi',
      hi: 'साथी',
      as: 'সাৰথী',
      bn: 'সারথী',
      mni: 'সাথী',
    },
    memories: {
      en: 'Memories',
      hi: 'यादें',
      as: 'স্মৃতি',
      bn: 'স্মৃতি',
      mni: 'নিংশিংবা',
    },
    routine: {
      en: 'My Day',
      hi: 'दिनचर्या',
      as: 'দিনলিপি',
      bn: 'দিনলিপি',
      mni: 'দিনচৰ্যা',
    },
    caregiver: {
      en: 'Portal',
      hi: 'पोर्टल',
      as: 'পৰ্টেল',
      bn: 'পোর্টাল',
      mni: 'পোর্টেল',
    },
  };

  const isHomeActive = currentMode === 'elderly' && currentView === 'home';
  const isGamesActive =
    currentMode === 'elderly' &&
    (currentView === 'games' || currentView === 'game_detail');
  const isMemoriesActive = currentMode === 'elderly' && currentView === 'family';
  const isRoutineActive = currentMode === 'elderly' && currentView === 'reminders';
  const isCaregiverActive = currentMode === 'caregiver';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-t border-[rgba(70,80,60,0.12)] shadow-[0_-4px_20px_rgba(70,80,60,0.08)] px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom,8px))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Item 1: Home */}
        <button
          onClick={() => {
            if (currentMode !== 'elderly') onToggleMode('elderly');
            onNavigate('home');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer min-h-[50px] ${
            isHomeActive
              ? 'text-[#365A46]'
              : 'text-[#68736B] hover:text-[#1F342A]'
          }`}
          aria-label={labels.home[language] || labels.home.en}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              isHomeActive ? 'bg-[#E4EBDD] scale-105' : ''
            }`}
          >
            <Home
              className="w-5 h-5"
              strokeWidth={isHomeActive ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[10.5px] mt-0.5 tracking-tight font-medium ${
              isHomeActive ? 'font-bold text-[#365A46]' : ''
            }`}
          >
            {labels.home[language] || labels.home.en}
          </span>
        </button>

        {/* Item 2: Games */}
        <button
          onClick={() => {
            if (currentMode !== 'elderly') onToggleMode('elderly');
            onNavigate('games');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer min-h-[50px] ${
            isGamesActive
              ? 'text-[#365A46]'
              : 'text-[#68736B] hover:text-[#1F342A]'
          }`}
          aria-label={labels.games[language] || labels.games.en}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              isGamesActive ? 'bg-[#E4EBDD] scale-105' : ''
            }`}
          >
            <Gamepad2
              className="w-5 h-5"
              strokeWidth={isGamesActive ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[10.5px] mt-0.5 tracking-tight font-medium ${
              isGamesActive ? 'font-bold text-[#365A46]' : ''
            }`}
          >
            {labels.games[language] || labels.games.en}
          </span>
        </button>

        {/* Item 3: Center Elevated AI Saathi Companion */}
        <button
          onClick={onOpenAISaathi}
          className="flex flex-col items-center justify-center flex-1 -mt-5 cursor-pointer group"
          aria-label="Talk to AI Saathi Companion"
        >
          <div
            className="w-13 h-13 rounded-full bg-[#032517] border-3 border-[#bfebba] text-[#bfebba] flex items-center justify-center shadow-lg shadow-[#032517]/30 group-active:scale-95 transition-transform"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10.5px] mt-0.5 font-bold text-[#032517] tracking-tight">
            {labels.saathi[language] || labels.saathi.en}
          </span>
        </button>

        {/* Item 4: Memories / Family */}
        <button
          onClick={() => {
            if (currentMode !== 'elderly') onToggleMode('elderly');
            onNavigate('family');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer min-h-[50px] ${
            isMemoriesActive
              ? 'text-[#365A46]'
              : 'text-[#68736B] hover:text-[#1F342A]'
          }`}
          aria-label={labels.memories[language] || labels.memories.en}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              isMemoriesActive ? 'bg-[#E4EBDD] scale-105' : ''
            }`}
          >
            <Image
              className="w-5 h-5"
              strokeWidth={isMemoriesActive ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[10.5px] mt-0.5 tracking-tight font-medium ${
              isMemoriesActive ? 'font-bold text-[#365A46]' : ''
            }`}
          >
            {labels.memories[language] || labels.memories.en}
          </span>
        </button>

        {/* Item 5: My Day / Routine OR Caregiver Portal */}
        {currentMode === 'elderly' ? (
          <button
            onClick={() => onNavigate('reminders')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer min-h-[50px] ${
              isRoutineActive
                ? 'text-[#365A46]'
                : 'text-[#68736B] hover:text-[#1F342A]'
            }`}
            aria-label={labels.routine[language] || labels.routine.en}
          >
            <div
              className={`px-3 py-1 rounded-full transition-all ${
                isRoutineActive ? 'bg-[#E4EBDD] scale-105' : ''
              }`}
            >
              <CalendarCheck
                className="w-5 h-5"
                strokeWidth={isRoutineActive ? 2.5 : 2}
              />
            </div>
            <span
              className={`text-[10.5px] mt-0.5 tracking-tight font-medium ${
                isRoutineActive ? 'font-bold text-[#365A46]' : ''
              }`}
            >
              {labels.routine[language] || labels.routine.en}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onToggleMode('elderly')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer min-h-[50px] ${
              isCaregiverActive
                ? 'text-[#365A46]'
                : 'text-[#68736B] hover:text-[#1F342A]'
            }`}
            aria-label="Switch to Senior Mode"
          >
            <div
              className={`px-3 py-1 rounded-full transition-all ${
                isCaregiverActive ? 'bg-[#E4EBDD] scale-105' : ''
              }`}
            >
              <Activity
                className="w-5 h-5"
                strokeWidth={isCaregiverActive ? 2.5 : 2}
              />
            </div>
            <span
              className={`text-[10.5px] mt-0.5 tracking-tight font-medium ${
                isCaregiverActive ? 'font-bold text-[#365A46]' : ''
              }`}
            >
              {labels.caregiver[language] || labels.caregiver.en}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;

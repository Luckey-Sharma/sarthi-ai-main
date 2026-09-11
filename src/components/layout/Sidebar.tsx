import React from 'react';
import { AppMode, AppView, Language } from '../../types';
import {
  Home,
  User,
  Image,
  Gamepad2,
  CalendarCheck,
  TrendingUp,
  Bot,
  BellRing,
  Settings,
  ShieldAlert,
  Sparkles,
  Heart,
  HeartHandshake,
} from 'lucide-react';
import { t } from '../../i18n';

interface SidebarProps {
  currentView: AppView;
  currentMode: AppMode;
  language: Language;
  onNavigate: (view: AppView) => void;
  onToggleMode: (mode: AppMode) => void;
  onOpenAISaathi: () => void;
  onOpenSOS: () => void;
  onOpenOnboarding: () => void;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentMode,
  language,
  onNavigate,
  onToggleMode,
  onOpenAISaathi,
  onOpenSOS,
  onOpenOnboarding,
  onCloseMobileDrawer,
}) => {
  const handleItemClick = (action: () => void) => {
    action();
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const navItemLabels: Record<string, Record<Language, string>> = {
    home: {
      en: 'Home',
      hi: 'मुख्य पृष्ठ',
      as: 'মুখ্য পৃষ্ঠা',
      bn: 'হোম',
      mni: 'মায়ুম (Home)',
    },
    patient_profile: {
      en: 'Patient Profile',
      hi: 'रोगी प्रोफ़ाइल',
      as: 'ৰোগীৰ পৰিচয়',
      bn: 'রোগীর প্রোফাইল',
      mni: 'অনাবাগী মশক',
    },
    family: {
      en: 'Memories',
      hi: 'यादें और परिवार',
      as: 'স্মৃতি আৰু পৰিয়াল',
      bn: 'স্মৃতি ও পরিবার',
      mni: 'ইমুং অমসুং নিংশিংবা',
    },
    games: {
      en: 'Games & Activities',
      hi: 'खेल व गतिविधियाँ',
      as: 'মগজুৰ খেল',
      bn: 'মস্তিষ্কের খেলা',
      mni: 'পুক্নিংগী খেল',
    },
    routine: {
      en: 'Daily Routine',
      hi: 'दैनिक दिनचर्या',
      as: 'দৈনিক ৰুটিন',
      bn: 'দৈনিক রুটিন',
      mni: 'নুমিৎখুদিংগী থবক',
    },
    progress: {
      en: 'Progress & Insights',
      hi: 'प्रगति व अंतर्दृष्टि',
      as: 'প্ৰগতি আৰু সূচক',
      bn: 'অগ্রগতি ও রিপোর্ট',
      mni: 'চাউখৎপগী পাউদম',
    },
    ai_assistant: {
      en: 'AI Assistant',
      hi: 'एआई साथी',
      as: 'সাৰথী সহায়ক',
      bn: 'সারথী সহায়ক',
      mni: 'AI সাথী মতেং',
    },
    calming: {
      en: 'Calm Sanctuary',
      hi: 'प्रशांत वाटिका',
      as: 'প্ৰশান্তি আৰু ধ্যান',
      bn: 'প্রশান্তি কেন্দ্র',
      mni: 'নুংশিবা সেঙ্কচুৱারী',
    },
    emergency: {
      en: 'Alerts & SOS',
      hi: 'सुरक्षा व अलर्ट',
      as: 'জৰুৰী সতৰ্কতা',
      bn: 'জরুরী সতর্কতা',
      mni: 'ইমার্জেন্সী SOS',
    },
    settings: {
      en: 'Settings',
      hi: 'सेटिंग्स',
      as: 'ছেটিংছ / ছেটআপ',
      bn: 'সেটিংস',
      mni: 'সেটিংস',
    },
  };

  const navItems = [
    {
      id: 'home',
      label: navItemLabels.home[language] || navItemLabels.home.en,
      icon: Home,
      isActive: currentMode === 'elderly' && currentView === 'home',
      onClick: () => {
        if (currentMode !== 'elderly') onToggleMode('elderly');
        onNavigate('home');
      },
    },
    {
      id: 'patient_profile',
      label: navItemLabels.patient_profile[language] || navItemLabels.patient_profile.en,
      icon: User,
      isActive: currentMode === 'caregiver',
      onClick: () => {
        if (currentMode !== 'caregiver') onToggleMode('caregiver');
      },
    },
    {
      id: 'family',
      label: navItemLabels.family[language] || navItemLabels.family.en,
      icon: Image,
      isActive: currentMode === 'elderly' && currentView === 'family',
      onClick: () => {
        if (currentMode !== 'elderly') onToggleMode('elderly');
        onNavigate('family');
      },
    },
    {
      id: 'games',
      label: navItemLabels.games[language] || navItemLabels.games.en,
      icon: Gamepad2,
      isActive: currentMode === 'elderly' && (currentView === 'games' || currentView === 'game_detail'),
      onClick: () => {
        if (currentMode !== 'elderly') onToggleMode('elderly');
        onNavigate('games');
      },
    },
    {
      id: 'routine',
      label: navItemLabels.routine[language] || navItemLabels.routine.en,
      icon: CalendarCheck,
      isActive: currentMode === 'elderly' && currentView === 'reminders',
      onClick: () => {
        if (currentMode !== 'elderly') onToggleMode('elderly');
        onNavigate('reminders');
      },
    },
    {
      id: 'progress',
      label: navItemLabels.progress[language] || navItemLabels.progress.en,
      icon: TrendingUp,
      isActive: currentMode === 'caregiver',
      onClick: () => {
        if (currentMode !== 'caregiver') onToggleMode('caregiver');
      },
    },
    {
      id: 'ai_assistant',
      label: navItemLabels.ai_assistant[language] || navItemLabels.ai_assistant.en,
      icon: Bot,
      isActive: false,
      onClick: onOpenAISaathi,
      badge: 'AI',
    },
    {
      id: 'calming',
      label: navItemLabels.calming[language] || navItemLabels.calming.en,
      icon: Heart,
      isActive: currentMode === 'elderly' && currentView === 'calming',
      onClick: () => {
        if (currentMode !== 'elderly') onToggleMode('elderly');
        onNavigate('calming');
      },
    },
    {
      id: 'emergency',
      label: navItemLabels.emergency[language] || navItemLabels.emergency.en,
      icon: BellRing,
      isActive: currentMode === 'elderly' && currentView === 'emergency',
      onClick: onOpenSOS,
      hasDot: true,
    },
    {
      id: 'settings',
      label: navItemLabels.settings[language] || navItemLabels.settings.en,
      icon: Settings,
      isActive: false,
      onClick: onOpenOnboarding,
    },
  ];

  return (
    <aside
      className="w-64 p-5 flex flex-col justify-between shrink-0 select-none z-20 border-r border-[rgba(70,80,60,0.08)] bg-[#F8F3E9]"
      data-purpose="primary-navigation"
    >
      <div>
        {/* Brand Logo Header */}
        <div
          onClick={() => {
            if (currentMode !== 'elderly') onToggleMode('elderly');
            onNavigate('home');
          }}
          className="flex items-center gap-3 px-2 py-1 mb-8 cursor-pointer group"
          data-purpose="brand-identity"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#FFFDF7] shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: '#52745C' }}
          >
            {/* Gentle Sprout / Lotus Icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path className="opacity-25 fill-current" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"></path>
              <path d="M12 22v-9"></path>
              <path d="M8 10c0-2.2 1.8-4 4-4s4 1.8 4 4"></path>
              <path d="M7 16c2-1.5 5-2 5-2s3 .5 5 2"></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-serif font-bold text-xl text-[#1F342A] tracking-tight leading-none">
                SmritiAI
              </span>
            </div>
            <p className="text-[10.5px] font-medium text-[#68736B] mt-1 tracking-wide">
              {language === 'hi'
                ? 'स्मृतियाँ • मन • अपनापन'
                : language === 'as'
                ? 'স্মৃতি • মন • একতা'
                : language === 'bn'
                ? 'স্মৃতি • মন • একতা'
                : language === 'mni'
                ? 'নিংশিংবা • ৱাখল • পুনশি'
                : 'Memories • Mind • Together'}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav aria-label="Main Navigation" className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.onClick)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer text-left ${
                  item.isActive
                    ? 'font-semibold shadow-sm'
                    : 'text-[#68736B] hover:text-[#1F342A] hover:bg-[#EAE4D7]/60'
                }`}
                style={
                  item.isActive
                    ? {
                        backgroundColor: '#E4EBDD',
                        color: '#365A46',
                        boxShadow: '0 2px 8px rgba(70, 60, 40, 0.04)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 ${
                        item.isActive ? 'text-[#365A46]' : 'text-[#8A918A]'
                      }`}
                      strokeWidth={item.isActive ? 2.2 : 1.8}
                    />
                    {item.hasDot && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C96868] border-2 border-[#FAF6EE] rounded-full"></span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#52745C] text-[#FFFDF7]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Botanical Motif & Cultural Quote */}
      <div
        className="relative pt-6 pb-2 px-3 border-t border-[rgba(70,80,60,0.08)]"
        data-purpose="sidebar-cultural-card"
      >
        <div className="flex items-center gap-2 mb-2 text-[#52745C]">
          {/* Hand-drawn leaf branch representation */}
          <svg
            className="w-8 h-8 text-[#52745C]/80 -rotate-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C7 5 5 11 6 18c3-1 8-3 10-8 1-3 0-6-4-8z" fill="#CBD7C5" fillOpacity="0.45"></path>
            <path d="M6 18c4-3 9-6 12-14"></path>
            <path d="M9 12c2-1 4-1 6 0"></path>
            <path d="M8 15c2-1 5-1 7 0"></path>
          </svg>
          <div className="h-px flex-1 bg-[rgba(70,80,60,0.12)]"></div>
        </div>
        <p className="font-serif italic text-[12.5px] leading-relaxed text-[#1F342A] font-medium tracking-tight">
          {language === 'hi'
            ? '"पूर्वोत्तर की पहाड़ियों से, एक सुनहरे कल की ओर।"'
            : language === 'as'
            ? '"উত্তৰ-পূবৰ পাহাৰৰ পৰা, এটি উজ্জ্বল কাইলৈ।"'
            : language === 'bn'
            ? '"উত্তর-পূর্বের পাহাড় থেকে, উজ্জ্বল আগামীর দিকে।"'
            : language === 'mni'
            ? '"নোংপোক চীংচাওদগী, হেন্না নুংঙাইরবা কন্দললোই।"'
            : '"From the hills of the North East, to brighter tomorrows."'}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

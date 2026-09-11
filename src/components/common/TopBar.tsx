import React, { useState, useEffect } from 'react';
import { AppMode, Language, PatientProfile, SyncStatus } from '../../types';
import {
  ShieldAlert,
  Sparkles,
  UserCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Search,
  Mic,
  Globe,
  Bell,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { t } from '../../i18n';
import { subscribeSyncStatus } from '../../services/syncService';

interface TopBarProps {
  mode: AppMode;
  onToggleMode: (newMode: AppMode) => void;
  language: Language;
  onLanguageChange: (newLang: Language) => void;
  activePatient: PatientProfile;
  onOpenSOS: () => void;
  onOpenOnboarding: () => void;
  onOpenLanguageModal?: () => void;
  onOpenSarthiModal?: () => void;
  onSearchQuery?: (query: string) => void;
  onToggleMobileMenu?: () => void;
}

const LANGUAGE_LABELS: Record<Language, { label: string; native: string }> = {
  en: { label: 'English', native: 'English' },
  hi: { label: 'Hindi', native: 'हिन्दी' },
  as: { label: 'Assamese', native: 'অসমীয়া' },
  bn: { label: 'Bengali', native: 'বাংলা' },
  mni: { label: 'Manipuri', native: 'মৈতৈলোন্' },
};

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  onToggleMode,
  language,
  onLanguageChange,
  activePatient,
  onOpenSOS,
  onOpenOnboarding,
  onOpenLanguageModal,
  onOpenSarthiModal,
  onSearchQuery,
  onToggleMobileMenu,
}) => {
  const [fontScale, setFontScale] = useState<number>(() => {
    return Number(localStorage.getItem('smritisetu_font_scale') || '100');
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online');
  const [searchVal, setSearchVal] = useState<string>('');

  useEffect(() => {
    document.documentElement.style.fontSize = `${(fontScale / 100) * 16}px`;
  }, [fontScale]);

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  const handleFontChange = (delta: number) => {
    const next = Math.min(130, Math.max(90, fontScale + delta));
    setFontScale(next);
    localStorage.setItem('smritisetu_font_scale', String(next));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim() && onSearchQuery) {
      onSearchQuery(searchVal.trim());
    } else if (onOpenSarthiModal) {
      onOpenSarthiModal();
    }
  };

  const handleMicClick = () => {
    if (onSearchQuery) {
      onSearchQuery('');
    } else if (onOpenSarthiModal) {
      onOpenSarthiModal();
    }
  };

  const searchPlaceholderMap: Record<Language, string> = {
    en: 'Search activities, medicines, symptoms or health topics...',
    hi: 'गतिविधियाँ, दवाइयाँ, लक्षण या स्वास्थ्य विषय खोजें...',
    as: 'কাৰ্যকলাপ, ঔষধ, লক্ষণ বা স্বাস্থ্যৰ বিষয় সন্ধান কৰক...',
    bn: 'কার্যক্রম, ওষুধ, লক্ষণ বা স্বাস্থ্য সংক্রান্ত বিষয় খুঁজুন...',
    mni: 'থবক, হিদাক, অনাবাগী মশক নত্রগা হকশেল থিবীউ...',
  };

  const statusMap: Record<string, Record<Language, string>> = {
    online: {
      en: 'Online',
      hi: 'ऑनलाइन',
      as: 'অনলাইন',
      bn: 'অনলাইন',
      mni: 'অনলাইন',
    },
    offline: {
      en: 'Offline',
      hi: 'ऑफ़लाइन',
      as: 'অফলাইন',
      bn: 'অফলাইন',
      mni: 'অফলাইন',
    },
  };

  const modeLabels: Record<string, Record<Language, string>> = {
    toCaregiver: {
      en: 'Caregiver Portal',
      hi: 'केयरगिवर पोर्टल',
      as: 'যত্নদাতা প’ৰ্টেল',
      bn: 'কেয়ারগিভার পোর্টাল',
      mni: 'কেয়ারগিভার পোর্টাল',
    },
    toElderly: {
      en: 'Senior Mode',
      hi: 'वरिष्ठ मोड',
      as: 'জ্যেষ্ঠ মোড',
      bn: 'সিনিয়র মোড',
      mni: 'অহলগী মোড',
    },
  };

  const greetingMap: Record<Language, string> = {
    en: 'Good Day,',
    hi: 'नमस्ते,',
    as: 'নমস্কাৰ,',
    bn: 'নমস্কার,',
    mni: 'খুরুমজরি,',
  };

  const roleMap: Record<string, Record<Language, string>> = {
    caregiver: {
      en: 'Caregiver',
      hi: 'केयरगिवर',
      as: 'যত্নদাতা',
      bn: 'কেয়ারগিভার',
      mni: 'কেয়ারগিভার',
    },
    senior: {
      en: 'Senior',
      hi: 'वरिष्ठ',
      as: 'জ্যেষ্ঠ সদস্য',
      bn: 'সিনিয়র সদস্য',
      mni: 'অহল',
    },
  };

  return (
    <header
      className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 border-b border-[rgba(70,80,60,0.08)]"
      style={{
        backgroundColor: 'rgba(250, 246, 238, 0.95)',
        backdropFilter: 'blur(10px)',
      }}
      data-purpose="dashboard-topbar"
    >
      {/* Mobile Hamburger Button */}
      <button
        onClick={onToggleMobileMenu}
        className="md:hidden mr-2 p-1.5 rounded-lg text-[#1F342A] hover:bg-[#EAE4D7]/60 cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        <Menu className="w-5 h-5 text-[#365A46]" />
      </button>

      {/* Search Input with Voice Search Icon */}
      <div className="flex-1 max-w-lg lg:max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <span className="absolute left-3.5 text-[#8A918A] pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-full pl-10 pr-10 py-2 text-xs md:text-sm text-[#1F342A] placeholder-[#8A918A] focus:outline-none focus:ring-2 focus:ring-[#52745C] focus:bg-[#FAF6EE] transition-all"
            placeholder={searchPlaceholderMap[language] || searchPlaceholderMap.en}
            style={{
              backgroundColor: '#FAF6EE',
              border: '1px solid rgba(80, 90, 70, 0.12)',
              boxShadow: 'inset 0 1px 2px rgba(70, 60, 40, 0.04)',
            }}
            type="text"
          />
          <button
            type="button"
            onClick={handleMicClick}
            className="absolute right-3 text-[#8A918A] hover:text-[#52745C] transition-colors p-1 cursor-pointer"
            title="Voice Assistant / Mic"
          >
            <Mic className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Header Items: Font Sizing, Language, Mode, Profile, SOS */}
      <div className="flex items-center gap-2 sm:gap-4 ml-3 sm:ml-6">
        {/* Elderly Accessibility Font Scaling */}
        <div className="hidden sm:flex items-center bg-[#F3EBDD] border border-[rgba(70,80,60,0.10)] rounded-full px-1 py-0.5 text-xs font-bold text-[#1F342A]">
          <button
            onClick={() => handleFontChange(-10)}
            title="Decrease Font Size"
            aria-label="Decrease Font Size"
            className="px-2 py-0.5 hover:bg-[#EAE4D7] rounded-full transition-colors cursor-pointer"
          >
            A-
          </button>
          <span className="px-1 text-[10px] text-[#68736B]">{fontScale}%</span>
          <button
            onClick={() => handleFontChange(10)}
            title="Increase Font Size"
            aria-label="Increase Font Size"
            className="px-2 py-0.5 hover:bg-[#EAE4D7] rounded-full transition-colors cursor-pointer"
          >
            +A
          </button>
        </div>

        {/* Language Selector */}
        {onOpenLanguageModal ? (
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1F342A] hover:text-[#365A46] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            style={{
              backgroundColor: '#F3EBDD',
              border: '1px solid rgba(70, 80, 60, 0.10)',
            }}
          >
            <Globe className="w-3.5 h-3.5 text-[#365A46]" />
            <span className="hidden sm:inline">{LANGUAGE_LABELS[language]?.native || 'English'}</span>
            <ChevronDown className="w-3 h-3 text-[#8A918A]" />
          </button>
        ) : (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              backgroundColor: '#F3EBDD',
              border: '1px solid rgba(70, 80, 60, 0.10)',
            }}
          >
            <Globe className="w-3.5 h-3.5 text-[#365A46]" />
            <select
              aria-label="Select Language"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-[#1F342A] focus:outline-none cursor-pointer pr-1"
            >
              {Object.entries(LANGUAGE_LABELS).map(([code, meta]) => (
                <option key={code} value={code}>
                  {meta.native}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sync Status Badge */}
        <div className="hidden lg:flex items-center">
          {syncStatus === 'online' && (
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#365A46]"
              style={{ backgroundColor: '#E4EBDD' }}
            >
              <Wifi className="w-3 h-3 text-[#52745C]" />
              <span>{statusMap.online[language] || statusMap.online.en}</span>
            </span>
          )}
          {syncStatus === 'offline' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#BA1A1A] bg-[#FDE8E5]">
              <WifiOff className="w-3 h-3" />
              <span>{statusMap.offline[language] || statusMap.offline.en}</span>
            </span>
          )}
        </div>

        {/* Mode Switcher Pill */}
        <button
          onClick={() => onToggleMode(mode === 'elderly' ? 'caregiver' : 'elderly')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
            mode === 'elderly'
              ? 'bg-[#E4EBDD] text-[#365A46] border border-[rgba(70,80,60,0.12)] hover:bg-[#DCEADB]'
              : 'bg-[#52745C] text-[#FFFDF7] hover:bg-[#46654F]'
          }`}
          title="Toggle Senior Mode / Caregiver Portal"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {mode === 'elderly'
              ? modeLabels.toCaregiver[language] || modeLabels.toCaregiver.en
              : modeLabels.toElderly[language] || modeLabels.toElderly.en}
          </span>
        </button>

        {/* Caregiver / Patient Avatar Pill */}
        <div
          onClick={() => onToggleMode(mode === 'elderly' ? 'caregiver' : 'elderly')}
          className="flex items-center gap-2.5 pl-2 sm:pl-3 cursor-pointer group border-l border-[rgba(70,80,60,0.12)]"
        >
          <div
            className="w-9 h-9 rounded-full ring-2 ring-[#52745C]/30 overflow-hidden bg-[#EAE3D5] shrink-0"
          >
            <img
              alt={activePatient.name}
              className="w-full h-full object-cover"
              src={
                activePatient.avatar ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
              }
            />
          </div>
          <div className="text-left hidden md:block leading-tight">
            <span className="text-[10px] block text-[#8A918A] font-medium">
              {greetingMap[language] || greetingMap.en}
            </span>
            <span className="text-xs font-bold text-[#1F342A] group-hover:text-[#365A46] transition-colors truncate max-w-[100px] block">
              {activePatient.name.split(' ')[0]}
            </span>
            <span className="text-[9.5px] block text-[#52745C] font-semibold">
              {mode === 'caregiver'
                ? roleMap.caregiver[language] || roleMap.caregiver.en
                : roleMap.senior[language] || roleMap.senior.en}
            </span>
          </div>
        </div>

        {/* SOS Emergency Button */}
        <button
          onClick={onOpenSOS}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#BA1A1A] hover:bg-[#93000A] text-[#FFFDF7] rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer ml-1"
          title="Emergency Help / SOS"
        >
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-extrabold">{t('common.sos', language)}</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;

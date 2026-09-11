import React, { useState, useEffect } from 'react';
import { AppMode, Language, PatientProfile, SyncStatus } from '../../types';
import { ShieldAlert, Sparkles, UserCheck, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
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
}) => {
  const [fontScale, setFontScale] = useState<number>(() => {
    return Number(localStorage.getItem('smritisetu_font_scale') || '100');
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online');

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

  return (
    <header className="sticky top-0 z-40 bg-[#f7faf5]/95 backdrop-blur-md border-b border-[#becabf]/60 px-3 sm:px-6 py-2.5 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand & North-East Heritage Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#032517] flex items-center justify-center text-white shadow-md shadow-[#032517]/20">
            <span className="material-symbols-outlined text-[22px] text-[#bfebba]">spa</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#032517]">
                {language === 'as' || language === 'bn' ? 'স্মৃতিসেতু' : 'SmritiSetu'}
                <span className="ml-1.5 text-xs font-sans font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#bfebba] text-[#032517] tracking-wider">
                  NER
                </span>
              </span>
              <span className="hidden md:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ecefea] text-[#456c44] border border-[#becabf]/40">
                SafeNet AI
              </span>
            </div>
            <p className="text-[11px] text-[#3e4941] font-medium hidden sm:block">
              {t('elderlyHome.companionDesc', language)}
            </p>
          </div>
        </div>

        {/* Center: Active Patient Profile Pill */}
        <div className="hidden lg:flex items-center gap-2.5 bg-[#ecefea] border border-[#becabf]/70 px-3.5 py-1.5 rounded-full text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#416740] animate-pulse"></span>
          <span className="text-[#6f7a70] font-medium">{t('common.patient', language)}:</span>
          <span className="font-bold text-[#181d19]">
            {activePatient.name}{activePatient.age ? `, ${activePatient.age}y` : ''}
          </span>
          <span className="text-[#6f7a70] font-medium">• {activePatient.location || 'Guwahati'}</span>
        </div>

        {/* Connectivity Status Badge */}
        <div className="hidden md:flex items-center">
          {syncStatus === 'online' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#bfebba]/30 border border-[#83a590]/30 text-[10px] font-bold text-[#416740]">
              <Wifi className="w-3 h-3" />
              <span>Connected</span>
            </span>
          )}
          {syncStatus === 'offline' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffdbd1]/40 border border-[#ffdbd1] text-[10px] font-bold text-[#631d08]">
              <WifiOff className="w-3 h-3" />
              <span>Offline mode</span>
            </span>
          )}
          {syncStatus === 'syncing' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffebc8]/40 border border-[#ffebc8] text-[10px] font-bold text-[#7a5800] animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Syncing...</span>
            </span>
          )}
          {syncStatus === 'synced' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#bfebba]/30 border border-[#bfebba]/50 text-[10px] font-bold text-[#416740]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Synced</span>
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Elderly Accessibility Font Scaling */}
          <div className="hidden sm:flex items-center bg-[#ecefea] border border-[#becabf]/70 rounded-xl p-0.5 text-xs font-bold text-[#032517]">
            <button
              onClick={() => handleFontChange(-10)}
              title="Decrease Font Size"
              aria-label="Decrease Font Size"
              className="px-2 py-1 hover:bg-[#d8dbd6] rounded-lg transition-colors cursor-pointer"
            >
              A-
            </button>
            <span className="px-1 text-[11px] text-[#6f7a70]">{fontScale}%</span>
            <button
              onClick={() => handleFontChange(10)}
              title="Increase Font Size"
              aria-label="Increase Font Size"
              className="px-2 py-1 hover:bg-[#d8dbd6] rounded-lg transition-colors cursor-pointer"
            >
              +A
            </button>
          </div>

          {/* Native Language Selector */}
          <div className="relative flex items-center bg-[#ecefea] rounded-xl px-2.5 py-1.5 border border-[#becabf]/70">
            {onOpenLanguageModal ? (
              <button
                onClick={onOpenLanguageModal}
                title={t('chooseLanguageTitle', language)}
                className="flex items-center text-xs font-bold text-[#032517] hover:text-[#416740] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#416740] mr-1.5 shrink-0">translate</span>
                <span>{LANGUAGE_LABELS[language]?.native || 'English'}</span>
              </button>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-[#416740] mr-1.5 shrink-0">translate</span>
                <select
                  aria-label="Select Language"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="bg-transparent text-xs font-bold text-[#032517] focus:outline-none cursor-pointer pr-1"
                >
                  {Object.entries(LANGUAGE_LABELS).map(([code, meta]) => (
                    <option key={code} value={code}>
                      {meta.native}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Sarthi Companion Tactile Launcher */}
          {onOpenSarthiModal && (
            <button
              onClick={onOpenSarthiModal}
              title="Talk with Sarthi Cognitive Companion"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b3b2b] hover:bg-[#032517] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#bfebba]">smart_toy</span>
              <span className="hidden sm:inline">Sarthi</span>
            </button>
          )}

          {/* Patient vs Caregiver Mode Switcher */}
          <button
            onClick={() => onToggleMode(mode === 'elderly' ? 'caregiver' : 'elderly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              mode === 'elderly'
                ? 'bg-[#ecefea] text-[#032517] border border-[#becabf] hover:bg-[#e0e3de]'
                : 'bg-[#032517] text-white hover:bg-[#1b3b2b]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{mode === 'elderly' ? t('caregiverMode', language) : t('elderlyMode', language)}</span>
          </button>

          {/* Setup / Onboarding Button */}
          <button
            onClick={onOpenOnboarding}
            title="Setup / Onboarding"
            className="p-1.5 text-[#3e4941] hover:text-[#032517] bg-[#ecefea] hover:bg-[#e0e3de] rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#631d08] hover:bg-[#420b00] text-white rounded-xl text-xs font-extrabold tracking-wide shadow-md shadow-[#631d08]/20 transition-all active:scale-95 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">{t('sos', language)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

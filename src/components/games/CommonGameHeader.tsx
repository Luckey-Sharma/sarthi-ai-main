import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { t } from '../../services/i18n';
import { storage } from '../../services/storage';
import { setSoundMuted, speak, stopSpeaking } from '../../services/voiceService';

interface CommonGameHeaderProps {
  language: Language;
  title: string;
  subtitle?: string;
  readAloudText?: string;
  onBack: () => void;
  onFinishEarly?: () => void;
  onFinishForToday?: () => void;
}

export const CommonGameHeader: React.FC<CommonGameHeaderProps> = ({
  language,
  title,
  subtitle,
  readAloudText,
  onBack,
  onFinishEarly,
  onFinishForToday,
}) => {
  const handleFinish = onFinishForToday || onFinishEarly;
  const [muted, setMutedState] = useState<boolean>(() => storage.loadSoundMuted());
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  useEffect(() => {
    setSoundMuted(muted);
    storage.saveSoundMuted(muted);
  }, [muted]);

  const toggleMute = () => {
    const nextMuted = !muted;
    setMutedState(nextMuted);
    setSoundMuted(nextMuted);
    storage.saveSoundMuted(nextMuted);
    if (nextMuted) {
      stopSpeaking();
    }
  };

  const handleReadAloud = () => {
    if (readAloudText && !muted) {
      stopSpeaking();
      speak(readAloudText, language);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-[28px] shadow-[0_4px_20px_rgba(70,80,60,0.05)] border border-[rgba(70,80,60,0.08)] flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back / Exit */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5EBE1]/60 hover:bg-[#F5EBE1] text-[#1F342A] rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[rgba(70,80,60,0.08)]"
          title={t('back', language)}
        >
          <ArrowLeft className="w-4 h-4 text-[#708A74]" />
          <span>{t('back', language)}</span>
        </button>

        {/* Center: Title for Tablet/Desktop */}
        <div className="hidden md:block text-center flex-1 px-2">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1F342A] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#495E4F] font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Controls: Read Aloud, Mute, Finish for Today */}
        <div className="flex items-center gap-2 sm:gap-3">
          {readAloudText && (
            <button
              onClick={handleReadAloud}
              disabled={muted}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer border border-[rgba(70,80,60,0.1)] flex items-center gap-1.5 text-xs font-bold ${
                muted
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed opacity-60'
                  : 'bg-[#D9E8D8]/70 hover:bg-[#D9E8D8] text-[#1F342A]'
              }`}
              title={t('readAloud', language)}
              aria-label={t('readAloud', language)}
            >
              <Volume2 className="w-4 h-4 text-[#708A74]" />
              <span className="hidden sm:inline">{t('readAloud', language)}</span>
            </button>
          )}

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2.5 rounded-2xl border border-[rgba(70,80,60,0.1)] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              muted
                ? 'bg-[#FFF6D6] text-[#785E22]'
                : 'bg-[#F5EBE1]/60 hover:bg-[#F5EBE1] text-[#1F342A]'
            }`}
            title={muted ? t('soundMuted', language) : t('soundOn', language)}
            aria-label={muted ? t('soundMuted', language) : t('soundOn', language)}
          >
            {muted ? (
              <>
                <VolumeX className="w-4 h-4 text-[#785E22]" />
                <span className="hidden sm:inline">{t('soundMuted', language)}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#708A74]" />
                <span className="hidden sm:inline">{t('soundOn', language)}</span>
              </>
            )}
          </button>

          {/* Conclude Session / Finish for Today */}
          {handleFinish && (
            <button
              onClick={handleFinish}
              className="px-4 py-2.5 bg-[#1F342A] hover:bg-[#2A4438] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              🌿 {t('finishForToday', language)}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Title View */}
      <div className="md:hidden text-center pt-2 border-t border-[rgba(70,80,60,0.08)]">
        <h1 className="text-lg font-serif font-bold text-[#1F342A]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-[#495E4F] font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Gentle Confirmation Modal to Prevent Accidental Backs */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF6EE] rounded-[28px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[rgba(70,80,60,0.15)] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#D9E8D8] text-[#1F342A] mx-auto flex items-center justify-center text-2xl shadow-xs">
              🌿
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1F342A]">
              {t('finishForToday', language)}
            </h3>
            <p className="text-xs sm:text-sm text-[#495E4F] leading-relaxed">
              {t('exitConfirmMessage', language)}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onBack();
                }}
                className="flex-1 py-3 px-4 bg-[#1F342A] hover:bg-[#2A4438] text-white font-bold rounded-2xl text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
              >
                {t('finishForToday', language)}
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-4 bg-white hover:bg-stone-50 text-[#1F342A] font-bold rounded-2xl text-xs sm:text-sm cursor-pointer border border-[rgba(70,80,60,0.15)] transition-all"
              >
                {t('continueSession', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonGameHeader;

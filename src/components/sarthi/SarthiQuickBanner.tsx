import React, { useState, useEffect } from 'react';
import {
  Language,
  PatientProfile,
  CognitiveSession,
  SarthiRecommendation,
  SarthiContext,
  AppView,
  GameId,
} from '../../types';
import { generateSarthiRecommendation } from '../../services/sarthiEngine';
import { askSarthiWithGemini } from '../../services/sarthiApi';
import { speak, stopSpeaking } from '../../services/voiceService';
import { Sparkles, Play, Volume2, MessageSquare, Compass, Info } from 'lucide-react';

interface SarthiQuickBannerProps {
  language: Language;
  patient: PatientProfile;
  sessions: CognitiveSession[];
  hydrationGlasses: number;
  onOpenSarthiModal: () => void;
  onNavigate: (view: AppView, gameId?: GameId) => void;
}

export const SarthiQuickBanner: React.FC<SarthiQuickBannerProps> = ({
  language,
  patient,
  sessions,
  hydrationGlasses,
  onOpenSarthiModal,
  onNavigate,
}) => {
  const [rec, setRec] = useState<SarthiRecommendation>(() =>
    generateSarthiRecommendation({
      patient,
      language,
      recentSessions: sessions.slice(-5),
      allSessions: sessions,
      routineAdherence: 85,
      hydrationGlasses,
    })
  );
  const [isGemini, setIsGemini] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const context: SarthiContext = {
      patient,
      language,
      recentSessions: sessions.slice(-5),
      allSessions: sessions,
      routineAdherence: 85,
      hydrationGlasses,
    };

    // Update with fresh deterministic first
    const freshDet = generateSarthiRecommendation(context);
    setRec(freshDet);
    setIsGemini(false);

    // Then upgrade with Gemini if available
    askSarthiWithGemini(context).then((apiRes) => {
      if (!isMounted) return;
      if (apiRes.isGemini) {
        setIsGemini(true);
        setRec({
          ...apiRes.deterministicRec,
          patientMessage: apiRes.message,
          caregiverInsight: apiRes.caregiverNote || apiRes.deterministicRec.caregiverInsight,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [language, patient.id, sessions.length, hydrationGlasses]);

  const handleSpeakRecommendation = () => {
    stopSpeaking();
    speak(rec.patientMessage, language);
  };

  const handleAction = () => {
    if (rec.suggestedAction) {
      if (rec.suggestedAction.gameId) {
        onNavigate('game_detail', rec.suggestedAction.gameId);
      } else if (rec.suggestedAction.view) {
        onNavigate(rec.suggestedAction.view);
      }
    } else if (rec.recommendedGame) {
      onNavigate('game_detail', rec.recommendedGame);
    } else {
      onOpenSarthiModal();
    }
  };

  const actionLabel =
    rec.suggestedAction?.label[language] ||
    rec.suggestedAction?.label.en ||
    'View Suggestion';

  return (
    <div className="bg-gradient-to-br from-[#032517] via-[#1b3b2b] to-[#032517] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#becabf]/30 relative overflow-hidden font-sans">
      {/* Decorative backdrop aura */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#416740]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Sarthi Identity & Recommendation */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#bfebba] via-[#83a590] to-[#bfebba] p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#032517] rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                <span className="material-symbols-outlined text-[30px] text-[#bfebba]">spa</span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#416740] border-2 border-[#032517] flex items-center justify-center text-[10px]">
              ✨
            </span>
          </div>

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                <span>{language === 'as' || language === 'bn' ? 'সাৰথী' : 'Sarthi'}</span>
                <span className="text-xs font-sans font-bold text-[#bfebba] bg-[#032517]/80 px-2.5 py-0.5 rounded-full border border-[#83a590]/50">
                  {language === 'hi' ? 'मार्गदर्शक साथी' : language === 'as' ? 'জ্ঞাত্বী সংগী' : language === 'bn' ? 'যত্নসঙ্গী' : 'Care Companion'}
                </span>
                {isGemini && (
                  <span className="text-xs font-sans font-bold text-[#ffdbd1] bg-[#631d08]/80 px-2.5 py-0.5 rounded-full border border-[#ffdbd1]/30 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ffdbd1]" />
                    <span>Gemini AI</span>
                  </span>
                )}
              </h3>
            </div>

            <p className="text-base sm:text-lg text-[#f7faf5] font-medium leading-relaxed">
              {rec.patientMessage}
            </p>

            {/* Explainable AI Transparent Reason */}
            <div className="pt-1 flex items-center gap-1.5 text-xs text-[#83a590] font-medium">
              <Info className="w-3.5 h-3.5 text-[#bfebba] shrink-0" />
              <span className="italic line-clamp-1">{rec.reason}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 justify-end">
          {/* Audio Listen */}
          <button
            onClick={handleSpeakRecommendation}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-[#bfebba] transition-colors cursor-pointer shrink-0"
            title="Listen Aloud"
            aria-label="Listen Aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Chat with Sarthi */}
          <button
            onClick={onOpenSarthiModal}
            className="px-4 py-3 rounded-2xl bg-[#1b3b2b] hover:bg-[#032517] text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer border border-[#83a590]/40"
          >
            <MessageSquare className="w-4 h-4 text-[#bfebba]" />
            <span>{language === 'hi' ? 'बात करें' : language === 'as' ? 'কথা পাতক' : language === 'bn' ? 'কথা বলুন' : 'Ask Sarthi'}</span>
          </button>

          {/* Primary Action Button (Direct Game Launch or Module) */}
          <button
            onClick={handleAction}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-[#bfebba] hover:bg-[#a8e0a2] text-[#032517] font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="truncate max-w-[200px]">{actionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SarthiQuickBanner;

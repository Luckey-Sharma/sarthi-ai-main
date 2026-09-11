import React, { useState } from 'react';
import { Language, PatientProfile, GameId, CaregiverSessionRecord } from '../../types';
import { ShieldCheck, Clock, Heart, CheckCircle2, RotateCcw, Home, Sparkles } from 'lucide-react';
import { t } from '../../services/i18n';
import { storage } from '../../services/storage';

interface CaregiverSessionSummaryProps {
  language: Language;
  patient: PatientProfile;
  gameId: GameId;
  durationSeconds: number;
  initialMood?: 'calm' | 'cheerful' | 'reflective' | 'low_energy';
  initialNote?: string;
  onReturnHome: () => void;
  onPlayAnother: () => void;
}

export const CaregiverSessionSummary: React.FC<CaregiverSessionSummaryProps> = ({
  language,
  patient,
  gameId,
  durationSeconds,
  initialMood,
  initialNote,
  onReturnHome,
  onPlayAnother,
}) => {
  const [postNote, setPostNote] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const durationStr = minutes > 0
    ? `${minutes} ${language === 'as' ? 'মিনিট' : language === 'bn' ? 'মিনিট' : language === 'hi' ? 'मिनट' : 'mins'} ${seconds > 0 ? `${seconds}s` : ''}`
    : `${seconds} ${language === 'as' ? 'ছেকেণ্ড' : language === 'bn' ? 'সেকেন্ড' : language === 'hi' ? 'सेकंड' : 'secs'}`;

  const gameTitles: Record<GameId, Record<Language, string>> = {
    memory_match: {
      en: 'Cultural Photo & Artifact Match',
      as: 'ঐতিহ্য ফটো আৰু সঁজুলিৰ চিনাকি',
      bn: 'ঐতিহ্যবাহী ছবি ও স্মারক মেলানো',
      hi: 'सांस्कृतिक स्मृति व वस्तु मिलान',
      mni: 'Cultural Photo Match',
    },
    sounds_hills: {
      en: 'Name That Tune: Regional Folk Melodies',
      as: 'সুৰ চিনক: আঞ্চলিক লোকগীতৰ সুৰ',
      bn: 'সুর চেনা: আঞ্চলিক লোকসঙ্গীত ও সুর',
      hi: 'धुन पहचानें: पूर्वोत्तर के लोकगीत',
      mni: 'Eshei Khonjel Khangba',
    },
    brain_quest: {
      en: 'Familiar Places & Heritage Stories',
      as: 'চিনাকি স্থান আৰু ঐতিহ্যৰ সাধু',
      bn: 'পরিচিত স্থান ও ঐতিহ্যের গল্প',
      hi: 'जानी-पहचानी जगहें व धरोहर की कहानियां',
      mni: 'Familiar Mafam Wari',
    },
    pattern_weave: {
      en: 'Traditional Attire & Handlooms',
      as: 'পৰম্পৰাগত সাজপাৰ আৰু তাঁতশাল',
      bn: 'ঐতিহ্যবাহী পোশাক ও তাঁত শিল্প',
      hi: 'पारंपरिक हथकरघा व वस्त्र',
      mni: 'Yongkham & Traditional Phi',
    },
    tea_garden: {
      en: 'Peaceful Tea Garden Walk',
      as: 'চাহ বাগিচাৰ শান্ত খোজ',
      bn: 'চা বাগিচার শান্ত পদচারণা',
      hi: 'चाय बगान की सुकून भरी सैर',
      mni: 'Cha Bagan da Chathokpa',
    },
    routine_builder: {
      en: 'Gentle Daily Moments',
      as: 'দৈনন্দিন মধুৰ মুহূৰ্ত',
      bn: 'দৈনন্দিন শান্ত মুহূর্ত',
      hi: 'दिनचर्या के सुकून भरे पल',
      mni: 'Nungtigi Nungshiba Matam',
    },
    family_recall: {
      en: 'Family Album & Cherished Memories',
      as: 'পৰিয়ালৰ ফটো এলবাম আৰু মৰমৰ স্মৃতি',
      bn: 'পারিবারিক অ্যালবাম ও ভালোবাসার স্মৃতি',
      hi: 'पारिवारिक एल्बम व प्रियजनों की यादें',
      mni: 'Imunggi Album & Ningshingba',
    },
  };

  const handleSaveObservation = () => {
    const fullNote = [initialNote, postNote.trim()].filter(Boolean).join(' | ');
    const record: CaregiverSessionRecord = {
      id: `cg-sess-${Date.now()}`,
      gameId,
      gameTitle: gameTitles[gameId]?.[language] || gameTitles[gameId]?.en || gameId,
      patientId: patient.id,
      caregiverNote: fullNote || undefined,
      moodTag: initialMood,
      durationSeconds,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };
    storage.saveCaregiverSession(record);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 font-sans animate-in fade-in duration-300">
      {/* Top Banner Labeled Clearly "For Caregivers" */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#becabf]/60 shadow-md text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#bfebba]/50 text-[#032517] mx-auto flex items-center justify-center text-3xl shadow-xs">
          🌿
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#bfebba]/40 text-[#032517] border border-[#416740]/30 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#416740]" />
            <span>{language === 'as' ? 'সেৱাদানকাৰীৰ বাবে সাৰাংশ' : language === 'bn' ? 'সেবাদানকারীর জন্য সারাংশ' : language === 'hi' ? 'देखभालकर्ता हेतु सारांश' : 'For Caregivers • Session Summary'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517] leading-snug">
            {t('sessionCompleteMessage', language)}
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
            {t('caregiverSessionSummarySubtitle', language)}
          </p>
        </div>
      </div>

      {/* Session Details Box (NO SCORES, PURE OBSERVATIONAL RECORD) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#becabf]/60 shadow-md space-y-5">
        <h2 className="text-base font-bold text-[#032517] border-b border-[#ecefea] pb-3">
          {language === 'as' ? 'আজিৰ সত্ৰৰ খতিয়ান' : language === 'bn' ? 'আজকের সেশনের বিবরণ' : language === 'hi' ? 'आज के सत्र का विवरण' : 'Today’s Gentle Session Details'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#f7faf5] border border-[#becabf]/60">
            <div className="text-xs font-bold text-[#6f7a70] uppercase tracking-wider mb-1">
              {t('activityPlayed', language)}
            </div>
            <div className="text-base font-bold text-[#032517]">
              {gameTitles[gameId]?.[language] || gameTitles[gameId]?.en || gameId}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7faf5] border border-[#becabf]/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#6f7a70] uppercase tracking-wider mb-1">
                {t('durationMinutes', language)}
              </div>
              <div className="text-base font-extrabold text-[#032517]">
                {durationStr}
              </div>
            </div>
            <Clock className="w-7 h-7 text-[#416740]/70" />
          </div>
        </div>

        {/* Pre-Session Mood Tag Display */}
        {initialMood && (
          <div className="p-4 rounded-2xl bg-[#ecefea]/60 border border-[#becabf]/60 flex items-center gap-3">
            <span className="text-xl">
              {initialMood === 'calm' ? '🌿' : initialMood === 'cheerful' ? '😊' : initialMood === 'reflective' ? '🕊️' : '☕'}
            </span>
            <div>
              <div className="text-[11px] font-bold text-[#6f7a70] uppercase tracking-wider">
                {t('caregiverPreSessionMood', language)}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#032517]">
                {initialMood === 'calm' ? t('moodCalm', language) : initialMood === 'cheerful' ? t('moodCheerful', language) : initialMood === 'reflective' ? t('moodReflective', language) : t('moodTired', language)}
              </div>
            </div>
          </div>
        )}

        {/* Pre-Session Note If Any */}
        {initialNote && (
          <div className="p-4 rounded-2xl bg-[#f7faf5] border border-[#becabf]/60">
            <div className="text-[11px] font-bold text-[#6f7a70] uppercase tracking-wider mb-1">
              {language === 'as' ? 'সত্ৰৰ পূৰ্বে দিয়া টোকা' : language === 'bn' ? 'সেশনের আগের মন্তব্য' : language === 'hi' ? 'सत्र पूर्व नोट' : 'Pre-Session Note'}
            </div>
            <p className="text-xs sm:text-sm text-[#032517] italic">
              "{initialNote}"
            </p>
          </div>
        )}

        {/* Post-Session Observation Note Input */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-[#032517]">
            {t('caregiverPostNote', language)}
          </label>
          <textarea
            rows={2}
            value={postNote}
            onChange={(e) => setPostNote(e.target.value)}
            placeholder={t('caregiverPostNotePlaceholder', language)}
            className="w-full px-4 py-3 bg-[#f7faf5] border border-[#becabf]/70 rounded-2xl text-xs sm:text-sm text-[#032517] placeholder:text-[#6f7a70] focus:outline-hidden focus:border-[#032517] transition-all"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveObservation}
              disabled={saved}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                saved
                  ? 'bg-[#bfebba] text-[#032517]'
                  : 'bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] border border-[#becabf]/60'
              }`}
            >
              {saved ? '✓ Saved Note' : 'Save Caregiver Note'}
            </button>
          </div>
        </div>

        {/* Explicit Zero-Judgement Statement */}
        <div className="pt-2 text-center text-xs text-[#6f7a70] font-medium border-t border-[#ecefea]">
          {t('noScoreGuidance', language)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onReturnHome}
          className="w-full sm:flex-1 py-4 px-6 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-sm shadow-md transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{t('home', language)}</span>
        </button>

        <button
          onClick={onPlayAnother}
          className="w-full sm:flex-1 py-4 px-6 bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] font-extrabold rounded-2xl text-sm cursor-pointer border border-[#becabf]/70 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-[#416740]" />
          <span>{language === 'as' ? 'আন এটি কাৰ্যকলাপ আৰম্ভ কৰক' : language === 'bn' ? 'আরেকটি কার্যকলাপ শুরু করুন' : language === 'hi' ? 'एक और शांत गतिविधि शुरू करें' : 'Start Another Gentle Activity'}</span>
        </button>
      </div>
    </div>
  );
};

export default CaregiverSessionSummary;

import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { playSound, stopSpeaking } from '../../services/voiceService';
import { t } from '../../services/i18n';
import { ArrowLeft, Sparkles, Volume2, Wind, Moon, Sun, Shield } from 'lucide-react';

interface CalmingSanctuaryProps {
  language: Language;
  onBack: () => void;
}

const SCENERIES = [
  {
    title: {
      en: 'Brahmaputra Sunset',
      as: 'ব্ৰহ্মপুত্ৰৰ শান্ত গধূলি',
      bn: 'ব্রহ্মপুত্রের শান্ত সূর্যাস্ত',
      hi: 'ब्रह्मपुत्र सूर्यास्त',
      mni: 'Brahmaputra Nungthil',
    },
    location: 'Guwahati, Assam',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Golden twilight reflecting across the vast expanse of the sacred river.',
  },
  {
    title: {
      en: 'Misty Tea Gardens',
      as: 'কুঁৱলীঘেৰা চাহ বাগিচা',
      bn: 'কুয়াশাঘেরা চা বাগান',
      hi: 'धुंध भरे चाय के बागान',
      mni: 'Misty Tea Gardens',
    },
    location: 'Jorhat, Assam',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    description: 'Soft evening mist rolling over miles of fragrant emerald green tea terraces.',
  },
  {
    title: {
      en: 'Tranquil Loktak Lake',
      as: 'লোকটক হ্ৰদৰ প্ৰশান্তি',
      bn: 'লোকটাক হ্রদের প্রশান্তি',
      hi: 'शांत लोकटक झील',
      mni: 'Loktak Patki Santhiba',
    },
    location: 'Moirang, Manipur',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    description: 'Gentle water ripples embracing floating green rings in peaceful silence.',
  },
];

export const CalmingSanctuary: React.FC<CalmingSanctuaryProps> = ({
  language,
  onBack,
}) => {
  const [breathePhase, setBreathePhase] = useState<'in' | 'hold' | 'out'>('in');
  const [sceneryIdx, setSceneryIdx] = useState<number>(0);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  // 4s in, 4s hold, 4s out breathing cycle
  useEffect(() => {
    const cycle = setInterval(() => {
      setBreathePhase((prev) => {
        if (prev === 'in') return 'hold';
        if (prev === 'hold') return 'out';
        return 'in';
      });
    }, 4000);
    return () => clearInterval(cycle);
  }, []);

  const handlePlaySound = (sound: 'monsoon_rain' | 'temple_bell' | 'pepa_flute' | 'lake_ripples') => {
    setActiveSound(sound);
    playSound(sound);
  };

  const getBreatheText = () => {
    switch (breathePhase) {
      case 'in':
        return t('breatheIn', language);
      case 'hold':
        return t('breatheHold', language);
      case 'out':
        return t('breatheOut', language);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#032517] p-4 sm:p-5 rounded-3xl border border-[#becabf]/40 text-white shadow-md">
        <button
          onClick={() => {
            stopSpeaking();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-[#bfebba]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-[#bfebba] bg-[#1b3b2b] border border-[#83a590]/40 px-3.5 py-1.5 rounded-xl">
          <Moon className="w-4 h-4 text-[#bfebba]" />
          <span>{t('sundowningBadge', language)}</span>
        </div>
      </div>

      {/* Main Peaceful Viewport */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1b3b2b] bg-gradient-to-b from-[#032517] via-[#1b3b2b] to-[#032517] p-6 sm:p-12 text-center text-white min-h-[480px] flex flex-col items-center justify-between">
        {/* Background Image with Twilight Dimmer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen transition-all duration-1000"
          style={{ backgroundImage: `url(${SCENERIES[sceneryIdx].image})` }}
        />

        {/* Header Text */}
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#f7faf5]">
            {t('calmingTitle', language)}
          </h2>
          <p className="text-xs sm:text-sm text-[#bfebba] max-w-md mx-auto font-medium">
            {t('calmingSubtitle', language)}
          </p>
        </div>

        {/* Gentle Pulsing Breathing Pacer */}
        <div className="relative z-10 my-8 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer soft aura rings */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-indigo-500/20 animate-ping opacity-25 absolute" />
            <div
              className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-indigo-300/40 flex flex-col items-center justify-center shadow-2xl transition-all duration-1000 ${
                breathePhase === 'in'
                  ? 'scale-110 bg-gradient-to-tr from-teal-600/70 to-emerald-500/70'
                  : breathePhase === 'hold'
                  ? 'scale-105 bg-gradient-to-tr from-indigo-600/70 to-purple-500/70'
                  : 'scale-90 bg-gradient-to-tr from-slate-800/70 to-indigo-900/70'
              }`}
            >
              <Wind className="w-10 h-10 text-white mb-2 animate-pulse" />
              <span className="text-sm sm:text-base font-black tracking-wide text-white px-2">
                {getBreatheText()}
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Sound Controls */}
        <div className="relative z-10 space-y-3 w-full max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-200 uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>{t('playNatureSounds', language)}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handlePlaySound('monsoon_rain')}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSound === 'monsoon_rain'
                  ? 'bg-teal-500 text-white border-teal-300 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-indigo-100 border-white/20'
              }`}
            >
              <span>🌧️ {t('soundRain', language)}</span>
            </button>
            <button
              onClick={() => handlePlaySound('lake_ripples')}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSound === 'lake_ripples'
                  ? 'bg-teal-500 text-white border-teal-300 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-indigo-100 border-white/20'
              }`}
            >
              <span>🚣 {t('soundLake', language)}</span>
            </button>
            <button
              onClick={() => handlePlaySound('temple_bell')}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSound === 'temple_bell'
                  ? 'bg-teal-500 text-white border-teal-300 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-indigo-100 border-white/20'
              }`}
            >
              <span>🔔 {t('soundBell', language)}</span>
            </button>
            <button
              onClick={() => handlePlaySound('pepa_flute')}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSound === 'pepa_flute'
                  ? 'bg-teal-500 text-white border-teal-300 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-indigo-100 border-white/20'
              }`}
            >
              <span>🎺 {t('soundFlute', language)}</span>
            </button>
          </div>

          {/* Scenery Cycler */}
          <div className="pt-2 flex items-center justify-center gap-2">
            {SCENERIES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setSceneryIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  sceneryIdx === idx ? 'bg-amber-300 w-8' : 'bg-white/30 hover:bg-white/50'
                }`}
                title={s.title[language] || s.title.en}
              />
            ))}
          </div>
          <p className="text-[11px] text-stone-400 font-semibold italic">
            {SCENERIES[sceneryIdx].title[language] || SCENERIES[sceneryIdx].title.en} • {SCENERIES[sceneryIdx].location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalmingSanctuary;

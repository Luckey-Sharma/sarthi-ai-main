import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, DDAState, DDAUpdateResult } from '../../types';
import { createInitialDDAState, updateDDA, GAME_LEVELS } from '../../services/aiEngine';
import { storage } from '../../services/storage';
import { playSound, speak, stopSpeaking } from '../../services/voiceService';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  Timer,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
  Award,
} from 'lucide-react';
import { t } from '../../services/i18n';

interface TeaGardenFocusProps {
  language: Language;
  onBack: () => void;
}

interface BushSlot {
  id: number;
  hasLeaf: boolean;
  isCaterpillar: boolean;
  spawnTime: number;
  lifespan: number;
}

interface FloatingFeedback {
  id: number;
  bushId: number;
  text: string;
  type: 'gain' | 'loss';
}

const TOTAL_GAME_TIME = 30;

const INITIAL_BUSHES: BushSlot[] = [
  { id: 0, hasLeaf: false, isCaterpillar: false, spawnTime: 0, lifespan: 2400 },
  { id: 1, hasLeaf: false, isCaterpillar: false, spawnTime: 0, lifespan: 2400 },
  { id: 2, hasLeaf: false, isCaterpillar: false, spawnTime: 0, lifespan: 2400 },
  { id: 3, hasLeaf: false, isCaterpillar: false, spawnTime: 0, lifespan: 2400 },
  { id: 4, hasLeaf: false, isCaterpillar: false, spawnTime: 0, lifespan: 2400 },
  { id: 5, hasLeaf: false, isCaterpillar: false, spawnTime: 0, lifespan: 2400 },
];

export const TeaGardenFocus: React.FC<TeaGardenFocusProps> = ({
  language,
  onBack,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_GAME_TIME);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [pluckedCount, setPluckedCount] = useState<number>(0);
  const [missedCount, setMissedCount] = useState<number>(0);
  const [caterpillarTaps, setCaterpillarTaps] = useState<number>(0);
  const [caterpillarsAvoided, setCaterpillarsAvoided] = useState<number>(0);
  const [bushes, setBushes] = useState<BushSlot[]>(INITIAL_BUSHES);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [floatingFeedbacks, setFloatingFeedbacks] = useState<FloatingFeedback[]>([]);
  const [shakingBushId, setShakingBushId] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ddaState, setDdaState] = useState<DDAState>(() => storage.loadGameDDA('tea_garden', 1));
  const [levelResult, setLevelResult] = useState<DDAUpdateResult | null>(null);

  // Refs for tracking values during async timers
  const scoreRef = useRef<number>(0);
  scoreRef.current = score;
  const pluckedRef = useRef<number>(0);
  pluckedRef.current = pluckedCount;
  const missedRef = useRef<number>(0);
  missedRef.current = missedCount;
  const caterpillarTapsRef = useRef<number>(0);
  caterpillarTapsRef.current = caterpillarTaps;
  const reactionTimesRef = useRef<number[]>([]);
  reactionTimesRef.current = reactionTimes;
  const ddaRef = useRef<DDAState>(ddaState);
  ddaRef.current = ddaState;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Voice instructions
  const speakInstruction = useCallback(
    (key: 'start' | 'finish', lang: Language) => {
      if (!soundEnabled) return;
      if (key === 'start') {
        const startMessages: Record<Language, string> = {
          as: 'দুটি পাত এটি কলি ওলোৱাৰ লগে লগে চিঙক! পলু নাছুব।',
          bn: 'দুটি পাতা একটি কুঁড়ি দেখার সাথে সাথে তুলুন! শুঁয়োপোকা ছোঁবেন না।',
          hi: 'कोमल दो पत्तियां और एक कली तुरंत चुनें! कीड़ों से बचें।',
          mni: 'Mana aniga koli amaga thengnadana loukhat-u! Til sokkanu.',
          en: 'Pluck the tender two leaves and a bud! Watch out for caterpillars!',
        };
        speak(startMessages[lang] || startMessages.en, lang);
      } else {
        const finishMessages: Record<Language, string> = {
          as: 'বৰ সুন্দৰ! আপোনাৰ পাচি সতেজ চাহ পাতেৰে ভৰি পৰিল!',
          bn: 'চমৎকার! আপনার ঝুড়ি তাজা চা পাতায় ভরে উঠেছে!',
          hi: 'बहुत बढ़िया! आपकी टोकरी ताज़ी पत्तियों से भर गई है!',
          mni: 'Yamna Fai! Nanggi basket cha managa thalle!',
          en: 'Wonderful plucking! Your basket is brimming with fresh leaves!',
        };
        speak(finishMessages[lang] || finishMessages.en, lang);
      }
    },
    [soundEnabled]
  );

  // Start / Restart game
  const startGame = () => {
    stopSpeaking();
    setIsPlaying(true);
    setIsFinished(false);
    setScore(0);
    setTimeLeft(TOTAL_GAME_TIME);
    setReactionTimes([]);
    setPluckedCount(0);
    setMissedCount(0);
    setCaterpillarTaps(0);
    setCaterpillarsAvoided(0);
    setFloatingFeedbacks([]);
    setShakingBushId(null);
    setBushes(INITIAL_BUSHES);

    if (soundEnabled) {
      playSound('click');
    }
  };

  // 1. Countdown timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // 2. End game when timeLeft reaches 0
  useEffect(() => {
    if (isPlaying && timeLeft === 0) {
      finishGame();
    }
  }, [isPlaying, timeLeft]);

  // 3. Spawner loop - spawns buds & caterpillars
  useEffect(() => {
    if (!isPlaying) return;

    const spawnCadenceMs = Math.max(850, 1450 - (ddaState.level - 1) * 140);

    const spawner = window.setInterval(() => {
      setBushes((current) => {
        const emptyIndices = current
          .map((b, idx) => (!b.hasLeaf && !b.isCaterpillar ? idx : -1))
          .filter((idx) => idx !== -1);

        if (emptyIndices.length === 0) return current;

        const targetIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const caterpillarChance = Math.min(0.28, 0.15 + (ddaState.level - 1) * 0.03);
        const isCat = Math.random() < caterpillarChance;

        const lifespan = isCat
          ? 2200
          : Math.max(1600, 2600 - (ddaState.level - 1) * 230);

        return current.map((bush, idx) => {
          if (idx === targetIdx) {
            return {
              ...bush,
              hasLeaf: !isCat,
              isCaterpillar: isCat,
              spawnTime: Date.now(),
              lifespan,
            };
          }
          return bush;
        });
      });
    }, spawnCadenceMs);

    return () => clearInterval(spawner);
  }, [isPlaying, ddaState.level]);

  // 4. Lifespan ticker - handles natural bud maturation and caterpillar crawl-away
  useEffect(() => {
    if (!isPlaying) return;

    const ticker = window.setInterval(() => {
      const now = Date.now();
      setBushes((current) => {
        let changed = false;
        const next = current.map((bush) => {
          if ((bush.hasLeaf || bush.isCaterpillar) && now - bush.spawnTime > bush.lifespan) {
            changed = true;
            if (bush.hasLeaf) {
              setMissedCount((m) => m + 1);
            } else if (bush.isCaterpillar) {
              setCaterpillarsAvoided((a) => a + 1);
            }
            return { ...bush, hasLeaf: false, isCaterpillar: false };
          }
          return bush;
        });
        return changed ? next : current;
      });
    }, 120);

    return () => clearInterval(ticker);
  }, [isPlaying]);

  // Handle bush tap
  const handleBushClick = (index: number) => {
    if (!isPlaying) return;
    const target = bushes[index];

    if (target.hasLeaf) {
      // Successful pluck
      const latency = Date.now() - target.spawnTime;
      setReactionTimes((prev) => [...prev, latency]);
      setScore((s) => s + 10);
      setPluckedCount((p) => p + 1);

      if (soundEnabled) {
        playSound('leaf_pluck');
      }

      // Add floating +10 feedback
      const feedbackId = Date.now() + Math.random();
      setFloatingFeedbacks((prev) => [
        ...prev,
        { id: feedbackId, bushId: index, text: '+10 🍃', type: 'gain' },
      ]);
      setTimeout(() => {
        setFloatingFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
      }, 850);

      // Clear bush
      setBushes((current) =>
        current.map((b, i) =>
          i === index ? { ...b, hasLeaf: false, isCaterpillar: false } : b
        )
      );
    } else if (target.isCaterpillar) {
      // Caterpillar tap penalty
      setScore((s) => Math.max(0, s - 5));
      setCaterpillarTaps((c) => c + 1);

      if (soundEnabled) {
        playSound('gentle_buzz');
      }

      setShakingBushId(index);
      setTimeout(() => setShakingBushId(null), 500);

      const feedbackId = Date.now() + Math.random();
      setFloatingFeedbacks((prev) => [
        ...prev,
        { id: feedbackId, bushId: index, text: '-5 🐛', type: 'loss' },
      ]);
      setTimeout(() => {
        setFloatingFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
      }, 850);

      setBushes((current) =>
        current.map((b, i) =>
          i === index ? { ...b, hasLeaf: false, isCaterpillar: false } : b
        )
      );
    } else {
      // Empty bush rustle
      if (soundEnabled) {
        playSound('click');
      }
    }
  };

  // Complete game
  const finishGame = () => {
    setIsPlaying(false);
    setIsFinished(true);

    setBushes(INITIAL_BUSHES);

    if (soundEnabled) {
      playSound('success');
    }
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
    });

    const finalScore = scoreRef.current;
    const finalPlucked = pluckedRef.current;
    const finalMissed = missedRef.current;
    const finalCatTaps = caterpillarTapsRef.current;
    const latencies = reactionTimesRef.current;

    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 2200;

    const totalActions = finalPlucked + finalCatTaps + finalMissed;
    const calculatedAccuracy =
      totalActions > 0
        ? Math.min(1, Math.max(0.3, finalPlucked / (finalPlucked + finalCatTaps + finalMissed * 0.4)))
        : 0.8;

    const isSuccess = finalScore >= 40 && calculatedAccuracy >= 0.6;
    const updatedDDA = updateDDA(ddaRef.current, {
      success: isSuccess,
      accuracy: calculatedAccuracy,
      reactionTimeMs: avgLatency,
    });
    setDdaState(updatedDDA);
    storage.saveGameDDA('tea_garden', updatedDDA);
    setLevelResult(updatedDDA);

    if (updatedDDA.leveledUp) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      if (updatedDDA.feedbackMessage) {
        speak(updatedDDA.feedbackMessage[language], language);
      }
    }

    // Save session
    storage.saveCognitiveSession({
      id: `sess-${Date.now()}`,
      gameId: 'tea_garden',
      domain: 'attention_motor',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      score: Math.min(100, Math.round((finalScore / 150) * 100)),
      maxScore: 100,
      accuracy: Math.round(calculatedAccuracy * 100) / 100,
      reactionTimeMs: avgLatency,
      difficultyLevel: updatedDDA.level,
    });
  };

  const getSpeedRating = (latency: number) => {
    const ratings: Record<Language, { fast: string; sharp: string; steady: string; calm: string }> = {
      en: { fast: '⚡ Ultra Fast', sharp: '🌟 Sharp & Agile', steady: '🌿 Steady & Attentive', calm: '🍵 Calm & Patient' },
      as: { fast: '⚡ অতি খৰতকীয়া', sharp: '🌟 চোকা আৰু সজাগ', steady: '🌿 স্থিৰ আৰু মনোযোগী', calm: '🍵 শান্ত আৰু ধৈৰ্যশীল' },
      bn: { fast: '⚡ অত্যন্ত দ্রুত', sharp: '🌟 তীক্ষ্ণ ও চটপটে', steady: '🌿 ধীর ও মনোযোগী', calm: '🍵 শান্ত ও ধৈর্যশীল' },
      hi: { fast: '⚡ अति तीव्र', sharp: '🌟 फुर्तीला व सजग', steady: '🌿 स्थिर व एकाग्र', calm: '🍵 शांत व धैर्यवान' },
      mni: { fast: '⚡ Yamna Thuna', sharp: '🌟 Mityeng Sengba', steady: '🌿 Tapna Pukning Changba', calm: '🍵 Ningthina Nungngaina' },
    };
    const r = ratings[language] || ratings.en;
    if (latency < 950) return { label: r.fast, color: 'text-amber-400' };
    if (latency < 1400) return { label: r.sharp, color: 'text-emerald-400' };
    if (latency < 2000) return { label: r.steady, color: 'text-teal-300' };
    return { label: r.calm, color: 'text-stone-300' };
  };

  const avgLatency =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  const calculatedAccuracyPct = Math.round(
    pluckedCount + missedCount + caterpillarTaps > 0
      ? (pluckedCount / (pluckedCount + caterpillarTaps + missedCount * 0.4)) * 100
      : 100
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Top Header Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-emerald-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm sm:text-base font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
          aria-label={t('back', language)}
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
          <span>{t('back', language)}</span>
        </button>

        {/* Live Game Stats Pill Group */}
        <div className="flex items-center gap-2 sm:gap-3.5 text-sm sm:text-base font-extrabold text-stone-800">
          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border transition-colors ${
              timeLeft <= 5 && isPlaying
                ? 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Timer className="w-4 h-4 text-amber-700" />
            <span className="font-mono">{timeLeft}s</span>
          </div>

          {/* Plucked Tea Buds / Basket Counter */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl text-emerald-900">
            <span className="text-base">🧺</span>
            <span className="text-xs sm:text-sm font-black">
              {pluckedCount} {t('teaLeavesCount', language)}
            </span>
          </div>

          {/* Score */}
          <div className="bg-amber-100/80 border border-amber-300 px-3 py-1.5 rounded-2xl text-amber-950 text-xs sm:text-sm font-black">
            {score} pts
          </div>

          {/* DDA Difficulty Level Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl text-emerald-800 text-xs font-black shadow-2xs">
            <span className="text-base">{GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🌿'}</span>
            <span className="hidden sm:inline">{GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}</span>
            <span className="sm:hidden">Lvl {ddaState.level}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            title={soundEnabled ? t('voice.stopSpeaking', language) : t('voice.readAloud', language)}
            aria-label={soundEnabled ? t('voice.stopSpeaking', language) : t('voice.readAloud', language)}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>
        </div>
      </div>

      {/* Cultural Tea Garden Header Banner */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center justify-center gap-2.5">
          <span className="text-3xl">🌿</span>
          <span>{t('teaGardenTitle', language)}</span>
        </h2>
        <p className="text-sm sm:text-base text-stone-600 font-medium max-w-xl mx-auto">
          {t('teaGardenSubtitle', language)}
        </p>
      </div>

      {/* Tea Garden Ground Field */}
      <div className="bg-gradient-to-b from-emerald-900 via-teal-950 to-stone-950 p-5 sm:p-8 rounded-3xl shadow-2xl border-4 border-emerald-700/80 relative overflow-hidden">
        {/* Serene Assam tea plantation decorative pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6ee7b7_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

        {/* 1. START SCREEN */}
        {!isPlaying && !isFinished && (
          <div className="text-center py-10 sm:py-14 space-y-6 relative z-10 max-w-lg mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center text-5xl shadow-2xl border-2 border-emerald-300 transform hover:scale-105 transition-transform animate-bounce">
              🌱
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t('teaGardenReady', language)}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <p className="text-emerald-100 text-sm sm:text-base leading-relaxed px-4">
                  {t('teaGardenStartPrompt', language)}
                </p>
                <button
                  onClick={() => speakInstruction('start', language)}
                  className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 transition-colors cursor-pointer shrink-0 border border-emerald-600/50"
                  title={t('voice.readAloud', language)}
                  aria-label={t('voice.readAloud', language)}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick visual tutorial pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/60 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-amber-300">
                <span className="text-base">🌱</span>
                <span>{t('teaGardenPluck', language)} (+10)</span>
              </div>
              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-600/60 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-rose-300">
                <span className="text-base">🐛</span>
                <span>{t('teaGardenCaterpillar', language)} (-5)</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={startGame}
                className="px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-900 font-black text-lg sm:text-xl rounded-2xl shadow-xl transform active:scale-95 transition-all cursor-pointer border-2 border-amber-200 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-950" />
                <span>{t('startGame', language)}</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. ACTIVE GAMEPLAY */}
        {isPlaying && (
          <div className="space-y-4 relative z-10 py-2">
            {/* Countdown progress bar */}
            <div className="bg-emerald-950/70 rounded-full h-3 overflow-hidden border border-emerald-700/60">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeLeft > 7
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                    : 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse'
                }`}
                style={{ width: `${(timeLeft / TOTAL_GAME_TIME) * 100}%` }}
              />
            </div>

            {/* 6 Bush Slots (2 rows x 3 columns) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 py-2">
              {bushes.map((bush) => {
                const isShaking = shakingBushId === bush.id;
                const feedback = floatingFeedbacks.find((f) => f.bushId === bush.id);

                return (
                  <div key={bush.id} className="relative">
                    <button
                      onClick={() => handleBushClick(bush.id)}
                      className={`w-full h-36 sm:h-44 rounded-3xl relative overflow-hidden cursor-pointer transition-all duration-150 transform active:scale-95 shadow-xl border-2 flex flex-col items-center justify-center select-none ${
                        isShaking ? 'animate-bounce' : ''
                      } ${
                        bush.hasLeaf
                          ? 'bg-gradient-to-b from-emerald-600 via-teal-700 to-emerald-900 border-amber-300 shadow-amber-400/30 ring-4 ring-amber-300/40'
                          : bush.isCaterpillar
                          ? 'bg-gradient-to-b from-amber-950 via-rose-950 to-stone-900 border-rose-400/80 ring-4 ring-rose-500/30'
                          : 'bg-gradient-to-b from-emerald-800/80 via-teal-900/80 to-emerald-950/90 border-emerald-600/40 hover:border-emerald-400/50'
                      }`}
                      aria-label={
                        bush.hasLeaf
                          ? 'Tender tea leaf bud'
                          : bush.isCaterpillar
                          ? 'Caterpillar distractor'
                          : 'Tea bush'
                      }
                    >
                      {/* Natural Tea Bush Foliage Visual */}
                      <div
                        className={`transition-transform duration-200 ${
                          bush.hasLeaf ? 'scale-90 opacity-40' : 'scale-100 opacity-60'
                        }`}
                      >
                        <div className="text-5xl sm:text-6xl filter drop-shadow">🌳</div>
                      </div>

                      {/* Fresh Golden Sprout Target ("Two leaves and a bud") */}
                      {bush.hasLeaf && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 animate-in zoom-in-75 duration-150">
                          <div className="relative text-6xl sm:text-7xl filter drop-shadow-lg transform animate-bounce">
                            🌱
                          </div>
                          <div className="mt-1 bg-amber-400 text-stone-950 font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-md border border-amber-200 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                            <span>{t('teaGardenPluck', language)}</span>
                          </div>
                        </div>
                      )}

                      {/* Caterpillar Distractor */}
                      {bush.isCaterpillar && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 animate-in zoom-in-75 duration-150">
                          <div className="text-5xl sm:text-6xl filter drop-shadow-md transform -rotate-12">
                            🐛
                          </div>
                          <div className="mt-1 bg-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-md border border-rose-300 uppercase tracking-wide">
                            {t('teaGardenCaterpillar', language)}
                          </div>
                        </div>
                      )}

                      {/* Soil base effect */}
                      <div className="absolute bottom-0 inset-x-0 h-3 bg-stone-950/40 rounded-b-3xl pointer-events-none" />
                    </button>

                    {/* Floating score popup (+10 / -5) */}
                    {feedback && (
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-black text-sm sm:text-base shadow-xl z-20 pointer-events-none transform -translate-y-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${
                          feedback.type === 'gain'
                            ? 'bg-amber-400 text-stone-950 border border-amber-200'
                            : 'bg-rose-600 text-white border border-rose-300'
                        }`}
                      >
                        {feedback.text}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. FINISHED / RESULTS SCREEN */}
        {isFinished && (
          <div className="text-center py-8 sm:py-12 space-y-6 relative z-10 max-w-xl mx-auto animate-in zoom-in-95 duration-200">
            {/* Trophy */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 text-stone-900 mx-auto flex items-center justify-center text-4xl shadow-2xl border-2 border-amber-100">
              <Trophy className="w-10 h-10 text-amber-950" />
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black text-white">
                {t('teaGardenFinishedTitle', language)}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <p className="text-emerald-200 text-sm sm:text-base font-medium">
                  {t('teaGardenGreatJob', language)}
                </p>
                <button
                  onClick={() => speakInstruction('finish', language)}
                  className="p-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 transition-colors cursor-pointer shrink-0 border border-emerald-600/50"
                  title={t('voice.readAloud', language)}
                  aria-label={t('voice.readAloud', language)}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cognitive Scorecard Breakdown */}
            <div className="bg-emerald-950/90 border border-emerald-700/80 rounded-3xl p-5 sm:p-6 shadow-inner space-y-4">
              {/* Main Score Pill */}
              <div className="bg-emerald-900/60 rounded-2xl p-3 flex items-center justify-between border border-emerald-700/60">
                <span className="text-stone-300 font-bold text-sm sm:text-base">
                  {t('score', language)}:
                </span>
                <span className="text-3xl font-black text-amber-300 tracking-tight">
                  {score} <span className="text-sm font-semibold text-emerald-300">pts</span>
                </span>
              </div>

              {/* 4 Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 text-left">
                {/* Plucked Buds */}
                <div className="bg-stone-900/60 border border-emerald-800/40 p-3 rounded-2xl">
                  <div className="text-xs font-semibold text-stone-400">
                    {t('teaGardenBudsPlucked', language)}
                  </div>
                  <div className="text-xl font-black text-emerald-300 mt-0.5">
                    {pluckedCount} 🍃
                  </div>
                </div>

                {/* Caterpillars Avoided */}
                <div className="bg-stone-900/60 border border-emerald-800/40 p-3 rounded-2xl">
                  <div className="text-xs font-semibold text-stone-400">
                    {t('teaGardenCaterpillarsAvoided', language)}
                  </div>
                  <div className="text-xl font-black text-amber-300 mt-0.5">
                    {caterpillarsAvoided} 🐛
                  </div>
                </div>

                {/* Reaction Speed */}
                <div className="bg-stone-900/60 border border-emerald-800/40 p-3 rounded-2xl">
                  <div className="text-xs font-semibold text-stone-400">
                    {t('reactionSpeed', language)}
                  </div>
                  <div className="text-lg font-black text-teal-300 mt-0.5">
                    {avgLatency > 0 ? `${avgLatency} ms` : '—'}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                    {avgLatency > 0 ? getSpeedRating(avgLatency).label : ''}
                  </div>
                </div>

                {/* Accuracy */}
                <div className="bg-stone-900/60 border border-emerald-800/40 p-3 rounded-2xl">
                  <div className="text-xs font-semibold text-stone-400">
                    {t('accuracy', language)}
                  </div>
                  <div className="text-lg font-black text-amber-300 mt-0.5">
                    {calculatedAccuracyPct}%
                  </div>
                  <div className="text-[11px] font-bold text-stone-400 mt-0.5">
                    {t('level', language)}: {ddaState.level}
                  </div>
                </div>
              </div>
            </div>

            {/* Level Adaptive Feedback */}
            {levelResult && (
              <div className={`mx-auto max-w-md p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md ${
                levelResult.leveledUp
                  ? 'bg-amber-400 text-stone-950 animate-bounce'
                  : 'bg-emerald-900/70 text-emerald-100 border border-emerald-700'
              }`}>
                <span className="text-xl">
                  {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🌿'}
                </span>
                <span>
                  {levelResult.feedbackMessage?.[language] ||
                    `${GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}`}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                onClick={startGame}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-2xl text-base shadow-xl transform active:scale-95 transition-all cursor-pointer border border-amber-200"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t('playAgain', language)}</span>
              </button>

              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-2xl text-base shadow-lg transition-all cursor-pointer border border-emerald-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t('home', language)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeaGardenFocus;


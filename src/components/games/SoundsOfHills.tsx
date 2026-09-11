import React, { useState, useEffect } from 'react';
import { Language, SoundCard, DDAState, DDAUpdateResult } from '../../types';
import { soundCards } from '../../services/mockData';
import { playSound, speak } from '../../services/voiceService';
import { updateDDA, GAME_LEVELS } from '../../services/aiEngine';
import { storage } from '../../services/storage';
import { t } from '../../services/i18n';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, Trophy, Award } from 'lucide-react';

interface SoundsOfHillsProps {
  language: Language;
  onBack: () => void;
}

export const SoundsOfHills: React.FC<SoundsOfHillsProps> = ({
  language,
  onBack,
}) => {
  const [ddaState, setDdaState] = useState<DDAState>(() => storage.loadGameDDA('sounds_hills', 1));
  const [activeSounds, setActiveSounds] = useState<SoundCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [options, setOptions] = useState<SoundCard[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [levelResult, setLevelResult] = useState<DDAUpdateResult | null>(null);

  // Determine distractor count by level (L1: 2 choices total, L2-3: 3 choices, L4-5: 4 choices)
  const getChoiceCountForLevel = (lvl: number) => {
    if (lvl === 1) return 2;
    if (lvl <= 3) return 3;
    return 4;
  };

  const generateOptions = (target: SoundCard, lvl: number): SoundCard[] => {
    const choiceCount = getChoiceCountForLevel(lvl);
    const others = soundCards.filter((s) => s.id !== target.id).sort(() => Math.random() - 0.5);
    const distractors = others.slice(0, choiceCount - 1);
    return [target, ...distractors].sort(() => Math.random() - 0.5);
  };

  // Sample 4 sounds per session from soundCards pool
  const initRound = (lvl: number) => {
    const shuffled = [...soundCards].sort(() => Math.random() - 0.5).slice(0, 4);
    setActiveSounds(shuffled);
    setCurrentIndex(0);
    setSelectedId(null);
    setScore(0);
    setIsFinished(false);
    setLevelResult(null);
    setStartTime(Date.now());
    if (shuffled.length > 0) {
      setOptions(generateOptions(shuffled[0], lvl));
    }
  };

  useEffect(() => {
    initRound(ddaState.level);
  }, []);

  const currentSound = activeSounds[currentIndex] || soundCards[0];

  const handlePlaySound = () => {
    if (!currentSound) return;
    setIsPlayingAudio(true);
    playSound(currentSound.soundType);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2200);
  };

  const handleSelectOption = (card: SoundCard) => {
    if (selectedId || !currentSound) return;
    setSelectedId(card.id);

    const isCorrect = card.id === currentSound.id;
    if (isCorrect) {
      playSound('success');
      setScore((s) => s + 1);
    } else {
      playSound('click');
    }

    setTimeout(() => {
      if (currentIndex + 1 < activeSounds.length) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setSelectedId(null);
        setOptions(generateOptions(activeSounds[nextIndex], ddaState.level));
      } else {
        finishGame(score + (isCorrect ? 1 : 0));
      }
    }, 1600);
  };

  const finishGame = (finalScore: number) => {
    setIsFinished(true);
    const timeTakenMs = Date.now() - startTime;
    const totalQ = Math.max(1, activeSounds.length);
    const avgLatency = Math.round(timeTakenMs / totalQ);
    const accuracy = finalScore / totalQ;
    const success = accuracy >= 0.75;

    const updated = updateDDA(ddaState, { success, accuracy, reactionTimeMs: avgLatency });
    setDdaState(updated);
    storage.saveGameDDA('sounds_hills', updated);
    setLevelResult(updated);

    if (updated.leveledUp) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } else {
      confetti({ particleCount: 50, spread: 60 });
    }

    storage.saveCognitiveSession({
      id: `sess-${Date.now()}`,
      gameId: 'sounds_hills',
      domain: 'auditory_memory',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      score: Math.round(accuracy * 100),
      maxScore: 100,
      accuracy,
      reactionTimeMs: avgLatency,
      difficultyLevel: updated.level,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-xs border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-bold text-stone-700">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-base">{GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🎶'}</span>
            <span className="text-xs font-black text-emerald-800">
              {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}
            </span>
          </div>
          <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl">
            {t('question', language)} {currentIndex + 1} / {activeSounds.length || 4}
          </span>
          <span className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl">
            {t('score', language)}: {score}
          </span>
        </div>
      </div>

      {/* Main Card */}
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center justify-center gap-2">
              <span>🎶</span>
              <span>{t('soundsHillsTitle', language)}</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-sm text-stone-600 font-medium">
                {t('soundsHillsSubtitle', language)}
              </p>
              <button
                onClick={() => speak(`${t('soundsHillsTitle', language)}. ${t('soundsHillsSubtitle', language)}`, language)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
                title={t('voice.readAloud', language)}
                aria-label={t('voice.readAloud', language)}
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>

          {/* Sound Trigger Button */}
          <div className="py-6">
            <button
              onClick={handlePlaySound}
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full mx-auto flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xl transition-all active:scale-95 border-4 ${
                isPlayingAudio
                  ? 'bg-emerald-500 border-amber-300 text-white animate-voice-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 border-emerald-500 text-white'
              }`}
            >
              <Volume2 className={`w-14 h-14 sm:w-16 sm:h-16 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                {isPlayingAudio ? t('soundPlaying', language) : t('listenSound', language)}
              </span>
            </button>
            <p className="text-xs text-stone-400 mt-3 font-semibold">
              {t('touchToPlaySound', language)}
            </p>
          </div>

          {/* Picture Choices */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-black text-stone-700 uppercase tracking-wider text-left">
              {t('whichSoundMadeThis', language)}:
            </p>
            <div className={`grid gap-3 ${options.length === 2 ? 'grid-cols-2' : options.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {options.map((card) => {
                const isChosen = selectedId === card.id;
                let btnClass = 'bg-stone-50 hover:bg-amber-50 border-stone-200 text-stone-800';

                if (selectedId) {
                  if (card.id === currentSound.id) {
                    btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400';
                  } else if (isChosen) {
                    btnClass = 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400';
                  }
                }

                return (
                  <button
                    key={card.id}
                    disabled={selectedId !== null}
                    onClick={() => handleSelectOption(card)}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${btnClass}`}
                  >
                    <span className="text-5xl">{card.icon}</span>
                    <span className="text-sm font-extrabold line-clamp-1">
                      {card.title[language] || card.title.en}
                    </span>
                    {selectedId && card.id === currentSound.id && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1" />
                    )}
                    {selectedId && isChosen && card.id !== currentSound.id && (
                      <XCircle className="w-5 h-5 text-rose-600 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-3xl">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('soundsWonTitle', language)}
          </h3>
          <p className="text-stone-600 text-sm">
            {t('soundsWonSubtitle', language)}
          </p>

          {/* Level Adaptive Feedback */}
          {levelResult && (
            <div className={`mt-4 mx-auto max-w-md p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md ${
              levelResult.leveledUp
                ? 'bg-amber-400 text-stone-950 animate-bounce'
                : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
            }`}>
              <span className="text-xl">
                {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🎶'}
              </span>
              <span>
                {levelResult.feedbackMessage?.[language] ||
                  `${GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}`}
              </span>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => initRound(ddaState.level)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer transition-transform active:scale-95"
            >
              {t('playAgain', language)}
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-2xl text-sm cursor-pointer"
            >
              {t('home', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundsOfHills;

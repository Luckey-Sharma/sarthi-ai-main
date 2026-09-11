import React, { useState, useEffect } from 'react';
import { Language, RoutineCard, DDAState, DDAUpdateResult } from '../../types';
import { routineCards } from '../../services/mockData';
import { updateDDA, GAME_LEVELS } from '../../services/aiEngine';
import { storage } from '../../services/storage';
import { playSound, speak } from '../../services/voiceService';
import { t } from '../../services/i18n';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowUp, ArrowDown, Check, Trophy, Clock, Award, Volume2 } from 'lucide-react';

interface RoutineBuilderProps {
  language: Language;
  onBack: () => void;
}

export const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  language,
  onBack,
}) => {
  const [ddaState, setDdaState] = useState<DDAState>(() => storage.loadGameDDA('routine_builder', 1));
  const [items, setItems] = useState<RoutineCard[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [levelResult, setLevelResult] = useState<DDAUpdateResult | null>(null);

  // Helper to determine card count per level
  const getCardCountForLevel = (lvl: number) => {
    if (lvl === 1) return 3;
    if (lvl <= 3) return 4;
    if (lvl === 4) return 5;
    return 6; // Level 5
  };

  // Sample cards dynamically and scramble
  const initRound = (lvl: number) => {
    const cardCount = getCardCountForLevel(lvl);

    // Randomly select cardCount items from the 11-card pool
    // To ensure a sensible storyline, we pick cards that have distinct chronological order
    const shuffledPool = [...routineCards].sort(() => Math.random() - 0.5);
    const selected = shuffledPool.slice(0, cardCount);

    // Ensure the scrambled order is actually scrambled (not accidentally already sorted)
    let scrambled = [...selected].sort(() => Math.random() - 0.5);
    let isAlreadySorted = true;
    for (let i = 0; i < scrambled.length - 1; i++) {
      if (scrambled[i].correctOrder > scrambled[i + 1].correctOrder) {
        isAlreadySorted = false;
        break;
      }
    }
    if (isAlreadySorted && scrambled.length >= 2) {
      // Swap first two to make it an active challenge
      const temp = scrambled[0];
      scrambled[0] = scrambled[1];
      scrambled[1] = temp;
    }

    setItems(scrambled);
    setAttempts(0);
    setIsWon(false);
    setLevelResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initRound(ddaState.level);
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    playSound('click');
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleCheckOrder = () => {
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);
    let correct = true;
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].correctOrder > items[i + 1].correctOrder) {
        correct = false;
        break;
      }
    }

    if (correct) {
      playSound('success');
      setIsWon(true);

      const timeTakenMs = Date.now() - startTime;
      const accuracy = currentAttempts === 1 ? 1.0 : currentAttempts === 2 ? 0.8 : 0.6;
      const updated = updateDDA(ddaState, {
        success: true,
        accuracy,
        reactionTimeMs: timeTakenMs / items.length,
      });
      setDdaState(updated);
      storage.saveGameDDA('routine_builder', updated);
      setLevelResult(updated);

      if (updated.leveledUp) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 50, spread: 60 });
      }

      const calculatedScore = Math.max(50, Math.min(100, Math.round(100 - (currentAttempts - 1) * 15)));
      storage.saveCognitiveSession({
        id: `sess-${Date.now()}`,
        gameId: 'routine_builder',
        domain: 'temporal_orientation',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        score: calculatedScore,
        maxScore: 100,
        accuracy,
        reactionTimeMs: timeTakenMs / items.length,
        difficultyLevel: updated.level,
      });
    } else {
      playSound('click');
    }
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
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-base">{GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🌅'}</span>
            <span className="text-xs font-black text-amber-800">
              {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}
            </span>
          </div>
          <span className="bg-stone-100 text-stone-800 px-3 py-1.5 rounded-xl">
            {items.length} {language === 'as' ? 'পদক্ষেপ' : language === 'bn' ? 'ধাপ' : language === 'hi' ? 'चरण' : language === 'mni' ? 'Taankak' : 'Steps'}
          </span>
        </div>
      </div>

      {/* Intro */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center justify-center gap-2">
          <span>🌅</span>
          <span>{t('routineBuilderTitle', language)}</span>
        </h2>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-stone-600 font-medium">
            {t('routineBuilderSubtitle', language)}
          </p>
          <button
            onClick={() => speak(`${t('routineBuilderTitle', language)}. ${t('routineBuilderSubtitle', language)}`, language)}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
            title={t('voice.readAloud', language)}
            aria-label={t('voice.readAloud', language)}
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
          </button>
        </div>
      </div>

      {/* Routine Cards List */}
      {!isWon ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-stone-200 shadow-sm flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-sm font-extrabold shrink-0">
                  {index + 1}
                </span>
                <span className="text-3xl sm:text-4xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <h4 className="text-base sm:text-lg font-black text-stone-800 truncate">
                    {item.title[language] || item.title.en}
                  </h4>
                  <p className="text-xs text-stone-400 font-semibold">{item.timeLabel}</p>
                </div>
              </div>

              {/* Up / Down Reorder Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                  title={language === 'hi' ? 'ऊपर करें' : language === 'as' ? 'ওপৰলৈ নিয়ক' : language === 'bn' ? 'ওপরে নিন' : language === 'mni' ? 'Mathakloi Chingkhatlo' : 'Move Up'}
                  aria-label={language === 'hi' ? 'ऊपर करें' : language === 'as' ? 'ওপৰলৈ নিয়ক' : language === 'bn' ? 'ওপরে নিন' : language === 'mni' ? 'Mathakloi Chingkhatlo' : 'Move Up'}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                  title={language === 'hi' ? 'नीचे करें' : language === 'as' ? 'তললৈ নিয়ক' : language === 'bn' ? 'নিচে নিন' : language === 'mni' ? 'Makhaloi Chingthalo' : 'Move Down'}
                  aria-label={language === 'hi' ? 'नीचे करें' : language === 'as' ? 'তললৈ নিয়ক' : language === 'bn' ? 'নিচে নিন' : language === 'mni' ? 'Makhaloi Chingthalo' : 'Move Down'}
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Action Button */}
          <div className="pt-4 text-center">
            <button
              onClick={handleCheckOrder}
              className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-700/25 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Check className="w-5 h-5" />
              <span>{t('checkOrder', language)}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Win Card */
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-3xl">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('routineWonTitle', language)}
          </h3>
          <p className="text-stone-600 text-sm">
            {t('routineWonSubtitle', language)}
          </p>

          {/* Level Adaptive Feedback */}
          {levelResult && (
            <div className={`mt-4 mx-auto max-w-md p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md ${
              levelResult.leveledUp
                ? 'bg-amber-400 text-stone-950 animate-bounce'
                : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
            }`}>
              <span className="text-xl">
                {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🌅'}
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
              {t('reShuffle', language)}
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

export default RoutineBuilder;

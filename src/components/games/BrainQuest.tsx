import React, { useState, useEffect } from 'react';
import { Language, DDAState, DDAUpdateResult, BrainQuestPuzzle } from '../../types';
import { brainQuestPuzzles } from '../../services/mockData';
import { updateDDA, GAME_LEVELS } from '../../services/aiEngine';
import { storage } from '../../services/storage';
import { playSound, speak } from '../../services/voiceService';
import confetti from 'canvas-confetti';
import { ArrowLeft, Lightbulb, HelpCircle, CheckCircle2, XCircle, Trophy, Award, Sparkles, Volume2 } from 'lucide-react';
import { t } from '../../services/i18n';

interface BrainQuestProps {
  language: Language;
  onBack: () => void;
}

export const BrainQuest: React.FC<BrainQuestProps> = ({
  language,
  onBack,
}) => {
  const [ddaState, setDdaState] = useState<DDAState>(() => storage.loadGameDDA('brain_quest', 1));
  const [activePuzzles, setActivePuzzles] = useState<BrainQuestPuzzle[]>([]);
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [levelResult, setLevelResult] = useState<DDAUpdateResult | null>(null);

  // Pick 3 random puzzles tuned to current DDA level
  const initRound = (lvl: number) => {
    // Filter matching level or nearby levels
    const exactMatches = brainQuestPuzzles.filter((p) => p.level === lvl);
    const fallbackMatches = brainQuestPuzzles.filter((p) => Math.abs((p.level || 1) - lvl) <= 1);
    const pool = exactMatches.length >= 3 ? exactMatches : fallbackMatches.length >= 3 ? fallbackMatches : brainQuestPuzzles;

    // Shuffle and pick 3 puzzles
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    // Shuffle options for each puzzle
    const withShuffledOptions = shuffled.map((p) => ({
      ...p,
      options: [...p.options].sort(() => Math.random() - 0.5),
    }));

    setActivePuzzles(withShuffledOptions);
    setPuzzleIndex(0);
    setSelectedOptionId(null);
    setShowHint(false);
    setScore(0);
    setIsFinished(false);
    setLevelResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initRound(ddaState.level);
  }, []);

  const currentPuzzle = activePuzzles[puzzleIndex] || activePuzzles[0] || brainQuestPuzzles[0];

  const handleOptionSelect = (optionId: string) => {
    if (selectedOptionId || !currentPuzzle) return; // already answered
    setSelectedOptionId(optionId);

    const option = currentPuzzle.options.find((o) => o.id === optionId);
    const isCorrect = !!option?.isCorrect;

    if (isCorrect) {
      playSound('success');
      setScore((s) => s + 1);
    } else {
      playSound('click');
    }

    setTimeout(() => {
      if (puzzleIndex + 1 < activePuzzles.length) {
        setPuzzleIndex((prev) => prev + 1);
        setSelectedOptionId(null);
        setShowHint(false);
      } else {
        finishGame(score + (isCorrect ? 1 : 0));
      }
    }, 1600);
  };

  const finishGame = (finalScore: number) => {
    setIsFinished(true);
    const timeTakenMs = Date.now() - startTime;
    const totalQ = Math.max(1, activePuzzles.length);
    const avgLatency = Math.round(timeTakenMs / totalQ);
    const accuracy = finalScore / totalQ;
    const success = accuracy >= 0.66;

    const updated = updateDDA(ddaState, { success, accuracy, reactionTimeMs: avgLatency });
    setDdaState(updated);
    storage.saveGameDDA('brain_quest', updated);
    setLevelResult(updated);

    if (updated.leveledUp) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      if (updated.feedbackMessage) {
        speak(updated.feedbackMessage[language], language);
      }
    } else {
      confetti({ particleCount: 50, spread: 60 });
    }

    storage.saveCognitiveSession({
      id: `sess-${Date.now()}`,
      gameId: 'brain_quest',
      domain: 'executive_function',
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
      {/* Navigation Header */}
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
            <span className="text-base">{GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🧩'}</span>
            <span className="text-xs font-black text-emerald-800">
              {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}
            </span>
          </div>
          <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl">
            {t('question', language)} {puzzleIndex + 1} / {activePuzzles.length || 3}
          </span>
          <span className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl">
            {t('score', language)}: {score}
          </span>
        </div>
      </div>

      {/* Main Puzzle Card */}
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">
              🧩
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {t('brainQuestTitle', language)}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {t('brainQuestSubtitle', language)}
              </p>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-200/80 flex items-start justify-between gap-4">
            <p className="text-lg sm:text-xl font-extrabold text-stone-900 leading-relaxed flex-1">
              {currentPuzzle.question[language] || currentPuzzle.question.en}
            </p>
            <button
              onClick={() => speak(currentPuzzle.question[language] || currentPuzzle.question.en, language)}
              className="p-2.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title={t('voice.readAloud', language)}
              aria-label={t('voice.readAloud', language)}
            >
              <Volume2 className="w-5 h-5 text-amber-900" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentPuzzle.options.map((option) => {
              const isChosen = selectedOptionId === option.id;
              let btnClass = 'bg-stone-50 hover:bg-amber-50 border-stone-200 text-stone-800';

              if (selectedOptionId) {
                if (option.isCorrect) {
                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400';
                } else if (isChosen) {
                  btnClass = 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={selectedOptionId !== null}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 font-extrabold text-base transition-all flex items-center justify-between ${btnClass} cursor-pointer active:scale-98`}
                >
                  <span>{option.label[language] || option.label.en}</span>
                  {selectedOptionId && option.isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  {selectedOptionId && isChosen && !option.isCorrect && (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint & Cultural Context */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100 px-3 py-2 rounded-xl cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showHint ? t('hideHint', language) : t('hint', language)}</span>
            </button>

            <span className="text-[11px] text-stone-400 italic">
              {currentPuzzle.culturalContext}
            </span>
          </div>

          {showHint && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-medium text-amber-900 animate-in fade-in duration-200">
              💡 {currentPuzzle.hint[language] || currentPuzzle.hint.en}
            </div>
          )}
        </div>
      ) : (
        /* Completion Screen */
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-3xl">
            <Trophy className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('brainQuestSolvedTitle', language)}
          </h3>
          <p className="text-stone-600 text-sm">
            {t('score', language)}: <strong className="text-emerald-700 font-black">{score}</strong> / {activePuzzles.length}
          </p>

          {/* Level Adaptive Feedback */}
          {levelResult && (
            <div className={`mt-4 mx-auto max-w-md p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md ${
              levelResult.leveledUp
                ? 'bg-amber-400 text-stone-950 animate-bounce'
                : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
            }`}>
              <span className="text-xl">
                {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🧩'}
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

export default BrainQuest;

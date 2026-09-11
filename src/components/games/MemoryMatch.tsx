import React, { useState, useEffect } from 'react';
import { Language, FamilyMember, DDAState, DDAUpdateResult } from '../../types';
import { culturalCards } from '../../services/mockData';
import { createInitialDDAState, updateDDA, GAME_LEVELS } from '../../services/aiEngine';
import { storage } from '../../services/storage';
import { playSound, speak } from '../../services/voiceService';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowLeft, Trophy, Sparkles, Award, Volume2 } from 'lucide-react';
import { t } from '../../i18n';

interface MemoryMatchProps {
  language: Language;
  familyMembers: FamilyMember[];
  onBack: () => void;
}

interface CardItem {
  uid: string;
  id: string;
  label: string;
  icon?: string;
  imageUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatch: React.FC<MemoryMatchProps> = ({
  language,
  familyMembers,
  onBack,
}) => {
  const [gameMode, setGameMode] = useState<'cultural' | 'family'>('cultural');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [ddaState, setDdaState] = useState<DDAState>(() => storage.loadGameDDA('memory_match', 1));
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [levelResult, setLevelResult] = useState<DDAUpdateResult | null>(null);

  // Helper to determine number of pairs per level
  const getPairsForLevel = (lvl: number) => {
    if (lvl === 1) return 3; // 6 cards
    if (lvl === 2) return 4; // 8 cards
    if (lvl === 3) return 5; // 10 cards
    if (lvl === 4) return 6; // 12 cards
    return 8; // 16 cards (level 5)
  };

  // Initialize or reset deck with non-repetitive sampling
  const initGame = (mode: 'cultural' | 'family', level: number) => {
    const numPairs = getPairsForLevel(level);
    let baseItems: { id: string; label: string; icon?: string; imageUrl?: string }[] = [];

    if (mode === 'cultural') {
      // Randomly sample numPairs from the expanded culturalCards pool
      const shuffledPool = [...culturalCards].sort(() => Math.random() - 0.5);
      baseItems = shuffledPool.slice(0, numPairs).map((c) => ({
        id: c.id,
        label: c.title[language] || c.title.en,
        icon: c.icon,
      }));
    } else {
      const storedFamily = storage.loadFamilyMembers();
      const rawFamily = familyMembers.length >= 2 ? familyMembers : storedFamily;
      const activeFamily = rawFamily.length >= 2 ? rawFamily : [
        { id: 'f1', name: 'Ananya (Daughter)', relation: 'Daughter', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', memoryHint: '', favoriteMemory: '', hometown: '' },
        { id: 'f2', name: 'Arnob (Grandson)', relation: 'Grandson', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', memoryHint: '', favoriteMemory: '', hometown: '' },
      ];
      // Randomly shuffle family list if more than numPairs
      const shuffledFamily = [...activeFamily].sort(() => Math.random() - 0.5);
      baseItems = shuffledFamily.slice(0, numPairs).map((f) => ({
        id: f.id,
        label: `${f.name} (${f.relation})`,
        imageUrl: f.photoUrl,
      }));
    }

    const deck: CardItem[] = [];
    baseItems.forEach((item, idx) => {
      deck.push({
        uid: `${item.id}-a-${idx}`,
        id: item.id,
        label: item.label,
        icon: item.icon,
        imageUrl: item.imageUrl,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        uid: `${item.id}-b-${idx}`,
        id: item.id,
        label: item.label,
        icon: item.icon,
        imageUrl: item.imageUrl,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initGame(gameMode, ddaState.level);
  }, [gameMode, language]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    playSound('click');
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.id === secondCard.id) {
        // Matched!
        setTimeout(() => {
          playSound('success');
          setCards((prev) => {
            const matchedCards = [...prev];
            if (matchedCards[firstIdx]) matchedCards[firstIdx] = { ...matchedCards[firstIdx], isMatched: true };
            if (matchedCards[secondIdx]) matchedCards[secondIdx] = { ...matchedCards[secondIdx], isMatched: true };

            if (matchedCards.every((c) => c.isMatched)) {
              const timeTakenMs = Date.now() - startTime;
              handleWin(timeTakenMs);
            }
            return matchedCards;
          });
          setFlippedIndices([]);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setCards((prev) => {
            const resetCards = [...prev];
            if (resetCards[firstIdx]) resetCards[firstIdx] = { ...resetCards[firstIdx], isFlipped: false };
            if (resetCards[secondIdx]) resetCards[secondIdx] = { ...resetCards[secondIdx], isFlipped: false };
            return resetCards;
          });
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  const handleWin = (timeTakenMs: number) => {
    setIsWon(true);

    const numPairs = cards.length / 2;
    const optimalMoves = numPairs;
    const accuracy = Math.max(0.4, Math.min(1.0, optimalMoves / Math.max(optimalMoves, moves)));
    const avgReactionTime = Math.round(timeTakenMs / Math.max(1, moves));

    // Update and persist DDA state
    const updated = updateDDA(ddaState, {
      success: true,
      accuracy,
      reactionTimeMs: avgReactionTime,
    });
    setDdaState(updated);
    storage.saveGameDDA('memory_match', updated);
    setLevelResult(updated);

    if (updated.leveledUp) {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      if (updated.feedbackMessage) {
        speak(updated.feedbackMessage[language], language);
      }
    } else {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }

    // Persist session
    const calculatedScore = Math.max(50, Math.min(100, Math.round(100 - (moves - numPairs) * 5)));
    storage.saveCognitiveSession({
      id: `sess-${Date.now()}`,
      gameId: 'memory_match',
      domain: 'visual_spatial',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      score: calculatedScore,
      maxScore: 100,
      accuracy,
      reactionTimeMs: avgReactionTime,
      difficultyLevel: updated.level,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl shadow-xs border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-2xl border border-amber-200">
          <button
            onClick={() => setGameMode('cultural')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'cultural'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🌿 {t('games.memoryMatch.culturalArtifactsTab', language)}
          </button>
          <button
            onClick={() => setGameMode('family')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'family'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            👨‍👩‍👧 {t('games.memoryMatch.familyPhotosTab', language)}
          </button>
        </div>

        {/* Level Badge & Stats */}
        <div className="flex items-center gap-3 text-xs font-bold text-stone-700">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-base">{GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🌿'}</span>
            <span className="text-xs font-black text-emerald-800">
              {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}
            </span>
          </div>
          <span className="bg-stone-100 px-3 py-1.5 rounded-xl">
            {t('common.moves', language)}: <strong className="text-emerald-700 text-sm">{moves}</strong>
          </span>
          <button
            onClick={() => initGame(gameMode, ddaState.level)}
            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl cursor-pointer"
            title={t('common.retry', language)}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
          {gameMode === 'cultural' ? t('games.memoryMatch.title', language) : t('games.memoryMatch.familyPhotosTab', language)}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-stone-600 font-medium">
            {t('games.memoryMatch.subtitle', language)}
          </p>
          <button
            onClick={() => speak(t('games.memoryMatch.subtitle', language), language)}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
            title={t('common.readAloud', language)}
            aria-label={t('common.readAloud', language)}
          >
            <Volume2 className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* 3D Flip Card Grid */}
      <div
        className={`grid gap-4 sm:gap-5 justify-center mx-auto ${
          cards.length <= 8
            ? 'grid-cols-2 sm:grid-cols-4 max-w-2xl'
            : 'grid-cols-3 sm:grid-cols-4 max-w-3xl'
        }`}
      >
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <div
              key={card.uid}
              onClick={() => handleCardClick(idx)}
              className="perspective-1000 h-36 sm:h-44 w-full cursor-pointer select-none"
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-3xl ${
                  isRevealed ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front (Hidden Face) */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg border-2 border-emerald-500/50 hover:border-amber-300 transition-colors">
                  <span className="text-4xl sm:text-5xl opacity-80">🌿</span>
                  <span className="text-[11px] font-bold mt-2 text-emerald-200 tracking-wider">
                    {t('touchToFlip', language)}
                  </span>
                </div>

                {/* Back (Revealed Face) */}
                <div
                  className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center shadow-xl border-4 transition-all ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-300/40'
                      : 'bg-white border-amber-300'
                  }`}
                >
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.label}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xs mb-1"
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl mb-2">{card.icon || '🌸'}</span>
                  )}
                  <p className="text-xs sm:text-sm font-extrabold text-stone-800 text-center line-clamp-2">
                    {card.label}
                  </p>
                  {card.isMatched && (
                    <span className="mt-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ {t('matched', language)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-3xl shadow-xl text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-white/20 mx-auto flex items-center justify-center text-3xl mb-3">
            <Trophy className="w-8 h-8 text-amber-300" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black">{t('memoryWonTitle', language)}</h3>
          <p className="text-emerald-100 font-medium text-sm mt-1">
            {t('memoryWonSubtitle', language)}
          </p>

          {/* Level Adaptive Feedback */}
          {levelResult && (
            <div className={`mt-4 mx-auto max-w-md p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md ${
              levelResult.leveledUp
                ? 'bg-amber-400 text-stone-950 animate-bounce'
                : 'bg-white/20 text-white backdrop-blur-xs'
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

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => initGame(gameMode, ddaState.level)}
              className="px-6 py-3 bg-white text-emerald-800 hover:bg-amber-50 font-extrabold rounded-2xl text-sm shadow-md transition-transform active:scale-95"
            >
              {t('playAgain', language)}
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-emerald-800/80 hover:bg-emerald-900 font-extrabold rounded-2xl text-sm text-white"
            >
              {t('home', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;

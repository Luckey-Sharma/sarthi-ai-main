import React, { useState, useMemo } from 'react';
import { Language, FamilyMember, DDAState } from '../../types';
import { playSound, speak } from '../../services/voiceService';
import { createInitialDDAState, updateDDA } from '../../services/aiEngine';
import { storage } from '../../services/storage';
import { demoFamilyMembers } from '../../services/mockData';
import { t } from '../../services/i18n';
import confetti from 'canvas-confetti';
import { ArrowLeft, Heart, CheckCircle2, XCircle, Trophy, Sparkles, Volume2 } from 'lucide-react';

interface FamilyRecallProps {
  language: Language;
  familyMembers: FamilyMember[];
  onBack: () => void;
}

export const FamilyRecall: React.FC<FamilyRecallProps> = ({
  language,
  familyMembers,
  onBack,
}) => {
  const rawMembers = familyMembers.length >= 2 ? familyMembers : storage.loadFamilyMembers();
  const members = rawMembers.length >= 2 ? rawMembers : demoFamilyMembers;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [ddaState, setDdaState] = useState<DDAState>(() => createInitialDDAState(1));
  const [startTime, setStartTime] = useState<number>(Date.now());

  const currentMember = members[currentIndex % members.length] || members[0];

  // Generate 3 choices: current + 2 others (stable across renders)
  const options = useMemo(() => {
    if (!currentMember) return [];
    const others = members.filter((m) => m.id !== currentMember.id).sort(() => Math.random() - 0.5);
    return [currentMember, others[0] || currentMember, others[1] || currentMember]
      .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
      .sort(() => Math.random() - 0.5);
  }, [currentIndex, currentMember?.id, members]);

  const handleSelectOption = (chosen: FamilyMember) => {
    if (selectedId) return;
    setSelectedId(chosen.id);

    const isCorrect = chosen.id === currentMember.id;
    if (isCorrect) {
      playSound('success');
      setScore((s) => s + 1);
    } else {
      playSound('click');
    }

    setTimeout(() => {
      if (currentIndex + 1 < members.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedId(null);
      } else {
        finishGame(score + (isCorrect ? 1 : 0));
      }
    }, 1800);
  };

  const finishGame = (finalScore: number) => {
    setIsFinished(true);
    confetti({ particleCount: 50, spread: 60 });
    const timeTakenMs = Date.now() - startTime;
    const avgLatency = Math.round(timeTakenMs / members.length);

    const success = finalScore >= Math.floor(members.length * 0.7);
    const updated = updateDDA(ddaState, { success, reactionTimeMs: avgLatency });
    setDdaState(updated);

    storage.saveCognitiveSession({
      id: `sess-${Date.now()}`,
      gameId: 'family_recall',
      domain: 'autobiographical',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      score: Math.round((finalScore / members.length) * 100),
      maxScore: 100,
      accuracy: finalScore / members.length,
      reactionTimeMs: avgLatency,
      difficultyLevel: ddaState.level,
    });
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedId(null);
    setScore(0);
    setIsFinished(false);
    setStartTime(Date.now());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-xs border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-bold text-stone-700">
          <span className="bg-rose-100 text-rose-900 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            <span>{t('question', language)} {currentIndex + 1} / {members.length}</span>
          </span>
          <span className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl">
            {t('score', language)}: {score}
          </span>
        </div>
      </div>

      {/* Main Recall Card */}
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center justify-center gap-2">
              <span>{t('familyRecallTitle', language)}</span>
              <span className="text-rose-500">❤️</span>
            </h2>
            <p className="text-sm text-stone-600 font-medium mt-1">
              {t('familyRecallSubtitle', language)}
            </p>
          </div>

          {/* Photo Display */}
          <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 ring-4 ring-amber-100">
            <img
              src={currentMember.photoUrl}
              alt="Family Portrait"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Memory Hint Prompt */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-stone-800 text-sm font-semibold max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="text-left">
              <p className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t('rememberPrompt', language)}</span>
              </p>
              <p className="italic font-medium">"{currentMember.memoryHint}"</p>
            </div>
            <button
              onClick={() => speak(currentMember.memoryHint, language)}
              className="p-2.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title={t('voice.readAloud', language)}
              aria-label={t('voice.readAloud', language)}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Identification Options */}
          <div className="space-y-3 pt-2 max-w-lg mx-auto">
            <p className="text-xs font-black text-stone-600 uppercase tracking-wider text-left">
              {t('whoIsThis', language)}
            </p>
            <div className="space-y-2.5">
              {options.map((m) => {
                const isChosen = selectedId === m.id;
                let btnClass = 'bg-stone-50 hover:bg-amber-50 border-stone-200 text-stone-800';

                if (selectedId) {
                  if (m.id === currentMember.id) {
                    btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400';
                  } else if (isChosen) {
                    btnClass = 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400';
                  }
                }

                return (
                  <button
                    key={m.id}
                    disabled={selectedId !== null}
                    onClick={() => handleSelectOption(m)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all active:scale-98 ${btnClass}`}
                  >
                    <div className="text-left">
                      <span className="text-base sm:text-lg font-black block">
                        {m.name}
                      </span>
                      <span className="text-xs text-stone-500 font-semibold">
                        {m.relation} • {m.hometown}
                      </span>
                    </div>

                    {selectedId && m.id === currentMember.id && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    )}
                    {selectedId && isChosen && m.id !== currentMember.id && (
                      <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
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
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-800 mx-auto flex items-center justify-center text-3xl">
            <Heart className="w-8 h-8 fill-rose-600 text-rose-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('familyRecallWonTitle', language)}
          </h3>
          <p className="text-stone-600 text-sm">
            {t('familyRecallWonSubtitle', language)}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer"
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

export default FamilyRecall;

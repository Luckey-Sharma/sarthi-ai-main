import React, { useState, useMemo } from 'react';
import { Language, FamilyMember } from '../../types';
import { playSound, speak, stopSpeaking } from '../../services/voiceService';
import { storage } from '../../services/storage';
import { demoFamilyMembers } from '../../services/mockData';
import { t } from '../../services/i18n';
import { Heart, Sparkles, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { CommonGameHeader } from './CommonGameHeader';
import { SessionEndingModal } from './SessionEndingModal';

interface FamilyRecallProps {
  language: Language;
  familyMembers: FamilyMember[];
  onBack: () => void;
  onFinishSession?: () => void;
}

export const FamilyRecall: React.FC<FamilyRecallProps> = ({
  language,
  familyMembers,
  onBack,
  onFinishSession,
}) => {
  const rawMembers = familyMembers.length >= 2 ? familyMembers : storage.loadFamilyMembers();
  const members = rawMembers.length >= 2 ? rawMembers : demoFamilyMembers;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showEndingModal, setShowEndingModal] = useState<boolean>(false);
  const [gentleHintShown, setGentleHintShown] = useState<boolean>(false);

  const currentMember = members[currentIndex % members.length] || members[0];

  // Pick 2 gentle choices: correct person + 1 loving family option
  const options = useMemo(() => {
    if (!currentMember) return [];
    const others = members.filter((m) => m.id !== currentMember.id);
    const other = others.length > 0 ? others[currentIndex % others.length] : currentMember;
    return [currentMember, other].sort(() => (currentIndex % 2 === 0 ? 1 : -1));
  }, [currentIndex, currentMember?.id, members]);

  const handleSelectOption = (chosen: FamilyMember) => {
    setSelectedId(chosen.id);

    if (chosen.id === currentMember.id) {
      playSound('success');
      setGentleHintShown(false);
    } else {
      // Soft gentle guidance without buzzer or red failure
      playSound('soft_chime');
      setGentleHintShown(true);
    }
  };

  const handleNext = () => {
    stopSpeaking();
    setSelectedId(null);
    setGentleHintShown(false);
    if (currentIndex + 1 < members.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playSound('celebration');
      setIsFinished(true);
    }
  };

  const handleFinish = () => {
    stopSpeaking();
    playSound('celebration');
    setIsFinished(true);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedId(null);
    setGentleHintShown(false);
    setIsFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-sans">
      <CommonGameHeader
        language={language}
        title={t('familyRecallTitle', language)}
        subtitle={
          language === 'as'
            ? 'মৰমৰ পৰিয়ালৰ ফটো আৰু মধুৰ স্মৃতিৰ সৈতে শান্ত সময়'
            : language === 'bn'
            ? 'প্রিয় পরিবারের ছবি ও মিষ্টি স্মৃতির সাথে শান্ত সময়'
            : language === 'hi'
            ? 'प्यारे परिजनों की तस्वीरें और मधुर यादों के साथ आत्मीय पल'
            : 'Cherished memories and warm photos of your loving family.'
        }
        readAloudText={`${t('familyRecallTitle', language)}. ${currentMember.name}, ${currentMember.relation}. ${currentMember.memoryHint}`}
        onBack={onBack}
        onFinishForToday={() => setShowEndingModal(true)}
      />

      <SessionEndingModal
        isOpen={showEndingModal}
        language={language}
        onRest={() => {
          setShowEndingModal(false);
          if (onFinishSession) {
            onFinishSession();
          } else {
            handleFinish();
          }
        }}
        onContinue={() => setShowEndingModal(false)}
      />

      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#becabf]/60 space-y-6 text-center">
          {/* Top Label */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ffdbd1]/50 text-[#631d08] border border-[#ffdbd1]">
              <Heart className="w-3.5 h-3.5 fill-[#631d08] text-[#631d08]" />
              <span>
                {language === 'as'
                  ? 'পৰিয়ালৰ মধুৰ স্মৃতি'
                  : language === 'bn'
                  ? 'পারিবারিক মধুর স্মৃতি'
                  : language === 'hi'
                  ? 'पारिवारिक मधुर यादें'
                  : 'Family Memories'}
              </span>
            </span>

            <button
              onClick={handleFinish}
              className="text-xs font-bold text-[#456c44] hover:underline cursor-pointer"
            >
              {t('finishForToday', language)}
            </button>
          </div>

          {/* Portrait Display in Warm Heritage Frame */}
          <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60 rounded-3xl overflow-hidden shadow-lg border-4 border-amber-200 ring-4 ring-amber-100/60 bg-stone-100">
            <img
              src={currentMember.photoUrl}
              alt={currentMember.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Memory Hint Prompt */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-[#032517] text-left max-w-lg mx-auto flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {language === 'as'
                    ? 'আপোনাৰ মনত পৰে নে?'
                    : language === 'bn'
                    ? 'আপনার কি মনে পড়ে?'
                    : language === 'hi'
                    ? 'क्या आपको याद है?'
                    : 'A Cherished Clue'}
                </span>
              </p>
              <p className="text-sm sm:text-base font-serif italic text-stone-800 leading-relaxed">
                "{currentMember.memoryHint}"
              </p>
            </div>

            <button
              onClick={() => speak(currentMember.memoryHint, language)}
              className="p-2.5 rounded-xl bg-amber-200/70 hover:bg-amber-300 text-amber-950 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title={t('voice.readAloud', language)}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Gentle Hint Notice when needed (zero red / zero failure) */}
          {gentleHintShown && selectedId !== currentMember.id && (
            <div className="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs sm:text-sm font-medium flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span>🌸</span>
                <span>
                  {language === 'as'
                    ? 'মনত পেলাওক — এওঁ সদায় আপোনাক মৰমেৰে মাত দিয়ে।'
                    : language === 'bn'
                    ? 'মনে করুন — ইনি সবসময় আপনাকে ভালোবেসে ডাকেন।'
                    : language === 'hi'
                    ? 'याद करें — ये हमेशा आपको स्नेह व आदर से पुकारते हैं।'
                    : 'Notice the kind smile — someone very dear to you.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  const hintText =
                    language === 'as'
                      ? 'মনত পেলাওক — এওঁ সদায় আপোনাক মৰমেৰে মাত দিয়ে।'
                      : language === 'bn'
                      ? 'মনে করুন — ইনি সবসময় আপনাকে ভালোবেসে ডাকেন।'
                      : language === 'hi'
                      ? 'याद करें — ये हमेशा आपको स्नेह व आदर से पुकारते हैं।'
                      : 'Notice the kind smile — someone very dear to you.';
                  speak(hintText, language);
                }}
                className="p-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors cursor-pointer shrink-0"
                title={t('voice.readAloud', language)}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2 Tactile Identification Buttons */}
          <div className="space-y-3 pt-2 max-w-lg mx-auto">
            <div className="grid grid-cols-1 gap-3">
              {options.map((m) => {
                const isChosen = selectedId === m.id;
                const isCorrect = m.id === currentMember.id;

                let btnStyles = 'bg-stone-50 hover:bg-amber-50/60 border-stone-200 text-stone-900';

                if (selectedId) {
                  if (isCorrect) {
                    btnStyles = 'bg-[#bfebba]/40 border-[#416740] text-[#032517] ring-2 ring-[#416740]/40';
                  } else if (isChosen) {
                    // Soft amber highlight, NOT red
                    btnStyles = 'bg-amber-100/60 border-amber-400 text-amber-950';
                  }
                }

                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectOption(m)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all active:scale-98 text-left ${btnStyles}`}
                  >
                    <div>
                      <span className="text-lg sm:text-xl font-serif font-bold block text-[#032517]">
                        {m.name}
                      </span>
                      <span className="text-xs sm:text-sm text-[#456c44] font-semibold mt-0.5 block">
                        {m.relation} {m.hometown ? `• ${m.hometown}` : ''}
                      </span>
                    </div>

                    {selectedId && isCorrect && (
                      <span className="text-2xl text-[#416740] shrink-0">🌸</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Affirmation Banner with Manual Read Aloud */}
          {selectedId === currentMember.id && (
            <div className="p-3.5 rounded-2xl bg-[#bfebba]/40 border border-[#416740]/40 text-[#032517] text-xs sm:text-sm font-medium flex items-center justify-between gap-2 animate-in fade-in max-w-lg mx-auto">
              <div className="flex items-center gap-2">
                <span>🌸</span>
                <span className="font-semibold">
                  {language === 'as'
                    ? `হয়! এয়া আপোনাৰ ${currentMember.relation}, ${currentMember.name}।`
                    : language === 'bn'
                    ? `হ্যাঁ! ইনি আপনার ${currentMember.relation}, ${currentMember.name}।`
                    : language === 'hi'
                    ? `जी हां! ये आपके ${currentMember.relation}, ${currentMember.name} हैं।`
                    : `Yes, this is your loving ${currentMember.relation}, ${currentMember.name}!`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  const affirm =
                    language === 'as'
                      ? `হয়! এয়া আপোনাৰ ${currentMember.relation}, ${currentMember.name}।`
                      : language === 'bn'
                      ? `হ্যাঁ! ইনি আপনার ${currentMember.relation}, ${currentMember.name}।`
                      : language === 'hi'
                      ? `जी हां! ये आपके ${currentMember.relation}, ${currentMember.name} हैं।`
                      : `Yes, this is your loving ${currentMember.relation}, ${currentMember.name}!`;
                  speak(affirm, language);
                }}
                className="p-1.5 rounded-lg bg-[#bfebba] hover:bg-[#a8e0a2] text-[#032517] transition-colors cursor-pointer shrink-0"
                title={t('voice.readAloud', language)}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Next Button */}
          {selectedId && (
            <div className="pt-2 animate-in fade-in">
              <button
                onClick={handleNext}
                className="w-full max-w-lg mx-auto py-3.5 px-6 rounded-2xl bg-[#032517] hover:bg-[#416740] text-white font-serif font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <span>
                  {language === 'as'
                    ? 'পৰৱৰ্তী স্মৃতি চাওক'
                    : language === 'bn'
                    ? 'পরবর্তী স্মৃতি দেখুন'
                    : language === 'hi'
                    ? 'अगली स्मृति देखें'
                    : 'Next Cherished Memory'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Dementia-Friendly Session Complete Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#becabf]/60 shadow-md text-center space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center text-4xl shadow-inner">
            ❤️
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
              {t('sessionCompleteMessage', language)}
            </h3>
            <p className="text-sm sm:text-base text-[#3e4941] leading-relaxed">
              {language === 'as'
                ? 'মৰমৰ পৰিয়ালৰ স্মৃতিবোৰে মনত আনন্দ আৰু শান্তি আনে।'
                : language === 'bn'
                ? 'পরিবারের সুন্দর স্মৃতি মনে এনে দেয় অপার শান্তি ও তৃপ্তি।'
                : language === 'hi'
                ? 'अपनों की मीठी यादें दिल को असीम सुकून और खुशी देती हैं।'
                : 'Spending time recalling loving family members brings warmth to the heart.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] font-bold rounded-2xl text-sm border border-[#becabf]/60 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {language === 'as'
                  ? 'আকৌ এলবাম চাওক'
                  : language === 'bn'
                  ? 'আবার অ্যালবাম দেখুন'
                  : language === 'hi'
                  ? 'फिर से एल्बम देखें'
                  : 'View Album Again'}
              </span>
            </button>

            <button
              onClick={() => {
                if (onFinishSession) {
                  onFinishSession();
                } else {
                  onBack();
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#032517] hover:bg-[#416740] text-white font-bold rounded-2xl text-sm transition-all cursor-pointer shadow-md"
            >
              <span>{t('home', language)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyRecall;

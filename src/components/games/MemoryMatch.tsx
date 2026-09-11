import React, { useState, useEffect } from 'react';
import { Language, FamilyMember } from '../../types';
import { culturalCards } from '../../services/mockData';
import { storage } from '../../services/storage';
import { playSound } from '../../services/voiceService';
import { CommonGameHeader } from './CommonGameHeader';
import { SessionEndingModal } from './SessionEndingModal';
import { t } from '../../services/i18n';
import { Heart, Sparkles, ArrowRight, RotateCcw, Home } from 'lucide-react';

interface MemoryMatchProps {
  language: Language;
  familyMembers: FamilyMember[];
  onBack: () => void;
  onFinishSession?: () => void;
}

interface PhotoMatchItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  culturalFact: string;
}

export const MemoryMatch: React.FC<MemoryMatchProps> = ({
  language,
  familyMembers,
  onBack,
  onFinishSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [softHintId, setSoftHintId] = useState<string | null>(null);
  const [isSessionEnded, setIsSessionEnded] = useState<boolean>(false);
  const [isTimeCapModalOpen, setIsTimeCapModalOpen] = useState<boolean>(false);
  const [sessionStartTime] = useState<number>(Date.now());

  // 12-15 min soft session cap
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeCapModalOpen(true);
    }, 12 * 60 * 1000); // 12 minutes
    return () => clearTimeout(timer);
  }, []);

  // Items mapped from rich cultural cards
  const items: PhotoMatchItem[] = culturalCards.map((c) => ({
    id: c.id,
    title: c.title[language] || c.title.en,
    description: c.description[language] || c.description.en,
    imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    culturalFact: c.culturalFact,
  }));

  const currentItem = items[currentIndex % items.length] || items[0];

  // Provide 2 choices (current item + 1 other for gentle recognition)
  const choices = React.useMemo(() => {
    const others = items.filter((item) => item.id !== currentItem.id);
    const randomOther = others[Math.floor(Math.random() * others.length)] || others[0];
    return [currentItem, randomOther].sort(() => Math.random() - 0.5);
  }, [currentIndex, currentItem.id]);

  const handleSelectChoice = (choiceId: string) => {
    setSelectedOptionId(choiceId);

    if (choiceId === currentItem.id) {
      // Gentle match!
      playSound('success');
      setRevealed(true);
    } else {
      // Gentle guidance without penalty or red color
      playSound('click');
      setSoftHintId(currentItem.id);
      // Reveal answer with warm encouragement after a gentle pause
      setTimeout(() => {
        setRevealed(true);
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= items.length) {
      setIsSessionEnded(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
      setSelectedOptionId(null);
      setSoftHintId(null);
    }
  };

  const readAloudText = `${currentItem.title}. ${currentItem.description}`;

  const handleFinishEarly = () => {
    if (onFinishSession) {
      onFinishSession();
    } else {
      setIsSessionEnded(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 font-sans">
      {/* Unified Calm Header */}
      <CommonGameHeader
        language={language}
        title={t('memoryMatchTitle', language)}
        subtitle={language === 'as' ? 'পৰম্পৰাগত সাংস্কৃতিক সঁজুলিৰ চিনাকি' : language === 'bn' ? 'ঐতিহ্যবাহী পরিচিত স্মারক ও সংস্কৃতির আনন্দ' : language === 'hi' ? 'सांस्कृतिक धरोहर व आत्मीय यादें' : 'Recognizing Familiar Heritage Treasures'}
        readAloudText={readAloudText}
        onBack={onBack}
        onFinishEarly={handleFinishEarly}
      />

      {/* Main Single-Task Dementia-Friendly Reminiscence Screen */}
      {!isSessionEnded ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#becabf]/60 space-y-6 transition-all">
          {/* Gentle Instruction: Single clear instruction */}
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] leading-relaxed">
              {language === 'as'
                ? 'এইখন চিনাকি ফটো চাওক। ইয়াৰ নাম কি?'
                : language === 'bn'
                ? 'এই পরিচিত ছবিটি দেখুন। এটি কী নামে পরিচিত?'
                : language === 'hi'
                ? 'इस जानी-पहचानी तस्वीर को देखें। इसका क्या नाम है?'
                : language === 'mni'
                ? 'Photo ashi yengbiyu. Ashigi ming kari koubage?'
                : 'Which familiar heritage treasure is shown in this photo?'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3e4941] font-medium">
              {language === 'as'
                ? 'তলৰ বিকল্পটোত আলফুলে চুই বাছনি কৰক।'
                : language === 'bn'
                ? 'নিচের বিকল্পটিতে আলতোভাবে স্পর্শ করুন।'
                : language === 'hi'
                ? 'नीचे दिए गए विकल्प को सहजता से स्पर्श करें।'
                : 'Tap gently on the label that looks familiar.'}
            </p>
          </div>

          {/* Large High-Contrast Reminiscence Photo */}
          <div className="relative mx-auto max-w-md h-64 sm:h-72 rounded-3xl overflow-hidden shadow-lg border-3 border-[#becabf]/60 bg-[#f7faf5]">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />
          </div>

          {/* Simple Choices (Zero Pressure, No Red Borders, Soft Guidance) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {choices.map((choice) => {
              const isChosen = selectedOptionId === choice.id;
              const isTarget = choice.id === currentItem.id;
              const isHinted = softHintId === choice.id;

              let btnStyle = 'bg-[#f7faf5] hover:bg-[#ecefea] text-[#032517] border-[#becabf]/70';

              if (revealed && isTarget) {
                // Soft green warm highlight for the match
                btnStyle = 'bg-[#bfebba]/50 border-[#416740] text-[#032517] ring-2 ring-[#416740]/30 shadow-sm';
              } else if (isHinted) {
                // Gentle soft amber guidance highlight (never red!)
                btnStyle = 'bg-amber-50 border-amber-300 text-[#032517] shadow-sm';
              }

              return (
                <button
                  key={choice.id}
                  disabled={revealed}
                  onClick={() => handleSelectChoice(choice.id)}
                  className={`p-5 rounded-2xl border-2 text-base sm:text-lg font-serif font-bold text-center transition-all cursor-pointer min-h-[72px] flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  <span>{choice.title}</span>
                  {revealed && isTarget && (
                    <span className="text-[#416740] font-black text-sm">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Revealed Warm Cultural Memory Story & Next Button */}
          {revealed && (
            <div className="pt-3 space-y-4 animate-in fade-in duration-500">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#bfebba]/25 border border-[#416740]/30 text-xs sm:text-sm text-[#032517] leading-relaxed">
                <div className="font-bold text-[#032517] mb-1">
                  🌿 {currentItem.title}
                </div>
                <p className="text-[#3e4941]">
                  {currentItem.description}
                </p>
                {currentItem.culturalFact && (
                  <p className="text-[#6f7a70] text-xs italic mt-2">
                    💡 {currentItem.culturalFact}
                  </p>
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-base shadow-md transition-transform active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{t('exploreAnotherPhoto', language)}</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Neutral, Positive Finish Screen (Requirement 1 & 3: NO SCORES, WARM AFFIRMATION) */
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-md border-2 border-[#becabf]/60 text-center space-y-5 animate-in fade-in duration-500 font-sans">
          <div className="w-16 h-16 rounded-full bg-[#bfebba]/50 text-[#032517] mx-auto flex items-center justify-center text-3xl shadow-xs">
            🌿
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
              {t('sessionCompleteMessage', language)}
            </h2>
            <p className="text-sm text-[#3e4941] font-medium max-w-md mx-auto leading-relaxed">
              {language === 'as'
                ? 'আজিৰ সকলো সাংস্কৃতিক ফটো সুন্দৰভাৱে উপভোগ কৰা হ’ল। মন শান্ত আৰু প্ৰশান্তিময় হৈ থাকক।'
                : language === 'bn'
                ? 'আজকের সকল স্মৃতিময় ছবি আমরা একসাথে উপভোগ করলাম। মন শান্ত ও স্নিগ্ধ থাকুক।'
                : language === 'hi'
                ? 'आज की सभी सांस्कृतिक तस्वीरें हमने साथ मिलकर देखीं। मन शांत और प्रसन्न रहे।'
                : 'All heritage treasures were explored in a peaceful, joyful atmosphere.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              onClick={() => {
                if (onFinishSession) {
                  onFinishSession();
                } else {
                  onBack();
                }
              }}
              className="py-3.5 px-6 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-sm shadow-md transition-transform active:scale-[0.98] cursor-pointer"
            >
              {language === 'as' ? 'সত্ৰৰ সাৰাংশ চাওক' : language === 'bn' ? 'সেশনের সারাংশ দেখুন' : language === 'hi' ? 'सत्र सारांश देखें' : 'View Session Summary'}
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setRevealed(false);
                setSelectedOptionId(null);
                setSoftHintId(null);
                setIsSessionEnded(false);
              }}
              className="py-3.5 px-6 bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] font-extrabold rounded-2xl text-sm border border-[#becabf]/60 cursor-pointer"
            >
              {t('exploreAnotherPhoto', language)}
            </button>
          </div>
        </div>
      )}

      {/* 10-15 Min Gentle Session Ending Cap */}
      <SessionEndingModal
        isOpen={isTimeCapModalOpen}
        language={language}
        onFinish={() => {
          setIsTimeCapModalOpen(false);
          handleFinishEarly();
        }}
        onContinue={() => setIsTimeCapModalOpen(false)}
      />
    </div>
  );
};

export default MemoryMatch;

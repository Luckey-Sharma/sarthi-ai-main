import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { folkSongs } from '../../services/mockData';
import { playFolkTune, stopFolkTune, playSound } from '../../services/voiceService';
import { CommonGameHeader } from './CommonGameHeader';
import { SessionEndingModal } from './SessionEndingModal';
import { t } from '../../services/i18n';
import { Music, Volume2, Sparkles, ArrowRight, RotateCcw, Heart } from 'lucide-react';

interface SoundsOfHillsProps {
  language: Language;
  onBack: () => void;
  onFinishSession?: () => void;
}

export const SoundsOfHills: React.FC<SoundsOfHillsProps> = ({
  language,
  onBack,
  onFinishSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlayingTune, setIsPlayingTune] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isSessionEnded, setIsSessionEnded] = useState<boolean>(false);
  const [isTimeCapModalOpen, setIsTimeCapModalOpen] = useState<boolean>(false);

  // 12-15 min gentle session cap
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeCapModalOpen(true);
    }, 12 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup tune on unmount
  useEffect(() => {
    return () => {
      stopFolkTune();
    };
  }, []);

  const currentSong = folkSongs[currentIndex % folkSongs.length] || folkSongs[0];

  const handlePlayTune = () => {
    setIsPlayingTune(true);
    playFolkTune(currentSong.tuneId, () => {
      setIsPlayingTune(false);
    });
  };

  const handleReveal = () => {
    playSound('success');
    setIsRevealed(true);
  };

  const handleNext = () => {
    stopFolkTune();
    setIsPlayingTune(false);
    if (currentIndex + 1 >= folkSongs.length) {
      setIsSessionEnded(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    }
  };

  const handleFinishEarly = () => {
    stopFolkTune();
    if (onFinishSession) {
      onFinishSession();
    } else {
      setIsSessionEnded(true);
    }
  };

  const readAloudText = `${currentSong.title[language] || currentSong.title.en}. ${currentSong.description[language] || currentSong.description.en}. ${currentSong.culturalMemory[language] || currentSong.culturalMemory.en}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 font-sans">
      {/* Unified Calm Header */}
      <CommonGameHeader
        language={language}
        title={t('soundsHillsTitle', language)}
        subtitle={language === 'as' ? 'আঞ্চলিক লোকগীতৰ সুৰ আৰু স্মৃতি' : language === 'bn' ? 'আঞ্চলিক লোকসঙ্গীতের মধুর সুর ও স্মৃতি' : language === 'hi' ? 'पूर्वोत्तर के पारंपरिक लोकगीत व धुन' : 'Regional Folk Melodies & Memories'}
        readAloudText={readAloudText}
        onBack={() => {
          stopFolkTune();
          onBack();
        }}
        onFinishEarly={handleFinishEarly}
      />

      {/* Main "Name That Tune" Screen */}
      {!isSessionEnded ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#becabf]/60 space-y-6">
          {/* Gentle Instruction */}
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] leading-relaxed">
              {language === 'as'
                ? 'সুৰটি শুনক আৰু গীতৰ আঁৰৰ স্মৃতি খোলক'
                : language === 'bn'
                ? 'সুরটি শুনুন এবং গানটির পেছনের গল্পটি জানুন'
                : language === 'hi'
                ? 'इस धुन को सुनें और इसके पीछे की सुंदर कहानी जानें'
                : language === 'mni'
                ? 'Khonjel asi taduna eshei asi kari koubano yenbiyu'
                : 'Listen to this gentle melody and discover its beloved story'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3e4941] font-medium">
              {language === 'as'
                ? 'তলৰ বুটামটোত চুই সুৰটি শুনক। কোনো সময়সীমা নাই।'
                : language === 'bn'
                ? 'নিচের বোতামটিতে স্পর্শ করে সুর শুনুন। কোনো তাড়াহুড়ো নেই।'
                : language === 'hi'
                ? 'नीचे दिए गए बटन को छूकर धुन सुनें। समय की कोई सीमा नहीं है।'
                : 'Tap below to listen at your own relaxed pace.'}
            </p>
          </div>

          {/* Big Tactile "Listen to Melody" Button */}
          <div className="text-center py-2">
            <button
              onClick={handlePlayTune}
              className={`w-full sm:w-auto px-8 py-5 rounded-3xl font-serif font-bold text-lg sm:text-xl shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-3 border-2 ${
                isPlayingTune
                  ? 'bg-[#bfebba] text-[#032517] border-[#416740] ring-4 ring-[#416740]/20'
                  : 'bg-[#032517] hover:bg-[#1b3b2b] text-white border-[#032517]'
              }`}
            >
              <Music className={`w-6 h-6 ${isPlayingTune ? 'animate-pulse text-[#416740]' : 'text-white'}`} />
              <span>{isPlayingTune ? (language === 'as' ? 'সুৰ বাজি আছে... 🎵' : language === 'bn' ? 'সুর বাজছে... 🎵' : language === 'hi' ? 'धुन बज रही है... 🎵' : 'Playing Melody... 🎵') : t('listenTune', language)}</span>
            </button>
          </div>

          {/* Reveal Song Button (Zero Wrong-Answer State, pure delight) */}
          {!isRevealed ? (
            <div className="text-center pt-2">
              <button
                onClick={handleReveal}
                className="w-full sm:w-auto px-7 py-4 bg-[#f7faf5] hover:bg-[#ecefea] text-[#032517] font-extrabold rounded-2xl text-base border-2 border-[#becabf]/70 cursor-pointer shadow-xs transition-transform active:scale-[0.98] inline-flex items-center justify-center gap-2"
              >
                <span>{t('revealSong', language)}</span>
              </button>
            </div>
          ) : (
            /* Revealed Song Card & Reminiscence Story */
            <div className="space-y-5 animate-in fade-in duration-600">
              {/* Regional Cultural Image */}
              <div className="relative mx-auto max-w-md h-56 sm:h-64 rounded-3xl overflow-hidden shadow-lg border-3 border-[#becabf]/60 bg-[#f7faf5]">
                <img
                  src={currentSong.imageUrl}
                  alt={currentSong.title[language] || currentSong.title.en}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#032517] text-xs font-bold px-3 py-1 rounded-full border border-[#becabf]/60">
                  📍 {currentSong.region[language] || currentSong.region.en}
                </div>
              </div>

              {/* Story & Cultural Memory */}
              <div className="p-5 rounded-3xl bg-[#bfebba]/25 border-2 border-[#416740]/30 space-y-2">
                <div className="text-lg sm:text-xl font-serif font-bold text-[#032517]">
                  🌸 {currentSong.title[language] || currentSong.title.en}
                </div>
                <p className="text-xs sm:text-sm text-[#3e4941] font-medium leading-relaxed">
                  {currentSong.description[language] || currentSong.description.en}
                </p>
                <div className="pt-2 border-t border-[#416740]/20 flex items-start gap-2 text-xs sm:text-sm text-[#032517]">
                  <Heart className="w-4 h-4 text-[#416740] shrink-0 mt-0.5" />
                  <p className="italic">
                    "{currentSong.culturalMemory[language] || currentSong.culturalMemory.en}"
                  </p>
                </div>
              </div>

              {/* Next Song Button */}
              <div className="text-center pt-2">
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-base shadow-md transition-transform active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{t('exploreAnotherSong', language)}</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Neutral, Positive Finish Screen (NO SCORES) */
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-md border-2 border-[#becabf]/60 text-center space-y-5 animate-in fade-in duration-500 font-sans">
          <div className="w-16 h-16 rounded-full bg-[#bfebba]/50 text-[#032517] mx-auto flex items-center justify-center text-3xl shadow-xs">
            🎶
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
              {t('sessionCompleteMessage', language)}
            </h2>
            <p className="text-sm text-[#3e4941] font-medium max-w-md mx-auto leading-relaxed">
              {language === 'as'
                ? 'আজিৰ সকলো লোকগীত আৰু সুৰৰ সোণালী স্মৃতি শুনা হ’ল। মন শান্ত হৈ থাকক।'
                : language === 'bn'
                ? 'আজকের সকল লোকসঙ্গীতের মধুর স্মৃতি আমরা একসাথে শুনলাম। মন শান্ত থাকুক।'
                : language === 'hi'
                ? 'आज के सभी लोकगीत और उनकी यादें हमने साथ मिलकर सुनीं। मन शांत व प्रसन्न रहे।'
                : 'All folk melodies and cherished memories were enjoyed peacefully together.'}
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
                setIsRevealed(false);
                setIsSessionEnded(false);
              }}
              className="py-3.5 px-6 bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] font-extrabold rounded-2xl text-sm border border-[#becabf]/60 cursor-pointer"
            >
              {t('exploreAnotherSong', language)}
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

export default SoundsOfHills;

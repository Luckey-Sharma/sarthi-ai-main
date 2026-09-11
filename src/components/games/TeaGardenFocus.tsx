import React, { useState } from 'react';
import { Language, GameId } from '../../types';
import { playSound, speak, stopSpeaking } from '../../services/voiceService';
import { Sparkles, Heart, RotateCcw, Volume2 } from 'lucide-react';
import { t } from '../../services/i18n';
import { CommonGameHeader } from './CommonGameHeader';
import { SessionEndingModal } from './SessionEndingModal';

interface TeaGardenFocusProps {
  language: Language;
  onBack: () => void;
  onFinishSession?: () => void;
}

interface BushSlot {
  id: number;
  hasBud: boolean;
  name: Record<Language, string>;
  plucked: boolean;
}

const INITIAL_BUSHES: BushSlot[] = [
  {
    id: 0,
    hasBud: true,
    name: {
      en: 'Upper Assam Garden',
      as: 'উজনি অসমৰ বাগিচা',
      bn: 'উজান আসামের বাগান',
      hi: 'अपर असम चाय बगान',
      mni: 'Upper Assam Cha Bagan',
    },
    plucked: false,
  },
  {
    id: 1,
    hasBud: true,
    name: {
      en: 'Jorhat Heritage Estate',
      as: 'যোৰহাট ঐতিহ্য এষ্টেট',
      bn: 'যোরহাট ঐতিহ্য বাগান',
      hi: 'जोरहाट धरोहर एस्टेट',
      mni: 'Jorhat Bagan',
    },
    plucked: false,
  },
  {
    id: 2,
    hasBud: true,
    name: {
      en: 'Brahmaputra Valley Mist',
      as: 'ব্ৰহ্মপুত্ৰ উপত্যকাৰ কুঁৱলী',
      bn: 'ব্রহ্মপুত্র উপত্যকার কুয়াশা',
      hi: 'ब्रह्मपुत्र घाटी की धुंध',
      mni: 'Brahmaputra Valley',
    },
    plucked: false,
  },
  {
    id: 3,
    hasBud: true,
    name: {
      en: 'Darjeeling Slopes',
      as: 'দাৰ্জিলিঙৰ পাহাৰীয়া ঢাল',
      bn: 'দার্জিলিং পাহাড়ী ঢাল',
      hi: 'दार्जिलिंग की ढलानें',
      mni: 'Darjeeling Ching',
    },
    plucked: false,
  },
  {
    id: 4,
    hasBud: true,
    name: {
      en: 'Cachar Valley Greens',
      as: 'কাছাৰ উপত্যকাৰ সেউজীয়া',
      bn: 'কাছাড় উপত্যকার শ্যামলিমা',
      hi: 'कछार घाटी की हरियाली',
      mni: 'Cachar Valley Cha',
    },
    plucked: false,
  },
  {
    id: 5,
    hasBud: true,
    name: {
      en: 'Dibrugarh Sunshine Garden',
      as: 'ডিব্ৰুগড় ৰ’দালি বাগিচা',
      bn: 'ডিব্রুগড় রৌদ্রোজ্জ্বল বাগান',
      hi: 'डिब्रूगढ़ धूप बगान',
      mni: 'Dibrugarh Sunshine Bagan',
    },
    plucked: false,
  },
];

export const TeaGardenFocus: React.FC<TeaGardenFocusProps> = ({
  language,
  onBack,
  onFinishSession,
}) => {
  const [bushes, setBushes] = useState<BushSlot[]>(INITIAL_BUSHES);
  const [basketCount, setBasketCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showEndingModal, setShowEndingModal] = useState<boolean>(false);
  const [lastPluckedNotice, setLastPluckedNotice] = useState<string | null>(null);

  const teaStories: Record<Language, string[]> = {
    en: [
      'Two tender leaves and a golden bud — plucked gently with love.',
      'The morning mist rises over the Brahmaputra tea bushes.',
      'A warm cup of Assam CTC tea brings family together on chilly mornings.',
      'Fragrant leaves carried in the traditional bamboo Tukuri basket.',
      'The rhythmic tea plucking songs echoing across the green rolling hills.',
    ],
    as: [
      'দুটি পাত এটি কলি — মৰমেৰে সাবধানে চিঙা হৈছে।',
      'ব্ৰহ্মপুত্ৰৰ সেউজীয়া চাহ বাগিচাত ৰাতিপুৱাৰ সতেজ কুঁৱলী।',
      'একাপ গৰম ৰঙা চাহে পৰিয়ালৰ মাজত সুখ আৰু স্মৃতি জগাই তোলে।',
      'বাঁহৰ পৰম্পৰাগত টুকিৰী পাচিত ভৰি পৰিছে সুগন্ধি চাহ পাত।',
      'সেউজীয়া চাহ বাগিচাৰ মাজত চাহ জনগোষ্ঠীৰ সুমধুৰ গীতৰ সুৰ।',
    ],
    bn: [
      'দুটি পাতা একটি কুঁড়ি — অতি শান্ত মনে আলতো হাতে তোলা।',
      'সকালের মিষ্টি রোদে চা বাগানের স্নিগ্ধ সবুজ পাতা চকচক করছে।',
      'এক কাপ গরম আসাম চা পরিবারের আড্ডা ও স্মৃতিকে সতেজ করে তোলে।',
      'ঐতিহ্যবাহী বাঁশের ঝুড়িতে সাজানো তাজা সুগন্ধি চা পাতা।',
      'সবুজ পাহাড়ের ঢালে শান্ত মধুর চা বাগানের সুর ও স্নিগ্ধতা।',
    ],
    hi: [
      'दो पत्तियां और एक कोमल कली — शांत मन और स्नेह से चुनी गई।',
      'सुबह की ओस में भीगी चाय की हरी-भरी पत्तियां ताजगी बिखेरती हैं।',
      'एक कप कड़क असम चाय अपनों के साथ प्यारी यादें ताज़ा कर देती है।',
      'बांस की पारंपरिक टोकरी में ताज़ी सुगंधित चाय की पत्तियां।',
      'चाय बागानों की हरी वादियों में गूंजती मधुर व शांत लोकधुनें।',
    ],
    mni: [
      'Mana aniga koli amaga — pukning nungshina loukhat-u.',
      'Ayangba cha managa basket thallaba.',
      'Cha thakpada imunggi ningsingba lak-i.',
      'Bamboo basket ta cha mana ningthina hapchinba.',
      'Chinggi cha bagan da khonjel nungaina taba.',
    ],
  };

  const handlePluck = (index: number) => {
    playSound('leaf_pluck');
    setBushes((prev) =>
      prev.map((bush, idx) =>
        idx === index ? { ...bush, plucked: true } : bush
      )
    );
    setBasketCount((prev) => prev + 1);

    const stories = teaStories[language] || teaStories.en;
    const randomStory = stories[Math.floor(Math.random() * stories.length)];
    setLastPluckedNotice(randomStory);

    // Auto-refresh bushes gently if all plucked
    setTimeout(() => {
      setBushes((curr) => {
        const remaining = curr.filter((b) => !b.plucked);
        if (remaining.length <= 1) {
          return INITIAL_BUSHES.map((b) => ({ ...b, plucked: false }));
        }
        return curr;
      });
    }, 1200);
  };

  const handleFinish = () => {
    stopSpeaking();
    playSound('celebration');
    setIsFinished(true);
  };

  const handleReset = () => {
    setBushes(INITIAL_BUSHES);
    setBasketCount(0);
    setIsFinished(false);
    setLastPluckedNotice(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans">
      <CommonGameHeader
        language={language}
        title={t('teaGardenTitle', language)}
        subtitle={
          language === 'as'
            ? 'সেউজীয়া বাগিচাত ফুৰক আৰু সতেজ পাত সংগ্ৰহ কৰক — কোনো সময়ৰ তাৰণা নাই'
            : language === 'bn'
            ? 'সবুজ বাগানে শান্ত হাঁটা ও তাজা পাতা সংগ্রহ — কোনো সময়ের চাপ নেই'
            : language === 'hi'
            ? 'चाय बागान में शांत सैर व कोमल पत्तियों का स्पर्श — बिना किसी जल्दबाजी के'
            : 'A peaceful walk in the lush tea estate. Tap fresh buds at your own calm pace.'
        }
        readAloudText={`${t('teaGardenTitle', language)}. ${
          teaStories[language]?.[0] || teaStories.en[0]
        }`}
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
        <div className="space-y-6">
          {/* Basket Status Strip (zero scores, purely gentle counter) */}
          <div className="bg-white p-5 rounded-3xl border border-[#becabf]/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-inner">
                🧺
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#032517]">
                  {language === 'as'
                    ? 'বাঁহৰ টুকিৰী পাচি'
                    : language === 'bn'
                    ? 'বাঁশের সুন্দর ঝুড়ি'
                    : language === 'hi'
                    ? 'बांस की पारंपरिक टोकरी'
                    : 'Woven Bamboo Tukuri Basket'}
                </h3>
                <p className="text-xs sm:text-sm text-[#456c44] font-medium">
                  {basketCount === 0
                    ? language === 'as'
                      ? 'কোমল পাত সংগ্ৰহ কৰিবলৈ যিকোনো জোপোহাত স্পৰ্শ কৰক'
                      : language === 'bn'
                      ? 'কোমল পাতা সংগ্রহ করতে যেকোনো চা গাছে স্পর্শ করুন'
                      : language === 'hi'
                      ? 'कोमल पत्तियां संजोने के लिए किसी भी पौधे को छुएं'
                      : 'Tap any fresh tea bush below to gather tender leaves'
                    : `${basketCount} ${
                        language === 'as'
                          ? 'মুঠি সতেজ পাত সংগ্ৰহ কৰা হ’ল'
                          : language === 'bn'
                          ? 'মুঠ তাজা পাতা সংগৃহীত'
                          : language === 'hi'
                          ? 'मुट्ठी ताज़ी पत्तियां संजोई गईं'
                          : 'tender sprigs gathered peacefully'
                      }`}
                </p>
              </div>
            </div>

            {/* Finish Activity Button */}
            <button
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-2xl bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] font-bold text-xs sm:text-sm border border-[#becabf]/60 transition-colors cursor-pointer"
            >
              {t('finishForToday', language)}
            </button>
          </div>

          {/* Serene Tea Garden Visual Ground */}
          <div className="bg-gradient-to-b from-[#133c24] via-[#0d2a19] to-[#081b10] p-6 sm:p-8 rounded-3xl border-3 border-[#416740]/40 shadow-lg text-white space-y-6 relative overflow-hidden">
            {/* Soft decorative morning mist */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#bfebba_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

            {/* Instruction banner */}
            <div className="relative z-10 flex items-center justify-between bg-emerald-950/60 p-4 rounded-2xl border border-emerald-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <span className="text-xs sm:text-sm text-emerald-100 font-medium">
                  {language === 'as'
                    ? 'দুটি পাত আৰু এটি কলি স্পৰ্শ কৰি পাচিত সাঁচক'
                    : language === 'bn'
                    ? 'দুটি পাতা ও একটি কুঁড়িতে আলতো হাত রাখুন'
                    : language === 'hi'
                    ? 'कोमल दो पत्तियां और एक कली पर प्यार से उंगली रखें'
                    : 'Gently tap the fresh golden sprouts to gather them into the basket'}
                </span>
              </div>
              <button
                onClick={() =>
                  speak(
                    teaStories[language]?.[0] || teaStories.en[0],
                    language
                  )
                }
                className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 transition-colors cursor-pointer shrink-0 border border-emerald-600/50"
                title={t('voice.readAloud', language)}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* 6 Serene Tea Bush Slots */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 py-2">
              {bushes.map((bush, index) => {
                return (
                  <button
                    key={bush.id}
                    onClick={() => handlePluck(index)}
                    className={`w-full min-h-[160px] sm:min-h-[185px] rounded-3xl p-4 relative overflow-hidden cursor-pointer transition-all duration-300 flex flex-col items-center justify-between border-2 text-center select-none active:scale-98 ${
                      bush.plucked
                        ? 'bg-[#10301d]/60 border-emerald-900/60 opacity-60'
                        : 'bg-gradient-to-b from-[#1b4e2f] to-[#123821] hover:from-[#215d39] hover:to-[#174629] border-[#6ee7b7]/40 hover:border-amber-300 shadow-md ring-2 ring-emerald-500/20'
                    }`}
                  >
                    {/* Top Estate Tag */}
                    <span className="text-[10px] sm:text-xs font-semibold text-emerald-200/80 tracking-wide px-2 py-0.5 rounded-full bg-black/20">
                      {bush.name[language] || bush.name.en}
                    </span>

                    {/* Lush Leaf Icon */}
                    <div className="my-2">
                      {bush.plucked ? (
                        <div className="text-4xl sm:text-5xl opacity-40">🍃</div>
                      ) : (
                        <div className="relative">
                          <div className="text-5xl sm:text-6xl filter drop-shadow-md">
                            🌱
                          </div>
                          <div className="absolute -top-1 -right-1 text-base animate-pulse">
                            ✨
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pluck Status Tag */}
                    <div
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                        bush.plucked
                          ? 'text-emerald-300/60 bg-emerald-950/40'
                          : 'text-stone-900 bg-amber-300 font-extrabold shadow-sm'
                      }`}
                    >
                      {bush.plucked
                        ? language === 'as'
                          ? 'সাঁচা হ’ল 🍃'
                          : language === 'bn'
                          ? 'তোলা হলো 🍃'
                          : language === 'hi'
                          ? 'सहेजी गई 🍃'
                          : 'Gathered 🍃'
                        : language === 'as'
                        ? 'কোমল পাত চিঙক'
                        : language === 'bn'
                        ? 'পাতা তুলুন'
                        : language === 'hi'
                        ? 'पत्ती चुनें'
                        : 'Pluck Bud'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Sensory Reminiscence Prompt */}
            {lastPluckedNotice && (
              <div className="relative z-10 p-4 rounded-2xl bg-amber-100/15 border border-amber-300/40 text-amber-100 text-xs sm:text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                  <p className="font-medium italic truncate sm:whitespace-normal">{lastPluckedNotice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    speak(lastPluckedNotice, language);
                  }}
                  className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 transition-colors cursor-pointer shrink-0 border border-emerald-600/50"
                  title={t('voice.readAloud', language)}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standard Dementia-Friendly Session Complete Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#becabf]/60 shadow-md text-center space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-4xl shadow-inner">
            🌿
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
              {t('sessionCompleteMessage', language)}
            </h3>
            <p className="text-sm sm:text-base text-[#3e4941] leading-relaxed">
              {language === 'as'
                ? 'সেউজীয়া বাগিচাত সুন্দৰ সময় পাৰ কৰা হ’ল। সুগন্ধি চাহ পাতেৰে টুকিৰী পাচি ভৰি পৰিল।'
                : language === 'bn'
                ? 'সবুজ বাগানে সুন্দর সময় কেটেছে। তাজা চা পাতায় সুন্দর ঝুড়ি ভরে উঠেছে।'
                : language === 'hi'
                ? 'चाय के बागानों में कितना सुंदर और शांत समय बीता। टोकरी ताज़ी पत्तियों से महक उठी।'
                : 'A lovely, peaceful walk in the green garden. Your basket is full of fragrant memories.'}
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
                  ? 'আকৌ বাগিচাত ফুৰক'
                  : language === 'bn'
                  ? 'আবার বাগানে হাঁটুন'
                  : language === 'hi'
                  ? 'फिर से सैर करें'
                  : 'Stroll Again'}
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

export default TeaGardenFocus;

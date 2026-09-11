import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { CommonGameHeader } from './CommonGameHeader';
import { SessionEndingModal } from './SessionEndingModal';
import { playSound } from '../../services/voiceService';
import { t } from '../../services/i18n';
import { SunMedium, Moon, Sparkles, ArrowRight, RotateCcw, Heart, Coffee } from 'lucide-react';

interface RoutineBuilderProps {
  language: Language;
  onBack: () => void;
  onFinishSession?: () => void;
}

interface DailyMomentItem {
  id: string;
  momentTitle: Record<Language, string>;
  question: Record<Language, string>;
  story: Record<Language, string>;
  imageUrl: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  options: { id: string; label: Record<Language, string>; isMatch: boolean }[];
}

const DAILY_MOMENTS: DailyMomentItem[] = [
  {
    id: 'dm-1',
    momentTitle: {
      en: 'Morning Cardamom Tea on the Veranda',
      as: 'বাৰাণ্ডাত পুৱাৰ ইলাচী চাহ',
      bn: 'বারান্দায় সকালের এলাচ চা',
      hi: 'सुबह की इलायची वाली ताज़ा चाय',
      mni: 'Ayukki Cha',
    },
    question: {
      en: 'At what peaceful time of day does our family sit together on the veranda to enjoy a fresh, steaming cup of morning tea?',
      as: 'দিনটোৰ কোন সময়ত পৰিয়ালে বাৰাণ্ডাত বহি গৰম গৰম সুবাসিত চাহৰ কাপ উপভোগ কৰে?',
      bn: 'দিনের কোন স্নিগ্ধ সময়ে আমরা বারান্দায় বসে ধোঁয়া ওঠা এক কাপ গরম চা উপভোগ করি?',
      hi: 'दिन के किस सुकून भरे समय हम बरामदे में बैठकर गरमा-गरम चाय का आनंद लेते हैं?',
      mni: 'Numitki karamba matamda eikhoi ayukki cha thakpaba fajabage?',
    },
    story: {
      en: 'Morning tea with fresh milk and cardamom warms the spirit as birds begin their songs in the bamboo groves.',
      as: 'পুৱাৰ সতেজ গাখীৰ আৰু ইলাচী দিয়া চাহে মনলৈ প্ৰশান্তি আনে, যেতিয়া বাঁহনিৰ আঁৰৰ পৰা চৰাইৰ মাত ভাহি আহে।',
      bn: 'সকালের চা মনকে সতেজ করে তোলে, যখন বাঁশবনের মধ্য দিয়ে ভোরের পাখির মিষ্টি ডাক ভেসে আসে।',
      hi: 'सुबह की इलायची वाली चाय मन को ताजगी देती है, जब चिड़ियों की चहचहाहट वातावरण को मधुर बनाती है।',
      mni: 'Ayukki nungsit amasung ucheksinggi makhon taduna cha thakpa.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    timeOfDay: 'morning',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Morning Sunshine ☀️',
          as: 'ৰসাল পুৱাবেলা ☀️',
          bn: 'স্নিগ্ধ সকালবেলা ☀️',
          hi: 'सुहानी सुबह ☀️',
          mni: 'Ayukki Numit ☀️',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Late Midnight 🌙',
          as: 'মাজনিশা 🌙',
          bn: 'গভীর রাত 🌙',
          hi: 'देर रात 🌙',
          mni: 'Ahing 🌙',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'dm-2',
    momentTitle: {
      en: 'Tending to Garden Orchids & Tulsi',
      as: 'বাৰীৰ কপৌ ফুল আৰু তুলসী তলৰ যত্ন',
      bn: 'বাগানের অর্কিড ও তুলসীতলার যত্ন',
      hi: 'बगीचे के फूल और तुलसी जी की देखभाल',
      mni: 'Leikol amasung Tulsi leiba',
    },
    question: {
      en: 'When the morning light touches the leaves, what gentle outdoor ritual helps our garden stay green and fresh?',
      as: 'পুৱাৰ পোহৰ পৰাৰ লগে লগে বাৰীৰ গছ-লতা আৰু তুলসী গছজোপাৰ যত্ন ল’বলৈ আমি কি কৰোঁ?',
      bn: 'ভোরের মিষ্টি আলোয় বাগানের গাছপালা ও তুলসীতলায় জল দেওয়ার মতো শান্তির অভ্যাস কোনটি?',
      hi: 'सुबह की धूप में बगीचे के पौधों और तुलसी जी को पानी देना दिन का कैसा सुखद पल है?',
      mni: 'Ayukta leikolda ishing teiba fajaba thabak karino?',
    },
    story: {
      en: 'Pouring cool fresh water around the roots of the Tulsi plant brings calm focus and fills the air with sweet botanical fragrance.',
      as: 'তুলসীৰ গুৰিত পানী ঢালিলে মনলৈ পৱিত্ৰ শান্তি আহে আৰু ফুলনিৰ সুবাসে চৌপাশ আমোলমোলাই তোলে।',
      bn: 'তুলসীতলায় শান্তভাবে জল দিলে মনে অপার শান্তি আসে এবং বাতাস স্নিগ্ধ সুবাসে ভরে ওঠে।',
      hi: 'तुलसी के पौधे में जल अर्पित करना मन को पावन शांति देता है और वातावरण महक उठता है।',
      mni: 'Tulsi maronda ishing haaptuna thabak touba.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80',
    timeOfDay: 'morning',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Watering the Garden Plants 💧',
          as: 'ফুলনিত পানী দিয়া 💧',
          bn: 'বাগানে জল দেওয়া 💧',
          hi: 'पौधों को पानी देना 💧',
          mni: 'Leikolda Ishing Teiba 💧',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Turning off all Lights',
          as: 'সকলো লাইট নুমুৱাই দিয়া',
          bn: 'সব বাতি নিভিয়ে দেওয়া',
          hi: 'सभी बत्तियां बुझाना',
          mni: 'Thaomei Muthithatpa',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'dm-3',
    momentTitle: {
      en: 'Lighting the Evening Prayer Lamp',
      as: 'সন্ধিয়াৰ পৱিত্ৰ চাকি জ্বলোৱা',
      bn: 'সন্ধ্যার পবিত্র প্রদীপ জ্বালানো',
      hi: 'संध्या बेला में पावन दीपक जलाना',
      mni: 'Numidanggi Thaomei Thamba',
    },
    question: {
      en: 'As dusk settles and temple bells chime, at what time do we light the brass earthen oil lamp in the prayer corner?',
      as: 'বেলি লহিওৱাৰ পাছত গোঁসাইঘৰ বা নামঘৰত পৱিত্ৰ চাকি-বন্তি কোন সময়ত জ্বলোৱা হয়?',
      bn: 'সূর্য ডোবার পর সন্ধ্যার শান্ত আলোয় ঠাকুরঘরে পিতলের প্রদীপ বা ধূপ জ্বালানোর সময় কোনটি?',
      hi: 'दिन ढलने पर घर के मंदिर में पीतल का दीपक और धूपबत्ती जलाने का समय कौन सा है?',
      mni: 'Numit thaba matamda laisangda thaomei thambagi matam karino?',
    },
    story: {
      en: 'The soft golden glow of mustard oil lamps brings serenity to the whole household as evening falls.',
      as: 'সৰিয়হৰ তেলৰ চাকিৰ সোণালী পোহৰে সমগ্ৰ ঘৰখনতে শান্তি আৰু আনন্দৰ পৰিৱেশ সৃষ্টি কৰে।',
      bn: 'সরিষার তেলের প্রদীপের সোনালী আলো পুরো বাড়িকে এক অপূর্ব স্নিগ্ধতায় ভরিয়ে তোলে।',
      hi: 'मिट्टी और पीतल के दीपक की सुनहरी लौ पूरे घर में सुख और शांति का संचार करती है।',
      mni: 'Thaomeigi fajaba meingal na yum pumba nungshihanba.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1545232979-fbf675951a83?auto=format&fit=crop&w=600&q=80',
    timeOfDay: 'evening',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Peaceful Evening Dusk 🪔',
          as: 'মৰমৰ গধূলি বেলা 🪔',
          bn: 'স্নিগ্ধ সন্ধ্যাবেলা 🪔',
          hi: 'सुहानी शाम की आरती 🪔',
          mni: 'Numidangwairam 🪔',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Hot Noon Sun',
          as: 'দুপৰীয়াৰ টান ৰ’দ',
          bn: 'তপ্ত দুপুরবেলা',
          hi: 'कड़कती दोपहर',
          mni: 'Nungthilgi Saaba',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'dm-4',
    momentTitle: {
      en: 'Peaceful Nighttime Rest & Music',
      as: 'নিশাৰ শান্ত জিৰণি আৰু মৃদু সুৰ',
      bn: 'রাতের শান্ত বিশ্রাম ও মিষ্টি সুর',
      hi: 'रात का शांत विश्राम व मधुर संगीत',
      mni: 'Ahinggi Potthaba',
    },
    question: {
      en: 'When the stars twinkle across the hill skies, what comforting habit helps our mind relax into deep, restful sleep?',
      as: 'আকাশত তৰা জিলিকিলে মনটো শান্ত কৰি শুই পৰিবলৈ কোনটো অভ্যাস আটাইতকৈ উপকাৰী?',
      bn: 'আকাশে তারা ফুটলে মন শান্ত করে সুন্দর ঘুমের জন্য কোন অভ্যাসটি সবচেয়ে আরামদায়ক?',
      hi: 'रात के समय सुकून भरी नींद के लिए कौन सी आदत सबसे अच्छी होती है?',
      mni: 'Ahingda fajana tumingbada karina mateng pangbano?',
    },
    story: {
      en: 'Listening to soft instrumental music and resting under a warm quilt restores energy for a bright new morning.',
      as: 'মৃদু সুৰ শুনি উমাল কাপোৰৰ তলত বিশ্ৰাম ল’লে মন শান্ত হয় আৰু পিছদিনাৰ পুৱা আনন্দময় হৈ পৰে।',
      bn: 'মৃদু সুর শুনে আরামদায়ক বিছানায় বিশ্রাম নিলে পরের সকালের জন্য শরীর ও মন তরতাজা হয়ে ওঠে।',
      hi: 'धीमी मधुर धुन सुनते हुए सुकून से सोना मन को शांत करता है और नई ऊर्जा देता है।',
      mni: 'Tapna eshei taduna ahingda fajana potthaba.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    timeOfDay: 'night',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Soft Music & Bedtime Rest 🌙',
          as: 'মৃদু সুৰ আৰু শান্ত নিদ্ৰা 🌙',
          bn: 'মিষ্টি সুর ও শান্ত ঘুম 🌙',
          hi: 'धीमा संगीत व आरामदायक नींद 🌙',
          mni: 'Tapna Eshei & Potthaba 🌙',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Heavy Physical Exercise',
          as: 'কঠিন শাৰীৰিক ব্যায়াম',
          bn: 'কঠোর শরীরচর্চা',
          hi: 'कठिन व्यायाम',
          mni: 'Exercise Touba',
        },
        isMatch: false,
      },
    ],
  },
];

export const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  language,
  onBack,
  onFinishSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [softHintId, setSoftHintId] = useState<string | null>(null);
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

  const currentMoment = DAILY_MOMENTS[currentIndex % DAILY_MOMENTS.length] || DAILY_MOMENTS[0];

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    const chosen = currentMoment.options.find((o) => o.id === optionId);

    if (chosen?.isMatch) {
      playSound('success');
      setIsRevealed(true);
    } else {
      playSound('click');
      const target = currentMoment.options.find((o) => o.isMatch);
      if (target) setSoftHintId(target.id);
      setTimeout(() => {
        setIsRevealed(true);
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= DAILY_MOMENTS.length) {
      setIsSessionEnded(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setSoftHintId(null);
      setIsRevealed(false);
    }
  };

  const handleFinishEarly = () => {
    if (onFinishSession) {
      onFinishSession();
    } else {
      setIsSessionEnded(true);
    }
  };

  const readAloudText = `${currentMoment.question[language] || currentMoment.question.en}. ${currentMoment.story[language] || currentMoment.story.en}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 font-sans">
      {/* Unified Calm Header */}
      <CommonGameHeader
        language={language}
        title={t('routineBuilderTitle', language)}
        subtitle={language === 'as' ? 'দৈনন্দিন জীৱনৰ শান্ত আৰু মধুৰ ছন্দ' : language === 'bn' ? 'প্রাত্যহিক জীবনের শান্ত ছন্দ ও স্মৃতি' : language === 'hi' ? 'दैनिक दिनचर्या के सुकून भरे पल' : 'Gentle Daily Moments & Circadian Rhythm'}
        readAloudText={readAloudText}
        onBack={onBack}
        onFinishEarly={handleFinishEarly}
      />

      {/* Main Single-Task Screen */}
      {!isSessionEnded ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#becabf]/60 space-y-6">
          {/* Question Prompt */}
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] leading-relaxed">
              {currentMoment.question[language] || currentMoment.question.en}
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#416740] font-bold bg-[#bfebba]/30 px-3 py-0.5 rounded-full border border-[#becabf]/50">
              <SunMedium className="w-3.5 h-3.5" />
              <span>{currentMoment.momentTitle[language] || currentMoment.momentTitle.en}</span>
            </div>
          </div>

          {/* Large Evocative Photo */}
          <div className="relative mx-auto max-w-md h-64 sm:h-72 rounded-3xl overflow-hidden shadow-lg border-3 border-[#becabf]/60 bg-[#f7faf5]">
            <img
              src={currentMoment.imageUrl}
              alt={currentMoment.momentTitle[language] || currentMoment.momentTitle.en}
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />
          </div>

          {/* Tactile Choices (Zero Penalties) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentMoment.options.map((opt) => {
              const isChosen = selectedOptionId === opt.id;
              const isTarget = opt.isMatch;
              const isHinted = softHintId === opt.id;

              let btnStyle = 'bg-[#f7faf5] hover:bg-[#ecefea] text-[#032517] border-[#becabf]/70';

              if (isRevealed && isTarget) {
                btnStyle = 'bg-[#bfebba]/50 border-[#416740] text-[#032517] ring-2 ring-[#416740]/30 shadow-sm';
              } else if (isHinted) {
                btnStyle = 'bg-amber-50 border-amber-300 text-[#032517] shadow-sm';
              }

              return (
                <button
                  key={opt.id}
                  disabled={isRevealed}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-5 rounded-2xl border-2 text-base sm:text-lg font-serif font-bold text-center transition-all cursor-pointer min-h-[72px] flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  <span>{opt.label[language] || opt.label.en}</span>
                  {isRevealed && isTarget && (
                    <span className="text-[#416740] font-black text-sm">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Revealed Comforting Story */}
          {isRevealed && (
            <div className="pt-3 space-y-4 animate-in fade-in duration-500">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#bfebba]/25 border border-[#416740]/30 text-xs sm:text-sm text-[#032517] leading-relaxed">
                <div className="font-bold text-[#032517] mb-1">
                  🌿 {currentMoment.momentTitle[language] || currentMoment.momentTitle.en}
                </div>
                <p className="text-[#3e4941]">
                  {currentMoment.story[language] || currentMoment.story.en}
                </p>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-base shadow-md transition-transform active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{t('exploreAnotherMoment', language)}</span>
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
            ☀️
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
              {t('sessionCompleteMessage', language)}
            </h2>
            <p className="text-sm text-[#3e4941] font-medium max-w-md mx-auto leading-relaxed">
              {language === 'as'
                ? 'আজিৰ সকলো দৈনন্দিন সুখৰ মুহূৰ্ত একেলগে মনত পেলোৱা হ’ল।'
                : language === 'bn'
                ? 'আজকের সকল মিষ্টি দৈনন্দিন মুহূর্ত আমরা একসাথে উপভোগ করলাম।'
                : language === 'hi'
                ? 'आज के सभी सुखद दैनिक पलों को हमने साथ मिलकर याद किया।'
                : 'All gentle daily moments were peacefully recalled and celebrated together.'}
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
                setSelectedOptionId(null);
                setSoftHintId(null);
                setIsRevealed(false);
                setIsSessionEnded(false);
              }}
              className="py-3.5 px-6 bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] font-extrabold rounded-2xl text-sm border border-[#becabf]/60 cursor-pointer"
            >
              {t('exploreAnotherMoment', language)}
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

export default RoutineBuilder;

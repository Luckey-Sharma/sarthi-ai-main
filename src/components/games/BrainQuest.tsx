import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { CommonGameHeader } from './CommonGameHeader';
import { SessionEndingModal } from './SessionEndingModal';
import { playSound } from '../../services/voiceService';
import { t } from '../../services/i18n';
import { MapPin, Compass, Sparkles, ArrowRight, RotateCcw, Heart } from 'lucide-react';

interface BrainQuestProps {
  language: Language;
  onBack: () => void;
  onFinishSession?: () => void;
}

interface HeritagePlaceItem {
  id: string;
  name: Record<Language, string>;
  location: Record<Language, string>;
  question: Record<Language, string>;
  story: Record<Language, string>;
  imageUrl: string;
  options: { id: string; label: Record<Language, string>; isMatch: boolean }[];
}

const HERITAGE_PLACES: HeritagePlaceItem[] = [
  {
    id: 'hp-1',
    name: {
      en: 'Kaziranga National Park',
      as: 'কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান',
      bn: 'কাজিরাঙ্গা জাতীয় উদ্যান',
      hi: 'काजीरंगा राष्ट्रीय उद्यान',
      mni: 'Kaziranga National Park',
    },
    location: {
      en: 'Golaghat & Nagaon, Assam',
      as: 'গোলাঘাট আৰু নগাঁও, অসম',
      bn: 'গোলাঘাট ও নগাঁও, আসাম',
      hi: 'गोलाघाट एवं नगांव, असम',
      mni: 'Assam',
    },
    question: {
      en: 'Where do the majestic great one-horned rhinoceroses roam peacefully among the tall elephant grass?',
      as: 'উখ ওখ ইকৰা-খাগৰিৰ বননিৰ মাজেৰে গৌৰৱময় এশিঙীয়া গঁড় শান্তভাৱে ক’ত চৰে?',
      bn: 'উঁচু হাতিঘাসের বনের মধ্য দিয়ে রাজকীয় একশৃঙ্গ গণ্ডার শান্তভাবে কোথায় ঘুরে বেড়ায়?',
      hi: 'लंबी हाथीघास के मैदानों में विशाल एक सींग वाले गैंडे शांति से कहाँ विचरण करते हैं?',
      mni: 'Shing ama panba rhino fajana kadaida leibage?',
    },
    story: {
      en: 'Kaziranga is the world’s sanctuary for over 2,600 great one-horned rhinos, protected by green wetlands and the gentle flow of the Brahmaputra.',
      as: 'কাজিৰঙা হ’ল অসমৰ গৌৰৱ, য’ত ২৬০০ৰো অধিক এশিঙীয়া গঁড় প্ৰাকৃতিক বিল আৰু ব্ৰহ্মপুত্ৰৰ পাৰত শান্তভাৱে বিচৰণ কৰে।',
      bn: 'কাজিরাঙ্গা হলো আসামের গর্ব, যেখানে ব্রহ্মপুত্রের কোল ঘেঁষে সবুজ জলাভূমিতে একশৃঙ্গ গণ্ডার ঘুরে বেড়ায়।',
      hi: 'काजीरंगा असम का गौरव है, जहाँ ब्रह्मपुत्र के किनारे विशाल गैंडे सुकून से रहते हैं।',
      mni: 'Kaziranga gi shing ama panba rhino gi fajaba mafamni.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Kaziranga Grasslands',
          as: 'কাজিৰঙাৰ সেউজ পথাৰ',
          bn: 'কাজিরাঙ্গার তৃণভূমি',
          hi: 'काजीरंगा के घास के मैदान',
          mni: 'Kaziranga Grassland',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'City Highway',
          as: 'নগৰৰ ব্যস্ত পথ',
          bn: 'শহরের ব্যস্ত রাস্তা',
          hi: 'शहर का राजमार्ग',
          mni: 'City Highway',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'hp-2',
    name: {
      en: 'Majuli River Island',
      as: 'মাজুলী নদী দ্বীপ',
      bn: 'মাজুলী নদী দ্বীপ',
      hi: 'माजुली नदी द्वीप',
      mni: 'Majuli Turelgi Island',
    },
    location: {
      en: 'Brahmaputra River, Assam',
      as: 'ব্ৰহ্মপুত্ৰৰ বুকুত, অসম',
      bn: 'ব্রহ্মপুত্র নদী, আসাম',
      hi: 'ब्रह्मपुत्र नदी, असम',
      mni: 'Brahmaputra Turel',
    },
    question: {
      en: 'Which serene river island is celebrated for its historic Satras, devotion, and traditional clay-and-bamboo masks?',
      as: 'ঐতিহাসিক সত্ৰ সংস্কৃতি, ভক্তি আৰু মুখা শিল্পৰ বাবে কোনটো নদী দ্বীপ বিশ্ববিখ্যাত?',
      bn: 'ঐতিহাসিক সত্র সংস্কৃতি, ভক্তিমূলক কীর্তন ও মুখোশ শিল্পের জন্য কোন নদী দ্বীপ বিখ্যাত?',
      hi: 'ऐतिहासिक सत्रों, भक्ति संगीत और पारंपरिक मुखौटा कला के लिए कौन सा नदी द्वीप प्रसिद्ध है?',
      mni: 'Satra amasung mask gi fajaba turelgi island kari koubage?',
    },
    story: {
      en: 'Majuli is the largest inhabited river island on Earth, echoing with the soft sound of prayer cymbals (Taal) and timeless Bhaona theatre.',
      as: 'মাজুলী সত্ৰীয়া সংস্কৃতিৰ প্ৰাণকেন্দ্ৰ। সত্ৰসমূহত ভোৰতালৰ মৃদু ধ্বনি আৰু ভাওনাৰ মুখা শিল্পই মনলৈ আধ্যাত্মিক শান্তি আনে।',
      bn: 'মাজুলী পৃথিবীর বৃহত্তম নদী দ্বীপ। এখানে খোল-করতালের সুর এবং ভাওনার মুখোশ শিল্প এক অপার্থিব প্রশান্তি তৈরি করে।',
      hi: 'माजुली विश्व का विशालतम नदी द्वीप है, जहाँ सत्रों में मृदंग और झांझ की गूंज मन को असीम शांति देती है।',
      mni: 'Majuli turelgi island da satra amasung mask fajana leiri.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Majuli Holy Island',
          as: 'পৱিত্ৰ মাজুলী সত্ৰ দ্বীপ',
          bn: 'পবিত্র মাজুলী দ্বীপ',
          hi: 'पवित्र माजुली द्वीप',
          mni: 'Majuli Island',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Busy Railway Station',
          as: 'ৰে’ল ষ্টেচন',
          bn: 'রেলওয়ে স্টেশন',
          hi: 'रेलवे स्टेशन',
          mni: 'Railway Station',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'hp-3',
    name: {
      en: 'Kamakhya Temple on Nilachal Hill',
      as: 'নীলাচলৰ কামাখ্যা ধাম',
      bn: 'নীলাচলের কামাখ্যা মন্দির',
      hi: 'नीलाचल पर्वत का कामाख्या मंदिर',
      mni: 'Kamakhya Laisang',
    },
    location: {
      en: 'Guwahati, Assam',
      as: 'গুৱাহাটী, অসম',
      bn: 'গুয়াহাটি, আসাম',
      hi: 'गुवाहाटी, असम',
      mni: 'Guwahati',
    },
    question: {
      en: 'Which sacred temple sits atop Nilachal hill overlooking the wide, silvery waters of the Brahmaputra?',
      as: 'ব্ৰহ্মপুত্ৰৰ ৰূপালী ঢৌলৈ চাই নীলাচল পাহাৰৰ ওপৰত কোনটো প্ৰাচীন পৱিত্ৰ দেৱালয় অৱস্থিত?',
      bn: 'ব্রহ্মপুত্র নদের রূপোলী জলের দিকে তাকিয়ে নীলাচল পাহাড়ের চূড়ায় কোন পবিত্র তীর্থস্থান অবস্থিত?',
      hi: 'ब्रह्मपुत्र नदी के दर्शन करते हुए नीलाचल पर्वत पर कौन सा प्राचीन पावन मंदिर स्थित है?',
      mni: 'Nilachal chinggi mathakta leiba laisang kari koubage?',
    },
    story: {
      en: 'Perched high with panoramic views, families visit during dawn to light earthen lamps and offer prayer offerings on bell-metal Xorai.',
      as: 'পুৱাৰ বেলি উঠাৰ সময়ত কামাখ্যাৰ চোতালত কাঁহৰ শৰাই আৰু মাটিৰ চাকি লৈ পৰিয়ালে আশীৰ্বাদ বিচাৰে।',
      bn: 'ভোরের স্নিগ্ধ আলোয় কামাখ্যার আঙিনায় কাঁসার শরাই আর প্রদীপ জ্বালিয়ে শান্তি প্রার্থনা করার পরম স্মৃতি।',
      hi: 'सुबह की पावन बेला में कामाख्या के प्रांगण में दिया जलाकर परिवार की खुशहाली की प्रार्थना की जाती है।',
      mni: 'Ayukta Kamakhya laisangda thaomei thambada nungcba phangngi.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1545232979-fbf675951a83?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Kamakhya Temple',
          as: 'কামাখ্যা দেৱালয়',
          bn: 'কামাখ্যা ধাম',
          hi: 'माँ कामाख्या धाम',
          mni: 'Kamakhya Laisang',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Ocean Harbor',
          as: 'সমুদ্ৰ বন্দৰ',
          bn: 'সমুদ্র বন্দর',
          hi: 'समुद्री बंदरगाह',
          mni: 'Ocean Port',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'hp-4',
    name: {
      en: 'Loktak Floating Lake',
      as: 'মণিপুৰৰ লোকটক হ্ৰদ',
      bn: 'মণিপুরের লোকটাক হ্রদ',
      hi: 'मणिपुर की लोकटक झील',
      mni: 'Loktak Pat',
    },
    location: {
      en: 'Moirang, Manipur',
      as: 'মইৰাং, মণিপুৰ',
      bn: 'মইরাং, মণিপুর',
      hi: 'मोइरांग, मणिपुर',
      mni: 'Moirang, Manipur',
    },
    question: {
      en: 'Which freshwater lake is famous for its circular green floating islands called "Phumdis"?',
      as: 'ওপঙি থকা অনন্য সেউজীয়া "ফুমদি" দ্বীপৰ বাবে বিশ্বখ্যাত মণিপুৰৰ হ্ৰদটোৰ নাম কি?',
      bn: 'গোলাকার ভাসমান সবুজ দ্বীপ বা "ফুমদি"র জন্য বিখ্যাত মনোরম মিষ্টি জলের হ্রদ কোনটি?',
      hi: 'तैरते हुए गोल हरे-भरे बायोमास द्वीपों ("फुमदी") के लिए कौन सी प्रसिद्ध झील जानी जाती है?',
      mni: 'Phumdi leiba fajaba pat ashi kari koubage?',
    },
    story: {
      en: 'Loktak Lake is a calm freshwater expanse where fishermen glide gently on dug-out canoes among blooming water lilies.',
      as: 'লোকটক হ্ৰদ মণিপুৰৰ প্ৰাণ। শান্ত পানীত ভেট ফুলৰ মাজেৰে সৰু নাও লৈ শান্তভাৱে মাছমৰীয়াসকলে বঠা বায়।',
      bn: 'লোকটাক হ্রদ মণিপুরের রত্ন। শান্ত নীল জলে শাপলা ফুলের মাঝে ছোট ছোট নৌকো ভাসিয়ে জেলেরা ঘুরে বেড়ায়।',
      hi: 'लोकटक झील मणिपुर की जीवनरेखा है, जहाँ शांत जल में कमल के फूलों के बीच नावें तैरती हैं।',
      mni: 'Loktak pat ta sangai saa amsung fajaba heikak thambal satli.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Loktak Floating Lake',
          as: 'লোকটক হ্ৰদ',
          bn: 'লোকটাক হ্রদ',
          hi: 'लोकटक फुमदी झील',
          mni: 'Loktak Pat',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Desert Sand Dunes',
          as: 'মৰুভূমিৰ বালি',
          bn: 'মরুভূমির বালুকা',
          hi: 'रेगिस्तान के टीले',
          mni: 'Desert',
        },
        isMatch: false,
      },
    ],
  },
];

export const BrainQuest: React.FC<BrainQuestProps> = ({
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

  const currentPlace = HERITAGE_PLACES[currentIndex % HERITAGE_PLACES.length] || HERITAGE_PLACES[0];

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    const chosen = currentPlace.options.find((o) => o.id === optionId);

    if (chosen?.isMatch) {
      playSound('success');
      setIsRevealed(true);
    } else {
      // Gentle guidance without penalty or red color
      playSound('click');
      const target = currentPlace.options.find((o) => o.isMatch);
      if (target) setSoftHintId(target.id);
      setTimeout(() => {
        setIsRevealed(true);
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= HERITAGE_PLACES.length) {
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

  const readAloudText = `${currentPlace.question[language] || currentPlace.question.en}. ${currentPlace.story[language] || currentPlace.story.en}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 font-sans">
      {/* Unified Calm Header */}
      <CommonGameHeader
        language={language}
        title={t('brainQuestTitle', language)}
        subtitle={language === 'as' ? 'চিনাকি স্থান আৰু সোণালী স্মৃতি' : language === 'bn' ? 'পরিচিত স্থান ও ঐতিহ্যমণ্ডিত স্মৃতি' : language === 'hi' ? 'जानी-पहचानी जगहें व पावन यादें' : 'Familiar Heritage Places & Stories'}
        readAloudText={readAloudText}
        onBack={onBack}
        onFinishEarly={handleFinishEarly}
      />

      {/* Main Single-Task Screen */}
      {!isSessionEnded ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#becabf]/60 space-y-6">
          {/* Gentle Question */}
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] leading-relaxed">
              {currentPlace.question[language] || currentPlace.question.en}
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#6f7a70] font-bold">
              <MapPin className="w-3.5 h-3.5 text-[#416740]" />
              <span>{currentPlace.location[language] || currentPlace.location.en}</span>
            </div>
          </div>

          {/* Large Scenic Photograph */}
          <div className="relative mx-auto max-w-md h-64 sm:h-72 rounded-3xl overflow-hidden shadow-lg border-3 border-[#becabf]/60 bg-[#f7faf5]">
            <img
              src={currentPlace.imageUrl}
              alt={currentPlace.name[language] || currentPlace.name.en}
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />
          </div>

          {/* Large Tactile Choices (Zero Red Borders, Zero Penalties) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentPlace.options.map((opt) => {
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

          {/* Revealed Comforting Story & Next Button */}
          {isRevealed && (
            <div className="pt-3 space-y-4 animate-in fade-in duration-500">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#bfebba]/25 border border-[#416740]/30 text-xs sm:text-sm text-[#032517] leading-relaxed">
                <div className="font-bold text-[#032517] mb-1">
                  🌿 {currentPlace.name[language] || currentPlace.name.en}
                </div>
                <p className="text-[#3e4941]">
                  {currentPlace.story[language] || currentPlace.story.en}
                </p>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-base shadow-md transition-transform active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{t('exploreAnotherPlace', language)}</span>
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
            🏞️
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
              {t('sessionCompleteMessage', language)}
            </h2>
            <p className="text-sm text-[#3e4941] font-medium max-w-md mx-auto leading-relaxed">
              {language === 'as'
                ? 'আজিৰ সকলো ঐতিহাসিক স্থানৰ সোণালী স্মৃতি দেখা হ’ল। মনলৈ আনন্দ আৰু শান্তি আহক।'
                : language === 'bn'
                ? 'আজকের সকল পরিচিত স্থান ও সুন্দর স্মৃতি আমরা একসাথে দেখলাম। মন ভালো থাকুক।'
                : language === 'hi'
                ? 'आज की सभी जानी-पहचानी जगहें और उनकी कहानियां हमने साथ मिलकर देखीं। मन प्रसन्न रहे।'
                : 'All heritage places and comforting stories were explored together peacefully.'}
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
              {t('exploreAnotherPlace', language)}
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

export default BrainQuest;

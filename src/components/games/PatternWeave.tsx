import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { CommonGameHeader } from './CommonGameHeader';
import { SessionEndingModal } from './SessionEndingModal';
import { playSound } from '../../services/voiceService';
import { t } from '../../services/i18n';
import { Shirt, Sparkles, ArrowRight, RotateCcw, Heart } from 'lucide-react';

interface PatternWeaveProps {
  language: Language;
  onBack: () => void;
  onFinishSession?: () => void;
}

interface TraditionalAttireItem {
  id: string;
  name: Record<Language, string>;
  region: Record<Language, string>;
  question: Record<Language, string>;
  description: Record<Language, string>;
  culturalFact: Record<Language, string>;
  imageUrl: string;
  options: { id: string; label: Record<Language, string>; isMatch: boolean }[];
}

const TRADITIONAL_ATTIRES: TraditionalAttireItem[] = [
  {
    id: 'attire-1',
    name: {
      en: 'Golden Muga Silk Mekhela Chador',
      as: 'সোণালী মুগা ৰেচমৰ মেখেলা চাদৰ',
      bn: 'সোনালী মুগা রেশমের মেখলা চাদর',
      hi: 'सुनहरा मूगा सिल्क मेखेला चादोर',
      mni: 'Muga Silk Mekhela Chador',
    },
    region: {
      en: 'Assam',
      as: 'অসম',
      bn: 'আসাম',
      hi: 'असम',
      mni: 'Assam',
    },
    question: {
      en: 'Which rare golden silk, woven on handlooms and worn during Bihu dances, shines brighter with every wash?',
      as: 'তাঁতশালত বোৱা কোনটো সোণালী ৰেচমৰ কাপোৰ বিহু নৃত্যত পিন্ধা হয় আৰু ধোৱাৰ লগে লগে উজ্জ্বলতা বাঢ়ে?',
      bn: 'হস্তচালিত তাঁতে বোনা কোন সোনালী রেশম বস্ত্র বিহু নাচের সময় পরা হয় এবং বয়স বাড়ার সাথে সাথে যার ঔজ্জ্বল্য বাড়ে?',
      hi: 'हथकरघे पर बुना गया कौन सा सुनहरा रेशम बिहू नृत्य में पहना जाता है और उम्र के साथ और चमकता है?',
      mni: 'Muga silk phi ashi Bihuda shetpa fajaba reshamno?',
    },
    description: {
      en: 'Muga silk is endemic only to the Brahmaputra valley. Its shimmering golden hue is completely natural and can last for more than a hundred years.',
      as: 'মুগা ৰেচম অসমৰ গৌৰৱ। ইয়াৰ প্ৰাকৃতিক সোণালী ৰং এশ বছৰৰো অধিক কাল একেদৰে উজ্জ্বল হৈ থাকে।',
      bn: 'মুগা রেশম আসামের গৌরব। এর প্রাকৃতিক সোনালী আভা শতবর্ষের বেশি সময় ধরে অমলিন থাকে।',
      hi: 'मूगा सिल्क असम की अमूल्य धरोहर है। इसका प्राकृतिक सुनहरा रंग पीढ़ियों तक चमकता रहता है।',
      mni: 'Muga silk ashi chahi chamathei mangdana fajana leiba reshamni.',
    },
    culturalFact: {
      en: 'Grandmothers in Assam proudly hand down their heirloom Muga chadors to their daughters and granddaughters.',
      as: 'আইতাহঁতে নিজৰ অতি মৰমৰ পুৰণি মুগা চাদৰখন জী-বোৱাৰীক আশীৰ্বাদ হিচাপে উপহাৰ দিয়ে।',
      bn: 'পরিবারের মায়েরা তাদের ঐতিহ্যবাহী মুগা চাদর পরম স্নেহে কন্যা ও পুত্রবধূকে উপহার দেন।',
      hi: 'परिवार में दादी-नानी अपनी पारंपरिक मूगा चादोर बेटियों और बहुओं को आशीर्वाद स्वरूप देती हैं।',
      mni: 'Imunggi machaningonda katchaba muga chador.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Muga Silk Mekhela Chador',
          as: 'মুগা মেখেলা চাদৰ',
          bn: 'মুগা মেখলা চাদর',
          hi: 'मूगा सिल्क मेखेला चादोर',
          mni: 'Muga Silk Chador',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Plastic Raincoat',
          as: 'প্লাষ্টিকৰ বৰষুণৰ কোট',
          bn: 'প্লাস্টিকের রেইনকোট',
          hi: 'प्लास्टिक का रेनकोट',
          mni: 'Raincoat',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'attire-2',
    name: {
      en: 'Traditional Naga Ceremonial Shawl',
      as: 'পৰম্পৰাগত নগা হস্ততাঁতৰ শাল',
      bn: 'ঐতিহ্যবাহী নাগা হস্তনির্মিত শাল',
      hi: 'पारंपरिक नगा हथकरघा शॉल',
      mni: 'Naga Handloom Shawl',
    },
    region: {
      en: 'Nagaland',
      as: 'নগালেণ্ড',
      bn: 'নাগাল্যান্ড',
      hi: 'नागालैंड',
      mni: 'Nagaland',
    },
    question: {
      en: 'Which handwoven woolen shawl, featuring bold red, black, and white patterns, honors bravery and warmth in hill winters?',
      as: 'ৰঙা, ক’লা আৰু বগা ৰঙৰ স্পষ্ট জ্যামিতিক চানেকিৰে বোৱা পাহাৰৰ শীতৰ উমাল নগা শালখন কি?',
      bn: 'লাল, কালো ও সাদা জ্যামিতিক নকশায় বোনা পাহাড়ের শীতের উষ্ণ ঐতিহ্যবাহী নাগা শাল কোনটি?',
      hi: 'लाल, काले और सफेद रंगों की ज्यामितीय बुनाई वाली पहाड़ी सर्दियों की प्रसिद्ध नगा शॉल कौन सी है?',
      mni: 'Naga chinggi ngakpi fajaba phi ashi karino?',
    },
    description: {
      en: 'Every Naga tribe weaves distinct geometric motifs symbolizing courage, family dignity, and harmony with nature.',
      as: 'প্ৰতিটো নগা জনগোষ্ঠীৰ নিজা নিপুণ চানেকি থাকে, যিয়ে সাহস আৰু প্ৰকৃতিৰ লগত একাত্মতা প্ৰকাশ কৰে।',
      bn: 'প্রতিটি নাগা উপজাতির নিজস্ব সুন্দর বুনন রয়েছে, যা বীরত্ব ও প্রকৃতির সাথে মেলবন্ধনের প্রতীক।',
      hi: 'प्रत्येक नगा जनजाति की अपनी अनूठी बुनाई होती है जो साहस और प्रकृति के सम्मान का प्रतीक है।',
      mni: 'Naga shawlda fajaba pattern amsung maru oiba wari yaori.',
    },
    culturalFact: {
      en: 'Woven on gentle backstrap looms by women in village homes on cool mountain afternoons.',
      as: 'পাহাৰীয়া গাঁৱত মহিলাসকলে কঁকালৰ তাঁতশালত অতি মৰমেৰে এই শালবোৰ বয়।',
      bn: 'পাহাড়ি গ্রামে মহিলারা পরম যত্নে নিজেদের হাতে এই সুন্দর শাল তৈরি করেন।',
      hi: 'पहाड़ी गांवों में महिलाएं अपने हाथों से बड़े प्रेम से इन शॉलों की बुनाई करती हैं।',
      mni: 'Chinggi nupisingna khutna saba fajaba shawl.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Naga Woven Shawl',
          as: 'নগা হস্ততাঁতৰ শাল',
          bn: 'নাগা হস্তনির্মিত শাল',
          hi: 'पारंपरिक नगा शॉल',
          mni: 'Naga Shawl',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Winter Leather Jacket',
          as: 'চামৰাৰ জেকেট',
          bn: 'চামড়ার জ্যাকেট',
          hi: 'लेदर जैकेट',
          mni: 'Leather Jacket',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'attire-3',
    name: {
      en: 'Manipuri Phanek & Enaphi',
      as: 'মণিপুৰী ফনেক আৰু এনাফী',
      bn: 'মণিপুরী ফনেক ও এনাফি',
      hi: 'मणिपुरी फनेक व एनाफी पोशाक',
      mni: 'Manipuri Phanek & Enaphi',
    },
    region: {
      en: 'Manipur',
      as: 'মণিপুৰ',
      bn: 'মণিপুর',
      hi: 'मणिपुर',
      mni: 'Manipur',
    },
    question: {
      en: 'Which graceful striped handwoven skirt cloth with intricate lotus borders is worn by women during temple prayers?',
      as: 'পদুম ফুল আৰু চানেকিৰে বোৱা কোনটো সুন্দৰ মণিপুৰী পৰম্পৰাগত সাজ মহিলাই পিন্ধে?',
      bn: 'পদ্মফুলের সুন্দর পাড়যুক্ত মনোরম রেখাবহুল ঐতিহ্যবাহী মণিপুরী পোশাক কোনটি?',
      hi: 'कमल के सुंदर बॉर्डर वाली कौन सी पारंपरिक मणिपुरी पोशाक महिलाएं पूजा-त्योहारों में पहनती हैं?',
      mni: 'Laisangda shetpa fajaba Meitei nupigi phanek ashi karino?',
    },
    description: {
      en: 'The Phanek is woven on traditional loin looms with delicate lotus and water ripple patterns that reflect the sacred beauty of Loktak Lake.',
      as: 'ফনেকৰ ফুলবোৰত লোকটক হ্ৰদৰ পদুম আৰু পানীৰ ঢৌৰ প্ৰভাৱ দেখা যায়, যিয়ে মণিপুৰী নাৰীৰ শ্ৰদ্ধা প্ৰকাশ কৰে।',
      bn: 'ফনেকের নকশায় লোকটাক হ্রদের পদ্ম ও শান্ত ঢেউয়ের আবহ প্রতিফলিত হয়, যা অত্যন্ত মার্জিত ও সুন্দর।',
      hi: 'फनेक की बुनाई में लोकटक झील के कमल और जलतरंगों की सुंदरता झलकती है।',
      mni: 'Phanek ashi Loktak patki thambal matouk oina fajana weavetouwe.',
    },
    culturalFact: {
      en: 'Worn with great grace during Ras Leela dances and celebratory family gatherings.',
      as: 'মণিপুৰী ৰাসলীলা আৰু পৰিয়ালৰ মাঙ্গলিক অনুষ্ঠানত অতি মৰমেৰে পিন্ধা হয়।',
      bn: 'মণিপুরী রাসলীলা ও পারিবারিক উৎসবে পরম শ্রদ্ধায় এই পোশাক পরা হয়।',
      hi: 'मणिपुरी रासलीला और पारिवारिक उत्सवों में इसे बड़े आदर के साथ पहना जाता है।',
      mni: 'Ras Leelada shetpa fajaba nupigi traditional phi.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Manipuri Phanek',
          as: 'মণিপুৰী ফনেক',
          bn: 'মণিপুরী ফনেক',
          hi: 'पारंपरिक मणिपुरी फनेक',
          mni: 'Manipuri Phanek',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Denim Jeans',
          as: 'ডেনিম জিন্স',
          bn: 'জিন্স প্যান্ট',
          hi: 'डेनिम जीन्स',
          mni: 'Denim Jeans',
        },
        isMatch: false,
      },
    ],
  },
  {
    id: 'attire-4',
    name: {
      en: 'Assamese White & Red Gamusa',
      as: 'অসমীয়া মৰমৰ গামোচা',
      bn: 'আসামের শ্রদ্ধার গামোছা',
      hi: 'असमिया सम्मान का गमोसा',
      mni: 'Assamgi Gamusa',
    },
    region: {
      en: 'Assam',
      as: 'অসম',
      bn: 'আসাম',
      hi: 'असम',
      mni: 'Assam',
    },
    question: {
      en: 'Which iconic white cloth with woven red floral borders is presented with bowed hands to welcome guests and honor elders?',
      as: 'বগা কাপোৰত ৰঙা ফুলৰ চানেকিৰে বোৱা, জ্যেষ্ঠজনক ভক্তিভৰে সেৱা জনাই আগবঢ়োৱা কাপোৰখন কি?',
      bn: 'সাদা কাপড়ে লাল ফুলের সুন্দর নকশায় বোনা, গুরুজন ও অতিথিকে শ্রদ্ধার সাথে উপহার দেওয়া বস্ত্র কোনটি?',
      hi: 'सफेद कपड़े पर लाल फूलों की सुंदर बुनाई वाला अंगवस्त्र, जो बड़ों के आदर और अतिथियों के स्वागत में दिया जाता है?',
      mni: 'Ahanbasingda ikai khumnabagi katchaba white & red phi kari koubage?',
    },
    description: {
      en: 'The Gamusa represents love, reverence, and North-East hospitality. Receiving a freshly handwoven Phulam Gamusa brings instant warmth to the heart.',
      as: 'গামোচা হ’ল মৰম আৰু শ্ৰদ্ধাৰ প্ৰতীক। হস্ততাঁতৰ ফুলাম গামোচাখন হাতত ল’লে হৃদয় মৰমেৰে উপচি পৰে।',
      bn: 'গামোছা হলো ভালোবাসা ও শ্রদ্ধার প্রতীক। নিজের ঘরের তাঁতে বোনা ফুলাম গামোছা আন্তরিকতার সেরা উপহার।',
      hi: 'गमोसा प्रेम और सम्मान का प्रतीक है। अपने हाथों से बुना गमोसा भेंट करना असीम आत्मीयता का भाव जगाता है।',
      mni: 'Gamusa ashi nungcba amasung ikai khumnabagi fajaba machakni.',
    },
    culturalFact: {
      en: 'Awarded the Geographical Indication (GI) tag, symbolizing the heart and soul of Assamese craftsmanship.',
      as: 'অসমীয়া সমাজৰ আয়ুসৰেখা, জিআই টেগ প্ৰাপ্ত এই গামোচাই সকলোকে একতাৰ ডোলেৰে বান্ধে।',
      bn: 'আসামের হৃদস্পন্দন স্বরূপ এই গামোছা সকলের মাঝে শ্রদ্ধা ও স্নেহের বাঁধন রচনা করে।',
      hi: 'असम की आत्मा माना जाने वाला गमोसा हर शुभ अवसर पर सम्मान स्वरूप भेंट किया जाता है।',
      mni: 'Assamgi yamna maru oiba cultural phi.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        id: 'opt-1',
        label: {
          en: 'Assamese Phulam Gamusa',
          as: 'ফুলাম গামোচা',
          bn: 'ফুলাম গামোছা',
          hi: 'पारंपरिक फूलां गमोसा',
          mni: 'Phulam Gamusa',
        },
        isMatch: true,
      },
      {
        id: 'opt-2',
        label: {
          en: 'Paper Napkin',
          as: 'কাগজৰ ৰুমাল',
          bn: 'কাগজের ন্যাপকিন',
          hi: 'कागज़ का नैपकिन',
          mni: 'Paper Napkin',
        },
        isMatch: false,
      },
    ],
  },
];

export const PatternWeave: React.FC<PatternWeaveProps> = ({
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

  const currentItem = TRADITIONAL_ATTIRES[currentIndex % TRADITIONAL_ATTIRES.length] || TRADITIONAL_ATTIRES[0];

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    const chosen = currentItem.options.find((o) => o.id === optionId);

    if (chosen?.isMatch) {
      playSound('success');
      setIsRevealed(true);
    } else {
      playSound('click');
      const target = currentItem.options.find((o) => o.isMatch);
      if (target) setSoftHintId(target.id);
      setTimeout(() => {
        setIsRevealed(true);
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= TRADITIONAL_ATTIRES.length) {
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

  const readAloudText = `${currentItem.question[language] || currentItem.question.en}. ${currentItem.description[language] || currentItem.description.en}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 font-sans">
      {/* Unified Calm Header */}
      <CommonGameHeader
        language={language}
        title={t('patternWeaveTitle', language)}
        subtitle={language === 'as' ? 'পৰম্পৰাগত সাজপাৰ আৰু সোণালী হস্ততাঁত' : language === 'bn' ? 'ঐতিহ্যবাহী পোশাক ও তাঁত শিল্পের আনন্দ' : language === 'hi' ? 'पारंपरिक हथकरघा बुनाई व सुंदर वस्त्र' : 'Traditional Attire & Handloom Reminiscence'}
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
              {currentItem.question[language] || currentItem.question.en}
            </h2>
            <p className="text-xs sm:text-sm text-[#3e4941] font-medium">
              {language === 'as'
                ? 'পৰম্পৰাগত হস্ততাঁতৰ চিনাকি কাপোৰখন বাছক।'
                : language === 'bn'
                ? 'ঐতিহ্যবাহী হস্তচালিত তাঁতের পরিচিত বস্ত্রটি বেছে নিন।'
                : language === 'hi'
                ? 'हथकरघे पर बुने जाने वाले परिचित वस्त्र को चुनें।'
                : 'Choose the familiar handwoven attire below.'}
            </p>
          </div>

          {/* Large Texture/Cloth Photograph */}
          <div className="relative mx-auto max-w-md h-64 sm:h-72 rounded-3xl overflow-hidden shadow-lg border-3 border-[#becabf]/60 bg-[#f7faf5]">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.name[language] || currentItem.name.en}
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />
          </div>

          {/* Tactile Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentItem.options.map((opt) => {
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

          {/* Revealed Cultural Fact & Story */}
          {isRevealed && (
            <div className="pt-3 space-y-4 animate-in fade-in duration-500">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#bfebba]/25 border border-[#416740]/30 text-xs sm:text-sm text-[#032517] leading-relaxed space-y-2">
                <div className="font-bold text-[#032517]">
                  🧶 {currentItem.name[language] || currentItem.name.en}
                </div>
                <p className="text-[#3e4941]">
                  {currentItem.description[language] || currentItem.description.en}
                </p>
                <div className="pt-2 border-t border-[#416740]/20 text-xs italic text-[#032517] flex items-start gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#416740] shrink-0 mt-0.5" />
                  <span>{currentItem.culturalFact[language] || currentItem.culturalFact.en}</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-base shadow-md transition-transform active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{t('exploreAnotherAttire', language)}</span>
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
            🧶
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
              {t('sessionCompleteMessage', language)}
            </h2>
            <p className="text-sm text-[#3e4941] font-medium max-w-md mx-auto leading-relaxed">
              {language === 'as'
                ? 'আজিৰ সকলো পৰম্পৰাগত সাজপাৰৰ স্মৃতি সুন্দৰভাৱে উপভোগ কৰা হ’ল।'
                : language === 'bn'
                ? 'আজকের সকল ঐতিহ্যবাহী পোশাকের স্মৃতি আমরা একসাথে উপভোগ করলাম।'
                : language === 'hi'
                ? 'आज के सभी पारंपरिक वस्त्रों की यादें हमने साथ मिलकर देखीं।'
                : 'All traditional handlooms and cherished textile memories were explored together.'}
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
              {t('exploreAnotherAttire', language)}
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

export default PatternWeave;

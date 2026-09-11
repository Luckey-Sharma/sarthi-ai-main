import React from 'react';
import { PatientHealthRecord } from '../../types/healthCompanion';
import { Language, AppView, GameId } from '../../types';
import {
  Utensils,
  Footprints,
  Droplet,
  Brain,
  Moon,
  Pill,
  Heart,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface RecommendedForYouTodayProps {
  patient: PatientHealthRecord;
  language: Language;
  onNavigate: (view: AppView, gameId?: GameId) => void;
  onOpenAISaathiWithQuery: (query: string) => void;
}

export const RecommendedForYouToday: React.FC<RecommendedForYouTodayProps> = ({
  patient,
  language,
  onNavigate,
  onOpenAISaathiWithQuery,
}) => {
  const vitals = patient.vitalsHistory?.[0];
  const steps = vitals?.steps || 1420;
  const sleepHours = vitals?.sleepHours || 6.3;
  const isPoorSleep = vitals?.sleepQuality === 'poor' || sleepHours < 5.5;
  const isLowSteps = steps < 2500;
  const isVeg = patient.dietPreference === 'vegetarian';

  const recTexts: Record<string, Record<Language, string>> = {
    headerTitle: {
      en: 'Recommended for You Today',
      hi: 'आज आपके लिए अनुशंसित',
      as: 'আজি আপোনাৰ বাবে পৰামৰ্শ',
      bn: 'আজ আপনার জন্য সুপারিশকৃত',
      mni: 'ঙসি নহাক্কীদমক খনবশিং',
    },
    headerSubtitle: {
      en: 'Personalized health actions derived from your 7-day vitals, diet, and sleep data.',
      hi: 'आपके 7 दिनों के स्वास्थ्य, आहार और नींद के आधार पर तैयार सुझाव।',
      as: 'আপোনাৰ ৭ দিনৰ স্বাস্থ্য, খাদ্য আৰু টোপনিৰ ওপৰত ভিত্তি কৰি প্ৰস্তুত।',
      bn: 'আপনার ৭ দিনের স্বাস্থ্য, খাদ্য ও ঘুমের তথ্যের ওপর ভিত্তি করে নির্ধারিত।',
      mni: 'নহাক্কী নুমিৎ ৭ গী হকশেল, চীঞ্জাক অমসুং তুম্বগী মতুং ইন্না শেমবা।',
    },
    askCustom: {
      en: 'Ask Custom Question',
      hi: 'प्रश्न पूछें',
      as: 'প্ৰশ্ন সোধক',
      bn: 'প্রশ্ন জিজ্ঞাসা করুন',
      mni: 'ৱাহং হংবীয়ু',
    },
    openActivity: {
      en: 'Open Activity',
      hi: 'गतिविधि खोलें',
      as: 'কাৰ্যসূচী খোলক',
      bn: 'কার্যক্রম খুলুন',
      mni: 'থবক হাংদোকউ',
    },
    askAISaathi: {
      en: 'Ask AI Saathi',
      hi: 'एआई साथी से पूछें',
      as: 'এআই সাৰথীক সোধক',
      bn: 'এআই সারথীকে জিজ্ঞাসা করুন',
      mni: 'AI সাথীদা হংঙু',
    },
    tagBreakfast: {
      en: 'Breakfast',
      hi: 'नाश्ता',
      as: 'জলপান',
      bn: 'সকালের নাস্তা',
      mni: 'অয়ূক্কী চাক',
    },
    tagHydration: {
      en: 'Hydration',
      hi: 'जल सेवन',
      as: 'পানী',
      bn: 'পানি পান',
      mni: 'ঈশিং থকপা',
    },
    tagActivity: {
      en: 'Activity',
      hi: 'सक्रियता',
      as: 'সক্ৰিয়তা',
      bn: 'শারীরিক সক্রিয়তা',
      mni: 'থবক',
    },
    tagBrainHealth: {
      en: 'Brain Health',
      hi: 'मानसिक स्वास्थ्य',
      as: 'মগজুৰ স্বাস্থ্য',
      bn: 'মস্তিষ্কের যত্ন',
      mni: 'ৱাখলগী হকশেল',
    },
    tagLunch: {
      en: 'Lunch',
      hi: 'दोपहर का भोजन',
      as: 'দুপৰীয়াৰ আহাৰ',
      bn: 'দুপুরের খাবার',
      mni: 'নুংথিলগী চাক',
    },
    tagRest: {
      en: 'Rest',
      hi: 'विश्राम',
      as: 'বিশ্ৰাম',
      bn: 'বিশ্রাম',
      mni: 'পোথারবা',
    },
    tagMedicine: {
      en: 'Medicine',
      hi: 'दवा',
      as: 'ঔষধ',
      bn: 'ওষুধ',
      mni: 'হিদাক',
    },
    tagConnection: {
      en: 'Connection',
      hi: 'परिवार व स्नेह',
      as: 'পৰিয়ালৰ সংযোগ',
      bn: 'পারিবারিক বন্ধন',
      mni: 'ইমুংগী নুংশিবা',
    },
  };

  const cards = [
    {
      id: 'rec-breakfast',
      title: isVeg
        ? (language === 'hi' ? 'सब्जियों वाला पोहा + दही' : language === 'as' ? 'শাক-পাচলিৰ পুৱাৰ লঘু জলপান' : language === 'bn' ? 'সবজি দেওয়া চিঁড়ে + দই' : language === 'mni' ? 'হৱাই-চেং শাবা পোথা' : 'Vegetable Poha + Curd')
        : (language === 'hi' ? 'उबली मछली और हरी सब्जियां' : language === 'as' ? 'ভাপত দিয়া মাছ আৰু সেউজীয়া শাক' : language === 'bn' ? 'ভাপা মাছ ও সবুজ শাকসবজি' : language === 'mni' ? 'ঙা ঙানবা অমসুং হৌদোং মানা' : 'Steamed Fish & Green Vegetables'),
      subtitle: isVeg
        ? (language === 'hi' ? 'पाचन के लिए उत्तम प्रोटीन और पौष्टिक आहार' : language === 'as' ? 'হজমত সহায়ক পুষ্টিকৰ খাদ্য' : language === 'bn' ? 'সহজে হজমযোগ্য সুস্বাদু পুষ্টিকর খাবার' : language === 'mni' ? 'হকচাংগী কান্নবা চীঞ্জাক' : 'Light vegetarian carbs + digestion-friendly protein')
        : (language === 'hi' ? 'वरिष्ठ नागरिकों के लिए उच्च प्रोटीन युक्त पोषण' : language === 'as' ? 'জ্যেষ্ঠসকলৰ বাবে উপযোগী প্ৰটিনযুক্ত খাদ্য' : language === 'bn' ? 'বয়োজ্যেষ্ঠদের উপযোগী স্বাস্থ্যকর পুষ্টি' : language === 'mni' ? 'অহলশিংগী অফবা চীঞ্জাক' : 'High-protein, low-glycemic senior nutrition'),
      tag: recTexts.tagBreakfast[language] || recTexts.tagBreakfast.en,
      icon: <Utensils className="w-5 h-5 text-[#365A46]" />,
      bgColor: '#E6EDE2', // Mint
      tagColor: 'bg-[#FBF7EF] text-[#365A46]',
      query: 'What should I eat for breakfast today?',
    },
    {
      id: 'rec-hydration',
      title: `${vitals?.waterGlasses || 4} / 8 ` + (language === 'hi' ? 'गिलास पानी पिया' : language === 'as' ? 'গিলাচ পানী খোৱা হ’ল' : language === 'bn' ? 'গ্লাস পানি সম্পন্ন' : language === 'mni' ? 'গ্লাস ঈশিং থকখ্রে' : 'of 8 Glasses Logged'),
      subtitle: language === 'hi' ? 'सुबह की गतिविधि से पहले 1 गिलास ताजा पानी पिएं' : language === 'as' ? 'পুৱাৰ কাম আৰম্ভ কৰাৰ আগতে এগিলাচ পানী খাওক' : language === 'bn' ? 'সকালের কার্যক্রমের আগে ১ গ্লাস তাজা পানি পান করুন' : language === 'mni' ? 'অয়ূক্কী থবক হৌদ্রিঙৈদা ঈশিং গ্লাস ১ থক্কদবনি' : 'Drink 1 fresh glass before your morning activity',
      tag: recTexts.tagHydration[language] || recTexts.tagHydration.en,
      icon: <Droplet className="w-5 h-5 text-[#4D7C94]" />,
      bgColor: '#EEF4FF', // Soft Blue
      tagColor: 'bg-[#FBF7EF] text-[#4D7C94]',
      query: 'How much water should I drink today?',
    },
    {
      id: 'rec-activity',
      title: isPoorSleep
        ? (language === 'hi' ? 'हल्का प्राणायाम और खिंचाव' : language === 'as' ? 'আসন আৰু লঘু ব্যায়াম' : language === 'bn' ? 'বসে মৃদু প্রাণায়াম ও স্ট্রেচ' : language === 'mni' ? 'তপ্না থা লৌবা অমসুং হকচাং শোকপা' : 'Gentle Seated Breathing & Arm Stretches')
        : (language === 'hi' ? '15 मिनट बगीचे में टहलें' : language === 'as' ? '১৫ মিনিট ফুলনিত খোজকাঢ়ক' : language === 'bn' ? '১৫ মিনিট বাগানে মৃদু পায়চারি' : language === 'mni' ? 'মিনিট ১৫ লৈবাকোলদা খরা চৎপা' : '15-Minute Garden Stroll'),
      subtitle: isPoorSleep
        ? (language === 'hi' ? 'कम नींद के बाद हल्का व्यायाम अनुशंसित' : language === 'as' ? 'টোপনি কম হোৱা বাবে লঘু ব্যায়াম উত্তম' : language === 'bn' ? 'কম ঘুমের পর হালকা ব্যায়াম উপযোগী' : language === 'mni' ? 'তুম্বা ৱাৎপনা তপ্না থবক তৌবা ফৈ' : 'Low exertion recommended after 4.8h sleep')
        : (language === 'hi' ? `${steps.toLocaleString()} कदम आज; रक्तचाप के लिए सुरक्षित` : language === 'as' ? `আজি ${steps.toLocaleString()} খোজ; ৰক্তচাপৰ বাবে অনুকূল` : language === 'bn' ? `আজ ${steps.toLocaleString()} পদক্ষেপ; রক্তচাপের জন্য নিরাপদ` : language === 'mni' ? `ঙসি খোংথাং ${steps.toLocaleString()}; ঈগী খোংজেলদা অফবা` : `${steps.toLocaleString()} steps today; safe for blood pressure`),
      tag: recTexts.tagActivity[language] || recTexts.tagActivity.en,
      icon: <Footprints className="w-5 h-5 text-[#9A662C]" />,
      bgColor: '#F3E8D6', // Soft Sand
      tagColor: 'bg-[#FBF7EF] text-[#9A662C]',
      query: 'Can I go for a walk today?',
    },
    {
      id: 'rec-game',
      title: language === 'hi' ? 'मेमोरी मैच (स्तर 2)' : language === 'as' ? 'স্মৃতি খেল (স্তৰ ২)' : language === 'bn' ? 'স্মৃতি মেলানো (লেভেল ২)' : language === 'mni' ? 'মেমোরী ম্যাচ (থাক ২)' : 'Memory Match (Level 2)',
      subtitle: language === 'hi' ? 'स्मृति और ध्यान क्षमता को बढ़ावा देता है' : language === 'as' ? 'মনত পেলোৱা আৰু একাগ্ৰতা বৃদ্ধি কৰে' : language === 'bn' ? 'মনোযোগ ও দৃশ্যভিত্তিক স্মৃতিশক্তি বৃদ্ধি করে' : language === 'mni' ? 'ৱাখল লমজিংবা অমসুং নিংশিংবা ফগৎহল্লি' : 'Stimulates visual-spatial recall and focus',
      tag: recTexts.tagBrainHealth[language] || recTexts.tagBrainHealth.en,
      icon: <Brain className="w-5 h-5 text-[#6B618F]" />,
      bgColor: '#EDE7F4', // Lavender
      tagColor: 'bg-[#FBF7EF] text-[#6B618F]',
      action: () => onNavigate('games', 'memory_match'),
    },
    {
      id: 'rec-lunch',
      title: isVeg
        ? (language === 'hi' ? 'मूंग दाल खिचड़ी + लौकी' : language === 'as' ? 'মুগ দাইলৰ খিচিৰি আৰু লাও' : language === 'bn' ? 'মুগ ডালের নরম খিচুড়ি + লাউ' : language === 'mni' ? 'হৱাই খিচড়ি অমসুং খোবাং খাগী' : 'Moong Dal Khichdi + Lauki Sabzi')
        : (language === 'hi' ? 'हल्की मछली की झोल और जोहा चावल' : language === 'as' ? 'জহা চাউলৰ ভাত আৰু পাতল মাছৰ জোল' : language === 'bn' ? 'জোহা চালের ভাত ও হালকা মাছের ঝোল' : language === 'mni' ? 'জোহা চেংগী চাক অমসুং ঙাগী মখাপ' : 'Light Fish Broth with Joha Rice'),
      subtitle: language === 'hi' ? 'पाचन में आसान, रक्तचाप के अनुकूल कम नमक' : language === 'as' ? 'সহজে হজম হোৱা, ৰক্তচাপৰ বাবে কম নিমখ' : language === 'bn' ? 'হজমে সহজ ও রক্তচাপ নিয়ন্ত্রণে কম লবণযুক্ত' : language === 'mni' ? 'হকচাংগী নুংঙাইবা অমসুং থুম য়ামদবা' : 'Gentle on stomach, low added salt for blood pressure',
      tag: recTexts.tagLunch[language] || recTexts.tagLunch.en,
      icon: <Utensils className="w-5 h-5 text-[#4A6E59]" />,
      bgColor: '#EAF0E4', // Sage
      tagColor: 'bg-[#FBF7EF] text-[#4A6E59]',
      query: 'What should I eat for lunch today?',
    },
    {
      id: 'rec-rest',
      title: isPoorSleep
        ? (language === 'hi' ? '30 मिनट का विश्राम' : language === 'as' ? '৩০ মিনিট চকু মুদি জিৰণি' : language === 'bn' ? '৩০ মিনিট চোখ বুজে বিশ্রাম' : language === 'mni' ? 'মিনিট ৩০ তপ্না পোথারবা' : '30-Minute Restful Eye-Rest')
        : (language === 'hi' ? '20 मिनट शांतिदायक प्राकृतिक ध्वनि' : language === 'as' ? '২০ মিনিট প্ৰশান্তিৰ সংগীত' : language === 'bn' ? '২০ মিনিট শান্ত প্রাকৃতিক সুর' : language === 'mni' ? 'মিনিট ২০ মহৌশাগী শান্তীগী ঈশৈ' : '20-Minute Calming Sound Session'),
      subtitle: language === 'hi' ? 'तनाव कम करने और मन को शांति देने में सहायक' : language === 'as' ? 'মানসিক চাপ হ্ৰাস কৰি শান্তি প্ৰদান কৰে' : language === 'bn' ? 'মানসিক চাপ হ্রাস এবং প্রশান্তিতে সহায়ক' : language === 'mni' ? 'ৱাখলগী অশোকপা হন্থহনবা অমসুং শান্তী পীবা' : 'Supports glymphatic recovery and stress reduction',
      tag: recTexts.tagRest[language] || recTexts.tagRest.en,
      icon: <Moon className="w-5 h-5 text-[#52745C]" />,
      bgColor: '#F3EADD', // Cream
      tagColor: 'bg-[#FBF7EF] text-[#52745C]',
      action: () => onNavigate('calming'),
    },
    {
      id: 'rec-meds',
      title: language === 'hi' ? 'डोनिपेज़िल (5mg) रात 09:00 बजे' : language === 'as' ? 'ডনেপেজিল (৫mg) ৰাতি ০৯:০০ বজাত' : language === 'bn' ? 'ডনেপেজিল (৫mg) রাত ০৯:০০ টায়' : language === 'mni' ? 'Donepezil (5mg) নুমিদাংগী ৯:০০ বজরদা' : 'Donepezil (5mg) at 09:00 PM',
      subtitle: language === 'hi' ? 'रात की स्मरण शक्ति सहायता • सुबह की दवा पूर्ण' : language === 'as' ? 'ৰাতিৰ স্মৃতি সহায়ক • পুৱাৰ ঔষধ সম্পূৰ্ণ' : language === 'bn' ? 'স্মৃতি সহায়ক • সকালের ওষুধ গ্রহণ সম্পন্ন' : language === 'mni' ? 'নুমিদাংগী নিংশিংবা মতেং • অয়ূক্কী হিদাক চারে' : 'Bedtime memory support • Morning Telmisartan taken',
      tag: recTexts.tagMedicine[language] || recTexts.tagMedicine.en,
      icon: <Pill className="w-5 h-5 text-[#B65D5D]" />,
      bgColor: '#FDE8E5', // Soft Rose
      tagColor: 'bg-[#FBF7EF] text-[#BA1A1A]',
      action: () => onNavigate('reminders'),
    },
    {
      id: 'rec-social',
      title: language === 'hi' ? 'अनन्या के साथ पारिवारिक यादें' : language === 'as' ? 'অনন্যাৰ সৈতে পৰিয়ালৰ স্মৃতি' : language === 'bn' ? 'অনন্যার সাথে পারিবারিক স্মৃতি' : language === 'mni' ? 'অনন্যাগা লোয়ননা ইমুংগী নিংশিংবা' : 'Family Recall with Ananya',
      subtitle: language === 'hi' ? 'बचपन की तस्वीरें और झील की सैर को याद करें' : language === 'as' ? 'শৈশৱৰ ফটো আৰু পুৰণি দিনৰ স্মৃতি' : language === 'bn' ? 'শৈশবের ছবি ও পুরোনো স্মৃতির অ্যালবাম' : language === 'mni' ? 'অঙাং ওইরিঙৈগী ফোতো অমসুং নিংশিংবশিং' : 'Review childhood photos and lake bicycle memory',
      tag: recTexts.tagConnection[language] || recTexts.tagConnection.en,
      icon: <Heart className="w-5 h-5 text-[#9A662C]" />,
      bgColor: '#FAF5EB', // Parchment
      tagColor: 'bg-[#FBF7EF] text-[#9A662C]',
      action: () => onNavigate('family'),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#365A46] shadow-xs"
            style={{ backgroundColor: '#E4EBDD' }}
          >
            <Sparkles className="w-4 h-4 text-[#52745C]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1F342A]">
              {recTexts.headerTitle[language] || recTexts.headerTitle.en}
            </h3>
            <p className="text-xs text-[#68736B]">
              {recTexts.headerSubtitle[language] || recTexts.headerSubtitle.en}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAISaathiWithQuery('What activity should I do today?')}
          className="text-xs font-semibold text-[#52745C] hover:text-[#365A46] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{recTexts.askCustom[language] || recTexts.askCustom.en}</span>
          <span>→</span>
        </button>
      </div>

      {/* Grid of Pastel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card) => {
          const handleClick = () => {
            if (card.action) {
              card.action();
            } else if (card.query) {
              onOpenAISaathiWithQuery(card.query);
            }
          };

          return (
            <div
              key={card.id}
              onClick={handleClick}
              className="group rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm"
              style={{ backgroundColor: card.bgColor }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FBF7EF] border border-[rgba(70,80,60,0.08)] shadow-2xs group-hover:scale-105 transition-transform"
                  >
                    {card.icon}
                  </div>
                  <span
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full border border-[rgba(70,80,60,0.08)] ${card.tagColor}`}
                  >
                    {card.tag}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-sm text-[#1F342A] mb-1 leading-snug">
                  {card.title}
                </h4>
                <p className="text-[11px] text-[#68736B] leading-relaxed">
                  {card.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-semibold text-[#365A46] border-t border-[rgba(70,80,60,0.06)]">
                <span>
                  {card.action
                    ? (recTexts.openActivity[language] || recTexts.openActivity.en)
                    : (recTexts.askAISaathi[language] || recTexts.askAISaathi.en)}
                </span>
                <span className="w-5 h-5 rounded-full bg-[#FBF7EF] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52745C]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedForYouToday;

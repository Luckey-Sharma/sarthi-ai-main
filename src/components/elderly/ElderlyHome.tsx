import React from 'react';
import { Language, PatientProfile, AppView, CognitiveSession, GameId } from '../../types';
import { ShieldAlert, Volume2, Droplet, ArrowRight, Play, Heart, Sparkles, Brain, Image, Calendar, Mic } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { DailyAISummaryCard } from '../sarthi/DailyAISummaryCard';
import { RecommendedForYouToday } from '../sarthi/RecommendedForYouToday';
import { patientContextEngine } from '../../services/patientContextEngine';
import { speak, stopSpeaking } from '../../services/voiceService';

interface ElderlyHomeProps {
  language: Language;
  patient: PatientProfile;
  sessions: CognitiveSession[];
  hydrationGlasses: number;
  onNavigate: (view: AppView, gameId?: GameId) => void;
  onOpenSOS: () => void;
  onOpenSarthiModal: () => void;
  onOpenAISaathi?: (initialQuery?: string) => void;
}

export const ElderlyHome: React.FC<ElderlyHomeProps> = ({
  language,
  patient,
  sessions,
  hydrationGlasses,
  onNavigate,
  onOpenSOS,
  onOpenSarthiModal,
  onOpenAISaathi,
}) => {
  const { t } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12
      ? t('elderlyHome.greetingMorning')
      : hour < 17
      ? t('elderlyHome.greetingAfternoon')
      : hour < 21
      ? t('elderlyHome.greetingEvening')
      : t('elderlyHome.greetingNight');
    return `${timeGreeting}, ${patient.name}!`;
  };

  const handleSpeakGreeting = () => {
    stopSpeaking();
    const text = `${getGreeting()}. ${t('elderlyHome.welcomeSubtitle')}`;
    speak(text, language);
  };

  const handleLaunchAISaathi = (query?: string) => {
    if (onOpenAISaathi) {
      onOpenAISaathi(query);
    } else {
      onOpenSarthiModal();
    }
  };

  const homeTexts: Record<string, Record<Language, string>> = {
    heroTag: {
      en: 'CARE TODAY FOR A BRIGHTER TOMORROW',
      hi: 'एक बेहतर कल के लिए आज से देखभाल',
      as: 'উজ্জ্বল ভৱিষ্যতৰ বাবে আজিৰ যত্ন',
      bn: 'উজ্জ্বল ভবিষ্যতের জন্য আজকের যত্ন',
      mni: 'হেন্না ফবা অকনবগীদমক ঙসি যত্ন লৌরসি',
    },
    heroTitle1: {
      en: 'Good Health',
      hi: 'उत्तम स्वास्थ्य',
      as: 'উত্তম স্বাস্থ্য',
      bn: 'উত্তম স্বাস্থ্য',
      mni: 'অফবা হকশেল',
    },
    heroTitle2: {
      en: 'Brighter Tomorrows',
      hi: 'उज्ज्वल कल',
      as: 'সুন্দৰ কাইলৈ',
      bn: 'সুন্দর আগামী',
      mni: 'নুংঙাইরবা কন্দললোই',
    },
    heroScript1: {
      en: 'Healthy Mind',
      hi: 'स्वस्थ मन',
      as: 'সুস্থ মন',
      bn: 'সুস্থ মন',
      mni: 'হিংগৎলবা ৱাখল',
    },
    heroScript2: {
      en: 'Happy Life 🌱',
      hi: 'सुखी जीवन 🌱',
      as: 'সুখী জীৱন 🌱',
      bn: 'সুখী জীবন 🌱',
      mni: 'নুংঙাইরবা পুন্সি 🌱',
    },
    heroDescription: {
      en: 'Personalized cognitive care for a healthier, happier life — inspired by the culture and beauty of North East India.',
      hi: 'स्वस्थ और खुशहाल जीवन के लिए व्यक्तिगत मानसिक देखभाल — पूर्वोत्तर भारत की संस्कृति और सौंदर्य से प्रेरित।',
      as: 'এটি সুস্থ আৰু সুখী জীৱনৰ বাবে বিশেষ যত্ন — উত্তৰ-পূব ভাৰতৰ সংস্কৃতি আৰু সৌন্দৰ্যৰে অনুপ্ৰাণিত।',
      bn: 'একটি স্বাস্থ্যকর ও সুখী জীবনের জন্য ব্যক্তিগত মানসিক যত্ন — উত্তর-পূর্ব ভারতের ঐতিহ্য ও সৌন্দর্যে অনুপ্রাণিত।',
      mni: 'অফবা অমসুং নুংঙাইরবা পুন্সিগীদমক অখন্নবা ৱাখলগী যত্ন — নোংপোক ভারতকী নাৎ অমসুং মহৌশাগী ফজরবগা লোয়ননা।',
    },
    startTodayActivities: {
      en: "Start Today's Activities",
      hi: 'आज की गतिविधियाँ शुरू करें',
      as: 'আজিৰ কাৰ্যসূচী আৰম্ভ কৰক',
      bn: 'আজকের কার্যক্রম শুরু করুন',
      mni: 'ঙসিগী থবকশিং হৌরো',
    },
    talkToAISaathi: {
      en: 'Talk to AI Saathi',
      hi: 'एआई साथी से बात करें',
      as: 'এআই সাৰথীৰ সৈতে কথা পাতক',
      bn: 'এআই সারথীর সাথে কথা বলুন',
      mni: 'AI সাথীগা ৱারী শানৌ',
    },
    northEastBadge: {
      en: 'North East India • Our Roots, Our Strength',
      hi: 'पूर्वोत्तर भारत • हमारी जड़ें, हमारी शक्ति',
      as: 'উত্তৰ-পূব ভাৰত • আমাৰ শিপা, আমাৰ শক্তি',
      bn: 'উত্তর-পূর্ব ভারত • আমাদের শিকড়, আমাদের শক্তি',
      mni: 'নোংপোক ভারত • ঐখোইগী মরম, ঐখোইগী পাঙ্গল',
    },
    // Core cards
    card1Title: {
      en: 'Play & Engage',
      hi: 'खेलें और जुड़ें',
      as: 'খেলক আৰু মনত পেলাওক',
      bn: 'খেলুন ও আনন্দ নিন',
      mni: 'শানো অমসুং পাঙ্গল থৌ',
    },
    card1Subtitle: {
      en: 'Cognitive games designed for your comfort and recall.',
      hi: 'याददाश्त और मानसिक चुस्ती के लिए विशेष खेल।',
      as: 'মনত পেলোৱা আৰু মগজুৰ সজীৱতাৰ বাবে বিশেষ খেল।',
      bn: 'স্মৃতিশক্তি ও মানসিক সতেজতার উপযোগী বিশেষ খেলা।',
      mni: 'নিংশিংবা অমসুং ৱাখল লমজিংনবগীদমক অখন্নবা খেলশিং।',
    },
    card2Title: {
      en: 'My Memories',
      hi: 'मेरी यादें',
      as: 'মোৰ স্মৃতি',
      bn: 'আমার স্মৃতি',
      mni: 'ঐগী নিংশিংবশিং',
    },
    card2Subtitle: {
      en: 'Relive special moments, family photos and familiar places.',
      hi: 'सुंदर पलों, पारिवारिक तस्वीरों और जाने-पहचाने स्थानों को याद करें।',
      as: 'পৰিয়ালৰ ফটো আৰু পুৰণি স্মৃতিবোৰ পুনৰ উপভোগ কৰক।',
      bn: 'পারিবারিক ছবি এবং ফেলে আসা সোনালী স্মৃতি রোমন্থন করুন।',
      mni: 'ইমুংগী ফোতো অমসুং নিংশিংনিঙাই ওইরবা মতমশিং অমুক য়েংবা।',
    },
    card3Title: {
      en: 'My Day',
      hi: 'मेरा दिन',
      as: 'মোৰ দিনটো',
      bn: 'আমার দিন',
      mni: 'ঐগী নুমিৎ',
    },
    card3Subtitle: {
      en: 'Your routine, medicines, hydration and peaceful rest.',
      hi: 'आपकी दिनचर्या, दवाइयाँ, पानी और शांतिपूर्ण विश्राम।',
      as: 'আপোনাৰ দৈনিক ৰুটিন, ঔষধ, পানী আৰু বিশ্ৰাম।',
      bn: 'আপনার দৈনিক রুটিন, ওষুধ, পানি ও শান্তির বিশ্রাম।',
      mni: 'নহাক্কী নুমিৎখুদিংগী থবক, হিদাক, ঈশিং অমসুং পোথারবা।',
    },
    card4Title: {
      en: 'Talk to Me',
      hi: 'मुझसे बात करें',
      as: 'মোৰ সৈতে কথা পাতক',
      bn: 'কথা বলুন',
      mni: 'ঐগা ৱারী শানৌ',
    },
    card4Subtitle: {
      en: "Just speak. I'm here for you anytime with gentle guidance.",
      hi: 'बस बोलिए। मैं हमेशा आपके मार्गदर्शन के लिए यहाँ हूँ।',
      as: 'নিসংকোচে কওক। মই আপোনাক সহায় কৰিবলৈ সদায় সাজু।',
      bn: 'শুধু বলুন। আপনাকে সঙ্গ ও সহায়তা দিতে আমি সবসময় পাশে আছি।',
      mni: 'ৱারী শানবীয়ু। ঐহাক নহাকপু মতেং পাংনবা মতম চুপ্পদা লৈরি।',
    },
    // Discover NE
    discoverNeTitle: {
      en: 'Discover The North East',
      hi: 'पूर्वोत्तर भारत की यात्रा',
      as: 'উত্তৰ-পূবৰ চিনাকী',
      bn: 'উত্তর-পূর্বকে জানুন',
      mni: 'নোংপোক ভারতপু খংমিন্নসি',
    },
    discoverNeSubtitle: {
      en: 'Familiar places. Local culture. Happy memories.',
      hi: 'जाने-पहचाने स्थान। स्थानीय संस्कृति। सुखद स्मृतियाँ।',
      as: 'চিনাকী ঠাই। স্থানীয় সংস্কৃতি। সুন্দৰ স্মৃতি।',
      bn: 'পরিচিত স্থান। স্থানীয় ঐতিহ্য। সুখস্মৃতি।',
      mni: 'মশক খংবা মফমশিং। লমদমগী নাৎ। নুংঙাইরবা নিংশিংবা।',
    },
    exploreRegionalContent: {
      en: 'Explore Regional Content',
      hi: 'क्षेत्रीय धरोहर देखें',
      as: 'আঞ্চলিক সমল চাওক',
      bn: 'আঞ্চলিক বিষয়সমূহ দেখুন',
      mni: 'লমদমগী পোৎশকশিং য়েংঙু',
    },
    // Health tips
    healthTipsHeader: {
      en: 'Health Tips for You',
      hi: 'आपके लिए स्वास्थ्य सुझाव',
      as: 'আপোনাৰ বাবে স্বাস্থ্য পৰামৰ্শ',
      bn: 'আপনার জন্য স্বাস্থ্য পরামর্শ',
      mni: 'নহাক্কীদমক হকশেলগী পাউতাক',
    },
    healthTipsSubheader: {
      en: '— Small steps for a stronger tomorrow.',
      hi: '— एक स्वस्थ कल के लिए छोटे कदम।',
      as: '— সুস্থ ভৱিষ্যতৰ বাবে সৰু সৰু পদক্ষেপ।',
      bn: '— সুন্দর ভবিষ্যতের জন্য ছোট ছোট পদক্ষেপ।',
      mni: '— ফবা কন্দললোইগীদমক অপিকপা খোংথাংশিং।',
    },
    seeAll: {
      en: 'See All',
      hi: 'सभी देखें',
      as: 'সকলো চাওক',
      bn: 'সব দেখুন',
      mni: 'পুম্নমক য়েংঙু',
    },
    tip1Title: {
      en: 'Stay Hydrated',
      hi: 'पर्याप्त पानी पिएं',
      as: 'পানী প্ৰচুৰ খাব',
      bn: 'পরিমিত পানি পান করুন',
      mni: 'ঈশিং নিয়ম্না থক্কদবনি',
    },
    tip1Desc: {
      en: "Drink water regularly even if you don't feel thirsty.",
      hi: 'प्यास न लगने पर भी नियमित अंतराल में पानी पिएं।',
      as: 'পিয়াহ নালাগে যদিও নিয়মীয়াকৈ পানী খাওক।',
      bn: 'তেষ্টা না পেলেও নির্দিষ্ট সময় অন্তর পানি পান করুন।',
      mni: 'ঈশিং তকনিংদবসু মতম মতমদা ঈশিং থক্কদবনি।',
    },
    tip2Title: {
      en: 'Keep Moving',
      hi: 'हल्का टहलें',
      as: 'খোজকাঢ়ক',
      bn: 'হাঁটাহাটি করুন',
      mni: 'খোংনা চৎপীয়ু',
    },
    tip2Desc: {
      en: 'A short walk daily keeps your mind active and steady.',
      hi: 'रोज़ाना थोड़ी सैर मन को सक्रिय और शांत रखती है।',
      as: 'দৈনিক কিছু খোজ কাঢ়িলে মন সতেজ আৰু সুস্থ থাকে।',
      bn: 'প্রতিদিন কিছু সময় হাঁটলে শরীর ও মন সতেজ থাকে।',
      mni: 'নুমিৎখুদিংগী খরা চৎপনা ৱাখলবু হিংগৎহল্লি।',
    },
    tip3Title: {
      en: 'Eat Local',
      hi: 'पौष्टिक भोजन लें',
      as: 'ঘৰুৱা খাদ্য খাওক',
      bn: 'পুষ্টিকর দেশীয় খাবার',
      mni: 'লমদমগী মচিন লৈবা চিন্নাবা',
    },
    tip3Desc: {
      en: 'Choose nutritious, low-sodium traditional foods.',
      hi: 'कम नमक और पौष्टिकता से भरपूर पारंपरिक भोजन चुनें।',
      as: 'কম নিমখযুক্ত আৰু পুষ্টিকৰ পৰম্পৰাগত খাদ্য বাছক।',
      bn: 'কম লবণযুক্ত ও পুষ্টিকর ঐতিহ্যবাহী খাবার গ্রহণ করুন।',
      mni: 'থুম য়াম্না য়াওদবা অমসুং হকচাংদা কান্নবা চীঞ্জাক চাবীয়ু।',
    },
    tip4Title: {
      en: 'Breathe & Relax',
      hi: 'गहरी सांस लें',
      as: 'দীঘল উশাহ লওক',
      bn: 'গভীর শ্বাস নিন',
      mni: 'থা য়াম্না লুনা লৌবীয়ু',
    },
    tip4Desc: {
      en: 'Take deep breaths. It calms your mind and heart.',
      hi: 'लंबी गहरी सांसें लें, यह हृदय और मस्तिष्क को शांति देती हैं।',
      as: 'দীঘল উশাহ লওক, ই আপোনাৰ মন আৰু হৃদযন্ত্ৰ শান্ত কৰে।',
      bn: 'ধীরে ধীরে গভীর শ্বাস নিন, এটি মন ও শরীরকে শান্ত করে।',
      mni: 'নুংশিৎ ফনা লুনা লৌবীয়ু, মসিদা ৱাখলবু শান্তী ওইহল্লি।',
    },
  };

  return (
    <div className="space-y-6 min-w-0" data-purpose="primary-cognitive-feed">
      {/* ─── HERO BANNER ─────────────────────────────────────────────────── */}
      <section
        className="relative rounded-[20px] overflow-hidden min-h-[310px] flex items-center border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
        data-purpose="hero-banner"
        style={{
          background: 'linear-gradient(135deg, #FAF6EE 0%, #F5EEE2 50%, #ECE2D0 100%)',
        }}
      >
        {/* Background Scenic Imagery */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Misty Hills of North East India with Elder in traditional peaceful terrace"
            className="w-full h-full object-cover object-right-center"
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=80"
          />
          <div className="absolute inset-0 hero-mask"></div>
        </div>

        {/* Content Area in Hero */}
        <div className="relative z-10 px-6 sm:px-8 py-7 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block text-[10.5px] font-bold tracking-widest uppercase text-[#52745C]">
              {homeTexts.heroTag[language] || homeTexts.heroTag.en}
            </span>
            <button
              onClick={handleSpeakGreeting}
              className="p-1 text-[#52745C] hover:text-[#365A46] rounded-full transition-colors cursor-pointer"
              title="Listen aloud"
              aria-label="Listen aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1F342A] font-bold tracking-tight leading-[1.15] mb-2">
              {homeTexts.heroTitle1[language] || homeTexts.heroTitle1.en}<br />
              {homeTexts.heroTitle2[language] || homeTexts.heroTitle2.en}
            </h1>
            {/* Script / Handwritten flourish tag */}
            <div className="absolute top-1 right-[-20px] sm:right-[-60px] text-right hidden sm:block pointer-events-none">
              <span className="font-handwriting text-[#52745C] text-lg sm:text-xl font-semibold -rotate-6 block leading-tight">
                {homeTexts.heroScript1[language] || homeTexts.heroScript1.en}<br />
                {homeTexts.heroScript2[language] || homeTexts.heroScript2.en}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#68736B] leading-relaxed max-w-md my-3 font-medium">
            {homeTexts.heroDescription[language] || homeTexts.heroDescription.en}
          </p>

          {/* Hero Call-to-Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('games')}
              className="inline-flex items-center gap-2 text-[#FFFDF7] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer hover:opacity-95"
              style={{
                backgroundColor: '#52745C',
                boxShadow: '0 4px 14px rgba(82, 116, 92, 0.25)',
              }}
            >
              <span>{homeTexts.startTodayActivities[language] || homeTexts.startTodayActivities.en}</span>
              <span>→</span>
            </button>

            <button
              onClick={() => handleLaunchAISaathi()}
              className="inline-flex items-center gap-2 text-[#1F342A] font-medium text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-sm backdrop-blur-sm transition-colors cursor-pointer hover:bg-[#FAF6EE]"
              style={{
                backgroundColor: 'rgba(251, 247, 239, 0.92)',
                border: '1px solid rgba(70, 80, 60, 0.12)',
              }}
            >
              <span
                className="w-5 h-5 rounded-full text-[#365A46] flex items-center justify-center text-[10px]"
                style={{ backgroundColor: '#E4EBDD' }}
              >
                ▶
              </span>
              <span>{homeTexts.talkToAISaathi[language] || homeTexts.talkToAISaathi.en}</span>
            </button>
          </div>
        </div>

        {/* Cultural Micro-Badge Overlay */}
        <div
          className="absolute bottom-4 right-5 z-10 hidden md:flex items-center gap-2 backdrop-blur-md px-3.5 py-1.5 rounded-full"
          style={{
            backgroundColor: 'rgba(251, 247, 239, 0.90)',
            border: '1px solid rgba(70, 80, 60, 0.10)',
            boxShadow: '0 2px 8px rgba(70, 60, 40, 0.05)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#52745C] animate-pulse"></span>
          <span className="text-[11px] font-medium text-[#1F342A] tracking-tight">
            {homeTexts.northEastBadge[language] || homeTexts.northEastBadge.en}
          </span>
        </div>
      </section>

      {/* ─── 4 CORE COGNITIVE ACTIVITY CARDS ─────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="interactive-core-features">
        {/* Card 1: Play & Engage (Mint: #E6EDE2) */}
        <div
          onClick={() => onNavigate('games')}
          className="group rounded-[18px] p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
          style={{
            backgroundColor: '#E6EDE2',
            border: '1px solid rgba(70, 80, 60, 0.08)',
            boxShadow: '0 4px 18px rgba(70, 60, 40, 0.03)',
          }}
        >
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#365A46] shadow-xs mb-3 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: '#FBF7EF', border: '1px solid rgba(70, 80, 60, 0.08)' }}
            >
              <Brain className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-serif font-bold text-[#1F342A] text-base mb-1">
              {homeTexts.card1Title[language] || homeTexts.card1Title.en}
            </h3>
            <p className="text-xs text-[#68736B] leading-relaxed font-normal">
              {homeTexts.card1Subtitle[language] || homeTexts.card1Subtitle.en}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <span
              className="w-7 h-7 rounded-full text-[#1F342A] group-hover:bg-[#52745C] group-hover:text-[#FFFDF7] flex items-center justify-center text-xs transition-all shadow-xs"
              style={{ backgroundColor: '#FBF7EF' }}
            >
              →
            </span>
          </div>
        </div>

        {/* Card 2: My Memories (Warm Cream: #F3EADD) */}
        <div
          onClick={() => onNavigate('family')}
          className="group rounded-[18px] p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
          style={{
            backgroundColor: '#F3EADD',
            border: '1px solid rgba(70, 80, 60, 0.08)',
            boxShadow: '0 4px 18px rgba(70, 60, 40, 0.03)',
          }}
        >
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8C5D30] shadow-xs mb-3 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: '#FBF7EF', border: '1px solid rgba(70, 80, 60, 0.08)' }}
            >
              <Image className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-serif font-bold text-[#1F342A] text-base mb-1">
              {homeTexts.card2Title[language] || homeTexts.card2Title.en}
            </h3>
            <p className="text-xs text-[#68736B] leading-relaxed font-normal">
              {homeTexts.card2Subtitle[language] || homeTexts.card2Subtitle.en}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <span
              className="w-7 h-7 rounded-full text-[#1F342A] group-hover:bg-[#8C5D30] group-hover:text-[#FFFDF7] flex items-center justify-center text-xs transition-all shadow-xs"
              style={{ backgroundColor: '#FBF7EF' }}
            >
              →
            </span>
          </div>
        </div>

        {/* Card 3: My Day (Soft Sand: #F3E8D6) */}
        <div
          onClick={() => onNavigate('reminders')}
          className="group rounded-[18px] p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
          style={{
            backgroundColor: '#F3E8D6',
            border: '1px solid rgba(70, 80, 60, 0.08)',
            boxShadow: '0 4px 18px rgba(70, 60, 40, 0.03)',
          }}
        >
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#52745C] shadow-xs mb-3 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: '#FBF7EF', border: '1px solid rgba(70, 80, 60, 0.08)' }}
            >
              <Calendar className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-serif font-bold text-[#1F342A] text-base mb-1">
              {homeTexts.card3Title[language] || homeTexts.card3Title.en}
            </h3>
            <p className="text-xs text-[#68736B] leading-relaxed font-normal">
              {homeTexts.card3Subtitle[language] || homeTexts.card3Subtitle.en}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <span
              className="w-7 h-7 rounded-full text-[#1F342A] group-hover:bg-[#52745C] group-hover:text-[#FFFDF7] flex items-center justify-center text-xs transition-all shadow-xs"
              style={{ backgroundColor: '#FBF7EF' }}
            >
              →
            </span>
          </div>
        </div>

        {/* Card 4: Talk to Me (Soft Green-Beige: #EAF0E4) */}
        <div
          onClick={() => handleLaunchAISaathi()}
          className="group rounded-[18px] p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
          style={{
            backgroundColor: '#EAF0E4',
            border: '1px solid rgba(70, 80, 60, 0.08)',
            boxShadow: '0 4px 18px rgba(70, 60, 40, 0.03)',
          }}
        >
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#4A6E59] shadow-xs mb-3 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: '#FBF7EF', border: '1px solid rgba(70, 80, 60, 0.08)' }}
            >
              <Mic className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-serif font-bold text-[#1F342A] text-base mb-1">
              {homeTexts.card4Title[language] || homeTexts.card4Title.en}
            </h3>
            <p className="text-xs text-[#68736B] leading-relaxed font-normal">
              {homeTexts.card4Subtitle[language] || homeTexts.card4Subtitle.en}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <span
              className="w-7 h-7 rounded-full text-[#1F342A] group-hover:bg-[#4A6E59] group-hover:text-[#FFFDF7] flex items-center justify-center text-xs transition-all shadow-xs"
              style={{ backgroundColor: '#FBF7EF' }}
            >
              →
            </span>
          </div>
        </div>
      </section>

      {/* ─── DISCOVER THE NORTH EAST PANORAMIC CULTURAL CARD ─────────────── */}
      <section
        className="relative rounded-[20px] overflow-hidden shadow-cognitiva h-36 flex items-center border border-[rgba(70,80,60,0.08)]"
        data-purpose="cultural-banner"
      >
        <img
          alt="Scenic panoramic landscape of North East India with lakes, hills, and cottages"
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
        />
        <div className="absolute inset-0 scenic-gradient"></div>
        <div className="absolute inset-0 px-6 sm:px-8 flex items-center justify-between">
          <div className="text-[#FFFDF7] max-w-md">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight block drop-shadow-sm">
              {homeTexts.discoverNeTitle[language] || homeTexts.discoverNeTitle.en}
            </span>
            <p className="text-xs text-[#EAE4D7] mt-1 font-normal opacity-95">
              {homeTexts.discoverNeSubtitle[language] || homeTexts.discoverNeSubtitle.en}
            </p>
          </div>
          <button
            onClick={() => onNavigate('game_detail', 'tea_garden')}
            className="inline-flex items-center gap-2 text-[#FFFDF7] text-xs font-semibold px-4 py-2 rounded-full shadow-sm backdrop-blur-sm transition-all shrink-0 cursor-pointer"
            style={{
              backgroundColor: 'rgba(82, 116, 92, 0.92)',
              border: '1px solid rgba(255, 253, 247, 0.25)',
            }}
          >
            <span>{homeTexts.exploreRegionalContent[language] || homeTexts.exploreRegionalContent.en}</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* ─── AI SAATHI DYNAMIC HEALTH SUMMARY & RECOMMENDATIONS ───────────── */}
      <div className="space-y-6">
        <DailyAISummaryCard
          patient={patientContextEngine.getActivePatientRecord()}
          language={language}
          onNavigate={onNavigate}
          onOpenAISaathi={(q) => handleLaunchAISaathi(q)}
        />

        <RecommendedForYouToday
          patient={patientContextEngine.getActivePatientRecord()}
          language={language}
          onNavigate={onNavigate}
          onOpenAISaathiWithQuery={(q) => handleLaunchAISaathi(q)}
        />
      </div>

      {/* ─── HEALTH TIPS FOR YOU ─────────────────────────────────────────── */}
      <section className="pt-1" data-purpose="daily-health-tips">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#52745C]" />
            <h2 className="font-serif font-bold text-[#1F342A] text-base">
              {homeTexts.healthTipsHeader[language] || homeTexts.healthTipsHeader.en}
            </h2>
            <span className="text-[#8A918A] text-xs font-normal hidden sm:inline">
              {homeTexts.healthTipsSubheader[language] || homeTexts.healthTipsSubheader.en}
            </span>
          </div>
          <button
            onClick={() => handleLaunchAISaathi('Show me my personalized health tips')}
            className="text-xs font-semibold text-[#52745C] hover:text-[#365A46] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{homeTexts.seeAll[language] || homeTexts.seeAll.en}</span>
            <span>→</span>
          </button>
        </div>

        {/* 4 Small Tip Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tip 1 */}
          <div
            className="rounded-xl p-2.5 transition-shadow hover:shadow-sm border border-[rgba(70,80,60,0.08)]"
            style={{
              backgroundColor: '#FBF7EF',
              boxShadow: '0 4px 14px rgba(70, 60, 40, 0.03)',
            }}
          >
            <div className="h-20 rounded-lg overflow-hidden mb-2 bg-[#ECE4D4]">
              <img
                alt="Fresh glass of water"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80"
              />
            </div>
            <h4 className="text-xs font-bold text-[#1F342A]">
              {homeTexts.tip1Title[language] || homeTexts.tip1Title.en}
            </h4>
            <p className="text-[10.5px] text-[#68736B] leading-tight mt-0.5">
              {homeTexts.tip1Desc[language] || homeTexts.tip1Desc.en}
            </p>
          </div>

          {/* Tip 2 */}
          <div
            className="rounded-xl p-2.5 transition-shadow hover:shadow-sm border border-[rgba(70,80,60,0.08)]"
            style={{
              backgroundColor: '#FBF7EF',
              boxShadow: '0 4px 14px rgba(70, 60, 40, 0.03)',
            }}
          >
            <div className="h-20 rounded-lg overflow-hidden mb-2 bg-[#ECE4D4]">
              <img
                alt="Elder walking in the greenery garden"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80"
              />
            </div>
            <h4 className="text-xs font-bold text-[#1F342A]">
              {homeTexts.tip2Title[language] || homeTexts.tip2Title.en}
            </h4>
            <p className="text-[10.5px] text-[#68736B] leading-tight mt-0.5">
              {homeTexts.tip2Desc[language] || homeTexts.tip2Desc.en}
            </p>
          </div>

          {/* Tip 3 */}
          <div
            className="rounded-xl p-2.5 transition-shadow hover:shadow-sm border border-[rgba(70,80,60,0.08)]"
            style={{
              backgroundColor: '#FBF7EF',
              boxShadow: '0 4px 14px rgba(70, 60, 40, 0.03)',
            }}
          >
            <div className="h-20 rounded-lg overflow-hidden mb-2 bg-[#ECE4D4]">
              <img
                alt="Nutritious traditional bowl"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
              />
            </div>
            <h4 className="text-xs font-bold text-[#1F342A]">
              {homeTexts.tip3Title[language] || homeTexts.tip3Title.en}
            </h4>
            <p className="text-[10.5px] text-[#68736B] leading-tight mt-0.5">
              {homeTexts.tip3Desc[language] || homeTexts.tip3Desc.en}
            </p>
          </div>

          {/* Tip 4 */}
          <div
            className="rounded-xl p-2.5 transition-shadow hover:shadow-sm border border-[rgba(70,80,60,0.08)]"
            style={{
              backgroundColor: '#FBF7EF',
              boxShadow: '0 4px 14px rgba(70, 60, 40, 0.03)',
            }}
          >
            <div className="h-20 rounded-lg overflow-hidden mb-2 bg-[#ECE4D4]">
              <img
                alt="Serene nature landscape"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
              />
            </div>
            <h4 className="text-xs font-bold text-[#1F342A]">
              {homeTexts.tip4Title[language] || homeTexts.tip4Title.en}
            </h4>
            <p className="text-[10.5px] text-[#68736B] leading-tight mt-0.5">
              {homeTexts.tip4Desc[language] || homeTexts.tip4Desc.en}
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAMILY MEMORY OF THE DAY CARD ───────────────────────────────── */}
      <section
        className="rounded-2xl border border-[rgba(70,80,60,0.08)] p-5 sm:p-6 shadow-cognitiva-sm flex flex-col sm:flex-row items-center justify-between gap-5"
        style={{ backgroundColor: '#FBF7EF' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#FDE8E5', color: '#BA1A1A' }}
          >
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1F342A]">
              {t('elderlyHome.tileFamilyTitle')}
            </h3>
            <p className="text-xs text-[#68736B] font-medium">
              {t('elderlyHome.tileFamilySubtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('family')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[rgba(70,80,60,0.12)] hover:bg-[#EAE4D7]"
          style={{ backgroundColor: '#FAF6EE', color: '#1F342A' }}
        >
          <span>{t('elderlyHome.tileFamilyBadge')}</span>
          <ArrowRight className="w-4 h-4 text-[#52745C]" />
        </button>
      </section>

      {/* ─── HIGH VISIBILITY SOS RESCUE BUTTON ───────────────────────────── */}
      <section className="pt-2">
        <button
          onClick={onOpenSOS}
          className="w-full p-5 sm:p-6 rounded-2xl text-white shadow-lg flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer select-none"
          style={{
            backgroundColor: '#BA1A1A',
            boxShadow: '0 8px 24px rgba(186, 26, 26, 0.22)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <ShieldAlert className="w-7 h-7 fill-current animate-pulse text-[#FDE8E5]" />
            </div>
            <div className="text-left">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight">
                {t('elderlyHome.sosHelpTitle')}
              </h3>
              <p className="text-xs text-[#FDE8E5] font-medium mt-0.5">
                {t('elderlyHome.sosHelpSubtitle')}
              </p>
            </div>
          </div>
          <span className="text-sm sm:text-base font-extrabold bg-white/20 text-white px-4 py-2 rounded-xl tracking-wider">
            {t('common.sos')}
          </span>
        </button>
      </section>
    </div>
  );
};

export default ElderlyHome;

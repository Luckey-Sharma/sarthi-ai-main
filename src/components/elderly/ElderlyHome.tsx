import React from 'react';
import { Language, PatientProfile, AppView, CognitiveSession, GameId } from '../../types';
import { ShieldAlert, Volume2, Droplet, ArrowRight, Play, Heart } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SarthiQuickBanner } from '../sarthi/SarthiQuickBanner';
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

  const localeCode =
    language === 'as' ? 'as-IN' :
    language === 'bn' ? 'bn-IN' :
    language === 'hi' ? 'hi-IN' :
    language === 'mni' ? 'mni-IN' : 'en-US';

  const todayStr = new Intl.DateTimeFormat(localeCode, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleSpeakGreeting = () => {
    stopSpeaking();
    const text = `${getGreeting()}. ${t('elderlyHome.welcomeSubtitle')}`;
    speak(text, language);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-20 font-sans">
      {/* Weather & Context Greeting Banner */}
      <div className="bg-[#ffffff] p-6 sm:p-8 rounded-3xl border border-[#becabf]/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <img
            src={patient.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
            alt={patient.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-3 border-[#bfebba] shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#ecefea] text-[#416740] border border-[#becabf]/40">
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span>21°C • {patient.location || 'Guwahati, Assam'}</span>
              </span>
              <span className="text-xs font-semibold text-[#6f7a70]">• {todayStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517] leading-tight">
              {getGreeting()}
            </h1>
            <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
              {t('elderlyHome.welcomeSubtitle')}
            </p>
          </div>
        </div>

        {/* Banner Right: Audio Greeting Button & Hydration Quick Tracker */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleSpeakGreeting}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] text-xs font-bold border border-[#becabf]/60 transition-colors shadow-xs cursor-pointer shrink-0"
            title="Listen to Greeting Aloud"
          >
            <Volume2 className="w-4 h-4 text-[#416740]" />
            <span>{language === 'as' ? 'পঢ়ি শুনাওক' : language === 'bn' ? 'পড়ে শোনান' : language === 'hi' ? 'सुनें' : 'Listen'}</span>
          </button>

          <div
            onClick={() => onNavigate('reminders')}
            className="bg-[#f7faf5] hover:bg-[#ecefea] p-3 rounded-2xl border border-[#becabf]/60 shadow-xs cursor-pointer flex items-center gap-3 transition-colors shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#bfebba]/50 text-[#032517] flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-current text-[#416740]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#6f7a70]">
                {t('elderlyHome.waterWidgetTitle')}
              </div>
              <div className="text-xs font-extrabold text-[#032517]">
                {hydrationGlasses} / 8 {language === 'as' ? 'গিলাচ' : language === 'bn' ? 'গ্লাস' : language === 'hi' ? 'गिलास' : 'glasses'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Saathi Daily Summary Card ("Your Day with AI Saathi") */}
      <DailyAISummaryCard
        patient={patientContextEngine.getActivePatientRecord()}
        language={language}
        onNavigate={onNavigate}
        onOpenAISaathi={(q) => (onOpenAISaathi ? onOpenAISaathi(q) : onOpenSarthiModal())}
      />

      {/* Sarthi AI Cognitive Care Companion Banner */}
      <SarthiQuickBanner
        language={language}
        patient={patient}
        sessions={sessions}
        hydrationGlasses={hydrationGlasses}
        onOpenSarthiModal={onOpenSarthiModal}
        onNavigate={onNavigate}
      />

      {/* 4 Giant Tactile Action Cards (2x2 Grid, min 165px height) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#456c44] mb-3 px-1">
          {language === 'as' ? 'প্ৰধান কাৰ্যকলাপসমূহ' : language === 'bn' ? 'প্রধান কার্যকলাপ' : language === 'hi' ? 'दैनिक गतिविधियाँ' : 'Daily Recommended Actions'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Card 1: Play a Game */}
          <button
            onClick={() => onNavigate('games')}
            className="group relative text-left p-6 sm:p-7 min-h-[165px] rounded-3xl bg-[#ffffff] hover:bg-[#f7faf5] border-2 border-[#becabf]/60 hover:border-[#032517] shadow-md transition-all transform active:scale-[0.98] cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#bfebba] text-[#032517] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[32px]">psychology</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ecefea] text-[#032517] border border-[#becabf]/50">
                {t('elderlyHome.tileGamesBadge')}
              </span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] group-hover:text-[#416740] transition-colors">
                {t('elderlyHome.tileGamesTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
                {t('elderlyHome.tileGamesSubtitle')}
              </p>
            </div>
          </button>

          {/* Card 2: My Day & Routine */}
          <button
            onClick={() => onNavigate('reminders')}
            className="group relative text-left p-6 sm:p-7 min-h-[165px] rounded-3xl bg-[#ffffff] hover:bg-[#f7faf5] border-2 border-[#becabf]/60 hover:border-[#416740] shadow-md transition-all transform active:scale-[0.98] cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ecefea] text-[#416740] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[32px]">wb_twilight</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ecefea] text-[#416740] border border-[#becabf]/50">
                {language === 'as' ? 'ৰুটিন' : language === 'bn' ? 'রুটিন' : language === 'hi' ? 'दिनचर्या' : 'Routine'}
              </span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] group-hover:text-[#416740] transition-colors">
                {language === 'as' ? 'মোৰ দিনটো আৰু যত্ন' : language === 'bn' ? 'আমার দিন ও যত্ন' : language === 'hi' ? 'मेरी दिनचर्या' : 'My Day & Routine'}
              </h3>
              <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
                {language === 'as' ? 'ৰাতিপুৱাৰ চাহ, খোজ কঢ়া আৰু বিশ্ৰাম' : language === 'bn' ? 'সকালের চা, হাঁটা ও বিশ্রাম' : language === 'hi' ? 'सुबह की चाय, सैर और विश्राम' : 'Morning tea, walk & peaceful rest'}
              </p>
            </div>
          </button>

          {/* Card 3: Medicines & Health */}
          <button
            onClick={() => onNavigate('reminders')}
            className="group relative text-left p-6 sm:p-7 min-h-[165px] rounded-3xl bg-[#ffffff] hover:bg-[#f7faf5] border-2 border-[#becabf]/60 hover:border-[#631d08] shadow-md transition-all transform active:scale-[0.98] cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ffdbd1] text-[#631d08] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[32px]">medication</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ffdbd1]/60 text-[#631d08] border border-[#ffdbd1]">
                {language === 'as' ? 'দৰব' : language === 'bn' ? 'ওষুধ' : language === 'hi' ? 'दवाइयाँ' : 'Meds'}
              </span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] group-hover:text-[#631d08] transition-colors">
                {language === 'as' ? 'দৰব আৰু স্বাস্থ্য' : language === 'bn' ? 'ওষুধ ও স্বাস্থ্য' : language === 'hi' ? 'दवाइयाँ और स्वास्थ्य' : 'Medicines & Health'}
              </h3>
              <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
                {language === 'as' ? 'সময়মতে দৰব খাওক • পানীৰ অনুসৰণ' : language === 'bn' ? 'সময়মতো ওষুধ খান • জলের হিসাব' : language === 'hi' ? 'समय पर दवाइयाँ लें • जल सेवन' : 'Scheduled doses & daily water tracker'}
              </p>
            </div>
          </button>

          {/* Card 4: Talk to Sarthi */}
          <button
            onClick={onOpenSarthiModal}
            className="group relative text-left p-6 sm:p-7 min-h-[165px] rounded-3xl bg-[#ffffff] hover:bg-[#f7faf5] border-2 border-[#becabf]/60 hover:border-[#032517] shadow-md transition-all transform active:scale-[0.98] cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#032517] text-white flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[32px] text-[#bfebba]">smart_toy</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#bfebba]/40 text-[#032517] border border-[#bfebba]">
                AI Companion
              </span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] group-hover:text-[#416740] transition-colors">
                {language === 'as' ? 'সাৰথীৰ সৈতে কথা পাতক' : language === 'bn' ? 'সারথীর সাথে কথা বলুন' : language === 'hi' ? 'सारथी से बात करें' : 'Talk to Sarthi'}
              </h3>
              <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
                {language === 'as' ? 'মই আপোনাক সহায় আৰু উৎসাহ জনাবলৈ সাজু' : language === 'bn' ? 'আমি আপনাকে সাহায্য করতে প্রস্তুত' : language === 'hi' ? 'मार्गदर्शन और बातचीत के लिए तैयार' : 'Your gentle cognitive care guide is listening'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* "Something Familiar" Cultural Reminiscence Card */}
      <div className="bg-[#ffffff] rounded-3xl border border-[#becabf]/60 shadow-md p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1b3b2b] text-[#bfebba] flex items-center justify-center text-3xl shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[36px]">filter_vintage</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#416740] px-2 py-0.5 rounded-md bg-[#bfebba]/40">
                {language === 'as' ? 'এক চিনাকি অনুভৱ' : language === 'bn' ? 'এক পরিচিত স্মৃতি' : language === 'hi' ? 'एक जानी-पहचानी याद' : 'Something Familiar'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#032517]">
              {language === 'as' ? 'ব্ৰহ্মপুত্ৰ আৰু চাহ বাগিচাৰ স্মৃতি' : language === 'bn' ? 'ব্রহ্মপুত্র ও চা বাগানের স্মৃতি' : language === 'hi' ? 'ब्रह्मपुत्र और चाय बागानों की यादें' : 'Flowers & Birds of the Brahmaputra'}
            </h3>
            <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
              {language === 'as' ? 'শান্ত ছবি চাওক আৰু চিনাকি সুৰ উপভোগ কৰক' : language === 'bn' ? 'শান্ত ছবি দেখুন ও চেনা গান শুনুন' : language === 'hi' ? 'शांत चित्र देखें और परिचित धुनें सुनें' : 'Look at comforting regional pictures and hear peaceful folk melodies'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => onNavigate('game_detail', 'tea_garden')}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-[#032517] hover:bg-[#1b3b2b] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-[#bfebba]" />
            <span>{language === 'as' ? 'খেলক' : language === 'bn' ? 'খেলুন' : language === 'hi' ? 'खेलें' : 'Explore'}</span>
          </button>
        </div>
      </div>

      {/* AI Saathi Dynamic Health Recommendations ("Recommended for You Today") */}
      <RecommendedForYouToday
        patient={patientContextEngine.getActivePatientRecord()}
        language={language}
        onNavigate={onNavigate}
        onOpenAISaathiWithQuery={(q) => (onOpenAISaathi ? onOpenAISaathi(q) : onOpenSarthiModal())}
      />

      {/* Family & Memories Dock Strip */}
      <div className="bg-[#ffffff] rounded-3xl border border-[#becabf]/60 shadow-md p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ffdbd1] text-[#631d08] flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#032517]">
              {t('elderlyHome.tileFamilyTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[#3e4941] font-medium">
              {t('elderlyHome.tileFamilySubtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('family')}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] text-xs font-bold border border-[#becabf]/60 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>{t('elderlyHome.tileFamilyBadge')}</span>
          <ArrowRight className="w-4 h-4 text-[#416740]" />
        </button>
      </div>

      {/* SOS High-Visibility Rescue Button */}
      <div className="pt-2">
        <button
          onClick={onOpenSOS}
          className="w-full p-6 sm:p-7 rounded-3xl bg-[#631d08] hover:bg-[#420b00] text-white shadow-xl shadow-[#631d08]/25 flex items-center justify-between border-b-4 border-[#420b00] active:border-b-0 transform active:translate-y-1 transition-all cursor-pointer select-none"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl">
              <ShieldAlert className="w-8 h-8 fill-current text-[#ffdbd1] animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {t('elderlyHome.sosHelpTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#ffdbd1] font-medium">
                {t('elderlyHome.sosHelpSubtitle')}
              </p>
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black bg-white/15 text-[#ffdbd1] px-5 py-2.5 rounded-2xl tracking-wider">
            {t('common.sos')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ElderlyHome;

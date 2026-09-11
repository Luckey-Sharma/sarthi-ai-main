import React, { useState } from 'react';
import { Language, PatientProfile, GameId } from '../../types';
import { ArrowLeft, Sparkles, Heart, ShieldCheck, Clock, Music, Image as ImageIcon, Compass, Shirt, SunMedium, Users } from 'lucide-react';
import { t } from '../../services/i18n';

interface CaregiverSessionSetupProps {
  language: Language;
  patient: PatientProfile;
  onStartSession: (selectedGame: GameId, moodTag?: 'calm' | 'cheerful' | 'reflective' | 'low_energy', caregiverNote?: string) => void;
  onBack: () => void;
}

interface ActivityOption {
  id: GameId;
  title: Record<Language, string>;
  tag: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
  badgeBg: string;
}

const ACTIVITIES: ActivityOption[] = [
  {
    id: 'memory_match',
    title: {
      en: 'Cultural Photo & Artifact Match',
      as: 'ঐতিহ্য ফটো আৰু সঁজুলিৰ চিনাকি',
      bn: 'ঐতিহ্যবাহী ছবি ও স্মারক মেলানো',
      hi: 'सांस्कृतिक स्मृति व वस्तु मिलान',
      mni: 'Cultural Photo Match',
    },
    tag: {
      en: 'Familiar Objects',
      as: 'পৰিচিত সঁজুলি',
      bn: 'পরিচিত সামগ্রী',
      hi: 'परिचित वस्तुएं',
      mni: 'Familiar Pots',
    },
    description: {
      en: 'Match authentic photographs of heritage treasures like the Jaapi, Xorai, and Gamosa. Zero pressure or hidden card memorization.',
      as: 'জাপি, শৰাই, গামোচা আদি পৰম্পৰাগত সঁজুলিৰ ফটো চাই চিনাক্ত কৰক। কোনো কঠিন নিয়ম নাই।',
      bn: 'জাপি, শরাই, গামোছা ইত্যাদি পরিচিত জিনিসপত্রের ছবি দেখে মেলানোর আনন্দময় অনুশীলন।',
      hi: 'जापी, शराई व गमोसा जैसी जानी-पहचानी वस्तुओं की सुंदर तस्वीरें देखकर मिलान करें।',
      mni: 'Jaapi, Xorai amsung potlamsinggi photo match toubiyu.',
    },
    icon: '🎴',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 'sounds_hills',
    title: {
      en: 'Name That Tune: Regional Folk Melodies',
      as: 'সুৰ চিনক: আঞ্চলিক লোকগীতৰ সুৰ',
      bn: 'সুর চেনা: আঞ্চলিক লোকসঙ্গীত ও সুর',
      hi: 'धुन पहचानें: पूर्वोत्तर के लोकगीत',
      mni: 'Eshei Khonjel Khangba',
    },
    tag: {
      en: 'Music Reminiscence',
      as: 'সংগীত স্মৃতি',
      bn: 'সঙ্গীত স্মৃতি',
      hi: 'मधुर संगीत',
      mni: 'Music',
    },
    description: {
      en: 'Listen to short clips of regional folk tunes (Bihu, Baul, Manipuri Pena, Mountain Flute). Tap a button to reveal the song and cultural story.',
      as: 'বিহু, বাউল, মণিপুৰী পেনা আৰু পাহাৰীয়া বাঁহীৰ সুমধুৰ সুৰ শুনক আৰু গীতৰ আঁৰৰ কাহিনী জানক।',
      bn: 'বিহু, বাউল, মণিপুরী পেনা ও পাহাড়ি বাঁশির মিষ্টি সুর শুনে গান ও স্মৃতির গল্প আবিষ্কার করুন।',
      hi: 'बिहू, बाउल, मणिपुरी पेना और पहाड़ी बांसुरी की धुन सुनें और गीत की सुंदर यादें ताजा करें।',
      mni: 'Bihu, Baul, Manipuri Pena amasung wagi khonjel taduna wari khangbiyu.',
    },
    icon: '🎵',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    id: 'brain_quest',
    title: {
      en: 'Familiar Places & Heritage Stories',
      as: 'চিনাকি স্থান আৰু ঐতিহ্যৰ সাধু',
      bn: 'পরিচিত স্থান ও ঐতিহ্যের গল্প',
      hi: 'जानी-पहचानी जगहें व धरोहर की कहानियां',
      mni: 'Familiar Mafam Wari',
    },
    tag: {
      en: 'Landmarks',
      as: 'পৰিচিত স্থান',
      bn: 'পরিচিত স্থান',
      hi: 'तीर्थ व स्थल',
      mni: 'Mafam',
    },
    description: {
      en: 'Look at peaceful photos of Kaziranga, Majuli Island, and Kamakhya. Discover comforting stories together with warm hints and zero wrong answers.',
      as: 'কাজিৰঙা, মাজুলী আৰু কামাখ্যাৰ ফটো চাই সুখৰ স্মৃতি মনত পেলাওক। কোনো ভুল উত্তৰৰ ভয় নাই।',
      bn: 'কাজিরাঙ্গা, মাজুলী ও কামাখ্যার মনোরম ছবি দেখে গল্প শুনুন। কোনো ভুল চিহ্নিত করা হয় না।',
      hi: 'काजीरंगा, माजुली और कामाख्या जैसी जगहों की तस्वीरें देखकर यादें साझा करें।',
      mni: 'Kaziranga, Majuli, Kamakhyagi fajaba photo yengbiyu.',
    },
    icon: '🏞️',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'pattern_weave',
    title: {
      en: 'Traditional Attire & Handlooms',
      as: 'পৰম্পৰাগত সাজপাৰ আৰু তাঁতশাল',
      bn: 'ঐতিহ্যবাহী পোশাক ও তাঁত শিল্প',
      hi: 'पारंपरिक हथकरघा व वस्त्र',
      mni: 'Yongkham & Traditional Phi',
    },
    tag: {
      en: 'Textiles',
      as: 'সাঁজপাৰ',
      bn: 'পোশাক',
      hi: 'वस्त्र',
      mni: 'Phi',
    },
    description: {
      en: 'Admire authentic North-East textiles like Muga Silk, Naga shawls, and Manipuri Phanek. Simple 1-step appreciation with no abstract math puzzles.',
      as: 'মুগা ৰেচম, নগা শাল আৰু মণিপুৰী ফনেকৰ পৰম্পৰাগত ৰূপ চাওক। কোনো জটিল ধাঁধা নাই।',
      bn: 'মুগা রেশম, নাগা শাল ও মণিপুরী ফনেকের মতো ঐতিহ্যবাহী বুনন উপভোগ করার শান্ত আয়োজন।',
      hi: 'मूगा सिल्क, नगा शॉल और पारंपरिक बुनाई के नमूनों को पहचानें और सराहें।',
      mni: 'Muga Silk, Naga Shawl, Manipuri Phanek machina yengbiyu.',
    },
    icon: '🧶',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  {
    id: 'tea_garden',
    title: {
      en: 'Peaceful Tea Garden Walk',
      as: 'চাহ বাগিচাৰ শান্ত খোজ',
      bn: 'চা বাগিচার শান্ত পদচারণা',
      hi: 'चाय बगान की सुकून भरी सैर',
      mni: 'Cha Bagan da Chathokpa',
    },
    tag: {
      en: 'Nature Sensory',
      as: 'প্ৰকৃতি আৰু অনুভূতি',
      bn: 'প্রকৃতি ও অনুভূতি',
      hi: 'प्रकृति व सुकून',
      mni: 'Nature',
    },
    description: {
      en: 'A pressure-free scenic walk through the lush tea gardens of Assam. Gently tap tender tea buds into the basket at one’s own relaxed pace.',
      as: 'কোনো সময়ৰ চাপ নাই। অসমৰ সেউজ চাহ বাগিচাত ফুৰি নিজৰ গতিত দুটি পাত এটি কলি তোলক।',
      bn: 'কোনো সময়সীমা বা ভুল নেই। সবুজ চা বাগানে নিজের ইচ্ছেমতো দুটি পাতা একটি কুঁড়ি তুলুন।',
      hi: 'समय का कोई दबाव नहीं। अपनी सहज गति से हरी चाय पत्तियों को टोकरी में सहेजें।',
      mni: 'Matamgi cheng thaba leite. Cha managa koli amaga tapna hek-u.',
    },
    icon: '🍃',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
  },
  {
    id: 'routine_builder',
    title: {
      en: 'Gentle Daily Moments',
      as: 'দৈনন্দিন মধুৰ মুহূৰ্ত',
      bn: 'দৈনন্দিন শান্ত মুহূর্ত',
      hi: 'दिनचर्या के सुकून भरे पल',
      mni: 'Nungtigi Nungshiba Matam',
    },
    tag: {
      en: 'Daily Rhythm',
      as: 'দৈনিক ক্ৰম',
      bn: 'দৈনিক ছন্দ',
      hi: 'दैनिक लय',
      mni: 'Daily Rhythm',
    },
    description: {
      en: 'Anchor comforting moments of the day: morning Assam tea, afternoon storytelling, and lighting the evening lamp. No complex reordering required.',
      as: 'পুৱাৰ চাহ, বেলি লহিওৱা সময় আৰু সন্ধিয়াৰ চাকি জ্বলোৱাৰ শান্ত স্মৃতি।',
      bn: 'সকালের চা, দুপুরের গল্প ও সন্ধ্যার প্রদীপ জ্বালানোর মতো ভালোবাসার মুহূর্তগুলি মনে করা।',
      hi: 'सुबह की चाय, दोपहर की बातें और शाम का दिया जलाने जैसी सुकून भरी दिनचर्या।',
      mni: 'Ayukki cha, numidanggi thaomei thambagi wari.',
    },
    icon: '☀️',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    id: 'family_recall',
    title: {
      en: 'Family Album & Cherished Memories',
      as: 'পৰিয়ালৰ ফটো এলবাম আৰু মৰমৰ স্মৃতি',
      bn: 'পারিবারিক অ্যালবাম ও ভালোবাসার স্মৃতি',
      hi: 'पारिवारिक एल्बम व प्रियजनों की यादें',
      mni: 'Imunggi Album & Ningshingba',
    },
    tag: {
      en: 'Loved Ones',
      as: 'আপোন মানুহ',
      bn: 'আপনজন',
      hi: 'अपने प्रियजन',
      mni: 'Nungshiba Meeyam',
    },
    description: {
      en: 'Look at heartwarming family photos of children, grandchildren, and dear friends, reading pleasant memories together.',
      as: 'সন্তান আৰু আত্মীয়-স্বজনৰ হাঁহিমুখীয়া ফটো চাই পুৰণি সোণালী দিনৰ স্মৃতি ৰোমন্থন কৰক।',
      bn: 'সন্তান ও প্রিয়জনদের হাসিমুখ ছবি দেখে আনন্দময় পারিবারিক মুহূর্ত উপভোগ করুন।',
      hi: 'अपने बच्चों, पोते-पोतियों और प्रियजनों की तस्वीरें देखकर खुशी के पल साझा करें।',
      mni: 'Imunggi nungshiba meeyamgi photo yengbiyu.',
    },
    icon: '❤️',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
  },
];

export const CaregiverSessionSetup: React.FC<CaregiverSessionSetupProps> = ({
  language,
  patient,
  onStartSession,
  onBack,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameId>('memory_match');
  const [moodTag, setMoodTag] = useState<'calm' | 'cheerful' | 'reflective' | 'low_energy'>('calm');
  const [caregiverNote, setCaregiverNote] = useState<string>('');

  const moodOptions: { id: 'calm' | 'cheerful' | 'reflective' | 'low_energy'; label: string; icon: string }[] = [
    { id: 'calm', label: t('moodCalm', language), icon: '🌿' },
    { id: 'cheerful', label: t('moodCheerful', language), icon: '😊' },
    { id: 'reflective', label: t('moodReflective', language), icon: '🕊️' },
    { id: 'low_energy', label: t('moodTired', language), icon: '☕' },
  ];

  const handleStart = () => {
    onStartSession(selectedGame, moodTag, caregiverNote.trim());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-20 font-sans">
      {/* Top Banner Labeled Clearly "For Caregivers" */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#becabf]/60 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] rounded-2xl cursor-pointer border border-[#becabf]/50 transition-colors"
              title={t('back', language)}
            >
              <ArrowLeft className="w-5 h-5 text-[#416740]" />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#bfebba]/50 text-[#032517] border border-[#416740]/30 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#416740]" />
                <span>{language === 'as' ? 'সেৱাদানকাৰীৰ বাবে' : language === 'bn' ? 'সেবাদানকারীর জন্য' : language === 'hi' ? 'देखभालकर्ता हेतु' : 'For Caregivers & Family'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517]">
                {t('caregiverSessionSetupTitle', language)}
              </h1>
              <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
                {t('caregiverSessionSetupSubtitle', language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#f7faf5] border border-[#becabf]/60 px-4 py-2 rounded-2xl text-xs font-bold text-[#032517] shrink-0">
            <Clock className="w-4 h-4 text-[#416740]" />
            <span>10 - 15 min gentle session</span>
          </div>
        </div>
      </div>

      {/* Step 1: Mood & Pre-Session Caregiver Note */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#becabf]/60 shadow-md space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#032517] flex items-center gap-2">
            <span>1.</span>
            <span>{t('caregiverPreSessionMood', language)}</span>
            <span className="text-xs text-[#6f7a70] font-normal">({patient.name})</span>
          </h2>
          <p className="text-xs text-[#3e4941] mt-0.5">
            {language === 'as'
              ? 'ব্যক্তিগৰাকীৰ বৰ্তমান মনোভাৱ বাছি লওক যাতে শান্ত পৰিৱেশ বজায় ৰাখিব পৰা যায়।'
              : language === 'bn'
              ? 'মানুষটির বর্তমান মনোভাব বেছে নিন যাতে শান্ত ও আনন্দময় অভিজ্ঞতা তৈরি করা যায়।'
              : language === 'hi'
              ? 'व्यक्ति का वर्तमान मूड चुनें ताकि गतिविधि को उनके अनुकूल रखा जा सके।'
              : 'Record how they are feeling right now to tailor the pace.'}
          </p>
        </div>

        {/* Mood Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {moodOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMoodTag(opt.id)}
              className={`p-3 rounded-2xl border-2 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                moodTag === opt.id
                  ? 'bg-[#032517] text-white border-[#032517] shadow-sm'
                  : 'bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] border-[#becabf]/50'
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Optional Quick Note Input */}
        <div>
          <input
            type="text"
            value={caregiverNote}
            onChange={(e) => setCaregiverNote(e.target.value)}
            placeholder={t('caregiverPreSessionMoodPlaceholder', language)}
            className="w-full px-4 py-3 bg-[#f7faf5] border border-[#becabf]/70 rounded-2xl text-xs sm:text-sm text-[#032517] placeholder:text-[#6f7a70] focus:outline-hidden focus:border-[#032517] transition-all"
          />
        </div>
      </div>

      {/* Step 2: Choose Activity */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#becabf]/60 shadow-md space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#032517] flex items-center gap-2">
            <span>2.</span>
            <span>{language === 'as' ? 'কাৰ্যকলাপ বাছক' : language === 'bn' ? 'কার্যকলাপ নির্বাচন করুন' : language === 'hi' ? 'गतिविधि चुनें' : 'Choose Today’s Reminiscence Activity'}</span>
          </h2>
          <p className="text-xs text-[#3e4941] mt-0.5">
            {language === 'as'
              ? 'প্ৰতিটো কাৰ্যকলাপেই কোনো স্ক’ৰ বা পৰীক্ষা অবিহনে সহজ আৰু স্মৃতিকাতৰভাৱে সজোৱা হৈছে।'
              : language === 'bn'
              ? 'প্রতিটি কার্যকলাপ কোনো স্কোর বা পরীক্ষা ছাড়াই শান্তভাবে স্মৃতিচারণের জন্য তৈরি।'
              : language === 'hi'
              ? 'प्रत्येक गतिविधि बिना किसी अंक या परीक्षा के शांति और पुरानी यादों के लिए बनाई गई है।'
              : 'All games are non-judgmental, failure-free, and grounded in North-East Indian culture.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ACTIVITIES.map((act) => {
            const isSelected = selectedGame === act.id;
            return (
              <div
                key={act.id}
                onClick={() => setSelectedGame(act.id)}
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#f7faf5] border-[#032517] ring-2 ring-[#032517]/20 shadow-md'
                    : 'bg-white hover:bg-[#f7faf5] border-[#becabf]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{act.icon}</span>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${act.badgeBg}`}>
                        {act.tag[language] || act.tag.en}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#032517] bg-[#032517]' : 'border-[#becabf]'
                    }`}>
                      {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#032517]">
                    {act.title[language] || act.title.en}
                  </h3>
                  <p className="text-xs text-[#3e4941] font-medium mt-1 leading-relaxed">
                    {act.description[language] || act.description.en}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gentle Caregiver Reminder Box */}
      <div className="p-4 sm:p-5 bg-[#bfebba]/20 border border-[#416740]/40 rounded-3xl flex items-start gap-3.5 text-xs text-[#032517]">
        <span className="material-symbols-outlined text-[24px] text-[#416740] shrink-0 mt-0.5">favorite</span>
        <div className="space-y-1">
          <div className="font-extrabold text-sm text-[#032517]">
            {language === 'as' ? 'সেৱাদানকাৰীৰ বাবে বন্ধুত্বপূৰ্ণ পৰামৰ্শ' : language === 'bn' ? 'সেবাদানকারীর জন্য স্নেহপূর্ণ পরামর্শ' : language === 'hi' ? 'देखभालकर्ता के लिए आत्मीय सुझाव' : 'Caregiver Guidance for this Session'}
          </div>
          <p className="leading-relaxed text-[#3e4941]">
            {language === 'as'
              ? 'তেওঁৰ কাষত শান্তভাৱে বহক। ভুল উত্তৰ বিচাৰ নকৰিব। গান বা ফটোবোৰ চাই পুৰণি কথা পাতক আৰু সময় উপভোগ কৰক।'
              : language === 'bn'
              ? 'পাশাপাশি শান্তভাবে বসুন। কোনো উত্তরের বিচার করবেন না। গান বা ছবির সাথে প্রিয় স্মৃতি আলোচনা করুন।'
              : language === 'hi'
              ? 'उनके पास सुकून से बैठें। सही-गलत की चिंता न करें। तस्वीरों और धुनों के साथ पुरानी सुखद बातें साझा करें।'
              : 'Sit comfortably beside them. There are no right or wrong answers. Use each photo or tune as a springboard for pleasant conversation and connection.'}
          </p>
        </div>
      </div>

      {/* Big Start Button */}
      <div className="text-center pt-2">
        <button
          onClick={handleStart}
          className="w-full sm:w-auto min-w-[280px] px-8 py-4 bg-[#032517] hover:bg-[#1b3b2b] text-white font-extrabold rounded-2xl text-base shadow-lg transition-transform active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span>{t('beginGentleSession', language)}</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
};

export default CaregiverSessionSetup;

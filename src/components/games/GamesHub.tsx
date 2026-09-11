import React, { useState, useEffect } from 'react';
import { Language, GameId } from '../../types';
import { ArrowLeft, Sparkles, Brain, Eye, Activity, Music, Calendar, Users, Cpu, Award, Zap } from 'lucide-react';
import { t } from '../../services/i18n';
import { storage } from '../../services/storage';
import { GAME_LEVELS } from '../../services/aiEngine';

interface GamesHubProps {
  language: Language;
  onSelectGame: (gameId: GameId) => void;
  onBack: () => void;
}

interface GameDefinition {
  id: GameId;
  title: Record<Language, string>;
  domainLabel: Record<Language, string>;
  icon: string;
  iconBg: string;
  badge: Record<Language, string>;
  description: Record<Language, string>;
}

const GAMES: GameDefinition[] = [
  {
    id: 'memory_match',
    title: {
      as: 'ঐতিহ্য স্মৃতি জোৰা',
      bn: 'ঐতিহ্য স্মৃতি জোড়া',
      mni: 'Cultural Memory Match',
      hi: 'सांस्कृतिक स्मृति मिलान',
      en: 'Cultural Memory Match',
    },
    domainLabel: {
      as: 'দৃষ্টি আৰু স্থানিক স্মৃতি',
      bn: 'ভিজ্যুয়াল মেমোরি',
      mni: 'Visual & Spatial Memory',
      hi: 'दृष्टि एवं स्थानिक स्मृति',
      en: 'Visual & Spatial Memory',
    },
    icon: '🎴',
    iconBg: 'bg-emerald-100 text-emerald-800',
    badge: {
      en: 'Flip Cards',
      hi: 'कार्ड मिलान',
      as: 'কাৰ্ড ওলোটোৱা',
      bn: 'কার্ড উল্টানো',
      mni: 'Card Leithokpa',
    },
    description: {
      as: 'জাপি, শৰাই আৰু মুগা ৰেচমৰ জোৰা মিলাওক।',
      bn: 'জাপি, শরাই ও ঐতিহ্যবাহী আসামের প্রতীক মেলান।',
      mni: 'Cultural potlam anigi match sing thidok-u.',
      hi: 'पारंपरिक जापी, शराई व धरोहरों के जोड़े मिलाएं।',
      en: 'Match pairs of North-East cultural artifacts and family treasures.',
    },
  },
  {
    id: 'tea_garden',
    title: {
      as: 'চাহ বাগিচাৰ মনোযোগ',
      bn: 'চা বাগিচার মনোযোগ',
      mni: 'Cha Bagan Focus',
      hi: 'चाय बगान ध्यान व फुर्ती',
      en: 'Tea Garden Focus',
    },
    domainLabel: {
      as: 'মনোযোগ আৰু মটৰ প্ৰতিক্ৰিয়া',
      bn: 'মনোযোগ ও রিফ্লেক্স',
      mni: 'Pukning Changba & Reflex',
      hi: 'एकाग्रता एवं प्रतिक्रिया',
      en: 'Attention & Motor Reflex',
    },
    icon: '🍃',
    iconBg: 'bg-teal-100 text-teal-800',
    badge: {
      en: 'Real-time Tap',
      hi: 'फुर्ती व ध्यान',
      as: 'সজাগ দৃষ্টি',
      bn: 'সজাগ দৃষ্টি',
      mni: 'Focus Tap',
    },
    description: {
      as: 'দুটি পাত এটি কলি সময়মতে চিঙক।',
      bn: 'সঠিক সময়ে দুটি পাতা একটি কুঁড়ি তুলুন।',
      mni: 'Mana ani koli ama matam chana loukhat-u.',
      hi: 'हरी-भरी चाय की कोमल पत्तियों को सही समय पर चुनें।',
      en: 'Pluck tender tea buds in lush green garden patches before they mature.',
    },
  },
  {
    id: 'brain_quest',
    title: {
      as: 'পাহাৰীয়া সাঁথৰ',
      bn: 'পাহাড়ী ধাঁধা',
      mni: 'Chinggi Paheli',
      hi: 'पहाड़ी पहेलियां',
      en: 'Hill Riddles (Brain Quest)',
    },
    domainLabel: {
      as: 'যুক্তিবোধ আৰু নিৰ্ণয়',
      bn: 'যুক্তিবোধ ও সিদ্ধান্ত',
      mni: 'Executive Function & Logic',
      hi: 'तार्किक चिंतन व समझ',
      en: 'Executive Function & Logic',
    },
    icon: '🧩',
    iconBg: 'bg-amber-100 text-amber-800',
    badge: {
      en: 'Folk Riddles',
      hi: 'लोक पहेलियां',
      as: 'লোক সাঁথৰ',
      bn: 'লোক ধাঁধা',
      mni: 'Folk Paheli',
    },
    description: {
      as: 'ব্ৰহ্মপুত্ৰ আৰু কাজিৰঙাৰ সাঁথৰ ভাঙক।',
      bn: 'উত্তর-পূর্ব ভারতের ঐতিহ্যবাহী ধাঁধার উত্তর দিন।',
      mni: 'Folk Paheli gi paokhum thidok-u.',
      hi: 'पूर्वोत्तर की लोककथाओं से जुड़ी पहेलियां बूझें।',
      en: 'Solve culturally grounded folk riddles testing executive function.',
    },
  },
  {
    id: 'pattern_weave',
    title: {
      as: 'তাঁতশালৰ ফুল',
      bn: 'তাঁতের নকশা',
      mni: 'Yongkham Khwanglyet Weave',
      hi: 'हथकरघा बुनाई पैटर्न',
      en: 'Handloom Pattern Weave',
    },
    domainLabel: {
      as: 'বিন্যাস আৰু ধাৰা',
      bn: 'প্যাটার্ন ও ধারা',
      mni: 'Pattern & Logic',
      hi: 'पैटर्न एवं तार्किक क्रम',
      en: 'Pattern & Inductive Logic',
    },
    icon: '🧶',
    iconBg: 'bg-indigo-100 text-indigo-800',
    badge: {
      en: 'Pattern Logic',
      hi: 'हथकरघा बुनाई',
      as: 'তাঁত চানেকি',
      bn: 'তাঁতের নকশা',
      mni: 'Yongkham',
    },
    description: {
      as: 'অসমীয়া কাপোৰৰ পৰম্পৰাগত ফুল বাচক।',
      bn: 'ঐতিহ্যবাহী তাঁতের কাপড়ে সঠিক নকশার ফুল মেলান।',
      mni: 'Traditional motif sequence asi weavetou.',
      hi: 'पारंपरिक हथकरघे के ताने-बाने में सही रूपांकन बुनें।',
      en: 'Discover and place the correct next motif in indigenous weave motifs.',
    },
  },
  {
    id: 'routine_builder',
    title: {
      as: 'দৈনন্দিন নিয়ম সংস্থাপন',
      bn: 'দৈনন্দিন রুটিন সাজানো',
      mni: 'Nungtigi Routine Semba',
      hi: 'दैनिक दिनचर्या संजोना',
      en: 'Daily Routine Builder',
    },
    domainLabel: {
      as: 'সময় আৰু ক্ৰম অনুধাৱন',
      bn: 'সময় ও অনুক্রম',
      mni: 'Matam Khangba',
      hi: 'समय एवं दिनचर्या क्रम',
      en: 'Temporal Orientation & Sequencing',
    },
    icon: '☀️',
    iconBg: 'bg-orange-100 text-orange-800',
    badge: {
      en: 'Sequencing',
      hi: 'दिनचर्या क्रम',
      as: 'দৈনন্দিন ক্ৰম',
      bn: 'রুটিন ক্রম',
      mni: 'Routine',
    },
    description: {
      as: 'পুৱাৰ চাহৰ পৰা সন্ধিয়ালৈ কামবোৰ ক্ৰমত সজাওক।',
      bn: 'সকাল থেকে রাতের প্রাত্যহিক কাজ ধারাবাহিকভাবে সাজান।',
      mni: 'Numit pumbagi thabak pareng saba.',
      hi: 'सुबह की चाय से शाम की पूजा तक दिनचर्या को सही क्रम में रखें।',
      en: 'Chronologically order daily rituals to anchor circadian temporal sense.',
    },
  },
  {
    id: 'sounds_hills',
    title: {
      as: 'পাহাৰৰ সুৰ',
      bn: 'পাহাড়ের সুর',
      mni: 'Chinggi Makhon',
      hi: 'पहाड़ों की धुन व आवाजें',
      en: 'Sounds of the Hills',
    },
    domainLabel: {
      as: 'শ্ৰৱণ স্মৃতি আৰু চিনাক্তকৰণ',
      bn: 'শ্রবণ স্মৃতি',
      mni: 'Taduna Ningsingba',
      hi: 'श्रवण स्मृति व पहचान',
      en: 'Auditory Memory',
    },
    icon: '🎶',
    iconBg: 'bg-purple-100 text-purple-800',
    badge: {
      en: 'Audio Synth',
      hi: 'ध्वनि पहचान',
      as: 'সুৰ চিনাক্তকৰণ',
      bn: 'সুর চেনা',
      mni: 'Makhon Taba',
    },
    description: {
      as: 'পেঁপা, মন্দিৰৰ ঘণ্টা আৰু বৰষুণৰ শব্দ শুনি চিনি পাওক।',
      bn: 'পেঁপা, মন্দির ঘণ্টা ও চেরাপুঞ্জির বৃষ্টির শব্দ শুনুন।',
      mni: 'Pepa amasung nong khonjel taba.',
      hi: 'पेपा, मंदिर की घंटी और चेरापूंजी की बारिश सुनकर पहचानें।',
      en: 'Match procedural indigenous sounds to their traditional visual counterparts.',
    },
  },
  {
    id: 'family_recall',
    title: {
      as: 'আপোন মানুহক চিনক',
      bn: 'চিহ্ন আপনজন',
      mni: 'Imunggi Meeyam Khangba',
      hi: 'पहचानें अपने प्रियजन',
      en: 'Family Face Recall',
    },
    domainLabel: {
      as: 'আত্মজীৱনীমূলক স্মৃতি',
      bn: 'আত্মজীবনী স্মৃতি',
      mni: 'Imunggi Ningsingba',
      hi: 'पारिवारिक आत्मीय स्मृति',
      en: 'Autobiographical Memory',
    },
    icon: '❤️',
    iconBg: 'bg-rose-100 text-rose-800',
    badge: {
      en: 'Warm Reminiscence',
      hi: 'पारिवारिक स्नेह',
      as: 'পৰিয়ালৰ স্নেহ',
      bn: 'পারিবারিক টান',
      mni: 'Imunggi Nungshiba',
    },
    description: {
      as: 'ফটো আৰু মৰমৰ সংকেত চাই পৰিয়ালৰ মানুহক চিনি পাওক।',
      bn: 'ছবি দেখে নিজের সন্তান ও প্রিয়জনদের স্মৃতিতে ধরে রাখুন।',
      mni: 'Imunggi nungshiba mi sak khangba.',
      hi: 'तस्वीरों व प्यार भरे संकेतों से अपने परिवारजनों को पहचानें।',
      en: 'Spark joyful reminiscence through photos and clues of children and loved ones.',
    },
  },
];

export const GamesHub: React.FC<GamesHubProps> = ({
  language,
  onSelectGame,
  onBack,
}) => {
  const [gameLevels] = useState<Record<GameId, number>>(() => storage.getAllGameLevels());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    {
      id: 'all',
      label: {
        en: 'All Activities',
        as: 'সকলো খেল',
        bn: 'সব খেলা',
        hi: 'सभी गतिविधियाँ',
        mni: 'Pumba',
      }[language] || 'All Activities',
    },
    {
      id: 'memory',
      label: {
        en: 'Visual Memory',
        as: 'দৃষ্টি স্মৃতি',
        bn: 'ভিজ্যুয়াল স্মৃতি',
        hi: 'दृश्य स्मृति',
        mni: 'Visual Memory',
      }[language] || 'Visual Memory',
    },
    {
      id: 'focus',
      label: {
        en: 'Focus & Attention',
        as: 'মনোযোগ',
        bn: 'মনোযোগ ও গতি',
        hi: 'एकाग्रता',
        mni: 'Pukning Changba',
      }[language] || 'Focus & Attention',
    },
    {
      id: 'riddles',
      label: {
        en: 'Executive Logic',
        as: 'যুক্তিবোধ',
        bn: 'যুক্তিবোধ',
        hi: 'तार्किक समझ',
        mni: 'Logic',
      }[language] || 'Executive Logic',
    },
    {
      id: 'routine',
      label: {
        en: 'Routine & Time',
        as: 'দৈনন্দিন ক্ৰম',
        bn: 'রুটিন ও সময়',
        hi: 'दिनचर्या क्रम',
        mni: 'Routine',
      }[language] || 'Routine & Time',
    },
    {
      id: 'sounds',
      label: {
        en: 'Auditory Recall',
        as: 'শ্ৰৱণ সুৰ',
        bn: 'শ্রবণ সুর',
        hi: 'ध्वनि पहचान',
        mni: 'Makhon',
      }[language] || 'Auditory Recall',
    },
    {
      id: 'family',
      label: {
        en: 'Family & Culture',
        as: 'পৰিয়াল আৰু ঐতিহ্য',
        bn: 'পরিবার ও সংস্কৃতি',
        hi: 'परिवार व स्नेह',
        mni: 'Imung',
      }[language] || 'Family & Culture',
    },
  ];

  const filteredGames = GAMES.filter((game) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'memory') return game.id === 'memory_match' || game.id === 'pattern_weave';
    if (activeCategory === 'focus') return game.id === 'tea_garden';
    if (activeCategory === 'riddles') return game.id === 'brain_quest';
    if (activeCategory === 'routine') return game.id === 'routine_builder';
    if (activeCategory === 'sounds') return game.id === 'sounds_hills';
    if (activeCategory === 'family') return game.id === 'family_recall';
    return true;
  });

  const ddaPillLabel = {
    en: 'Dynamic Adaptive Difficulty (DDA)',
    hi: 'स्वतः अनुकूली प्रणाली (DDA)',
    as: 'স্বতন্ত্ৰ অনুকূলন (DDA)',
    bn: 'অভিযোজন ব্যবস্থা (DDA)',
    mni: 'Adaptive System (DDA)',
  }[language] || 'Dynamic Adaptive Difficulty (DDA)';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-[#becabf]/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] rounded-2xl text-xs font-bold transition-colors cursor-pointer border border-[#becabf]/40"
        >
          <ArrowLeft className="w-4 h-4 text-[#416740]" />
          <span>{t('back', language)}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-[#032517] bg-[#bfebba]/40 border border-[#83a590]/40 px-3.5 py-1.5 rounded-xl">
          <Zap className="w-4 h-4 text-[#416740] fill-[#416740]" />
          <span>{ddaPillLabel}</span>
        </div>
      </div>

      {/* Main Title & Gentle Daily Progress */}
      <div className="bg-[#ffffff] p-6 sm:p-7 rounded-3xl border border-[#becabf]/60 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#032517] tracking-tight">
              {t('gamesHubTitle', language)}
            </h1>
            <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-1">
              {t('gamesHubSubtitle', language)}
            </p>
          </div>

          <div className="w-full md:w-64 bg-[#f7faf5] p-3.5 rounded-2xl border border-[#becabf]/60">
            <div className="flex items-center justify-between text-xs font-bold text-[#032517] mb-1.5">
              <span>{language === 'as' ? 'দৈনিক লক্ষ্য' : language === 'bn' ? 'দৈনিক লক্ষ্য' : language === 'hi' ? 'दैनिक लक्ष्य' : 'Daily Gentle Goal'}</span>
              <span className="text-[#416740]">2 / 3</span>
            </div>
            <div className="w-full bg-[#ecefea] h-2 rounded-full overflow-hidden">
              <div className="bg-[#032517] h-full rounded-full w-2/3 transition-all" />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#032517] text-white shadow-xs'
                  : 'bg-[#ecefea] hover:bg-[#e0e3de] text-[#032517] border border-[#becabf]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zero-Anxiety Neuro-Wellness Safety Notice */}
      <div className="p-4 bg-[#bfebba]/25 border border-[#bfebba] rounded-2xl flex items-center gap-3 text-xs font-medium text-[#032517]">
        <span className="material-symbols-outlined text-[20px] text-[#416740] shrink-0">spa</span>
        <span>
          {language === 'as'
            ? 'সকলো ব্যায়াম চিন্তা-মুক্ত আৰু কোনো সময়ৰ চাপ নাই। আপোনাৰ নিজৰ গতিত আনন্দ উপভোগ কৰক।'
            : language === 'bn'
            ? 'সকল অনুশীলন সম্পূর্ণ উদ্বেগহীন এবং কোনো সময়সীমার চাপ নেই। নিজের শান্ত গতিতে খেলুন।'
            : language === 'hi'
            ? 'सभी अभ्यास चिंतामुक्त और समय के दबाव से रहित हैं। अपनी सहज गति से अभ्यास करें।'
            : 'Non-judgmental, pressure-free engagement designed to support neuroplasticity at your own peaceful pace.'}
        </span>
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredGames.map((game) => {
          const currentLevel = (gameLevels[game.id] || 1) as 1 | 2 | 3 | 4 | 5;
          const levelMeta = GAME_LEVELS[currentLevel] || GAME_LEVELS[1];
          const tierLabel = {
            en: `Tier ${currentLevel}/5`,
            hi: `स्तर ${currentLevel}/5`,
            as: `স্তৰ ${currentLevel}/৫`,
            bn: `স্তর ${currentLevel}/৫`,
            mni: `Thak ${currentLevel}/5`,
          }[language] || `Tier ${currentLevel}/5`;

          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group bg-[#ffffff] hover:bg-[#f7faf5] p-6 sm:p-7 rounded-3xl border-2 border-[#becabf]/60 hover:border-[#032517] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-[#ecefea] text-[#032517]"
                  >
                    {game.icon}
                  </div>
                  
                  {/* Dynamic Level Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecefea] border border-[#becabf]/60 text-[#032517] text-xs font-bold shadow-2xs">
                    <span>{levelMeta.badge}</span>
                    <span>{levelMeta.name[language] || `Level ${currentLevel}`}</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-[#032517] group-hover:text-[#416740] transition-colors">
                  {game.title[language] || game.title.en}
                </h3>
                <div className="text-xs font-bold text-[#456c44] mt-0.5">
                  {game.domainLabel[language] || game.domainLabel.en}
                </div>

                <p className="text-xs sm:text-sm text-[#3e4941] font-medium mt-2 leading-relaxed">
                  {game.description[language] || game.description.en}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#ecefea] flex items-center justify-between text-xs font-bold text-[#032517]">
                <span className="flex items-center gap-1.5 text-[#6f7a70]">
                  <span>🌱 {tierLabel}</span>
                  <span>•</span>
                  <span>{game.badge[language] || game.badge.en}</span>
                </span>
                <span className="flex items-center gap-1 text-[#032517] font-extrabold group-hover:text-[#416740]">
                  <span>{t('playGameAction', language)}</span>
                  <span className="text-base group-hover:translate-x-1.5 transition-transform">➔</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamesHub;

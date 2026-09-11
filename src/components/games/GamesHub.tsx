import React, { useState } from 'react';
import { Language, GameId } from '../../types';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { t } from '../../services/i18n';

interface GamesHubProps {
  language: Language;
  onSelectGame: (gameId: GameId) => void;
  onStartCaregiverSession?: () => void;
  onBack: () => void;
}

interface GameDefinition {
  id: GameId;
  title: Record<Language, string>;
  domainLabel: Record<Language, string>;
  icon: string;
  badge: Record<Language, string>;
  description: Record<Language, string>;
}

const GAMES: GameDefinition[] = [
  {
    id: 'memory_match',
    title: {
      as: 'ঐতিহ্য ফটো আৰু সঁজুলিৰ চিনাকি',
      bn: 'ঐতিহ্যবাহী ছবি ও স্মারক মেলানো',
      mni: 'Cultural Photo Match',
      hi: 'सांस्कृतिक स्मृति व वस्तु मिलान',
      en: 'Heritage Artifacts & Keepsakes',
    },
    domainLabel: {
      as: 'দৃষ্টি আৰু পৰিচিত স্মৃতি',
      bn: 'ভিজ্যুয়াল স্মৃতি ও চেনা জিনিস',
      mni: 'Visual & Familiar Memory',
      hi: 'दृष्टि एवं परिचित यादें',
      en: 'Visual & Familiar Memory',
    },
    icon: '🎴',
    badge: {
      en: 'Familiar Artifacts',
      hi: 'परिचित धरोहर',
      as: 'পৰিচিত সঁজুলি',
      bn: 'চেনা জিনিস',
      mni: 'Familiar Pots',
    },
    description: {
      as: 'জাপি, শৰাই, গামোচা আৰু বৰপেটাৰ কাঁহৰ প্ৰকৃত ফটো চাই চিনাকি লাভ কৰক।',
      bn: 'জাপি, শরাই ও পরিচিত জিনিসপত্রের সুন্দর ছবি দেখে মেলানোর আনন্দদায়ক স্মৃতি।',
      mni: 'Jaapi, Xorai amsung potlamsinggi photo match toubiyu.',
      hi: 'जापी, शराई व गमोसा जैसी जानी-पहचानी वस्तुओं की खूबसूरत तस्वीरें पहचानें।',
      en: 'Recognize authentic heritage treasures like the Jaapi, Xorai, and Gamosa. Zero pressure or hidden card stress.',
    },
  },
  {
    id: 'sounds_hills',
    title: {
      as: 'সুৰ চিনক: আঞ্চলিক লোকগীতৰ সুৰ',
      bn: 'সুর চেনা: আঞ্চলিক লোকসঙ্গীত ও সুর',
      mni: 'Name That Tune: Folk Melodies',
      hi: 'धुन पहचानें: पूर्वोत्तर के लोकगीत',
      en: 'Name That Tune: Regional Folk Melodies',
    },
    domainLabel: {
      as: 'শ্ৰৱণ স্মৃতি আৰু সংগীতিক নস্টালজিয়া',
      bn: 'শ্রবণ স্মৃতি ও সুরের নস্টালজিয়া',
      mni: 'Auditory & Folk Music',
      hi: 'श्रवण स्मृति व लोक संगीत',
      en: 'Auditory Memory & Folk Music',
    },
    icon: '🎶',
    badge: {
      en: 'Folk Tunes',
      hi: 'पारंपरिक धुनें',
      as: 'লোকগীতৰ সুৰ',
      bn: 'লোকসঙ্গীত',
      mni: 'Folk Tune',
    },
    description: {
      as: 'বিহু সুৰ, বাউল গান, মণিপুৰী পেনা আৰু পাহাৰীয়া বাঁহীৰ সুমধুৰ সুৰ শুনি আনন্দ লওক।',
      bn: 'বিহু সুর, বাউল গান, মণিপুরী পেনা ও বাঁশির শান্ত সুরে হারিয়ে যান।',
      mni: 'Bihu, Baul, Pena amsung chinggi flute makhon.',
      hi: 'बिहू, बाउल, मणिपुरी पेना और बांसुरी की मधुर धुनों को सुनकर यादें ताज़ा करें।',
      en: 'Listen to soothing procedural folk melodies like Bihu, Baul, and hill flutes, with gentle tap-to-reveal stories.',
    },
  },
  {
    id: 'brain_quest',
    title: {
      as: 'পৰিচিত ঠাই আৰু ঐতিহ্যৰ সাধু',
      bn: 'পরিচিত স্থান ও ঐতিহ্যের গল্প',
      mni: 'Familiar Places & Heritage Stories',
      hi: 'जानी-पहचानी जगहें व लोक कथाएं',
      en: 'Familiar Places & Heritage Stories',
    },
    domainLabel: {
      as: 'ভৌগোলিক আৰু সাংস্কৃতিক স্মৃতি',
      bn: 'স্থান ও সাংস্কৃতিক স্মৃতি',
      mni: 'Geographic & Cultural Memory',
      hi: 'सांस्कृतिक व ऐतिहासिक स्मृति',
      en: 'Geographic & Cultural Memory',
    },
    icon: '🏛️',
    badge: {
      en: 'Sacred Lands',
      hi: 'तीर्थ व धरोहर',
      as: 'ঐতিহাসিক স্থান',
      bn: 'ঐতিহাসিক স্থান',
      mni: 'Heritage Place',
    },
    description: {
      as: 'কাজিৰঙা, মাজুলী সত্ৰ, কামাখ্যা পাহাৰ আৰু লোকটাক হ্ৰদৰ প্ৰকৃত ছবি আৰু কথা।',
      bn: 'কাজিবাঙা, মাজুলী, কামাখ্যা পাহাড় ও লোকটাক হ্রদের স্মৃতি ও পবিত্র গল্প।',
      mni: 'Kaziranga, Majuli, Loktak gi photo amsung wari.',
      hi: 'काजीरंगा, माजुली, कामाख्या और लोकटक झील की मनमोहक तस्वीरें व कहानियां।',
      en: 'Explore famous landmarks of Assam, Meghalaya, and Manipur with gentle reminiscing cues.',
    },
  },
  {
    id: 'pattern_weave',
    title: {
      as: 'পৰম্পৰাগত সাজ-পোছাক আৰু তাঁতশিল্প',
      bn: 'ঐতিহ্যবাহী পোশাক ও তাঁতের সাজ',
      mni: 'Traditional Attire & Handlooms',
      hi: 'पारंपरिक वस्त्र व हथकरघा धरोहर',
      en: 'Traditional Attire & Handlooms',
    },
    domainLabel: {
      as: 'দৃশ্যমান চিনাক্তকৰণ আৰু হস্তশিল্প',
      bn: 'পোশাক ও তাঁতশিল্পের স্মৃতি',
      mni: 'Handloom & Attire Memory',
      hi: 'हथकरघा व पोशाक स्मृति',
      en: 'Visual Texture & Attire Recognition',
    },
    icon: '🧶',
    badge: {
      en: 'Handlooms',
      hi: 'हथकरघा',
      as: 'তাঁতশিল্প',
      bn: 'তাঁতের নকশা',
      mni: 'Yongkham',
    },
    description: {
      as: 'সোণালী মুগা ৰেচম, নাগা চাদৰ, মণিপুৰী ফানেক আৰু ৰঙা গামোচাৰ চিনাকি।',
      bn: 'সোনালী মুগা রেশম, নাগা শাল, মণিপুরী ফানেক ও গামোছার স্মৃতিময় রূপ।',
      mni: 'Muga silk, Naga shawl, Phanek amsung Gamosa.',
      hi: 'सुनहरी मूगा सिल्क, नागा शॉल, मणिपुरी फनेक व गमोसा के परिचित स्वरूप।',
      en: 'Reminisce about the warmth of golden Muga silk, handwoven Naga shawls, and festival attire.',
    },
  },
  {
    id: 'tea_garden',
    title: {
      as: 'চাহ বাগিচাৰ শান্ত খোজ',
      bn: 'চা বাগানে শান্ত হাঁটা',
      mni: 'Peaceful Tea Garden Walk',
      hi: 'चाय बागान में शांत सैर',
      en: 'Peaceful Tea Garden Walk',
    },
    domainLabel: {
      as: 'মনোযোগ আৰু ইন্দ্ৰিয় স্নিগ্ধতা',
      bn: 'ইন্দ্রিয় শিথিলতা ও স্নিগ্ধতা',
      mni: 'Sensory Calm & Nature',
      hi: 'इंद्रिय शांति व प्रकृति स्पर्श',
      en: 'Sensory Calm & Nature Connection',
    },
    icon: '🍃',
    badge: {
      en: 'Sensory Walk',
      hi: 'शांत सैर',
      as: 'শান্ত খোজ',
      bn: 'শান্ত হাঁটা',
      mni: 'Sensory Walk',
    },
    description: {
      as: 'সেউজীয়া বাগিচাত ফুৰক আৰু দুটি পাত এটি কলি সাবধানে সাঁচক — কোনো সময়ৰ চাপ নাই।',
      bn: 'চা বাগানের সবুজ স্নিগ্ধতায় নিজের শান্ত গতিতে দুটি পাতা একটি কুঁড়ি তুলুন।',
      mni: 'Cha bagan da tapna chatpada mana loukhat-u.',
      hi: 'हरी-भरी वादियों में शांत सैर करें और बांस की टोकरी में कोमल पत्तियां संजोएं।',
      en: 'A tranquil stroll through lush tea bushes. Pluck fresh sprigs into a bamboo basket at your own pace.',
    },
  },
  {
    id: 'routine_builder',
    title: {
      as: 'মৃদু দৈনন্দিন মুহূৰ্ত',
      bn: 'শান্ত প্রাত্যহিক মুহূর্ত',
      mni: 'Gentle Daily Moments',
      hi: 'सहज दैनिक पल व दिनचर्या',
      en: 'Gentle Daily Moments',
    },
    domainLabel: {
      as: 'দৈনিক জীৱন আৰু আশ্বস্ততা',
      bn: 'দৈনন্দিন স্বাচ্ছন্দ্য ও স্মৃতি',
      mni: 'Daily Living & Comfort',
      hi: 'दैनिक सहजता व अपनत्व',
      en: 'Circadian Comfort & Daily Living',
    },
    icon: '☀️',
    badge: {
      en: 'Daily Comfort',
      hi: 'दैनिक सहजता',
      as: 'দৈনিক শান্তি',
      bn: 'দৈনিক মুহূর্ত',
      mni: 'Daily Routine',
    },
    description: {
      as: 'পুৱাৰ গৰম চাহৰ সুগন্ধি, তুলসীৰ তলত চাকি আৰু সন্ধিয়াৰ শান্তি মনত পেলাওক।',
      bn: 'সকালের গরম চা, তুলসী তলায় প্রদীপ ও সন্ধ্যার শান্ত আবেশের মধুর স্মৃতি।',
      mni: 'Ayangba cha thakpa, sandhyada thambal thanba.',
      hi: 'सुबह की गर्मागर्म चाय, तुलसी के पास दिया और शाम की शांति के सुखद पल।',
      en: 'Anchor each part of the day with peaceful daily rituals: morning tea, tending plants, and evening lamps.',
    },
  },
  {
    id: 'family_recall',
    title: {
      as: 'পৰিয়ালৰ এলবাম আৰু আপোন স্মৃতি',
      bn: 'পারিবারিক অ্যালবাম ও মধুর স্মৃতি',
      mni: 'Family Album & Memories',
      hi: 'पारिवारिक एल्बम व आत्मीय यादें',
      en: 'Family Album & Cherished Memories',
    },
    domainLabel: {
      as: 'আত্মজীৱনীমূলক স্মৃতি আৰু স্নেহ',
      bn: 'আত্মজীবনী স্মৃতি ও পারিবারিক টান',
      mni: 'Autobiographical Love',
      hi: 'पारिवारिक आत्मीय स्नेह',
      en: 'Autobiographical Love & Kinship',
    },
    icon: '❤️',
    badge: {
      en: 'Loving Family',
      hi: 'प्रियजन',
      as: 'মৰমৰ পৰিয়াল',
      bn: 'প্রিয়জন',
      mni: 'Imunggi Nungshiba',
    },
    description: {
      as: 'আপোন সন্তান আৰু পৰিয়ালৰ মানুহৰ মৰমৰ ফটো আৰু স্মৃতিৰে হৃদয় জুৰাওক।',
      bn: 'সন্তান ও পরিবারের সদস্যদের মিষ্টি ছবি এবং স্মৃতিতে অপার আনন্দ লাভ করুন।',
      mni: 'Imunggi nungshiba mi sak photo yengba.',
      hi: 'बच्चों व परिवारजनों की प्यारी तस्वीरें और आत्मीय यादें दिल को सुकून देती हैं।',
      en: 'Spark comforting, heartfelt memories through family portraits and loving personal anecdotes.',
    },
  },
];

export const GamesHub: React.FC<GamesHubProps> = ({
  language,
  onSelectGame,
  onStartCaregiverSession,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    {
      id: 'all',
      label: {
        en: 'All Activities',
        as: 'সকলো কাৰ্যকলাপ',
        bn: 'সব কার্যকলাপ',
        hi: 'सभी गतिविधियाँ',
        mni: 'Pumba',
      }[language] || 'All Activities',
    },
    {
      id: 'heritage',
      label: {
        en: 'Heritage & Attire',
        as: 'ঐতিহ্য আৰু সাজ',
        bn: 'ঐতিহ্য ও পোশাক',
        hi: 'धरोहर व वेशभूषा',
        mni: 'Heritage',
      }[language] || 'Heritage & Attire',
    },
    {
      id: 'music',
      label: {
        en: 'Music & Melodies',
        as: 'সংগীত আৰু সুৰ',
        bn: 'সঙ্গীত ও সুর',
        hi: 'संगीत व धुनें',
        mni: 'Folk Music',
      }[language] || 'Music & Melodies',
    },
    {
      id: 'places',
      label: {
        en: 'Places & Nature',
        as: 'ঠাই আৰু প্ৰকৃতি',
        bn: 'স্থান ও প্রকৃতি',
        hi: 'प्रकृति व स्थान',
        mni: 'Nature & Places',
      }[language] || 'Places & Nature',
    },
    {
      id: 'family',
      label: {
        en: 'Family & Routine',
        as: 'পৰিয়াল আৰু দিনচৰ্যা',
        bn: 'পরিবার ও দিনলিপি',
        hi: 'परिवार व दिनचर्या',
        mni: 'Family & Routine',
      }[language] || 'Family & Routine',
    },
  ];

  const filteredGames = GAMES.filter((game) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'heritage') return game.id === 'memory_match' || game.id === 'pattern_weave';
    if (activeCategory === 'music') return game.id === 'sounds_hills';
    if (activeCategory === 'places') return game.id === 'brain_quest' || game.id === 'tea_garden';
    if (activeCategory === 'family') return game.id === 'family_recall' || game.id === 'routine_builder';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgba(70,80,60,0.05)] border border-[rgba(70,80,60,0.08)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5EBE1]/60 hover:bg-[#F5EBE1] text-[#1F342A] rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[rgba(70,80,60,0.08)]"
        >
          <ArrowLeft className="w-4 h-4 text-[#708A74]" />
          <span>{t('back', language)}</span>
        </button>

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#D9E8D8] text-[#1F342A] text-xs font-bold border border-[#708A74]/30 shadow-xs">
          <span>🌿</span>
          <span>
            {language === 'as'
              ? 'শান্ত আৰু মৰমৰ স্মৃতি কাৰ্যসূচী'
              : language === 'bn'
              ? 'শান্ত ও মধুর স্মৃতি কার্যকলাপ'
              : language === 'hi'
              ? 'शांत व आत्मीय स्मृति गतिविधियां'
              : 'Gentle Reminiscence Activities'}
          </span>
        </span>
      </div>

      {/* Caregiver-Guided Session Banner */}
      {onStartCaregiverSession && (
        <div className="bg-gradient-to-r from-[#1F342A] via-[#263F33] to-[#1F342A] p-6 sm:p-8 rounded-[28px] text-white shadow-[0_8px_30px_rgba(31,52,42,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-[#708A74]/30">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#FFF6D6] text-[#785E22]">
              <Sparkles className="w-3.5 h-3.5 text-[#785E22]" />
              <span>{t('caregiverSessionSetupTitle', language)}</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold pt-1 text-white">
              {language === 'as'
                ? 'পৰিয়াল বা শুশ্ৰূষাকাৰীৰ সৈতে শান্ত অধিবেশন আৰম্ভ কৰক'
                : language === 'bn'
                ? 'পরিবার বা পরিচর্যাকারীর সাথে শান্ত সেশন শুরু করুন'
                : language === 'hi'
                ? 'देखभालकर्ता के साथ एक शांत आत्मीय सत्र शुरू करें'
                : 'Start a Guided Session with a Caregiver or Loved One'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-normal leading-relaxed">
              {language === 'as'
                ? 'মনোভাব লক্ষ্য কৰক, উপযুক্ত কাৰ্যকলাপ বাচক আৰু একেলগে শান্ত সময় উপভোগ কৰক।'
                : language === 'bn'
                ? 'বর্তমান মানসিক অবস্থা অনুযায়ী সুন্দর কার্যকলাপ বেছে নিয়ে একসাথে সময় কাটান।'
                : language === 'hi'
                ? 'मनोदशा अनुसार उपयुक्त गतिविधि चुनें और बिना किसी तनाव के साथ समय बिताएं।'
                : 'Check in on current mood, pick the best suited reminiscence activity, and spend joyful time together.'}
            </p>
          </div>

          <button
            onClick={onStartCaregiverSession}
            className="px-6 py-3.5 bg-[#FAF6EE] hover:bg-white text-[#1F342A] font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all transform active:scale-95 cursor-pointer shrink-0 border border-white"
          >
            {t('startSessionAction', language)}
          </button>
        </div>
      )}

      {/* Main Title Strip */}
      <div className="bg-white/80 backdrop-blur-md p-6 sm:p-7 rounded-[28px] border border-[rgba(70,80,60,0.08)] shadow-[0_4px_20px_rgba(70,80,60,0.05)] space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F342A] tracking-tight">
            {t('gamesHubTitle', language)}
          </h1>
          <p className="text-xs sm:text-sm text-[#495E4F] font-medium mt-1">
            {language === 'as'
              ? 'সকলো খেল চিন্তা-মুক্ত আৰু কোনো সময়ৰ চাপ নাই। নিজৰ গতিত উপভোগ কৰক।'
              : language === 'bn'
              ? 'সব খেলা সম্পূর্ণ উদ্বেগহীন ও কোনো সময়সীমার চাপ নেই। নিজের শান্ত গতিতে খেলুন।'
              : language === 'hi'
              ? 'सभी गतिविधियां चिंतामुक्त और समय के दबाव से रहित हैं। अपनी सहज गति से यादें संजोएं।'
              : 'Designed with warmth and familiar cultural memories for joyful, pressure-free engagement.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#1F342A] text-white shadow-sm'
                  : 'bg-[#F5EBE1]/60 hover:bg-[#F5EBE1] text-[#1F342A] border border-[rgba(70,80,60,0.08)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGames.map((game, idx) => {
          // Systematically assign soft pastel cards matching Reference 1 & 2
          const cardPalettes = [
            { bg: 'bg-[#D9E8D8]/70', border: 'border-[#708A74]/30', badgeBg: 'bg-white/80', badgeText: 'text-[#1F342A]' },
            { bg: 'bg-[#FFF6D6]/70', border: 'border-[#E0D5B5]/60', badgeBg: 'bg-white/80', badgeText: 'text-[#785E22]' },
            { bg: 'bg-[#F5EBE1]/80', border: 'border-[#E8C9B8]/50', badgeBg: 'bg-white/80', badgeText: 'text-[#635343]' },
            { bg: 'bg-[#E8E1EF]/70', border: 'border-[#C8BDD5]/50', badgeBg: 'bg-white/80', badgeText: 'text-[#4F4160]' },
            { bg: 'bg-[#FDECEF]/70', border: 'border-[#F2BAC5]/50', badgeBg: 'bg-white/80', badgeText: 'text-[#9A4250]' },
          ];
          const pal = cardPalettes[idx % cardPalettes.length];

          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`group ${pal.bg} hover:brightness-102 p-6 sm:p-7 rounded-[28px] border ${pal.border} shadow-[0_4px_20px_rgba(70,80,60,0.05)] hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-white border border-[rgba(70,80,60,0.08)] group-hover:scale-105 transition-transform">
                    {game.icon}
                  </div>

                  <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full ${pal.badgeBg} ${pal.badgeText} text-xs font-bold border border-black/5 shadow-xs`}>
                    <span>{game.badge[language] || game.badge.en}</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-[#1F342A] group-hover:text-[#2A4438] transition-colors">
                  {game.title[language] || game.title.en}
                </h3>
                <div className="text-xs font-bold text-[#708A74] mt-0.5">
                  {game.domainLabel[language] || game.domainLabel.en}
                </div>

                <p className="text-xs sm:text-sm text-[#38483D] font-medium mt-2.5 leading-relaxed bg-white/40 p-3 rounded-2xl">
                  {game.description[language] || game.description.en}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[rgba(70,80,60,0.1)] flex items-center justify-between text-xs font-bold text-[#1F342A]">
                <span className="text-[#5A7360]">
                  🌸 {language === 'as' ? 'কোনো স্ক’ৰ বা চাপ নাই' : language === 'bn' ? 'কোনো স্কোর বা চাপ নেই' : language === 'hi' ? 'तनावमुक्त अनुभव' : 'Zero pressure'}
                </span>
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1F342A] text-white font-bold group-hover:bg-[#2A4438] shadow-xs transition-all">
                  <span>{t('playGameAction', language)}</span>
                  <span className="text-base group-hover:translate-x-0.5 transition-transform">➔</span>
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

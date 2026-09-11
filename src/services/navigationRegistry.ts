import { AppView, GameId, Language, NavigationIntent } from '../types';

export interface NavigationTarget {
  intent: NavigationIntent;
  view?: AppView;
  gameId?: GameId;
  language?: Language;
  openSOS?: boolean;
  openCaregiver?: boolean;
  openLanguageSelect?: boolean;
}

export interface NavigationResolution {
  isMatch: boolean;
  intent: NavigationIntent;
  target: NavigationTarget;
  message: Record<Language, string>;
  destinationName: Record<Language, string>;
}

// Fixed allowlist of valid navigation intents
export const ALLOWED_NAVIGATION_INTENTS: ReadonlySet<NavigationIntent> = new Set<NavigationIntent>([
  'OPEN_HOME',
  'OPEN_GAMES',
  'OPEN_MEMORY_MATCH',
  'OPEN_TEA_GARDEN',
  'OPEN_BRAIN_QUEST',
  'OPEN_PATTERN_WEAVE',
  'OPEN_ROUTINE_BUILDER',
  'OPEN_SOUNDS_OF_HILLS',
  'OPEN_FAMILY_RECALL',
  'OPEN_REMINDERS',
  'OPEN_FAMILY',
  'OPEN_PROGRESS',
  'OPEN_CALMING',
  'OPEN_SAFE_CARD',
  'OPEN_SARTHI',
  'CHANGE_LANGUAGE',
  'START_GAME',
  'READ_REMINDERS',
  'SHOW_PROGRESS',
  'UNKNOWN_PAGE',
]);

// Central Registry of All Application Pages
export const PAGE_REGISTRY: Record<string, {
  intent: NavigationIntent;
  target: NavigationTarget;
  name: Record<Language, string>;
  synonyms: Record<Language, string[]>;
}> = {
  HOME: {
    intent: 'OPEN_HOME',
    target: { intent: 'OPEN_HOME', view: 'home' },
    name: {
      en: 'Home Screen',
      hi: 'मुख्य पृष्ठ (होम)',
      as: 'মুখ্য পৃষ্ঠা (গৃহ)',
      bn: 'প্রধান পাতা (হোম)',
      mni: 'Mayum (Home)',
    },
    synonyms: {
      en: ['home', 'home screen', 'take me home', 'back to home', 'main page', 'start page'],
      hi: ['होम', 'घर', 'मुख्य पृष्ठ', 'वापस घर', 'घर चलो', 'घर ले चलो', 'ghar', 'ghar chalo', 'ghar le chalo', 'होम पेज'],
      as: ['ঘৰ', 'মুখ্য পৃষ্ঠা', 'ঘৰলৈ ব’লক', 'আৰম্ভণি পৃষ্ঠা', 'গৃহ', 'ghor'],
      bn: ['হোম', 'বাড়ি', 'প্রধান পাতা', 'হোমে নিয়ে চলো', 'শুরুর পাতা', 'bari'],
      mni: ['mayum', 'home', 'mayumda chatse', 'mayumda chatpa', 'main page'],
    },
  },
  GAMES: {
    intent: 'OPEN_GAMES',
    target: { intent: 'OPEN_GAMES', view: 'games' },
    name: {
      en: 'Cognitive Games Hub',
      hi: 'संज्ञानात्मक खेल केंद्र',
      as: 'মগজুৰ খেল কেন্দ্ৰ',
      bn: 'মস্তিষ্কের খেলা হাব',
      mni: 'Pukninggi Game Hub',
    },
    synonyms: {
      en: ['games', 'play a game', 'take me to my games', 'all games', 'cognitive games', 'brain games', 'play games'],
      hi: ['खेल', 'सारे खेल', 'खेल खेलें', 'दिमागी खेल', 'गेम्स', 'मुझे खेल दिखाओ'],
      as: ['খেল', 'খেললৈ ব’লক', 'সকলো খেল', 'মগজুৰ খেল', 'খেলিবলৈ বিচাৰোঁ'],
      bn: ['খেলা', 'সব খেলা', 'খেলা খেলব', 'মস্তিষ্কের খেলা', 'গেমস হাব'],
      mni: ['game', 'game sasi', 'game sing', 'pukninggi game'],
    },
  },
  MEMORY_MATCH: {
    intent: 'OPEN_MEMORY_MATCH',
    target: { intent: 'OPEN_MEMORY_MATCH', view: 'game_detail', gameId: 'memory_match' },
    name: {
      en: 'Memory Match',
      hi: 'स्मृति मिलान (मेमोरी मैच)',
      as: 'স্মৃতি মিলন',
      bn: 'স্মৃতি মেলানো',
      mni: 'Ningsingba Tinba',
    },
    synonyms: {
      en: ['memory match', 'memory game', 'card match', 'card flip', 'match cards'],
      hi: ['मेमोरी मैच', 'कार्ड मिलान', 'स्मृति खेल', 'याददाश्त खेल'],
      as: ['স্মৃতি মিলন', 'কাৰ্ড মিলন', 'পাত ওলোটোৱা খেল'],
      bn: ['স্মৃতি মেলানো', 'কার্ড মেলানো', 'মেমোরি কার্ড'],
      mni: ['memory match', 'ningsingba game', 'card match'],
    },
  },
  TEA_GARDEN: {
    intent: 'OPEN_TEA_GARDEN',
    target: { intent: 'OPEN_TEA_GARDEN', view: 'game_detail', gameId: 'tea_garden' },
    name: {
      en: 'Tea Garden Focus',
      hi: 'चाय बागान ध्यान (टी गार्डन)',
      as: 'চাহ বাগিচাৰ মনোযোগ',
      bn: 'চা বাগানের মনোযোগ',
      mni: 'Cha Bagan Focus',
    },
    synonyms: {
      en: ['tea garden', 'tea garden focus', 'tea leaf', 'pluck leaves', 'caterpillar game'],
      hi: ['चाय बागान', 'पत्ती चुनना', 'टी गार्डन', 'ध्यान खेल'],
      as: ['চাহ বাগিচা', 'চাহ পাত', 'পাত চিঙা', 'পলু খেল'],
      bn: ['চা বাগান', 'চা পাতা তোলা', 'টি গার্ডেন ফোকাস'],
      mni: ['tea garden', 'cha bagan', 'mana loukhatpa'],
    },
  },
  BRAIN_QUEST: {
    intent: 'OPEN_BRAIN_QUEST',
    target: { intent: 'OPEN_BRAIN_QUEST', view: 'game_detail', gameId: 'brain_quest' },
    name: {
      en: 'Brain Quest Puzzles',
      hi: 'ब्रेन क्वेस्ट पहेलियां',
      as: 'বুদ্ধিৰ সন্ধান (ধাঁধা)',
      bn: 'বুদ্ধির ধাঁধা (ব্রেন কোয়েস্ট)',
      mni: 'Pukninggi Paheli',
    },
    synonyms: {
      en: ['brain quest', 'puzzles', 'riddles', 'quiz', 'trivia', 'word puzzle'],
      hi: ['ब्रेन क्वेस्ट', 'पहेली', 'पहेलियां', 'प्रश्नोत्तरी', 'क्विज'],
      as: ['বুদ্ধিৰ সন্ধান', 'ধাঁধা', 'প্ৰশ্নোত্তৰ', 'কুইজ'],
      bn: ['ব্রেন কোয়েস্ট', 'ধাঁধা', 'কুইজ', 'পাজল'],
      mni: ['brain quest', 'paheli', 'puzzle', 'wahang'],
    },
  },
  PATTERN_WEAVE: {
    intent: 'OPEN_PATTERN_WEAVE',
    target: { intent: 'OPEN_PATTERN_WEAVE', view: 'game_detail', gameId: 'pattern_weave' },
    name: {
      en: 'Pattern Weave',
      hi: 'पैटर्न बुनाई (लूम)',
      as: 'তাঁতশালৰ চানেকি',
      bn: 'তাঁতশাল নকশা (প্যাটার্ন বুনন)',
      mni: 'Yongkham Phanek Mayek',
    },
    synonyms: {
      en: ['pattern weave', 'weave pattern', 'loom', 'textile pattern', 'assamese loom'],
      hi: ['पैटर्न बुनाई', 'तांत', 'करघा', 'डिजाइन बुनाई', 'पैटर्न वीव'],
      as: ['তাঁতশাল', 'চানেকি', 'তাঁতৰ খেল', 'শালৰ চানেকি'],
      bn: ['প্যাটার্ন বুনন', 'তাঁতের নকশা', 'তাঁতশাল খেলা'],
      mni: ['pattern weave', 'yongkham', 'phanek mayek'],
    },
  },
  ROUTINE_BUILDER: {
    intent: 'OPEN_ROUTINE_BUILDER',
    target: { intent: 'OPEN_ROUTINE_BUILDER', view: 'game_detail', gameId: 'routine_builder' },
    name: {
      en: 'Routine Builder',
      hi: 'दिनचर्या क्रम (रूटीन बिल्डर)',
      as: 'দিনচৰ্যা সজোৱা',
      bn: 'দৈনন্দিন রুটিন সাজানো',
      mni: 'Nongma Panba Routine',
    },
    synonyms: {
      en: ['routine builder', 'daily routine', 'time order', 'arrange routine', 'schedule game'],
      hi: ['दिनचर्या', 'रूटीन बिल्डर', 'समय क्रम', 'दिन के काम'],
      as: ['দিনচৰ্যা', 'কামৰ ক্ৰম', 'সময় অনুক্ৰম', 'দিনটোৰ তালিকা'],
      bn: ['রুটিন বিল্ডার', 'কাজের ক্রম', 'দৈনন্দিন রুটিন'],
      mni: ['routine builder', 'routine', 'thabakki order'],
    },
  },
  SOUNDS_OF_HILLS: {
    intent: 'OPEN_SOUNDS_OF_HILLS',
    target: { intent: 'OPEN_SOUNDS_OF_HILLS', view: 'game_detail', gameId: 'sounds_hills' },
    name: {
      en: 'Sounds of the Hills',
      hi: 'पहाड़ों की धुनें (साउंड्स)',
      as: 'পাহাৰৰ সুৰ-ধ্বনি',
      bn: 'পাহাড়ের সুর ও ধ্বনি',
      mni: 'Chinggi Khonjel',
    },
    synonyms: {
      en: ['sounds of the hills', 'sounds', 'audio game', 'flute sound', 'pepa', 'dhol', 'music game'],
      hi: ['पहाड़ों की धुनें', 'आवाजें', 'संगीत खेल', 'ध्वनि पहचान', 'ढोल', 'बांसुरी'],
      as: ['পাহাৰৰ সুৰ', 'ধ্বনি', 'পেঁপা', 'ঢোল', 'বাদ্যযন্ত্ৰৰ মাত'],
      bn: ['পাহাড়ের সুর', 'শব্দ খেলা', 'বাঁশি ও ঢোল', 'বাদ্যযন্ত্র'],
      mni: ['sounds of hills', 'chinggi khonjel', 'khonjel game'],
    },
  },
  FAMILY_RECALL: {
    intent: 'OPEN_FAMILY_RECALL',
    target: { intent: 'OPEN_FAMILY_RECALL', view: 'game_detail', gameId: 'family_recall' },
    name: {
      en: 'Family Recall',
      hi: 'परिवार पहचान (फ़ैमिली रिकॉल)',
      as: 'পৰিয়াল চিনাকী',
      bn: 'পরিবার পরিচিতি (রিকল)',
      mni: 'Imunggi Mee Sak-Khangba',
    },
    synonyms: {
      en: ['family recall', 'family memories', 'identify family', 'family photo game', 'face recall'],
      hi: ['परिवार पहचान', 'परिवार की यादें', 'फ़ैमिली रिकॉल', 'अपनों को पहचानना'],
      as: ['পৰিয়াল চিনাকী', 'পৰিয়ালৰ খেল', 'আপোনজনক চিনাক্ত'],
      bn: ['পরিবার পরিচিতি', 'পরিবারের মুখ চেনা', 'পারিবারিক স্মৃতি'],
      mni: ['family recall', 'imunggi mee', 'family memories'],
    },
  },
  REMINDERS: {
    intent: 'OPEN_REMINDERS',
    target: { intent: 'OPEN_REMINDERS', view: 'reminders' },
    name: {
      en: 'Medication & Hydration Reminders',
      hi: 'दवा व जल अनुस्मारक (रिमाइंडर)',
      as: 'ঔষধ আৰু পানী খোৱাৰ নিয়ম',
      bn: 'ওষুধ ও পানি পানের রুটিন',
      mni: 'Hidak amsung Ishing Ningsingba',
    },
    synonyms: {
      en: ['reminders', 'medicines', 'medication', 'my medicines', 'hydration', 'water', 'glasses of water', 'open reminders', 'pills'],
      hi: ['दवा', 'दवाइयां', 'पानी', 'जल', 'रिमाइंडर', 'मेरी दवाइयां', 'पानी का नियम'],
      as: ['ঔষধ', 'পানী', 'স্মাৰক', 'মোৰ ঔষধ', 'নিয়ম', 'দৰব'],
      bn: ['ওষুধ', 'পানি', 'রিমাইন্ডার', 'আমার ওষুধ', 'জল খাবার নিয়ম'],
      mni: ['hidak', 'ishing', 'reminders', 'eigi hidak'],
    },
  },
  FAMILY: {
    intent: 'OPEN_FAMILY',
    target: { intent: 'OPEN_FAMILY', view: 'family' },
    name: {
      en: 'Family Memories & Directory',
      hi: 'पारिवारिक स्मृतियां व निर्देशिका',
      as: 'পৰিয়ালৰ স্মৃতি আৰু সম্ভাৰ',
      bn: 'পারিবারিক স্মৃতি ও ডিরেক্টরি',
      mni: 'Imunggi Ningsing Potlam',
    },
    synonyms: {
      en: ['family', 'family members', 'family photos', 'family album', 'relatives', 'open family'],
      hi: ['परिवार', 'पारिवारिक फोटो', 'परिवार के सदस्य', 'रिश्तेदार', 'फ़ैमिली'],
      as: ['পৰিয়াল', 'পৰিয়ালৰ সদস্যসকল', 'ফটো এলবাম', 'আপোন মানুহ'],
      bn: ['পরিবার', 'পরিবারের সদস্যরা', 'ফ্যামিলি অ্যালবাম', 'আত্মীয়'],
      mni: ['imung', 'family', 'imunggi photo'],
    },
  },
  PROGRESS: {
    intent: 'SHOW_PROGRESS',
    target: { intent: 'SHOW_PROGRESS', openCaregiver: true },
    name: {
      en: 'Progress & Caregiver Command Hub',
      hi: 'प्रगति व देखभालकर्ता डैशबोर्ड',
      as: 'অগ্ৰগতি আৰু পৰিচৰ্যাকৰ্তা কেন্দ্ৰ',
      bn: 'অগ্রগতি ও কেয়ারগিভার ড্যাশবোর্ড',
      mni: 'Progress & Caregiver Hub',
    },
    synonyms: {
      en: ['progress', 'show progress', 'how am i doing', 'caregiver', 'caregiver dashboard', 'my score', 'analytics', 'report'],
      hi: ['प्रगति', 'मेरी प्रगति', 'मैं कैसा कर रहा हूँ', 'केयरगिवर', 'रिपोर्ट', 'स्कोर'],
      as: ['অগ্ৰগতি', 'মই কেনে কৰিছোঁ', 'পৰিচৰ্যাকৰ্তা', 'প্ৰতিবেদন', 'স্ক’ৰ'],
      bn: ['অগ্রগতি', 'আমি কেমন করছি', 'কেয়ারগিভার', 'রিপোর্ট', 'ড্যাশবোর্ড'],
      mni: ['progress', 'eihak kamdouribage', 'caregiver', 'report'],
    },
  },
  CALMING: {
    intent: 'OPEN_CALMING',
    target: { intent: 'OPEN_CALMING', view: 'calming' },
    name: {
      en: 'Calming Sanctuary',
      hi: 'शांति धाम (काल्मिंग सैंक्चुअरी)',
      as: 'প্ৰশান্তি কেন্দ্ৰ',
      bn: 'প্রশান্তি কুঞ্জ',
      mni: 'Ining-Tamba Mafam',
    },
    synonyms: {
      en: ['calm', 'calming', 'calming sanctuary', 'peace', 'relax', 'breathing', 'rest mode'],
      hi: ['शांति', 'विश्राम', 'आराम', 'श्वास ध्यान', 'काल्मिंग'],
      as: ['প্ৰশান্তি', 'বিৰতি', 'আৰাম', 'শান্ত মন', 'উশাহ-নিশাহ'],
      bn: ['প্রশান্তি', 'শান্তি', 'বিশ্রাম', 'শ্বাসক্রিয়া', 'রিল্যাক্স'],
      mni: ['calming', 'ining-tamba', 'pottha-fam'],
    },
  },
  SAFE_CARD: {
    intent: 'OPEN_SAFE_CARD',
    target: { intent: 'OPEN_SAFE_CARD', openSOS: true, view: 'emergency' },
    name: {
      en: 'Emergency Safe Card / SOS',
      hi: 'आपातकालीन सहायता कार्ड (SOS)',
      as: 'জৰুৰীকালীন সুৰক্ষা কাৰ্ড (SOS)',
      bn: 'জরুরি সুরক্ষা কার্ড (SOS)',
      mni: 'Akanba Matamgi Safe Card',
    },
    synonyms: {
      en: ['emergency', 'sos', 'safe card', 'help me', 'call help', 'ambulance', 'police'],
      hi: ['आपातकाल', 'मदद', 'एसओएस', 'सेफ कार्ड', 'सहायता'],
      as: ['জৰুৰীকালীন', 'সহায় কৰক', 'এছঅ’এছ', 'সুৰক্ষা কাৰ্ড'],
      bn: ['জরুরি', 'সাহায্য', 'এসওএস', 'সেফ কার্ড'],
      mni: ['emergency', 'mateng pangbiyu', 'sos', 'safe card'],
    },
  },
};

/**
 * Validates whether an intent string is in the authorized fixed allowlist.
 */
export function isValidNavigationIntent(intent: string): intent is NavigationIntent {
  return ALLOWED_NAVIGATION_INTENTS.has(intent as NavigationIntent);
}

/**
 * Deterministically resolves natural-language navigation query into a safe, typed intent.
 * Works completely offline and guarantees zero arbitrary execution.
 */
export function resolveNavigationIntent(query: string, language: Language): NavigationResolution {
  const lower = query.trim().toLowerCase();

  // 1. Language Change Intents
  if (lower.includes('assamese') || lower.includes('অসমীয়া') || lower.includes('axomiya')) {
    return {
      isMatch: true,
      intent: 'CHANGE_LANGUAGE',
      target: { intent: 'CHANGE_LANGUAGE', language: 'as' },
      message: {
        en: 'Switching language to Assamese (অসমীয়া).',
        hi: 'भाषा को असमिया (অসমীয়া) में बदला जा रहा है।',
        as: 'ভাষা অসমীয়ালৈ পৰিৱৰ্তন কৰা হ’ল।',
        bn: 'ভাষা অসমীয়াতে পরিবর্তন করা হলো।',
        mni: 'Lon Assamese da hongle.',
      },
      destinationName: {
        en: 'Assamese Language',
        hi: 'असमिया भाषा',
        as: 'অসমীয়া ভাষা',
        bn: 'অসমীয়া ভাষা',
        mni: 'Assamese Lon',
      },
    };
  }

  if (lower.includes('bengali') || lower.includes('বাংলা') || lower.includes('bangla')) {
    return {
      isMatch: true,
      intent: 'CHANGE_LANGUAGE',
      target: { intent: 'CHANGE_LANGUAGE', language: 'bn' },
      message: {
        en: 'Switching language to Bengali (বাংলা).',
        hi: 'भाषा को बंगाली (বাংলা) में बदला जा रहा है।',
        as: 'ভাষা বাংলালৈ সলনি কৰা হ’ল।',
        bn: 'ভাষা বাংলাতে পরিবর্তন করা হলো।',
        mni: 'Lon Bengali da hongle.',
      },
      destinationName: {
        en: 'Bengali Language',
        hi: 'बंगाली भाषा',
        as: 'বাংলা ভাষা',
        bn: 'বাংলা ভাষা',
        mni: 'Bengali Lon',
      },
    };
  }

  if (lower.includes('hindi') || lower.includes('हिन्दी') || lower.includes('हिंदी')) {
    return {
      isMatch: true,
      intent: 'CHANGE_LANGUAGE',
      target: { intent: 'CHANGE_LANGUAGE', language: 'hi' },
      message: {
        en: 'Switching language to Hindi (हिन्दी).',
        hi: 'भाषा को हिन्दी में बदला जा रहा है।',
        as: 'ভাষা হিন্দীলৈ সলনি কৰা হ’ল।',
        bn: 'ভাষা হিন্দিতে পরিবর্তন করা হলো।',
        mni: 'Lon Hindi da hongle.',
      },
      destinationName: {
        en: 'Hindi Language',
        hi: 'हिन्दी भाषा',
        as: 'হিন্দী ভাষা',
        bn: 'হিন্দি ভাষা',
        mni: 'Hindi Lon',
      },
    };
  }

  if (lower.includes('manipuri') || lower.includes('meiteilon') || lower.includes('মৈতৈ')) {
    return {
      isMatch: true,
      intent: 'CHANGE_LANGUAGE',
      target: { intent: 'CHANGE_LANGUAGE', language: 'mni' },
      message: {
        en: 'Switching language to Manipuri (মৈতৈলোন্).',
        hi: 'भाषा को मणिपुरी में बदला जा रहा है।',
        as: 'ভাষা মণিপুৰীলৈ সলনি কৰা হ’ল।',
        bn: 'ভাষা মণিপুরীতে পরিবর্তন করা হলো।',
        mni: 'Lon Manipuri da hongle.',
      },
      destinationName: {
        en: 'Manipuri Language',
        hi: 'मणिपुरी भाषा',
        as: 'মণিপুৰী ভাষা',
        bn: 'মণিপুরী ভাষা',
        mni: 'Manipuri Lon',
      },
    };
  }

  if (lower.includes('english') || lower.includes('अंग्रेजी') || lower.includes('ইংৰাজী')) {
    return {
      isMatch: true,
      intent: 'CHANGE_LANGUAGE',
      target: { intent: 'CHANGE_LANGUAGE', language: 'en' },
      message: {
        en: 'Switching language to English.',
        hi: 'भाषा को अंग्रेजी (English) में बदला जा रहा है।',
        as: 'ভাষা ইংৰাজীলৈ সলনি কৰা হ’ল।',
        bn: 'ভাষা ইংরেজিতে পরিবর্তন করা হলো।',
        mni: 'Lon English da hongle.',
      },
      destinationName: {
        en: 'English Language',
        hi: 'अंग्रेजी भाषा',
        as: 'ইংৰাজী ভাষা',
        bn: 'ইংরেজি ভাষা',
        mni: 'English Lon',
      },
    };
  }

  // 2. Specific Page Matchers in Page Registry (longest synonym match wins)
  const matches: { page: typeof PAGE_REGISTRY[string]; synonym: string }[] = [];
  for (const page of Object.values(PAGE_REGISTRY)) {
    for (const langSynonyms of Object.values(page.synonyms)) {
      for (const synonym of langSynonyms) {
        if (synonym && lower.includes(synonym.toLowerCase())) {
          matches.push({ page, synonym });
        }
      }
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.synonym.length - a.synonym.length);
    const best = matches[0].page;
    return {
      isMatch: true,
      intent: best.intent,
      target: best.target,
      message: {
        en: `Opening ${best.name.en} for you now.`,
        hi: `आपके लिए ${best.name.hi} खोला जा रहा है।`,
        as: `আপোনাৰ বাবে ${best.name.as} মুকলি কৰা হৈছে।`,
        bn: `আপনার জন্য ${best.name.bn} খোলা হচ্ছে।`,
        mni: `Nanggi damak ${best.name.mni} hangdokle.`,
      },
      destinationName: best.name,
    };
  }

  // 3. Navigation keywords that are unknown/non-existent
  const isNavigationalQuery =
    lower.includes('take me to') ||
    lower.includes('open') ||
    lower.includes('go to') ||
    lower.includes('show me') ||
    lower.includes('kholo') ||
    lower.includes('chalo') ||
    lower.includes('mukoli') ||
    lower.includes('jao');

  if (isNavigationalQuery) {
    return {
      isMatch: false,
      intent: 'UNKNOWN_PAGE',
      target: { intent: 'OPEN_HOME', view: 'home' },
      message: {
        en: "I can't find that section yet, but I can take you to your home screen.",
        hi: "मुझे अभी वह अनुभाग नहीं मिला, लेकिन मैं आपको आपके मुख्य पृष्ठ (होम) पर ले जा सकता हूँ।",
        as: "মই এতিয়াও সেই ভাগটো বিচাৰি পোৱা নাই, কিন্তু মই আপোনাক ঘৰৰ মুখ্য পৃষ্ঠালৈ লৈ যাব পাৰোঁ।",
        bn: "আমি এখনও সেই বিভাগটি খুঁজে পাইনি, তবে আমি আপনাকে মূল পাতায় নিয়ে যেতে পারি।",
        mni: "Eihak saruk adu thengnaba ngamdre, adubu eikhoina mayum (home) da chatpa yai.",
      },
      destinationName: {
        en: 'Home Screen (Fallback)',
        hi: 'मुख्य पृष्ठ (होम)',
        as: 'মুখ্য পৃষ্ঠা',
        bn: 'প্রধান পাতা',
        mni: 'Mayum (Home)',
      },
    };
  }

  // Non-navigational query
  return {
    isMatch: false,
    intent: 'OPEN_HOME',
    target: { intent: 'OPEN_HOME', view: 'home' },
    message: {
      en: 'No navigation action requested.',
      hi: 'कोई नेविगेशन अनुरोध नहीं है।',
      as: 'কোনো চলাচলৰ অনুৰোধ নাই।',
      bn: 'কোনো নেভিগেশন অনুরোধ নেই।',
      mni: 'Navigation thabak leite.',
    },
    destinationName: {
      en: 'None',
      hi: 'कोई नहीं',
      as: 'নাই',
      bn: 'নেই',
      mni: 'Leite',
    },
  };
}

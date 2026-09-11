import { Language, SafetyCategory, SarthiHealthCard } from '../types';

export interface SafetyClassificationResult {
  category: SafetyCategory;
  isHighRisk: boolean;
  predefinedMessage?: Record<Language, string>;
  healthCard?: SarthiHealthCard;
  suggestedAction?: 'CAREGIVER' | 'SAFE_CARD' | 'DOCTOR' | 'NONE';
  openSOS?: boolean;
}

// ==========================================
// PREDEFINED HIGH-RISK SAFETY RESPONSES
// ==========================================

const EMERGENCY_RESPONSE: Record<Language, string> = {
  en: "This appears to be an emergency situation. Sarthi is not an emergency response service or doctor. Please immediately call 112 (National Emergency Helpline) or 108 (Ambulance), or tap the Emergency Safe Card to alert your family caregiver right away.",
  hi: "यह एक आपातकालीन स्थिति प्रतीत होती है। सारथी डॉक्टर या आपातकालीन सेवा नहीं है। कृपया तुरंत 112 (राष्ट्रीय आपातकालीन हेल्पलाइन) या 108 (एम्बुलेंस) पर कॉल करें, या अपने परिजन को तुरंत सूचित करने के लिए आपातकालीन सेफ़ कार्ड खोलें।",
  as: "এইটো এটা জৰুৰীকালীন অৱস্থা যেন লাগিছে। সাৰথী চিকিৎসক নহয়। অনুগ্ৰহ কৰি লগে লগে ১১২ (ৰাষ্ট্ৰীয় জৰুৰীকালীন নম্বৰ) বা ১০৮ (এম্বুলেন্স)ত ফোন কৰক, অথবা পৰিয়ালক জনাবলৈ জৰুৰীকালীন সুৰক্ষা কাৰ্ডখন খোলক।",
  bn: "এটি একটি জরুরি পরিস্থিতি বলে মনে হচ্ছে। সারথী কোনো চিকিৎসক বা জরুরি সেবা নয়। অনুগ্রহ করে অবিলম্বে ১১২ (জাতীয় জরুরি হেল্পলাইন) বা ১০৮ (অ্যাম্বুলেন্স)-এ কল করুন, অথবা পরিবারকে জানাতে জরুরি সেফ কার্ড খুলুন।",
  mni: "Masi akanba emergency oiba tanja amani. Sarthi asi doctor natte. Chanbiduna thouna 112 nattraga 108 da call toubiyu, nattraga caregiver da pao piba damak Safe Card hangdokpiyu.",
};

const POTENTIALLY_URGENT_RESPONSE: Record<Language, string> = {
  en: "Sudden or acute confusion, sudden disorientation, or abrupt changes in alertness are not a typical gradual pattern and may indicate an acute medical condition (such as an infection, metabolic change, or medication reaction). Sarthi recommends seeking urgent in-person medical evaluation from a doctor or hospital clinic immediately. Please notify your caregiver now.",
  hi: "अचानक भ्रम की स्थिति, अचानक असमंजस, या मानसिक सतर्कता में अचानक बदलाव सामान्य धीमा बदलाव नहीं होता। यह किसी गंभीर शारीरिक समस्या (जैसे संक्रमण, निर्जलीकरण, या दवा की प्रतिक्रिया) का संकेत हो सकता है। कृपया बिना देर किए किसी डॉक्टर या अस्पताल से तत्काल परामर्श लें। अपने परिजन को तुरंत बताएं।",
  as: "হঠাৎ দেখা দিয়া বিভ্ৰান্তি বা আচৰণৰ হঠকাৰী পৰিৱৰ্তন কোনো স্বাভাৱিক কথা নহয়। ই কোনো তীব্ৰ শাৰীৰিক সমস্যাৰ (যেনে সংক্ৰমণ বা ঔষধৰ প্ৰতিক্ৰিয়া) লক্ষণ হ’ব পাৰে। সাৰথীয়ে অনুৰোধ কৰে যে পলম নকৰি লগে লগে এজন চিকিৎসক বা নিকটতম চিকিৎসালয়লৈ যাওক। পৰিচৰ্যাকৰ্তাক এতিয়াই জনাওক।",
  bn: "হঠাৎ মারাত্মক বিভ্রান্তি বা সচেতনতার আকস্মিক পরিবর্তন কোনো সাধারণ ধীর পরিবর্তন নয়। এটি কোনো তীব্র শারীরিক সমস্যার (যেমন সংক্রমণ বা ওষুধের প্রতিক্রিয়া) লক্ষণ হতে পারে। কোনো প্রকার বিলম্ব না করে অবিলম্বে একজন চিকিৎসক বা জরুরি ক্লিনিকের পরামর্শ নিন। আপনার পরিচর্যাকারীকে এখনই জানান।",
  mni: "Hek khanghandana pukning khangba leitaba nattraga akay-ashang thokpa asi akonba lanna touba natte. Masi amuktada laanba asengba anabagi khamkhairakpa oiba yai. Chanbiduna thouna doctor da unanaba chatpiyu amsung caregiver da pao pibiyu.",
};

const MEDICATION_DOSAGE_SAFE_REFUSAL: Record<Language, string> = {
  en: "Sarthi is an AI cognitive companion, not a doctor or pharmacist. I cannot recommend changing your medication dosage, altering schedules, or stopping any prescribed medicine. Please consult your treating doctor or licensed pharmacist directly before making any adjustments to your medications.",
  hi: "सारथी एक संज्ञानात्मक साथी है, डॉक्टर या फार्मासिस्ट नहीं। मैं दवा की खुराक बदलने, दवा बंद करने या नए पर्चे की सलाह नहीं दे सकता। कृपया अपनी दवाओं में किसी भी बदलाव से पहले अपने डॉक्टर या फार्मासिस्ट से सीधा परामर्श लें।",
  as: "সাৰথী এগৰাকী সহায়কহে, চিকিৎসক বা ঔষধ বিশেষজ্ঞ নহয়। ঔষধৰ মাত্ৰা সালসলনি কৰা, ঔষধ বন্ধ কৰা বা সলনি কৰাৰ পৰামৰ্শ মই দিব নোৱাৰোঁ। অনুগ্ৰহ কৰি ঔষধৰ কোনো সালসলনি কৰাৰ আগতে আপোনাৰ চিকিৎসকৰ সৈতে পোনপটীয়াকৈ আলোচনা কৰক।",
  bn: "সারথী একটি সহায়ক সঙ্গী, কোনো ডাক্তার বা ফার্মাসিস্ট নয়। আমি ওষুধের ডোজ পরিবর্তন করা, ওষুধ বন্ধ করা বা কোনো প্রেসক্রিপশন পরিবর্তনের পরামর্শ দিতে পারি না। ওষুধে কোনো পরিবর্তন করার আগে অবশ্যই আপনার চিকিৎসকের সাথে কথা বলুন।",
  mni: "Sarthi asi sangyanatmak companion ni, doctor natte. Hidakki dosage hongdokpa nattraga leppa eina yaba natte. Chanbiduna nanggidamak hidak hongbagi thabak pumnamak nanggida yengliba doctor da hangbiyu.",
};

// =========================================================================
// CURATED MULTILINGUAL OFFLINE HEALTH KNOWLEDGE BASE (THE 8 CORE QUESTIONS)
// =========================================================================

export interface HealthTopicDefinition {
  id: string;
  keywords: string[];
  title: Record<Language, string>;
  card: Record<Language, SarthiHealthCard>;
}

export const OFFLINE_HEALTH_TOPICS: HealthTopicDefinition[] = [
  // 1. What is dementia?
  {
    id: 'what_is_dementia',
    keywords: ['what is dementia', 'dementia kya hai', 'dementia ki', 'dementia mane ki', 'dementia'],
    title: {
      en: 'Understanding Dementia',
      hi: 'डिमेंशिया को समझना',
      as: 'ডিমেনচিয়াৰ বিষয়ে বুজো আহক',
      bn: 'ডিমেনশিয়া সম্পর্কে জানুন',
      mni: 'Dementia gi Maramda',
    },
    card: {
      en: {
        title: 'Understanding Dementia',
        whatItMeans: 'Dementia is an umbrella term for conditions where changes in brain function affect memory, thinking, language, and everyday tasks beyond typical aging.',
        whyItMatters: 'Recognizing these changes helps families provide patient support, adapt home routines, and maintain independence with compassionate care.',
        whatYouCanDo: 'Keep daily routines consistent, enjoy gentle mental exercises (like memory matching), stay socially connected with loved ones, and hydrate well.',
        whenToAskForHelp: 'If forgetfulness frequently disrupts daily activities like taking meals or handling finances, a comprehensive evaluation by a neurologist is recommended.',
      },
      hi: {
        title: 'डिमेंशिया को समझना',
        whatItMeans: 'डिमेंशिया एक सामान्य शब्द है जो याददाश्त, सोचने-समझने की क्षमता और दैनिक कार्यों में सामान्य उम्र से अधिक आने वाले परिवर्तनों का वर्णन करता है।',
        whyItMatters: 'इसे समझने से परिवारजन उचित देखभाल, शांत वातावरण और सुरक्षित दिनचर्या तैयार कर सकते हैं।',
        whatYouCanDo: 'नियमित दिनचर्या रखें, हल्के दिमागी खेल खेलें, अपनों से बातें करें और पर्याप्त पानी पिएं।',
        whenToAskForHelp: 'यदि भूलने की आदत रोज़मर्रा के ज़रूरी कामों को प्रभावित करने लगे, तो डॉक्टर से सलाह लें।',
      },
      as: {
        title: 'ডিমেনচিয়াৰ বিষয়ে বুজো আহক',
        whatItMeans: 'ডিমেনচিয়া হৈছে স্মৃতিশক্তি, চিন্তা কৰাৰ ক্ষমতা আৰু দৈনন্দিন কাম-কাজত স্বাভাৱিক বয়সতকৈ বেছি পৰিৱৰ্তন হোৱা অৱস্থাৰ এক সামূহিক নাম।',
        whyItMatters: 'ই কোনো হঠাতে ঘটা ঘটনা নহয়; ইয়াৰ বিষয়ে জানিলে পৰিয়ালৰ লোকে মৰম আৰু সহমৰ্মিতাৰে সহায় কৰিব পাৰে।',
        whatYouCanDo: 'দিনটোৰ সময়সূচী ঠিক ৰাখক, নিয়মীয়াকৈ সহজ মগজুৰ খেল খেলক, পৰিয়ালৰ সৈতে কথা পাতক আৰু পৰ্যাপ্ত পানী খাওক।',
        whenToAskForHelp: 'যদি পাহৰি যোৱা স্বভাৱে দৈনন্দিন কামত বাধা সৃষ্টি কৰে, তেন্তে চিকিৎসকৰ পৰামৰ্শ লওক।',
      },
      bn: {
        title: 'ডিমেনশিয়া সম্পর্কে জানুন',
        whatItMeans: 'ডিমেনশিয়া হলো স্মৃতিশক্তি, চিন্তাভাবনা ও প্রতিদিনের কাজকর্মের পরিবর্তনের একটি সাধারণ চিকিৎসাগত বর্ণনা যা স্বাভাবিক বয়োবৃদ্ধির চেয়ে বেশি।',
        whyItMatters: 'সঠিক সময়ে বুঝতে পারলে পরিজনরা রোগীকে শান্ত ও আরামদায়ক পরিবেশে সমর্থন দিতে পারেন।',
        whatYouCanDo: 'নিয়মিত রুটিন মেনে চলুন, হালকা খেলা বা ধাঁধায় মন দিন, প্রিয়জনদের সাথে সময় কাটান এবং পর্যাপ্ত পানি পান করুন।',
        whenToAskForHelp: 'ভুলে যাওয়ার কারণে যদি নিজের কাজ সামলাতে সমস্যা হয়, তবে বিশেষজ্ঞ ডাক্তারের সাথে কথা বলুন।',
      },
      mni: {
        title: 'Dementia gi Maramda',
        whatItMeans: 'Dementia haibasi ningsingba, wakhal khalliba amsung nongmagi thabakta ahanba matamda thokpa ahenba akayba singbu khangnei.',
        whyItMatters: 'Masi khangbana imung-manungna khudingmak nungsina mateng pangba ngammi.',
        whatYouCanDo: 'Nongmagi routine fajana toubiyu, game sasi, mee singga wari sasi amsung ishing thakpiyu.',
        whenToAskForHelp: 'Nongmagi thabak toubada ningsingdaba maramna asoiba thoklaklabadi doctor da utpiyu.',
      },
    },
  },

  // 2. What is Alzheimer's disease?
  {
    id: 'what_is_alzheimers',
    keywords: ['what is alzheimer', "alzheimer's disease", 'alzheimers', 'alzheimer kya hai', 'alzheimer ki'],
    title: {
      en: "Understanding Alzheimer's",
      hi: "अल्जाइमर रोग को समझना",
      as: "এলঝেইমাৰ ৰোগৰ বিষয়ে",
      bn: "অ্যালঝাইমার্স রোগ সম্পর্কে",
      mni: "Alzheimer gi Maramda",
    },
    card: {
      en: {
        title: "Understanding Alzheimer's",
        whatItMeans: "Alzheimer's is the most common specific cause of dementia, characterized by gradual changes in brain areas that govern short-term memory and learning.",
        whyItMatters: "Understanding that it is a physical condition helps reduce blame, frustration, and anxiety for both elders and their families.",
        whatYouCanDo: "Focus on visual cues (like photo memories and familiar routines), simple joyful activities, gentle physical walks, and structured reminders.",
        whenToAskForHelp: "When familiar routes in your neighborhood or names of very close family members become difficult to recall consistently.",
      },
      hi: {
        title: 'अल्जाइमर रोग को समझना',
        whatItMeans: 'अल्जाइमर डिमेंशिया का सबसे सामान्य रूप है, जिसमें मस्तिष्क के वे हिस्से धीरे-धीरे प्रभावित होते हैं जो नई यादें बनाने में मदद करते हैं।',
        whyItMatters: 'यह समझना ज़रूरी है कि यह एक शारीरिक स्थिति है, ताकि बुज़ुर्गों पर किसी तरह का मानसिक दबाव या गुस्सा न आए।',
        whatYouCanDo: 'तस्वीरों से यादें ताज़ा करें, आसान पारिवारिक खेल खेलें, सुबह टहलें और शांत वातावरण में रहें।',
        whenToAskForHelp: 'यदि अपने घर के आस-पास का रास्ता या बहुत करीबी लोगों के नाम बार-बार भूलने लगें, तो डॉक्टर से संपर्क करें।',
      },
      as: {
        title: 'এলঝেইমাৰ ৰোগৰ বিষয়ে',
        whatItMeans: 'এলঝেইমাৰ হৈছে ডিমেনচিয়াৰ আটাইতকৈ সাধাৰণ প্ৰকাৰ, য’ত মগজুৰ নতুন স্মৃতি সংৰক্ষণ কৰা অংশটো ধীৰে ধীৰে প্ৰভাৱিত হয়।',
        whyItMatters: 'ই কোনো মানসিক দোষ নহয়, এটা শাৰীৰিক অৱস্থাহে। ইয়াৰ বুজাবুজিয়ে আপোনজনক শান্তিত ৰখাত সহায় কৰে।',
        whatYouCanDo: 'পুৰণি ফটো চাওক, চিনাকি গীত শুনক, পুৱা মৃদুভাৱে খোজ কাঢ়ক আৰু ঘৰৰ কামত সহজ অংশগ্ৰহণ কৰক।',
        whenToAskForHelp: 'চিনাকি আলিবাট বা অতি ঘনিষ্ঠ আত্মীয়ক চিনি পোৱাত জটিলতা হ’লে চিকিৎসকৰ পৰামৰ্শ লওক।',
      },
      bn: {
        title: 'অ্যালঝাইমার্স রোগ সম্পর্কে',
        whatItMeans: 'অ্যালঝাইমার্স হলো ডিমেনশিয়ার সবচেয়ে সাধারণ রূপ, যাতে মস্তিষ্কের স্মৃতি অংশ ধীরে ধীরে পরিবর্তিত হতে থাকে।',
        whyItMatters: 'এটি কোনো দোষের বিষয় নয়; এটি বুঝতে পারলে পরিবারের সদস্যরা ধৈর্য ও ভালোবাসার সাথে যত্ন নিতে পারেন।',
        whatYouCanDo: 'পরিবারের পুরানো ছবি দেখুন, হালকা সঙ্গীত শুনুন, শান্তভাবে রুটিন মেনে চলুন।',
        whenToAskForHelp: 'খুব চেনা রাস্তা হারিয়ে ফেলা বা কাছের মানুষদের চিনতে অসুবিধা হলে ডাক্তারের পরামর্শ নিন।',
      },
      mni: {
        title: 'Alzheimer gi Maramda',
        whatItMeans: 'Alzheimer haibasi dementia gi amani, masi matam kaya chathaduna pukning gi thabakta ahenba thouna thabak toubada soihalli.',
        whyItMatters: 'Masi leibana ahanbada ahanba meeoiba da nungsina mateng pangbagi mathou tari.',
        whatYouCanDo: 'Photo yengbiyu, ishei tabiyu, routine chumna toubiyu.',
        whenToAskForHelp: 'Chingnaba thabak thokhalle haiba khanglabadi doctor da yengbiyu.',
      },
    },
  },

  // 3. Why do older people have memory problems?
  {
    id: 'why_memory_problems',
    keywords: ['why memory problems', 'older people memory', 'forgetfulness in elderly', 'yaad kyu kam hoti hai', 'pohori jowa'],
    title: {
      en: 'Memory Changes with Age',
      hi: 'उम्र के साथ याददाश्त में बदलाव',
      as: 'বয়সৰ লগে লগে স্মৃতিৰ পৰিৱৰ্তন',
      bn: 'বয়স বাড়লে স্মৃতি দুর্বল হওয়ার কারণ',
      mni: 'Ahanba Matamda Ningsingba Hanthaba',
    },
    card: {
      en: {
        title: 'Memory Changes with Age',
        whatItMeans: 'Just as joints may move slower, natural age-related brain processing takes a bit longer to retrieve names or facts without indicating disease.',
        whyItMatters: 'Differentiating normal mild slowing from progressive conditions prevents unnecessary panic while encouraging healthy habits.',
        whatYouCanDo: 'Use daily memory aids (like SmritiSetu reminders), keep a notepad handy, stay physically active, and get 7-8 hours of quality sleep.',
        whenToAskForHelp: 'If forgotten information does not come back later, or if simple repetitive questions replace normal conversation.',
      },
      hi: {
        title: 'उम्र के साथ याददाश्त में बदलाव',
        whatItMeans: 'जैसे उम्र के साथ शरीर की गति थोड़ी धीमी होती है, वैसे ही मस्तिष्क को जानकारी ढूंढने में थोड़ा अधिक समय लगना सामान्य बात है।',
        whyItMatters: 'सामान्य भूलने और गंभीर बीमारी के अंतर को जानना अनावश्यक घबराहट को दूर करता है।',
        whatYouCanDo: 'डायरी या रिमाइंडर का उपयोग करें, अच्छी नींद लें, दिमागी पहेलियां सुलझाएं और खुश रहें।',
        whenToAskForHelp: 'यदि भूली हुई बात बाद में भी बिल्कुल याद न आए और दैनिक जीवन में कठिनाई आने लगे।',
      },
      as: {
        title: 'বয়সৰ লগে লগে স্মৃতিৰ পৰিৱৰ্তন',
        whatItMeans: 'বয়স বাঢ়িলে শৰীৰৰ দৰে মগজুৰ কাম কৰাৰ গতিও সামান্য ধীৰ হোৱাটো এটা স্বাভাৱিক প্ৰক্ৰিয়া।',
        whyItMatters: 'স্বাভাৱিক ধীৰ গতি আৰু ৰোগৰ মাজৰ পাৰ্থক্য জানিলে অনাহূত চিন্তা আঁতৰি যায়।',
        whatYouCanDo: 'স্মৃতিসেতুৰ দৰে স্মাৰক ব্যৱহাৰ কৰক, পৰ্যাপ্ত টোপনি লওক আৰু মগজুক সতেজ ৰাখক।',
        whenToAskForHelp: 'যদি কোনো কথা একেবাৰেই মনত নপৰে আৰু দৈনিক কামবোৰত খেলিমেলি হয়।',
      },
      bn: {
        title: 'বয়স বাড়লে স্মৃতি দুর্বল হওয়ার কারণ',
        whatItMeans: 'বয়সের সাথে সাথে শরীরের মতোই মস্তিষ্কও স্মৃতি পুনরুদ্ধারে কিছুটা অতিরিক্ত সময় নেয়, যা অনেক ক্ষেত্রেই স্বাভাবিক।',
        whyItMatters: 'স্বাভাবিক ভুলে যাওয়া এবং রোগের পার্থক্য বুঝতে পারলে ভয় ও উদ্বেগ দূর হয়।',
        whatYouCanDo: 'দৈনন্দিন কাজের তালিকা রাখুন, স্মৃতিসেতুর রিমাইন্ডার ব্যবহার করুন, ভালো ঘুমান।',
        whenToAskForHelp: 'কথা একেবারেই মনে না পড়লে বা একই প্রশ্ন বারবার করতে থাকলে ডাক্তারের পরামর্শ নিন।',
      },
      mni: {
        title: 'Ahanba Matamda Ningsingba Hanthaba',
        whatItMeans: 'Ahal oirakpada hakchang thuna chatpa ngamdabagi chap manana pukning amata ningsingba matam khara changba yai.',
        whyItMatters: 'Masi asengba anaba natte haiba khangbana akiba leihande.',
        whatYouCanDo: 'Reminders sijinnabiyu, phajana tummi, routine toubiyu.',
        whenToAskForHelp: 'Kari gumba ningsingba ngamkhraba thabakta akayba thoklabadi doctor da chatpiyu.',
      },
    },
  },

  // 4. How can I keep my brain active?
  {
    id: 'keep_brain_active',
    keywords: ['keep brain active', 'brain exercise', 'mental fitness', 'dimag tej kaise kare', 'mogoju sotej'],
    title: {
      en: 'Keeping Your Brain Active',
      hi: 'मस्तिष्क को सक्रिय कैसे रखें',
      as: 'মগজুক কেনেকৈ সক্ৰিয় কৰি ৰাখিব',
      bn: 'মস্তিষ্ক কীভাবে সক্রিয় রাখবেন',
      mni: 'Pukningbu Magun Lanna Thamba',
    },
    card: {
      en: {
        title: 'Keeping Your Brain Active',
        whatItMeans: 'Neuroplasticity allows the brain to create new neural connections at any age when challenged with engaging activities and social contact.',
        whyItMatters: 'Regular cognitive exercise builds mental reserves that support daily independence and mood stability.',
        whatYouCanDo: 'Play daily games like Memory Match or Tea Garden Focus, learn traditional folk crafts (weaving), read aloud, and talk with friends daily.',
        whenToAskForHelp: 'If you consistently feel mentally exhausted or unable to focus even for a few minutes.',
      },
      hi: {
        title: 'मस्तिष्क को सक्रिय कैसे रखें',
        whatItMeans: 'हमारा मस्तिष्क किसी भी उम्र में नई बातें सीख सकता है जब हम उसे नई चुनौतियों और गतिविधियों में लगाते हैं।',
        whyItMatters: 'मस्तिष्क को सक्रिय रखने से आत्मविश्वास बढ़ता है और दैनिक कार्य आसानी से होते हैं।',
        whatYouCanDo: 'स्मृतिसेतु के खेल खेलें, संगीत सुनें, किताबें या अख़बार पढ़ें, और दोस्तों से रोज़ बात करें।',
        whenToAskForHelp: 'यदि लगातार मानसिक थकान या किसी भी काम में बिल्कुल ध्यान न लग पा रहा हो।',
      },
      as: {
        title: 'মগজুক কেনেকৈ সক্ৰিয় কৰি ৰাখিব',
        whatItMeans: 'নিয়মীয়াকৈ মগজু চৰ্চা কৰিলে যিকোনো বয়সতে মগজুৰ কাৰ্যক্ষমতা উন্নত হৈ থাকে।',
        whyItMatters: 'সক্ৰিয় মগজুৱে আত্মবিশ্বাস বৃদ্ধি কৰে আৰু মন প্রফুল্লিত কৰি ৰাখে।',
        whatYouCanDo: 'স্মৃতিসেতুৰ খেল খেলক, তাঁত বা হস্তশিল্পৰ কাম কৰক, পুৰণি গীত গুনগুনাই শুনক আৰু কথা পাতক।',
        whenToAskForHelp: 'যদি একেবাৰেই মনোযোগ দিব নোৱাৰা হয় বা অতিমাত্ৰা মানসিক ভাগৰ লাগে।',
      },
      bn: {
        title: 'মস্তিষ্ক কীভাবে সক্রিয় রাখবেন',
        whatItMeans: 'নিয়মিত চর্চার মাধ্যমে যেকোনো বয়সে মস্তিষ্কের কার্যক্ষমতা বজায় রাখা সম্ভব।',
        whyItMatters: 'মন সতেজ থাকলে স্বাধীনভাবে জীবনযাপন করা সহজ হয়।',
        whatYouCanDo: 'মেমোরি ম্যাচ খেলুন, ধাঁধা সমাধান করুন, বই পড়ুন এবং প্রতিদিন স্বজনদের সাথে কথা বলুন।',
        whenToAskForHelp: 'মনোযোগ একদমই না থাকলে বা খুব বেশি ক্লান্তি অনুভব হলে চিকিৎসকের পরামর্শ নিন।',
      },
      mni: {
        title: 'Pukningbu Magun Lanna Thamba',
        whatItMeans: 'Pukning asi chahi pumnamakta game amsung thabak khrana fajana hingba ngammi.',
        whyItMatters: 'Masi toubana ahal oirabasu ningthina leiba ngammi.',
        whatYouCanDo: 'SmritiSetu gi game sasi, ishei tabiyu, wari sasi.',
        whenToAskForHelp: 'Pukning changba ngamdrabadi doctor da hangbiyu.',
      },
    },
  },

  // 5. Why is hydration important?
  {
    id: 'hydration_importance',
    keywords: ['why hydration', 'water important', 'pani pina kyu jaruri hai', 'pani kio khabo lage', 'hydration', 'glasses of water'],
    title: {
      en: 'Importance of Hydration for Elders',
      hi: 'बुज़ुर्गों के लिए पर्याप्त पानी का महत्व',
      as: 'পানী খোৱাৰ প্ৰয়োজনীয়তা',
      bn: 'বয়স্কদের জন্য পর্যাপ্ত পানির গুরুত্ব',
      mni: 'Ishing Thakpagi Maru Oiba',
    },
    card: {
      en: {
        title: 'Importance of Hydration for Elders',
        whatItMeans: 'As we age, the natural thirst sensation diminishes, meaning older adults can become dehydrated without feeling thirsty.',
        whyItMatters: 'Dehydration in seniors is a very common hidden cause of confusion, dizziness, fatigue, and falls.',
        whatYouCanDo: 'Keep a water cup visible, aim for 6 to 8 small glasses throughout the day, and mark your hydration in SmritiSetu.',
        whenToAskForHelp: 'If experiencing dark urine, extreme dry mouth, sudden weakness, or dizziness upon standing.',
      },
      hi: {
        title: 'बुज़ुर्गों के लिए पर्याप्त पानी का महत्व',
        whatItMeans: 'उम्र बढ़ने के साथ प्यास लगने का प्राकृतिक संकेत कम हो जाता है, इसलिए बिना प्यास लगे भी शरीर में पानी की कमी हो सकती है।',
        whyItMatters: 'पानी की कमी से बुज़ुर्गों में अचानक चक्कर आना, भ्रम और कमजोरी हो सकती है।',
        whatYouCanDo: 'पास में पानी रखें, दिनभर में 6 से 8 छोटे गिलास पानी पिएं और ऐप में दर्ज करें।',
        whenToAskForHelp: 'यदि बहुत गहरा पेशाब आए, अत्यधिक मुंह सूखे या खड़े होने पर चक्कर आए।',
      },
      as: {
        title: 'পানী খোৱাৰ প্ৰয়োজনীয়তা',
        whatItMeans: 'বয়স বাঢ়িলে পিয়াহ লগাৰ অনুভৱ কমি যায়, সেয়েহে পিয়াহ নলগাকৈও শৰীৰত পানীৰ নাটনি হ’ব পাৰে।',
        whyItMatters: 'পানীৰ নাটনিয়ে হঠাৎ মূৰ ঘূৰোৱা, দুৰ্বলতা আৰু বিভ্ৰান্তিৰ সৃষ্টি কৰিব পাৰে।',
        whatYouCanDo: 'চকুৰ আগত পানীৰ গিলাচ ৰাখক, দিনটোত ৬-৮ গিলাচ পানী খাওক আৰু স্মৃতিসেতুত পানীৰ হিচাপ ৰাখক।',
        whenToAskForHelp: 'প্ৰস্ৰাৱ বেছি হালধীয়া হ’লে বা থিয় হ’লে মূৰ ঘূৰালে চিকিৎসকৰ পৰামৰ্শ লওক।',
      },
      bn: {
        title: 'বয়স্কদের জন্য পর্যাপ্ত পানির গুরুত্ব',
        whatItMeans: 'বয়স বাড়ার সাথে সাথে তৃষ্ণার অনুভূতি কমে যায়, তাই পিপাসা না পেলেও শরীরে পানিশূন্যতা হতে পারে।',
        whyItMatters: 'পানিশূন্যতার কারণে দুর্বলতা, বিভ্রান্তি এবং মাথা ঘোরা দেখা দিতে পারে।',
        whatYouCanDo: 'সামনে পানির বোতল রাখুন, দিনে ৬-৮ গ্লাস পানি পান করুন এবং রিমাইন্ডার মেনে চলুন।',
        whenToAskForHelp: 'অতিরিক্ত মুখ শুকিয়ে যাওয়া বা মাথা ঘোরার সমস্যা হলে অবিলম্বে চিকিৎসকের সাহায্য নিন।',
      },
      mni: {
        title: 'Ishing Thakpagi Maru Oiba',
        whatItMeans: 'Chahi ahal oirakpada ishing thaknaba pambagi ningba hantharak-i, maram aduna ishing watpa thokpa yai.',
        whyItMatters: 'Ishing watpana kok ngakpa amsung sonba thokhalli.',
        whatYouCanDo: 'Nongmada glass 6-8 thakpiyu, SmritiSetu da tick toubiyu.',
        whenToAskForHelp: 'Kok ngaklabadi doctor da utpiyu.',
      },
    },
  },

  // 6. What are common symptoms of dementia?
  {
    id: 'common_symptoms_dementia',
    keywords: ['common symptoms', 'symptoms of dementia', 'dementia ke lakshan', 'dementia r lokhyon', 'signs of dementia'],
    title: {
      en: 'Common Warning Signs & Symptoms',
      hi: 'डिमेंशिया के सामान्य लक्षण व संकेत',
      as: 'ডিমেনচিয়াৰ সাধাৰণ লক্ষণসমূহ',
      bn: 'ডিমেনশিয়ার সাধারণ লক্ষণসমূহ',
      mni: 'Dementia gi Machak Sing',
    },
    card: {
      en: {
        title: 'Common Warning Signs & Symptoms',
        whatItMeans: 'Recognizing patterns such as forgetting recently learned information, misplacing items in unusual spots, or difficulty finding familiar words.',
        whyItMatters: 'Early observation allows supportive lifestyle adjustments, safety precautions, and timely clinical baseline checks.',
        whatYouCanDo: 'Maintain structured daily routines, label important household drawers, and participate in regular cognitive engagement.',
        whenToAskForHelp: 'When changes in memory or judgment noticeably impair safety (such as leaving a stove unattended or wandering).',
      },
      hi: {
        title: 'डिमेंशिया के सामान्य लक्षण व संकेत',
        whatItMeans: 'हाल की बातें भूल जाना, रोज़ की चीज़ें असामान्य जगह रख देना, या बातचीत में सही शब्द न मिलना आम संकेत हो सकते हैं।',
        whyItMatters: 'शुरुआत में ध्यान देने से घर को सुरक्षित बनाया जा सकता है और उचित देखभाल शुरू की जा सकती है।',
        whatYouCanDo: 'ज़रूरी चीज़ों पर लेबल लगाएं, दिनचर्या का पालन करें और रोज़ाना दिमागी कसरत करें।',
        whenToAskForHelp: 'यदि सुरक्षा से जुड़े काम (जैसे गैस चूल्हा खुला छोड़ना या रास्ता भूलना) प्रभावित होने लगें।',
      },
      as: {
        title: 'ডিমেনচিয়াৰ সাধাৰণ লক্ষণসমূহ',
        whatItMeans: 'শেহতীয়া কথা পাহৰি যোৱা, বস্তু অদ্ভুত ঠাইত থোৱা বা কথা কওঁতে শব্দ বিচাৰি নোপোৱাটো লক্ষণ হ’ব পাৰে।',
        whyItMatters: 'লক্ষণসমূহ সোনকালে বুজিলে ঘৰখন নিৰাপদ কৰি ৰখা আৰু আপোনজনক আৰাম দিয়া সহজ হয়।',
        whatYouCanDo: 'বস্তুবোৰ নিৰ্দিষ্ট স্থানত ৰাখক, দিনটোৰ নিয়ম মানি চলক আৰু মন সতেজ ৰাখক।',
        whenToAskForHelp: 'যদি নিৰাপত্তাহীনতা (যেনে গেছৰ চুলা জ্বলাই থৈ পাহৰা) আদি সমস্যা হয়, তৎক্ষণাৎ চিকিৎসকক দেখুৱাওক।',
      },
      bn: {
        title: 'ডিমেনশিয়ার সাধারণ লক্ষণসমূহ',
        whatItMeans: 'সাম্প্রতিক ঘটনা ভুলে যাওয়া, পরিচিত জিনিস অদ্ভুত স্থানে রাখা বা কথা বলার সময় সঠিক শব্দ না পাওয়া।',
        whyItMatters: 'আগে থেকে বুঝতে পারলে নিরাপদ পরিবেশ তৈরি এবং যত্ন নেওয়া সহজ হয়।',
        whatYouCanDo: 'নিয়ম মেনে চলুন, জিনিসপত্র নির্দিষ্ট জায়গায় রাখুন এবং শান্ত থাকুন।',
        whenToAskForHelp: 'চুলা জ্বালিয়ে রাখা বা রাস্তা ভুলে যাওয়ার মতো বিপজ্জনক ঘটনা ঘটলে অবিলম্বে বিশেষজ্ঞের সাথে কথা বলুন।',
      },
      mni: {
        title: 'Dementia gi Machak Sing',
        whatItMeans: 'Haujik thokkhibasing ningsingdaba, potfam soina thamba, wa ngangbada wahei thengnadaba.',
        whyItMatters: 'Masi khangbana safe oina leiba ngamhalli.',
        whatYouCanDo: 'Routine fajana toubiyu, game sasi.',
        whenToAskForHelp: 'Mei thangduna kaoba maram thoklabadi doctor da changbiyu.',
      },
    },
  },

  // 7. How can caregivers support someone with memory problems?
  {
    id: 'caregiver_support_tips',
    keywords: ['caregivers support', 'how to help', 'caregiver tips', 'parijan kaise madad kare', 'poriyalor sahay'],
    title: {
      en: 'Supporting Loved Ones with Memory Care',
      hi: 'अपनों की देखभाल व सहयोग कैसे करें',
      as: 'পৰিচৰ্যাকৰ্তাই কেনেকৈ সহায় কৰিব পাৰে',
      bn: 'পরিচর্যাকারীরা কীভাবে প্রিয়জনকে সাহায্য করবেন',
      mni: 'Caregiver na Mateng Pangba',
    },
    card: {
      en: {
        title: 'Supporting Loved Ones with Memory Care',
        whatItMeans: 'Creating an environment of patience, warm connection, visual simplicity, and predictable schedules.',
        whyItMatters: 'Reassurance and calm communication significantly reduce anxiety, confusion, and agitation for elders.',
        whatYouCanDo: 'Speak in short gentle sentences, avoid arguing or quizzing memory, celebrate small successes, and take caregiver respite breaks.',
        whenToAskForHelp: 'If the caregiver experiences chronic exhaustion, sleep loss, or emotional burnout.',
      },
      hi: {
        title: 'अपनों की देखभाल व सहयोग कैसे करें',
        whatItMeans: 'धैर्य, प्यार, स्पष्ट बातचीत और नियमित दिनचर्या के ज़रिए बुज़ुर्गों के लिए सुरक्षित व शांत माहौल बनाना।',
        whyItMatters: 'शांत वातावरण और स्नेहपूर्ण व्यवहार से बुज़ुर्गों की घबराहट और उलझन बहुत कम हो जाती है।',
        whatYouCanDo: 'सरल शब्दों में बात करें, बहस न करें, उनकी छोटी सफलताओं की सराहना करें और स्वयं भी आराम लें।',
        whenToAskForHelp: 'यदि देखभाल करने वाले परिजन को अत्यधिक मानसिक थकान या तनाव महसूस हो।',
      },
      as: {
        title: 'পৰিচৰ্যাকৰ্তাই কেনেকৈ সহায় কৰিব পাৰে',
        whatItMeans: 'ধৈৰ্য্য, স্নেহ আৰু স্পষ্ট কথাৰে আপোনজনৰ বাবে এক শান্তিময় আৰু নিৰাপদ পৰিবেশ গঢ়ি তোলা।',
        whyItMatters: 'স্নেহপূৰ্ণ ব্যৱহাৰে তেওঁলোকৰ ভয়, খং আৰু মানসিক চাপ যথেষ্ট হ্ৰাস কৰে।',
        whatYouCanDo: 'সহজ বাক্যত কথা পাতক, তৰ্ক নকৰিব, তেওঁলোকৰ কথাবোৰ শ্ৰদ্ধাৰে শুনক আৰু নিজৰো জিৰণি লওক।',
        whenToAskForHelp: 'পৰিচৰ্যাকৰ্তা যদি নিজে মানসিকভাৱে বৰ বেছি ভাগৰি পৰে, তেন্তে আনৰ সহায় লওক।',
      },
      bn: {
        title: 'পরিচর্যাকারীরা কীভাবে প্রিয়জনকে সাহায্য করবেন',
        whatItMeans: 'ধৈর্য, ভালবাসা এবং সহজ রুটিনের মাধ্যমে একটি শান্তিপূর্ণ ও সুরক্ষিত পরিবেশ বজায় রাখা।',
        whyItMatters: 'স্নেহপূর্ণ যত্ন রোগীর দুশ্চিন্তা ও বিভ্রান্তি অনেকটাই কমিয়ে দেয়।',
        whatYouCanDo: 'সহজ ভাষায় কথা বলুন, তর্ক পরিহার করুন এবং নিজে পর্যাপ্ত বিশ্রাম নিন।',
        whenToAskForHelp: 'পরিচর্যাকারী নিজে যদি অত্যন্ত ক্লান্ত বা বিষণ্ণ বোধ করেন।',
      },
      mni: {
        title: 'Caregiver na Mateng Pangba',
        whatItMeans: 'Pukning nungsina, wari fajana saraga ahanbabu safe oina thammi.',
        whyItMatters: 'Nungsiba matengna ahanbada akiba kokhalli.',
        whatYouCanDo: 'Wahei themna ngangbiyu, khudom chabiyu, caregiver suba potthabiyu.',
        whenToAskForHelp: 'Caregiver saotharaba nattraga sonjarabadi mateng loubiyu.',
      },
    },
  },

  // 8. What are some healthy daily habits for older adults?
  {
    id: 'healthy_daily_habits',
    keywords: ['healthy daily habits', 'healthy habits', 'swasth aadat', 'dincharya niyam', 'bhal obhyas', 'habits for elderly'],
    title: {
      en: 'Healthy Daily Habits for Older Adults',
      hi: 'बुज़ुर्गों के लिए स्वस्थ दैनिक आदतें',
      as: 'বয়োজ্যেষ্ঠসকলৰ স্বাস্থ্যকৰ দৈনন্দিন অভ্যাস',
      bn: 'বয়স্কদের সুস্থ থাকার দৈনন্দিন অভ্যাস',
      mni: 'Ahal Oirabasinggi Aphaba Heinarol',
    },
    card: {
      en: {
        title: 'Healthy Daily Habits for Older Adults',
        whatItMeans: 'Daily routines combining physical movement, nutritious traditional foods, social laughter, and restorative sleep.',
        whyItMatters: 'Consistent simple habits protect cardiovascular and cognitive health while elevating daily vitality and mood.',
        whatYouCanDo: 'Take a 15-minute gentle morning walk, enjoy traditional seasonal local greens and fresh fruits, stay hydrated, and stick to bedtime.',
        whenToAskForHelp: 'If chronic sleep disturbances or loss of appetite persist for more than several days.',
      },
      hi: {
        title: 'बुज़ुर्गों के लिए स्वस्थ दैनिक आदतें',
        whatItMeans: 'हल्का व्यायाम, ताज़ा पौष्टिक भोजन, अपनों के साथ हंसी-मज़ाक और नियमित नींद का संतुलन।',
        whyItMatters: 'नियमित अच्छी आदतें शरीर और दिमाग दोनों को तरोताज़ा और स्वस्थ रखती हैं।',
        whatYouCanDo: 'सुबह की धूप में 15 मिनट टहलें, मौसमी फल व सब्ज़ियां खाएं, समय पर सोएं और दिनचर्या बनाए रखें।',
        whenToAskForHelp: 'यदि कई दिनों तक भूख न लगे या नींद में लगातार भारी परेशानी आए।',
      },
      as: {
        title: 'বয়োজ্যেষ্ঠসকলৰ স্বাস্থ্যকৰ দৈনন্দিন অভ্যাস',
        whatItMeans: 'মৃদু খোজ কঢ়া, সতেজ থলুৱা শাক-পাচলি খোৱা, আপোনজনৰ সৈতে কথা-বতৰা আৰু সঠিক টোপনিৰ সংমিশ্ৰণ।',
        whyItMatters: 'এই সহজ অভ্যাসসমূহে শৰীৰ আৰু মগজু দুয়োটাকে সুস্থ আৰু সতেজ কৰি ৰাখে।',
        whatYouCanDo: 'ৰাতিপুৱা ১৫ মিনিট ৰ’দত খোজ কাঢ়ক, বতৰৰ ফল-মূল খাওক আৰু সময়মতে শোওক।',
        whenToAskForHelp: 'যদি কেইবাদিনো ধৰি ভোক একেবাৰে নালাগে বা টোপনি নহয়।',
      },
      bn: {
        title: 'বয়স্কদের সুস্থ থাকার দৈনন্দিন অভ্যাস',
        whatItMeans: 'প্রতিদিন হালকা হাঁটাচলা, পুষ্টিকর খাবার, প্রিয়জনদের সঙ্গ এবং ভালো ঘুমের সমন্বয়।',
        whyItMatters: 'নিয়মিত জীবনযাপন শরীর ও মন উভয়কেই সক্রিয় ও সুস্থ রাখতে সাহায্য করে।',
        whatYouCanDo: 'সকালে একটু রোদ পোহান, পর্যাপ্ত পানি খান, শাকসবজি খান এবং নির্দিষ্ট সময়ে ঘুমাতে যান।',
        whenToAskForHelp: 'খাওয়ার রুচি পুরোপুরি চলে গেলে বা ঘুমের মারাত্মক সমস্যা হলে ডাক্তারের সাথে কথা বলুন।',
      },
      mni: {
        title: 'Ahal Oirabasinggi Aphaba Heinarol',
        whatItMeans: 'Hakchang touna chatpa, chaba thakpa chumna touba, nungtigi tummi.',
        whyItMatters: 'Aphaba heinarolna hakchang kang-halli.',
        whatYouCanDo: 'Morning walk chatpiyu, heina-mana chabiyu, matam chana tummi.',
        whenToAskForHelp: 'Chaba ningdaba nattraga tumdaba matam kaya leirabadi doctor da utpiyu.',
      },
    },
  },

  // 9. Sleep hygiene in older adults
  {
    id: 'sleep_hygiene',
    keywords: ['sleep hygiene', 'sleep in older adults', 'improve sleep', 'neend nahi aati', 'toponi', 'ghum', 'tumbagi'],
    title: {
      en: 'Sleep Hygiene in Older Adults',
      hi: 'बुज़ुर्गों के लिए अच्छी नींद के नियम',
      as: 'বয়োজ্যেষ্ঠসকলৰ স্বাস্থ্যকৰ টোপনি',
      bn: 'বয়স্কদের জন্য স্বাস্থ্যকর ঘুমের নিয়ম',
      mni: 'Ahal Oirabagi Phajana Tumbagi Niyam',
    },
    card: {
      en: {
        title: 'Sleep Hygiene in Older Adults',
        whatItMeans: 'Sleep hygiene involves daily habits and bedtime environments that promote restorative, unbroken sleep.',
        whyItMatters: 'Deep sleep allows the brain to clear metabolic waste and consolidates memories from the day.',
        whatYouCanDo: 'Keep bedtime consistent, avoid tea/caffeine in late evening, keep bedroom cool and quiet, and listen to relaxing sounds in Calming Sanctuary.',
        whenToAskForHelp: 'If chronic nighttime wakefulness, severe restlessness, or loud gasping occurs regularly.',
      },
      hi: {
        title: 'बुज़ुर्गों के लिए अच्छी नींद के नियम',
        whatItMeans: 'नियमित आदतें और शांत वातावरण जो रात को गहरी और सुकून भरी नींद लाने में मदद करते हैं।',
        whyItMatters: 'गहरी नींद से मस्तिष्क की थकान दूर होती है और दिनभर की यादें सुव्यवस्थित होती हैं।',
        whatYouCanDo: 'सोने का समय निश्चित रखें, शाम को चाय कम पिएं, कमरे में शांति रखें और शांत संगीत सुनें।',
        whenToAskForHelp: 'यदि लगातार नींद न आए या रात में बहुत अधिक बेचैनी महसूस हो।',
      },
      as: {
        title: 'বয়োজ্যেষ্ঠসকলৰ স্বাস্থ্যকৰ টোপনি',
        whatItMeans: 'টোপনিৰ স্বাস্থ্যবিধি হৈছে এনে অভ্যাস যিয়ে ৰাতি নিৰৱচ্ছিন্ন আৰু গভীৰ টোপনি হোৱাত সহায় কৰে।',
        whyItMatters: 'গভীৰ টোপনিয়ে মগজুৰ ভাগৰ আঁতৰাই স্মৃতিশক্তি সবল কৰি ৰাখে।',
        whatYouCanDo: 'শোৱাৰ সময় ঠিক ৰাখক, গধূলি চাহ কম খাওক, কোঠাটো শান্ত ৰাখক আৰু শান্তিদায়ক ধ্বনি শুনক।',
        whenToAskForHelp: 'যদি ৰাতি একেবাৰে টোপনি নহয় বা অতিমাত্ৰা অস্থিৰতা অনুভৱ হয়।',
      },
      bn: {
        title: 'বয়স্কদের জন্য স্বাস্থ্যকর ঘুমের নিয়ম',
        whatItMeans: 'নিয়মিত ভালো ঘুমের জন্য সহায়ক অভ্যাস এবং শান্তিপূর্ণ পরিবেশ তৈরি করা।',
        whyItMatters: 'পর্যাপ্ত ঘুম মস্তিষ্কের ক্লান্তি দূর করে এবং স্মৃতিশক্তি সংরক্ষণে সহায়তা করে।',
        whatYouCanDo: 'নির্দিষ্ট সময়ে ঘুমাতে যান, সন্ধ্যায় চা-কফি পরিহার করুন এবং শান্ত পরিবেশ বজায় রাখুন।',
        whenToAskForHelp: 'নিয়মিত ঘুমের সমস্যা হলে বা রাতে অস্বাভাবিক অস্থিরতা দেখা দিলে চিকিৎসকের সাথে কথা বলুন।',
      },
      mni: {
        title: 'Ahal Oirabagi Phajana Tumbagi Niyam',
        whatItMeans: 'Ahingda phajana tumbagi damak nongmagi heinarol phajana thamba.',
        whyItMatters: 'Phajana tumbana pukning bu mapangal kanhalli.',
        whatYouCanDo: 'Tumfam fajana thammu, ahingda cha thakkanu, calming ishei tabiyu.',
        whenToAskForHelp: 'Ahing kayam tumdaba thoklabadi doctor da hangbiyu.',
      },
    },
  },

  // 10. Gentle physical activity
  {
    id: 'gentle_physical_activity',
    keywords: ['gentle physical activity', 'physical activity', 'exercise', 'walking', 'tahalna', 'khoz kahra', 'vyayam'],
    title: {
      en: 'Gentle Physical Activity',
      hi: 'हल्का शारीरिक व्यायाम व चहलकदमी',
      as: 'মৃদু শাৰীৰিক ব্যায়াম আৰু খোজ কঢ়া',
      bn: 'হালকা শারীরিক ব্যায়াম ও হাঁটা',
      mni: 'Hakchanggi Chamna Chatpa',
    },
    card: {
      en: {
        title: 'Gentle Physical Activity',
        whatItMeans: 'Safe, low-impact movements like walking, stretching, or traditional seated postures.',
        whyItMatters: 'Movement stimulates cerebral blood circulation, strengthens balance, and prevents sudden falls.',
        whatYouCanDo: 'Enjoy a 15-20 minute gentle morning walk in fresh air, stretch arms and ankles, and practice deep calm breathing.',
        whenToAskForHelp: 'If experiencing chest tightness, sudden shortness of breath, joint swelling, or persistent dizziness.',
      },
      hi: {
        title: 'हल्का शारीरिक व्यायाम व चहलकदमी',
        whatItMeans: 'सुरक्षित, हल्का व्यायाम जैसे टहलना, हाथ-पैर खींचना या आसान आसन।',
        whyItMatters: 'चलने-फिरने से मस्तिष्क में रक्त संचार बढ़ता है, संतुलन सुधरता है और गिरने का डर कम होता है।',
        whatYouCanDo: 'सुबह 15-20 मिनट ताज़ी हवा में टहलें, हल्के हाथ-पैर हिलाएं और गहरी सांस लें।',
        whenToAskForHelp: 'यदि सीने में दर्द, अचानक सांस फूलना या चक्कर आने की समस्या हो।',
      },
      as: {
        title: 'মৃদু শাৰীৰিক ব্যায়াম আৰু খোজ কঢ়া',
        whatItMeans: 'নিৰাপদ আৰু সহজ শাৰীৰিক সঞ্চালন যেনে খোজ কঢ়া, হাত-ভৰি মেলা আদি।',
        whyItMatters: 'শাৰীৰিক সঞ্চালনে মগজুলৈ তেজৰ চলাচল বৃদ্ধি কৰে আৰু শৰীৰৰ ভাৰসাম্য অটুট ৰাখে।',
        whatYouCanDo: 'পুৱা ১৫-২০ মিনিট মৃদুভাৱে খোজ কাঢ়ক, হাত-ভৰি মেলি ব্যায়াম কৰক আৰু গভীৰ উশাহ লওক।',
        whenToAskForHelp: 'বুকুৰ বিষ, উশাহ চুটি হোৱা বা মূৰ ঘূৰোৱা সমস্যা হ’লে তৎক্ষণাৎ জিৰণি লওক।',
      },
      bn: {
        title: 'হালকা শারীরিক ব্যায়াম ও হাঁটা',
        whatItMeans: 'নিরাপদ ও হালকা ব্যায়াম যেমন সকালে হাঁটা, হাত-পা নাড়াচাড়া করা বা সহজ ভঙ্গি।',
        whyItMatters: 'হাঁটাচলা রক্ত চলাচল বাড়ায়, শরীরের ভারসাম্য ধরে রাখতে সাহায্য করে।',
        whatYouCanDo: 'সকালে ১৫-২০ মিনিট খোলা বাতাসে হাঁটুন এবং সহজ শারীরিক নড়াচড়া করুন।',
        whenToAskForHelp: 'বুকের ওপর চাপ বা হঠাৎ শ্বাসকষ্ট হলে সঙ্গে সঙ্গে বিশ্রাম নিন এবং ডাক্তারকে জানান।',
      },
      mni: {
        title: 'Hakchanggi Chamna Chatpa',
        whatItMeans: 'Khang-hangba natte, chamna chatpa amsung hakchang chingba.',
        whyItMatters: 'Chatpana ee-gi chatpa phahalli amsung thouna kanhalli.',
        whatYouCanDo: 'Ayukta minute 15-20 chatpiyu, hakchang chingbiyu.',
        whenToAskForHelp: 'Bukey bikhba nattraga saans watlabadi doctor da chatpiyu.',
      },
    },
  },

  // 11. Social engagement
  {
    id: 'social_engagement',
    keywords: ['social engagement', 'social connection', 'talk to family', 'loneliness', 'akelapan', 'songsho', 'imung'],
    title: {
      en: 'Social Engagement & Connection',
      hi: 'सामाजिक जुड़ाव व पारिवारिक संवाद',
      as: 'সামাজিক সংযোগ আৰু আত্মীয়ৰ সৈতে মেল',
      bn: 'সামাজিক মেলামেশা ও পারিবারিক সম্পর্ক',
      mni: 'Meeoiba Khunnai ga Shamnaba',
    },
    card: {
      en: {
        title: 'Social Engagement & Connection',
        whatItMeans: 'Regular heartwarming conversations, storytelling, and shared moments with family, friends, and neighbors.',
        whyItMatters: 'Social warmth buffers against isolation, lowers anxiety, and provides continuous cognitive stimulation.',
        whatYouCanDo: 'Call family members, share cherished stories through the Family Album, and sit together during evening tea.',
        whenToAskForHelp: 'If feeling prolonged loneliness, emotional withdrawal, or persistent sadness.',
      },
      hi: {
        title: 'सामाजिक जुड़ाव व पारिवारिक संवाद',
        whatItMeans: 'परिवार, मित्रों और पड़ोसियों के साथ रोज़ाना प्रेमपूर्वक बातचीत और पुरानी यादें साझा करना।',
        whyItMatters: 'अपनों का साथ अकेलेपन को दूर करता है, तनाव घटाता है और मन को प्रसन्न रखता है।',
        whatYouCanDo: 'घरवालों से बातें करें, पारिवारिक एल्बम देखकर पुरानी कहानियां सुनाएं और शाम की चाय साथ पिएं।',
        whenToAskForHelp: 'यदि लगातार अकेलापन या किसी से बात न करने का मन होने लगे।',
      },
      as: {
        title: 'সামাজিক সংযোগ আৰু আত্মীয়ৰ সৈতে মেল',
        whatItMeans: 'পৰিয়াল, ওচৰ-চুবুৰীয়া আৰু বন্ধু-বান্ধৱৰ সৈতে মৰমৰ কথা-বতৰা আৰু সুখ-দুখৰ ভাগ-বতৰা।',
        whyItMatters: 'আপোনজনৰ সান্নিধ্যে একাকীত্ব দূৰ কৰে আৰু মনলৈ প্ৰশান্তি আনে।',
        whatYouCanDo: 'পৰিয়ালৰ সৈতে কথা পাতক, ফটো এলবাম চাই পুৰণি কথা স্মৰণ কৰক আৰু হাঁহি-ধেমালি কৰক।',
        whenToAskForHelp: 'যদি মনত দীৰ্ঘদিনীয়া হতাশা বা অকলশৰীয়া অনুভৱ হয়।',
      },
      bn: {
        title: 'সামাজিক মেলামেশা ও পারিবারিক সম্পর্ক',
        whatItMeans: 'পরিবার ও প্রতিবেশীদের সাথে নিয়মিত আনন্দদায়ক আলাপচারিতা এবং গল্প করা।',
        whyItMatters: 'প্রিয়জনদের সঙ্গ একাকীত্ব ও মানসিক উদ্বেগ কমিয়ে মনকে চনমনে রাখে।',
        whatYouCanDo: 'আত্মীয়দের সাথে কথা বলুন, পারিবারিক ছবির অ্যালবাম দেখুন এবং একসাথে সময় কাটান।',
        whenToAskForHelp: 'দীর্ঘ সময় ধরে নিজেকে গুটিয়ে রাখলে বা খুব মন খারাপ থাকলে পরিবারের সহায়তা নিন।',
      },
      mni: {
        title: 'Meeoiba Khunnai ga Shamnaba',
        whatItMeans: 'Imung manung amsung marup mapang ga nungcna wari saba.',
        whyItMatters: 'Wari sabana mathanta taba kokhalli amsung pukning nungaohalli.',
        whatYouCanDo: 'Family album yengbiyu, wari sasi, cha loinana thaksi.',
        whenToAskForHelp: 'Nungtigi ningamda leirabadi caregiver da haibiyu.',
      },
    },
  },

  // 12. Routine consistency
  {
    id: 'routine_consistency',
    keywords: ['routine consistency', 'routine', 'daily routine', 'dincharya', 'niyom', 'shomoy'],
    title: {
      en: 'Daily Routine Consistency',
      hi: 'नियमित दिनचर्या का महत्व',
      as: 'নিয়মীয়া দিনচৰ্যাৰ ধাৰাবাহিকতা',
      bn: 'দৈনন্দিন রুটিনের ধারাবাহিকতা',
      mni: 'Nongmagi Routine Leppa Leitana Chatpa',
    },
    card: {
      en: {
        title: 'Daily Routine Consistency',
        whatItMeans: 'Keeping meals, wake times, cognitive activities, and bedtimes at predictable, familiar hours.',
        whyItMatters: 'Predictable rhythm reduces disorientation, anxiety, and confusion by structuring the day calmly.',
        whatYouCanDo: 'Use the Routine Builder in SmritiSetu, keep familiar items in the same places, and follow a peaceful sequence.',
        whenToAskForHelp: 'If daytime and nighttime sleep patterns become severely inverted or confusion worsens at dusk.',
      },
      hi: {
        title: 'नियमित दिनचर्या का महत्व',
        whatItMeans: 'भोजन, जागने, दिमागी खेल और सोने का समय एक निश्चित क्रम में रखना।',
        whyItMatters: 'नियमित दिनचर्या से मन शांत रहता है और असमंजस या भूलने की परेशानी कम होती है।',
        whatYouCanDo: 'स्मृतिसेतु में दिनचर्या बिल्डर का उपयोग करें, ज़रूरी चीज़ें हमेशा एक ही जगह रखें।',
        whenToAskForHelp: 'यदि दिन और रात का क्रम पूरी तरह उलट जाए या शाम होते ही बहुत बेचैनी बढ़े।',
      },
      as: {
        title: 'নিয়মীয়া দিনচৰ্যাৰ ধাৰাবাহিকতা',
        whatItMeans: 'খোৱা-বোৱা, শোৱা আৰু কাম কৰাৰ সময় এটা নিৰ্দিষ্ট নিয়মৰ মাজত ৰখা।',
        whyItMatters: 'নিয়মীয়া ক্ৰমে মানসিক বিভ্ৰান্তি হ্ৰাস কৰে আৰু দিনটো সুচাৰুৰূপে চলোৱাত সহায় কৰে।',
        whatYouCanDo: 'ৰুটিন বিল্ডাৰ ব্যৱহাৰ কৰক, দৰকাৰী বস্তুবোৰ একে স্থানতে ৰাখক।',
        whenToAskForHelp: 'যদি দিন-ৰাতিৰ সময়সূচী খেলিমেলি হৈ পৰে।',
      },
      bn: {
        title: 'দৈনন্দিন রুটিনের ধারাবাহিকতা',
        whatItMeans: 'খাওয়া, ঘুম এবং কাজের সময়সূচী প্রতিদিন একই রকম রাখা।',
        whyItMatters: 'সুশৃঙ্খল রুটিন বিভ্রান্তি কমায় এবং আত্মবিশ্বাস বাড়ায়।',
        whatYouCanDo: 'প্রতিদিন একই সময়ে কাজগুলো করুন, স্মৃতিসেতুর রুটিন মেনে চলুন।',
        whenToAskForHelp: 'দিন-রাতের ঘুম উল্টে গেলে বা সন্ধ্যায় অতিরিক্ত বিভ্রান্তি তৈরি হলে।',
      },
      mni: {
        title: 'Nongmagi Routine Leppa Leitana Chatpa',
        whatItMeans: 'Chaba, tumbagi matam pumnamak chumna leppa leitana touba.',
        whyItMatters: 'Routine fajana toubana pukning chaningthokhande.',
        whatYouCanDo: 'SmritiSetu gi Routine Builder sijinnabiyu.',
        whenToAskForHelp: 'Ahing-nungthil soikhra matamda doctor da utpiyu.',
      },
    },
  },
];

// Curated safe fallback for medical questions outside the offline knowledge base
export const OFFLINE_MEDICAL_FALLBACK: Record<Language, string> = {
  en: "I'm currently offline, so I can't check the latest medical information. I can still help with your reminders, activities and information stored on this device.",
  hi: "मैं अभी ऑफ़लाइन हूँ, इसलिए नवीनतम चिकित्सा जानकारी की जाँच नहीं कर सकता। मैं अभी भी इस उपकरण पर संग्रहीत आपकी याद दिलाने वाले कार्यों (रिमाइंडर), गतिविधियों और जानकारी में आपकी मदद कर सकता हूँ।",
  as: "মই বৰ্তমান অফলাইনত আছোঁ, সেয়েহে শেহতীয়া চিকিৎসা তথ্য পৰীক্ষা কৰিব নোৱাৰোঁ। কিন্তু মই এই ডিভাইচত সংৰক্ষিত আপোনাৰ স্মাৰক (ৰিমাইণ্ডাৰ), দৈনন্দিন কাম-কাজ আৰু অন্যান্য তথ্যত সহায় কৰিব পাৰোঁ।",
  bn: "আমি বর্তমানে অফলাইনে আছি, তাই সর্বশেষ চিকিৎসা সংক্রান্ত তথ্য যাচাই করতে পারছি না। তবে আমি এই ডিভাইসে সংরক্ষিত আপনার অনুস্মারক (রিমাইন্ডার), কার্যকলাপ এবং তথ্যে সহায়তা করতে পারি।",
  mni: "Eikhoi haujik offline oiri, maram aduna anouba medical information thingba ngamde. Adubu device asida thamba nanggidamak reminders, game amsung routine gi mateng pangba ngammi.",
};

export function getOfflineMedicalFallbackMessage(language: Language = 'en'): string {
  return OFFLINE_MEDICAL_FALLBACK[language] || OFFLINE_MEDICAL_FALLBACK.en;
}

// ==========================================
// INTENT & SAFETY CLASSIFIER IMPLEMENTATION
// ==========================================

export function classifySafetyIntent(query: string, language: Language = 'en'): SafetyClassificationResult {
  const lower = query.trim().toLowerCase();

  // 1. EMERGENCY (Life-threatening symptoms)
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'unconscious', 'collapsed', 'severe bleeding',
    'cannot breathe', 'not breathing', 'stroke', 'paralyzed', 'choking',
    'chhati me dard', 'behosh', 'saans nahi aa rahi', 'rokto', 'sos',
    'asengba emergency', 'nasha leitaba',
  ];
  for (const kw of emergencyKeywords) {
    if (lower.includes(kw)) {
      return {
        category: 'EMERGENCY',
        isHighRisk: true,
        predefinedMessage: EMERGENCY_RESPONSE,
        suggestedAction: 'SAFE_CARD',
        openSOS: true,
      };
    }
  }

  // 2. POTENTIALLY URGENT (Sudden confusion, acute disorientation)
  const urgentKeywords = [
    'suddenly confused', 'suddenly very confused', 'became very confused',
    'sudden confusion', 'sudden disorientation', 'acute confusion',
    'sudden memory loss', 'sudden weakness', 'high fever and confused',
    'achanak bhool', 'achanak behosh', 'hothat bibhranto', 'achanak confusion',
    'sudden hallucination', 'seeing things suddenly',
  ];
  const hasSuddenOnset = lower.includes('sudden') || lower.includes('achanak') || lower.includes('hothat') || lower.includes('acute') || lower.includes('ekdom');
  const hasConfusionSymptom = lower.includes('confusion') || lower.includes('confused') || lower.includes('disorient') || lower.includes('bibhranto') || lower.includes('behosh');

  if (hasSuddenOnset && hasConfusionSymptom) {
    return {
      category: 'POTENTIALLY_URGENT',
      isHighRisk: true,
      predefinedMessage: POTENTIALLY_URGENT_RESPONSE,
      suggestedAction: 'CAREGIVER',
    };
  }

  for (const kw of urgentKeywords) {
    if (lower.includes(kw)) {
      return {
        category: 'POTENTIALLY_URGENT',
        isHighRisk: true,
        predefinedMessage: POTENTIALLY_URGENT_RESPONSE,
        suggestedAction: 'CAREGIVER',
      };
    }
  }

  // 3. MEDICATION DOSAGE ALTERATION / STOPPING PRECAUTION
  const medicationChangeKeywords = [
    'change my medicine dose', 'change dose', 'increase dose', 'decrease dose',
    'stop taking my medicine', 'stop medicine', 'double dose', 'skip dose',
    'dawa badal du', 'khurak badalna', 'dawa band kar du', 'ausadh bondho',
    'hidak leppa yabra', 'hidak dosage hongba', 'prescribe me', 'which tablet should i take',
  ];
  for (const kw of medicationChangeKeywords) {
    if (lower.includes(kw)) {
      return {
        category: 'MEDICATION_INFORMATION',
        isHighRisk: true,
        predefinedMessage: MEDICATION_DOSAGE_SAFE_REFUSAL,
        suggestedAction: 'DOCTOR',
      };
    }
  }

  // 4. CURATED OFFLINE HEALTH KNOWLEDGE BASE MATCHING
  for (const topic of OFFLINE_HEALTH_TOPICS) {
    for (const kw of topic.keywords) {
      if (lower.includes(kw)) {
        return {
          category: 'GENERAL_HEALTH_INFORMATION',
          isHighRisk: false,
          healthCard: topic.card[language] || topic.card.en,
          predefinedMessage: {
            en: `Here is a simple, evidence-oriented explanation about ${topic.title.en}:`,
            hi: `${topic.title.hi} के बारे में यहाँ एक सरल व्याख्या दी गई है:`,
            as: `${topic.title.as} সম্পৰ্কে ইয়াত এটি সহজ বুজাবুজি আগবঢ়োৱা হ’ল:`,
            bn: `${topic.title.bn} সম্পর্কে একটি সহজ ব্যাখ্যা এখানে দেওয়া হলো:`,
            mni: `${topic.title.mni} gi maramda chamna phongdokchaba:`,
          },
        };
      }
    }
  }

  // 5. General Health questions (non-curated topic)
  if (
    lower.includes('health') ||
    lower.includes('doctor') ||
    lower.includes('disease') ||
    lower.includes('illness') ||
    lower.includes('swasthya') ||
    lower.includes('rog')
  ) {
    return {
      category: 'GENERAL_HEALTH_INFORMATION',
      isHighRisk: false,
    };
  }

  // 6. Navigation
  if (
    lower.includes('take me to') ||
    lower.includes('open') ||
    lower.includes('go to') ||
    lower.includes('show') ||
    lower.includes('chalo') ||
    lower.includes('mukoli')
  ) {
    return {
      category: 'NAVIGATION',
      isHighRisk: false,
    };
  }

  // 7. Cognitive Activity
  if (
    lower.includes('game') ||
    lower.includes('play') ||
    lower.includes('khel') ||
    lower.includes('puzzle')
  ) {
    return {
      category: 'COGNITIVE_ACTIVITY',
      isHighRisk: false,
    };
  }

  return {
    category: 'NON_HEALTH',
    isHighRisk: false,
  };
}

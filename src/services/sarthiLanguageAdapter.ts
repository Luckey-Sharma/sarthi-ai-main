/**
 * Sarthi Language Adapter
 * 
 * Generates natural, respectful, culturally resonant responses directly in:
 * - English (en)
 * - Hindi (hi)
 * - Assamese (as)
 * - Bengali (bn)
 * - Manipuri (mni)
 */

import { Language, GameId, SarthiTrend, PatientProfile } from '../types';

export interface LocalizedRecommendationPhrases {
  greeting: string;
  gameTitles: Record<GameId, string>;
  trendExplanations: Record<SarthiTrend, string>;
  quickActionReplies: {
    howAmIDoing: string;
    playGamePrompt: string;
    whatNext: string;
    remindersSummary: (takenMeds: number, totalMeds: number, glasses: number) => string;
    comfortChat: string;
    callCaregiver: (name: string, phone: string) => string;
  };
  reasonTemplates: {
    improving: (gameName: string, score: number) => string;
    stable: (gameName: string) => string;
    struggling: (gameName: string) => string;
    repeatedDeviation: string;
    routineBalance: (gameName: string) => string;
  };
  caregiverInsights: {
    improving: (score: number) => string;
    stable: string;
    struggling: string;
    repeatedDeviation: string;
  };
  actionLabels: {
    playNow: string;
    checkMeds: string;
    takeRest: string;
    callFamily: string;
    viewAlbum: string;
  };
}

export const SARTHI_LANGUAGES: Record<Language, LocalizedRecommendationPhrases> = {
  en: {
    greeting: 'Hello! I am Sarthi, your cognitive care companion. How are you feeling today?',
    gameTitles: {
      memory_match: 'Cultural Memory Match',
      tea_garden: 'Tea Garden Focus',
      brain_quest: 'Hill Folklore Riddles',
      pattern_weave: 'Handloom Pattern Weave',
      routine_builder: 'Daily Routine Builder',
      sounds_hills: 'Sounds of the Hills',
      family_recall: 'Family & Loved Ones Recall',
    },
    trendExplanations: {
      improving: 'Your recent cognitive focus is steadily brightening above your usual baseline.',
      stable: 'Your daily engagement and rhythm is balanced and consistent.',
      struggling: 'A gentle pace today will support clarity without fatigue.',
      repeated_deviation: 'Your activity pattern is different from your usual baseline. A relaxing pause is suggested.',
    },
    quickActionReplies: {
      howAmIDoing: 'You are doing well! Your activity rhythm is steady and your cognitive engagement brings joyful energy.',
      playGamePrompt: 'I have picked a delightful activity suited to your pace today. Would you like to try it?',
      whatNext: 'It is a wonderful time to enjoy a glass of fresh water, listen to a calming melody, or solve a gentle puzzle.',
      remindersSummary: (taken, total, glasses) =>
        `You have completed ${taken} of ${total} prescribed medications, and enjoyed ${glasses} of 8 recommended fresh water glasses today.`,
      comfortChat: 'I am always here with you. Take a deep, gentle breath and think of a happy memory with loved ones.',
      callCaregiver: (name, phone) =>
        `I will help you reach your loved one ${name} right away at ${phone}. You are safe and supported.`,
    },
    reasonTemplates: {
      improving: (game, score) => `Recommended because your recent score in ${game} reached ${score}%, showing positive focus above your personal baseline.`,
      stable: (game) => `Recommended to maintain balanced memory and temporal rhythm through ${game}.`,
      struggling: (game) => `Recommended because ${game} provides an easier, joyful experience to nourish confidence.`,
      repeatedDeviation: 'Recommended because recent activity patterns suggest taking a soothing pause before engaging.',
      routineBalance: (game) => `Recommended to engage a fresh domain today with ${game}.`,
    },
    caregiverInsights: {
      improving: (score) => `Patient's recent engagement is above personal baseline (${score}% average). Motor accuracy and attention show steady stability.`,
      stable: 'Activity pattern is consistent with the patient’s personal baseline. Engagement frequency is steady.',
      struggling: 'Activity pattern shows mild fatigue or slower latency than personal baseline. Sarthi suggested an easier, stress-free activity.',
      repeatedDeviation: 'Activity pattern has notably changed across recent sessions from patient’s personal baseline. Recommended caregiver check-in and restful break.',
    },
    actionLabels: {
      playNow: 'Play Now',
      checkMeds: 'Check Meds & Water',
      takeRest: 'Relax in Sanctuary',
      callFamily: 'Call Family',
      viewAlbum: 'Open Family Album',
    },
  },

  as: {
    greeting: 'নমস্কাৰ! মই সাৰথি, আপোনাৰ মৰমৰ সংগী। আজি আপোনাৰ মনটো কেনে আছে?',
    gameTitles: {
      memory_match: 'সাংস্কৃতিক স্মৃতি খেল',
      tea_garden: 'চাহ বাগিচাৰ মনোযোগ',
      brain_quest: 'পাহাৰীয়া সাঁথৰ',
      pattern_weave: 'তাঁতৰ নক্সা সজোৱা',
      routine_builder: 'দৈনন্দিন সূচী সজোৱা',
      sounds_hills: 'পাহাৰৰ সুৰ',
      family_recall: 'চিহ্ন আপনজন',
    },
    trendExplanations: {
      improving: 'আপোনাৰ শেহতীয়া মনোযোগ আপোনাৰ স্বাভাৱিক মাত্ৰাতকৈ উজ্জ্বলভাৱে বৃদ্ধি পাইছে।',
      stable: 'আপোনাৰ দৈনন্দিন ছন্দ অতি সুন্দৰ আৰু সুস্থিৰভাৱে চলি আছে।',
      struggling: 'আজি অলপ ধীৰ-স্থিৰভাৱে জিৰণি লৈ কাম কৰিলে মনটো সতেজ থাকিব।',
      repeated_deviation: 'আপোনাৰ কাৰ্যকলাপ স্বাভাৱিক ৰীতিৰ পৰা অলপ পৃথক হৈছে। অলপ জিৰণি লোৱাটো ভাল হ’ব।',
    },
    quickActionReplies: {
      howAmIDoing: 'আপুনি বৰ সুন্দৰভাৱে আগবাঢ়িছে! আপোনাৰ দৈনন্দিন কাম-কাজৰ ছন্দ অতি উৎসাহজনক।',
      playGamePrompt: 'আজিৰ বাবে মই এটা মনপৰশা খেল বাছি ৰাখিছোঁ। খেলি আনন্দ ল’ব নেকি?',
      whatNext: 'এতিয়া এক গিলাচ শীতল পানী খাই অলপ সুৰ শুনক অথবা এটি সহজ খেল খেলক।',
      remindersSummary: (taken, total, glasses) =>
        `আপুনি আজিৰ ${total}টা ঔষধৰ ভিতৰত ${taken}টা গ্ৰহণ কৰিছে আৰু ৮ গিলাচৰ ভিতৰত ${glasses} গিলাচ পানী খাইছে।`,
      comfortChat: 'মই সদায় আপোনাৰ কাষতেই আছোঁ। দীঘলকৈ উশাহ লওক আৰু মৰমৰ মানুহবোৰৰ কথা মনত পেলাওক।',
      callCaregiver: (name, phone) =>
        `মই এতিয়াই আপোনাৰ মৰমৰ ${name}ৰ সৈতে ফোনত সংযোগ কৰিবলৈ সহায় কৰিম (${phone})। আপুনি সম্পূৰ্ণ সুৰক্ষিত।`,
    },
    reasonTemplates: {
      improving: (game, score) => `বাছনি কৰাৰ কাৰণ: ${game}ত আপোনাৰ শেহতীয়া নম্বৰ ${score}%লৈ বৃদ্ধি পাইছে।`,
      stable: (game) => `বাছনি কৰাৰ কাৰণ: ${game}ৰ জৰিয়তে আপোনাৰ স্মৃতিশক্তি সজীৱ কৰি ৰখা।`,
      struggling: (game) => `বাছনি কৰাৰ কাৰণ: ${game} এটি অতি আনন্দদায়ক আৰু সহজ খেল যিয়ে মন শান্ত কৰিব।`,
      repeatedDeviation: 'বাছনি কৰাৰ কাৰণ: শেহতীয়া পৰিশ্ৰমৰ পৰা সকাহ পাবলৈ জিৰণিৰ প্ৰয়োজন।',
      routineBalance: (game) => `বাছনি কৰাৰ কাৰণ: আজি নতুন বিষয়ত মনোযোগ দিবলৈ ${game} উপযোগী।`,
    },
    caregiverInsights: {
      improving: (score) => `বয়োজ্যেষ্ঠজনৰ শেহতীয়া কাৰ্যকলাপ ব্যক্তিগত মাত্ৰাতকৈ উন্নত (${score}% গড়)। মনোযোগ সুস্থিৰ।`,
      stable: 'কাৰ্যকলাপৰ ছন্দ স্বাভাৱিক মাত্ৰাৰ সৈতে সুসংগতভাৱে চলি আছে।',
      struggling: 'ব্যক্তিগত স্বাভাৱিক গতিৰ তুলনাত অলপ মন্থৰতা দেখা গৈছে। সাৰথিয়ে সহজ আৰু আনন্দদায়ক খেলৰ পৰামৰ্শ দিছে।',
      repeatedDeviation: 'শেহতীয়া সত্রসমূহত স্বাভাৱিক ছন্দৰ পৰা উল্লেখযোগ্য তাৰতম্য লক্ষ্য কৰা হৈছে। পৰিচৰ্যাকৰ্তাৰ পৰ্যবেক্ষণ আৰু জিৰণিৰ পৰামৰ্শ।',
    },
    actionLabels: {
      playNow: 'এতিয়াই খেলক',
      checkMeds: 'ঔষধ আৰু পানী চাওক',
      takeRest: 'শান্তিময় কোঠাত জিৰণি',
      callFamily: 'পৰিয়ালক ফোন কৰক',
      viewAlbum: 'পৰিয়ালৰ এলবাম চাওক',
    },
  },

  bn: {
    greeting: 'নমস্কার! আমি সারথি, আপনার সার্বক্ষণিক যত্নসঙ্গী। আজকে আপনি কেমন আছেন?',
    gameTitles: {
      memory_match: 'সাংস্কৃতিক স্মৃতি মেলা',
      tea_garden: 'চা বাগানের মনোযোগ',
      brain_quest: 'পাহাড়ী ধাঁধা',
      pattern_weave: 'তাঁতের নকশা',
      routine_builder: 'দৈনন্দিন রুটিন সাজানো',
      sounds_hills: 'পাহাড়ের সুর',
      family_recall: 'চিহ্ন আপনজন',
    },
    trendExplanations: {
      improving: 'আপনার সাম্প্রতিক মনোযোগ ও একাগ্রতা ব্যক্তিগত গড়ের চেয়েও সুন্দরভাবে বৃদ্ধি পেয়েছে।',
      stable: 'আপনার সারাদিনের ছন্দ চমৎকার ও স্বাভাবিক রয়েছে।',
      struggling: 'আজ একটু ধীরেসুস্থে সহজ কাজ করলে মন ফুরফুরে থাকবে।',
      repeated_deviation: 'আপনার সাম্প্রতিক কাজের ছন্দে কিছুটা পরিবর্তন দেখা যাচ্ছে। একটু বিশ্রাম নিলে ভালো হবে।',
    },
    quickActionReplies: {
      howAmIDoing: 'আপনি বেশ ভালো আছেন! আপনার দৈনন্দিন নিয়ম ও খেলার ছন্দ মনে আনন্দ যোগাচ্ছে।',
      playGamePrompt: 'আপনার জন্য একটি সুন্দর ও আনন্দদায়ক খেলা বেছে রেখেছি। খেলতে চান?',
      whatNext: 'এখন এক গ্লাস তাজা জল খেয়ে নিন অথবা একটি মৃদু সুর শুনুন।',
      remindersSummary: (taken, total, glasses) =>
        `আপনি আজকের ${total}টি ওষুধের মধ্যে ${taken}টি নিয়েছেন এবং ৮ গ্লাসের মধ্যে ${glasses} গ্লাস জল খেয়েছেন।`,
      comfortChat: 'আমি সবসময় আপনার পাশে আছি। শান্তভাবে শ্বাস নিন এবং প্রিয়জনের মিষ্টি স্মৃতি মনে করুন।',
      callCaregiver: (name, phone) =>
        `আমি এখনই আপনার প্রিয়জন ${name} মহাশয়ের কাছে ফোন করতে সাহায্য করছি (${phone})। আপনি সম্পূর্ণ নিরাপদে আছেন।`,
    },
    reasonTemplates: {
      improving: (game, score) => `পরামর্শের কারণ: ${game}-এ আপনার সাম্প্রতিক নম্বর ${score}% পৌঁছেছে, যা ব্যক্তিগত গড়ের চেয়েও ভালো।`,
      stable: (game) => `পরামর্শের কারণ: ${game} খেলার মাধ্যমে স্মৃতিশক্তি বজায় রাখা।`,
      struggling: (game) => `পরামর্শের কারণ: ${game} একটি সহজ ও মনোরম খেলা যা মনকে প্রফুল্ল রাখবে।`,
      repeatedDeviation: 'পরামর্শের কারণ: সাম্প্রতিক কাজের পর কিছুটা মানসিক আরাম ও বিশ্রাম দরকার।',
      routineBalance: (game) => `পরামর্শের কারণ: আজ নতুন একটি খেলা হিসেবে ${game} উপযুক্ত।`,
    },
    caregiverInsights: {
      improving: (score) => `প্রবীণের সাম্প্রতিক সক্রিয়তা নিজস্ব বেসলাইনের চেয়ে ভালো (${score}% গড়)। একাগ্রতা ও সময়জ্ঞান স্বাভাবিক।`,
      stable: 'কাজের ধারা নিজস্ব ব্যক্তিগত গড়ের সাথে সামঞ্জস্যপূর্ণভাবে চলছে।',
      struggling: 'স্বাভাবিক গতির তুলনায় কিছুটা ধীরগতি লক্ষ্য করা গেছে। সারথি একটি আরামদায়ক হালকা কাজের পরামর্শ দিয়েছে।',
      repeatedDeviation: 'সাম্প্রতিক সেশনগুলিতে ব্যক্তিগত বেসলাইন থেকে কিছুটা পরিবর্তন দেখা গেছে। পরিচর্যাকারীর খোঁজ নেওয়া এবং বিশ্রামের পরামর্শ।',
    },
    actionLabels: {
      playNow: 'এখনই খেলুন',
      checkMeds: 'ওষুধ ও জল দেখুন',
      takeRest: 'শান্তিময় কোঠায় বিশ্রাম',
      callFamily: 'পরিবারকে ফোন করুন',
      viewAlbum: 'পারিবারিক অ্যালবাম',
    },
  },

  hi: {
    greeting: 'नमस्ते! मैं सारथी हूँ, आपकी देखभाल और मार्गदर्शन का साथी। आज आप कैसा महसूस कर रहे हैं?',
    gameTitles: {
      memory_match: 'सांस्कृतिक स्मृति मिलान',
      tea_garden: 'चाय बगान ध्यान व फुर्ती',
      brain_quest: 'पहाड़ी पहेलियां',
      pattern_weave: 'हथकरघा बुनाई पैटर्न',
      routine_builder: 'दिनचर्या क्रम निर्धारण',
      sounds_hills: 'पहाड़ों की धुन व आवाजें',
      family_recall: 'पहचानें अपने प्रियजन',
    },
    trendExplanations: {
      improving: 'आपकी हालिया एकाग्रता आपके सामान्य स्तर से बहुत अच्छी और सक्रिय है।',
      stable: 'आपकी दिनचर्या और गतिविधि का स्तर बहुत संतुलित और स्थिर है।',
      struggling: 'आज आराम से और सहज रूप से समय बिताना आपके लिए सबसे अच्छा रहेगा।',
      repeated_deviation: 'आपकी हालिया गतिविधि सामान्य दिनचर्या से थोड़ी भिन्न है। थोड़ा विश्राम लेना लाभकारी होगा।',
    },
    quickActionReplies: {
      howAmIDoing: 'आप बहुत अच्छा कर रहे हैं! आपकी सक्रियता और उत्साह देखकर बहुत प्रसन्नता होती है।',
      playGamePrompt: 'मैंने आपके लिए एक बहुत ही सुखद खेल चुना है। क्या आप इसे खेलना चाहेंगे?',
      whatNext: 'इस समय एक गिलास ताज़ा पानी पीना और शांत वातावरण में मनपसंद संगीत सुनना उत्तम रहेगा।',
      remindersSummary: (taken, total, glasses) =>
        `आपने आज की ${total} में से ${taken} दवाइयां ले ली हैं और 8 में से ${glasses} गिलास पानी पिया है।`,
      comfortChat: 'मैं सदैव आपके साथ हूँ। गहरी सांस लें और अपने प्रियजनों की सुखद यादों को याद करें।',
      callCaregiver: (name, phone) =>
        `मैं अभी आपके परिजन ${name} जी को कॉल करने में आपकी मदद करता हूँ (${phone})। आप पूरी तरह सुरक्षित हैं।`,
    },
    reasonTemplates: {
      improving: (game, score) => `सुझाव का कारण: ${game} में आपका हालिया स्कोर ${score}% रहा, जो आपके व्यक्तिगत स्तर से बेहतर है।`,
      stable: (game) => `सुझाव का कारण: ${game} के द्वारा स्मृति और मानसिक संतुलन बनाए रखना।`,
      struggling: (game) => `सुझाव का कारण: ${game} एक बहुत ही आसान व तनावमुक्त खेल है जो आत्मविश्वास बढ़ाएगा।`,
      repeatedDeviation: 'सुझाव का कारण: हालिया गतिविधियों को देखते हुए थोड़ी देर शांति से विश्राम करना उचित है।',
      routineBalance: (game) => `सुझाव का कारण: आज एक नए और रुचिकर खेल ${game} का अभ्यास करना अच्छा रहेगा।`,
    },
    caregiverInsights: {
      improving: (score) => `बुजुर्ग की हालिया सक्रियता व्यक्तिगत आधार स्तर से बेहतर है (${score}% औसत)। ध्यान व प्रतिक्रिया स्थिर है।`,
      stable: 'गतिविधि पैटर्न व्यक्तिगत स्तर के अनुरूप स्थिर और नियमित बना हुआ है।',
      struggling: 'सामान्य गति की तुलना में थोड़ी थकान या विलंब देखा गया। सारथी ने आसान और तनावमुक्त गतिविधि सुझाई है।',
      repeatedDeviation: 'हालिया सत्रों में व्यक्तिगत आधार स्तर से उल्लेखनीय बदलाव दर्ज हुआ है। देखभालकर्ता की समीक्षा व विश्राम की सिफारिश की गई है।',
    },
    actionLabels: {
      playNow: 'अभी खेलें',
      checkMeds: 'दवा व पानी देखें',
      takeRest: 'विश्राम कक्ष',
      callFamily: 'परिवार को कॉल करें',
      viewAlbum: 'पारिवारिक एल्बम',
    },
  },

  mni: {
    greeting: 'Khurumjari! Eina Sarthi ni, nangi care companion. Ngasi nungcba fajabra?',
    gameTitles: {
      memory_match: 'Cultural Memory Match',
      tea_garden: 'Tea Garden Focus',
      brain_quest: 'Hill Folklore Riddles',
      pattern_weave: 'Handloom Pattern Weave',
      routine_builder: 'Daily Routine Builder',
      sounds_hills: 'Sounds of Hills',
      family_recall: 'Imunggi Mi Sak Khangba',
    },
    trendExplanations: {
      improving: 'Nangi recent focus ashidi baseline tagi yamna hena fajaraphe.',
      stable: 'Nangi nongmashinggi activity pattern yamna fana leiri.',
      struggling: 'Ngasi tapna chatchasi, relaxing game khektang sase.',
      repeated_deviation: 'Activity pattern ashi usual baseline dagi khennare. Pottha ba fajai.',
    },
    quickActionReplies: {
      howAmIDoing: 'Nang yamna fajana leiri! Nangi routine amasung sports yamna nungai.',
      playGamePrompt: 'Eina nungcba game ama khanduna leiri. Sasi yabra?',
      whatNext: 'Ishing glass ama thaklo amasung nungcba sur ama tabiyu.',
      remindersSummary: (taken, total, glasses) =>
        `Ngasi hidak ${total} gi manungda ${taken} charabani, ishing glass 8 gi manungda ${glasses} thakle.`,
      comfortChat: 'Eina nangi nakandada leiri. Nungcba mi amata ningsingbiyu.',
      callCaregiver: (name, phone) =>
        `Eina nangi nungcba ${name} (${phone}) da call touba mateng pangge. Nang safe oina leiri.`,
    },
    reasonTemplates: {
      improving: (game, score) => `Reason: ${game} da score ${score}% yoraga personal baseline dagi fana hekpa hekpa leire.`,
      stable: (game) => `Reason: ${game} sijinaraga mental balance kanba.`,
      struggling: (game) => `Reason: ${game} ashi yamna easy amasung joyful game ni.`,
      repeatedDeviation: 'Reason: Recent activity nungcba relax touba darkar oire.',
      routineBalance: (game) => `Reason: Fresh cognitive domain practice touba with ${game}.`,
    },
    caregiverInsights: {
      improving: (score) => `Patient's recent engagement is above personal baseline (${score}% avg). Steady attention.`,
      stable: 'Activity pattern is consistent with personal baseline.',
      struggling: 'Latency is slightly slower than personal baseline. Sarthi suggested relaxing game.',
      repeatedDeviation: 'Activity pattern changed notably from personal baseline. Recommended caregiver review.',
    },
    actionLabels: {
      playNow: 'Sasi',
      checkMeds: 'Hidak & Ishing',
      takeRest: 'Sanctuary da pottha',
      callFamily: 'Imungda call tou',
      viewAlbum: 'Family Album',
    },
  },
};

export function getLocalizedPhrases(lang: Language): LocalizedRecommendationPhrases {
  return SARTHI_LANGUAGES[lang] || SARTHI_LANGUAGES.en;
}

export const sarthiLanguageAdapter = {
  getLocalizedPhrases,
  SARTHI_LANGUAGES,
};

export default sarthiLanguageAdapter;

import React, { useState, useEffect } from 'react';
import { Language, DDAState, DDAUpdateResult } from '../../types';
import { updateDDA, GAME_LEVELS } from '../../services/aiEngine';
import { storage } from '../../services/storage';
import { playSound, speak } from '../../services/voiceService';
import confetti from 'canvas-confetti';
import { ArrowLeft, Sparkles, Trophy, Award, Volume2 } from 'lucide-react';
import { t } from '../../services/i18n';

interface PatternWeaveProps {
  language: Language;
  onBack: () => void;
}

interface WeavePattern {
  id: string;
  level: number;
  name: Record<Language, string>;
  sequence: { symbol: string; label: string }[];
  missingIndex: number;
  options: { id: string; symbol: string; label: string; isCorrect: boolean }[];
}

const WEAVE_PATTERNS: WeavePattern[] = [
  // Level 1: Gentle 2-element alternating (AB-AB-A)
  {
    id: 'p1',
    level: 1,
    name: {
      as: 'মৰমৰ মেখেলা চাদৰৰ বুটা',
      bn: 'মেখলা চাদরের ঐতিহ্যবাহী বুটি',
      mni: 'Phanek Machina',
      hi: 'मेखेला चादोर का पारंपरिक बूटा',
      en: 'Mekhela Chador Traditional Buta',
    },
    sequence: [
      { symbol: '🔶', label: 'সোণালী হীৰা' },
      { symbol: '🪷', label: 'ৰঙা পদ্ম' },
      { symbol: '🔶', label: 'সোণালী হীৰা' },
      { symbol: '🪷', label: 'ৰঙা পদ্ম' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🔶', label: 'সোণালী হীৰা', isCorrect: true },
      { id: 'opt-2', symbol: '🟢', label: 'সেউজীয়া বৃত্ত', isCorrect: false },
      { id: 'opt-3', symbol: '🪷', label: 'ৰঙা পদ্ম', isCorrect: false },
    ],
  },
  {
    id: 'p2',
    level: 1,
    name: {
      as: 'বাঁহ আৰু সোণালী ধাননি পথাৰ',
      bn: 'বাঁশ ও সোনালী ধানের শিস',
      mni: 'Waa amsung Fou',
      hi: 'बांस और सुनहरी धान की बाली',
      en: 'Bamboo Frond & Golden Paddy',
    },
    sequence: [
      { symbol: '🎋', label: 'বাঁহ' },
      { symbol: '🌾', label: 'ধান' },
      { symbol: '🎋', label: 'বাঁহ' },
      { symbol: '🌾', label: 'ধান' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🎋', label: 'বাঁহ', isCorrect: true },
      { id: 'opt-2', symbol: '🍂', label: 'শুকান পাত', isCorrect: false },
      { id: 'opt-3', symbol: '🌾', label: 'ধান', isCorrect: false },
    ],
  },
  {
    id: 'p3',
    level: 1,
    name: {
      as: 'অসম চাহৰ সেউজ কুঁহিপাত',
      bn: 'আসাম চায়ের সবুজ পাতা',
      mni: 'Cha machu',
      hi: 'असम चाय की हरी पत्ती व प्याला',
      en: 'Assam Morning Tea & Leaf',
    },
    sequence: [
      { symbol: '☕', label: 'গৰম চাহ' },
      { symbol: '🍃', label: 'সেউজ পাত' },
      { symbol: '☕', label: 'গৰম চাহ' },
      { symbol: '🍃', label: 'সেউজ পাত' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '☕', label: 'গৰম চাহ', isCorrect: true },
      { id: 'opt-2', symbol: '💧', label: 'পানী', isCorrect: false },
      { id: 'opt-3', symbol: '🍯', label: 'মৌ', isCorrect: false },
    ],
  },

  // Level 2: 3-element cyclical (ABC-ABC)
  {
    id: 'p4',
    level: 2,
    name: {
      as: 'নগা শালৰ জ্যামিতিক চানেকি',
      bn: 'নাগা শালের জ্যামিতিক নকশা',
      mni: 'Naga Shawl Machu',
      hi: 'नगा शॉल की ज्यामितीय बुनाई',
      en: 'Naga Geometric Shawl Weave',
    },
    sequence: [
      { symbol: '⬛', label: 'ক’লা খণ্ড' },
      { symbol: '🟥', label: 'ৰঙা খণ্ড' },
      { symbol: '⬜', label: 'বগা খণ্ড' },
      { symbol: '⬛', label: 'ক’লা খণ্ড' },
      { symbol: '❓', label: 'খালী ঠাই' },
      { symbol: '⬜', label: 'বগা খণ্ড' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🟦', label: 'নীলা খণ্ড', isCorrect: false },
      { id: 'opt-2', symbol: '🟥', label: 'ৰঙা খণ্ড', isCorrect: true },
      { id: 'opt-3', symbol: '🟨', label: 'হালধীয়া খণ্ড', isCorrect: false },
    ],
  },
  {
    id: 'p5',
    level: 2,
    name: {
      as: 'মেঘালয় পাহাৰৰ সূৰ্য্য আৰু বৰষুণ',
      bn: 'পাহাড়ের রোদ ও মেঘের খেলা',
      mni: 'Nong amsung Numit',
      hi: 'पहाड़ी धूप, बारिश व इंद्रधनुष',
      en: 'Sun, Rain & Hill Rainbow',
    },
    sequence: [
      { symbol: '☀️', label: 'ৰোদ' },
      { symbol: '🌧️', label: 'বৰষুণ' },
      { symbol: '🌈', label: 'ৰামধেনু' },
      { symbol: '☀️', label: 'ৰোদ' },
      { symbol: '❓', label: 'খালী ঠাই' },
      { symbol: '🌈', label: 'ৰামধেনু' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🌧️', label: 'বৰষুণ', isCorrect: true },
      { id: 'opt-2', symbol: '⚡', label: 'বিজুলী', isCorrect: false },
      { id: 'opt-3', symbol: '❄️', label: 'বৰফ', isCorrect: false },
    ],
  },
  {
    id: 'p6',
    level: 2,
    name: {
      as: 'নামঘৰৰ সন্ধিয়াৰ পবিত্ৰ সুৰভিত চাকি',
      bn: 'নামঘরের সন্ধ্যার শান্ত প্রদীপ',
      mni: 'Laisang gi Thabimei',
      hi: 'नामघर की संध्या आरती व पुष्प',
      en: 'Naamghar Evening Chime & Diya',
    },
    sequence: [
      { symbol: '🔔', label: 'ঘণ্টা' },
      { symbol: '🪔', label: 'চাকি' },
      { symbol: '🌸', label: 'ফুল' },
      { symbol: '🔔', label: 'ঘণ্টা' },
      { symbol: '🪔', label: 'চাকি' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 5,
    options: [
      { id: 'opt-1', symbol: '🌸', label: 'ফুল', isCorrect: true },
      { id: 'opt-2', symbol: '🕯️', label: 'মমবাতি', isCorrect: false },
      { id: 'opt-3', symbol: '🪘', label: 'খোল', isCorrect: false },
    ],
  },

  // Level 3: Paired motifs (ABBA / AABB)
  {
    id: 'p7',
    level: 3,
    name: {
      as: 'মণিপুৰী ফানেকৰ লটাক ফুল',
      bn: 'মণিপুরী ফানেকের লতা ফুল',
      mni: 'Phanek Mayek',
      hi: 'मणिपुरी फानेक की रेशमी लता',
      en: 'Manipuri Phanek Border Weave',
    },
    sequence: [
      { symbol: '🌸', label: 'ফুল' },
      { symbol: '🌿', label: 'পাত' },
      { symbol: '🌿', label: 'পাত' },
      { symbol: '🌸', label: 'ফুল' },
      { symbol: '❓', label: 'খালী ঠাই' },
      { symbol: '🌿', label: 'পাত' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🌿', label: 'পাত', isCorrect: true },
      { id: 'opt-2', symbol: '🌸', label: 'ফুল', isCorrect: false },
      { id: 'opt-3', symbol: '🍂', label: 'শুকান পাত', isCorrect: false },
    ],
  },
  {
    id: 'p8',
    level: 3,
    name: {
      as: 'আহোম ৰাজদৰবাৰৰ ৰত্ন আৰু কাঁহৰ শৰাই',
      bn: 'আহোম রাজদরবারের রত্ন ও শরাই',
      mni: 'Ningthougi Sanathi',
      hi: 'अहोम राजमहल के रत्न व शराई',
      en: 'Ahom Royal Jewels & Xorai',
    },
    sequence: [
      { symbol: '💎', label: 'মণি' },
      { symbol: '💎', label: 'মণি' },
      { symbol: '🏆', label: 'শৰাই' },
      { symbol: '🏆', label: 'শৰাই' },
      { symbol: '💎', label: 'মণি' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 5,
    options: [
      { id: 'opt-1', symbol: '💎', label: 'মণি', isCorrect: true },
      { id: 'opt-2', symbol: '🏆', label: 'শৰাই', isCorrect: false },
      { id: 'opt-3', symbol: '🪙', label: 'মুদ্ৰা', isCorrect: false },
    ],
  },
  {
    id: 'p9',
    level: 3,
    name: {
      as: 'ধনেশ পক্ষী আৰু পাহাৰী কপৌ ফুল',
      bn: 'ধনেশ পাখি ও অর্কিড ফুল',
      mni: 'Hornbill amsung Lei',
      hi: 'हॉर्नबिल व आर्किड पुष्प का जोड़ा',
      en: 'Great Hornbill & Kopou Orchids',
    },
    sequence: [
      { symbol: '🦜', label: 'ধনেশ' },
      { symbol: '🦜', label: 'ধনেশ' },
      { symbol: '🌺', label: 'কপৌ ফুল' },
      { symbol: '🌺', label: 'কপৌ ফুল' },
      { symbol: '❓', label: 'খালী ঠাই' },
      { symbol: '🦜', label: 'ধনেশ' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🦜', label: 'ধনেশ', isCorrect: true },
      { id: 'opt-2', symbol: '🌺', label: 'কপৌ ফুল', isCorrect: false },
      { id: 'opt-3', symbol: '🌿', label: 'লতা', isCorrect: false },
    ],
  },

  // Level 4: Complex rhythm & Progressive cadence
  {
    id: 'p10',
    level: 4,
    name: {
      as: 'লোকটক হ্ৰদৰ নাও আৰু পানীৰ সোঁত',
      bn: 'লোকটাক হ্রদের নৌকা ও তরঙ্গের ছন্দ',
      mni: 'Loktak Hinao',
      hi: 'लोकटक झील की नाव व जलतरंग',
      en: 'Loktak Lake Canoe Channeling',
    },
    sequence: [
      { symbol: '🌊', label: 'ঢৌ' },
      { symbol: '🌊', label: 'ঢৌ' },
      { symbol: '🚣', label: 'নাও' },
      { symbol: '🌊', label: 'ঢৌ' },
      { symbol: '🌊', label: 'ঢৌ' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 5,
    options: [
      { id: 'opt-1', symbol: '🚣', label: 'নাও', isCorrect: true },
      { id: 'opt-2', symbol: '🐟', label: 'মাছ', isCorrect: false },
      { id: 'opt-3', symbol: '🌊', label: 'ঢৌ', isCorrect: false },
      { id: 'opt-4', symbol: '🪷', label: 'পদ্ম', isCorrect: false },
    ],
  },
  {
    id: 'p11',
    level: 4,
    name: {
      as: 'তাঁতশালৰ গামোচাৰ চিৰন্তন সূতা',
      bn: 'তাঁতের গামোছার চিরন্তন সুতো',
      mni: 'Yongkham Khudei',
      hi: 'हथकरघा बुनाई व लाल गमोसा',
      en: 'Loom Shuttle & Phulam Gamosa',
    },
    sequence: [
      { symbol: '🧣', label: 'গামোচা' },
      { symbol: '🪡', label: 'বেজী-সূতা' },
      { symbol: '🧣', label: 'গামোচা' },
      { symbol: '🧣', label: 'গামোচা' },
      { symbol: '🪡', label: 'বেজী-সূতা' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 5,
    options: [
      { id: 'opt-1', symbol: '🧣', label: 'গামোচা', isCorrect: true },
      { id: 'opt-2', symbol: '🧵', label: 'ৰীল', isCorrect: false },
      { id: 'opt-3', symbol: '✂️', label: 'কেঁচী', isCorrect: false },
      { id: 'opt-4', symbol: '🪡', label: 'বেজী-সূতা', isCorrect: false },
    ],
  },
  {
    id: 'p12',
    level: 4,
    name: {
      as: 'সৰ্থেবাৰীৰ কাঁহৰ বাচন আৰু শংখ',
      bn: 'কাঁসার শিল্প ও শুভ শাঁখ',
      mni: 'Kanh gi Potchei',
      hi: 'सरथेबारी के कांस्य पात्र व मंगल शंख',
      en: 'Bell-Metal Craft & Sacred Conch',
    },
    sequence: [
      { symbol: '🐚', label: 'শংখ' },
      { symbol: '🔔', label: 'কাঁহ' },
      { symbol: '🔔', label: 'কাঁহ' },
      { symbol: '🐚', label: 'শংখ' },
      { symbol: '❓', label: 'খালী ঠাই' },
      { symbol: '🔔', label: 'কাঁহ' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🔔', label: 'কাঁহ', isCorrect: true },
      { id: 'opt-2', symbol: '🐚', label: 'শংখ', isCorrect: false },
      { id: 'opt-3', symbol: '🏆', label: 'শৰাই', isCorrect: false },
      { id: 'opt-4', symbol: '🪔', label: 'চাকি', isCorrect: false },
    ],
  },

  // Level 5: Master Weaver Triads & Strategic Motifs
  {
    id: 'p13',
    level: 5,
    name: {
      as: 'লাচিত বৰফুকনৰ ঐতিহাসিক শৌৰ্য্য',
      bn: 'লাচিত বরফুকনের ঐতিহাসিক শৌর্য',
      mni: 'Lachit Borphukan Ningthou',
      hi: 'लाचित बोरफुकन का सैन्य शौर्य प्रतीक',
      en: 'Lachit Borphukan Royal Armor',
    },
    sequence: [
      { symbol: '👑', label: 'মুকুট' },
      { symbol: '🛡️', label: 'ঢাল' },
      { symbol: '⚔️', label: 'হেংদাং' },
      { symbol: '👑', label: 'মুকুট' },
      { symbol: '🛡️', label: 'ঢাল' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 5,
    options: [
      { id: 'opt-1', symbol: '⚔️', label: 'হেংদাং', isCorrect: true },
      { id: 'opt-2', symbol: '🏹', label: 'ধনু', isCorrect: false },
      { id: 'opt-3', symbol: '👑', label: 'মুকুট', isCorrect: false },
      { id: 'opt-4', symbol: '🛡️', label: 'ঢাল', isCorrect: false },
    ],
  },
  {
    id: 'p14',
    level: 5,
    name: {
      as: 'কাজিৰঙাৰ তিনি মহীয়সী বন্যপ্ৰাণ',
      bn: 'কাজিরাঙ্গার তিন মহান বন্যপ্রাণী',
      mni: 'Kaziranga Umunggi Saa',
      hi: 'काजीरंगा के तीन राजसी वन्यजीव',
      en: 'Kaziranga Great Wildlife Triad',
    },
    sequence: [
      { symbol: '🦏', label: 'গঁড়' },
      { symbol: '🐘', label: 'হাতী' },
      { symbol: '🐅', label: 'বাঘ' },
      { symbol: '🦏', label: 'গঁড়' },
      { symbol: '❓', label: 'খালী ঠাই' },
      { symbol: '🐅', label: 'বাঘ' },
    ],
    missingIndex: 4,
    options: [
      { id: 'opt-1', symbol: '🐘', label: 'হাতী', isCorrect: true },
      { id: 'opt-2', symbol: '🦌', label: 'হৰিণা', isCorrect: false },
      { id: 'opt-3', symbol: '🦏', label: 'গঁড়', isCorrect: false },
      { id: 'opt-4', symbol: '🐅', label: 'বাঘ', isCorrect: false },
    ],
  },
  {
    id: 'p15',
    level: 5,
    name: {
      as: 'নীলাচলৰ নিশাৰ তৰা আৰু চন্দ্ৰকলা',
      bn: 'নীলাচলের রাতের তারা ও জ্যোৎস্না',
      mni: 'Thaja amsung Thawanmichak',
      hi: 'नीलाचल पर्वत का चंद्रकला व नक्षत्र चक्र',
      en: 'Nilachal Hills Celestial Stars',
    },
    sequence: [
      { symbol: '🌙', label: 'জোন' },
      { symbol: '✨', label: 'উজ্বল তৰা' },
      { symbol: '🌟', label: 'মহামিলন' },
      { symbol: '🌙', label: 'জোন' },
      { symbol: '✨', label: 'উজ্বল তৰা' },
      { symbol: '❓', label: 'খালী ঠাই' },
    ],
    missingIndex: 5,
    options: [
      { id: 'opt-1', symbol: '🌟', label: 'মহামিলন', isCorrect: true },
      { id: 'opt-2', symbol: '☀️', label: 'সূৰ্য্য', isCorrect: false },
      { id: 'opt-3', symbol: '☄️', label: 'উল্কা', isCorrect: false },
      { id: 'opt-4', symbol: '🪐', label: 'গ্ৰহ', isCorrect: false },
    ],
  },
];

export const PatternWeave: React.FC<PatternWeaveProps> = ({
  language,
  onBack,
}) => {
  const [ddaState, setDdaState] = useState<DDAState>(() => storage.loadGameDDA('pattern_weave', 1));
  const [activePatterns, setActivePatterns] = useState<WeavePattern[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [levelResult, setLevelResult] = useState<DDAUpdateResult | null>(null);

  // Pick 3 random patterns tuned to current DDA level
  const initRound = (lvl: number) => {
    const exactMatches = WEAVE_PATTERNS.filter((p) => p.level === lvl);
    const fallbackMatches = WEAVE_PATTERNS.filter((p) => Math.abs(p.level - lvl) <= 1);
    const pool = exactMatches.length >= 3 ? exactMatches : fallbackMatches.length >= 3 ? fallbackMatches : WEAVE_PATTERNS;

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    const withShuffledOptions = shuffled.map((p) => ({
      ...p,
      options: [...p.options].sort(() => Math.random() - 0.5),
    }));

    setActivePatterns(withShuffledOptions);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setScore(0);
    setIsFinished(false);
    setLevelResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initRound(ddaState.level);
  }, []);

  const currentPattern = activePatterns[currentIdx] || activePatterns[0] || WEAVE_PATTERNS[0];

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);

    const option = currentPattern.options.find((o) => o.id === optionId);
    const isCorrect = !!option?.isCorrect;

    if (isCorrect) {
      playSound('success');
      setScore((s) => s + 1);
    } else {
      playSound('click');
    }

    setTimeout(() => {
      if (currentIdx + 1 < activePatterns.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOptionId(null);
      } else {
        finishGame(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  const finishGame = (finalScore: number) => {
    setIsFinished(true);
    const timeTakenMs = Date.now() - startTime;
    const totalQ = Math.max(1, activePatterns.length);
    const avgLatency = Math.round(timeTakenMs / totalQ);
    const accuracy = finalScore / totalQ;
    const success = accuracy >= 0.66;

    const updated = updateDDA(ddaState, { success, accuracy, reactionTimeMs: avgLatency });
    setDdaState(updated);
    storage.saveGameDDA('pattern_weave', updated);
    setLevelResult(updated);

    if (updated.leveledUp) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } else {
      confetti({ particleCount: 50, spread: 60 });
    }

    storage.saveCognitiveSession({
      id: `sess-${Date.now()}`,
      gameId: 'pattern_weave',
      domain: 'pattern_logic',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      score: Math.round(accuracy * 100),
      maxScore: 100,
      accuracy,
      reactionTimeMs: avgLatency,
      difficultyLevel: updated.level,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-xs border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-bold text-stone-700">
          <div className="flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-2xl border border-teal-200 shadow-2xs">
            <span className="text-base">{GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🧵'}</span>
            <span className="text-xs font-black text-teal-800">
              {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}
            </span>
          </div>
          <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl">
            {currentIdx + 1} / {activePatterns.length || 3}
          </span>
          <span className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl">
            {t('score', language)}: {score}
          </span>
        </div>
      </div>

      {/* Main Weaving Board */}
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl">
                🧵
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                  {t('patternWeaveTitle', language)}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {currentPattern.name[language] || currentPattern.name.en}
                </p>
              </div>
            </div>
            <button
              onClick={() => speak(`${t('patternWeaveTitle', language)}. ${t('whichMotif', language)}`, language)}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors cursor-pointer border border-teal-200"
              title={t('voice.readAloud', language)}
              aria-label={t('voice.readAloud', language)}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Loom Shuttle Sequence Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 p-6 rounded-3xl border-2 border-dashed border-amber-300">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-widest text-center mb-4">
              {t('warpWeft', language)}
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {currentPattern.sequence.map((item, idx) => {
                const isMissing = idx === currentPattern.missingIndex;
                return (
                  <div
                    key={idx}
                    className={`w-14 h-16 sm:w-18 sm:h-22 rounded-2xl flex flex-col items-center justify-center text-3xl sm:text-4xl shadow-md border-2 transition-all ${
                      isMissing
                        ? 'bg-amber-200 border-amber-500 ring-4 ring-amber-400/40 animate-pulse text-amber-800 font-black'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    {isMissing && selectedOptionId ? (
                      <span>
                        {currentPattern.options.find((o) => o.id === selectedOptionId)?.symbol}
                      </span>
                    ) : (
                      <span>{item.symbol}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-stone-500 text-center mt-4 font-medium">
              {t('whichMotif', language)}
            </p>
          </div>

          {/* Options to Choose */}
          <div className="space-y-2">
            <p className="text-xs font-black text-stone-600 uppercase tracking-wider">
              {t('whichMotif', language)}
            </p>
            <div className={`grid gap-3 ${currentPattern.options.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {currentPattern.options.map((option) => {
                const isChosen = selectedOptionId === option.id;
                let btnClass = 'bg-stone-50 hover:bg-amber-50 border-stone-200 text-stone-800';

                if (selectedOptionId) {
                  if (option.isCorrect) {
                    btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400';
                  } else if (isChosen) {
                    btnClass = 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400';
                  }
                }

                return (
                  <button
                    key={option.id}
                    disabled={selectedOptionId !== null}
                    onClick={() => handleSelectOption(option.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${btnClass}`}
                  >
                    <span className="text-4xl">{option.symbol}</span>
                    <span className="text-xs font-bold">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 mx-auto flex items-center justify-center text-3xl">
            <Trophy className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('patternWeaveWonTitle', language)}
          </h3>
          <p className="text-stone-600 text-sm">
            {t('score', language)}: <strong className="text-teal-700 font-black">{score}</strong> / {activePatterns.length}
          </p>

          {/* Level Adaptive Feedback */}
          {levelResult && (
            <div className={`mt-4 mx-auto max-w-md p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md ${
              levelResult.leveledUp
                ? 'bg-amber-400 text-stone-950 animate-bounce'
                : 'bg-teal-50 text-teal-950 border border-teal-200'
            }`}>
              <span className="text-xl">
                {GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.badge || '🧵'}
              </span>
              <span>
                {levelResult.feedbackMessage?.[language] ||
                  `${GAME_LEVELS[ddaState.level as 1 | 2 | 3 | 4 | 5]?.name[language] || `Level ${ddaState.level}`}`}
              </span>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => initRound(ddaState.level)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer transition-transform active:scale-95"
            >
              {t('playAgain', language)}
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-2xl text-sm cursor-pointer"
            >
              {t('home', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternWeave;

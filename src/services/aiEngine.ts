import {
  DDAState,
  CognitiveSession,
  CVIScorecard,
  CognitiveDomain,
  GameLevelMeta,
  DDAPerformance,
  DDAUpdateResult,
  Language,
} from '../types';

export const GAME_LEVELS: Record<number, GameLevelMeta> = {
  1: {
    level: 1,
    badge: '🌱',
    name: {
      en: 'Level 1: Morning Dew',
      as: 'স্তৰ ১: পুৱাৰ নিয়ৰ',
      bn: 'স্তর ১: সকালের শিশির',
      hi: 'स्तर १: सुबह की ओस',
      mni: 'Level 1: Ayangba Irik',
    },
    description: {
      en: 'Gentle, guided pace with generous hints and peaceful focus.',
      as: 'শান্ত গতি, স্পষ্ট সংকেত আৰু মন জুৰোৱা মনোযোগ।',
      bn: 'শান্ত গতি, সহায়ক ইঙ্গিত ও ধীরস্থির মনোযোগ।',
      hi: 'शांत गति, स्पष्ट संकेत और सहज ध्यान।',
      mni: 'Yatapna, marik thiba matengga loinana.',
    },
  },
  2: {
    level: 2,
    badge: '🌿',
    name: {
      en: 'Level 2: Green Valley',
      as: 'স্তৰ ২: সেউজ উপত্যকা',
      bn: 'স্তর ২: সবুজ উপত্যকা',
      hi: 'स्तर २: हरी घाटी',
      mni: 'Level 2: Ashangba Tampak',
    },
    description: {
      en: 'Natural flow with balanced cultural challenges.',
      as: 'প্ৰাকৃতিক প্ৰবাহ আৰু সন্তুলিত সাংস্কৃতিক অনুশীলন।',
      bn: 'প্রাকৃতিক গতি ও ভারসাম্যপূর্ণ অনুশীলন।',
      hi: 'संतुलित गति और सांस्कृतिक अभ्यास।',
      mni: 'Tampakki matamga channaba.',
    },
  },
  3: {
    level: 3,
    badge: '🏞️',
    name: {
      en: 'Level 3: Hill Stream',
      as: 'স্তৰ ৩: পাহাৰীয়া জুৰি',
      bn: 'স্তর ৩: পাহাড়ী ঝর্ণা',
      hi: 'स्तर ३: पहाड़ी झरना',
      mni: 'Level 3: Chinggi Turel',
    },
    description: {
      en: 'Active mental reflexes and multi-choice exploration.',
      as: 'সক্ৰিয় প্ৰতিক্ৰিয়া আৰু গভীৰ স্মৃতি জাগৰণ।',
      bn: 'সক্রিয় প্রতিক্রিয়া ও গভীর স্মৃতিচর্চা।',
      hi: 'सक्रिय स्मृति और तीव्र एकाग्रता।',
      mni: 'Pukning changna touba.',
    },
  },
  4: {
    level: 4,
    badge: '🦅',
    name: {
      en: 'Level 4: Forest Canopy',
      as: 'স্তৰ ৪: অৰণ্যৰ ছাঁ',
      bn: 'স্তর ৪: বনের বিস্তার',
      hi: 'स्तर ४: वन शिखर',
      mni: 'Level 4: Umanggi Macha',
    },
    description: {
      en: 'Quick perception, diverse patterns, and rich reflections.',
      as: 'ক্ষিপ্ৰ দৃষ্টি, বিবিধ চানেকি আৰু গভীৰ তৰ্ক।',
      bn: 'দ্রুত দৃষ্টি ও বহুমুখী নকশার সমন্বয়।',
      hi: 'त्वरित दृष्टि और विविधतापूर्ण पैटर्न।',
      mni: 'Thuna khangba amasung semba.',
    },
  },
  5: {
    level: 5,
    badge: '🏔️',
    name: {
      en: 'Level 5: Mountain Peak',
      as: 'স্তৰ ৫: শৃংগ জয়',
      bn: 'স্তর ৫: পাহাড়ের শীর্ষ',
      hi: 'स्तर ५: पर्वत शिखर',
      mni: 'Level 5: Chingdol Mathak',
    },
    description: {
      en: 'Peak cognitive sharpness and complex traditional mastery.',
      as: 'শীৰ্ষ স্মৃতিশক্তি, চহকী ঐতিহ্য আৰু চৰম মনোযোগ।',
      bn: 'শীর্ষ স্মৃতিশক্তি ও ঐতিহ্যবাহী গভীর দক্ষতা।',
      hi: 'सर्वोच्च एकाग्रता और सांस्कृतिक प्रवीणता।',
      mni: 'Khwainingba pukning maru oiba.',
    },
  },
};

export function createInitialDDAState(initialLevel: number = 1): DDAState {
  return {
    level: Math.max(1, Math.min(initialLevel, 5)),
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    baselineReactionTime: 2500,
    speedMultiplier: 1.0,
  };
}

export function updateDDA(
  currentState: DDAState,
  performance: DDAPerformance
): DDAUpdateResult {
  const next: DDAState = { ...currentState };
  let leveledUp = false;
  let leveledDown = false;
  let feedbackMessage: Record<Language, string> | undefined;

  // Update baseline reaction time with moving average
  next.baselineReactionTime = Math.round(
    0.75 * next.baselineReactionTime + 0.25 * performance.reactionTimeMs
  );

  const acc = performance.accuracy !== undefined ? performance.accuracy : performance.success ? 0.85 : 0.4;
  const isSolidSuccess = performance.success && acc >= 0.75;
  const isStruggle = !performance.success || acc < 0.45;

  if (isSolidSuccess) {
    next.consecutiveSuccesses += 1;
    next.consecutiveFailures = 0;

    // Promotion rule: 2 consecutive solid successes (or 1 perfect 100% score) -> increase level
    const qualifyForLevelUp = (next.consecutiveSuccesses >= 2 || acc >= 0.95) && next.level < 5;

    if (qualifyForLevelUp) {
      next.level = Math.min(5, next.level + 1) as 1 | 2 | 3 | 4 | 5;
      next.consecutiveSuccesses = 0;
      next.speedMultiplier = Math.min(1.5, next.speedMultiplier + 0.12);
      leveledUp = true;
      feedbackMessage = {
        en: `🎉 Level Up! You unlocked Level ${next.level}: ${GAME_LEVELS[next.level].name.en}`,
        as: `🎉 অভিনন্দিত! আপুনি ${GAME_LEVELS[next.level].name.as} পালেহি!`,
        bn: `🎉 অভিনন্দন! আপনি ${GAME_LEVELS[next.level].name.bn} স্তরে উন্নীত হলেন!`,
        hi: `🎉 शानदार! आपने ${GAME_LEVELS[next.level].name.hi} पार किया!`,
        mni: `🎉 Yamna Fai! Nang Level ${next.level} da yourakle!`,
      };
    }
  } else if (isStruggle) {
    next.consecutiveFailures += 1;
    next.consecutiveSuccesses = 0;

    // Gentle adjustment rule: 2 consecutive struggles -> gently ease 1 level down
    if (next.consecutiveFailures >= 2 && next.level > 1) {
      next.level = Math.max(1, next.level - 1) as 1 | 2 | 3 | 4 | 5;
      next.consecutiveFailures = 0;
      next.speedMultiplier = Math.max(0.75, next.speedMultiplier - 0.1);
      leveledDown = true;
      feedbackMessage = {
        en: `🌱 Adjusted to Level ${next.level} for a calmer, joyful pace.`,
        as: `🌱 শান্তভাৱে খেলিবলৈ স্তৰ ${next.level}লৈ সলনি কৰা হ’ল।`,
        bn: `🌱 সহজ ও আনন্দদায়ক খেলার জন্য স্তর ${next.level}-এ সমন্বয় করা হলো।`,
        hi: `🌱 आसान व सुखद अभ्यास के लिए स्तर ${next.level} पर समायोजित किया गया।`,
        mni: `🌱 Nungtina pot toubada level ${next.level} da semdokle.`,
      };
    }
  } else {
    // Balanced play: maintain level
    next.consecutiveSuccesses = Math.max(0, next.consecutiveSuccesses);
    next.consecutiveFailures = 0;
  }

  return {
    ...next,
    leveledUp,
    leveledDown,
    feedbackMessage,
  };
}

export function calculateCVI(sessions: CognitiveSession[]): CVIScorecard {
  const domains: CognitiveDomain[] = [
    'visual_spatial',
    'attention_motor',
    'executive_function',
    'pattern_logic',
    'temporal_orientation',
    'auditory_memory',
    'autobiographical'
  ];

  const domainScores: Record<CognitiveDomain, number> = {
    visual_spatial: 78,
    attention_motor: 72,
    executive_function: 69,
    pattern_logic: 75,
    temporal_orientation: 65,
    auditory_memory: 80,
    autobiographical: 84,
  };

  domains.forEach(domain => {
    const domainSessions = sessions.filter(s => s.domain === domain);
    if (domainSessions.length > 0) {
      const avgScore = domainSessions.reduce((acc, curr) => {
        const max = curr.maxScore > 0 ? curr.maxScore : 100;
        return acc + (curr.score / max) * 100;
      }, 0) / domainSessions.length;
      domainScores[domain] = Math.round(avgScore);
    }
  });

  const overall = Math.round(
    Object.values(domainScores).reduce((a, b) => a + b, 0) / domains.length
  );

  let riskTier: 'Low' | 'Moderate' | 'High' = 'Low';
  if (overall < 50) riskTier = 'High';
  else if (overall < 75) riskTier = 'Moderate';

  return {
    overallScore: overall,
    trend: overall >= 75 ? 'improving' : overall >= 55 ? 'stable' : 'declining',
    riskTier,
    domainScores,
    lastUpdated: new Date().toISOString(),
  };
}

export interface CognitiveAnomaly {
  id: string;
  type: string;
  domain: CognitiveDomain;
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
}

export function detectAnomalies(sessions: CognitiveSession[]): CognitiveAnomaly[] {
  const anomalies: CognitiveAnomaly[] = [];

  if (sessions.length < 3) return anomalies;

  // Check temporal orientation drops
  const temporal = sessions.filter(s => s.domain === 'temporal_orientation');
  if (temporal.length >= 2) {
    const latest = temporal[temporal.length - 1];
    const prev = temporal[temporal.length - 2];
    const latestRatio = latest.score / (latest.maxScore > 0 ? latest.maxScore : 100);
    const prevRatio = prev.score / (prev.maxScore > 0 ? prev.maxScore : 100);
    if (latestRatio < 0.5 && prevRatio > 0.7) {
      anomalies.push({
        id: 'anomaly-temporal-drop',
        type: 'Temporal Confusion',
        domain: 'temporal_orientation',
        message: 'Sharp drop in daily routine sequence accuracy detected in the evening.',
        severity: 'high',
        date: latest.date,
      });
    }
  }

  // Check reaction time slowdown
  const attention = sessions.filter(s => s.domain === 'attention_motor');
  if (attention.length >= 2) {
    const latest = attention[attention.length - 1];
    if (latest.reactionTimeMs > 4500) {
      anomalies.push({
        id: 'anomaly-attention-latency',
        type: 'Motor Latency Spike',
        domain: 'attention_motor',
        message: 'Reaction time latency exceeded 4.5 seconds during Tea Garden Focus.',
        severity: 'medium',
        date: latest.date,
      });
    }
  }

  return anomalies;
}

export const aiEngine = {
  GAME_LEVELS,
  createInitialDDAState,
  updateDDA,
  calculateCVI,
  detectAnomalies,
};

export default aiEngine;

/**
 * Sarthi Decision Engine & Personal Baseline Analyzer
 * 
 * CORE RESPONSIBILITIES:
 * 1. Computes patient's own historical personal baseline (never compares to others).
 * 2. Classifies current trend: 'improving' | 'stable' | 'struggling' | 'repeated_deviation'.
 * 3. Adaptively generates personalized recommendations with transparent, explainable reasons.
 * 4. Passes all output through the Sarthi Safety & Non-Diagnostic layer.
 * 5. Supports SIH Demo Mode scenarios (Scenario A: Improving, B: Struggling, C: Deviation).
 */

import {
  CognitiveSession,
  CognitiveDomain,
  GameId,
  Language,
  SarthiContext,
  SarthiPersonalBaseline,
  SarthiRecommendation,
  SarthiTrend,
} from '../types';
import { sarthiSafety } from './sarthiSafety';
import { getLocalizedPhrases } from './sarthiLanguageAdapter';
import { sarthiMemory } from './sarthiMemory';

// Map game IDs to cognitive domains and user-friendly cultural metadata
export const GAME_DOMAIN_MAP: Record<GameId, CognitiveDomain> = {
  memory_match: 'visual_spatial',
  tea_garden: 'attention_motor',
  brain_quest: 'executive_function',
  pattern_weave: 'pattern_logic',
  routine_builder: 'temporal_orientation',
  sounds_hills: 'auditory_memory',
  family_recall: 'autobiographical',
};

/**
 * Calculates the personal baseline purely from the patient's own history.
 */
export function calculatePersonalBaseline(
  patientId: string,
  sessions: CognitiveSession[],
  demoScenarioOverride?: string
): SarthiPersonalBaseline {
  const demoScenario = demoScenarioOverride || sarthiMemory.getActiveDemoScenario();

  // If Demo Scenario A is active: simulate strong improving performance
  if (demoScenario === 'improving') {
    return {
      patientId,
      averageScore: 78,
      averageAccuracy: 0.82,
      averageReactionTimeMs: 2400,
      totalSessions: 14,
      trend: 'improving',
      consecutiveDropCount: 0,
      preferredGame: 'memory_match',
      recentSessionsCount: 5,
      lastActiveDate: new Date().toISOString().split('T')[0],
      domainAverages: {
        visual_spatial: 88,
        attention_motor: 84,
        pattern_logic: 80,
      },
    };
  }

  // If Demo Scenario B is active: simulate struggling trend needing gentle ease
  if (demoScenario === 'struggling') {
    return {
      patientId,
      averageScore: 75,
      averageAccuracy: 0.78,
      averageReactionTimeMs: 2700,
      totalSessions: 12,
      trend: 'struggling',
      consecutiveDropCount: 2,
      preferredGame: 'sounds_hills',
      recentSessionsCount: 4,
      lastActiveDate: new Date().toISOString().split('T')[0],
      domainAverages: {
        visual_spatial: 54,
        attention_motor: 52,
        auditory_memory: 68,
      },
    };
  }

  // If Demo Scenario C is active: simulate repeated unusual deviation
  if (demoScenario === 'repeated_deviation') {
    return {
      patientId,
      averageScore: 76,
      averageAccuracy: 0.80,
      averageReactionTimeMs: 2600,
      totalSessions: 16,
      trend: 'repeated_deviation',
      consecutiveDropCount: 3,
      preferredGame: 'family_recall',
      recentSessionsCount: 5,
      lastActiveDate: new Date().toISOString().split('T')[0],
      domainAverages: {
        temporal_orientation: 44,
        executive_function: 48,
        attention_motor: 42,
      },
    };
  }

  // Normal live computation from session history
  if (!sessions || sessions.length === 0) {
    return {
      patientId,
      averageScore: 70,
      averageAccuracy: 0.75,
      averageReactionTimeMs: 3000,
      totalSessions: 0,
      trend: 'stable',
      consecutiveDropCount: 0,
      preferredGame: 'memory_match',
      recentSessionsCount: 0,
      domainAverages: {},
    };
  }

  const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
  const totalAcc = sessions.reduce((acc, s) => acc + s.accuracy, 0);
  const totalTime = sessions.reduce((acc, s) => acc + s.reactionTimeMs, 0);
  const count = sessions.length;

  const baselineScore = Math.round(totalScore / count);
  const baselineAcc = Math.round((totalAcc / count) * 100) / 100;
  const baselineTime = Math.round(totalTime / count);

  // Group by domain
  const domainAverages: Partial<Record<CognitiveDomain, number>> = {};
  sessions.forEach((s) => {
    const prev = domainAverages[s.domain] || s.score;
    domainAverages[s.domain] = Math.round((prev + s.score) / 2);
  });

  // Check recent trend (last 3 sessions vs baseline)
  const recent = sessions.slice(-3);
  const recentAvgScore = recent.reduce((acc, s) => acc + s.score, 0) / Math.max(1, recent.length);

  let consecutiveDrops = 0;
  for (let i = sessions.length - 1; i >= Math.max(0, sessions.length - 4); i--) {
    if (sessions[i].score < baselineScore * 0.8) {
      consecutiveDrops += 1;
    } else {
      break;
    }
  }

  let trend: SarthiTrend = 'stable';
  if (consecutiveDrops >= 3) {
    trend = 'repeated_deviation';
  } else if (recentAvgScore >= baselineScore + 8) {
    trend = 'improving';
  } else if (recentAvgScore <= baselineScore - 12) {
    trend = 'struggling';
  }

  // Detect preferred game
  const counts: Record<string, number> = {};
  sessions.forEach((s) => {
    counts[s.gameId] = (counts[s.gameId] || 0) + 1;
  });
  let preferredGame: GameId = 'memory_match';
  let maxCount = 0;
  Object.entries(counts).forEach(([gid, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      preferredGame = gid as GameId;
    }
  });

  return {
    patientId,
    averageScore: baselineScore,
    averageAccuracy: baselineAcc,
    averageReactionTimeMs: baselineTime,
    totalSessions: count,
    trend,
    consecutiveDropCount: consecutiveDrops,
    preferredGame,
    recentSessionsCount: recent.length,
    lastActiveDate: sessions[sessions.length - 1]?.date,
    domainAverages,
  };
}

/**
 * Main Sarthi Recommendation Generator.
 * Considers time of day, hydration, routine adherence, and personal baseline trend.
 */
export function generateSarthiRecommendation(context: SarthiContext): SarthiRecommendation {
  const { patient, language, recentSessions, allSessions, hydrationGlasses, routineAdherence, demoScenario } = context;
  const lang = getLocalizedPhrases(language);
  const baseline = calculatePersonalBaseline(patient.id, allSessions || recentSessions, demoScenario);

  // Time of day evaluation
  const hour = new Date().getHours();
  const isEvening = hour >= 16; // 4 PM onwards, sundowning considerations

  // 1. REPEATED DEVIATION SCENARIO (Scenario C / Safety Guardrail)
  if (baseline.trend === 'repeated_deviation' || demoScenario === 'repeated_deviation') {
    const rawPatientMsg = `${lang.greeting.split('.')[0]}! ${lang.trendExplanations.repeated_deviation}`;
    const rawCaregiverMsg = lang.caregiverInsights.repeatedDeviation;

    const validated = sarthiSafety.validateAndSanitizeText(rawPatientMsg);
    const validatedCaregiver = sarthiSafety.validateAndSanitizeText(rawCaregiverMsg);

    return {
      id: `sarthi-rec-${Date.now()}`,
      type: 'REST_SUGGESTION',
      priority: 'high',
      reason: 'Recommended because 3 consecutive activities showed pattern deviation from personal baseline. Suggesting a gentle pause.',
      patientMessage: validated.sanitizedText,
      caregiverInsight: validatedCaregiver.sanitizedText,
      suggestedAction: {
        label: {
          en: lang.actionLabels.takeRest,
          as: 'শান্তিময় কোঠাত জিৰণি',
          bn: 'বিশ্রাম নিন',
          hi: 'विश्राम कक्ष',
          mni: 'Pottha ba',
        },
        view: 'calming',
      },
    };
  }

  // 2. HYDRATION REMINDER (if low in afternoon/evening)
  if (hydrationGlasses < 4 && isEvening) {
    const rawPatientMsg = lang.quickActionReplies.remindersSummary(1, 3, hydrationGlasses);
    return {
      id: `sarthi-rec-${Date.now()}`,
      type: 'ROUTINE_REMINDER',
      priority: 'normal',
      reason: `Recommended because water intake is at ${hydrationGlasses}/8 glasses, important for cognitive clarity and preventing evening fatigue.`,
      patientMessage: rawPatientMsg,
      caregiverInsight: `Water intake is currently at ${hydrationGlasses}/8 glasses. Sarthi suggested a fresh glass of water.`,
      suggestedAction: {
        label: {
          en: lang.actionLabels.checkMeds,
          as: 'ঔষধ আৰু পানী চাওক',
          bn: 'ওষুধ ও জল দেখুন',
          hi: 'दवा व पानी देखें',
          mni: 'Hidak & Ishing',
        },
        view: 'reminders',
      },
    };
  }

  // 3. IMPROVING PATIENT SCENARIO (Scenario A: Adaptive Level Increase)
  if (baseline.trend === 'improving' || demoScenario === 'improving') {
    const targetGame: GameId = baseline.preferredGame === 'memory_match' ? 'pattern_weave' : 'memory_match';
    const targetTitle = lang.gameTitles[targetGame];
    const score = baseline.averageScore > 0 ? Math.min(95, baseline.averageScore + 10) : 92;

    const reason = lang.reasonTemplates.improving(targetTitle, score);
    const patientMsg = `${lang.trendExplanations.improving} ${lang.quickActionReplies.playGamePrompt}`;
    const caregiverInsight = lang.caregiverInsights.improving(score);

    return {
      id: `sarthi-rec-${Date.now()}`,
      type: 'GAME_RECOMMENDATION',
      priority: 'normal',
      recommendedGame: targetGame,
      difficulty: 3, // slightly increased challenge
      reason: sarthiSafety.validateAndSanitizeText(reason).sanitizedText,
      patientMessage: sarthiSafety.validateAndSanitizeText(patientMsg).sanitizedText,
      caregiverInsight: sarthiSafety.validateAndSanitizeText(caregiverInsight).sanitizedText,
      suggestedAction: {
        label: {
          en: `${lang.actionLabels.playNow}: ${targetTitle}`,
          as: `${lang.actionLabels.playNow}: ${targetTitle}`,
          bn: `${lang.actionLabels.playNow}: ${targetTitle}`,
          hi: `${lang.actionLabels.playNow}: ${targetTitle}`,
          mni: `${lang.actionLabels.playNow}: ${targetTitle}`,
        },
        view: 'game_detail',
        gameId: targetGame,
      },
    };
  }

  // 4. STRUGGLING PATIENT SCENARIO (Scenario B: Ease Difficulty & Shorter Friendly Activity)
  if (baseline.trend === 'struggling' || demoScenario === 'struggling') {
    const targetGame: GameId = 'sounds_hills'; // Calming, auditory recognition, very gentle
    const targetTitle = lang.gameTitles[targetGame];

    const reason = lang.reasonTemplates.struggling(targetTitle);
    const patientMsg = `${lang.trendExplanations.struggling} ${lang.quickActionReplies.playGamePrompt}`;
    const caregiverInsight = lang.caregiverInsights.struggling;

    return {
      id: `sarthi-rec-${Date.now()}`,
      type: 'GAME_RECOMMENDATION',
      priority: 'normal',
      recommendedGame: targetGame,
      difficulty: 1, // reduced difficulty
      reason: sarthiSafety.validateAndSanitizeText(reason).sanitizedText,
      patientMessage: sarthiSafety.validateAndSanitizeText(patientMsg).sanitizedText,
      caregiverInsight: sarthiSafety.validateAndSanitizeText(caregiverInsight).sanitizedText,
      suggestedAction: {
        label: {
          en: `${lang.actionLabels.playNow}: ${targetTitle}`,
          as: `${lang.actionLabels.playNow}: ${targetTitle}`,
          bn: `${lang.actionLabels.playNow}: ${targetTitle}`,
          hi: `${lang.actionLabels.playNow}: ${targetTitle}`,
          mni: `${lang.actionLabels.playNow}: ${targetTitle}`,
        },
        view: 'game_detail',
        gameId: targetGame,
      },
    };
  }

  // 5. STABLE BASELINE (Scenario: Normal balanced routine)
  const targetGame: GameId = baseline.preferredGame || 'tea_garden';
  const targetTitle = lang.gameTitles[targetGame];
  const reason = lang.reasonTemplates.stable(targetTitle);
  const patientMsg = `${lang.trendExplanations.stable} ${lang.quickActionReplies.playGamePrompt}`;
  const caregiverInsight = lang.caregiverInsights.stable;

  return {
    id: `sarthi-rec-${Date.now()}`,
    type: 'GAME_RECOMMENDATION',
    priority: 'normal',
    recommendedGame: targetGame,
    difficulty: 2,
    reason: sarthiSafety.validateAndSanitizeText(reason).sanitizedText,
    patientMessage: sarthiSafety.validateAndSanitizeText(patientMsg).sanitizedText,
    caregiverInsight: sarthiSafety.validateAndSanitizeText(caregiverInsight).sanitizedText,
    suggestedAction: {
      label: {
        en: `${lang.actionLabels.playNow}: ${targetTitle}`,
        as: `${lang.actionLabels.playNow}: ${targetTitle}`,
        bn: `${lang.actionLabels.playNow}: ${targetTitle}`,
        hi: `${lang.actionLabels.playNow}: ${targetTitle}`,
        mni: `${lang.actionLabels.playNow}: ${targetTitle}`,
      },
      view: 'game_detail',
      gameId: targetGame,
    },
  };
}

/**
 * Generates an answer to Sarthi Quick Actions:
 * - "How am I doing?"
 * - "Play a game"
 * - "What should I do now?"
 * - "My reminders"
 * - "I want to talk"
 * - "Call my caregiver"
 */
export function handleQuickAction(actionKey: string, context: SarthiContext): SarthiRecommendation {
  const { patient, language, allSessions, hydrationGlasses, demoScenario } = context;
  const lang = getLocalizedPhrases(language);
  const baseline = calculatePersonalBaseline(patient.id, allSessions, demoScenario);

  switch (actionKey) {
    case 'how_am_i_doing': {
      let trendText = lang.trendExplanations.stable;
      if (baseline.trend === 'improving') trendText = lang.trendExplanations.improving;
      if (baseline.trend === 'struggling') trendText = lang.trendExplanations.struggling;
      if (baseline.trend === 'repeated_deviation') trendText = lang.trendExplanations.repeated_deviation;

      return {
        id: `qa-${Date.now()}`,
        type: 'ENCOURAGEMENT',
        priority: 'normal',
        reason: `Based on your personal baseline across ${baseline.totalSessions} sessions with ${baseline.averageScore}% average accuracy.`,
        patientMessage: `${lang.quickActionReplies.howAmIDoing} ${trendText}`,
        caregiverInsight: `Patient asked "How am I doing?". Sarthi provided reassuring feedback based on baseline trend (${baseline.trend}).`,
      };
    }

    case 'play_game': {
      return generateSarthiRecommendation(context);
    }

    case 'what_next': {
      return {
        id: `qa-${Date.now()}`,
        type: 'GENERAL_CONVERSATION',
        priority: 'normal',
        reason: 'Recommended based on current time of day and daily cognitive pacing rhythm.',
        patientMessage: lang.quickActionReplies.whatNext,
        caregiverInsight: 'Patient requested guidance on next activity. Sarthi suggested relaxation, hydration, and light activity.',
        suggestedAction: {
          label: {
            en: lang.actionLabels.takeRest,
            as: 'শান্তিময় কোঠা',
            bn: 'বিশ্রাম কক্ষ',
            hi: 'विश्राम कक्ष',
            mni: 'Sanctuary',
          },
          view: 'calming',
        },
      };
    }

    case 'reminders': {
      return {
        id: `qa-${Date.now()}`,
        type: 'ROUTINE_REMINDER',
        priority: 'normal',
        reason: `Current hydration is at ${hydrationGlasses} glasses and morning medicines were logged.`,
        patientMessage: lang.quickActionReplies.remindersSummary(1, 3, hydrationGlasses),
        caregiverInsight: `Patient reviewed reminders: ${hydrationGlasses}/8 glasses water logged today.`,
        suggestedAction: {
          label: {
            en: lang.actionLabels.checkMeds,
            as: 'ঔষধ আৰু পানী',
            bn: 'ওষুধ ও জল',
            hi: 'दवा व पानी',
            mni: 'Hidak & Ishing',
          },
          view: 'reminders',
        },
      };
    }

    case 'talk': {
      return {
        id: `qa-${Date.now()}`,
        type: 'GENERAL_CONVERSATION',
        priority: 'normal',
        reason: 'Providing companionship and emotional warmth based on autobiographical recall.',
        patientMessage: lang.quickActionReplies.comfortChat,
        caregiverInsight: 'Patient initiated conversational companionship with Sarthi.',
        suggestedAction: {
          label: {
            en: lang.actionLabels.viewAlbum,
            as: 'পৰিয়ালৰ এলবাম',
            bn: 'পারিবারিক অ্যালবাম',
            hi: 'पारिवारिक एल्बम',
            mni: 'Family Album',
          },
          view: 'family',
        },
      };
    }

    case 'call_caregiver': {
      const emergency = patient.emergencyContact || {
        name: 'Family Caregiver',
        phone: '+91 98640 12345',
      };
      return {
        id: `qa-${Date.now()}`,
        type: 'CAREGIVER_CHECKIN',
        priority: 'high',
        reason: 'Patient requested direct contact with family caregiver.',
        patientMessage: lang.quickActionReplies.callCaregiver(emergency.name, emergency.phone),
        caregiverInsight: `Patient requested connection with caregiver (${emergency.name}).`,
        suggestedAction: {
          label: {
            en: lang.actionLabels.callFamily,
            as: 'ফোন কৰক',
            bn: 'ফোন করুন',
            hi: 'कॉल करें',
            mni: 'Call Tou',
          },
          view: 'emergency',
        },
      };
    }

    case 'health_question': {
      return {
        id: `qa-${Date.now()}`,
        type: 'HEALTH_INFO',
        priority: 'normal',
        reason: 'Sarthi is ready to share simple, safe, and helpful knowledge on brain health, dementia, memory, hydration, and daily wellness.',
        patientMessage: 'I am happy to help with general questions about brain health, memory, hydration, or dementia. What would you like to know today?',
        caregiverInsight: 'User initiated an inquiry about health and dementia information.',
      };
    }

    case 'take_me_home': {
      return {
        id: `qa-${Date.now()}`,
        type: 'GENERAL_CONVERSATION',
        priority: 'normal',
        reason: 'User requested to return to the home screen.',
        patientMessage: 'Taking you to your home screen now. Feel free to explore games or reminders whenever you are ready.',
        caregiverInsight: 'User requested navigation back to the home screen.',
        suggestedAction: {
          label: {
            en: 'Home Screen',
            as: 'মূল পৃষ্ঠা',
            bn: 'হোম স্ক্রিন',
            hi: 'होम स्क्रीन',
            mni: 'Home Screen',
          },
          view: 'home',
        },
      };
    }

    default:
      return generateSarthiRecommendation(context);
  }
}

export function buildSarthiStructuredContext(
  context: SarthiContext,
  userMessage?: string,
  options?: { shouldSearchWeb?: boolean; intent?: string }
) {
  const baseline = calculatePersonalBaseline(
    context.patient.id,
    context.allSessions || context.recentSessions,
    context.demoScenario
  );

  return {
    patientProfile: {
      name: context.patient.name,
      age: context.patient.age,
      location: context.patient.location,
      hometown: context.patient.hometown,
      diagnosisStage: context.patient.diagnosisStage,
      bio: context.patient.bio,
    },
    preferredLanguage: context.language,
    currentPage: context.currentPage || { view: 'home' },
    availableNavigationActions: [
      'OPEN_HOME',
      'OPEN_GAMES',
      'OPEN_MEMORY_MATCH',
      'OPEN_TEA_GARDEN',
      'OPEN_BRAIN_QUEST',
      'OPEN_PATTERN_WEAVE',
      'OPEN_ROUTINE_BUILDER',
      'OPEN_SOUNDS_HILLS',
      'OPEN_FAMILY_RECALL',
      'OPEN_REMINDERS',
      'OPEN_FAMILY',
      'OPEN_PROGRESS',
      'OPEN_CALMING',
      'OPEN_EMERGENCY',
      'OPEN_CAREGIVER_DASHBOARD',
    ],
    recentActivities: context.recentSessions.map(s => ({
      gameId: s.gameId,
      domain: s.domain,
      score: s.score,
      accuracy: s.accuracy,
      reactionTimeMs: s.reactionTimeMs,
      date: s.date,
    })),
    historicalActivities: (context.allSessions || []).slice(-10).map(s => ({
      gameId: s.gameId,
      score: s.score,
      date: s.date,
    })),
    gamePerformance: {
      averageAccuracy: baseline.averageAccuracy,
      averageScore: baseline.averageScore,
      averageReactionTimeMs: baseline.averageReactionTimeMs,
    },
    currentDifficulty: baseline.trend === 'improving' ? 3 : baseline.trend === 'struggling' ? 1 : 2,
    routineAdherence: context.routineAdherence || 85,
    reminderAdherence: Math.min(100, Math.round(((context.hydrationGlasses || 4) / 8) * 100)),
    preferredGames: [baseline.preferredGame || 'memory_match', 'tea_garden'],
    trend: baseline.trend,
    userMessage: userMessage || 'How am I doing today?',
    shouldSearchWeb: options?.shouldSearchWeb ?? false,
    intent: options?.intent,
  };
}

export const sarthiEngine = {
  calculatePersonalBaseline,
  generateSarthiRecommendation,
  handleQuickAction,
  buildSarthiStructuredContext,
  GAME_DOMAIN_MAP,
};

export default sarthiEngine;

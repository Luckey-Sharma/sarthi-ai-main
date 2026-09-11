/**
 * Sarthi Intent Classifier & Search Decision Engine
 *
 * Implements deterministic multi-lingual intent classification into 11 core intents:
 * - APP_NAVIGATION
 * - PATIENT_PROGRESS
 * - GAME_RECOMMENDATION
 * - REMINDER
 * - MEDICATION_REMINDER
 * - ROUTINE
 * - GENERAL_HEALTH_INFORMATION
 * - CURRENT_HEALTH_INFORMATION
 * - EMERGENCY
 * - SMALL_TALK
 * - UNKNOWN
 *
 * Enforces strict search decision logic:
 * NEVER searches the web for internal app requests ("Open my games", "Show my medicines", "How did I perform yesterday?").
 * Searches ONLY for current/general health information requiring external knowledge or latest guidelines.
 */

import { Language, SarthiIntent, NavigationIntent, GameId, AppView } from '../types';

export interface IntentClassificationResult {
  intent: SarthiIntent;
  confidence: number;
  shouldSearchWeb: boolean;
  searchQuery?: string;
  navigationIntent?: NavigationIntent;
  navigationTarget?: { view?: AppView; gameId?: GameId; language?: Language; openSOS?: boolean };
  requiresCaregiver?: boolean;
  isEmergency?: boolean;
  reason: string;
}

// Emergency keywords across supported languages (English, Hindi, Assamese, Bengali, Manipuri)
const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'unconscious', 'collapsed', 'severe bleeding',
  'cannot breathe', 'not breathing', 'stroke', 'paralyzed', 'choking', 'severe burn',
  'chhati me dard', 'behosh', 'saans nahi aa rahi', 'rokto', 'sos', 'ambulance',
  'asengba emergency', 'nasha leitaba', 'bukey batha', 'buker byatha', 'chhatir bikh',
  'ekdom saas bondho', 'sudden collapse',
];

// Sudden onset + confusion triggers for POTENTIALLY_URGENT / EMERGENCY
const SUDDEN_CONFUSION_TRIGGERS = [
  'suddenly confused', 'suddenly very confused', 'acute confusion', 'sudden disorientation',
  'high fever and confused', 'sudden memory loss', 'sudden weakness', 'sudden hallucination',
  'achanak bhool', 'achanak behosh', 'hothat bibhranto', 'achanak confusion',
];

// Current information & explicit search keywords
const CURRENT_INFO_KEYWORDS = [
  'latest', 'current', 'recent', 'guidelines', 'recommendations', 'new research',
  'update', 'updates', 'clinical trial', 'new treatment', '2026', '2025', 'who guidelines',
  'mohfw guidelines', 'nimhans guidelines', 'search for', 'find out', 'look up',
  'latest dementia care', 'latest recommendations', 'current recommendations',
  'naya shodh', 'adhunik', 'khojo', 'samprotik', 'anouba', 'taja', 'shehotiya',
];

export function classifyIntent(query: string, language: Language = 'en'): IntentClassificationResult {
  const normalized = (query || '').trim().toLowerCase();

  if (!normalized) {
    return {
      intent: 'UNKNOWN',
      confidence: 0,
      shouldSearchWeb: false,
      reason: 'Empty query',
    };
  }

  // 1. EMERGENCY INTENT (Absolute top priority)
  for (const kw of EMERGENCY_KEYWORDS) {
    if (normalized.includes(kw)) {
      return {
        intent: 'EMERGENCY',
        confidence: 0.99,
        shouldSearchWeb: false,
        isEmergency: true,
        navigationIntent: 'OPEN_SAFE_CARD',
        navigationTarget: { view: 'emergency', openSOS: true },
        reason: `Matched urgent life-safety keyword: "${kw}"`,
      };
    }
  }

  for (const kw of SUDDEN_CONFUSION_TRIGGERS) {
    if (normalized.includes(kw)) {
      return {
        intent: 'EMERGENCY',
        confidence: 0.95,
        shouldSearchWeb: false,
        isEmergency: true,
        navigationIntent: 'OPEN_SAFE_CARD',
        navigationTarget: { view: 'emergency', openSOS: true },
        reason: `Matched acute delirium/confusion pattern: "${kw}"`,
      };
    }
  }

  // 2. APP_NAVIGATION INTENT
  // Examples: "Open my games", "Start Memory Match", "Take me home", "Show family memories"
  const navMatch = checkNavigationIntent(normalized, language);
  if (navMatch) {
    return {
      intent: 'APP_NAVIGATION',
      confidence: 0.95,
      shouldSearchWeb: false,
      navigationIntent: navMatch.intent,
      navigationTarget: navMatch.target,
      reason: `Direct app navigation request to ${navMatch.intent}`,
    };
  }

  // 3. MEDICATION_REMINDER INTENT
  // Examples: "Show my medicines", "What medicine should I take?", "Did I take morning pill?", "Dawa"
  const medKeywords = [
    'medicine', 'medicines', 'medication', 'medications', 'pill', 'pills', 'tablet', 'tablets',
    'dawa', 'dawakhana', 'dawai', 'ausadh', 'oukhodh', 'hidak', 'morning pill', 'night pill',
    'show my medicine', 'show my medicines', 'show medicines', 'show my pills', 'take medicine',
  ];
  if (medKeywords.some(k => normalized.includes(k))) {
    return {
      intent: 'MEDICATION_REMINDER',
      confidence: 0.92,
      shouldSearchWeb: false,
      navigationIntent: 'OPEN_REMINDERS',
      navigationTarget: { view: 'reminders' },
      reason: 'Medication or pill schedule inquiry',
    };
  }

  // 4. REMINDER INTENT (Water / Hydration / Generic Reminders)
  // Examples: "Show my reminders", "Did I drink water?", "Hydration reminders", "Pani"
  const reminderKeywords = [
    'reminder', 'reminders', 'hydration reminder', 'water glasses', 'drink water',
    'pani pina', 'pani khabo', 'ishing thakpa', 'water reminder', 'my reminders',
    'alert me', 'smriti',
  ];
  if (reminderKeywords.some(k => normalized.includes(k))) {
    return {
      intent: 'REMINDER',
      confidence: 0.90,
      shouldSearchWeb: false,
      navigationIntent: 'OPEN_REMINDERS',
      navigationTarget: { view: 'reminders' },
      reason: 'Reminder or hydration schedule inquiry',
    };
  }

  // 5. PATIENT_PROGRESS INTENT
  // Examples: "How did I perform yesterday?", "How am I doing?", "My score", "Progress", "Kaisa kar raha hu"
  const progressKeywords = [
    'how did i perform', 'how am i doing', 'how did i do', 'my score', 'my performance',
    'my progress', 'yesterday performance', 'last game score', 'kaisa kar raha hu',
    'kemon korchi', 'kene hoise', 'progress report', 'accuracy', 'baseline',
    'how is my score', 'check my progress', 'how am i performing',
  ];
  if (progressKeywords.some(k => normalized.includes(k))) {
    return {
      intent: 'PATIENT_PROGRESS',
      confidence: 0.93,
      shouldSearchWeb: false,
      navigationIntent: 'SHOW_PROGRESS',
      navigationTarget: { view: 'home' },
      reason: "Patient's own personal baseline progress query",
    };
  }

  // 6. ROUTINE INTENT
  // Examples: "What should I do today?", "What should I do now?", "My daily routine", "Aaj kya kare"
  const routineKeywords = [
    'what should i do today', 'what should i do now', 'what next', 'what to do today',
    'my daily routine', 'daily schedule', 'dincharya', 'aaj kya karna hai', 'aaj ki korbo',
    'etiya ki korim', 'houjik kari tougani', 'plan for today', 'routine builder',
  ];
  if (routineKeywords.some(k => normalized.includes(k))) {
    return {
      intent: 'ROUTINE',
      confidence: 0.91,
      shouldSearchWeb: false,
      navigationIntent: 'OPEN_ROUTINE_BUILDER',
      navigationTarget: { view: 'game_detail', gameId: 'routine_builder' },
      reason: 'Daily routine and activity sequence query',
    };
  }

  // 7. GAME_RECOMMENDATION INTENT
  // Examples: "Suggest a game", "What game should I play?", "Play a game", "Khel"
  const gameRecKeywords = [
    'suggest a game', 'what game should i play', 'recommend a game', 'play a game',
    'which game', 'give me a game', 'koi khel batao', 'khel khelna hai', 'khela khili',
    'khel anouba', 'play an activity',
  ];
  if (gameRecKeywords.some(k => normalized.includes(k))) {
    return {
      intent: 'GAME_RECOMMENDATION',
      confidence: 0.90,
      shouldSearchWeb: false,
      navigationIntent: 'OPEN_GAMES',
      navigationTarget: { view: 'games' },
      reason: 'Personalized game activity recommendation request',
    };
  }

  // 8. CURRENT_HEALTH_INFORMATION INTENT
  // Examples: "What are the latest dementia care recommendations?", "Current research on Alzheimer's", "Latest MoHFW guidelines"
  const isHealthQuestion = checkIsHealthQuestion(normalized);
  const hasCurrentKeywords = CURRENT_INFO_KEYWORDS.some(k => normalized.includes(k));

  if (hasCurrentKeywords && isHealthQuestion) {
    return {
      intent: 'CURRENT_HEALTH_INFORMATION',
      confidence: 0.94,
      shouldSearchWeb: true,
      searchQuery: query,
      reason: 'Involves current/recent health information or clinical guidelines requiring web search',
    };
  }

  // 9. GENERAL_HEALTH_INFORMATION INTENT
  // Examples: "What are the symptoms of dementia?", "Ways to improve sleep in older adults", "Dehydration in seniors"
  if (isHealthQuestion) {
    const requiresExternalSearch = hasCurrentKeywords ||
      normalized.includes('guidelines') ||
      normalized.includes('care recommendations') ||
      normalized.includes('studies') ||
      normalized.includes('literature') ||
      normalized.includes('statistics') ||
      normalized.includes('who says') ||
      normalized.includes('icmr');

    return {
      intent: 'GENERAL_HEALTH_INFORMATION',
      confidence: 0.88,
      shouldSearchWeb: requiresExternalSearch,
      searchQuery: requiresExternalSearch ? query : undefined,
      reason: requiresExternalSearch
        ? 'General health information requiring authoritative external web references'
        : 'General health education covered by curated knowledge base',
    };
  }

  // 10. SMALL_TALK INTENT
  // Examples: "Hello", "Good morning", "How are you?", "Namaste", "I want to talk"
  const smallTalkKeywords = [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'good night',
    'namaste', 'nomoskar', 'khurumjari', 'how are you', 'kaise ho', 'kemon acho',
    'kene asa', 'i want to talk', 'baat karni hai', 'kotha bolte chai', 'wari saninge',
    'thank you', 'shukriya', 'dhanyabad', 'thanks', 'bye',
  ];
  if (smallTalkKeywords.some(k => normalized === k || normalized.startsWith(k + ' ') || normalized.endsWith(' ' + k))) {
    return {
      intent: 'SMALL_TALK',
      confidence: 0.92,
      shouldSearchWeb: false,
      reason: 'Friendly conversational greeting / small talk',
    };
  }

  // 11. UNKNOWN INTENT (Fallback)
  return {
    intent: 'UNKNOWN',
    confidence: 0.50,
    shouldSearchWeb: false,
    reason: 'Unrecognized query type; handled by general conversational companion',
  };
}

function checkIsHealthQuestion(normalized: string): boolean {
  const healthTerms = [
    'dementia', 'alzheimer', 'alzheimers', 'memory loss', 'forgetful', 'forgetfulness',
    'hydration', 'dehydration', 'water intake', 'sleep', 'sleep hygiene', 'insomnia',
    'brain health', 'cognitive', 'cognition', 'symptoms', 'signs', 'caregiver tips',
    'healthy habits', 'exercise for elderly', 'walking', 'social engagement',
    'blood pressure', 'confusion', 'disorientation', 'brain active', 'headache',
    'dimag', 'yaadash', 'swasthya', 'bimari', 'roog', 'smriti bibhrom', 'sushthyo',
    'pukning', 'haksel', 'elderly care', 'senior health',
  ];
  return healthTerms.some(term => normalized.includes(term));
}

function checkNavigationIntent(
  normalized: string,
  _language: Language
): { intent: NavigationIntent; target: { view?: AppView; gameId?: GameId; openSOS?: boolean } } | null {
  // Memory match
  if (
    normalized.includes('memory match') ||
    normalized.includes('start memory match') ||
    normalized.includes('open memory match') ||
    normalized.includes('play memory match') ||
    normalized.includes('memory game')
  ) {
    return {
      intent: 'OPEN_MEMORY_MATCH',
      target: { view: 'game_detail', gameId: 'memory_match' },
    };
  }

  // Tea garden
  if (
    normalized.includes('tea garden') ||
    normalized.includes('tea focus') ||
    normalized.includes('open tea garden') ||
    normalized.includes('start tea garden')
  ) {
    return {
      intent: 'OPEN_TEA_GARDEN',
      target: { view: 'game_detail', gameId: 'tea_garden' },
    };
  }

  // Brain quest
  if (
    normalized.includes('brain quest') ||
    normalized.includes('riddle') ||
    normalized.includes('folklore') ||
    normalized.includes('open brain quest')
  ) {
    return {
      intent: 'OPEN_BRAIN_QUEST',
      target: { view: 'game_detail', gameId: 'brain_quest' },
    };
  }

  // Pattern weave
  if (
    normalized.includes('pattern weave') ||
    normalized.includes('loom') ||
    normalized.includes('tat') ||
    normalized.includes('handloom') ||
    normalized.includes('open pattern weave')
  ) {
    return {
      intent: 'OPEN_PATTERN_WEAVE',
      target: { view: 'game_detail', gameId: 'pattern_weave' },
    };
  }

  // Routine builder
  if (
    normalized.includes('routine builder') ||
    normalized.includes('open routine builder')
  ) {
    return {
      intent: 'OPEN_ROUTINE_BUILDER',
      target: { view: 'game_detail', gameId: 'routine_builder' },
    };
  }

  // Sounds of hills
  if (
    normalized.includes('sounds of the hills') ||
    normalized.includes('sounds of hills') ||
    normalized.includes('sound game') ||
    normalized.includes('open sounds')
  ) {
    return {
      intent: 'OPEN_SOUNDS_OF_HILLS',
      target: { view: 'game_detail', gameId: 'sounds_hills' },
    };
  }

  // Family recall
  if (
    normalized.includes('family recall') ||
    normalized.includes('photo game') ||
    normalized.includes('open family recall')
  ) {
    return {
      intent: 'OPEN_FAMILY_RECALL',
      target: { view: 'game_detail', gameId: 'family_recall' },
    };
  }

  // All games / games hub
  if (
    normalized === 'open my games' ||
    normalized === 'open games' ||
    normalized === 'show games' ||
    normalized.includes('open my games') ||
    normalized.includes('show my games') ||
    normalized.includes('take me to games') ||
    normalized.includes('go to games')
  ) {
    return {
      intent: 'OPEN_GAMES',
      target: { view: 'games' },
    };
  }

  // Home
  if (
    normalized.includes('take me home') ||
    normalized.includes('go home') ||
    normalized.includes('open home') ||
    normalized.includes('ghar le chalo') ||
    normalized.includes('ghorot jao') ||
    normalized.includes('mayumda chatlasi')
  ) {
    return {
      intent: 'OPEN_HOME',
      target: { view: 'home' },
    };
  }

  // Family memories
  if (
    normalized.includes('open family') ||
    normalized.includes('family memories') ||
    normalized.includes('family album') ||
    normalized.includes('show family') ||
    normalized.includes('loved ones')
  ) {
    return {
      intent: 'OPEN_FAMILY',
      target: { view: 'family' },
    };
  }

  // Calming sanctuary
  if (
    normalized.includes('calming') ||
    normalized.includes('sanctuary') ||
    normalized.includes('shanti kaksh') ||
    normalized.includes('relax room')
  ) {
    return {
      intent: 'OPEN_CALMING',
      target: { view: 'calming' },
    };
  }

  // Emergency safe card
  if (
    normalized.includes('safe card') ||
    normalized.includes('emergency card') ||
    normalized.includes('open safe card') ||
    normalized.includes('sos card')
  ) {
    return {
      intent: 'OPEN_SAFE_CARD',
      target: { view: 'emergency', openSOS: true },
    };
  }

  return null;
}

export const sarthiIntentEngine = {
  classifyIntent,
};

export default sarthiIntentEngine;

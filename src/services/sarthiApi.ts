import {
  AppView,
  GameId,
  Language,
  NavigationIntent,
  SafetyCategory,
  SarthiContext,
  SarthiHealthCard,
  SarthiRecommendation,
  SarthiIntent,
  WebSearchSource,
} from '../types';
import {
  buildSarthiStructuredContext,
  generateSarthiRecommendation,
  handleQuickAction,
} from './sarthiEngine';
import { classifySafetyIntent, getOfflineMedicalFallbackMessage } from './sarthiHealthSafety';
import { resolveNavigationIntent } from './navigationRegistry';
import { classifyIntent } from './sarthiIntentEngine';
import { isOnline as checkIsOnline } from './syncService';

export interface SarthiApiResponse {
  message: string;
  shortMessage: string;
  suggestedAction: 'GAME' | 'REST' | 'ROUTINE' | 'REMINDER' | 'CAREGIVER' | 'CONVERSATION' | 'NAVIGATE' | 'HEALTH_INFO' | 'EMERGENCY' | 'NONE';
  suggestedGame?: string;
  tone: 'encouraging' | 'calm' | 'supportive' | 'celebratory';
  caregiverNote?: string;
  safetyFlag: boolean;
  safetyCategory?: SafetyCategory;
  healthCard?: SarthiHealthCard;
  navigationIntent?: NavigationIntent;
  navigationTarget?: { view?: AppView; gameId?: GameId; language?: Language; openSOS?: boolean };
  isGemini: boolean;
  isWorkingOffline: boolean;
  deterministicRec: SarthiRecommendation;
  intent?: SarthiIntent;
  sources?: WebSearchSource[];
  searchPerformed?: boolean;
}

/**
 * Sends structured context to server-side Gemini endpoint.
 * Completely offline-first: Falls back to local deterministic Sarthi engine
 * instantly if offline, disconnected, or if Gemini fails.
 * Intercepts high-risk safety and direct navigation queries deterministically.
 */
export async function askSarthiWithGemini(
  context: SarthiContext,
  userMessage?: string,
  quickActionKey?: string
): Promise<SarthiApiResponse> {
  const query = (userMessage || '').trim();
  const lang = context.language || 'en';

  // 1. HARD SAFETY INTERCEPTION
  if (query) {
    const safety = classifySafetyIntent(query, lang);
    if (safety.isHighRisk && safety.predefinedMessage) {
      const msg = safety.predefinedMessage[lang] || safety.predefinedMessage.en;
      const rec = generateSarthiRecommendation(context);
      return {
        message: msg,
        shortMessage: msg.split('.')[0] + '.',
        suggestedAction: safety.category === 'EMERGENCY' ? 'EMERGENCY' : safety.suggestedAction === 'DOCTOR' ? 'NONE' : 'CAREGIVER',
        tone: 'calm',
        caregiverNote: `Safety Alert (${safety.category}): Sarthi provided immediate non-diagnostic guidance and directed to caregiver/emergency services.`,
        safetyFlag: true,
        safetyCategory: safety.category,
        navigationIntent: safety.category === 'EMERGENCY' ? 'OPEN_SAFE_CARD' : undefined,
        navigationTarget: safety.category === 'EMERGENCY' ? { view: 'emergency', openSOS: true } : undefined,
        isGemini: false,
        isWorkingOffline: false,
        deterministicRec: rec,
      };
    }

    // 2. DIRECT NAVIGATION RESOLUTION
    const navResolution = resolveNavigationIntent(query, lang);
    if (navResolution.isMatch) {
      const navMsg = navResolution.message[lang] || navResolution.message.en;
      const rec = generateSarthiRecommendation(context);
      return {
        message: navMsg,
        shortMessage: navMsg,
        suggestedAction: 'NAVIGATE',
        tone: 'supportive',
        caregiverNote: `User asked Sarthi to navigate to ${navResolution.destinationName.en}.`,
        safetyFlag: false,
        safetyCategory: 'NAVIGATION',
        navigationIntent: navResolution.intent,
        navigationTarget: navResolution.target,
        isGemini: false,
        isWorkingOffline: false,
        deterministicRec: rec,
      };
    } else if (navResolution.intent === 'UNKNOWN_PAGE') {
      const unknownMsg = navResolution.message[lang] || navResolution.message.en;
      const rec = generateSarthiRecommendation(context);
      return {
        message: unknownMsg,
        shortMessage: unknownMsg,
        suggestedAction: 'NAVIGATE',
        tone: 'calm',
        caregiverNote: `User requested an unknown page. Sarthi offered navigation to home screen.`,
        safetyFlag: false,
        safetyCategory: 'NAVIGATION',
        navigationIntent: 'UNKNOWN_PAGE',
        navigationTarget: { view: 'home' },
        isGemini: false,
        isWorkingOffline: false,
        deterministicRec: rec,
      };
    }
  }

  // 3. INTENT CLASSIFICATION (determines if web search is needed)
  const intentResult = query ? classifyIntent(query, lang) : null;
  const detectedIntent = intentResult?.intent;
  const shouldSearchWeb = intentResult?.shouldSearchWeb ?? false;

  // Check if query matched a curated offline health card
  const safetyClassification = query ? classifySafetyIntent(query, lang) : null;
  const offlineHealthCard = safetyClassification?.healthCard;

  // Always compute deterministic fallback response
  const deterministicRec = quickActionKey
    ? handleQuickAction(quickActionKey, context)
    : query
    ? handleQuickAction(guessActionKey(query), context)
    : generateSarthiRecommendation(context);

  // Determine offline fallback message
  const isHealthQuery = detectedIntent === 'GENERAL_HEALTH_INFORMATION' || detectedIntent === 'CURRENT_HEALTH_INFORMATION';
  const offlineFallbackMessage = offlineHealthCard
    ? `${safetyClassification?.predefinedMessage?.[lang] || 'Here is simple information to help:'}\n\n${offlineHealthCard.title}`
    : isHealthQuery && !offlineHealthCard
    ? getOfflineMedicalFallbackMessage(lang)
    : deterministicRec.patientMessage;

  const fallbackResult: SarthiApiResponse = {
    message: offlineFallbackMessage,
    shortMessage: offlineFallbackMessage.split('.')[0] + '.',
    suggestedAction: offlineHealthCard ? 'HEALTH_INFO' : mapRecTypeToAction(deterministicRec.type),
    suggestedGame: deterministicRec.recommendedGameTitle
      ? (typeof deterministicRec.recommendedGameTitle === 'string'
          ? deterministicRec.recommendedGameTitle
          : (deterministicRec.recommendedGameTitle[context.language] || deterministicRec.recommendedGameTitle.en))
      : undefined,
    tone: deterministicRec.priority === 'urgent' ? 'calm' : 'encouraging',
    caregiverNote: deterministicRec.caregiverInsight,
    safetyFlag: false,
    safetyCategory: offlineHealthCard ? 'GENERAL_HEALTH_INFORMATION' : 'NON_HEALTH',
    healthCard: offlineHealthCard,
    isGemini: false,
    isWorkingOffline: true,
    deterministicRec,
    intent: detectedIntent,
  };

  // If device is offline, return local fallback immediately
  if (!checkIsOnline()) {
    return fallbackResult;
  }

  try {
    const structuredPayload = buildSarthiStructuredContext(context, userMessage, {
      shouldSearchWeb,
      intent: detectedIntent,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('/api/sarthi/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(structuredPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return fallbackResult;
    }

    const resJson = await response.json();

    if (resJson.success && resJson.data) {
      const data = resJson.data;

      // Map navigation intent from Gemini if present
      let navTarget: { view?: AppView; gameId?: GameId } | undefined = undefined;
      if (data.navigationIntent && data.navigationIntent !== 'UNKNOWN_PAGE') {
        const resolution = resolveNavigationIntent(data.navigationIntent, lang);
        if (resolution.target) {
          navTarget = { view: resolution.target.view, gameId: resolution.target.gameId };
        }
      }

      return {
        message: data.message || deterministicRec.patientMessage,
        shortMessage: data.shortMessage || data.message || deterministicRec.patientMessage,
        suggestedAction: (data.suggestedAction as any) || (offlineHealthCard ? 'HEALTH_INFO' : mapRecTypeToAction(deterministicRec.type)),
        suggestedGame: data.suggestedGame || deterministicRec.recommendedGameTitle,
        tone: data.tone || 'encouraging',
        caregiverNote: data.caregiverNote || deterministicRec.caregiverInsight,
        safetyFlag: !!data.safetyFlag,
        safetyCategory: data.safetyCategory || (offlineHealthCard ? 'GENERAL_HEALTH_INFORMATION' : undefined),
        healthCard: data.healthCard || offlineHealthCard,
        navigationIntent: data.navigationIntent,
        navigationTarget: navTarget,
        isGemini: true,
        isWorkingOffline: false,
        deterministicRec,
        intent: detectedIntent,
        sources: data.sources || [],
        searchPerformed: !!data.searchPerformed,
      };
    }

    return fallbackResult;
  } catch {
    // Network offline, timeout, or server unreachable -> graceful local fallback
    return fallbackResult;
  }
}

function mapRecTypeToAction(type: SarthiRecommendation['type']): SarthiApiResponse['suggestedAction'] {
  switch (type) {
    case 'GAME_RECOMMENDATION': return 'GAME';
    case 'REST_SUGGESTION': return 'REST';
    case 'ROUTINE_REMINDER': return 'ROUTINE';
    case 'CAREGIVER_CHECKIN': return 'CAREGIVER';
    case 'GENERAL_CONVERSATION': return 'CONVERSATION';
    case 'HEALTH_INFO': return 'HEALTH_INFO';
    default: return 'NONE';
  }
}

function guessActionKey(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('game') || lower.includes('play') || lower.includes('khel')) return 'play_game';
  if (lower.includes('med') || lower.includes('water') || lower.includes('dawa') || lower.includes('pani') || lower.includes('pill')) return 'reminders';
  if (lower.includes('how') || lower.includes('score') || lower.includes('progress') || lower.includes('doing') || lower.includes('kaisa')) return 'how_am_i_doing';
  if (lower.includes('next') || lower.includes('do now') || lower.includes('kare') || lower.includes('routine')) return 'what_next';
  if (lower.includes('home') || lower.includes('ghar') || lower.includes('ghor') || lower.includes('mayum')) return 'take_me_home';
  if (lower.includes('dementia') || lower.includes('alzheimer') || lower.includes('brain') || lower.includes('memory') || lower.includes('health')) return 'health_question';
  if (lower.includes('call') || lower.includes('help') || lower.includes('caregiver')) return 'call_caregiver';
  return 'talk';
}

export const sarthiApi = {
  askSarthiWithGemini,
};

export default sarthiApi;

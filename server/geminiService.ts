import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import type { WebSearchResult } from './services/webSearch';

// Prohibited clinical jargon to intercept and sanitize
const PROHIBITED_TERMS = [
  /dementia (is )?getting worse/gi,
  /dementia progression/gi,
  /cognitive decline/gi,
  /medical deterioration/gi,
  /prescrib(e|ing|ed)/gi,
  /change (your )?dosage/gi,
  /stop taking (your )?medication/gi,
  /severe impairment/gi,
  /clinical stage/gi,
];

function sanitizeGeminiOutput(text: string): string {
  let clean = text;
  clean = clean.replace(/dementia (is )?getting worse/gi, "activity pattern has shifted from your usual baseline");
  clean = clean.replace(/dementia progression/gi, "routine pattern variation");
  clean = clean.replace(/cognitive decline/gi, "slower activity pace");
  clean = clean.replace(/medical deterioration/gi, "noticeable pattern change");
  clean = clean.replace(/prescrib(e|ing|ed)/gi, "suggest");
  clean = clean.replace(/change (your )?dosage/gi, "review your routine with your caregiver");
  clean = clean.replace(/stop taking (your )?medication/gi, "consult your caregiver regarding reminders");
  clean = clean.replace(/severe impairment/gi, "elevated hesitation");
  return clean;
}

export interface StructuredSarthiContext {
  patientProfile: {
    name: string;
    age: number;
    location?: string;
    hometown?: string;
    diagnosisStage?: string;
    bio?: string;
  };
  preferredLanguage: 'en' | 'hi' | 'as' | 'bn' | 'mni';
  recentActivities: Array<{
    gameId: string;
    domain: string;
    score: number;
    accuracy?: number;
    reactionTimeMs?: number;
    date: string;
  }>;
  historicalActivities: Array<{
    gameId: string;
    score: number;
    date: string;
  }>;
  gamePerformance: {
    averageAccuracy: number;
    averageScore: number;
    averageReactionTimeMs: number;
  };
  currentDifficulty: number;
  routineAdherence: number;
  reminderAdherence: number;
  preferredGames: string[];
  trend: 'improving' | 'stable' | 'struggling' | 'repeated_deviation';
  currentPage?: {
    view: string;
    gameId?: string;
  };
  availableNavigationActions?: string[];
  userMessage?: string;
  shouldSearchWeb?: boolean;
  intent?: string;
}

export interface WebSearchSourceItem {
  title: string;
  url: string;
  domain: string;
  publisher: string;
  authoritative: boolean;
  snippet?: string;
}

export interface SarthiGeminiResponse {
  message: string;
  shortMessage: string;
  suggestedAction: 'GAME' | 'REST' | 'ROUTINE' | 'REMINDER' | 'CAREGIVER' | 'CONVERSATION' | 'NAVIGATE' | 'HEALTH_INFO' | 'EMERGENCY' | 'NONE';
  suggestedGame?: string;
  navigationIntent?: string;
  healthCard?: {
    whatItMeans?: string;
    whyItMatters?: string;
    whatYouCanDo?: string | string[];
    whenToAskForHelp?: string;
  };
  safetyCategory?: string;
  tone: 'encouraging' | 'calm' | 'supportive' | 'celebratory';
  caregiverNote?: string;
  safetyFlag: boolean;
  modelUsed?: string;
  searchPerformed?: boolean;
  sources?: WebSearchSourceItem[];
}

// Ensure GEMINI_API_KEY is loaded from .env if not in process.env
function getGeminiApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    if (fs.existsSync('.env')) {
      const lines = fs.readFileSync('.env', 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('GEMINI_API_KEY=')) {
          const val = trimmed.substring('GEMINI_API_KEY='.length).trim();
          if (val && !val.includes('your_gemini_api_key_here')) {
            process.env.GEMINI_API_KEY = val;
            return val;
          }
        }
      }
    }
  } catch {
    // Ignore read errors
  }
  return undefined;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  as: 'Assamese (অসমীয়া)',
  bn: 'Bengali (বাংলা)',
  mni: 'Manipuri / Meiteilon (মৈতৈলোন্)',
};

/**
 * Builds a RAG-style context section from real web search results.
 * This replaces the old opaque Gemini grounding approach with transparent,
 * verifiable search results that Gemini reasons over.
 */
function buildSearchResultsContext(searchResults: WebSearchResult[]): string {
  if (!searchResults || searchResults.length === 0) {
    return '';
  }

  const lines = [
    '',
    'WEB SEARCH RESULTS (use these as your primary information source — cite them when relevant):',
    '─────────────────────────────────────────',
  ];

  searchResults.forEach((result, idx) => {
    const authLabel = result.authoritative ? ' [AUTHORITATIVE]' : '';
    lines.push(`${idx + 1}. [${result.publisher}]${authLabel}`);
    lines.push(`   Title: ${result.title}`);
    lines.push(`   URL: ${result.url}`);
    if (result.snippet) {
      lines.push(`   Content: ${result.snippet}`);
    }
    if (result.publishedDate) {
      lines.push(`   Published: ${result.publishedDate}`);
    }
    lines.push('');
  });

  lines.push('─────────────────────────────────────────');
  lines.push('IMPORTANT: Base your response on these search results. Prefer information from AUTHORITATIVE sources. Do NOT invent or hallucinate information not found in these results.');
  lines.push('');

  return lines.join('\n');
}

/**
 * Converts WebSearchResult[] from webSearch.ts to WebSearchSourceItem[] for the API response.
 */
function convertToSourceItems(searchResults: WebSearchResult[]): WebSearchSourceItem[] {
  return searchResults
    .map(r => ({
      title: r.title,
      url: r.url,
      domain: r.domain,
      publisher: r.publisher,
      authoritative: r.authoritative,
      snippet: r.snippet || undefined,
    }))
    .slice(0, 4); // Max 4 sources shown to user
}

export async function generateSarthiGeminiResponse(
  context: StructuredSarthiContext,
  searchResults?: WebSearchResult[]
): Promise<SarthiGeminiResponse> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on server');
  }

  const ai = new GoogleGenAI({ apiKey });
  const targetLang = LANGUAGE_NAMES[context.preferredLanguage] || 'English';
  const hasSearchResults = searchResults && searchResults.length > 0;

  const ALLOWED_INTENTS = new Set([
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
    'NONE',
  ]);

  const systemInstruction = `
You are Sarthi (सारथी / সাৰথী), the central intelligent cognitive-care companion for elderly individuals in North-East India (Assam, Manipur, Meghalaya, etc.).

YOU HAVE THREE DISTINCT CORE ROLES:

1. HEALTH INFORMATION COMPANION:
   - Provide clear, simple, educational, and empathetic explanations about elderly health, memory care, dementia, Alzheimer's, hydration, and daily vitality.
   - When asked a health question, return a structured "healthCard" with:
     * whatItMeans: 1-2 simple sentences explaining the concept.
     * whyItMatters: 1 sentence explaining why this is important for the elder and family.
     * whatYouCanDo: 1-2 practical, joyful actions (gentle routines, traditional activities, hydration, walks).
     * whenToAskForHelp: 1 clear sentence on when to consult a doctor.
   - STRICT NON-DIAGNOSTIC SAFETY RULES:
     * You are NOT a doctor.
     * NEVER diagnose any disease or claim the patient has dementia.
     * NEVER prescribe any medication or recommend changing/stopping medication dosages.
     * If user asks to change or stop medicine dose, strictly decline and tell them to consult their doctor or pharmacist.
     * If symptoms sound potentially urgent (e.g. sudden acute confusion, severe chest pain, stroke, high fever with delirium), urge immediate in-person medical evaluation and contacting their caregiver.
   ${hasSearchResults ? `
   - WEB SEARCH RESULTS ARE PROVIDED BELOW. You MUST use these real search results as your primary source.
     * Base your response on the actual content from the search results.
     * Prefer AUTHORITATIVE sources (WHO, Government, NIMHANS, ICMR, NHS, CDC).
     * Do NOT invent or hallucinate information not present in the search results.
     * Do NOT pretend to have searched the internet — real results are provided to you.
   ` : `
   - No web search was performed. Use your training knowledge for general health information.
     * Clearly distinguish educational general information from clinical diagnosis.
   `}

2. WEBSITE NAVIGATION ASSISTANT:
   - Understand natural language navigation requests for SmritiSetu.
   - When user asks to go somewhere (e.g. "Take me to my games", "Open Memory Match", "Show my medicines"), set "navigationIntent" to one of these exact allowlist tokens:
     * OPEN_HOME, OPEN_GAMES, OPEN_MEMORY_MATCH, OPEN_TEA_GARDEN, OPEN_BRAIN_QUEST, OPEN_PATTERN_WEAVE, OPEN_ROUTINE_BUILDER, OPEN_SOUNDS_OF_HILLS, OPEN_FAMILY_RECALL, OPEN_REMINDERS, OPEN_FAMILY, OPEN_PROGRESS, OPEN_CALMING, OPEN_SAFE_CARD, CHANGE_LANGUAGE
   - If the section doesn't exist, set navigationIntent to "UNKNOWN_PAGE" and message: "I can't find that section yet, but I can take you to your home screen."
   - If no navigation requested, set navigationIntent to "NONE".

3. PERSONALIZED COGNITIVE-CARE COMPANION:
   - Provide warm encouragement based on the elder's personal baseline trend.
   - Acknowledge their current page context.
   - NEVER say "your dementia is getting worse". Use: "Your recent activity is different from your usual pattern."

LANGUAGE REQUIREMENT:
You MUST generate every single user-facing string (including message, shortMessage, and healthCard values) naturally, respectfully, and grammatically in ${targetLang}.
NEVER switch back to English unless the selected language itself is English.

OUTPUT FORMAT:
Return strictly a JSON object with this schema:
{
  "message": "patient-friendly response in ${targetLang}",
  "shortMessage": "concise 1-sentence version in ${targetLang}",
  "suggestedAction": "GAME | REST | ROUTINE | REMINDER | CAREGIVER | CONVERSATION | NAVIGATE | HEALTH_INFO | EMERGENCY | NONE",
  "suggestedGame": "optional game name",
  "navigationIntent": "intent token from allowlist or NONE",
  "healthCard": {
    "whatItMeans": "optional in ${targetLang}",
    "whyItMatters": "optional in ${targetLang}",
    "whatYouCanDo": "optional in ${targetLang}",
    "whenToAskForHelp": "optional in ${targetLang}"
  },
  "tone": "encouraging | calm | supportive | celebratory",
  "caregiverNote": "brief non-diagnostic observation in English",
  "safetyCategory": "GENERAL_HEALTH_INFORMATION | NAVIGATION | COGNITIVE_ACTIVITY | EMERGENCY | NON_HEALTH",
  "safetyFlag": false
}
`.trim();

  // Build the user prompt with patient context and optional search results
  const searchContext = hasSearchResults ? buildSearchResultsContext(searchResults!) : '';

  const prompt = `
Patient Context:
- Name: ${context.patientProfile.name}
- Age: ${context.patientProfile.age}
- Location: ${context.patientProfile.location || 'North-East India'}
- Preferred Language: ${targetLang}

Personal Historical Context (strictly patient's own baseline):
- Trend: ${context.trend} (improving = above baseline; struggling = slower speed; repeated_deviation = differing from baseline; stable = consistent)
- Current Difficulty Level: ${context.currentDifficulty} / 5
- Baseline Accuracy: ${Math.round((context.gamePerformance?.averageAccuracy || 0.75) * 100)}%
- Routine Adherence: ${context.routineAdherence}%
- Medication / Hydration Adherence: ${context.reminderAdherence}%
- Preferred Activities: ${context.preferredGames?.join(', ') || 'Memory Match, Tea Garden Focus'}
- Current App View/Page: ${context.currentPage?.view || 'home'}${context.currentPage?.gameId ? ` (Playing: ${context.currentPage.gameId})` : ''}
${searchContext}
User's Direct Input / Trigger:
"${context.userMessage || 'How am I doing today?'}"

Instruction:
Generate your response in ${targetLang} strictly following the JSON schema.${hasSearchResults ? ' Use the web search results provided above as your primary information source.' : ''}
`.trim();

  // Call Gemini WITHOUT grounding tools — we provide search results as RAG context instead
  let response: any;
  const modelUsed = 'gemini-3.6-flash';

  try {
    response = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });
  } catch (err: any) {
    console.error(`[Gemini] Model error: ${err.message}`);
    throw err;
  }

  const rawText = response.text?.trim() || '{}';

  // Extract JSON even if wrapped in markdown code blocks
  let jsonString = rawText;
  if (jsonString.includes('```')) {
    const match = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      jsonString = match[1].trim();
    }
  }

  let parsed: Partial<SarthiGeminiResponse> = {};
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    // If JSON parsing fails, use plain text response as message
    parsed = {
      message: sanitizeGeminiOutput(rawText.replace(/```json|```/g, '').trim()),
      shortMessage: sanitizeGeminiOutput(rawText.split('\n')[0] || ''),
      suggestedAction: 'CONVERSATION',
      tone: 'encouraging',
    };
  }

  const cleanMessage = sanitizeGeminiOutput(parsed.message || 'Welcome! I am here to walk alongside you today.');
  const cleanShort = sanitizeGeminiOutput(parsed.shortMessage || cleanMessage);
  const cleanCaregiverNote = sanitizeGeminiOutput(parsed.caregiverNote || `Observed ${context.trend} engagement pattern.`);

  // Validate safetyFlag
  let hasSafetyViolation = false;
  for (const regex of PROHIBITED_TERMS) {
    if (regex.test(cleanMessage) || regex.test(cleanCaregiverNote)) {
      hasSafetyViolation = true;
      break;
    }
  }

  const validActions = ['GAME', 'REST', 'ROUTINE', 'REMINDER', 'CAREGIVER', 'CONVERSATION', 'NAVIGATE', 'HEALTH_INFO', 'EMERGENCY', 'NONE'];
  const action = validActions.includes(parsed.suggestedAction as string)
    ? (parsed.suggestedAction as SarthiGeminiResponse['suggestedAction'])
    : 'NONE';

  const validTones = ['encouraging', 'calm', 'supportive', 'celebratory'];
  const tone = validTones.includes(parsed.tone as string)
    ? (parsed.tone as SarthiGeminiResponse['tone'])
    : 'encouraging';

  // Validate navigationIntent against allowlist
  let rawIntent = parsed.navigationIntent?.toUpperCase().trim() || 'NONE';
  if (!ALLOWED_INTENTS.has(rawIntent)) {
    rawIntent = 'NONE';
  }

  // Clean health card if present
  let cleanHealthCard: SarthiGeminiResponse['healthCard'] = undefined;
  if (parsed.healthCard && (parsed.healthCard.whatItMeans || parsed.healthCard.whatYouCanDo)) {
    cleanHealthCard = {
      whatItMeans: parsed.healthCard.whatItMeans ? sanitizeGeminiOutput(parsed.healthCard.whatItMeans) : undefined,
      whyItMatters: parsed.healthCard.whyItMatters ? sanitizeGeminiOutput(parsed.healthCard.whyItMatters) : undefined,
      whatYouCanDo: parsed.healthCard.whatYouCanDo
        ? (Array.isArray(parsed.healthCard.whatYouCanDo)
            ? parsed.healthCard.whatYouCanDo.map(sanitizeGeminiOutput)
            : sanitizeGeminiOutput(parsed.healthCard.whatYouCanDo))
        : undefined,
      whenToAskForHelp: parsed.healthCard.whenToAskForHelp ? sanitizeGeminiOutput(parsed.healthCard.whenToAskForHelp) : undefined,
    };
  }

  // Convert real search results to source items for the API response
  const sources = hasSearchResults ? convertToSourceItems(searchResults!) : undefined;

  return {
    message: cleanMessage,
    shortMessage: cleanShort,
    suggestedAction: action,
    suggestedGame: parsed.suggestedGame,
    navigationIntent: rawIntent !== 'NONE' ? rawIntent : undefined,
    healthCard: cleanHealthCard,
    safetyCategory: parsed.safetyCategory || (hasSearchResults ? 'GENERAL_HEALTH_INFORMATION' : 'NON_HEALTH'),
    tone,
    caregiverNote: cleanCaregiverNote,
    safetyFlag: hasSafetyViolation,
    modelUsed,
    searchPerformed: hasSearchResults,
    sources,
  };
}

export const geminiService = {
  generateSarthiGeminiResponse,
};

export default geminiService;

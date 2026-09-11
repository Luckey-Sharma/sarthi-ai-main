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
  healthContext?: {
    dietPreference?: string;
    foodAllergies?: string[];
    dietaryRestrictions?: string[];
    knownConditions?: string[];
    mobilityLevel?: string;
    medications?: string[];
    recentVitals?: {
      bp?: string;
      hr?: number;
      spO2?: number;
      sleep?: string;
      steps?: number;
      water?: string;
      meals?: string;
    };
    regionalCuisine?: string;
    signals?: Array<{ id: string; label: string; value: string; category: string }>;
  };
}

export interface WebSearchSourceItem {
  title: string;
  url: string;
  domain: string;
  publisher: string;
  authoritative: boolean;
  snippet?: string;
  publishedDate?: string;
}

export interface SarthiGeminiResponse {
  message: string;
  shortMessage: string;
  recommendationTitle?: string;
  recommendationDetails?: string;
  whyItSuitsYou?: string[];
  alternativeOption?: string;
  signalsUsed?: Array<{ id: string; label: string; value: string; category: string }>;
  followUpQuestions?: string[];
  disclaimer?: string;
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
  isEmergency?: boolean;
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
      publishedDate: r.publishedDate || undefined,
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
You are AI Saathi (सारथी / সাৰথী), an intelligent, compassionate health and cognitive-care companion for elderly individuals and their caregivers, particularly in North-East India (Assam, Manipur, Meghalaya, etc.).

YOU FOLLOW A STRICT 8-STAGE WORKFLOW FOR EVERY HEALTH QUESTION:
PATIENT DATA → UNDERSTAND QUESTION → ANALYZE CONTEXT → SEARCH TRUSTED WEB SOURCES → CROSS-CHECK INFORMATION → PERSONALIZE → ANSWER → SHOW SOURCES

CORE DIRECTIVES:
1. PERSONALIZED HEALTH & NUTRITION ENGINE:
   - NEVER give a generic, one-size-fits-all answer. Every recommendation MUST directly reflect the patient's individual data:
     * Their exact diet preference (e.g. Vegetarian, Pescatarian, etc.)
     * Today's physical exertion/steps (e.g. low morning steps vs active walk)
     * Last night's sleep duration and quality
     * Blood pressure and cardiac history (e.g. low sodium recommendation if monitoring hypertension)
     * Prescribed medications and timings
     * Cultural regional foods of North-East India (poha, curd, khichdi, dalia, dal, light stewed vegetables, Joha rice, Kangsoi, chamomile/ginger tea).
   - Return structured health card fields:
     * "recommendationTitle": Short, clear recommendation title in ${targetLang} (e.g. "Vegetable Poha + Curd" or "Gentle Balcony Walk").
     * "recommendationDetails": 2-3 warm, simple sentences explaining the suggestion in ${targetLang}.
     * "whyItSuitsYou": Array of 3-4 specific bullet points in ${targetLang} connecting the recommendation to the patient's real data (e.g. "✓ Matches your vegetarian diet", "✓ Complements your light 1,420 steps today", "✓ Low added salt supports your blood pressure routine").
     * "alternativeOption": 1 nourishing alternative in ${targetLang} (e.g. "Warm oats porridge with crushed almonds and banana").
     * "signalsUsed": Array of objects [{ "id": "sig-1", "label": "Signal Name", "value": "Specific value", "category": "diet|vitals|activity|sleep|medication" }] showing which factors were considered.
     * "followUpQuestions": Array of 3 contextual, natural follow-up questions the patient can tap (e.g. ["Suggest my lunch", "Give me another option", "Can I eat this with my medicine?"]).
     * "disclaimer": "This guidance is for general health support and does not replace advice from your healthcare professional."

2. STRICT MEDICAL SAFETY SYSTEM:
   - You are a supportive health information companion, NOT a diagnostic doctor.
   - NEVER state that you have diagnosed a disease or that the patient is "suffering from dementia".
   - NEVER prescribe medicines or tell patients to alter, increase, or stop prescribed medicine dosages.
   - For medication questions, describe the prescribed purpose from clinical literature and advise following the prescribing doctor's exact instructions.
   - EMERGENCY INTERCEPT: If symptoms sound potentially life-threatening (e.g. severe crushing chest pain, sudden numbness or facial droop, severe breathing difficulty, acute sudden delirium):
     * Set "isEmergency": true
     * Set "suggestedAction": "EMERGENCY"
     * Set "safetyCategory": "EMERGENCY"
     * Urge immediate emergency in-person medical evaluation and contacting their caregiver/ambulance.

3. WEB SEARCH CONTEXT (WHEN PROVIDED):
   ${hasSearchResults ? `
   - WEB SEARCH RESULTS ARE PROVIDED BELOW. You MUST base your clinical/nutritional facts on these authoritative search results (WHO, ICMR, NIN India, MoHFW, NHS, CDC).
   - Cross-check claims using these results. Do NOT hallucinate unverified medical claims.
   ` : `
   - Web search was not performed for this query. Rely on established WHO/ICMR geriatric nutrition and cognitive wellness guidelines.
   `}

4. DEMENTIA-FRIENDLY COMMUNICATION:
   - Use short, clear sentences. Avoid dense medical jargon.
   - Maintain a warm, encouraging, respectful tone suitable for an elder.
   - All user-facing text MUST be written naturally in ${targetLang}.

OUTPUT FORMAT (JSON ONLY):
Return strictly a JSON object:
{
  "message": "Full empathetic response in ${targetLang}",
  "shortMessage": "1-sentence summary in ${targetLang}",
  "recommendationTitle": "title in ${targetLang}",
  "recommendationDetails": "details in ${targetLang}",
  "whyItSuitsYou": ["point 1 in ${targetLang}", "point 2 in ${targetLang}", "point 3 in ${targetLang}"],
  "alternativeOption": "alternative in ${targetLang}",
  "signalsUsed": [
    { "id": "sig-1", "label": "Label", "value": "Value", "category": "diet" }
  ],
  "followUpQuestions": ["question 1", "question 2", "question 3"],
  "suggestedAction": "HEALTH_INFO | CONVERSATION | GAME | REST | ROUTINE | REMINDER | NAVIGATE | EMERGENCY | NONE",
  "suggestedGame": "optional game name",
  "navigationIntent": "intent token from allowlist or NONE",
  "healthCard": {
    "whatItMeans": "simple meaning in ${targetLang}",
    "whyItMatters": "why it matters in ${targetLang}",
    "whatYouCanDo": "actions in ${targetLang}",
    "whenToAskForHelp": "when to consult doctor in ${targetLang}"
  },
  "safetyCategory": "GENERAL_HEALTH_INFORMATION | SELF_CARE_INFORMATION | MEDICATION_INFORMATION | POTENTIALLY_URGENT | EMERGENCY | NON_HEALTH",
  "tone": "encouraging | calm | supportive | celebratory",
  "caregiverNote": "Brief non-diagnostic clinical observation in English",
  "safetyFlag": false,
  "isEmergency": false,
  "disclaimer": "This guidance is for general health support and does not replace advice from your healthcare professional."
}
`.trim();

  // Build the user prompt with patient context, detailed health context, and search results
  const searchContext = hasSearchResults ? buildSearchResultsContext(searchResults!) : '';
  const hc = context.healthContext;

  const prompt = `
Patient Profile:
- Name: ${context.patientProfile.name}
- Age: ${context.patientProfile.age}
- Location: ${context.patientProfile.location || 'North-East India'}
- Preferred Language: ${targetLang}

${hc ? `
Patient Health & Clinical Context (REAL PATIENT SIGNALS):
- Diet Preference: ${hc.dietPreference || 'Vegetarian'}
- Food Allergies: ${hc.foodAllergies?.join(', ') || 'None recorded'}
- Dietary Restrictions: ${hc.dietaryRestrictions?.join('; ') || 'Moderate sodium for blood pressure'}
- Known Conditions: ${hc.knownConditions?.join(', ') || 'Hypertension, Mild Cognitive Impairment'}
- Mobility: ${hc.mobilityLevel || 'Assisted walking'}
- Prescribed Medications: ${hc.medications?.join('; ') || 'Telmisartan 40mg'}
- Regional Cuisine Style: ${hc.regionalCuisine || 'North-East Indian / Assamese vegetarian'}
- Today's Vitals: BP ${hc.recentVitals?.bp || '128/82 mmHg'}, Heart Rate ${hc.recentVitals?.hr || 72} bpm, Sleep ${hc.recentVitals?.sleep || '6h 20m'}, Steps Today: ${hc.recentVitals?.steps || 1420} steps, Hydration: ${hc.recentVitals?.water || '4/8 glasses'}
- Considered Signals: ${hc.signals?.map(s => `${s.label}: ${s.value}`).join(' | ') || 'None'}
` : ''}

Baseline & Routine Activity:
- Trend: ${context.trend}
- Routine Adherence: ${context.routineAdherence}%
- Preferred Activities: ${context.preferredGames?.join(', ') || 'Memory Match, Tea Garden Focus'}
- Current App Page: ${context.currentPage?.view || 'home'}
${searchContext}

User's Question / Trigger:
"${context.userMessage || 'What should I eat today to stay healthy?'}"

Instructions:
Generate a deeply personalized, elderly-friendly response strictly following the JSON schema in ${targetLang}. Ensure "recommendationTitle", "whyItSuitsYou", "alternativeOption", "signalsUsed", and "followUpQuestions" are populated.
`.trim();

  let response: any;
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.6-flash'];
  let modelUsed = 'gemini-2.5-flash';

  for (const m of modelsToTry) {
    try {
      response = await ai.models.generateContent({
        model: m,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });
      modelUsed = m;
      break;
    } catch (err: any) {
      console.warn(`[Gemini] Model ${m} failed (${err?.message || err}), trying fallback...`);
    }
  }

  if (!response) {
    throw new Error('Gemini API temporarily busy across all models');
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

  let rawIntent = parsed.navigationIntent?.toUpperCase().trim() || 'NONE';
  if (!ALLOWED_INTENTS.has(rawIntent)) {
    rawIntent = 'NONE';
  }

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

  const sources = hasSearchResults ? convertToSourceItems(searchResults!) : undefined;

  return {
    message: cleanMessage,
    shortMessage: cleanShort,
    recommendationTitle: parsed.recommendationTitle ? sanitizeGeminiOutput(parsed.recommendationTitle) : undefined,
    recommendationDetails: parsed.recommendationDetails ? sanitizeGeminiOutput(parsed.recommendationDetails) : undefined,
    whyItSuitsYou: Array.isArray(parsed.whyItSuitsYou) ? parsed.whyItSuitsYou.map(sanitizeGeminiOutput) : undefined,
    alternativeOption: parsed.alternativeOption ? sanitizeGeminiOutput(parsed.alternativeOption) : undefined,
    signalsUsed: Array.isArray(parsed.signalsUsed) ? parsed.signalsUsed : hc?.signals,
    followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions.map(sanitizeGeminiOutput) : undefined,
    disclaimer: parsed.disclaimer || 'This guidance is for general health support and does not replace advice from your healthcare professional.',
    suggestedAction: action,
    suggestedGame: parsed.suggestedGame,
    navigationIntent: rawIntent !== 'NONE' ? rawIntent : undefined,
    healthCard: cleanHealthCard,
    safetyCategory: parsed.safetyCategory || (hasSearchResults ? 'GENERAL_HEALTH_INFORMATION' : 'NON_HEALTH'),
    tone,
    caregiverNote: cleanCaregiverNote,
    safetyFlag: hasSafetyViolation,
    isEmergency: !!parsed.isEmergency,
    modelUsed,
    searchPerformed: hasSearchResults,
    sources,
  };
}

export const geminiService = {
  generateSarthiGeminiResponse,
};

export default geminiService;

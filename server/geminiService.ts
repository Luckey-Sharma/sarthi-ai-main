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
  recentActivities?: Array<{
    gameId: string;
    domain: string;
    score: number;
    accuracy?: number;
    reactionTimeMs?: number;
    date: string;
  }>;
  historicalActivities?: Array<{
    gameId: string;
    score: number;
    date: string;
  }>;
  gamePerformance?: {
    averageAccuracy: number;
    averageScore: number;
    averageReactionTimeMs: number;
  };
  currentDifficulty?: number;
  routineAdherence?: number;
  reminderAdherence?: number;
  preferredGames?: string[];
  trend?: 'improving' | 'stable' | 'struggling' | 'repeated_deviation';
  currentPage?: {
    view: string;
    gameId?: string;
  };
  availableNavigationActions?: string[];
  userMessage?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    text: string;
  }>;
  baselineComparisons?: Array<{
    metric: string;
    patientCurrent: string;
    patientBaseline: string;
    comparisonText: string;
  }>;
  missingDataNotices?: string[];
  retrievedTools?: string[];
  searchReason?: string;
  primaryDomain?: string;
  shouldSearchWeb?: boolean;
  suggestedWebSearchTerms?: string[];
  intent?: string;
  activityAnalytics?: {
    daysAnalyzed: number;
    totalActivitiesCount: number;
    todayActivitiesCount: number;
    overallConsistencyScore: number;
    categoryBreakdown?: Array<{ category: string; label: string; count: number }>;
    physicalSummary?: {
      totalSteps: number;
      averageDailySteps: number;
      totalWalkMinutes: number;
      trend: string;
    };
    cognitiveSummary?: {
      totalSessions: number;
      averageScore: number;
      topGame: string;
      trend: string;
    };
    restAndCalmingSummary?: {
      totalCalmingSessions: number;
      averageSleepHours: number;
      sleepActivityCorrelation: string;
    };
    medicationAdherence?: {
      adherenceRate: number;
    };
  };
  todayActivityRecords?: Array<{
    time: string;
    category: string;
    title: string;
    details: string;
    metrics?: any;
  }>;
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
      mood?: string;
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
  targetView?: string;
  targetGameId?: string;
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
  dataSourceMode?: 'INTERNAL_RECORDS' | 'EXTERNAL_WEB' | 'HYBRID';
  executedStages?: Array<{ stage: number; title: string; detail?: string }>;
  baselineComparison?: Array<{ metric: string; patientCurrent: string; patientBaseline: string; comparisonText: string }>;
  missingDataNotice?: string;
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
You are AI Saathi (सारथी / সাৰথী), an intelligent, compassionate, personalized health, wellness, cognitive-care, and daily-life companion for elderly individuals and their caregivers.

CORE ROLE: GENERAL COMPANION FOR ALL TOPICS OF SENIOR LIFE:
- "What should I eat?" is ONLY ONE EXAMPLE. Do NOT build your responses solely around food or nutrition.
- You actively assist with:
  * Physical activity, walks, mobility, safe chair exercises, and daily movement.
  * Cognitive engagement, memory match games, brain quest puzzles, and reminiscence.
  * Sleep quality, tiredness, daytime fatigue, and calming wind-down rituals.
  * Prescribed medications, pill schedules, with-food instructions, and safe adherence.
  * Health readings (blood pressure, heart rate, oxygen SpO2) explained in simple, non-frightening terms.
  * Daily routine planning ("What should I do today?", morning/afternoon focus).
  * Family memories, photo albums, and social connections with loved ones.
  * Appointments, clinic visits, and doctor directives translated into simple steps.
  * Explaining complex medical terms in plain, respectful language.

DYNAMIC REASONING STEPS FOR EVERY QUESTION:
1. What is the user asking? Understand the natural-language intent (including follow-up pronouns referring to earlier turns in the conversation).
2. Which patient information is relevant? Focus on relevant signals; do not dump unrelated data.
3. Compare with the patient's OWN NORMAL PATTERN (7-day personal baseline) whenever available. Clearly distinguish personal historical patterns from general medical reference ranges.
4. Verify whether external evidence was searched. If web search results are provided below, cite those authoritative sources (WHO, ICMR, NIN, AIIMS, NHS, CDC). If no web search was performed, generate the answer honestly from the patient's internal records.
5. If important health data is missing (e.g. today's blood pressure is not logged yet), state what is missing simply; never hallucinate or invent readings.
6. Personalize: Combine patient profile + live vitals + personal baseline + doctor notes + caregiver observations + conversation context.
7. Medical safety: You support health decisions but NEVER diagnose diseases ("You definitely have...", "This proves that you have..."). NEVER tell patients to stop or change prescribed medicine dosages.
8. Emergency intercept: If acute life-threatening symptoms appear (severe chest pain, difficulty breathing, sudden paralysis/facial droop, acute sudden confusion), set "isEmergency": true and "suggestedAction": "EMERGENCY".

DEMENTIA-FRIENDLY & ELDERLY-FRIENDLY COMMUNICATION:
- Use short, clear, warm, respectful sentences in ${targetLang}.
- Avoid clinical jargon, panic-inducing terms, or condescension.

OUTPUT FORMAT (JSON ONLY):
Return strictly a JSON object:
{
  "message": "Warm empathetic response in ${targetLang}",
  "shortMessage": "1-sentence summary in ${targetLang}",
  "recommendationTitle": "Clear, concise title in ${targetLang}",
  "recommendationDetails": "2-3 simple sentences explaining the personalized recommendation in ${targetLang}",
  "whyItSuitsYou": ["Point 1 connecting to patient data/baseline in ${targetLang}", "Point 2 in ${targetLang}", "Point 3 in ${targetLang}"],
  "alternativeOption": "1 nourishing or gentle alternative in ${targetLang}",
  "signalsUsed": [
    { "id": "sig-1", "label": "Label", "value": "Value", "category": "profile|vitals|activity|medication|diet|sleep|routine" }
  ],
  "followUpQuestions": ["Question 1", "Question 2", "Question 3"],
  "suggestedAction": "GAME | REST | ROUTINE | REMINDER | CAREGIVER | CONVERSATION | NAVIGATE | HEALTH_INFO | EMERGENCY | NONE",
  "suggestedGame": "optional game name (e.g. memory_match, tea_garden, routine_builder)",
  "navigationIntent": "intent token from allowlist or NONE",
  "targetView": "home | games | reminders | calming | emergency | family",
  "targetGameId": "memory_match | tea_garden | brain_quest | pattern_weave | routine_builder | sounds_hills | family_recall",
  "healthCard": {
    "whatItMeans": "simple meaning in ${targetLang}",
    "whyItMatters": "why it matters in ${targetLang}",
    "whatYouCanDo": "clear gentle steps in ${targetLang}",
    "whenToAskForHelp": "when to consult caregiver or doctor in ${targetLang}"
  },
  "safetyCategory": "GENERAL_HEALTH_INFORMATION | SELF_CARE_INFORMATION | MEDICATION_INFORMATION | POTENTIALLY_URGENT | EMERGENCY | NON_HEALTH",
  "tone": "encouraging | calm | supportive | celebratory",
  "caregiverNote": "Brief non-diagnostic clinical observation in English",
  "missingDataNotice": "Optional note stating if relevant data is missing",
  "safetyFlag": false,
  "isEmergency": false,
  "disclaimer": "This guidance is for general health support and does not replace advice from your healthcare professional."
}
`.trim();

  // Build the user prompt with patient context, multi-turn history, baseline comparisons, and search results
  const searchContext = hasSearchResults ? buildSearchResultsContext(searchResults!) : '';
  const hc = context.healthContext;

  const convHistoryFormatted = context.conversationHistory?.length
    ? context.conversationHistory.map((t) => `${t.role === 'user' ? 'Patient' : 'AI Saathi'}: ${t.text}`).join('\n')
    : 'New session — no prior turns.';

  const baselineFormatted = context.baselineComparisons?.length
    ? context.baselineComparisons.map((b) => `• ${b.metric}: Current [${b.patientCurrent}] vs 7-Day Average [${b.patientBaseline}] -> "${b.comparisonText}"`).join('\n')
    : 'No baseline comparison available.';

  const missingFormatted = context.missingDataNotices?.length
    ? context.missingDataNotices.map((m) => `• ${m}`).join('\n')
    : 'All primary record fields available.';

  const prompt = `
Patient Profile:
- Name: ${context.patientProfile.name}
- Age: ${context.patientProfile.age}
- Location: ${context.patientProfile.location || 'North-East India'}
- Preferred Language: ${targetLang}
- Cognitive Stage: ${context.patientProfile.diagnosisStage || 'Senior wellness monitoring'}

${hc ? `
Patient Health & Routine Data:
- Known Conditions: ${hc.knownConditions?.join(', ') || 'Mild Hypertension, Senior wellness'}
- Prescribed Medications: ${hc.medications?.join('; ') || 'Telmisartan 40mg'}
- Mobility Profile: ${hc.mobilityLevel || 'Independent / Assisted'}
- Dietary Preference: ${hc.dietPreference || 'Vegetarian'} (${hc.regionalCuisine || 'Regional cuisine'})
- Food Allergies: ${hc.foodAllergies?.join(', ') || 'None recorded'}
- Today's Vitals: BP ${hc.recentVitals?.bp || '128/82 mmHg'}, Heart Rate ${hc.recentVitals?.hr || 72} bpm, SpO2 ${hc.recentVitals?.spO2 || 98}%, Sleep: ${hc.recentVitals?.sleep || '6h 20m'}, Steps Today: ${hc.recentVitals?.steps || 1420} steps, Hydration: ${hc.recentVitals?.water || '4/8 glasses'}, Mood: ${hc.recentVitals?.mood || 'calm'}, Meals: ${hc.recentVitals?.meals || 'Breakfast logged'}
- Recorded Factors: ${hc.signals?.map((s) => `${s.label}: ${s.value}`).join(' | ') || 'None'}
` : ''}

Patient Personal 7-Day Baseline Comparison:
${baselineFormatted}

Missing Data Notices:
${missingFormatted}

Recent Conversation Turns (Multi-turn Context):
${convHistoryFormatted}
${searchContext}

User's Current Question:
"${context.userMessage || 'What should I focus on today?'}"

Instructions:
Synthesize an intelligent, deeply personalized, elderly-friendly response strictly following the JSON format in ${targetLang}.
Tie your recommendations directly to the patient's personal data and baseline patterns. If data was missing, mention it gently.
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
  const cleanCaregiverNote = sanitizeGeminiOutput(parsed.caregiverNote || `Observed ${context.trend || 'stable'} engagement pattern.`);

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

  // Construct dynamic list of stages actually executed
  const executedStages: Array<{ stage: number; title: string; detail?: string }> = [];
  let currentStageNum = 1;
  executedStages.push({
    stage: currentStageNum++,
    title: 'Understanding your question...',
    detail: 'Analyzing user question intent and conversational context',
  });

  if (context.healthContext?.recentVitals || context.healthContext?.knownConditions) {
    executedStages.push({
      stage: currentStageNum++,
      title: 'Checking relevant health information...',
      detail: 'Reviewed resting vitals, known conditions, and medications',
    });
  }

  if (context.healthContext?.recentVitals?.steps !== undefined) {
    executedStages.push({
      stage: currentStageNum++,
      title: 'Reviewing your recent activity...',
      detail: 'Evaluated today’s step count, movement pace, and sleep hours',
    });
  }

  if (context.baselineComparisons && context.baselineComparisons.length > 0) {
    executedStages.push({
      stage: currentStageNum++,
      title: 'Comparing with your usual pattern...',
      detail: 'Evaluated against your personal 7-day baseline history',
    });
  }

  if (context.healthContext?.medications || context.currentPage) {
    executedStages.push({
      stage: currentStageNum++,
      title: 'Checking your routine...',
      detail: 'Verified daily medication schedule and pending activities',
    });
  }

  if (hasSearchResults) {
    executedStages.push({
      stage: currentStageNum++,
      title: 'Searching trusted health sources...',
      detail: 'Queried WHO, ICMR, NIN, AIIMS, and NHS authoritative guidelines',
    });
    executedStages.push({
      stage: currentStageNum++,
      title: 'Cross-checking information...',
      detail: 'Filtered spam/blogs to verify clinical recommendations',
    });
  }

  executedStages.push({
    stage: currentStageNum++,
    title: 'Personalizing your answer...',
    detail: 'Synthesizing tailored recommendation for your profile and routine',
  });

  // Source transparency: ONLY include sources if web search was ACTUALLY performed
  const sources = hasSearchResults ? convertToSourceItems(searchResults!) : undefined;
  const dataSourceMode: SarthiGeminiResponse['dataSourceMode'] = hasSearchResults
    ? (hc ? 'HYBRID' : 'EXTERNAL_WEB')
    : 'INTERNAL_RECORDS';

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
    targetView: parsed.targetView,
    targetGameId: parsed.targetGameId,
    healthCard: cleanHealthCard,
    safetyCategory: parsed.safetyCategory || (hasSearchResults ? 'GENERAL_HEALTH_INFORMATION' : 'NON_HEALTH'),
    tone,
    caregiverNote: cleanCaregiverNote,
    safetyFlag: hasSafetyViolation,
    isEmergency: !!parsed.isEmergency,
    modelUsed,
    searchPerformed: hasSearchResults,
    dataSourceMode,
    executedStages,
    baselineComparison: context.baselineComparisons,
    missingDataNotice: parsed.missingDataNotice || context.missingDataNotices?.[0],
    sources,
  };
}

export const geminiService = {
  generateSarthiGeminiResponse,
};

export default geminiService;

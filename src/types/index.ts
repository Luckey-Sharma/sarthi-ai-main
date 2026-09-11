export type Language = 'as' | 'bn' | 'mni' | 'hi' | 'en';

export type AppMode = 'elderly' | 'caregiver';

export type AppView = 
  | 'home'
  | 'games'
  | 'game_detail'
  | 'family'
  | 'reminders'
  | 'calming'
  | 'emergency'
  | 'onboarding';

export type CognitiveDomain = 
  | 'visual_spatial'
  | 'attention_motor'
  | 'executive_function'
  | 'pattern_logic'
  | 'temporal_orientation'
  | 'auditory_memory'
  | 'autobiographical';

export type GameId = 
  | 'memory_match'
  | 'tea_garden'
  | 'brain_quest'
  | 'pattern_weave'
  | 'routine_builder'
  | 'sounds_hills'
  | 'family_recall';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  language: Language;
  preferredLanguage?: Language; // alias for compatibility
  location: string;
  hometown?: string;
  diagnosisStage: 'Mild Cognitive Impairment' | 'Early Stage' | 'Moderate Stage';
  bio: string;
  avatar: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
    address: string;
  };
}

export interface CaregiverProfile {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  burnoutScore: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  photoUrl: string;
  voiceNoteUrl?: string;
  memoryHint: string;
  favoriteMemory: string;
  hometown: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: 'morning' | 'afternoon' | 'night';
  time: string;
  instructions: string;
  takenToday: boolean;
}

export interface CognitiveSession {
  id: string;
  gameId: GameId;
  domain: CognitiveDomain;
  timestamp: string;
  date: string;
  score: number;
  maxScore: number;
  accuracy: number;
  reactionTimeMs: number;
  difficultyLevel: number;
}

export interface DDAState {
  level: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  baselineReactionTime: number;
  speedMultiplier: number;
}

export interface CVIScorecard {
  overallScore: number; // 0 - 100
  trend: 'improving' | 'stable' | 'declining';
  riskTier: 'Low' | 'Moderate' | 'High';
  domainScores: Record<CognitiveDomain, number>;
  lastUpdated: string;
}

export interface BurnoutAssessment {
  score: number;
  level: 'Low' | 'Mild' | 'Moderate' | 'High';
  date: string;
  answers: number[];
}

export interface CulturalCard {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
  imageUrl?: string;
  culturalFact: string;
}

export interface GameLevelMeta {
  level: number;
  badge: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
}

export interface DDAPerformance {
  success: boolean;
  reactionTimeMs: number;
  accuracy?: number;
  score?: number;
  maxScore?: number;
}

export interface DDAUpdateResult extends DDAState {
  leveledUp: boolean;
  leveledDown: boolean;
  feedbackMessage?: Record<Language, string>;
}

export interface BrainQuestPuzzle {
  id: string;
  level: number;
  question: Record<Language, string>;
  options: { id: string; label: Record<Language, string>; isCorrect: boolean }[];
  hint: Record<Language, string>;
  culturalContext: string;
}

export interface RoutineCard {
  id: string;
  title: Record<Language, string>;
  icon: string;
  correctOrder: number;
  timeLabel: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface SoundCard {
  id: string;
  title: Record<Language, string>;
  soundType: 'pepa_flute' | 'temple_bell' | 'monsoon_rain' | 'lake_ripples' | 'hornbill_call' | 'bihu_dhol' | 'stream_water' | 'conch_shell';
  icon: string;
  imageUrl?: string;
  description: Record<Language, string>;
}

// ==========================================
// SARTHI — COGNITIVE CARE COMPANION TYPES
// ==========================================

export type SarthiRecommendationType =
  | 'GAME_RECOMMENDATION'
  | 'ROUTINE_REMINDER'
  | 'REST_SUGGESTION'
  | 'CAREGIVER_CHECKIN'
  | 'ENCOURAGEMENT'
  | 'GENERAL_CONVERSATION'
  | 'HEALTH_INFO';

export type SarthiPriority = 'low' | 'normal' | 'high' | 'urgent';

export type SarthiTrend = 'improving' | 'stable' | 'struggling' | 'repeated_deviation';

export type SarthiDemoScenario = 'baseline' | 'improving' | 'struggling' | 'repeated_deviation';

export interface SarthiRecommendation {
  id: string;
  type: SarthiRecommendationType;
  priority: SarthiPriority;
  recommendedGame?: GameId;
  recommendedGameTitle?: Record<Language, string>;
  difficulty?: number;
  reason: string; // Transparent explainability for judges & caregivers
  patientMessage: string; // In patient's current language
  caregiverInsight: string; // Non-diagnostic activity pattern observation
  suggestedAction?: {
    label: Record<Language, string>;
    view?: AppView;
    gameId?: GameId;
  };
}

export interface SarthiPersonalBaseline {
  patientId: string;
  averageScore: number;
  averageAccuracy: number;
  averageReactionTimeMs: number;
  totalSessions: number;
  trend: SarthiTrend;
  consecutiveDropCount: number;
  preferredGame?: GameId;
  recentSessionsCount: number;
  lastActiveDate?: string;
  domainAverages: Partial<Record<CognitiveDomain, number>>;
}

export type NavigationIntent =
  | 'OPEN_HOME'
  | 'OPEN_GAMES'
  | 'OPEN_MEMORY_MATCH'
  | 'OPEN_TEA_GARDEN'
  | 'OPEN_BRAIN_QUEST'
  | 'OPEN_PATTERN_WEAVE'
  | 'OPEN_ROUTINE_BUILDER'
  | 'OPEN_SOUNDS_OF_HILLS'
  | 'OPEN_FAMILY_RECALL'
  | 'OPEN_REMINDERS'
  | 'OPEN_FAMILY'
  | 'OPEN_PROGRESS'
  | 'OPEN_CALMING'
  | 'OPEN_SAFE_CARD'
  | 'OPEN_SARTHI'
  | 'OPEN_CAREGIVER_DASHBOARD'
  | 'CHANGE_LANGUAGE'
  | 'START_GAME'
  | 'READ_REMINDERS'
  | 'SHOW_PROGRESS'
  | 'UNKNOWN_PAGE';

export type SafetyCategory =
  | 'GENERAL_HEALTH_INFORMATION'
  | 'SELF_CARE_INFORMATION'
  | 'MEDICATION_INFORMATION'
  | 'POTENTIALLY_URGENT'
  | 'EMERGENCY'
  | 'NON_HEALTH'
  | 'NAVIGATION'
  | 'COGNITIVE_ACTIVITY';

export interface SarthiHealthCard {
  title?: string;
  whatItMeans?: string;
  whyItMatters?: string;
  whatYouCanDo?: string | string[];
  whenToAskForHelp?: string;
}

export type SarthiIntent =
  | 'APP_NAVIGATION'
  | 'PATIENT_PROGRESS'
  | 'GAME_RECOMMENDATION'
  | 'REMINDER'
  | 'MEDICATION_REMINDER'
  | 'ROUTINE'
  | 'GENERAL_HEALTH_INFORMATION'
  | 'CURRENT_HEALTH_INFORMATION'
  | 'EMERGENCY'
  | 'SMALL_TALK'
  | 'UNKNOWN';

export interface WebSearchSource {
  title: string;
  url: string;
  domain: string;
  publisher: string;
  authoritative: boolean;
  snippet?: string;
}

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced';

export interface SyncQueueItem {
  id: string;
  type: 'session' | 'water' | 'medication' | 'caregiver_note';
  data: any;
  timestamp: string;
  version: number;
  synced?: boolean;
}

export interface SarthiChatMessage {
  id: string;
  sender: 'user' | 'sarthi';
  text: string;
  timestamp: string;
  recommendation?: SarthiRecommendation;
  quickActions?: string[];
  isGemini?: boolean;
  healthCard?: SarthiHealthCard;
  navigationIntent?: NavigationIntent;
  navigationTarget?: {
    view?: AppView;
    gameId?: GameId;
    language?: Language;
    openSOS?: boolean;
  };
  isWorkingOffline?: boolean;
  safetyCategory?: SafetyCategory;
  intent?: SarthiIntent;
  sources?: WebSearchSource[];
  searchPerformed?: boolean;
  isEmergency?: boolean;
}

export interface SarthiContext {
  patient: PatientProfile;
  language: Language;
  recentSessions: CognitiveSession[];
  allSessions: CognitiveSession[];
  routineAdherence: number;
  hydrationGlasses: number;
  demoScenario?: SarthiDemoScenario;
  currentPage?: {
    view: AppView;
    gameId?: GameId;
  };
}


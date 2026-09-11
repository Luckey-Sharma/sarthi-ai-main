export type DietPreference = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'sattvic' | 'pescatarian';

export type MobilityLevel = 'independent' | 'assisted_walking' | 'walking_stick' | 'walker' | 'wheelchair';

export interface VitalsReading {
  date: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number; // bpm
  spO2: number; // percentage
  sleepHours: number; // hours (e.g. 6.3 = 6h 20m)
  sleepQuality: 'restful' | 'fair' | 'poor';
  steps: number;
  waterGlasses: number; // out of 8
  mood: 'cheerful' | 'calm' | 'neutral' | 'fatigued' | 'anxious';
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
  };
  cognitiveScore?: number;
  routineCompleted?: boolean;
}

export interface MedicationSchedule {
  id: string;
  name: string;
  dosage: string;
  condition: string;
  timeOfDay: 'morning' | 'afternoon' | 'night' | 'twice_daily';
  time: string;
  takenToday: boolean;
  withFood: boolean;
  instructions: string;
}

export interface DoctorInstruction {
  date: string;
  doctorName: string;
  specialty: string;
  instructions: string[];
}

export interface AppointmentRecord {
  date: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  notes?: string;
}

export interface PatientHealthRecord {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  bmi: number;
  location: string;
  dietPreference: DietPreference;
  foodAllergies: string[];
  dietaryRestrictions: string[];
  knownConditions: string[];
  mobilityLevel: MobilityLevel;
  cognitiveStage: string;
  currentMedications: MedicationSchedule[];
  recentAppointments: AppointmentRecord[];
  doctorInstructions: DoctorInstruction[];
  doctorNotes: string;
  caregiverNotes: string;
  regionalCuisinePreference: string;
  preferredLanguage: string;
  vitalsHistory: VitalsReading[];
  isDemoData: boolean;
}

export interface PersonalizationSignal {
  id: string;
  label: string;
  value: string;
  category: 'profile' | 'vitals' | 'activity' | 'medication' | 'diet' | 'sleep' | 'routine' | 'culture';
  icon?: string;
}

export interface AuthoritativeSource {
  id: string;
  organization: string;
  title: string;
  url: string;
  domain: string;
  publishedDate?: string;
  snippet?: string;
  authoritative: boolean;
  trustRating: 'WHO' | 'Government / MoHFW' | 'National Institute (ICMR/NIN)' | 'Premier Hospital (AIIMS/NHS)' | 'NIH / CDC' | 'Medical Authority';
}

export interface PipelineStageInfo {
  stage: number;
  title: string;
  detail?: string;
}

export interface BaselineComparisonItem {
  metric: string;
  patientCurrent: string;
  patientBaseline: string;
  comparisonText: string;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export type AgentToolName =
  | 'getPatientProfile'
  | 'getPatientPreferences'
  | 'getKnownConditions'
  | 'getCurrentMedications'
  | 'getDoctorInstructions'
  | 'getCaregiverNotes'
  | 'getRecentVitals'
  | 'getHistoricalVitals'
  | 'getSleepData'
  | 'getActivityData'
  | 'getRoutine'
  | 'getAppointments'
  | 'getMealHistory'
  | 'getHydrationData'
  | 'getMoodHistory'
  | 'getCognitivePerformance'
  | 'getMemoryDatabase'
  | 'getFamilyConnections'
  | 'getRecentAIContext'
  | 'searchTrustedWeb'
  | 'retrieveMedicalEvidence'
  | 'compareWithPatientBaseline'
  | 'generatePersonalizedPlan';

export interface AISaathiResponse {
  recommendationTitle: string;
  recommendationDetails: string;
  whyItSuitsYou: string[];
  alternativeOption: string;
  signalsUsed: PersonalizationSignal[];
  sourcesChecked: AuthoritativeSource[];
  followUpQuestions: string[];
  safetyCategory:
    | 'GENERAL_HEALTH_INFORMATION'
    | 'SELF_CARE_INFORMATION'
    | 'MEDICATION_INFORMATION'
    | 'POTENTIALLY_URGENT'
    | 'EMERGENCY'
    | 'NON_HEALTH';
  disclaimer: string;
  isEmergency: boolean;
  emergencySteps?: string[];
  tone: 'encouraging' | 'calm' | 'supportive' | 'urgent';
  caregiverInsight?: string;
  modelUsed?: string;
  searchPerformed?: boolean;
  dataSourceMode?: 'INTERNAL_RECORDS' | 'EXTERNAL_WEB' | 'HYBRID';
  executedStages?: PipelineStageInfo[];
  baselineComparison?: BaselineComparisonItem[];
  missingDataNotice?: string;
  suggestedAction?: 'GAME' | 'REST' | 'ROUTINE' | 'REMINDER' | 'CAREGIVER' | 'CONVERSATION' | 'NAVIGATE' | 'HEALTH_INFO' | 'EMERGENCY' | 'NONE';
  targetView?: string;
  targetGameId?: string;
}

export type DemoScenarioId =
  | 'scenario_bp_low_activity' // 74y, elevated BP, vegetarian, low steps
  | 'scenario_active_normal'   // 71y, active morning, normal BP, balanced Bengali diet
  | 'scenario_poor_sleep_fatigue'; // 76y, 4.8h sleep, fatigue, Manipuri tea/herbs

export type UserRole = 'patient' | 'caregiver' | 'doctor' | 'admin';

export interface PrivacyConsentSettings {
  shareDailySummaryWithCaregiver: boolean;
  shareVitalsTrendsWithDoctor: boolean;
  keepCasualChatConfidential: boolean;
  allowAnonymousAnalytics: boolean;
  encryptedStorageEnabled: boolean;
}


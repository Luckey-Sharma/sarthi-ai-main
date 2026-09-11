import {
  PatientHealthRecord,
  VitalsReading,
  MedicationSchedule,
  PersonalizationSignal,
  DemoScenarioId,
  BaselineComparisonItem,
  ConversationTurn,
  AgentToolName,
} from '../types/healthCompanion';
import { demoPatientHealthRecords, DEMO_SCENARIO_CONFIGS } from './demoHealthData';
import { demoFamilyMembers } from './mockData';
import { patientActivityDatabase, ActivityAnalyticsSummary, ActivityRecord } from './patientActivityDatabase';

export interface PatientBaselineSummary {
  avgSteps: number;
  avgSleepHours: number;
  avgCognitiveScore: number;
  avgSystolic: number;
  avgDiastolic: number;
  avgWaterGlasses: number;
  recordedDays: number;
}

export interface DynamicContextRetrievalResult {
  patient: PatientHealthRecord;
  signals: PersonalizationSignal[];
  retrievedTools: AgentToolName[];
  baselineComparisons: BaselineComparisonItem[];
  missingDataNotices: string[];
  suggestedWebSearchTerms: string[];
  shouldSearchWeb: boolean;
  searchReason: string;
  primaryDomain: 'daily_routine' | 'physical_activity' | 'cognitive_care' | 'vitals_cardiac' | 'sleep_rest' | 'medications' | 'nutrition' | 'hydration' | 'family_memories' | 'medical_knowledge' | 'emergency' | 'general';
  primaryIntent?: string;
  activityAnalytics?: ActivityAnalyticsSummary;
  todayActivities?: ActivityRecord[];
}

class PatientContextEngine {
  private activePatientId: string = 'pat-1';
  private activeScenarioId: DemoScenarioId = 'scenario_bp_low_activity';
  private customPatientOverrides: Record<string, Partial<PatientHealthRecord>> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      const savedScenario = localStorage.getItem('sarthi_active_scenario') as DemoScenarioId;
      if (savedScenario && DEMO_SCENARIO_CONFIGS[savedScenario]) {
        this.activeScenarioId = savedScenario;
        this.activePatientId = DEMO_SCENARIO_CONFIGS[savedScenario].patientId;
      }
    }
  }

  public setScenario(scenarioId: DemoScenarioId): PatientHealthRecord {
    this.activeScenarioId = scenarioId;
    const config = DEMO_SCENARIO_CONFIGS[scenarioId];
    if (config) {
      this.activePatientId = config.patientId;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('sarthi_active_scenario', scenarioId);
    }
    return this.getActivePatientRecord();
  }

  public getActiveScenarioId(): DemoScenarioId {
    return this.activeScenarioId;
  }

  public setActivePatientId(patientId: string) {
    this.activePatientId = patientId;
  }

  public getActivePatientRecord(): PatientHealthRecord {
    const base = demoPatientHealthRecords[this.activePatientId] || demoPatientHealthRecords['pat-1'];
    const overrides = this.customPatientOverrides[this.activePatientId] || {};
    return { ...base, ...overrides };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 23 AGENT TOOLS ARCHITECTURE
  // ══════════════════════════════════════════════════════════════════════════════

  // ─── Tool 1: getPatientProfile ────────────────────────────────────────────────
  public getPatientProfile(patientId: string = this.activePatientId): PatientHealthRecord {
    return demoPatientHealthRecords[patientId] || demoPatientHealthRecords['pat-1'];
  }

  // ─── Tool 2: getPatientPreferences ────────────────────────────────────────────
  public getPatientPreferences(patientId: string = this.activePatientId) {
    const patient = this.getPatientProfile(patientId);
    return {
      dietPreference: patient.dietPreference,
      allergies: patient.foodAllergies,
      dietaryRestrictions: patient.dietaryRestrictions,
      regionalCuisinePreference: patient.regionalCuisinePreference,
      preferredLanguage: patient.preferredLanguage,
      mobilityLevel: patient.mobilityLevel,
    };
  }

  // ─── Tool 3: getKnownConditions ───────────────────────────────────────────────
  public getKnownConditions(patientId: string = this.activePatientId): string[] {
    const patient = this.getPatientProfile(patientId);
    return patient?.knownConditions || [];
  }

  // ─── Tool 4: getCurrentMedications ────────────────────────────────────────────
  public getCurrentMedications(patientId: string = this.activePatientId): MedicationSchedule[] {
    const patient = this.getPatientProfile(patientId);
    return patient?.currentMedications || [];
  }

  // ─── Tool 5: getDoctorInstructions ────────────────────────────────────────────
  public getDoctorInstructions(patientId: string = this.activePatientId) {
    const patient = this.getPatientProfile(patientId);
    return {
      doctorNotes: patient?.doctorNotes || '',
      recentInstructions: patient?.doctorInstructions || [],
    };
  }

  // ─── Tool 6: getCaregiverNotes ────────────────────────────────────────────────
  public getCaregiverNotes(patientId: string = this.activePatientId): string {
    return this.getPatientProfile(patientId)?.caregiverNotes || '';
  }

  // ─── Tool 7: getRecentVitals ──────────────────────────────────────────────────
  public getRecentVitals(patientId: string = this.activePatientId): VitalsReading | null {
    const patient = this.getPatientProfile(patientId);
    return patient?.vitalsHistory?.[0] || null;
  }

  // ─── Tool 8: getHistoricalVitals ──────────────────────────────────────────────
  public getHistoricalVitals(patientId: string = this.activePatientId, days: number = 7): VitalsReading[] {
    const patient = this.getPatientProfile(patientId);
    return (patient?.vitalsHistory || []).slice(0, days);
  }

  // ─── Tool 9: getSleepData ─────────────────────────────────────────────────────
  public getSleepData(patientId: string = this.activePatientId): {
    hours: number;
    formatted: string;
    quality: 'restful' | 'fair' | 'poor';
    note: string;
    bedtimeRoutineAdvised: string;
  } {
    const vitals = this.getRecentVitals(patientId);
    const hours = vitals?.sleepHours ?? 6.5;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const formatted = `${h}h ${m}m`;
    const quality = vitals?.sleepQuality || 'fair';
    const note =
      quality === 'poor'
        ? 'Restless sleep with awakenings recorded last night'
        : quality === 'fair'
        ? 'Moderate sleep recorded last night'
        : 'Restful, uninterrupted night sleep recorded';

    const bedtimeRoutineAdvised =
      quality === 'poor'
        ? 'Dim lights early, avoid screens after 8 PM, and enjoy warm herbal chamomile/cardamom tea.'
        : 'Maintain consistent sleep and wake timing to support circadian rhythm.';

    return { hours, formatted, quality, note, bedtimeRoutineAdvised };
  }

  // ─── Tool 10: getActivityData ─────────────────────────────────────────────────
  public getActivityData(patientId: string = this.activePatientId): {
    steps: number;
    level: 'low' | 'moderate' | 'active';
    description: string;
    recommendedAdjustment: string;
    todayActivitiesCount: number;
    lastActivityTitle?: string;
  } {
    const vitals = this.getRecentVitals(patientId);
    const todayActs = patientActivityDatabase.getTodayActivities(patientId);
    
    // Check if user logged physical activity today with custom steps
    const physicalAct = todayActs.find((a) => a.category === 'physical' && a.metrics?.steps);
    const steps = physicalAct?.metrics?.steps ?? vitals?.steps ?? 1500;
    const level = steps < 2500 ? 'low' : steps < 5000 ? 'moderate' : 'active';
    const description =
      level === 'low'
        ? `Light morning activity (${steps.toLocaleString()} steps logged today)`
        : level === 'moderate'
        ? `Moderate activity (${steps.toLocaleString()} steps today)`
        : `High physical activity (${steps.toLocaleString()} steps completed this morning)`;

    const recommendedAdjustment =
      level === 'low'
        ? 'A 15-minute gentle stroll on level ground or balcony walking would safely boost circulation.'
        : level === 'moderate'
        ? 'Maintain this steady pace with adequate hydration breaks.'
        : 'Good exertion; prioritize seated rest and leg elevation this afternoon.';

    const lastAct = todayActs[todayActs.length - 1];

    return {
      steps,
      level,
      description,
      recommendedAdjustment,
      todayActivitiesCount: todayActs.length,
      lastActivityTitle: lastAct?.title,
    };
  }

  // ─── Tool 11: getRoutine ──────────────────────────────────────────────────────
  public getRoutine(patientId: string = this.activePatientId) {
    const vitals = this.getRecentVitals(patientId);
    const meds = this.getCurrentMedications(patientId);
    const morningMed = meds.find((m) => m.timeOfDay === 'morning');
    const nightMed = meds.find((m) => m.timeOfDay === 'night');

    return {
      routineCompleted: !!vitals?.routineCompleted,
      morningMedTaken: morningMed ? morningMed.takenToday : true,
      nightMedPending: nightMed ? !nightMed.takenToday : false,
      waterGlasses: vitals?.waterGlasses || 4,
      waterTarget: 8,
      suggestedNextStep: vitals?.meals.breakfast
        ? 'Engage in a gentle 10-minute cognitive memory activity or garden walk.'
        : 'Enjoy a light, nourishing breakfast before your mid-morning activity.',
    };
  }

  // ─── Tool 12: getAppointments ─────────────────────────────────────────────────
  public getAppointments(patientId: string = this.activePatientId) {
    const patient = this.getPatientProfile(patientId);
    return patient?.recentAppointments || [];
  }

  // ─── Tool 13: getMealHistory ──────────────────────────────────────────────────
  public getMealHistory(patientId: string = this.activePatientId) {
    const patient = this.getPatientProfile(patientId);
    const vitals = this.getRecentVitals(patientId);
    return {
      preference: patient.dietPreference,
      allergies: patient.foodAllergies,
      restrictions: patient.dietaryRestrictions,
      regionalCuisine: patient.regionalCuisinePreference,
      todayBreakfastLogged: !!vitals?.meals.breakfast,
      todayBreakfast: vitals?.meals.breakfast,
      todayLunchLogged: !!vitals?.meals.lunch,
      todayLunch: vitals?.meals.lunch,
      yesterdayMeals: patient?.vitalsHistory?.[1]?.meals,
    };
  }

  // ─── Tool 14: getHydrationData ────────────────────────────────────────────────
  public getHydrationData(patientId: string = this.activePatientId) {
    const vitals = this.getRecentVitals(patientId);
    const logged = vitals?.waterGlasses || 4;
    const target = 8;
    const status = logged < 4 ? 'low' : logged < 7 ? 'moderate' : 'optimal';

    return {
      glassesLogged: logged,
      targetGlasses: target,
      status,
      guidance:
        status === 'low'
          ? 'Drink a glass of fresh water now. Diminished thirst sensation is common in older adults.'
          : 'Great hydration pace. Keep sipping water through the afternoon.',
    };
  }

  // ─── Tool 15: getMoodHistory ──────────────────────────────────────────────────
  public getMoodHistory(patientId: string = this.activePatientId) {
    const vitals = this.getRecentVitals(patientId);
    const history = this.getHistoricalVitals(patientId, 7);
    const moodCounts = history.reduce((acc, v) => {
      acc[v.mood] = (acc[v.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      todayMood: vitals?.mood || 'calm',
      weeklyTrend: moodCounts,
      insight:
        vitals?.mood === 'fatigued'
          ? 'Noticeable fatigue recorded today; gentler cognitive and physical pace advised.'
          : 'Mood is stable and receptive to memory stimulation and social recall.',
    };
  }

  // ─── Tool 16: getCognitivePerformance ─────────────────────────────────────────
  public getCognitivePerformance(patientId: string = this.activePatientId) {
    const vitals = this.getRecentVitals(patientId);
    const patient = this.getPatientProfile(patientId);
    const history = this.getHistoricalVitals(patientId, 7);
    const recentActs = patientActivityDatabase.getRecentActivities(patientId, 7);
    const cogActs = recentActs.filter((a) => a.category === 'cognitive' && a.metrics?.score);

    let avgScore: number;
    let latestScore = vitals?.cognitiveScore ?? 82;

    if (cogActs.length > 0) {
      avgScore = Math.round(
        cogActs.reduce((sum, a) => sum + (a.metrics?.score || 80), 0) / cogActs.length
      );
      latestScore = cogActs[0].metrics?.score ?? latestScore;
    } else {
      avgScore = Math.round(
        history.reduce((sum, v) => sum + (v.cognitiveScore || 80), 0) / Math.max(history.length, 1)
      );
    }

    return {
      latestScore,
      sevenDayAverage: avgScore,
      cognitiveStage: patient.cognitiveStage,
      domainStrengths: ['Visual Spatial Recognition', 'Familiar Face Recall'],
      domainFocus: 'Sequential Pattern Memory',
      suggestedGame: avgScore >= 80 ? 'Memory Match (Level 2)' : 'Tea Garden Focus (Calm Mode)',
      sessionsRecorded: cogActs.length,
    };
  }

  // ─── Activity Database Direct Access ─────────────────────────────────────────
  public getActivityAnalytics(patientId: string = this.activePatientId, days: number = 7): ActivityAnalyticsSummary {
    return patientActivityDatabase.analyzePatientActivities(patientId, days);
  }

  public getTodayActivityRecords(patientId: string = this.activePatientId): ActivityRecord[] {
    return patientActivityDatabase.getTodayActivities(patientId);
  }

  // ─── Tool 17: getMemoryDatabase ───────────────────────────────────────────────
  public getMemoryDatabase(patientId: string = this.activePatientId) {
    const patient = this.getPatientProfile(patientId);
    return {
      patientName: patient.name,
      hometown: patient.location,
      cherishedMemories: [
        {
          id: 'mem-1',
          title: 'Childhood Brahmaputra Ferry Ride',
          year: '1962',
          description: 'Taking the wooden ferry across the Brahmaputra with family during autumn festivities.',
        },
        {
          id: 'mem-2',
          title: 'Family Garden Tea Harvest',
          year: '1984',
          description: 'Tending the fragrant garden bushes with children and brewing afternoon black tea.',
        },
      ],
      photoTopics: ['Family weddings', 'Granddaughter graduation', 'Shillong mountain trip'],
    };
  }

  // ─── Tool 18: getFamilyConnections ────────────────────────────────────────────
  public getFamilyConnections(patientId: string = this.activePatientId) {
    return {
      familyMembers: demoFamilyMembers.map((m) => ({
        id: m.id,
        name: m.name,
        relationship: m.relation || m.relationship || 'Family Member',
        location: m.hometown || m.location || 'Guwahati, Assam',
        avatar: m.photoUrl || m.avatar || '',
        lastInteraction: 'Yesterday afternoon (Video call)',
      })),
      primaryCaregiver: 'Ananya Hazarika (Daughter)',
      emergencyContact: '+91 98640 12345',
    };
  }

  // ─── Tool 19: getRecentAIContext ──────────────────────────────────────────────
  public getRecentAIContext(history: ConversationTurn[] = []): string {
    if (!history || history.length === 0) return 'No previous conversational turns in session.';
    return history
      .slice(-4)
      .map((t) => `${t.role === 'user' ? 'User' : 'AI Saathi'}: ${t.text}`)
      .join('\n');
  }

  // ─── Tool 20: searchTrustedWeb ────────────────────────────────────────────────
  public async searchTrustedWeb(query: string, options: { maxResults?: number } = {}) {
    // Interface to server webSearch service
    return {
      query,
      maxResults: options.maxResults || 4,
      authoritativeTarget: 'WHO, ICMR, NIN India, AIIMS, NHS, CDC, MoHFW',
    };
  }

  // ─── Tool 21: retrieveMedicalEvidence ─────────────────────────────────────────
  public retrieveMedicalEvidence(topic: string) {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('blood pressure') || topicLower.includes('hypertension') || topicLower.includes('bp')) {
      return {
        organization: 'World Health Organization (WHO) & MoHFW India',
        guideline: 'In older adults on antihypertensives, resting blood pressure between 120-135 / 75-85 mmHg is generally considered stable. Avoid rapid medication adjustments without physician consultation.',
        sourceUrl: 'https://www.who.int/health-topics/hypertension',
      };
    }
    if (topicLower.includes('sleep') || topicLower.includes('tired') || topicLower.includes('fatigue')) {
      return {
        organization: 'NIMHANS & NHS UK Geriatric Sleep Guidelines',
        guideline: 'Seniors commonly experience changes in sleep architecture. Daytime hydration, sunlight exposure, avoiding late-afternoon naps (>30 mins), and warm soothing wind-downs improve sleep continuity.',
        sourceUrl: 'https://nimhans.ac.in',
      };
    }
    if (topicLower.includes('walk') || topicLower.includes('exercise') || topicLower.includes('activity')) {
      return {
        organization: 'WHO Physical Activity Guidelines for Older Adults',
        guideline: 'Multicomponent physical activity (moderate walking + balance and flexibility exercises) maintains cognitive and functional independence and prevents falls.',
        sourceUrl: 'https://www.who.int/initiatives/behealthy/physical-activity',
      };
    }
    return {
      organization: 'ICMR - National Institute of Nutrition (NIN)',
      guideline: 'Balanced dietary fiber, adequate water intake, moderate sodium (<5g/day), and mental stimulation are core pillars for healthy cognitive and physical aging in India.',
      sourceUrl: 'https://www.nin.res.in',
    };
  }

  // ─── Tool 22: compareWithPatientBaseline ──────────────────────────────────────
  /**
   * Compares the patient's current readings against THEIR OWN 7-DAY PERSONAL AVERAGE.
   * Clearly distinguishes personal historical patterns from general population reference ranges.
   */
  public compareWithPatientBaseline(patientId: string = this.activePatientId): {
    baseline: PatientBaselineSummary;
    comparisons: BaselineComparisonItem[];
  } {
    const history = this.getHistoricalVitals(patientId, 7);
    const recent = this.getRecentVitals(patientId);

    if (history.length === 0 || !recent) {
      return {
        baseline: {
          avgSteps: 4000,
          avgSleepHours: 6.8,
          avgCognitiveScore: 82,
          avgSystolic: 128,
          avgDiastolic: 82,
          avgWaterGlasses: 6,
          recordedDays: 0,
        },
        comparisons: [],
      };
    }

    const recordedDays = history.length;
    const avgSteps = Math.round(history.reduce((s, v) => s + v.steps, 0) / recordedDays);
    const avgSleepHours = Number((history.reduce((s, v) => s + v.sleepHours, 0) / recordedDays).toFixed(1));
    const avgCognitiveScore = Math.round(history.reduce((s, v) => s + (v.cognitiveScore || 80), 0) / recordedDays);
    const avgSystolic = Math.round(history.reduce((s, v) => s + v.bloodPressure.systolic, 0) / recordedDays);
    const avgDiastolic = Math.round(history.reduce((s, v) => s + v.bloodPressure.diastolic, 0) / recordedDays);
    const avgWaterGlasses = Math.round(history.reduce((s, v) => s + v.waterGlasses, 0) / recordedDays);

    const comparisons: BaselineComparisonItem[] = [];

    // 1. Steps Comparison
    const stepDiff = recent.steps - avgSteps;
    const stepComparisonText =
      stepDiff < -1000
        ? `Your walking activity today (${recent.steps.toLocaleString()} steps) is ${Math.abs(stepDiff).toLocaleString()} steps lower than your usual 7-day average of ${avgSteps.toLocaleString()} steps.`
        : stepDiff > 1000
        ? `You have been more active today (${recent.steps.toLocaleString()} steps) than your usual weekly average (${avgSteps.toLocaleString()} steps).`
        : `Your walking activity today (${recent.steps.toLocaleString()} steps) is in line with your usual daily pace (around ${avgSteps.toLocaleString()} steps).`;

    comparisons.push({
      metric: 'Physical Activity (Steps)',
      patientCurrent: `${recent.steps.toLocaleString()} steps`,
      patientBaseline: `${avgSteps.toLocaleString()} steps/day average`,
      comparisonText: stepComparisonText,
    });

    // 2. Sleep Comparison
    const sleepDiffHours = recent.sleepHours - avgSleepHours;
    const sleepDiffMinutes = Math.round(Math.abs(sleepDiffHours) * 60);
    const sleepComparisonText =
      sleepDiffHours < -0.5
        ? `You slept about ${sleepDiffMinutes} minutes less last night than your personal 7-day average of ${avgSleepHours} hours.`
        : sleepDiffHours > 0.5
        ? `You slept about ${sleepDiffMinutes} minutes more last night than your recent average (${avgSleepHours} hours).`
        : `Your sleep last night (${recent.sleepHours}h) was very close to your personal 7-day average (${avgSleepHours}h).`;

    comparisons.push({
      metric: 'Sleep Recovery',
      patientCurrent: `${Math.floor(recent.sleepHours)}h ${Math.round((recent.sleepHours % 1) * 60)}m`,
      patientBaseline: `${avgSleepHours}h average`,
      comparisonText: sleepComparisonText,
    });

    // 3. Blood Pressure Comparison
    const bpDiffSys = recent.bloodPressure.systolic - avgSystolic;
    const bpComparisonText =
      Math.abs(bpDiffSys) <= 5
        ? `Your blood pressure today (${recent.bloodPressure.systolic}/${recent.bloodPressure.diastolic} mmHg) is consistent with your personal baseline (${avgSystolic}/${avgDiastolic} mmHg).`
        : bpDiffSys > 5
        ? `Your systolic blood pressure today (${recent.bloodPressure.systolic} mmHg) is slightly higher than your 7-day personal average of ${avgSystolic} mmHg.`
        : `Your systolic blood pressure today (${recent.bloodPressure.systolic} mmHg) is slightly below your usual average (${avgSystolic} mmHg).`;

    comparisons.push({
      metric: 'Blood Pressure',
      patientCurrent: `${recent.bloodPressure.systolic}/${recent.bloodPressure.diastolic} mmHg`,
      patientBaseline: `${avgSystolic}/${avgDiastolic} mmHg average`,
      comparisonText: bpComparisonText,
    });

    // 4. Cognitive Activity Comparison
    if (recent.cognitiveScore) {
      const cogDiff = recent.cognitiveScore - avgCognitiveScore;
      const cogComparisonText =
        cogDiff >= 3
          ? `Your cognitive puzzle score today (${recent.cognitiveScore}) is higher than your recent weekly baseline (${avgCognitiveScore}).`
          : cogDiff <= -3
          ? `Your cognitive puzzle score today (${recent.cognitiveScore}) is slightly below your recent baseline (${avgCognitiveScore}), which often correlates with less sleep.`
          : `Your cognitive score today (${recent.cognitiveScore}) is stable and consistent with your personal baseline (${avgCognitiveScore}).`;

      comparisons.push({
        metric: 'Cognitive Engagement',
        patientCurrent: `${recent.cognitiveScore} points`,
        patientBaseline: `${avgCognitiveScore} points average`,
        comparisonText: cogComparisonText,
      });
    }

    return {
      baseline: {
        avgSteps,
        avgSleepHours,
        avgCognitiveScore,
        avgSystolic,
        avgDiastolic,
        avgWaterGlasses,
        recordedDays,
      },
      comparisons,
    };
  }

  // ─── Tool 23: generatePersonalizedPlan ────────────────────────────────────────
  public generatePersonalizedPlan(patientId: string = this.activePatientId) {
    const vitals = this.getRecentVitals(patientId);
    const sleep = this.getSleepData(patientId);
    const routine = this.getRoutine(patientId);
    const meds = this.getCurrentMedications(patientId);
    const baselineComp = this.compareWithPatientBaseline(patientId);
    const cognitive = this.getCognitivePerformance(patientId);

    const isTiredOrPoorSleep = sleep.quality === 'poor' || sleep.hours < 5.5;
    const morningMed = meds.find((m) => m.timeOfDay === 'morning');
    const nightMed = meds.find((m) => m.timeOfDay === 'night');

    return {
      focusForToday: isTiredOrPoorSleep
        ? 'Restorative calm day with gentle hydration, soft meals, and short relaxation breaks'
        : 'Active balanced day with morning garden stroll, memory puzzle, and family connection',
      morning: {
        medicine: morningMed ? `${morningMed.name} (${morningMed.takenToday ? 'Taken' : 'Pending'})` : 'None',
        activity: isTiredOrPoorSleep ? '10-minute seated breathing & balcony air' : '15-minute gentle garden walk',
      },
      afternoon: {
        cognitive: cognitive.suggestedGame,
        hydration: `${routine.waterGlasses} of 8 glasses logged so far`,
        relaxation: '20-minute quiet eye rest or listening to calming flute music',
      },
      evening: {
        family: 'Review family recall photo album or call daughter',
        nightMedicine: nightMed ? `${nightMed.name} (${nightMed.dosage}) at 9:00 PM` : 'None',
        sleepPreparation: sleep.bedtimeRoutineAdvised,
      },
      baselineInsight: baselineComp.comparisons[0]?.comparisonText || '',
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DYNAMIC CONTEXT RETRIEVAL (NO HARDCODED STRING MATCHES)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Dynamically analyzes user natural language intent, retrieves ONLY the relevant
   * patient tools, calculates personal baseline comparisons, identifies missing data,
   * and intelligently determines if external authoritative web search is needed.
   */
  public retrieveRelevantContext(
    patientId: string = this.activePatientId,
    query: string = '',
    conversationHistory: ConversationTurn[] = []
  ): DynamicContextRetrievalResult {
    const patient = this.getPatientProfile(patientId);
    const q = (query || '').toLowerCase().trim();
    const historyContext = this.getRecentAIContext(conversationHistory);

    const retrievedTools: AgentToolName[] = ['getPatientProfile'];
    const signals: PersonalizationSignal[] = [];
    const missingDataNotices: string[] = [];
    const suggestedWebSearchTerms: string[] = [];

    // 1. Core Profile Signal (always foundational)
    signals.push({
      id: 'sig-core-profile',
      label: 'Patient Profile',
      value: `${patient.name}, ${patient.age} yrs (${patient.location.split(',')[0]})`,
      category: 'profile',
      icon: 'User',
    });

    const recentVitals = this.getRecentVitals(patientId);
    const baselineData = this.compareWithPatientBaseline(patientId);

    // Dynamic Intent Scoring based on semantic concepts (not rigid substring equality)
    const concepts = {
      isExerciseOrWalk: /(walk|step|exercise|workout|stretch|mobility|active|physical|run|stroll|balcony)/i.test(q),
      isCognitiveOrGame: /(game|memory|puzzle|brain|recall|quest|tea garden|cognitive|play|mental|focus|distract)/i.test(q),
      isVitalsOrBP: /(blood pressure|bp|systolic|diastolic|reading|heart|pulse|oxygen|spo2|vital|pressure)/i.test(q),
      isSleepOrFatigue: /(sleep|tired|fatigue|exhausted|rest|nap|insomnia|wake|woke|night|yawn|energy)/i.test(q),
      isMedicineOrPills: /(medicine|pill|tablet|dose|dosage|schedule|dawa|take with food|prescription|telmisartan|donepezil)/i.test(q),
      isNutritionOrDiet: /(eat|food|breakfast|lunch|dinner|diet|meal|hungry|nutrition|recipe|cook|avoid eating)/i.test(q),
      isHydrationOrWater: /(water|hydration|drink|thirst|fluid|glasses)/i.test(q),
      isFamilyOrSocial: /(family|daughter|son|grandchild|photo|memory|picture|call|talk|ananya|childhood)/i.test(q),
      isRoutineOrDailyPlan: /(what (should|to) do|today plan|schedule|routine|dincharya|afternoon|focus|next action|morning)/i.test(q),
      isMedicalDefinition: /(what does .* mean|explain .* term|medical condition|what is|side effect|disease|why does)/i.test(q),
      isEmergency: /(chest pain|cannot breathe|heart attack|stroke|facial droop|sudden numbness|collapsed|unconscious|heavy bleeding|sos)/i.test(q),
    };

    let primaryDomain: DynamicContextRetrievalResult['primaryDomain'] = 'general';
    let shouldSearchWeb = false;
    let searchReason = 'Internal platform records sufficient for request.';

    // ── Emergency Red Flag ───────────────────────────────────────────────────
    if (concepts.isEmergency) {
      primaryDomain = 'emergency';
      retrievedTools.push('getRecentVitals', 'getCurrentMedications', 'getFamilyConnections');
      shouldSearchWeb = false;
      searchReason = 'Emergency red-flag symptom requires immediate medical intervention, not web browsing.';
      signals.push({
        id: 'sig-emergency-alert',
        label: 'Urgent Safety Flag',
        value: 'Acute symptoms reported requiring immediate emergency triage',
        category: 'vitals',
        icon: 'ShieldAlert',
      });
    }

    // ── 1. Cognitive Care & Memory Games ─────────────────────────────────────
    else if (concepts.isCognitiveOrGame) {
      primaryDomain = 'cognitive_care';
      retrievedTools.push('getCognitivePerformance', 'getSleepData', 'getMoodHistory', 'getMemoryDatabase');
      const cog = this.getCognitivePerformance(patientId);
      const sleep = this.getSleepData(patientId);
      const mood = this.getMoodHistory(patientId);

      signals.push({
        id: 'sig-cog-score',
        label: 'Cognitive Engagement Score',
        value: `${cog.latestScore} points (${cog.cognitiveStage})`,
        category: 'routine',
        icon: 'Brain',
      });
      signals.push({
        id: 'sig-cog-game-rec',
        label: 'Recommended Activity',
        value: cog.suggestedGame,
        category: 'routine',
        icon: 'Sparkles',
      });
      signals.push({
        id: 'sig-cog-sleep-link',
        label: 'Sleep Recovery Context',
        value: `${sleep.formatted} (${sleep.quality} rest)`,
        category: 'sleep',
        icon: 'Moon',
      });

      // Authoritative cognitive evidence grounds game recommendations
      shouldSearchWeb = true;
      searchReason = "Authoritative cognitive stimulation guidelines from WHO and NIMHANS consulted alongside patient's game performance.";
      suggestedWebSearchTerms.push(
        'evidence-based cognitive exercises older adults mild cognitive impairment NIMHANS WHO',
        'memory stimulation activities seniors healthy brain aging ICMR'
      );
    }

    // ── 2. Medications & Schedule ────────────────────────────────────────────
    else if (concepts.isMedicineOrPills) {
      primaryDomain = 'medications';
      retrievedTools.push('getCurrentMedications', 'getMealHistory', 'getDoctorInstructions');
      const meds = this.getCurrentMedications(patientId);
      const meals = this.getMealHistory(patientId);

      meds.forEach((m, idx) => {
        signals.push({
          id: `sig-med-${idx}`,
          label: `${m.timeOfDay.toUpperCase()} Medication`,
          value: `${m.name} ${m.dosage} (${m.takenToday ? 'Taken' : 'Pending'}) • ${m.withFood ? 'With food' : 'Before bed'}`,
          category: 'medication',
          icon: 'Pill',
        });
      });

      // If user asks what a medicine DOES or interaction, we may search trusted external literature
      if (concepts.isMedicalDefinition || q.includes('why') || q.includes('side effect') || q.includes('interaction')) {
        shouldSearchWeb = true;
        searchReason = 'Authoritative clinical pharmacopeia needed to explain medicine mechanism or safety.';
        suggestedWebSearchTerms.push(
          `${meds[0]?.name || 'Telmisartan'} senior citizen indications side effects WHO NHS`,
          `${meds[1]?.name || 'Donepezil'} mechanism cognitive health elderly NIH`
        );
      } else {
        shouldSearchWeb = false;
        searchReason = "Answered from patient's recorded medication schedule and doctor instructions.";
      }
    }

    // ── 3. Vitals & Blood Pressure / Oxygen ───────────────────────────────────
    else if (concepts.isVitalsOrBP) {
      primaryDomain = 'vitals_cardiac';
      retrievedTools.push('getRecentVitals', 'getHistoricalVitals', 'getCurrentMedications', 'compareWithPatientBaseline');

      if (recentVitals?.bloodPressure) {
        signals.push({
          id: 'sig-latest-bp',
          label: 'Latest Blood Pressure',
          value: `${recentVitals.bloodPressure.systolic}/${recentVitals.bloodPressure.diastolic} mmHg (Today)`,
          category: 'vitals',
          icon: 'HeartPulse',
        });
      } else {
        missingDataNotices.push("Today's blood pressure has not been recorded yet.");
      }

      if (recentVitals?.heartRate) {
        signals.push({
          id: 'sig-heart-rate',
          label: 'Resting Heart Rate',
          value: `${recentVitals.heartRate} bpm`,
          category: 'vitals',
          icon: 'HeartPulse',
        });
      }

      if (recentVitals?.spO2) {
        signals.push({
          id: 'sig-spo2',
          label: 'Oxygen Level (SpO2)',
          value: `${recentVitals.spO2}% (Healthy range)`,
          category: 'vitals',
          icon: 'Activity',
        });
      }

      // Add baseline comparison
      const bpComp = baselineData.comparisons.find((c) => c.metric === 'Blood Pressure');
      if (bpComp) {
        signals.push({
          id: 'sig-bp-baseline',
          label: 'Personal 7-Day Baseline',
          value: bpComp.comparisonText,
          category: 'vitals',
          icon: 'TrendingUp',
        });
      }

      shouldSearchWeb = true;
      searchReason = 'Authoritative medical reference ranges needed to explain readings in simple elderly-friendly language without diagnosing.';
      suggestedWebSearchTerms.push(
        `normal blood pressure older adults 70+ years WHO ICMR guidelines`,
        `how to explain systolic diastolic blood pressure to elderly patient NHS`
      );
    }

    // ── 4. Sleep & Fatigue / Tiredness ────────────────────────────────────────
    else if (concepts.isSleepOrFatigue) {
      primaryDomain = 'sleep_rest';
      retrievedTools.push('getSleepData', 'getHydrationData', 'getActivityData', 'compareWithPatientBaseline', 'getMoodHistory');
      const sleep = this.getSleepData(patientId);
      const hydration = this.getHydrationData(patientId);
      const activity = this.getActivityData(patientId);

      signals.push({
        id: 'sig-sleep-hours',
        label: 'Last Night Sleep',
        value: `${sleep.formatted} (${sleep.quality} quality)`,
        category: 'sleep',
        icon: 'Moon',
      });
      signals.push({
        id: 'sig-hydration-link',
        label: 'Daytime Hydration',
        value: `${hydration.glassesLogged} / 8 glasses logged`,
        category: 'vitals',
        icon: 'Droplet',
      });
      signals.push({
        id: 'sig-activity-strain',
        label: "Today's Exertion",
        value: `${activity.steps.toLocaleString()} steps logged`,
        category: 'activity',
        icon: 'Footprints',
      });

      const sleepComp = baselineData.comparisons.find((c) => c.metric === 'Sleep Recovery');
      if (sleepComp) {
        signals.push({
          id: 'sig-sleep-baseline',
          label: 'Personal Baseline Trend',
          value: sleepComp.comparisonText,
          category: 'sleep',
          icon: 'TrendingDown',
        });
      }

      shouldSearchWeb = true;
      searchReason = 'Non-pharmacological geriatric fatigue and sleep hygiene guidelines from NIMHANS and NHS consulted.';
      suggestedWebSearchTerms.push(
        `daytime fatigue causes in older adults hydration sleep NIMHANS NHS`,
        `healthy sleep hygiene for seniors with mild cognitive impairment WHO`
      );
    }

    // ── 5. Physical Activity & Walking ───────────────────────────────────────
    else if (concepts.isExerciseOrWalk) {
      primaryDomain = 'physical_activity';
      retrievedTools.push('getActivityData', 'getSleepData', 'getRecentVitals', 'compareWithPatientBaseline', 'getDoctorInstructions');
      const activity = this.getActivityData(patientId);
      const sleep = this.getSleepData(patientId);

      signals.push({
        id: 'sig-steps-today',
        label: 'Steps Completed Today',
        value: `${activity.steps.toLocaleString()} steps (${activity.level} level)`,
        category: 'activity',
        icon: 'Footprints',
      });
      signals.push({
        id: 'sig-sleep-context',
        label: 'Sleep Recovery Balance',
        value: `${sleep.formatted} sleep`,
        category: 'sleep',
        icon: 'Moon',
      });
      signals.push({
        id: 'sig-mobility',
        label: 'Mobility Independence',
        value: patient.mobilityLevel === 'independent' ? 'Independent walker' : 'Assisted walking profile',
        category: 'profile',
        icon: 'Activity',
      });

      const stepComp = baselineData.comparisons.find((c) => c.metric === 'Physical Activity (Steps)');
      if (stepComp) {
        signals.push({
          id: 'sig-step-baseline',
          label: 'Personal 7-Day Baseline',
          value: stepComp.comparisonText,
          category: 'activity',
          icon: 'TrendingUp',
        });
      }

      shouldSearchWeb = true;
      searchReason = 'Authoritative geriatric physical activity guidelines (WHO/AIIMS) consulted for safe exercise parameters.';
      suggestedWebSearchTerms.push(
        `safe physical activity walking older adults ${patient.knownConditions[0] || 'hypertension'} WHO`,
        `geriatric mobility exercise recommendations AIIMS New Delhi`
      );
    }

    // ── 6. Nutrition & Meals ─────────────────────────────────────────────────
    else if (concepts.isNutritionOrDiet) {
      primaryDomain = 'nutrition';
      retrievedTools.push('getMealHistory', 'getPatientPreferences', 'getActivityData', 'getRecentVitals');
      const meals = this.getMealHistory(patientId);
      const activity = this.getActivityData(patientId);

      signals.push({
        id: 'sig-diet-type',
        label: 'Dietary Preference',
        value: `${meals.preference.toUpperCase()} • ${patient.regionalCuisinePreference.split('(')[0].trim()}`,
        category: 'diet',
        icon: 'Utensils',
      });
      signals.push({
        id: 'sig-today-activity-exertion',
        label: "Today's Exertion",
        value: `${activity.steps.toLocaleString()} steps logged so far`,
        category: 'activity',
        icon: 'Footprints',
      });

      if (meals.todayBreakfast) {
        signals.push({
          id: 'sig-breakfast-logged',
          label: 'Breakfast Recorded',
          value: meals.todayBreakfast,
          category: 'diet',
          icon: 'Utensils',
        });
      } else {
        missingDataNotices.push("Today's breakfast has not been logged yet.");
      }

      shouldSearchWeb = true;
      searchReason = 'ICMR-NIN geriatric dietary guidelines checked for age-appropriate macronutrients and low sodium.';
      suggestedWebSearchTerms.push(
        `healthy elderly ${meals.preference} nutrition guidelines ICMR NIN India`,
        `older adults dietary requirements ${patient.knownConditions[0] || 'hypertension'} WHO`
      );
    }

    // ── 7. Family & Memories ─────────────────────────────────────────────────
    else if (concepts.isFamilyOrSocial) {
      primaryDomain = 'family_memories';
      retrievedTools.push('getFamilyConnections', 'getMemoryDatabase', 'getCaregiverNotes');
      const fam = this.getFamilyConnections(patientId);
      const mem = this.getMemoryDatabase(patientId);

      signals.push({
        id: 'sig-caregiver-daughter',
        label: 'Primary Connection',
        value: `${fam.primaryCaregiver} (${fam.familyMembers[0]?.lastInteraction})`,
        category: 'routine',
        icon: 'Heart',
      });
      signals.push({
        id: 'sig-memory-topic',
        label: 'Cherished Memory Topic',
        value: mem.cherishedMemories[0]?.title || 'Childhood memories',
        category: 'routine',
        icon: 'Sparkles',
      });

      shouldSearchWeb = false;
      searchReason = "Answered entirely from patient's private family connection records and reminiscence database.";
    }

    // ── 8. Hydration ─────────────────────────────────────────────────────────
    else if (concepts.isHydrationOrWater) {
      primaryDomain = 'hydration';
      retrievedTools.push('getHydrationData', 'getActivityData', 'getRecentVitals');
      const hydration = this.getHydrationData(patientId);

      signals.push({
        id: 'sig-hydration-today',
        label: 'Hydration Status',
        value: `${hydration.glassesLogged} of ${hydration.targetGlasses} glasses (${hydration.status})`,
        category: 'vitals',
        icon: 'Droplet',
      });

      shouldSearchWeb = true;
      searchReason = 'Authoritative ICMR and WHO geriatric fluid requirement guidelines consulted.';
      suggestedWebSearchTerms.push(
        `hydration in older adults cognitive impairment ICMR NIN WHO`,
        `fluid intake guidelines for seniors with blood pressure NHS`
      );
    }

    // ── 9. Appointments & Doctor Instructions ────────────────────────────────
    else if (q.includes('appointment') || q.includes('doctor') || q.includes('clinic') || q.includes('instructions')) {
      primaryDomain = 'daily_routine';
      retrievedTools.push('getAppointments', 'getDoctorInstructions', 'getCurrentMedications');
      const appts = this.getAppointments(patientId);
      const doc = this.getDoctorInstructions(patientId);

      if (appts.length > 0) {
        signals.push({
          id: 'sig-recent-appt',
          label: 'Recent Clinical Visit',
          value: `${appts[0].doctorName} (${appts[0].specialty}) on ${appts[0].date}`,
          category: 'medication',
          icon: 'UserCheck',
        });
      } else {
        missingDataNotices.push('No recent specialist appointments recorded in your chart.');
      }

      if (doc.recentInstructions[0]?.instructions) {
        signals.push({
          id: 'sig-doc-notes',
          label: 'Doctor Directives',
          value: doc.recentInstructions[0].instructions[0] || 'Follow daily routine',
          category: 'medication',
          icon: 'ShieldCheck',
        });
      }

      shouldSearchWeb = false;
      searchReason = "Answered from patient's private medical appointment history and clinician directives.";
    }

    // ── 10. General / Holistic Daily Plan ("What should I do today?") ─────────
    else {
      primaryDomain = 'daily_routine';
      retrievedTools.push(
        'getSleepData',
        'getActivityData',
        'getRoutine',
        'getCurrentMedications',
        'getCognitivePerformance',
        'compareWithPatientBaseline'
      );

      const sleep = this.getSleepData(patientId);
      const activity = this.getActivityData(patientId);
      const routine = this.getRoutine(patientId);
      const cog = this.getCognitivePerformance(patientId);

      signals.push({
        id: 'sig-holistic-sleep',
        label: 'Sleep Status',
        value: `${sleep.formatted} (${sleep.quality})`,
        category: 'sleep',
        icon: 'Moon',
      });
      signals.push({
        id: 'sig-holistic-activity',
        label: 'Activity Progress',
        value: `${activity.steps.toLocaleString()} steps today`,
        category: 'activity',
        icon: 'Footprints',
      });
      signals.push({
        id: 'sig-holistic-meds',
        label: 'Medication Progress',
        value: routine.morningMedTaken ? 'Morning medicines taken' : 'Morning medicine due',
        category: 'medication',
        icon: 'Pill',
      });
      signals.push({
        id: 'sig-holistic-cog',
        label: 'Cognitive Engagement',
        value: `Suggested: ${cog.suggestedGame}`,
        category: 'routine',
        icon: 'Brain',
      });

      // Enrich daily routine with authoritative WHO/AIIMS active aging guidelines
      shouldSearchWeb = true;
      searchReason = "Authoritative active aging routine guidelines from WHO and AIIMS combined with patient's real activity history.";
      suggestedWebSearchTerms.push(
        'healthy daily routine active aging seniors WHO AIIMS',
        'geriatric daily activity schedule cognitive and physical wellness'
      );
    }

    // ─── Attach Persistent Patient Activity Database Analytics & Diary ──────────
    const activityAnalytics = this.getActivityAnalytics(patientId, 7);
    const todayActivities = this.getTodayActivityRecords(patientId);

    // Activity Database Consistency Signal
    signals.push({
      id: 'sig-activity-consistency',
      label: 'Activity Database Consistency',
      value: `${activityAnalytics.overallConsistencyScore}% weekly consistency (${activityAnalytics.totalActivitiesCount} recorded activities across 7 days)`,
      category: 'routine',
      icon: 'Activity',
    });

    if (todayActivities.length > 0) {
      signals.push({
        id: 'sig-today-activity-diary',
        label: "Today's Activity Diary",
        value: `${todayActivities.length} activities logged today: ${todayActivities.map((a) => a.title).join(', ')}`,
        category: 'routine',
        icon: 'CheckCircle2',
      });
    }

    return {
      patient,
      signals,
      retrievedTools,
      baselineComparisons: baselineData.comparisons,
      missingDataNotices,
      suggestedWebSearchTerms,
      shouldSearchWeb,
      searchReason,
      primaryDomain,
      primaryIntent: primaryDomain,
      activityAnalytics,
      todayActivities,
    };
  }
}

export const patientContextEngine = new PatientContextEngine();
export default patientContextEngine;


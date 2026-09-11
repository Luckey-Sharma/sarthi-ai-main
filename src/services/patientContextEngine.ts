import {
  PatientHealthRecord,
  VitalsReading,
  MedicationSchedule,
  PersonalizationSignal,
  DemoScenarioId
} from '../types/healthCompanion';
import { demoPatientHealthRecords, DEMO_SCENARIO_CONFIGS } from './demoHealthData';

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

  // ─── Tool 1: Patient Profile ───────────────────────────────────────────────
  public getPatientProfile(patientId: string = this.activePatientId): PatientHealthRecord | null {
    return demoPatientHealthRecords[patientId] || demoPatientHealthRecords['pat-1'];
  }

  // ─── Tool 2: Health Conditions ─────────────────────────────────────────────
  public getHealthConditions(patientId: string = this.activePatientId): string[] {
    const patient = this.getPatientProfile(patientId);
    return patient?.knownConditions || [];
  }

  // ─── Tool 3: Current Medications ───────────────────────────────────────────
  public getCurrentMedications(patientId: string = this.activePatientId): MedicationSchedule[] {
    const patient = this.getPatientProfile(patientId);
    return patient?.currentMedications || [];
  }

  // ─── Tool 4: Recent Vitals ─────────────────────────────────────────────────
  public getRecentVitals(patientId: string = this.activePatientId): VitalsReading | null {
    const patient = this.getPatientProfile(patientId);
    return patient?.vitalsHistory?.[0] || null;
  }

  // ─── Tool 5: 7-Day Vitals History ──────────────────────────────────────────
  public getVitalsHistory(patientId: string = this.activePatientId, days: number = 7): VitalsReading[] {
    const patient = this.getPatientProfile(patientId);
    return (patient?.vitalsHistory || []).slice(0, days);
  }

  // ─── Tool 6: Today's Physical Activity ────────────────────────────────────
  public getTodayActivity(patientId: string = this.activePatientId): {
    steps: number;
    level: 'low' | 'moderate' | 'active';
    description: string;
  } {
    const vitals = this.getRecentVitals(patientId);
    const steps = vitals?.steps ?? 1500;
    const level = steps < 2500 ? 'low' : steps < 5000 ? 'moderate' : 'active';
    const description =
      level === 'low'
        ? `Light morning activity (${steps.toLocaleString()} steps logged today)`
        : level === 'moderate'
        ? `Moderate activity (${steps.toLocaleString()} steps today)`
        : `High physical activity (${steps.toLocaleString()} steps completed this morning)`;

    return { steps, level, description };
  }

  // ─── Tool 7: Sleep Data ────────────────────────────────────────────────────
  public getSleepData(patientId: string = this.activePatientId): {
    hours: number;
    formatted: string;
    quality: 'restful' | 'fair' | 'poor';
    note: string;
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

    return { hours, formatted, quality, note };
  }

  // ─── Tool 8: Meal History & Dietary Preferences ────────────────────────────
  public getMealHistory(patientId: string = this.activePatientId) {
    const patient = this.getPatientProfile(patientId);
    const vitals = this.getRecentVitals(patientId);
    return {
      preference: patient?.dietPreference || 'vegetarian',
      allergies: patient?.foodAllergies || [],
      restrictions: patient?.dietaryRestrictions || [],
      regionalCuisine: patient?.regionalCuisinePreference || 'North-East Indian cuisine',
      todayBreakfastLogged: !!vitals?.meals.breakfast,
      todayBreakfast: vitals?.meals.breakfast,
      yesterdayMeals: patient?.vitalsHistory?.[1]?.meals,
    };
  }

  // ─── Tool 9: Daily Routine Status ──────────────────────────────────────────
  public getDailyRoutine(patientId: string = this.activePatientId) {
    const vitals = this.getRecentVitals(patientId);
    const meds = this.getCurrentMedications(patientId);
    const morningMed = meds.find((m) => m.timeOfDay === 'morning');
    return {
      routineCompleted: !!vitals?.routineCompleted,
      morningMedTaken: morningMed ? morningMed.takenToday : true,
      waterGlasses: vitals?.waterGlasses || 4,
      waterTarget: 8,
      recommendedNextStep: vitals?.meals.breakfast
        ? 'Take 10 minutes of light garden relaxation and try the Memory Match game'
        : 'Have a nourishing, light breakfast before taking your mid-morning activity',
    };
  }

  // ─── Tool 10: Cognitive Activity ───────────────────────────────────────────
  public getCognitiveActivity(patientId: string = this.activePatientId) {
    const vitals = this.getRecentVitals(patientId);
    return {
      latestScore: vitals?.cognitiveScore ?? 82,
      domain: 'Visual Spatial & Attention',
      status: 'Stable pattern consistent with personal baseline',
    };
  }

  // ─── Tool 11: Caregiver Notes ──────────────────────────────────────────────
  public getCaregiverNotes(patientId: string = this.activePatientId): string {
    return this.getPatientProfile(patientId)?.caregiverNotes || '';
  }

  // ─── Tool 12: Doctor Notes & Instructions ──────────────────────────────────
  public getDoctorNotes(patientId: string = this.activePatientId): string {
    const patient = this.getPatientProfile(patientId);
    const instructions = patient?.doctorInstructions?.[0]?.instructions.join('; ') || '';
    return `${patient?.doctorNotes || ''} Instructions: ${instructions}`.trim();
  }

  // ─── Selective Context Retrieval for Any User Query ─────────────────────────
  /**
   * Intelligently queries only the needed tools according to the user's question,
   * extracting specific PersonalizationSignals and preparing clean RAG parameters.
   */
  public retrieveRelevantContext(patientId: string = this.activePatientId, query: string): {
    patient: PatientHealthRecord;
    signals: PersonalizationSignal[];
    retrievedTools: string[];
    suggestedWebSearchTerms: string[];
    primaryIntent: 'diet' | 'activity' | 'vitals' | 'sleep' | 'hydration' | 'medication' | 'routine' | 'general';
  } {
    const patient = this.getPatientProfile(patientId) || demoPatientHealthRecords['pat-1'];
    const q = (query || '').toLowerCase();

    const retrievedTools: string[] = ['getPatientProfile'];
    const signals: PersonalizationSignal[] = [];

    // Always include core profile signal
    signals.push({
      id: 'sig-age-profile',
      label: 'Age & Senior Profile',
      value: `${patient.age} years old (${patient.location.split(',')[0]})`,
      category: 'profile',
      icon: 'User',
    });

    let primaryIntent: 'diet' | 'activity' | 'vitals' | 'sleep' | 'hydration' | 'medication' | 'routine' | 'general' = 'general';
    const searchTerms: string[] = [];

    // 1. Food / Diet / Breakfast / Lunch / Nutrition
    if (q.includes('eat') || q.includes('food') || q.includes('breakfast') || q.includes('lunch') || q.includes('dinner') || q.includes('diet') || q.includes('hungry') || q.includes('meal') || q.includes('avoid')) {
      primaryIntent = 'diet';
      retrievedTools.push('getMealHistory', 'getTodayActivity', 'getRecentVitals', 'getHealthConditions');

      const mealData = this.getMealHistory(patientId);
      const activity = this.getTodayActivity(patientId);
      const vitals = this.getRecentVitals(patientId);

      signals.push({
        id: 'sig-diet-pref',
        label: 'Dietary Preference',
        value: `${mealData.preference.charAt(0).toUpperCase() + mealData.preference.slice(1)} preference`,
        category: 'diet',
        icon: 'Utensils',
      });

      signals.push({
        id: 'sig-activity-today',
        label: "Today's Activity Level",
        value: `${activity.level === 'low' ? 'Light activity' : 'Active'} (${activity.steps.toLocaleString()} steps)`,
        category: 'activity',
        icon: 'Footprints',
      });

      if (vitals?.bloodPressure) {
        signals.push({
          id: 'sig-bp-context',
          label: 'Blood Pressure Context',
          value: `BP ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg (Low sodium advised)`,
          category: 'vitals',
          icon: 'HeartPulse',
        });
      }

      if (patient.knownConditions.length > 0) {
        signals.push({
          id: 'sig-condition',
          label: 'Health Condition',
          value: patient.knownConditions[0],
          category: 'medication',
          icon: 'ShieldAlert',
        });
      }

      signals.push({
        id: 'sig-regional-cuisine',
        label: 'Cultural Cuisine',
        value: patient.regionalCuisinePreference.split('(')[0].trim(),
        category: 'culture',
        icon: 'Sparkles',
      });

      searchTerms.push(
        `healthy elderly ${mealData.preference} breakfast low sodium ICMR NIN India`,
        `older adult nutrition ${patient.knownConditions[0] || 'hypertension'} WHO guidelines`,
        `Indian senior citizen breakfast ${patient.regionalCuisinePreference.split('/')[0]}`
      );
    }
    // 2. Walking / Exercise / Activity / Workout
    else if (q.includes('walk') || q.includes('exercise') || q.includes('activity') || q.includes('step') || q.includes('workout') || q.includes('stretches') || q.includes('move')) {
      primaryIntent = 'activity';
      retrievedTools.push('getTodayActivity', 'getSleepData', 'getRecentVitals', 'getHealthConditions', 'getDoctorNotes');

      const activity = this.getTodayActivity(patientId);
      const sleep = this.getSleepData(patientId);
      const vitals = this.getRecentVitals(patientId);

      signals.push({
        id: 'sig-steps-today',
        label: 'Steps Completed Today',
        value: `${activity.steps.toLocaleString()} steps (${activity.level} pace)`,
        category: 'activity',
        icon: 'Footprints',
      });

      signals.push({
        id: 'sig-sleep-recovery',
        label: 'Last Night Sleep',
        value: `${sleep.formatted} (${sleep.quality} quality)`,
        category: 'sleep',
        icon: 'Moon',
      });

      signals.push({
        id: 'sig-mobility',
        label: 'Mobility Level',
        value: patient.mobilityLevel === 'independent' ? 'Independent walker' : 'Assisted / cane walking',
        category: 'profile',
        icon: 'Activity',
      });

      if (vitals?.bloodPressure) {
        signals.push({
          id: 'sig-bp-exercise',
          label: 'Current Blood Pressure',
          value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
          category: 'vitals',
          icon: 'HeartPulse',
        });
      }

      searchTerms.push(
        `safe walking exercise elderly ${patient.knownConditions[0] || 'hypertension'} WHO`,
        `senior citizen gentle morning walk physical activity guidelines ICMR AIIMS`
      );
    }
    // 3. Sleep / Tired / Fatigue / Energy
    else if (q.includes('sleep') || q.includes('tired') || q.includes('fatigue') || q.includes('energy') || q.includes('rest') || q.includes('nap') || q.includes('insomnia')) {
      primaryIntent = 'sleep';
      retrievedTools.push('getSleepData', 'getRecentVitals', 'getCurrentMedications', 'getTodayActivity');

      const sleep = this.getSleepData(patientId);
      const vitals = this.getRecentVitals(patientId);
      const activity = this.getTodayActivity(patientId);

      signals.push({
        id: 'sig-sleep-duration',
        label: 'Sleep Duration',
        value: `${sleep.formatted} (${sleep.note})`,
        category: 'sleep',
        icon: 'Moon',
      });

      signals.push({
        id: 'sig-hydration-level',
        label: 'Hydration Log',
        value: `${vitals?.waterGlasses || 4} / 8 glasses today`,
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

      signals.push({
        id: 'sig-mood',
        label: 'Reported Mood / State',
        value: vitals?.mood || 'calm',
        category: 'routine',
        icon: 'Smile',
      });

      searchTerms.push(
        `causes of fatigue in seniors elderly sleep hygiene WHO NHS`,
        `elderly daytime sleepiness hydration cognitive health NIH`
      );
    }
    // 4. Blood Pressure / Heart / Vitals
    else if (q.includes('blood pressure') || q.includes('bp') || q.includes('heart') || q.includes('pulse') || q.includes('hypertension') || q.includes('readings')) {
      primaryIntent = 'vitals';
      retrievedTools.push('getRecentVitals', 'getVitalsHistory', 'getCurrentMedications', 'getDoctorNotes');

      const vitals = this.getRecentVitals(patientId);
      const meds = this.getCurrentMedications(patientId);
      const bpMed = meds.find((m) => m.condition.toLowerCase().includes('blood pressure') || m.condition.toLowerCase().includes('hypertension'));

      if (vitals?.bloodPressure) {
        signals.push({
          id: 'sig-latest-bp',
          label: 'Latest Blood Pressure',
          value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg (Today)`,
          category: 'vitals',
          icon: 'HeartPulse',
        });
      }

      if (bpMed) {
        signals.push({
          id: 'sig-bp-med',
          label: 'Prescribed Medication',
          value: `${bpMed.name} ${bpMed.dosage} (${bpMed.takenToday ? 'Taken today' : 'Pending'})`,
          category: 'medication',
          icon: 'Pill',
        });
      }

      signals.push({
        id: 'sig-diet-salt',
        label: 'Dietary Salt Guidance',
        value: 'Moderate sodium restriction (<5g salt/day)',
        category: 'diet',
        icon: 'Utensils',
      });

      signals.push({
        id: 'sig-resting-hr',
        label: 'Resting Heart Rate',
        value: `${vitals?.heartRate || 72} bpm (Normal range)`,
        category: 'vitals',
        icon: 'HeartPulse',
      });

      searchTerms.push(
        `normal blood pressure range older adults 70+ years WHO ICMR`,
        `explaining blood pressure readings simple terms elderly patient NHS`
      );
    }
    // 5. Water / Hydration / Fluid
    else if (q.includes('water') || q.includes('drink') || q.includes('thirst') || q.includes('hydration') || q.includes('fluid')) {
      primaryIntent = 'hydration';
      retrievedTools.push('getRecentVitals', 'getTodayActivity', 'getHealthConditions', 'getDoctorNotes');

      const vitals = this.getRecentVitals(patientId);
      const activity = this.getTodayActivity(patientId);

      signals.push({
        id: 'sig-water-logged',
        label: 'Water Intake Today',
        value: `${vitals?.waterGlasses || 4} of 8 glasses logged`,
        category: 'vitals',
        icon: 'Droplet',
      });

      signals.push({
        id: 'sig-activity-water',
        label: 'Activity & Sweating Context',
        value: `${activity.steps.toLocaleString()} steps today`,
        category: 'activity',
        icon: 'Footprints',
      });

      signals.push({
        id: 'sig-kidney-bp',
        label: 'Condition Context',
        value: patient.knownConditions[0] || 'General elderly health',
        category: 'medication',
        icon: 'ShieldAlert',
      });

      searchTerms.push(
        `hydration requirements for seniors older adults ICMR NIN WHO`,
        `water intake elderly blood pressure cognitive function NHS`
      );
    }
    // 6. General Health / Activity / What should I do today
    else {
      primaryIntent = 'routine';
      retrievedTools.push('getTodayActivity', 'getSleepData', 'getRecentVitals', 'getDailyRoutine', 'getMealHistory');

      const activity = this.getTodayActivity(patientId);
      const sleep = this.getSleepData(patientId);
      const vitals = this.getRecentVitals(patientId);
      const meal = this.getMealHistory(patientId);

      signals.push({
        id: 'sig-activity-overview',
        label: "Today's Activity",
        value: `${activity.steps.toLocaleString()} steps (${activity.level})`,
        category: 'activity',
        icon: 'Footprints',
      });

      signals.push({
        id: 'sig-sleep-overview',
        label: 'Sleep Recovery',
        value: `${sleep.formatted} (${sleep.quality})`,
        category: 'sleep',
        icon: 'Moon',
      });

      if (vitals?.bloodPressure) {
        signals.push({
          id: 'sig-bp-overview',
          label: 'Vitals Status',
          value: `BP ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}, HR ${vitals.heartRate} bpm`,
          category: 'vitals',
          icon: 'HeartPulse',
        });
      }

      signals.push({
        id: 'sig-diet-overview',
        label: 'Diet Preference',
        value: `${meal.preference} • ${patient.regionalCuisinePreference.split('(')[0].trim()}`,
        category: 'diet',
        icon: 'Utensils',
      });

      searchTerms.push(
        `daily healthy routine older adults cognitive engagement physical health WHO ICMR`,
        `active aging daily schedule elderly care guidelines NHS`
      );
    }

    return {
      patient,
      signals,
      retrievedTools,
      suggestedWebSearchTerms: searchTerms,
      primaryIntent,
    };
  }
}

export const patientContextEngine = new PatientContextEngine();
export default patientContextEngine;

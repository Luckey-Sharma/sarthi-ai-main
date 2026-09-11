import { PatientHealthRecord, DemoScenarioId } from '../types/healthCompanion';

export const demoPatientHealthRecords: Record<string, PatientHealthRecord> = {
  'pat-1': {
    id: 'pat-1',
    name: 'Bhaben Hazarika',
    age: 74,
    sex: 'male',
    heightCm: 168,
    weightKg: 66,
    bmi: 23.4,
    location: 'Guwahati, Assam (Silpukhuri)',
    dietPreference: 'vegetarian',
    foodAllergies: ['None recorded'],
    dietaryRestrictions: ['Low added sodium (under 5g/day)', 'Avoid heavily fried or oily food', 'Prefers warm soft foods'],
    knownConditions: ['Mild Hypertension (Blood Pressure)', 'Mild Cognitive Impairment (MCI)'],
    mobilityLevel: 'assisted_walking',
    cognitiveStage: 'Mild Cognitive Impairment',
    regionalCuisinePreference: 'Assamese / North-East Indian vegetarian (vegetable poha, khichdi, dal, curd, stewed laal saag, pitha, light ginger tea)',
    preferredLanguage: 'as',
    doctorNotes: 'Cardiovascular status stable on Telmisartan. Keep salt moderate. Patient benefits from structured morning routine, gentle garden walks, and cognitive memory stimulation.',
    caregiverNotes: 'Father is cheerful in the morning. Needs gentle reminders for water and likes listening to Bhupen Hazarika songs while having breakfast.',
    isDemoData: true,
    currentMedications: [
      {
        id: 'med-1',
        name: 'Telmisartan',
        dosage: '40mg',
        condition: 'Hypertension (Blood Pressure)',
        timeOfDay: 'morning',
        time: '08:00 AM',
        takenToday: true,
        withFood: true,
        instructions: 'Take one tablet every morning after breakfast with a full glass of water. Do not skip.'
      },
      {
        id: 'med-2',
        name: 'Donepezil',
        dosage: '5mg',
        condition: 'Memory & Cognitive Support',
        timeOfDay: 'night',
        time: '09:00 PM',
        takenToday: false,
        withFood: false,
        instructions: 'Take at bedtime. Helps maintain acetylcholine levels for cognitive recall.'
      },
      {
        id: 'med-3',
        name: 'Vitamin D3 & Calcium',
        dosage: '60,000 IU weekly',
        condition: 'Bone & Neuromuscular health',
        timeOfDay: 'morning',
        time: 'Sunday 09:00 AM',
        takenToday: true,
        withFood: true,
        instructions: 'Take once a week with milk or curd.'
      }
    ],
    recentAppointments: [
      {
        date: '2026-08-30',
        doctorName: 'Dr. Achyut Baruah',
        specialty: 'Consultant Neurologist',
        clinic: 'GNRC Hospitals, Guwahati',
        notes: 'MCI stable. Continue current cognitive exercises and daily walking. Recheck in 3 months.'
      },
      {
        date: '2026-08-14',
        doctorName: 'Dr. Nilima Sharma',
        specialty: 'Senior Cardiologist',
        clinic: 'Dispur Polyclinic, Guwahati',
        notes: 'BP well managed at 128/82. Continue Telmisartan 40mg.'
      }
    ],
    doctorInstructions: [
      {
        date: '2026-08-30',
        doctorName: 'Dr. Achyut Baruah',
        specialty: 'Neurology',
        instructions: [
          'Monitor morning resting blood pressure daily before morning walk.',
          'Take 20-25 minutes of gentle morning walking in the garden or balcony.',
          'Ensure minimum 6-7 glasses of water daily to prevent dehydration-induced confusion.',
          'Daily 15 minutes of memory matching or pattern games.'
        ]
      }
    ],
    vitalsHistory: [
      {
        date: 'Today',
        bloodPressure: { systolic: 128, diastolic: 82 },
        heartRate: 72,
        spO2: 98,
        sleepHours: 6.3, // 6h 20m
        sleepQuality: 'fair',
        steps: 1420, // low morning activity
        waterGlasses: 4,
        mood: 'calm',
        meals: {
          breakfast: undefined, // Not logged yet
          lunch: undefined,
          dinner: undefined
        },
        cognitiveScore: 82,
        routineCompleted: false
      },
      {
        date: 'Yesterday',
        bloodPressure: { systolic: 126, diastolic: 80 },
        heartRate: 70,
        spO2: 98,
        sleepHours: 7.1,
        sleepQuality: 'restful',
        steps: 5200,
        waterGlasses: 6,
        mood: 'cheerful',
        meals: {
          breakfast: 'Vegetable Dalia with curd and cardamom black tea',
          lunch: 'Masor tenga (light sour fish curry) with steamed Joha rice & ridge gourd',
          dinner: 'Moong dal khichdi with roasted papad'
        },
        cognitiveScore: 88,
        routineCompleted: true
      },
      {
        date: '2 days ago',
        bloodPressure: { systolic: 130, diastolic: 84 },
        heartRate: 75,
        spO2: 97,
        sleepHours: 6.5,
        sleepQuality: 'fair',
        steps: 3840,
        waterGlasses: 5,
        mood: 'calm',
        meals: {
          breakfast: 'Oats porridge with almonds and ripe banana',
          lunch: 'Rice with yellow lentils, bottle gourd (lauki) sabzi',
          dinner: 'Soft multigrain roti with cooked spinach'
        },
        cognitiveScore: 80,
        routineCompleted: true
      },
      {
        date: '3 days ago',
        bloodPressure: { systolic: 132, diastolic: 85 },
        heartRate: 73,
        spO2: 98,
        sleepHours: 6.0,
        sleepQuality: 'fair',
        steps: 4100,
        waterGlasses: 6,
        mood: 'neutral',
        meals: {
          breakfast: 'Idli with mild mint coconut chutney',
          lunch: 'Brown rice, mixed vegetable stew, fresh curd',
          dinner: 'Light dal soup with toasted bread'
        },
        cognitiveScore: 78,
        routineCompleted: true
      },
      {
        date: '4 days ago',
        bloodPressure: { systolic: 125, diastolic: 79 },
        heartRate: 69,
        spO2: 99,
        sleepHours: 7.5,
        sleepQuality: 'restful',
        steps: 5600,
        waterGlasses: 7,
        mood: 'cheerful',
        meals: {
          breakfast: 'Poha with peas, carrots, and roasted peanuts',
          lunch: 'Rice, spinach dal, roasted eggplant',
          dinner: 'Pumpkin soup with warm boiled potato & curd'
        },
        cognitiveScore: 92,
        routineCompleted: true
      },
      {
        date: '5 days ago',
        bloodPressure: { systolic: 129, diastolic: 83 },
        heartRate: 74,
        spO2: 97,
        sleepHours: 6.4,
        sleepQuality: 'fair',
        steps: 3400,
        waterGlasses: 5,
        mood: 'calm',
        meals: {
          breakfast: 'Besan chilla with mint chutney',
          lunch: 'Dal, steamed rice, tender ash gourd sabzi',
          dinner: 'Khichdi with ghee and curd'
        },
        cognitiveScore: 84,
        routineCompleted: true
      },
      {
        date: '6 days ago',
        bloodPressure: { systolic: 127, diastolic: 81 },
        heartRate: 71,
        spO2: 98,
        sleepHours: 6.8,
        sleepQuality: 'restful',
        steps: 4900,
        waterGlasses: 6,
        mood: 'cheerful',
        meals: {
          breakfast: 'Upma with vegetables and light tea',
          lunch: 'Lau-khar with Joha rice and masoor dal',
          dinner: 'Roti with cooked bottle gourd'
        },
        cognitiveScore: 86,
        routineCompleted: true
      }
    ]
  },

  'pat-2': {
    id: 'pat-2',
    name: 'Monimala Roy',
    age: 71,
    sex: 'female',
    heightCm: 154,
    weightKg: 58,
    bmi: 24.5,
    location: 'Silchar, Assam (Cachar)',
    dietPreference: 'pescatarian',
    foodAllergies: ['Prawns / Shellfish'],
    dietaryRestrictions: ['Low Glycemic Index (Type 2 Diabetes)', 'High fiber', 'Moderate carbohydrate portions'],
    knownConditions: ['Type 2 Diabetes Mellitus', 'Early Stage Cognitive Decline'],
    mobilityLevel: 'independent',
    cognitiveStage: 'Early Stage',
    regionalCuisinePreference: 'Bengali / Sylheti traditional cuisine (steamed rohu fish with pointed gourd, shukto with bitter gourd, masoor dal, red rice)',
    preferredLanguage: 'bn',
    doctorNotes: 'HbA1c is 6.8% (well controlled). High fiber intake and regular morning walking are key. Encourage cognitive engagement with music and family recall.',
    caregiverNotes: 'Active and loves humming Rabindra Sangeet. Takes pride in walking in the morning.',
    isDemoData: true,
    currentMedications: [
      {
        id: 'med-201',
        name: 'Metformin',
        dosage: '500mg',
        condition: 'Type 2 Diabetes',
        timeOfDay: 'twice_daily',
        time: '08:30 AM & 08:30 PM',
        takenToday: true,
        withFood: true,
        instructions: 'Take with or immediately after meals to minimize stomach upset.'
      },
      {
        id: 'med-202',
        name: 'Galantamine',
        dosage: '8mg',
        condition: 'Cognitive & Memory Enhancement',
        timeOfDay: 'morning',
        time: '08:30 AM',
        takenToday: true,
        withFood: true,
        instructions: 'Take once daily in the morning with food.'
      }
    ],
    recentAppointments: [
      {
        date: '2026-08-20',
        doctorName: 'Dr. Debabrata Sen',
        specialty: 'Endocrinologist',
        clinic: 'Silchar Medical College Hospital',
        notes: 'Blood sugar fasting 108 mg/dL, post-meal 142 mg/dL. Excellent glycemic control.'
      }
    ],
    doctorInstructions: [
      {
        date: '2026-08-20',
        doctorName: 'Dr. Debabrata Sen',
        specialty: 'Endocrinology',
        instructions: [
          'Maintain regular meal timings to prevent hypoglycemia.',
          'Focus on low glycemic vegetables like bitter gourd (karela), methi, and bottle gourd.',
          'Aim for 5,000 to 6,000 steps daily split into morning and evening sessions.'
        ]
      }
    ],
    vitalsHistory: [
      {
        date: 'Today',
        bloodPressure: { systolic: 120, diastolic: 78 },
        heartRate: 68,
        spO2: 99,
        sleepHours: 7.5,
        sleepQuality: 'restful',
        steps: 5800, // Very active morning!
        waterGlasses: 5,
        mood: 'cheerful',
        meals: {
          breakfast: 'Steamed idlis with vegetable sambar',
          lunch: undefined,
          dinner: undefined
        },
        cognitiveScore: 89,
        routineCompleted: true
      }
    ]
  },

  'pat-3': {
    id: 'pat-3',
    name: 'Iboyaima Singh',
    age: 76,
    sex: 'male',
    heightCm: 165,
    weightKg: 62,
    bmi: 22.8,
    location: 'Imphal, Manipur (Uripok)',
    dietPreference: 'non-vegetarian',
    foodAllergies: ['None recorded'],
    dietaryRestrictions: ['Low purine', 'Soft chewable texture due to dental bridges', 'Warm comforting meals'],
    knownConditions: ['Mild Cognitive Impairment', 'Mild Osteoarthritis (Knee Joint Stiffness)', 'Sleep Pattern Disruption'],
    mobilityLevel: 'walking_stick',
    cognitiveStage: 'Mild Cognitive Impairment',
    regionalCuisinePreference: 'Manipuri traditional cuisine (Kangsoi vegetable stew, Chamthong with local herbs, steamed fish, chak-hao black rice porridge)',
    preferredLanguage: 'mni',
    doctorNotes: 'Mild sleep fragmentation observed. Advise warm milk or chamomile/herbal tea before bed, no screen time after 8 PM. Gentle seated leg stretches for knee osteoarthritis.',
    caregiverNotes: 'Did not sleep well last night (woke up twice). Feeling slightly fatigued today. Recommended a gentle rest schedule.',
    isDemoData: true,
    currentMedications: [
      {
        id: 'med-301',
        name: 'Amlodipine',
        dosage: '5mg',
        condition: 'Hypertension',
        timeOfDay: 'morning',
        time: '08:00 AM',
        takenToday: true,
        withFood: false,
        instructions: 'Take once daily in the morning.'
      },
      {
        id: 'med-302',
        name: 'Glucosamine & Chondroitin',
        dosage: '1500mg',
        condition: 'Joint & Cartilage Support',
        timeOfDay: 'morning',
        time: '09:00 AM',
        takenToday: true,
        withFood: true,
        instructions: 'Take with breakfast for knee stiffness.'
      }
    ],
    recentAppointments: [
      {
        date: '2026-08-25',
        doctorName: 'Dr. Th. Nabachandra Singh',
        specialty: 'Orthopedic Specialist',
        clinic: 'RIMS Imphal',
        notes: 'Mild bilateral knee osteoarthritis. Avoid stairs. Low impact walking recommended.'
      }
    ],
    doctorInstructions: [
      {
        date: '2026-08-25',
        doctorName: 'Dr. Th. Nabachandra Singh',
        specialty: 'Orthopedics',
        instructions: [
          'Do gentle seated knee extension exercises twice daily.',
          'Avoid walking for more than 15 minutes continuously without resting.',
          'If fatigued or after poor sleep, prioritize rest over strenuous walking.'
        ]
      }
    ],
    vitalsHistory: [
      {
        date: 'Today',
        bloodPressure: { systolic: 128, diastolic: 80 },
        heartRate: 76,
        spO2: 96,
        sleepHours: 4.8, // 4h 50m - poor sleep!
        sleepQuality: 'poor',
        steps: 980, // low steps due to fatigue
        waterGlasses: 3,
        mood: 'fatigued',
        meals: {
          breakfast: 'Warm black rice porridge with ginger and jaggery',
          lunch: undefined,
          dinner: undefined
        },
        cognitiveScore: 72,
        routineCompleted: false
      }
    ]
  }
};

/**
 * Switchable Demo Scenarios specifically crafted for Competition Judges.
 * Demonstrates how AI Saathi recommendations dynamically transform
 * when health signals change!
 */
export const DEMO_SCENARIO_CONFIGS: Record<DemoScenarioId, {
  id: DemoScenarioId;
  title: string;
  patientId: string;
  badge: string;
  description: string;
  primarySignals: string[];
}> = {
  'scenario_bp_low_activity': {
    id: 'scenario_bp_low_activity',
    title: 'Scenario 1: Low Activity & Elevated BP (Bhaben Hazarika, 74y)',
    patientId: 'pat-1',
    badge: 'Vegetarian • 1,420 Steps • BP 128/82 • 6h 20m Sleep',
    description: 'Patient is 74, vegetarian, has light morning activity so far (1,420 steps), monitors blood pressure with Telmisartan, and breakfast has not been logged.',
    primarySignals: ['Age 74', 'Vegetarian Diet', 'Low Morning Steps (1,420)', 'Blood Pressure History', 'Telmisartan Medication', 'Moderate Salt Guidance']
  },
  'scenario_active_normal': {
    id: 'scenario_active_normal',
    title: 'Scenario 2: Active Morning & Balanced Glycemia (Monimala Roy, 71y)',
    patientId: 'pat-2',
    badge: 'Pescatarian • 5,800 Steps • Restful Sleep (7.5h) • Diabetes Care',
    description: 'Patient is 71, had an active morning walk (5,800 steps), restful 7.5h sleep, well-controlled blood glucose on Metformin, and prefers Bengali fish and fiber.',
    primarySignals: ['Age 71', 'Active Physical Activity (5,800 steps)', 'Restful 7.5h Sleep', 'Type 2 Diabetes Context', 'High Fiber / Low Glycemic Index', 'Metformin Medication']
  },
  'scenario_poor_sleep_fatigue': {
    id: 'scenario_poor_sleep_fatigue',
    title: 'Scenario 3: Poor Sleep & Joint Fatigue (Iboyaima Singh, 76y)',
    patientId: 'pat-3',
    badge: 'Non-Veg • 980 Steps • Poor Sleep (4.8h) • Knee Stiffness',
    description: 'Patient is 76, slept poorly last night (4h 50m), feeling fatigued, has knee osteoarthritis stiffness, and needs gentle restorative guidance.',
    primarySignals: ['Age 76', 'Poor Sleep (4.8h fragmented)', 'Low Steps (980)', 'Knee Osteoarthritis', 'Fatigue / Rest Schedule Required', 'Hydration Deficit (3/8 glasses)']
  }
};

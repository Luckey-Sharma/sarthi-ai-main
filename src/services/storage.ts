import {
  PatientProfile,
  CaregiverProfile,
  FamilyMember,
  Medication,
  CognitiveSession,
  CaregiverSessionRecord,
  Language,
  DDAState,
  GameId,
  SyncQueueItem,
} from '../types';
import {
  demoPatients,
  demoCaregiver,
  demoFamilyMembers,
  demoMedications,
  demoCognitiveHistory,
} from './mockData';

const KEYS = {
  PATIENT: 'smritisetu_active_patient',
  PATIENTS_LIST: 'smritisetu_all_patients',
  CAREGIVER: 'smritisetu_caregiver',
  FAMILY: 'smritisetu_family',
  MEDICATIONS: 'smritisetu_medications',
  COGNITIVE_HISTORY: 'smritisetu_cognitive_sessions',
  CAREGIVER_SESSIONS: 'smritisetu_caregiver_sessions',
  WATER_COUNT: 'smritisetu_water_count',
  WATER_DATE: 'smritisetu_water_date',
  LANGUAGE: 'smritisetu_language',
  SOUND_MUTED: 'smritisetu_sound_muted',
  GAME_DDA_PREFIX: 'smritisetu_dda_',
  SYNC_QUEUE: 'smritisetu_sync_queue',
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function loadPatients(): PatientProfile[] {
  return safeGet<PatientProfile[]>(KEYS.PATIENTS_LIST, demoPatients);
}

export function savePatients(patients: PatientProfile[]): void {
  safeSet(KEYS.PATIENTS_LIST, patients);
}

export function loadPatientProfile(): PatientProfile {
  return safeGet<PatientProfile>(KEYS.PATIENT, demoPatients[0]);
}

export function savePatientProfile(patient: PatientProfile): void {
  safeSet(KEYS.PATIENT, patient);
  const list = loadPatients();
  const index = list.findIndex(p => p.id === patient.id);
  if (index >= 0) {
    list[index] = patient;
  } else {
    list.push(patient);
  }
  savePatients(list);
}

export function loadCaregiver(): CaregiverProfile {
  return safeGet<CaregiverProfile>(KEYS.CAREGIVER, demoCaregiver);
}

export function saveCaregiver(caregiver: CaregiverProfile): void {
  safeSet(KEYS.CAREGIVER, caregiver);
}

export function loadFamilyMembers(): FamilyMember[] {
  return safeGet<FamilyMember[]>(KEYS.FAMILY, demoFamilyMembers);
}

export function saveFamilyMembers(members: FamilyMember[]): void {
  safeSet(KEYS.FAMILY, members);
}

export function loadMedications(): Medication[] {
  return safeGet<Medication[]>(KEYS.MEDICATIONS, demoMedications);
}

export function saveMedications(meds: Medication[]): void {
  safeSet(KEYS.MEDICATIONS, meds);
}

export function loadCognitiveHistory(): CognitiveSession[] {
  return safeGet<CognitiveSession[]>(KEYS.COGNITIVE_HISTORY, demoCognitiveHistory);
}

export function loadSyncQueue(): SyncQueueItem[] {
  return safeGet<SyncQueueItem[]>(KEYS.SYNC_QUEUE, []);
}

export function saveSyncQueue(queue: SyncQueueItem[]): void {
  safeSet(KEYS.SYNC_QUEUE, queue);
}

export function enqueueSyncItem(item: {
  type: SyncQueueItem['type'];
  data: any;
}): SyncQueueItem {
  const queue = loadSyncQueue();
  const newItem: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: item.type,
    data: item.data,
    timestamp: new Date().toISOString(),
    version: 1,
    synced: false,
  };
  queue.push(newItem);
  saveSyncQueue(queue);
  return newItem;
}

export function clearSyncQueue(): void {
  safeSet(KEYS.SYNC_QUEUE, []);
}

export function saveCognitiveSession(session: CognitiveSession): void {
  const existing = loadCognitiveHistory();
  const updated = [...existing, session];
  safeSet(KEYS.COGNITIVE_HISTORY, updated);
  enqueueSyncItem({ type: 'session', data: session });
}

export function loadCaregiverSessions(): CaregiverSessionRecord[] {
  return safeGet<CaregiverSessionRecord[]>(KEYS.CAREGIVER_SESSIONS, []);
}

export function saveCaregiverSession(record: CaregiverSessionRecord): void {
  const existing = loadCaregiverSessions();
  const updated = [record, ...existing];
  safeSet(KEYS.CAREGIVER_SESSIONS, updated);
  enqueueSyncItem({ type: 'caregiver_note', data: record });
}

export function loadSoundMuted(): boolean {
  return safeGet<boolean>(KEYS.SOUND_MUTED, false);
}

export function saveSoundMuted(muted: boolean): void {
  safeSet(KEYS.SOUND_MUTED, muted);
}

export function loadWaterCount(): number {
  const today = new Date().toDateString();
  const savedDate = safeGet<string>(KEYS.WATER_DATE, '');
  if (savedDate !== today) {
    safeSet(KEYS.WATER_DATE, today);
    safeSet(KEYS.WATER_COUNT, 0);
    return 0;
  }
  return safeGet<number>(KEYS.WATER_COUNT, 3);
}

export function saveWaterCount(count: number): void {
  const today = new Date().toDateString();
  safeSet(KEYS.WATER_DATE, today);
  safeSet(KEYS.WATER_COUNT, count);
  enqueueSyncItem({ type: 'water', data: { count, date: today } });
}

export function loadLanguage(): Language {
  return safeGet<Language>(KEYS.LANGUAGE, 'en');
}

export function saveLanguage(lang: Language): void {
  safeSet(KEYS.LANGUAGE, lang);
}

export function loadGameDDA(gameId: GameId, defaultLevel: number = 1): DDAState {
  const defaultState: DDAState = {
    level: defaultLevel,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    baselineReactionTime: 2500,
    speedMultiplier: 1.0,
  };
  return safeGet<DDAState>(`${KEYS.GAME_DDA_PREFIX}${gameId}`, defaultState);
}

export function saveGameDDA(gameId: GameId, state: DDAState): void {
  safeSet(`${KEYS.GAME_DDA_PREFIX}${gameId}`, state);
}

export function getAllGameLevels(): Record<GameId, number> {
  const games: GameId[] = [
    'memory_match',
    'tea_garden',
    'brain_quest',
    'pattern_weave',
    'routine_builder',
    'sounds_hills',
    'family_recall',
  ];
  const levels: Partial<Record<GameId, number>> = {};
  games.forEach((g) => {
    levels[g] = loadGameDDA(g).level;
  });
  return levels as Record<GameId, number>;
}

export const storage = {
  loadPatientProfile,
  savePatientProfile,
  loadPatients,
  savePatients,
  loadCaregiver,
  saveCaregiver,
  loadFamilyMembers,
  saveFamilyMembers,
  loadMedications,
  saveMedications,
  loadCognitiveHistory,
  saveCognitiveSession,
  loadCaregiverSessions,
  saveCaregiverSession,
  loadSoundMuted,
  saveSoundMuted,
  loadWaterCount,
  saveWaterCount,
  loadLanguage,
  saveLanguage,
  loadGameDDA,
  saveGameDDA,
  getAllGameLevels,
  loadSyncQueue,
  saveSyncQueue,
  enqueueSyncItem,
  clearSyncQueue,
};

export default storage;


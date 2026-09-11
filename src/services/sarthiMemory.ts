/**
 * Sarthi Personal Memory Store
 * 
 * Remembers useful non-clinical interaction context:
 * - Preferred games
 * - Frequently completed / skipped games
 * - Preferred activity time
 * - Active demo scenario override (for SIH presentation)
 * 
 * Strict Privacy: Does not store unnecessary sensitive or clinical information.
 */

import { GameId, Language, SarthiDemoScenario } from '../types';

const MEMORY_KEY = 'smritisetu_sarthi_memory';
const DEMO_SCENARIO_KEY = 'smritisetu_sarthi_demo_scenario';

export interface SarthiMemoryData {
  preferredGames: GameId[];
  completedGameCounts: Record<string, number>;
  skippedGameCounts: Record<string, number>;
  preferredLanguage: Language;
  lastInteractionDate: string;
  totalInteractions: number;
}

const DEFAULT_MEMORY: SarthiMemoryData = {
  preferredGames: ['memory_match', 'tea_garden', 'sounds_hills'],
  completedGameCounts: {
    memory_match: 6,
    tea_garden: 5,
    sounds_hills: 4,
    pattern_weave: 3,
    family_recall: 4,
  },
  skippedGameCounts: {},
  preferredLanguage: 'en',
  lastInteractionDate: new Date().toISOString().split('T')[0],
  totalInteractions: 12,
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
    // Local storage full or unavailable
  }
}

export function loadSarthiMemory(): SarthiMemoryData {
  return safeGet<SarthiMemoryData>(MEMORY_KEY, DEFAULT_MEMORY);
}

export function saveSarthiMemory(data: SarthiMemoryData): void {
  safeSet(MEMORY_KEY, data);
}

export function recordGameCompleted(gameId: GameId): void {
  const mem = loadSarthiMemory();
  const current = mem.completedGameCounts[gameId] || 0;
  mem.completedGameCounts[gameId] = current + 1;
  mem.totalInteractions += 1;
  mem.lastInteractionDate = new Date().toISOString().split('T')[0];
  saveSarthiMemory(mem);
}

export function recordGameSkipped(gameId: GameId): void {
  const mem = loadSarthiMemory();
  const current = mem.skippedGameCounts[gameId] || 0;
  mem.skippedGameCounts[gameId] = current + 1;
  saveSarthiMemory(mem);
}

export function getActiveDemoScenario(): SarthiDemoScenario {
  return safeGet<SarthiDemoScenario>(DEMO_SCENARIO_KEY, 'baseline');
}

export function setActiveDemoScenario(scenario: SarthiDemoScenario): void {
  safeSet(DEMO_SCENARIO_KEY, scenario);
}

export const sarthiMemory = {
  loadSarthiMemory,
  saveSarthiMemory,
  recordGameCompleted,
  recordGameSkipped,
  getActiveDemoScenario,
  setActiveDemoScenario,
};

export default sarthiMemory;

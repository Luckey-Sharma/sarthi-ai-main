/**
 * Sarthi Patient Context Builder & Privacy Guard
 *
 * Adheres to Privacy & Minimum Context principles:
 * - Packages only the minimal necessary clinical signals for AI reasoning.
 * - Compares patient purely to their OWN historical baseline (never to other patients).
 * - Sanitizes away private addresses, full telephone numbers, or unneeded notes.
 * - Formulates progress adaptation guidance (improving, stable, declining) with
 *   STRICT non-diagnostic phrasing.
 */

import { SarthiContext, Language, SarthiTrend } from '../types';
import { calculatePersonalBaseline } from './sarthiEngine';

export interface MinimalPatientContext {
  // Anonymized / Minimal profile
  patient: {
    firstName: string;
    ageGroup: string; // e.g. "70-75 years"
    locationRegion: string; // e.g. "North-East India"
  };
  preferredLanguage: Language;

  // Personal baseline & self-referenced trend
  personalTrend: SarthiTrend;
  trendDescription: string;
  adaptationPrompt: string;

  // Recent cognitive activity (last 3-5 sessions, no private identifiers)
  recentActivitySummary: {
    averageAccuracyPct: number;
    sessionsThisWeek: number;
    preferredDomain: string;
    recentScoreAverage: number;
    currentDifficulty: number;
  };

  // Routine & Adherence
  routineAdherencePct: number;
  hydrationGlassesToday: number;
  medicationStatus: string;

  // Current UI Context
  currentView: string;
  activeGameId?: string;

  // Query metadata
  userQuery?: string;
  shouldSearchWeb: boolean;
}

export function buildMinimalPatientContext(
  context: SarthiContext,
  userQuery?: string,
  shouldSearchWeb: boolean = false
): MinimalPatientContext {
  const patient = context.patient;
  const sessions = context.allSessions || context.recentSessions || [];

  // Compute personal baseline from patient's own history
  const baseline = calculatePersonalBaseline(
    patient.id,
    sessions,
    context.demoScenario
  );

  // Derive age group rather than exposing exact birth data
  const age = patient.age || 72;
  const ageGroup = `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4} years`;

  // First name only for warmth without full PII
  const firstName = patient.name ? patient.name.split(' ')[0] : 'Elder';

  // Count sessions in the last 7 days
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sessionsThisWeek = sessions.filter((s) => {
    try {
      return new Date(s.timestamp || s.date) >= oneWeekAgo;
    } catch {
      return false;
    }
  }).length;

  // Progress adaptation strictly referencing personal baseline
  let trendDescription = 'Consistent with usual baseline.';
  let adaptationPrompt = 'Your performance has been steady. A short familiar activity may be a good choice today.';

  if (baseline.trend === 'improving') {
    trendDescription = 'Higher accuracy and engagement than recent personal baseline.';
    adaptationPrompt = "You've been improving with memory activities. Would you like to try a slightly more challenging round?";
  } else if (baseline.trend === 'struggling' || baseline.consecutiveDropCount >= 2) {
    trendDescription = 'Activity pace is lower than usual personal baseline.';
    adaptationPrompt = "Your recent activity has been a little lower than usual. Let's keep today's activity gentle.";
  } else if (baseline.trend === 'repeated_deviation') {
    trendDescription = 'Activity pattern has differed from usual personal baseline across recent sessions.';
    adaptationPrompt = "Your performance has changed compared with your recent baseline. A calming pause or speaking with your caregiver is recommended.";
  }

  // Medication summary
  const hydration = context.hydrationGlasses || 4;
  const routinePct = context.routineAdherence || 85;

  return {
    patient: {
      firstName,
      ageGroup,
      locationRegion: patient.location || 'North-East India',
    },
    preferredLanguage: context.language || 'en',

    personalTrend: baseline.trend,
    trendDescription,
    adaptationPrompt,

    recentActivitySummary: {
      averageAccuracyPct: Math.round((baseline.averageAccuracy || 0.75) * 100),
      sessionsThisWeek: Math.max(sessionsThisWeek, sessions.slice(-5).length),
      preferredDomain: baseline.preferredGame ? String(baseline.preferredGame) : 'memory_match',
      recentScoreAverage: baseline.averageScore || 72,
      currentDifficulty: baseline.trend === 'improving' ? 3 : baseline.trend === 'struggling' ? 1 : 2,
    },

    routineAdherencePct: routinePct,
    hydrationGlassesToday: hydration,
    medicationStatus: `${routinePct >= 80 ? 'On schedule' : 'Needs gentle check'} (${hydration}/8 water glasses)`,

    currentView: context.currentPage?.view || 'home',
    activeGameId: context.currentPage?.gameId,

    userQuery: userQuery || 'How am I doing today?',
    shouldSearchWeb,
  };
}

export const sarthiContextBuilder = {
  buildMinimalPatientContext,
};

export default sarthiContextBuilder;

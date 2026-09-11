import { Language } from '../types';

export interface TranslationSchema {
  common: {
    home: string;
    back: string;
    next: string;
    start: string;
    continue: string;
    cancel: string;
    save: string;
    done: string;
    close: string;
    finish: string;
    playAgain: string;
    retry: string;
    score: string;
    level: string;
    moves: string;
    accuracy: string;
    time: string;
    seconds: string;
    question: string;
    hint: string;
    showHint: string;
    hideHint: string;
    offlineReady: string;
    workingOffline: string;
    elderlyMode: string;
    caregiverMode: string;
    sos: string;
    readAloud: string;
    stopListening: string;
    listen: string;
    congratulations: string;
    wonderful: string;
    greatJob: string;
    tryAgain: string;
    loading: string;
    error: string;
    today: string;
    patient: string;
  };

  navigation: {
    home: string;
    games: string;
    reminders: string;
    family: string;
    progress: string;
    calming: string;
    sarthi: string;
    emergency: string;
    caregiver: string;
    switchLanguage: string;
    openNavigation: string;
    closeNavigation: string;
  };

  elderlyHome: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    greetingNight: string;
    welcomeSubtitle: string;
    waterWidgetTitle: string;
    waterWidgetAction: string;
    tileGamesTitle: string;
    tileGamesSubtitle: string;
    tileGamesBadge: string;
    tileFamilyTitle: string;
    tileFamilySubtitle: string;
    tileFamilyBadge: string;
    tileCalmingTitle: string;
    tileCalmingSubtitle: string;
    tileCalmingBadge: string;
    sosHelpTitle: string;
    sosHelpSubtitle: string;
    sosButtonLabel: string;
  };

  games: {
    hubTitle: string;
    hubSubtitle: string;
    hubBadge: string;
    touchToPlay: string;
    domains: {
      visualSpatial: string;
      attentionMotor: string;
      executiveFunction: string;
      patternLogic: string;
      temporalOrientation: string;
      auditoryMemory: string;
      autobiographical: string;
    };
    difficulty: {
      gentle: string;
      moderate: string;
      advanced: string;
    };

    memoryMatch: {
      title: string;
      subtitle: string;
      culturalArtifactsTab: string;
      familyPhotosTab: string;
      touchToFlip: string;
      matched: string;
      winTitle: string;
      winSubtitle: string;
      movesCount: string;
      pairsFound: string;
    };

    teaGarden: {
      title: string;
      subtitle: string;
      readyTitle: string;
      startPrompt: string;
      startGame: string;
      pluck: string;
      caterpillarAvoid: string;
      teaLeavesCount: string;
      leavesBasket: string;
      reactionSpeed: string;
      budsPlucked: string;
      caterpillarsAvoided: string;
      missedBuds: string;
      finishedTitle: string;
      finishedSubtitle: string;
      cautionCaterpillar: string;
      greatJobMessage: string;
    };

    brainQuest: {
      title: string;
      subtitle: string;
      solvedTitle: string;
      solvedSubtitle: string;
      correctAnswer: string;
      incorrectTryAgain: string;
      culturalHintLabel: string;
      riddleNumber: string;
      of: string;
    };

    patternWeave: {
      title: string;
      subtitle: string;
      warpWeft: string;
      whichMotif: string;
      winTitle: string;
      winSubtitle: string;
      completedWeave: string;
      touchMotifToPlace: string;
    };

    routineBuilder: {
      title: string;
      subtitle: string;
      checkOrder: string;
      reshuffle: string;
      winTitle: string;
      winSubtitle: string;
      instructions: string;
      morning: string;
      afternoon: string;
      evening: string;
      night: string;
    };

    soundsOfHills: {
      title: string;
      subtitle: string;
      listenSound: string;
      soundPlaying: string;
      touchToPlaySound: string;
      whichSoundMadeThis: string;
      winTitle: string;
      winSubtitle: string;
      correctInstrument: string;
    };

    familyRecall: {
      title: string;
      subtitle: string;
      whoIsThis: string;
      rememberPrompt: string;
      clueLabel: string;
      winTitle: string;
      winSubtitle: string;
      touchLovedOne: string;
    };
  };

  reminders: {
    title: string;
    subtitle: string;
    waterGoal: string;
    waterUnit: string;
    addGlass: string;
    todaysMeds: string;
    completed: string;
    taken: string;
    tapToConfirm: string;
    pillCount: string;
    reminderTime: string;
    morningSchedule: string;
    afternoonSchedule: string;
    eveningSchedule: string;
  };

  family: {
    albumTitle: string;
    albumSubtitle: string;
    addFamilyMember: string;
    listenBio: string;
    memoryClueLabel: string;
    fullName: string;
    relationship: string;
    hometown: string;
    photoUrl: string;
    emptyAlbum: string;
    saveMember: string;
  };

  calming: {
    title: string;
    subtitle: string;
    sundowningBadge: string;
    breatheIn: string;
    breatheHold: string;
    breatheOut: string;
    playNatureSounds: string;
    stopSound: string;
    soundRain: string;
    soundLake: string;
    soundBell: string;
    soundFlute: string;
    soundWater: string;
  };

  safeCard: {
    safeTitle: string;
    safeSubtitle: string;
    whoAmI: string;
    whereIsHome: string;
    emergencyContact: string;
    callCaregiver: string;
    emergencyHelpline112: string;
    ambulance108: string;
    showToHelper: string;
    closeSafeCard: string;
    conditionBadge: string;
  };

  onboarding: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    step1Title: string;
    step1Description: string;
    step2Title: string;
    step2Description: string;
    step3Title: string;
    step3Description: string;
    getStarted: string;
  };

  caregiver: {
    dashboardTitle: string;
    dashboardSubtitle: string;
    overviewTab: string;
    cognitiveTrendsTab: string;
    routineCareTab: string;
    caregiverWellbeingTab: string;
    patientStatus: string;
    weeklySessions: string;
    averageScore: string;
    dailyHydration: string;
    burnoutLevel: string;
    burnoutLow: string;
    burnoutModerate: string;
    burnoutHigh: string;
    recentActivities: string;
    clinicalObservationNotice: string;
  };

  sarthi: {
    companionTitle: string;
    companionSubtitle: string;
    greeting: string;
    askPlaceholder: string;
    touchToAsk: string;
    thinking: string;
    geminiBadge: string;
    offlineBadge: string;
    whyRecommended: string;
    goNow: string;
    speechUnavailableNotice: string;
    healthInfoBadge: string;
    whatItMeans: string;
    whyItMatters: string;
    whatYouCanDo: string;
    whenToAskForHelp: string;
    nonClinicalTag: string;
    scenariosLabel: string;
    quickActions: {
      howAmIDoing: string;
      playGame: string;
      whatNext: string;
      reminders: string;
      healthQuestion: string;
      takeMeHome: string;
      talk: string;
    };
  };

  voice: {
    readAloud: string;
    stopSpeaking: string;
    listening: string;
    speakNow: string;
    speechNotSupported: string;
  };
}

import React, { useState, useEffect } from 'react';
import {
  AppMode,
  AppView,
  Language,
  PatientProfile,
  GameId,
  FamilyMember,
  CognitiveSession,
} from './types';
import { storage } from './services/storage';
import { LanguageProvider, t } from './i18n';

// Layout & Navigation Components
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/common/TopBar';
import { RightDashboardPanel } from './components/layout/RightDashboardPanel';

// Sarthi AI & Companion Components
import { SarthiFloatingTrigger } from './components/sarthi/SarthiFloatingTrigger';
import { Modal } from './components/common/Modal';
import { LanguageWelcomeModal } from './components/common/LanguageWelcomeModal';
import { SarthiCompanionModal } from './components/sarthi/SarthiCompanionModal';
import { AISaathiHealthCompanion } from './components/sarthi/AISaathiHealthCompanion';

// Dashboards & Caregiver Flows
import { ElderlyHome } from './components/elderly/ElderlyHome';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { CaregiverSessionSetup } from './components/caregiver/CaregiverSessionSetup';
import { CaregiverSessionSummary } from './components/caregiver/CaregiverSessionSummary';

// Games
import { GamesHub } from './components/games/GamesHub';
import { MemoryMatch } from './components/games/MemoryMatch';
import { TeaGardenFocus } from './components/games/TeaGardenFocus';
import { BrainQuest } from './components/games/BrainQuest';
import { PatternWeave } from './components/games/PatternWeave';
import { RoutineBuilder } from './components/games/RoutineBuilder';
import { SoundsOfHills } from './components/games/SoundsOfHills';
import { FamilyRecall } from './components/games/FamilyRecall';

// Care & Wellness Modules
import { FamilyManager } from './components/family/FamilyManager';
import { MedicationReminders } from './components/reminders/MedicationReminders';
import { CalmingSanctuary } from './components/calming/CalmingSanctuary';
import { SafeCard } from './components/emergency/SafeCard';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('elderly');
  const [view, setView] = useState<AppView>('home');
  const [selectedGame, setSelectedGame] = useState<GameId>('memory_match');
  const [patient, setPatient] = useState<PatientProfile>(() => storage.loadPatientProfile());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => storage.loadFamilyMembers());
  const [language, setLanguage] = useState<Language>(() => storage.loadLanguage() || 'en');
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isLanguageSelectOpen, setIsLanguageSelectOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? !localStorage.getItem('smritisetu_has_picked_language') : false;
  });
  const [isSarthiOpen, setIsSarthiOpen] = useState<boolean>(false);
  const [isAISaathiOpen, setIsAISaathiOpen] = useState<boolean>(false);
  const [aiSaathiInitialQuery, setAiSaathiInitialQuery] = useState<string>('');
  const [sessions, setSessions] = useState<CognitiveSession[]>(() => storage.loadCognitiveHistory());
  const [waterCount, setWaterCount] = useState<number>(() => storage.loadWaterCount());

  // Caregiver-led session state
  const [activeCaregiverSession, setActiveCaregiverSession] = useState<{
    gameId: GameId;
    moodTag?: 'calm' | 'cheerful' | 'reflective' | 'low_energy';
    caregiverNote?: string;
    startTime: number;
  } | null>(null);

  const [lastCompletedSession, setLastCompletedSession] = useState<{
    gameId: GameId;
    durationSeconds: number;
    initialMood?: 'calm' | 'cheerful' | 'reflective' | 'low_energy';
    initialNote?: string;
  } | null>(null);

  const handleOpenAISaathi = (query?: string) => {
    setAiSaathiInitialQuery(query || '');
    setIsAISaathiOpen(true);
  };

  // Keep sessions and waterCount updated across views
  useEffect(() => {
    setSessions(storage.loadCognitiveHistory());
    setWaterCount(storage.loadWaterCount());
  }, [view, mode]);

  // Sync language changes
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    storage.saveLanguage(newLang);
    const updatedPatient = { ...patient, language: newLang, preferredLanguage: newLang };
    setPatient(updatedPatient);
    storage.savePatientProfile(updatedPatient);
  };

  const handleSelectGame = (gameId: GameId) => {
    setSelectedGame(gameId);
    setActiveCaregiverSession({
      gameId,
      startTime: Date.now(),
    });
    setView('game_detail');
  };

  const handleStartCaregiverSession = (
    gameId: GameId,
    moodTag?: 'calm' | 'cheerful' | 'reflective' | 'low_energy',
    caregiverNote?: string
  ) => {
    setSelectedGame(gameId);
    setActiveCaregiverSession({
      gameId,
      moodTag,
      caregiverNote,
      startTime: Date.now(),
    });
    setView('game_detail');
  };

  const handleFinishGameSession = () => {
    const duration = activeCaregiverSession
      ? Math.max(1, Math.round((Date.now() - activeCaregiverSession.startTime) / 1000))
      : 300;
    setLastCompletedSession({
      gameId: selectedGame,
      durationSeconds: duration,
      initialMood: activeCaregiverSession?.moodTag,
      initialNote: activeCaregiverSession?.caregiverNote,
    });
    setActiveCaregiverSession(null);
    setView('session_summary');
  };

  const handlePatientSwitch = (newPatient: PatientProfile) => {
    setPatient(newPatient);
    setLanguage(newPatient.language || 'en');
    storage.savePatientProfile(newPatient);
    storage.saveLanguage(newPatient.language || 'en');
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'memory_match':
        return (
          <MemoryMatch
            language={language}
            familyMembers={familyMembers}
            onBack={() => setView('games')}
            onFinishSession={handleFinishGameSession}
          />
        );
      case 'tea_garden':
        return (
          <TeaGardenFocus
            language={language}
            onBack={() => setView('games')}
            onFinishSession={handleFinishGameSession}
          />
        );
      case 'brain_quest':
        return (
          <BrainQuest
            language={language}
            onBack={() => setView('games')}
            onFinishSession={handleFinishGameSession}
          />
        );
      case 'pattern_weave':
        return (
          <PatternWeave
            language={language}
            onBack={() => setView('games')}
            onFinishSession={handleFinishGameSession}
          />
        );
      case 'routine_builder':
        return (
          <RoutineBuilder
            language={language}
            onBack={() => setView('games')}
            onFinishSession={handleFinishGameSession}
          />
        );
      case 'sounds_hills':
        return (
          <SoundsOfHills
            language={language}
            onBack={() => setView('games')}
            onFinishSession={handleFinishGameSession}
          />
        );
      case 'family_recall':
        return (
          <FamilyRecall
            language={language}
            familyMembers={familyMembers}
            onBack={() => setView('games')}
            onFinishSession={handleFinishGameSession}
          />
        );
      default:
        return (
          <GamesHub
            language={language}
            onSelectGame={handleSelectGame}
            onStartCaregiverSession={() => setView('caregiver_session')}
            onBack={() => setView('home')}
          />
        );
    }
  };

  const renderElderlyView = () => {
    switch (view) {
      case 'caregiver_session':
        return (
          <CaregiverSessionSetup
            language={language}
            patient={patient}
            onStartSession={handleStartCaregiverSession}
            onBack={() => setView('home')}
          />
        );
      case 'session_summary':
        return (
          <CaregiverSessionSummary
            language={language}
            patient={patient}
            gameId={lastCompletedSession?.gameId || selectedGame}
            durationSeconds={lastCompletedSession?.durationSeconds || 300}
            initialMood={lastCompletedSession?.initialMood}
            initialNote={lastCompletedSession?.initialNote}
            onReturnHome={() => setView('home')}
            onPlayAnother={() => setView('caregiver_session')}
          />
        );
      case 'games':
        return (
          <GamesHub
            language={language}
            onSelectGame={handleSelectGame}
            onStartCaregiverSession={() => setView('caregiver_session')}
            onBack={() => setView('home')}
          />
        );
      case 'game_detail':
        return renderGame();
      case 'family':
        return (
          <FamilyManager
            language={language}
            onBack={() => setView('home')}
            onRefresh={() => setFamilyMembers(storage.loadFamilyMembers())}
          />
        );
      case 'reminders':
        return (
          <MedicationReminders
            language={language}
            onBack={() => setView('home')}
          />
        );
      case 'calming':
        return (
          <CalmingSanctuary
            language={language}
            onBack={() => setView('home')}
          />
        );
      case 'emergency':
        return (
          <SafeCard
            language={language}
            patient={patient}
            onBack={() => setView('home')}
          />
        );
      case 'home':
      default:
        return (
          <ElderlyHome
            language={language}
            patient={patient}
            sessions={sessions}
            hydrationGlasses={waterCount}
            onNavigate={(newView, gameId) => {
              if (newView === 'game_detail' && gameId) {
                setSelectedGame(gameId);
                setView('game_detail');
              } else {
                setView(newView);
              }
            }}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenSarthiModal={() => setIsSarthiOpen(true)}
            onOpenAISaathi={handleOpenAISaathi}
          />
        );
    }
  };

  return (
    <LanguageProvider initialLanguage={language} onLanguageChange={handleLanguageChange}>
      <div
        className="min-h-screen p-2 sm:p-3 lg:p-4 text-[#1F342A] font-sans antialiased selection:bg-[#E4EBDD]"
        style={{
          background: 'linear-gradient(135deg, #FAF6EE 0%, #F7F1E7 45%, #F3EBDD 100%) fixed',
        }}
      >
        {/* BEGIN: MainDashboardWrapper (Reference 1 Layout Container) */}
        <div
          className="max-w-[1580px] mx-auto rounded-[22px] flex overflow-hidden min-h-[940px] relative border border-[rgba(70,80,60,0.08)] shadow-cognitiva"
          style={{
            background: 'linear-gradient(135deg, #FAF6EE 0%, #F8F3E9 60%, #F4EFE6 100%)',
          }}
        >
          {/* Background Decorative Botanical Watermark SVGs */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <svg
              className="absolute -top-12 -right-12 w-64 h-64 text-[#365A46]/[0.035] rotate-45 select-none"
              fill="currentColor"
              viewBox="0 0 100 100"
            >
              <path d="M50 5 C65 25 80 40 95 50 C75 55 60 70 50 95 C40 70 25 55 5 50 C25 40 40 25 50 5 Z"></path>
              <path
                d="M50 15 C58 32 72 42 85 50 C68 53 58 68 50 85 C42 68 32 53 15 50 C28 42 42 32 50 15 Z"
                opacity="0.6"
              ></path>
            </svg>
            <svg
              className="absolute -bottom-16 -left-12 w-72 h-72 text-[#52745C]/[0.03] -rotate-12 select-none"
              fill="currentColor"
              viewBox="0 0 100 100"
            >
              <path d="M20,80 Q35,40 80,20 Q60,60 20,80 Z"></path>
              <path d="M30,70 Q45,35 75,30" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
              <path d="M40,55 Q55,42 68,48" fill="none" stroke="currentColor" strokeWidth="1"></path>
            </svg>
          </div>

          {/* Desktop Left Sidebar */}
          <div className="hidden md:flex">
            <Sidebar
              currentView={view}
              currentMode={mode}
              language={language}
              onNavigate={(newView) => setView(newView)}
              onToggleMode={(newMode) => {
                setMode(newMode);
                if (newMode === 'elderly') setView('home');
              }}
              onOpenAISaathi={() => handleOpenAISaathi()}
              onOpenSOS={() => setIsSOSOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          </div>

          {/* Mobile Overlay Sidebar Drawer */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden bg-black/40 backdrop-blur-xs">
              <div className="w-64 max-w-[80vw] h-full shadow-2xl bg-[#F8F3E9] z-50 flex flex-col">
                <Sidebar
                  currentView={view}
                  currentMode={mode}
                  language={language}
                  onNavigate={(newView) => setView(newView)}
                  onToggleMode={(newMode) => {
                    setMode(newMode);
                    if (newMode === 'elderly') setView('home');
                  }}
                  onOpenAISaathi={() => handleOpenAISaathi()}
                  onOpenSOS={() => setIsSOSOpen(true)}
                  onOpenOnboarding={() => setIsOnboardingOpen(true)}
                  onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
                />
              </div>
              <div
                className="flex-1"
                onClick={() => setIsMobileDrawerOpen(false)}
              ></div>
            </div>
          )}

          {/* BEGIN: Main Content Area (TopBar + Center Content + Right Panel) */}
          <div
            className="flex-1 flex flex-col min-w-0"
            style={{
              background:
                'radial-gradient(circle at 85% 10%, rgba(244, 239, 228, 0.7) 0%, rgba(250, 246, 238, 0.95) 55%, #FAF6EE 100%)',
            }}
          >
            {/* Top Navigation Bar */}
            <TopBar
              mode={mode}
              onToggleMode={(newMode) => {
                setMode(newMode);
                if (newMode === 'elderly') setView('home');
              }}
              language={language}
              onLanguageChange={handleLanguageChange}
              activePatient={patient}
              onOpenSOS={() => setIsSOSOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenLanguageModal={() => setIsLanguageSelectOpen(true)}
              onOpenSarthiModal={() => setIsSarthiOpen(true)}
              onSearchQuery={(q) => handleOpenAISaathi(q)}
              onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
            />

            {/* BEGIN: Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col xl:flex-row gap-6">
              {/* Center Column: Active View Feed */}
              <main className="flex-1 space-y-6 min-w-0">
                {mode === 'caregiver' ? (
                  <CaregiverDashboard
                    language={language}
                    activePatient={patient}
                    sessions={sessions}
                    onSwitchPatient={handlePatientSwitch}
                    onOpenOnboarding={() => setIsOnboardingOpen(true)}
                  />
                ) : (
                  renderElderlyView()
                )}
              </main>

              {/* Right Column: Health Telemetry & Medication Panel */}
              <RightDashboardPanel
                language={language}
                activePatient={patient}
                onNavigate={(newView) => setView(newView)}
                onOpenAISaathi={(q) => handleOpenAISaathi(q)}
                onOpenSOS={() => setIsSOSOpen(true)}
              />
            </div>
            {/* END: Content Scroll Area */}
          </div>
          {/* END: Main Content Area */}
        </div>
        {/* END: MainDashboardWrapper */}

        {/* Floating Sarthi Cognitive Care Companion Button */}
        <SarthiFloatingTrigger
          language={language}
          onClick={() => handleOpenAISaathi()}
        />

        {/* AI Saathi Intelligent Health Companion Modal */}
        <AISaathiHealthCompanion
          isOpen={isAISaathiOpen}
          onClose={() => setIsAISaathiOpen(false)}
          language={language}
          initialQuery={aiSaathiInitialQuery}
          onOpenSOS={() => {
            setIsAISaathiOpen(false);
            setMode('elderly');
            setView('emergency');
          }}
          onNavigate={(targetView, targetGameId) => {
            setIsAISaathiOpen(false);
            setMode('elderly');
            if (targetView === 'game_detail' && targetGameId) {
              setSelectedGame(targetGameId);
              setView('game_detail');
            } else {
              setView(targetView);
            }
          }}
        />

        {/* Sarthi AI Cognitive Care Companion Interactive Modal */}
        <SarthiCompanionModal
          isOpen={isSarthiOpen}
          onClose={() => setIsSarthiOpen(false)}
          language={language}
          patient={patient}
          sessions={sessions}
          hydrationGlasses={waterCount}
          currentView={view}
          currentGameId={selectedGame}
          onLanguageChange={handleLanguageChange}
          onOpenSOS={() => {
            setMode('elderly');
            setView('emergency');
          }}
          onOpenCaregiver={() => {
            setMode('caregiver');
          }}
          onNavigate={(targetView, targetGameId) => {
            setIsSarthiOpen(false);
            setMode('elderly');
            if (targetView === 'game_detail' && targetGameId) {
              setSelectedGame(targetGameId);
              setView('game_detail');
            } else {
              setView(targetView);
            }
          }}
        />

        {/* Language Welcome & Selection Modal on Start */}
        <LanguageWelcomeModal
          isOpen={isLanguageSelectOpen}
          currentLanguage={language}
          onSelectLanguage={(newLang) => {
            handleLanguageChange(newLang);
            localStorage.setItem('smritisetu_has_picked_language', 'true');
            setIsLanguageSelectOpen(false);
          }}
          onClose={() => setIsLanguageSelectOpen(false)}
          canClose={typeof window !== 'undefined' && !!localStorage.getItem('smritisetu_has_picked_language')}
        />

        {/* Emergency SOS Modal */}
        <Modal
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
          title={t('elderlyHome.sosHelpTitle', language)}
          subtitle={t('elderlyHome.sosHelpSubtitle', language)}
          maxWidth="2xl"
        >
          <SafeCard
            language={language}
            patient={patient}
            onBack={() => setIsSOSOpen(false)}
          />
        </Modal>

        {/* Onboarding Wizard Modal */}
        <Modal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          title={t('onboarding.welcomeTitle', language)}
          subtitle={t('onboarding.welcomeSubtitle', language)}
          maxWidth="2xl"
        >
          <OnboardingWizard
            language={language}
            onComplete={(updatedPatient) => {
              setPatient(updatedPatient);
              handleLanguageChange(updatedPatient.language);
              setIsOnboardingOpen(false);
            }}
            onCancel={() => setIsOnboardingOpen(false)}
          />
        </Modal>
      </div>
    </LanguageProvider>
  );
};

export default App;

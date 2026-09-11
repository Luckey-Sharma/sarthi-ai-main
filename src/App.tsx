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

// Common Components
import { TopBar } from './components/common/TopBar';
import { SarthiFloatingTrigger } from './components/sarthi/SarthiFloatingTrigger';
import { Modal } from './components/common/Modal';
import { LanguageWelcomeModal } from './components/common/LanguageWelcomeModal';
import { SarthiCompanionModal } from './components/sarthi/SarthiCompanionModal';

// Dashboards
import { ElderlyHome } from './components/elderly/ElderlyHome';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';

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
  const [isLanguageSelectOpen, setIsLanguageSelectOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? !localStorage.getItem('smritisetu_has_picked_language') : false;
  });
  const [isSarthiOpen, setIsSarthiOpen] = useState<boolean>(false);
  const [sessions, setSessions] = useState<CognitiveSession[]>(() => storage.loadCognitiveHistory());
  const [waterCount, setWaterCount] = useState<number>(() => storage.loadWaterCount());

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
    setView('game_detail');
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
          />
        );
      case 'tea_garden':
        return (
          <TeaGardenFocus
            language={language}
            onBack={() => setView('games')}
          />
        );
      case 'brain_quest':
        return (
          <BrainQuest
            language={language}
            onBack={() => setView('games')}
          />
        );
      case 'pattern_weave':
        return (
          <PatternWeave
            language={language}
            onBack={() => setView('games')}
          />
        );
      case 'routine_builder':
        return (
          <RoutineBuilder
            language={language}
            onBack={() => setView('games')}
          />
        );
      case 'sounds_hills':
        return (
          <SoundsOfHills
            language={language}
            onBack={() => setView('games')}
          />
        );
      case 'family_recall':
        return (
          <FamilyRecall
            language={language}
            familyMembers={familyMembers}
            onBack={() => setView('games')}
          />
        );
      default:
        return (
          <GamesHub
            language={language}
            onSelectGame={handleSelectGame}
            onBack={() => setView('home')}
          />
        );
    }
  };

  const renderElderlyView = () => {
    switch (view) {
      case 'games':
        return (
          <GamesHub
            language={language}
            onSelectGame={handleSelectGame}
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
          />
        );
    }
  };

  return (
    <LanguageProvider initialLanguage={language} onLanguageChange={handleLanguageChange}>
      <div className="min-h-screen bg-stone-100/60 flex flex-col font-sans selection:bg-emerald-200">
        {/* Top Header */}
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
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
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

        {/* Floating Sarthi Cognitive Care Companion Button */}
        <SarthiFloatingTrigger
          language={language}
          onClick={() => setIsSarthiOpen(true)}
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

import React, { useState, useEffect, useRef } from 'react';
import {
  Language,
  PatientProfile,
  CognitiveSession,
  SarthiRecommendation,
  SarthiChatMessage,
  SarthiContext,
  AppView,
  GameId,
  NavigationIntent,
  SarthiHealthCard,
  SyncStatus,
  WebSearchSource,
} from '../../types';
import {
  generateSarthiRecommendation,
  handleQuickAction,
} from '../../services/sarthiEngine';
import { askSarthiWithGemini } from '../../services/sarthiApi';
import {
  speak,
  stopSpeaking,
  startListening,
  stopListening,
  isSpeechRecognitionSupported,
} from '../../services/voiceService';
import { subscribeSyncStatus } from '../../services/syncService';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  Info,
  Heart,
  Pill,
  Gamepad2,
  Send,
  Mic,
  MicOff,
  Compass,
  ArrowRight,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Home,
  Clock,
  ShieldCheck,
  WifiOff,
  Wifi,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface SarthiCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  patient: PatientProfile;
  sessions: CognitiveSession[];
  hydrationGlasses: number;
  currentView?: AppView;
  currentGameId?: GameId;
  onNavigate: (view: AppView, gameId?: GameId) => void;
  onLanguageChange?: (lang: Language) => void;
  onOpenSOS?: () => void;
  onOpenCaregiver?: () => void;
}

export const SarthiCompanionModal: React.FC<SarthiCompanionModalProps> = ({
  isOpen,
  onClose,
  language,
  patient,
  sessions,
  hydrationGlasses,
  currentView = 'home',
  currentGameId,
  onNavigate,
  onLanguageChange,
  onOpenSOS,
  onOpenCaregiver,
}) => {
  const [messages, setMessages] = useState<SarthiChatMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [micFeedback, setMicFeedback] = useState<string>('');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online');
  const [showDemoBar, setShowDemoBar] = useState<boolean>(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Monitor connectivity via SyncService (server-verified, not just navigator.onLine)
  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status) => {
      setSyncStatus(status);
      setIsOfflineMode(status === 'offline');
    });
    return unsubscribe;
  }, []);

  const getSarthiContext = (): SarthiContext => ({
    patient,
    language,
    recentSessions: sessions.slice(-5),
    allSessions: sessions,
    routineAdherence: 85,
    hydrationGlasses,
    currentPage: {
      view: currentView,
      gameId: currentGameId,
    },
  });

  // Initialize greeting and recommendation when opened
  useEffect(() => {
    if (isOpen) {
      const context = getSarthiContext();
      const initialRec = generateSarthiRecommendation(context);

      const initialMessage: SarthiChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'sarthi',
        text: initialRec.patientMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: initialRec,
        isGemini: false,
        isWorkingOffline: isOfflineMode,
      };

      setMessages([initialMessage]);

      // If online, enrich greeting with Gemini
      let isMounted = true;
      if (!isOfflineMode) {
        askSarthiWithGemini(context).then((apiRes) => {
          if (!isMounted || !apiRes.isGemini) return;
          setMessages((prev) => {
            if (prev.length === 1 && prev[0].sender === 'sarthi') {
              return [
                {
                  ...prev[0],
                  text: apiRes.message,
                  recommendation: {
                    ...apiRes.deterministicRec,
                    patientMessage: apiRes.message,
                    caregiverInsight: apiRes.caregiverNote || apiRes.deterministicRec.caregiverInsight,
                  },
                  isGemini: true,
                  isWorkingOffline: apiRes.isWorkingOffline,
                },
              ];
            }
            return prev;
          });
        });
      }

      return () => {
        isMounted = false;
        stopSpeaking();
        stopListening();
        setIsSpeaking(false);
        setIsListeningMic(false);
      };
    } else {
      stopSpeaking();
      stopListening();
      setIsSpeaking(false);
      setIsListeningMic(false);
    }
  }, [isOpen, language, patient.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, micFeedback]);

  if (!isOpen) return null;

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);
    speak(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const executeNavigationIntent = (
    intent?: NavigationIntent,
    target?: { view?: AppView; gameId?: GameId; language?: Language; openSOS?: boolean }
  ) => {
    if (!intent && !target) return;

    if (intent === 'CHANGE_LANGUAGE' && target?.language && onLanguageChange) {
      onLanguageChange(target.language);
      onClose();
      return;
    }

    if ((intent === 'OPEN_SAFE_CARD' || target?.openSOS) && onOpenSOS) {
      onOpenSOS();
      onClose();
      return;
    }

    if (intent === 'OPEN_CAREGIVER_DASHBOARD' && onOpenCaregiver) {
      onOpenCaregiver();
      onClose();
      return;
    }

    if (target?.view === 'game_detail' && target?.gameId) {
      onNavigate('game_detail', target.gameId);
      onClose();
      return;
    }

    if (target?.view) {
      onNavigate(target.view, target.gameId);
      onClose();
      return;
    }

    // Default fallback
    onNavigate('home');
    onClose();
  };

  const executeRecommendation = (rec: SarthiRecommendation) => {
    if (!rec.suggestedAction) return;

    if (rec.suggestedAction.view === 'emergency' && onOpenSOS) {
      onOpenSOS();
      onClose();
      return;
    }

    if (rec.suggestedAction.view === 'game_detail' && rec.suggestedAction.gameId) {
      onNavigate('game_detail', rec.suggestedAction.gameId);
      onClose();
      return;
    }

    if (rec.suggestedAction.view) {
      onNavigate(rec.suggestedAction.view, rec.suggestedAction.gameId);
      onClose();
    }
  };

  // Dispatch query to Sarthi (safety, navigation, health, or conversational)
  const processQuery = async (query: string, quickActionKey?: string) => {
    if (isThinking) return;

    // Add user message
    const userMsg: SarthiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setMicFeedback('');

    const context = getSarthiContext();

    try {
      const apiRes = await askSarthiWithGemini(context, query, quickActionKey);

      const sarthiMsg: SarthiChatMessage = {
        id: `sarthi-${Date.now() + 1}`,
        sender: 'sarthi',
        text: apiRes.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: {
          ...apiRes.deterministicRec,
          patientMessage: apiRes.message,
          caregiverInsight: apiRes.caregiverNote || apiRes.deterministicRec.caregiverInsight,
        },
        healthCard: apiRes.healthCard,
        navigationIntent: apiRes.navigationIntent,
        navigationTarget: apiRes.navigationTarget,
        safetyCategory: apiRes.safetyCategory,
        isGemini: apiRes.isGemini,
        isWorkingOffline: apiRes.isWorkingOffline,
        intent: apiRes.intent,
        sources: apiRes.sources,
        searchPerformed: apiRes.searchPerformed,
      };

      setMessages((prev) => [...prev, sarthiMsg]);
    } catch {
      const rec = quickActionKey
        ? handleQuickAction(quickActionKey, context)
        : generateSarthiRecommendation(context);

      const sarthiMsg: SarthiChatMessage = {
        id: `sarthi-${Date.now() + 1}`,
        sender: 'sarthi',
        text: rec.patientMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: rec,
        isGemini: false,
        isWorkingOffline: true,
      };
      setMessages((prev) => [...prev, sarthiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectQuickAction = (actionKey: string, actionLabel: string) => {
    processQuery(actionLabel, actionKey);
  };

  const handleSendCustomMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = customInput.trim();
    if (!query || isThinking) return;

    setCustomInput('');
    processQuery(query);
  };

  // Toggle Speech-to-Text Microphone
  const handleToggleMic = () => {
    if (isListeningMic) {
      stopListening();
      setIsListeningMic(false);
      setMicFeedback('');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setMicFeedback(
        language === 'hi'
          ? 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।'
          : language === 'as'
          ? 'এই ব্ৰাউজাৰত কণ্ঠ ইনপুট উপলব্ধ নহয়।'
          : language === 'bn'
          ? 'এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।'
          : language === 'mni'
          ? 'Voice input asi browser asida yaodre.'
          : 'Voice input not supported in this browser. Please type your query.'
      );
      return;
    }

    stopSpeaking();
    setIsSpeaking(false);
    setIsListeningMic(true);
    setMicFeedback(
      language === 'hi'
        ? 'सुन रहे हैं... कृपया बोलें'
        : language === 'as'
        ? 'শুনি আছোঁ... অনুগ্ৰহ কৰি কওক'
        : language === 'bn'
        ? 'শুনছি... দয়া করে বলুন'
        : language === 'mni'
        ? 'Tabari... Chanbiduna haibiyu'
        : 'Listening... Please speak clearly'
    );

    startListening({
      lang: language,
      onResult: (transcript, isFinal) => {
        setCustomInput(transcript);
        if (isFinal && transcript.trim()) {
          stopListening();
          setIsListeningMic(false);
          setMicFeedback('');
          processQuery(transcript.trim());
          setCustomInput('');
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListeningMic(false);
        setMicFeedback(
          language === 'hi'
            ? 'माइक समझ नहीं सका। कृपया पुनः प्रयास करें या लिखें।'
            : 'Could not hear clearly. Please try again or type.'
        );
      },
      onEnd: () => {
        setIsListeningMic(false);
      },
    });
  };

  // The 7 Required Elderly Quick Actions
  const QUICK_ACTIONS = [
    {
      key: 'how_am_i_doing',
      icon: <HelpCircle className="w-5 h-5 text-emerald-600" />,
      label: {
        en: 'How am I doing?',
        hi: 'मेरा प्रदर्शन कैसा है?',
        as: 'মোৰ প্ৰদৰ্শন কেনে হৈছে?',
        bn: 'আমার কেমন উন্নতি হচ্ছে?',
        mni: 'Eigi khrang kaimandaba?',
      }[language] || 'How am I doing?',
    },
    {
      key: 'play_game',
      icon: <Gamepad2 className="w-5 h-5 text-amber-600" />,
      label: {
        en: 'Play a game',
        hi: 'कोई खेल खेलें',
        as: 'এটা খেল খেলোঁ আহক',
        bn: 'একটি খেলা খেলি',
        mni: 'Khel amata sanasi',
      }[language] || 'Play a game',
    },
    {
      key: 'what_next',
      icon: <Clock className="w-5 h-5 text-teal-600" />,
      label: {
        en: 'What should I do now?',
        hi: 'अब मुझे क्या करना चाहिए?',
        as: 'এতিয়া মই কি কৰিম?',
        bn: 'এখন আমার কী করা উচিত?',
        mni: 'Houjik kari tougani?',
      }[language] || 'What should I do now?',
    },
    {
      key: 'reminders',
      icon: <Pill className="w-5 h-5 text-blue-600" />,
      label: {
        en: 'My reminders',
        hi: 'मेरी दवा व दिनचर्या',
        as: 'মোৰ ঔষধ আৰু নিয়ম',
        bn: 'আমার ওষুধ ও রুটিন',
        mni: 'Eigi hidak & routine',
      }[language] || 'My reminders',
    },
    {
      key: 'health_question',
      icon: <BookOpen className="w-5 h-5 text-purple-600" />,
      label: {
        en: 'Ask a health question',
        hi: 'स्वास्थ्य के बारे में पूछें',
        as: 'স্বাস্থ্য সম্পৰ্কে সোধক',
        bn: 'স্বাস্থ্য সম্পর্কে জানুন',
        mni: 'Hakselgi maramda hangbiyu',
      }[language] || 'Ask a health question',
    },
    {
      key: 'take_me_home',
      icon: <Home className="w-5 h-5 text-indigo-600" />,
      label: {
        en: 'Take me home',
        hi: 'मुझे होम स्क्रीन ले चलो',
        as: 'মোক ঘৰলৈ লৈ যাওক',
        bn: 'আমাকে হোম পেজে নিয়ে যান',
        mni: 'Mayumda chatlasi',
      }[language] || 'Take me home',
    },
    {
      key: 'talk',
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      label: {
        en: 'I want to talk',
        hi: 'बातचीत करना चाहता हूँ',
        as: 'মই কথা পাতিব বিচাৰোঁ',
        bn: 'কথা বলতে চাই',
        mni: 'Wari sarasi',
      }[language] || 'I want to talk',
    },
  ];

  // SIH Live Demo Scenarios A through J for Judges
  const SIH_DEMO_SCENARIOS = [
    { id: 'A', title: 'A: Dementia Info', query: 'What is dementia?' },
    { id: 'B', title: 'B: Memory Qs', query: 'Why do older people have memory problems?' },
    { id: 'C', title: 'C: Hydration', query: 'Why is hydration important for memory?' },
    { id: 'D', title: 'D: Open Tea Garden', query: 'Open Tea Garden Focus' },
    { id: 'E', title: 'E: Take to Memory Game', query: 'Take me to memory game' },
    { id: 'F', title: 'F: Emergency Intercept', query: 'Severe chest pain, cannot breathe' },
    { id: 'G', title: 'G: Sudden Confusion', query: 'Sudden severe confusion since morning' },
    { id: 'H', title: 'H: Medication Refusal', query: 'Can I stop my blood pressure medicine?' },
    { id: 'I', title: 'I: Unknown Page Nav', query: 'Take me to space travel' },
    { id: 'J', title: 'J: How am I doing?', query: 'How am I doing today?' },
  ];

  // Helper for rendering structured Health Cards
  const renderHealthCard = (card: SarthiHealthCard) => {
    const labels = {
      en: {
        means: 'WHAT IT MEANS',
        matters: 'WHY IT MATTERS',
        actions: 'WHAT YOU CAN DO',
        help: 'WHEN TO ASK FOR HELP',
        nonClinical: 'General Health Information • Non-Diagnostic Guide',
      },
      hi: {
        means: 'इसका क्या अर्थ है',
        matters: 'यह क्यों महत्वपूर्ण है',
        actions: 'आप क्या कर सकते हैं',
        help: 'डॉक्टर से कब संपर्क करें',
        nonClinical: 'सामान्य स्वास्थ्य जानकारी • गैर-नैदानिक मार्गदर्शन',
      },
      as: {
        means: 'ইয়াৰ অৰ্থ কি',
        matters: 'ই কিয় গুৰুত্বপূৰ্ণ',
        actions: 'আপুনি কি কৰিব পাৰে',
        help: 'কেতিয়া সহায় বিচাৰিব',
        nonClinical: 'সাধাৰণ স্বাস্থ্য তথ্য • অনা-চিকিৎসাজনিত সহায়ক',
      },
      bn: {
        means: 'এর অর্থ কী',
        matters: 'এটি কেন গুরুত্বপূর্ণ',
        actions: 'আপনি কী করতে পারেন',
        help: 'কখন ডাক্তারের পরামর্শ নেবেন',
        nonClinical: 'সাধারণ স্বাস্থ্য তথ্য • পরামর্শমূলক নির্দেশিকা',
      },
      mni: {
        means: 'Masi kari haibano',
        matters: 'Masi maru oibagi maram',
        actions: 'Nangna kari touba yagani',
        help: 'Matam karamda doctor da utkani',
        nonClinical: 'General Health Information • Non-Diagnostic Guide',
      },
    }[language] || {
      means: 'WHAT IT MEANS',
      matters: 'WHY IT MATTERS',
      actions: 'WHAT YOU CAN DO',
      help: 'WHEN TO ASK FOR HELP',
      nonClinical: 'General Health Information • Non-Diagnostic Guide',
    };

    return (
      <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-[#f7faf5] border border-[#becabf] text-[#181d19] space-y-4 shadow-xs font-sans">
        {/* Card Title & Non-Clinical Tag */}
        <div className="flex items-start justify-between gap-2 border-b border-[#ecefea] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#032517] bg-[#bfebba]/50 px-2.5 py-0.5 rounded-full border border-[#83a590]/40">
              {labels.nonClinical}
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#032517] mt-1.5 leading-snug">
              {card.title}
            </h3>
          </div>
          <button
            onClick={() => handleSpeakText(`${card.title}. ${card.whatItMeans}. ${card.whyItMatters}. ${Array.isArray(card.whatYouCanDo) ? card.whatYouCanDo.join('. ') : card.whatYouCanDo}. ${card.whenToAskForHelp}`)}
            className="p-2 rounded-xl bg-white text-[#032517] hover:bg-[#ecefea] border border-[#becabf]/60 transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="Read health card aloud"
          >
            <Volume2 className="w-4 h-4 text-[#416740]" />
          </button>
        </div>

        {/* 1. What It Means */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#416740] uppercase tracking-wide">
            <BookOpen className="w-4 h-4 text-[#416740] shrink-0" />
            <span>{labels.means}</span>
          </div>
          <p className="text-sm sm:text-base font-medium text-[#181d19] pl-5 leading-relaxed">
            {card.whatItMeans}
          </p>
        </div>

        {/* 2. Why It Matters */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#456c44] uppercase tracking-wide">
            <Lightbulb className="w-4 h-4 text-[#456c44] shrink-0" />
            <span>{labels.matters}</span>
          </div>
          <p className="text-sm sm:text-base font-medium text-[#181d19] pl-5 leading-relaxed">
            {card.whyItMatters}
          </p>
        </div>

        {/* 3. What You Can Do */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#032517] uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-[#416740] shrink-0" />
            <span>{labels.actions}</span>
          </div>
          <div className="pl-5 text-sm sm:text-base font-medium text-[#181d19] space-y-1">
            {Array.isArray(card.whatYouCanDo) ? (
              <ul className="list-disc list-inside space-y-1">
                {card.whatYouCanDo.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
              </ul>
            ) : (
              <p>{card.whatYouCanDo}</p>
            )}
          </div>
        </div>

        {/* 4. When To Ask For Help */}
        <div className="p-3.5 bg-[#ffdbd1]/40 border border-[#ffdbd1] rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#631d08] uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-[#631d08] shrink-0" />
            <span>{labels.help}</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#420b00] leading-relaxed pl-5">
            {card.whenToAskForHelp}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FAF6EE] rounded-[32px] shadow-2xl border border-[rgba(70,80,60,0.15)] max-w-2xl w-full flex flex-col h-[92vh] max-h-[760px] overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#1F342A] via-[#263F33] to-[#1F342A] text-white p-4 sm:p-5 flex items-center justify-between shadow-md shrink-0 border-b border-[#708A74]/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-[26px] text-[#D9E8D8]">spa</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#FAF6EE]">
                  {language === 'as' || language === 'bn' ? 'সাৰথী' : 'Sarthi'}
                </h2>
                <span className="text-[10px] sm:text-xs font-bold text-[#1F342A] bg-[#D9E8D8] px-2.5 py-0.5 rounded-full border border-[#708A74]/40">
                  {language === 'hi' ? 'संज्ञानात्मक साथी' : language === 'as' ? 'জ্ঞাত্বী সহায়ক' : language === 'bn' ? 'কগনিটিভ সঙ্গী' : 'Care Companion'}
                </span>
                {syncStatus === 'offline' && (
                  <span className="text-[10px] font-bold bg-[#BF5844] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    <span>Offline</span>
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="text-[10px] font-bold bg-[#FFF6D6] text-[#785E22] border border-[#E0D5B5] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Syncing...</span>
                  </span>
                )}
                {syncStatus === 'synced' && (
                  <span className="text-[10px] font-bold bg-[#D9E8D8] text-[#1F342A] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#708A74]" />
                    <span>Synced</span>
                  </span>
                )}
                {syncStatus === 'online' && (
                  <span className="text-[10px] font-bold bg-[#D9E8D8] text-[#1F342A] border border-[#708A74]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-[#708A74]" />
                    <span>Connected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#D9E8D8]/80 font-medium">
                {patient.name} • SafeNet AI • Non-Diagnostic Companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <button
                onClick={handleStopSpeaking}
                className="px-3.5 py-1.5 rounded-xl bg-[#BF5844] hover:bg-[#a64835] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                title="Stop Speaking"
              >
                <VolumeX className="w-4 h-4" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => messages[messages.length - 1] && handleSpeakText(messages[messages.length - 1].text)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF6EE] cursor-pointer transition-colors"
                title="Read Aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* SIH Live Demo Scenarios Bar for Evaluators / Testing */}
        <div className="bg-[#263F33] text-white px-3 py-2 border-b border-[#708A74]/30 shrink-0 text-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-bold text-[#FFF6D6] text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF6D6]" />
            <span>SIH Scenarios:</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {SIH_DEMO_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => processQuery(sc.query)}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF6EE] font-bold text-[11px] whitespace-nowrap transition-colors border border-white/10 cursor-pointer"
                title={sc.query}
              >
                {sc.title}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF6EE]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[88%] rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(70,80,60,0.05)] space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#1F342A] text-white rounded-tr-xs'
                    : msg.safetyCategory === 'EMERGENCY'
                    ? 'bg-[#FDECEF] border-2 border-[#BF5844] text-[#7A2818] rounded-tl-xs'
                    : 'bg-white border border-[rgba(70,80,60,0.1)] text-[#1F342A] rounded-tl-xs'
                }`}
              >
                <p className="font-serif text-lg sm:text-xl font-medium leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>

                {/* Structured Health Information Card */}
                {msg.healthCard && renderHealthCard(msg.healthCard)}

                {/* Web Search Sources (from Google Search grounding) */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-[#456c44] uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Verified Sources</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            source.authoritative
                              ? 'bg-[#bfebba]/40 text-[#032517] border border-[#83a590]/40 hover:bg-[#bfebba]/70'
                              : 'bg-[#ecefea] text-[#3e4941] border border-[#becabf]/40 hover:bg-[#d8dbd6]'
                          }`}
                          title={source.snippet || source.title}
                        >
                          {source.authoritative && <ShieldCheck className="w-3 h-3 text-[#416740]" />}
                          <span className="max-w-[120px] truncate">{source.publisher || source.domain}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Intent Action Pill */}
                {(msg.navigationIntent || msg.navigationTarget) && (
                  <div className="p-3 bg-[#ecefea] border border-[#becabf] rounded-2xl flex items-center justify-between gap-3 shadow-2xs font-sans">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#032517]">
                      <Compass className="w-5 h-5 text-[#416740] shrink-0" />
                      <span>
                        Navigate: {msg.navigationTarget?.gameId || msg.navigationTarget?.view || msg.navigationIntent}
                      </span>
                    </div>
                    <button
                      onClick={() => executeNavigationIntent(msg.navigationIntent, msg.navigationTarget)}
                      className="px-3.5 py-1.5 bg-[#032517] hover:bg-[#1b3b2b] active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                    >
                      <span>Go Now</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#bfebba]" />
                    </button>
                  </div>
                )}

                {/* Sarthi Recommendation Extra Details */}
                {msg.recommendation && (
                  <div className="pt-2 border-t border-[#ecefea] space-y-2 font-sans">
                    {/* Explainable AI Transparent Reason */}
                    {msg.recommendation.reason && (
                      <div className="flex items-start gap-2 bg-[#ecefea] border border-[#becabf]/60 text-[#032517] p-3 rounded-2xl text-xs font-medium">
                        <Info className="w-4 h-4 text-[#416740] shrink-0 mt-0.5" />
                        <span>
                          <strong>Why Sarthi recommended this:</strong> {msg.recommendation.reason}
                        </span>
                      </div>
                    )}

                    {/* Direct Action Launch Button */}
                    {msg.recommendation.suggestedAction && (
                      <button
                        onClick={() => executeRecommendation(msg.recommendation!)}
                        className="w-full mt-2 py-3 px-4 bg-[#032517] hover:bg-[#1b3b2b] text-white font-bold text-sm rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current text-[#bfebba]" />
                        <span>
                          {msg.recommendation.suggestedAction.label[language] ||
                            msg.recommendation.suggestedAction.label.en}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Message Footer: Voice, Gemini badge, Offline indicator */}
                <div className="flex items-center justify-between pt-1 border-t border-[#ecefea] text-[11px] font-sans">
                  <div className="flex items-center gap-2">
                    {msg.sender === 'sarthi' && (
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="p-1 rounded-lg transition-colors cursor-pointer text-[#6f7a70] hover:text-[#032517] hover:bg-[#ecefea]"
                        title="Listen to this message"
                        aria-label="Listen to this message"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                    {msg.isGemini && (
                      <span className="font-bold text-[#032517] bg-[#bfebba]/50 border border-[#83a590]/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#416740]" />
                        <span>Gemini AI</span>
                      </span>
                    )}
                    {msg.searchPerformed && (
                      <span className="font-bold text-[#032517] bg-[#ecefea] border border-[#becabf]/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#416740]" />
                        <span>Web Search</span>
                      </span>
                    )}
                    {msg.isWorkingOffline && (
                      <span className="font-bold text-[#631d08] bg-[#ffdbd1]/60 border border-[#ffdbd1] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <WifiOff className="w-3 h-3" />
                        <span>Working offline</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[#6f7a70] font-medium">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2.5 p-3.5 bg-white border border-[#becabf] rounded-2xl max-w-[240px] shadow-xs text-xs font-bold text-[#032517] animate-pulse font-sans">
              <Sparkles className="w-4 h-4 text-[#416740] animate-spin" />
              <span>Sarthi is thinking...</span>
            </div>
          )}

          {micFeedback && (
            <div className="flex items-center gap-2 p-2.5 bg-[#ffdbd1]/50 border border-[#ffdbd1] text-[#631d08] rounded-xl text-xs font-bold animate-pulse font-sans">
              <Mic className="w-4 h-4 text-[#631d08] shrink-0" />
              <span>{micFeedback}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Action One-Tap Grid (Elderly Friendly, No Typing Needed) */}
        <div className="p-3.5 sm:p-4 bg-white/80 backdrop-blur-md border-t border-[rgba(70,80,60,0.1)] shrink-0 font-sans">
          <p className="text-[11px] font-bold text-[#5A7360] uppercase tracking-wider mb-2 text-center">
            {language === 'hi'
              ? 'स्पर्श करके पूछें:'
              : language === 'as'
              ? 'স্পৰ্শ কৰি বাছক:'
              : language === 'bn'
              ? 'স্পর্শ করে বেছে নিন:'
              : language === 'mni'
              ? 'Namduna hangbiyu:'
              : 'Touch an action to ask:'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.key}
                onClick={() => handleSelectQuickAction(action.key, action.label)}
                className="p-3 rounded-2xl bg-white hover:bg-[#F5EBE1]/60 active:bg-[#F5EBE1] border border-[rgba(70,80,60,0.1)] text-left transition-all cursor-pointer flex items-center gap-2.5 group shadow-xs min-h-[54px]"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[rgba(70,80,60,0.08)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-lg">
                  {action.icon}
                </div>
                <span className="text-xs font-bold text-[#1F342A] line-clamp-1">
                  {action.label}
                </span>
              </button>
            ))}
          </div>

          {/* Voice Mic & Custom Query Input Bar */}
          <form
            onSubmit={handleSendCustomMessage}
            className="mt-3 flex items-center gap-2"
          >
            {/* Microphone STT Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isListeningMic
                  ? 'bg-[#BF5844] text-white border-[#BF5844] animate-bounce shadow-md'
                  : 'bg-[#F5EBE1]/80 hover:bg-[#F5EBE1] text-[#1F342A] border-[rgba(70,80,60,0.12)]'
              }`}
              title={isListeningMic ? 'Stop Listening' : 'Speak with Voice'}
              aria-label="Toggle voice microphone"
            >
              {isListeningMic ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-[#1F342A]" />}
            </button>

            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={
                isListeningMic
                  ? 'Listening to your voice...'
                  : language === 'hi'
                  ? 'सारथी से पूछें (उदा. डिमेंशिया क्या है?)...'
                  : language === 'as'
                  ? 'সাৰথীক সোধক (যেনে ডিমেনচিয়া কি?)...'
                  : language === 'bn'
                  ? 'সারথীকে জিজ্ঞাসা করুন (যেমন ডিমেনশিয়া কী?)...'
                  : language === 'mni'
                  ? 'Sarthi da hangbiyu (eg. Dementia kari no?)...'
                  : 'Ask Sarthi (e.g. What is dementia? / Open Tea Garden)...'
              }
              className={`flex-1 px-4 py-3 bg-white border rounded-2xl text-xs sm:text-sm font-medium text-[#1F342A] focus:outline-none transition-all ${
                isListeningMic ? 'border-[#BF5844] bg-[#FDECEF]/40' : 'border-[rgba(70,80,60,0.15)] focus:border-[#708A74]'
              }`}
            />

            <button
              type="submit"
              disabled={!customInput.trim()}
              className="p-3 bg-[#1F342A] hover:bg-[#2A4438] disabled:opacity-40 text-white rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
              title="Send"
            >
              <Send className="w-4 h-4 text-[#D9E8D8]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SarthiCompanionModal;

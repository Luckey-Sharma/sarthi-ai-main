import React, { useState, useEffect, useRef } from 'react';
import {
  AISaathiResponse,
  AuthoritativeSource,
  PersonalizationSignal,
  PatientHealthRecord,
  DemoScenarioId,
} from '../../types/healthCompanion';
import { Language, AppView, GameId } from '../../types';
import { patientContextEngine } from '../../services/patientContextEngine';
import { aiSaathiService } from '../../services/aiSaathiService';
import { DEMO_SCENARIO_CONFIGS } from '../../services/demoHealthData';
import { SourcesModal } from './SourcesModal';
import { PersonalizationSignalsModal } from './PersonalizationSignalsModal';
import {
  speak,
  stopSpeaking,
  startListening,
  stopListening,
  isSpeechRecognitionSupported,
} from '../../services/voiceService';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Footprints,
  Utensils,
  Moon,
  HeartPulse,
  Pill,
  RefreshCw,
  Award,
  Layers,
  Info,
} from 'lucide-react';

interface AISaathiHealthCompanionProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialQuery?: string;
  onNavigate?: (view: AppView, gameId?: GameId) => void;
  onOpenSOS?: () => void;
}

export const AISaathiHealthCompanion: React.FC<AISaathiHealthCompanionProps> = ({
  isOpen,
  onClose,
  language,
  initialQuery,
  onNavigate,
  onOpenSOS,
}) => {
  const [patient, setPatient] = useState<PatientHealthRecord>(() =>
    patientContextEngine.getActivePatientRecord()
  );
  const [activeScenario, setActiveScenario] = useState<DemoScenarioId>(() =>
    patientContextEngine.getActiveScenarioId()
  );

  // Chat conversation
  const [chatHistory, setChatHistory] = useState<
    Array<{
      id: string;
      sender: 'user' | 'saathi';
      text?: string;
      response?: AISaathiResponse;
      timestamp: string;
    }>
  >([]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<{
    stage: number;
    title: string;
    detail?: string;
  } | null>(null);

  // Voice States
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micTranscript, setMicTranscript] = useState('');

  // Modals & Expanders
  const [selectedSourcesForModal, setSelectedSourcesForModal] = useState<AuthoritativeSource[] | null>(null);
  const [selectedSignalsForModal, setSelectedSignalsForModal] = useState<PersonalizationSignal[] | null>(null);
  const [expandedWhyPanels, setExpandedWhyPanels] = useState<Record<string, boolean>>({});
  const [savedRecommendations, setSavedRecommendations] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Update patient when scenario changes
  const handleScenarioSwitch = (newScenario: DemoScenarioId) => {
    const updated = patientContextEngine.setScenario(newScenario);
    setActiveScenario(newScenario);
    setPatient(updated);

    // Add scenario switch notice in chat
    const config = DEMO_SCENARIO_CONFIGS[newScenario];
    setChatHistory((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'saathi',
        text: `Switched patient context to: ${config.title}. (${config.badge}). All subsequent recommendations will dynamically reflect this health profile.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Process initial query if opened with one
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery !== '') {
        handleSendQuestion(initialQuery);
      } else if (chatHistory.length === 0) {
        // Initial warm welcome
        handleSendQuestion('What should I eat today to stay healthy?');
      }
    } else {
      stopSpeaking();
      stopListening();
      setIsSpeakingVoice(false);
      setIsListeningMic(false);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, pipelineStage]);

  if (!isOpen) return null;

  const handleSendQuestion = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isProcessing) return;

    setInputQuery('');
    stopSpeaking();
    setIsSpeakingVoice(false);

    // 1. Add User Message
    const userMsgId = `usr-${Date.now()}`;
    setChatHistory((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsProcessing(true);

    try {
      const response = await aiSaathiService.askAISaathi(
        q,
        language,
        (stage, title, detail) => {
          setPipelineStage({ stage, title, detail });
        }
      );

      const saathiMsgId = `saathi-${Date.now()}`;
      setChatHistory((prev) => [
        ...prev,
        {
          id: saathiMsgId,
          sender: 'saathi',
          response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Automatically speak summary aloud if requested or elder-friendly
      if (response.recommendationDetails) {
        speakAloud(`${response.recommendationTitle}. ${response.recommendationDetails}`);
      }
    } catch (err) {
      console.error('AI Saathi error:', err);
    } finally {
      setIsProcessing(false);
      setPipelineStage(null);
    }
  };

  // Voice Listening
  const handleToggleMic = () => {
    if (isListeningMic) {
      stopListening();
      setIsListeningMic(false);
      if (micTranscript.trim()) {
        handleSendQuestion(micTranscript);
        setMicTranscript('');
      }
    } else {
      stopSpeaking();
      setIsSpeakingVoice(false);
      setIsListeningMic(true);
      setMicTranscript('');

      startListening({
        lang: language,
        onResult: (transcript: string, isFinal: boolean) => {
          setMicTranscript(transcript);
          if (isFinal && transcript.trim()) {
            setIsListeningMic(false);
            setMicTranscript('');
            handleSendQuestion(transcript);
          }
        },
        onError: (err: any) => {
          console.warn('Voice recognition error:', err);
          setIsListeningMic(false);
        },
        onEnd: () => {
          setIsListeningMic(false);
        },
      });
    }
  };

  const speakAloud = (text: string) => {
    stopSpeaking();
    setIsSpeakingVoice(true);
    speak(text, language, () => {
      setIsSpeakingVoice(false);
    });
  };

  const toggleWhyPanel = (msgId: string) => {
    setExpandedWhyPanels((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleSave = (msgId: string) => {
    setSavedRecommendations((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const QUICK_QUESTIONS = [
    'What should I eat today to stay healthy?',
    'Can I go for a walk today?',
    'What should I eat for breakfast?',
    'Why am I feeling tired?',
    'Explain my blood pressure in simple words.',
    'How much water should I drink?',
    'What can I do to sleep better?',
    'What should I avoid eating?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-4xl h-[92vh] max-h-[850px] rounded-3xl border border-[#becabf] shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* ── Top Bar: Identity & Judge Scenario Switcher ───────────────── */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#eef4ea] via-[#f7faf5] to-[#f2f7f9] border-b border-[#becabf]/60 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#032517] text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-[#bfebba]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] tracking-tight">
                    AI Saathi
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#bfebba] text-[#032517] border border-[#416740]/20">
                    Health Companion
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#416740] bg-white/80 px-2 py-0.5 rounded-full border border-[#becabf]/60">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Medical Guardrails Active
                  </span>
                </div>
                <p className="text-xs text-[#3e4941]">
                  Personalized using {patient.name}'s 7-day vitals, medications, diet & authoritative health research.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {isSpeakingVoice && (
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsSpeakingVoice(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold animate-pulse cursor-pointer"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Audio</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-[#ecefea] text-[#6f7a70] hover:text-[#032517] flex items-center justify-center transition-colors border border-[#becabf]/60 cursor-pointer shadow-2xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scenario Switcher for Competition Demonstration */}
          <div className="mt-3 pt-3 border-t border-[#becabf]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#416740]">
              <Layers className="w-3.5 h-3.5" />
              <span>JUDGE DEMO SCENARIO:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {(Object.keys(DEMO_SCENARIO_CONFIGS) as DemoScenarioId[]).map((scenId) => {
                const cfg = DEMO_SCENARIO_CONFIGS[scenId];
                const isActive = activeScenario === scenId;
                return (
                  <button
                    key={scenId}
                    onClick={() => handleScenarioSwitch(scenId)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer truncate max-w-[200px] sm:max-w-xs ${
                      isActive
                        ? 'bg-[#032517] text-white shadow-xs'
                        : 'bg-white hover:bg-[#ecefea] text-[#3e4941] border border-[#becabf]/60'
                    }`}
                    title={cfg.description}
                  >
                    {cfg.patientId === 'pat-1' ? '1. Low Steps / High BP' : cfg.patientId === 'pat-2' ? '2. Active / Diabetes' : '3. Poor Sleep / Joint Stiffness'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main Chat Conversation Body ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#fcfdfa]">
          {chatHistory.map((item) => {
            if (item.sender === 'user') {
              return (
                <div key={item.id} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-lg bg-[#032517] text-white p-4 rounded-3xl rounded-br-xs shadow-md">
                    <p className="text-sm sm:text-base font-medium leading-relaxed">{item.text}</p>
                    <span className="text-[10px] text-[#bfebba] opacity-80 block text-right mt-1">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              );
            }

            // System Notification (e.g. Scenario Switch)
            if (item.text && !item.response) {
              return (
                <div key={item.id} className="flex justify-center">
                  <div className="px-4 py-2 rounded-2xl bg-[#edf3ec] text-[#416740] border border-[#becabf]/60 text-xs font-semibold text-center max-w-lg">
                    {item.text}
                  </div>
                </div>
              );
            }

            // AI Saathi Structured Answer Card
            const resp = item.response!;
            const isSaved = savedRecommendations[item.id];
            const isWhyExpanded = expandedWhyPanels[item.id];

            return (
              <div key={item.id} className="flex flex-col space-y-3 max-w-2xl">
                {/* Main Card */}
                <div className="bg-white rounded-3xl border-2 border-[#becabf]/70 shadow-md p-5 sm:p-6 space-y-4 font-sans relative overflow-hidden">
                  {/* Top Badge: Intent & Personalization Score */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#becabf]/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#416740] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Recommended for You
                      </span>
                      {resp.modelUsed && (
                        <span className="text-[10px] font-mono text-[#6f7a70] bg-[#ecefea] px-2 py-0.5 rounded-md">
                          {resp.modelUsed}
                        </span>
                      )}
                    </div>

                    {/* Personalization Signals Chip */}
                    {resp.signalsUsed && resp.signalsUsed.length > 0 && (
                      <button
                        onClick={() => setSelectedSignalsForModal(resp.signalsUsed)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3ec] hover:bg-[#bfebba]/50 text-[#032517] text-xs font-bold border border-[#becabf]/60 transition-colors cursor-pointer"
                        title="View the exact patient factors used"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#416740]" />
                        <span>Personalized using {resp.signalsUsed.length} health signals</span>
                      </button>
                    )}
                  </div>

                  {/* Recommendation Title */}
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#032517] leading-snug">
                    {resp.recommendationTitle}
                  </h3>

                  {/* Recommendation Details */}
                  <p className="text-sm sm:text-base text-[#181d19] leading-relaxed font-medium">
                    {resp.recommendationDetails}
                  </p>

                  {/* Why it may suit you (Bullet points) */}
                  {resp.whyItSuitsYou && resp.whyItSuitsYou.length > 0 && (
                    <div className="bg-[#f7faf5] p-4 rounded-2xl border border-[#becabf]/50 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#456c44]">
                        Why this may suit you:
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[#3e4941]">
                        {resp.whyItSuitsYou.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#416740] font-bold shrink-0">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alternative Option */}
                  {resp.alternativeOption && (
                    <div className="text-xs sm:text-sm text-[#3e4941] pt-1">
                      <span className="font-bold text-[#032517]">Alternative Option: </span>
                      <span>{resp.alternativeOption}</span>
                    </div>
                  )}

                  {/* Action Bar: Listen / Save / Expand Why */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#becabf]/40 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          speakAloud(`${resp.recommendationTitle}. ${resp.recommendationDetails}`)
                        }
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#032517] text-white hover:bg-[#416740] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Read Aloud</span>
                      </button>

                      <button
                        onClick={() => toggleSave(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-white hover:bg-[#ecefea] text-[#3e4941] border-[#becabf]/60'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-rose-600' : ''}`} />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleWhyPanel(item.id)}
                      className="flex items-center gap-1 text-xs font-bold text-[#416740] hover:text-[#032517] cursor-pointer"
                    >
                      <span>Why AI Saathi suggested this</span>
                      {isWhyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable "WHY THIS WAS SUGGESTED" Panel */}
                  {isWhyExpanded && (
                    <div className="mt-3 p-4 rounded-2xl bg-[#edf3ec] border border-[#becabf] space-y-2.5 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#032517] flex items-center justify-between">
                        <span>WHY THIS WAS SUGGESTED</span>
                        <span className="text-[10px] text-[#6f7a70] font-normal">Based on your live profile</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#181d19]">
                        {resp.signalsUsed?.map((sig) => (
                          <div key={sig.id} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#416740] shrink-0" />
                            <span>
                              <strong>{sig.label}:</strong> {sig.value}
                            </span>
                          </div>
                        )) || (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#416740]" />
                              <span>Your {patient.dietPreference} dietary preference</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#416740]" />
                              <span>Today's physical exertion</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#416740]" />
                              <span>Blood pressure history</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#416740]" />
                              <span>Age-specific ICMR/WHO guidelines</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sources Checked Pill & View Sources Button */}
                  {resp.sourcesChecked && resp.sourcesChecked.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f7faf5] border border-[#becabf]/50 text-xs">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#416740]" />
                        <span className="font-bold text-[#032517]">Sources Checked:</span>
                        <span className="text-[#3e4941]">
                          {resp.sourcesChecked.map((s) => s.organization.split(' ')[0]).join(', ')}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedSourcesForModal(resp.sourcesChecked)}
                        className="px-3 py-1 rounded-xl bg-white hover:bg-[#ecefea] text-[#032517] font-bold text-xs border border-[#becabf]/60 cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <span>View Sources ({resp.sourcesChecked.length})</span>
                        <ExternalLink className="w-3 h-3 text-[#416740]" />
                      </button>
                    </div>
                  )}

                  {/* Medical Safety Disclaimer Banner */}
                  <div className="p-2.5 rounded-xl bg-[#ecefea]/60 text-[11px] text-[#6f7a70] text-center border border-[#becabf]/30">
                    {resp.disclaimer}
                  </div>
                </div>

                {/* Follow-up Question Chips */}
                {resp.followUpQuestions && resp.followUpQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-2">
                    <span className="text-xs font-bold text-[#6f7a70] self-center mr-1">Suggested:</span>
                    {resp.followUpQuestions.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendQuestion(chip)}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#bfebba]/50 text-[#032517] text-xs font-bold border border-[#becabf]/60 hover:border-[#416740] shadow-2xs transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Animated 6-Stage Pipeline Indicator ───────────────────── */}
          {isProcessing && pipelineStage && (
            <div className="flex flex-col space-y-3 max-w-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border-2 border-[#bfebba] shadow-lg p-5 space-y-3 font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#032517] text-[#bfebba] flex items-center justify-center animate-spin">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#416740] uppercase tracking-wider block">
                      AI Saathi Intelligence Pipeline • Step {pipelineStage.stage} of 6
                    </span>
                    <h4 className="text-sm font-bold text-[#032517]">
                      {pipelineStage.title}
                    </h4>
                  </div>
                </div>

                {pipelineStage.detail && (
                  <p className="text-xs text-[#6f7a70] pl-11">
                    {pipelineStage.detail}
                  </p>
                )}

                {/* Progress bar */}
                <div className="w-full bg-[#ecefea] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#416740] h-full transition-all duration-300"
                    style={{ width: `${(pipelineStage.stage / 6) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── Quick Suggested Questions Carousel ───────────────────────── */}
        <div className="px-4 sm:px-6 py-2 bg-[#ffffff] border-t border-[#becabf]/30 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-[#6f7a70] uppercase shrink-0">Try:</span>
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(q)}
              className="px-3 py-1.5 rounded-full bg-[#f7faf5] hover:bg-[#edf3ec] text-[#032517] text-xs font-semibold border border-[#becabf]/50 shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* ── Voice-First Input Bar ─────────────────────────────────────── */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-[#ffffff] via-[#f7faf5] to-[#ffffff] border-t border-[#becabf]/60 shrink-0">
          {/* Active mic transcript preview */}
          {isListeningMic && (
            <div className="mb-2 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-pulse">
              <span className="font-bold flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-rose-600" />
                Listening to your voice... Speak now
              </span>
              <span className="font-mono">{micTranscript || '...'}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Giant Tactile Microphone Button */}
            <button
              onClick={handleToggleMic}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-md cursor-pointer shrink-0 ${
                isListeningMic
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-[#032517] hover:bg-[#416740] text-white'
              }`}
              title="Speak with AI Saathi"
            >
              {isListeningMic ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Input Box */}
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendQuestion(inputQuery);
                }}
                placeholder="Ask AI Saathi (e.g. What should I eat for breakfast?)"
                disabled={isProcessing}
                className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-white border-2 border-[#becabf]/70 focus:border-[#032517] focus:outline-none text-sm sm:text-base font-medium text-[#032517] placeholder:text-[#6f7a70] shadow-xs"
              />

              <button
                onClick={() => handleSendQuestion(inputQuery)}
                disabled={!inputQuery.trim() || isProcessing}
                className="absolute right-2.5 w-9 h-9 rounded-xl bg-[#032517] hover:bg-[#416740] disabled:bg-[#ecefea] text-white disabled:text-[#6f7a70] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Sources Modal ───────────────────────────────────────────── */}
        {selectedSourcesForModal && (
          <SourcesModal
            isOpen={true}
            onClose={() => setSelectedSourcesForModal(null)}
            sources={selectedSourcesForModal}
          />
        )}

        {/* ── Personalization Signals Inspector Modal ───────────────────── */}
        {selectedSignalsForModal && (
          <PersonalizationSignalsModal
            isOpen={true}
            onClose={() => setSelectedSignalsForModal(null)}
            signals={selectedSignalsForModal}
            patient={patient}
          />
        )}
      </div>
    </div>
  );
};

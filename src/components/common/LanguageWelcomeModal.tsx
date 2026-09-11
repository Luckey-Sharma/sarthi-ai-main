import React, { useState } from 'react';
import { Language } from '../../types';
import { speak, stopSpeaking, playSound } from '../../services/voiceService';
import { Globe, Volume2, VolumeX, Check, ArrowRight, Sparkles } from 'lucide-react';

interface LanguageOption {
  code: Language;
  native: string;
  englishName: string;
  region: string;
  greeting: string;
  culturalIcon: string;
  accentColor: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    native: 'English',
    englishName: 'Primary',
    region: 'Standard / Regional & International',
    greeting: 'Welcome to SmritiSetu NER, your cognitive companion.',
    culturalIcon: '🌿',
    accentColor: 'border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950',
  },
  {
    code: 'as',
    native: 'অসমীয়া',
    englishName: 'Assamese',
    region: 'Assam & Brahmaputra Valley',
    greeting: 'নমস্কাৰ! আপোনাক স্মৃতিসেতুলৈ স্বাগতম।',
    culturalIcon: '🦏',
    accentColor: 'border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-teal-950',
  },
  {
    code: 'bn',
    native: 'বাংলা',
    englishName: 'Bengali',
    region: 'Barak Valley, Tripura & Bengal',
    greeting: 'নমস্কার! স্মৃতিসেতুতে আপনাকে স্বাগতম।',
    culturalIcon: '🌸',
    accentColor: 'border-rose-500 bg-rose-50/50 hover:bg-rose-50 text-rose-950',
  },
  {
    code: 'hi',
    native: 'हिन्दी',
    englishName: 'Hindi',
    region: 'North-East & Pan-India',
    greeting: 'नमस्ते! स्मृति सेतु में आपका हार्दिक स्वागत है।',
    culturalIcon: '🪔',
    accentColor: 'border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-amber-950',
  },
  {
    code: 'mni',
    native: 'মৈতৈলোন্',
    englishName: 'Manipuri',
    region: 'Manipur & Imphal Valley',
    greeting: 'Khurumjari! SmritiSetu da tarambana okchari.',
    culturalIcon: '🦌',
    accentColor: 'border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50 text-cyan-950',
  },
];

interface LanguageWelcomeModalProps {
  isOpen: boolean;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const LanguageWelcomeModal: React.FC<LanguageWelcomeModalProps> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
  canClose = true,
}) => {
  const [selected, setSelected] = useState<Language>(() => {
    return currentLanguage || 'en';
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelected(currentLanguage || 'en');
    }
    return () => {
      stopSpeaking();
      setIsSpeaking(false);
    };
  }, [isOpen, currentLanguage]);

  if (!isOpen) return null;

  const handleLanguageClick = (lang: LanguageOption) => {
    setSelected(lang.code);
    playSound('click');
  };

  const handlePronounceGreeting = (lang: LanguageOption, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);
    speak(lang.greeting, lang.code, () => {
      setIsSpeaking(false);
    });
  };

  const handleConfirm = () => {
    stopSpeaking();
    setIsSpeaking(false);
    playSound('success');
    onSelectLanguage(selected);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FAF6EE] rounded-[32px] shadow-2xl border border-[rgba(70,80,60,0.15)] max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto flex flex-col justify-between space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#1F342A] text-white mx-auto flex items-center justify-center shadow-md border border-[#708A74]/30">
            <Globe className="w-8 h-8 text-[#D9E8D8]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F342A] tracking-tight">
            {selected === 'en' ? 'Choose Your Language' :
             selected === 'as' ? 'আপোনাৰ ভাষা বাছক' :
             selected === 'bn' ? 'আপনার ভাষা নির্বাচন করুন' :
             selected === 'hi' ? 'अपनी भाषा चुनें' :
             'নখোইগী লোন্ খনবীয়ু'}
          </h2>
          <p className="text-xs sm:text-sm text-[#495E4F] font-medium">
            {selected === 'en' ? 'Select your preferred language to customize your SmritiAI experience' :
             selected === 'as' ? 'স্মৃতিসেতু ব্যৱহাৰ কৰিবলৈ আপোনাৰ পছন্দৰ ভাষা বাছক' :
             selected === 'bn' ? 'স্মৃতিসেতু ব্যবহারের জন্য আপনার পছন্দের ভাষা নির্বাচন করুন' :
             selected === 'hi' ? 'स्मृति सेतु का उपयोग करने के लिए अपनी पसंदीदा भाषा चुनें' :
             'SmritiSetu NER sijinaba hougadaba lon khanbiyu'}
          </p>
        </div>

        {/* Language Options Grid */}
        <div className="space-y-3">
          {LANGUAGES.map((lang) => {
            const isChosen = selected === lang.code;
            return (
              <div
                key={lang.code}
                role="button"
                tabIndex={0}
                onClick={() => handleLanguageClick(lang)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLanguageClick(lang);
                  }
                }}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 text-left select-none ${
                  isChosen
                    ? 'bg-[#D9E8D8] border-[#708A74] shadow-sm font-bold text-[#1F342A]'
                    : 'bg-white/80 hover:bg-white border-[rgba(70,80,60,0.12)] text-[#1F342A]'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-3xl sm:text-4xl shrink-0">
                    {lang.culturalIcon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#1F342A]">
                        {lang.native}
                      </h3>
                      <span className="text-xs font-bold text-[#5A7360]">
                        {lang.code === 'en' ? '(Primary)' : `(${lang.englishName})`}
                      </span>
                    </div>
                    <p className="text-xs text-[#495E4F] font-medium mt-0.5 truncate">
                      {lang.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isChosen && (
                    <div className="w-8 h-8 rounded-full bg-[#1F342A] text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handlePronounceGreeting(lang, e)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      isSpeaking && selected === lang.code
                        ? 'bg-[#BF5844] text-white shadow-sm'
                        : 'bg-[#FAF6EE] hover:bg-[#F5EBE1] text-[#1F342A] border border-[rgba(70,80,60,0.1)]'
                    }`}
                    title={isSpeaking && selected === lang.code ? 'Stop audio' : 'Listen to greeting'}
                    aria-label="Listen to greeting"
                  >
                    {isSpeaking && selected === lang.code ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#708A74]" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Confirmation */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[rgba(70,80,60,0.1)]">
          {canClose && onClose ? (
            <button
              onClick={onClose}
              className="text-xs font-bold text-[#5A7360] hover:text-[#1F342A] px-3 py-2 cursor-pointer transition-colors"
            >
              {selected === 'en' ? 'Keep Current' :
               selected === 'as' ? 'পূৰ্বৰ ভাষা ৰাখক' :
               selected === 'bn' ? 'আগের ভাষা রাখুন' :
               selected === 'hi' ? 'वर्तमान भाषा रखें' :
               selected === 'mni' ? 'Hanna leiriba lon thammu' :
               'Keep Current'}
            </button>
          ) : (
            <div className="text-[11px] text-[#5A7360] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#785E22]" />
              <span>{selected === 'en' ? 'You can always change language later from the top menu' :
                     selected === 'hi' ? 'आप बाद में कभी भी ऊपर के मेनू से भाषा बदल सकते हैं' :
                     selected === 'bn' ? 'আপনি পরবর্তীতে ওপরের মেনু থেকে ভাষা পরিবর্তন করতে পারবেন' :
                     selected === 'as' ? 'আপুনি পিছত ওপৰৰ মেনুৰ পৰা ভাষা সলনি কৰিব পাৰিব' :
                     selected === 'mni' ? 'Tungda mathakki menudagi lon semdokpa yagani' :
                     'You can always change language later from the top menu'}</span>
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1F342A] hover:bg-[#2A4438] text-white font-bold text-sm rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>
              {selected === 'en' ? 'Start in English' :
               selected === 'as' ? 'অসমীয়াত আৰম্ভ কৰক' :
               selected === 'bn' ? 'বাংলায় শুরু করুন' :
               selected === 'hi' ? 'हिन्दी में शुरू करें' :
               'মৈতৈলোন্দা হৌরো'}
            </span>
            <ArrowRight className="w-4 h-4 text-[#D9E8D8]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageWelcomeModal;

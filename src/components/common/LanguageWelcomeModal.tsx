import React, { useState } from 'react';
import { Language } from '../../types';
import { speak, playSound } from '../../services/voiceService';
import { Globe, Volume2, Check, ArrowRight, Sparkles } from 'lucide-react';

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
  }, [isOpen, currentLanguage]);

  if (!isOpen) return null;

  const handleLanguageClick = (lang: LanguageOption) => {
    setSelected(lang.code);
    playSound('click');
    setIsSpeaking(true);
    speak(lang.greeting, lang.code, () => {
      setIsSpeaking(false);
    });
  };

  const handleConfirm = () => {
    playSound('success');
    onSelectLanguage(selected);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto flex flex-col justify-between space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-700/20">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {selected === 'en' ? 'Choose Your Language' :
             selected === 'as' ? 'আপোনাৰ ভাষা বাছক' :
             selected === 'bn' ? 'আপনার ভাষা নির্বাচন করুন' :
             selected === 'hi' ? 'अपनी भाषा चुनें' :
             'নখোইগী লোন্ খনবীয়ু'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            {selected === 'en' ? 'Select your preferred language to customize your SmritiSetu NER experience' :
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
              <button
                key={lang.code}
                onClick={() => handleLanguageClick(lang)}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 text-left select-none ${
                  isChosen
                    ? `${lang.accentColor} ring-4 ring-emerald-300/40 shadow-md font-bold`
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-3xl sm:text-4xl shrink-0">
                    {lang.culturalIcon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                        {lang.native}
                      </h3>
                      <span className="text-xs font-bold text-stone-500">
                        {lang.code === 'en' ? '(Primary)' : `(${lang.englishName})`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium mt-0.5 truncate">
                      {lang.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isChosen && (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                  <div
                    className="p-2 rounded-xl bg-stone-200/60 hover:bg-stone-200 text-stone-600 transition-colors"
                    title="Pronounce greeting"
                  >
                    <Volume2 className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Confirmation */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
          {canClose && onClose ? (
            <button
              onClick={onClose}
              className="text-xs font-bold text-stone-400 hover:text-stone-600 px-3 py-2 cursor-pointer"
            >
              {selected === 'en' ? 'Keep Current' :
               selected === 'as' ? 'পূৰ্বৰ ভাষা ৰাখক' :
               selected === 'bn' ? 'আগের ভাষা রাখুন' :
               selected === 'hi' ? 'वर्तमान भाषा रखें' :
               selected === 'mni' ? 'Hanna leiriba lon thammu' :
               'Keep Current'}
            </button>
          ) : (
            <div className="text-[11px] text-stone-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-700/25 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>
              {selected === 'en' ? 'Start in English' :
               selected === 'as' ? 'অসমীয়াত আৰম্ভ কৰক' :
               selected === 'bn' ? 'বাংলায় শুরু করুন' :
               selected === 'hi' ? 'हिन्दी में शुरू करें' :
               'মৈতৈলোন্দা হৌরো'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageWelcomeModal;

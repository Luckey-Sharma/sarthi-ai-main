import React from 'react';
import { Language } from '../../types';
import { t } from '../../services/i18n';

interface SessionEndingModalProps {
  isOpen: boolean;
  language: Language;
  onFinish?: () => void;
  onRest?: () => void;
  onContinue?: () => void;
}

export const SessionEndingModal: React.FC<SessionEndingModalProps> = ({
  isOpen,
  language,
  onFinish,
  onRest,
  onContinue,
}) => {
  if (!isOpen) return null;
  const handleRest = onRest || onFinish || (() => {});

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-[#FAF6EE] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[rgba(70,80,60,0.15)] text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-[#D9E8D8] text-[#1F342A] mx-auto flex items-center justify-center text-3xl shadow-sm border border-[#708A74]/30">
          🌿
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-[#1F342A]">
            {t('sessionStoppingPoint', language)}
          </h2>
          <p className="text-xs sm:text-sm text-[#495E4F] font-medium leading-relaxed">
            {language === 'as'
              ? 'আমি একেলগে সুন্দৰ সময় কটালোঁ। এতিয়া আপুনি আৰামত জিৰণি ল’ব পাৰে।'
              : language === 'bn'
              ? 'আমরা একসাথে সুন্দর সময় কাটালাম। এখন শান্তভাবে বিশ্রাম নেওয়ার সময়।'
              : language === 'hi'
              ? 'हमने साथ में बहुत सुंदर समय बिताया। अब आप सुकून से आराम कर सकते हैं।'
              : language === 'mni'
              ? 'Eikhoi punna nungcba matam lenkhre. Hojik potthaba yare.'
              : 'You have spent wonderful, peaceful moments together. Resting now helps the mind stay refreshed and calm.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRest}
            className="w-full sm:flex-1 py-3.5 px-5 bg-[#1F342A] hover:bg-[#2A4438] text-white font-bold rounded-2xl text-xs sm:text-sm cursor-pointer shadow-md transition-all active:scale-[0.98]"
          >
            {t('restNow', language)}
          </button>
          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full sm:flex-1 py-3.5 px-5 bg-white hover:bg-stone-50 text-[#1F342A] font-bold rounded-2xl text-xs sm:text-sm cursor-pointer border border-[rgba(70,80,60,0.15)] transition-all active:scale-[0.98]"
            >
              {t('continueSession', language)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionEndingModal;

import React from 'react';
import { Language } from '../../types';
import { Sparkles } from 'lucide-react';

interface SarthiFloatingTriggerProps {
  language: Language;
  onClick: () => void;
}

export const SarthiFloatingTrigger: React.FC<SarthiFloatingTriggerProps> = ({
  language,
  onClick,
}) => {
  const getSubLabel = () => {
    switch (language) {
      case 'hi': return 'मार्गदर्शक साथी';
      case 'as': return 'জ্ঞাত্বী সংগী';
      case 'bn': return 'যত্নসঙ্গী';
      case 'mni': return 'Khurumjari Sarthi';
      case 'en':
      default:
        return 'Care Companion';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end group font-sans">
      {/* Tooltip Tag */}
      <div className="mb-2 bg-[#032517]/95 backdrop-blur text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-[#83a590]/40 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-[#bfebba] animate-pulse" />
        <span className="font-serif font-bold text-sm">Sarthi</span>
        <span className="text-[11px] text-[#83a590] font-medium">({getSubLabel()})</span>
      </div>

      {/* Floating 80px Tactile Button */}
      <button
        onClick={onClick}
        className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#032517] p-1 shadow-2xl shadow-[#032517]/50 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center relative border-3 border-[#bfebba]"
        aria-label="Open Sarthi Cognitive Care Companion"
        title="Open Sarthi Care Companion"
      >
        <div className="w-full h-full rounded-full bg-[#1b3b2b] flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[36px] sm:text-[40px] text-[#bfebba]">
            support_agent
          </span>
        </div>

        {/* Pulsing Sacred Chaki Aura Badge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#bfebba] text-[#032517] border-2 border-[#032517] flex items-center justify-center text-xs font-black shadow-md">
          ✨
        </span>
      </button>
    </div>
  );
};

export default SarthiFloatingTrigger;

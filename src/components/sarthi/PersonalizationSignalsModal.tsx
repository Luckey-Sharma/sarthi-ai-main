import React from 'react';
import { PersonalizationSignal, PatientHealthRecord } from '../../types/healthCompanion';
import { X, Sparkles, CheckCircle2, HeartPulse, Utensils, Footprints, Moon, Pill, ShieldAlert, User } from 'lucide-react';

interface PersonalizationSignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signals: PersonalizationSignal[];
  patient: PatientHealthRecord;
}

export const PersonalizationSignalsModal: React.FC<PersonalizationSignalsModalProps> = ({
  isOpen,
  onClose,
  signals,
  patient,
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category: PersonalizationSignal['category']) => {
    switch (category) {
      case 'diet':
        return <Utensils className="w-4 h-4 text-emerald-700" />;
      case 'activity':
        return <Footprints className="w-4 h-4 text-amber-700" />;
      case 'vitals':
        return <HeartPulse className="w-4 h-4 text-rose-700" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-700" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-purple-700" />;
      case 'profile':
        return <User className="w-4 h-4 text-blue-700" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#416740]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-[#becabf] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#f7faf5] via-[#edf3ec] to-[#f4f7f5] border-b border-[#becabf]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#bfebba] text-[#032517] flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6 text-[#416740]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#032517]">
                  Personalization Signals Engine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#032517] text-white">
                  {signals.length} Signals
                </span>
              </div>
              <p className="text-xs text-[#3e4941] mt-0.5">
                Active signals synthesized for {patient.name} ({patient.age}y, {patient.location.split(',')[0]}).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-[#6f7a70] hover:text-[#032517] flex items-center justify-center transition-colors cursor-pointer border border-[#becabf]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signals List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 font-sans">
          <div className="bg-[#f7faf5] p-3.5 rounded-2xl border border-[#becabf]/60 mb-4">
            <div className="text-xs font-bold text-[#416740] uppercase tracking-wider mb-1">
              Zero Generic Responses
            </div>
            <p className="text-xs text-[#3e4941]">
              AI Saathi does not deliver standard templates. Every response is dynamically personalized using the following live health parameters:
            </p>
          </div>

          <div className="space-y-2.5">
            {signals.map((sig, idx) => (
              <div
                key={sig.id || idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#becabf]/60 hover:border-[#416740] hover:bg-[#f7faf5] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#ecefea] flex items-center justify-center shrink-0">
                    {getCategoryIcon(sig.category)}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6f7a70]">
                      {sig.label}
                    </div>
                    <div className="text-sm font-bold text-[#032517]">
                      {sig.value}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ecefea] text-[#3e4941] capitalize">
                  {sig.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f7faf5] border-t border-[#becabf]/60 flex items-center justify-between text-xs text-[#6f7a70]">
          <span>Transparent AI Explainability</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#032517] text-white text-xs font-bold hover:bg-[#416740] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

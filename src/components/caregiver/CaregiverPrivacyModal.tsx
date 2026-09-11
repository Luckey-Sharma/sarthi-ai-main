import React, { useState } from 'react';
import { UserRole, PrivacyConsentSettings } from '../../types/healthCompanion';
import { X, ShieldCheck, Lock, Eye, EyeOff, UserCheck, CheckCircle2 } from 'lucide-react';

interface CaregiverPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const CaregiverPrivacyModal: React.FC<CaregiverPrivacyModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onRoleChange,
}) => {
  const [settings, setSettings] = useState<PrivacyConsentSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sarthi_privacy_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      shareDailySummaryWithCaregiver: true,
      shareVitalsTrendsWithDoctor: true,
      keepCasualChatConfidential: true,
      allowAnonymousAnalytics: false,
      encryptedStorageEnabled: true,
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof PrivacyConsentSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sarthi_privacy_settings', JSON.stringify(updated));
      }
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-[#becabf] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#edf3ec] via-[#f7faf5] to-[#edf4f0] border-b border-[#becabf]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#bfebba] text-[#032517] flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6 text-[#416740]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#032517]">
                Data Privacy & Role Permissions
              </h3>
              <p className="text-xs text-[#3e4941] mt-0.5">
                Role-based access control and patient consent management.
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

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 font-sans">
          {/* Active Role Switcher */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#456c44] mb-2.5">
              Active User Role
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['patient', 'caregiver', 'doctor', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`p-3 rounded-2xl border text-xs font-bold capitalize transition-all cursor-pointer text-center ${
                    activeRole === role
                      ? 'bg-[#032517] text-white border-[#032517] shadow-xs'
                      : 'bg-[#f7faf5] text-[#3e4941] border-[#becabf]/60 hover:bg-[#ecefea]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#6f7a70] mt-1.5">
              Role determines what data can be viewed. Doctors see clinical vitals; caregivers see routine summaries; private chat transcripts remain confidential.
            </p>
          </div>

          {/* Granular Consent Controls */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#456c44] mb-3">
              Patient Consent & Privacy Controls
            </div>

            <div className="space-y-3">
              {/* Toggle 1: Daily Summary */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f7faf5] border border-[#becabf]/60">
                <div className="pr-3">
                  <div className="text-xs font-bold text-[#032517]">
                    Share Daily Summary with Caregiver
                  </div>
                  <div className="text-[11px] text-[#6f7a70] mt-0.5">
                    Shares routine completion, sleep hours, and medication checkoffs without casual chat logs.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shareDailySummaryWithCaregiver}
                  onChange={() => handleToggle('shareDailySummaryWithCaregiver')}
                  className="w-5 h-5 accent-[#416740] rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggle 2: Doctor Vitals */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f7faf5] border border-[#becabf]/60">
                <div className="pr-3">
                  <div className="text-xs font-bold text-[#032517]">
                    Share 7-Day Vitals Trends with Doctor
                  </div>
                  <div className="text-[11px] text-[#6f7a70] mt-0.5">
                    Permits export of resting blood pressure, SpO2, and step trends for scheduled clinical visits.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shareVitalsTrendsWithDoctor}
                  onChange={() => handleToggle('shareVitalsTrendsWithDoctor')}
                  className="w-5 h-5 accent-[#416740] rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggle 3: Keep Casual Chat Confidential */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f7faf5] border border-[#becabf]/60">
                <div className="pr-3">
                  <div className="text-xs font-bold text-[#032517]">
                    Keep Private Conversations Confidential
                  </div>
                  <div className="text-[11px] text-[#6f7a70] mt-0.5">
                    Casual conversation between elder and AI Saathi is not shared unless a critical emergency safety flag is detected.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.keepCasualChatConfidential}
                  onChange={() => handleToggle('keepCasualChatConfidential')}
                  className="w-5 h-5 accent-[#416740] rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggle 4: Encrypted Local Storage */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f7faf5] border border-[#becabf]/60">
                <div className="pr-3">
                  <div className="text-xs font-bold text-[#032517]">
                    Encrypted On-Device Health Records
                  </div>
                  <div className="text-[11px] text-[#6f7a70] mt-0.5">
                    Sensitive demographic, medication, and vitals data are encrypted on the local browser client.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.encryptedStorageEnabled}
                  onChange={() => handleToggle('encryptedStorageEnabled')}
                  className="w-5 h-5 accent-[#416740] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f7faf5] border-t border-[#becabf]/60 flex items-center justify-between">
          <span className="text-xs text-[#416740] font-bold flex items-center gap-1.5">
            {savedSuccess && (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved securely</span>
              </>
            )}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#032517] text-white text-xs font-bold hover:bg-[#416740] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

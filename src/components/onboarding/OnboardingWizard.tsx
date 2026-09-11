import React, { useState } from 'react';
import { PatientProfile, CaregiverProfile, Language } from '../../types';
import { storage } from '../../services/storage';
import { User, Heart, Pill, BookOpen, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { t } from '../../i18n';

interface OnboardingWizardProps {
  language?: Language;
  onComplete: (patient: PatientProfile) => void;
  onCancel?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  language = 'en',
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Caregiver form state
  const [caregiver, setCaregiver] = useState<CaregiverProfile>(() => storage.loadCaregiver());

  // Patient form state
  const [patient, setPatient] = useState<PatientProfile>(() => storage.loadPatientProfile());

  // Medication draft
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');

  const activeLang = patient.language || language;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save all and complete
      storage.saveCaregiver(caregiver);
      storage.savePatientProfile(patient);
      storage.saveLanguage(patient.language);
      onComplete(patient);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-5 sm:p-7 bg-[#ffffff] rounded-3xl shadow-xl border border-[#becabf]/60 font-sans">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#456c44] mb-2">
          <span>{t('common.step', activeLang) || 'Step'} {step} / 4</span>
          <span className="font-semibold text-[#181d19]">
            {step === 1 && 'Caregiver Details'}
            {step === 2 && 'Elderly Profile & Language'}
            {step === 3 && 'Medications & Care'}
            {step === 4 && 'Life Story & Reminiscence'}
          </span>
        </div>
        <div className="w-full bg-[#ecefea] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#032517] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Caregiver Details */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#bfebba]/40 text-[#032517] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#032517]">Caregiver Setup</h3>
              <p className="text-xs text-[#3e4941]">Who is guiding and monitoring daily care?</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#181d19] mb-1">Caregiver Full Name</label>
            <input
              type="text"
              value={caregiver.name}
              onChange={(e) => setCaregiver({ ...caregiver, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm"
              placeholder="e.g. Ananya Hazarika"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#181d19] mb-1">Relationship to Elder</label>
              <input
                type="text"
                value={caregiver.relation}
                onChange={(e) => setCaregiver({ ...caregiver, relation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm"
                placeholder="e.g. Daughter / Son / Spouse"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#181d19] mb-1">Emergency Phone Number</label>
              <input
                type="tel"
                value={caregiver.phone}
                onChange={(e) => setCaregiver({ ...caregiver, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm"
                placeholder="+91 98640 12345"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Patient Profile & Language */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ffdbd1] text-[#631d08] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#032517]">Elderly Loved One</h3>
              <p className="text-xs text-[#3e4941]">Configure personal and cultural context</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#181d19] mb-1">Elder's Full Name</label>
              <input
                type="text"
                value={patient.name}
                onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#181d19] mb-1">Age</label>
              <input
                type="number"
                value={patient.age}
                onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 70 })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#181d19] mb-1">Primary Native Language</label>
            <select
              value={patient.language}
              onChange={(e) => {
                const l = e.target.value as Language;
                setPatient({ ...patient, language: l, preferredLanguage: l });
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm font-medium"
            >
              <option value="en">English (Default)</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mni">মৈতৈলোন্ (Manipuri)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#181d19] mb-1">Location / Hometown</label>
            <input
              type="text"
              value={patient.location}
              onChange={(e) => setPatient({ ...patient, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm font-medium"
              placeholder="e.g. Guwahati, Assam"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#181d19] mb-1">Diagnosis / Stage</label>
            <select
              value={patient.diagnosisStage}
              onChange={(e) => setPatient({ ...patient, diagnosisStage: e.target.value as PatientProfile['diagnosisStage'] })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm font-medium"
            >
              <option value="Mild Cognitive Impairment">Mild Cognitive Impairment (MCI)</option>
              <option value="Early Stage">Early Stage Dementia</option>
              <option value="Moderate Stage">Moderate Stage Support</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 3: Medications & Care */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#bfebba]/50 text-[#032517] flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#032517]">Medications & Routines</h3>
              <p className="text-xs text-[#3e4941]">Scheduled reminders and hydration tracking</p>
            </div>
          </div>

          <div className="p-3.5 bg-[#f7faf5] rounded-2xl border border-[#becabf]/70">
            <p className="text-xs text-[#032517] font-bold mb-2">Active Prescribed Medications:</p>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-[#3e4941]">
              <li>Donepezil (5mg) — Night bedtime</li>
              <li>Memantine (10mg) — Morning breakfast</li>
              <li>Telmisartan (40mg) — Morning blood pressure</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#181d19] mb-1">Quick Add Another Medication</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Medication name"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] text-xs font-medium focus:ring-2 focus:ring-[#032517] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Dosage (e.g. 5mg)"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                className="w-32 px-3.5 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] text-xs font-medium focus:ring-2 focus:ring-[#032517] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (newMedName) {
                    const current = storage.loadMedications();
                    storage.saveMedications([
                      ...current,
                      {
                        id: `med-${Date.now()}`,
                        name: newMedName,
                        dosage: newMedDosage || 'Standard',
                        timeOfDay: 'morning',
                        time: '09:00',
                        instructions: 'Take with water',
                        takenToday: false,
                      },
                    ]);
                    setNewMedName('');
                    setNewMedDosage('');
                  }
                }}
                className="px-4 py-2.5 bg-[#032517] text-white rounded-xl text-xs font-bold hover:bg-[#1b3b2b] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Life Story */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#bfebba]/50 text-[#032517] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#032517]">Life Story & Reminiscence</h3>
              <p className="text-xs text-[#3e4941]">Key anchors that spark joy and comfort</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#181d19] mb-1">Bio & Treasured Memories</label>
            <textarea
              rows={4}
              value={patient.bio}
              onChange={(e) => setPatient({ ...patient, bio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#becabf] bg-[#f7faf5] focus:ring-2 focus:ring-[#032517] focus:outline-none text-sm font-medium"
              placeholder="e.g. Retired headmaster from Tezpur. Enjoys Bhupen Hazarika songs and morning Assam tea..."
            />
          </div>

          <div className="p-3.5 bg-[#bfebba]/25 rounded-2xl border border-[#bfebba] text-xs text-[#032517] font-medium">
            ✓ 4 authentic family memory recall cards with photos pre-loaded for cognitive reminiscence.
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-7 pt-4 border-t border-[#ecefea] flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 text-[#032517] hover:bg-[#ecefea] text-xs font-bold rounded-xl bg-[#f7faf5] border border-[#becabf]/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back', activeLang)}</span>
          </button>
        ) : onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-[#6f7a70] hover:text-[#181d19] text-xs font-bold transition-colors"
          >
            {t('common.cancel', activeLang) || 'Skip for now'}
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#032517] hover:bg-[#1b3b2b] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <span>{step === 4 ? (t('common.save', activeLang) || 'Save & Start Exploring') : (t('common.continue', activeLang) || 'Continue')}</span>
          {step === 4 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default OnboardingWizard;

import React, { useState } from 'react';
import { Language, Medication } from '../../types';
import { storage } from '../../services/storage';
import { playSound, speak, stopSpeaking } from '../../services/voiceService';
import { t } from '../../services/i18n';
import confetti from 'canvas-confetti';
import { ArrowLeft, Pill, Droplet, Check, Clock, Sun, Sunset, Moon, Plus, Volume2, VolumeX } from 'lucide-react';

interface MedicationRemindersProps {
  language: Language;
  onBack: () => void;
}

export const MedicationReminders: React.FC<MedicationRemindersProps> = ({
  language,
  onBack,
}) => {
  const [meds, setMeds] = useState<Medication[]>(() => storage.loadMedications());
  const [waterCount, setWaterCount] = useState<number>(() => storage.loadWaterCount());
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const handleSpeakMedication = (med: Medication) => {
    if (activeSpeakingId === med.id) {
      stopSpeaking();
      setActiveSpeakingId(null);
      return;
    }
    stopSpeaking();
    setActiveSpeakingId(med.id);
    const speech =
      language === 'as'
        ? `ঔষধৰ নাম: ${med.name}। মাত্ৰা: ${med.dosage}। সময়: ${med.time}। নিৰ্দেশনা: ${med.instructions}।`
        : language === 'bn'
        ? `ওষুধের নাম: ${med.name}। মাত্রা: ${med.dosage}। সময়: ${med.time}। নির্দেশ: ${med.instructions}।`
        : language === 'hi'
        ? `दवाई का नाम: ${med.name}। खुराक: ${med.dosage}। समय: ${med.time}। निर्देश: ${med.instructions}।`
        : language === 'mni'
        ? `Hidak ming: ${med.name}। Matam: ${med.time}। Instruction: ${med.instructions}।`
        : `Medication: ${med.name}. Dosage: ${med.dosage}. Scheduled for ${med.time}. Note: ${med.instructions}.`;
    speak(speech, language, () => {
      setActiveSpeakingId(null);
    });
  };

  const handleSpeakHydration = () => {
    if (activeSpeakingId === 'water') {
      stopSpeaking();
      setActiveSpeakingId(null);
      return;
    }
    stopSpeaking();
    setActiveSpeakingId('water');
    const speech =
      language === 'as'
        ? `আজিৰ পানীৰ লক্ষ্য: ৮ গিলাচ। বৰ্তমানলৈকে ${waterCount} গিলাচ সম্পূৰ্ণ হৈছে।`
        : language === 'bn'
        ? `আজকের পানির লক্ষ্য: ৮ গ্লাস। বর্তমান পর্যন্ত ${waterCount} গ্লাস সম্পন্ন হয়েছে।`
        : language === 'hi'
        ? `आज का जलपान लक्ष्य: 8 गिलास। अब तक आपने ${waterCount} गिलास पानी पिया है।`
        : language === 'mni'
        ? `Nongmagi ishing thakpagi pandam glass 8. Houjik faobada glass ${waterCount} thakle.`
        : `Daily hydration goal: 8 glasses. You have reached ${waterCount} glasses so far today.`;
    speak(speech, language, () => {
      setActiveSpeakingId(null);
    });
  };

  const handleToggleTaken = (id: string) => {
    const updated = meds.map((m) => {
      if (m.id === id) {
        const nextState = !m.takenToday;
        if (nextState) {
          playSound('success');
        }
        return { ...m, takenToday: nextState };
      }
      return m;
    });

    setMeds(updated);
    storage.saveMedications(updated);
  };

  const handleAddWater = () => {
    playSound('click');
    const newCount = Math.min(10, waterCount + 1);
    setWaterCount(newCount);
    storage.saveWaterCount(newCount);

    if (newCount === 8) {
      playSound('success');
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const handleRemoveWater = () => {
    const newCount = Math.max(0, waterCount - 1);
    setWaterCount(newCount);
    storage.saveWaterCount(newCount);
  };

  const getBucketIcon = (timeOfDay: Medication['timeOfDay']) => {
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="w-5 h-5 text-[#9A662C]" />;
      case 'afternoon':
        return <Sunset className="w-5 h-5 text-[#D49544]" />;
      case 'night':
        return <Moon className="w-5 h-5 text-[#6B618F]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-[#1F342A]">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl shadow-cognitiva-sm border border-[rgba(70,80,60,0.08)]"
        style={{ backgroundColor: '#FBF7EF' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#FAF5EB] hover:bg-[#EAE4D7] text-[#1F342A] rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-[rgba(70,80,60,0.08)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <div
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-[rgba(70,80,60,0.08)] text-[#365A46]"
          style={{ backgroundColor: '#E4EBDD' }}
        >
          <Pill className="w-4 h-4 text-[#52745C]" />
          <span>
            {language === 'hi' ? 'दैनिक देखभाल और जलयोजन' :
             language === 'as' ? 'দৈনন্দিন যত্ন আৰু জলপান' :
             language === 'bn' ? 'দৈনিক যত্ন ও জলপান' :
             language === 'mni' ? 'Nongalligi Kanba & Ishing' :
             'Daily Care & Hydration'}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F342A] flex items-center justify-center gap-2">
          <span>{t('medicationTitle', language)}</span>
          <span>🌱</span>
        </h2>
        <p className="text-[#68736B] text-xs sm:text-sm font-medium mt-1">
          {t('medicationSubtitle', language)}
        </p>
      </div>

      {/* Hydration Tracker Card */}
      <div
        className="rounded-[20px] p-6 sm:p-7 shadow-cognitiva text-[#FFFDF7]"
        style={{
          background: 'linear-gradient(135deg, #52745C 0%, #365A46 100%)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              💧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold">
                  {t('waterWidgetTitle', language)}
                </h3>
                <button
                  type="button"
                  onClick={handleSpeakHydration}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpeakingId === 'water'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title={activeSpeakingId === 'water' ? 'Stop audio' : 'Listen to hydration goal'}
                  aria-label="Listen to hydration goal"
                >
                  {activeSpeakingId === 'water' ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#EAEFE6] font-medium">
                {t('waterGoal', language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-serif font-bold">{waterCount}</span>
              <span className="text-xs text-[#EAEFE6] font-semibold"> / 8 {t('waterUnit', language)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRemoveWater}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center text-lg cursor-pointer"
                title={language === 'hi' ? 'कम करें' : language === 'as' ? 'হ্ৰাস কৰক' : language === 'bn' ? 'কমান' : language === 'mni' ? 'Hanthonba' : 'Decrease'}
                aria-label={language === 'hi' ? 'कम करें' : language === 'as' ? 'হ্ৰাস কৰক' : language === 'bn' ? 'কমান' : language === 'mni' ? 'Hanthonba' : 'Decrease'}
              >
                -
              </button>
              <button
                onClick={handleAddWater}
                className="px-4 py-2.5 rounded-xl bg-[#FAF6EE] text-[#1F342A] hover:bg-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#52745C]" />
                <span>{t('addGlass', language)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 8 Glasses visual indicators */}
        <div className="grid grid-cols-8 gap-2 mt-5 pt-4 border-t border-white/20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-11 rounded-xl flex items-center justify-center text-lg transition-all ${
                i < waterCount
                  ? 'bg-white text-[#365A46] shadow-sm font-bold'
                  : 'bg-white/15 text-white/40 border border-white/20'
              }`}
            >
              🥤
            </div>
          ))}
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-serif font-bold text-[#1F342A] flex items-center gap-2">
          <span>{t('todaysMeds', language)}</span>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[rgba(70,80,60,0.08)] text-[#365A46]"
            style={{ backgroundColor: '#E4EBDD' }}
          >
            {meds.filter((m) => m.takenToday).length} / {meds.length} {t('completed', language)}
          </span>
        </h3>

        {meds.map((med) => (
          <div
            key={med.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-cognitiva-sm ${
              med.takenToday
                ? 'bg-[#E4EBDD]/60 border-[rgba(70,80,60,0.12)]'
                : 'bg-[#FBF7EF] border-[rgba(70,80,60,0.08)] hover:border-[#52745C]'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[rgba(70,80,60,0.08)] shadow-2xs"
                style={{ backgroundColor: med.takenToday ? '#E4EBDD' : '#F5EFE4' }}
              >
                {getBucketIcon(med.timeOfDay)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#1F342A] truncate">
                    {med.name}
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF5EB] text-[#68736B] border border-[rgba(70,80,60,0.08)]">
                    {med.dosage}
                  </span>
                  <span className="text-xs font-medium text-[#8A918A] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{med.time}</span>
                  </span>
                </div>
                <p className="text-xs text-[#68736B] font-medium mt-1">
                  {med.instructions}
                </p>
              </div>
            </div>

            {/* Actions: Manual Listen & Taken Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleSpeakMedication(med)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeSpeakingId === med.id
                    ? 'bg-[#52745C] text-white border-[#52745C]'
                    : 'bg-[#FAF5EB] hover:bg-[#EAE4D7] text-[#1F342A] border-[rgba(70,80,60,0.10)]'
                }`}
                title={activeSpeakingId === med.id ? 'Stop speech' : 'Listen to instructions'}
                aria-label="Listen to medication instructions"
              >
                {activeSpeakingId === med.id ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#52745C]" />
                )}
              </button>

              {/* Taken Toggle Button */}
              <button
                onClick={() => handleToggleTaken(med.id)}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  med.takenToday
                    ? 'bg-[#52745C] text-white shadow-sm'
                    : 'bg-[#E4EBDD] hover:bg-[#DCEADB] text-[#365A46] border border-[rgba(70,80,60,0.12)]'
                }`}
              >
                <Check className={`w-4 h-4 ${med.takenToday ? 'stroke-[3]' : ''}`} />
                <span>{med.takenToday ? t('taken', language) : t('tapToConfirm', language)}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationReminders;

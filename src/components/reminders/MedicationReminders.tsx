import React, { useState } from 'react';
import { Language, Medication } from '../../types';
import { storage } from '../../services/storage';
import { playSound, speak } from '../../services/voiceService';
import { t } from '../../services/i18n';
import confetti from 'canvas-confetti';
import { ArrowLeft, Pill, Droplet, Check, Clock, Sun, Sunset, Moon, Plus } from 'lucide-react';

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

  const handleToggleTaken = (id: string) => {
    const updated = meds.map((m) => {
      if (m.id === id) {
        const nextState = !m.takenToday;
        if (nextState) {
          playSound('success');
          speak(
            language === 'en'
              ? `${m.name} marked as taken. Good job!`
              : language === 'as'
              ? `${m.name} ঔষধ খোৱা সম্পূৰ্ণ হ’ল।`
              : language === 'bn'
              ? `${m.name} ওষুধ খাওয়া সম্পন্ন হয়েছে।`
              : language === 'hi'
              ? `${m.name} दवा ले ली गई। बहुत अच्छा!`
              : language === 'mni'
              ? `${m.name} hidak charre. Yamna Fai!`
              : `${m.name} marked as taken. Good job!`,
            language
          );
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
      speak(
        language === 'en'
          ? 'Congratulations! You reached your daily hydration goal of 8 glasses!'
          : language === 'as'
          ? 'অভিনন্দন! আপুনি আজিৰ বাবে প্ৰয়োজনীয় ৮ গিলাচ পানী খোৱা সম্পূৰ্ণ কৰিলে।'
          : language === 'bn'
          ? 'অভিনন্দন! আপনি আজকের ৮ গ্লাস পানি খাওয়ার লক্ষ্য পূরণ করেছেন।'
          : language === 'hi'
          ? 'बधाई हो! आपने आज का 8 गिलास पानी पीने का लक्ष्य पूरा कर लिया।'
          : language === 'mni'
          ? 'Yamna nungngaijare! Nongmagi ishing glass 8 thakpagi pandam ngamle!'
          : 'Congratulations! You reached your daily hydration goal of 8 glasses!',
        language
      );
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
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'afternoon':
        return <Sunset className="w-5 h-5 text-orange-500" />;
      case 'night':
        return <Moon className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-xs border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          <Pill className="w-4 h-4 text-blue-600" />
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
        <h2 className="text-3xl font-black text-stone-900 flex items-center justify-center gap-2">
          <span>{t('medicationTitle', language)}</span>
          <span>💊</span>
        </h2>
        <p className="text-stone-600 text-sm font-medium mt-1">
          {t('medicationSubtitle', language)}
        </p>
      </div>

      {/* Hydration Tracker Card */}
      <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              💧
            </div>
            <div>
              <h3 className="text-xl font-black">
                {t('waterWidgetTitle', language)}
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                {t('waterGoal', language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black">{waterCount}</span>
              <span className="text-xs text-blue-200 font-bold"> / 8 {t('waterUnit', language)}</span>
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
                className="px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
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
              className={`h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                i < waterCount
                  ? 'bg-white text-blue-600 shadow-md font-bold'
                  : 'bg-white/10 text-white/40 border border-white/20'
              }`}
            >
              🥤
            </div>
          ))}
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-stone-800 flex items-center gap-2">
          <span>{t('todaysMeds', language)}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
            {meds.filter((m) => m.takenToday).length} / {meds.length} {t('completed', language)}
          </span>
        </h3>

        {meds.map((med) => (
          <div
            key={med.id}
            className={`p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              med.takenToday
                ? 'bg-emerald-50/60 border-emerald-300'
                : 'bg-white border-stone-200 shadow-sm hover:border-amber-300'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                {getBucketIcon(med.timeOfDay)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base sm:text-lg font-black text-stone-900 truncate">
                    {med.name}
                  </h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {med.dosage}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{med.time}</span>
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium mt-1">
                  {med.instructions}
                </p>
              </div>
            </div>

            {/* Taken Toggle Button */}
            <button
              onClick={() => handleToggleTaken(med.id)}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                med.takenToday
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              <Check className={`w-4 h-4 ${med.takenToday ? 'stroke-[3]' : ''}`} />
              <span>{med.takenToday ? t('taken', language) : t('tapToConfirm', language)}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationReminders;

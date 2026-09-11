import React, { useState } from 'react';
import { Language, PatientProfile, AppView, Medication } from '../../types';
import { storage } from '../../services/storage';
import { playSound, speak, stopSpeaking } from '../../services/voiceService';
import { Sun, Heart, Activity, Droplets, Moon, Shield, Bot, ArrowRight, Check, Volume2 } from 'lucide-react';

interface RightDashboardPanelProps {
  language: Language;
  activePatient: PatientProfile;
  onNavigate: (view: AppView) => void;
  onOpenAISaathi: (query?: string) => void;
  onOpenSOS: () => void;
}

export const RightDashboardPanel: React.FC<RightDashboardPanelProps> = ({
  language,
  activePatient,
  onNavigate,
  onOpenAISaathi,
  onOpenSOS,
}) => {
  const [meds, setMeds] = useState<Medication[]>(() => {
    const loaded = storage.loadMedications();
    if (loaded && loaded.length > 0) return loaded;
    return [
      {
        id: 'med-1',
        name: 'Amlodipine 5mg',
        dosage: '5mg',
        timeOfDay: 'morning',
        time: '8:00 AM',
        instructions: 'After breakfast',
        takenToday: true,
      },
      {
        id: 'med-2',
        name: 'Vitamin D3',
        dosage: '1000 IU',
        timeOfDay: 'afternoon',
        time: '12:00 PM',
        instructions: 'After lunch',
        takenToday: false,
      },
      {
        id: 'med-3',
        name: 'Donepezil 5mg',
        dosage: '5mg',
        timeOfDay: 'night',
        time: '8:00 PM',
        instructions: 'After dinner',
        takenToday: false,
      },
    ];
  });

  const handleToggleMed = (id: string) => {
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

  const localeCode =
    language === 'as' ? 'as-IN' :
    language === 'bn' ? 'bn-IN' :
    language === 'hi' ? 'hi-IN' :
    language === 'mni' ? 'mni-IN' : 'en-US';

  const todayStr = new Intl.DateTimeFormat(localeCode, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const panelTexts: Record<string, Record<Language, string>> = {
    greetingMorning: {
      en: 'Good Morning,',
      hi: 'शुभ प्रभात,',
      as: 'শুভ প্রভাত,',
      bn: 'সুপ্রভাত,',
      mni: 'অয়ূক্কী খুরুমজরি,',
    },
    greetingAfternoon: {
      en: 'Good Afternoon,',
      hi: 'शुभ दोपहर,',
      as: 'শুভ অপৰাহ্ন,',
      bn: 'শুভ অপরাহ্ন,',
      mni: 'নুংথিলগী খুরুমজরি,',
    },
    greetingEvening: {
      en: 'Good Evening,',
      hi: 'शुभ संध्या,',
      as: 'শুভ গধূলি,',
      bn: 'শুভ সন্ধ্যা,',
      mni: 'নুমিদাংগী খুরুমজরি,',
    },
    doingGreat: {
      en: "You're doing great today!",
      hi: 'आज आपका दिन बहुत अच्छा रहे!',
      as: 'আজি আপোনাৰ দিনটো শুভ হওক!',
      bn: 'আজ আপনার দিনটি খুব সুন্দর কাটুক!',
      mni: 'ঙসি নহাক্কী নুমিৎ অসি য়াম্না নুংঙাইয়ু!',
    },
    healthToday: {
      en: 'Health Today',
      hi: 'आज का स्वास्थ्य',
      as: 'আজিৰ স্বাস্থ্য',
      bn: 'আজকের স্বাস্থ্য',
      mni: 'ঙসিগী হকশেল',
    },
    viewDetails: {
      en: 'View Details',
      hi: 'विवरण देखें',
      as: 'বিৱৰণ চাওক',
      bn: 'বিস্তারিত দেখুন',
      mni: 'ময়েক শেংনা য়েংঙু',
    },
    heartRate: {
      en: 'Heart Rate',
      hi: 'हृदय गति',
      as: 'হৃদস্পন্দন',
      bn: 'হৃদস্পন্দন',
      mni: 'থম্মোয়গী খোংজেল',
    },
    oxygen: {
      en: 'Oxygen',
      hi: 'ऑक्सीजन',
      as: 'অক্সিজেন',
      bn: 'অক্সিজেন',
      mni: 'অক্সিজেন',
    },
    bloodPress: {
      en: 'Blood Press.',
      hi: 'रक्तचाप',
      as: 'ৰক্তচাপ',
      bn: 'রক্তচাপ',
      mni: 'ঈগী খোংজেল',
    },
    sleep: {
      en: 'Sleep',
      hi: 'नींद',
      as: 'টোপনি',
      bn: 'ঘুম',
      mni: 'তুম্বা',
    },
    normal: {
      en: 'Normal',
      hi: 'सामान्य',
      as: 'স্বাভাৱিক',
      bn: 'স্বাভাবিক',
      mni: 'চুম্বা',
    },
    good: {
      en: 'Good',
      hi: 'अच्छा',
      as: 'ভাল',
      bn: 'ভালো',
      mni: 'ফবা',
    },
    todaysMedications: {
      en: "Today's Medications",
      hi: 'आज की दवाइयाँ',
      as: 'আজিৰ ঔষধসমূহ',
      bn: 'আজকের ওষুধসমূহ',
      mni: 'ঙসিগী হিদাকশিং',
    },
    viewAll: {
      en: 'View All',
      hi: 'सभी देखें',
      as: 'সকলো চাওক',
      bn: 'সব দেখুন',
      mni: 'পুম্নমক য়েংঙু',
    },
    needHelp: {
      en: 'Need Help?',
      hi: 'मदद चाहिए?',
      as: 'সহায় লাগে নেকি?',
      bn: 'সাহায্য প্রয়োজন?',
      mni: 'মতেং দরকার লৈব্রা?',
    },
    aiCompanionAnytime: {
      en: 'Your AI companion is here anytime.',
      hi: 'आपका एआई साथी हमेशा उपलब्ध है।',
      as: 'আপোনাৰ এআই সংগী সদায় সাজু।',
      bn: 'আপনার এআই সঙ্গী সর্বদা আপনার পাশে।',
      mni: 'নহাক্কী AI সাথী মতম চুপ্পদা লৈরি।',
    },
    talkToSmriti: {
      en: 'Talk to SmritiAI',
      hi: 'स्मृति साथी से बात करें',
      as: 'স্মৃতিসাৰথীৰ সৈতে কথা পাতক',
      bn: 'স্মৃতি এআই-এর সাথে কথা বলুন',
      mni: 'SmritiAI গা ৱারী শানৌ',
    },
    safeHavenActive: {
      en: 'Safe Haven Zone • Active',
      hi: 'सुरक्षित घेरा • सक्रिय',
      as: 'সুৰক্ষিত বলয় • সক্ৰিয়',
      bn: 'নিরাপদ অঞ্চল • সক্রিয়',
      mni: 'সেফ জোন • এক্টিভ',
    },
    gpsStable: {
      en: 'GPS Stable',
      hi: 'जीपीएस स्थिर',
      as: 'GPS সুস্থিৰ',
      bn: 'জিপিএস স্বাভাবিক',
      mni: 'GPS অচুম্বা',
    },
    residence: {
      en: 'Residence',
      hi: 'निवास स्थान',
      as: 'বাসগৃহ',
      bn: 'বাসভবন',
      mni: 'য়ুম',
    },
  };

  const currentHour = new Date().getHours();
  const greetingPrefix = currentHour < 12
    ? panelTexts.greetingMorning[language] || panelTexts.greetingMorning.en
    : currentHour < 17
    ? panelTexts.greetingAfternoon[language] || panelTexts.greetingAfternoon.en
    : panelTexts.greetingEvening[language] || panelTexts.greetingEvening.en;

  const localizeInstructions = (inst: string) => {
    if (inst === 'After breakfast') {
      return language === 'hi' ? 'नाश्ते के बाद' :
        language === 'as' ? 'পুৱাৰ জলপানৰ পিছত' :
        language === 'bn' ? 'সকালের নাস্তার পর' :
        language === 'mni' ? 'অয়ূগী চাক মতুংদা' : 'After breakfast';
    }
    if (inst === 'After lunch') {
      return language === 'hi' ? 'दोपहर भोजन के बाद' :
        language === 'as' ? 'দুপৰীয়াৰ আহাৰৰ পিছত' :
        language === 'bn' ? 'দুপুরের খাবারের পর' :
        language === 'mni' ? 'নুংথিলগী চাক মতুংদা' : 'After lunch';
    }
    if (inst === 'After dinner') {
      return language === 'hi' ? 'रात के खाने के बाद' :
        language === 'as' ? 'ৰাতিৰ আহাৰৰ পিছত' :
        language === 'bn' ? 'রাতের খাবারের পর' :
        language === 'mni' ? 'নুমিদাংগী চাক মতুংদা' : 'After dinner';
    }
    return inst;
  };

  return (
    <aside
      className="w-full xl:w-80 space-y-5 shrink-0 select-none p-4 sm:p-6 xl:p-0"
      data-purpose="health-telemetry-sidebar"
    >
      {/* Date & Friendly Greeting Banner */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm"
        style={{ backgroundColor: '#FAF7F0' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#F3EADD', color: '#9A662C' }}
          >
            {/* Gentle Sun Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" x2="12" y1="1" y2="3"></line>
              <line x1="12" x2="12" y1="21" y2="23"></line>
              <line x1="4.22" x2="5.64" y1="4.22" y2="5.64"></line>
              <line x1="18.36" x2="19.78" y1="18.36" y2="19.78"></line>
              <line x1="1" x2="3" y1="12" y2="12"></line>
              <line x1="21" x2="23" y1="12" y2="12"></line>
              <line x1="4.22" x2="5.64" y1="19.78" y2="18.36"></line>
              <line x1="18.36" x2="19.78" y1="5.64" y2="4.22"></line>
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8A918A] block">{todayStr}</span>
            <span className="text-xs font-bold text-[#1F342A]">
              {greetingPrefix} {activePatient.name ? activePatient.name.split(' ')[0] : 'Sharma ji'}!
            </span>
            <p className="text-[10px] text-[#52745C] font-medium">
              {panelTexts.doingGreat[language] || panelTexts.doingGreat.en}
            </p>
          </div>
        </div>
        <span className="text-[#52745C] text-lg select-none">🌱</span>
      </div>

      {/* Health Today (4 Vitals Cards Grid) */}
      <div
        className="rounded-2xl p-4 border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm"
        style={{ backgroundColor: '#FBF7EF' }}
        data-purpose="vitals-dashboard"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-[#1F342A] text-sm">
            {panelTexts.healthToday[language] || panelTexts.healthToday.en}
          </h3>
          <button
            onClick={() => onOpenAISaathi('How is my health and vitals summary today?')}
            className="text-[11px] font-semibold text-[#52745C] hover:text-[#365A46] flex items-center gap-0.5 cursor-pointer"
          >
            <span>{panelTexts.viewDetails[language] || panelTexts.viewDetails.en}</span>
            <span>→</span>
          </button>
        </div>

        {/* 2x2 Grid for Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Metric 1: Heart Rate */}
          <div
            className="rounded-xl p-2.5 border border-[rgba(70,80,60,0.06)]"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div className="flex items-center gap-1.5 text-[#B65D5D] mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#F7E4E4' }}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#1F342A] block leading-tight">
                  72 <span className="text-[10px] font-normal text-[#8A918A]">bpm</span>
                </span>
                <span className="text-[9px] block text-[#8A918A] truncate">
                  {panelTexts.heartRate[language] || panelTexts.heartRate.en}
                </span>
              </div>
            </div>
            <div className="mt-1">
              <span
                className="inline-block text-[#365A46] text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#E4EBDD' }}
              >
                {panelTexts.normal[language] || panelTexts.normal.en}
              </span>
            </div>
          </div>

          {/* Metric 2: Oxygen */}
          <div
            className="rounded-xl p-2.5 border border-[rgba(70,80,60,0.06)]"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div className="flex items-center gap-1.5 text-[#4D7C94] mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#E3EEF3' }}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#1F342A] block leading-tight">98%</span>
                <span className="text-[9px] block text-[#8A918A] truncate">
                  {panelTexts.oxygen[language] || panelTexts.oxygen.en}
                </span>
              </div>
            </div>
            <div className="mt-1">
              <span
                className="inline-block text-[#365A46] text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#E4EBDD' }}
              >
                {panelTexts.normal[language] || panelTexts.normal.en}
              </span>
            </div>
          </div>

          {/* Metric 3: Blood Pressure */}
          <div
            className="rounded-xl p-2.5 border border-[rgba(70,80,60,0.06)]"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div className="flex items-center gap-1.5 text-[#B65D5D] mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#F7E4E4' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#1F342A] block leading-tight">120 / 80</span>
                <span className="text-[9px] block text-[#8A918A] truncate">
                  {panelTexts.bloodPress[language] || panelTexts.bloodPress.en}
                </span>
              </div>
            </div>
            <div className="mt-1">
              <span
                className="inline-block text-[#365A46] text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#E4EBDD' }}
              >
                {panelTexts.normal[language] || panelTexts.normal.en}
              </span>
            </div>
          </div>

          {/* Metric 4: Sleep */}
          <div
            className="rounded-xl p-2.5 border border-[rgba(70,80,60,0.06)]"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <div className="flex items-center gap-1.5 text-[#6B618F] mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#EDE7F4' }}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#1F342A] block leading-tight">7h 24m</span>
                <span className="text-[9px] block text-[#8A918A] truncate">
                  {panelTexts.sleep[language] || panelTexts.sleep.en}
                </span>
              </div>
            </div>
            <div className="mt-1">
              <span
                className="inline-block text-[#365A46] text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#E4EBDD' }}
              >
                {panelTexts.good[language] || panelTexts.good.en}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Medications */}
      <div
        className="rounded-2xl p-4 border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm"
        style={{ backgroundColor: '#F8EFE2' }}
        data-purpose="prescriptions-tracker"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-[#1F342A] text-sm">
            {panelTexts.todaysMedications[language] || panelTexts.todaysMedications.en}{' '}
            <span className="text-[#8A918A] font-normal">({meds.length})</span>
          </h3>
          <button
            onClick={() => onNavigate('reminders')}
            className="text-[11px] font-semibold text-[#52745C] hover:text-[#365A46] flex items-center gap-0.5 cursor-pointer"
          >
            <span>{panelTexts.viewAll[language] || panelTexts.viewAll.en}</span>
            <span>→</span>
          </button>
        </div>

        {/* Medication List */}
        <div className="space-y-3">
          {meds.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleToggleMed(item.id)}
              className={`flex items-center justify-between pb-2 cursor-pointer transition-opacity ${
                idx < 2 ? 'border-b border-[rgba(70,80,60,0.08)]' : ''
              } hover:opacity-90`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[#B65D5D]"
                  style={{
                    backgroundColor:
                      idx === 0 ? '#F2DDD8' : idx === 1 ? '#EAE1ED' : '#DFE8EE',
                    color: idx === 0 ? '#B65D5D' : idx === 1 ? '#7C668F' : '#4F6C87',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                    <path d="m8.5 8.5 7 7"></path>
                  </svg>
                </div>
                <div>
                  <span
                    className={`text-xs font-bold text-[#1F342A] block ${
                      item.takenToday ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#8A918A]">
                    {localizeInstructions(item.instructions)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    stopSpeaking();
                    speak(`${item.name}. ${item.time}. ${localizeInstructions(item.instructions)}`, language);
                  }}
                  className="p-1 rounded-md text-[#8A918A] hover:text-[#1F342A] hover:bg-[#EAE1ED]/50 transition-colors cursor-pointer"
                  title="Listen to medication details"
                  aria-label="Listen to medication details"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10.5px] font-medium text-[#68736B]">{item.time}</span>
                {item.takenToday ? (
                  <div
                    className="w-5 h-5 rounded-full text-[#FFFDF7] flex items-center justify-center text-[11px]"
                    style={{ backgroundColor: '#52745C' }}
                    title="Taken"
                  >
                    ✓
                  </div>
                ) : (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-[#CBD7C5] hover:border-[#52745C] transition-colors"
                    title="Click to mark taken"
                  ></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Need Help? AI Companion Card */}
      <div
        className="rounded-2xl p-4 relative overflow-hidden border border-[rgba(70,80,60,0.08)] shadow-cognitiva-sm"
        style={{
          background: 'linear-gradient(135deg, #EFE8D8 0%, #E8DFCD 100%)',
        }}
        data-purpose="ai-companion-cta"
      >
        <div className="relative z-10 flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-[#365A46] border border-[rgba(70,80,60,0.08)] shadow-xs"
            style={{ backgroundColor: '#FBF7EF' }}
          >
            {/* Headset / Companion icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-serif font-bold text-[#1F342A] text-sm">
              {panelTexts.needHelp[language] || panelTexts.needHelp.en}
            </h4>
            <p className="text-[11px] text-[#68736B] leading-tight mt-0.5">
              {panelTexts.aiCompanionAnytime[language] || panelTexts.aiCompanionAnytime.en}
            </p>
            <button
              onClick={() => onOpenAISaathi()}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 text-[#FFFDF7] text-xs font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer hover:opacity-95"
              style={{
                backgroundColor: '#52745C',
                boxShadow: '0 2px 8px rgba(82, 116, 92, 0.25)',
              }}
            >
              <span>{panelTexts.talkToSmriti[language] || panelTexts.talkToSmriti.en}</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Botanical leaves decor at corner */}
        <div className="absolute -bottom-2 -left-2 text-[#52745C]/15 pointer-events-none">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C7 5 5 11 6 18c3-1 8-3 10-8 1-3 0-6-4-8z"></path>
          </svg>
        </div>
      </div>

      {/* Safe Haven Zone Status Card */}
      <div
        className="rounded-2xl p-3.5 border border-[rgba(70,80,60,0.08)] bg-[#FBF7EF] flex items-center justify-between text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#52745C] animate-pulse"></span>
          <div>
            <span className="font-semibold text-[#1F342A] block">
              {panelTexts.safeHavenActive[language] || panelTexts.safeHavenActive.en}
            </span>
            <span className="text-[10.5px] text-[#68736B]">
              {activePatient.location?.split(',')[0] || (panelTexts.residence[language] || panelTexts.residence.en)} •{' '}
              {panelTexts.gpsStable[language] || panelTexts.gpsStable.en}
            </span>
          </div>
        </div>
        <button
          onClick={onOpenSOS}
          className="px-2.5 py-1 rounded-lg bg-[#FDE8E5] text-[#BA1A1A] font-bold text-[11px] hover:bg-[#ffdbd1] transition-colors cursor-pointer"
        >
          SOS
        </button>
      </div>
    </aside>
  );
};

export default RightDashboardPanel;

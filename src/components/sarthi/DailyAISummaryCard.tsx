import React from 'react';
import { PatientHealthRecord } from '../../types/healthCompanion';
import { Language, AppView, GameId } from '../../types';
import { Sparkles, Play, Moon, Footprints, Pill, HeartPulse } from 'lucide-react';

interface DailyAISummaryCardProps {
  patient: PatientHealthRecord;
  language: Language;
  onNavigate: (view: AppView, gameId?: GameId) => void;
  onOpenAISaathi: (initialQuery?: string) => void;
}

export const DailyAISummaryCard: React.FC<DailyAISummaryCardProps> = ({
  patient,
  language,
  onNavigate,
  onOpenAISaathi,
}) => {
  const vitals = patient.vitalsHistory?.[0];
  const steps = vitals?.steps || 1420;
  const sleepHours = vitals?.sleepHours || 6.3;
  const sleepH = Math.floor(sleepHours);
  const sleepM = Math.round((sleepHours - sleepH) * 60);
  const bp = vitals?.bloodPressure
    ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`
    : '128/82';
  const morningMed = patient.currentMedications.find((m) => m.timeOfDay === 'morning');

  const greeting =
    {
      en: `Good day, ${patient.name}`,
      hi: `शुभ दिन, ${patient.name} जी`,
      as: `নমস্কাৰ, ${patient.name}`,
      bn: `সুপ্রভাত, ${patient.name}`,
      mni: `Khurumjari, ${patient.name}`,
    }[language] || `Good day, ${patient.name}`;

  const subtitle =
    {
      en: 'Your Day with AI Saathi',
      hi: 'एआई सारथी के साथ आपका दिन',
      as: 'এআই সাৰথীৰ সৈতে আপোনাৰ দিনটো',
      bn: 'এআই সারথীর সাথে আপনার দিন',
      mni: 'AI Saathi ga loinana nongma',
    }[language] || 'Your Day with AI Saathi';

  const summaryTexts: Record<string, Record<Language, string>> = {
    badge: {
      en: 'Personalized AI Summary',
      hi: 'व्यक्तिगत एआई सारांश',
      as: 'ব্যক্তিগত এআই সাৰাংশ',
      bn: 'ব্যক্তিগত এআই সারাংশ',
      mni: 'অখন্নবা AI পাউদম',
    },
    suggestedLabel: {
      en: 'Suggested Next Step:',
      hi: 'सुझाया गया अगला कदम:',
      as: 'পৰামৰ্শ দিয়া পৰৱৰ্তী পদক্ষেপ:',
      bn: 'পরবর্তী প্রস্তাবিত পদক্ষেপ:',
      mni: 'মখা তারকপা খোংথাং:',
    },
    suggestedContent: {
      en: 'Enjoy a calm moment in the veranda, then play a 5-minute memory match activity.',
      hi: 'बरामदे में शांत पल बिताएं, फिर 5 मिनट का मेमोरी मैच खेल खेलें।',
      as: 'বাৰান্দাত কিছু সময় জিৰণি লওক, তাৰ পিছত ৫ মিনিটৰ স্মৃতি খেল খেলক।',
      bn: 'বারান্দায় শান্তভাবে কিছুটা সময় কাটান, তারপর ৫ মিনিটের স্মৃতি খেলাটি খেলুন।',
      mni: 'বরান্দাদা তপ্না পোথারবীয়ু, মখা তানা মিনিট ৫ গী মেমোরী ম্যাচ খেল শানৌ।',
    },
    startActivity: {
      en: 'Start Activity',
      hi: 'गतिविधि शुरू करें',
      as: 'কাৰ্যসূচী আৰম্ভ কৰক',
      bn: 'কার্যক্রম শুরু করুন',
      mni: 'থবক হৌরো',
    },
    askAISaathi: {
      en: 'Ask AI Saathi',
      hi: 'एआई साथी से पूछें',
      as: 'এআই সাৰথীক সোধক',
      bn: 'এআই সারথীকে জিজ্ঞাসা করুন',
      mni: 'AI সাথীদা হংঙু',
    },
    sleepQualityGood: {
      en: 'restful',
      hi: 'आरामदायक',
      as: 'সুন্দৰ',
      bn: 'আরামদায়ক',
      mni: 'নুংঙাইবা',
    },
    sleepQualityFair: {
      en: 'fair',
      hi: 'सामान्य',
      as: 'সাধাৰণ',
      bn: 'মোটামুটি',
      mni: 'চুম্বা',
    },
  };

  const getSleepText = () => {
    const q = vitals?.sleepQuality === 'restful' ? (summaryTexts.sleepQualityGood[language] || 'restful') : (summaryTexts.sleepQualityFair[language] || 'fair');
    switch (language) {
      case 'hi': return <>पिछली रात आप <strong>{sleepH} घंटे {sleepM} मिनट</strong> सोए ({q})।</>;
      case 'as': return <>যোৱা ৰাতি আপুনি <strong>{sleepH} ঘণ্টা {sleepM} মিনিট</strong> শুইছিল ({q})।</>;
      case 'bn': return <>গত রাতে আপনি <strong>{sleepH} ঘণ্টা {sleepM} মিনিট</strong> ঘুমিয়েছেন ({q})।</>;
      case 'mni': return <>অহিংদা নহাক <strong>পুং {sleepH} মিনিট {sleepM}</strong> তুমখি ({q})।</>;
      case 'en':
      default:
        return <>You slept <strong>{sleepH}h {sleepM}m</strong> last night ({q}).</>;
    }
  };

  const getMedText = () => {
    const medName = morningMed?.name || 'Telmisartan';
    switch (language) {
      case 'hi': return <>सुबह की दवा <strong>{medName}</strong> ले ली गई है।</>;
      case 'as': return <>পুৱাৰ ঔষধ <strong>{medName}</strong> গ্ৰহণ কৰা হৈছে।</>;
      case 'bn': return <>সকালের ওষুধ <strong>{medName}</strong> নেওয়া সম্পন্ন হয়েছে।</>;
      case 'mni': return <>অয়ূক্কী হিদাক <strong>{medName}</strong> চাবা লোইরে।</>;
      case 'en':
      default:
        return <>Morning <strong>{medName}</strong> completed.</>;
    }
  };

  const getActivityText = () => {
    switch (language) {
      case 'hi': return <>सक्रियता: <strong>{steps.toLocaleString()} कदम</strong> (सुबह की सामान्य चाल)।</>;
      case 'as': return <>সক্ৰিয়তা: <strong>{steps.toLocaleString()} খোজ</strong> (পুৱাৰ শান্ত গতি)।</>;
      case 'bn': return <>শারীরিক সক্রিয়তা: <strong>{steps.toLocaleString()} পদক্ষেপ</strong> (সকালের মৃদু গতি)।</>;
      case 'mni': return <>খোংথাং: <strong>{steps.toLocaleString()} তা চৎখি</strong> (অয়ূক্কী খোংজেল)।</>;
      case 'en':
      default:
        return <>Activity: <strong>{steps.toLocaleString()} steps</strong> (gentle morning pace).</>;
    }
  };

  const getBpText = () => {
    switch (language) {
      case 'hi': return <>रक्तचाप: <strong>{bp} mmHg</strong> (सामान्य सीमा)।</>;
      case 'as': return <>ৰক্তচাপ: <strong>{bp} mmHg</strong> (স্বাভাৱিক মাত্ৰা)।</>;
      case 'bn': return <>রক্তচাপ: <strong>{bp} mmHg</strong> (স্বাভাবিক মাত্রা)।</>;
      case 'mni': return <>ঈগী খোংজেল: <strong>{bp} mmHg</strong> (চুম্বা)।</>;
      case 'en':
      default:
        return <>Blood Pressure: <strong>{bp} mmHg</strong> (normal range).</>;
    }
  };

  return (
    <div
      className="p-5 sm:p-7 rounded-[20px] border border-[rgba(70,80,60,0.08)] shadow-cognitiva relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(135deg, #FAF6EE 0%, #F5EEE2 50%, #ECE2D0 100%)',
      }}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#E4EBDD]/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#FFFDF7] shadow-xs"
              style={{ backgroundColor: '#52745C' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFFDF7]" />
              <span>{subtitle}</span>
            </span>
            <span
              className="text-xs font-semibold text-[#365A46] px-2.5 py-0.5 rounded-full border border-[rgba(70,80,60,0.10)]"
              style={{ backgroundColor: '#E4EBDD' }}
            >
              {summaryTexts.badge[language] || summaryTexts.badge.en}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1F342A]">
            {greeting}
          </h2>

          {/* Key Insights Noticed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[rgba(70,80,60,0.08)] shadow-2xs"
              style={{ backgroundColor: 'rgba(251, 247, 239, 0.85)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B618F] shrink-0"
                style={{ backgroundColor: '#EDE7F4' }}
              >
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#1F342A]">
                {getSleepText()}
              </span>
            </div>

            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[rgba(70,80,60,0.08)] shadow-2xs"
              style={{ backgroundColor: 'rgba(251, 247, 239, 0.85)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#365A46] shrink-0"
                style={{ backgroundColor: '#E4EBDD' }}
              >
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#1F342A]">
                {getMedText()}
              </span>
            </div>

            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[rgba(70,80,60,0.08)] shadow-2xs"
              style={{ backgroundColor: 'rgba(251, 247, 239, 0.85)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9A662C] shrink-0"
                style={{ backgroundColor: '#F3EADD' }}
              >
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#1F342A]">
                {getActivityText()}
              </span>
            </div>

            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[rgba(70,80,60,0.08)] shadow-2xs"
              style={{ backgroundColor: 'rgba(251, 247, 239, 0.85)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#B65D5D] shrink-0"
                style={{ backgroundColor: '#F7E4E4' }}
              >
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#1F342A]">
                {getBpText()}
              </span>
            </div>
          </div>

          {/* Suggested Next Action */}
          <div className="pt-2 text-xs sm:text-sm text-[#68736B] font-medium flex items-center gap-2">
            <span className="font-bold text-[#1F342A]">
              {summaryTexts.suggestedLabel[language] || summaryTexts.suggestedLabel.en}
            </span>
            <span>
              {summaryTexts.suggestedContent[language] || summaryTexts.suggestedContent.en}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('games', 'memory_match')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-xs transition-all shadow-cognitiva-sm cursor-pointer hover:opacity-95"
            style={{ backgroundColor: '#52745C' }}
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#FFFDF7]" />
            <span>{summaryTexts.startActivity[language] || summaryTexts.startActivity.en}</span>
          </button>

          <button
            onClick={() => onOpenAISaathi('What should I focus on today?')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[#1F342A] font-semibold text-xs border border-[rgba(70,80,60,0.12)] shadow-xs transition-colors cursor-pointer hover:bg-[#FAF6EE]"
            style={{ backgroundColor: '#FAF7F0' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#52745C]" />
            <span>{summaryTexts.askAISaathi[language] || summaryTexts.askAISaathi.en}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyAISummaryCard;

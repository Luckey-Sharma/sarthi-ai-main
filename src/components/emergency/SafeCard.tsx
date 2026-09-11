import React from 'react';
import { Language, PatientProfile } from '../../types';
import { speak } from '../../services/voiceService';
import { ArrowLeft, Phone, MapPin, ShieldAlert, Heart, Navigation, UserCheck } from 'lucide-react';
import { t } from '../../services/i18n';

interface SafeCardProps {
  language: Language;
  patient: PatientProfile;
  onBack: () => void;
}

export const SafeCard: React.FC<SafeCardProps> = ({
  language,
  patient,
  onBack,
}) => {
  const handleReadCard = () => {
    const speech =
      language === 'as'
        ? `আপুনি সম্পূৰ্ণ সুৰক্ষিত। আপোনাৰ নাম ${patient.name}। আপোনাৰ ঠিকনা ${patient.emergencyContact.address}। সহায়ৰ বাবে আপোনাৰ জীয়ৰী ${patient.emergencyContact.name} লৈ ফোন কৰা হৈছে।`
        : language === 'bn'
        ? `আপনি সম্পূর্ণ নিরাপদ। আপনার নাম ${patient.name}। আপনার ঠিকানা ${patient.emergencyContact.address}। সাহায্য পেতে অনুগ্রহ করে আপনার অভিভাবক ${patient.emergencyContact.name}-কে ফোন করুন।`
        : language === 'hi'
        ? `आप पूरी तरह सुरक्षित हैं। आपका नाम ${patient.name} है। आपका घर ${patient.emergencyContact.address} में है। सहायता के लिए ${patient.emergencyContact.name} को कॉल करें।`
        : language === 'mni'
        ? `Nangbu mayek sengna kan-halli. Nanggi ming ${patient.name} kou-ee. Nanggi yum ${patient.emergencyContact.address} da leiri. Mateng lounaba ${patient.emergencyContact.name} da call toubiyu.`
        : `You are completely safe. Your name is ${patient.name}. Your home is at ${patient.emergencyContact.address}. Please call your caregiver ${patient.emergencyContact.name}.`;
    speak(speech, language);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgba(70,80,60,0.05)] border border-[rgba(70,80,60,0.08)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5EBE1]/60 hover:bg-[#F5EBE1] text-[#1F342A] rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[rgba(70,80,60,0.08)]"
        >
          <ArrowLeft className="w-4 h-4 text-[#708A74]" />
          <span>{t('back', language)}</span>
        </button>

        <button
          onClick={handleReadCard}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D9E8D8] hover:bg-[#cbe0ca] text-[#1F342A] rounded-2xl text-xs sm:text-sm font-bold border border-[#708A74]/30 transition-all cursor-pointer shadow-xs"
        >
          <span>🔊 {t('readAloud', language)}</span>
        </button>
      </div>

      {/* Reassurance Banner */}
      <div className="bg-gradient-to-r from-[#1F342A] via-[#263F33] to-[#1F342A] text-white p-6 sm:p-7 rounded-[28px] shadow-[0_8px_30px_rgba(31,52,42,0.15)] text-center space-y-2 border border-[#708A74]/30">
        <div className="w-12 h-12 rounded-full bg-white/10 mx-auto flex items-center justify-center">
          <Heart className="w-6 h-6 fill-current text-[#FFF6D6]" />
        </div>
        <h2 className="text-2xl font-serif font-bold tracking-tight text-[#FAF6EE]">
          {t('safeCardSafeTitle', language)}
        </h2>
        <p className="text-xs sm:text-sm text-[#D9E8D8] max-w-lg mx-auto font-medium">
          {t('safeCardSafeSubtitle', language)}
        </p>
      </div>

      {/* Main SOS Identity Card */}
      <div className="bg-[#FAF6EE] rounded-[32px] p-6 sm:p-8 shadow-[0_4px_25px_rgba(70,80,60,0.08)] border-2 border-[#708A74]/20 space-y-6">
        {/* Photo and Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-[rgba(70,80,60,0.1)] pb-6">
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-md border-4 border-white shrink-0 bg-white"
          />
          <div className="text-center sm:text-left min-w-0">
            <span className="text-xs font-bold text-[#9A4250] bg-[#FDECEF] border border-[#F2BAC5]/60 px-3 py-1 rounded-full uppercase tracking-wider">
              {t('whoAmI', language)}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F342A] mt-2">
              {patient.name}
            </h3>
            <p className="text-sm font-semibold text-[#495E4F] mt-0.5">
              {language === 'hi' ? `आयु: ${patient.age} वर्ष` :
               language === 'bn' ? `বয়স: ${patient.age} বছর` :
               language === 'as' ? `বয়স: ${patient.age} বছৰ` :
               language === 'mni' ? `Chahi: ${patient.age}` :
               `Age: ${patient.age} years`}
            </p>
            <p className="text-xs text-[#1F342A] font-medium mt-2 bg-white/80 p-3 rounded-2xl border border-[rgba(70,80,60,0.1)] leading-relaxed">
              "{patient.bio}"
            </p>
          </div>
        </div>

        {/* Home Location */}
        <div className="space-y-2 border-b border-[rgba(70,80,60,0.1)] pb-6">
          <span className="text-xs font-bold text-[#785E22] bg-[#FFF6D6] border border-[#E0D5B5] px-3 py-1 rounded-full uppercase tracking-wider">
            {t('whereIsHome', language)}
          </span>
          <div className="flex items-start gap-3 mt-3 bg-white/90 p-4 rounded-2xl border border-[rgba(70,80,60,0.1)]">
            <MapPin className="w-6 h-6 text-[#BF5844] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-serif font-bold text-[#1F342A]">
                {patient.emergencyContact.address}
              </h4>
              <p className="text-xs text-[#5A7360] font-medium mt-0.5">
                {patient.location}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Caregiver Contact & One-Tap Call */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[#1F342A] bg-[#D9E8D8] border border-[#708A74]/30 px-3 py-1 rounded-full uppercase tracking-wider">
            {t('whoToCall', language)}
          </span>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#D9E8D8]/50 border border-[#708A74]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#1F342A] text-white flex items-center justify-center shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-[#1F342A]">
                  {patient.emergencyContact.name}
                </h4>
                <p className="text-xs font-bold text-[#495E4F]">
                  {patient.emergencyContact.relation}
                </p>
              </div>
            </div>

            <a
              href={`tel:${patient.emergencyContact.phone}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1F342A] hover:bg-[#2A4438] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer min-h-[48px]"
            >
              <Phone className="w-4 h-4 fill-current animate-bounce" />
              <span>{patient.emergencyContact.phone}</span>
            </a>
          </div>
        </div>

        {/* GPS Live Beacon Badge */}
        <div className="pt-2 flex items-center justify-between text-xs text-[#495E4F] font-semibold bg-white/80 px-4 py-3 rounded-2xl border border-[rgba(70,80,60,0.08)]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span>
              {language === 'hi' ? 'लाइव जीपीएस संकेत' :
               language === 'as' ? 'লাইভ জিপিএছ সংকেত' :
               language === 'bn' ? 'লাইভ জিপিএস সংকেত' :
               language === 'mni' ? 'Live GPS Makhok' :
               'Live GPS Beacon'}: 26.1859° N, 91.7766° E ({patient.location || 'Guwahati'})
            </span>
          </span>
          <Navigation className="w-4 h-4 text-[#708A74]" />
        </div>
      </div>
    </div>
  );
};

export default SafeCard;

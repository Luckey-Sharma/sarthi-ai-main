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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-xs border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <button
          onClick={handleReadCard}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors"
        >
          <span>🔊 {t('readAloud', language)}</span>
        </button>
      </div>

      {/* Reassurance Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center">
          <Heart className="w-6 h-6 fill-current text-amber-200" />
        </div>
        <h2 className="text-2xl font-black">
          {t('safeCardSafeTitle', language)}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto font-medium">
          {t('safeCardSafeSubtitle', language)}
        </p>
      </div>

      {/* Main SOS Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-rose-200 space-y-6">
        {/* Photo and Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-stone-100 pb-6">
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-lg border-4 border-amber-300 shrink-0"
          />
          <div className="text-center sm:text-left min-w-0">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {t('whoAmI', language)}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              {patient.name}
            </h3>
            <p className="text-sm font-semibold text-stone-500 mt-0.5">
              {language === 'hi' ? `आयु: ${patient.age} वर्ष` :
               language === 'bn' ? `বয়স: ${patient.age} বছর` :
               language === 'as' ? `বয়স: ${patient.age} বছৰ` :
               language === 'mni' ? `Chahi: ${patient.age}` :
               `Age: ${patient.age} years`}
            </p>
            <p className="text-xs text-stone-600 font-medium mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
              "{patient.bio}"
            </p>
          </div>
        </div>

        {/* Home Location */}
        <div className="space-y-2 border-b border-stone-100 pb-6">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {t('whereIsHome', language)}
          </span>
          <div className="flex items-start gap-3 mt-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <MapPin className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-extrabold text-stone-900">
                {patient.emergencyContact.address}
              </h4>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {patient.location}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Caregiver Contact & One-Tap Call */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {t('whoToCall', language)}
          </span>
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-emerald-950">
                  {patient.emergencyContact.name}
                </h4>
                <p className="text-xs font-bold text-emerald-700">
                  {patient.emergencyContact.relation}
                </p>
              </div>
            </div>

            <a
              href={`tel:${patient.emergencyContact.phone}`}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4 fill-current animate-bounce" />
              <span>{patient.emergencyContact.phone}</span>
            </a>
          </div>
        </div>

        {/* GPS Live Beacon Badge */}
        <div className="pt-2 flex items-center justify-between text-xs text-stone-500 font-semibold bg-stone-50 px-4 py-2.5 rounded-2xl">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {language === 'hi' ? 'लाइव जीपीएस संकेत' :
               language === 'as' ? 'লাইভ জিপিএছ সংকেত' :
               language === 'bn' ? 'লাইভ জিপিএস সংকেত' :
               language === 'mni' ? 'Live GPS Makhok' :
               'Live GPS Beacon'}: 26.1859° N, 91.7766° E ({patient.location || 'Guwahati'})
            </span>
          </span>
          <Navigation className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

export default SafeCard;

import React, { useState } from 'react';
import { Language, FamilyMember } from '../../types';
import { storage } from '../../services/storage';
import { speak } from '../../services/voiceService';
import { t } from '../../services/i18n';
import { ArrowLeft, Plus, Heart, User, MapPin, Sparkles, Trash2 } from 'lucide-react';

interface FamilyManagerProps {
  language: Language;
  onBack: () => void;
  onRefresh?: () => void;
}

export const FamilyManager: React.FC<FamilyManagerProps> = ({
  language,
  onBack,
  onRefresh,
}) => {
  const [members, setMembers] = useState<FamilyMember[]>(() => storage.loadFamilyMembers());
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [hometown, setHometown] = useState<string>('');
  const [memoryHint, setMemoryHint] = useState<string>('');
  const [favoriteMemory, setFavoriteMemory] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: name.trim(),
      relation: relation.trim() || 'Family Member',
      hometown: hometown.trim() || 'Guwahati, Assam',
      memoryHint: memoryHint.trim() || 'Loves you dearly and visits often.',
      favoriteMemory: favoriteMemory.trim() || 'Sharing evening tea and listening to stories.',
      photoUrl:
        photoUrl.trim() ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    };

    const updated = [...members, newMember];
    setMembers(updated);
    storage.saveFamilyMembers(updated);
    setIsAdding(false);
    resetForm();
    if (onRefresh) onRefresh();
  };

  const handleDeleteMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    storage.saveFamilyMembers(updated);
    if (onRefresh) onRefresh();
  };

  const resetForm = () => {
    setName('');
    setRelation('');
    setHometown('');
    setMemoryHint('');
    setFavoriteMemory('');
    setPhotoUrl('');
  };

  const handleSpeakMember = (member: FamilyMember) => {
    const text =
      language === 'en'
        ? `This is your ${member.relation}, ${member.name}. ${member.memoryHint}`
        : language === 'as'
        ? `এখেত আপোনাৰ ${member.relation}, ${member.name}। ${member.memoryHint}`
        : language === 'bn'
        ? `ইনি আপনার ${member.relation}, ${member.name}। ${member.memoryHint}`
        : language === 'hi'
        ? `ये आपके ${member.relation}, ${member.name} हैं। ${member.memoryHint}`
        : language === 'mni'
        ? `Masi nanggi ${member.relation}, ${member.name} ni. ${member.memoryHint}`
        : `This is your ${member.relation}, ${member.name}. ${member.memoryHint}`;
    speak(text, language);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgba(70,80,60,0.05)] border border-[rgba(70,80,60,0.08)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5EBE1]/60 hover:bg-[#F5EBE1] text-[#1F342A] rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[rgba(70,80,60,0.08)]"
        >
          <ArrowLeft className="w-4 h-4 text-[#708A74]" />
          <span>{t('back', language)}</span>
        </button>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1F342A] hover:bg-[#2A4438] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-[0_4px_12px_rgba(31,52,42,0.15)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addFamilyMember', language)}</span>
        </button>
      </div>

      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FDECEF] text-[#9A4250] text-xs font-bold border border-[#F2BAC5]/40">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>
            {language === 'as'
              ? 'মৰমৰ সোঁৱৰণি আৰু পৰিয়াল'
              : language === 'bn'
              ? 'প্রিয়জন ও পারিবারিক অ্যালবাম'
              : language === 'hi'
              ? 'आत्मीय परिवार व अनमोल यादें'
              : language === 'mni'
              ? 'Imunggi Nungshiba Wari'
              : 'Cherished Family Album'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F342A] tracking-tight">
          {t('familyAlbumTitle', language)}
        </h2>
        <p className="text-[#495E4F] text-xs sm:text-sm font-medium">
          {t('familyAlbumSubtitle', language)}
        </p>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {members.map((member, index) => {
          const pastelBgs = ['bg-[#D9E8D8]/50', 'bg-[#FFF6D6]/50', 'bg-[#F5EBE1]/60', 'bg-[#E8E1EF]/50', 'bg-[#FDECEF]/50'];
          const cardBg = pastelBgs[index % pastelBgs.length];

          return (
            <div
              key={member.id}
              className={`rounded-3xl p-5 shadow-[0_4px_20px_rgba(70,80,60,0.05)] border border-[rgba(70,80,60,0.08)] ${cardBg} hover:shadow-lg transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center`}
            >
              <div
                onClick={() => handleSpeakMember(member)}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border-4 border-white cursor-pointer group bg-white"
                title={t('listenBio', language)}
              >
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#1F342A]/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity text-center p-1">
                  <span className="text-base">🔊</span>
                  <span>{t('listenBio', language)}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-serif font-bold text-[#1F342A] truncate">
                    {member.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSpeakMember(member)}
                      className="text-[#495E4F] hover:text-[#1F342A] p-1.5 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
                      title={t('listenBio', language)}
                      aria-label={t('listenBio', language)}
                    >
                      🔊
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-stone-400 hover:text-[#BF5844] p-1.5 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
                      title={language === 'hi' ? 'हटाएं' : language === 'as' ? 'আঁতৰাওক' : language === 'bn' ? 'মুছে ফেলুন' : language === 'mni' ? 'Muthatlu' : 'Remove Member'}
                      aria-label={language === 'hi' ? 'हटाएं' : language === 'as' ? 'আঁতৰাওক' : language === 'bn' ? 'মুছে ফেলুন' : language === 'mni' ? 'Muthatlu' : 'Remove Member'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 text-[#1F342A] border border-[rgba(70,80,60,0.12)]">
                    {member.relation}
                  </span>
                  <span className="text-xs text-[#5A7360] flex items-center gap-1 bg-white/50 px-2.5 py-0.5 rounded-full">
                    <MapPin className="w-3 h-3 text-[#708A74]" />
                    <span>{member.hometown}</span>
                  </span>
                </div>

                <p className="text-xs text-[#2A4438] font-medium mt-2.5 line-clamp-2 leading-relaxed bg-white/60 p-2 rounded-xl">
                  <strong className="text-[#1F342A]">{t('memoryClueLabel', language)}:</strong> "{member.memoryHint}"
                </p>

                {member.favoriteMemory && (
                  <div className="mt-2 text-[11px] text-[#785E22] bg-[#FFF6D6]/80 px-2.5 py-1 rounded-xl font-medium border border-[#E0D5B5]/60 line-clamp-1">
                    🌟 {member.favoriteMemory}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF6EE] rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[rgba(70,80,60,0.15)] space-y-5">
            <div className="flex items-center justify-between border-b border-[rgba(70,80,60,0.1)] pb-4">
              <h3 className="text-xl font-serif font-bold text-[#1F342A] flex items-center gap-2">
                <User className="w-5 h-5 text-[#708A74]" />
                <span>{t('addFamilyMember', language)}</span>
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-white text-stone-400 hover:text-stone-700 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1F342A] mb-1">{t('fullName', language)}</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl bg-white border border-[rgba(70,80,60,0.15)] focus:ring-2 focus:ring-[#708A74] focus:border-[#708A74] focus:outline-none text-[#1F342A]"
                  placeholder="e.g. Arnob Hazarika"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F342A] mb-1">{t('relationship', language)}</label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-2xl bg-white border border-[rgba(70,80,60,0.15)] focus:ring-2 focus:ring-[#708A74] focus:border-[#708A74] focus:outline-none text-[#1F342A]"
                    placeholder="e.g. Grandson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F342A] mb-1">{t('hometown', language)}</label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-2xl bg-white border border-[rgba(70,80,60,0.15)] focus:ring-2 focus:ring-[#708A74] focus:border-[#708A74] focus:outline-none text-[#1F342A]"
                    placeholder="e.g. Guwahati"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F342A] mb-1">{t('memoryClueLabel', language)}</label>
                <input
                  type="text"
                  value={memoryHint}
                  onChange={(e) => setMemoryHint(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl bg-white border border-[rgba(70,80,60,0.15)] focus:ring-2 focus:ring-[#708A74] focus:border-[#708A74] focus:outline-none text-[#1F342A]"
                  placeholder="e.g. Studies engineering, built bamboo kites with you."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F342A] mb-1">{t('photoUrl', language)}</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl bg-white border border-[rgba(70,80,60,0.15)] focus:ring-2 focus:ring-[#708A74] focus:border-[#708A74] focus:outline-none text-[#1F342A]"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(70,80,60,0.1)]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#495E4F] hover:bg-white cursor-pointer transition-colors"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#1F342A] hover:bg-[#2A4438] text-white shadow-md cursor-pointer transition-all"
                >
                  {t('save', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManager;

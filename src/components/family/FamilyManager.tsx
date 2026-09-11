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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-xs border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back', language)}</span>
        </button>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black shadow-md shadow-rose-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addFamilyMember', language)}</span>
        </button>
      </div>

      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-stone-900 flex items-center justify-center gap-2">
          <span>{t('familyAlbumTitle', language)}</span>
          <Heart className="w-6 h-6 text-rose-500 fill-current" />
        </h2>
        <p className="text-stone-600 text-sm font-medium mt-1">
          {t('familyAlbumSubtitle', language)}
        </p>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl p-5 shadow-md border-2 border-stone-100 hover:border-rose-200 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            <div
              onClick={() => handleSpeakMember(member)}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-amber-200 cursor-pointer group"
              title={t('listenBio', language)}
            >
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                🔊 {t('listenBio', language)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-black text-stone-900 truncate">
                  {member.name}
                </h3>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-stone-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  title={language === 'hi' ? 'हटाएं' : language === 'as' ? 'আঁতৰাওক' : language === 'bn' ? 'মুছে ফেলুন' : language === 'mni' ? 'Muthatlu' : 'Remove Member'}
                  aria-label={language === 'hi' ? 'हटाएं' : language === 'as' ? 'আঁতৰাওক' : language === 'bn' ? 'মুছে ফেলুন' : language === 'mni' ? 'Muthatlu' : 'Remove Member'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {member.relation}
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{member.hometown}</span>
                </span>
              </div>

              <p className="text-xs text-stone-600 font-medium mt-2 line-clamp-2">
                <strong>{t('memoryClueLabel', language)}</strong> "{member.memoryHint}"
              </p>

              <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl font-medium border border-amber-200 line-clamp-1">
                🌟 {member.favoriteMemory}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-600" />
              <span>{t('addFamilyMember', language)}</span>
            </h3>

            <form onSubmit={handleSaveMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('fullName', language)}</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="e.g. Arnob Hazarika"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t('relationship', language)}</label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    placeholder="e.g. Grandson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t('hometown', language)}</label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    placeholder="e.g. Guwahati"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('memoryClueLabel', language)}</label>
                <input
                  type="text"
                  value={memoryHint}
                  onChange={(e) => setMemoryHint(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="e.g. Studies engineering, built bamboo kites with you."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('photoUrl', language)}</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer"
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

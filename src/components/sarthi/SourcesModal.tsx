import React from 'react';
import { AuthoritativeSource } from '../../types/healthCompanion';
import { ExternalLink, X, ShieldCheck, BookOpen, Award } from 'lucide-react';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: AuthoritativeSource[];
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose, sources }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#becabf] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#eef4ea] via-[#f7faf5] to-[#f2f7f9] border-b border-[#becabf]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#bfebba] text-[#032517] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6 text-[#416740]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#032517]">
                  Authoritative Sources Checked
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#bfebba] text-[#032517] border border-[#416740]/20">
                  {sources.length} Verified
                </span>
              </div>
              <p className="text-xs text-[#3e4941] mt-0.5">
                AI Saathi cross-checks medical and nutritional claims with premier healthcare organizations.
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

        {/* Source Cards List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 font-sans divide-y divide-[#becabf]/30">
          {sources.map((source, idx) => (
            <div key={source.id || idx} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#ecefea] text-[#032517] text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#416740] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#416740]" />
                    {source.organization}
                  </span>
                </div>
                {source.publishedDate && (
                  <span className="text-[11px] font-semibold text-[#6f7a70] bg-[#ecefea] px-2 py-0.5 rounded-md">
                    {source.publishedDate}
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-[#032517] leading-snug">
                {source.title}
              </h4>

              {source.snippet && (
                <p className="text-xs sm:text-sm text-[#3e4941] leading-relaxed bg-[#f7faf5] p-3 rounded-xl border border-[#becabf]/40">
                  "{source.snippet}"
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-[#6f7a70] truncate max-w-[280px] sm:max-w-md">
                  {source.domain}
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#032517] text-white hover:bg-[#416740] text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <span>Visit Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f7faf5] border-t border-[#becabf]/60 text-center">
          <p className="text-[11px] text-[#6f7a70]">
            AI Saathi filters blog opinions, advertisements, and unverified forums. Only peer-reviewed, government, and recognized medical authority sources are cited.
          </p>
        </div>
      </div>
    </div>
  );
};

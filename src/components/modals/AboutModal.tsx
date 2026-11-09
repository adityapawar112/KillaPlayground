'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Sparkles,
  Shield,
  Cpu,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const AboutModal: React.FC = () => {
  const { isAboutModalOpen, setAboutModalOpen } = useEditorStore();
  const { t } = useTranslation();

  if (!isAboutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#EBE6DC] rounded-2xl border border-[#D8D1C5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Splash Header (Level 3 Basalt Dark Stone) */}
        <div className="relative bg-[#2B2621] px-6 py-5 text-white flex items-center justify-between border-b border-[#D8D1C5]/30 shadow-inner">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg p-1 shrink-0 backdrop-blur-xs">
              <Image
                src="/killaplayground-tranparent.png"
                alt="The Killa Playground Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-yatra text-xl sm:text-2xl tracking-wide text-white drop-shadow-sm">
                  {t.aboutModal.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#B85F45] text-[10px] font-sans font-bold uppercase tracking-wider text-white shadow-xs">
                  {t.aboutModal.version}
                </span>
              </div>
              <p className="text-xs text-[#EBE6DC]/90 font-sans mt-0.5">
                {t.aboutModal.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAboutModalOpen(false)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title={t.aboutModal.closeBtn}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
          {/* Main Hero Card (Level 1 Surface) */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#FAF8F5] border border-[#D8D1C5]">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <Image
                src="/killaplayground-tranparent.png"
                alt="Killa Playground Mascot"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-sans font-bold text-base text-[#2B2621] mb-1">
                {t.aboutModal.tagline}
              </h3>
              <p className="text-xs text-[#5A5248] leading-relaxed">
                {t.aboutModal.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="px-2 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] text-[10px] font-semibold">
                  {t.aboutModal.tags.mud}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] text-[10px] font-semibold">
                  {t.aboutModal.tags.ramparts}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] text-[10px] font-semibold">
                  {t.aboutModal.tags.bastions}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] text-[10px] font-semibold">
                  {t.aboutModal.tags.saffronFlag}
                </span>
              </div>
            </div>
          </div>

          {/* Architecture & Tech Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D8D1C5] flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-[#2B2621] text-white flex items-center justify-center shrink-0">
                <Cpu size={16} strokeWidth={1.75} className="text-[#B85F45]" />
              </div>
              <div>
                <span className="font-semibold text-[#2B2621] block">{t.aboutModal.clientSide3DTitle}</span>
                <span className="text-[#5A5248] text-[11px] leading-snug block mt-0.5">
                  {t.aboutModal.clientSide3DDesc}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D8D1C5] flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-[#8F4938] text-white flex items-center justify-center shrink-0">
                <Shield size={16} strokeWidth={1.75} className="text-[#FAF8F5]" />
              </div>
              <div>
                <span className="font-semibold text-[#2B2621] block">{t.aboutModal.privacyTitle}</span>
                <span className="text-[#5A5248] text-[11px] leading-snug block mt-0.5">
                  {t.aboutModal.privacyDesc}
                </span>
              </div>
            </div>
          </div>

          {/* Credits & Asset Attributions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#B85F45] flex items-center gap-1.5 font-sans">
              <Heart size={14} strokeWidth={1.75} className="text-[#B85F45]" />
              {t.aboutModal.creditsTitle}
            </h4>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D8D1C5] text-[11px] text-[#5A5248] space-y-1.5 leading-relaxed">
              <div>{t.aboutModal.retrogroundCredit}</div>
              <div>{t.aboutModal.foliageCredit}</div>
              <div>{t.aboutModal.typographyCredit}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#EBE6DC] border-t border-[#D8D1C5] flex items-center justify-between font-sans">
          <span className="text-[11px] text-[#7C7267]">
            {t.aboutModal.footerReverence}
          </span>
          <button
            onClick={() => setAboutModalOpen(false)}
            className="px-4 py-1.5 rounded-md bg-[#B85F45] hover:bg-[#A3523B] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.aboutModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

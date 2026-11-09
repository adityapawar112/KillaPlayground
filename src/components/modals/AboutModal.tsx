'use client';

import React from 'react';
import Image from 'next/image';
import {
  TbX,
  TbSparkles,
  TbShield,
  TbCpu,
  TbHeart,
  TbExternalLink,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const AboutModal: React.FC = () => {
  const { isAboutModalOpen, setAboutModalOpen } = useEditorStore();
  const { t } = useTranslation();

  if (!isAboutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#F9F6F0] rounded-3xl border-2 border-[#D9C9B4] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Splash Header */}
        <div className="relative bg-[#4B382C] px-6 py-5 text-white flex items-center justify-between border-b border-[#D9C9B4]/40 shadow-inner">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg p-1 shrink-0 backdrop-blur-xs">
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
                <span className="px-2 py-0.5 rounded-full bg-[#E85D04] text-[10px] font-sans font-bold uppercase tracking-wider text-white shadow-xs">
                  {t.aboutModal.version}
                </span>
              </div>
              <p className="text-xs text-[#F2EBE1]/90 font-sans mt-0.5">
                {t.aboutModal.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAboutModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title={t.aboutModal.closeBtn}
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* Main Hero Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#F2EBE1] border border-[#D9C9B4]">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
              <Image
                src="/killaplayground-tranparent.png"
                alt="Killa Playground Mascot"
                width={128}
                height={128}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-sans font-bold text-base text-[#2B1E16] mb-1">
                {t.aboutModal.tagline}
              </h3>
              <p className="text-xs text-[#634E40] leading-relaxed">
                {t.aboutModal.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  {t.aboutModal.tags.mud}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  {t.aboutModal.tags.ramparts}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  {t.aboutModal.tags.bastions}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  {t.aboutModal.tags.saffronFlag}
                </span>
              </div>
            </div>
          </div>

          {/* Architecture & Tech Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F2EBE1]/80 border border-[#D9C9B4]/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4B382C] text-white flex items-center justify-center shrink-0">
                <TbCpu className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">{t.aboutModal.clientSide3DTitle}</span>
                <span className="text-[#634E40] text-[11px] leading-snug block mt-0.5">
                  {t.aboutModal.clientSide3DDesc}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2EBE1]/80 border border-[#D9C9B4]/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8F4938] text-white flex items-center justify-center shrink-0">
                <TbShield className="w-4 h-4 text-[#FAF8F5]" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">{t.aboutModal.privacyTitle}</span>
                <span className="text-[#634E40] text-[11px] leading-snug block mt-0.5">
                  {t.aboutModal.privacyDesc}
                </span>
              </div>
            </div>
          </div>

          {/* Credits & Asset Attributions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B85F45] flex items-center gap-1 font-sans">
              <TbHeart className="w-3.5 h-3.5 text-[#B85F45]" />
              {t.aboutModal.creditsTitle}
            </h4>
            <div className="p-3 rounded-xl bg-[#ECE2D5]/70 border border-[#D9C9B4] text-[11px] text-[#634E40] space-y-1.5 leading-relaxed">
              <div>
                {t.aboutModal.retrogroundCredit}
              </div>
              <div>
                {t.aboutModal.foliageCredit}
              </div>
              <div>
                {t.aboutModal.typographyCredit}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F2EBE1] border-t border-[#D9C9B4] flex items-center justify-between font-sans">
          <span className="text-[11px] text-[#8D7666]">
            {t.aboutModal.footerReverence}
          </span>
          <button
            onClick={() => setAboutModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-[#4B382C] hover:bg-[#38281E] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.aboutModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};


'use client';

import React from 'react';
import Image from 'next/image';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Flame,
  Sparkles,
  Shield,
  ChevronDown,
  Languages,
  Keyboard,
} from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';
import { LanguageSelector } from '@/components/common/LanguageSelector';

interface TopNavBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const {
    fortTitle,
    templateId,
    nightMode,
    toggleNightMode,
    setPosterModalOpen,
    setModeSelectModalOpen,
    setResetConfirmOpen,
    setShortcutsModalOpen,
  } = useEditorStore();

  const { t, locale, setLocale } = useTranslation();

  const templateNames: Record<string, { en: string; mr: string; hi: string }> = {
    raigad: { en: 'Raigad Fort', mr: 'किल्ले रायगड', hi: 'रायगड किला' },
    janjira: { en: 'Murud-Janjira Sea Fort', mr: 'मुरुड-जंजिरा जलदुर्ग', hi: 'मुरुड-जंजीरा जलदुर्ग' },
    sinhagad: { en: 'Sinhagad Fort', mr: 'किल्ले सिंहगड', hi: 'सिंहगड किला' },
    pratapgad: { en: 'Pratapgad Fort', mr: 'किल्ले प्रतापगड', hi: 'प्रतापगड किला' },
    vijaydurg: { en: 'Vijaydurg Fort', mr: 'किल्ले विजयदुर्ग', hi: 'विजयदुर्ग किला' },
    scratch: { en: 'Freeform Diorama', mr: 'मुक्त रचना', hi: 'मुक्त रचना' },
  };

  const activeTemplateLabel =
    templateNames[templateId]?.[locale] || templateNames[templateId]?.en || t.mode;

  return (
    <header className="fixed top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none select-none">
      {/* Left cluster: Branding & Fort Nameplate */}
      <div className="flex items-center gap-2.5 pointer-events-auto bg-[#EBE6DC]/95 backdrop-blur-md px-3 py-1 rounded-xl border border-[#D8D1C5] shadow-sm transition-all">
        <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
          <Image
            src="/killaplayground-tranparent.png"
            alt="The Killa Playground Logo"
            width={28}
            height={28}
            className="w-full h-full object-contain drop-shadow-xs"
            priority
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs tracking-tight text-[#2B2621]">
              {fortTitle || t.defaultFortTitle}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5]">
              Studio
            </span>
          </div>
        </div>
      </div>

      {/* Center cluster: Active Mode Pill */}
      <button
        onClick={() => setModeSelectModalOpen(true)}
        className="hidden md:flex items-center gap-2 pointer-events-auto bg-[#EBE6DC]/95 backdrop-blur-md hover:bg-[#D8D1C5] px-3 py-1.5 rounded-xl border border-[#D8D1C5] shadow-sm transition-all group cursor-pointer"
        title="Change Fort Blueprint or Generate Terrain"
      >
        <span className="w-2 h-2 rounded-full bg-[#B85F45] animate-pulse" />
        <span className="text-xs font-semibold text-[#2B2621]">
          {activeTemplateLabel}
        </span>
        <ChevronDown size={14} strokeWidth={1.75} className="text-[#7C7267] group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Right cluster: Language, Undo/Redo/Reset, Night Diya Mode, Finish CTA */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Language Switcher (EN | MR | HI) */}
        <LanguageSelector size="md" />

        {/* Undo / Redo / Separate Reset Cluster */}
        <div className="flex items-center bg-[#EBE6DC]/95 backdrop-blur-md rounded-xl border border-[#D8D1C5] shadow-sm p-0.5">
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              canUndo
                ? 'text-[#2B2621] hover:bg-[#D8D1C5]'
                : 'text-[#A3978B] cursor-not-allowed'
            }`}
            title={t.undo}
          >
            <Undo2 size={16} strokeWidth={1.75} />
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              canRedo
                ? 'text-[#2B2621] hover:bg-[#D8D1C5]'
                : 'text-[#A3978B] cursor-not-allowed'
            }`}
            title={t.redo}
          >
            <Redo2 size={16} strokeWidth={1.75} />
          </button>

          <div className="w-[1px] h-4 bg-[#D8D1C5] mx-0.5" />

          {/* Dedicated Reset Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="p-1.5 rounded-md text-[#B85F45] hover:bg-[#B85F45]/15 transition-colors cursor-pointer"
            title={t.reset}
          >
            <RotateCcw size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Shortcuts Button */}
        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="p-1.5 rounded-xl bg-[#EBE6DC]/95 backdrop-blur-md border border-[#D8D1C5] shadow-sm text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-all cursor-pointer"
          title={t.shortcuts}
        >
          <Keyboard size={16} strokeWidth={1.75} />
        </button>

        {/* Diwali Night Diya Toggle */}
        <button
          onClick={toggleNightMode}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border shadow-sm backdrop-blur-md transition-all cursor-pointer ${
            nightMode
              ? 'bg-[#2B2621] text-[#FAF8F5] border-[#2B2621]'
              : 'bg-[#EBE6DC]/95 text-[#5A5248] border-[#D8D1C5] hover:bg-[#D8D1C5]'
          }`}
          title="Toggle Diwali Evening & Glowing Diyas (N)"
        >
          <Flame
            size={16}
            strokeWidth={1.75}
            className={`transition-transform ${
              nightMode ? 'scale-110 text-[#B85F45] animate-pulse' : 'text-[#7C7267]'
            }`}
          />
          <span className="text-xs font-semibold hidden lg:inline">
            {nightMode ? t.nightModeOn : t.nightModeOff}
          </span>
        </button>

        {/* Finish & Share Button */}
        <button
          onClick={() => setPosterModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#B85F45] hover:bg-[#A3523B] active:scale-95 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Sparkles size={16} strokeWidth={1.75} />
          <span>{t.finishKilla}</span>
        </button>
      </div>
    </header>
  );
};

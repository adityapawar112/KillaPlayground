'use client';

import React from 'react';
import {
  TbArrowBackUp,
  TbArrowForwardUp,
  TbReload,
  TbFlame,
  TbSparkles,
  TbShield,
  TbChevronDown,
  TbLanguage,
  TbKeyboard,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';

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
      <div className="flex items-center gap-2.5 pointer-events-auto bg-[#F2EBE1]/92 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#D9C9B4] shadow-md transition-all">
        <div className="w-8 h-8 rounded-xl bg-[#B85F45] text-white flex items-center justify-center font-bold text-xs shadow-inner">
          <TbShield className="w-4 h-4 text-[#FAF8F5]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm tracking-tight text-[#2B1E16]">
              {fortTitle || t.defaultFortTitle}
            </span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#EADECF] text-[#634E40]">
              Playground
            </span>
          </div>
        </div>
      </div>

      {/* Center cluster: Active Mode Pill */}
      <button
        onClick={() => setModeSelectModalOpen(true)}
        className="hidden md:flex items-center gap-2 pointer-events-auto bg-[#F2EBE1]/92 backdrop-blur-md hover:bg-[#DFCDBD] px-3.5 py-1.5 rounded-2xl border border-[#D9C9B4] shadow-md transition-all group cursor-pointer"
        title="Change Fort Blueprint or Generate Terrain"
      >
        <span className="w-2 h-2 rounded-full bg-[#E85D04] animate-pulse" />
        <span className="text-xs font-semibold text-[#4B382C]">
          {activeTemplateLabel}
        </span>
        <TbChevronDown className="w-3.5 h-3.5 text-[#8D7666] group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Right cluster: Language, Undo/Redo/Reset, Night Diya Mode, Finish CTA */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Language Switcher (EN | MR | HI) */}
        <div className="flex items-center bg-[#F2EBE1]/92 backdrop-blur-md rounded-2xl border border-[#D9C9B4] shadow-md p-1">
          {(['en', 'mr', 'hi'] as Locale[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={`px-2 py-1 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
                locale === lang
                  ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm'
                  : 'text-[#8D7666] hover:text-[#2B1E16] hover:bg-[#DFCDBD]'
              }`}
              title={lang === 'en' ? 'English (Default)' : lang === 'mr' ? 'मराठी' : 'हिन्दी'}
            >
              {lang === 'en' ? 'EN' : lang === 'mr' ? 'म' : 'हि'}
            </button>
          ))}
        </div>

        {/* Undo / Redo / Separate Reset Cluster */}
        <div className="flex items-center bg-[#F2EBE1]/92 backdrop-blur-md rounded-2xl border border-[#D9C9B4] shadow-md p-1">
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              canUndo
                ? 'text-[#2B1E16] hover:bg-[#DFCDBD]'
                : 'text-[#B29E8E] cursor-not-allowed'
            }`}
            title={t.undo}
          >
            <TbArrowBackUp className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              canRedo
                ? 'text-[#2B1E16] hover:bg-[#DFCDBD]'
                : 'text-[#B29E8E] cursor-not-allowed'
            }`}
            title={t.redo}
          >
            <TbArrowForwardUp className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-[#D9C9B4] mx-0.5" />

          {/* Dedicated Reset Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="p-1.5 rounded-xl text-[#B85F45] hover:bg-[#B85F45]/15 transition-colors cursor-pointer"
            title={t.reset}
          >
            <TbReload className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Button */}
        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="p-2 rounded-2xl bg-[#F2EBE1]/92 backdrop-blur-md border border-[#D9C9B4] shadow-md text-[#634E40] hover:bg-[#DFCDBD] hover:text-[#2B1E16] transition-all cursor-pointer"
          title={t.shortcuts}
        >
          <TbKeyboard className="w-4 h-4" />
        </button>

        {/* Diwali Night Diya Toggle */}
        <button
          onClick={toggleNightMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shadow-md backdrop-blur-md transition-all cursor-pointer ${
            nightMode
              ? 'bg-[#23211E] text-[#F59E0B] border-[#F59E0B] shadow-[#F59E0B]/20'
              : 'bg-[#F2EBE1]/92 text-[#634E40] border-[#D9C9B4] hover:bg-[#DFCDBD]'
          }`}
          title="Toggle Diwali Evening & Glowing Diyas (N)"
        >
          <TbFlame
            className={`w-4 h-4 transition-transform ${
              nightMode ? 'scale-110 text-[#F59E0B] animate-pulse' : 'text-[#8D7666]'
            }`}
          />
          <span className="text-xs font-semibold hidden lg:inline">
            {nightMode ? t.nightModeOn : t.nightModeOff}
          </span>
        </button>

        {/* Finish & Share Button */}
        <button
          onClick={() => setPosterModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#E85D04] hover:bg-[#FF7722] active:scale-95 text-white px-3.5 py-1.5 rounded-2xl font-semibold text-xs shadow-lg shadow-[#E85D04]/35 transition-all cursor-pointer"
        >
          <TbSparkles className="w-4 h-4" />
          <span>{t.finishKilla}</span>
        </button>
      </div>
    </header>
  );
};

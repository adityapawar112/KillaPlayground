'use client';

import React, { useRef, useEffect } from 'react';
import {
  TbShield,
  TbX,
  TbMountain,
  TbRipple,
  TbBuildingCastle,
  TbFlame,
  TbFolderOpen,
  TbTrash,
  TbClock,
  TbCheck,
  TbSparkles,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

interface BlueprintOption {
  id: string;
  name: { en: string; mr: string; hi: string };
  desc: { en: string; mr: string; hi: string };
  icon: React.ElementType;
}

const BLUEPRINTS: BlueprintOption[] = [
  {
    id: 'raigad',
    name: { en: 'Raigad Fort', mr: 'किल्ले रायगड', hi: 'रायगड किला' },
    desc: {
      en: 'Capital fortress, Balekilla plateau, Takmak Tok & sheer cliffs',
      mr: 'स्वराज्याची राजधानी, बालेकिल्ला व अभेद्य कडे',
      hi: 'स्वराज्य की राजधानी, बालेकिल्ला और अभेद्य चट्टानें',
    },
    icon: TbMountain,
  },
  {
    id: 'janjira',
    name: { en: 'Murud-Janjira Sea Fort', mr: 'मुरुड-जंजिरा जलदुर्ग', hi: 'मुरुड-जंजीरा जलदुर्ग' },
    desc: {
      en: 'Invincible sea fortress in the Arabian Sea with 19 round bastions',
      mr: 'अरबी समुद्रातील अजिंक्य जलदुर्ग, १९ बुलंद बुरूज',
      hi: 'अरब सागर में स्थित जलदुर्ग, १९ बुलंद बुर्ज',
    },
    icon: TbRipple,
  },
  {
    id: 'sinhagad',
    name: { en: 'Sinhagad Fort', mr: 'किल्ले सिंहगड', hi: 'सिंहगड किला' },
    desc: {
      en: 'High mountain ridge fortress celebrated for Tanaji Malusare bravery',
      mr: 'पुण्याजवळील तानाजी मालुसरेंच्या पराक्रमाने पावन झालेला गड',
      hi: 'तानाजी मालुसरे की वीरता से पावन हुआ पर्वतीय किला',
    },
    icon: TbBuildingCastle,
  },
];

export const StartupModal: React.FC = () => {
  const {
    isStartupModalOpen,
    setStartupModalOpen,
    setTerrainDrawerOpen,
    templateId,
    setTemplateId,
    setFortTitle,
    nightMode,
    toggleNightMode,
    dontShowStartupModal,
    setDontShowStartupModal,
    savedProjects,
    loadSavedProjects,
    loadProjectLocally,
    deleteProjectLocally,
    importProjectData,
    setToastMessage,
  } = useEditorStore();

  const { t, locale, setLocale } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved projects when modal mounts
  useEffect(() => {
    loadSavedProjects();
  }, [loadSavedProjects]);

  if (!isStartupModalOpen) return null;

  const handleSelectBlueprint = (blueprintId: string, defaultTitle: string) => {
    setTemplateId(blueprintId);
    setFortTitle(defaultTitle);
    setStartupModalOpen(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProjectData(content);
      if (success) {
        setToastMessage(t.startupModal.importSuccess);
        setStartupModalOpen(false);
      } else {
        setToastMessage(t.startupModal.invalidFormat);
      }
      setTimeout(() => setToastMessage(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 animate-in fade-in duration-200 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.killa"
        onChange={handleFileImport}
        className="hidden"
      />

      <div className="relative w-full max-w-4xl bg-[#F9F6F0] rounded-3xl border-2 border-[#D9C9B4] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Blender-Style Splash Header */}
        <div className="relative bg-gradient-to-r from-[#4B382C] via-[#8F4938] to-[#B85F45] px-6 py-5 text-white flex items-center justify-between border-b border-[#D9C9B4]/40 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              <TbShield className="w-7 h-7 text-[#FAF8F5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-yatra text-2xl sm:text-3xl tracking-wide text-white drop-shadow-sm">
                  {t.startupModal.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E85D04] text-[10px] font-sans font-bold uppercase tracking-wider text-white shadow-xs">
                  v1.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#F2EBE1]/90 font-sans mt-0.5">
                {t.startupModal.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setStartupModalOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title={t.startupModal.close}
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D9C9B4] flex-1 overflow-y-auto">
          {/* LEFT COLUMN: Single Buttons for Blueprints & From Scratch */}
          <div className="p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B85F45] block font-sans">
                Choose Fort Architecture
              </span>

              {/* Single Button 1: Historical Fort Blueprints */}
              <button
                onClick={() => {
                  setStartupModalOpen(false);
                  setTerrainDrawerOpen(true, 'historical');
                }}
                className="w-full p-4 rounded-2xl bg-[#F2EBE1]/90 border-2 border-[#D9C9B4] hover:border-[#4B382C] hover:bg-[#EADECF] text-left transition-all cursor-pointer group shadow-xs hover:shadow-md flex items-start gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#4B382C] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <TbBuildingCastle className="w-6 h-6 text-[#FAF8F5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[#2B1E16] font-yatra tracking-wide">
                      {t.startupModal.blueprints}
                    </h3>
                    <span className="text-[10px] font-bold text-[#4B382C] bg-[#DFCDBD] px-2 py-0.5 rounded-full uppercase">
                      5 Forts
                    </span>
                  </div>
                  <p className="text-xs text-[#634E40] mt-1 leading-relaxed">
                    Select authentic Sahyadri hill & sea fort blueprints (Raigad, Murud-Janjira, Sinhagad, Pratapgad, Vijaydurg) with expansive flat tablelands.
                  </p>
                </div>
              </button>

              {/* Single Button 2: From Scratch / Freeform Terrain */}
              <button
                onClick={() => {
                  setStartupModalOpen(false);
                  setTerrainDrawerOpen(true, 'freeform');
                }}
                className="w-full p-4 rounded-2xl bg-[#F2EBE1]/90 border-2 border-[#D9C9B4] hover:border-[#4B382C] hover:bg-[#EADECF] text-left transition-all cursor-pointer group shadow-xs hover:shadow-md flex items-start gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#8F4938] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <TbMountain className="w-6 h-6 text-[#FAF8F5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[#2B1E16] font-yatra tracking-wide">
                      {t.startupModal.fromScratch}
                    </h3>
                    <span className="text-[10px] font-bold text-[#8F4938] bg-orange-100 px-2 py-0.5 rounded-full uppercase">
                      Custom
                    </span>
                  </div>
                  <p className="text-xs text-[#634E40] mt-1 leading-relaxed">
                    Procedural terrain generator with custom summit tableland width, peak elevation, cliff drops, and base water level.
                  </p>
                </div>
              </button>

              {/* Open / Import Project File Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 rounded-2xl bg-[#F2EBE1]/60 border border-[#D9C9B4] hover:bg-[#DFCDBD] text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <TbFolderOpen className="w-5 h-5 text-[#0284C7]" />
                  <span className="font-bold text-xs text-[#2B1E16] font-yatra">
                    {t.startupModal.importFile}
                  </span>
                </div>
                <span className="text-[10px] text-[#8D7666]">
                  .killa / .json
                </span>
              </button>
            </div>

            {/* Quick Preferences */}
            <div className="pt-2 border-t border-[#D9C9B4]/60 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-[#8D7666] mr-1">Language:</span>
                {(['en', 'mr', 'hi'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      locale === lang
                        ? 'bg-[#4B382C] text-white'
                        : 'bg-[#EADECF] text-[#634E40] hover:bg-[#DFCDBD]'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'mr' ? 'मराठी' : 'हिन्दी'}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleNightMode}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  nightMode
                    ? 'bg-[#23211E] text-[#F59E0B] border border-[#F59E0B]'
                    : 'bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]'
                }`}
              >
                <TbFlame className={`w-4 h-4 ${nightMode ? 'text-[#F59E0B]' : 'text-[#8D7666]'}`} />
                <span>{nightMode ? 'Night Diya' : 'Daylight'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Locally Saved Projects */}
          <div className="p-5 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B85F45] flex items-center gap-1.5 font-sans">
                <TbClock className="w-4 h-4" />
                {t.startupModal.recentProjects}
              </h3>
              <span className="text-[11px] font-semibold text-[#8D7666]">
                {savedProjects.length} saved
              </span>
            </div>

            {/* List of projects */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px]">
              {savedProjects.length === 0 ? (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#D9C9B4] rounded-2xl bg-[#F2EBE1]/40">
                  <div className="w-12 h-12 rounded-2xl bg-[#EADECF] text-[#8D7666] flex items-center justify-center mb-3">
                    <TbClock className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-[#4B382C]">
                    {t.startupModal.noRecents}
                  </h4>
                  <p className="text-xs text-[#8D7666] mt-1 max-w-xs leading-relaxed">
                    {t.startupModal.noRecentsDesc}
                  </p>
                </div>
              ) : (
                savedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-2xl bg-[#F2EBE1] border border-[#D9C9B4] hover:border-[#BFA892] transition-all flex items-center justify-between group"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2B1E16] font-yatra truncate">
                          {project.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#8D7666] bg-[#EADECF] px-1.5 py-0.5 rounded">
                          {project.templateId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#8D7666] mt-1">
                        <TbClock className="w-3.5 h-3.5 text-[#B58B63]" />
                        <span>
                          {t.startupModal.lastSaved}: {formatTimeAgo(project.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => loadProjectLocally(project.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#4B382C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#322E2A] transition-colors cursor-pointer shadow-xs"
                      >
                        {t.startupModal.open}
                      </button>
                      <button
                        onClick={() => deleteProjectLocally(project.id)}
                        className="p-1.5 rounded-xl text-[#8D7666] hover:text-[#B85F45] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                        title={t.startupModal.delete}
                      >
                        <TbTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F2EBE1] border-t border-[#D9C9B4] flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-[#634E40] cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={!dontShowStartupModal}
              onChange={(e) => setDontShowStartupModal(!e.target.checked)}
              className="accent-[#B85F45] w-4 h-4 rounded cursor-pointer"
            />
            <span>{t.startupModal.showOnStartup}</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-[#8D7666]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#EADECF] font-mono font-semibold">Esc</kbd> to close
            </span>
            <button
              onClick={() => setStartupModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-[#E85D04] hover:bg-[#FF7722] text-white text-xs font-bold transition-all shadow-md shadow-[#E85D04]/30 cursor-pointer flex items-center gap-1.5"
            >
              <TbSparkles className="w-4 h-4" />
              <span>{t.startupModal.startCrafting}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Castle,
  Mountain,
  Save,
  X,
  Dices,
  Waves,
  Sparkles,
  Check,
  ArrowRight,
  FolderOpen,
  Trash2,
  Clock,
  Download,
  Sprout,
} from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { killaVault } from '@/lib/persistence/killaVault';

function formatTimeAgo(timestamp: number, locale: Locale): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) {
    if (locale === 'mr') return 'आत्ताच';
    if (locale === 'hi') return 'अभी';
    return 'Just now';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    if (locale === 'mr') return `${diffMin} मिनिटांपूर्वी`;
    if (locale === 'hi') return `${diffMin} मिनट पहले`;
    return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    if (locale === 'mr') return `${diffHours} तासांपूर्वी`;
    if (locale === 'hi') return `${diffHours} घंटे पहले`;
    return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (locale === 'mr') return `${diffDays} दिवसांपूर्वी`;
  if (locale === 'hi') return `${diffDays} दिन पहले`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

interface FortBlueprint {
  id: string;
  name: { en: string; mr: string; hi: string };
  region: { en: string; mr: string; hi: string };
  desc: { en: string; mr: string; hi: string };
  waterLevel: number;
  icon: React.ElementType;
}

const HISTORICAL_FORTS: FortBlueprint[] = [
  {
    id: 'raigad',
    name: { en: 'Raigad Fort', mr: 'किल्ले रायगड', hi: 'रायगड किला' },
    region: { en: 'Mahad, Sahyadri', mr: 'महाड, सह्याद्री', hi: 'महाड, सह्याद्रि' },
    desc: {
      en: 'Capital fortress of Chhatrapati Shivaji Maharaj. Features the vast Balekilla royal tableland, sheer Takmak Tok rock drop, and Ganga Sagar water tank.',
      mr: 'स्वराज्याची राजधानी. विशाल बालेकिल्ला सडा, अभेद्य टकमक टोक कडा आणि गंगासागर तळे.',
      hi: 'स्वराज्य की राजधानी। विशाल बालेकिल्ला पठार, टकमक टोक चट्टान और गंगासागर तालाब।',
    },
    waterLevel: 0.08,
    icon: Mountain,
  },
  {
    id: 'janjira',
    name: { en: 'Murud-Janjira Sea Fort', mr: 'मुरुड-जंजिरा जलदुर्ग', hi: 'मुरुड-जंजीरा जलदुर्ग' },
    region: { en: 'Murud Coast, Arabian Sea', mr: 'मुरुड किनारा, अरबी समुद्र', hi: 'मुरुड तट, अरब सागर' },
    desc: {
      en: 'Unconquered island sea fortress surrounded on all sides by the Arabian Sea with 19 rounded bastions and a central sweet-water tank.',
      mr: 'अरबी समुद्राने चारी बाजूंनी वेढलेला अजिंक्य जलदुर्ग. १९ बुलंद वर्तुळाकार बुरूज व गोड्या पाण्याचे तळे.',
      hi: 'अरब सागर से चारों ओर घिरा अजेय जलदुर्ग। १९ गोल बुर्ज और मीठे पानी का तालाब।',
    },
    waterLevel: 0.22,
    icon: Waves,
  },
  {
    id: 'sinhagad',
    name: { en: 'Sinhagad Fort', mr: 'किल्ले सिंहगड', hi: 'सिंहगड किला' },
    region: { en: 'Haveli, Pune', mr: 'हवेली, पुणे', hi: 'पुणे, सह्याद्रि' },
    desc: {
      en: 'Perched on an isolated cliff ridge celebrated for the heroic sacrifice of Subedar Tanaji Malusare. Broad flat summit tableland with Kalyan Darwaja gorge.',
      mr: 'नरवीर तानाजी मालुसरेंच्या बलिदानाने पावन झालेला गड. विस्तीर्ण पठार, कल्याण दरवाजा आणि अभेद्य बुरूज.',
      hi: 'तानाजी मालुसरे के बलिदान से पावन पर्वतीय दुर्ग। विस्तृत पठार और कल्याण दरवाजा।',
    },
    waterLevel: 0.06,
    icon: Castle,
  },
  {
    id: 'pratapgad',
    name: { en: 'Pratapgad Fort', mr: 'किल्ले प्रतापगड', hi: 'प्रतापगड किला' },
    region: { en: 'Jawali, Mahabaleshwar', mr: 'जावळीचे खोरे, महाबळेश्वर', hi: 'महाबलेश्वर, जावली' },
    desc: {
      en: 'Historic double-tiered mountain fort erected by Moropant Pingle amidst dense Jawali forests. High upper Balekilla and lower Bhavani temple spur.',
      mr: 'जावळीच्या घनदाट जंगलात मोरोपंत पिंगळेंनी उभारलेला दुहेरी तटबंदीचा गड. वरचा बालेकिल्ला व भवानी मातेचा माथा.',
      hi: 'जावली के घने जंगलों में स्थित दोहरी किलेबंदी वाला दुर्ग। ऊपरी बालेकिल्ला और भवानी मंदिर।',
    },
    waterLevel: 0.05,
    icon: Sprout,
  },
  {
    id: 'vijaydurg',
    name: { en: 'Vijaydurg Naval Fort', mr: 'विजयदुर्ग जलदुर्ग', hi: 'विजयदुर्ग नौसेना किला' },
    region: { en: 'Sindhudurg, Konkan Coast', mr: 'सिंधुदुर्ग, कोकण किनारा', hi: 'कोंकण तट' },
    desc: {
      en: 'The "Eastern Gibraltar" Maratha naval fortress projecting into the sea with triple protective ramparts and marine moat.',
      mr: 'मराठा आरमाराचे मुख्य केंद्र. समुद्रात घुसलेली तिहेरी तटबंदी आणि खंदक असणारा अजिंक्य किल्ला.',
      hi: 'मराठा नौसेना का मुख्य केंद्र। समुद्र में फैली तिहरी प्राचीर और खंदक।',
    },
    waterLevel: 0.20,
    icon: Waves,
  },
];

export const ProjectHubModal: React.FC = () => {
  const {
    isStartupModalOpen,
    setStartupModalOpen,
    projectHubTab,
    setProjectHubTab,
    templateId,
    waterLevel,
    setWaterLevel,
    waterLevelActive,
    setWaterLevelActive,
    freeformSettings,
    setFreeformSetting,
    randomizeFreeformSeed,
    requestTerrainChange,
    savedProjects,
    loadSavedProjects,
    loadProjectLocally,
    deleteProjectLocally,
    importProjectData,
    exportKillaBinary,
    dontShowStartupModal,
    setDontShowStartupModal,
    setToastMessage,
  } = useEditorStore();

  const { t, locale, setLocale } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeFreeform = freeformSettings || {
    elevation: 1.45,
    tablelandWidth: 3.4,
    cliffSteepness: 5.5,
    roughness: 0.5,
    tiers: 2,
    seed: 42,
  };

  // Load saved projects whenever modal opens
  useEffect(() => {
    if (isStartupModalOpen) {
      loadSavedProjects();
    }
  }, [isStartupModalOpen, loadSavedProjects]);

  // Handle escape key
  useEffect(() => {
    if (!isStartupModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartupModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStartupModalOpen, setStartupModalOpen]);

  if (!isStartupModalOpen) return null;

  const handleSelectFort = (fort: FortBlueprint) => {
    const title = fort.name[locale] || fort.name.en;
    requestTerrainChange(fort.id, title, fort.waterLevel);
  };

  const handleApplyProcedural = () => {
    requestTerrainChange('scratch', 'Custom Fort', waterLevel, safeFreeform);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result;
      if (!buffer) return;

      const bytes = new Uint8Array(buffer as ArrayBuffer);
      const success = await importProjectData(bytes);
      if (success) {
        setToastMessage(t.startupModal.importSuccess);
        setStartupModalOpen(false);
      } else {
        setToastMessage(t.startupModal.invalidFormat);
      }
      setTimeout(() => setToastMessage(null), 3500);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportSavedProject = async (id: string, name: string) => {
    const project = await killaVault.loadProject(id);
    if (!project || !project.packageBlob) return;
    const blob = new Blob([project.packageBlob.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}.killa`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(`Exported ${name}.killa!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200 select-none overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".killa,.json"
        onChange={handleFileImport}
        className="hidden"
      />

      <div className="relative w-full max-w-4xl bg-[#EBE6DC] rounded-2xl sm:rounded-3xl border-2 border-[#D8D1C5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Banner Header */}
        <div className="relative bg-[#2B2621] px-3.5 sm:px-6 py-2.5 sm:py-4 text-white flex items-center justify-between border-b border-[#D8D1C5]/40 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-md p-1 shrink-0">
              <Image
                src="/killaplayground-tranparent.png"
                alt="Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-yatra text-lg sm:text-2xl tracking-wide text-white drop-shadow-sm truncate">
                  {t.startupModal.title}
                </h2>
                <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-[#B85F45] text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-white shadow-xs shrink-0">
                  v1.2
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#F2EBE1]/90 font-sans truncate">
                {t.startupModal.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
            {/* Quick Language Switcher */}
            <LanguageSelector size="sm" />

            <button
              onClick={() => setStartupModalOpen(false)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              title={t.startupModal.close}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="px-3 sm:px-6 py-2 bg-[#EBE6DC]/70 border-b border-[#D8D1C5] flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <button
              onClick={() => setProjectHubTab('blueprints')}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
                projectHubTab === 'blueprints'
                  ? 'bg-[#2B2621] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#D8D1C5]'
              }`}
            >
              <Castle className="w-3.5 h-3.5 shrink-0" />
              <span>{t.startupModal.tabBlueprints || 'Blueprints'}</span>
            </button>

            <button
              onClick={() => setProjectHubTab('procedural')}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
                projectHubTab === 'procedural'
                  ? 'bg-[#2B2621] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#D8D1C5]'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 shrink-0" />
              <span>{t.startupModal.tabProcedural || 'Procedural'}</span>
            </button>

            <button
              onClick={() => setProjectHubTab('vault')}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
                projectHubTab === 'vault'
                  ? 'bg-[#2B2621] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#D8D1C5]'
              }`}
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              <span>{t.startupModal.tabVault || 'Saved'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] font-sans">
                {savedProjects.length}
              </span>
            </button>
          </div>

          {/* Quick Import Button in tab strip */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] text-xs font-bold text-[#2B2621] transition-all cursor-pointer shrink-0"
          >
            <FolderOpen className="w-4 h-4 text-[#0284C7]" />
            <span>{t.startupModal.importFile}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 w-full">
          {/* TAB 1: HISTORICAL FORT BLUEPRINTS */}
          {projectHubTab === 'blueprints' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F4938] font-sans">
                  Sahyadri Fortress Blueprints ({HISTORICAL_FORTS.length})
                </span>
                <span className="text-xs text-[#7C7267]">
                  Clicking a blueprint applies authentic elevations and terrain shape
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {HISTORICAL_FORTS.map((fort) => {
                  const Icon = fort.icon;
                  const isSelected = templateId === fort.id;
                  const name = fort.name[locale] || fort.name.en;
                  const region = fort.region[locale] || fort.region.en;
                  const desc = fort.desc[locale] || fort.desc.en;

                  return (
                    <div
                      key={fort.id}
                      onClick={() => handleSelectFort(fort)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#EBE6DC] border-[#4B382C] shadow-md ring-2 ring-[#4B382C]/25'
                          : 'bg-[#FAF8F5]/80 border-[#D8D1C5] hover:bg-[#D8D1C5] hover:border-[#BFA892]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#2B2621] text-white shadow-xs'
                                : 'bg-[#EBE6DC] text-[#5A5248] group-hover:bg-[#2B2621] group-hover:text-white'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-sans font-bold text-base sm:text-lg text-[#2B1E16] tracking-wide leading-tight">
                              {name}
                            </h3>
                            <span className="text-[11px] text-[#7C7267] font-sans mt-0.5 block">
                              {region}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#2B2621] bg-[#DFCDBD] px-2.5 py-1 rounded-full shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                            {t.common.active}
                          </span>
                        ) : (
                          <span className="text-xs text-[#7C7267] group-hover:text-[#2B2621] flex items-center gap-1 font-bold">
                            {t.common.select} <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#5A5248] leading-relaxed">
                        {desc}
                      </p>

                      <div className="pt-2 border-t border-[#D8D1C5]/50 flex items-center justify-between text-[11px] text-[#7C7267]">
                        <span>{t.terrainStudio.waterLevel}: <strong>{(fort.waterLevel * 100).toFixed(0)}{t.terrainStudio.cm}</strong></span>
                        <span className="font-bold text-[#2B2621] text-[10px] uppercase">{t.terrainStudio.readyToCraft}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PROCEDURAL TERRAIN GENERATOR */}
          {projectHubTab === 'procedural' && (
            <div className="max-w-2xl mx-auto space-y-6 font-sans">
              {/* Seed Randomizer Header Banner */}
              <div className="p-4 rounded-2xl bg-[#EBE6DC]/80 border border-[#D8D1C5] flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[#2B1E16] block font-sans">
                    {t.terrainStudio.randomSeedTitle}
                  </span>
                  <span className="text-xs text-[#5A5248] block mt-0.5 font-mono">
                    {t.terrainStudio.activeSeed}: #{safeFreeform.seed}
                  </span>
                </div>
                <button
                  onClick={randomizeFreeformSeed}
                  className="px-4 py-2 rounded-xl bg-[#2B2621] text-white hover:bg-[#38281E] font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Dices className="w-4 h-4" />
                  <span>{t.terrainStudio.rollSeedBtn}</span>
                </button>
              </div>

              {/* Sliders: Mounted Directly on Panel Surface (No Nested Cards per ui-ux-design-consistency.md) */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F4938] block font-sans">
                  {t.terrainStudio.topographyTitle}
                </span>

                {/* Tableland Width */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B2621]">
                    <span>{t.terrainStudio.summitWidth}</span>
                    <span className="text-[#7C7267]">{(safeFreeform.tablelandWidth * 2).toFixed(1)} {t.terrainStudio.meters}</span>
                  </div>
                  <input
                    type="range"
                    min={2.0}
                    max={4.2}
                    step={0.1}
                    value={safeFreeform.tablelandWidth}
                    onChange={(e) => setFreeformSetting('tablelandWidth', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                  />
                  <span className="text-[10px] text-[#7C7267]">
                    {t.terrainStudio.summitWidthDesc}
                  </span>
                </div>

                {/* Elevation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B2621]">
                    <span>{t.terrainStudio.peakElevation}</span>
                    <span className="text-[#7C7267]">{safeFreeform.elevation.toFixed(2)} {t.terrainStudio.meters}</span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={2.4}
                    step={0.05}
                    value={safeFreeform.elevation}
                    onChange={(e) => setFreeformSetting('elevation', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                  />
                </div>

                {/* Stepped Mountain Tiers */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B2621]">
                    <span>{t.terrainStudio.tiersTitle}</span>
                    <span className="text-[#7C7267]">
                      {safeFreeform.tiers === 1
                        ? t.terrainStudio.tier1
                        : safeFreeform.tiers === 2
                        ? t.terrainStudio.tier2
                        : t.terrainStudio.tier3}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={1}
                    value={safeFreeform.tiers ?? 2}
                    onChange={(e) => setFreeformSetting('tiers', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                  />
                  <span className="text-[10px] text-[#7C7267]">
                    {t.terrainStudio.tiersDesc}
                  </span>
                </div>

                {/* Cliff Face Steepness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B2621]">
                    <span>{t.terrainStudio.cliffSteepness}</span>
                    <span className="text-[#7C7267]">{safeFreeform.cliffSteepness >= 6 ? t.terrainStudio.cliffSheer : t.terrainStudio.cliffGentle}</span>
                  </div>
                  <input
                    type="range"
                    min={3.0}
                    max={8.0}
                    step={0.2}
                    value={safeFreeform.cliffSteepness}
                    onChange={(e) => setFreeformSetting('cliffSteepness', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                  />
                </div>

                {/* Crags Roughness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B2621]">
                    <span>{t.terrainStudio.cragsRoughness}</span>
                    <span className="text-[#7C7267]">{(safeFreeform.roughness * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={safeFreeform.roughness}
                    onChange={(e) => setFreeformSetting('roughness', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                  />
                </div>

                {/* Water Level Section */}
                <div className="pt-2 border-t border-[#D8D1C5]/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-700/15 text-cyan-800 flex items-center justify-center">
                        <Waves className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#2B1E16] block">{t.terrainStudio.waterPlaneTitle}</span>
                        <span className="text-[10px] text-[#7C7267] block">
                          {waterLevelActive ? t.terrainStudio.waterPlaneActive : t.terrainStudio.waterPlaneInactive}
                        </span>
                      </div>
                    </div>
                    {/* Real Toggle Switch with visible thumb */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={waterLevelActive}
                      onClick={() => setWaterLevelActive(!waterLevelActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        waterLevelActive ? 'bg-cyan-700' : 'bg-[#D9C9B4]'
                      }`}
                      title={waterLevelActive ? t.terrainStudio.waterPlaneActive : t.terrainStudio.waterPlaneInactive}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          waterLevelActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {waterLevelActive && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2B2621]">
                        <span>{t.terrainStudio.waterElevation}</span>
                        <span className="text-[#7C7267]">{(waterLevel * 100).toFixed(0)} {t.terrainStudio.cm}</span>
                      </div>
                      <input
                        type="range"
                        min={0.02}
                        max={0.35}
                        step={0.01}
                        value={waterLevel}
                        onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-cyan-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-3">
                <button
                  onClick={handleApplyProcedural}
                  className="w-full py-3 rounded-2xl bg-[#B85F45] hover:bg-[#A3523B] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.modeModal.startBuilding}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED DIORAMAS (LOCAL VAULT) */}
          {projectHubTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F4938] font-sans">
                  Locally Stored Forts ({savedProjects.length})
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#EBE6DC] hover:bg-[#D8D1C5] text-xs font-bold text-[#2B2621] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-[#0284C7]" />
                  <span>Import .killa File</span>
                </button>
              </div>

              {savedProjects.length === 0 ? (
                <div className="min-h-[260px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-[#D8D1C5] rounded-3xl bg-[#FAF8F5]/40">
                  <div className="w-14 h-14 rounded-2xl bg-[#EBE6DC] text-[#7C7267] flex items-center justify-center mb-3">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-base text-[#2B2621]">
                    {t.startupModal.noRecents}
                  </h4>
                  <p className="text-xs text-[#7C7267] mt-1 max-w-sm leading-relaxed">
                    {t.startupModal.noRecentsDesc} Press Ctrl+S or click &quot;Save Canvas&quot; anytime to save your fort.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D8D1C5] hover:border-[#BFA892] transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-[#2B1E16] font-sans truncate">
                              {project.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold text-[#7C7267] bg-[#EBE6DC] px-1.5 py-0.5 rounded">
                              {project.templateId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#7C7267] mt-1">
                            <Clock className="w-3.5 h-3.5 text-[#B58B63]" />
                            <span>{formatTimeAgo(project.updatedAt, locale)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteProjectLocally(project.id)}
                            className="p-1.5 rounded-xl text-[#7C7267] hover:text-[#B85F45] hover:bg-[#D8D1C5] transition-colors cursor-pointer"
                            title={t.common.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stats Breakdown */}
                      {project.stats && (
                        <div className="flex items-center gap-2 text-[10px] text-[#7C7267] bg-[#EBE6DC]/60 px-2.5 py-1 rounded-xl">
                          <span>{project.stats.wallsCount} {t.terrainConfirmModal.walls}</span>
                          <span>•</span>
                          <span>{project.stats.propsCount} {t.terrainConfirmModal.figurines}</span>
                          <span>•</span>
                          <span>{project.stats.lightsCount} {t.terrainConfirmModal.diyasLights}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]/50">
                        <button
                          onClick={() => loadProjectLocally(project.id)}
                          className="flex-1 py-1.5 rounded-xl bg-[#2B2621] text-[#FAF8F5] text-xs font-bold hover:bg-[#322E2A] transition-colors cursor-pointer text-center shadow-xs"
                        >
                          {t.startupModal.open}
                        </button>
                        <button
                          onClick={() => handleExportSavedProject(project.id, project.name)}
                          className="px-3 py-1.5 rounded-xl bg-[#EBE6DC] hover:bg-[#D8D1C5] text-xs font-semibold text-[#2B2621] transition-colors cursor-pointer flex items-center gap-1"
                          title="Export .killa file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.killa</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#D8D1C5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-[#5A5248] cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={!dontShowStartupModal}
              onChange={(e) => setDontShowStartupModal(!e.target.checked)}
              className="accent-[#B85F45] w-4 h-4 rounded cursor-pointer"
            />
            <span>{t.startupModal.showOnStartup}</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-[#7C7267]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#EBE6DC] font-mono font-semibold">Esc</kbd> to close
            </span>
            <button
              onClick={() => setStartupModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-[#B85F45] hover:bg-[#A3523B] text-white text-xs font-bold transition-all shadow-md shadow-[#E85D04]/30 cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.startupModal.startCrafting}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

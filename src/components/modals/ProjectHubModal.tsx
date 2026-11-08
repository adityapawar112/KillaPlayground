'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  TbBuildingCastle,
  TbMountain,
  TbDeviceFloppy,
  TbX,
  TbDice5,
  TbRipple,
  TbSparkles,
  TbCheck,
  TbArrowRight,
  TbFolderOpen,
  TbTrash,
  TbClock,
  TbDownload,
  TbPlant2,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';
import { killaVault } from '@/lib/persistence/killaVault';

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
    icon: TbMountain,
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
    icon: TbRipple,
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
    icon: TbBuildingCastle,
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
    icon: TbPlant2,
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
    icon: TbRipple,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept=".killa,.json"
        onChange={handleFileImport}
        className="hidden"
      />

      <div className="relative w-full max-w-4xl bg-[#F9F6F0] rounded-3xl border-2 border-[#D9C9B4] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Banner Header */}
        <div className="relative bg-[#4B382C] px-6 py-4 text-white flex items-center justify-between border-b border-[#D9C9B4]/40 shadow-sm shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-md p-1 shrink-0">
              <Image
                src="/killaplayground-tranparent.png"
                alt="Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-yatra text-2xl sm:text-3xl tracking-wide text-white drop-shadow-sm">
                  {t.startupModal.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E85D04] text-[10px] font-sans font-bold uppercase tracking-wider text-white shadow-xs">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-[#F2EBE1]/90 font-sans">
                {t.startupModal.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Language Switcher */}
            <div className="hidden sm:flex items-center bg-black/25 rounded-xl p-0.5 border border-white/15">
              {(['en', 'mr', 'hi'] as Locale[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    locale === lang
                      ? 'bg-white/25 text-white shadow-xs'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'mr' ? 'मराठी' : 'हिन्दी'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStartupModalOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              title={t.startupModal.close}
            >
              <TbX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="px-6 py-2.5 bg-[#EADECF]/70 border-b border-[#D9C9B4] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <button
              onClick={() => setProjectHubTab('blueprints')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                projectHubTab === 'blueprints'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'bg-[#F2EBE1] text-[#634E40] hover:bg-[#DFCDBD]'
              }`}
            >
              <TbBuildingCastle className="w-4 h-4" />
              <span>{t.startupModal.tabBlueprints || 'Fort Blueprints'}</span>
            </button>

            <button
              onClick={() => setProjectHubTab('procedural')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                projectHubTab === 'procedural'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'bg-[#F2EBE1] text-[#634E40] hover:bg-[#DFCDBD]'
              }`}
            >
              <TbMountain className="w-4 h-4" />
              <span>{t.startupModal.tabProcedural || 'Procedural Terrain'}</span>
            </button>

            <button
              onClick={() => setProjectHubTab('vault')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                projectHubTab === 'vault'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'bg-[#F2EBE1] text-[#634E40] hover:bg-[#DFCDBD]'
              }`}
            >
              <TbDeviceFloppy className="w-4 h-4" />
              <span>{t.startupModal.tabVault || 'Saved Dioramas'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-sans">
                {savedProjects.length}
              </span>
            </button>
          </div>

          {/* Quick Import Button in tab strip */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2EBE1] hover:bg-[#DFCDBD] border border-[#D9C9B4] text-xs font-bold text-[#4B382C] transition-all cursor-pointer"
          >
            <TbFolderOpen className="w-4 h-4 text-[#0284C7]" />
            <span>{t.startupModal.importFile}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: HISTORICAL FORT BLUEPRINTS */}
          {projectHubTab === 'blueprints' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F4938] font-sans">
                  Sahyadri Fortress Blueprints ({HISTORICAL_FORTS.length})
                </span>
                <span className="text-xs text-[#8D7666]">
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
                          ? 'bg-[#EADECF] border-[#4B382C] shadow-md ring-2 ring-[#4B382C]/25'
                          : 'bg-[#F2EBE1]/80 border-[#D9C9B4] hover:bg-[#DFCDBD] hover:border-[#BFA892]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#4B382C] text-white shadow-xs'
                                : 'bg-[#EADECF] text-[#634E40] group-hover:bg-[#4B382C] group-hover:text-white'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-yatra text-base sm:text-lg text-[#2B1E16] tracking-wide leading-tight">
                              {name}
                            </h3>
                            <span className="text-[11px] text-[#8D7666] font-sans mt-0.5 block">
                              {region}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#4B382C] bg-[#DFCDBD] px-2.5 py-1 rounded-full shadow-xs">
                            <TbCheck className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-xs text-[#8D7666] group-hover:text-[#4B382C] flex items-center gap-1 font-bold">
                            Embark <TbArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#634E40] leading-relaxed">
                        {desc}
                      </p>

                      <div className="pt-2 border-t border-[#D9C9B4]/50 flex items-center justify-between text-[11px] text-[#8D7666]">
                        <span>Water Level: <strong>{(fort.waterLevel * 100).toFixed(0)}cm</strong></span>
                        <span className="font-bold text-[#4B382C] text-[10px] uppercase">Ready to Craft</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PROCEDURAL TERRAIN GENERATOR */}
          {projectHubTab === 'procedural' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Seed Randomizer Header Banner */}
              <div className="p-4 rounded-2xl bg-[#EADECF]/80 border border-[#D9C9B4] flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[#2B1E16] block font-yatra">
                    Randomize Mountain Seed
                  </span>
                  <span className="text-xs text-[#634E40] block mt-0.5 font-mono">
                    Active Seed: #{safeFreeform.seed}
                  </span>
                </div>
                <button
                  onClick={randomizeFreeformSeed}
                  className="px-4 py-2 rounded-xl bg-[#4B382C] text-white hover:bg-[#38281E] font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <TbDice5 className="w-4 h-4" />
                  <span>Roll New Seed</span>
                </button>
              </div>

              {/* Sliders: Mounted Directly on Panel Surface (No Nested Cards per ui-ux-design-consistency.md) */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F4938] block font-sans">
                  Topography & Plateau Dimensions
                </span>

                {/* Tableland Width */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                    <span>Tableland Width</span>
                    <span className="text-[#8D7666]">{(safeFreeform.tablelandWidth * 2).toFixed(1)} meters</span>
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
                  <span className="text-[10px] text-[#8D7666]">
                    Broad flat summit plateau where ramparts and figurines are erected.
                  </span>
                </div>

                {/* Elevation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                    <span>Peak Elevation</span>
                    <span className="text-[#8D7666]">{safeFreeform.elevation.toFixed(2)} meters</span>
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
                  <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                    <span>Stepped Mountain Tiers</span>
                    <span className="text-[#8D7666]">
                      {safeFreeform.tiers === 1
                        ? '1 Tier (Single Peak)'
                        : safeFreeform.tiers === 2
                        ? '2 Tiers (Balekilla + Machi)'
                        : '3 Tiers (Multi-Terraced)'}
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
                  <span className="text-[10px] text-[#8D7666]">
                    Stepped defensive terraces (Machi) for authentic Sahyadri hill fortress architecture.
                  </span>
                </div>

                {/* Cliff Face Steepness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                    <span>Cliff Face Steepness</span>
                    <span className="text-[#8D7666]">{safeFreeform.cliffSteepness >= 6 ? 'Sheer Cliff' : 'Gentle Slopes'}</span>
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
                  <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                    <span>Crags & Roughness</span>
                    <span className="text-[#8D7666]">{(safeFreeform.roughness * 100).toFixed(0)}%</span>
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
                <div className="pt-2 border-t border-[#D9C9B4]/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-700/15 text-cyan-800 flex items-center justify-center">
                        <TbRipple className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#2B1E16] block">Base Water Plane (Moat / Sea)</span>
                        <span className="text-[10px] text-[#8D7666] block">
                          {waterLevelActive ? 'Water plane active at specified level' : 'Water plane turned off (Dry terrain)'}
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
                      title={waterLevelActive ? 'Turn off water plane' : 'Turn on water plane'}
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
                      <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                        <span>Water Elevation</span>
                        <span className="text-[#8D7666]">{(waterLevel * 100).toFixed(0)} cm</span>
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
                  className="w-full py-3 rounded-2xl bg-[#E85D04] hover:bg-[#FF7722] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <TbSparkles className="w-4 h-4" />
                  <span>Generate & Craft Procedural Fort</span>
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
                  className="px-3 py-1.5 rounded-xl bg-[#EADECF] hover:bg-[#DFCDBD] text-xs font-bold text-[#4B382C] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TbFolderOpen className="w-4 h-4 text-[#0284C7]" />
                  <span>Import .killa File</span>
                </button>
              </div>

              {savedProjects.length === 0 ? (
                <div className="min-h-[260px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-[#D9C9B4] rounded-3xl bg-[#F2EBE1]/40">
                  <div className="w-14 h-14 rounded-2xl bg-[#EADECF] text-[#8D7666] flex items-center justify-center mb-3">
                    <TbClock className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-base text-[#4B382C]">
                    {t.startupModal.noRecents}
                  </h4>
                  <p className="text-xs text-[#8D7666] mt-1 max-w-sm leading-relaxed">
                    {t.startupModal.noRecentsDesc} Press Ctrl+S or click &quot;Save Canvas&quot; anytime to save your fort.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-2xl bg-[#F2EBE1] border border-[#D9C9B4] hover:border-[#BFA892] transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-[#2B1E16] font-yatra truncate">
                              {project.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold text-[#8D7666] bg-[#EADECF] px-1.5 py-0.5 rounded">
                              {project.templateId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#8D7666] mt-1">
                            <TbClock className="w-3.5 h-3.5 text-[#B58B63]" />
                            <span>{formatTimeAgo(project.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteProjectLocally(project.id)}
                            className="p-1.5 rounded-xl text-[#8D7666] hover:text-[#B85F45] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <TbTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stats Breakdown */}
                      {project.stats && (
                        <div className="flex items-center gap-2 text-[10px] text-[#8D7666] bg-[#EADECF]/60 px-2.5 py-1 rounded-xl">
                          <span>{project.stats.wallsCount} walls</span>
                          <span>•</span>
                          <span>{project.stats.propsCount} figurines</span>
                          <span>•</span>
                          <span>{project.stats.lightsCount} diyas</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D9C9B4]/50">
                        <button
                          onClick={() => loadProjectLocally(project.id)}
                          className="flex-1 py-1.5 rounded-xl bg-[#4B382C] text-[#FAF8F5] text-xs font-bold hover:bg-[#322E2A] transition-colors cursor-pointer text-center shadow-xs"
                        >
                          {t.startupModal.open}
                        </button>
                        <button
                          onClick={() => handleExportSavedProject(project.id, project.name)}
                          className="px-3 py-1.5 rounded-xl bg-[#EADECF] hover:bg-[#DFCDBD] text-xs font-semibold text-[#4B382C] transition-colors cursor-pointer flex items-center gap-1"
                          title="Export .killa file"
                        >
                          <TbDownload className="w-3.5 h-3.5" />
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
        <div className="px-6 py-3.5 bg-[#F2EBE1] border-t border-[#D9C9B4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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
              className="px-5 py-2 rounded-xl bg-[#E85D04] hover:bg-[#FF7722] text-white text-xs font-bold transition-all shadow-md shadow-[#E85D04]/30 cursor-pointer flex items-center gap-1.5 active:scale-95"
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

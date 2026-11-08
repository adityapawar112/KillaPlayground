'use client';

import React, { useEffect } from 'react';
import {
  TbBuildingCastle,
  TbAdjustmentsHorizontal,
  TbX,
  TbDice5,
  TbMountain,
  TbRipple,
  TbSparkles,
  TbCheck,
  TbArrowRight,
  TbPlant2,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface FortBlueprint {
  id: string;
  name: { en: string; mr: string; hi: string };
  region: { en: string; mr: string; hi: string };
  desc: { en: string; mr: string; hi: string };
  type: 'hill' | 'sea' | 'naval';
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
    type: 'hill',
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
    type: 'sea',
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
    type: 'hill',
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
    type: 'hill',
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
    type: 'naval',
    waterLevel: 0.20,
    icon: TbRipple,
  },
];

export const TerrainStudioDrawer: React.FC = () => {
  const {
    isTerrainDrawerOpen,
    setTerrainDrawerOpen,
    terrainDrawerTab,
    setTerrainDrawerTab,
    templateId,
    waterLevel,
    setWaterLevel,
    waterLevelActive,
    setWaterLevelActive,
    freeformSettings,
    setFreeformSetting,
    randomizeFreeformSeed,
    requestTerrainChange,
    nightMode,
    walls,
    foundations,
    stairs,
    splines,
    placedProps,
    placedLights,
    foliageInstances,
    pondWaterFeatures,
  } = useEditorStore();

  const { t, locale } = useTranslation();

  const safeFreeform = freeformSettings || {
    elevation: 1.45,
    tablelandWidth: 3.4,
    cliffSteepness: 5.5,
    roughness: 0.5,
    tiers: 2,
    seed: 42,
  };

  const objectCount =
    walls.length +
    (foundations?.length || 0) +
    (stairs?.length || 0) +
    splines.length +
    placedProps.length +
    (placedLights?.length || 0) +
    (foliageInstances?.length || 0) +
    pondWaterFeatures.length;

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isTerrainDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTerrainDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerrainDrawerOpen, setTerrainDrawerOpen]);

  if (!isTerrainDrawerOpen) return null;

  const handleSelectFort = (fort: FortBlueprint) => {
    const title = fort.name[locale] || fort.name.en;
    requestTerrainChange(fort.id, title, fort.waterLevel);
  };

  const handleFreeformChange = (
    key: 'elevation' | 'tablelandWidth' | 'cliffSteepness' | 'roughness' | 'tiers',
    val: number
  ) => {
    if (templateId !== 'scratch') {
      if (objectCount > 0) {
        requestTerrainChange('scratch', 'Custom Fort', waterLevel, {
          ...safeFreeform,
          [key]: val,
        });
        return;
      }
    }
    setFreeformSetting(key, val);
  };

  const handleRollDice = () => {
    randomizeFreeformSeed();
  };

  return (
    /* Floating Dropdown Panel (Anchored directly under Top Menu Bar, 3D Canvas visible behind) */
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className={`fixed left-4 top-[3.25rem] z-40 w-[420px] sm:w-[460px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-4.5rem)] bg-[#F9F6F0] rounded-2xl sm:rounded-3xl border-2 border-[#D9C9B4] shadow-2xl shadow-black/25 flex flex-col transition-all duration-200 select-none animate-in fade-in slide-in-from-top-3 ${
        nightMode ? 'text-[#F9F6F0] bg-[#1E1B18] border-[#4A3E35]' : 'text-[#2B1E16]'
      }`}
      role="dialog"
      aria-label="Historical Forts & Terrain Studio"
    >
      {/* Dropdown Header */}
      <div className="p-4 sm:p-5 bg-[#4B382C] text-white flex items-center justify-between border-b border-[#D9C9B4]/40 rounded-t-2xl sm:rounded-t-3xl shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            {terrainDrawerTab === 'historical' ? (
              <TbBuildingCastle className="w-6 h-6 text-[#FAF8F5]" />
            ) : (
              <TbAdjustmentsHorizontal className="w-6 h-6 text-[#FAF8F5]" />
            )}
          </div>
          <div>
            <h2 className="font-yatra text-xl sm:text-2xl tracking-wide text-white leading-tight">
              {terrainDrawerTab === 'historical' ? t.modeModal.historicalTab : t.modeModal.freeformTab}
            </h2>
            <p className="text-xs text-[#F2EBE1]/85 font-sans">
              {terrainDrawerTab === 'historical'
                ? (locale === 'mr' ? 'किल्ला बनवण्यासाठी ऐतिहासिक ब्लूप्रिंट निवडा' : locale === 'hi' ? 'किला बनाने के लिए ऐतिहासिक ब्लूप्रिंट चुनें' : 'Select an iconic fort blueprint to sculpt upon')
                : (locale === 'mr' ? 'पठार आणि पाण्यासह स्वतःचा प्रदेश बनवा' : locale === 'hi' ? 'पठार और पानी के साथ अपनी जमीन बनाएं' : 'Procedural generator with custom tableland & water')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setTerrainDrawerOpen(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          title="Close Panel"
        >
          <TbX className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Switcher Pills: Historic vs Scratch */}
      <div className="p-3 bg-[#EADECF]/60 border-b border-[#D9C9B4] flex items-center gap-2 shrink-0">
        <button
          onClick={() => setTerrainDrawerTab('historical')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            terrainDrawerTab === 'historical'
              ? 'bg-[#4B382C] text-white shadow-sm'
              : 'bg-[#F2EBE1] text-[#634E40] hover:bg-[#DFCDBD]'
          }`}
        >
          <TbBuildingCastle className="w-4 h-4" />
          <span>{t.modeModal.historicalTab}</span>
        </button>

        <button
          onClick={() => setTerrainDrawerTab('freeform')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            terrainDrawerTab === 'freeform'
              ? 'bg-[#4B382C] text-white shadow-sm'
              : 'bg-[#F2EBE1] text-[#634E40] hover:bg-[#DFCDBD]'
          }`}
        >
          <TbAdjustmentsHorizontal className="w-4 h-4" />
          <span>{t.modeModal.freeformTab}</span>
        </button>
      </div>

      {/* Main Dropdown Scroll Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {terrainDrawerTab === 'historical' ? (
          /* VERTICAL SCROLLING HISTORICAL FORTS */
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8F4938] flex items-center justify-between mb-1">
              <span>Iconic Fort Blueprints ({HISTORICAL_FORTS.length})</span>
            </div>

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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2.5 ${
                    isSelected
                      ? 'bg-[#EADECF] border-[#4B382C] shadow-md ring-2 ring-[#4B382C]/20'
                      : 'bg-[#F2EBE1]/80 border-[#D9C9B4] hover:bg-[#DFCDBD] hover:border-[#BFA892]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#4B382C] text-white'
                            : 'bg-[#EADECF] text-[#634E40] group-hover:bg-[#4B382C] group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-yatra text-base sm:text-lg text-[#2B1E16] tracking-wide leading-none">
                            {name}
                          </h3>
                        </div>
                        <span className="text-[11px] text-[#8D7666] font-sans mt-0.5 block">
                          {region}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#4B382C] bg-[#DFCDBD] px-2.5 py-1 rounded-full">
                        <TbCheck className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-[#8D7666] group-hover:text-[#4B382C] flex items-center gap-1 font-bold">
                        Select <TbArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#634E40] leading-relaxed">
                    {desc}
                  </p>

                  <div className="pt-2 border-t border-[#D9C9B4]/50 flex items-center justify-between text-[11px] text-[#8D7666]">
                    <span>Base Water Level: <strong>{(fort.waterLevel * 100).toFixed(0)}cm</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* FREEFORM PROCEDURAL GENERATOR CONTROLS */
          <div className="space-y-5">
            {/* Randomizer Card */}
            <div className="p-4 rounded-2xl bg-[#EADECF]/80 border border-[#D9C9B4] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#2B1E16] block font-yatra">
                  Randomize Terrain Seed
                </span>
                <span className="text-xs text-[#634E40] block mt-0.5 font-mono">
                  Active Seed: #{safeFreeform.seed}
                </span>
              </div>
              <button
                onClick={handleRollDice}
                className="px-4 py-2 rounded-xl bg-[#4B382C] text-white hover:bg-[#38281E] font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <TbDice5 className="w-4 h-4" />
                <span>Roll New Terrain</span>
              </button>
            </div>

            {/* Parameter Sliders: Mounted directly on panel background without nested cards per ui-ux-design-consistency.md */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F4938] font-sans">
                Topography & Plateau Dimensions
              </h3>

              {/* Tableland Width */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                  <span>Summit Tableland Width</span>
                  <span className="text-[#8D7666]">{(safeFreeform.tablelandWidth * 2).toFixed(1)} meters</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={4.2}
                  step={0.1}
                  value={safeFreeform.tablelandWidth}
                  onChange={(e) => handleFreeformChange('tablelandWidth', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                />
                <span className="text-[10px] text-[#8D7666]">
                  Broad flat summit plateau where fort walls and figurines are built.
                </span>
              </div>

              {/* Elevation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                  <span>Mountain Peak Elevation</span>
                  <span className="text-[#8D7666]">{safeFreeform.elevation.toFixed(2)} meters</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={2.4}
                  step={0.05}
                  value={safeFreeform.elevation}
                  onChange={(e) => handleFreeformChange('elevation', parseFloat(e.target.value))}
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
                  onChange={(e) => handleFreeformChange('tiers', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                />
                <span className="text-[10px] text-[#8D7666]">
                  Stepped defensive terraces (Machi) for authentic Sahyadri hill fortress architecture.
                </span>
              </div>

              {/* Cliff Steepness */}
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
                  onChange={(e) => handleFreeformChange('cliffSteepness', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                />
              </div>

              {/* Roughness & Crags */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                  <span>Sahyadri Crags & Roughness</span>
                  <span className="text-[#8D7666]">{(safeFreeform.roughness * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={safeFreeform.roughness}
                  onChange={(e) => handleFreeformChange('roughness', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                />
              </div>
            </div>

            {/* Base Water Level Section with Real Toggle Switch */}
            <div className="pt-3 border-t border-[#D9C9B4]/60 space-y-3">
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

                {/* Real Toggle Switch */}
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
                  <span className="text-[10px] text-[#8D7666]">
                    Raises coastal sea water level or creates lake water in excavated depressions.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Sticky Footer: Start Crafting Button */}
      <div className="p-4 bg-[#F2EBE1] border-t border-[#D9C9B4] rounded-b-2xl sm:rounded-b-3xl flex items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-[#634E40]">
          Active: <strong className="text-[#2B1E16]">{templateId.toUpperCase()}</strong>
        </div>
        <button
          onClick={() => setTerrainDrawerOpen(false)}
          className="px-6 py-2 rounded-xl bg-[#E85D04] hover:bg-[#FF7722] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#E85D04]/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <TbSparkles className="w-4 h-4" />
          <span>{t.modeModal.startBuilding}</span>
        </button>
      </div>
    </div>
  );
};

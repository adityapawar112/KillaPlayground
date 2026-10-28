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
    setTemplateId,
    setFortTitle,
    waterLevel,
    setWaterLevel,
    waterLevelActive,
    setWaterLevelActive,
    freeformSettings,
    setFreeformSetting,
    randomizeFreeformSeed,
    nightMode,
  } = useEditorStore();

  const { loadTemplate } = useTerrainStore();
  const { t, locale } = useTranslation();

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
    setTemplateId(fort.id);
    const title = fort.name[locale] || fort.name.en;
    setFortTitle(title);
    setWaterLevel(fort.waterLevel);
    setWaterLevelActive(fort.waterLevel > 0.05);
    loadTemplate(fort.id);
  };

  const handleFreeformChange = (
    key: 'elevation' | 'tablelandWidth' | 'cliffSteepness' | 'roughness',
    val: number
  ) => {
    setFreeformSetting(key, val);
    if (templateId !== 'scratch') {
      setTemplateId('scratch');
      setFortTitle('Custom Fort');
    }
  };

  const handleRollDice = () => {
    randomizeFreeformSeed();
    if (templateId !== 'scratch') {
      setTemplateId('scratch');
      setFortTitle('Custom Fort');
    }
  };

  return (
    /* Big Left-Side Dropdown Panel (Anchored directly under Top Menu Bar) */
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className={`fixed left-4 top-[3.25rem] z-40 w-[420px] sm:w-[480px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-4.5rem)] bg-[#F9F6F0] rounded-2xl sm:rounded-3xl border-2 border-[#D9C9B4] shadow-2xl shadow-black/25 flex flex-col transition-all duration-200 select-none animate-in fade-in slide-in-from-top-3 ${
        nightMode ? 'text-[#F9F6F0] bg-[#1E1B18] border-[#4A3E35]' : 'text-[#2B1E16]'
      }`}
      role="dialog"
      aria-label="Historical Forts & Terrain Studio"
    >
      {/* Dropdown Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#4B382C] via-[#634E40] to-[#8F4938] text-white flex items-center justify-between border-b border-[#D9C9B4]/40 rounded-t-2xl sm:rounded-t-3xl shadow-sm shrink-0">
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
                <span className="text-[10px] text-[#8D7666] normal-case">Live 3D updates on click</span>
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
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                fort.type === 'sea' || fort.type === 'naval'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {fort.type === 'sea' ? 'Sea Island' : fort.type === 'naval' ? 'Naval Fort' : 'Hill Fort'}
                            </span>
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
                      <span>Broad Building Deck</span>
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
                  <span className="text-xs text-[#634E40] block mt-0.5">
                    Seed #{freeformSettings.seed}
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

              {/* Parameter Sliders */}
              <div className="p-4 rounded-2xl bg-[#F2EBE1]/90 border border-[#D9C9B4] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F4938] font-sans">
                  Topography & Plateau Dimensions
                </h3>

                {/* Tableland Width */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B1E16]">
                    <span>Summit Tableland Width</span>
                    <span>{(freeformSettings.tablelandWidth * 2).toFixed(1)} meters</span>
                  </div>
                  <input
                    type="range"
                    min={2.0}
                    max={4.2}
                    step={0.1}
                    value={freeformSettings.tablelandWidth}
                    onChange={(e) => handleFreeformChange('tablelandWidth', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#D9C9B4] rounded-lg appearance-none cursor-pointer accent-[#4B382C]"
                  />
                  <span className="text-[10px] text-[#8D7666]">
                    Broad flat summit plateau where fort walls and figurines are built.
                  </span>
                </div>

                {/* Elevation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B1E16]">
                    <span>Mountain Peak Elevation</span>
                    <span>{freeformSettings.elevation.toFixed(2)} meters</span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={2.4}
                    step={0.05}
                    value={freeformSettings.elevation}
                    onChange={(e) => handleFreeformChange('elevation', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#D9C9B4] rounded-lg appearance-none cursor-pointer accent-[#4B382C]"
                  />
                </div>

                {/* Cliff Steepness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B1E16]">
                    <span>Cliff Face Steepness</span>
                    <span>{freeformSettings.cliffSteepness >= 6 ? 'Sheer Cliff' : 'Gentle Slopes'}</span>
                  </div>
                  <input
                    type="range"
                    min={3.0}
                    max={8.0}
                    step={0.2}
                    value={freeformSettings.cliffSteepness}
                    onChange={(e) => handleFreeformChange('cliffSteepness', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#D9C9B4] rounded-lg appearance-none cursor-pointer accent-[#4B382C]"
                  />
                </div>

                {/* Roughness & Crags */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B1E16]">
                    <span>Sahyadri Crags & Roughness</span>
                    <span>{(freeformSettings.roughness * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={freeformSettings.roughness}
                    onChange={(e) => handleFreeformChange('roughness', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#D9C9B4] rounded-lg appearance-none cursor-pointer accent-[#4B382C]"
                  />
                </div>
              </div>

              {/* Base Water Level Section */}
              <div className="p-4 rounded-2xl bg-[#F2EBE1]/90 border border-[#D9C9B4] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TbRipple className="w-5 h-5 text-cyan-700" />
                    <span className="font-bold text-xs text-[#2B1E16]">Base Water Level (Moat / Sea)</span>
                  </div>
                  <button
                    onClick={() => setWaterLevelActive(!waterLevelActive)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      waterLevelActive ? 'bg-cyan-600 text-white' : 'bg-[#D9C9B4] text-[#634E40]'
                    }`}
                  >
                    {waterLevelActive ? 'Active' : 'Dry Basin'}
                  </button>
                </div>

                {waterLevelActive && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2B1E16]">
                      <span>Water Elevation</span>
                      <span>{(waterLevel * 100).toFixed(0)} cm</span>
                    </div>
                    <input
                      type="range"
                      min={0.02}
                      max={0.35}
                      step={0.01}
                      value={waterLevel}
                      onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#D9C9B4] rounded-lg appearance-none cursor-pointer accent-cyan-700"
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
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#C25E00] to-[#E85D04] hover:from-[#A75000] hover:to-[#D45404] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <TbSparkles className="w-4 h-4" />
            <span>{t.modeModal.startBuilding}</span>
          </button>
        </div>
      </div>
    );
  };

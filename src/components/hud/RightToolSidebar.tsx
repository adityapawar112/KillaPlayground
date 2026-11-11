'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Castle,
  TowerControl,
  DoorOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  Focus,
  Box,
  Footprints,
  Flag,
  Flame,
  ChevronLeft,
  MousePointer,
  Pencil,
  Move,
  Mountain,
  Minus,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Waves,
  Droplets,
  Paintbrush,
  SlidersHorizontal,
  Dices,
  X,
  Check,
  Search,
  Palette,
  Trees,
  Users,
  Copy,
  Anchor,
  CircleDot,
  Sparkles,
} from 'lucide-react';
import { useEditorStore, TerrainSubTool } from '@/lib/state/useEditorStore';
import { WallMode } from '@/lib/walls/wallTypes';
import { SplineMode, SplineConversionType } from '@/lib/spline/splineTypes';
import { calculateWallTotalLength, detectBastionLocations } from '@/lib/walls/wallGeometry';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  TEXTURE_MANIFEST,
  TEXTURE_CATEGORIES,
  searchTextures,
  getTexturesByCategory,
} from '@/lib/textures/textureManifest';
import {
  FOLIAGE_MANIFEST,
  FOLIAGE_CATEGORIES,
  searchFoliage,
  getFoliageByCategory,
} from '@/lib/foliage/foliageManifest';
import { foliageTextureManager } from '@/lib/foliage/foliageTextureManager';
import {
  FIGURINE_MANIFEST,
  FIGURINE_CATEGORIES,
  searchFigurines,
  getFigurinesByCategory,
  getFigurineById,
} from '@/lib/figurines/figurineManifest';
import {
  LIGHTING_MANIFEST,
  LIGHTING_CATEGORIES,
  searchLights,
  getLightsByCategory,
  getLightById,
} from '@/lib/lighting/lightingManifest';

const STORAGE_RIGHT_WIDTH_KEY = 'killa_right_sidebar_width_v1';

const HISTORICAL_NAMES = [
  'North Rampart',
  'Western Causeway',
  'Ganesh Bastion',
  'Main Gateway',
  'Nagarkhana Citadel',
  'Bhavani Point',
  'Takmak Cliff',
  'Kalyan Gateway',
  'Rajmachi Bastion',
  'Sinhagad Causeway',
  'Grand Staircase',
  'Panhala Watchtower',
  'Torna Rampart',
  'Sea Gate',
];

export const RightToolSidebar: React.FC<{
  isDrawer?: boolean;
  activeDrawerTab?: 'outliner' | 'assets' | 'element';
}> = ({ isDrawer = false, activeDrawerTab }) => {
  const { t, locale } = useTranslation();
  const {
    activeTool,
    showContextualDock,
    isMobileTopBarMinimized,
    isRightSidebarMinimized,
    toggleRightSidebar,
    wallMode,
    setWallMode,
    splineMode,
    setSplineMode,
    terrainSubTool,
    setTerrainSubTool,
    walls,
    selectedWallId,
    setSelectedWallId,
    selectedComponent,
    setSelectedComponent,
    wallSettings,
    setWallSettings,
    updateWallName,
    updateTowerProperties,
    updateTowerName,
    removeTowerFromWall,
    updateBoxBastionProperties,
    updateBoxBastionName,
    removeBoxBastionFromWall,
    updateRoundBastionProperties,
    updateRoundBastionName,
    removeRoundBastionFromWall,
    updateGateProperties,
    updateGateName,
    removeGateFromWall,
    updateBastionProperties,
    toggleGrandBastionOnNode,
    removeBastionFromNode,
    removeWall,
    foundations,
    selectedFoundationId,
    setSelectedFoundationId,
    updateFoundation,
    deleteFoundation,
    stairs,
    selectedStairId,
    setSelectedStairId,
    updateStairName,
    updateStairSettings,
    deleteStair,
    splines,
    selectedSplineId,
    setSelectedSplineId,
    updateSplineName,
    updateSplineType,
    updateSplineSettings,
    deleteSpline,
    setHoveredElement,
    setCameraViewPreset,
    selectedTextureId,
    setSelectedTextureId,
    paintCategoryFilter,
    setPaintCategoryFilter,
    paintSearchQuery,
    setPaintSearchQuery,
    paintSubTool,
    setPaintSubTool,
    selectedFoliageId,
    setSelectedFoliageId,
    foliageSelectMode,
    selectedFoliageIds,
    toggleFoliageSelectedId,
    foliageCategoryFilter,
    setFoliageCategoryFilter,
    foliageSearchQuery,
    setFoliageSearchQuery,
    foliageSubTool,
    setFoliageSubTool,
    propCategoryFilter,
    setPropCategoryFilter,
    propSearchQuery,
    setPropSearchQuery,
    selectedPropType,
    setSelectedPropType,
    propSubTool,
    setPropSubTool,
    placedProps,
    selectedPropId,
    setSelectedPropId,
    removeProp,
    updatePropTransform,
    duplicateProp,
    snapPropToSurface,
    lightingCategoryFilter,
    setLightingCategoryFilter,
    lightingSearchQuery,
    setLightingSearchQuery,
    selectedLightType,
    setSelectedLightType,
    lightingSubTool,
    setLightingSubTool,
    placedLights,
    selectedLightId,
    setSelectedLightId,
    removeLight,
    updateLightTransform,
    duplicateLight,
    snapLightToSurface,
    triggerTestFirework,
    hoveredElement,
    rightSidebarWidth: sidebarWidth,
    setRightSidebarWidth: setSidebarWidth,
    setMobileDrawerTab,
  } = useEditorStore();

  const isDraggingWidthRef = useRef<boolean>(false);
  const [expandedWalls, setExpandedWalls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RIGHT_WIDTH_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 260 && val <= 460) {
          setSidebarWidth(val);
        }
      }
    } catch {}
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingWidthRef.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvt: MouseEvent) => {
      if (!isDraggingWidthRef.current) return;
      const newWidth = Math.max(260, Math.min(460, window.innerWidth - moveEvt.clientX));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingWidthRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem(STORAGE_RIGHT_WIDTH_KEY, sidebarWidth.toString());
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const toggleWallExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWalls((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rollRandomName = (onSetName: (name: string) => void) => {
    const random = HISTORICAL_NAMES[Math.floor(Math.random() * HISTORICAL_NAMES.length)];
    onSetName(random);
  };

  const focusCamera = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCameraViewPreset('reset');
  };

  // Only show right sidebar for tools with outliner/browser (building, walls, spline, texture, foliage, prop, lighting)
  const isRelevantTool =
    activeTool === 'building' ||
    activeTool === 'walls' ||
    activeTool === 'spline' ||
    activeTool === 'texture' ||
    activeTool === 'paint' ||
    activeTool === 'foliage' ||
    activeTool === 'prop' ||
    activeTool === 'lighting';
  if (!isRelevantTool) return null;

  const selectedWall = walls.find((w) => w.id === selectedWallId);
  const selectedSpline = splines.find((s) => s.id === selectedSplineId);
  const selectedFoundation = foundations.find((f) => f.id === selectedFoundationId);
  const selectedStair = stairs.find((s) => s.id === selectedStairId);
  const selectedProp = placedProps.find((p) => p.id === selectedPropId);
  const selectedLight = placedLights.find((l) => l.id === selectedLightId);

  const filteredCategories =
    paintCategoryFilter === 'all'
      ? TEXTURE_CATEGORIES
      : TEXTURE_CATEGORIES.filter((c) => c.id === paintCategoryFilter);

  const filteredFoliageCategories =
    foliageCategoryFilter === 'all'
      ? FOLIAGE_CATEGORIES
      : FOLIAGE_CATEGORIES.filter((c) => c.id === foliageCategoryFilter);

  const filteredFigurineCategories =
    propCategoryFilter === 'all'
      ? FIGURINE_CATEGORIES
      : FIGURINE_CATEGORIES.filter((c) => c.id === propCategoryFilter);

  const filteredLightingCategories =
    lightingCategoryFilter === 'all'
      ? LIGHTING_CATEGORIES
      : LIGHTING_CATEGORIES.filter((c) => c.id === lightingCategoryFilter);

  if (!isDrawer && !isRelevantTool) return null;

  return (
    <>
      {/* Minimized Hanging Guide Tab (Pinned to top-right below studio header) */}
      {!isDrawer && isRightSidebarMinimized && (
        <div
          className={`fixed right-2 z-30 pointer-events-auto transition-all duration-200 ${
            !showContextualDock || isMobileTopBarMinimized ? 'top-[38px]' : 'top-[72px]'
          }`}
        >
          <button
            onClick={toggleRightSidebar}
            className="flex items-center gap-1.5 h-[26px] px-3 py-1 bg-[#EBE6DC] hover:bg-[#D8D1C5] border-x border-b border-[#D8D1C5] rounded-b-md shadow-xs text-xs font-semibold text-[#2B2621] active:scale-95 transition-all cursor-pointer"
            title={
              activeTool === 'foliage'
                ? t.sidebars.right.openFoliage
                : activeTool === 'texture' || activeTool === 'paint'
                ? t.sidebars.right.openTextures
                : activeTool === 'prop'
                ? t.sidebars.right.openFigurines
                : activeTool === 'lighting'
                ? t.sidebars.right.openLighting
                : t.sidebars.right.openOutliner
            }
          >
            {activeTool === 'foliage' ? (
              <Trees className="w-3.5 h-3.5 text-[#15803D]" />
            ) : activeTool === 'texture' || activeTool === 'paint' ? (
              <Palette className="w-3.5 h-3.5 text-[#8F4938]" />
            ) : activeTool === 'prop' ? (
              <Users className="w-3.5 h-3.5 text-[#B85F45]" />
            ) : activeTool === 'lighting' ? (
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
            ) : (
              <Castle className="w-3.5 h-3.5 text-[#8F4938]" />
            )}
            <span className="text-[10px] font-semibold">
              {activeTool === 'foliage'
                ? t.sidebars.right.foliage
                : activeTool === 'texture' || activeTool === 'paint'
                ? t.sidebars.right.textures
                : activeTool === 'prop'
                ? t.sidebars.right.figurines
                : activeTool === 'lighting'
                ? t.sidebars.right.lighting
                : t.sidebars.right.sceneOutliner}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Docked Right Sidebar / Mobile Drawer Body */}
      <aside
        aria-label="Right Tools Sidebar"
        style={isDrawer ? undefined : { width: `${sidebarWidth}px` }}
        className={
          isDrawer
            ? "w-full h-full flex flex-col bg-transparent select-none pointer-events-auto"
            : `fixed right-0 bottom-0 z-20 flex flex-col bg-[#EBE6DC] border-l border-[#D8D1C5] shadow-lg select-none pointer-events-auto transition-all duration-200 max-w-[85vw] ${
                isRightSidebarMinimized ? 'translate-x-full' : 'translate-x-0'
              } ${
                !showContextualDock
                  ? 'top-[38px]'
                  : isMobileTopBarMinimized
                  ? 'top-[38px]'
                  : 'top-[72px]'
              }`
        }
      >
        {!isDrawer && (
          <>
            {/* Left Resizing Edge with Tactile Grip Dots */}
            <div
              onMouseDown={handleResizeStart}
              title="Drag to resize panel"
              className="group absolute top-0 left-0 w-2 h-full cursor-ew-resize hover:bg-[#B85F45]/30 transition-colors z-30 flex items-center justify-center"
            >
              {/* Tactile embossed 6-dot grip */}
              <div className="flex flex-col items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
                <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
                <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
                <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
                <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
                <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
              </div>
            </div>

            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-[#D8D1C5] shrink-0 bg-[#ECE2D5]/70">
              <div className="flex items-center gap-1.5 text-[#2B2621]">
                {activeTool === 'foliage' ? (
                  <Trees className="w-4 h-4 text-[#15803D]" />
                ) : activeTool === 'texture' || activeTool === 'paint' ? (
                  <Palette className="w-4 h-4 text-[#8F4938]" />
                ) : activeTool === 'prop' ? (
                  <Users className="w-4 h-4 text-[#B85F45]" />
                ) : activeTool === 'lighting' ? (
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                ) : (
                  <Castle className="w-4 h-4 text-[#8F4938]" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {activeTool === 'building' || activeTool === 'walls'
                    ? t.sidebars.right.fortArchitecture
                    : activeTool === 'spline'
                    ? t.sidebars.right.pathOutliner
                    : activeTool === 'foliage'
                    ? t.sidebars.right.foliageBrowser
                    : activeTool === 'texture' || activeTool === 'paint'
                    ? t.sidebars.right.textureBrowser
                    : activeTool === 'prop'
                    ? (propSubTool === 'place' ? t.sidebars.right.figurineVault : t.sidebars.right.elementProperties)
                    : activeTool === 'lighting'
                    ? (lightingSubTool === 'place' ? t.sidebars.right.lightingVault : t.sidebars.right.elementProperties)
                    : t.sidebars.right.propsOutliner}
                </span>
                {(activeTool === 'texture' || activeTool === 'paint') && (
                  <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full ml-1">
                    52
                  </span>
                )}
                {activeTool === 'foliage' && (
                  <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full ml-1">
                    {FOLIAGE_MANIFEST.length}
                  </span>
                )}
                {activeTool === 'prop' && propSubTool === 'place' && (
                  <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full ml-1">
                    {FIGURINE_MANIFEST.length}
                  </span>
                )}
                {activeTool === 'lighting' && lightingSubTool === 'place' && (
                  <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full ml-1">
                    {LIGHTING_MANIFEST.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleRightSidebar}
                  title={t.sidebars.right.minimizeOutliner}
                  className="p-1 rounded hover:bg-[#D8C7B5] text-[#5C4638] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs text-[#2B2621]">
          {/* ======================================================== */}
          {/* A. TEXTURE ASSET BROWSER (Ticket 06 - Texture Active)     */}
          {/* ======================================================== */}
          {(activeTool === 'texture' || activeTool === 'paint') ? (
            <div className="space-y-3.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C7267]" />
                <input
                  type="text"
                  value={paintSearchQuery}
                  onChange={(e) => setPaintSearchQuery(e.target.value)}
                  placeholder={t.sidebars.right.searchTextures}
                  className="w-full pl-8 pr-7 py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] rounded-xl text-xs text-[#2B2621] placeholder-[#8D7666] focus:outline-none focus:border-[#B85F45] focus:ring-1 focus:ring-[#BFA892]"
                />
                {paintSearchQuery && (
                  <button
                    onClick={() => setPaintSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#7C7267] hover:text-[#2B2621] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setPaintCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                    paintCategoryFilter === 'all'
                      ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                  }`}
                >
                  {t.common.all} (52)
                </button>
                {TEXTURE_CATEGORIES.map((cat) => {
                  const count = getTexturesByCategory(cat.id).length;
                  const isActive = paintCategoryFilter === cat.id;
                  const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setPaintCategoryFilter(cat.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: cat.accentColor }}
                      />
                      <span>{catName.split(' ')[0]}</span>
                      <span className="opacity-70 text-[9px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Categorized Texture Groups with Dividers */}
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-[#7C7267] italic text-xs">
                  {t.sidebars.right.noTexturesFound} "{paintSearchQuery}"
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const items = searchTextures(paintSearchQuery, cat.id);
                  if (items.length === 0) return null;
                  const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;

                  return (
                    <div key={cat.id} className="space-y-2">
                      {/* Section Divider & Header */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#D8D1C5]">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.accentColor }}
                        />
                        <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                          {catName}
                        </span>
                        <span className="text-[9px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.2 rounded-full ml-auto">
                          {items.length}
                        </span>
                      </div>

                      {/* 2-Column Responsive Texture Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((item) => {
                          const isSelected = selectedTextureId === item.id;

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedTextureId(item.id);
                                if (paintSubTool === 'erase') {
                                  setPaintSubTool('paint');
                                }
                              }}
                              title={`${item.name} - ${item.description}`}
                              className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col ${
                                isSelected
                                  ? 'border-[#E85D04] ring-2 ring-[#E85D04] bg-[#FFFBF7] shadow-sm scale-[1.01]'
                                  : 'border-[#D8D1C5] bg-[#FAF8F5] hover:bg-[#D8D1C5] hover:border-[#B85F45]'
                              }`}
                            >
                              {/* Thumbnail Image */}
                              <div className="w-full aspect-square rounded-lg overflow-hidden relative bg-[#E4D8CB] border border-black/5">
                                <img
                                  src={item.previewPath}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover [image-rendering:pixelated]"
                                />

                                {/* Selected Checkmark Badge */}
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E85D04] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}

                                {/* Layer Tag */}
                                <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] font-bold text-white leading-none">
                                  L{item.layerIndex}
                                </div>
                              </div>

                              {/* Label & Culture Subtitle */}
                              <div className="mt-1.5 min-w-0">
                                <div className="text-[11px] font-bold text-[#2B2621] truncate leading-snug">
                                  {item.name}
                                </div>
                                <div className="text-[9px] text-[#7C7267] truncate leading-tight">
                                  {item.culturalLore || item.category}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTool === 'foliage' ? (
            <div className="space-y-3.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C7267]" />
                <input
                  type="text"
                  value={foliageSearchQuery}
                  onChange={(e) => setFoliageSearchQuery(e.target.value)}
                  placeholder={t.sidebars.right.searchFoliage}
                  className="w-full pl-8 pr-7 py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] rounded-xl text-xs text-[#2B2621] placeholder-[#8D7666] focus:outline-none focus:border-[#B85F45] focus:ring-1 focus:ring-[#BFA892]"
                />
                {foliageSearchQuery && (
                  <button
                    onClick={() => setFoliageSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#7C7267] hover:text-[#2B2621] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setFoliageCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                    foliageCategoryFilter === 'all'
                      ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                  }`}
                >
                  {t.common.all} ({FOLIAGE_MANIFEST.length})
                </button>
                {FOLIAGE_CATEGORIES.map((cat) => {
                  const count = getFoliageByCategory(cat.id).length;
                  const isActive = foliageCategoryFilter === cat.id;
                  const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFoliageCategoryFilter(cat.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: cat.accentColor }}
                      />
                      <span>{catName.split(' ')[0]}</span>
                      <span className="opacity-70 text-[9px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Categorized Foliage Groups with Dividers */}
              {filteredFoliageCategories.length === 0 ? (
                <div className="text-center py-8 text-[#7C7267] italic text-xs">
                  {t.sidebars.right.noFoliageFound} "{foliageSearchQuery}"
                </div>
              ) : (
                filteredFoliageCategories.map((cat) => {
                  const items = searchFoliage(foliageSearchQuery, cat.id);
                  if (items.length === 0) return null;
                  const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;

                  return (
                    <div key={cat.id} className="space-y-2">
                      {/* Section Divider & Header */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#D8D1C5]">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.accentColor }}
                        />
                        <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                          {catName}
                        </span>
                        <span className="text-[9px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.2 rounded-full ml-auto">
                          {items.length}
                        </span>
                      </div>

                      {/* 2-Column Responsive Foliage Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((item) => {
                          const isSelected =
                            foliageSelectMode === 'multi' && foliageSubTool === 'scatter'
                              ? selectedFoliageIds.includes(item.id)
                              : selectedFoliageId === item.id;

                          return (
                            <button
                              key={item.id}
                              onMouseEnter={() => {
                                foliageTextureManager.preload(item.spritePath);
                              }}
                              onClick={() => {
                                if (foliageSelectMode === 'multi' && foliageSubTool === 'scatter') {
                                  toggleFoliageSelectedId(item.id);
                                } else {
                                  setSelectedFoliageId(item.id);
                                }
                                if (foliageSubTool === 'erase') {
                                  setFoliageSubTool('scatter');
                                }
                              }}
                              title={`${item.name} (${item.defaultWidth}m × ${item.defaultHeight}m) - ${item.culturalLore}`}
                              className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col ${
                                isSelected
                                  ? 'border-[#15803D] ring-2 ring-[#15803D] bg-[#F4F9F5] shadow-sm scale-[1.01]'
                                  : 'border-[#D8D1C5] bg-[#FAF8F5] hover:bg-[#D8D1C5] hover:border-[#B85F45]'
                              }`}
                            >
                              {/* Thumbnail Image */}
                              <div className="w-full aspect-square rounded-lg overflow-hidden relative bg-[#E4D8CB] border border-black/5 flex items-center justify-center p-1">
                                <img
                                  src={item.previewPath}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-full h-full object-contain [image-rendering:pixelated]"
                                />

                                {/* Selected Checkmark Badge */}
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}

                                {/* Dimension Tag */}
                                <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] font-bold text-white leading-none">
                                  {item.defaultWidth}m × {item.defaultHeight}m
                                </div>
                              </div>

                              {/* Label & Culture Subtitle */}
                              <div className="mt-1.5 min-w-0">
                                <div className="text-[11px] font-bold text-[#2B2621] truncate leading-snug">
                                  {item.name}
                                </div>
                                <div className="text-[9px] text-[#7C7267] truncate leading-tight">
                                  {item.culturalLore || item.category}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTool === 'prop' ? (
            <div className="space-y-4">
              {(isDrawer ? activeDrawerTab === 'assets' : propSubTool === 'place') ? (
                /* ======================================================== */
                /* FIGURINE VAULT (ASSET BROWSER IN PLACE MODE)             */
                /* ======================================================== */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                      {t.sidebars.right.figurineVault}
                    </span>
                    <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full">
                      {FIGURINE_MANIFEST.length} {t.sidebars.right.models}
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C7267]" />
                    <input
                      type="text"
                      value={propSearchQuery}
                      onChange={(e) => setPropSearchQuery(e.target.value)}
                      placeholder={t.sidebars.right.searchFigurines}
                      className="w-full pl-8 pr-7 py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] rounded-xl text-xs text-[#2B2621] placeholder-[#8D7666] focus:outline-none focus:border-[#B85F45] focus:ring-1 focus:ring-[#BFA892]"
                    />
                    {propSearchQuery && (
                      <button
                        onClick={() => setPropSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#7C7267] hover:text-[#2B2621] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <button
                      onClick={() => setPropCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                        propCategoryFilter === 'all'
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                      }`}
                    >
                      {t.common.all} ({FIGURINE_MANIFEST.length})
                    </button>
                    {FIGURINE_CATEGORIES.map((cat) => {
                      const count = getFigurinesByCategory(cat.id).length;
                      const isActive = propCategoryFilter === cat.id;
                      const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setPropCategoryFilter(cat.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cat.accentColor }}
                          />
                          <span>{catName.split(' ')[0]}</span>
                          <span className="opacity-70 text-[9px]">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Categorized Figurine Groups with Dividers */}
                  {filteredFigurineCategories.length === 0 ? (
                    <div className="text-center py-8 text-[#7C7267] italic text-xs">
                      {t.sidebars.right.noFigurinesFound} "{propSearchQuery}"
                    </div>
                  ) : (
                    filteredFigurineCategories.map((cat) => {
                      const items = searchFigurines(propSearchQuery, cat.id);
                      if (items.length === 0) return null;
                      const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;

                      return (
                        <div key={cat.id} className="space-y-2">
                          {/* Section Divider & Header */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#D8D1C5]">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat.accentColor }}
                            />
                            <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                              {catName}
                            </span>
                            <span className="text-[9px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.2 rounded-full ml-auto">
                              {items.length}
                            </span>
                          </div>

                          {/* 2-Column Responsive Card Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {items.map((item) => {
                              const isSelected = selectedPropType === item.id;
                              const itemName = (locale === 'mr' || locale === 'hi') && item.devanagariName ? item.devanagariName : item.name;

                              return (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedPropType(item.id);
                                  }}
                                  className={`group relative flex flex-col text-left p-2 rounded-xl transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#FAF8F5] ring-2 ring-[#B85F45] shadow-sm'
                                      : 'bg-[#FAF8F5] border border-[#D8D1C5] hover:border-[#B85F45] hover:bg-[#FAF8F5]'
                                  }`}
                                >
                                  {/* 128x128 Aspect Square Container */}
                                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#E8DDD0] flex items-center justify-center">
                                    <img
                                      src={item.previewPath}
                                      alt={itemName}
                                      loading="lazy"
                                      className="w-full h-full object-contain p-1.5 drop-shadow-xs group-hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                        if (fb) (fb as HTMLElement).style.display = 'flex';
                                      }}
                                    />
                                    <div className="fallback-icon hidden flex-col items-center justify-center text-[#7C7267] group-hover:scale-105 transition-transform duration-200">
                                      <Users className="w-10 h-10 text-[#8F4938]/70" />
                                      <span className="text-[8px] font-bold text-[#7C7267] mt-1">3D SOLID</span>
                                    </div>

                                    {/* Selected Checkmark Badge */}
                                    {isSelected && (
                                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center shadow-xs">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </div>
                                    )}

                                    {/* Dimension Tag */}
                                    <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] font-bold text-white leading-none">
                                      {item.faceCount} {t.common.faces || 'faces'}
                                    </div>
                                  </div>

                                  {/* Label */}
                                  <div className="mt-1.5 min-w-0">
                                    <div className="text-[11px] font-bold text-[#2B2621] truncate leading-snug">
                                      {itemName}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* ======================================================== */
                /* DUAL PANE: OUTLINER + ELEMENT INSPECTOR (SELECT/TRANSFORM/ERASE) */
                /* ======================================================== */
                <div className="space-y-4">
                  {/* 1. PLACED FIGURINES OUTLINER */}
                  {(!isDrawer || activeDrawerTab === 'outliner') && (
                    <div className="space-y-1.5 pb-3 border-b border-[#D8D1C5]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                            {t.sidebars.right.placedFigurines}
                          </span>
                          <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full">
                            {placedProps.length} / 250
                          </span>
                        </div>
                        {selectedPropId && (
                          <button
                            onClick={() => setSelectedPropId(null)}
                            className="text-[10px] font-bold text-[#B85F45] hover:underline cursor-pointer"
                          >
                            {t.sidebars.right.deselect}
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5">
                        {placedProps.length === 0 ? (
                          <div className="text-center py-4 text-[#7C7267] italic text-xs bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]/60">
                            {t.sidebars.right.noFigurines}
                          </div>
                        ) : (
                          placedProps.map((prop, idx) => {
                            const isSelected = selectedPropId === prop.id;
                            const isHovered = hoveredElement?.type === 'prop' && hoveredElement.id === prop.id;
                            const meta = getFigurineById(prop.type) || FIGURINE_MANIFEST[0];
                            const label = meta
                              ? (locale === 'mr' || locale === 'hi') && meta.devanagariName
                                ? meta.devanagariName
                                : meta.name
                              : `Figurine ${idx + 1}`;

                            return (
                              <div
                                key={prop.id}
                                onClick={() => {
                                  setSelectedPropId(prop.id);
                                  if (propSubTool !== 'select') {
                                    setPropSubTool('select');
                                  }
                                  if (isDrawer) {
                                    setMobileDrawerTab('element');
                                  }
                                }}
                                onMouseEnter={() => setHoveredElement({ type: 'prop', id: prop.id })}
                                onMouseLeave={() => setHoveredElement(null)}
                                className={`group flex items-center justify-between px-2 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#B85F45] text-[#FAF8F5] border-[#A04F38] shadow-xs'
                                    : isHovered
                                    ? 'bg-[#FAF8F5] border-[#B85F45] ring-1 ring-[#B85F45]/60 text-[#2B2621]'
                                    : 'bg-[#FAF8F5] hover:bg-[#D8D1C5] border-[#D8D1C5] text-[#2B2621]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded bg-[#E8DDD0] shrink-0 overflow-hidden flex items-center justify-center">
                                    <img
                                      src={meta?.previewPath}
                                      alt={label}
                                      className="w-full h-full object-contain p-0.5"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                  <span className="font-semibold text-xs truncate max-w-[110px]">{label}</span>
                                  <span
                                    className={`text-[9px] font-mono shrink-0 ${
                                      isSelected ? 'text-[#FAF8F5]/80' : 'text-[#7C7267]'
                                    }`}
                                  >
                                    ({prop.position[0].toFixed(1)}, {prop.position[2].toFixed(1)})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPropId(prop.id);
                                      focusCamera(e);
                                    }}
                                    title={t.sidebars.right.focusCamera}
                                    className="p-1 rounded hover:bg-black/10 cursor-pointer"
                                  >
                                    <Focus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeProp(prop.id);
                                    }}
                                    title={t.sidebars.right.deleteElement}
                                    className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. ELEMENT PROPERTIES INSPECTOR */}
                  {(!isDrawer || activeDrawerTab === 'element') && (
                    <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                      {t.sidebars.right.elementProperties}
                    </span>
                    {selectedProp && (
                      <button
                        onClick={() => setSelectedPropId(null)}
                        className="text-[10px] font-bold text-[#B85F45] hover:underline cursor-pointer"
                      >
                        {t.sidebars.right.deselect}
                      </button>
                    )}
                  </div>

                  {selectedProp ? (
                    (() => {
                      const meta = getFigurineById(selectedProp.type) || FIGURINE_MANIFEST[0];
                      const currentScale = selectedProp.scale[0] || 1.0;
                      const currentHeadingDeg = Math.round(
                        ((selectedProp.rotation[1] * 180) / Math.PI + 360) % 360
                      );

                      return (
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                          <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                              <Users className="w-4 h-4 text-[#B85F45]" />
                              <span>{t.sidebars.right.figurineSpecs}</span>
                            </div>
                          </div>

                          {/* Name Input */}
                          <div>
                            <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                            <div className="flex items-center gap-1 mt-0.5">
                              <input
                                type="text"
                                readOnly
                                value={(locale === 'mr' || locale === 'hi') && meta?.devanagariName ? meta.devanagariName : (meta?.name || t.sidebars.right.figurines)}
                                className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                              />
                            </div>
                          </div>

                          {/* Scale Slider */}
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                              <span>{t.sidebars.left.scaleMultiplier}</span>
                              <span className="text-[#7C7267]">{currentScale.toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.3"
                              max="2.5"
                              step="0.05"
                              value={currentScale}
                              onChange={(e) => {
                                const s = parseFloat(e.target.value);
                                updatePropTransform(selectedProp.id, { scale: [s, s, s] });
                              }}
                              className="w-full accent-[#B85F45] cursor-pointer"
                            />
                          </div>

                          {/* Heading Rotation Slider */}
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                              <span>{t.sidebars.left.headingRotation}</span>
                              <span className="text-[#7C7267]">{currentHeadingDeg}°</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="5"
                              value={currentHeadingDeg}
                              onChange={(e) => {
                                const deg = parseFloat(e.target.value);
                                const rad = (deg * Math.PI) / 180;
                                updatePropTransform(selectedProp.id, {
                                  rotation: [selectedProp.rotation[0], rad, selectedProp.rotation[2]],
                                });
                              }}
                              className="w-full accent-[#B85F45] cursor-pointer"
                            />
                          </div>

                          {/* Duplicate and Snap Surface Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <button
                              onClick={() => duplicateProp(selectedProp.id)}
                              className="py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                            >
                              {t.sidebars.left.duplicate}
                            </button>
                            <button
                              onClick={() => snapPropToSurface(selectedProp.id)}
                              className="py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                            >
                              {t.sidebars.left.snapToSurface}
                            </button>
                          </div>

                          {/* Focus and Delete Row (Matching Walls & Splines) */}
                          <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                            <button
                              onClick={focusCamera}
                              className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                            >
                              {t.common.focus}
                            </button>
                            <button
                              onClick={() => {
                                removeProp(selectedProp.id);
                                setSelectedPropId(null);
                              }}
                              className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                            >
                              {t.common.delete}
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-6 text-[#7C7267] italic text-xs bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]/60">
                      Select a figurine from the list above or diorama to edit properties.
                    </div>
                  )}
                </div>
                )}
              </div>
            )}
          </div>
        ) : activeTool === 'lighting' ? (
            <div className="space-y-4">
              {(isDrawer ? activeDrawerTab === 'assets' : lightingSubTool === 'place') ? (
                /* ======================================================== */
                /* LIGHTING VAULT (ASSET BROWSER IN PLACE MODE)             */
                /* ======================================================== */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                      {t.sidebars.right.lightingVault}
                    </span>
                    <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full">
                      {LIGHTING_MANIFEST.length} {t.sidebars.right.items}
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C7267]" />
                    <input
                      type="text"
                      value={lightingSearchQuery}
                      onChange={(e) => setLightingSearchQuery(e.target.value)}
                      placeholder={t.sidebars.right.searchLighting}
                      className="w-full pl-8 pr-7 py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] rounded-xl text-xs text-[#2B2621] placeholder-[#8D7666] focus:outline-none focus:border-[#B85F45] focus:ring-1 focus:ring-[#BFA892]"
                    />
                    {lightingSearchQuery && (
                      <button
                        onClick={() => setLightingSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#7C7267] hover:text-[#2B2621] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills: All (28) | Clay Diyas (9) | Painted Diyas (9) | Fireworks (10) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <button
                      onClick={() => setLightingCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                        lightingCategoryFilter === 'all'
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                      }`}
                    >
                      {t.common.all} ({LIGHTING_MANIFEST.length})
                    </button>
                    {LIGHTING_CATEGORIES.map((cat) => {
                      const count = getLightsByCategory(cat.id).length;
                      const isActive = lightingCategoryFilter === cat.id;
                      const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setLightingCategoryFilter(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
                          }`}
                        >
                          {catName} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Categories & 2-Column Cards Grid */}
                  <div className="space-y-4 max-h-[calc(100vh-290px)] overflow-y-auto pr-0.5">
                    {filteredLightingCategories.length === 0 ? (
                      <div className="text-center py-8 text-[#7C7267] italic text-xs bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]/60">
                        {t.sidebars.right.noLightingFound} &ldquo;{lightingSearchQuery}&rdquo;
                      </div>
                    ) : (
                      filteredLightingCategories.map((cat) => {
                        const allInCat = getLightsByCategory(cat.id);
                        const items = lightingSearchQuery
                          ? searchLights(lightingSearchQuery).filter((i) => i.category === cat.id)
                          : allInCat;

                        if (items.length === 0) return null;
                        const catName = (locale === 'mr' || locale === 'hi') && cat.devanagari ? cat.devanagari : cat.name;

                        return (
                          <div key={cat.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#7C7267] uppercase tracking-wider px-1">
                              <span>{catName}</span>
                              <span>{items.length}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {items.map((item) => {
                                const isSelected = (selectedLightType || 'diya_clay_01') === item.id;
                                const itemName = (locale === 'mr' || locale === 'hi') && item.devanagariName ? item.devanagariName : item.name;

                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => setSelectedLightType(item.id)}
                                    className={`group relative text-left p-2 rounded-xl border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#FAF8F5] border-[#B85F45] ring-2 ring-[#B85F45] shadow-sm'
                                        : 'bg-[#FAF8F5] border-[#D8D1C5] hover:border-[#B85F45]/60 hover:bg-[#FAF8F5]/90 hover:shadow-xs'
                                    }`}
                                  >
                                    {/* Image preview / procedural fallback */}
                                    <div className="relative aspect-4/3 rounded-lg bg-[#FAF8F5]/50 border border-[#D8D1C5]/60 overflow-hidden flex items-center justify-center">
                                      <img
                                        src={item.previewPath}
                                        alt={itemName}
                                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                          if (fb) (fb as HTMLElement).style.display = 'flex';
                                        }}
                                      />
                                      <div className="fallback-icon hidden flex-col items-center justify-center text-[#7C7267] group-hover:scale-105 transition-transform duration-200">
                                        {item.category === 'fireworks' ? (
                                          <Sparkles className="w-8 h-8 text-[#F59E0B]" />
                                        ) : (
                                          <Flame className="w-8 h-8 text-[#F59E0B]" />
                                        )}
                                        <span className="text-[7.5px] font-bold text-[#7C7267] mt-0.5 uppercase">
                                          {item.category === 'fireworks' ? (item.fireworkType === 'anaar' ? 'Fountain' : 'Sky Shot') : 'Diya'}
                                        </span>
                                      </div>

                                      {/* Selected Checkmark Badge */}
                                      {isSelected && (
                                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center shadow-xs">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                      )}

                                      {/* Light / Burst Tag */}
                                      <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] font-bold text-white leading-none">
                                        {item.category === 'fireworks'
                                          ? item.fireworkType === 'anaar'
                                            ? 'Fountain'
                                            : 'Sky Shot'
                                          : 'Warm Diya'}
                                      </div>
                                    </div>

                                    {/* Label */}
                                    <div className="mt-1.5 min-w-0">
                                      <div className="text-[11px] font-bold text-[#2B2621] truncate leading-snug">
                                        {itemName}
                                      </div>
                                      <div className="text-[9px] text-[#7C7267] truncate">
                                        {item.culturalLore || item.category}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* ======================================================== */
                /* OUTLINER + PROPERTIES (SELECT / TRANSFORM / ERASE MODES) */
                /* ======================================================== */
                <div className="space-y-4">
                  {/* 1. PLACED LIGHTS OUTLINER */}
                  {(!isDrawer || activeDrawerTab === 'outliner') && (
                    <div className="space-y-1.5 pb-3 border-b border-[#D8D1C5]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                            {t.sidebars.right.placedLighting}
                          </span>
                          <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full">
                            {placedLights.length} / 250
                          </span>
                        </div>
                        {selectedLightId && (
                          <button
                            onClick={() => setSelectedLightId(null)}
                            className="text-[10px] font-bold text-[#B85F45] hover:underline cursor-pointer"
                          >
                            {t.sidebars.right.deselect}
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5">
                        {placedLights.length === 0 ? (
                          <div className="text-center py-4 text-[#7C7267] italic text-xs bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]/60">
                            {t.sidebars.right.noLighting}
                          </div>
                        ) : (
                          placedLights.map((light, idx) => {
                            const isSelected = selectedLightId === light.id;
                            const isHovered = hoveredElement?.type === 'light' && hoveredElement.id === light.id;
                            const meta = getLightById(light.type) || LIGHTING_MANIFEST[0];
                            const label = meta
                              ? (locale === 'mr' || locale === 'hi') && meta.devanagariName
                                ? meta.devanagariName
                                : meta.name
                              : `Light ${idx + 1}`;

                            return (
                              <div
                                key={light.id}
                                onClick={() => {
                                  setSelectedLightId(light.id);
                                  if (lightingSubTool !== 'select') {
                                    setLightingSubTool('select');
                                  }
                                  if (isDrawer) {
                                    setMobileDrawerTab('element');
                                  }
                                }}
                                onMouseEnter={() => setHoveredElement({ type: 'light', id: light.id })}
                                onMouseLeave={() => setHoveredElement(null)}
                                className={`group flex items-center justify-between px-2 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#B85F45] text-[#FAF8F5] border-[#A04F38] shadow-xs'
                                    : isHovered
                                    ? 'bg-[#FAF8F5] border-[#B85F45] ring-1 ring-[#B85F45]/60 text-[#2B2621]'
                                    : 'bg-[#FAF8F5] hover:bg-[#D8D1C5] border-[#D8D1C5] text-[#2B2621]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded bg-[#E8DDD0] shrink-0 overflow-hidden flex items-center justify-center">
                                    <img
                                      src={meta?.previewPath}
                                      alt={label}
                                      className="w-full h-full object-contain p-0.5"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                  <span className="font-semibold text-xs truncate max-w-[110px]">{label}</span>
                                  <span
                                    className={`text-[9px] font-mono shrink-0 ${
                                      isSelected ? 'text-[#FAF8F5]/80' : 'text-[#7C7267]'
                                    }`}
                                  >
                                    ({light.position[0].toFixed(1)}, {light.position[2].toFixed(1)})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLightId(light.id);
                                      focusCamera(e);
                                    }}
                                    title={t.sidebars.right.focusCamera}
                                    className="p-1 rounded hover:bg-black/10 cursor-pointer"
                                  >
                                    <Focus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeLight(light.id);
                                    }}
                                    title={t.sidebars.right.deleteElement}
                                    className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. ELEMENT PROPERTIES INSPECTOR */}
                  {(!isDrawer || activeDrawerTab === 'element') && (
                    <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                        Element Properties
                      </span>
                      {selectedLight && (
                        <button
                          onClick={() => setSelectedLightId(null)}
                          className="text-[10px] font-bold text-[#B85F45] hover:underline cursor-pointer"
                        >
                          Deselect
                        </button>
                      )}
                    </div>

                    {selectedLight ? (
                      (() => {
                        const meta = getLightById(selectedLight.type) || LIGHTING_MANIFEST[0];
                        const currentScale = selectedLight.scale[0] || 1.0;
                        const currentHeadingDeg = Math.round(
                          ((selectedLight.rotation[1] * 180) / Math.PI + 360) % 360
                        );

                        return (
                          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                            <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                                <Flame className="w-4 h-4 text-[#F59E0B]" />
                                <span>{t.sidebars.right.lightSpecs}</span>
                              </div>
                            </div>

                            {/* Name Input */}
                            <div>
                              <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="text"
                                  readOnly
                                  value={(locale === 'mr' || locale === 'hi') && meta?.devanagariName ? meta.devanagariName : (meta?.name || t.sidebars.right.lighting)}
                                  className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                                />
                              </div>
                            </div>

                            {/* Scale Slider */}
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                                <span>{t.sidebars.left.scaleMultiplier}</span>
                                <span className="text-[#7C7267]">{currentScale.toFixed(2)}x</span>
                              </div>
                              <input
                                type="range"
                                min="0.3"
                                max="2.5"
                                step="0.05"
                                value={currentScale}
                                onChange={(e) => {
                                  const s = parseFloat(e.target.value);
                                  updateLightTransform(selectedLight.id, { scale: [s, s, s] });
                                }}
                                className="w-full accent-[#B85F45] cursor-pointer"
                              />
                            </div>

                            {/* Heading Rotation Slider */}
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                                <span>{t.sidebars.left.headingRotation}</span>
                                <span className="text-[#7C7267]">{currentHeadingDeg}°</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                step="5"
                                value={currentHeadingDeg}
                                onChange={(e) => {
                                  const deg = parseFloat(e.target.value);
                                  const rad = (deg * Math.PI) / 180;
                                  updateLightTransform(selectedLight.id, {
                                    rotation: [selectedLight.rotation[0], rad, selectedLight.rotation[2]],
                                  });
                                }}
                                className="w-full accent-[#B85F45] cursor-pointer"
                              />
                            </div>

                            {/* Burst Height Slider (Fireworks only) */}
                            {selectedLight.category === 'fireworks' && (
                              <div>
                                <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                                  <span>{t.sidebars.left.burstHeight}</span>
                                  <span className="text-[#7C7267]">
                                    {(((selectedLight.burstHeight ?? (meta.burstAltitude ?? 1.0))) * 100).toFixed(0)}cm
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0.4"
                                  max="3.5"
                                  step="0.1"
                                  value={selectedLight.burstHeight ?? (meta.burstAltitude ?? 1.0)}
                                  onChange={(e) => {
                                    updateLightTransform(selectedLight.id, { burstHeight: parseFloat(e.target.value) });
                                  }}
                                  className="w-full accent-[#B85F45] cursor-pointer"
                                />
                              </div>
                            )}

                            {/* Test Firework Trigger Button (Fireworks only, Diyas do not need test button) */}
                            {selectedLight.category === 'fireworks' && (
                              <button
                                onClick={() => triggerTestFirework(selectedLight.id)}
                                className="w-full py-1.5 bg-[#F59E0B] text-[#2B1E16] hover:bg-[#D97706] rounded-lg font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#8F4938]" />
                                <span>{t.sidebars.left.testFireworkBurst}</span>
                              </button>
                            )}

                            {/* Duplicate and Snap Surface Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-0.5">
                              <button
                                onClick={() => duplicateLight(selectedLight.id)}
                                className="py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                              >
                                {t.sidebars.left.duplicate}
                              </button>
                              <button
                                onClick={() => snapLightToSurface(selectedLight.id)}
                                className="py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                              >
                                {t.sidebars.left.snapToSurface}
                              </button>
                            </div>

                            {/* Focus and Delete Row */}
                            <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                              <button
                                onClick={focusCamera}
                                className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                              >
                                {t.common.focus}
                              </button>
                              <button
                                onClick={() => {
                                  removeLight(selectedLight.id);
                                  setSelectedLightId(null);
                                }}
                                className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                              >
                                {t.common.delete}
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-6 text-[#7C7267] italic text-xs bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]/60">
                        Select a light or firework from the list above or diorama to edit properties.
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* 1. HIERARCHICAL OUTLINER FILE TREE                        */}
              {/* ======================================================== */}
              {(!isDrawer || activeDrawerTab === 'outliner') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                      {t.sidebars.right.sceneOutliner}
                    </span>
                    <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#5C4638] px-1.5 py-0.5 rounded-full">
                      {(activeTool === 'building' || activeTool === 'walls')
                        ? walls.length + foundations.length + stairs.length
                        : splines.length}
                    </span>
                  </div>

                  {/* FORT ARCHITECTURE TREE VIEW (Walls, Foundations, Stairs) */}
                  {(activeTool === 'building' || activeTool === 'walls') && (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                      {walls.length === 0 && foundations.length === 0 && stairs.length === 0 ? (
                        <div className="text-center py-4 text-[#7C7267] italic text-xs">
                          No fort structures built yet.
                        </div>
                      ) : (
                        <>
                          {/* 1. Walls List */}
                          {walls.map((wall, idx) => {
                          const isSelected = selectedWallId === wall.id && !selectedComponent;
                          const isExpanded = expandedWalls[wall.id] ?? true;
                          const totalLengthM = calculateWallTotalLength(wall.points, wall.isClosed);
                          const bastionIndices = detectBastionLocations(
                            wall.points,
                            wall.isClosed,
                            wall.settings?.autoBastions ?? true,
                            wall.manualBastionIndices,
                            wall.excludedBastionIndices
                          );
                          const childCount =
                            bastionIndices.length +
                            (wall.towers?.length || 0) +
                            (wall.boxBastions?.length || 0) +
                            (wall.roundBastions?.length || 0) +
                            (wall.gates?.length || 0);

                          return (
                            <div key={wall.id} className="rounded-xl border border-[#D8D1C5] bg-[#FAF8F5] overflow-hidden">
                              {/* Wall Row */}
                              <div
                                onClick={() => {
                                  setSelectedWallId(wall.id);
                                  setSelectedComponent(null);
                                  if (isDrawer) {
                                    setMobileDrawerTab('element');
                                  }
                                }}
                                onMouseEnter={() => setHoveredElement({ type: 'wall', id: wall.id })}
                                onMouseLeave={() => setHoveredElement(null)}
                                className={`group flex items-center justify-between px-2.5 py-1.5 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-[#B85F45] text-[#FAF8F5]' : 'hover:bg-[#D8D1C5]'
                                }`}
                              >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {childCount > 0 ? (
                                <button
                                  onClick={(e) => toggleWallExpand(wall.id, e)}
                                  className="p-0.5 rounded hover:bg-black/10 cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              ) : (
                                <div className="w-4" />
                              )}
                              <Castle className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold truncate">{wall.name || `Rampart ${idx + 1}`}</span>
                              <span
                                className={`text-[10px] truncate ${
                                  isSelected ? 'text-[#FAF8F5]/80' : 'text-[#7C7267]'
                                }`}
                              >
                                ({totalLengthM.toFixed(1)}m)
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={focusCamera}
                                title="Focus Camera"
                                className="p-1 rounded hover:bg-black/10 cursor-pointer"
                              >
                                <Focus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeWall(wall.id);
                                }}
                                title="Delete Wall"
                                className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          {isExpanded && childCount > 0 && (
                            <div className="pl-6 pr-2 py-1 space-y-1 bg-[#EBE6DC]/60 border-t border-[#D8D1C5]/60">
                              {/* Corner Bastions */}
                              {bastionIndices.map((bIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'bastion' &&
                                  selectedComponent.idOrIndex === bIdx &&
                                  selectedComponent.wallId === wall.id;
                                const custom = wall.customBastions?.[bIdx];
                                const label = custom?.name || `Rampart Bastion ${bIdx + 1}`;

                                return (
                                  <div
                                    key={`bastion_${bIdx}`}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'bastion', idOrIndex: bIdx, wallId: wall.id });
                                      if (isDrawer) {
                                        setMobileDrawerTab('element');
                                      }
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#2B2621] text-[#FAF8F5]'
                                        : 'hover:bg-[#D8D1C5] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Castle className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{label}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeBastionFromNode(wall.id, bIdx);
                                      }}
                                      title="Remove Bastion"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Round Watchtowers */}
                              {wall.towers?.map((tw, tIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'tower' &&
                                  selectedComponent.idOrIndex === tw.id &&
                                  selectedComponent.wallId === wall.id;

                                return (
                                  <div
                                    key={tw.id}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'tower', idOrIndex: tw.id, wallId: wall.id });
                                      if (isDrawer) {
                                        setMobileDrawerTab('element');
                                      }
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#2B2621] text-[#FAF8F5]'
                                        : 'hover:bg-[#D8D1C5] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <TowerControl className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{tw.name || `Watchtower ${tIdx + 1}`}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTowerFromWall(wall.id, tw.id);
                                      }}
                                      title="Remove Watchtower"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Rampart Bastions (Platforms) */}
                              {wall.boxBastions?.map((bx, bIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'box' &&
                                  selectedComponent.idOrIndex === bx.id &&
                                  selectedComponent.wallId === wall.id;

                                return (
                                  <div
                                    key={bx.id}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'box', idOrIndex: bx.id, wallId: wall.id });
                                      if (isDrawer) {
                                        setMobileDrawerTab('element');
                                      }
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#2B2621] text-[#FAF8F5]'
                                        : 'hover:bg-[#D8D1C5] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Castle className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{bx.name || `Rampart Bastion ${bIdx + 1}`}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeBoxBastionFromWall(wall.id, bx.id);
                                      }}
                                      title="Remove Bastion"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Round Bastions (Semi-circular) */}
                              {wall.roundBastions?.map((rb, rIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'round_bastion' &&
                                  selectedComponent.idOrIndex === rb.id &&
                                  selectedComponent.wallId === wall.id;

                                return (
                                  <div
                                    key={rb.id}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'round_bastion', idOrIndex: rb.id, wallId: wall.id });
                                      if (isDrawer) {
                                        setMobileDrawerTab('element');
                                      }
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#2B2621] text-[#FAF8F5]'
                                        : 'hover:bg-[#D8D1C5] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <CircleDot className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{rb.name || `Round Bastion ${rIdx + 1}`}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeRoundBastionFromWall(wall.id, rb.id);
                                      }}
                                      title="Remove Round Bastion"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Arched Gateways */}
                              {wall.gates?.map((gt, gIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'gate' &&
                                  selectedComponent.idOrIndex === gt.id &&
                                  selectedComponent.wallId === wall.id;

                                return (
                                  <div
                                    key={gt.id}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'gate', idOrIndex: gt.id, wallId: wall.id });
                                      if (isDrawer) {
                                        setMobileDrawerTab('element');
                                      }
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#2B2621] text-[#FAF8F5]'
                                        : 'hover:bg-[#D8D1C5] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <DoorOpen className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{gt.name || `Arched Gateway ${gIdx + 1}`}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeGateFromWall(wall.id, gt.id);
                                      }}
                                      title="Remove Gateway"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                      {/* 2. Foundations List */}
                      {foundations.map((foundation, idx) => {
                        const isSelected = selectedFoundationId === foundation.id;
                        const widthCm = (foundation.length * 100).toFixed(0);
                        const depthCm = (foundation.width * 100).toFixed(0);

                        return (
                          <div
                            key={foundation.id}
                            onClick={() => {
                              setSelectedFoundationId(foundation.id);
                              setSelectedWallId(null);
                              setSelectedComponent(null);
                              setSelectedStairId(null);
                              if (isDrawer) {
                                setMobileDrawerTab('element');
                              }
                            }}
                            onMouseEnter={() => setHoveredElement({ type: 'foundation', id: foundation.id })}
                            onMouseLeave={() => setHoveredElement(null)}
                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-[#D8D1C5] transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#B85F45] text-[#FAF8F5]'
                                : 'bg-[#FAF8F5] hover:bg-[#D8D1C5] text-[#2B2621]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Box className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold truncate">{foundation.name || `Foundation Slab ${idx + 1}`}</span>
                              <span
                                className={`text-[10px] truncate ${
                                  isSelected ? 'text-[#FAF8F5]/80' : 'text-[#7C7267]'
                                }`}
                              >
                                ({widthCm}×{depthCm}cm)
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={focusCamera}
                                title="Focus Camera"
                                className="p-1 rounded hover:bg-black/10 cursor-pointer"
                              >
                                <Focus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFoundation(foundation.id);
                                  if (selectedFoundationId === foundation.id) {
                                    setSelectedFoundationId(null);
                                  }
                                }}
                                title="Delete Foundation"
                                className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* 3. Stairs List */}
                      {stairs.map((stair, idx) => {
                        const isSelected = selectedStairId === stair.id;

                        return (
                          <div
                            key={stair.id}
                            onClick={() => {
                              setSelectedStairId(stair.id);
                              setSelectedWallId(null);
                              setSelectedComponent(null);
                              setSelectedFoundationId(null);
                              if (isDrawer) {
                                setMobileDrawerTab('element');
                              }
                            }}
                            onMouseEnter={() => setHoveredElement({ type: 'stair', id: stair.id })}
                            onMouseLeave={() => setHoveredElement(null)}
                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-[#D8D1C5] transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#B85F45] text-[#FAF8F5]'
                                : 'bg-[#FAF8F5] hover:bg-[#D8D1C5] text-[#2B2621]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Footprints className="w-3.5 h-3.5 shrink-0 text-[#B85F45]" />
                              <span className="font-semibold truncate">{stair.name || `Stone Staircase ${idx + 1}`}</span>
                              <span
                                className={`text-[10px] truncate ${
                                  isSelected ? 'text-[#FAF8F5]/80' : 'text-[#7C7267]'
                                }`}
                              >
                                ({stair.points.length} pts)
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={focusCamera}
                                title="Focus Camera"
                                className="p-1 rounded hover:bg-black/10 cursor-pointer"
                              >
                                <Focus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStair(stair.id);
                                  if (selectedStairId === stair.id) {
                                    setSelectedStairId(null);
                                  }
                                }}
                                title="Delete Staircase"
                                className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              {/* SPLINES TREE VIEW */}
              {activeTool === 'spline' && (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {splines.length === 0 ? (
                    <div className="text-center py-4 text-[#7C7267] italic text-xs">
                      No paths drawn yet.
                    </div>
                  ) : (
                    splines.map((spline, idx) => {
                      const isSelected = selectedSplineId === spline.id;
                      const Icon =
                        spline.type === 'steps' ? Footprints : spline.type === 'flags' ? Flag : Flame;
                      const label =
                        spline.name ||
                        (spline.type === 'steps'
                          ? `Stone Steps ${idx + 1}`
                          : spline.type === 'flags'
                          ? `Bhagwa Flags ${idx + 1}`
                          : `Festive Diyas ${idx + 1}`);

                      return (
                        <div
                          key={spline.id}
                          onClick={() => {
                            setSelectedSplineId(spline.id);
                            if (isDrawer) {
                              setMobileDrawerTab('element');
                            }
                          }}
                          onMouseEnter={() => setHoveredElement({ type: 'spline', id: spline.id })}
                          onMouseLeave={() => setHoveredElement(null)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-[#D8D1C5] transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#B85F45] text-[#FAF8F5]'
                              : 'bg-[#FAF8F5] hover:bg-[#D8D1C5] text-[#2B2621]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-4 h-4 shrink-0 text-[#B85F45]" />
                            <span className="font-semibold truncate">{label}</span>
                            <span
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-[#FAF8F5]/80' : 'text-[#7C7267]'
                              }`}
                            >
                              ({spline.points.length} pts)
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={focusCamera}
                              title="Focus Camera"
                              className="p-1 rounded hover:bg-black/10 cursor-pointer"
                            >
                              <Focus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSpline(spline.id);
                              }}
                              title="Delete Path"
                              className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. CONTEXTUAL OBJECT INSPECTOR                            */}
          {/* ======================================================== */}
          {(!isDrawer || activeDrawerTab === 'element') && (
            <div className="border-t border-[#D8D1C5] pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                {t.sidebars.right.elementInspector}
              </span>
                {(selectedWallId || selectedComponent || selectedSplineId || selectedFoundationId || selectedStairId) && (
                  <button
                    onClick={() => {
                      setSelectedWallId(null);
                      setSelectedComponent(null);
                      setSelectedSplineId(null);
                      setSelectedFoundationId(null);
                      setSelectedStairId(null);
                    }}
                    className="text-[10px] text-[#B85F45] hover:underline cursor-pointer font-semibold"
                  >
                    {t.sidebars.right.deselect}
                  </button>
                )}
              </div>

              {/* A. BASTION (CORNER AUTO-BASTION) INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedWall && selectedComponent?.type === 'bastion' && (
                (() => {
                  const bIdx = Number(selectedComponent.idOrIndex);
                  const custom = selectedWall.customBastions?.[bIdx];
                  const radius = custom?.radius ?? selectedWall.settings?.bastionRadius ?? 0.13;
                  const heightOffset = custom?.heightOffset ?? 0.0;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                          <Castle className="w-4 h-4 text-[#B85F45]" />
                          <span>{t.sidebars.left.fortStampBastion}</span>
                        </div>
                      </div>

                      {/* Bastion Name */}
                      <div>
                        <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={custom?.name || ''}
                            placeholder={`${t.sidebars.left.fortStampBastion} ${bIdx + 1}`}
                            onChange={(e) =>
                              updateBastionProperties(selectedWall.id, bIdx, { name: e.target.value })
                            }
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() =>
                              rollRandomName((name) =>
                                updateBastionProperties(selectedWall.id, bIdx, { name })
                              )
                            }
                            className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]"
                            title={t.tools.walls.rollName}
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Radius Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.tools.walls.bastionRadius}</span>
                          <span className="text-[#7C7267]">{(radius * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.06"
                          max="0.35"
                          step="0.01"
                          value={radius}
                          onChange={(e) =>
                            updateBastionProperties(selectedWall.id, bIdx, {
                              radius: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Height Offset Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.heightAboveWall}</span>
                          <span className="text-[#7C7267]">{(heightOffset * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.30"
                          step="0.01"
                          value={heightOffset}
                          onChange={(e) =>
                            updateBastionProperties(selectedWall.id, bIdx, {
                              heightOffset: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                        >
                          {t.common.focus}
                        </button>
                        <button
                          onClick={() => {
                            removeBastionFromNode(selectedWall.id, bIdx);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          {t.common.delete}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* B. WATCHTOWER (ROUND TOWER) INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedWall && selectedComponent?.type === 'tower' && (
                (() => {
                  const tower = selectedWall.towers?.find((t) => t.id === selectedComponent.idOrIndex);
                  if (!tower) return null;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                          <TowerControl className="w-4 h-4 text-[#B85F45]" />
                          <span>{t.sidebars.left.fortStampWatchtower}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={tower.name || ''}
                            placeholder={t.sidebars.left.fortStampWatchtower}
                            onChange={(e) => updateTowerName(selectedWall.id, tower.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() => rollRandomName((name) => updateTowerName(selectedWall.id, tower.id, name))}
                            className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]"
                            title={t.tools.walls.rollName}
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Radius / Width */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.tools.walls.bastionRadius}</span>
                          <span className="text-[#7C7267]">{((tower.radius || 0.13) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.06"
                          max="0.35"
                          step="0.01"
                          value={tower.radius || 0.13}
                          onChange={(e) =>
                            updateTowerProperties(selectedWall.id, tower.id, { radius: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Height Above Wall */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.heightAboveWall}</span>
                          <span className="text-[#7C7267]">{((tower.heightOffset || 0.02) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.30"
                          step="0.01"
                          value={tower.heightOffset || 0.02}
                          onChange={(e) =>
                            updateTowerProperties(selectedWall.id, tower.id, { heightOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                        >
                          {t.common.focus}
                        </button>
                        <button
                          onClick={() => {
                            removeTowerFromWall(selectedWall.id, tower.id);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          {t.common.delete}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* C. RAMPART BASTION (PLATFORM) INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedWall && selectedComponent?.type === 'box' && (
                (() => {
                  const box = selectedWall.boxBastions?.find((b) => b.id === selectedComponent.idOrIndex);
                  if (!box) return null;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                          <Castle className="w-4 h-4 text-[#B85F45]" />
                          <span>{t.sidebars.left.fortStampBastion}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={box.name || ''}
                            placeholder={t.sidebars.left.fortStampBastion}
                            onChange={(e) => updateBoxBastionName(selectedWall.id, box.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() => rollRandomName((name) => updateBoxBastionName(selectedWall.id, box.id, name))}
                            className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]"
                            title={t.tools.walls.rollName}
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Width along wall */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.tools.walls.thickness}</span>
                          <span className="text-[#7C7267]">{((box.width || 0.30) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.15"
                          max="0.80"
                          step="0.02"
                          value={box.width || 0.30}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { width: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Inward Depth / Length */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.tools.walls.length}</span>
                          <span className="text-[#7C7267]">{((box.depth || 0.30) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.15"
                          max="0.80"
                          step="0.02"
                          value={box.depth || 0.30}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { depth: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Height Above Wall */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.heightAboveWall}</span>
                          <span className="text-[#7C7267]">{((box.heightOffset || 0.04) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.25"
                          step="0.01"
                          value={box.heightOffset || 0.04}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { heightOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Flip Orientation */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.right.flipOrientation}</span>
                        <input
                          type="checkbox"
                          checked={box.flipSide || false}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { flipSide: e.target.checked })
                          }
                          className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                        >
                          {t.common.focus}
                        </button>
                        <button
                          onClick={() => {
                            removeBoxBastionFromWall(selectedWall.id, box.id);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          {t.common.delete}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* D. ARCHED GATEWAY INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedWall && selectedComponent?.type === 'gate' && (
                (() => {
                  const gate = selectedWall.gates?.find((g) => g.id === selectedComponent.idOrIndex);
                  if (!gate) return null;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                          <DoorOpen className="w-4 h-4 text-[#B85F45]" />
                          <span>{t.sidebars.left.fortStampGate}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={gate.name || ''}
                            placeholder={t.sidebars.left.fortStampGate}
                            onChange={(e) => updateGateName(selectedWall.id, gate.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() => rollRandomName((name) => updateGateName(selectedWall.id, gate.id, name))}
                            className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]"
                            title={t.tools.walls.rollName}
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Arch Width */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.archWidth}</span>
                          <span className="text-[#7C7267]">{((gate.width || 0.18) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.50"
                          step="0.01"
                          value={gate.width || 0.18}
                          onChange={(e) =>
                            updateGateProperties(selectedWall.id, gate.id, { width: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Arch Height */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.archHeight}</span>
                          <span className="text-[#7C7267]">{((gate.height || 0.18) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.45"
                          step="0.01"
                          value={gate.height || 0.18}
                          onChange={(e) =>
                            updateGateProperties(selectedWall.id, gate.id, { height: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Flanking Watchtowers */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.right.flankingWatchtowers}</span>
                        <input
                          type="checkbox"
                          checked={gate.hasGatehouse ?? true}
                          onChange={(e) =>
                            updateGateProperties(selectedWall.id, gate.id, { hasGatehouse: e.target.checked })
                          }
                          className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                        >
                          {t.common.focus}
                        </button>
                        <button
                          onClick={() => {
                            removeGateFromWall(selectedWall.id, gate.id);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          {t.common.delete}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* D.2 ROUND BASTION INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedWall && selectedComponent?.type === 'round_bastion' && (
                (() => {
                  const rb = selectedWall.roundBastions?.find((b) => b.id === selectedComponent.idOrIndex);
                  if (!rb) return null;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                          <CircleDot className="w-4 h-4 text-[#B85F45]" />
                          <span>{t.sidebars.left.fortStampRoundBastion}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={rb.name || ''}
                            placeholder={t.sidebars.left.fortStampRoundBastion}
                            onChange={(e) => updateRoundBastionName(selectedWall.id, rb.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() => rollRandomName((name) => updateRoundBastionName(selectedWall.id, rb.id, name))}
                            className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]"
                            title={t.tools.walls.rollName}
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Radius */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.bastionRadius}</span>
                          <span className="text-[#7C7267]">{((rb.radius || 0.22) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.08"
                          max="0.50"
                          step="0.01"
                          value={rb.radius || 0.22}
                          onChange={(e) =>
                            updateRoundBastionProperties(selectedWall.id, rb.id, { radius: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Height Above Wall */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.heightAboveWall}</span>
                          <span className="text-[#7C7267]">{((rb.heightOffset || 0.05) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.30"
                          step="0.01"
                          value={rb.heightOffset || 0.05}
                          onChange={(e) =>
                            updateRoundBastionProperties(selectedWall.id, rb.id, { heightOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Flip Orientation */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.right.flipOrientation}</span>
                        <input
                          type="checkbox"
                          checked={rb.flipSide || false}
                          onChange={(e) =>
                            updateRoundBastionProperties(selectedWall.id, rb.id, { flipSide: e.target.checked })
                          }
                          className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                        >
                          {t.common.focus}
                        </button>
                        <button
                          onClick={() => {
                            removeRoundBastionFromWall(selectedWall.id, rb.id);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          {t.common.delete}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* E. PARENT WALL INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedWall && !selectedComponent && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                      <Castle className="w-4 h-4 text-[#B85F45]" />
                      <span>{t.sidebars.right.rampartSpecs}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="text"
                        value={selectedWall.name || ''}
                        placeholder={t.sidebars.left.fortStampBastion}
                        onChange={(e) => updateWallName(selectedWall.id, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                      />
                      <button
                        onClick={() => rollRandomName((name) => updateWallName(selectedWall.id, name))}
                        className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]"
                        title={t.tools.walls.rollName}
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                      <span>{t.sidebars.right.wallHeight}</span>
                      <span className="text-[#7C7267]">{((wallSettings.height || 0.25) * 100).toFixed(0)} cm</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.60"
                      step="0.02"
                      value={wallSettings.height || 0.25}
                      onChange={(e) => setWallSettings({ height: parseFloat(e.target.value) })}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                      <span>{t.sidebars.right.wallThickness}</span>
                      <span className="text-[#7C7267]">{((wallSettings.thickness || 0.15) * 100).toFixed(0)} cm</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.35"
                      step="0.01"
                      value={wallSettings.thickness || 0.15}
                      onChange={(e) => setWallSettings({ thickness: parseFloat(e.target.value) })}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.right.battlements}</span>
                    <input
                      type="checkbox"
                      checked={wallSettings.crenellations}
                      onChange={(e) => setWallSettings({ crenellations: e.target.checked })}
                      className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {wallSettings.crenellations && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.right.flipBattlementsRim}</span>
                      <input
                        type="checkbox"
                        checked={wallSettings.flipCrenellations ?? false}
                        onChange={(e) => setWallSettings({ flipCrenellations: e.target.checked })}
                        className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.right.cornerAutoBastions}</span>
                    <input
                      type="checkbox"
                      checked={wallSettings.autoBastions}
                      onChange={(e) => setWallSettings({ autoBastions: e.target.checked })}
                      className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {wallSettings.autoBastions && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.bastionRadius}</span>
                        <span className="text-[#7C7267]">{((wallSettings.bastionRadius || 0.13) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.06"
                        max="0.35"
                        step="0.01"
                        value={wallSettings.bastionRadius || 0.13}
                        onChange={(e) => setWallSettings({ bastionRadius: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                    <button
                      onClick={focusCamera}
                      className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                    >
                      {t.common.focus}
                    </button>
                    <button
                      onClick={() => {
                        removeWall(selectedWall.id);
                        setSelectedWallId(null);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              )}

              {/* F. SPLINE FEATURE INSPECTOR */}
              {activeTool === 'spline' && selectedSpline && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                      {selectedSpline.type === 'steps' ? (
                        <Footprints className="w-4 h-4 text-[#B85F45]" />
                      ) : selectedSpline.type === 'flags' ? (
                        <Flag className="w-4 h-4 text-[#B85F45]" />
                      ) : (
                        <Flame className="w-4 h-4 text-[#B85F45]" />
                      )}
                      <span>{t.sidebars.right.pathFeature}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="text"
                        value={selectedSpline.name || ''}
                        placeholder={selectedSpline.type === 'steps' ? t.sidebars.right.steps : selectedSpline.type === 'flags' ? t.sidebars.right.flags : t.sidebars.right.diyas}
                        onChange={(e) => updateSplineName(selectedSpline.id, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-[#D8D1C5] rounded-lg text-[#2B1E16]"
                      />
                      <button
                        onClick={() => rollRandomName((name) => updateSplineName(selectedSpline.id, name))}
                        className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]"
                        title={t.tools.walls.rollName}
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Switch Type inside Inspector */}
                  <div>
                    <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.sidebars.right.featureType}</label>
                    <div className="grid grid-cols-3 gap-1 mt-0.5">
                      {(['steps', 'flags', 'diyas'] as SplineConversionType[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateSplineType(selectedSpline.id, st)}
                          className={`py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                            selectedSpline.type === st
                              ? 'bg-[#2B2621] text-[#FAF8F5]'
                              : 'bg-[#FAF8F5] text-[#5C4638] hover:bg-[#D8D1C5]'
                          }`}
                        >
                          {st === 'steps' ? t.sidebars.right.steps : st === 'flags' ? t.sidebars.right.flags : t.sidebars.right.diyas}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Complete Elemental Sliders for Spline */}
                  {selectedSpline.type === 'steps' && (
                    <div className="space-y-2 pt-1 border-t border-[#D8D1C5]">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.stairWidth}</span>
                          <span className="text-[#7C7267]">
                            {(((selectedSpline.settings?.stepWidth ?? 0.06)) * 100).toFixed(0)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.03"
                          max="0.15"
                          step="0.01"
                          value={selectedSpline.settings?.stepWidth ?? 0.06}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepWidth: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.treadDepth}</span>
                          <span className="text-[#7C7267]">
                            {(((selectedSpline.settings?.stepRun ?? 0.025)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.015"
                          max="0.06"
                          step="0.005"
                          value={selectedSpline.settings?.stepRun ?? 0.025}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepRun: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.stepRiseHeight}</span>
                          <span className="text-[#7C7267]">
                            {(((selectedSpline.settings?.stepRise ?? 0.01)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.03"
                          step="0.002"
                          value={selectedSpline.settings?.stepRise ?? 0.01}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepRise: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.stepSpacing}</span>
                          <span className="text-[#7C7267]">
                            {(((selectedSpline.settings?.stepSpacing ?? 0.025)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.015"
                          max="0.06"
                          step="0.005"
                          value={selectedSpline.settings?.stepSpacing ?? 0.025}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepSpacing: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.pathOffset}</span>
                          <span className="text-[#7C7267]">
                            {(((selectedSpline.settings?.stepOffset ?? 0.0)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-0.05"
                          max="0.05"
                          step="0.005"
                          value={selectedSpline.settings?.stepOffset ?? 0.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.scale}</span>
                          <span className="text-[#7C7267]">
                            {(selectedSpline.settings?.scale ?? 1.0).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={selectedSpline.settings?.scale ?? 1.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { scale: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {selectedSpline.type !== 'steps' && (
                    <div className="space-y-2 pt-1 border-t border-[#D8D1C5]">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.itemSpacing}</span>
                          <span className="text-[#7C7267]">
                            {(((selectedSpline.settings?.spacing ?? (selectedSpline.type === 'flags' ? 0.20 : 0.35))) * 100).toFixed(0)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.80"
                          step="0.05"
                          value={selectedSpline.settings?.spacing ?? (selectedSpline.type === 'flags' ? 0.20 : 0.35)}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { spacing: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.pathOffset}</span>
                          <span className="text-[#7C7267]">
                            {(((selectedSpline.settings?.stepOffset ?? 0.0)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-0.10"
                          max="0.10"
                          step="0.01"
                          value={selectedSpline.settings?.stepOffset ?? 0.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.right.itemScale}</span>
                          <span className="text-[#7C7267]">
                            {(selectedSpline.settings?.scale ?? 1.0).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={selectedSpline.settings?.scale ?? 1.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { scale: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                    <button
                      onClick={focusCamera}
                      className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                    >
                      {t.common.focus}
                    </button>
                    <button
                      onClick={() => {
                        deleteSpline(selectedSpline.id);
                        setSelectedSplineId(null);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              )}

              {/* FOUNDATION INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedFoundation && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                      <Box className="w-4 h-4 text-[#B85F45]" />
                      <span>{t.tools.building.foundationTitle}</span>
                    </div>
                    <div className="text-[10px] text-[#7C7267]">
                      {(selectedFoundation.length * 100).toFixed(0)}cm ×{' '}
                      {(selectedFoundation.width * 100).toFixed(0)}cm
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="text"
                        value={selectedFoundation.name || ''}
                        onChange={(e) => updateFoundation(selectedFoundation.id, { name: e.target.value })}
                        className="flex-1 px-2 py-1 bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg text-xs"
                      />
                      <button
                        onClick={() => rollRandomName((name) => updateFoundation(selectedFoundation.id, { name }))}
                        className="p-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg text-[#2B2621] cursor-pointer"
                        title={t.tools.walls.rollName}
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-2.5 pt-1 border-t border-[#D8D1C5]">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.walls.height}</span>
                        <span className="text-[#7C7267]">
                          {((selectedFoundation.height || 0.40) * 100).toFixed(0)} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-5.00"
                        max="15.00"
                        step="0.05"
                        value={selectedFoundation.height || 0.40}
                        onChange={(e) =>
                          updateFoundation(selectedFoundation.id, { height: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.verticalOffset}</span>
                        <span className="text-[#7C7267]">
                          {((selectedFoundation.verticalOffset || 0.0) * 100).toFixed(0)} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.50"
                        max="2.00"
                        step="0.05"
                        value={selectedFoundation.verticalOffset || 0.0}
                        onChange={(e) =>
                          updateFoundation(selectedFoundation.id, { verticalOffset: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.tilingRepeat}</span>
                        <span className="text-[#7C7267]">
                          {(selectedFoundation.tilingRepeat || 2.0).toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="10.0"
                        step="0.5"
                        value={selectedFoundation.tilingRepeat || 2.0}
                        onChange={(e) =>
                          updateFoundation(selectedFoundation.id, { tilingRepeat: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                    <button
                      onClick={focusCamera}
                      className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                    >
                      {t.common.focus}
                    </button>
                    <button
                      onClick={() => {
                        deleteFoundation(selectedFoundation.id);
                        setSelectedFoundationId(null);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              )}

              {/* STAIRS INSPECTOR */}
              {(activeTool === 'building' || activeTool === 'walls') && selectedStair && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2621]">
                      <Footprints className="w-4 h-4 text-[#B85F45]" />
                      <span>{t.tools.building.stairsTitle}</span>
                    </div>
                    <div className="text-[10px] text-[#7C7267]">
                      {selectedStair.points.length} {t.sidebars.right.waypoints}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#7C7267] uppercase">{t.common.name}</label>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="text"
                        value={selectedStair.name || ''}
                        onChange={(e) => updateStairName(selectedStair.id, e.target.value)}
                        className="flex-1 px-2 py-1 bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg text-xs"
                      />
                      <button
                        onClick={() => rollRandomName((name) => updateStairName(selectedStair.id, name))}
                        className="p-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg text-[#2B2621] cursor-pointer"
                        title={t.tools.walls.rollName}
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-2.5 pt-1 border-t border-[#D8D1C5]">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.stepScale}</span>
                        <span className="text-[#7C7267]">
                          {(selectedStair.settings?.scale ?? 2.0).toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={selectedStair.settings?.scale ?? 2.0}
                        onChange={(e) =>
                          updateStairSettings(selectedStair.id, { scale: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.stairWidth}</span>
                        <span className="text-[#7C7267]">
                          {(((selectedStair.settings?.stepWidth ?? 0.10)) * 100).toFixed(0)} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.03"
                        max="0.30"
                        step="0.01"
                        value={selectedStair.settings?.stepWidth ?? 0.10}
                        onChange={(e) =>
                          updateStairSettings(selectedStair.id, { stepWidth: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.treadDepth}</span>
                        <span className="text-[#7C7267]">
                          {(((selectedStair.settings?.stepRun ?? 0.03)) * 100).toFixed(1)} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.015"
                        max="0.06"
                        step="0.005"
                        value={selectedStair.settings?.stepRun ?? 0.03}
                        onChange={(e) =>
                          updateStairSettings(selectedStair.id, { stepRun: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.stepRiseHeight}</span>
                        <span className="text-[#7C7267]">
                          {(((selectedStair.settings?.stepRise ?? 0.015)) * 100).toFixed(1)} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.005"
                        max="0.03"
                        step="0.002"
                        value={selectedStair.settings?.stepRise ?? 0.015}
                        onChange={(e) =>
                          updateStairSettings(selectedStair.id, { stepRise: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.stepSpacing}</span>
                        <span className="text-[#7C7267]">
                          {(((selectedStair.settings?.stepSpacing ?? 0.03)) * 100).toFixed(1)} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.10"
                        step="0.005"
                        value={selectedStair.settings?.stepSpacing ?? 0.03}
                        onChange={(e) =>
                          updateStairSettings(selectedStair.id, { stepSpacing: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.right.pathOffset}</span>
                        <span className="text-[#7C7267]">
                          {(((selectedStair.settings?.stepOffset ?? 0.0)) * 100).toFixed(1)} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.15"
                        max="0.15"
                        step="0.01"
                        value={selectedStair.settings?.stepOffset ?? 0.0}
                        onChange={(e) =>
                          updateStairSettings(selectedStair.id, { stepOffset: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]">
                    <button
                      onClick={focusCamera}
                      className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer text-center"
                    >
                      {t.common.focus}
                    </button>
                    <button
                      onClick={() => {
                        deleteStair(selectedStair.id);
                        setSelectedStairId(null);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              )}

              {/* G. EMPTY SELECTION STATE */}
              {!selectedWallId && !selectedComponent && !selectedSplineId && !selectedFoundationId && !selectedStairId && (
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-dashed border-[#D8D1C5] text-center text-[#7C7267] text-xs space-y-1">
                  <MousePointer className="w-5 h-5 mx-auto text-[#7C7267]/60" />
                  <div>{t.sidebars.right.selectToInspect}</div>
                </div>
              )}
            </div>
          )}
          </>
        )}
      </div>
    </aside>
    </>
  );
};


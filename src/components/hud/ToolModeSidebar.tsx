'use client';

import React from 'react';
import {
  MousePointer,
  Pencil,
  TowerControl,
  Box,
  Footprints,
  Move,
  Mountain,
  Minus,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Waves,
  Droplets,
  Paintbrush,
  Eraser,
  Trees,
  Focus,
  ChevronLeft,
  ChevronDown,
  RotateCw,
  RefreshCw,
  Clapperboard,
  Sparkles,
} from 'lucide-react';
import {
  useEditorStore,
  BuildingMode,
  WallMode,
  SplineMode,
  TerrainSubTool,
  FoliageSubTool,
  LightingSubTool,
  ViewMode,
} from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { getTextureById } from '@/lib/textures/textureManifest';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const ToolModeSidebar: React.FC = () => {
  const {
    activeTool,
    buildingMode,
    setBuildingMode,
    wallMode,
    setWallMode,
    splineMode,
    setSplineMode,
    terrainSubTool,
    setTerrainSubTool,
    paintSubTool,
    setPaintSubTool,
    foliageSubTool,
    setFoliageSubTool,
    propSubTool,
    setPropSubTool,
    lightingSubTool,
    setLightingSubTool,
    viewMode,
    setViewMode,
    showLeftToolbar,
    showContextualDock,
    isToolModeMinimized,
    toggleToolMode,
    isMobileTopBarMinimized,
    leftSidebarWidth,
    isMobileSidebarMinimized,
  } = useEditorStore();
  const { t } = useTranslation();

  // Hide sidebar completely if left drawer is toggled off
  if (!showLeftToolbar) return null;

  // Tools that feature distinct operation sub-modes
  const toolsWithModes = [
    'building',
    'walls',
    'spline',
    'terrain',
    'texture',
    'paint',
    'foliage',
    'prop',
    'lighting',
    'view',
  ];
  if (!toolsWithModes.includes(activeTool)) return null;

  // Responsive dynamic top offset
  const topOffsetClass = !showContextualDock || isMobileTopBarMinimized
    ? 'top-[41px]'
    : 'top-[112px] xl:top-[81px]';

  // Dynamic horizontal position based on Left Sidebar state
  const isLeftSidebarOpen = !isMobileSidebarMinimized;
  const modeRailLeft = isLeftSidebarOpen ? `${leftSidebarWidth}px` : '0px';
  const minimizedTabLeft = isLeftSidebarOpen ? `${leftSidebarWidth + 8}px` : '116px';

  return (
    <>
      {/* Minimized Hanging Mode Tab */}
      {isToolModeMinimized && (
        <div
          style={{ left: minimizedTabLeft }}
          className={`fixed ${topOffsetClass} z-30 pointer-events-auto select-none transition-all duration-200 font-sans`}
        >
          <button
            onClick={toggleToolMode}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#EBE6DC] border border-[#D8D1C5] rounded-b-md shadow-sm text-xs font-semibold text-[#2B2621] hover:bg-[#D8D1C5] transition-colors cursor-pointer"
            title={t.toolModeSidebar.openModes}
          >
            <span className="text-[11px] font-semibold">{t.toolModeSidebar.mode}</span>
            <ChevronDown size={14} strokeWidth={1.75} className="text-[#5A5248]" />
          </button>
        </div>
      )}

      {/* Expanded Vertical Modes Rail (Level 2 Surface) */}
      {!isToolModeMinimized && (
        <aside
          aria-label="Tool Operational Modes"
          style={{ left: modeRailLeft }}
          className={`fixed ${topOffsetClass} bottom-0 z-30 flex flex-col w-[76px] bg-[#EBE6DC] border-r border-[#D8D1C5] shadow-xs select-none pointer-events-auto transition-all duration-200 font-sans`}
        >
          {/* Header Strip with Minimize Toggle */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#D8D1C5] bg-[#EBE6DC]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7C7267]">
              {t.toolModeSidebar.mode}
            </span>
            <button
              onClick={toggleToolMode}
              className="p-1 rounded-md hover:bg-[#D8D1C5] text-[#5A5248] transition-colors cursor-pointer"
              title={t.toolModeSidebar.minimizeModes}
            >
              <ChevronLeft size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Vertical Buttons Column */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 flex flex-col gap-1.5">
            {/* A. UNIFIED BUILDING MODES */}
            {(activeTool === 'building' || activeTool === 'walls') && (
              <>
                {[
                  { id: 'select' as BuildingMode, label: t.toolModeSidebar.buildingModes.select, icon: MousePointer, title: t.toolModeSidebar.buildingTitles.select },
                  { id: 'walls' as BuildingMode, label: t.toolModeSidebar.buildingModes.walls, icon: Pencil, title: t.toolModeSidebar.buildingTitles.walls },
                  { id: 'foundation' as BuildingMode, label: t.toolModeSidebar.buildingModes.foundation, icon: Box, title: t.toolModeSidebar.buildingTitles.foundation },
                  { id: 'stairs' as BuildingMode, label: t.toolModeSidebar.buildingModes.stairs, icon: Footprints, title: t.toolModeSidebar.buildingTitles.stairs },
                  { id: 'fortifications' as BuildingMode, label: t.toolModeSidebar.buildingModes.fortifications, icon: TowerControl, title: t.toolModeSidebar.buildingTitles.fortifications },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = (buildingMode || 'walls') === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setBuildingMode(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
                      <span className="font-medium text-[10px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* C. TERRAIN MODES: 8 Subtools */}
            {activeTool === 'terrain' && (
              <>
                {[
                  { id: 'elevate' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.elevate, icon: Mountain, title: t.toolModeSidebar.terrainTitles.elevate },
                  { id: 'plateau' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.plateau, icon: Minus, title: t.toolModeSidebar.terrainTitles.plateau },
                  { id: 'slope' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.slope, icon: ArrowUpRight, title: t.toolModeSidebar.terrainTitles.slope },
                  { id: 'lower' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.lower, icon: TrendingDown, title: t.toolModeSidebar.terrainTitles.lower },
                  { id: 'trench' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.trench, icon: Activity, title: t.toolModeSidebar.terrainTitles.trench },
                  { id: 'smooth' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.smooth, icon: Waves, title: t.toolModeSidebar.terrainTitles.smooth },
                  { id: 'pond' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.pond, icon: Droplets, title: t.toolModeSidebar.terrainTitles.pond },
                  { id: 'retexture' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.retexture, icon: Paintbrush, title: t.toolModeSidebar.terrainTitles.retexture },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive =
                    terrainSubTool === m.id ||
                    (m.id === 'retexture' && terrainSubTool === 'soil');

                  return (
                    <button
                      key={m.id}
                      onClick={() => setTerrainSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
                      <span className="font-medium text-[9px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* D. TEXTURE MODES: Paint | Erase | Fill */}
            {(activeTool === 'texture' || activeTool === 'paint') && (
              <>
                {[
                  { id: 'paint' as const, label: t.toolModeSidebar.textureModes.paint, icon: Paintbrush, title: t.toolModeSidebar.textureTitles.paint },
                  { id: 'erase' as const, label: t.toolModeSidebar.textureModes.erase, icon: Eraser, title: t.toolModeSidebar.textureTitles.erase },
                  { id: 'fill' as const, label: t.toolModeSidebar.textureModes.fill, icon: Sparkles, title: t.toolModeSidebar.textureTitles.fill },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = paintSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (m.id === 'fill') {
                          const sel = useEditorStore.getState().selectedTextureId;
                          const meta = getTextureById(sel);
                          const layerIdx = meta ? meta.layerIndex : 0;
                          useTerrainStore.getState().fillPaintTerrain(layerIdx);
                          useEditorStore.getState().setToastMessage(t.toolModeSidebar.textureTitles.fill);
                        } else {
                          setPaintSubTool(m.id as 'paint' | 'erase');
                        }
                      }}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
                      <span className="font-medium text-[9px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* E. FOLIAGE MODES: Scatter | Single | Erase */}
            {activeTool === 'foliage' && (
              <>
                {[
                  { id: 'scatter' as const, label: t.toolModeSidebar.foliageModes.scatter, icon: Trees, title: t.toolModeSidebar.foliageTitles.scatter },
                  { id: 'single' as const, label: t.toolModeSidebar.foliageModes.single, icon: Focus, title: t.toolModeSidebar.foliageTitles.single },
                  { id: 'erase' as const, label: t.toolModeSidebar.foliageModes.erase, icon: Eraser, title: t.toolModeSidebar.foliageTitles.erase },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = foliageSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setFoliageSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
                      <span className="font-medium text-[9px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* F. FIGURINE & ASSET MODES: Place | Select | Transform | Erase */}
            {activeTool === 'prop' && (
              <>
                {[
                  { id: 'place' as const, label: t.toolModeSidebar.propModes.place, icon: Pencil, title: t.toolModeSidebar.propTitles.place },
                  { id: 'select' as const, label: t.toolModeSidebar.propModes.select, icon: MousePointer, title: t.toolModeSidebar.propTitles.select },
                  { id: 'transform' as const, label: t.toolModeSidebar.propModes.transform, icon: Move, title: t.toolModeSidebar.propTitles.transform },
                  { id: 'erase' as const, label: t.toolModeSidebar.propModes.erase, icon: Eraser, title: t.toolModeSidebar.propTitles.erase },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = propSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setPropSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
                      <span className="font-medium text-[9px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* G. FESTIVE LIGHTING & FIREWORKS MODES: Place | Select | Transform | Erase */}
            {activeTool === 'lighting' && (
              <>
                {[
                  { id: 'place' as const, label: t.toolModeSidebar.lightingModes.place, icon: Pencil, title: t.toolModeSidebar.lightingTitles.place },
                  { id: 'select' as const, label: t.toolModeSidebar.lightingModes.select, icon: MousePointer, title: t.toolModeSidebar.lightingTitles.select },
                  { id: 'transform' as const, label: t.toolModeSidebar.lightingModes.transform, icon: Move, title: t.toolModeSidebar.lightingTitles.transform },
                  { id: 'erase' as const, label: t.toolModeSidebar.lightingModes.erase, icon: Eraser, title: t.toolModeSidebar.lightingTitles.erase },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = lightingSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setLightingSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
                      <span className="font-medium text-[9px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* H. DIORAMA & SUN VIEW MODES: Orbit | Turntable */}
            {activeTool === 'view' && (
              <>
                {[
                  { id: 'orbit' as ViewMode, label: t.toolModeSidebar.viewModes.orbit, icon: RotateCw, title: t.toolModeSidebar.viewTitles.orbit },
                  { id: 'turntable' as ViewMode, label: t.toolModeSidebar.viewModes.turntable, icon: RefreshCw, title: t.toolModeSidebar.viewTitles.turntable },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = viewMode === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setViewMode(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
                      <span className="font-medium text-[9px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </aside>
      )}
    </>
  );
};

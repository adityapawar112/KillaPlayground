'use client';

import React from 'react';
import {
  TbPointer,
  TbPencil,
  TbTower,
  TbBox,
  TbStairs,
  TbArrowsMove,
  TbMountain,
  TbMinus,
  TbArrowUpRight,
  TbTrendingDown,
  TbWaveSine,
  TbRipple,
  TbDropletHalf2,
  TbBrush,
  TbEraser,
  TbTrees,
  TbFocus2,
  TbChevronLeft,
  TbChevronDown,
  TbRotateClockwise2,
  TbRefresh,
  TbMovie,
  TbSparkles,
} from 'react-icons/tb';
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
    leftSidebarWidth,
    isMobileSidebarMinimized,
    isToolModeMinimized,
    toggleToolMode,
    showContextualDock,
    isMobileTopBarMinimized,
  } = useEditorStore();
  const { t } = useTranslation();

  // Only render when the active tool has distinct operational modes
  if (!['building', 'walls', 'terrain', 'texture', 'paint', 'foliage', 'prop', 'lighting', 'view'].includes(activeTool)) {
    return null;
  }

  // Calculate dynamic left offset for hanging folder guide tab and panel
  const attachedLeft = isMobileSidebarMinimized ? 0 : leftSidebarWidth;
  const topOffsetClass = !showContextualDock || isMobileTopBarMinimized
    ? 'top-[41px]'
    : 'top-[112px] xl:top-[81px]';

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MINIMIZED HANGING FOLDER GUIDE TAB                    */}
      {/* ======================================================== */}
      {isToolModeMinimized && (
        <div
          style={{
            left: isMobileSidebarMinimized ? '138px' : `${leftSidebarWidth + 8}px`,
          }}
          className={`fixed z-30 pointer-events-auto transition-all duration-200 font-sans ${topOffsetClass}`}
        >
          <button
            onClick={toggleToolMode}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#E4D8CB] border-x border-b border-[#CDBCAB] rounded-b-lg shadow-sm text-xs font-semibold text-[#4B382C] active:scale-95 transition-transform cursor-pointer"
            title={t.toolModeSidebar.openModes}
          >
            <TbPointer className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[11px] font-bold">{t.toolModeSidebar.mode}</span>
            <TbChevronDown className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DOCKED VERTICAL TOOL MODE PANEL                        */}
      {/* ======================================================== */}
      {!isToolModeMinimized && (
        <aside
          aria-label="Tool Modes Strip"
          style={{ left: `${attachedLeft}px` }}
          className={`fixed bottom-0 z-20 flex flex-col w-[68px] bg-[#F3EBE0] border-r border-[#CDBCAB] shadow-md select-none pointer-events-auto transition-all duration-200 font-sans ${topOffsetClass}`}
        >
          {/* Header with Title and Minimize Button */}
          <div className="flex items-center justify-between p-2 border-b border-[#D8C7B5] shrink-0 bg-[#ECE2D5]/70">
            <span className="text-[9px] font-bold text-[#8D7666] uppercase tracking-wider">
              {t.toolModeSidebar.mode}
            </span>
            <button
              onClick={toggleToolMode}
              className="p-1 rounded hover:bg-[#D8C7B5] text-[#5C4638] transition-colors cursor-pointer"
              title={t.toolModeSidebar.minimizeModes}
            >
              <TbChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vertical Buttons Column */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 flex flex-col gap-2">
            {/* A. UNIFIED BUILDING MODES: Select | Walls | Foundation | Stairs | Fortifications (Ticket 09) */}
            {(activeTool === 'building' || activeTool === 'walls') && (
              <>
                {[
                  { id: 'select' as BuildingMode, label: t.toolModeSidebar.buildingModes.select, icon: TbPointer, title: t.toolModeSidebar.buildingTitles.select },
                  { id: 'walls' as BuildingMode, label: t.toolModeSidebar.buildingModes.walls, icon: TbPencil, title: t.toolModeSidebar.buildingTitles.walls },
                  { id: 'foundation' as BuildingMode, label: t.toolModeSidebar.buildingModes.foundation, icon: TbBox, title: t.toolModeSidebar.buildingTitles.foundation },
                  { id: 'stairs' as BuildingMode, label: t.toolModeSidebar.buildingModes.stairs, icon: TbStairs, title: t.toolModeSidebar.buildingTitles.stairs },
                  { id: 'fortifications' as BuildingMode, label: t.toolModeSidebar.buildingModes.fortifications, icon: TbTower, title: t.toolModeSidebar.buildingTitles.fortifications },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = (buildingMode || 'walls') === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setBuildingMode(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[10px] mt-1 leading-tight text-center">
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
                  { id: 'elevate' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.elevate, icon: TbMountain, title: t.toolModeSidebar.terrainTitles.elevate },
                  { id: 'plateau' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.plateau, icon: TbMinus, title: t.toolModeSidebar.terrainTitles.plateau },
                  { id: 'slope' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.slope, icon: TbArrowUpRight, title: t.toolModeSidebar.terrainTitles.slope },
                  { id: 'lower' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.lower, icon: TbTrendingDown, title: t.toolModeSidebar.terrainTitles.lower },
                  { id: 'trench' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.trench, icon: TbWaveSine, title: t.toolModeSidebar.terrainTitles.trench },
                  { id: 'smooth' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.smooth, icon: TbRipple, title: t.toolModeSidebar.terrainTitles.smooth },
                  { id: 'pond' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.pond, icon: TbDropletHalf2, title: t.toolModeSidebar.terrainTitles.pond },
                  { id: 'retexture' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.retexture, icon: TbBrush, title: t.toolModeSidebar.terrainTitles.retexture },
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
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[9px] mt-1 leading-tight text-center">
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
                  { id: 'paint' as const, label: t.toolModeSidebar.textureModes.paint, icon: TbBrush, title: t.toolModeSidebar.textureTitles.paint },
                  { id: 'erase' as const, label: t.toolModeSidebar.textureModes.erase, icon: TbEraser, title: t.toolModeSidebar.textureTitles.erase },
                  { id: 'fill' as const, label: t.toolModeSidebar.textureModes.fill, icon: TbSparkles, title: t.toolModeSidebar.textureTitles.fill },
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
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[9px] mt-1 leading-tight text-center">
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
                  { id: 'scatter' as const, label: t.toolModeSidebar.foliageModes.scatter, icon: TbTrees, title: t.toolModeSidebar.foliageTitles.scatter },
                  { id: 'single' as const, label: t.toolModeSidebar.foliageModes.single, icon: TbFocus2, title: t.toolModeSidebar.foliageTitles.single },
                  { id: 'erase' as const, label: t.toolModeSidebar.foliageModes.erase, icon: TbEraser, title: t.toolModeSidebar.foliageTitles.erase },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = foliageSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setFoliageSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[9px] mt-1 leading-tight text-center">
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
                  { id: 'place' as const, label: t.toolModeSidebar.propModes.place, icon: TbPencil, title: t.toolModeSidebar.propTitles.place },
                  { id: 'select' as const, label: t.toolModeSidebar.propModes.select, icon: TbPointer, title: t.toolModeSidebar.propTitles.select },
                  { id: 'transform' as const, label: t.toolModeSidebar.propModes.transform, icon: TbArrowsMove, title: t.toolModeSidebar.propTitles.transform },
                  { id: 'erase' as const, label: t.toolModeSidebar.propModes.erase, icon: TbEraser, title: t.toolModeSidebar.propTitles.erase },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = propSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setPropSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[9px] mt-1 leading-tight text-center">
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
                  { id: 'place' as const, label: t.toolModeSidebar.lightingModes.place, icon: TbPencil, title: t.toolModeSidebar.lightingTitles.place },
                  { id: 'select' as const, label: t.toolModeSidebar.lightingModes.select, icon: TbPointer, title: t.toolModeSidebar.lightingTitles.select },
                  { id: 'transform' as const, label: t.toolModeSidebar.lightingModes.transform, icon: TbArrowsMove, title: t.toolModeSidebar.lightingTitles.transform },
                  { id: 'erase' as const, label: t.toolModeSidebar.lightingModes.erase, icon: TbEraser, title: t.toolModeSidebar.lightingTitles.erase },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = lightingSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setLightingSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[9px] mt-1 leading-tight text-center">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* H. DIORAMA & SUN VIEW MODES: Orbit | Turntable (Ticket 11) */}
            {activeTool === 'view' && (
              <>
                {[
                  { id: 'orbit' as ViewMode, label: t.toolModeSidebar.viewModes.orbit, icon: TbRotateClockwise2, title: t.toolModeSidebar.viewTitles.orbit },
                  { id: 'turntable' as ViewMode, label: t.toolModeSidebar.viewModes.turntable, icon: TbRefresh, title: t.toolModeSidebar.viewTitles.turntable },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = viewMode === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setViewMode(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[9px] mt-1 leading-tight text-center">
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

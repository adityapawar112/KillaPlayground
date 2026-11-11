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
  Sparkles,
  Columns2,
} from 'lucide-react';
import {
  useEditorStore,
  BuildingMode,
  TerrainSubTool,
  ViewMode,
} from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { getTextureById } from '@/lib/textures/textureManifest';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface SubToolItem {
  id: string;
  label: string;
  icon: React.ElementType;
  title: string;
  shortcut: string;
  category?: string;
}

export const ToolModeSidebar: React.FC = () => {
  const {
    activeTool,
    buildingMode,
    setBuildingMode,
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
    isToolRailCompact,
    toggleToolRailCompact,
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

  // Standard Studio Header dynamic top offset
  const topOffsetClass = !showContextualDock || isMobileTopBarMinimized
    ? 'top-[38px]'
    : 'top-[72px]';

  // Dynamic horizontal position based on Left Sidebar state
  const isLeftSidebarOpen = !isMobileSidebarMinimized;
  const modeRailLeft = isLeftSidebarOpen ? `${leftSidebarWidth}px` : '0px';
  const minimizedTabLeft = isLeftSidebarOpen ? `${leftSidebarWidth + 8}px` : '116px';

  // Rail width based on compact mode toggle
  const railWidthClass = isToolRailCompact ? 'w-[48px]' : 'w-[68px]';

  const renderToolButton = (item: SubToolItem, isActive: boolean, onClick: () => void) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={onClick}
        title={`${item.title} (${item.shortcut})`}
        aria-label={item.label}
        className={`group relative flex items-center justify-center rounded-lg transition-all cursor-pointer active:scale-95 ${
          isToolRailCompact ? 'w-8 h-8 mx-auto' : 'w-full py-1.5 px-1 flex-col'
        } ${
          isActive
            ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
            : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
        }`}
      >
        <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-[#B85F45]' : 'currentColor'} />
        {!isToolRailCompact && (
          <span className="font-medium text-[9px] mt-0.5 leading-tight text-center tracking-tight truncate max-w-full">
            {item.label}
          </span>
        )}

        {/* Hover Tooltip with Name + Shortcut */}
        <div className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover:flex items-center gap-1.5 rounded-md bg-[#23211E] px-2 py-1 text-[10px] font-medium text-white shadow-lg border border-[#FAF8F5]/10 whitespace-nowrap">
          <span>{item.label}</span>
          <span className="text-[#B85F45] font-mono text-[9px]">({item.shortcut})</span>
        </div>
      </button>
    );
  };

  const renderCategoryDivider = (label: string) => {
    return (
      <div className="pt-1.5 pb-0.5">
        <div className="border-t border-[#D8D1C5]" />
        {!isToolRailCompact && (
          <div className="text-[8.5px] font-semibold uppercase tracking-wider text-[#7C7267] text-center pt-1 truncate">
            {label}
          </div>
        )}
      </div>
    );
  };

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
            className="flex items-center gap-1.5 h-[26px] px-3 py-1 bg-[#EBE6DC] hover:bg-[#D8D1C5] border-x border-b border-[#D8D1C5] rounded-b-md shadow-xs text-xs font-semibold text-[#2B2621] active:scale-95 transition-all cursor-pointer"
            title={t.toolModeSidebar.openModes}
          >
            <Columns2 className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[10px] font-semibold">{t.toolModeSidebar.mode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Expanded Vertical Modes Rail (Level 2 Surface) */}
      {!isToolModeMinimized && (
        <aside
          aria-label="Tool Operational Modes"
          style={{ left: modeRailLeft }}
          className={`fixed ${topOffsetClass} bottom-0 z-30 flex flex-col ${railWidthClass} bg-[#EBE6DC] border-r border-[#D8D1C5] shadow-xs select-none pointer-events-auto transition-all duration-200 font-sans`}
        >
          {/* Header Strip with Density & Minimize Toggles */}
          <div className="flex items-center justify-between px-1.5 py-1 border-b border-[#D8D1C5] bg-[#EBE6DC] shrink-0">
            <button
              onClick={toggleToolRailCompact}
              className="p-1 rounded hover:bg-[#D8D1C5] text-[#5A5248] transition-colors cursor-pointer"
              title={isToolRailCompact ? 'Show Tool Labels' : 'Compact Icon Rail'}
            >
              <Columns2 size={13} strokeWidth={1.75} />
            </button>
            <button
              onClick={toggleToolMode}
              className="p-1 rounded hover:bg-[#D8D1C5] text-[#5A5248] transition-colors cursor-pointer"
              title={t.toolModeSidebar.minimizeModes}
            >
              <ChevronLeft size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Vertical Buttons Column with Logical Groupings */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-1 flex flex-col gap-1">
            {/* A. BUILDING & WALLS MODES (Select | Build) */}
            {(activeTool === 'building' || activeTool === 'walls') && (
              <>
                {renderCategoryDivider('Select')}
                {renderToolButton(
                  { id: 'select', label: t.toolModeSidebar.buildingModes.select, icon: MousePointer, title: t.toolModeSidebar.buildingTitles.select, shortcut: '1' },
                  buildingMode === 'select',
                  () => setBuildingMode('select')
                )}

                {renderCategoryDivider('Build')}
                {[
                  { id: 'walls' as BuildingMode, label: t.toolModeSidebar.buildingModes.walls, icon: Pencil, title: t.toolModeSidebar.buildingTitles.walls, shortcut: '2' },
                  { id: 'foundation' as BuildingMode, label: t.toolModeSidebar.buildingModes.foundation, icon: Box, title: t.toolModeSidebar.buildingTitles.foundation, shortcut: '3' },
                  { id: 'stairs' as BuildingMode, label: t.toolModeSidebar.buildingModes.stairs, icon: Footprints, title: t.toolModeSidebar.buildingTitles.stairs, shortcut: '4' },
                  { id: 'fortifications' as BuildingMode, label: t.toolModeSidebar.buildingModes.fortifications, icon: TowerControl, title: t.toolModeSidebar.buildingTitles.fortifications, shortcut: '5' },
                ].map((m) =>
                  renderToolButton(m, (buildingMode || 'walls') === m.id, () => setBuildingMode(m.id))
                )}
              </>
            )}

            {/* B. TERRAIN SCULPT MODES (Sculpt | Refine | Paint) */}
            {activeTool === 'terrain' && (
              <>
                {renderCategoryDivider('Sculpt')}
                {[
                  { id: 'elevate' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.elevate, icon: Mountain, title: t.toolModeSidebar.terrainTitles.elevate, shortcut: '1' },
                  { id: 'plateau' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.plateau, icon: Minus, title: t.toolModeSidebar.terrainTitles.plateau, shortcut: '2' },
                  { id: 'slope' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.slope, icon: ArrowUpRight, title: t.toolModeSidebar.terrainTitles.slope, shortcut: '3' },
                  { id: 'lower' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.lower, icon: TrendingDown, title: t.toolModeSidebar.terrainTitles.lower, shortcut: '4' },
                  { id: 'trench' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.trench, icon: Activity, title: t.toolModeSidebar.terrainTitles.trench, shortcut: '5' },
                ].map((m) =>
                  renderToolButton(m, terrainSubTool === m.id, () => setTerrainSubTool(m.id))
                )}

                {renderCategoryDivider('Refine')}
                {[
                  { id: 'smooth' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.smooth, icon: Waves, title: t.toolModeSidebar.terrainTitles.smooth, shortcut: '6' },
                  { id: 'pond' as TerrainSubTool, label: t.toolModeSidebar.terrainModes.pond, icon: Droplets, title: t.toolModeSidebar.terrainTitles.pond, shortcut: '7' },
                ].map((m) =>
                  renderToolButton(m, terrainSubTool === m.id, () => setTerrainSubTool(m.id))
                )}

                {renderCategoryDivider('Paint')}
                {renderToolButton(
                  { id: 'retexture', label: t.toolModeSidebar.terrainModes.retexture, icon: Paintbrush, title: t.toolModeSidebar.terrainTitles.retexture, shortcut: '8' },
                  terrainSubTool === 'retexture' || terrainSubTool === 'soil',
                  () => setTerrainSubTool('retexture')
                )}
              </>
            )}

            {/* C. TEXTURE MODES (Brush | Erase) */}
            {(activeTool === 'texture' || activeTool === 'paint') && (
              <>
                {renderCategoryDivider('Brush')}
                {renderToolButton(
                  { id: 'paint', label: t.toolModeSidebar.textureModes.paint, icon: Paintbrush, title: t.toolModeSidebar.textureTitles.paint, shortcut: 'B' },
                  paintSubTool === 'paint',
                  () => setPaintSubTool('paint')
                )}
                {renderToolButton(
                  { id: 'fill', label: t.toolModeSidebar.textureModes.fill, icon: Sparkles, title: t.toolModeSidebar.textureTitles.fill, shortcut: 'F' },
                  false,
                  () => {
                    const sel = useEditorStore.getState().selectedTextureId;
                    const meta = getTextureById(sel);
                    const layerIdx = meta ? meta.layerIndex : 0;
                    useTerrainStore.getState().fillPaintTerrain(layerIdx);
                    useEditorStore.getState().setToastMessage(t.toolModeSidebar.textureTitles.fill);
                  }
                )}

                {renderCategoryDivider('Erase')}
                {renderToolButton(
                  { id: 'erase', label: t.toolModeSidebar.textureModes.erase, icon: Eraser, title: t.toolModeSidebar.textureTitles.erase, shortcut: 'E' },
                  paintSubTool === 'erase',
                  () => setPaintSubTool('erase')
                )}
              </>
            )}

            {/* D. FOLIAGE MODES (Scatter | Erase) */}
            {activeTool === 'foliage' && (
              <>
                {renderCategoryDivider('Scatter')}
                {[
                  { id: 'scatter' as const, label: t.toolModeSidebar.foliageModes.scatter, icon: Trees, title: t.toolModeSidebar.foliageTitles.scatter, shortcut: '1' },
                  { id: 'single' as const, label: t.toolModeSidebar.foliageModes.single, icon: Focus, title: t.toolModeSidebar.foliageTitles.single, shortcut: '2' },
                ].map((m) =>
                  renderToolButton(m, foliageSubTool === m.id, () => setFoliageSubTool(m.id))
                )}

                {renderCategoryDivider('Erase')}
                {renderToolButton(
                  { id: 'erase', label: t.toolModeSidebar.foliageModes.erase, icon: Eraser, title: t.toolModeSidebar.foliageTitles.erase, shortcut: 'E' },
                  foliageSubTool === 'erase',
                  () => setFoliageSubTool('erase')
                )}
              </>
            )}

            {/* E. FIGURINES & PROPS (Place | Edit | Erase) */}
            {activeTool === 'prop' && (
              <>
                {renderCategoryDivider('Place')}
                {renderToolButton(
                  { id: 'place', label: t.toolModeSidebar.propModes.place, icon: Pencil, title: t.toolModeSidebar.propTitles.place, shortcut: 'P' },
                  propSubTool === 'place',
                  () => setPropSubTool('place')
                )}

                {renderCategoryDivider('Edit')}
                {[
                  { id: 'select' as const, label: t.toolModeSidebar.propModes.select, icon: MousePointer, title: t.toolModeSidebar.propTitles.select, shortcut: 'S' },
                  { id: 'transform' as const, label: t.toolModeSidebar.propModes.transform, icon: Move, title: t.toolModeSidebar.propTitles.transform, shortcut: 'T' },
                ].map((m) =>
                  renderToolButton(m, propSubTool === m.id, () => setPropSubTool(m.id))
                )}

                {renderCategoryDivider('Erase')}
                {renderToolButton(
                  { id: 'erase', label: t.toolModeSidebar.propModes.erase, icon: Eraser, title: t.toolModeSidebar.propTitles.erase, shortcut: 'E' },
                  propSubTool === 'erase',
                  () => setPropSubTool('erase')
                )}
              </>
            )}

            {/* F. LIGHTING & FIREWORKS (Place | Edit | Erase) */}
            {activeTool === 'lighting' && (
              <>
                {renderCategoryDivider('Place')}
                {renderToolButton(
                  { id: 'place', label: t.toolModeSidebar.lightingModes.place, icon: Pencil, title: t.toolModeSidebar.lightingTitles.place, shortcut: 'P' },
                  lightingSubTool === 'place',
                  () => setLightingSubTool('place')
                )}

                {renderCategoryDivider('Edit')}
                {[
                  { id: 'select' as const, label: t.toolModeSidebar.lightingModes.select, icon: MousePointer, title: t.toolModeSidebar.lightingTitles.select, shortcut: 'S' },
                  { id: 'transform' as const, label: t.toolModeSidebar.lightingModes.transform, icon: Move, title: t.toolModeSidebar.lightingTitles.transform, shortcut: 'T' },
                ].map((m) =>
                  renderToolButton(m, lightingSubTool === m.id, () => setLightingSubTool(m.id))
                )}

                {renderCategoryDivider('Erase')}
                {renderToolButton(
                  { id: 'erase', label: t.toolModeSidebar.lightingModes.erase, icon: Eraser, title: t.toolModeSidebar.lightingTitles.erase, shortcut: 'E' },
                  lightingSubTool === 'erase',
                  () => setLightingSubTool('erase')
                )}
              </>
            )}

            {/* G. VIEW & DIORAMA (Inspect) */}
            {activeTool === 'view' && (
              <>
                {renderCategoryDivider('Inspect')}
                {[
                  { id: 'orbit' as ViewMode, label: t.toolModeSidebar.viewModes.orbit, icon: RotateCw, title: t.toolModeSidebar.viewTitles.orbit, shortcut: '1' },
                  { id: 'turntable' as ViewMode, label: t.toolModeSidebar.viewModes.turntable, icon: RefreshCw, title: t.toolModeSidebar.viewTitles.turntable, shortcut: '2' },
                ].map((m) =>
                  renderToolButton(m, viewMode === m.id, () => setViewMode(m.id))
                )}
              </>
            )}
          </div>
        </aside>
      )}
    </>
  );
};

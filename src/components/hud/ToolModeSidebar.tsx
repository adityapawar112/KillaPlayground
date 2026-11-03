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
} from 'react-icons/tb';
import {
  useEditorStore,
  BuildingMode,
  WallMode,
  SplineMode,
  TerrainSubTool,
  FoliageSubTool,
} from '@/lib/state/useEditorStore';

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
    leftSidebarWidth,
    isMobileSidebarMinimized,
    isToolModeMinimized,
    toggleToolMode,
    showContextualDock,
    isMobileTopBarMinimized,
  } = useEditorStore();

  // Only render when the active tool has distinct operational modes
  if (!['building', 'walls', 'terrain', 'texture', 'paint', 'foliage', 'prop'].includes(activeTool)) {
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
            left: isMobileSidebarMinimized ? '114px' : `${leftSidebarWidth + 8}px`,
          }}
          className={`fixed z-30 pointer-events-auto transition-all duration-200 ${topOffsetClass}`}
        >
          <button
            onClick={toggleToolMode}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#E4D8CB] border-x border-b border-[#CDBCAB] rounded-b-lg shadow-sm text-xs font-semibold text-[#4B382C] active:scale-95 transition-transform cursor-pointer"
            title="Open Tool Modes"
          >
            <TbPointer className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[11px] font-bold">Modes</span>
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
          className={`fixed bottom-0 z-20 flex flex-col w-[68px] bg-[#F3EBE0] border-r border-[#CDBCAB] shadow-md select-none pointer-events-auto transition-all duration-200 ${topOffsetClass}`}
        >
          {/* Header with Title and Minimize Button */}
          <div className="flex items-center justify-between p-2 border-b border-[#D8C7B5] shrink-0 bg-[#ECE2D5]/70">
            <span className="text-[9px] font-bold text-[#8D7666] uppercase tracking-wider">
              Mode
            </span>
            <button
              onClick={toggleToolMode}
              className="p-1 rounded hover:bg-[#D8C7B5] text-[#5C4638] transition-colors cursor-pointer"
              title="Minimize Modes Panel"
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
                  { id: 'select' as BuildingMode, label: 'Select', icon: TbPointer, title: 'Select fort walls, bastions, foundations, and stairs' },
                  { id: 'walls' as BuildingMode, label: 'Walls', icon: TbPencil, title: 'Click on terrain to draft perimeter wall circuit' },
                  { id: 'foundation' as BuildingMode, label: 'Foundation', icon: TbBox, title: 'Click and drag across terrain to build stone foundation slabs' },
                  { id: 'stairs' as BuildingMode, label: 'Stairs', icon: TbStairs, title: 'Click along slopes to build stone staircases' },
                  { id: 'fortifications' as BuildingMode, label: 'Fortify', icon: TbTower, title: 'Place towers, bastions, and arched gateways along walls' },
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
                      <span className="font-bold text-[10px] mt-1 leading-tight">
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
                  { id: 'elevate' as TerrainSubTool, label: 'Peak', icon: TbMountain, title: 'Elevate mountain peaks' },
                  { id: 'plateau' as TerrainSubTool, label: 'Plateau', icon: TbMinus, title: 'Flatten level tableland' },
                  { id: 'slope' as TerrainSubTool, label: 'Ramp', icon: TbArrowUpRight, title: 'Carve linear slopes' },
                  { id: 'lower' as TerrainSubTool, label: 'Gorge', icon: TbTrendingDown, title: 'Excavate valleys and ravines' },
                  { id: 'trench' as TerrainSubTool, label: 'Trench', icon: TbWaveSine, title: 'Cut narrow defensive moats' },
                  { id: 'smooth' as TerrainSubTool, label: 'Smooth', icon: TbRipple, title: 'Smooth rough jagged terrain' },
                  { id: 'pond' as TerrainSubTool, label: 'Pond', icon: TbDropletHalf2, title: 'Dig cisterns and water bodies' },
                  { id: 'retexture' as TerrainSubTool, label: 'Retexture', icon: TbBrush, title: 'Paint natural soil and rock surface' },
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
                      <span className="font-bold text-[9px] mt-1 leading-tight">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {/* D. TEXTURE MODES: Paint | Erase */}
            {(activeTool === 'texture' || activeTool === 'paint') && (
              <>
                {[
                  { id: 'paint' as const, label: 'Paint', icon: TbBrush, title: 'Paint selected texture onto terrain' },
                  { id: 'erase' as const, label: 'Erase', icon: TbEraser, title: 'Restore base laterite soil' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = paintSubTool === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaintSubTool(m.id)}
                      title={m.title}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
                          : 'bg-[#FAF8F5] text-[#5C4638] border border-[#D9C9B4] hover:bg-[#EADECF]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
                      <span className="font-bold text-[10px] mt-1 leading-tight">
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
                  { id: 'scatter' as const, label: 'Scatter', icon: TbTrees, title: 'Scatter brush - drag to paint nature flora' },
                  { id: 'single' as const, label: 'Single', icon: TbFocus2, title: 'Single plant - click to place hero specimen' },
                  { id: 'erase' as const, label: 'Erase', icon: TbEraser, title: 'Prune / Erase - drag to remove foliage' },
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
                      <span className="font-bold text-[9px] mt-1 leading-tight">
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
                  { id: 'place' as const, label: 'Place', icon: TbPencil, title: 'Click on terrain or fort walls to place figurines' },
                  { id: 'select' as const, label: 'Select', icon: TbPointer, title: 'Click placed figurines to inspect, duplicate, or delete' },
                  { id: 'transform' as const, label: 'Transform', icon: TbArrowsMove, title: 'Nudge, rotate, and scale selected figurine' },
                  { id: 'erase' as const, label: 'Erase', icon: TbEraser, title: 'Click placed figurines to remove them from diorama' },
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
                      <span className="font-bold text-[9px] mt-1 leading-tight">
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

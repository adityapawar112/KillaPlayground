'use client';

import React from 'react';
import {
  TbPointer,
  TbPencil,
  TbTower,
  TbArrowsMove,
  TbMountain,
  TbMinus,
  TbArrowUpRight,
  TbTrendingDown,
  TbWaveSine,
  TbRipple,
  TbDropletHalf2,
  TbBrush,
  TbChevronLeft,
  TbChevronDown,
} from 'react-icons/tb';
import {
  useEditorStore,
  WallMode,
  SplineMode,
  TerrainSubTool,
} from '@/lib/state/useEditorStore';

export const ToolModeSidebar: React.FC = () => {
  const {
    activeTool,
    wallMode,
    setWallMode,
    splineMode,
    setSplineMode,
    terrainSubTool,
    setTerrainSubTool,
    leftSidebarWidth,
    isMobileSidebarMinimized,
    isToolModeMinimized,
    toggleToolMode,
    showContextualDock,
    isMobileTopBarMinimized,
  } = useEditorStore();

  // Only render when the active tool has distinct operational modes
  if (!['walls', 'spline', 'terrain'].includes(activeTool)) {
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
            {/* A. WALL MODES: Select | Draw | Fortify */}
            {activeTool === 'walls' && (
              <>
                {[
                  { id: 'select' as WallMode, label: 'Select', icon: TbPointer, title: 'Select fort walls, bastions, and gates' },
                  { id: 'draw' as WallMode, label: 'Draw', icon: TbPencil, title: 'Click on terrain to draft perimeter wall path' },
                  { id: 'fortify' as WallMode, label: 'Fortify', icon: TbTower, title: 'Place towers, bastions, and arched gateways' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = wallMode === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setWallMode(m.id)}
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

            {/* B. SPLINE MODES: Select | Draw | Transform */}
            {activeTool === 'spline' && (
              <>
                {[
                  { id: 'select' as SplineMode, label: 'Select', icon: TbPointer, title: 'Click to select and inspect placed spline paths' },
                  { id: 'draw' as SplineMode, label: 'Draw', icon: TbPencil, title: 'Click on terrain to draft step, flag, or diya paths' },
                  { id: 'transform' as SplineMode, label: 'Transform', icon: TbArrowsMove, title: 'Select and move, rotate, or scale paths' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = splineMode === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setSplineMode(m.id)}
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
          </div>
        </aside>
      )}
    </>
  );
};

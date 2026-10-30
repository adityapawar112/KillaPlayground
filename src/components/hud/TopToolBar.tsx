'use client';

import React from 'react';
import {
  TbMountain,
  TbBuildingFortress,
  TbRoute,
  TbBrush,
  TbTrees,
  TbUsersGroup,
  TbShovel,
  TbDropletHalf2,
  TbLayersSubtract,
  TbSun,
  TbFocus2,
  TbZoomIn,
  TbZoomOut,
  TbChevronUp,
  TbChevronDown,
  TbCamera,
} from 'react-icons/tb';
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ToolDef {
  id: ToolType;
  key: string;
  icon: React.ElementType;
}

// 6 Primary Killa-First Construction Tools
const PRIMARY_KILLA_TOOLS: ToolDef[] = [
  { id: 'terrain', key: '1', icon: TbMountain },
  { id: 'walls', key: '2', icon: TbBuildingFortress },
  { id: 'spline', key: '3', icon: TbRoute },
  { id: 'paint', key: '4', icon: TbBrush },
  { id: 'foliage', key: '5', icon: TbTrees },
  { id: 'prop', key: '6', icon: TbUsersGroup },
];

// Soil Pipeline Tools
const SECONDARY_SOIL_TOOLS: ToolDef[] = [
  { id: 'soil', key: '7', icon: TbShovel },
  { id: 'water', key: '8', icon: TbDropletHalf2 },
  { id: 'shape_side', key: '9', icon: TbLayersSubtract },
  { id: 'dry', key: '0', icon: TbSun },
];

export const TopToolBar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    showContextualDock,
    isMobileTopBarMinimized,
    toggleMobileTopBar,
    setCameraViewPreset,
    isRightSidebarMinimized,
    rightSidebarWidth,
  } = useEditorStore();
  const { t } = useTranslation();

  if (!showContextualDock) return null;

  // Right sidebar is present for walls, spline, and prop (not terrain)
  const isRightSidebarActive = activeTool !== 'terrain';
  const isRightPanelOpen = isRightSidebarActive && !isRightSidebarMinimized;
  const isOutlinerTabPresent = isRightSidebarActive && isRightSidebarMinimized;

  // Position Tools & Views tab so it NEVER overlaps Right Sidebar or Outliner tab
  const toolsAndViewsRight = isRightPanelOpen
    ? `${rightSidebarWidth + 8}px`
    : isOutlinerTabPresent
    ? '104px'
    : '8px';

  const toolDetails: Record<
    ToolType | 'shape_side',
    { label: string; fullLabel: string; desc: string }
  > = {
    terrain: (t.tools as any).terrain || { label: 'Terrain', fullLabel: 'Terrain Sculpt', desc: 'Sculpt mountain peaks, slopes & ponds' },
    walls: (t.tools as any).walls || { label: 'Walls', fullLabel: 'Fort Walls', desc: 'Draw perimeter walls and bastions' },
    spline: t.tools.spline,
    paint: t.tools.paint,
    foliage: (t.tools as any).foliage || t.tools.grass,
    prop: t.tools.prop,
    soil: t.tools.soil,
    water: t.tools.water,
    shape: t.tools.shape,
    shape_side: t.tools.shape,
    shape_top: t.tools.shape,
    dry: (t.tools as any).dry || { label: 'Dry', fullLabel: 'Drying Tool', desc: 'Dries and solidifies shaped mud' },
    grass: t.tools.grass,
  };

  const isToolActive = (toolId: ToolType) =>
    activeTool === toolId ||
    (toolId === 'shape_side' &&
      (activeTool === 'shape_side' || activeTool === 'shape_top' || activeTool === 'shape')) ||
    (toolId === 'grass' && activeTool === 'foliage');

  // Desktop tool button (key badge + icon + label)
  const renderDesktopToolButton = (tool: ToolDef) => {
    const Icon = tool.icon;
    const details = toolDetails[tool.id];
    const active = isToolActive(tool.id);

    return (
      <button
        key={tool.id}
        onClick={() => setActiveTool(tool.id)}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer select-none shrink-0 ${
          active
            ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
            : 'text-[#5C4638] hover:bg-[#D8C7B5] hover:text-[#2B1E16]'
        }`}
        title={`${details?.fullLabel || details?.label} (${tool.key}) - ${details?.desc}`}
      >
        <span
          className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded leading-none ${
            active ? 'bg-black/35 text-[#F59E0B]' : 'bg-[#DCCEC0] text-[#7A6454]'
          }`}
        >
          {tool.key}
        </span>
        <Icon className={`w-4 h-4 ${active ? 'text-[#FAF8F5]' : 'text-[#4B382C]'}`} />
        <span className="tracking-tight text-[11.5px] whitespace-nowrap">
          {details?.label}
        </span>
      </button>
    );
  };

  // Mobile symbol-only tool button (no text label)
  const renderMobileSymbolButton = (tool: ToolDef) => {
    const Icon = tool.icon;
    const details = toolDetails[tool.id];
    const active = isToolActive(tool.id);

    return (
      <button
        key={tool.id}
        onClick={() => setActiveTool(tool.id)}
        className={`relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 cursor-pointer select-none shrink-0 ${
          active
            ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
            : 'text-[#5C4638] bg-[#E2D5C6] hover:bg-[#D8C7B5]'
        }`}
        title={`${details?.fullLabel || details?.label} (${tool.key})`}
      >
        <Icon className={`w-4 h-4 ${active ? 'text-[#F59E0B]' : 'text-[#4B382C]'}`} />
      </button>
    );
  };

  return (
    <>
      {/* Minimized Toggle Pill: Dynamic right offset to prevent overlap */}
      {isMobileTopBarMinimized && (
        <div
          style={{ right: toolsAndViewsRight }}
          className="fixed top-[41px] z-30 pointer-events-auto transition-all duration-200"
        >
          <button
            onClick={toggleMobileTopBar}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#E4D8CB] border-x border-b border-[#CDBCAB] rounded-b-lg shadow-sm text-xs font-semibold text-[#4B382C] active:scale-95 transition-transform cursor-pointer"
            title="Show Tools & Camera"
          >
            <TbMountain className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[11px] font-bold">Tools & Views</span>
            <TbChevronDown className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Main Secondary Bar */}
      <nav
        aria-label="Top Tool Modes"
        className={`fixed top-[41px] left-0 right-0 z-30 bg-[#E4D8CB] border-b border-[#CDBCAB] shadow-xs select-none pointer-events-auto transition-transform duration-200 ${
          isMobileTopBarMinimized ? 'hidden' : 'flex flex-col xl:flex-row'
        }`}
      >
        {/* ======================================================== */}
        {/* A. COMPACT / SYMBOLS-ONLY VIEW (< xl)                    */}
        {/* ======================================================== */}
        <div className="flex xl:hidden flex-col gap-1 p-1.5 w-full">
          {/* Row 1: All 10 Tools (symbols only) + Minimize Button */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              {PRIMARY_KILLA_TOOLS.map(renderMobileSymbolButton)}
              <div className="w-[1.5px] h-4 bg-[#C5B3A1] mx-0.5 shrink-0" />
              {SECONDARY_SOIL_TOOLS.map(renderMobileSymbolButton)}
            </div>
            {/* Minimize Chevron */}
            <button
              onClick={toggleMobileTopBar}
              className="p-1 rounded-md bg-[#DCCEC0] hover:bg-[#D0BFB0] text-[#4B382C] shrink-0 ml-1 cursor-pointer"
              title="Minimize Top Bar"
            >
              <TbChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 2: Camera View Axis Presets & Zoom Controls */}
          <div className="flex items-center gap-1 pt-1 border-t border-[#CDBCAB]/70 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-[#7A6454] mr-0.5 flex items-center gap-0.5">
              <TbCamera className="w-3 h-3 text-[#8F4938]" />
            </span>

            {/* Top View (Z - Blue) */}
            <button
              onClick={() => setCameraViewPreset('top')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title="Top View (Z / 7)"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[9px] font-black">
                Z
              </span>
            </button>

            {/* Front View (Y - Green) */}
            <button
              onClick={() => setCameraViewPreset('front')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title="Front View (Y / 1)"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[9px] font-black">
                Y
              </span>
            </button>

            {/* Side View (X - Red) */}
            <button
              onClick={() => setCameraViewPreset('side')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title="Side View (X / 3)"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[9px] font-black">
                X
              </span>
            </button>

            {/* Center / Focus (Home) */}
            <button
              onClick={() => setCameraViewPreset('reset')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title="Center View (Home / F)"
            >
              <TbFocus2 className="w-3.5 h-3.5 text-[#B85F45]" />
            </button>

            <div className="w-[1px] h-3.5 bg-[#C5B3A1] mx-0.5 shrink-0" />

            {/* Zoom In */}
            <button
              onClick={() => setCameraViewPreset('zoom_in')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title="Zoom In (+ / Q)"
            >
              <TbZoomIn className="w-3.5 h-3.5 text-[#4B382C]" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => setCameraViewPreset('zoom_out')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title="Zoom Out (- / E)"
            >
              <TbZoomOut className="w-3.5 h-3.5 text-[#4B382C]" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* B. DESKTOP VIEW: SINGLE ROW WITH LABELS & CAMERA (>= xl) */}
        {/* ======================================================== */}
        <div className="hidden xl:flex h-10 px-3 w-full items-center justify-between gap-2 overflow-x-auto">
          {/* Left: Tools */}
          <div className="flex items-center gap-1 shrink-0">
            {PRIMARY_KILLA_TOOLS.map(renderDesktopToolButton)}
            <div className="w-[1.5px] h-5 bg-[#C5B3A1] mx-1 shrink-0" />
            {SECONDARY_SOIL_TOOLS.map(renderDesktopToolButton)}
          </div>

          {/* Right: Camera & Viewport Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Camera View Axis Presets */}
            <div className="flex items-center bg-[#EADECF] rounded-lg p-0.5 border border-[#D9C9B4]">
              {/* Top View (Z) */}
              <button
                onClick={() => setCameraViewPreset('top')}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#DFCDBD] text-xs font-semibold text-[#2B1E16] transition-colors cursor-pointer"
                title="Top View (Z / Numpad 7)"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[9px] font-black">
                  Z
                </span>
                <span className="text-[11px]">Top</span>
              </button>

              {/* Front View (Y) */}
              <button
                onClick={() => setCameraViewPreset('front')}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#DFCDBD] text-xs font-semibold text-[#2B1E16] transition-colors cursor-pointer"
                title="Front View (Y / Numpad 1)"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[9px] font-black">
                  Y
                </span>
                <span className="text-[11px]">Front</span>
              </button>

              {/* Side View (X) */}
              <button
                onClick={() => setCameraViewPreset('side')}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#DFCDBD] text-xs font-semibold text-[#2B1E16] transition-colors cursor-pointer"
                title="Side View (X / Numpad 3)"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[9px] font-black">
                  X
                </span>
                <span className="text-[11px]">Side</span>
              </button>

              {/* Center / Focus */}
              <button
                onClick={() => setCameraViewPreset('reset')}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#DFCDBD] text-xs font-semibold text-[#2B1E16] transition-colors cursor-pointer"
                title="Center / Focus (Home / F)"
              >
                <TbFocus2 className="w-3.5 h-3.5 text-[#B85F45]" />
                <span className="text-[11px]">Center</span>
              </button>
            </div>

            {/* Zoom In & Out */}
            <div className="flex items-center bg-[#EADECF] rounded-lg p-0.5 border border-[#D9C9B4]">
              <button
                onClick={() => setCameraViewPreset('zoom_in')}
                className="p-1 rounded hover:bg-[#DFCDBD] text-[#4B382C] transition-colors cursor-pointer"
                title="Zoom In (+ / Q)"
              >
                <TbZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCameraViewPreset('zoom_out')}
                className="p-1 rounded hover:bg-[#DFCDBD] text-[#4B382C] transition-colors cursor-pointer"
                title="Zoom Out (- / E)"
              >
                <TbZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Minimize Desktop Top Bar Button */}
            <div className="w-[1.5px] h-4 bg-[#C5B3A1] mx-0.5" />
            <button
              onClick={toggleMobileTopBar}
              className="p-1 rounded hover:bg-[#DFCDBD] text-[#4B382C] transition-colors cursor-pointer"
              title="Minimize Secondary Top Bar"
            >
              <TbChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

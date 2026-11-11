'use client';

import React from 'react';
import {
  Mountain,
  Castle,
  Layers,
  Trees,
  Users,
  Flame,
  Eye,
  Shovel,
  Droplets,
  Sun,
  Focus,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  Camera,
} from 'lucide-react';
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ToolDef {
  id: ToolType;
  key: string;
  icon: React.ElementType;
}

// 7 Primary Killa-First Construction Tools (Tickets 10 & 11)
const PRIMARY_KILLA_TOOLS: ToolDef[] = [
  { id: 'terrain', key: '1', icon: Mountain },
  { id: 'building', key: '2', icon: Castle },
  { id: 'texture', key: '3', icon: Layers },
  { id: 'foliage', key: '4', icon: Trees },
  { id: 'prop', key: '5', icon: Users },
  { id: 'lighting', key: '6', icon: Flame },
  { id: 'view', key: '7', icon: Eye },
];

// Soil Pipeline Tools
const SECONDARY_SOIL_TOOLS: ToolDef[] = [
  { id: 'soil', key: '7', icon: Shovel },
  { id: 'water', key: '8', icon: Droplets },
  { id: 'shape_side', key: '9', icon: Layers },
  { id: 'dry', key: '0', icon: Sun },
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
    ? '150px'
    : '8px';

  const toolDetails: Record<
    ToolType | 'shape_side',
    { label: string; fullLabel: string; desc: string }
  > = {
    terrain: (t.tools as any).terrain || { label: 'Terrain', fullLabel: 'Terrain Sculpt', desc: 'Sculpt mountain peaks, slopes & ponds' },
    building: (t.tools as any).building || { label: 'Building', fullLabel: 'Fort Architecture', desc: 'Construct fort walls, foundations, stairs, and bastions' },
    walls: (t.tools as any).building || (t.tools as any).walls || { label: 'Building', fullLabel: 'Fort Architecture', desc: 'Construct fort walls, foundations, stairs, and bastions' },
    spline: (t.tools as any).spline || { label: 'Spline', fullLabel: 'Paths', desc: 'Draft linear paths' },
    texture: (t.tools as any).texture || { label: 'Texture', fullLabel: 'Texture Studio', desc: 'Paint surface textures on terrain' },
    paint: { label: 'Paint', fullLabel: 'Structure Paint', desc: 'Paint structures using a brush with authentic pigments' },
    foliage: (t.tools as any).foliage || t.tools.grass,
    prop: t.tools.prop,
    lighting: (t.tools as any).lighting || { label: 'Lighting', fullLabel: 'Festive Lighting', desc: 'Diyas, oil lamps, cone fountains & fireworks' },
    view: (t.tools as any).view || { label: 'View', fullLabel: 'Diorama & Sun View', desc: 'Inspect diorama, time of day & celestial lighting angle' },
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
    (toolId === 'building' && (activeTool === 'building' || activeTool === 'walls')) ||
    (toolId === 'walls' && (activeTool === 'building' || activeTool === 'walls')) ||
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
        className={`relative flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer select-none shrink-0 ${
          active
            ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
            : 'text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
        }`}
        title={`${details?.fullLabel || details?.label} (${tool.key}) - ${details?.desc}`}
      >
        <span
          className={`text-[9px] font-mono font-semibold tabular-nums px-1 py-0.2 rounded leading-none ${
            active ? 'bg-black/40 text-[#B85F45]' : 'bg-[#D8D1C5] text-[#5A5248]'
          }`}
        >
          {tool.key}
        </span>
        <Icon size={15} strokeWidth={1.75} className={active ? 'text-[#FAF8F5]' : 'currentColor'} />
        <span className="tracking-tight text-[11px] whitespace-nowrap">
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
        className={`relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 cursor-pointer select-none shrink-0 ${
          active
            ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs ring-1 ring-[#1C1815]'
            : 'text-[#5A5248] bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5]'
        }`}
        title={`${details?.fullLabel || details?.label} (${tool.key})`}
      >
        <Icon size={16} strokeWidth={1.75} className={active ? 'text-[#B85F45]' : 'text-[#2B2621]'} />
      </button>
    );
  };

  return (
    <>
      {/* Minimized Toggle Pill: Dynamic right offset to prevent overlap */}
      {isMobileTopBarMinimized && (
        <div
          style={{ right: toolsAndViewsRight }}
          className="fixed top-[38px] z-30 pointer-events-auto transition-all duration-200 font-sans"
        >
          <button
            onClick={toggleMobileTopBar}
            className="flex items-center gap-1.5 h-[26px] px-3 py-1 bg-[#EBE6DC] hover:bg-[#D8D1C5] border-x border-b border-[#D8D1C5] rounded-b-md shadow-xs text-xs font-semibold text-[#2B2621] active:scale-95 transition-all cursor-pointer"
            title={t.topToolBar.showToolsCamera}
          >
            <Mountain size={13} strokeWidth={1.75} className="text-[#B85F45]" />
            <span className="text-[10px] font-semibold">{t.topToolBar.toolsAndViews}</span>
            <ChevronDown size={13} strokeWidth={1.75} className="text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Main Secondary Bar (Level 2 Surface - Row 2: 34px) */}
      <nav
        aria-label="Top Tool Modes"
        className={`fixed top-[38px] left-0 right-0 z-30 bg-[#EBE6DC] border-b border-[#D8D1C5] shadow-xs select-none pointer-events-auto transition-transform duration-200 font-sans ${
          isMobileTopBarMinimized ? 'hidden' : 'flex flex-col xl:flex-row'
        }`}
      >
        {/* ======================================================== */}
        {/* A. COMPACT / SYMBOLS-ONLY VIEW (< xl)                    */}
        {/* ======================================================== */}
        <div className="flex xl:hidden flex-col gap-1 p-1.5 w-full">
          {/* Row 1: All Tools (symbols only) + Minimize Button */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              {PRIMARY_KILLA_TOOLS.map(renderMobileSymbolButton)}
            </div>
            {/* Minimize Chevron */}
            <button
              onClick={toggleMobileTopBar}
              className="p-1 rounded-md bg-[#FAF8F5] hover:bg-[#D8D1C5] text-[#2B2621] border border-[#D8D1C5] shrink-0 ml-1 cursor-pointer"
              title={t.topToolBar.minimizeTopBar}
            >
              <ChevronUp size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Row 2: Camera View Axis Presets & Zoom Controls */}
          <div className="flex items-center gap-1 pt-1 border-t border-[#D8D1C5]/70 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-medium text-[#7C7267] mr-0.5 flex items-center gap-0.5">
              <Camera size={13} strokeWidth={1.75} className="text-[#B85F45]" />
            </span>

            {/* Top View (Z - Blue) */}
            <button
              onClick={() => setCameraViewPreset('top')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title={`${t.topToolBar.top} (Z / 7)`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[9px] font-black">
                Z
              </span>
            </button>

            {/* Front View (Y - Green) */}
            <button
              onClick={() => setCameraViewPreset('front')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title={`${t.topToolBar.front} (Y / 1)`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[9px] font-black">
                Y
              </span>
            </button>

            {/* Side View (X - Red) */}
            <button
              onClick={() => setCameraViewPreset('side')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title={`${t.topToolBar.side} (X / 3)`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[9px] font-black">
                X
              </span>
            </button>

            {/* Center / Focus (Home) */}
            <button
              onClick={() => setCameraViewPreset('reset')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title={`${t.topToolBar.center} (Home / F)`}
            >
              <Focus size={14} strokeWidth={1.75} className="text-[#B85F45]" />
            </button>

            <div className="w-[1px] h-3.5 bg-[#D8D1C5] mx-0.5 shrink-0" />

            {/* Zoom In */}
            <button
              onClick={() => setCameraViewPreset('zoom_in')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title={`${t.topToolBar.zoomIn} (+ / Q)`}
            >
              <ZoomIn size={14} strokeWidth={1.75} className="text-[#2B2621]" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => setCameraViewPreset('zoom_out')}
              className="w-6 h-6 rounded-md bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              title={`${t.topToolBar.zoomOut} (- / E)`}
            >
              <ZoomOut size={14} strokeWidth={1.75} className="text-[#2B2621]" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* B. DESKTOP VIEW: SINGLE ROW WITH LABELS & CAMERA (>= xl) */}
        {/* ======================================================== */}
        <div className="hidden xl:flex h-[34px] px-3 w-full items-center justify-between gap-2 overflow-x-auto font-sans">
          {/* Left: Workspace Tool Tabs */}
          <div className="flex items-center gap-1 shrink-0">
            {PRIMARY_KILLA_TOOLS.map(renderDesktopToolButton)}
          </div>

          {/* Right: Camera & Viewport Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Camera View Axis Presets */}
            <div className="flex items-center bg-[#FAF8F5] rounded-md p-0.5 border border-[#D8D1C5]">
              {/* Top View (Z) */}
              <button
                onClick={() => setCameraViewPreset('top')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:bg-[#D8D1C5] text-xs font-semibold text-[#2B2621] transition-colors cursor-pointer"
                title={`${t.topToolBar.top} (Z / Numpad 7)`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[9px] font-black">
                  Z
                </span>
                <span className="text-[10px]">{t.topToolBar.top}</span>
              </button>

              {/* Front View (Y) */}
              <button
                onClick={() => setCameraViewPreset('front')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:bg-[#D8D1C5] text-xs font-semibold text-[#2B2621] transition-colors cursor-pointer"
                title={`${t.topToolBar.front} (Y / Numpad 1)`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[9px] font-black">
                  Y
                </span>
                <span className="text-[10px]">{t.topToolBar.front}</span>
              </button>

              {/* Side View (X) */}
              <button
                onClick={() => setCameraViewPreset('side')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:bg-[#D8D1C5] text-xs font-semibold text-[#2B2621] transition-colors cursor-pointer"
                title={`${t.topToolBar.side} (X / Numpad 3)`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[9px] font-black">
                  X
                </span>
                <span className="text-[10px]">{t.topToolBar.side}</span>
              </button>

              {/* Center / Focus */}
              <button
                onClick={() => setCameraViewPreset('reset')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:bg-[#D8D1C5] text-xs font-semibold text-[#2B2621] transition-colors cursor-pointer"
                title={`${t.topToolBar.center} (Home / F)`}
              >
                <Focus size={13} strokeWidth={1.75} className="text-[#B85F45]" />
                <span className="text-[10px]">{t.topToolBar.center}</span>
              </button>
            </div>

            {/* Zoom In & Out */}
            <div className="flex items-center bg-[#FAF8F5] rounded-md p-0.5 border border-[#D8D1C5]">
              <button
                onClick={() => setCameraViewPreset('zoom_in')}
                className="p-0.5 rounded-sm hover:bg-[#D8D1C5] text-[#2B2621] transition-colors cursor-pointer"
                title={`${t.topToolBar.zoomIn} (+ / Q)`}
              >
                <ZoomIn size={13} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setCameraViewPreset('zoom_out')}
                className="p-0.5 rounded-sm hover:bg-[#D8D1C5] text-[#2B2621] transition-colors cursor-pointer"
                title={`${t.topToolBar.zoomOut} (- / E)`}
              >
                <ZoomOut size={13} strokeWidth={1.75} />
              </button>
            </div>

            {/* Minimize Desktop Top Bar Button */}
            <div className="w-[1px] h-4 bg-[#D8D1C5] mx-0.5" />
            <button
              onClick={toggleMobileTopBar}
              className="p-1 rounded-md hover:bg-[#D8D1C5] text-[#5A5248] hover:text-[#2B2621] transition-colors cursor-pointer"
              title={t.topToolBar.minimizeTopBar}
            >
              <ChevronUp size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TbMountain,
  TbTrendingDown,
  TbMinus,
  TbWaveSine,
  TbRipple,
  TbArrowUpRight,
  TbBrush,
  TbCheck,
  TbSparkles,
  TbPlant2,
  TbArrowsLeft,
  TbArrowsRight,
  TbArrowDownBar,
  TbLock,
  TbSun,
  TbBuildingFortress,
  TbRoute,
  TbUsersGroup,
  TbDropletHalf2,
  TbLayersSubtract,
  TbAdjustmentsHorizontal,
  TbChevronLeft,
  TbChevronDown,
  TbPointer,
  TbPencil,
  TbDoorEnter,
  TbTower,
  TbTrash,
  TbRuler2,
  TbPlus,
  TbShieldCheck,
} from 'react-icons/tb';
import { useEditorStore, BrushSizeType, ToolType, TerrainSubTool } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PAINT_COLORS } from '@/lib/constants/tokens';
import { calculateWallTotalLength } from '@/lib/walls/wallGeometry';

const STORAGE_WIDTH_KEY = 'killa_sidebar_width_v1';

export const LeftToolSidebar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    shapeSubTool,
    setShapeSubTool,
    terrainSubTool,
    setTerrainSubTool,
    plateauHeight,
    setPlateauHeight,
    slopeAngle,
    setSlopeAngle,
    slopeAlignment,
    setSlopeAlignment,
    slopeIncline,
    setSlopeIncline,
    foliageSubTool,
    setFoliageSubTool,
    brushRadius,
    setBrushRadius,
    brushStrength,
    setBrushStrength,
    brushSize,
    setBrushSize,
    steadyHand,
    setSteadyHand,
    paintColor,
    setPaintColor,
    waterMode,
    setWaterMode,
    mudLocked,
    setMudLocked,
    showLeftToolbar,
    showContextualDock,
    isMobileSidebarMinimized,
    toggleMobileSidebar,
    isMobileTopBarMinimized,
    setPropDrawerOpen,
    walls,
    activeWallDraft,
    wallSettings,
    wallSubTool,
    selectedWallId,
    setSelectedWallId,
    wallStep,
    setWallStep,
    activeStamp,
    setActiveStamp,
    citadelKeeps,
    addCitadelKeep,
    updateCitadelKeep,
    removeCitadelKeep,
    selectedComponent,
    setSelectedComponent,
    toggleGrandBastionOnNode,
    toggleBastionOnNode,
    updateGateProperties,
    removeGateFromWall,
    startNewWallCircuit,
    proceedToFortify,
    solidifyCurrentWall,
    removeWall,
    setToastMessage,
    setWallSettings,
    setWallSubTool,
    finishCurrentWall,
    cancelCurrentWall,
    clearAllWalls,
  } = useEditorStore();

  const { t } = useTranslation();

  // Floating cursor toast notification for disabled buttons/properties
  const [cursorToast, setCursorToast] = useState<{
    message: string;
    x: number;
    y: number;
  } | null>(null);
  const cursorToastTimer = useRef<NodeJS.Timeout | null>(null);

  const showCursorToast = (e: React.MouseEvent | null, message: string) => {
    if (cursorToastTimer.current) {
      clearTimeout(cursorToastTimer.current);
    }
    const x = e ? e.clientX : 320;
    const y = e ? e.clientY : 300;
    setCursorToast({ message, x, y });
    cursorToastTimer.current = setTimeout(() => {
      setCursorToast(null);
    }, 2800);
    setToastMessage(message);
  };

  // Adjustable Width State (default: 290px, min: 230px, max: 460px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(290);
  const isDraggingWidthRef = useRef(false);

  // Load user saved layout preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedW = localStorage.getItem(STORAGE_WIDTH_KEY);
        if (savedW) {
          const parsedW = parseInt(savedW, 10);
          if (parsedW >= 230 && parsedW <= 460) setSidebarWidth(parsedW);
        }
      } catch {
        // Fallback to defaults
      }
    }
  }, []);

  // Handle Width Resize
  const handleWidthMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingWidthRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingWidthRef.current) return;
      const newWidth = Math.max(230, Math.min(460, moveEvent.clientX));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingWidthRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      try {
        setSidebarWidth((curr) => {
          localStorage.setItem(STORAGE_WIDTH_KEY, curr.toString());
          return curr;
        });
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!showLeftToolbar) return null;

  return (
    <>
      {/* Minimized Properties Button (< xl): Pinned to the LEFT side, hanging off top bar or secondary toolbar */}
      {isMobileSidebarMinimized && (
        <div
          className={`xl:hidden fixed left-2 z-30 pointer-events-auto transition-all duration-200 ${
            !showContextualDock || isMobileTopBarMinimized ? 'top-[41px]' : 'top-[112px]'
          }`}
        >
          <button
            onClick={toggleMobileSidebar}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#E4D8CB] border-x border-b border-[#CDBCAB] rounded-b-lg shadow-sm text-xs font-semibold text-[#4B382C] active:scale-95 transition-transform cursor-pointer"
            title="Open Tool Properties"
          >
            <TbAdjustmentsHorizontal className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[11px] font-bold">Properties</span>
            <TbChevronDown className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      <aside
        aria-label="Editor Sidebar"
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed left-0 bottom-0 z-20 flex flex-col bg-[#F3EBE0] border-r border-[#CDBCAB] shadow-lg select-none pointer-events-auto transition-all duration-200 max-w-[85vw] ${
          isMobileSidebarMinimized ? '-translate-x-full xl:translate-x-0' : 'translate-x-0'
        } ${
          !showContextualDock
            ? 'top-[41px]'
            : isMobileTopBarMinimized
            ? 'top-[41px]'
            : 'top-[112px] xl:top-[81px]'
        }`}
      >
        {/* Tool Header (Top of Sidebar) */}
        <div className="flex items-center justify-between p-3 border-b border-[#D8C7B5] shrink-0 bg-[#ECE2D5]/70">
          <div className="flex items-center gap-1.5 text-[#4B382C]">
            <TbAdjustmentsHorizontal className="w-4 h-4 text-[#8F4938]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Tool Properties
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E4D8CB] text-[#5C4638] uppercase">
              {activeTool}
            </span>
            {/* Minimize Option (< xl) */}
            <button
              onClick={toggleMobileSidebar}
              className="xl:hidden p-1 rounded-md bg-[#FAF8F5] text-[#5C4638] hover:bg-[#DCCEC0] border border-[#D9C9B4] cursor-pointer"
              title="Minimize Properties"
            >
              <TbChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Tool Properties Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 overflow-x-hidden min-h-0">

        {/* ------------------------------------------------------------ */}
        {/* A. TERRAIN TOOL PROPERTIES                                   */}
        {/* ------------------------------------------------------------ */}
        {activeTool === 'terrain' && (
          <div className="space-y-3.5">
            {/* Subtool Selector Grid */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4B382C]">Sculpt Mode:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setTerrainSubTool('elevate')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    terrainSubTool === 'elevate'
                      ? 'bg-[#E85D04] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] hover:bg-[#EAE0D3]'
                  }`}
                >
                  <TbMountain className="w-3.5 h-3.5" />
                  <span>Elevate</span>
                </button>

                <button
                  onClick={() => setTerrainSubTool('lower')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    terrainSubTool === 'lower'
                      ? 'bg-[#8F4938] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] hover:bg-[#EAE0D3]'
                  }`}
                >
                  <TbTrendingDown className="w-3.5 h-3.5" />
                  <span>Lower</span>
                </button>

                <button
                  onClick={() => setTerrainSubTool('plateau')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    terrainSubTool === 'plateau'
                      ? 'bg-[#B58B63] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] hover:bg-[#EAE0D3]'
                  }`}
                >
                  <TbMinus className="w-3.5 h-3.5" />
                  <span>Plateau</span>
                </button>

                <button
                  onClick={() => setTerrainSubTool('smooth')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    terrainSubTool === 'smooth'
                      ? 'bg-[#777A57] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] hover:bg-[#EAE0D3]'
                  }`}
                >
                  <TbWaveSine className="w-3.5 h-3.5" />
                  <span>Smooth</span>
                </button>

                <button
                  onClick={() => setTerrainSubTool('slope')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    terrainSubTool === 'slope'
                      ? 'bg-[#D97706] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] hover:bg-[#EAE0D3]'
                  }`}
                >
                  <TbArrowUpRight className="w-3.5 h-3.5" />
                  <span>Slope</span>
                </button>

                <button
                  onClick={() => setTerrainSubTool('pond')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    terrainSubTool === 'pond'
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] hover:bg-[#EAE0D3]'
                  }`}
                >
                  <TbRipple className="w-3.5 h-3.5" />
                  <span>Pond Basin</span>
                </button>
              </div>

              {/* Default Soil Brush (Erase water/grass) */}
              <button
                onClick={() => setTerrainSubTool('soil')}
                className={`w-full mt-1.5 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  terrainSubTool === 'soil'
                    ? 'bg-[#4B382C] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] hover:bg-[#EAE0D3]'
                }`}
                title="Paints standard dry soil texture and erases standing water / foliage"
              >
                <TbPlant2 className="w-3.5 h-3.5 text-[#588157]" />
                <span>Default Soil (Erase Water)</span>
              </button>
            </div>

            {/* Brush Radius Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4B382C]">Brush Radius:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[#8D7666]">{brushRadius.toFixed(1)}m</span>
                  <span className="text-[9px] font-mono text-[#8D7666] bg-[#E4D8CB] px-1 rounded">Shift+Scroll</span>
                </div>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                className="w-full accent-[#4B382C] cursor-pointer"
              />
            </div>

            {/* Sculpt Strength Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4B382C]">Strength:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[#8D7666]">{Math.round(brushStrength * 100)}%</span>
                  <span className="text-[9px] font-mono text-[#8D7666] bg-[#E4D8CB] px-1 rounded">Ctrl+Scroll</span>
                </div>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={brushStrength}
                onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
                className="w-full accent-[#4B382C] cursor-pointer"
              />
            </div>

            {/* Plateau Height (if Plateau active) */}
            {terrainSubTool === 'plateau' && (
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D9C9B4] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#B58B63]">Plateau Height:</span>
                  <span className="font-mono text-[#8D7666]">{plateauHeight.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={plateauHeight}
                  onChange={(e) => setPlateauHeight(parseFloat(e.target.value))}
                  className="w-full accent-[#B58B63] cursor-pointer"
                />
              </div>
            )}

            {/* Slope Controls (if Slope active) */}
            {terrainSubTool === 'slope' && (
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D9C9B4] space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSlopeIncline(slopeIncline === 'incline' ? 'decline' : 'incline')}
                    className="flex-1 py-1 px-2 rounded-lg text-xs font-semibold bg-[#EADECF] hover:bg-[#DFCDBD] text-[#D97706] border border-[#D9C9B4] transition-all cursor-pointer text-center"
                  >
                    {slopeIncline === 'incline' ? '▲ Incline' : '▼ Decline'}
                  </button>
                  <button
                    onClick={() => setSlopeAlignment(slopeAlignment === 'camera' ? 'terrain' : 'camera')}
                    className="flex-1 py-1 px-2 rounded-lg text-xs font-semibold bg-[#EADECF] hover:bg-[#DFCDBD] text-[#4B382C] border border-[#D9C9B4] transition-all cursor-pointer text-center"
                  >
                    {slopeAlignment === 'camera' ? 'View Aligned' : 'Terrain Aligned'}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#4B382C]">Slope Angle:</span>
                    <span className="font-mono font-bold text-[#D97706]">{slopeAngle}°</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[15, 30, 45, 60].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setSlopeAngle(deg)}
                        className={`py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          slopeAngle === deg
                            ? 'bg-[#D97706] text-white shadow-xs'
                            : 'bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="75"
                    step="1"
                    value={slopeAngle}
                    onChange={(e) => setSlopeAngle(parseInt(e.target.value, 10))}
                    className="w-full accent-[#D97706] cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* B. PARAMETRIC FORT WALLS & BASTIONS (3-STEP STEPPER)        */}
        {/* ------------------------------------------------------------ */}
        {activeTool === 'walls' && (
          <div className="space-y-3.5">
            {/* Stepper Progress Bar Header */}
            <div className="bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4] flex items-center justify-between text-[11px] font-semibold">
              <button
                onClick={() => {
                  setWallStep('layout');
                }}
                className={`flex-1 py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  wallStep === 'layout'
                    ? 'bg-[#4B382C] text-white shadow-xs font-bold'
                    : 'text-[#634E40] hover:text-[#2B1E16]'
                }`}
              >
                {t.tools.walls.stepLayout}
              </button>

              <span className="text-[#A89687] text-[10px] px-0.5">➔</span>

              <button
                onClick={() => {
                  if (wallStep === 'layout') {
                    if (activeWallDraft.length >= 2 || selectedWallId || walls.length > 0) {
                      proceedToFortify();
                    } else {
                      showCursorToast(null, 'Draft a wall or select an existing wall first.');
                    }
                  } else {
                    setWallStep('fortify');
                  }
                }}
                className={`flex-1 py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  wallStep === 'fortify'
                    ? 'bg-[#E85D04] text-white shadow-xs font-bold'
                    : 'text-[#634E40] hover:text-[#2B1E16]'
                }`}
              >
                {t.tools.walls.stepFortify}
              </button>

              <span className="text-[#A89687] text-[10px] px-0.5">➔</span>

              <button
                onClick={() => {
                  solidifyCurrentWall();
                }}
                className={`flex-1 py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  wallStep === 'solidified'
                    ? 'bg-[#16A34A] text-white shadow-xs font-bold'
                    : 'text-[#634E40] hover:text-[#2B1E16]'
                }`}
              >
                {t.tools.walls.stepSolidify}
              </button>
            </div>

            {/* STEP 1: LAYOUT (आराखडा) */}
            {wallStep === 'layout' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-[#FFF8EB] border border-[#F59E0B]/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#92400E]">
                    <div className="flex items-center gap-1.5">
                      <TbPencil className="w-4 h-4 text-[#D97706]" />
                      <span>{t.tools.walls.step1Title}</span>
                    </div>
                    <span className="bg-[#FDE68A] text-[#92400E] px-1.5 py-0.5 rounded text-[10px] font-mono">
                      {activeWallDraft.length} {t.tools.walls.nodesCount}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#78350F] leading-tight">
                    {t.tools.walls.step1Desc}
                  </p>
                  <div className="text-[10px] text-[#B45309] font-medium bg-[#FEF3C7] p-1.5 rounded-lg flex items-center justify-between">
                    <span>
                      {activeWallDraft.length >= 3 &&
                      Math.hypot(
                        activeWallDraft[0].x - activeWallDraft[activeWallDraft.length - 1].x,
                        activeWallDraft[0].z - activeWallDraft[activeWallDraft.length - 1].z
                      ) < 0.7
                        ? '⭕ Circuit Closed'
                        : activeWallDraft.length >= 2
                        ? '〰️ Open Rampart'
                        : 'Click terrain to start'}
                    </span>
                    <span>
                      {activeWallDraft.length >= 2
                        ? `${calculateWallTotalLength(activeWallDraft, false).toFixed(1)}m length`
                        : '0.0m'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={(e) => {
                        if (activeWallDraft.length < 2) {
                          showCursorToast(e, 'Click on the terrain to place at least 2 nodes first.');
                          return;
                        }
                        const newId = proceedToFortify();
                        if (newId) {
                          showCursorToast(null, 'Wall created! Now fortify and style your ramparts.');
                        }
                      }}
                      className={`py-2 px-2 text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 ${
                        activeWallDraft.length >= 2
                          ? 'bg-[#16A34A] text-white hover:bg-[#15803D] cursor-pointer'
                          : 'bg-[#D9C9B4] text-[#786558] cursor-not-allowed opacity-75'
                      }`}
                    >
                      <span>{t.tools.walls.step1Next}</span>
                    </button>
                    <button
                      onClick={() => {
                        cancelCurrentWall();
                        showCursorToast(null, 'Draft canceled.');
                      }}
                      className="py-2 px-2 bg-[#FAF8F5] text-[#8F4938] border border-[#D9C9B4] text-[11px] font-semibold rounded-lg hover:bg-[#EAE0D3] cursor-pointer transition-all"
                    >
                      {t.tools.walls.cancelDraft}
                    </button>
                  </div>
                </div>

                {/* Existing Walls Quick Select if available */}
                {walls.length > 0 && (
                  <div className="p-2.5 bg-[#FAF8F5] border border-[#D9C9B4] rounded-xl space-y-1.5">
                    <div className="text-xs font-bold text-[#4B382C] flex items-center justify-between">
                      <span>Existing Walls ({walls.length})</span>
                      <button
                        onClick={() => proceedToFortify()}
                        className="text-[10px] text-[#D97706] hover:underline cursor-pointer"
                      >
                        Edit Latest Wall ➔
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {walls.map((w, idx) => (
                        <div
                          key={w.id}
                          onClick={() => {
                            setSelectedWallId(w.id);
                            setWallStep('fortify');
                          }}
                          className={`p-1.5 rounded-lg text-[10px] border flex items-center justify-between cursor-pointer transition-all ${
                            selectedWallId === w.id
                              ? 'bg-[#FEF3C7] border-[#D97706] font-bold text-[#92400E]'
                              : 'bg-white border-[#EADECF] hover:bg-[#F5EFE6] text-[#634E40]'
                          }`}
                        >
                          <span>Wall #{idx + 1} ({w.points.length} nodes)</span>
                          <span className="font-mono">{calculateWallTotalLength(w.points, w.isClosed).toFixed(1)}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: FORTIFY & STYLE (तटबंदी व बुरूज) */}
            {wallStep === 'fortify' && (
              <div className="space-y-3">
                {/* Active Stamp notice if any */}
                {activeStamp && (
                  <div className="p-2 bg-[#FEF3C7] border border-[#D97706] rounded-xl flex items-center justify-between text-[11px] text-[#92400E] animate-pulse">
                    <div className="flex items-center gap-1.5 font-bold">
                      <TbSparkles className="w-4 h-4 text-[#D97706]" />
                      <span>Hover & click in 3D to stamp!</span>
                    </div>
                    <button
                      onClick={() => setActiveStamp(null)}
                      className="px-2 py-0.5 bg-[#B45309] text-white rounded text-[10px] font-semibold hover:bg-[#92400E] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* 1. Rampart Architecture Sliders */}
                <div className="p-2.5 bg-[#FAF8F5] border border-[#D9C9B4] rounded-xl space-y-2.5">
                  <div className="text-xs font-bold text-[#4B382C] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <TbBuildingFortress className="w-3.5 h-3.5 text-[#8F4938]" />
                      Rampart Architecture
                    </span>
                    <span className="text-[10px] text-[#8D7666] font-mono">
                      {(wallSettings.height * 100).toFixed(0)}cm / {(wallSettings.thickness * 100).toFixed(0)}cm
                    </span>
                  </div>

                  {/* Wall Height Slider (Scale in Centimeters up to 100cm) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#4B382C]">{t.tools.walls.height}:</span>
                      <span className="font-mono text-[#8D7666]">
                        {(wallSettings.height * 100).toFixed(0)}cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="1.00"
                      step="0.05"
                      value={wallSettings.height}
                      onChange={(e) => setWallSettings({ height: parseFloat(e.target.value) })}
                      className="w-full accent-[#4B382C] cursor-pointer"
                    />
                    {/* Height presets */}
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {[
                        { label: 'Low 25cm', val: 0.25 },
                        { label: 'Default 50cm', val: 0.50 },
                        { label: 'Citadel 80cm', val: 0.80 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() => setWallSettings({ height: preset.val })}
                          className={`py-0.5 text-[10px] rounded border transition-all cursor-pointer ${
                            Math.abs(wallSettings.height - preset.val) < 0.04
                              ? 'bg-[#4B382C] text-white border-[#38281E]'
                              : 'bg-[#FAF8F5] text-[#5C4638] border-[#D9C9B4] hover:bg-[#EAE0D3]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wall Thickness Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#4B382C]">{t.tools.walls.thickness}:</span>
                      <span className="font-mono text-[#8D7666]">
                        {(wallSettings.thickness * 100).toFixed(0)}cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.40"
                      step="0.02"
                      value={wallSettings.thickness}
                      onChange={(e) => setWallSettings({ thickness: parseFloat(e.target.value) })}
                      className="w-full accent-[#8F4938] cursor-pointer"
                    />
                  </div>

                  {/* Brick Tiling & Kangare */}
                  <div className="space-y-1 pt-1 border-t border-[#EADECF]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#4B382C]">{t.tools.walls.uvScale}:</span>
                      <span className="font-mono text-[#8D7666]">{wallSettings.uvScale.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={wallSettings.uvScale}
                      onChange={(e) => setWallSettings({ uvScale: parseFloat(e.target.value) })}
                      className="w-full accent-[#B58B63] cursor-pointer"
                    />
                  </div>

                  {/* Pointed Kangare Toggle */}
                  <button
                    onClick={() => setWallSettings({ crenellations: !wallSettings.crenellations })}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      wallSettings.crenellations
                        ? 'bg-[#4B382C] text-white border-[#38281E] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#4B382C] border-[#D9C9B4] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <TbBuildingFortress className="w-4 h-4 text-[#E85D04]" />
                      <span className="text-xs font-semibold">{t.tools.walls.crenellations}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        wallSettings.crenellations ? 'bg-black/30 text-[#FAF8F5]' : 'bg-[#E4D8CB]'
                      }`}
                    >
                      {wallSettings.crenellations ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                {/* 2. Fortifications Stamp Shelf */}
                <div className="p-2.5 bg-[#FAF8F5] border border-[#D9C9B4] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4B382C]">
                    <span className="flex items-center gap-1">
                      <TbTower className="w-3.5 h-3.5 text-[#D97706]" />
                      {t.tools.walls.stampShelfTitle}
                    </span>
                    <span className="text-[10px] text-[#8D7666]">Magnetic Snap</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Stamp 1: Round Buruj */}
                    <button
                      onClick={() => setActiveStamp(activeStamp === 'buruj' ? null : 'buruj')}
                      className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        activeStamp === 'buruj'
                          ? 'bg-[#FEF3C7] border-[#D97706] shadow-sm text-[#92400E] font-bold scale-[1.02]'
                          : 'bg-white border-[#D9C9B4] text-[#4B382C] hover:bg-[#F5EFE6]'
                      }`}
                    >
                      <TbTower className="w-5 h-5 text-[#8F4938] mb-1" />
                      <span className="text-[11px] font-semibold">{t.tools.walls.stampBuruj}</span>
                      <span className="text-[9px] text-[#8D7666]">Snaps to vertices</span>
                    </button>

                    {/* Stamp 2: Grand Bastion */}
                    <button
                      onClick={() => setActiveStamp(activeStamp === 'grand_buruj' ? null : 'grand_buruj')}
                      className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        activeStamp === 'grand_buruj'
                          ? 'bg-[#FEF3C7] border-[#D97706] shadow-sm text-[#92400E] font-bold scale-[1.02]'
                          : 'bg-white border-[#D9C9B4] text-[#4B382C] hover:bg-[#F5EFE6]'
                      }`}
                    >
                      <TbTower className="w-5 h-5 text-[#D97706] mb-1" />
                      <span className="text-[11px] font-semibold">{t.tools.walls.stampGrandBuruj}</span>
                      <span className="text-[9px] text-[#8D7666]">1.5x Giant Tower</span>
                    </button>

                    {/* Stamp 3: Maha Darwaza */}
                    <button
                      onClick={() => setActiveStamp(activeStamp === 'gate' ? null : 'gate')}
                      className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        activeStamp === 'gate'
                          ? 'bg-[#FEF3C7] border-[#D97706] shadow-sm text-[#92400E] font-bold scale-[1.02]'
                          : 'bg-white border-[#D9C9B4] text-[#4B382C] hover:bg-[#F5EFE6]'
                      }`}
                    >
                      <TbDoorEnter className="w-5 h-5 text-[#E85D04] mb-1" />
                      <span className="text-[11px] font-semibold">{t.tools.walls.stampGate}</span>
                      <span className="text-[9px] text-[#8D7666]">Snaps to segment</span>
                    </button>

                    {/* Stamp 4: Citadel Keep */}
                    <button
                      onClick={() => setActiveStamp(activeStamp === 'citadel' ? null : 'citadel')}
                      className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        activeStamp === 'citadel'
                          ? 'bg-[#FEF3C7] border-[#D97706] shadow-sm text-[#92400E] font-bold scale-[1.02]'
                          : 'bg-white border-[#D9C9B4] text-[#4B382C] hover:bg-[#F5EFE6]'
                      }`}
                    >
                      <TbBuildingFortress className="w-5 h-5 text-[#16A34A] mb-1" />
                      <span className="text-[11px] font-semibold">{t.tools.walls.stampCitadel}</span>
                      <span className="text-[9px] text-[#8D7666]">Stamps on terrain</span>
                    </button>
                  </div>
                </div>

                {/* 3. Contextual Component Inspector if selected */}
                {selectedComponent && (
                  <div className="p-2.5 bg-[#EFF6FF] border border-[#3B82F6]/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1E40AF]">
                      <span>
                        {selectedComponent.type === 'gate'
                          ? '🚪 Maha Darwaza'
                          : selectedComponent.type === 'citadel'
                          ? '🚩 Balekilla Citadel Keep'
                          : '🏰 Bastion Tower'}
                      </span>
                      <button
                        onClick={() => setSelectedComponent(null)}
                        className="text-[10px] text-[#3B82F6] hover:underline cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {selectedComponent.type === 'citadel' && (
                      <div className="space-y-1">
                        {(() => {
                          const keep = citadelKeeps.find((k) => k.id === selectedComponent.idOrIndex);
                          if (!keep) return null;
                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span>Scale: {keep.scale.toFixed(1)}x</span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="2.5"
                                step="0.1"
                                value={keep.scale}
                                onChange={(e) =>
                                  updateCitadelKeep(keep.id, { scale: parseFloat(e.target.value) })
                                }
                                className="w-full accent-[#1E40AF] cursor-pointer"
                              />
                              <button
                                onClick={() => removeCitadelKeep(keep.id)}
                                className="w-full py-1 bg-white text-[#DC2626] border border-[#FECACA] rounded text-[10px] font-bold hover:bg-[#FEE2E2] cursor-pointer"
                              >
                                Delete Keep
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {selectedComponent.type === 'gate' && (
                      <div className="space-y-1">
                        {(() => {
                          const wall = walls.find((w) => w.id === selectedComponent.wallId);
                          const gate = wall?.gates.find((g) => g.id === selectedComponent.idOrIndex);
                          if (!wall || !gate) return null;
                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span>Gate Width: {(gate.width * 100).toFixed(0)}cm</span>
                              </div>
                              <input
                                type="range"
                                min="0.20"
                                max="0.60"
                                step="0.05"
                                value={gate.width}
                                onChange={(e) =>
                                  updateGateProperties(wall.id, gate.id, { width: parseFloat(e.target.value) })
                                }
                                className="w-full accent-[#1E40AF] cursor-pointer"
                              />
                              <button
                                onClick={() => removeGateFromWall(wall.id, gate.id)}
                                className="w-full py-1 bg-white text-[#DC2626] border border-[#FECACA] rounded text-[10px] font-bold hover:bg-[#FEE2E2] cursor-pointer"
                              >
                                Delete Gate
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Action Buttons (Solidify / Return to Step 1 / Delete) */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => {
                      solidifyCurrentWall();
                      showCursorToast(null, 'Fort solidified into diorama!');
                    }}
                    className="w-full py-2 px-3 bg-[#16A34A] text-white text-xs font-bold rounded-xl hover:bg-[#15803D] cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <TbCheck className="w-4 h-4" />
                    <span>{t.tools.walls.step2Solidify}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setWallStep('layout');
                      }}
                      className="py-1.5 px-2 bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] text-[11px] font-semibold rounded-lg hover:bg-[#EAE0D3] cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <span>{t.tools.walls.step2EditPath}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedWallId) {
                          removeWall(selectedWallId);
                          showCursorToast(null, 'Wall deleted.');
                          if (walls.length <= 1) {
                            setWallStep('layout');
                          }
                        }
                      }}
                      className="py-1.5 px-2 bg-[#FAF8F5] text-[#DC2626] border border-[#FECACA] text-[11px] font-semibold rounded-lg hover:bg-[#FEE2E2] cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <TbTrash className="w-3.5 h-3.5" />
                      <span>Delete Wall</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SOLIDIFIED DIORAMA OVERVIEW (पक्की करा) */}
            {wallStep === 'solidified' && (
              <div className="space-y-3">
                {/* Defense Summary Card */}
                <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534]">
                    <TbShieldCheck className="w-4 h-4 text-[#16A34A]" />
                    <span>{t.tools.walls.step3Title}</span>
                  </div>
                  <p className="text-[10px] text-[#15803D] leading-tight">
                    {t.tools.walls.step3Desc}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    <div className="bg-white/80 p-2 rounded-lg border border-[#BBF7D0]">
                      <div className="text-[10px] text-[#15803D]">Total Length</div>
                      <div className="text-sm font-bold text-[#166534] font-mono">
                        {walls.reduce((sum, w) => sum + calculateWallTotalLength(w.points, w.isClosed), 0).toFixed(1)}m
                      </div>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-[#BBF7D0]">
                      <div className="text-[10px] text-[#15803D]">Fort Walls</div>
                      <div className="text-sm font-bold text-[#166534] font-mono">{walls.length}</div>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-[#BBF7D0]">
                      <div className="text-[10px] text-[#15803D]">Gates Placed</div>
                      <div className="text-sm font-bold text-[#166534] font-mono">
                        {walls.reduce((sum, w) => sum + (w.gates?.length || 0), 0)}
                      </div>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-[#BBF7D0]">
                      <div className="text-[10px] text-[#15803D]">Citadel Keeps</div>
                      <div className="text-sm font-bold text-[#166534] font-mono">{citadelKeeps.length}</div>
                    </div>
                  </div>
                </div>

                {/* Walls List */}
                {walls.length > 0 && (
                  <div className="p-2.5 bg-[#FAF8F5] border border-[#D9C9B4] rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-[#4B382C]">Diorama Fort Circuits</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {walls.map((w, idx) => (
                        <div
                          key={w.id}
                          className="p-2 bg-white rounded-lg border border-[#EADECF] flex items-center justify-between text-[11px]"
                        >
                          <div>
                            <div className="font-bold text-[#4B382C]">Wall #{idx + 1}</div>
                            <div className="text-[10px] text-[#8D7666]">
                              {w.points.length} nodes • {calculateWallTotalLength(w.points, w.isClosed).toFixed(1)}m
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedWallId(w.id);
                                setWallStep('fortify');
                                showCursorToast(null, `Editing Wall #${idx + 1}`);
                              }}
                              className="px-2 py-1 bg-[#4B382C] text-white rounded text-[10px] font-semibold hover:bg-[#38281E] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                removeWall(w.id);
                                showCursorToast(null, 'Wall removed.');
                              }}
                              className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded cursor-pointer"
                              title="Delete Wall"
                            >
                              <TbTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Action: Build Another Wall Circuit */}
                <button
                  onClick={() => {
                    startNewWallCircuit();
                    showCursorToast(null, 'Started new wall circuit. Click on terrain to draw.');
                  }}
                  className="w-full py-2.5 px-3 bg-[#4B382C] text-white text-xs font-bold rounded-xl hover:bg-[#38281E] cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <TbPlus className="w-4 h-4" />
                  <span>{t.tools.walls.step3NewWall}</span>
                </button>

                {walls.length > 0 && (
                  <button
                    onClick={clearAllWalls}
                    className="w-full py-1.5 px-2 bg-[#FAF8F5] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <TbTrash className="w-3.5 h-3.5" />
                    <span>{t.tools.walls.clearAll}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* B. STRUCTURE PAINT STUDIO PROPERTIES                         */}
        {/* ------------------------------------------------------------ */}
        {activeTool === 'paint' && (
          <div className="space-y-3.5">
            {/* Brush Sizes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4B382C]">Brush Size:</label>
              <div className="grid grid-cols-3 gap-1 bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4]">
                {(['fine', 'medium', 'large'] as BrushSizeType[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      brushSize === size
                        ? 'bg-[#4B382C] text-white shadow-sm'
                        : 'text-[#634E40] hover:text-[#2B1E16]'
                    }`}
                  >
                    {size === 'large'
                      ? t.tools.paint.large
                      : size === 'medium'
                      ? t.tools.paint.medium
                      : t.tools.paint.fine}
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Maratha Authentic Pigments */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B382C]">Earth Pigment Palette:</label>
              <div className="grid grid-cols-3 gap-2">
                {PAINT_COLORS.map((col) => {
                  const isSelected = paintColor.toLowerCase() === col.hex.toLowerCase();
                  return (
                    <button
                      key={col.id}
                      onClick={() => setPaintColor(col.hex)}
                      className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#4B382C] bg-white shadow-md scale-102'
                          : 'border-transparent bg-[#FAF8F5] hover:bg-white'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-black/20 flex items-center justify-center mb-1"
                        style={{ backgroundColor: col.hex }}
                      >
                        {isSelected && (
                          <TbCheck
                            className={`w-3.5 h-3.5 ${
                              col.id === 'chuna' ? 'text-black' : 'text-white'
                            }`}
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-[#4B382C] text-center leading-tight">
                        {col.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Steady Hand Stabilizer */}
            <button
              onClick={() => setSteadyHand(!steadyHand)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                steadyHand
                  ? 'bg-[#4B382C] text-white border-[#38281E] shadow-sm'
                  : 'bg-[#FAF8F5] text-[#4B382C] border-[#D9C9B4] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <TbSparkles className={`w-4 h-4 ${steadyHand ? 'text-[#F59E0B]' : 'text-[#8D7666]'}`} />
                <span className="text-xs font-semibold">Steady Hand Stabilizer</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${steadyHand ? 'bg-black/30 text-[#FAF8F5]' : 'bg-[#E4D8CB]'}`}>
                {steadyHand ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* C. FOLIAGE TOOL PROPERTIES                                   */}
        {/* ------------------------------------------------------------ */}
        {(activeTool === 'foliage' || activeTool === 'grass') && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setFoliageSubTool('grass')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  foliageSubTool === 'grass'
                    ? 'bg-[#588157] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4]'
                }`}
              >
                <TbPlant2 className="w-4 h-4" />
                <span>Grass / Moss</span>
              </button>
              <button
                onClick={() => setFoliageSubTool('path')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  foliageSubTool === 'path'
                    ? 'bg-[#8F4938] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4]'
                }`}
              >
                <span>Foliage Path</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4B382C]">Foliage Radius:</span>
                <span className="font-mono text-[#8D7666]">{brushRadius.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                className="w-full accent-[#588157] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* D. SOIL LUMP PIPELINE TOOL                                   */}
        {/* ------------------------------------------------------------ */}
        {activeTool === 'soil' && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4B382C]">Lump Radius:</span>
                <span className="font-mono text-[#8D7666]">{brushRadius.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.2"
                step="0.1"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                className="w-full accent-[#B85F45] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4B382C]">Pour Height:</span>
                <span className="font-mono text-[#8D7666]">{brushStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={brushStrength}
                onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
                className="w-full accent-[#B85F45] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* E. WATER PIPELINE TOOL                                       */}
        {/* ------------------------------------------------------------ */}
        {activeTool === 'water' && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4B382C]">Water Spread:</span>
                <span className="font-mono text-[#8D7666]">{brushRadius.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
            </div>

            <button
              onClick={() => setWaterMode(waterMode === 'tarpaulin' ? 'reflective' : 'tarpaulin')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#D9C9B4] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#4B382C] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <TbRipple className="w-4 h-4 text-[#0284C7]" />
                <span>Surface Style</span>
              </div>
              <span className="text-[10px] font-bold text-[#0284C7] uppercase">
                {waterMode === 'tarpaulin' ? 'Blue Tarpaulin' : 'Clean Water'}
              </span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* F. SHAPE MUD PIPELINE TOOL                                   */}
        {/* ------------------------------------------------------------ */}
        {(activeTool === 'shape' || activeTool === 'shape_side' || activeTool === 'shape_top') && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4B382C]">Push & Mold Direction:</label>
              <div className="grid grid-cols-3 gap-1 bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4]">
                <button
                  onClick={() => setShapeSubTool('push_left')}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    shapeSubTool === 'push_left'
                      ? 'bg-[#4B382C] text-white shadow-sm'
                      : 'text-[#634E40] hover:text-[#2B1E16]'
                  }`}
                >
                  <TbArrowsLeft className="w-4 h-4" />
                  <span className="text-[10px]">Push Left</span>
                </button>
                <button
                  onClick={() => setShapeSubTool('push_right')}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    shapeSubTool === 'push_right'
                      ? 'bg-[#4B382C] text-white shadow-sm'
                      : 'text-[#634E40] hover:text-[#2B1E16]'
                  }`}
                >
                  <TbArrowsRight className="w-4 h-4" />
                  <span className="text-[10px]">Push Right</span>
                </button>
                <button
                  onClick={() => setShapeSubTool('pat_top')}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    shapeSubTool === 'pat_top'
                      ? 'bg-[#4B382C] text-white shadow-sm'
                      : 'text-[#634E40] hover:text-[#2B1E16]'
                  }`}
                >
                  <TbArrowDownBar className="w-4 h-4" />
                  <span className="text-[10px]">Pat Top</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4B382C]">Tool Size:</span>
                <span className="font-mono text-[#8D7666]">{brushRadius.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                className="w-full accent-[#4B382C] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* G. DRYING TOOL                                               */}
        {/* ------------------------------------------------------------ */}
        {activeTool === 'dry' && (
          <div className="space-y-3.5">
            <button
              onClick={() => setMudLocked(!mudLocked)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                mudLocked
                  ? 'bg-[#588157] text-white border-[#3F5E3E] shadow-sm'
                  : 'bg-[#FAF8F5] text-[#4B382C] border-[#D9C9B4] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {mudLocked ? <TbLock className="w-5 h-5" /> : <TbSun className="w-5 h-5 text-[#F59E0B]" />}
                <span className="text-xs font-bold">
                  {mudLocked ? 'Structure Dried & Locked' : 'Solidify & Dry Mud'}
                </span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-[#FAF8F5]">L</kbd>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* H. WALLS / SPLINE / FIGURINES MINIMAL ACTIONS                */}
        {/* ------------------------------------------------------------ */}
        {activeTool === 'prop' && (
          <div className="space-y-2">
            <button
              onClick={() => setPropDrawerOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#4B382C] text-white text-xs font-bold hover:bg-[#38281E] transition-colors cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <TbUsersGroup className="w-4 h-4 text-[#F59E0B]" />
              <span>Open Figurine Catalog</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. DRAGGABLE VERTICAL BORDER RESIZE HANDLE                   */}
      {/* ============================================================ */}
      <div
        onMouseDown={handleWidthMouseDown}
        className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-[#B85F45]/40 active:bg-[#B85F45] transition-colors z-40 flex items-center justify-center group"
        title="Drag left or right to resize sidebar width"
      >
        <div className="w-[1.5px] h-8 rounded-full bg-[#B39E8C] group-hover:bg-[#B85F45] transition-colors" />
      </div>
      {/* ============================================================ */}
      {/* 5. FLOATING CURSOR TOAST FOR DISABLED BUTTONS & PROPERTIES   */}
      {/* ============================================================ */}
      {cursorToast && (
        <div
          style={{ left: cursorToast.x + 10, top: cursorToast.y - 12 }}
          className="fixed z-50 pointer-events-none transform -translate-y-full bg-[#2B1E16]/95 backdrop-blur-md text-[#FFF8EB] border border-[#F59E0B]/70 px-3 py-1.5 rounded-lg text-xs shadow-xl max-w-xs font-medium animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5"
        >
          <span className="text-[#F59E0B] text-sm">🔒</span>
          <span>{cursorToast.message}</span>
        </div>
      )}
    </aside>
  </>
  );
};

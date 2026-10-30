'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
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
  TbLock,
  TbBuildingFortress,
  TbRoute,
  TbUsersGroup,
  TbDropletHalf2,
  TbAdjustmentsHorizontal,
  TbChevronLeft,
  TbChevronDown,
  TbPointer,
  TbPencil,
  TbDoorEnter,
  TbTower,
  TbTrash,
  TbPlus,
  TbFlag,
  TbFlame,
  TbStairs,
  TbX,
  TbArrowsMove,
  TbEdit,
} from 'react-icons/tb';
import { useEditorStore, TerrainSubTool } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { SplineConversionType } from '@/lib/spline/splineTypes';
import { FortStampType } from '@/lib/walls/wallTypes';

const STORAGE_WIDTH_KEY = 'killa_sidebar_width_v1';

export const LeftToolSidebar: React.FC = () => {
  const {
    activeTool,
    terrainSubTool,
    plateauHeight,
    setPlateauHeight,
    slopeAngle,
    setSlopeAngle,
    brushRadius,
    setBrushRadius,
    brushStrength,
    setBrushStrength,
    paintColor,
    setPaintColor,
    mudLocked,
    setMudLocked,
    showLeftToolbar,
    showContextualDock,
    isMobileSidebarMinimized,
    toggleMobileSidebar,
    isToolModeMinimized,
    isMobileTopBarMinimized,
    setPropDrawerOpen,
    walls,
    wallMode,
    setWallMode,
    activeWallDraft,
    wallSettings,
    setWallSettings,
    finishCurrentWall,
    cancelCurrentWall,
    selectedWallId,
    setSelectedWallId,
    selectedComponent,
    setSelectedComponent,
    removeWall,
    removeTowerFromWall,
    removeBoxBastionFromWall,
    removeGateFromWall,
    removeBastionFromNode,
    activeStamp,
    setActiveStamp,
    splineMode,
    setSplineMode,
    splines,
    selectedSplineId,
    setSelectedSplineId,
    deleteSpline,
    currentSplinePoints,
    splineConversionType,
    setSplineConversionType,
    splineSettings,
    setSplineSettings,
    finishSpline,
    cancelSpline,
    translateSpline,
    rotateSpline,
    scaleSplineItem,
    setToastMessage,
    setCameraViewPreset,
    leftSidebarWidth: sidebarWidth,
    setLeftSidebarWidth: setSidebarWidth,
  } = useEditorStore();

  const { t } = useTranslation();

  // Sidebar resizable width
  const isDraggingWidthRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WIDTH_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 250 && val <= 480) {
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
      const newWidth = Math.max(250, Math.min(480, moveEvt.clientX));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingWidthRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem(STORAGE_WIDTH_KEY, sidebarWidth.toString());
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleConversionTypeChange = useCallback(
    (type: SplineConversionType) => {
      setSplineConversionType(type);
    },
    [setSplineConversionType]
  );

  // Compute camera-relative axes for directional navigation on XZ plane
  const getCameraAxes = () => {
    if (typeof window !== 'undefined') {
      const rawControls = (window as any).__orbitControls;
      if (rawControls && rawControls.object) {
        const cam = rawControls.object as THREE.Camera;
        const forward = new THREE.Vector3();
        if (typeof cam.getWorldDirection === 'function') {
          cam.getWorldDirection(forward);
          forward.y = 0;
          if (forward.lengthSq() > 0.001) {
            forward.normalize();
            const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
            return {
              forward: { x: forward.x, z: forward.z },
              right: { x: right.x, z: right.z },
            };
          }
        }
      }
    }
    return { forward: { x: 0, z: -1 }, right: { x: 1, z: 0 } };
  };

  const moveSplineCameraRelative = (dir: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down') => {
    if (!selectedSplineId) return;
    const { forward, right } = getCameraAxes();
    const STEP = 0.15;
    const V_STEP = 0.03; // 3cm vertical step

    if (dir === 'forward') {
      translateSpline(selectedSplineId, forward.x * STEP, 0, forward.z * STEP);
    } else if (dir === 'backward') {
      translateSpline(selectedSplineId, -forward.x * STEP, 0, -forward.z * STEP);
    } else if (dir === 'right') {
      translateSpline(selectedSplineId, right.x * STEP, 0, right.z * STEP);
    } else if (dir === 'left') {
      translateSpline(selectedSplineId, -right.x * STEP, 0, -right.z * STEP);
    } else if (dir === 'up') {
      translateSpline(selectedSplineId, 0, V_STEP, 0);
    } else if (dir === 'down') {
      translateSpline(selectedSplineId, 0, -V_STEP, 0);
    }
  };

  if (!showLeftToolbar) return null;

  const selectedWall = walls.find((w) => w.id === selectedWallId);
  const selectedSpline = splines.find((s) => s.id === selectedSplineId);

  const isModePanelOpen =
    ['walls', 'spline', 'terrain'].includes(activeTool) && !isToolModeMinimized;
  const propertiesTabLeft = isModePanelOpen ? '76px' : '8px';

  return (
    <>
      {/* Minimized Hanging Guide Tab (Pinned to top-left below top bar) */}
      {isMobileSidebarMinimized && (
        <div
          style={{ left: propertiesTabLeft }}
          className={`fixed z-30 pointer-events-auto transition-all duration-200 ${
            !showContextualDock || isMobileTopBarMinimized ? 'top-[41px]' : 'top-[112px] xl:top-[81px]'
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

      {/* Docked Left Sidebar */}
      <aside
        aria-label="Editor Sidebar"
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed left-0 bottom-0 z-20 flex flex-col bg-[#F3EBE0] border-r border-[#CDBCAB] shadow-lg select-none pointer-events-auto transition-all duration-200 max-w-[85vw] ${
          isMobileSidebarMinimized ? '-translate-x-full' : 'translate-x-0'
        } ${
          !showContextualDock
            ? 'top-[41px]'
            : isMobileTopBarMinimized
            ? 'top-[41px]'
            : 'top-[112px] xl:top-[81px]'
        }`}
      >
        {/* Right Resizing Edge with Tactile Grip Dots */}
        <div
          onMouseDown={handleResizeStart}
          title="Drag to resize panel"
          className="group absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-[#B85F45]/30 transition-colors z-30 flex items-center justify-center"
        >
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
        <div className="flex items-center justify-between p-3 border-b border-[#D8C7B5] shrink-0 bg-[#ECE2D5]/70">
          <div className="flex items-center gap-1.5 text-[#4B382C]">
            <TbAdjustmentsHorizontal className="w-4 h-4 text-[#8F4938]" />
            <span className="text-xs font-bold uppercase tracking-wider">Tool Properties</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold bg-[#E0D3C3] text-[#5C4638] px-2 py-0.5 rounded-full uppercase tracking-wider">
              {activeTool}
            </span>
            <button
              onClick={toggleMobileSidebar}
              title="Minimize Sidebar"
              className="p-1 rounded hover:bg-[#D8C7B5] text-[#5C4638] transition-colors cursor-pointer"
            >
              <TbChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Tool Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs text-[#4B382C]">
          {/* ======================================================== */}
          {/* 1. WALLS TOOL PROPERTIES                                  */}
          {/* ======================================================== */}
          {activeTool === 'walls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4]">
                <div className="flex items-center gap-1.5">
                  <TbBuildingFortress className="w-4 h-4 text-[#B85F45]" />
                  <span className="font-bold text-[#4B382C]">
                    {wallMode === 'draw'
                      ? 'Rampart Drafting'
                      : wallMode === 'fortify'
                      ? 'Fortification Studio'
                      : 'Selection Mode'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-[#8D7666]">
                  {wallMode} mode
                </span>
              </div>

              {/* A. DRAW MODE */}
              {wallMode === 'draw' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-[#5C4638]">Draft Points:</span>
                      <span className="font-bold text-[#B85F45]">
                        {activeWallDraft.length} {activeWallDraft.length < 2 ? '(Min 2 needed)' : '✓ Ready'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          const id = finishCurrentWall();
                          if (id) {
                            setToastMessage('Wall placed on fort perimeter!');
                          }
                        }}
                        disabled={activeWallDraft.length < 2}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          activeWallDraft.length >= 2
                            ? 'bg-[#E85D04] text-white hover:bg-[#D05303] cursor-pointer'
                            : 'bg-[#DFCDBD] text-[#8D7666] cursor-not-allowed opacity-60'
                        }`}
                      >
                        <TbCheck className="w-4 h-4" />
                        Finish Wall
                      </button>

                      {activeWallDraft.length > 0 && (
                        <button
                          onClick={cancelCurrentWall}
                          title="Cancel Draft"
                          className="p-2 rounded-xl bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD] cursor-pointer"
                        >
                          <TbX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Creation Sliders */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Wall Height</span>
                        <span className="text-[#8D7666]">{((wallSettings.height || 0.25) * 100).toFixed(0)} cm</span>
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
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Wall Thickness</span>
                        <span className="text-[#8D7666]">{((wallSettings.thickness || 0.15) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.06"
                        max="0.30"
                        step="0.01"
                        value={wallSettings.thickness || 0.15}
                        onChange={(e) => setWallSettings({ thickness: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-[#4B382C]">Battlements (Crenellations)</span>
                      <input
                        type="checkbox"
                        checked={wallSettings.crenellations}
                        onChange={(e) => setWallSettings({ crenellations: e.target.checked })}
                        className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {wallSettings.crenellations && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#4B382C]">Flip Battlements Rim</span>
                        <input
                          type="checkbox"
                          checked={wallSettings.flipCrenellations ?? false}
                          onChange={(e) => setWallSettings({ flipCrenellations: e.target.checked })}
                          className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#4B382C]">Corner Auto-Bastions</span>
                      <input
                        type="checkbox"
                        checked={wallSettings.autoBastions}
                        onChange={(e) => setWallSettings({ autoBastions: e.target.checked })}
                        className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {wallSettings.autoBastions && (
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Bastion Radius</span>
                          <span className="text-[#8D7666]">{((wallSettings.bastionRadius || 0.13) * 100).toFixed(0)} cm</span>
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
                  </div>
                </div>
              )}

              {/* B. FORTIFY MODE */}
              {wallMode === 'fortify' && (
                <div className="space-y-3.5">
                  <div className="text-[11px] text-[#634E40] leading-relaxed">
                    Choose a fortification to place continuously along ramparts.
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'tower' as FortStampType, label: 'Watchtower', desc: 'Round tower', icon: TbTower },
                      { id: 'box' as FortStampType, label: 'Rampart Bastion', desc: 'Platform bastion', icon: TbBuildingFortress },
                      { id: 'gate' as FortStampType, label: 'Arched Gateway', desc: 'Fortified arch', icon: TbDoorEnter },
                    ].map((stamp) => {
                      const Icon = stamp.icon;
                      const isStampActive = activeStamp === stamp.id;

                      return (
                        <button
                          key={stamp.id}
                          onClick={() => setActiveStamp(isStampActive ? null : stamp.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isStampActive
                              ? 'bg-[#4B382C] text-[#FAF8F5] border-[#38281E] shadow-md ring-2 ring-[#B85F45]'
                              : 'bg-[#FAF8F5] text-[#4B382C] border-[#D9C9B4] hover:bg-[#EADECF]'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1 text-[#B85F45]" />
                          <span className="font-bold text-[10px] leading-tight">{stamp.label}</span>
                          <span className="text-[8px] text-[#8D7666] leading-tight mt-0.5">{stamp.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {activeStamp && (
                    <div className="p-3 bg-[#EAE2D7] rounded-xl border border-[#B85F45]/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8F4938]">
                        <TbSparkles className="w-4 h-4" />
                        Continuous Stamping Active
                      </div>
                      <p className="text-[11px] text-[#634E40] leading-snug">
                        Click along any rampart to place. You can place multiple fortifications in a row!
                      </p>
                      <button
                        onClick={() => setActiveStamp(null)}
                        className="w-full py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#4B382C] border border-[#D9C9B4] rounded-lg hover:bg-[#DFCDBD] cursor-pointer"
                      >
                        Done Stamping
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* C. SELECT MODE: With Deselect, Delete, Edit buttons */}
              {wallMode === 'select' && (
                <div className="space-y-3">
                  {selectedWall ? (
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-[#8D7666] uppercase">Selected Wall</div>
                        <div className="text-xs font-bold text-[#4B382C] mt-0.5 truncate">
                          {selectedWall.name || 'Defensive Rampart'}
                          {selectedComponent && (
                            <span className="text-[#B85F45] ml-1">
                              ({selectedComponent.type === 'bastion' ? `Rampart Bastion ${Number(selectedComponent.idOrIndex) + 1}` : selectedComponent.type === 'tower' ? 'Watchtower' : selectedComponent.type === 'box' ? 'Rampart Bastion' : 'Arched Gateway'})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deselect / Delete / Edit Buttons */}
                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => {
                            setSelectedWallId(null);
                            setSelectedComponent(null);
                          }}
                          className="w-full py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <TbX className="w-3.5 h-3.5" />
                          Deselect
                        </button>

                        <button
                          onClick={() => {
                            if (selectedComponent && selectedWall) {
                              if (selectedComponent.type === 'bastion') {
                                removeBastionFromNode(selectedWall.id, Number(selectedComponent.idOrIndex));
                              } else if (selectedComponent.type === 'tower') {
                                removeTowerFromWall(selectedWall.id, String(selectedComponent.idOrIndex));
                              } else if (selectedComponent.type === 'box') {
                                removeBoxBastionFromWall(selectedWall.id, String(selectedComponent.idOrIndex));
                              } else if (selectedComponent.type === 'gate') {
                                removeGateFromWall(selectedWall.id, String(selectedComponent.idOrIndex));
                              }
                              setSelectedComponent(null);
                            } else if (selectedWall) {
                              removeWall(selectedWall.id);
                              setSelectedWallId(null);
                            }
                          }}
                          className="w-full py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <TbTrash className="w-3.5 h-3.5" />
                          Delete
                        </button>

                        <button
                          onClick={() => setWallMode('fortify')}
                          className="w-full py-1.5 text-xs font-semibold bg-[#4B382C] text-[#FAF8F5] rounded-lg hover:bg-[#38281E] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <TbEdit className="w-3.5 h-3.5" />
                          Fortify Wall
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-xs text-[#634E40] space-y-2">
                      <div className="font-bold text-[#4B382C] flex items-center gap-1.5">
                        <TbPointer className="w-4 h-4 text-[#B85F45]" />
                        Select & Inspect
                      </div>
                      <p className="leading-relaxed">
                        Click any wall, bastion, or gate on the 3D diorama or from the <strong>Fort Outliner</strong> on the right to view its dimensions, rename it, or remove it.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. SPLINE / PATHS TOOL PROPERTIES                         */}
          {/* ======================================================== */}
          {activeTool === 'spline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4]">
                <div className="flex items-center gap-1.5">
                  <TbRoute className="w-4 h-4 text-[#B85F45]" />
                  <span className="font-bold text-[#4B382C]">
                    {splineMode === 'draw'
                      ? 'Path Drafting'
                      : splineMode === 'transform'
                      ? 'Nudge & Transform'
                      : 'Selection Mode'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-[#8D7666]">
                  {splineMode} mode
                </span>
              </div>

              {/* A. DRAW MODE */}
              {splineMode === 'draw' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-[#5C4638]">Path Points:</span>
                      <span className="font-bold text-[#B85F45]">
                        {currentSplinePoints.length} {currentSplinePoints.length < 2 ? '(Min 2 needed)' : '✓ Ready'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          const id = finishSpline();
                          if (id) {
                            setToastMessage('Path created on fort terrain!');
                          }
                        }}
                        disabled={currentSplinePoints.length < 2}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          currentSplinePoints.length >= 2
                            ? 'bg-[#E85D04] text-white hover:bg-[#D05303] cursor-pointer'
                            : 'bg-[#DFCDBD] text-[#8D7666] cursor-not-allowed opacity-60'
                        }`}
                      >
                        <TbCheck className="w-4 h-4" />
                        Finish Path
                      </button>

                      {currentSplinePoints.length > 0 && (
                        <button
                          onClick={cancelSpline}
                          title="Cancel Path"
                          className="p-2 rounded-xl bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD] cursor-pointer"
                        >
                          <TbX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Spline Types */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8D7666] uppercase">Feature Type to Place</label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      {[
                        { id: 'steps' as SplineConversionType, label: 'Steps', icon: TbStairs },
                        { id: 'flags' as SplineConversionType, label: 'Flags', icon: TbFlag },
                        { id: 'diyas' as SplineConversionType, label: 'Diyas', icon: TbFlame },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = splineConversionType === t.id;

                        return (
                          <button
                            key={t.id}
                            onClick={() => handleConversionTypeChange(t.id)}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#4B382C] text-[#FAF8F5] border-[#38281E] shadow-sm'
                                : 'bg-[#FAF8F5] text-[#4B382C] border-[#D9C9B4] hover:bg-[#EADECF]'
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-0.5 text-[#B85F45]" />
                            <span className="font-semibold text-[10px]">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specs */}
                  {splineConversionType === 'steps' && (
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Stair Width</span>
                          <span className="text-[#8D7666]">{((splineSettings.stepWidth || 0.06) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.03"
                          max="0.15"
                          step="0.01"
                          value={splineSettings.stepWidth || 0.06}
                          onChange={(e) => setSplineSettings({ stepWidth: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Tread Depth</span>
                          <span className="text-[#8D7666]">{((splineSettings.stepRun || 0.025) * 100).toFixed(1)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.015"
                          max="0.06"
                          step="0.005"
                          value={splineSettings.stepRun || 0.025}
                          onChange={(e) => setSplineSettings({ stepRun: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Step Rise Height</span>
                          <span className="text-[#8D7666]">{((splineSettings.stepRise || 0.01) * 100).toFixed(1)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.03"
                          step="0.002"
                          value={splineSettings.stepRise || 0.01}
                          onChange={(e) => setSplineSettings({ stepRise: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Step Spacing</span>
                          <span className="text-[#8D7666]">{((splineSettings.stepSpacing || 0.025) * 100).toFixed(1)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.015"
                          max="0.06"
                          step="0.005"
                          value={splineSettings.stepSpacing || 0.025}
                          onChange={(e) => setSplineSettings({ stepSpacing: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Path Offset</span>
                          <span className="text-[#8D7666]">{((splineSettings.stepOffset || 0.0) * 100).toFixed(1)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="-0.05"
                          max="0.05"
                          step="0.005"
                          value={splineSettings.stepOffset || 0.0}
                          onChange={(e) => setSplineSettings({ stepOffset: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Step Scale</span>
                          <span className="text-[#8D7666]">{(splineSettings.scale || 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={splineSettings.scale || 1.0}
                          onChange={(e) => setSplineSettings({ scale: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {splineConversionType !== 'steps' && (
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Item Spacing</span>
                          <span className="text-[#8D7666]">{((splineSettings.spacing || 0.20) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.80"
                          step="0.05"
                          value={splineSettings.spacing || 0.20}
                          onChange={(e) => setSplineSettings({ spacing: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Path Offset</span>
                          <span className="text-[#8D7666]">{((splineSettings.stepOffset || 0.0) * 100).toFixed(1)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="-0.10"
                          max="0.10"
                          step="0.01"
                          value={splineSettings.stepOffset || 0.0}
                          onChange={(e) => setSplineSettings({ stepOffset: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Item Scale</span>
                          <span className="text-[#8D7666]">{(splineSettings.scale || 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={splineSettings.scale || 1.0}
                          onChange={(e) => setSplineSettings({ scale: parseFloat(e.target.value) })}
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* B. TRANSFORM MODE */}
              {splineMode === 'transform' && (
                <div className="space-y-3">
                  {selectedSplineId ? (
                    <div className="space-y-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4]">
                      <div className="text-xs font-bold text-[#4B382C]">Camera-Relative Nudge</div>

                      {/* Directional Move Grid: Up/Forward/Down in Row 1; Left/Backward/Right in Row 2 */}
                      <div>
                        <div className="text-[10px] font-bold text-[#8D7666] uppercase mb-1">
                          Move in 3D View
                        </div>
                        <div className="space-y-1.5">
                          {/* Row 1: Up, Forward, Down */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => moveSplineCameraRelative('up')}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center"
                              title="Move Vertically Up (+Y)"
                            >
                              ↑ Up
                            </button>
                            <button
                              onClick={() => moveSplineCameraRelative('forward')}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center"
                              title="Move Forward in Camera View"
                            >
                              ▲ Forward
                            </button>
                            <button
                              onClick={() => moveSplineCameraRelative('down')}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center"
                              title="Move Vertically Down (-Y)"
                            >
                              ↓ Down
                            </button>
                          </div>

                          {/* Row 2: Left, Backward, Right */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => moveSplineCameraRelative('left')}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center"
                              title="Move Left in Camera View"
                            >
                              ◀ Left
                            </button>
                            <button
                              onClick={() => moveSplineCameraRelative('backward')}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center"
                              title="Move Backward in Camera View"
                            >
                              ▼ Backward
                            </button>
                            <button
                              onClick={() => moveSplineCameraRelative('right')}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center"
                              title="Move Right in Camera View"
                            >
                              ▶ Right
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Rotate */}
                      <div>
                        <div className="text-[10px] font-bold text-[#8D7666] uppercase mb-1">Rotate</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => rotateSpline(selectedSplineId, -15)}
                            className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-semibold text-xs cursor-pointer text-center"
                          >
                            ⟲ -15°
                          </button>
                          <button
                            onClick={() => rotateSpline(selectedSplineId, 15)}
                            className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-semibold text-xs cursor-pointer text-center"
                          >
                            ⟳ +15°
                          </button>
                        </div>
                      </div>

                      {/* Scale Individual Items along curve */}
                      <div>
                        <div className="text-[10px] font-bold text-[#8D7666] uppercase mb-1">
                          Scale Item Size
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => scaleSplineItem(selectedSplineId, 0.9)}
                            className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-semibold text-xs cursor-pointer text-center"
                            title="Make individual steps/flags 10% smaller"
                          >
                            ➖ Smaller
                          </button>
                          <button
                            onClick={() => scaleSplineItem(selectedSplineId, 1.1)}
                            className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-semibold text-xs cursor-pointer text-center"
                            title="Make individual steps/flags 10% larger"
                          >
                            ➕ Larger
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-xs text-[#634E40]">
                      <div className="font-semibold text-[#4B382C]">
                        {splines.length === 0
                          ? 'No paths placed yet.'
                          : 'Select a path to transform:'}
                      </div>
                      <div className="text-[11px] text-[#7A6454]">
                        {splines.length === 0
                          ? 'Switch to Draw mode to create stone steps, flags, or diyas.'
                          : 'Click any path directly in the 3D diorama, or choose below to move, rotate, or scale it:'}
                      </div>
                      {splines.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-1 max-h-40 overflow-y-auto">
                          {splines.map((s, idx) => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSplineId(s.id)}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#EADECF] hover:bg-[#DFCDBD] font-bold text-xs text-[#4B382C] transition-colors truncate cursor-pointer"
                            >
                              {s.name || `${s.type === 'steps' ? 'Stone Steps' : s.type === 'flags' ? 'Bhagwa Flags' : 'Festive Diyas'} ${idx + 1}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* C. SELECT MODE: With Deselect, Delete, Edit buttons */}
              {splineMode === 'select' && (
                <div className="space-y-3">
                  {selectedSpline ? (
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-[#8D7666] uppercase">Selected Path</div>
                        <div className="text-xs font-bold text-[#4B382C] mt-0.5 truncate">
                          {selectedSpline.name || `${selectedSpline.type} feature`}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => setSelectedSplineId(null)}
                          className="w-full py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <TbX className="w-3.5 h-3.5" />
                          Deselect
                        </button>

                        <button
                          onClick={() => {
                            deleteSpline(selectedSpline.id);
                            setSelectedSplineId(null);
                          }}
                          className="w-full py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <TbTrash className="w-3.5 h-3.5" />
                          Delete
                        </button>

                        <button
                          onClick={() => setSplineMode('transform')}
                          className="w-full py-1.5 text-xs font-semibold bg-[#4B382C] text-[#FAF8F5] rounded-lg hover:bg-[#38281E] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <TbArrowsMove className="w-3.5 h-3.5" />
                          Transform
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-xs text-[#634E40] space-y-2">
                      <div className="font-bold text-[#4B382C] flex items-center gap-1.5">
                        <TbPointer className="w-4 h-4 text-[#B85F45]" />
                        Select & Inspect
                      </div>
                      <p className="leading-relaxed">
                        Click any path, stone steps, or diya trail in the diorama or outliner to view its dimensions, rename it, or remove it.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. TERRAIN SCULPTING TOOL (Sliders only; modes on right)  */}
          {/* ======================================================== */}
          {activeTool === 'terrain' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4]">
                <div className="flex items-center gap-1.5 font-bold text-[#4B382C]">
                  <TbMountain className="w-4 h-4 text-[#B85F45]" />
                  <span>
                    {terrainSubTool === 'elevate'
                      ? 'Peak Sculpting'
                      : terrainSubTool === 'plateau'
                      ? 'Plateau Flattening'
                      : terrainSubTool === 'slope'
                      ? 'Ramp Grading'
                      : terrainSubTool === 'lower'
                      ? 'Gorge Excavation'
                      : terrainSubTool === 'trench'
                      ? 'Trench Carving'
                      : terrainSubTool === 'smooth'
                      ? 'Terrain Smoothing'
                      : terrainSubTool === 'pond'
                      ? 'Pond Basin'
                      : 'Mud Retexturing'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-[#8D7666]">
                  {terrainSubTool}
                </span>
              </div>

              {/* Sliders for active terrain brush */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                    <span>Brush Radius</span>
                    <span className="text-[#8D7666]">{brushRadius.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={brushRadius}
                    onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                    className="w-full accent-[#B85F45] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                    <span>Brush Strength</span>
                    <span className="text-[#8D7666]">{(brushStrength * 100).toFixed(0)}%</span>
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

                {terrainSubTool === 'plateau' && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                      <span>Target Height</span>
                      <span className="text-[#8D7666]">{plateauHeight.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.05"
                      value={plateauHeight}
                      onChange={(e) => setPlateauHeight(parseFloat(e.target.value))}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>
                )}

                {terrainSubTool === 'slope' && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                      <span>Slope Incline Angle</span>
                      <span className="text-[#8D7666]">{slopeAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="75"
                      step="5"
                      value={slopeAngle}
                      onChange={(e) => setSlopeAngle(parseInt(e.target.value, 10))}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-[#D9C9B4]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#4B382C]">Lock Mud Sculpting</span>
                    <input
                      type="checkbox"
                      checked={mudLocked}
                      onChange={(e) => setMudLocked(e.target.checked)}
                      className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. PAINT TOOL                                             */}
          {/* ======================================================== */}
          {activeTool === 'paint' && (
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-[#8D7666] uppercase">Courtyard Pigments</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Basalt Charcoal', color: '#2B1E16' },
                  { name: 'Red Laterite', color: '#B85F45' },
                  { name: 'Courtyard Sand', color: '#D8C09D' },
                  { name: 'Lime Mortar', color: '#FAF8F5' },
                  { name: 'Wet Silt', color: '#4B382C' },
                  { name: 'Bhagwa Saffron', color: '#E85D04' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setPaintColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                    className={`h-10 rounded-xl border-2 transition-all cursor-pointer ${
                      paintColor === c.color ? 'border-amber-400 scale-105 shadow-md' : 'border-black/20 hover:scale-102'
                    }`}
                  />
                ))}
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                  <span>Brush Radius</span>
                  <span className="text-[#8D7666]">{brushRadius.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={brushRadius}
                  onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                  className="w-full accent-[#B85F45] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. FIGURINES / PROPS TOOL                                 */}
          {/* ======================================================== */}
          {activeTool === 'prop' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-center space-y-2">
                <TbUsersGroup className="w-8 h-8 mx-auto text-[#B85F45]" />
                <div className="font-bold text-[#4B382C]">Historical Figurines</div>
                <p className="text-[11px] text-[#634E40] leading-relaxed">
                  Place Mavale soldiers, royal flags, tutari musicians, and cannons on your ramparts.
                </p>
                <button
                  onClick={() => setPropDrawerOpen(true)}
                  className="w-full py-2 bg-[#4B382C] text-[#FAF8F5] rounded-xl font-bold text-xs hover:bg-[#38281E] cursor-pointer"
                >
                  Open Figurines Vault
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

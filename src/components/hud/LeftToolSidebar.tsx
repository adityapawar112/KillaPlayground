'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  TbMountain,
  TbTrendingDown,
  TbMinus,
  TbWaveSine,
  TbArrowUpRight,
  TbTexture,
  TbBrush,
  TbCheck,
  TbSparkles,
  TbPlant2,
  TbFocus2,
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
  TbPalette,
  TbTrees,
} from 'react-icons/tb';
import { useEditorStore, TerrainSubTool } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { getTextureById, TEXTURE_MANIFEST } from '@/lib/textures/textureManifest';
import { getFoliageById, FOLIAGE_MANIFEST } from '@/lib/foliage/foliageManifest';
import { getFigurineById, FIGURINE_MANIFEST } from '@/lib/figurines/figurineManifest';
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
    selectedTextureId,
    setSelectedTextureId,
    paintSubTool,
    setPaintSubTool,
    paintBrushRadius,
    setPaintBrushRadius,
    paintBrushStrength,
    setPaintBrushStrength,
    paintBrushFalloff,
    setPaintBrushFalloff,
    paintTextureRepeat,
    setPaintTextureRepeat,
    selectedFoliageId,
    foliageSubTool,
    foliageSelectMode,
    setFoliageSelectMode,
    selectedFoliageIds,
    clearFoliageSelection,
    foliageBrushRadius,
    setFoliageBrushRadius,
    foliageBrushDensity,
    setFoliageBrushDensity,
    foliageScaleJitter,
    setFoliageScaleJitter,
    foliageNormalAlign,
    setFoliageNormalAlign,
    foliageInstances,
    clearAllFoliage,
    placedProps,
    selectedPropType,
    setSelectedPropType,
    selectedPropId,
    setSelectedPropId,
    propSubTool,
    setPropSubTool,
    propPlacementScale,
    setPropPlacementScale,
    propPlacementRotation,
    setPropPlacementRotation,
    propRandomRotation,
    setPropRandomRotation,
    propNormalAlign,
    setPropNormalAlign,
    propElevationOffset,
    setPropElevationOffset,
    propEraseRadius,
    setPropEraseRadius,
    updatePropTransform,
    removeProp,
    duplicateProp,
    snapPropToSurface,
    clearAllProps,
    toggleRightSidebar,
    leftSidebarWidth: sidebarWidth,
    setLeftSidebarWidth: setSidebarWidth,
  } = useEditorStore();

  const { clearPaintTerrain, fillPaintTerrain } = useTerrainStore();

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

  const movePropCameraRelative = (dir: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down') => {
    if (!selectedPropId) return;
    const prop = placedProps.find((p) => p.id === selectedPropId);
    if (!prop) return;
    const { forward, right } = getCameraAxes();
    const STEP = 0.15;
    const V_STEP = 0.05;

    let dx = 0;
    let dy = 0;
    let dz = 0;

    if (dir === 'forward') {
      dx = forward.x * STEP;
      dz = forward.z * STEP;
    } else if (dir === 'backward') {
      dx = -forward.x * STEP;
      dz = -forward.z * STEP;
    } else if (dir === 'left') {
      dx = -right.x * STEP;
      dz = -right.z * STEP;
    } else if (dir === 'right') {
      dx = right.x * STEP;
      dz = right.z * STEP;
    } else if (dir === 'up') {
      dy = V_STEP;
    } else if (dir === 'down') {
      dy = -V_STEP;
    }

    useTerrainStore.getState().pushUndo();
    updatePropTransform(selectedPropId, {
      position: [prop.position[0] + dx, prop.position[1] + dy, prop.position[2] + dz],
    });
  };

  const rotatePropRelative = (deg: number) => {
    if (!selectedPropId) return;
    const prop = placedProps.find((p) => p.id === selectedPropId);
    if (!prop) return;
    const rad = (deg * Math.PI) / 180;
    useTerrainStore.getState().pushUndo();
    updatePropTransform(selectedPropId, {
      rotation: [prop.rotation[0], (prop.rotation[1] + rad) % (Math.PI * 2), prop.rotation[2]],
    });
  };

  const scalePropRelative = (factor: number) => {
    if (!selectedPropId) return;
    const prop = placedProps.find((p) => p.id === selectedPropId);
    if (!prop) return;
    const currentScale = prop.scale[0] || 1.0;
    const nextScale = Math.max(0.2, Math.min(3.0, +(currentScale * factor).toFixed(2)));
    useTerrainStore.getState().pushUndo();
    updatePropTransform(selectedPropId, {
      scale: [nextScale, nextScale, nextScale],
    });
  };

  if (!showLeftToolbar) return null;

  const selectedWall = walls.find((w) => w.id === selectedWallId);
  const selectedSpline = splines.find((s) => s.id === selectedSplineId);

  const isModePanelOpen =
    ['walls', 'spline', 'terrain', 'texture', 'paint', 'foliage', 'prop'].includes(activeTool) && !isToolModeMinimized;
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
          {/* 4. TEXTURE STUDIO (Ticket 06)                            */}
          {/* ======================================================== */}
          {(activeTool === 'texture' || activeTool === 'paint') && (() => {
            const currentTexture = getTextureById(selectedTextureId) || TEXTURE_MANIFEST[0];

            return (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4]">
                  <div className="flex items-center gap-1.5 font-bold text-[#4B382C]">
                    <TbTexture className="w-4 h-4 text-[#B85F45]" />
                    <span>Texture Studio</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#8D7666]">
                    {paintSubTool} mode
                  </span>
                </div>

                {/* Active Texture Card (for paint mode) */}
                {paintSubTool === 'paint' && (
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8D7666] uppercase tracking-wider">
                        Active Texture
                      </span>
                      <button
                        onClick={toggleRightSidebar}
                        className="text-[10px] font-bold text-[#B85F45] hover:text-[#8F4938] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Open Texture Asset Browser"
                      >
                        <TbPalette className="w-3.5 h-3.5" />
                        <span>Browse All 52</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E4D8CB] border border-[#D9C9B4] shrink-0">
                        <img
                          src={currentTexture.previewPath}
                          alt={currentTexture.name}
                          className="w-full h-full object-cover [image-rendering:pixelated]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#4B382C] truncate">
                          {currentTexture.name}
                        </div>
                        <div className="text-[10px] text-[#8D7666] truncate mt-0.5">
                          {currentTexture.description}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#EADECF] text-[#5C4638]">
                            {currentTexture.category}
                          </span>
                          <span className="text-[9px] text-[#8D7666]">
                            Layer {currentTexture.layerIndex}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sliders on Panel Background (Unwrapped) */}
                <div className="space-y-3 pt-1">
                  {/* Brush Radius */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                      <span>Brush Radius</span>
                      <span className="text-[#8D7666]">{paintBrushRadius.toFixed(1)}m</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={paintBrushRadius}
                      onChange={(e) => setPaintBrushRadius(parseFloat(e.target.value))}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>

                  {/* Strength */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                      <span>Strength</span>
                      <span className="text-[#8D7666]">{Math.round(paintBrushStrength * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={paintBrushStrength}
                      onChange={(e) => setPaintBrushStrength(parseFloat(e.target.value))}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>

                  {/* Edge Falloff - Paint Mode only */}
                  {paintSubTool === 'paint' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Edge Falloff</span>
                        <span className="text-[#8D7666]">{Math.round(paintBrushFalloff * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={paintBrushFalloff}
                        onChange={(e) => setPaintBrushFalloff(parseFloat(e.target.value))}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Tiling Repeat - Paint Mode only */}
                  {paintSubTool === 'paint' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Tiling Repeat</span>
                        <span className="text-[#8D7666]">{paintTextureRepeat.toFixed(0)}x</span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="32.0"
                        step="2.0"
                        value={paintTextureRepeat}
                        onChange={(e) => setPaintTextureRepeat(parseFloat(e.target.value))}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Utility Actions */}
                {paintSubTool === 'paint' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        fillPaintTerrain(currentTexture.layerIndex);
                        setToastMessage(`Flooded terrain with ${currentTexture.name}`);
                      }}
                      className="flex-1 py-1.5 px-2 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] text-[#4B382C] rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                      title="Flood entire terrain with active texture"
                    >
                      Flood Terrain
                    </button>
                    <button
                      onClick={() => {
                        clearPaintTerrain();
                        setToastMessage('Restored natural base terrain');
                      }}
                      className="flex-1 py-1.5 px-2 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[#5C4638] rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                      title="Clear all painted textures back to base soil"
                    >
                      Clear Paint
                    </button>
                  </div>
                )}

                {paintSubTool === 'erase' && (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        clearPaintTerrain();
                        setToastMessage('Restored natural base terrain');
                      }}
                      className="w-full py-1.5 px-2 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[#5C4638] rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                      title="Clear all painted textures back to base soil"
                    >
                      Clear Paint
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* 5. FOLIAGE STUDIO (Ticket 07)                            */}
          {/* ======================================================== */}
          {activeTool === 'foliage' && (() => {
            const currentFoliage = getFoliageById(selectedFoliageId) || FOLIAGE_MANIFEST[0];

            return (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4]">
                  <div className="flex items-center gap-1.5 font-bold text-[#4B382C]">
                    <TbTrees className="w-4 h-4 text-[#15803D]" />
                    <span>Foliage Studio</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#8D7666]">
                    {foliageSubTool} mode
                  </span>
                </div>

                {/* Scatter Mode: Selection Mode Toggle & Deselect All Button */}
                {foliageSubTool === 'scatter' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#8D7666] uppercase tracking-wider">
                      <span>Selection Mode</span>
                      {foliageSelectMode === 'multi' && (
                        <span className="text-[#15803D] font-bold lowercase">
                          {selectedFoliageIds.length} selected
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#EFE8DD] rounded-lg border border-[#D9C9B4]">
                      <button
                        onClick={() => setFoliageSelectMode('single')}
                        className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          foliageSelectMode === 'single'
                            ? 'bg-white text-[#4B382C] shadow-sm'
                            : 'text-[#8D7666] hover:text-[#4B382C]'
                        }`}
                      >
                        Single Select
                      </button>
                      <button
                        onClick={() => setFoliageSelectMode('multi')}
                        className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          foliageSelectMode === 'multi'
                            ? 'bg-[#15803D] text-white shadow-sm'
                            : 'text-[#8D7666] hover:text-[#4B382C]'
                        }`}
                      >
                        Multi Select
                      </button>
                    </div>

                    {/* Deselect All Button (Below the toggle) */}
                    {foliageSelectMode === 'multi' && (
                      <button
                        onClick={clearFoliageSelection}
                        disabled={selectedFoliageIds.length === 0}
                        className="w-full py-1 px-2 text-[11px] font-semibold text-[#8D7666] hover:text-[#B91C1C] hover:bg-[#FBE8E8] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#8D7666] border border-[#D9C9B4] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <TbTrash className="w-3.5 h-3.5" />
                        <span>Deselect All</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Active Species Display */}
                {foliageSubTool !== 'erase' && (
                  foliageSubTool === 'scatter' && foliageSelectMode === 'multi' ? (
                    selectedFoliageIds.length === 0 ? (
                      <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-dashed border-[#D9C9B4] text-center space-y-1">
                        <div className="text-[11px] font-semibold text-[#8D7666]">No species selected</div>
                        <div className="text-[10px] text-[#A89887]">Click items in Foliage Browser to select species for scattering</div>
                        <button
                          onClick={toggleRightSidebar}
                          className="text-[10px] font-bold text-[#15803D] hover:underline cursor-pointer inline-flex items-center gap-1 mt-1"
                        >
                          <TbTrees className="w-3 h-3" />
                          <span>Open Foliage Browser</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#8D7666] uppercase tracking-wider">
                            Active Species ({selectedFoliageIds.length})
                          </span>
                          <button
                            onClick={toggleRightSidebar}
                            className="text-[10px] font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Open Foliage Asset Browser"
                          >
                            <TbTrees className="w-3.5 h-3.5" />
                            <span>Browse All {FOLIAGE_MANIFEST.length}</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {selectedFoliageIds.slice(0, 10).map((id) => {
                            const it = getFoliageById(id);
                            if (!it) return null;
                            return (
                              <div
                                key={id}
                                title={it.name}
                                className="w-8 h-8 rounded-md bg-[#E4D8CB] border border-[#D9C9B4] p-0.5 relative group shrink-0"
                              >
                                <img
                                  src={it.previewPath}
                                  alt={it.name}
                                  className="w-full h-full object-contain [image-rendering:pixelated]"
                                />
                              </div>
                            );
                          })}
                          {selectedFoliageIds.length > 10 && (
                            <div className="w-8 h-8 rounded-md bg-[#EADECF] border border-[#D9C9B4] flex items-center justify-center text-[10px] font-bold text-[#5C4638] shrink-0">
                              +{selectedFoliageIds.length - 10}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#8D7666] uppercase tracking-wider">
                          Active Species
                        </span>
                        <button
                          onClick={toggleRightSidebar}
                          className="text-[10px] font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Open Foliage Asset Browser"
                        >
                          <TbTrees className="w-3.5 h-3.5" />
                          <span>Browse All {FOLIAGE_MANIFEST.length}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E4D8CB] border border-[#D9C9B4] shrink-0 flex items-center justify-center p-1">
                          <img
                            src={currentFoliage.previewPath}
                            alt={currentFoliage.name}
                            className="w-full h-full object-contain [image-rendering:pixelated]"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#4B382C] truncate">
                            {currentFoliage.name}
                          </div>
                          <div className="text-[10px] text-[#8D7666] truncate mt-0.5">
                            {currentFoliage.description}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#EADECF] text-[#5C4638]">
                              {currentFoliage.category.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] text-[#8D7666]">
                              {currentFoliage.defaultWidth}m × {currentFoliage.defaultHeight}m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Sliders Mounted Directly on Panel Background (bg-[#F3EBE0], NO enclosing cards) */}
                <div className="space-y-3 pt-1">
                  {/* Single Mode Placement Notice */}
                  {foliageSubTool === 'single' && (
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-[10px] text-[#5C4638] flex items-center gap-2">
                      <TbFocus2 className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span>Single placement mode: Click anywhere on terrain to plant a hero specimen.</span>
                    </div>
                  )}

                  {/* Brush Radius - For Scatter & Erase modes */}
                  {foliageSubTool !== 'single' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Brush Radius</span>
                        <span className="text-[#8D7666]">{foliageBrushRadius.toFixed(2)}m</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.05"
                        value={foliageBrushRadius}
                        onChange={(e) => setFoliageBrushRadius(parseFloat(e.target.value))}
                        className="w-full accent-[#15803D] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Density - Scatter Mode only */}
                  {foliageSubTool === 'scatter' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Density</span>
                        <span className="text-[#8D7666]">{foliageBrushDensity} per stroke</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={foliageBrushDensity}
                        onChange={(e) => setFoliageBrushDensity(parseInt(e.target.value, 10))}
                        className="w-full accent-[#15803D] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Scale Jitter - Scatter & Single modes */}
                  {foliageSubTool !== 'erase' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Scale Jitter</span>
                        <span className="text-[#8D7666]">±{Math.round(foliageScaleJitter * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="0.5"
                        step="0.05"
                        value={foliageScaleJitter}
                        onChange={(e) => setFoliageScaleJitter(parseFloat(e.target.value))}
                        className="w-full accent-[#15803D] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Normal Alignment - Scatter & Single modes */}
                  {foliageSubTool !== 'erase' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Normal Align</span>
                        <span className="text-[#8D7666]">
                          {Math.round(foliageNormalAlign * 100)}% {foliageNormalAlign === 0 ? '(Upright)' : ''}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={foliageNormalAlign}
                        onChange={(e) => setFoliageNormalAlign(parseFloat(e.target.value))}
                        className="w-full accent-[#15803D] cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Primary Action Group Card: Placed count & Clear */}
                <div className="pt-2 border-t border-[#D9C9B4] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8D7666]">
                    {foliageInstances.length} planted
                  </span>
                  <button
                    onClick={() => {
                      if (foliageInstances.length > 0) {
                        useTerrainStore.getState().pushUndo();
                        clearAllFoliage();
                      }
                    }}
                    disabled={foliageInstances.length === 0}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      foliageInstances.length > 0
                        ? 'bg-[#8F4938] text-white hover:bg-[#723627] active:scale-95 shadow-sm'
                        : 'bg-[#E4D8CB] text-[#A69485] cursor-not-allowed'
                    }`}
                    title="Clear all planted foliage across diorama"
                  >
                    <TbTrash className="w-3.5 h-3.5" />
                    <span>Clear Foliage</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* 6. FIGURINES & ASSETS TOOL (Ticket 08)                   */}
          {/* ======================================================== */}
          {activeTool === 'prop' && (() => {
            const activeFigurine = getFigurineById(selectedPropType || 'warrior') || FIGURINE_MANIFEST[0];
            const selectedProp = placedProps.find((p) => p.id === selectedPropId);
            const selectedFigurineMeta = selectedProp ? getFigurineById(selectedProp.type) : null;

            return (
              <div className="space-y-4">
                {/* 1. Header Card Badge */}
                <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#EADECF] flex items-center justify-center text-[#8F4938]">
                      <TbUsersGroup className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#4B382C]">Historical Figurines</div>
                      <div className="text-[10px] text-[#8D7666]">
                        {placedProps.length} / 250 placed
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#8D7666] bg-[#EADECF] px-2 py-0.5 rounded-full">
                    {propSubTool} mode
                  </span>
                </div>

                {/* 2. MODE A: PLACE MODE */}
                {propSubTool === 'place' && (
                  <div className="space-y-3.5">
                    {/* Active Figurine Target Preview Card */}
                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-9 h-9 rounded-lg bg-[#E8DDD0] flex items-center justify-center text-[#8F4938] shrink-0 border border-[#D9C9B4] overflow-hidden">
                          <img
                            src={activeFigurine.previewPath}
                            alt={activeFigurine.name}
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                              if (fb) (fb as HTMLElement).style.display = 'block';
                            }}
                          />
                          <TbUsersGroup className="fallback-icon hidden w-5 h-5 text-[#8F4938]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#4B382C] truncate">
                            {activeFigurine.name}
                          </div>
                          <div className="text-[10px] text-[#8D7666] truncate">
                            {activeFigurine.culturalLore || activeFigurine.category}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={toggleRightSidebar}
                        className="px-2 py-1 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg text-[10px] font-bold text-[#4B382C] cursor-pointer shrink-0 transition-colors"
                        title="Open Figurine Vault Drawer"
                      >
                        Change ➔
                      </button>
                    </div>

                    {/* Sliders mounted directly on panel background bg-[#F3EBE0] */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Placement Scale</span>
                        <span className="text-[#8D7666]">{propPlacementScale.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={2.5}
                        step={0.1}
                        value={propPlacementScale}
                        onChange={(e) => setPropPlacementScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Rotation Heading</span>
                        <span className="text-[#8D7666]">{propPlacementRotation}°</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={5}
                        value={propPlacementRotation}
                        onChange={(e) => setPropPlacementRotation(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-[#4B382C]">Randomize Heading</span>
                      <button
                        onClick={() => setPropRandomRotation(!propRandomRotation)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          propRandomRotation ? 'bg-[#15803D]' : 'bg-[#D9C9B4]'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 left-0.75 ${
                            propRandomRotation ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Align to Normal</span>
                        <span className="text-[#8D7666]">
                          {propNormalAlign === 0 ? 'Upright (0%)' : `${Math.round(propNormalAlign * 100)}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.0}
                        max={1.0}
                        step={0.05}
                        value={propNormalAlign}
                        onChange={(e) => setPropNormalAlign(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Elevation Offset</span>
                        <span className="text-[#8D7666]">{(propElevationOffset * 100).toFixed(0)}cm</span>
                      </div>
                      <input
                        type="range"
                        min={-0.10}
                        max={0.30}
                        step={0.01}
                        value={propElevationOffset}
                        onChange={(e) => setPropElevationOffset(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-[11px] text-[#634E40] space-y-2">
                      <p className="leading-snug">
                        Left-click on mountain terrain, ramparts, or bastions to place instances. Right-drag to orbit camera.
                      </p>
                      <button
                        onClick={toggleRightSidebar}
                        className="w-full py-1.5 bg-[#4B382C] text-[#FAF8F5] rounded-lg font-bold text-xs hover:bg-[#38281E] cursor-pointer"
                      >
                        Browse All 29 Figurines
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. MODE B: SELECT MODE */}
                {propSubTool === 'select' && (
                  <div className="space-y-3.5">
                    {selectedProp ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#4B382C]">
                              {selectedFigurineMeta?.name || selectedProp.type}
                            </span>
                            <span className="text-[10px] text-[#8D7666] font-mono">
                              {selectedProp.id.slice(-6)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-[#634E40] bg-[#EADECF] p-2 rounded-lg">
                            <div>
                              <span className="text-[#8D7666] block">X:</span>
                              <span className="font-bold">{selectedProp.position[0].toFixed(2)}m</span>
                            </div>
                            <div>
                              <span className="text-[#8D7666] block">Y:</span>
                              <span className="font-bold">{selectedProp.position[1].toFixed(2)}m</span>
                            </div>
                            <div>
                              <span className="text-[#8D7666] block">Z:</span>
                              <span className="font-bold">{selectedProp.position[2].toFixed(2)}m</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => duplicateProp(selectedProp.id)}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs text-[#4B382C] cursor-pointer transition-colors"
                            >
                              + Duplicate
                            </button>
                            <button
                              onClick={() => snapPropToSurface(selectedProp.id)}
                              className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs text-[#4B382C] cursor-pointer transition-colors"
                            >
                              Snap to Surface
                            </button>
                          </div>

                          <button
                            onClick={() => setPropSubTool('transform')}
                            className="w-full py-1.5 bg-[#B85F45] text-white hover:bg-[#A04F38] rounded-lg font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                          >
                            <TbArrowsMove className="w-3.5 h-3.5" />
                            <span>Transform & Nudge</span>
                          </button>

                          <button
                            onClick={() => removeProp(selectedProp.id)}
                            className="w-full py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            <TbTrash className="w-3.5 h-3.5" />
                            <span>Delete Figurine</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-center space-y-2">
                        <TbPointer className="w-6 h-6 mx-auto text-[#8D7666]" />
                        <div className="text-xs font-bold text-[#4B382C]">Select Figurine</div>
                        <p className="text-[11px] text-[#634E40] leading-relaxed">
                          Click on any placed figurine in the 3D diorama to inspect, duplicate, move, or delete it.
                        </p>
                      </div>
                    )}

                    {placedProps.length > 0 && (
                      <div className="pt-2 border-t border-[#D9C9B4]">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove all placed figurines from the diorama?')) {
                              clearAllProps();
                            }
                          }}
                          className="w-full py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Clear All {placedProps.length} Figurines
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. MODE C: TRANSFORM MODE */}
                {propSubTool === 'transform' && (
                  <div className="space-y-3.5">
                    {selectedProp ? (
                      <div className="space-y-3.5">
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2">
                          <div className="text-xs font-bold text-[#4B382C]">Camera-Relative Nudge</div>
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => movePropCameraRelative('up')}
                                className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center text-[#4B382C]"
                                title="Move Vertically Up (+Y)"
                              >
                                ↑ Up
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('forward')}
                                className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center text-[#4B382C]"
                                title="Move Forward in Camera View"
                              >
                                ▲ Forward
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('down')}
                                className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center text-[#4B382C]"
                                title="Move Vertically Down (-Y)"
                              >
                                ↓ Down
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => movePropCameraRelative('left')}
                                className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center text-[#4B382C]"
                                title="Move Left in Camera View"
                              >
                                ◀ Left
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('backward')}
                                className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center text-[#4B382C]"
                                title="Move Backward in Camera View"
                              >
                                ▼ Backward
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('right')}
                                className="py-1.5 bg-[#EADECF] hover:bg-[#DFCDBD] rounded-lg font-bold text-xs cursor-pointer text-center text-[#4B382C]"
                                title="Move Right in Camera View"
                              >
                                ▶ Right
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                            <span>Heading Rotation</span>
                            <span className="text-[#8D7666]">
                              {Math.round(((selectedProp.rotation[1] * 180) / Math.PI + 360) % 360)}°
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                            <button
                              onClick={() => rotatePropRelative(-15)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#4B382C]"
                            >
                              ⟲ -15°
                            </button>
                            <button
                              onClick={() => rotatePropRelative(15)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#4B382C]"
                            >
                              ⟳ +15°
                            </button>
                            <button
                              onClick={() => rotatePropRelative(180)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#4B382C]"
                            >
                              ⟳ 180°
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                            <span>Scale Multiplier</span>
                            <span className="text-[#8D7666]">{selectedProp.scale[0].toFixed(2)}x</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                            <button
                              onClick={() => scalePropRelative(0.9)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#4B382C]"
                            >
                              -10%
                            </button>
                            <button
                              onClick={() => scalePropRelative(1.1)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#4B382C]"
                            >
                              +10%
                            </button>
                            <button
                              onClick={() => {
                                updatePropTransform(selectedProp.id, { scale: [1, 1, 1] });
                              }}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#4B382C]"
                            >
                              1.0x
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#D9C9B4] space-y-2">
                          <button
                            onClick={() => snapPropToSurface(selectedProp.id)}
                            className="w-full py-1.5 bg-[#FAF8F5] border border-[#D9C9B4] hover:bg-[#EADECF] rounded-lg text-xs font-bold cursor-pointer text-[#4B382C]"
                          >
                            Snap Flush to Surface
                          </button>
                          <button
                            onClick={() => removeProp(selectedProp.id)}
                            className="w-full py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            Delete Figurine
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-center space-y-2">
                        <TbArrowsMove className="w-6 h-6 mx-auto text-[#8D7666]" />
                        <div className="text-xs font-bold text-[#4B382C]">Transform Figurine</div>
                        <p className="text-[11px] text-[#634E40] leading-relaxed">
                          Please select a figurine first to adjust its position, rotation, or scale.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. MODE D: ERASE MODE */}
                {propSubTool === 'erase' && (
                  <div className="space-y-3.5">
                    {/* Brush Radius Slider mounted directly on panel background */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Brush Radius</span>
                        <span className="text-[#8D7666]">{propEraseRadius.toFixed(1)}m</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={2.5}
                        step={0.1}
                        value={propEraseRadius}
                        onChange={(e) => setPropEraseRadius(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#E4D8CB] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-center space-y-1.5">
                      <TbTrash className="w-5 h-5 mx-auto text-red-500" />
                      <div className="text-xs font-bold text-[#4B382C]">Erase Brush</div>
                      <p className="text-[11px] text-[#634E40] leading-relaxed">
                        Click or drag on the diorama or outliner to remove figurines within the brush radius.
                      </p>
                    </div>

                    {placedProps.length > 0 && (
                      <div className="pt-2 border-t border-[#D9C9B4]">
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove all ${placedProps.length} placed figurines from the diorama?`)) {
                              clearAllProps();
                            }
                          }}
                          className="w-full py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Clear All {placedProps.length} Figurines
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </aside>
    </>
  );
};

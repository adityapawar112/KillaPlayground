'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Mountain,
  TrendingDown,
  Minus,
  Activity,
  ArrowUpRight,
  Layers,
  Paintbrush,
  Check,
  Sparkles,
  Sprout,
  Focus,
  Lock,
  Castle,
  Route,
  Users,
  Droplets,
  SlidersHorizontal,
  ChevronLeft,
  ChevronDown,
  MousePointer,
  Pencil,
  DoorOpen,
  TowerControl,
  Trash2,
  Plus,
  Box,
  Flag,
  Flame,
  Footprints,
  X,
  Move,
  Palette,
  Trees,
  RefreshCw,
  CircleDot,
  Eye,
  Sun,
  Moon,
  Clock,
  Compass,
  Camera,
  RotateCw,
  RotateCcw,
  Clapperboard,
  Sunrise,
  Sunset,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import { useEditorStore, TerrainSubTool } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { getAtmosphericLighting } from '@/lib/lighting/atmosphericLighting';
import { getTextureById, TEXTURE_MANIFEST, TEXTURE_CATEGORIES } from '@/lib/textures/textureManifest';
import { getFoliageById, FOLIAGE_MANIFEST, FOLIAGE_CATEGORIES } from '@/lib/foliage/foliageManifest';
import { getFigurineById, FIGURINE_MANIFEST } from '@/lib/figurines/figurineManifest';
import { getLightById, LIGHTING_MANIFEST } from '@/lib/lighting/lightingManifest';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { SplineConversionType } from '@/lib/spline/splineTypes';
import { FortStampType } from '@/lib/walls/wallTypes';

const STORAGE_WIDTH_KEY = 'killa_sidebar_width_v1';

export const LeftToolSidebar: React.FC<{ isDrawer?: boolean }> = ({ isDrawer = false }) => {
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
    isToolRailCompact,
    isMobileTopBarMinimized,
    setPropDrawerOpen,
    walls,
    wallMode,
    setWallMode,
    buildingMode,
    foundations,
    activeFoundationDraft,
    selectedFoundationId,
    setSelectedFoundationId,
    defaultFoundationHeight,
    setDefaultFoundationHeight,
    defaultFoundationOffset,
    setDefaultFoundationOffset,
    defaultFoundationTiling,
    setDefaultFoundationTiling,
    deleteFoundation,
    stairs,
    activeStairDraft,
    selectedStairId,
    setSelectedStairId,
    stairSettings,
    setStairSettings,
    finishStairs,
    cancelStairs,
    deleteStair,
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
    removeRoundBastionFromWall,
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
    openDestructiveConfirm,
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
    placedLights,
    selectedLightType,
    setSelectedLightType,
    selectedLightId,
    setSelectedLightId,
    lightingSubTool,
    setLightingSubTool,
    lightPlacementScale,
    setLightPlacementScale,
    lightPlacementRotation,
    setLightPlacementRotation,
    lightRandomRotation,
    setLightRandomRotation,
    lightNormalAlign,
    setLightNormalAlign,
    lightElevationOffset,
    setLightElevationOffset,
    lightBurstHeight,
    setLightBurstHeight,
    lightRandomBurstHeight,
    setLightRandomBurstHeight,
    lightEraseRadius,
    setLightEraseRadius,
    updateLightTransform,
    removeLight,
    duplicateLight,
    snapLightToSurface,
    clearAllLights,
    triggerTestFirework,
    timeOfDay,
    setTimeOfDay,
    sunElevation,
    setSunElevation,
    sunAzimuth,
    setSunAzimuth,
    setSunDirectionPreset,
    nightMode,
    isPlaying,
    togglePlay,
    viewMode,
    setViewMode,
    turntableSpeed,
    setTurntableSpeed,
    cameraFov,
    setCameraFov,
    fogDensityMultiplier,
    setFogDensityMultiplier,
    bounceIntensityMultiplier,
    setBounceIntensityMultiplier,
    exposureMultiplier,
    setExposureMultiplier,
    resetAtmosphericModifiers,
    fireworkSalvoEndTime,
    triggerFiveSecondSalvo,
    setPosterModalOpen,
    toggleRightSidebar,
    leftSidebarWidth: sidebarWidth,
    setLeftSidebarWidth: setSidebarWidth,
  } = useEditorStore();

  const { clearPaintTerrain, fillPaintTerrain } = useTerrainStore();

  const { t, locale } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasAdvanced = useMemo(() => {
    if (activeTool === 'building' || activeTool === 'walls') {
      return buildingMode === 'walls';
    }
    if (activeTool === 'texture') {
      return paintSubTool === 'paint';
    }
    if (activeTool === 'foliage') {
      return foliageSubTool !== 'erase';
    }
    if (activeTool === 'prop') {
      return propSubTool === 'place';
    }
    if (activeTool === 'lighting') {
      return lightingSubTool === 'place';
    }
    if (activeTool === 'view') {
      return true;
    }
    return false;
  }, [activeTool, buildingMode, paintSubTool, foliageSubTool, propSubTool, lightingSubTool]);

  const renderSectionHeader = (title: string, onReset?: () => void) => (
    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7C7267] pt-2 pb-0.5 border-b border-[#D8D1C5]/70 flex items-center justify-between">
      <span>{title}</span>
      {onReset && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="p-0.5 -mr-0.5 rounded hover:bg-[#D8D1C5] text-[#7C7267] hover:text-[#B85F45] transition-colors cursor-pointer flex items-center justify-center"
          title={t.sidebars.left.resetSection}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );

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

  // 5-second celebration salvo countdown timer
  const [salvoSecondsLeft, setSalvoSecondsLeft] = useState<number>(0);
  useEffect(() => {
    if (!fireworkSalvoEndTime) {
      setSalvoSecondsLeft(0);
      return;
    }
    const updateCountdown = () => {
      const remainingMs = fireworkSalvoEndTime - Date.now();
      if (remainingMs > 0) {
        setSalvoSecondsLeft(Math.ceil(remainingMs / 1000));
      } else {
        setSalvoSecondsLeft(0);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 200);
    return () => clearInterval(timer);
  }, [fireworkSalvoEndTime]);

  const isSalvoActive = salvoSecondsLeft > 0;
  const placedFireworksCount = useMemo(() => {
    return placedLights.filter((l) => l.category === 'fireworks').length;
  }, [placedLights]);

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

  const moveLightCameraRelative = (dir: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down') => {
    if (!selectedLightId) return;
    const light = placedLights.find((l) => l.id === selectedLightId);
    if (!light) return;
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
    updateLightTransform(selectedLightId, {
      position: [light.position[0] + dx, light.position[1] + dy, light.position[2] + dz],
    });
  };

  const rotateLightRelative = (deg: number) => {
    if (!selectedLightId) return;
    const light = placedLights.find((l) => l.id === selectedLightId);
    if (!light) return;
    const rad = (deg * Math.PI) / 180;
    useTerrainStore.getState().pushUndo();
    updateLightTransform(selectedLightId, {
      rotation: [light.rotation[0], (light.rotation[1] + rad) % (Math.PI * 2), light.rotation[2]],
    });
  };

  const scaleLightRelative = (factor: number) => {
    if (!selectedLightId) return;
    const light = placedLights.find((l) => l.id === selectedLightId);
    if (!light) return;
    const currentScale = light.scale[0] || 1.0;
    const nextScale = Math.max(0.2, Math.min(3.0, +(currentScale * factor).toFixed(2)));
    useTerrainStore.getState().pushUndo();
    updateLightTransform(selectedLightId, {
      scale: [nextScale, nextScale, nextScale],
    });
  };

  if (!isDrawer && !showLeftToolbar) return null;

  const selectedWall = walls.find((w) => w.id === selectedWallId);
  const selectedSpline = splines.find((s) => s.id === selectedSplineId);
  const selectedFoundation = foundations.find((f) => f.id === selectedFoundationId);
  const selectedStair = stairs.find((s) => s.id === selectedStairId);

  const isModePanelOpen =
    ['building', 'walls', 'spline', 'terrain', 'texture', 'paint', 'foliage', 'prop', 'lighting', 'view'].includes(activeTool) && !isToolModeMinimized;
  const propertiesTabLeft = isModePanelOpen ? (isToolRailCompact ? '56px' : '76px') : '8px';

  return (
    <>
      {/* Minimized Hanging Guide Tab (Pinned to top-left below studio header) */}
      {!isDrawer && isMobileSidebarMinimized && (
        <div
          style={{ left: propertiesTabLeft }}
          className={`fixed z-30 pointer-events-auto transition-all duration-200 ${
            !showContextualDock || isMobileTopBarMinimized ? 'top-[38px]' : 'top-[72px]'
          }`}
        >
          <button
            onClick={toggleMobileSidebar}
            className="flex items-center gap-1.5 h-[26px] px-3 py-1 bg-[#EBE6DC] hover:bg-[#D8D1C5] border-x border-b border-[#D8D1C5] rounded-b-md shadow-xs text-xs font-semibold text-[#2B2621] active:scale-95 transition-all cursor-pointer"
            title={t.sidebars.left.openProperties}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[10px] font-semibold">{t.sidebars.left.properties}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Docked Left Sidebar / Mobile Drawer Body */}
      <aside
        aria-label="Editor Sidebar"
        style={isDrawer ? undefined : { width: `${sidebarWidth}px` }}
        className={
          isDrawer
            ? "w-full h-full flex flex-col bg-transparent select-none pointer-events-auto"
            : `fixed left-0 bottom-0 z-20 flex flex-col bg-[#EBE6DC] border-r border-[#D8D1C5] shadow-lg select-none pointer-events-auto transition-all duration-200 max-w-[85vw] ${
                isMobileSidebarMinimized ? '-translate-x-full' : 'translate-x-0'
              } ${
                !showContextualDock || isMobileTopBarMinimized ? 'top-[38px]' : 'top-[72px]'
              }`
        }
      >
        {!isDrawer && (
          <>
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
            <div className="flex items-center justify-between p-3 border-b border-[#D8D1C5] shrink-0 bg-[#ECE2D5]/70">
              <div className="flex items-center gap-1.5 text-[#2B2621]">
                <SlidersHorizontal className="w-4 h-4 text-[#8F4938]" />
                <span className="text-xs font-bold uppercase tracking-wider">{t.sidebars.left.toolProperties}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold bg-[#E0D3C3] text-[#5C4638] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {((t.tools as any)[activeTool]?.label) || activeTool}
                </span>
                <button
                  onClick={toggleMobileSidebar}
                  title={t.sidebars.left.minimizeSidebar}
                  className="p-1 rounded hover:bg-[#D8C7B5] text-[#5C4638] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Scrollable Tool Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs text-[#2B2621]">
          {/* ======================================================== */}
          {/* 1. UNIFIED BUILDING CONSTRUCTION TOOL                     */}
          {/* ======================================================== */}
          {(activeTool === 'building' || activeTool === 'walls') && (
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                <div className="flex items-center gap-1.5">
                  {buildingMode === 'foundation' ? (
                    <Box className="w-4 h-4 text-[#B85F45]" />
                  ) : buildingMode === 'stairs' ? (
                    <Footprints className="w-4 h-4 text-[#B85F45]" />
                  ) : (
                    <Castle className="w-4 h-4 text-[#B85F45]" />
                  )}
                  <span className="font-bold text-[#2B2621]">
                    {buildingMode === 'walls'
                      ? 'Rampart Drafting'
                      : buildingMode === 'foundation'
                      ? 'Foundation Slab Studio'
                      : buildingMode === 'stairs'
                      ? 'Stone Stairs Studio'
                      : buildingMode === 'fortifications'
                      ? 'Fortification Studio'
                      : 'Selection Mode'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-[#7C7267]">
                  {buildingMode} mode
                </span>
              </div>

              {/* A. WALLS MODE */}
              {buildingMode === 'walls' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-[#5C4638]">Draft Points:</span>
                      <span className="font-bold text-[#B85F45]">
                        {activeWallDraft.length}{' '}
                        {activeWallDraft.length < 2 ? (
                          '(Min 2 needed)'
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <Check className="w-3.5 h-3.5" /> Ready
                          </span>
                        )}
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
                        className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm ${
                          activeWallDraft.length >= 2
                            ? 'bg-[#E85D04] text-white hover:bg-[#D05303] cursor-pointer'
                            : 'bg-[#DFCDBD] text-[#7C7267] cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {t.tools.walls.finishWall}
                      </button>

                      <button
                        onClick={() => {
                          const id = finishCurrentWall(true);
                          if (id) {
                            setToastMessage('Wall closed into a continuous loop!');
                          }
                        }}
                        disabled={activeWallDraft.length < 3}
                        title="Connect end to start point to form a closed defensive loop (min 3 points)"
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm ${
                          activeWallDraft.length >= 3
                            ? 'bg-[#8C4A32] text-white hover:bg-[#783E29] cursor-pointer'
                            : 'bg-[#DFCDBD] text-[#7C7267] cursor-not-allowed opacity-60'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t.tools.walls.closeLoop}
                      </button>

                      {activeWallDraft.length > 0 && (
                        <button
                          onClick={cancelCurrentWall}
                          title={t.tools.walls.cancelDraft}
                          className="p-2 rounded-xl bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5] cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Creation Parameters (Contextual Groupings) */}
                  <div className="space-y-3">
                    {renderSectionHeader(t.sidebars.left.geometry, () => setWallSettings({ height: 0.25, thickness: 0.15 }))}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.walls.height}</span>
                        <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{((wallSettings.height || 0.25) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.60"
                        step="0.02"
                        value={wallSettings.height || 0.25}
                        onChange={(e) => setWallSettings({ height: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.walls.thickness}</span>
                        <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{((wallSettings.thickness || 0.15) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.06"
                        max="0.30"
                        step="0.01"
                        value={wallSettings.thickness || 0.15}
                        onChange={(e) => setWallSettings({ thickness: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    {renderSectionHeader(t.sidebars.left.behavior, () => setWallSettings({ autoBastions: true }))}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#2B2621]">{t.tools.walls.autoBastions}</span>
                      <input
                        type="checkbox"
                        checked={wallSettings.autoBastions}
                        onChange={(e) => setWallSettings({ autoBastions: e.target.checked })}
                        className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {wallSettings.autoBastions && (
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.tools.walls.bastionRadius}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{((wallSettings.bastionRadius || 0.13) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.06"
                          max="0.35"
                          step="0.01"
                          value={wallSettings.bastionRadius || 0.13}
                          onChange={(e) => setWallSettings({ bastionRadius: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>
                    )}

                    {showAdvanced && (
                      <div className="space-y-2 pt-1 border-t border-[#D8D1C5]/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#2B2621]">{t.tools.walls.crenellations}</span>
                          <input
                            type="checkbox"
                            checked={wallSettings.crenellations}
                            onChange={(e) => setWallSettings({ crenellations: e.target.checked })}
                            className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                          />
                        </div>

                        {wallSettings.crenellations && (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#2B2621]">{t.tools.building.flipCrenellations}</span>
                            <input
                              type="checkbox"
                              checked={wallSettings.flipCrenellations ?? false}
                              onChange={(e) => setWallSettings({ flipCrenellations: e.target.checked })}
                              className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* B. FOUNDATION MODE */}
              {buildingMode === 'foundation' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-[#5C4638]">
                        {activeFoundationDraft?.phase === 'height'
                          ? 'Extruding Slab Height...'
                          : activeFoundationDraft
                          ? 'Drawing Foundation Base...'
                          : 'Drag-to-Build Rectangular Slab'}
                      </div>
                      {activeFoundationDraft && (
                        <button
                          onClick={() => {
                            useEditorStore.getState().setActiveFoundationDraft(null);
                            if (typeof window !== 'undefined' && (window as any).__orbitControls) {
                              (window as any).__orbitControls.enabled = true;
                            }
                            setToastMessage('Foundation draft canceled.');
                          }}
                          title="Cancel Draft"
                          className="p-1 rounded-lg bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5] cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {activeFoundationDraft ? (
                      <div className="text-[11px] text-[#B85F45] font-bold">
                        {(Math.abs(activeFoundationDraft.x2 - activeFoundationDraft.x1) * 100).toFixed(0)}cm ×{' '}
                        {(Math.abs(activeFoundationDraft.z2 - activeFoundationDraft.z1) * 100).toFixed(0)}cm
                        {activeFoundationDraft.phase === 'height' ? (
                          <span className="block text-[11px] text-[#8C4A32] font-semibold mt-0.5">
                            Height: {((activeFoundationDraft.height || 0.40) * 100).toFixed(0)} cm (Click to confirm!)
                          </span>
                        ) : (
                          <span className="block text-[10px] text-[#7C7267] font-normal mt-0.5">
                            Release mouse to adjust height
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#5A5248] leading-snug">
                        Click and drag diagonally across terrain to draw base, move mouse to adjust height, then click to place.
                      </p>
                    )}
                  </div>

                  {/* Foundation Sliders */}
                  <div className="space-y-3">
                    {renderSectionHeader(t.sidebars.left.geometry, () => {
                      setDefaultFoundationHeight(0.40);
                      setDefaultFoundationOffset(0.0);
                      setDefaultFoundationTiling(2.0);
                    })}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.walls.height}</span>
                        <span className="text-[#7C7267]">{((defaultFoundationHeight || 0.40) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="-5.00"
                        max="15.00"
                        step="0.05"
                        value={defaultFoundationHeight || 0.40}
                        onChange={(e) => setDefaultFoundationHeight(parseFloat(e.target.value))}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.building.offset}</span>
                        <span className="text-[#7C7267]">{((defaultFoundationOffset || 0.0) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="-0.50"
                        max="2.00"
                        step="0.05"
                        value={defaultFoundationOffset || 0.0}
                        onChange={(e) => setDefaultFoundationOffset(parseFloat(e.target.value))}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.building.uvTiling}</span>
                        <span className="text-[#7C7267]">{(defaultFoundationTiling || 2.0).toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="10.0"
                        step="0.5"
                        value={defaultFoundationTiling || 2.0}
                        onChange={(e) => setDefaultFoundationTiling(parseFloat(e.target.value))}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* C. STAIRS MODE */}
              {buildingMode === 'stairs' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-[#5C4638]">Stair Points:</span>
                      <span className="font-bold text-[#B85F45]">
                        {activeStairDraft.length}{' '}
                        {activeStairDraft.length < 2 ? (
                          '(Min 2 needed)'
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <Check className="w-3.5 h-3.5" /> Ready
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          const id = finishStairs();
                          if (id) {
                            setToastMessage('Stone staircase constructed!');
                          }
                        }}
                        disabled={activeStairDraft.length < 2}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          activeStairDraft.length >= 2
                            ? 'bg-[#E85D04] text-white hover:bg-[#D05303] cursor-pointer'
                            : 'bg-[#DFCDBD] text-[#7C7267] cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {t.tools.walls.finishStairs}
                      </button>

                      {activeStairDraft.length > 0 && (
                        <button
                          onClick={cancelStairs}
                          title={t.tools.building.cancelStairs}
                          className="p-2 rounded-xl bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5] cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stairway Sliders */}
                  <div className="space-y-3">
                    {renderSectionHeader(t.sidebars.left.geometry, () => {
                      setStairSettings({ scale: 2.0, stepWidth: 0.10, stepRun: 0.03, stepRise: 0.015 });
                    })}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.building.scale}</span>
                        <span className="text-[#7C7267]">{(stairSettings.scale ?? 2.0).toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={stairSettings.scale ?? 2.0}
                        onChange={(e) => setStairSettings({ scale: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.building.stepWidth}</span>
                        <span className="text-[#7C7267]">{((stairSettings.stepWidth || 0.10) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.03"
                        max="0.30"
                        step="0.01"
                        value={stairSettings.stepWidth || 0.10}
                        onChange={(e) => setStairSettings({ stepWidth: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.building.stepRun}</span>
                        <span className="text-[#7C7267]">{((stairSettings.stepRun || 0.03) * 100).toFixed(1)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.015"
                        max="0.06"
                        step="0.005"
                        value={stairSettings.stepRun || 0.03}
                        onChange={(e) => setStairSettings({ stepRun: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.tools.building.stepRise}</span>
                        <span className="text-[#7C7267]">{((stairSettings.stepRise || 0.015) * 100).toFixed(1)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.005"
                        max="0.03"
                        step="0.002"
                        value={stairSettings.stepRise || 0.015}
                        onChange={(e) => setStairSettings({ stepRise: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>Step Spacing</span>
                        <span className="text-[#7C7267]">{((stairSettings.stepSpacing || 0.03) * 100).toFixed(1)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.10"
                        step="0.005"
                        value={stairSettings.stepSpacing || 0.03}
                        onChange={(e) => setStairSettings({ stepSpacing: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>Step Offset</span>
                        <span className="text-[#7C7267]">{((stairSettings.stepOffset || 0.0) * 100).toFixed(1)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="-0.15"
                        max="0.15"
                        step="0.01"
                        value={stairSettings.stepOffset || 0.0}
                        onChange={(e) => setStairSettings({ stepOffset: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* D. FORTIFICATIONS MODE */}
              {buildingMode === 'fortifications' && (
                <div className="space-y-3.5">
                  <div className="text-[11px] text-[#5A5248] leading-relaxed">
                    {t.sidebars.left.fortificationsSubtitle}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'tower' as FortStampType, label: t.sidebars.left.fortStampWatchtower, desc: t.sidebars.left.fortStampWatchtowerDesc, icon: TowerControl },
                      { id: 'box' as FortStampType, label: t.sidebars.left.fortStampBastion, desc: t.sidebars.left.fortStampBastionDesc, icon: Castle },
                      { id: 'round_bastion' as FortStampType, label: t.sidebars.left.fortStampRoundBastion, desc: t.sidebars.left.fortStampRoundBastionDesc, icon: CircleDot },
                      { id: 'gate' as FortStampType, label: t.sidebars.left.fortStampGate, desc: t.sidebars.left.fortStampGateDesc, icon: DoorOpen },
                    ].map((stamp) => {
                      const Icon = stamp.icon;
                      const isStampActive = activeStamp === stamp.id;

                      return (
                        <button
                          key={stamp.id}
                          onClick={() => setActiveStamp(isStampActive ? null : stamp.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isStampActive
                              ? 'bg-[#2B2621] text-[#FAF8F5] border-[#38281E] shadow-md ring-2 ring-[#B85F45]'
                              : 'bg-[#FAF8F5] text-[#2B2621] border-[#D8D1C5] hover:bg-[#D8D1C5]'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1 text-[#B85F45]" />
                          <span className="font-bold text-[10px] leading-tight">{stamp.label}</span>
                          <span className="text-[8px] text-[#7C7267] leading-tight mt-0.5">{stamp.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {activeStamp && (
                    <div className="p-3 bg-[#EAE2D7] rounded-xl border border-[#B85F45]/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8F4938]">
                        <Sparkles className="w-4 h-4" />
                        {t.sidebars.left.continuousStamping}
                      </div>
                      <p className="text-[11px] text-[#5A5248] leading-snug">
                        {t.sidebars.left.continuousStampingDesc}
                      </p>
                      <button
                        onClick={() => setActiveStamp(null)}
                        className="w-full py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] border border-[#D8D1C5] rounded-lg hover:bg-[#D8D1C5] cursor-pointer"
                      >
                        {t.sidebars.left.doneStamping}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* E. SELECT MODE */}
              {buildingMode === 'select' && (
                <div className="space-y-3">
                  {selectedWall ? (
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-[#7C7267] uppercase">{t.sidebars.left.selectedWall}</div>
                        <div className="text-xs font-bold text-[#2B2621] mt-0.5 truncate">
                          {selectedWall.name || t.tools.walls.defensiveRampart}
                          {selectedComponent && (
                            <span className="text-[#B85F45] ml-1">
                              ({selectedComponent.type === 'bastion' ? `${t.sidebars.left.fortStampBastion} ${Number(selectedComponent.idOrIndex) + 1}` : selectedComponent.type === 'tower' ? t.sidebars.left.fortStampWatchtower : selectedComponent.type === 'box' ? t.sidebars.left.fortStampBastion : selectedComponent.type === 'round_bastion' ? t.sidebars.left.fortStampRoundBastion : t.sidebars.left.fortStampGate})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => {
                            setSelectedWallId(null);
                            setSelectedComponent(null);
                          }}
                          className="w-full py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t.sidebars.right.deselect}
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
                              } else if (selectedComponent.type === 'round_bastion') {
                                removeRoundBastionFromWall(selectedWall.id, String(selectedComponent.idOrIndex));
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
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.sidebars.left.delete}
                        </button>
                      </div>
                    </div>
                  ) : selectedFoundation ? (
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-[#7C7267] uppercase">{t.sidebars.left.selectedFoundation}</div>
                        <div className="text-xs font-bold text-[#2B2621] mt-0.5 truncate">
                          {selectedFoundation.name || t.tools.building.foundationTitle}
                        </div>
                        <div className="text-[11px] text-[#7C7267] mt-0.5">
                          {(selectedFoundation.length * 100).toFixed(0)}cm ×{' '}
                          {(selectedFoundation.width * 100).toFixed(0)}cm • {t.tools.building.height}: {(selectedFoundation.height * 100).toFixed(0)}cm
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => setSelectedFoundationId(null)}
                          className="w-full py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t.sidebars.right.deselect}
                        </button>

                        <button
                          onClick={() => {
                            deleteFoundation(selectedFoundation.id);
                            setSelectedFoundationId(null);
                          }}
                          className="w-full py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.sidebars.left.delete}
                        </button>
                      </div>
                    </div>
                  ) : selectedStair ? (
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-[#7C7267] uppercase">{t.sidebars.left.selectedStaircase}</div>
                        <div className="text-xs font-bold text-[#2B2621] mt-0.5 truncate">
                          {selectedStair.name || t.tools.building.stairsTitle}
                        </div>
                        <div className="text-[11px] text-[#7C7267] mt-0.5">
                          {selectedStair.points.length} {t.sidebars.right.waypoints} • {t.tools.building.stepWidth}: {(((selectedStair.settings?.stepWidth ?? 0.10)) * 100).toFixed(0)}cm
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => setSelectedStairId(null)}
                          className="w-full py-1.5 text-xs font-semibold bg-[#FAF8F5] text-[#2B2621] rounded-lg hover:bg-[#D8D1C5] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t.sidebars.right.deselect}
                        </button>

                        <button
                          onClick={() => {
                            deleteStair(selectedStair.id);
                            setSelectedStairId(null);
                          }}
                          className="w-full py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.sidebars.left.delete}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-xs text-[#5A5248] space-y-2">
                      <div className="font-bold text-[#2B2621] flex items-center gap-1.5">
                        <MousePointer className="w-4 h-4 text-[#B85F45]" />
                        {t.sidebars.left.selectAndInspect}
                      </div>
                      <p className="leading-relaxed">
                        {t.sidebars.left.selectInspectDesc}
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
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                <div className="flex items-center gap-1.5 font-bold text-[#2B2621]">
                  <Mountain className="w-4 h-4 text-[#B85F45]" />
                  <span>
                    {t.toolModeSidebar.terrainModes[terrainSubTool as keyof typeof t.toolModeSidebar.terrainModes] || terrainSubTool}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-[#7C7267]">
                  {terrainSubTool}
                </span>
              </div>

              {/* Sliders for active terrain brush (Contextual Groupings) */}
              <div className="space-y-3 pt-1">
                {renderSectionHeader(t.sidebars.left.geometry, () => {
                  setBrushRadius(0.8);
                  setBrushStrength(0.5);
                  setPlateauHeight(1.0);
                  setSlopeAngle(30);
                })}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                    <span>{t.sidebars.left.brushRadius}</span>
                    <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{brushRadius.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={brushRadius}
                    onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                    <span>{t.sidebars.left.brushStrength}</span>
                    <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{(brushStrength * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={brushStrength}
                    onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                  />
                </div>

                {terrainSubTool === 'plateau' && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                      <span>{t.sidebars.left.targetHeight}</span>
                      <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{plateauHeight.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.05"
                      value={plateauHeight}
                      onChange={(e) => setPlateauHeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                    />
                  </div>
                )}

                {terrainSubTool === 'slope' && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                      <span>{t.sidebars.left.slopeAngle}</span>
                      <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{slopeAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="75"
                      step="5"
                      value={slopeAngle}
                      onChange={(e) => setSlopeAngle(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                    />
                  </div>
                )}

                {renderSectionHeader(t.sidebars.left.behavior, () => {
                  setMudLocked(false);
                })}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.left.lockMud}</span>
                  <input
                    type="checkbox"
                    checked={mudLocked}
                    onChange={(e) => setMudLocked(e.target.checked)}
                    className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                  />
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
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                  <div className="flex items-center gap-1.5 font-bold text-[#2B2621]">
                    <Layers className="w-4 h-4 text-[#B85F45]" />
                    <span>{t.sidebars.left.textureStudio}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#7C7267]">
                    {t.toolModeSidebar.textureModes[paintSubTool as keyof typeof t.toolModeSidebar.textureModes] || paintSubTool} {t.sidebars.left.mode}
                  </span>
                </div>

                {/* Active Texture Card (for paint mode) */}
                {paintSubTool === 'paint' && (
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                        {t.sidebars.left.activeTexture}
                      </span>
                      <button
                        onClick={toggleRightSidebar}
                        className="text-[10px] font-bold text-[#B85F45] hover:text-[#8F4938] flex items-center gap-1 cursor-pointer transition-colors"
                        title={t.sidebars.right.openTextures}
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>{t.sidebars.left.browseTextures}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#D8D1C5] border border-[#D8D1C5] shrink-0">
                        <img
                          src={currentTexture.previewPath}
                          alt={currentTexture.name}
                          className="w-full h-full object-cover [image-rendering:pixelated]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#2B2621] truncate">
                          {(locale === 'mr' || locale === 'hi') && (currentTexture as { devanagari?: string }).devanagari ? (currentTexture as { devanagari?: string }).devanagari : currentTexture.name}
                        </div>
                        <div className="text-[10px] text-[#7C7267] truncate mt-0.5">
                          {currentTexture.description}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#FAF8F5] text-[#5C4638]">
                            {(locale === 'mr' || locale === 'hi') ? (TEXTURE_CATEGORIES.find(c => c.id === currentTexture.category)?.devanagari || currentTexture.category) : currentTexture.category}
                          </span>
                          <span className="text-[9px] text-[#7C7267]">
                            {t.sidebars.left.layer} {currentTexture.layerIndex}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sliders on Panel Background (Contextual Groupings) */}
                <div className="space-y-3 pt-1">
                  {renderSectionHeader(t.sidebars.left.geometry, () => {
                    setPaintBrushRadius(1.0);
                    setPaintBrushStrength(0.6);
                  })}
                  {/* Brush Radius */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                      <span>{t.sidebars.left.brushRadius}</span>
                      <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{paintBrushRadius.toFixed(1)}m</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={paintBrushRadius}
                      onChange={(e) => setPaintBrushRadius(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                    />
                  </div>

                  {/* Strength */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                      <span>{t.sidebars.left.brushStrength}</span>
                      <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{Math.round(paintBrushStrength * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={paintBrushStrength}
                      onChange={(e) => setPaintBrushStrength(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                    />
                  </div>

                  {/* Appearance - Edge Falloff (Paint Mode only) */}
                  {paintSubTool === 'paint' && (
                    <>
                      {renderSectionHeader(t.sidebars.left.appearance, () => {
                        setPaintBrushFalloff(0.5);
                        setPaintTextureRepeat(16.0);
                      })}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.edgeFalloff}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{Math.round(paintBrushFalloff * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={paintBrushFalloff}
                          onChange={(e) => setPaintBrushFalloff(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>
                      {showAdvanced && (
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                            <span>{t.sidebars.left.textureScale}</span>
                            <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{paintTextureRepeat.toFixed(0)}x</span>
                          </div>
                          <input
                            type="range"
                            min="4.0"
                            max="32.0"
                            step="2.0"
                            value={paintTextureRepeat}
                            onChange={(e) => setPaintTextureRepeat(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                          />
                        </div>
                      )}
                    </>
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
                      className="flex-1 py-1.5 px-2 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] text-[#2B2621] rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                      title="Flood entire terrain with active texture"
                    >
                      {t.sidebars.left.floodTerrain}
                    </button>
                    <button
                      onClick={() => {
                        clearPaintTerrain();
                        setToastMessage('Restored natural base terrain');
                      }}
                      className="flex-1 py-1.5 px-2 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[#5C4638] rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                      title="Clear all painted textures back to base soil"
                    >
                      {t.sidebars.left.clearPaint}
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
                      className="w-full py-1.5 px-2 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[#5C4638] rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                      title="Clear all painted textures back to base soil"
                    >
                      {t.sidebars.left.clearPaint}
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
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                  <div className="flex items-center gap-1.5 font-bold text-[#2B2621]">
                    <Trees className="w-4 h-4 text-[#15803D]" />
                    <span>{t.sidebars.left.foliageStudio}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#7C7267]">
                    {t.toolModeSidebar.foliageModes[foliageSubTool as keyof typeof t.toolModeSidebar.foliageModes] || foliageSubTool} {t.sidebars.left.mode}
                  </span>
                </div>

                {/* Scatter Mode: Selection Mode Toggle & Deselect All Button */}
                {foliageSubTool === 'scatter' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                      <span>{t.sidebars.left.selectionMode}</span>
                      {foliageSelectMode === 'multi' && (
                        <span className="text-[#15803D] font-bold lowercase">
                          {selectedFoliageIds.length} {t.sidebars.left.selectedCount}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#EFE8DD] rounded-lg border border-[#D8D1C5]">
                      <button
                        onClick={() => setFoliageSelectMode('single')}
                        className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          foliageSelectMode === 'single'
                            ? 'bg-white text-[#2B2621] shadow-sm'
                            : 'text-[#7C7267] hover:text-[#2B2621]'
                        }`}
                      >
                        {t.sidebars.left.singleSelect}
                      </button>
                      <button
                        onClick={() => setFoliageSelectMode('multi')}
                        className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          foliageSelectMode === 'multi'
                            ? 'bg-[#15803D] text-white shadow-sm'
                            : 'text-[#7C7267] hover:text-[#2B2621]'
                        }`}
                      >
                        {t.sidebars.left.multiSelect}
                      </button>
                    </div>

                    {/* Deselect All Button (Below the toggle) */}
                    {foliageSelectMode === 'multi' && (
                      <button
                        onClick={clearFoliageSelection}
                        disabled={selectedFoliageIds.length === 0}
                        className="w-full py-1 px-2 text-[11px] font-semibold text-[#7C7267] hover:text-[#B91C1C] hover:bg-[#FBE8E8] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#7C7267] border border-[#D8D1C5] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.sidebars.left.deselectAll}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Active Species Display */}
                {foliageSubTool !== 'erase' && (
                  foliageSubTool === 'scatter' && foliageSelectMode === 'multi' ? (
                    selectedFoliageIds.length === 0 ? (
                      <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-dashed border-[#D8D1C5] text-center space-y-1">
                        <div className="text-[11px] font-semibold text-[#7C7267]">{t.sidebars.left.noSpeciesSelected}</div>
                        <div className="text-[10px] text-[#A89887]">{t.sidebars.left.speciesSelectHint}</div>
                        <button
                          onClick={toggleRightSidebar}
                          className="text-[10px] font-bold text-[#15803D] hover:underline cursor-pointer inline-flex items-center gap-1 mt-1"
                        >
                          <Trees className="w-3 h-3" />
                          <span>{t.sidebars.left.openFoliageBrowser}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                            {t.sidebars.left.activeFoliage} ({selectedFoliageIds.length})
                          </span>
                          <button
                            onClick={toggleRightSidebar}
                            className="text-[10px] font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1 cursor-pointer transition-colors"
                            title={t.sidebars.right.openFoliage}
                          >
                            <Trees className="w-3.5 h-3.5" />
                            <span>{t.sidebars.left.browseFoliage}</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {selectedFoliageIds.slice(0, 10).map((id) => {
                            const it = getFoliageById(id);
                            if (!it) return null;
                            const itName = (locale === 'mr' || locale === 'hi') && (it as { devanagari?: string }).devanagari ? (it as { devanagari?: string }).devanagari : it.name;
                            return (
                              <div
                                key={id}
                                title={itName}
                                className="w-8 h-8 rounded-md bg-[#D8D1C5] border border-[#D8D1C5] p-0.5 relative group shrink-0"
                              >
                                <img
                                  src={it.previewPath}
                                  alt={itName}
                                  className="w-full h-full object-contain [image-rendering:pixelated]"
                                />
                              </div>
                            );
                          })}
                          {selectedFoliageIds.length > 10 && (
                            <div className="w-8 h-8 rounded-md bg-[#FAF8F5] border border-[#D8D1C5] flex items-center justify-center text-[10px] font-bold text-[#5C4638] shrink-0">
                              +{selectedFoliageIds.length - 10}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#7C7267] uppercase tracking-wider">
                          {t.sidebars.left.activeFoliage}
                        </span>
                        <button
                          onClick={toggleRightSidebar}
                          className="text-[10px] font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1 cursor-pointer transition-colors"
                          title={t.sidebars.right.openFoliage}
                        >
                          <Trees className="w-3.5 h-3.5" />
                          <span>{t.sidebars.left.browseFoliage}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#D8D1C5] border border-[#D8D1C5] shrink-0 flex items-center justify-center p-1">
                          <img
                            src={currentFoliage.previewPath}
                            alt={(locale === 'mr' || locale === 'hi') && (currentFoliage as { devanagari?: string }).devanagari ? (currentFoliage as { devanagari?: string }).devanagari : currentFoliage.name}
                            className="w-full h-full object-contain [image-rendering:pixelated]"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#2B2621] truncate">
                            {(locale === 'mr' || locale === 'hi') && (currentFoliage as { devanagari?: string }).devanagari ? (currentFoliage as { devanagari?: string }).devanagari : currentFoliage.name}
                          </div>
                          <div className="text-[10px] text-[#7C7267] truncate mt-0.5">
                            {currentFoliage.description}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#FAF8F5] text-[#5C4638]">
                              {(locale === 'mr' || locale === 'hi') ? (FOLIAGE_CATEGORIES.find(c => c.id === currentFoliage.category)?.devanagari || currentFoliage.category.replace('_', ' ')) : currentFoliage.category.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] text-[#7C7267]">
                              {currentFoliage.defaultWidth}m × {currentFoliage.defaultHeight}m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Parameters with Contextual Groupings */}
                <div className="space-y-3 pt-1">
                  {/* Single Mode Placement Notice */}
                  {foliageSubTool === 'single' && (
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-[10px] text-[#5C4638] flex items-center gap-2">
                      <Focus className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span>{t.sidebars.left.singlePlacementNotice}</span>
                    </div>
                  )}

                  {/* Geometry Group */}
                  {renderSectionHeader(t.sidebars.left.geometry, () => {
                    setFoliageBrushRadius(0.6);
                    setFoliageBrushDensity(6);
                  })}

                  {/* Brush Radius - For Scatter & Erase modes */}
                  {foliageSubTool !== 'single' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.left.brushRadius}</span>
                        <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{foliageBrushRadius.toFixed(2)}m</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.05"
                        value={foliageBrushRadius}
                        onChange={(e) => setFoliageBrushRadius(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#15803D]"
                      />
                    </div>
                  )}

                  {/* Density - Scatter Mode only */}
                  {foliageSubTool === 'scatter' && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.left.seedlingDensity}</span>
                        <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{foliageBrushDensity} per stroke</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={foliageBrushDensity}
                        onChange={(e) => setFoliageBrushDensity(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#15803D]"
                      />
                    </div>
                  )}

                  {/* Appearance Group */}
                  {foliageSubTool !== 'erase' && (
                    <>
                      {renderSectionHeader(t.sidebars.left.appearance, () => {
                        setFoliageScaleJitter(0.25);
                        setFoliageNormalAlign(0.15);
                      })}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.scaleJitter}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">±{Math.round(foliageScaleJitter * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.5"
                          step="0.05"
                          value={foliageScaleJitter}
                          onChange={(e) => setFoliageScaleJitter(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#15803D]"
                        />
                        {showAdvanced && (
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                              <span>{t.sidebars.left.alignToNormal}</span>
                              <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">
                                {Math.round(foliageNormalAlign * 100)}% {foliageNormalAlign === 0 ? `(${t.sidebars.left.upright})` : ''}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.0"
                              max="1.0"
                              step="0.05"
                              value={foliageNormalAlign}
                              onChange={(e) => setFoliageNormalAlign(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#15803D]"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Primary Action Group Card: Placed count & Clear */}
                <div className="pt-2 border-t border-[#D8D1C5] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#7C7267]">
                    {foliageInstances.length} {t.sidebars.left.planted}
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
                        : 'bg-[#D8D1C5] text-[#A69485] cursor-not-allowed'
                    }`}
                    title={t.sidebars.left.clearAllFoliage}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.sidebars.left.clearAllFoliage}</span>
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
                <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#8F4938]">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2B2621]">{t.sidebars.left.historicalFigurines}</div>
                      <div className="text-[10px] text-[#7C7267]">
                        {placedProps.length} / 250 {t.sidebars.left.placed}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#7C7267] bg-[#FAF8F5] px-2 py-0.5 rounded-full">
                    {t.toolModeSidebar.propModes[propSubTool as keyof typeof t.toolModeSidebar.propModes] || propSubTool} {t.sidebars.left.mode}
                  </span>
                </div>

                {/* 2. MODE A: PLACE MODE */}
                {propSubTool === 'place' && (
                  <div className="space-y-3.5">
                    {/* Active Figurine Target Preview Card */}
                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-9 h-9 rounded-lg bg-[#E8DDD0] flex items-center justify-center text-[#8F4938] shrink-0 border border-[#D8D1C5] overflow-hidden">
                          <img
                            src={activeFigurine.previewPath}
                            alt={(locale === 'mr' || locale === 'hi') && activeFigurine.devanagariName ? activeFigurine.devanagariName : activeFigurine.name}
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                              if (fb) (fb as HTMLElement).style.display = 'block';
                            }}
                          />
                          <Users className="fallback-icon hidden w-5 h-5 text-[#8F4938]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2B2621] truncate">
                            {(locale === 'mr' || locale === 'hi') && activeFigurine.devanagariName ? activeFigurine.devanagariName : activeFigurine.name}
                          </div>
                          <div className="text-[10px] text-[#7C7267] truncate">
                            {(locale === 'mr' || locale === 'hi') && (activeFigurine as { devanagariDescription?: string }).devanagariDescription
                              ? (activeFigurine as { devanagariDescription?: string }).devanagariDescription
                              : (activeFigurine.culturalLore || activeFigurine.category)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={toggleRightSidebar}
                        className="px-2 py-1 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg text-[10px] font-bold text-[#2B2621] cursor-pointer shrink-0 transition-colors"
                        title={t.sidebars.right.openFigurines}
                      >
                        <span className="flex items-center gap-0.5">{t.sidebars.left.change} <ChevronRight className="w-3 h-3" /></span>
                      </button>
                    </div>

                    {/* Sliders organized into Contextual Groups */}
                    <div className="space-y-3">
                      {renderSectionHeader(t.sidebars.left.geometry, () => {
                        setPropPlacementScale(1.0);
                        setPropPlacementRotation(0);
                        setPropRandomRotation(false);
                      })}

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.placementScale}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{propPlacementScale.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={2.5}
                          step={0.1}
                          value={propPlacementScale}
                          onChange={(e) => setPropPlacementScale(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.rotationHeading}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{propPlacementRotation}°</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={5}
                          value={propPlacementRotation}
                          onChange={(e) => setPropPlacementRotation(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.left.randomizeHeading}</span>
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

                      {renderSectionHeader(t.sidebars.left.placement, () => {
                        setPropElevationOffset(0.0);
                        setPropNormalAlign(0.0);
                      })}

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.elevationOffset}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{(propElevationOffset * 100).toFixed(0)}cm</span>
                        </div>
                        <input
                          type="range"
                          min={-0.10}
                          max={0.30}
                          step={0.01}
                          value={propElevationOffset}
                          onChange={(e) => setPropElevationOffset(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {showAdvanced && (
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                            <span>{t.sidebars.left.alignToNormal}</span>
                            <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">
                              {propNormalAlign === 0 ? `${t.sidebars.left.upright} (0%)` : `${Math.round(propNormalAlign * 100)}%`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={propNormalAlign}
                            onChange={(e) => setPropNormalAlign(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-[11px] text-[#5A5248] space-y-2">
                      <p className="leading-snug">
                        {t.sidebars.left.propHint}
                      </p>
                      <button
                        onClick={toggleRightSidebar}
                        className="w-full py-1.5 bg-[#2B2621] text-[#FAF8F5] rounded-lg font-bold text-xs hover:bg-[#38281E] cursor-pointer"
                      >
                        {t.sidebars.left.browseFigurines}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. MODE B: SELECT MODE */}
                {propSubTool === 'select' && (
                  <div className="space-y-3.5">
                    {selectedProp ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2B2621]">
                              {(locale === 'mr' || locale === 'hi') && selectedFigurineMeta?.devanagariName
                                ? selectedFigurineMeta.devanagariName
                                : (selectedFigurineMeta?.name || selectedProp.type)}
                            </span>
                            <span className="text-[10px] text-[#7C7267] font-mono">
                              {selectedProp.id.slice(-6)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-[#5A5248] bg-[#FAF8F5] p-2 rounded-lg">
                            <div>
                              <span className="text-[#7C7267] block">X:</span>
                              <span className="font-bold">{selectedProp.position[0].toFixed(2)}m</span>
                            </div>
                            <div>
                              <span className="text-[#7C7267] block">Y:</span>
                              <span className="font-bold">{selectedProp.position[1].toFixed(2)}m</span>
                            </div>
                            <div>
                              <span className="text-[#7C7267] block">Z:</span>
                              <span className="font-bold">{selectedProp.position[2].toFixed(2)}m</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => duplicateProp(selectedProp.id)}
                              className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs text-[#2B2621] cursor-pointer transition-colors"
                            >
                              + {t.sidebars.left.duplicate}
                            </button>
                            <button
                              onClick={() => snapPropToSurface(selectedProp.id)}
                              className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs text-[#2B2621] cursor-pointer transition-colors"
                            >
                              {t.sidebars.left.snapToSurface}
                            </button>
                          </div>

                          <button
                            onClick={() => setPropSubTool('transform')}
                            className="w-full py-1.5 bg-[#B85F45] text-white hover:bg-[#A04F38] rounded-lg font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Move className="w-3.5 h-3.5" />
                            <span>{t.sidebars.left.nudgePosition}</span>
                          </button>

                          <button
                            onClick={() => removeProp(selectedProp.id)}
                            className="w-full py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.sidebars.left.deleteFigurine}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-center space-y-2">
                        <MousePointer className="w-6 h-6 mx-auto text-[#7C7267]" />
                        <div className="text-xs font-bold text-[#2B2621]">{t.toolModeSidebar.propModes.select}</div>
                        <p className="text-[11px] text-[#5A5248] leading-relaxed">
                          {t.sidebars.left.selectFigurinePrompt}
                        </p>
                      </div>
                    )}

                    {placedProps.length > 0 && (
                      <div className="pt-2 border-t border-[#D8D1C5]">
                        <button
                          onClick={() => {
                            openDestructiveConfirm({
                              title: t.destructiveModal.clearFigurinesTitle,
                              description: t.destructiveModal.clearFigurinesDesc,
                              onConfirm: clearAllProps,
                            });
                          }}
                          className="w-full py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          {t.sidebars.left.clearAllFigurines} ({placedProps.length})
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
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                          <div className="text-xs font-bold text-[#2B2621]">{t.sidebars.left.cameraRelativeNudge}</div>
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => movePropCameraRelative('up')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Vertically Up (+Y)"
                              >
                                ↑ {t.sidebars.left.nudgeUp}
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('forward')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Forward in Camera View"
                              >
                                ▲ {t.sidebars.left.nudgeForward}
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('down')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Vertically Down (-Y)"
                              >
                                ↓ {t.sidebars.left.nudgeDown}
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => movePropCameraRelative('left')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Left in Camera View"
                              >
                                ◀ {t.sidebars.left.nudgeLeft}
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('backward')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Backward in Camera View"
                              >
                                ▼ {t.sidebars.left.nudgeBackward}
                              </button>
                              <button
                                onClick={() => movePropCameraRelative('right')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Right in Camera View"
                              >
                                ▶ {t.sidebars.left.nudgeRight}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                            <span>{t.sidebars.left.headingRotation}</span>
                            <span className="text-[#7C7267]">
                              {Math.round(((selectedProp.rotation[1] * 180) / Math.PI + 360) % 360)}°
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                            <button
                              onClick={() => rotatePropRelative(-15)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              ⟲ -15°
                            </button>
                            <button
                              onClick={() => rotatePropRelative(15)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              ⟳ +15°
                            </button>
                            <button
                              onClick={() => rotatePropRelative(180)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              ⟳ 180°
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                            <span>{t.sidebars.left.scaleMultiplier}</span>
                            <span className="text-[#7C7267]">{selectedProp.scale[0].toFixed(2)}x</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                            <button
                              onClick={() => scalePropRelative(0.9)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              -10%
                            </button>
                            <button
                              onClick={() => scalePropRelative(1.1)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              +10%
                            </button>
                            <button
                              onClick={() => {
                                updatePropTransform(selectedProp.id, { scale: [1, 1, 1] });
                              }}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              1.0x
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#D8D1C5] space-y-2">
                          <button
                            onClick={() => snapPropToSurface(selectedProp.id)}
                            className="w-full py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg text-xs font-bold cursor-pointer text-[#2B2621]"
                          >
                            {t.sidebars.left.snapFlushToSurface}
                          </button>
                          <button
                            onClick={() => removeProp(selectedProp.id)}
                            className="w-full py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            {t.sidebars.left.deleteFigurine}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-center space-y-2">
                        <Move className="w-6 h-6 mx-auto text-[#7C7267]" />
                        <div className="text-xs font-bold text-[#2B2621]">{t.toolModeSidebar.propModes.transform}</div>
                        <p className="text-[11px] text-[#5A5248] leading-relaxed">
                          {t.sidebars.left.selectFirstPrompt}
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
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.left.brushRadius}</span>
                        <span className="text-[#7C7267]">{propEraseRadius.toFixed(1)}m</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={2.5}
                        step={0.1}
                        value={propEraseRadius}
                        onChange={(e) => setPropEraseRadius(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-center space-y-1.5">
                      <Trash2 className="w-5 h-5 mx-auto text-red-500" />
                      <div className="text-xs font-bold text-[#2B2621]">{t.sidebars.left.eraseBrush}</div>
                      <p className="text-[11px] text-[#5A5248] leading-relaxed">
                        {t.sidebars.left.eraseBrushDesc}
                      </p>
                    </div>

                    {placedProps.length > 0 && (
                      <div className="pt-2 border-t border-[#D8D1C5]">
                        <button
                          onClick={() => {
                            openDestructiveConfirm({
                              title: t.destructiveModal.clearFigurinesTitle,
                              description: t.destructiveModal.clearFigurinesDesc,
                              onConfirm: clearAllProps,
                            });
                          }}
                          className="w-full py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          {t.sidebars.left.clearAllFigurines} ({placedProps.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* 7. FESTIVE LIGHTING & FIREWORKS STUDIO (Ticket 10)       */}
          {/* ======================================================== */}
          {activeTool === 'lighting' && (() => {
            const activeLight = getLightById(selectedLightType || 'diya_clay_01') || LIGHTING_MANIFEST[0];
            const selectedLight = placedLights.find((l) => l.id === selectedLightId);
            const selectedLightMeta = selectedLight ? getLightById(selectedLight.type) : null;

            return (
              <div className="space-y-4">
                {/* 1. Header Card Badge */}
                <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#B85F45]">
                      <Flame className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2B2621]">{t.sidebars.left.festiveLighting}</div>
                      <div className="text-[10px] text-[#7C7267]">
                        {placedLights.length} / 250 {t.sidebars.left.placed}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#7C7267] bg-[#FAF8F5] px-2 py-0.5 rounded-full">
                    {t.toolModeSidebar.lightingModes[lightingSubTool as keyof typeof t.toolModeSidebar.lightingModes] || lightingSubTool} {t.sidebars.left.mode}
                  </span>
                </div>

                {/* 2. MODE A: PLACE MODE */}
                {lightingSubTool === 'place' && (
                  <div className="space-y-3.5">
                    {/* Active Light Target Preview Card */}
                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-9 h-9 rounded-lg bg-[#E8DDD0] flex items-center justify-center text-[#8F4938] shrink-0 border border-[#D8D1C5] overflow-hidden">
                          <img
                            src={activeLight.previewPath}
                            alt={(locale === 'mr' || locale === 'hi') && activeLight.devanagariName ? activeLight.devanagariName : activeLight.name}
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                              if (fb) (fb as HTMLElement).style.display = 'block';
                            }}
                          />
                          <Flame className="fallback-icon hidden w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2B2621] truncate">
                            {(locale === 'mr' || locale === 'hi') && activeLight.devanagariName ? activeLight.devanagariName : activeLight.name}
                          </div>
                          <div className="text-[10px] text-[#7C7267] truncate">
                            {(locale === 'mr' || locale === 'hi') && (activeLight as { devanagariDescription?: string }).devanagariDescription
                              ? (activeLight as { devanagariDescription?: string }).devanagariDescription
                              : (activeLight.culturalLore || activeLight.category)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={toggleRightSidebar}
                        className="px-2 py-1 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg text-[10px] font-bold text-[#2B2621] cursor-pointer shrink-0 transition-colors"
                        title={t.sidebars.right.openLighting}
                      >
                        <span className="flex items-center gap-0.5">{t.sidebars.left.change} <ChevronRight className="w-3 h-3" /></span>
                      </button>
                    </div>

                    {/* Ticket 16: Quick Celestial Atmosphere Toggle for Lighting Place Mode */}
                    <div className="flex items-center justify-between p-1.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-[11px]">
                      <span className="text-[10px] font-semibold text-[#7C7267] pl-1">{t.celestialPresets.quickLighting}:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSunDirectionPreset('noon')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                            !nightMode && Math.abs(timeOfDay - 12) < 2
                              ? 'bg-[#2B2621] text-white shadow-2xs'
                              : 'text-[#5A5248] hover:bg-[#EBE6DC]'
                          }`}
                        >
                          {t.dioramaQuickBar.day}
                        </button>
                        <button
                          onClick={() => setSunDirectionPreset('sunset')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                            !nightMode && Math.abs(timeOfDay - 17.5) < 2
                              ? 'bg-[#2B2621] text-white shadow-2xs'
                              : 'text-[#5A5248] hover:bg-[#EBE6DC]'
                          }`}
                        >
                          {t.sidebars.left.goldenHour}
                        </button>
                        <button
                          onClick={() => setSunDirectionPreset('night')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                            nightMode
                              ? 'bg-[#2B2621] text-white shadow-2xs'
                              : 'text-[#5A5248] hover:bg-[#EBE6DC]'
                          }`}
                        >
                          {t.dioramaQuickBar.night}
                        </button>
                      </div>
                    </div>

                    {/* Sliders organized into Contextual Groups */}
                    <div className="space-y-3">
                      {renderSectionHeader(t.sidebars.left.appearance, () => {
                        setLightPlacementScale(1.0);
                        setLightPlacementRotation(0);
                        setLightRandomRotation(false);
                      })}

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.placementScale}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{lightPlacementScale.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={2.5}
                          step={0.1}
                          value={lightPlacementScale}
                          onChange={(e) => setLightPlacementScale(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.rotationHeading}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{lightPlacementRotation}°</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={5}
                          value={lightPlacementRotation}
                          onChange={(e) => setLightPlacementRotation(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.left.randomizeHeading}</span>
                        <button
                          onClick={() => setLightRandomRotation(!lightRandomRotation)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            lightRandomRotation ? 'bg-[#15803D]' : 'bg-[#D9C9B4]'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 left-0.75 ${
                              lightRandomRotation ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {renderSectionHeader(t.sidebars.left.placement, () => {
                        setLightElevationOffset(0.0);
                        setLightBurstHeight(1.2);
                        setLightRandomBurstHeight(true);
                      })}

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.elevationOffset}</span>
                          <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">{(lightElevationOffset * 100).toFixed(0)}cm</span>
                        </div>
                        <input
                          type="range"
                          min={-0.05}
                          max={0.30}
                          step={0.01}
                          value={lightElevationOffset}
                          onChange={(e) => setLightElevationOffset(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {activeLight.category === 'fireworks' && (
                        <>
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                              <span>{t.sidebars.left.burstHeight}</span>
                              <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">
                                {lightRandomBurstHeight ? 'Random' : `${(lightBurstHeight * 100).toFixed(0)}cm`}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0.4}
                              max={3.5}
                              step={0.1}
                              value={lightBurstHeight}
                              disabled={lightRandomBurstHeight}
                              onChange={(e) => setLightBurstHeight(parseFloat(e.target.value))}
                              className={`w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45] ${
                                lightRandomBurstHeight ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.left.randomizeHeading}</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={lightRandomBurstHeight}
                              onClick={() => setLightRandomBurstHeight(!lightRandomBurstHeight)}
                              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                                lightRandomBurstHeight ? 'bg-[#15803D]' : 'bg-[#D9C9B4]'
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 left-0.75 ${
                                  lightRandomBurstHeight ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </>
                      )}

                      {showAdvanced && (
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                            <span>{t.sidebars.left.alignToNormal}</span>
                            <span className="text-[#7C7267] tabular-nums font-mono text-[11px]">
                              {lightNormalAlign === 0 ? `${t.sidebars.left.upright} (0%)` : `${Math.round(lightNormalAlign * 100)}%`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={lightNormalAlign}
                            onChange={(e) => setLightNormalAlign(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-[11px] text-[#5A5248] space-y-2">
                      <p className="leading-snug">
                        {t.sidebars.left.lightHint}
                      </p>
                      <button
                        onClick={toggleRightSidebar}
                        className="w-full py-1.5 bg-[#2B2621] text-[#FAF8F5] rounded-lg font-bold text-xs hover:bg-[#38281E] cursor-pointer"
                      >
                        {t.sidebars.left.browseLights}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. MODE B: SELECT MODE */}
                {lightingSubTool === 'select' && (
                  <div className="space-y-3.5">
                    {selectedLight ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2B2621]">
                              {(locale === 'mr' || locale === 'hi') && selectedLightMeta?.devanagariName
                                ? selectedLightMeta.devanagariName
                                : (selectedLightMeta?.name || selectedLight.type)}
                            </span>
                            <span className="text-[10px] text-[#7C7267] font-mono">
                              {selectedLight.id.slice(-6)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-[#5A5248] bg-[#FAF8F5] p-2 rounded-lg">
                            <div>
                              <span className="text-[#7C7267] block">X:</span>
                              <span className="font-bold">{selectedLight.position[0].toFixed(2)}m</span>
                            </div>
                            <div>
                              <span className="text-[#7C7267] block">Y:</span>
                              <span className="font-bold">{selectedLight.position[1].toFixed(2)}m</span>
                            </div>
                            <div>
                              <span className="text-[#7C7267] block">Z:</span>
                              <span className="font-bold">{selectedLight.position[2].toFixed(2)}m</span>
                            </div>
                          </div>

                          {/* Test Firework Action Button (Fireworks only, Diyas do not need test button) */}
                          {selectedLight.category === 'fireworks' && (
                            <button
                              onClick={() => triggerTestFirework(selectedLight.id)}
                              className="w-full py-2 bg-[#F59E0B] text-[#2B1E16] hover:bg-[#D97706] rounded-lg font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="w-4 h-4 text-[#8F4938]" />
                              <span>{t.sidebars.left.testFireworkBurst}</span>
                            </button>
                          )}

                          {/* Burst Height Slider (Fireworks only) */}
                          {selectedLight.category === 'fireworks' && (
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                                <span>{t.sidebars.left.burstHeight}</span>
                                <span className="text-[#7C7267]">
                                  {(((selectedLight.burstHeight ?? (selectedLightMeta?.burstAltitude ?? 1.0))) * 100).toFixed(0)}cm
                                </span>
                              </div>
                              <input
                                type="range"
                                min={0.4}
                                max={3.5}
                                step={0.1}
                                value={selectedLight.burstHeight ?? (selectedLightMeta?.burstAltitude ?? 1.0)}
                                onChange={(e) =>
                                  updateLightTransform(selectedLight.id, { burstHeight: parseFloat(e.target.value) })
                                }
                                className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => duplicateLight(selectedLight.id)}
                              className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs text-[#2B2621] cursor-pointer transition-colors"
                            >
                              + {t.sidebars.left.duplicate}
                            </button>
                            <button
                              onClick={() => snapLightToSurface(selectedLight.id)}
                              className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs text-[#2B2621] cursor-pointer transition-colors"
                            >
                              {t.sidebars.left.snapToSurface}
                            </button>
                          </div>

                          <button
                            onClick={() => setLightingSubTool('transform')}
                            className="w-full py-1.5 bg-[#B85F45] text-white hover:bg-[#A04F38] rounded-lg font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Move className="w-3.5 h-3.5" />
                            <span>{t.sidebars.left.nudgePosition}</span>
                          </button>

                          <button
                            onClick={() => removeLight(selectedLight.id)}
                            className="w-full py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.sidebars.left.deleteLight}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-center space-y-2">
                        <MousePointer className="w-6 h-6 mx-auto text-[#7C7267]" />
                        <div className="text-xs font-bold text-[#2B2621]">{t.toolModeSidebar.lightingModes.select}</div>
                        <p className="text-[11px] text-[#5A5248] leading-relaxed">
                          {t.sidebars.left.selectLightPrompt}
                        </p>
                      </div>
                    )}

                    {placedLights.length > 0 && (
                      <div className="pt-2 border-t border-[#D8D1C5]">
                        <button
                          onClick={() => {
                            openDestructiveConfirm({
                              title: t.destructiveModal.clearLightsTitle,
                              description: t.destructiveModal.clearLightsDesc,
                              onConfirm: clearAllLights,
                            });
                          }}
                          className="w-full py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          {t.sidebars.left.clearAllLights} ({placedLights.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. MODE C: TRANSFORM MODE */}
                {lightingSubTool === 'transform' && (
                  <div className="space-y-3.5">
                    {selectedLight ? (
                      <div className="space-y-3.5">
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                          <div className="text-xs font-bold text-[#2B2621]">{t.sidebars.left.cameraRelativeNudge}</div>
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => moveLightCameraRelative('up')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Vertically Up (+Y)"
                              >
                                ↑ {t.sidebars.left.nudgeUp}
                              </button>
                              <button
                                onClick={() => moveLightCameraRelative('forward')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Forward in Camera View"
                              >
                                ▲ {t.sidebars.left.nudgeForward}
                              </button>
                              <button
                                onClick={() => moveLightCameraRelative('down')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Vertically Down (-Y)"
                              >
                                ↓ {t.sidebars.left.nudgeDown}
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => moveLightCameraRelative('left')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Left in Camera View"
                              >
                                ◀ {t.sidebars.left.nudgeLeft}
                              </button>
                              <button
                                onClick={() => moveLightCameraRelative('backward')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Backward in Camera View"
                              >
                                ▼ {t.sidebars.left.nudgeBackward}
                              </button>
                              <button
                                onClick={() => moveLightCameraRelative('right')}
                                className="py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] rounded-lg font-bold text-xs cursor-pointer text-center text-[#2B2621]"
                                title="Move Right in Camera View"
                              >
                                ▶ {t.sidebars.left.nudgeRight}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                            <span>{t.sidebars.left.headingRotation}</span>
                            <span className="text-[#7C7267]">
                              {Math.round(((selectedLight.rotation[1] * 180) / Math.PI + 360) % 360)}°
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                            <button
                              onClick={() => rotateLightRelative(-15)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              ⟲ -15°
                            </button>
                            <button
                              onClick={() => rotateLightRelative(15)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              ⟳ +15°
                            </button>
                            <button
                              onClick={() => rotateLightRelative(180)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              ⟳ 180°
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                            <span>{t.sidebars.left.scaleMultiplier}</span>
                            <span className="text-[#7C7267]">{selectedLight.scale[0].toFixed(2)}x</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                            <button
                              onClick={() => scaleLightRelative(0.9)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              -10%
                            </button>
                            <button
                              onClick={() => scaleLightRelative(1.1)}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              +10%
                            </button>
                            <button
                              onClick={() => {
                                updateLightTransform(selectedLight.id, { scale: [1, 1, 1] });
                              }}
                              className="py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg font-semibold text-xs cursor-pointer text-center text-[#2B2621]"
                            >
                              1.0x
                            </button>
                          </div>
                        </div>

                        {/* Burst Height Slider (Fireworks only) */}
                        {selectedLight.category === 'fireworks' && (
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                              <span>{t.sidebars.left.burstHeight}</span>
                              <span className="text-[#7C7267]">
                                {(((selectedLight.burstHeight ?? (selectedLightMeta?.burstAltitude ?? 1.0))) * 100).toFixed(0)}cm
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0.4}
                              max={3.5}
                              step={0.1}
                              value={selectedLight.burstHeight ?? (selectedLightMeta?.burstAltitude ?? 1.0)}
                              onChange={(e) =>
                                updateLightTransform(selectedLight.id, { burstHeight: parseFloat(e.target.value) })
                              }
                              className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                            />
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#D8D1C5] space-y-2">
                          <button
                            onClick={() => snapLightToSurface(selectedLight.id)}
                            className="w-full py-1.5 bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] rounded-lg text-xs font-bold cursor-pointer text-[#2B2621]"
                          >
                            {t.sidebars.left.snapFlushToSurface}
                          </button>
                          <button
                            onClick={() => removeLight(selectedLight.id)}
                            className="w-full py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            {t.sidebars.left.deleteLight}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-center space-y-2">
                        <Move className="w-6 h-6 mx-auto text-[#7C7267]" />
                        <div className="text-xs font-bold text-[#2B2621]">{t.toolModeSidebar.lightingModes.transform}</div>
                        <p className="text-[11px] text-[#5A5248] leading-relaxed">
                          {t.sidebars.left.selectFirstPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. MODE D: ERASE MODE */}
                {lightingSubTool === 'erase' && (
                  <div className="space-y-3.5">
                    {/* Brush Radius Slider mounted directly on panel background */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.left.brushRadius}</span>
                        <span className="text-[#7C7267]">{lightEraseRadius.toFixed(1)}m</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={2.5}
                        step={0.1}
                        value={lightEraseRadius}
                        onChange={(e) => setLightEraseRadius(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                    </div>

                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] text-center space-y-1.5">
                      <Trash2 className="w-5 h-5 mx-auto text-red-500" />
                      <div className="text-xs font-bold text-[#2B2621]">{t.sidebars.left.eraseBrush}</div>
                      <p className="text-[11px] text-[#5A5248] leading-relaxed">
                        {t.sidebars.left.eraseBrushDesc}
                      </p>
                    </div>

                    {placedLights.length > 0 && (
                      <div className="pt-2 border-t border-[#D8D1C5]">
                        <button
                          onClick={() => {
                            openDestructiveConfirm({
                              title: t.destructiveModal.clearLightsTitle,
                              description: t.destructiveModal.clearLightsDesc,
                              onConfirm: clearAllLights,
                            });
                          }}
                          className="w-full py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          {t.sidebars.left.clearAllLights} ({placedLights.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* 8. DIORAMA & SUN VIEW TOOL (Ticket 10 Skeleton / Ticket 11) */}
          {/* ======================================================== */}
          {activeTool === 'view' && (() => {
            const hours = Math.floor(timeOfDay);
            const minutes = Math.floor((timeOfDay - hours) * 60);
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const atmospheric = getAtmosphericLighting(timeOfDay, nightMode, sunElevation, sunAzimuth);
            const timePhase = atmospheric.phaseName;

            return (
              <div className="space-y-4">
                {/* 1. Header Card Badge */}
                <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#B85F45]">
                      {nightMode ? <Moon className="w-4 h-4 text-[#38BDF8]" /> : <Sun className="w-4 h-4 text-[#F59E0B]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2B2621]">{t.appMenuBar.siteTitle}</div>
                      <div className="text-[10px] text-[#7C7267]">
                        {timeStr} • {timePhase}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#7C7267] bg-[#FAF8F5] px-2 py-0.5 rounded-full">
                    {t.toolModeSidebar.viewModes[viewMode as keyof typeof t.toolModeSidebar.viewModes] || viewMode} {t.sidebars.left.mode}
                  </span>
                </div>

                {/* 1.5. Quick Fireworks Salvo Action */}
                <div className="space-y-1.5 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5]">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#2B2621]">
                    <span>{t.sidebars.left.fireworksDisplay}</span>
                    <span className="text-[10px] text-[#7C7267] font-mono">
                      {placedFireworksCount} {t.sidebars.left.placed}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      triggerFiveSecondSalvo();
                    }}
                    disabled={isSalvoActive || placedFireworksCount === 0}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                      isSalvoActive
                        ? 'bg-[#FAF8F5] text-[#7C7267] cursor-not-allowed border border-[#D8D1C5]'
                        : placedFireworksCount === 0
                        ? 'bg-[#FAF8F5] text-[#7C7267] border border-[#D8D1C5] cursor-not-allowed opacity-70'
                        : 'bg-[#B85F45] text-white hover:bg-[#A04F38] active:scale-95 border border-[#96432D]'
                    }`}
                    title={
                      placedFireworksCount === 0
                        ? 'Place fireworks in the Lighting tool to test bursts'
                        : 'Launch a 5-second celebratory salvo of all fireworks'
                    }
                  >
                    <Sparkles
                      className={`w-4 h-4 ${isSalvoActive ? 'animate-spin text-[#B85F45]' : 'text-[#F59E0B]'}`}
                    />
                    <span>
                      {isSalvoActive
                        ? `${t.sidebars.left.salvoActive} (${salvoSecondsLeft}s)...`
                        : placedFireworksCount === 0
                        ? t.sidebars.left.noFireworksPlaced
                        : t.sidebars.left.testFireworksSalvo}
                    </span>
                  </button>
                </div>

                {/* 2. Celestial Lighting Studio (Ticket 16 Review Item 14) */}
                <div className="space-y-3">
                  {renderSectionHeader(t.sidebars.left.lighting, () => {
                    resetAtmosphericModifiers();
                    setSunDirectionPreset('noon');
                  })}

                  {/* 4 Prominent Celestial Preset Cards */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {/* A. Dawn */}
                      <button
                        onClick={() => setSunDirectionPreset('dawn')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          !nightMode && Math.abs(timeOfDay - 6.0) < 1.0
                            ? 'bg-[#FAF8F5] border-2 border-[#B85F45] shadow-xs'
                            : 'bg-[#FAF8F5] border-[#D8D1C5] hover:border-[#B85F45]/50 hover:bg-[#F5EFE6]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FED7AA]/40 flex items-center justify-center shrink-0 mt-0.5 border border-[#FDBA74]/50">
                          <Sunrise className="w-4 h-4 text-[#EA580C]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2B2621]">{t.celestialPresets.dawnTitle}</span>
                            {!nightMode && Math.abs(timeOfDay - 6.0) < 1.0 && (
                              <span className="w-2 h-2 rounded-full bg-[#B85F45]" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#7C7267] leading-tight mt-0.5">
                            {t.celestialPresets.dawnDesc}
                          </p>
                        </div>
                      </button>

                      {/* B. Noon */}
                      <button
                        onClick={() => setSunDirectionPreset('noon')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          !nightMode && Math.abs(timeOfDay - 12.0) < 1.5
                            ? 'bg-[#FAF8F5] border-2 border-[#B85F45] shadow-xs'
                            : 'bg-[#FAF8F5] border-[#D8D1C5] hover:border-[#B85F45]/50 hover:bg-[#F5EFE6]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FEF08A]/40 flex items-center justify-center shrink-0 mt-0.5 border border-[#FDE047]/50">
                          <Sun className="w-4 h-4 text-[#F59E0B]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2B2621]">{t.celestialPresets.noonTitle}</span>
                            {!nightMode && Math.abs(timeOfDay - 12.0) < 1.5 && (
                              <span className="w-2 h-2 rounded-full bg-[#B85F45]" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#7C7267] leading-tight mt-0.5">
                            {t.celestialPresets.noonDesc}
                          </p>
                        </div>
                      </button>

                      {/* C. Golden Hour */}
                      <button
                        onClick={() => setSunDirectionPreset('sunset')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          !nightMode && Math.abs(timeOfDay - 17.5) < 1.5
                            ? 'bg-[#FAF8F5] border-2 border-[#B85F45] shadow-xs'
                            : 'bg-[#FAF8F5] border-[#D8D1C5] hover:border-[#B85F45]/50 hover:bg-[#F5EFE6]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FED7AA]/50 flex items-center justify-center shrink-0 mt-0.5 border border-[#FB923C]/50">
                          <Sunset className="w-4 h-4 text-[#D97706]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2B2621]">{t.celestialPresets.goldenTitle}</span>
                            {!nightMode && Math.abs(timeOfDay - 17.5) < 1.5 && (
                              <span className="w-2 h-2 rounded-full bg-[#B85F45]" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#7C7267] leading-tight mt-0.5">
                            {t.celestialPresets.goldenDesc}
                          </p>
                        </div>
                      </button>

                      {/* D. Diwali Night */}
                      <button
                        onClick={() => setSunDirectionPreset('night')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          nightMode
                            ? 'bg-[#FAF8F5] border-2 border-[#B85F45] shadow-xs'
                            : 'bg-[#FAF8F5] border-[#D8D1C5] hover:border-[#B85F45]/50 hover:bg-[#F5EFE6]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E0E7FF]/50 flex items-center justify-center shrink-0 mt-0.5 border border-[#C7D2FE]/60">
                          <Moon className="w-4 h-4 text-[#38BDF8]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2B2621]">{t.celestialPresets.nightTitle}</span>
                            {nightMode && (
                              <span className="w-2 h-2 rounded-full bg-[#B85F45]" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#7C7267] leading-tight mt-0.5">
                            {t.celestialPresets.nightDesc}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Advanced Lighting & Atmosphere Controls (Revealed by bottom ADVANCED SETTINGS checkbox) */}
                  {showAdvanced && (
                    <div className="space-y-3 pt-1">
                      {renderSectionHeader(t.celestialPresets.advancedAtmosphere, resetAtmosphericModifiers)}

                      {/* Sun Elevation */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.sidebars.left.sunElevation}</span>
                          <span className="text-[#7C7267] font-mono tabular-nums text-[11px]">{sunElevation}°</span>
                        </div>
                        <input
                          type="range"
                          min={-10}
                          max={90}
                          step={1}
                          value={sunElevation}
                          onChange={(e) => setSunElevation(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {/* Sun / Moon Azimuth */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span className="flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-[#8F4938]" />
                            <span>{t.sidebars.left.sunAzimuth}</span>
                          </span>
                          <span className="text-[#7C7267] font-mono tabular-nums text-[11px]">{sunAzimuth}°</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={1}
                          value={sunAzimuth}
                          onChange={(e) => setSunAzimuth(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {/* Time of Day */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#8F4938]" />
                            <span>{t.sidebars.left.timeOfDay}</span>
                          </span>
                          <span className="text-[#7C7267] font-mono tabular-nums text-[11px]">{timeStr}</span>
                        </div>
                        <input
                          type="range"
                          min={0.0}
                          max={24.0}
                          step={0.25}
                          value={timeOfDay}
                          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {/* Ground Light Bounce */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.celestialPresets.bounce}</span>
                          <span className="text-[#7C7267] font-mono tabular-nums text-[11px]">{bounceIntensityMultiplier.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.0}
                          max={2.5}
                          step={0.05}
                          value={bounceIntensityMultiplier}
                          onChange={(e) => setBounceIntensityMultiplier(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {/* Atmospheric Fog */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.celestialPresets.fogDensity}</span>
                          <span className="text-[#7C7267] font-mono tabular-nums text-[11px]">{fogDensityMultiplier.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.0}
                          max={2.5}
                          step={0.05}
                          value={fogDensityMultiplier}
                          onChange={(e) => setFogDensityMultiplier(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {/* Exposure */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                          <span>{t.celestialPresets.exposure}</span>
                          <span className="text-[#7C7267] font-mono tabular-nums text-[11px]">{exposureMultiplier.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.7}
                          max={1.6}
                          step={0.05}
                          value={exposureMultiplier}
                          onChange={(e) => setExposureMultiplier(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                        />
                      </div>

                      {/* 1-Click Reset to Preset Defaults Action */}
                      <button
                        onClick={resetAtmosphericModifiers}
                        className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] text-[#2B2621] transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-[#B85F45]" />
                        <span>{t.celestialPresets.resetDefaults}</span>
                      </button>
                    </div>
                  )}
                </div>

                  {/* Camera Perspectives & Settings */}
                  {renderSectionHeader(t.sidebars.left.camera, () => {
                    setCameraFov(45);
                    setTurntableSpeed(1.0);
                    setViewMode('orbit');
                    setCameraViewPreset('reset');
                  })}

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#2B2621]">{t.sidebars.left.perspectivesTitle}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setCameraViewPreset('isometric')}
                        className="py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#EAE0D3] text-[#2B2621] border border-[#D8D1C5] rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                      >
                        <Box className="w-4 h-4 text-[#7C7267]" />
                        <span>{t.sidebars.left.isometric}</span>
                      </button>
                      <button
                        onClick={() => setCameraViewPreset('top')}
                        className="py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#EAE0D3] text-[#2B2621] border border-[#D8D1C5] rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4 text-[#7C7267]" />
                        <span>{t.sidebars.left.birdsEye}</span>
                      </button>
                      <button
                        onClick={() => setCameraViewPreset('rampart')}
                        className="py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#EAE0D3] text-[#2B2621] border border-[#D8D1C5] rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                      >
                        <Castle className="w-4 h-4 text-[#7C7267]" />
                        <span>{t.sidebars.left.rampartEye}</span>
                      </button>
                      <button
                        onClick={() => setCameraViewPreset('bastion')}
                        className="py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#EAE0D3] text-[#2B2621] border border-[#D8D1C5] rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                      >
                        <Flag className="w-4 h-4 text-[#B85F45]" />
                        <span>{t.sidebars.left.bastionHero}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setCameraViewPreset('reset')}
                      className="w-full py-1 bg-[#FAF8F5] hover:bg-[#D8D1C5] text-[#2B2621] border border-[#D8D1C5] rounded-lg text-[11px] font-bold transition-colors cursor-pointer mt-1"
                    >
                      {t.sidebars.left.resetCameraHome}
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#2B2621]">
                        <span>{t.sidebars.left.cameraFov}</span>
                        <span className="text-[#7C7267] font-mono tabular-nums text-[11px]">{cameraFov}°</span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={80}
                        step={1}
                        value={cameraFov}
                        onChange={(e) => setCameraFov(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                      />
                      <div className="flex justify-between text-[9px] text-[#7C7267] mt-0.5">
                        <span>25° {t.sidebars.left.telephoto}</span>
                        <span>45° {t.sidebars.left.standard}</span>
                        <span>75° {t.sidebars.left.wide}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#2B2621] mb-1.5">
                        <span>{t.sidebars.left.turntable}</span>
                        <button
                          onClick={() => setViewMode(viewMode === 'turntable' ? 'orbit' : 'turntable')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            viewMode === 'turntable'
                              ? 'bg-[#B85F45] text-white'
                              : 'bg-[#FAF8F5] text-[#2B2621] hover:bg-[#D8D1C5]'
                          }`}
                        >
                          {viewMode === 'turntable' ? t.sidebars.left.spinningActive : t.sidebars.left.start360Spin}
                        </button>
                      </div>
                      {viewMode === 'turntable' && (
                        <div>
                          <div className="flex justify-between text-[10px] text-[#5A5248] mb-0.5">
                            <span>{t.sidebars.left.spinSpeed}</span>
                            <span className="font-mono tabular-nums text-[11px]">{turntableSpeed.toFixed(1)} RPM</span>
                          </div>
                          <input
                            type="range"
                            min={0.5}
                            max={4.0}
                            step={0.1}
                            value={turntableSpeed}
                            onChange={(e) => setTurntableSpeed(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-[#D8D1C5] rounded-lg appearance-none cursor-pointer accent-[#B85F45]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                {/* 6. Presentation Card & Actions */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D1C5] space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#8F4938]" />
                    <span className="text-xs font-bold text-[#2B2621]">{t.sidebars.left.dioramaPresentation}</span>
                  </div>
                  <p className="text-[11px] text-[#5A5248] leading-relaxed">
                    {t.sidebars.left.dioramaPresentationDesc}
                  </p>
                  <button
                    onClick={() => setPosterModalOpen(true)}
                    className="w-full py-1.5 bg-[#FAF8F5] hover:bg-[#D8D1C5] text-[#2B2621] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#B85F45]" />
                    <span>{t.sidebars.left.openPosterStudio}</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Fixed Footer: Advanced Settings Checkbox (only when hasAdvanced) */}
        {hasAdvanced && (
          <div className="shrink-0 px-3.5 py-2.5 bg-[#E4DDD3] border-t border-[#D8D1C5] flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                className="w-4 h-4 accent-[#B85F45] cursor-pointer rounded"
              />
              <span className="text-[11px] font-bold text-[#5C4638] uppercase tracking-wider">
                {t.sidebars.left.advancedSettings}
              </span>
            </label>
          </div>
        )}
      </aside>
    </>
  );
};

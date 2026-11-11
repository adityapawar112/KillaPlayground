'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import {
  Mountain,
  Castle,
  Layers,
  Trees,
  Users,
  Flame,
  Eye,
  MousePointer,
  Pencil,
  Box,
  Footprints,
  TowerControl,
  Minus,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Droplets,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';
import { useEditorStore, ToolType, BuildingMode, TerrainSubTool } from '@/lib/state/useEditorStore';
import { INTERACTION_CLASSES } from '@/lib/theme/tokens';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface RadialSlice {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  isActive: boolean;
}

export const VirtualJoystick: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
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
    activeRadialMenu,
    setActiveRadialMenu,
    mobileDrawerState,
    isPresentationMode,
    isCapturingScreenshot,
    setIsJoystickActive,
  } = useEditorStore();
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragCenterRef = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const initialTouchDistanceRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentDeltaRef = useRef({ x: 0, y: 0, r: 0 });

  // Get primary tool icon
  const getToolIcon = (tool: ToolType) => {
    switch (tool) {
      case 'building':
      case 'walls':
        return Castle;
      case 'texture':
        return Layers;
      case 'foliage':
        return Trees;
      case 'prop':
        return Users;
      case 'lighting':
        return Flame;
      case 'view':
        return Eye;
      case 'terrain':
      default:
        return Mountain;
    }
  };

  // Get tool sub-mode icon
  const getModeIcon = () => {
    switch (activeTool) {
      case 'building':
      case 'walls':
        if (buildingMode === 'foundation') return Box;
        if (buildingMode === 'stairs') return Footprints;
        if (buildingMode === 'fortifications') return TowerControl;
        if (buildingMode === 'select') return MousePointer;
        return Pencil;
      case 'terrain':
        if (terrainSubTool === 'plateau') return Minus;
        if (terrainSubTool === 'slope') return ArrowUpRight;
        if (terrainSubTool === 'lower') return TrendingDown;
        if (terrainSubTool === 'smooth') return RefreshCw;
        if (terrainSubTool === 'pond') return Droplets;
        return Mountain;
      case 'texture':
        return paintSubTool === 'erase' ? MousePointer : Pencil;
      case 'foliage':
        return foliageSubTool === 'erase' ? MousePointer : Sparkles;
      case 'prop':
        if (propSubTool === 'place') return Box;
        if (propSubTool === 'transform') return RotateCw;
        if (propSubTool === 'erase') return X;
        return MousePointer;
      case 'lighting':
        if (lightingSubTool === 'place') return Flame;
        if (lightingSubTool === 'transform') return RotateCw;
        if (lightingSubTool === 'erase') return X;
        return MousePointer;
      case 'view':
        return viewMode === 'turntable' ? RefreshCw : Eye;
      default:
        return Mountain;
    }
  };

  // Helper to query Three.js camera & controls
  const getDioramaControls = () => {
    if (typeof window === 'undefined') return null;
    return (window as any).__orbitControls || (window as any).__killa_controls || null;
  };

  const getDioramaCamera = () => {
    if (typeof window === 'undefined') return null;
    return (window as any).__threeCamera || (window as any).__killa_camera || null;
  };

  // Ensure joystick active state is cleaned up when unmounting
  useEffect(() => {
    return () => {
      setIsJoystickActive(false);
    };
  }, [setIsJoystickActive]);

  // Continuous animation loop for camera pan/orbit when joystick is tilted
  const updateCameraTransform = useCallback(() => {
    const { x, y, r } = currentDeltaRef.current;
    if (r > 4) {
      const controls = getDioramaControls();
      const camera = getDioramaCamera();

      if (controls && camera) {
        if (r <= 32) {
          // ZONE 1: CORE (Inner Ring) -> Orbit camera around controls.target
          const orbitSpeed = 0.025;
          const deltaAzimuth = (-x / 32) * orbitSpeed;
          const deltaPolar = (-y / 32) * orbitSpeed;

          const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
          const spherical = new THREE.Spherical().setFromVector3(offset);
          spherical.theta += deltaAzimuth;
          spherical.phi = THREE.MathUtils.clamp(
            spherical.phi + deltaPolar,
            controls.minPolarAngle || 0.1,
            controls.maxPolarAngle || Math.PI / 2 - 0.05
          );
          offset.setFromSpherical(spherical);
          camera.position.addVectors(controls.target, offset);
          camera.lookAt(controls.target);
          controls.update();

          if (typeof (window as any).__killa_invalidate === 'function') {
            (window as any).__killa_invalidate();
          }
        } else {
          // ZONE 2: BOUNDARY (Outer Ring) -> Pan camera
          const panSpeed = 0.04;
          const normX = x / 60;
          const normY = y / 60;

          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();

          const right = new THREE.Vector3();
          right.crossVectors(camera.up, forward).normalize();

          const panOffset = new THREE.Vector3()
            .addScaledVector(right, -normX * panSpeed)
            .addScaledVector(forward, -normY * panSpeed);

          camera.position.add(panOffset);
          controls.target.add(panOffset);
          controls.update();
        }

        if (typeof window !== 'undefined' && (window as any).__killa_invalidate) {
          (window as any).__killa_invalidate();
        }
      }
    }

    if (isDragging) {
      animFrameRef.current = requestAnimationFrame(updateCameraTransform);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      animFrameRef.current = requestAnimationFrame(updateCameraTransform);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isDragging, updateCameraTransform]);

  // Pointer interaction for Virtual Joystick
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    pointerIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    setIsJoystickActive(true);

    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerId !== pointerIdRef.current) return;

    const dx = e.clientX - dragCenterRef.current.x;
    const dy = e.clientY - dragCenterRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 60;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const clampedX = clampedDist * Math.cos(angle);
    const clampedY = clampedDist * Math.sin(angle);

    setKnobPos({ x: clampedX, y: clampedY });
    currentDeltaRef.current = { x: clampedX, y: clampedY, r: clampedDist };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== pointerIdRef.current) return;
    setIsDragging(false);
    setIsJoystickActive(false);
    setKnobPos({ x: 0, y: 0 });
    currentDeltaRef.current = { x: 0, y: 0, r: 0 };
    pointerIdRef.current = null;
  };

  // Pinch-to-zoom support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsJoystickActive(true);
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const diff = currentDist - initialTouchDistanceRef.current;

      const controls = getDioramaControls();
      const camera = getDioramaCamera();

      if (controls && camera && Math.abs(diff) > 2) {
        const zoomDelta = -diff * 0.05;
        if (controls.zoom0 !== undefined) {
          controls.dollyOut(zoomDelta > 0 ? 1.02 : 0.98);
          controls.update();
        } else {
          const dir = new THREE.Vector3();
          camera.getWorldDirection(dir);
          camera.position.addScaledVector(dir, -zoomDelta * 0.1);
          controls.update();
        }
        if (typeof window !== 'undefined' && (window as any).__killa_invalidate) {
          (window as any).__killa_invalidate();
        }
      }

      initialTouchDistanceRef.current = currentDist;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
    setIsJoystickActive(false);
  };

  // Primary Tool Radial Slices
  const primaryToolSlices: RadialSlice[] = [
    {
      id: 'terrain',
      label: 'Terrain',
      icon: Mountain,
      isActive: activeTool === 'terrain',
      onClick: () => {
        setActiveTool('terrain');
        setActiveRadialMenu('none');
      },
    },
    {
      id: 'building',
      label: 'Build',
      icon: Castle,
      isActive: activeTool === 'building' || activeTool === 'walls',
      onClick: () => {
        setActiveTool('building');
        setActiveRadialMenu('none');
      },
    },
    {
      id: 'texture',
      label: 'Texture',
      icon: Layers,
      isActive: activeTool === 'texture',
      onClick: () => {
        setActiveTool('texture');
        setActiveRadialMenu('none');
      },
    },
    {
      id: 'foliage',
      label: 'Foliage',
      icon: Trees,
      isActive: activeTool === 'foliage',
      onClick: () => {
        setActiveTool('foliage');
        setActiveRadialMenu('none');
      },
    },
    {
      id: 'prop',
      label: 'Props',
      icon: Users,
      isActive: activeTool === 'prop',
      onClick: () => {
        setActiveTool('prop');
        setActiveRadialMenu('none');
      },
    },
    {
      id: 'lighting',
      label: 'Light',
      icon: Flame,
      isActive: activeTool === 'lighting',
      onClick: () => {
        setActiveTool('lighting');
        setActiveRadialMenu('none');
      },
    },
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      isActive: activeTool === 'view',
      onClick: () => {
        setActiveTool('view');
        setActiveRadialMenu('none');
      },
    },
  ];

  // Tool Sub-Modes Slices
  const getToolModeSlices = (): RadialSlice[] => {
    switch (activeTool) {
      case 'building':
      case 'walls':
        return [
          {
            id: 'select',
            label: 'Select',
            icon: MousePointer,
            isActive: buildingMode === 'select',
            onClick: () => { setBuildingMode('select'); setActiveRadialMenu('none'); },
          },
          {
            id: 'walls',
            label: 'Walls',
            icon: Pencil,
            isActive: buildingMode === 'walls',
            onClick: () => { setBuildingMode('walls'); setActiveRadialMenu('none'); },
          },
          {
            id: 'foundation',
            label: 'Plinth',
            icon: Box,
            isActive: buildingMode === 'foundation',
            onClick: () => { setBuildingMode('foundation'); setActiveRadialMenu('none'); },
          },
          {
            id: 'stairs',
            label: 'Stairs',
            icon: Footprints,
            isActive: buildingMode === 'stairs',
            onClick: () => { setBuildingMode('stairs'); setActiveRadialMenu('none'); },
          },
          {
            id: 'fortifications',
            label: 'Buruj',
            icon: TowerControl,
            isActive: buildingMode === 'fortifications',
            onClick: () => { setBuildingMode('fortifications'); setActiveRadialMenu('none'); },
          },
        ];

      case 'terrain':
        return [
          {
            id: 'elevate',
            label: 'Raise',
            icon: Mountain,
            isActive: terrainSubTool === 'elevate',
            onClick: () => { setTerrainSubTool('elevate'); setActiveRadialMenu('none'); },
          },
          {
            id: 'plateau',
            label: 'Level',
            icon: Minus,
            isActive: terrainSubTool === 'plateau',
            onClick: () => { setTerrainSubTool('plateau'); setActiveRadialMenu('none'); },
          },
          {
            id: 'slope',
            label: 'Slope',
            icon: ArrowUpRight,
            isActive: terrainSubTool === 'slope',
            onClick: () => { setTerrainSubTool('slope'); setActiveRadialMenu('none'); },
          },
          {
            id: 'lower',
            label: 'Lower',
            icon: TrendingDown,
            isActive: terrainSubTool === 'lower',
            onClick: () => { setTerrainSubTool('lower'); setActiveRadialMenu('none'); },
          },
          {
            id: 'smooth',
            label: 'Smooth',
            icon: RefreshCw,
            isActive: terrainSubTool === 'smooth',
            onClick: () => { setTerrainSubTool('smooth'); setActiveRadialMenu('none'); },
          },
          {
            id: 'pond',
            label: 'Pond',
            icon: Droplets,
            isActive: terrainSubTool === 'pond',
            onClick: () => { setTerrainSubTool('pond'); setActiveRadialMenu('none'); },
          },
        ];

      case 'texture':
        return [
          {
            id: 'paint',
            label: 'Paint',
            icon: Pencil,
            isActive: paintSubTool === 'paint',
            onClick: () => { setPaintSubTool('paint'); setActiveRadialMenu('none'); },
          },
          {
            id: 'erase',
            label: 'Erase',
            icon: X,
            isActive: paintSubTool === 'erase',
            onClick: () => { setPaintSubTool('erase'); setActiveRadialMenu('none'); },
          },
        ];

      case 'foliage':
        return [
          {
            id: 'scatter',
            label: 'Scatter',
            icon: Sparkles,
            isActive: foliageSubTool === 'scatter',
            onClick: () => { setFoliageSubTool('scatter'); setActiveRadialMenu('none'); },
          },
          {
            id: 'single',
            label: 'Single',
            icon: Pencil,
            isActive: foliageSubTool === 'single',
            onClick: () => { setFoliageSubTool('single'); setActiveRadialMenu('none'); },
          },
          {
            id: 'erase',
            label: 'Erase',
            icon: X,
            isActive: foliageSubTool === 'erase',
            onClick: () => { setFoliageSubTool('erase'); setActiveRadialMenu('none'); },
          },
        ];

      case 'prop':
        return [
          {
            id: 'place',
            label: 'Place',
            icon: Box,
            isActive: propSubTool === 'place',
            onClick: () => { setPropSubTool('place'); setActiveRadialMenu('none'); },
          },
          {
            id: 'select',
            label: 'Select',
            icon: MousePointer,
            isActive: propSubTool === 'select',
            onClick: () => { setPropSubTool('select'); setActiveRadialMenu('none'); },
          },
          {
            id: 'transform',
            label: 'Move',
            icon: RotateCw,
            isActive: propSubTool === 'transform',
            onClick: () => { setPropSubTool('transform'); setActiveRadialMenu('none'); },
          },
          {
            id: 'erase',
            label: 'Erase',
            icon: X,
            isActive: propSubTool === 'erase',
            onClick: () => { setPropSubTool('erase'); setActiveRadialMenu('none'); },
          },
        ];

      case 'lighting':
        return [
          {
            id: 'place',
            label: 'Place',
            icon: Flame,
            isActive: lightingSubTool === 'place',
            onClick: () => { setLightingSubTool('place'); setActiveRadialMenu('none'); },
          },
          {
            id: 'select',
            label: 'Select',
            icon: MousePointer,
            isActive: lightingSubTool === 'select',
            onClick: () => { setLightingSubTool('select'); setActiveRadialMenu('none'); },
          },
          {
            id: 'transform',
            label: 'Move',
            icon: RotateCw,
            isActive: lightingSubTool === 'transform',
            onClick: () => { setLightingSubTool('transform'); setActiveRadialMenu('none'); },
          },
          {
            id: 'erase',
            label: 'Erase',
            icon: X,
            isActive: lightingSubTool === 'erase',
            onClick: () => { setLightingSubTool('erase'); setActiveRadialMenu('none'); },
          },
        ];

      case 'view':
      default:
        return [
          {
            id: 'orbit',
            label: 'Orbit',
            icon: RotateCw,
            isActive: viewMode === 'orbit',
            onClick: () => { setViewMode('orbit'); setActiveRadialMenu('none'); },
          },
          {
            id: 'turntable',
            label: 'Turn',
            icon: RefreshCw,
            isActive: viewMode === 'turntable',
            onClick: () => { setViewMode('turntable'); setActiveRadialMenu('none'); },
          },
        ];
    }
  };

  if (isPresentationMode || isCapturingScreenshot) return null;

  const ToolIcon = getToolIcon(activeTool);
  const ModeIcon = getModeIcon();

  // Shift joystick cleanly above drawer when bottom drawer is open
  const isDrawerOpen = mobileDrawerState === 'open' || mobileDrawerState === 'half' || mobileDrawerState === 'full';

  // Radial Pie Math for in-place replacement
  const isRadialActive = activeRadialMenu !== 'none';
  const slices = activeRadialMenu === 'tool' ? primaryToolSlices : getToolModeSlices();
  const sliceCount = slices.length;
  const sliceAngle = (2 * Math.PI) / sliceCount;
  const wheelSize = 144;
  const wheelCenter = wheelSize / 2;
  const innerR = 26;
  const outerR = 70;

  return (
    <div
      role="region"
      aria-label="Mobile Viewport Joystick Navigation"
      style={{
        bottom: isDrawerOpen ? 'calc(50vh + 14px)' : '54px',
      }}
      className="fixed left-1/2 -translate-x-1/2 z-30 select-none flex items-center justify-center gap-2.5 font-sans pointer-events-auto transition-[bottom] duration-300 ease-out"
    >
      {/* 1. Left FAB: Sub-Tool Mode Selector */}
      <button
        onClick={() =>
          setActiveRadialMenu(activeRadialMenu === 'mode' ? 'none' : 'mode')
        }
        className={`w-11 h-11 rounded-full shadow-lg flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0 ${
          activeRadialMenu === 'mode'
            ? 'bg-[#B85F45] text-white ring-2 ring-[#8F4938]'
            : 'bg-[#FAF8F5] text-[#B85F45] border-2 border-[#B85F45]'
        } ${INTERACTION_CLASSES.focusRing}`}
        title="Open Tool Mode Menu"
        aria-label="Open Tool Mode Menu"
      >
        <ModeIcon size={17} strokeWidth={2} />
      </button>

      {/* 2. Center In-Place Unit: Double-Ring Joystick OR Radial Pie Wheel */}
      {!isRadialActive ? (
        /* Double-Ring Virtual Joystick */
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-[140px] h-[140px] rounded-full bg-[#2B2621]/40 backdrop-blur-md border-2 border-[#D8D1C5]/70 shadow-xl relative flex items-center justify-center touch-none cursor-grab active:cursor-grabbing shrink-0"
        >
          {/* Outer Ring Cardinal Ticks */}
          <div className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-[#FAF8F5]/60" />
          <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-[#FAF8F5]/60" />
          <div className="absolute left-1.5 w-1.5 h-1.5 rounded-full bg-[#FAF8F5]/60" />
          <div className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-[#FAF8F5]/60" />

          {/* Orbit Inner Core Boundary Marker (r=32px) */}
          <div className="w-[64px] h-[64px] rounded-full border border-dashed border-[#FAF8F5]/40 pointer-events-none absolute" />

          {/* Movable Core Knob / Thumb Puck */}
          <div
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 150ms ease-out',
            }}
            className={`w-[58px] h-[58px] rounded-full bg-[#EBE6DC] border-2 shadow-md absolute flex flex-col items-center justify-center pointer-events-none select-none ${
              currentDeltaRef.current.r > 32
                ? 'border-[#0284C7] ring-2 ring-[#0284C7]/40'
                : 'border-[#B85F45]'
            }`}
          >
            <div className="flex gap-1 mb-0.5">
              <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
              <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-[#7C7267] leading-none">
              {currentDeltaRef.current.r > 32 ? 'Pan' : 'Orbit'}
            </span>
          </div>
        </div>
      ) : (
        /* In-Place Radial Pie Wheel Replacement */
        <div
          className="relative flex items-center justify-center drop-shadow-2xl animate-in zoom-in-90 duration-150 shrink-0"
          style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
        >
          {/* SVG Donut Slices */}
          <svg width={wheelSize} height={wheelSize} className="absolute inset-0">
            {slices.map((slice, i) => {
              const startAngle = i * sliceAngle - Math.PI / 2;
              const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

              const x1 = wheelCenter + innerR * Math.cos(startAngle);
              const y1 = wheelCenter + innerR * Math.sin(startAngle);
              const x2 = wheelCenter + outerR * Math.cos(startAngle);
              const y2 = wheelCenter + outerR * Math.sin(startAngle);
              const x3 = wheelCenter + outerR * Math.cos(endAngle);
              const y3 = wheelCenter + outerR * Math.sin(endAngle);
              const x4 = wheelCenter + innerR * Math.cos(endAngle);
              const y4 = wheelCenter + innerR * Math.sin(endAngle);

              const largeArc = sliceAngle > Math.PI ? 1 : 0;
              const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`;

              return (
                <path
                  key={slice.id}
                  d={pathData}
                  fill={slice.isActive ? '#2B2621' : '#FAF8F5'}
                  stroke="#D8D1C5"
                  strokeWidth={1.5}
                  className="cursor-pointer transition-colors duration-150 hover:fill-[#E0D9CE]"
                  onClick={slice.onClick}
                />
              );
            })}
          </svg>

          {/* Slice Icons & Labels positioned at mid-radius */}
          {slices.map((slice, i) => {
            const midAngle = (i + 0.5) * sliceAngle - Math.PI / 2;
            const midR = (innerR + outerR) / 2;
            const posX = wheelCenter + midR * Math.cos(midAngle);
            const posY = wheelCenter + midR * Math.sin(midAngle);
            const Icon = slice.icon;

            return (
              <button
                key={`btn-${slice.id}`}
                onClick={slice.onClick}
                style={{
                  position: 'absolute',
                  left: `${posX}px`,
                  top: `${posY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`flex flex-col items-center justify-center p-0.5 rounded transition-transform pointer-events-auto cursor-pointer ${
                  slice.isActive ? 'text-[#FAF8F5]' : 'text-[#2B2621]'
                } active:scale-95`}
                title={slice.label}
              >
                <Icon size={13} strokeWidth={2} className={slice.isActive ? 'text-[#B85F45]' : 'currentColor'} />
                <span className="text-[7.5px] font-bold tracking-tight leading-none mt-0.5">
                  {slice.label}
                </span>
              </button>
            );
          })}

          {/* Center Close / Dismiss Button */}
          <button
            onClick={() => setActiveRadialMenu('none')}
            className={`w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#D8D1C5] shadow-md flex items-center justify-center text-[#5A5248] hover:text-[#2B2621] hover:bg-[#E0D9CE] transition-all cursor-pointer z-10 active:scale-90 ${INTERACTION_CLASSES.focusRing}`}
            title="Close"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* 3. Right FAB: Primary Tool Selector */}
      <button
        onClick={() =>
          setActiveRadialMenu(activeRadialMenu === 'tool' ? 'none' : 'tool')
        }
        className={`w-11 h-11 rounded-full shadow-lg flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0 ${
          activeRadialMenu === 'tool'
            ? 'bg-[#B85F45] text-white ring-2 ring-[#8F4938]'
            : 'bg-[#2B2621] text-[#FAF8F5] border-2 border-[#D8D1C5]'
        } ${INTERACTION_CLASSES.focusRing}`}
        title="Open Tools Menu"
        aria-label="Open Tools Menu"
      >
        <ToolIcon size={17} strokeWidth={2} />
      </button>
    </div>
  );
};

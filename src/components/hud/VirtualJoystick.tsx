'use client';

import React, { useEffect } from 'react';
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
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';
import { INTERACTION_CLASSES } from '@/lib/theme/tokens';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface RadialSlice {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  isActive: boolean;
}

interface RadialPieWheelProps {
  slices: RadialSlice[];
  onClose: () => void;
}

const RadialPieWheel: React.FC<RadialPieWheelProps> = ({ slices, onClose }) => {
  const count = slices.length;
  const sliceAngle = (2 * Math.PI) / count;
  const wheelSize = 156;
  const wheelCenter = wheelSize / 2;
  const innerR = 28;
  const outerR = 76;

  return (
    <div
      className="relative flex items-center justify-center drop-shadow-2xl animate-in zoom-in-90 duration-150 shrink-0 pointer-events-auto"
      style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
      onClick={(e) => e.stopPropagation()}
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
            <Icon size={14} strokeWidth={2} className={slice.isActive ? 'text-[#B85F45]' : 'currentColor'} />
            <span className="text-[7.5px] font-bold tracking-tight leading-none mt-0.5">
              {slice.label}
            </span>
          </button>
        );
      })}

      {/* Center Close / Dismiss Button */}
      <button
        onClick={onClose}
        className={`w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#D8D1C5] shadow-md flex items-center justify-center text-[#5A5248] hover:text-[#2B2621] hover:bg-[#E0D9CE] transition-all cursor-pointer z-10 active:scale-90 ${INTERACTION_CLASSES.focusRing}`}
        title="Close"
        aria-label="Close menu"
      >
        <X size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
};

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

  // Ensure joystick active state is cleaned up when unmounting
  useEffect(() => {
    return () => {
      setIsJoystickActive(false);
    };
  }, [setIsJoystickActive]);

  // Primary Tool Radial Slices (Right FOB)
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

  // Tool Sub-Modes Slices (Left FOB)
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

  // Shift floating controls cleanly above drawer when bottom drawer is open
  const isDrawerOpen = mobileDrawerState === 'open' || mobileDrawerState === 'half' || mobileDrawerState === 'full';
  const bottomStyle = isDrawerOpen ? 'calc(50vh + 14px)' : '54px';

  const isModeMenuOpen = activeRadialMenu === 'mode';
  const isToolMenuOpen = activeRadialMenu === 'tool';
  const isRadialActive = isModeMenuOpen || isToolMenuOpen;

  return (
    <>
      {/* Dimmed backdrop when any circle menu is active */}
      {isRadialActive && (
        <div
          className="fixed inset-0 z-20 pointer-events-auto bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setActiveRadialMenu('none')}
          aria-hidden="true"
        />
      )}

      {/* 1. Left Floating Action Button (Sub-Tool Mode Selector) */}
      <div
        style={{ bottom: bottomStyle }}
        className="fixed left-4 sm:left-6 z-30 select-none pointer-events-auto transition-[bottom] duration-300 ease-out font-sans"
      >
        {isModeMenuOpen ? (
          /* Mode Circle Menu */
          <RadialPieWheel
            slices={getToolModeSlices()}
            onClose={() => setActiveRadialMenu('none')}
          />
        ) : (
          /* Resting Mode FAB */
          <button
            onClick={() => setActiveRadialMenu('mode')}
            className={`w-11 h-11 rounded-full shadow-lg flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer ${
              'bg-[#FAF8F5] text-[#B85F45] border-2 border-[#B85F45]'
            } ${INTERACTION_CLASSES.focusRing}`}
            title="Open Tool Mode Menu"
            aria-label="Open Tool Mode Menu"
          >
            <ModeIcon size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 2. Right Floating Action Button (Primary Tool Selector) */}
      <div
        style={{ bottom: bottomStyle }}
        className="fixed right-4 sm:right-6 z-30 select-none pointer-events-auto transition-[bottom] duration-300 ease-out font-sans"
      >
        {isToolMenuOpen ? (
          /* Tool Circle Menu */
          <RadialPieWheel
            slices={primaryToolSlices}
            onClose={() => setActiveRadialMenu('none')}
          />
        ) : (
          /* Resting Tool FAB */
          <button
            onClick={() => setActiveRadialMenu('tool')}
            className={`w-11 h-11 rounded-full shadow-lg flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer ${
              'bg-[#2B2621] text-[#FAF8F5] border-2 border-[#D8D1C5]'
            } ${INTERACTION_CLASSES.focusRing}`}
            title="Open Tools Menu"
            aria-label="Open Tools Menu"
          >
            <ToolIcon size={18} strokeWidth={2} />
          </button>
        )}
      </div>
    </>
  );
};

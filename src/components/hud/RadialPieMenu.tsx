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
  X,
  MousePointer,
  Pencil,
  TowerControl,
  Box,
  Footprints,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Droplets,
  RotateCw,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useEditorStore, ToolType, BuildingMode, TerrainSubTool } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { INTERACTION_CLASSES } from '@/lib/theme/tokens';

interface RadialSlice {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  isActive: boolean;
}

export const RadialPieMenu: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    activeRadialMenu,
    setActiveRadialMenu,
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
  } = useEditorStore();
  const { t } = useTranslation();

  if (activeRadialMenu === 'none') return null;

  // Primary Tools Slices (7 Tools)
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
      label: 'Building',
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
      label: 'Figurines',
      icon: Users,
      isActive: activeTool === 'prop',
      onClick: () => {
        setActiveTool('prop');
        setActiveRadialMenu('none');
      },
    },
    {
      id: 'lighting',
      label: 'Lighting',
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

  // Tool Modes Slices (Dynamic per active tool)
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
            label: 'Foundation',
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
            label: 'Fortify',
            icon: TowerControl,
            isActive: buildingMode === 'fortifications',
            onClick: () => { setBuildingMode('fortifications'); setActiveRadialMenu('none'); },
          },
        ];

      case 'terrain':
        return [
          {
            id: 'elevate',
            label: 'Peak',
            icon: Mountain,
            isActive: terrainSubTool === 'elevate',
            onClick: () => { setTerrainSubTool('elevate'); setActiveRadialMenu('none'); },
          },
          {
            id: 'plateau',
            label: 'Plateau',
            icon: Minus,
            isActive: terrainSubTool === 'plateau',
            onClick: () => { setTerrainSubTool('plateau'); setActiveRadialMenu('none'); },
          },
          {
            id: 'slope',
            label: 'Ramp',
            icon: ArrowUpRight,
            isActive: terrainSubTool === 'slope',
            onClick: () => { setTerrainSubTool('slope'); setActiveRadialMenu('none'); },
          },
          {
            id: 'lower',
            label: 'Gorge',
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
            icon: Trees,
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
            id: 'select',
            label: 'Select',
            icon: MousePointer,
            isActive: propSubTool === 'select',
            onClick: () => { setPropSubTool('select'); setActiveRadialMenu('none'); },
          },
          {
            id: 'place',
            label: 'Place',
            icon: Box,
            isActive: propSubTool === 'place',
            onClick: () => { setPropSubTool('place'); setActiveRadialMenu('none'); },
          },
          {
            id: 'transform',
            label: 'Transform',
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
            id: 'select',
            label: 'Select',
            icon: MousePointer,
            isActive: lightingSubTool === 'select',
            onClick: () => { setLightingSubTool('select'); setActiveRadialMenu('none'); },
          },
          {
            id: 'place',
            label: 'Place',
            icon: Flame,
            isActive: lightingSubTool === 'place',
            onClick: () => { setLightingSubTool('place'); setActiveRadialMenu('none'); },
          },
          {
            id: 'transform',
            label: 'Transform',
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
            label: 'Turntable',
            icon: RefreshCw,
            isActive: viewMode === 'turntable',
            onClick: () => { setViewMode('turntable'); setActiveRadialMenu('none'); },
          },
        ];
    }
  };

  const slices = activeRadialMenu === 'tool' ? primaryToolSlices : getToolModeSlices();
  const count = slices.length;
  const sliceAngle = (2 * Math.PI) / count;

  // Geometry: Inner radius 40px, outer radius 95px, center at (110, 110)
  const size = 220;
  const center = size / 2;
  const innerR = 42;
  const outerR = 98;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={() => setActiveRadialMenu('none')}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* SVG Donut Slices */}
        <svg width={size} height={size} className="absolute inset-0 drop-shadow-xl">
          {slices.map((slice, i) => {
            const startAngle = i * sliceAngle - Math.PI / 2;
            const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

            const x1 = center + innerR * Math.cos(startAngle);
            const y1 = center + innerR * Math.sin(startAngle);
            const x2 = center + outerR * Math.cos(startAngle);
            const y2 = center + outerR * Math.sin(startAngle);
            const x3 = center + outerR * Math.cos(endAngle);
            const y3 = center + outerR * Math.sin(endAngle);
            const x4 = center + innerR * Math.cos(endAngle);
            const y4 = center + innerR * Math.sin(endAngle);

            const largeArc = sliceAngle > Math.PI ? 1 : 0;

            const pathData = `
              M ${x1} ${y1}
              L ${x2} ${y2}
              A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3}
              L ${x4} ${y4}
              A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}
              Z
            `;

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
          const posX = center + midR * Math.cos(midAngle);
          const posY = center + midR * Math.sin(midAngle);
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
              className={`flex flex-col items-center justify-center p-1 rounded-md transition-transform pointer-events-auto cursor-pointer ${
                slice.isActive ? 'text-[#FAF8F5]' : 'text-[#2B2621]'
              } hover:scale-110 active:scale-95`}
              title={slice.label}
            >
              <Icon size={16} strokeWidth={1.75} className={slice.isActive ? 'text-[#B85F45]' : 'currentColor'} />
              <span className="text-[9px] font-semibold tracking-tight leading-none mt-0.5">
                {slice.label}
              </span>
            </button>
          );
        })}

        {/* Center Close / Dismiss Button */}
        <button
          onClick={() => setActiveRadialMenu('none')}
          className={`w-14 h-14 rounded-full bg-[#FAF8F5] border-2 border-[#D8D1C5] shadow-md flex items-center justify-center text-[#5A5248] hover:text-[#2B2621] hover:bg-[#E0D9CE] transition-all cursor-pointer z-10 active:scale-95 ${INTERACTION_CLASSES.focusRing}`}
          title={t.mobileStudio?.closeMenu || 'Close'}
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

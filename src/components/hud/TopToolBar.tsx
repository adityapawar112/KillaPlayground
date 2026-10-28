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
  const { activeTool, setActiveTool, showContextualDock } = useEditorStore();
  const { t } = useTranslation();

  if (!showContextualDock) return null;

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

  const renderToolButton = (tool: ToolDef) => {
    const Icon = tool.icon;
    const details = toolDetails[tool.id];
    const isActive =
      activeTool === tool.id ||
      (tool.id === 'shape_side' &&
        (activeTool === 'shape_side' || activeTool === 'shape_top' || activeTool === 'shape')) ||
      (tool.id === 'grass' && activeTool === 'foliage');

    return (
      <button
        key={tool.id}
        onClick={() => setActiveTool(tool.id)}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer select-none shrink-0 ${
          isActive
            ? 'bg-[#4B382C] text-[#FAF8F5] shadow-sm ring-1 ring-[#38281E]'
            : 'text-[#5C4638] hover:bg-[#D8C7B5] hover:text-[#2B1E16]'
        }`}
        title={`${details?.fullLabel || details?.label} (${tool.key}) - ${details?.desc}`}
      >
        <span
          className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded leading-none ${
            isActive ? 'bg-black/35 text-[#F59E0B]' : 'bg-[#DCCEC0] text-[#7A6454]'
          }`}
        >
          {tool.key}
        </span>
        <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAF8F5]' : 'text-[#4B382C]'}`} />
        <span className="tracking-tight text-[11.5px] whitespace-nowrap">
          {details?.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Top Tool Modes"
      className="fixed top-[41px] left-0 right-0 z-30 h-10 px-3 flex items-center gap-1 bg-[#E4D8CB] border-b border-[#CDBCAB] shadow-xs select-none overflow-x-auto pointer-events-auto"
    >
      {/* Group 1: 6 Primary Killa Tools */}
      <div className="flex items-center gap-1">
        {PRIMARY_KILLA_TOOLS.map(renderToolButton)}
      </div>

      {/* Solid Divider */}
      <div className="w-[1.5px] h-5 bg-[#C5B3A1] mx-1.5 shrink-0" />

      {/* Group 2: Soil Pipeline Tools */}
      <div className="flex items-center gap-1">
        {SECONDARY_SOIL_TOOLS.map(renderToolButton)}
      </div>
    </nav>
  );
};

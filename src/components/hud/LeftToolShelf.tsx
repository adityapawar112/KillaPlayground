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
  TbPick,
  TbPlant2,
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

// Soil Simulation Tools (Deferred Advanced Phase)
const SECONDARY_SOIL_TOOLS: ToolDef[] = [
  { id: 'soil', key: '7', icon: TbShovel },
  { id: 'water', key: '8', icon: TbDropletHalf2 },
  { id: 'shape_side', key: '9', icon: TbLayersSubtract },
  { id: 'dry', key: '0', icon: TbSun },
];

export const LeftToolShelf: React.FC = () => {
  const { activeTool, setActiveTool, showLeftToolbar } = useEditorStore();
  const { t } = useTranslation();

  if (!showLeftToolbar) return null;

  const toolDetails: Record<
    ToolType | 'shape_side',
    { label: string; fullLabel: string; desc: string }
  > = {
    terrain: (t.tools as any).terrain || { label: 'Terrain', fullLabel: 'Terrain Sculpt', desc: 'Manipulate mountain terrain & excavate ponds' },
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
    dry: (t.tools as any).dry || { label: 'Dry', fullLabel: 'Drying Tool', desc: 'Dries and solidifies shaped wet soil' },
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
      <div key={tool.id} className="relative group">
        <button
          onClick={() => setActiveTool(tool.id)}
          className={`relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 cursor-pointer ${
            isActive
              ? 'bg-[#4B382C] text-white shadow-md shadow-[#4B382C]/30 scale-105'
              : 'text-[#634E40] hover:bg-[#DFCDBD] hover:text-[#2B1E16]'
          }`}
          aria-label={`${details?.fullLabel || details?.label} (${tool.key})`}
        >
          {/* Shortcut Key Badge */}
          <span
            className={`absolute top-1 right-1 text-[8px] font-mono font-bold leading-none px-1 py-0.5 rounded ${
              isActive
                ? 'bg-black/30 text-[#FAF8F5]'
                : 'bg-[#EADECF] text-[#8D7666]'
            }`}
          >
            {tool.key}
          </span>

          <Icon
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 ${
              isActive ? 'text-[#FAF8F5]' : 'text-[#4B382C]'
            }`}
          />
          <span
            className={`text-[8.5px] font-semibold mt-0.5 tracking-tight leading-none ${
              isActive ? 'text-[#FAF8F5]' : 'text-[#634E40]'
            }`}
          >
            {details?.label}
          </span>
        </button>

        {/* Hover Tooltip (Pops out to the RIGHT, avoiding overlap) */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#23211E]/95 backdrop-blur-md text-[#FAF8F5] text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-xl z-50 flex items-center gap-2 border border-[#4B382C]/40">
          <span className="font-bold text-[#F59E0B]">[{tool.key}]</span>
          <span className="font-semibold text-white">{details?.fullLabel}</span>
          <span className="text-[#D9C9B4] text-[11px]">— {details?.desc}</span>
        </div>
      </div>
    );
  };

  return (
    <aside
      aria-label="3D Editing Tools"
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 p-1.5 bg-[#F2EBE1]/94 backdrop-blur-xl rounded-[22px] border border-[#D9C9B4] shadow-2xl transition-all select-none"
    >
      {/* Group 1: 6 Primary Killa-First Construction Tools */}
      <div className="flex flex-col items-center gap-1">
        {PRIMARY_KILLA_TOOLS.map(renderToolButton)}
      </div>

      {/* Visual Divider Separating Killa Tools from Soil Pipeline */}
      <div className="w-7 h-[1.5px] bg-[#D9C9B4]/80 my-1 rounded-full" />

      {/* Group 2: Soil Pipeline Tools */}
      <div className="flex flex-col items-center gap-1">
        {SECONDARY_SOIL_TOOLS.map(renderToolButton)}
      </div>
    </aside>
  );
};

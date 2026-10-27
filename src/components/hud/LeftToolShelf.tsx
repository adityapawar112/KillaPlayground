'use client';

import React from 'react';
import {
  TbMountain,
  TbDropletHalf2,
  TbLayersSubtract,
  TbSun,
  TbBrush,
  TbPick,
  TbPlant2,
  TbRoute,
  TbUsersGroup,
} from 'react-icons/tb';
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ToolDef {
  id: ToolType;
  key: string;
  icon: React.ElementType;
}

// 5 Bundled Structure Tools (For building on top of the terrain)
const STRUCTURE_TOOLS: ToolDef[] = [
  { id: 'soil', key: '1', icon: TbMountain },
  { id: 'water', key: '2', icon: TbDropletHalf2 },
  { id: 'shape_side', key: '3', icon: TbLayersSubtract },
  { id: 'dry', key: '4', icon: TbSun },
  { id: 'paint', key: '5', icon: TbBrush },
];

// Terrain, Foliage & Overlay World Tools
const WORLD_TOOLS: ToolDef[] = [
  { id: 'terrain', key: '6', icon: TbPick },
  { id: 'grass', key: '7', icon: TbPlant2 },
  { id: 'spline', key: '8', icon: TbRoute },
  { id: 'prop', key: '9', icon: TbUsersGroup },
];

export const LeftToolShelf: React.FC = () => {
  const { activeTool, setActiveTool, showLeftToolbar } = useEditorStore();
  const { t } = useTranslation();

  if (!showLeftToolbar) return null;

  const toolDetails: Record<
    ToolType | 'shape_side',
    { label: string; fullLabel: string; desc: string }
  > = {
    soil: t.tools.soil,
    water: t.tools.water,
    shape: t.tools.shape,
    shape_side: t.tools.shape,
    shape_top: t.tools.shape,
    dry: (t.tools as any).dry || { label: 'Dry', fullLabel: 'Drying Tool', desc: 'Dries and solidifies shaped wet soil' },
    paint: t.tools.paint,
    terrain: (t.tools as any).terrain || { label: 'Terrain', fullLabel: 'Terrain Sculpt', desc: 'Manipulate mountain terrain & excavate ponds' },
    foliage: (t.tools as any).foliage || t.tools.grass,
    grass: t.tools.grass,
    spline: t.tools.spline,
    prop: t.tools.prop,
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
      {/* Group 1: 5 Bundled Structure Tools */}
      <div className="flex flex-col items-center gap-1">
        {STRUCTURE_TOOLS.map(renderToolButton)}
      </div>

      {/* Visual Divider Separating Structures from Terrain/World */}
      <div className="w-7 h-[1.5px] bg-[#D9C9B4]/80 my-1 rounded-full" />

      {/* Group 2: Terrain, Foliage & World Tools */}
      <div className="flex flex-col items-center gap-1">
        {WORLD_TOOLS.map(renderToolButton)}
      </div>
    </aside>
  );
};

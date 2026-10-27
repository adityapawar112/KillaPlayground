'use client';

import React from 'react';
import {
  TbMountain,
  TbDropletHalf2,
  TbLayersSubtract,
  TbRoute,
  TbBrush,
  TbPlant2,
  TbUsersGroup,
} from 'react-icons/tb';
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ToolDef {
  id: ToolType;
  key: string;
  icon: React.ElementType;
}

const TOOLS_CONFIG: ToolDef[] = [
  { id: 'soil', key: '1', icon: TbMountain },
  { id: 'water', key: '2', icon: TbDropletHalf2 },
  { id: 'shape_side', key: '3', icon: TbLayersSubtract },
  { id: 'spline', key: '4', icon: TbRoute },
  { id: 'paint', key: '5', icon: TbBrush },
  { id: 'grass', key: '6', icon: TbPlant2 },
  { id: 'prop', key: '7', icon: TbUsersGroup },
];

export const BottomDock: React.FC = () => {
  const { activeTool, setActiveTool } = useEditorStore();
  const { t } = useTranslation();

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
    terrain: (t.tools as any).terrain || { label: 'Terrain', fullLabel: 'Terrain Sculpt', desc: 'Manipulate mountain terrain' },
    foliage: (t.tools as any).foliage || t.tools.grass,
    grass: t.tools.grass,
    spline: t.tools.spline,
    prop: t.tools.prop,
  };

  return (
    <nav
      aria-label="3D Editing Tools"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 bg-[#F2EBE1]/94 backdrop-blur-xl rounded-[24px] border border-[#D9C9B4] shadow-2xl transition-all select-none"
    >
      {TOOLS_CONFIG.map((tool) => {
        const Icon = tool.icon;
        const details = toolDetails[tool.id];
        const isActive =
          activeTool === tool.id ||
          (tool.id === 'shape_side' &&
            (activeTool === 'shape_side' || activeTool === 'shape_top'));

        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`group relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#4B382C] text-white shadow-md shadow-[#4B382C]/30 scale-105'
                : 'text-[#634E40] hover:bg-[#DFCDBD] hover:text-[#2B1E16]'
            }`}
            title={`${details?.fullLabel || details?.label} (${tool.key}) - ${details?.desc}`}
          >
            {/* Shortcut Key Badge */}
            <span
              className={`absolute top-1 right-1.5 text-[9px] font-mono font-bold leading-none px-1 py-0.5 rounded ${
                isActive
                  ? 'bg-black/30 text-[#FAF8F5]'
                  : 'bg-[#EADECF] text-[#8D7666]'
              }`}
            >
              {tool.key}
            </span>

            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                isActive ? 'text-[#FAF8F5]' : 'text-[#4B382C]'
              }`}
            />
            <span
              className={`text-[10px] sm:text-[11px] font-semibold mt-1 tracking-tight leading-none ${
                isActive ? 'text-[#FAF8F5]' : 'text-[#634E40]'
              }`}
            >
              {details?.label}
            </span>

            {/* Hover Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#23211E] text-[#FAF8F5] text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              {details?.fullLabel} <span className="text-[#F59E0B]">[{tool.key}]</span> — {details?.desc}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

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
    shape_side: t.tools.shape,
    shape_top: t.tools.shape,
    spline: t.tools.spline,
    paint: t.tools.paint,
    grass: t.tools.grass,
    prop: t.tools.prop,
  };

  return (
    <aside
      aria-label="3D Editing Tools"
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 p-1.5 bg-[#F2EBE1]/94 backdrop-blur-xl rounded-[22px] border border-[#D9C9B4] shadow-2xl transition-all select-none"
    >
      {TOOLS_CONFIG.map((tool) => {
        const Icon = tool.icon;
        const details = toolDetails[tool.id];
        const isActive =
          activeTool === tool.id ||
          (tool.id === 'shape_side' &&
            (activeTool === 'shape_side' || activeTool === 'shape_top'));

        return (
          <div key={tool.id} className="relative group">
            <button
              onClick={() => setActiveTool(tool.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#4B382C] text-white shadow-md shadow-[#4B382C]/30 scale-105'
                  : 'text-[#634E40] hover:bg-[#DFCDBD] hover:text-[#2B1E16]'
              }`}
              aria-label={`${details?.fullLabel || details?.label} (${tool.key})`}
            >
              {/* Shortcut Key Badge */}
              <span
                className={`absolute top-1 right-1 text-[9px] font-mono font-bold leading-none px-1 py-0.5 rounded ${
                  isActive
                    ? 'bg-black/30 text-[#FAF8F5]'
                    : 'bg-[#EADECF] text-[#8D7666]'
                }`}
              >
                {tool.key}
              </span>

              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#FAF8F5]' : 'text-[#4B382C]'
                }`}
              />
              <span
                className={`text-[9px] font-semibold mt-0.5 tracking-tight leading-none ${
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
      })}
    </aside>
  );
};

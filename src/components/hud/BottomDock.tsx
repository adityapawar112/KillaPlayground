'use client';

import React from 'react';
import {
  Mountain,
  Castle,
  Layers,
  Trees,
  Users,
  Flame,
  Shovel,
} from 'lucide-react';
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ToolDef {
  id: ToolType;
  key: string;
  icon: React.ElementType;
}

const TOOLS_CONFIG: ToolDef[] = [
  { id: 'terrain', key: '1', icon: Mountain },
  { id: 'building', key: '2', icon: Castle },
  { id: 'texture', key: '3', icon: Layers },
  { id: 'foliage', key: '4', icon: Trees },
  { id: 'prop', key: '5', icon: Users },
  { id: 'lighting', key: '6', icon: Flame },
  { id: 'soil', key: '7', icon: Shovel },
];

export const BottomDock: React.FC = () => {
  const { activeTool, setActiveTool } = useEditorStore();
  const { t } = useTranslation();

  const toolDetails: Record<
    ToolType | 'shape_side',
    { label: string; fullLabel: string; desc: string }
  > = {
    terrain: (t.tools as any).terrain || { label: 'Terrain', fullLabel: 'Terrain Sculpt', desc: 'Manipulate mountain terrain' },
    building: (t.tools as any).building || { label: 'Building', fullLabel: 'Building Construction', desc: 'Walls, foundations, stairs, and fortifications' },
    walls: (t.tools as any).building || (t.tools as any).walls || { label: 'Building', fullLabel: 'Building Construction', desc: 'Walls, foundations, stairs, and fortifications' },
    spline: (t.tools as any).building || t.tools.spline,
    texture: (t.tools as any).texture || { label: 'Texture', fullLabel: 'Texture Studio', desc: 'Paint surface textures on terrain' },
    paint: t.tools.paint,
    foliage: (t.tools as any).foliage || t.tools.grass,
    prop: t.tools.prop,
    lighting: (t.tools as any).lighting || { label: 'Lighting', fullLabel: 'Festive Lighting & Fireworks', desc: 'Place traditional diyas, lamps, anaar fountains, and sky shot fireworks' },
    view: (t.tools as any).view || { label: 'View', fullLabel: 'Diorama & Sun View', desc: 'Inspect diorama, time of day & celestial lighting angle' },
    soil: t.tools.soil,
    water: t.tools.water,
    shape: t.tools.shape,
    shape_side: t.tools.shape,
    shape_top: t.tools.shape,
    dry: (t.tools as any).dry || { label: 'Dry', fullLabel: 'Drying Tool', desc: 'Dries and solidifies shaped wet soil' },
    grass: t.tools.grass,
  };

  return (
    <nav
      aria-label="3D Editing Tools"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 bg-[#EBE6DC]/95 backdrop-blur-xl rounded-2xl border border-[#D8D1C5] shadow-2xl transition-all select-none"
    >
      {TOOLS_CONFIG.map((tool) => {
        const Icon = tool.icon;
        const details = toolDetails[tool.id];
        const isActive =
          activeTool === tool.id ||
          (tool.id === 'building' && activeTool === 'walls') ||
          (tool.id === 'shape_side' &&
            (activeTool === 'shape_side' || activeTool === 'shape_top'));

        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`group relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#2B2621] text-[#FAF8F5] shadow-sm scale-105'
                : 'text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
            }`}
            title={`${details?.fullLabel || details?.label} (${tool.key}) - ${details?.desc}`}
          >
            {/* Shortcut Key Badge */}
            <span
              className={`absolute top-1 right-1.5 text-[9px] font-mono font-semibold tabular-nums leading-none px-1 py-0.5 rounded ${
                isActive
                  ? 'bg-black/30 text-[#FAF8F5]'
                  : 'bg-[#D8D1C5] text-[#5A5248]'
              }`}
            >
              {tool.key}
            </span>

            <Icon
              size={20}
              strokeWidth={1.75}
              className={`transition-transform group-hover:scale-110 ${
                isActive ? 'text-[#FAF8F5]' : 'text-[#2B2621]'
              }`}
            />
            <span
              className={`text-[10px] sm:text-[11px] font-medium mt-1 tracking-tight leading-none ${
                isActive ? 'text-[#FAF8F5]' : 'text-[#5A5248]'
              }`}
            >
              {details?.label}
            </span>

            {/* Hover Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#2B2621] text-[#FAF8F5] text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              {details?.fullLabel} <span className="text-[#B85F45]">[{tool.key}]</span> — {details?.desc}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

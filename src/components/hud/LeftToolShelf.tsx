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
  Droplets,
  Sun,
} from 'lucide-react';
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ToolDef {
  id: ToolType;
  key: string;
  icon: React.ElementType;
}

// 6 Primary Killa-First Construction Tools (Ticket 10)
const PRIMARY_KILLA_TOOLS: ToolDef[] = [
  { id: 'terrain', key: '1', icon: Mountain },
  { id: 'building', key: '2', icon: Castle },
  { id: 'texture', key: '3', icon: Layers },
  { id: 'foliage', key: '4', icon: Trees },
  { id: 'prop', key: '5', icon: Users },
  { id: 'lighting', key: '6', icon: Flame },
];

// Soil Simulation Tools (Deferred Advanced Phase)
const SECONDARY_SOIL_TOOLS: ToolDef[] = [
  { id: 'soil', key: '7', icon: Shovel },
  { id: 'water', key: '8', icon: Droplets },
  { id: 'shape_side', key: '9', icon: Layers },
  { id: 'dry', key: '0', icon: Sun },
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
    building: (t.tools as any).building || { label: 'Building', fullLabel: 'Fort Architecture', desc: 'Construct fort walls, foundations, stairs, and bastions' },
    walls: (t.tools as any).building || (t.tools as any).walls || { label: 'Building', fullLabel: 'Fort Architecture', desc: 'Construct fort walls, foundations, stairs, and bastions' },
    spline: (t.tools as any).spline || { label: 'Spline', fullLabel: 'Paths', desc: 'Draft linear paths' },
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

  const renderToolButton = (tool: ToolDef) => {
    const Icon = tool.icon;
    const details = toolDetails[tool.id];
    const isActive =
      activeTool === tool.id ||
      (tool.id === 'building' && (activeTool === 'building' || activeTool === 'walls')) ||
      (tool.id === 'walls' && (activeTool === 'building' || activeTool === 'walls')) ||
      (tool.id === 'shape_side' &&
        (activeTool === 'shape_side' || activeTool === 'shape_top' || activeTool === 'shape')) ||
      (tool.id === 'grass' && activeTool === 'foliage');

    return (
      <div key={tool.id} className="relative group">
        <button
          onClick={() => setActiveTool(tool.id)}
          className={`relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-lg transition-all duration-200 cursor-pointer ${
            isActive
              ? 'bg-[#2B2621] text-[#FAF8F5] shadow-sm scale-105'
              : 'text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
          }`}
          aria-label={`${details?.fullLabel || details?.label} (${tool.key})`}
        >
          {/* Shortcut Key Badge */}
          <span
            className={`absolute top-1 right-1 text-[8px] font-mono font-semibold tabular-nums leading-none px-1 py-0.5 rounded ${
              isActive
                ? 'bg-black/30 text-[#FAF8F5]'
                : 'bg-[#D8D1C5] text-[#5A5248]'
            }`}
          >
            {tool.key}
          </span>

          <Icon
            size={18}
            strokeWidth={1.75}
            className={`transition-transform group-hover:scale-110 ${
              isActive ? 'text-[#FAF8F5]' : 'text-[#2B2621]'
            }`}
          />
          <span
            className={`text-[8.5px] font-semibold mt-0.5 tracking-tight leading-none ${
              isActive ? 'text-[#FAF8F5]' : 'text-[#5A5248]'
            }`}
          >
            {details?.label}
          </span>
        </button>

        {/* Hover Tooltip (Pops out to the RIGHT, avoiding overlap) */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#2B2621]/95 backdrop-blur-md text-[#FAF8F5] text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-xl z-50 flex items-center gap-2 border border-[#D8D1C5]/30">
          <span className="font-bold text-[#B85F45]">[{tool.key}]</span>
          <span className="font-semibold text-white">{details?.fullLabel}</span>
          <span className="text-[#D8D1C5] text-[11px]">— {details?.desc}</span>
        </div>
      </div>
    );
  };

  return (
    <aside
      aria-label="3D Editing Tools"
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 p-1.5 bg-[#EBE6DC]/95 backdrop-blur-xl rounded-xl border border-[#D8D1C5] shadow-2xl transition-all select-none"
    >
      {/* Group 1: 6 Primary Killa-First Construction Tools */}
      <div className="flex flex-col items-center gap-1">
        {PRIMARY_KILLA_TOOLS.map(renderToolButton)}
      </div>

      {/* Visual Divider Separating Killa Tools from Soil Pipeline */}
      <div className="w-7 h-[1px] bg-[#D8D1C5] my-1 rounded-full" />

      {/* Group 2: Soil Pipeline Tools */}
      <div className="flex flex-col items-center gap-1">
        {SECONDARY_SOIL_TOOLS.map(renderToolButton)}
      </div>
    </aside>
  );
};

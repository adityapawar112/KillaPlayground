'use client';

import React from 'react';
import {
  Mountain,
  Droplets,
  Layers,
  Route,
  Paintbrush,
  Sprout,
  Users,
} from 'lucide-react';
import { useEditorStore, ToolType } from '@/lib/state/useEditorStore';

interface ToolDef {
  id: ToolType;
  label: string;
  marathi: string;
  icon: React.ElementType;
  description: string;
}

const TOOLS: ToolDef[] = [
  {
    id: 'soil',
    label: 'Soil',
    marathi: 'माती ओता',
    icon: Mountain,
    description: 'Dump dry laterite soil mounds',
  },
  {
    id: 'water',
    label: 'Water',
    marathi: 'पाणी घाला',
    icon: Droplets,
    description: 'Pour water to create wet malleable mud',
  },
  {
    id: 'shape_side',
    label: 'Shape',
    marathi: 'भिंती रचा',
    icon: Layers,
    description: 'Push sides into vertical walls or pat top level',
  },
  {
    id: 'spline',
    label: 'Spline',
    marathi: 'तटबंदी रेषा',
    icon: Route,
    description: 'Draw pathways, steps, and rampart walls with bastions',
  },
  {
    id: 'paint',
    label: 'Paint',
    marathi: 'रंगकाम',
    icon: Paintbrush,
    description: 'Hand-paint basalt stone walls and white mortar lines',
  },
  {
    id: 'grass',
    label: 'Greenery',
    marathi: 'हळीव / गवत',
    icon: Sprout,
    description: 'Sprout lush green halim cress seedlings',
  },
  {
    id: 'prop',
    label: 'Figurines',
    marathi: 'मावळे व तोफा',
    icon: Users,
    description: 'Place Chhatrapati Shivaji Maharaj, Mavale, and cannons',
  },
];

export const BottomDock: React.FC = () => {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <nav
      aria-label="3D Editing Tools"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-2 bg-[#F2EBE1]/94 backdrop-blur-xl rounded-[28px] border border-[#D9C9B4] shadow-2xl transition-all"
    >
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
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
            title={`${tool.label} (${tool.marathi}) - ${tool.description}`}
          >
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
              {tool.marathi}
            </span>

            {/* Tooltip on Hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#23211E] text-[#FAF8F5] text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              {tool.label} — {tool.description}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

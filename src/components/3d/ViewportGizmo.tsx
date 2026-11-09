'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Focus } from 'lucide-react';

interface ViewportGizmoProps {
  onSetCameraView?: (view: 'top' | 'front' | 'side' | 'reset') => void;
  onZoom?: (delta: number) => void;
}

export const ViewportGizmo: React.FC<ViewportGizmoProps> = ({
  onSetCameraView,
  onZoom,
}) => {
  return (
    <div className="absolute top-16 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none select-none">
      {/* Quick Camera Navigation Cluster (Level 2 Surface) */}
      <div className="flex flex-col gap-1 p-1 rounded-xl bg-[#EBE6DC]/95 backdrop-blur-md border border-[#D8D1C5] shadow-md pointer-events-auto">
        {/* Top View (Numpad 7) */}
        <button
          onClick={() => onSetCameraView?.('top')}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold text-[#423B33] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          title="Top View (Numpad 7)"
        >
          Top
        </button>

        {/* Front View (Numpad 1) */}
        <button
          onClick={() => onSetCameraView?.('front')}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold text-[#423B33] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          title="Front View (Numpad 1)"
        >
          Frnt
        </button>

        {/* Side View (Numpad 3) */}
        <button
          onClick={() => onSetCameraView?.('side')}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold text-[#423B33] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          title="Side View (Numpad 3)"
        >
          Side
        </button>

        <div className="w-full h-[1px] bg-[#D8D1C5] my-0.5" />

        {/* Zoom In */}
        <button
          onClick={() => onZoom?.(-1.5)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#423B33] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          title="Zoom In (+ / Q)"
        >
          <ZoomIn size={16} strokeWidth={1.75} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => onZoom?.(1.5)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#423B33] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          title="Zoom Out (- / E)"
        >
          <ZoomOut size={16} strokeWidth={1.75} />
        </button>

        {/* Center / Focus View */}
        <button
          onClick={() => onSetCameraView?.('reset')}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#423B33] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          title="Center / Reset Camera (Home / F)"
        >
          <Focus size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};

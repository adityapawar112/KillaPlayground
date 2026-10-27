'use client';

import React from 'react';
import {
  TbZoomIn,
  TbZoomOut,
  TbFocus2,
} from 'react-icons/tb';

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
      {/* Quick Camera Navigation Cluster */}
      <div className="flex flex-col gap-1.5 p-1.5 rounded-2xl bg-[#F2EBE1]/90 backdrop-blur-md border border-[#D9C9B4] shadow-md pointer-events-auto">
        {/* Top View (Numpad 7) */}
        <button
          onClick={() => onSetCameraView?.('top')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-[#4B382C] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
          title="Top View (Numpad 7)"
        >
          Top
        </button>

        {/* Front View (Numpad 1) */}
        <button
          onClick={() => onSetCameraView?.('front')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-[#4B382C] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
          title="Front View (Numpad 1)"
        >
          Frnt
        </button>

        {/* Side View (Numpad 3) */}
        <button
          onClick={() => onSetCameraView?.('side')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-[#4B382C] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
          title="Side View (Numpad 3)"
        >
          Side
        </button>

        <div className="w-full h-[1px] bg-[#D9C9B4] my-0.5" />

        {/* Zoom In */}
        <button
          onClick={() => onZoom?.(-1.5)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B382C] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
          title="Zoom In (+ / Q)"
        >
          <TbZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => onZoom?.(1.5)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B382C] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
          title="Zoom Out (- / E)"
        >
          <TbZoomOut className="w-4 h-4" />
        </button>

        {/* Center / Focus View */}
        <button
          onClick={() => onSetCameraView?.('reset')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B382C] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
          title="Center / Reset Camera (Home / F)"
        >
          <TbFocus2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

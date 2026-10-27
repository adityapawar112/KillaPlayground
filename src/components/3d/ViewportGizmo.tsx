'use client';

import React from 'react';
import {
  TbAxisX,
  TbZoomIn,
  TbZoomOut,
  TbFocus2,
  TbHandMove,
  TbHelp,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ViewportGizmoProps {
  onSetCameraView?: (view: 'top' | 'front' | 'side' | 'reset') => void;
  onZoom?: (delta: number) => void;
}

export const ViewportGizmo: React.FC<ViewportGizmoProps> = ({
  onSetCameraView,
  onZoom,
}) => {
  const { setShortcutsModalOpen, nightMode } = useEditorStore();
  const { t } = useTranslation();

  return (
    <div className="absolute top-20 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none select-none">
      {/* Perspective Info Tag (Blender-style top-left or top-right indicator) */}
      <div className="px-2.5 py-1 rounded bg-[#F2EBE1]/85 backdrop-blur-md border border-[#D9C9B4]/80 shadow-sm text-[11px] font-mono text-[#634E40] pointer-events-auto">
        <span className="font-semibold text-[#2B1E16]">{t.userPerspective}</span>
        <span className="text-[#8D7666] ml-2 text-[10px]">45° FOV</span>
      </div>

      {/* Blender-style quick navigation button cluster */}
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

        <div className="w-full h-[1px] bg-[#D9C9B4] my-0.5" />

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#E85D04] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
          title="Keyboard Shortcuts Cheat Sheet (?)"
        >
          <TbHelp className="w-4 h-4" />
        </button>
      </div>

      {/* Control Help Pills (subtle Blender-style hint at bottom right) */}
      <div className="hidden lg:flex flex-col items-end gap-1 text-[10px] text-[#8D7666] font-mono pointer-events-auto bg-[#F2EBE1]/70 px-2.5 py-1.5 rounded-lg border border-[#D9C9B4]/60">
        <div>{t.rightClickOrbit}</div>
        <div>{t.middleClickPan}</div>
        <div>{t.scrollZoom}</div>
        <div className="text-[#4B382C] font-semibold">{t.leftClickInteract}</div>
      </div>
    </div>
  );
};

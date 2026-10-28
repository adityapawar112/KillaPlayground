'use client';

import React from 'react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const BottomStatusBar: React.FC = () => {
  const { showBottomStatusBar } = useEditorStore();
  const { t } = useTranslation();

  if (!showBottomStatusBar) return null;

  return (
    <footer
      aria-label="Viewport Navigation Strip"
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex items-center justify-center max-w-[95vw]"
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1 rounded-full bg-[#F2EBE1]/95 border border-[#D9C9B4] text-[10px] sm:text-[11px] font-mono text-[#634E40] shadow-sm">
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[#2B1E16]">Left Click:</span> Orbit
        </span>
        <span className="text-[#D9C9B4]">•</span>
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[#2B1E16]">Right / Middle Click:</span> Pan
        </span>
        <span className="text-[#D9C9B4]">•</span>
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[#2B1E16]">Scroll:</span> Zoom
        </span>
      </div>
    </footer>
  );
};

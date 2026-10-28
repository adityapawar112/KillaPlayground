'use client';

import React from 'react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const BottomStatusBar: React.FC = () => {
  const { showBottomStatusBar, activeTool } = useEditorStore();
  const { t } = useTranslation();

  if (!showBottomStatusBar) return null;

  const getLeftClickAction = () => {
    switch (activeTool) {
      case 'terrain':
        return 'Sculpt Terrain';
      case 'walls':
        return 'Draw Wall Path';
      case 'spline':
        return 'Place Structure Path';
      case 'paint':
        return 'Paint Texture';
      case 'foliage':
        return 'Scatter Foliage';
      case 'prop':
        return 'Place Figurine';
      default:
        return 'Orbit / Mold';
    }
  };

  const isToolActive = [
    'terrain',
    'walls',
    'spline',
    'paint',
    'foliage',
    'prop',
  ].includes(activeTool);

  return (
    <footer
      aria-label="Viewport Navigation Strip"
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex items-center justify-center max-w-[95vw]"
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1 rounded-full bg-[#F2EBE1]/95 border border-[#D9C9B4] text-[10px] sm:text-[11px] font-mono text-[#634E40] shadow-sm">
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[#2B1E16]">Left Click:</span>{' '}
          <span className={isToolActive ? 'text-[#E85D04] font-bold' : ''}>
            {getLeftClickAction()}
          </span>
        </span>
        <span className="text-[#D9C9B4]">•</span>
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[#2B1E16]">
            {isToolActive ? 'Right / Middle Drag:' : 'Right / Middle Click:'}
          </span>{' '}
          {isToolActive ? 'Orbit / Pan' : 'Pan'}
        </span>
        <span className="text-[#D9C9B4]">•</span>
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[#2B1E16]">Scroll:</span> Zoom
        </span>
      </div>
    </footer>
  );
};

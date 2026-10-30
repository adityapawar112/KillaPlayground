'use client';

import React from 'react';
import { TbChevronDown, TbChevronUp, TbInfoCircle } from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const BottomStatusBar: React.FC = () => {
  const { showBottomStatusBar, toggleBottomStatusBar, activeTool } = useEditorStore();
  const { t } = useTranslation();

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
    <>
      {/* Minimized Guide Tab (Pinned to bottom center) */}
      {!showBottomStatusBar && (
        <div className="hidden md:flex fixed bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none">
          <button
            onClick={toggleBottomStatusBar}
            className="flex items-center gap-1.5 px-3 py-0.5 bg-[#E4D8CB] border-x border-t border-[#CDBCAB] rounded-t-lg shadow-sm text-xs font-semibold text-[#4B382C] active:scale-95 transition-transform cursor-pointer"
            title="Show Controls & Tips"
          >
            <TbInfoCircle className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[11px] font-bold">Controls & Tips</span>
            <TbChevronUp className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Expanded Status Bar Strip */}
      {showBottomStatusBar && (
        <footer
          aria-label="Viewport Navigation Strip"
          className="hidden md:flex fixed bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none items-center justify-center max-w-[95vw]"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1 rounded-full bg-[#F2EBE1]/95 border border-[#D9C9B4] text-[10px] sm:text-[11px] font-mono text-[#634E40] shadow-sm pointer-events-auto">
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
            <span className="text-[#D9C9B4]">•</span>
            <button
              onClick={toggleBottomStatusBar}
              title="Minimize Controls Strip"
              className="p-0.5 rounded hover:bg-[#D9C9B4] text-[#8D7666] hover:text-[#4B382C] transition-colors cursor-pointer"
            >
              <TbChevronDown className="w-3 h-3" />
            </button>
          </div>
        </footer>
      )}
    </>
  );
};

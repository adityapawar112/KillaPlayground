'use client';

import React from 'react';
import { TbChevronDown, TbChevronUp, TbInfoCircle } from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const BottomStatusBar: React.FC = () => {
  const {
    showBottomStatusBar,
    toggleBottomStatusBar,
    activeTool,
    terrainSubTool,
    wallMode,
    splineMode,
    foliageSubTool,
    paintSubTool,
  } = useEditorStore();
  const { t } = useTranslation();

  const getLeftClickAction = () => {
    switch (activeTool) {
      case 'terrain':
        switch (terrainSubTool) {
          case 'elevate':
            return 'Sculpt Peak';
          case 'plateau':
            return 'Flatten Plateau';
          case 'slope':
            return 'Carve Ramp';
          case 'lower':
            return 'Excavate Gorge';
          case 'trench':
            return 'Dig Moat Trench';
          case 'smooth':
            return 'Smooth Terrain';
          case 'pond':
            return 'Dig Cistern Pond';
          case 'retexture':
          case 'soil':
            return 'Retexture Soil';
          default:
            return 'Sculpt Terrain';
        }
      case 'walls':
        if (wallMode === 'select') return 'Select Fort Wall / Bastion';
        if (wallMode === 'fortify') return 'Place Bastion / Tower';
        return 'Draft Wall Node';
      case 'spline':
        if (splineMode === 'select') return 'Select Structure Path';
        if (splineMode === 'transform') return 'Transform Path';
        return 'Draft Structure Node';
      case 'texture':
      case 'paint':
        return paintSubTool === 'erase' ? 'Erase to Raw Soil' : 'Paint Surface Texture';
      case 'foliage':
        if (foliageSubTool === 'single') return 'Plant Hero Specimen';
        if (foliageSubTool === 'erase') return 'Prune / Erase Flora';
        return 'Scatter Nature Flora';
      case 'prop':
        return 'Place Figurine';
      default:
        return 'Apply Tool';
    }
  };

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
              <span className="text-[#E85D04] font-bold">
                {getLeftClickAction()}
              </span>
            </span>
            <span className="text-[#D9C9B4]">•</span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-[#2B1E16]">Right Drag:</span> Orbit
            </span>
            <span className="text-[#D9C9B4]">•</span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-[#2B1E16]">Middle Drag:</span> Pan
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

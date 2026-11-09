'use client';

import React from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const BottomStatusBar: React.FC = () => {
  const {
    showBottomStatusBar,
    toggleBottomStatusBar,
    activeTool,
    buildingMode,
    terrainSubTool,
    wallMode,
    splineMode,
    foliageSubTool,
    paintSubTool,
    propSubTool,
    lightingSubTool,
  } = useEditorStore();
  const { t } = useTranslation();

  const getLeftClickAction = () => {
    const act = t.bottomStatusBar.actions;
    switch (activeTool) {
      case 'terrain':
        switch (terrainSubTool) {
          case 'elevate':
            return act.sculptPeak;
          case 'plateau':
            return act.flattenPlateau;
          case 'slope':
            return act.carveRamp;
          case 'lower':
            return act.excavateGorge;
          case 'trench':
            return act.digMoatTrench;
          case 'smooth':
            return act.smoothTerrain;
          case 'pond':
            return act.digCisternPond;
          case 'retexture':
          case 'soil':
            return act.retextureSoil;
          default:
            return act.sculptTerrain;
        }
      case 'building':
      case 'walls':
        if (buildingMode === 'select') return act.selectStructure;
        if (buildingMode === 'foundation') return act.dragToBuildFoundation;
        if (buildingMode === 'stairs') return act.draftStoneStairs;
        if (buildingMode === 'fortifications') return act.placeBastionTower;
        return act.draftWallNode;
      case 'spline':
        if (splineMode === 'select') return act.selectStructurePath;
        if (splineMode === 'transform') return act.transformPath;
        return act.draftStructureNode;
      case 'texture':
      case 'paint':
        return paintSubTool === 'erase' ? act.eraseToRawSoil : act.paintSurfaceTexture;
      case 'foliage':
        if (foliageSubTool === 'single') return act.plantHeroSpecimen;
        if (foliageSubTool === 'erase') return act.pruneEraseFlora;
        return act.scatterNatureFlora;
      case 'prop':
        if (propSubTool === 'erase') return act.eraseFigurine;
        if (propSubTool === 'select') return act.selectFigurine;
        if (propSubTool === 'transform') return act.transformFigurine;
        return act.placeFigurine;
      case 'lighting':
        if (lightingSubTool === 'erase') return act.eraseDiyaFirework;
        if (lightingSubTool === 'select') return act.selectLight;
        if (lightingSubTool === 'transform') return act.transformLight;
        return act.placeDiyaFirework;
      default:
        return act.applyTool;
    }
  };

  return (
    <>
      {/* Minimized Guide Tab (Pinned to bottom center) */}
      {!showBottomStatusBar && (
        <div className="hidden md:flex fixed bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none font-sans">
          <button
            onClick={toggleBottomStatusBar}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#EBE6DC] border-x border-t border-[#D8D1C5] rounded-t-md shadow-sm text-xs font-medium text-[#2B2621] hover:bg-[#D8D1C5] active:scale-95 transition-all cursor-pointer"
            title={t.bottomStatusBar.controlsAndTips}
          >
            <Info size={14} strokeWidth={1.75} className="text-[#B85F45]" />
            <span className="text-[11px] font-semibold">{t.bottomStatusBar.controlsAndTips}</span>
            <ChevronUp size={14} strokeWidth={1.75} className="text-[#5A5248]" />
          </button>
        </div>
      )}

      {/* Expanded Status Bar Strip */}
      {showBottomStatusBar && (
        <footer
          aria-label="Viewport Navigation Strip"
          className="hidden md:flex fixed bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none items-center justify-center max-w-[95vw] font-sans"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1 rounded-full bg-[#EBE6DC]/95 backdrop-blur-md border border-[#D8D1C5] text-[10px] sm:text-[11px] text-[#5A5248] shadow-sm pointer-events-auto">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-[#2B2621]">{t.bottomStatusBar.leftClick}</span>{' '}
              <span className="text-[#B85F45] font-semibold">
                {getLeftClickAction()}
              </span>
            </span>
            <span className="text-[#D8D1C5]">•</span>
            <span className="text-[#2B2621] font-medium">{t.bottomStatusBar.rightDrag}</span>
            <span className="text-[#D8D1C5]">•</span>
            <span className="text-[#2B2621] font-medium">{t.bottomStatusBar.middleDrag}</span>
            <span className="text-[#D8D1C5]">•</span>
            <span className="text-[#2B2621] font-medium">{t.bottomStatusBar.scroll}</span>
            <span className="text-[#D8D1C5]">•</span>
            <button
              onClick={toggleBottomStatusBar}
              title={t.bottomStatusBar.minimizeStrip}
              className="p-0.5 rounded hover:bg-[#D8D1C5] text-[#7C7267] hover:text-[#2B2621] transition-colors cursor-pointer"
            >
              <ChevronDown size={14} strokeWidth={1.75} />
            </button>
          </div>
        </footer>
      )}
    </>
  );
};

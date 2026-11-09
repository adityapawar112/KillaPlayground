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
            className="flex items-center gap-1.5 px-3 py-0.5 bg-[#E4D8CB] border-x border-t border-[#CDBCAB] rounded-t-lg shadow-sm text-xs font-semibold text-[#4B382C] active:scale-95 transition-transform cursor-pointer"
            title={t.bottomStatusBar.controlsAndTips}
          >
            <TbInfoCircle className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[11px] font-bold">{t.bottomStatusBar.controlsAndTips}</span>
            <TbChevronUp className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Expanded Status Bar Strip */}
      {showBottomStatusBar && (
        <footer
          aria-label="Viewport Navigation Strip"
          className="hidden md:flex fixed bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none items-center justify-center max-w-[95vw] font-sans"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1 rounded-full bg-[#F2EBE1]/95 border border-[#D9C9B4] text-[10px] sm:text-[11px] text-[#634E40] shadow-sm pointer-events-auto">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-[#2B1E16]">{t.bottomStatusBar.leftClick}</span>{' '}
              <span className="text-[#E85D04] font-bold">
                {getLeftClickAction()}
              </span>
            </span>
            <span className="text-[#D9C9B4]">•</span>
            <span className="text-[#2B1E16] font-semibold">{t.bottomStatusBar.rightDrag}</span>
            <span className="text-[#D9C9B4]">•</span>
            <span className="text-[#2B1E16] font-semibold">{t.bottomStatusBar.middleDrag}</span>
            <span className="text-[#D9C9B4]">•</span>
            <span className="text-[#2B1E16] font-semibold">{t.bottomStatusBar.scroll}</span>
            <span className="text-[#D9C9B4]">•</span>
            <button
              onClick={toggleBottomStatusBar}
              title={t.bottomStatusBar.minimizeStrip}
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

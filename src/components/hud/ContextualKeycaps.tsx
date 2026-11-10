'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const ContextualKeycaps: React.FC = () => {
  const {
    activeTool,
    terrainSubTool,
    buildingMode,
    wallMode,
    wallStep,
    splineMode,
    foliageSubTool,
    propSubTool,
    lightingSubTool,
    paintSubTool,
    showBottomStatusBar,
    toggleBottomStatusBar,
    isPresentationMode,
    isCapturingScreenshot,
    isStartupModalOpen,
    isPosterModalOpen,
    isShortcutsModalOpen,
    isAboutModalOpen,
    isResetConfirmOpen,
    isTerrainDrawerOpen,
  } = useEditorStore();
  const { t } = useTranslation();

  const isAnyModalOpen =
    isStartupModalOpen ||
    isPosterModalOpen ||
    isShortcutsModalOpen ||
    isAboutModalOpen ||
    isResetConfirmOpen;

  if (!showBottomStatusBar || isPresentationMode || isCapturingScreenshot || isAnyModalOpen) {
    return null;
  }

  const k = t.contextualKeycaps;

  const renderKeycap = (key: string, label: string) => (
    <span key={key + label} className="inline-flex items-center gap-1">
      <kbd className="px-1.5 py-0.5 rounded bg-[#423B33] text-[#FAF8F5] font-mono text-[10px] font-semibold border border-[#5A5248] shadow-2xs">
        {key}
      </kbd>
      <span className="text-[#E8DDD0] font-medium text-[11px]">{label}</span>
    </span>
  );

  const getKeycapInstructions = () => {
    switch (activeTool) {
      case 'building':
      case 'walls':
        if (buildingMode === 'walls' || wallMode === 'draw') {
          return [
            renderKeycap(k.click, k.addNode),
            renderKeycap(k.enter, k.finishWall),
            renderKeycap(k.esc, k.cancel),
          ];
        }
        if (buildingMode === 'foundation') {
          return [
            renderKeycap(k.drag, t.bottomStatusBar.actions.dragToBuildFoundation),
            renderKeycap(k.esc, k.cancel),
          ];
        }
        if (buildingMode === 'stairs') {
          return [
            renderKeycap(k.click, t.bottomStatusBar.actions.draftStoneStairs),
            renderKeycap(k.enter, k.finishWall),
            renderKeycap(k.esc, k.cancel),
          ];
        }
        return [
          renderKeycap(k.click, t.bottomStatusBar.actions.placeBastionTower),
          renderKeycap(k.esc, k.cancel),
        ];

      case 'spline':
        return [
          renderKeycap(k.click, k.addNode),
          renderKeycap(k.enter, k.finishWall),
          renderKeycap(k.esc, k.cancel),
        ];

      case 'foliage':
        if (foliageSubTool === 'erase') {
          return [
            renderKeycap(k.drag, k.erase),
            renderKeycap(k.shiftScroll, k.radius),
          ];
        }
        return [
          renderKeycap(k.drag, k.scatter),
          renderKeycap(k.altDrag, k.erase),
          renderKeycap(k.shiftScroll, k.radius),
        ];

      case 'terrain':
        if (terrainSubTool === 'elevate') {
          return [
            renderKeycap(k.drag, k.elevate),
            renderKeycap(k.ctrlDrag, k.lower),
            renderKeycap(k.shiftScroll, k.radius),
          ];
        }
        if (terrainSubTool === 'lower') {
          return [
            renderKeycap(k.drag, k.lower),
            renderKeycap(k.ctrlDrag, k.elevate),
            renderKeycap(k.shiftScroll, k.radius),
          ];
        }
        return [
          renderKeycap(k.drag, t.bottomStatusBar.actions.sculptTerrain),
          renderKeycap(k.shiftScroll, k.radius),
          renderKeycap(k.ctrlScroll, k.strength),
        ];

      case 'texture':
      case 'paint':
        if (paintSubTool === 'erase') {
          return [
            renderKeycap(k.drag, k.erase),
            renderKeycap(k.shiftScroll, k.radius),
          ];
        }
        return [
          renderKeycap(k.drag, k.paintSoil),
          renderKeycap(k.shiftScroll, k.radius),
          renderKeycap(k.ctrlScroll, k.strength),
        ];

      case 'prop':
        if (propSubTool === 'erase') {
          return [
            renderKeycap(k.click, k.erase),
            renderKeycap(k.shiftScroll, k.radius),
          ];
        }
        if (propSubTool === 'select' || propSubTool === 'transform') {
          return [
            renderKeycap(k.click, t.bottomStatusBar.actions.selectFigurine),
            renderKeycap(k.ctrlScroll, k.rotate),
          ];
        }
        return [
          renderKeycap(k.click, k.placeFigurine),
          renderKeycap(k.shiftScroll, k.scale),
          renderKeycap(k.ctrlScroll, k.rotate),
        ];

      case 'lighting':
        if (lightingSubTool === 'erase') {
          return [
            renderKeycap(k.click, k.erase),
            renderKeycap(k.shiftScroll, k.radius),
          ];
        }
        if (lightingSubTool === 'select' || lightingSubTool === 'transform') {
          return [
            renderKeycap(k.click, t.bottomStatusBar.actions.selectLight),
            renderKeycap(k.ctrlScroll, k.rotate),
          ];
        }
        return [
          renderKeycap(k.click, k.placeLight),
          renderKeycap(k.shiftScroll, k.scale),
          renderKeycap(k.ctrlScroll, k.rotate),
        ];

      case 'view':
      default:
        return [
          renderKeycap(k.drag, k.orbit),
          renderKeycap(t.bottomStatusBar.middleDrag, k.pan),
          renderKeycap(t.bottomStatusBar.scroll, k.zoom),
        ];
    }
  };

  const keycaps = getKeycapInstructions();

  return (
    <aside
      aria-label="Contextual Tool Instructions"
      className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none transition-all duration-300 font-sans ${
        isTerrainDrawerOpen ? 'md:left-[calc(50%+80px)]' : 'left-1/2'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 px-3.5 py-1 bg-[#2B2621]/90 backdrop-blur-md border border-[#423B33] rounded-full shadow-md text-xs">
        {keycaps.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-[#7C7267] text-[10px] select-none">•</span>}
            {item}
          </React.Fragment>
        ))}

        <div className="w-[1px] h-3.5 bg-[#423B33] ml-0.5" />

        <button
          onClick={toggleBottomStatusBar}
          title={t.bottomStatusBar.minimizeStrip}
          className="p-0.5 rounded-full hover:bg-[#423B33] text-[#A3978B] hover:text-[#FAF8F5] transition-colors cursor-pointer"
        >
          <X size={12} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
};

'use client';

import React, { useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Layers,
  SlidersHorizontal,
  Box,
  Component,
} from 'lucide-react';
import { useEditorStore, MobileDrawerTab } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LeftToolSidebar } from './LeftToolSidebar';
import { RightToolSidebar } from './RightToolSidebar';

export const MobileBottomDrawer: React.FC = () => {
  const {
    activeTool,
    propSubTool,
    lightingSubTool,
    selectedPropId,
    selectedLightId,
    selectedWallId,
    selectedFoundationId,
    selectedStairId,
    selectedSplineId,
    mobileDrawerTab,
    setMobileDrawerTab,
    mobileDrawerState,
    setMobileDrawerState,
    toggleMobileDrawer,
    isPresentationMode,
    isCapturingScreenshot,
  } = useEditorStore();
  const { t } = useTranslation();

  // Dynamic Tabs depending on Active Tool and Subtool
  const showPropertiesTab = true; // Always visible for editing diorama parameters
  const showAssetsTab =
    ['texture', 'paint', 'foliage'].includes(activeTool) ||
    (activeTool === 'prop' && propSubTool === 'place') ||
    (activeTool === 'lighting' && lightingSubTool === 'place');

  const showOutlinerTab =
    ['building', 'walls', 'spline'].includes(activeTool) ||
    (activeTool === 'prop' && propSubTool !== 'place') ||
    (activeTool === 'lighting' && lightingSubTool !== 'place');

  const showElementTab =
    (activeTool === 'prop' && propSubTool !== 'place') ||
    (activeTool === 'lighting' && lightingSubTool !== 'place') ||
    (['building', 'walls', 'spline'].includes(activeTool) &&
      Boolean(selectedWallId || selectedFoundationId || selectedStairId || selectedSplineId));

  // Ensure active tab never remains on a hidden tab when tool or subtool switches
  useEffect(() => {
    const availableTabs: MobileDrawerTab[] = ['properties'];
    if (showAssetsTab) availableTabs.push('assets');
    if (showOutlinerTab) availableTabs.push('outliner');
    if (showElementTab) availableTabs.push('element');

    if (!availableTabs.includes(mobileDrawerTab)) {
      if (showAssetsTab) {
        setMobileDrawerTab('assets');
      } else if (showOutlinerTab) {
        setMobileDrawerTab('outliner');
      } else {
        setMobileDrawerTab('properties');
      }
    }
  }, [showAssetsTab, showOutlinerTab, showElementTab, mobileDrawerTab, setMobileDrawerTab]);

  if (isPresentationMode || isCapturingScreenshot) return null;

  // Single-pull height: peek (44px) vs open (50vh)
  const isExpanded = mobileDrawerState === 'open' || mobileDrawerState === 'half' || mobileDrawerState === 'full';

  const handleTabClick = (tab: MobileDrawerTab) => {
    setMobileDrawerTab(tab);
    if (!isExpanded) {
      setMobileDrawerState('open');
    }
  };

  return (
    <aside
      aria-label="Mobile Bottom Tool Drawer"
      style={{
        height: isExpanded ? '50vh' : '44px',
      }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#EBE6DC] border-t-2 border-[#D8D1C5] shadow-2xl transition-[height] duration-300 ease-out select-none font-sans flex flex-col pointer-events-auto"
    >
      {/* Drawer Grab Handle & Header */}
      <div
        onClick={toggleMobileDrawer}
        className="w-full pt-1.5 pb-0.5 flex flex-col items-center justify-center cursor-pointer hover:bg-[#E0D9CE] transition-colors shrink-0"
        title={isExpanded ? 'Collapse Drawer' : 'Pull Up Drawer'}
      >
        <div className="w-10 h-1 rounded-full bg-[#8D7666]/50" />
      </div>

      {/* Tabs Bar (Row) */}
      <div className="h-[36px] px-3 flex items-center justify-between border-b border-[#D8D1C5] shrink-0 bg-[#EBE6DC]">
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
          {/* Tab 1: TOOL PROPERTIES (Always available from Left Panel) */}
          {showPropertiesTab && (
            <button
              onClick={() => handleTabClick('properties')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileDrawerTab === 'properties' && isExpanded
                  ? 'bg-[#2B2621] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
              }`}
            >
              <SlidersHorizontal size={13} className={mobileDrawerTab === 'properties' && isExpanded ? 'text-[#B85F45]' : ''} />
              <span>{t.mobileStudio?.toolProperties || 'Properties'}</span>
            </button>
          )}

          {/* Tab 2: ASSETS / BROWSER (Texture/Foliage/Props/Lighting Vault from Right Panel) */}
          {showAssetsTab && (
            <button
              onClick={() => handleTabClick('assets')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileDrawerTab === 'assets' && isExpanded
                  ? 'bg-[#2B2621] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
              }`}
            >
              <Layers size={13} className={mobileDrawerTab === 'assets' && isExpanded ? 'text-[#B85F45]' : ''} />
              <span>{t.mobileStudio?.assetsProperties || 'Assets'}</span>
            </button>
          )}

          {/* Tab 3: OUTLINER (Scene Architecture Tree or Placed Items List) */}
          {showOutlinerTab && (
            <button
              onClick={() => handleTabClick('outliner')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileDrawerTab === 'outliner' && isExpanded
                  ? 'bg-[#2B2621] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
              }`}
            >
              <Box size={13} className={mobileDrawerTab === 'outliner' && isExpanded ? 'text-[#B85F45]' : ''} />
              <span>{t.mobileStudio?.outliner || 'Outliner'}</span>
            </button>
          )}

          {/* Tab 4: ELEMENT PROPERTIES (Selected Object Inspector) */}
          {showElementTab && (
            <button
              onClick={() => handleTabClick('element')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileDrawerTab === 'element' && isExpanded
                  ? 'bg-[#2B2621] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
              }`}
            >
              <Component size={13} className={mobileDrawerTab === 'element' && isExpanded ? 'text-[#B85F45]' : ''} />
              <span>Element</span>
            </button>
          )}
        </div>

        {/* Expand / Collapse Chevron */}
        <button
          onClick={toggleMobileDrawer}
          className="p-1 rounded-md text-[#5A5248] hover:bg-[#D8D1C5] transition-colors cursor-pointer shrink-0 ml-2"
          title={isExpanded ? 'Collapse Drawer' : 'Open Drawer'}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Drawer Body: Direct reuse of battle-tested Desktop Left & Right Panels */}
      {isExpanded && (
        <div className="flex-1 min-h-0 overflow-hidden bg-[#FAF8F5]/50 flex flex-col">
          {/* TAB 1: TOOL PROPERTIES (Desktop Left Sidebar in Drawer Mode) */}
          {mobileDrawerTab === 'properties' && (
            <LeftToolSidebar isDrawer />
          )}

          {/* TAB 2: ASSETS BROWSER (Desktop Right Sidebar Asset Vaults in Drawer Mode) */}
          {mobileDrawerTab === 'assets' && (
            <RightToolSidebar isDrawer activeDrawerTab="assets" />
          )}

          {/* TAB 3: OUTLINER (Desktop Right Sidebar Architecture Tree in Drawer Mode) */}
          {mobileDrawerTab === 'outliner' && (
            <RightToolSidebar isDrawer activeDrawerTab="outliner" />
          )}

          {/* TAB 4: ELEMENT PROPERTIES (Desktop Right Sidebar Element Inspector in Drawer Mode) */}
          {mobileDrawerTab === 'element' && (
            <RightToolSidebar isDrawer activeDrawerTab="element" />
          )}
        </div>
      )}
    </aside>
  );
};

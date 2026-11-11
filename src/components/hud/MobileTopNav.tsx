'use client';

import React, { useState } from 'react';
import {
  Menu,
  Box,
  Eye,
  Castle,
  Focus,
  Camera,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Play,
  Pause,
  LayoutTemplate,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Trash2,
  X,
  FileText,
  Save,
  Download,
  FolderOpen,
  Sliders,
  Sparkles,
  HelpCircle,
  Globe,
  Check,
  Maximize2,
} from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { INTERACTION_CLASSES } from '@/lib/theme/tokens';
import { captureHeadlessDioramaSnapshot } from '@/lib/poster/posterSnapshotEngine';
import { saveLocalScreenshot } from '@/lib/persistence/screenshotVault';
import { downloadPosterBlob } from '@/lib/poster/posterShare';

interface MobileTopNavProps {
  onOpenMenu?: () => void;
}

export const MobileTopNav: React.FC<MobileTopNavProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [axisIndex, setAxisIndex] = useState(0);

  const {
    nightMode,
    toggleNightMode,
    isPlaying,
    togglePlay,
    viewMode,
    setViewMode,
    cameraViewPreset,
    activeCameraPreset,
    setCameraViewPreset,
    workspaceLayout,
    toggleWorkspaceLayout,
    setWorkspaceLayout,
    isPresentationMode,
    setPresentationMode,
    togglePresentationMode,
    isCapturingScreenshot,
    setIsCapturingScreenshot,
    setToastMessage,
    openDestructiveConfirm,
    setStartupModalOpen,
    setPosterModalOpen,
    setShortcutsModalOpen,
    setAboutModalOpen,
    saveProjectLocally,
    exportProjectData,
    exportKillaBinary,
    showWireframe,
    toggleWireframe,
    showGuides,
    toggleGuides,
    showBrickRing,
    toggleBrickRing,
    locale,
    setLocale,
  } = useEditorStore();

  const undo = useTerrainStore((s) => s.undo);
  const redo = useTerrainStore((s) => s.redo);
  const canUndo = useTerrainStore((s) => (s.historyVersion !== undefined ? s.canUndo() : s.canUndo()));
  const canRedo = useTerrainStore((s) => (s.historyVersion !== undefined ? s.canRedo() : s.canRedo()));
  const resetTerrain = useTerrainStore((s) => s.resetTerrain);

  const { t } = useTranslation();

  if (isPresentationMode || isCapturingScreenshot) return null;

  // Camera Presets Cycle
  const CAMERA_CYCLE = [
    { id: 'isometric' as const, label: 'Iso', icon: Box, color: 'text-[#8F4938]' },
    { id: 'top' as const, label: 'Top', icon: Eye, color: 'text-[#0284C7]' },
    { id: 'rampart' as const, label: 'Rmp', icon: Castle, color: 'text-[#B85F45]' },
    { id: 'reset' as const, label: 'Hom', icon: Focus, color: 'text-[#777A57]' },
  ];
  const camIdx = Math.max(0, CAMERA_CYCLE.findIndex((c) => c.id === activeCameraPreset));
  const currentCam = CAMERA_CYCLE[camIdx] || CAMERA_CYCLE[0];
  const CamIcon = currentCam.icon;

  const handleCycleCamera = () => {
    const nextIdx = (camIdx + 1) % CAMERA_CYCLE.length;
    setCameraViewPreset(CAMERA_CYCLE[nextIdx].id);
  };

  // Axis Snapping Cycle: Front (Z) -> Top (Y) -> Side (X)
  const AXIS_CYCLE = [
    { id: 'front' as const, label: 'Z', bg: 'bg-[#0284C7]', title: 'Front View (Z)' },
    { id: 'top' as const, label: 'Y', bg: 'bg-[#15803D]', title: 'Top View (Y)' },
    { id: 'side' as const, label: 'X', bg: 'bg-[#DC2626]', title: 'Side View (X)' },
  ];
  const currentAxis = AXIS_CYCLE[axisIndex] || AXIS_CYCLE[0];

  const handleCycleAxis = () => {
    const nextIdx = (axisIndex + 1) % AXIS_CYCLE.length;
    setAxisIndex(nextIdx);
    setCameraViewPreset(AXIS_CYCLE[nextIdx].id);
  };

  // Turntable Toggle
  const isTurntableActive = viewMode === 'turntable';
  const handleToggleTurntable = () => {
    setViewMode(isTurntableActive ? 'orbit' : 'turntable');
  };

  // Screenshot Capture
  const handleScreenshot = async () => {
    setIsCapturingScreenshot(true);
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 80)));
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `killa-mobile-${timestamp}.png`;
      let dataUrl: string;
      try {
        const shot = await captureHeadlessDioramaSnapshot(1280, 720);
        dataUrl = shot.dataUrl;
        shot.canvas.toBlob((blob) => {
          if (blob) downloadPosterBlob(blob, filename);
        }, 'image/png');
      } catch {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        if (!canvas) throw new Error('Canvas not found');
        dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = filename;
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      try {
        await saveLocalScreenshot(dataUrl, 1280, 720);
      } catch {}
      setToastMessage('Screenshot saved & downloaded!');
    } catch {
      setToastMessage('Screenshot failed');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Reset Terrain Dialog
  const handleResetTerrain = () => {
    openDestructiveConfirm({
      title: 'Reset Entire Terrain',
      description: 'Are you sure you want to reset all sculpt modifications to default plateau level?',
      confirmLabel: 'Reset Terrain',
      onConfirm: () => {
        resetTerrain();
        setToastMessage('Terrain reset to defaults.');
      },
    });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 select-none font-sans pointer-events-auto">
        {/* Row 1: Primary Mobile Navigation (38px) */}
        <div className="h-[38px] px-2 bg-[#EBE6DC]/95 backdrop-blur-md border-b border-[#D8D1C5] shadow-xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {/* 1. Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`min-w-[32px] h-[30px] p-1.5 rounded-lg bg-[#FAF8F5] text-[#2B2621] border border-[#D8D1C5] hover:bg-[#D8D1C5] transition-colors cursor-pointer flex items-center justify-center shrink-0 ${INTERACTION_CLASSES.focusRing}`}
            title="Open Studio Menu"
            aria-label="Open Studio Menu"
          >
            <Menu size={16} strokeWidth={2} />
          </button>

          {/* 2. Camera View Preset Cycle Button */}
          <button
            onClick={handleCycleCamera}
            className="h-[30px] px-2 rounded-lg bg-[#FAF8F5] hover:bg-[#D8D1C5] text-[#2B2621] border border-[#D8D1C5] text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-all"
            title={`Camera: ${currentCam.label} (Tap to cycle: Iso → Top → Rampart → Home)`}
          >
            <CamIcon size={12} strokeWidth={2} className={currentCam.color} />
            <span>{currentCam.label}</span>
          </button>

          {/* 3. Axis Snap Cycle Button */}
          <button
            onClick={handleCycleAxis}
            className="w-[30px] h-[30px] rounded-lg bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
            title={`Axis Snap: ${currentAxis.title} (Tap to cycle: Z → Y → X)`}
          >
            <span className={`w-4 h-4 rounded-full ${currentAxis.bg} text-white flex items-center justify-center text-[9px] font-black`}>
              {currentAxis.label}
            </span>
          </button>

          {/* 4. Undo / Redo / Reset Group */}
          <div className="flex items-center gap-0.5 shrink-0 bg-[#FAF8F5] p-0.5 rounded-lg border border-[#D8D1C5]">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`w-6 h-6 rounded flex items-center justify-center text-[#2B2621] transition-all cursor-pointer ${
                canUndo ? 'hover:bg-[#D8D1C5] active:scale-90' : 'opacity-30 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={12} strokeWidth={2} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`w-6 h-6 rounded flex items-center justify-center text-[#2B2621] transition-all cursor-pointer ${
                canRedo ? 'hover:bg-[#D8D1C5] active:scale-90' : 'opacity-30 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={12} strokeWidth={2} />
            </button>
            <button
              onClick={handleResetTerrain}
              className="w-6 h-6 rounded flex items-center justify-center text-[#B85F45] hover:bg-[#D8D1C5] active:scale-90 transition-all cursor-pointer"
              title="Reset Terrain"
            >
              <Trash2 size={12} strokeWidth={2} />
            </button>
          </div>

          {/* 5. Zoom Controls (+/-) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setCameraViewPreset('zoom_in')}
              className="w-[28px] h-[30px] rounded-lg bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center cursor-pointer active:scale-95 text-[#2B2621]"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn size={13} strokeWidth={2} />
            </button>
            <button
              onClick={() => setCameraViewPreset('zoom_out')}
              className="w-[28px] h-[30px] rounded-lg bg-[#FAF8F5] hover:bg-[#D8D1C5] border border-[#D8D1C5] flex items-center justify-center cursor-pointer active:scale-95 text-[#2B2621]"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut size={13} strokeWidth={2} />
            </button>
          </div>

          {/* 6. Festive Fort Poster Studio */}
          <button
            onClick={() => setPosterModalOpen(true)}
            className="h-[30px] px-2 rounded-lg bg-[#E85D04] hover:bg-[#D04E00] text-white text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 shadow-xs transition-all"
            title="Festive Fort Poster Studio"
          >
            <Sparkles size={12} strokeWidth={2} />
            <span>Poster</span>
          </button>
        </div>

        {/* Row 2: Attached Playback, Turntable, Workspace, Screenshot & Day/Night (28px) */}
        <div className="h-[28px] px-2 bg-[#E4DFD5]/90 backdrop-blur-xs border-b border-[#D8D1C5] flex items-center justify-between text-[10px] font-semibold text-[#5A5248]">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#D8D1C5] hover:bg-[#D8D1C5] text-[#2B2621] transition-all cursor-pointer active:scale-95"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                <Pause size={10} strokeWidth={2} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C7267]" />
                <Play size={10} strokeWidth={2} />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Turntable 360° */}
          <button
            onClick={handleToggleTurntable}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border transition-all cursor-pointer active:scale-95 ${
              isTurntableActive
                ? 'bg-[#2B2621] text-[#F59E0B] border-[#1C1815]'
                : 'bg-[#FAF8F5] text-[#2B2621] border-[#D8D1C5] hover:bg-[#D8D1C5]'
            }`}
            title="360° Turntable Spin"
          >
            <RefreshCw size={10} strokeWidth={2} className={isTurntableActive ? 'animate-spin' : ''} />
            <span>Spin</span>
          </button>

          {/* 1-Click Presentation Mode Trigger */}
          <button
            onClick={togglePresentationMode}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all cursor-pointer active:scale-95 ${
              isPresentationMode
                ? 'bg-[#B85F45] text-white border-[#8E4430] shadow-xs'
                : 'bg-[#FAF8F5] text-[#2B2621] border-[#D8D1C5] hover:bg-[#D8D1C5]'
            }`}
            title="Present Mode"
          >
            <Maximize2 size={10} strokeWidth={2} className={isPresentationMode ? 'text-white' : 'text-[#B85F45]'} />
            <span className="font-semibold">Present</span>
          </button>

          {/* Screenshot */}
          <button
            onClick={handleScreenshot}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#D8D1C5] text-[#2B2621] hover:bg-[#D8D1C5] cursor-pointer active:scale-95"
            title="Capture Screenshot"
          >
            <Camera size={10} strokeWidth={2} className="text-[#B85F45]" />
            <span>Shot</span>
          </button>

          {/* Ambient Day / Night */}
          <button
            onClick={toggleNightMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer active:scale-95 ${
              nightMode
                ? 'bg-[#2B2621] text-[#F59E0B] border-[#1C1815]'
                : 'bg-[#FAF8F5] text-[#D97706] border-[#D8D1C5] hover:bg-[#D8D1C5]'
            }`}
            title={nightMode ? 'Day Mode' : 'Diwali Night Mode'}
          >
            {nightMode ? (
              <>
                <Moon size={10} strokeWidth={2} className="text-[#F59E0B]" />
                <span>Night</span>
              </>
            ) : (
              <>
                <Sun size={10} strokeWidth={2} className="text-[#F59E0B]" />
                <span>Day</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE HAMBURGER STUDIO MENU DRAWER                      */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex select-none font-sans animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Sheet (Slide in from Left) */}
          <div className="relative w-[85vw] max-w-xs h-full bg-[#EBE6DC] shadow-2xl border-r border-[#D8D1C5] flex flex-col z-10 animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-4 bg-[#2B2621] text-white flex items-center justify-between border-b border-[#D8D1C5]/40 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-yatra text-lg tracking-wide">The Killa Playground</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#B85F45] text-[9px] font-bold">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu Sections Container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs text-[#2B2621]">
              {/* SECTION: FILE */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C7267] flex items-center gap-1.5">
                  <FileText size={12} />
                  <span>File & Projects</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setStartupModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Blueprints & Templates</span>
                  <FolderOpen size={14} className="text-[#0284C7]" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    saveProjectLocally();
                    setToastMessage('Fort saved locally to device storage!');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Save Locally</span>
                  <Save size={14} className="text-[#15803D]" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    exportKillaBinary();
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Export .killa Archive</span>
                  <Download size={14} className="text-[#B85F45]" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    exportProjectData();
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Export JSON Schema</span>
                  <Download size={14} className="text-[#7C7267]" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setPosterModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#D97706]" />
                    <span>Festive Fort Poster Studio</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#E85D04]/10 text-[#E85D04] px-2 py-0.5 rounded-full">HD Poster</span>
                </button>
              </div>

              {/* SECTION: PRESENTATION MODE */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C7267] flex items-center gap-1.5">
                  <Maximize2 size={12} />
                  <span>Presentation</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    togglePresentationMode();
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Maximize2 size={14} className="text-[#B85F45]" />
                    <span>Presentation View</span>
                  </div>
                  <span className="text-[10px] text-[#7C7267] font-mono">1-Tap</span>
                </button>
              </div>

              {/* SECTION: VIEWPORT GUIDES */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C7267] flex items-center gap-1.5">
                  <Sliders size={12} />
                  <span>Guides & Visual Overlays</span>
                </div>
                <button
                  onClick={toggleWireframe}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Terrain Wireframe Mesh</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${showWireframe ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {showWireframe ? 'ON' : 'OFF'}
                  </span>
                </button>
                <button
                  onClick={toggleGuides}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Coordinate Axis Guides</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${showGuides ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {showGuides ? 'ON' : 'OFF'}
                  </span>
                </button>
                <button
                  onClick={toggleBrickRing}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Brick Retaining Edge</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${showBrickRing ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {showBrickRing ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* SECTION: LANGUAGE */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C7267] flex items-center gap-1.5">
                  <Globe size={12} />
                  <span>Language / भाषा</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'mr', label: 'मराठी' },
                    { code: 'hi', label: 'हिंदी' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLocale(lang.code as any)}
                      className={`py-1.5 rounded-lg text-center font-bold text-xs border ${
                        locale === lang.code
                          ? 'bg-[#2B2621] text-white border-[#1C1815]'
                          : 'bg-[#FAF8F5] text-[#5A5248] border-[#D8D1C5] hover:bg-[#D8D1C5]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: HELP */}
              <div className="space-y-1 pt-2 border-t border-[#D8D1C5]">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShortcutsModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>Keyboard Shortcuts</span>
                  <HelpCircle size={14} className="text-[#5A5248]" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAboutModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#D8D1C5] text-left font-semibold flex items-center justify-between border border-[#D8D1C5]"
                >
                  <span>About Killa Playground</span>
                  <Sparkles size={14} className="text-[#B85F45]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

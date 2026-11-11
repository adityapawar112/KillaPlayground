'use client';

import React, { useCallback } from 'react';
import {
  Box,
  Eye,
  Castle,
  Focus,
  Sun,
  Moon,
  Play,
  Pause,
  RefreshCw,
  Camera,
  Maximize2,
} from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { captureHeadlessDioramaSnapshot } from '@/lib/poster/posterSnapshotEngine';
import { saveLocalScreenshot } from '@/lib/persistence/screenshotVault';
import { downloadPosterBlob } from '@/lib/poster/posterShare';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const ViewportBottomBar: React.FC = () => {
  const {
    nightMode,
    timeOfDay,
    setSunDirectionPreset,
    isPlaying,
    togglePlay,
    viewMode,
    setViewMode,
    cameraViewPreset,
    activeCameraPreset,
    setCameraViewPreset,
    isCapturingScreenshot,
    setIsCapturingScreenshot,
    setToastMessage,
    isPresentationMode,
    togglePresentationMode,
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

  const handleDayNightToggle = useCallback(() => {
    if (nightMode) {
      setSunDirectionPreset('noon');
    } else {
      setSunDirectionPreset('night');
    }
  }, [nightMode, setSunDirectionPreset]);

  const handleTurntableToggle = useCallback(() => {
    if (viewMode === 'turntable') {
      setViewMode('orbit');
    } else {
      setViewMode('turntable');
    }
  }, [viewMode, setViewMode]);

  const handleScreenshot = useCallback(async () => {
    setIsCapturingScreenshot(true);

    // Allow React one frame to cleanly suppress all HUD elements
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 75)));

    try {
      if (typeof window !== 'undefined' && (window as any).__killa_invalidate) {
        (window as any).__killa_invalidate();
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `killa-diorama-${timestamp}.png`;

      let dataUrl: string;
      try {
        const shot = await captureHeadlessDioramaSnapshot(1920, 1080);
        dataUrl = shot.dataUrl;

        shot.canvas.toBlob((blob) => {
          if (blob) {
            downloadPosterBlob(blob, filename);
          }
        }, 'image/png');
      } catch (e) {
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
        await saveLocalScreenshot(dataUrl, 1920, 1080);
      } catch (vaultErr) {
        console.warn('Failed to save to local screenshot vault:', vaultErr);
      }

      setToastMessage(t.dioramaQuickBar.screenshotDownloaded);
    } catch (err) {
      console.error('Screenshot capture failed', err);
      setToastMessage(t.dioramaQuickBar.screenshotFailed);
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [setIsCapturingScreenshot, setToastMessage, t]);

  // Cleanly suppress when taking screenshot, in presentation mode (handled by dedicated bar), or when full modal is open
  if (isCapturingScreenshot || isPresentationMode || isAnyModalOpen) return null;

  const isNightActive = nightMode;
  const isTurntableActive = viewMode === 'turntable';

  return (
    <nav
      role="toolbar"
      aria-label="Unified Viewport Toolbar"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none transition-all duration-300 font-sans ${
        isTerrainDrawerOpen ? 'md:left-[calc(50%+80px)]' : 'left-1/2'
      }`}
    >
      <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#EBE6DC]/95 backdrop-blur-md border border-[#D8D1C5] rounded-full shadow-lg text-xs font-semibold text-[#2B2621]">
        {/* ======================================================== */}
        {/* CLUSTER A: CAMERA PERSPECTIVES (Cycle Button)             */}
        {/* ======================================================== */}
        <div className="flex items-center">
          {(() => {
            const CAMERA_CYCLE = [
              { id: 'isometric' as const, label: t.dioramaQuickBar.isometric, icon: Box, color: 'text-[#8F4938]' },
              { id: 'top' as const, label: t.dioramaQuickBar.birdsEye, icon: Eye, color: 'text-[#0284C7]' },
              { id: 'rampart' as const, label: t.dioramaQuickBar.rampartEye, icon: Castle, color: 'text-[#B85F45]' },
              { id: 'reset' as const, label: t.dioramaQuickBar.resetHome, icon: Focus, color: 'text-[#777A57]' },
            ];
            const currentIdx = Math.max(0, CAMERA_CYCLE.findIndex((c) => c.id === activeCameraPreset));
            const current = CAMERA_CYCLE[currentIdx] || CAMERA_CYCLE[0];
            const CurrentIcon = current.icon;

            const handleCycleCamera = () => {
              const nextIdx = (currentIdx + 1) % CAMERA_CYCLE.length;
              setCameraViewPreset(CAMERA_CYCLE[nextIdx].id);
            };

            return (
              <button
                onClick={handleCycleCamera}
                title={`Camera View: ${current.label} (Click to cycle view)`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-all cursor-pointer group"
              >
                <CurrentIcon size={13} strokeWidth={1.75} className={current.color} />
                <span className="text-[11px] font-semibold">{current.label}</span>
                <span className="text-[9px] text-[#7C7267] group-hover:text-[#2B2621] font-mono transition-transform group-hover:rotate-45">
                  ↻
                </span>
              </button>
            );
          })()}
        </div>

        {/* Hairline Divider between Camera & Environment Clusters */}
        <div className="w-[1px] h-4 bg-[#D8D1C5] mx-0.5 select-none" />

        {/* ======================================================== */}
        {/* CLUSTER B: ENVIRONMENTAL & PLAYBACK (Review Item 11)     */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1">
          {/* 5. Day / Night Toggle (N) */}
          <button
            onClick={handleDayNightToggle}
            title={isNightActive ? t.dioramaQuickBar.dayTitle : t.dioramaQuickBar.nightTitle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isNightActive
                ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                : 'text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
            }`}
          >
            {isNightActive ? (
              <>
                <Moon size={13} strokeWidth={1.75} className="text-[#38BDF8]" />
                <span className="text-[11px] font-semibold">{t.dioramaQuickBar.night}</span>
              </>
            ) : (
              <>
                <Sun size={13} strokeWidth={1.75} className="text-[#F59E0B]" />
                <span className="text-[11px] font-semibold">{t.dioramaQuickBar.day}</span>
              </>
            )}
          </button>

          {/* 6. Play / Pause Animation Engine (Space) */}
          <button
            onClick={togglePlay}
            title={isPlaying ? t.dioramaQuickBar.pauseTitle : t.dioramaQuickBar.playTitle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#2B2621] text-[#FAF8F5]'
                : 'bg-[#FAF8F5] text-[#5A5248] border border-[#D8D1C5] hover:bg-[#D8D1C5]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={13} strokeWidth={1.75} className="text-[#B85F45]" />
                <span className="text-[11px] font-semibold hidden sm:inline">{t.dioramaQuickBar.pause}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
              </>
            ) : (
              <>
                <Play size={13} strokeWidth={1.75} className="text-[#5A5248]" />
                <span className="text-[11px] font-semibold hidden sm:inline">{t.dioramaQuickBar.play}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3978B]" />
              </>
            )}
          </button>

          {/* 7. Turntable 360° Spin */}
          <button
            onClick={handleTurntableToggle}
            title={t.dioramaQuickBar.turntableTooltip}
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all cursor-pointer ${
              isTurntableActive
                ? 'bg-[#2B2621] text-[#FAF8F5]'
                : 'text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621]'
            }`}
          >
            <RefreshCw
              size={13}
              strokeWidth={1.75}
              className={isTurntableActive ? 'text-[#B85F45] animate-spin' : 'text-[#7C7267]'}
            />
            <span className="text-[11px] font-semibold hidden sm:inline">{t.dioramaQuickBar.turntable}</span>
          </button>

          {/* 8. Headless Snapshot Capture (F12) */}
          <button
            onClick={handleScreenshot}
            title={t.dioramaQuickBar.screenshotTooltip}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          >
            <Camera size={13} strokeWidth={1.75} className="text-[#B85F45]" />
            <span className="text-[11px] font-semibold hidden lg:inline">{t.dioramaQuickBar.screenshot}</span>
          </button>

          {/* 9. 1-Click Presentation Mode Trigger (Key P) */}
          <button
            onClick={togglePresentationMode}
            title={t.dioramaQuickBar.presentationTooltip}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B85F45] text-white hover:bg-[#A04F38] active:scale-95 transition-all cursor-pointer shadow-xs ml-0.5"
          >
            <Maximize2 size={13} strokeWidth={1.75} />
            <span className="text-[11px] font-semibold hidden sm:inline">{t.dioramaQuickBar.presentation}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

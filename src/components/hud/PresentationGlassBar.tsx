'use client';

import React, { useCallback } from 'react';
import {
  Box,
  Eye,
  Castle,
  Flag,
  Focus,
  Sun,
  Moon,
  RefreshCw,
  Camera,
  Sparkles,
  X,
  LayoutTemplate,
} from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { captureHeadlessDioramaSnapshot } from '@/lib/poster/posterSnapshotEngine';
import { saveLocalScreenshot } from '@/lib/persistence/screenshotVault';
import { downloadPosterBlob } from '@/lib/poster/posterShare';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const PresentationGlassBar: React.FC = () => {
  const {
    isPresentationMode,
    setPresentationMode,
    workspaceLayout,
    setWorkspaceLayout,
    toggleWorkspaceLayout,
    isCapturingScreenshot,
    setIsCapturingScreenshot,
    setToastMessage,
    nightMode,
    setSunDirectionPreset,
    viewMode,
    setViewMode,
    cameraViewPreset,
    setCameraViewPreset,
    setPosterModalOpen,
  } = useEditorStore();
  const { t } = useTranslation();

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
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 75)));

    try {
      if (typeof window !== 'undefined' && (window as any).__killa_invalidate) {
        (window as any).__killa_invalidate();
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `killa-presentation-${timestamp}.png`;

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

  if (!isPresentationMode || isCapturingScreenshot) return null;

  const isTurntableActive = viewMode === 'turntable';

  return (
    <>
      {/* 1. MOBILE & TABLET PRESENTATION BAR (< 1024px): Vertical Pinned Left */}
      <div
        role="toolbar"
        aria-label="Mobile Diorama Exhibition Bar"
        className="lg:hidden fixed left-3 top-1/2 -translate-y-1/2 z-40 pointer-events-auto select-none transition-all duration-300 font-sans"
      >
        <div className="flex flex-col items-center gap-2 p-2 bg-[#2B2621]/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-xs text-white">
          {/* Camera View Cycle Button */}
          {(() => {
            const PRESETS = [
              { id: 'isometric' as const, label: 'Iso', icon: Box, color: 'text-[#F59E0B]' },
              { id: 'top' as const, label: 'Top', icon: Eye, color: 'text-[#38BDF8]' },
              { id: 'rampart' as const, label: 'Rampart', icon: Castle, color: 'text-[#E85D04]' },
              { id: 'reset' as const, label: 'Home', icon: Focus, color: 'text-[#A3E635]' },
            ];
            return (
              <button
                onClick={() => {
                  const currentIdx = Math.max(0, PRESETS.findIndex((p) => p.id === useEditorStore.getState().cameraViewPreset));
                  const nextPreset = PRESETS[(currentIdx + 1) % PRESETS.length];
                  setCameraViewPreset(nextPreset.id);
                }}
                title="Cycle Camera View"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
              >
                <Box size={16} strokeWidth={2} className="text-[#F59E0B]" />
              </button>
            );
          })()}

          {/* Turntable 360° */}
          <button
            onClick={handleTurntableToggle}
            title={t.dioramaQuickBar.turntableTooltip}
            className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isTurntableActive ? 'bg-white/25 text-white' : 'hover:bg-white/15 text-white/80 hover:text-white'
            }`}
          >
            <RefreshCw
              size={15}
              strokeWidth={2}
              className={isTurntableActive ? 'text-[#F59E0B] animate-spin' : ''}
            />
          </button>

          {/* Day / Night Toggle */}
          <button
            onClick={handleDayNightToggle}
            title={nightMode ? t.dioramaQuickBar.dayTitle : t.dioramaQuickBar.nightTitle}
            className="p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            {nightMode ? (
              <Moon size={15} strokeWidth={2} className="text-[#38BDF8]" />
            ) : (
              <Sun size={15} strokeWidth={2} className="text-[#F59E0B]" />
            )}
          </button>

          {/* Screenshot */}
          <button
            onClick={handleScreenshot}
            title={t.dioramaQuickBar.screenshotTooltip}
            className="p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <Camera size={15} strokeWidth={2} className="text-[#B85F45]" />
          </button>

          {/* Poster Studio */}
          <button
            onClick={() => {
              setPresentationMode(false);
              setPosterModalOpen(true);
            }}
            title="Open Poster Studio"
            className="p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <Sparkles size={15} strokeWidth={2} className="text-[#F59E0B]" />
          </button>

          {/* Workspace Layout Switcher (Tap to cycle: Standard) */}
          <button
            onClick={toggleWorkspaceLayout}
            title={`Workspace: ${workspaceLayout} (Tap to cycle: Standard Studio)`}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F59E0B] transition-all cursor-pointer active:scale-95"
          >
            <LayoutTemplate size={15} strokeWidth={2} />
          </button>

          <div className="w-4 h-[1px] bg-white/20 my-0.5" />

          {/* Exit Presentation Mode */}
          <button
            onClick={() => {
              setPresentationMode(false);
              setWorkspaceLayout('standard');
            }}
            title="Exit Presentation"
            className="p-2 rounded-xl bg-[#B85F45] text-white hover:bg-[#A04F38] active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 2. DESKTOP PRESENTATION BAR (>= 1024px): Horizontal Bottom */}
      <div
        role="toolbar"
        aria-label="Diorama Exhibition Bar"
        className="hidden lg:block fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none transition-all duration-300 font-sans"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 bg-[#2B2621]/85 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl text-xs text-white">
          {/* 1. Camera View Presets Cluster */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCameraViewPreset('isometric')}
              title={t.dioramaQuickBar.isometricTooltip}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Box size={14} strokeWidth={1.75} className="text-[#F59E0B]" />
            </button>
            <button
              onClick={() => setCameraViewPreset('top')}
              title={t.dioramaQuickBar.birdsEyeTooltip}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Eye size={14} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setCameraViewPreset('rampart')}
              title={t.dioramaQuickBar.rampartEyeTooltip}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Castle size={14} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setCameraViewPreset('bastion')}
              title="Bastion Hero View"
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Flag size={14} strokeWidth={1.75} className="text-[#EA580C]" />
            </button>
            <button
              onClick={() => setCameraViewPreset('reset')}
              title={t.dioramaQuickBar.resetHomeTooltip}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Focus size={14} strokeWidth={1.75} />
            </button>
          </div>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* 2. Turntable 360° Spin */}
          <button
            onClick={handleTurntableToggle}
            title={t.dioramaQuickBar.turntableTooltip}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isTurntableActive ? 'bg-white/25 text-white' : 'hover:bg-white/15 text-white/80 hover:text-white'
            }`}
          >
            <RefreshCw
              size={13}
              strokeWidth={1.75}
              className={isTurntableActive ? 'text-[#F59E0B] animate-spin' : ''}
            />
            <span className="text-[11px] font-semibold">{t.dioramaQuickBar.turntable}</span>
          </button>

          {/* 3. Day / Night Toggle */}
          <button
            onClick={handleDayNightToggle}
            title={nightMode ? t.dioramaQuickBar.dayTitle : t.dioramaQuickBar.nightTitle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            {nightMode ? (
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

          {/* 4. Headless Snapshot Capture */}
          <button
            onClick={handleScreenshot}
            title={t.dioramaQuickBar.screenshotTooltip}
            className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <Camera size={14} strokeWidth={1.75} className="text-[#B85F45]" />
          </button>

          {/* 5. Open Poster Studio Shortcut */}
          <button
            onClick={() => {
              setPresentationMode(false);
              setPosterModalOpen(true);
            }}
            title="Open Festive Fort Poster Studio"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles size={13} strokeWidth={1.75} className="text-[#F59E0B]" />
            <span className="text-[11px] font-semibold">Poster Studio</span>
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* 6. Workspace Layout Cycle (Returns to Standard Studio) */}
          <button
            onClick={toggleWorkspaceLayout}
            title={`Workspace: ${workspaceLayout} (Click to cycle to Standard Studio)`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <LayoutTemplate size={13} strokeWidth={1.75} className="text-[#F59E0B]" />
            <span className="text-[11px] font-semibold">Presentation</span>
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* 7. Exit Presentation Mode Button (Esc) */}
          <button
            onClick={() => {
              setPresentationMode(false);
              setWorkspaceLayout('standard');
            }}
            title={t.dioramaQuickBar.escHint}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B85F45] text-white hover:bg-[#A04F38] active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <X size={13} strokeWidth={2.5} />
            <span className="text-[11px] font-bold">{t.dioramaQuickBar.exitPresentation}</span>
            <kbd className="text-[10px] text-white/70 font-mono hidden sm:inline ml-0.5">Esc</kbd>
          </button>
        </div>
      </div>
    </>
  );
};

'use client';

import React, { useCallback } from 'react';
import {
  TbSun,
  TbMoon,
  TbPlayerPlay,
  TbPlayerPause,
  TbCamera,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { captureHeadlessDioramaSnapshot } from '@/lib/poster/posterSnapshotEngine';
import { saveLocalScreenshot } from '@/lib/persistence/screenshotVault';
import { downloadPosterBlob } from '@/lib/poster/posterShare';

export const DioramaQuickBar: React.FC = () => {
  const {
    nightMode,
    timeOfDay,
    setSunDirectionPreset,
    isPlaying,
    togglePlay,
    showBottomStatusBar,
    isCapturingScreenshot,
    setIsCapturingScreenshot,
    setToastMessage,
  } = useEditorStore();

  const handleDay = useCallback(() => {
    setSunDirectionPreset('noon');
  }, [setSunDirectionPreset]);

  const handleNight = useCallback(() => {
    setSunDirectionPreset('night');
  }, [setSunDirectionPreset]);

  const handleScreenshot = useCallback(async () => {
    setIsCapturingScreenshot(true);

    // Allow React one animation frame to cleanly suppress all HUD elements
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 75)));

    try {
      if (typeof window !== 'undefined' && (window as any).__killa_invalidate) {
        (window as any).__killa_invalidate();
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `killa-diorama-${timestamp}.png`;

      // 1. Capture headless 1920x1080 offscreen snapshot (independent of screen size)
      let dataUrl: string;
      try {
        const shot = await captureHeadlessDioramaSnapshot(1920, 1080);
        dataUrl = shot.dataUrl;

        // Convert canvas to blob for download
        shot.canvas.toBlob((blob) => {
          if (blob) {
            downloadPosterBlob(blob, filename);
          }
        }, 'image/png');
      } catch (e) {
        // Fallback to DOM canvas if headless capture encounters an issue
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

      // 2. Save Copy 2 to Local IndexedDB Gallery
      try {
        await saveLocalScreenshot(dataUrl, 1920, 1080);
      } catch (vaultErr) {
        console.warn('Failed to save to local screenshot vault:', vaultErr);
      }

      setToastMessage('Diorama snapshot downloaded & saved to your Poster Gallery!');
    } catch (err) {
      console.error('Screenshot capture failed', err);
      setToastMessage('Failed to capture screenshot');
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [setIsCapturingScreenshot, setToastMessage]);

  // Suppress diorama bar completely while taking screenshot
  if (isCapturingScreenshot) return null;

  const isDayActive = !nightMode && Math.abs(timeOfDay - 12.0) <= 3.0;
  const isNightActive = nightMode;

  const bottomOffsetClass = showBottomStatusBar ? 'bottom-11 md:bottom-13' : 'bottom-3 md:bottom-5';

  return (
    <div
      role="toolbar"
      aria-label="Diorama Quick Actions"
      className={`fixed ${bottomOffsetClass} left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none transition-all duration-200`}
    >
      <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 bg-[#FAF8F5]/95 backdrop-blur-xs border border-[#D9C9B4] rounded-full shadow-md text-xs font-semibold text-[#4B382C]">
        {/* 1. Day Mode Button */}
        <button
          onClick={handleDay}
          title="Warm Courtyard Daylight (Noon)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            isDayActive
              ? 'bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B] shadow-xs'
              : 'text-[#634E40] hover:bg-[#EFE8DD] hover:text-[#2B1E16]'
          }`}
        >
          <TbSun className={`w-3.5 h-3.5 ${isDayActive ? 'text-[#F59E0B]' : 'text-[#8D7666]'}`} />
          <span className="text-[11px] font-bold">Day</span>
        </button>

        <span className="text-[#D9C9B4] text-[10px] select-none">•</span>

        {/* 2. Play / Pause Animation Engine Toggle */}
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pause Animation (Space)' : 'Play Animation (Space)'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            isPlaying
              ? 'bg-[#EADECF] text-[#4B382C] border border-[#CDBCAB]'
              : 'bg-[#F2E8DC] text-[#8D7666] border border-dashed border-[#CDBCAB]'
          }`}
        >
          {isPlaying ? (
            <>
              <TbPlayerPause className="w-3.5 h-3.5 text-[#B85F45]" />
              <span className="text-[11px] font-bold">Pause</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            </>
          ) : (
            <>
              <TbPlayerPlay className="w-3.5 h-3.5 text-[#634E40]" />
              <span className="text-[11px] font-bold">Play</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
            </>
          )}
        </button>

        <span className="text-[#D9C9B4] text-[10px] select-none">•</span>

        {/* 3. Instant Viewport Screenshot Capture */}
        <button
          onClick={handleScreenshot}
          title="Capture High-Res Screenshot (P)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[#634E40] hover:bg-[#EFE8DD] hover:text-[#2B1E16] transition-colors cursor-pointer"
        >
          <TbCamera className="w-3.5 h-3.5 text-[#8F4938]" />
          <span className="text-[11px] font-bold hidden sm:inline">Screenshot</span>
        </button>

        <span className="text-[#D9C9B4] text-[10px] select-none">•</span>

        {/* 4. Diwali Night & Fireworks Salvo Button */}
        <button
          onClick={handleNight}
          title="Diwali Night & Celebratory Fireworks (N)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            isNightActive
              ? 'bg-[#1E293B] text-[#38BDF8] border border-[#0EA5E9] shadow-xs'
              : 'text-[#634E40] hover:bg-[#EFE8DD] hover:text-[#2B1E16]'
          }`}
        >
          <TbMoon className={`w-3.5 h-3.5 ${isNightActive ? 'text-[#38BDF8]' : 'text-[#8D7666]'}`} />
          <span className="text-[11px] font-bold">Night</span>
        </button>
      </div>
    </div>
  );
};


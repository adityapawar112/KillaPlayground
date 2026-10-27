'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppMenuBar } from '@/components/hud/AppMenuBar';
import { LeftToolShelf } from '@/components/hud/LeftToolShelf';
import { ContextualDock } from '@/components/hud/ContextualDock';
import { BottomStatusBar } from '@/components/hud/BottomStatusBar';
import { ShortcutsModal } from '@/components/modals/ShortcutsModal';
import { ResetConfirmModal } from '@/components/modals/ResetConfirmModal';
import { StartupModal } from '@/components/modals/StartupModal';
import { useEditorStore } from '@/lib/state/useEditorStore';

const KillaCanvas = dynamic(
  () => import('@/components/3d/KillaCanvas').then((m) => m.KillaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F9F6F0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#B85F45] border-t-transparent animate-spin mb-4" />
        <span className="font-yatra font-bold text-2xl text-[#4B382C] tracking-wide">
          The Killa Playground
        </span>
        <span className="text-xs text-[#8D7666] mt-1 font-sans">
          किल्ला प्लेग्राउंड सुरू होत आहे • Loading 3D Viewport...
        </span>
      </div>
    ),
  }
);

export default function HomePage() {
  const {
    nightMode,
    activeTool,
    setActiveTool,
    brushRadius,
    setBrushRadius,
    toggleNightMode,
    mudLocked,
    setMudLocked,
    setShortcutsModalOpen,
    isShortcutsModalOpen,
    isResetConfirmOpen,
    setResetConfirmOpen,
    isStartupModalOpen,
    setStartupModalOpen,
    setCameraViewPreset,
  } = useEditorStore();

  // Global Keyboard Shortcuts (Tool keys 1-7, Brush size, Night mode, Reset, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside text fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        if (isStartupModalOpen) setStartupModalOpen(false);
        if (isShortcutsModalOpen) setShortcutsModalOpen(false);
        if (isResetConfirmOpen) setResetConfirmOpen(false);
        return;
      }

      // Open Shortcuts Help with ?
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setShortcutsModalOpen(true);
        e.preventDefault();
        return;
      }

      // Tool Switching (1 to 9)
      if (e.key === '1') {
        setActiveTool('soil');
        e.preventDefault();
      } else if (e.key === '2') {
        setActiveTool('water');
        e.preventDefault();
      } else if (e.key === '3') {
        setActiveTool(activeTool === 'shape_side' ? 'shape_top' : 'shape_side');
        e.preventDefault();
      } else if (e.key === '4') {
        setActiveTool('dry');
        e.preventDefault();
      } else if (e.key === '5') {
        setActiveTool('paint');
        e.preventDefault();
      } else if (e.key === '6') {
        setActiveTool('terrain');
        e.preventDefault();
      } else if (e.key === '7') {
        setActiveTool('grass');
        e.preventDefault();
      } else if (e.key === '8') {
        setActiveTool('spline');
        e.preventDefault();
      } else if (e.key === '9') {
        setActiveTool('prop');
        e.preventDefault();
      }

      // Brush radius adjustment ([ and ])
      else if (e.key === '[') {
        setBrushRadius(Math.max(0.2, brushRadius - 0.15));
        e.preventDefault();
      } else if (e.key === ']') {
        setBrushRadius(Math.min(2.5, brushRadius + 0.15));
        e.preventDefault();
      }

      // Toggle Night Diya Mode (N)
      else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        toggleNightMode();
        e.preventDefault();
      }

      // Toggle Lock Mud (L)
      else if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
        setMudLocked(!mudLocked);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    activeTool,
    setActiveTool,
    brushRadius,
    setBrushRadius,
    toggleNightMode,
    mudLocked,
    setMudLocked,
    setShortcutsModalOpen,
    isShortcutsModalOpen,
    isResetConfirmOpen,
    setResetConfirmOpen,
    isStartupModalOpen,
    setStartupModalOpen,
  ]);

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden transition-colors duration-700 select-none ${
        nightMode ? 'bg-[#151311]' : 'bg-[#F9F6F0]'
      }`}
    >
      {/* 3D Canvas Viewport (100vw x 100vh) */}
      <div className="absolute inset-0 z-0">
        <KillaCanvas />
      </div>

      {/* Desktop Application Menu Bar + Webpage Title */}
      <AppMenuBar onSetCameraView={(view) => setCameraViewPreset(view)} />

      {/* Left Vertical Tool Shelf (Tooltips expand cleanly to the right) */}
      <LeftToolShelf />

      {/* Secondary Contextual Settings Bar */}
      <ContextualDock />

      {/* Unobtrusive Bottom Controls Strip */}
      <BottomStatusBar />

      {/* Blender-Style Startup Splash / Project Hub */}
      <StartupModal />

      {/* Helper Modals */}
      <ShortcutsModal />
      <ResetConfirmModal />
    </main>
  );
}

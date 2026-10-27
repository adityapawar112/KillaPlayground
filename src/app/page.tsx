'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TopNavBar } from '@/components/hud/TopNavBar';
import { BottomDock } from '@/components/hud/BottomDock';
import { ContextualDock } from '@/components/hud/ContextualDock';
import { ShortcutsModal } from '@/components/modals/ShortcutsModal';
import { ResetConfirmModal } from '@/components/modals/ResetConfirmModal';
import { useEditorStore } from '@/lib/state/useEditorStore';

const KillaCanvas = dynamic(
  () => import('@/components/3d/KillaCanvas').then((m) => m.KillaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F9F6F0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#B85F45] border-t-transparent animate-spin mb-4" />
        <span className="font-sans font-bold text-lg text-[#4B382C] tracking-wide">
          Loading 3D Diorama Viewport...
        </span>
        <span className="text-xs text-[#8D7666] mt-1">किल्ला प्लेग्राउंड सुरू होत आहे</span>
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
  } = useEditorStore();

  // Global Keyboard Shortcuts (Tool keys 1-7, Brush size, Night mode, Reset)
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

      // Tool Switching (1 to 7)
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
        setActiveTool('spline');
        e.preventDefault();
      } else if (e.key === '5') {
        setActiveTool('paint');
        e.preventDefault();
      } else if (e.key === '6') {
        setActiveTool('grass');
        e.preventDefault();
      } else if (e.key === '7') {
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

      {/* Floating HUD Layer */}
      <TopNavBar />
      <ContextualDock />
      <BottomDock />

      {/* Modals */}
      <ShortcutsModal />
      <ResetConfirmModal />
    </main>
  );
}

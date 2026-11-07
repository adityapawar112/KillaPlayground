'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AppMenuBar } from '@/components/hud/AppMenuBar';
import { TopToolBar } from '@/components/hud/TopToolBar';
import { LeftToolSidebar } from '@/components/hud/LeftToolSidebar';
import { ToolModeSidebar } from '@/components/hud/ToolModeSidebar';
import { RightToolSidebar } from '@/components/hud/RightToolSidebar';
import { BottomStatusBar } from '@/components/hud/BottomStatusBar';
import { DioramaQuickBar } from '@/components/hud/DioramaQuickBar';
import { ShortcutsModal } from '@/components/modals/ShortcutsModal';
import { ResetConfirmModal } from '@/components/modals/ResetConfirmModal';
import { ProjectHubModal } from '@/components/modals/ProjectHubModal';
import { TerrainStudioDrawer } from '@/components/modals/TerrainStudioDrawer';
import { TerrainChangeConfirmModal } from '@/components/modals/TerrainChangeConfirmModal';
import { AboutModal } from '@/components/modals/AboutModal';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { useVaultHydration } from '@/lib/persistence/useVaultHydration';
import { getAtmosphericLighting } from '@/lib/lighting/atmosphericLighting';

const KillaCanvas = dynamic(
  () => import('@/components/3d/KillaCanvas').then((m) => m.KillaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F9F6F0] select-none">
        <div className="relative mb-5 flex items-center justify-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 animate-pulse">
            <Image
              src="/killaplayground-tranparent.png"
              alt="The Killa Playground Logo"
              width={96}
              height={96}
              className="w-full h-full object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>
        <span className="font-yatra font-bold text-2xl sm:text-3xl text-[#4B382C] tracking-wide">
          The Killa Playground
        </span>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#B85F45] border-t-transparent animate-spin" />
          <span className="text-xs text-[#8D7666] font-sans">
            किल्ला प्लेग्राउंड सुरू होत आहे • Loading 3D Viewport...
          </span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  useVaultHydration();

  const nightMode = useEditorStore((s) => s.nightMode);
  const timeOfDay = useEditorStore((s) => s.timeOfDay);
  const sunElevation = useEditorStore((s) => s.sunElevation);
  const sunAzimuth = useEditorStore((s) => s.sunAzimuth);

  const atmosphericConfig = React.useMemo(() => {
    return getAtmosphericLighting(timeOfDay, nightMode, sunElevation, sunAzimuth);
  }, [timeOfDay, nightMode, sunElevation, sunAzimuth]);

  const setCameraViewPreset = useEditorStore((s) => s.setCameraViewPreset);
  const viewMode = useEditorStore((s) => s.viewMode);
  const isCapturingScreenshot = useEditorStore((s) => s.isCapturingScreenshot);
  const undo = useTerrainStore((s) => s.undo);
  const redo = useTerrainStore((s) => s.redo);
  const canUndo = useTerrainStore((s) => (s.historyVersion !== undefined ? s.canUndo() : s.canUndo()));
  const canRedo = useTerrainStore((s) => (s.historyVersion !== undefined ? s.canRedo() : s.canRedo()));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__killa_terrainStore = useTerrainStore;
      (window as any).__killa_editorStore = useEditorStore;
    }
  }, []);

  // Global Keyboard Shortcuts (Tool keys 1-9, Brush size, Night mode, Reset, etc.)
  // shortcut: Read live store state via getState() to attach single permanent listener with zero re-renders
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside text fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const store = useEditorStore.getState();

      // Cancel in-progress drafting or close modals on Escape
      if (e.key === 'Escape') {
        if (store.activeFoundationDraft) {
          store.setActiveFoundationDraft(null);
          store.setToastMessage('Foundation placement canceled.');
          return;
        }
        if (store.isDrawingStairs || store.activeStairDraft.length > 0) {
          store.finishStairs();
          store.setToastMessage('Stair drawing canceled.');
          return;
        }
        if (store.isTerrainConfirmOpen) store.setTerrainConfirmOpen(false);
        if (store.isStartupModalOpen) store.setStartupModalOpen(false);
        if (store.isAboutModalOpen) store.setAboutModalOpen(false);
        if (store.isShortcutsModalOpen) store.setShortcutsModalOpen(false);
        if (store.isResetConfirmOpen) store.setResetConfirmOpen(false);
        if (store.isTerrainDrawerOpen) store.setTerrainDrawerOpen(false);
        return;
      }

      // Open Shortcuts Help with ?
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        store.setShortcutsModalOpen(true);
        e.preventDefault();
        return;
      }

      // Undo / Redo (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        useTerrainStore.getState().undo();
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        useTerrainStore.getState().redo();
        e.preventDefault();
        return;
      }

      // Tool Switching (1 to 6)
      if (e.key === '1') {
        store.setActiveTool('terrain');
        e.preventDefault();
      } else if (e.key === '2') {
        store.setActiveTool('building');
        e.preventDefault();
      } else if (e.key === '3') {
        store.setActiveTool('texture');
        e.preventDefault();
      } else if (e.key === '4') {
        store.setActiveTool('foliage');
        e.preventDefault();
      } else if (e.key === '5') {
        store.setActiveTool('prop');
        e.preventDefault();
      } else if (e.key === '6') {
        store.setActiveTool('lighting');
        e.preventDefault();
      } else if (e.key === '7') {
        store.setActiveTool('view');
        e.preventDefault();
      }
      // Keys 7-0 (soil pipeline tools) hidden for now

      // Brush radius adjustment ([ and ])
      else if (e.key === '[') {
        store.setBrushRadius(Math.max(0.2, store.brushRadius - 0.15));
        e.preventDefault();
      } else if (e.key === ']') {
        store.setBrushRadius(Math.min(2.5, store.brushRadius + 0.15));
        e.preventDefault();
      }

      // Toggle Night Diya Mode (N)
      else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        store.toggleNightMode();
        e.preventDefault();
      }

      // Toggle Play / Pause Animation Engine (Space)
      else if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
        store.togglePlay();
        e.preventDefault();
      }

      // Quick Screenshot Capture (P)
      else if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) {
        const btn = document.querySelector('button[title*="Screenshot"]') as HTMLButtonElement;
        if (btn) btn.click();
        e.preventDefault();
      }

      // Toggle Lock Mud (L)
      else if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
        store.setMudLocked(!store.mudLocked);
        e.preventDefault();
      }
    };

    if (process.env.NODE_ENV !== 'production') {
      (window as any).__killa = { useTerrainStore, useEditorStore };
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden transition-[background] duration-700 select-none"
      style={{
        background: atmosphericConfig.skyGradient,
      }}
    >
      {/* 3D Canvas Viewport (100vw x 100vh) */}
      <div className="absolute inset-0 z-0">
        <KillaCanvas />
      </div>



      {/* Primary HUD Chrome (Cleanly suppressed during screenshot capture) */}
      {!isCapturingScreenshot && (
        <>
          {/* Desktop Application Menu Bar + Webpage Title */}
          <AppMenuBar
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onSetCameraView={(view) => setCameraViewPreset(view)}
          />

          {/* Top Tool Modes Shelf (Solid sub-bar beneath menu bar) */}
          <TopToolBar />

          {/* Left Resizable Sidebar: Top Camera Controls + Bottom Scrollable Tool Properties */}
          <LeftToolSidebar />

          {/* Vertical Tool Mode Strip: Attached to right edge of Left Sidebar */}
          <ToolModeSidebar />

          {/* Right Resizable Sidebar: Outliner + Contextual Inspector */}
          <RightToolSidebar />

          {/* Floating Centered Quick-Action Diorama Bar (Ticket 11) */}
          <DioramaQuickBar />

          {/* Unobtrusive Bottom Controls Strip */}
          <BottomStatusBar />

          {/* Left-Side Dropdown Terrain Studio (Visible 3D Viewport) */}
          <TerrainStudioDrawer />

          {/* Unified Project Hub & Fortress Studio (Ticket 12) */}
          <ProjectHubModal />

          {/* Terrain Change Confirmation Dialog (Ticket 12) */}
          <TerrainChangeConfirmModal />

          {/* Helper Modals */}
          <ShortcutsModal />
          <ResetConfirmModal />
          <AboutModal />
        </>
      )}
    </main>
  );
}

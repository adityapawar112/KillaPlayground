'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';
import { serializeKilla, deserializeKilla } from './killaSerializer';
import { saveActiveDraft, loadActiveDraft, getVaultProjects } from './killaVault';

/**
 * Hook to manage automatic session persistence across browser refreshes
 * and background draft autosaving.
 */
export function useVaultHydration() {
  const hasHydratedRef = useRef(false);
  const isSavingRef = useRef(false);

  // 1. Initial Session Restoration on Page Mount
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    async function restoreSession() {
      try {
        // Load saved projects list for modals
        const vaultProjects = await getVaultProjects();
        useEditorStore.setState({ savedProjects: vaultProjects as any });

        // Check if there is an active draft from a previous session / before refresh
        const draftBlob = await loadActiveDraft();
        if (!draftBlob) return;

        const pkg = deserializeKilla(draftBlob);
        if (!pkg) return;

        // Restore terrain state (sculpted heights & painted texture splatmap)
        useTerrainStore.getState().setFullTerrainState(
          pkg.terrainBuffer,
          pkg.paintBuffer,
          pkg.manifest.templateId
        );

        // Restore editor state
        useEditorStore.setState({
          fortTitle: pkg.manifest.fortTitle,
          builderName: pkg.manifest.builderName,
          templateId: pkg.manifest.templateId,
          waterLevel: pkg.manifest.waterLevel,
          waterLevelActive: pkg.manifest.waterLevelActive,
          freeformSettings: pkg.manifest.freeformSettings as any,
          paintColor: pkg.manifest.paintColor,
          waterMode: (pkg.manifest.waterMode as any) || 'tarpaulin',
          walls: pkg.scene.walls,
          foundations: pkg.scene.foundations,
          stairs: pkg.scene.stairs,
          citadelKeeps: pkg.scene.citadelKeeps,
          splines: pkg.scene.splines,
          placedProps: pkg.scene.placedProps,
          placedLights: pkg.scene.placedLights,
          foliageInstances: pkg.scene.foliageInstances,
          pondWaterFeatures: pkg.scene.pondWaterFeatures,
        });
      } catch (err) {
        console.warn('Failed to restore active draft session:', err);
      }
    }

    restoreSession();
  }, []);

  // 2. Debounced Autosave (1500ms after changes)
  const walls = useEditorStore((s) => s.walls);
  const foundations = useEditorStore((s) => s.foundations);
  const stairs = useEditorStore((s) => s.stairs);
  const splines = useEditorStore((s) => s.splines);
  const placedProps = useEditorStore((s) => s.placedProps);
  const placedLights = useEditorStore((s) => s.placedLights);
  const foliageInstances = useEditorStore((s) => s.foliageInstances);
  const templateId = useEditorStore((s) => s.templateId);
  const fortTitle = useEditorStore((s) => s.fortTitle);
  const terrainUpdated = useTerrainStore((s) => s.lastUpdated);

  useEffect(() => {
    if (!hasHydratedRef.current) return;

    const timer = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      try {
        const editorState = useEditorStore.getState();
        const terrainState = useTerrainStore.getState();

        const blob = serializeKilla(editorState, {
          stateBuffer: terrainState.stateBuffer,
          paintBuffer: terrainState.paintBuffer,
        });

        await saveActiveDraft(blob);
      } catch (err) {
        console.warn('Autosave draft failed:', err);
      } finally {
        isSavingRef.current = false;
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    walls,
    foundations,
    stairs,
    splines,
    placedProps,
    placedLights,
    foliageInstances,
    templateId,
    fortTitle,
    terrainUpdated,
  ]);

  // 3. BeforeUnload immediate flush
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const editorState = useEditorStore.getState();
        const terrainState = useTerrainStore.getState();
        const blob = serializeKilla(editorState, {
          stateBuffer: terrainState.stateBuffer,
          paintBuffer: terrainState.paintBuffer,
        });
        saveActiveDraft(blob);
      } catch {
        // Ignore during unload
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}


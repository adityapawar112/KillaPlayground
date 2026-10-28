import { create } from 'zustand';
import * as THREE from 'three';
import {
  createStateBuffer,
  createStateTexture,
  createBaseTerrainGeometry,
  syncStateToGeometry,
  refitTerrainBVH,
  applyTerrainBrush,
  TerrainBrushOptions,
  TERRAIN_RESOLUTION,
  VERTEX_COUNT,
  STATE_BUFFER_SIZE,
} from './terrainBuffer';
import { generateTerrainBlueprint } from './terrainGenerators';
import { useEditorStore, PondWaterFeature } from '../state/useEditorStore';

interface TerrainState {
  stateBuffer: Float32Array;
  stateTexture: THREE.DataTexture;
  terrainMesh: THREE.Mesh | null;
  terrainGeometry: THREE.BufferGeometry | null;
  activeTemplateId: string;
  lastUpdated: number;

  // Actions
  setTerrainMesh: (mesh: THREE.Mesh | null, geometry: THREE.BufferGeometry | null) => void;
  loadTemplate: (templateId: string, freeformOpts?: import('./terrainGenerators').FreeformOptions) => void;
  markTextureNeedsUpdate: () => void;
  resetTerrain: () => void;
  applyDirtyRegion: (minX: number, maxX: number, minZ: number, maxZ: number) => void;
  sculptTerrain: (centerX: number, centerZ: number, options: TerrainBrushOptions) => boolean;
  pushUndo: () => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// shortcut: 15-slot in-memory circular buffer for undo/redo, upgrade to indexedDB if state exceeds 50MB
const MAX_UNDO_SLOTS = 15;
const undoStack: Float32Array[] = [];
const redoStack: Float32Array[] = [];
const pondUndoStack: PondWaterFeature[][] = [];
const pondRedoStack: PondWaterFeature[][] = [];

// Generate organic starter mud hill by default
const initialBuffer = createStateBuffer(0.0, 0.0);
generateTerrainBlueprint('scratch', initialBuffer);
const initialTexture = createStateTexture(initialBuffer);

export const useTerrainStore = create<TerrainState>((set, get) => ({
  stateBuffer: initialBuffer,
  stateTexture: initialTexture,
  terrainMesh: null,
  terrainGeometry: null,
  activeTemplateId: 'scratch',
  lastUpdated: Date.now(),

  setTerrainMesh: (mesh, geometry) => {
    const { stateBuffer } = get();
    if (geometry) {
      // Sync initial state buffer into geometry immediately
      syncStateToGeometry(stateBuffer, geometry);
      refitTerrainBVH(geometry);
    }
    set({ terrainMesh: mesh, terrainGeometry: geometry, lastUpdated: Date.now() });
  },

  loadTemplate: (templateId: string, freeformOpts?: import('./terrainGenerators').FreeformOptions) => {
    const { stateBuffer, stateTexture, terrainGeometry } = get();
    generateTerrainBlueprint(templateId, stateBuffer, freeformOpts);
    stateTexture.needsUpdate = true;

    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry);
      refitTerrainBVH(terrainGeometry);
    }

    set({ activeTemplateId: templateId, lastUpdated: Date.now() });
  },

  markTextureNeedsUpdate: () => {
    const { stateTexture } = get();
    stateTexture.needsUpdate = true;
    set({ lastUpdated: Date.now() });
  },

  resetTerrain: () => {
    const { stateBuffer, stateTexture, terrainGeometry, activeTemplateId } = get();
    // Regenerate the active template
    generateTerrainBlueprint(activeTemplateId || 'scratch', stateBuffer);
    stateTexture.needsUpdate = true;

    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry);
      refitTerrainBVH(terrainGeometry);
    }

    set({ lastUpdated: Date.now() });
  },

  applyDirtyRegion: (minX, maxX, minZ, maxZ) => {
    const { stateBuffer, stateTexture, terrainGeometry } = get();
    stateTexture.needsUpdate = true;

    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry, { minX, maxX, minZ, maxZ });
      refitTerrainBVH(terrainGeometry);
    }

    set({ lastUpdated: Date.now() });
  },

  sculptTerrain: (centerX, centerZ, options) => {
    const { stateBuffer, stateTexture, terrainGeometry } = get();
    const dirty = applyTerrainBrush(stateBuffer, centerX, centerZ, options);
    if (!dirty.modified) return false;

    stateTexture.needsUpdate = true;
    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry, dirty);
      refitTerrainBVH(terrainGeometry);
    }

    set({ lastUpdated: Date.now() });
    return true;
  },

  pushUndo: () => {
    const { stateBuffer } = get();
    if (undoStack.length >= MAX_UNDO_SLOTS) {
      undoStack.shift();
      pondUndoStack.shift();
    }
    undoStack.push(stateBuffer.slice());
    pondUndoStack.push([...useEditorStore.getState().pondWaterFeatures]);
    redoStack.length = 0;
    pondRedoStack.length = 0;
    set({ lastUpdated: Date.now() });
  },

  canUndo: () => undoStack.length > 0,
  canRedo: () => redoStack.length > 0,

  undo: () => {
    if (undoStack.length === 0) return false;
    const { stateBuffer, stateTexture, terrainGeometry } = get();
    const prevSnapshot = undoStack.pop()!;
    redoStack.push(stateBuffer.slice());
    stateBuffer.set(prevSnapshot);

    if (pondUndoStack.length > 0) {
      const prevPonds = pondUndoStack.pop()!;
      pondRedoStack.push([...useEditorStore.getState().pondWaterFeatures]);
      useEditorStore.getState().setPondWaterFeatures(prevPonds);
    }

    stateTexture.needsUpdate = true;
    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry);
      refitTerrainBVH(terrainGeometry);
    }
    set({ lastUpdated: Date.now() });
    return true;
  },

  redo: () => {
    if (redoStack.length === 0) return false;
    const { stateBuffer, stateTexture, terrainGeometry } = get();
    const nextSnapshot = redoStack.pop()!;
    undoStack.push(stateBuffer.slice());
    stateBuffer.set(nextSnapshot);

    if (pondRedoStack.length > 0) {
      const nextPonds = pondRedoStack.pop()!;
      pondUndoStack.push([...useEditorStore.getState().pondWaterFeatures]);
      useEditorStore.getState().setPondWaterFeatures(nextPonds);
    }

    stateTexture.needsUpdate = true;
    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry);
      refitTerrainBVH(terrainGeometry);
    }
    set({ lastUpdated: Date.now() });
    return true;
  },
}));

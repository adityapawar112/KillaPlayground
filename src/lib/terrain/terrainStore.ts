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
  worldToGrid,
  gridToWorld,
  STATE_CHANNELS,
  TERRAIN_RESOLUTION,
  VERTEX_COUNT,
  STATE_BUFFER_SIZE,
} from './terrainBuffer';
import { generateTerrainBlueprint } from './terrainGenerators';
import {
  createPaintBuffer,
  createPaintStateTexture,
  createFallbackArrayTexture,
  applyTexturePaintBrush,
  fillEntireTerrain,
  clearPaintBuffer,
  PaintBrushOptions,
} from './terrainPaintBuffer';
import { useEditorStore, PondWaterFeature, FoliageInstance, SplinePath, PlacedProp, PlacedLight, FoundationSlab, StairPath } from '../state/useEditorStore';
import { WallPath, CitadelKeep } from '../walls/wallTypes';

interface TerrainState {
  stateBuffer: Float32Array;
  stateTexture: THREE.DataTexture;
  paintBuffer: Uint8Array;
  paintTexture: THREE.DataTexture;
  paintArrayTexture: THREE.DataArrayTexture;
  terrainMesh: THREE.Mesh | null;
  terrainGeometry: THREE.BufferGeometry | null;
  activeTemplateId: string;
  lastUpdated: number;

  // Actions
  setTerrainMesh: (mesh: THREE.Mesh | null, geometry: THREE.BufferGeometry | null) => void;
  loadTemplate: (templateId: string, freeformOpts?: import('./terrainGenerators').FreeformOptions) => void;
  markTextureNeedsUpdate: () => void;
  markPaintTextureNeedsUpdate: () => void;
  setPaintArrayTexture: (tex: THREE.DataArrayTexture) => void;
  resetTerrain: () => void;
  applyDirtyRegion: (minX: number, maxX: number, minZ: number, maxZ: number) => void;
  sculptTerrain: (centerX: number, centerZ: number, options: TerrainBrushOptions) => boolean;
  applyPaintBrush: (centerX: number, centerZ: number, options: PaintBrushOptions) => boolean;
  fillPaintTerrain: (layerIndex: number) => void;
  clearPaintTerrain: () => void;
  disposeTerrain: () => void;
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
const paintUndoStack: Uint8Array[] = [];
const paintRedoStack: Uint8Array[] = [];
const pondUndoStack: PondWaterFeature[][] = [];
const pondRedoStack: PondWaterFeature[][] = [];
const wallUndoStack: WallPath[][] = [];
const wallRedoStack: WallPath[][] = [];
const citadelUndoStack: CitadelKeep[][] = [];
const citadelRedoStack: CitadelKeep[][] = [];
const foliageUndoStack: FoliageInstance[][] = [];
const foliageRedoStack: FoliageInstance[][] = [];
const splineUndoStack: SplinePath[][] = [];
const splineRedoStack: SplinePath[][] = [];
const foundationUndoStack: FoundationSlab[][] = [];
const foundationRedoStack: FoundationSlab[][] = [];
const stairUndoStack: StairPath[][] = [];
const stairRedoStack: StairPath[][] = [];
const propUndoStack: PlacedProp[][] = [];
const propRedoStack: PlacedProp[][] = [];
const lightUndoStack: PlacedLight[][] = [];
const lightRedoStack: PlacedLight[][] = [];

// shortcut: Module-level shared WebGL DataTextures and DataArrayTexture persist across component renders for singleton diorama lifetime to enable zero GPU reallocation resets, upgrade to scoped context if supporting multiple simultaneous viewports
// Generate organic starter mud hill by default
const initialBuffer = createStateBuffer(0.0, 0.0);
generateTerrainBlueprint('scratch', initialBuffer);
const initialTexture = createStateTexture(initialBuffer);

// Initialize paint buffer and array textures
const initialPaintBuffer = createPaintBuffer();
const initialPaintTexture = createPaintStateTexture(initialPaintBuffer);
const initialPaintArrayTexture = createFallbackArrayTexture(52);

export const useTerrainStore = create<TerrainState>((set, get) => ({
  stateBuffer: initialBuffer,
  stateTexture: initialTexture,
  paintBuffer: initialPaintBuffer,
  paintTexture: initialPaintTexture,
  paintArrayTexture: initialPaintArrayTexture,
  terrainMesh: null,
  terrainGeometry: null,
  activeTemplateId: 'scratch',
  lastUpdated: Date.now(),

  setPaintArrayTexture: (tex) => {
    const prev = get().paintArrayTexture;
    if (prev && prev !== tex) {
      prev.dispose();
    }
    set({ paintArrayTexture: tex, lastUpdated: Date.now() });
  },

  disposeTerrain: () => {
    const { stateTexture, paintTexture, paintArrayTexture } = get();
    stateTexture.dispose();
    paintTexture.dispose();
    paintArrayTexture.dispose();
  },

  markPaintTextureNeedsUpdate: () => {
    const { paintTexture } = get();
    paintTexture.needsUpdate = true;
    set({ lastUpdated: Date.now() });
  },

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
    const { stateBuffer, stateTexture, paintBuffer, paintTexture, terrainGeometry, activeTemplateId } = get();
    // Regenerate the active template
    generateTerrainBlueprint(activeTemplateId || 'scratch', stateBuffer);
    stateTexture.needsUpdate = true;

    // Reset paint layer to natural base soil
    clearPaintBuffer(paintBuffer);
    paintTexture.needsUpdate = true;

    // Clear all history stacks on reset
    undoStack.length = 0;
    redoStack.length = 0;
    paintUndoStack.length = 0;
    paintRedoStack.length = 0;
    pondUndoStack.length = 0;
    pondRedoStack.length = 0;
    wallUndoStack.length = 0;
    wallRedoStack.length = 0;
    citadelUndoStack.length = 0;
    citadelRedoStack.length = 0;
    foliageUndoStack.length = 0;
    foliageRedoStack.length = 0;
    splineUndoStack.length = 0;
    splineRedoStack.length = 0;
    foundationUndoStack.length = 0;
    foundationRedoStack.length = 0;
    stairUndoStack.length = 0;
    stairRedoStack.length = 0;
    propUndoStack.length = 0;
    propRedoStack.length = 0;
    lightUndoStack.length = 0;
    lightRedoStack.length = 0;

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

  applyPaintBrush: (centerX, centerZ, options) => {
    const { paintBuffer, paintTexture } = get();
    const modified = applyTexturePaintBrush(paintBuffer, centerX, centerZ, options);
    if (!modified) return false;

    paintTexture.needsUpdate = true;
    set({ lastUpdated: Date.now() });
    return true;
  },

  fillPaintTerrain: (layerIndex) => {
    const { paintBuffer, paintTexture, pushUndo } = get();
    pushUndo();
    fillEntireTerrain(paintBuffer, layerIndex);
    paintTexture.needsUpdate = true;
    set({ lastUpdated: Date.now() });
  },

  clearPaintTerrain: () => {
    const { paintBuffer, paintTexture, pushUndo } = get();
    pushUndo();
    clearPaintBuffer(paintBuffer);
    paintTexture.needsUpdate = true;
    set({ lastUpdated: Date.now() });
  },

  pushUndo: () => {
    const { stateBuffer, paintBuffer } = get();
    if (undoStack.length >= MAX_UNDO_SLOTS) {
      undoStack.shift();
      paintUndoStack.shift();
      pondUndoStack.shift();
      wallUndoStack.shift();
      citadelUndoStack.shift();
      foliageUndoStack.shift();
      splineUndoStack.shift();
      foundationUndoStack.shift();
      stairUndoStack.shift();
      propUndoStack.shift();
      lightUndoStack.shift();
    }
    undoStack.push(stateBuffer.slice());
    paintUndoStack.push(paintBuffer.slice());
    pondUndoStack.push([...useEditorStore.getState().pondWaterFeatures]);
    wallUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().walls)));
    citadelUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().citadelKeeps)));
    foliageUndoStack.push([...useEditorStore.getState().foliageInstances]);
    splineUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().splines)));
    foundationUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().foundations || [])));
    stairUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().stairs || [])));
    propUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().placedProps)));
    lightUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().placedLights || [])));
    redoStack.length = 0;
    paintRedoStack.length = 0;
    pondRedoStack.length = 0;
    wallRedoStack.length = 0;
    citadelRedoStack.length = 0;
    foliageRedoStack.length = 0;
    splineRedoStack.length = 0;
    foundationRedoStack.length = 0;
    stairRedoStack.length = 0;
    propRedoStack.length = 0;
    lightRedoStack.length = 0;
    set({ lastUpdated: Date.now() });
  },

  canUndo: () =>
    undoStack.length > 0 ||
    paintUndoStack.length > 0 ||
    wallUndoStack.length > 0 ||
    citadelUndoStack.length > 0 ||
    foliageUndoStack.length > 0 ||
    splineUndoStack.length > 0 ||
    foundationUndoStack.length > 0 ||
    stairUndoStack.length > 0 ||
    propUndoStack.length > 0 ||
    lightUndoStack.length > 0,
  canRedo: () =>
    redoStack.length > 0 ||
    paintRedoStack.length > 0 ||
    wallRedoStack.length > 0 ||
    citadelRedoStack.length > 0 ||
    foliageRedoStack.length > 0 ||
    splineRedoStack.length > 0 ||
    foundationRedoStack.length > 0 ||
    stairRedoStack.length > 0 ||
    propRedoStack.length > 0 ||
    lightRedoStack.length > 0,

  undo: () => {
    if (
      undoStack.length === 0 &&
      paintUndoStack.length === 0 &&
      wallUndoStack.length === 0 &&
      citadelUndoStack.length === 0 &&
      foliageUndoStack.length === 0 &&
      splineUndoStack.length === 0 &&
      foundationUndoStack.length === 0 &&
      stairUndoStack.length === 0 &&
      propUndoStack.length === 0 &&
      lightUndoStack.length === 0
    )
      return false;
    const { stateBuffer, stateTexture, paintBuffer, paintTexture, terrainGeometry } = get();
    if (undoStack.length > 0) {
      const prevSnapshot = undoStack.pop()!;
      redoStack.push(stateBuffer.slice());
      stateBuffer.set(prevSnapshot);
    }

    if (paintUndoStack.length > 0) {
      const prevPaint = paintUndoStack.pop()!;
      paintRedoStack.push(paintBuffer.slice());
      paintBuffer.set(prevPaint);
      paintTexture.needsUpdate = true;
    }

    if (pondUndoStack.length > 0) {
      const prevPonds = pondUndoStack.pop()!;
      pondRedoStack.push([...useEditorStore.getState().pondWaterFeatures]);
      useEditorStore.getState().setPondWaterFeatures(prevPonds);
    }

    if (wallUndoStack.length > 0) {
      const prevWalls = wallUndoStack.pop()!;
      wallRedoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().walls)));
      useEditorStore.getState().setWalls(prevWalls);
    }

    if (citadelUndoStack.length > 0) {
      const prevKeeps = citadelUndoStack.pop()!;
      citadelRedoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().citadelKeeps)));
      useEditorStore.getState().setCitadelKeeps(prevKeeps);
    }

    if (foliageUndoStack.length > 0) {
      const prevFoliage = foliageUndoStack.pop()!;
      foliageRedoStack.push([...useEditorStore.getState().foliageInstances]);
      useEditorStore.getState().setFoliageInstances(prevFoliage);
    }

    if (splineUndoStack.length > 0) {
      const prevSplines = splineUndoStack.pop()!;
      splineRedoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().splines)));
      useEditorStore.getState().setSplines(prevSplines);
    }

    if (foundationUndoStack.length > 0) {
      const prevFoundations = foundationUndoStack.pop()!;
      foundationRedoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().foundations || [])));
      useEditorStore.getState().setFoundations(prevFoundations);
    }

    if (stairUndoStack.length > 0) {
      const prevStairs = stairUndoStack.pop()!;
      stairRedoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().stairs || [])));
      useEditorStore.getState().setStairs(prevStairs);
    }

    if (propUndoStack.length > 0) {
      const prevProps = propUndoStack.pop()!;
      propRedoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().placedProps)));
      useEditorStore.getState().setPlacedProps(prevProps);
    }

    if (lightUndoStack.length > 0) {
      const prevLights = lightUndoStack.pop()!;
      lightRedoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().placedLights || [])));
      useEditorStore.getState().setPlacedLights(prevLights);
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
    if (
      redoStack.length === 0 &&
      paintRedoStack.length === 0 &&
      wallRedoStack.length === 0 &&
      citadelRedoStack.length === 0 &&
      foliageRedoStack.length === 0 &&
      splineRedoStack.length === 0 &&
      foundationRedoStack.length === 0 &&
      stairRedoStack.length === 0 &&
      propRedoStack.length === 0 &&
      lightRedoStack.length === 0
    )
      return false;
    const { stateBuffer, stateTexture, paintBuffer, paintTexture, terrainGeometry } = get();
    if (redoStack.length > 0) {
      const nextSnapshot = redoStack.pop()!;
      undoStack.push(stateBuffer.slice());
      stateBuffer.set(nextSnapshot);
    }

    if (paintRedoStack.length > 0) {
      const nextPaint = paintRedoStack.pop()!;
      paintUndoStack.push(paintBuffer.slice());
      paintBuffer.set(nextPaint);
      paintTexture.needsUpdate = true;
    }

    if (pondRedoStack.length > 0) {
      const nextPonds = pondRedoStack.pop()!;
      pondUndoStack.push([...useEditorStore.getState().pondWaterFeatures]);
      useEditorStore.getState().setPondWaterFeatures(nextPonds);
    }

    if (wallRedoStack.length > 0) {
      const nextWalls = wallRedoStack.pop()!;
      wallUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().walls)));
      useEditorStore.getState().setWalls(nextWalls);
    }

    if (citadelRedoStack.length > 0) {
      const nextKeeps = citadelRedoStack.pop()!;
      citadelUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().citadelKeeps)));
      useEditorStore.getState().setCitadelKeeps(nextKeeps);
    }

    if (foliageRedoStack.length > 0) {
      const nextFoliage = foliageRedoStack.pop()!;
      foliageUndoStack.push([...useEditorStore.getState().foliageInstances]);
      useEditorStore.getState().setFoliageInstances(nextFoliage);
    }

    if (splineRedoStack.length > 0) {
      const nextSplines = splineRedoStack.pop()!;
      splineUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().splines)));
      useEditorStore.getState().setSplines(nextSplines);
    }

    if (foundationRedoStack.length > 0) {
      const nextFoundations = foundationRedoStack.pop()!;
      foundationUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().foundations || [])));
      useEditorStore.getState().setFoundations(nextFoundations);
    }

    if (stairRedoStack.length > 0) {
      const nextStairs = stairRedoStack.pop()!;
      stairUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().stairs || [])));
      useEditorStore.getState().setStairs(nextStairs);
    }

    if (propRedoStack.length > 0) {
      const nextProps = propRedoStack.pop()!;
      propUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().placedProps)));
      useEditorStore.getState().setPlacedProps(nextProps);
    }

    if (lightRedoStack.length > 0) {
      const nextLights = lightRedoStack.pop()!;
      lightUndoStack.push(JSON.parse(JSON.stringify(useEditorStore.getState().placedLights || [])));
      useEditorStore.getState().setPlacedLights(nextLights);
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

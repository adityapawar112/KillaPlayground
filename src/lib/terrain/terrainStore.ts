import { create } from 'zustand';
import * as THREE from 'three';
import {
  createStateBuffer,
  createStateTexture,
  createBaseTerrainGeometry,
  syncStateToGeometry,
  refitTerrainBVH,
  TERRAIN_RESOLUTION,
  VERTEX_COUNT,
  STATE_BUFFER_SIZE,
} from './terrainBuffer';
import { generateTerrainBlueprint } from './terrainGenerators';

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
}

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
}));

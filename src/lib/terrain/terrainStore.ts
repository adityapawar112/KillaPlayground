import { create } from 'zustand';
import * as THREE from 'three';
import {
  createStateBuffer,
  createStateTexture,
  createBaseTerrainGeometry,
  syncStateToGeometry,
  TERRAIN_RESOLUTION,
  VERTEX_COUNT,
  STATE_BUFFER_SIZE,
} from './terrainBuffer';

interface TerrainState {
  stateBuffer: Float32Array;
  stateTexture: THREE.DataTexture;
  terrainMesh: THREE.Mesh | null;
  terrainGeometry: THREE.BufferGeometry | null;
  lastUpdated: number;

  // Actions
  setTerrainMesh: (mesh: THREE.Mesh | null, geometry: THREE.BufferGeometry | null) => void;
  markTextureNeedsUpdate: () => void;
  resetTerrain: () => void;
  applyDirtyRegion: (minX: number, maxX: number, minZ: number, maxZ: number) => void;
}

const initialBuffer = createStateBuffer(0.0, 0.0);
const initialTexture = createStateTexture(initialBuffer);

export const useTerrainStore = create<TerrainState>((set, get) => ({
  stateBuffer: initialBuffer,
  stateTexture: initialTexture,
  terrainMesh: null,
  terrainGeometry: null,
  lastUpdated: Date.now(),

  setTerrainMesh: (mesh, geometry) => {
    set({ terrainMesh: mesh, terrainGeometry: geometry });
  },

  markTextureNeedsUpdate: () => {
    const { stateTexture } = get();
    stateTexture.needsUpdate = true;
    set({ lastUpdated: Date.now() });
  },

  resetTerrain: () => {
    const { stateBuffer, stateTexture, terrainGeometry } = get();
    // Zero out all channels
    stateBuffer.fill(0.0);
    stateTexture.needsUpdate = true;

    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry);
      const bvh = (terrainGeometry as unknown as { boundsTree?: { refit: () => void } }).boundsTree;
      if (bvh) bvh.refit();
    }

    set({ lastUpdated: Date.now() });
  },

  applyDirtyRegion: (minX, maxX, minZ, maxZ) => {
    const { stateBuffer, stateTexture, terrainGeometry } = get();
    stateTexture.needsUpdate = true;

    if (terrainGeometry) {
      syncStateToGeometry(stateBuffer, terrainGeometry, { minX, maxX, minZ, maxZ });
      const bvh = (terrainGeometry as unknown as { boundsTree?: { refit: () => void } }).boundsTree;
      if (bvh) bvh.refit();
    }

    set({ lastUpdated: Date.now() });
  },
}));

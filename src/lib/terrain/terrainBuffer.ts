import * as THREE from 'three';

/**
 * Terrain and State Buffer Configuration for Killa Playground
 * 256x256 grid over 10m x 10m diorama plane
 */
export const TERRAIN_RESOLUTION = 256;
export const TERRAIN_SIZE = 10.0; // -5.0 to +5.0 in world coordinates
export const HALF_TERRAIN_SIZE = TERRAIN_SIZE / 2.0; // 5.0
export const VERTEX_COUNT = TERRAIN_RESOLUTION * TERRAIN_RESOLUTION; // 65,536 vertices
export const STATE_CHANNELS = 4; // R: Height, G: Wetness, B: Lock, A: Grass
export const STATE_BUFFER_SIZE = VERTEX_COUNT * STATE_CHANNELS; // 262,144 floats (1 MB)

export interface StateTexel {
  height: number;    // 0.0 to 3.0 meters (R)
  wetness: number;   // 0.0 = dry, 1.0 = wet mud (G)
  locked: number;    // 0.0 = active, 1.0 = locked (B)
  grass: number;     // 0.0 = none, 1.0 = sprouted (A)
}

/**
 * Creates and initializes a fresh 256x256x4 Float32Array state buffer.
 */
export function createStateBuffer(initialHeight = 0.0, initialWetness = 0.0): Float32Array {
  const buffer = new Float32Array(STATE_BUFFER_SIZE);
  for (let i = 0; i < VERTEX_COUNT; i++) {
    const idx = i * STATE_CHANNELS;
    buffer[idx + 0] = initialHeight;  // R: Height
    buffer[idx + 1] = initialWetness; // G: Wetness
    buffer[idx + 2] = 0.0;            // B: Locked (0 = unlocked)
    buffer[idx + 3] = 0.0;            // A: Grass Density (0 = none)
  }
  return buffer;
}

/**
 * Wraps the Float32Array in a THREE.DataTexture configured for linear GPU filtering.
 */
export function createStateTexture(buffer: Float32Array): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    buffer,
    TERRAIN_RESOLUTION,
    TERRAIN_RESOLUTION,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Converts world (X, Z) coordinates to grid cell indices (ix, iz) in [0, 255].
 */
export function worldToGrid(x: number, z: number): { ix: number; iz: number } {
  const u = (x + HALF_TERRAIN_SIZE) / TERRAIN_SIZE;
  const v = (z + HALF_TERRAIN_SIZE) / TERRAIN_SIZE;
  const ix = Math.max(0, Math.min(TERRAIN_RESOLUTION - 1, Math.round(u * (TERRAIN_RESOLUTION - 1))));
  const iz = Math.max(0, Math.min(TERRAIN_RESOLUTION - 1, Math.round(v * (TERRAIN_RESOLUTION - 1))));
  return { ix, iz };
}

/**
 * Converts grid cell indices (ix, iz) in [0, 255] to world (X, Z) coordinates.
 */
export function gridToWorld(ix: number, iz: number): { x: number; z: number } {
  const u = ix / (TERRAIN_RESOLUTION - 1);
  const v = iz / (TERRAIN_RESOLUTION - 1);
  const x = u * TERRAIN_SIZE - HALF_TERRAIN_SIZE;
  const z = v * TERRAIN_SIZE - HALF_TERRAIN_SIZE;
  return { x, z };
}

/**
 * Converts normalized UV [0..1] coordinates to grid cell indices (ix, iz).
 */
export function uvToGrid(u: number, v: number): { ix: number; iz: number } {
  const ix = Math.max(0, Math.min(TERRAIN_RESOLUTION - 1, Math.round(u * (TERRAIN_RESOLUTION - 1))));
  const iz = Math.max(0, Math.min(TERRAIN_RESOLUTION - 1, Math.round(v * (TERRAIN_RESOLUTION - 1))));
  return { ix, iz };
}

/**
 * Converts grid cell indices (ix, iz) to normalized UV coordinates.
 */
export function gridToUv(ix: number, iz: number): { u: number; v: number } {
  return {
    u: ix / (TERRAIN_RESOLUTION - 1),
    v: iz / (TERRAIN_RESOLUTION - 1),
  };
}

/**
 * Samples state buffer at grid coordinates (ix, iz).
 */
export function getTexel(buffer: Float32Array, ix: number, iz: number): StateTexel {
  const idx = (iz * TERRAIN_RESOLUTION + ix) * STATE_CHANNELS;
  return {
    height: buffer[idx + 0],
    wetness: buffer[idx + 1],
    locked: buffer[idx + 2],
    grass: buffer[idx + 3],
  };
}

/**
 * Mutates state buffer at grid coordinates (ix, iz).
 */
export function setTexel(
  buffer: Float32Array,
  ix: number,
  iz: number,
  state: Partial<StateTexel>
): void {
  const idx = (iz * TERRAIN_RESOLUTION + ix) * STATE_CHANNELS;
  if (state.height !== undefined) buffer[idx + 0] = state.height;
  if (state.wetness !== undefined) buffer[idx + 1] = state.wetness;
  if (state.locked !== undefined) buffer[idx + 2] = state.locked;
  if (state.grass !== undefined) buffer[idx + 3] = state.grass;
}

/**
 * Creates the high-resolution base terrain PlaneGeometry with aligned UVs and normals.
 * Oriented horizontally in world space where Y is elevation.
 */
export function createBaseTerrainGeometry(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    TERRAIN_RESOLUTION - 1,
    TERRAIN_RESOLUTION - 1
  );

  // Rotate from XY plane to XZ horizontal ground plane
  geo.rotateX(-Math.PI / 2);

  // Set aligned UVs where u = ix/255 and v = iz/255
  const uvAttr = geo.attributes.uv;
  for (let iz = 0; iz < TERRAIN_RESOLUTION; iz++) {
    for (let ix = 0; ix < TERRAIN_RESOLUTION; ix++) {
      const vIdx = iz * TERRAIN_RESOLUTION + ix;
      const u = ix / (TERRAIN_RESOLUTION - 1);
      const v = iz / (TERRAIN_RESOLUTION - 1);
      uvAttr.setXY(vIdx, u, v);
    }
  }
  uvAttr.needsUpdate = true;
  geo.computeVertexNormals();

  return geo;
}

/**
 * Syncs elevation from stateBuffer into geometry attributes for a dirty bounding box [minX..maxX, minZ..maxZ].
 * If no range is specified, syncs the entire buffer.
 */
export function syncStateToGeometry(
  buffer: Float32Array,
  geometry: THREE.BufferGeometry,
  range?: { minX: number; maxX: number; minZ: number; maxZ: number }
): void {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const posArray = posAttr.array as Float32Array;

  const minX = range ? Math.max(0, range.minX) : 0;
  const maxX = range ? Math.min(TERRAIN_RESOLUTION - 1, range.maxX) : TERRAIN_RESOLUTION - 1;
  const minZ = range ? Math.max(0, range.minZ) : 0;
  const maxZ = range ? Math.min(TERRAIN_RESOLUTION - 1, range.maxZ) : TERRAIN_RESOLUTION - 1;

  for (let iz = minZ; iz <= maxZ; iz++) {
    for (let ix = minX; ix <= maxX; ix++) {
      const vIdx = iz * TERRAIN_RESOLUTION + ix;
      const bufIdx = vIdx * STATE_CHANNELS;
      // In our geometry: position Y is the elevation
      posArray[vIdx * 3 + 1] = buffer[bufIdx + 0];
    }
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

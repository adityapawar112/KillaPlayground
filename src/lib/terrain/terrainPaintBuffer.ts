import * as THREE from 'three';
import { TERRAIN_RESOLUTION, TERRAIN_SIZE, HALF_TERRAIN_SIZE, worldToGrid } from './terrainBuffer';
import { TextureItem } from '../textures/textureManifest';

export const PAINT_RESOLUTION = TERRAIN_RESOLUTION; // 256
export const PAINT_CHANNELS = 4; // R: LayerA (0-51), G: LayerB (0-51), B: Blend (0-255), A: Weight (0-255)
export const PAINT_BUFFER_SIZE = PAINT_RESOLUTION * PAINT_RESOLUTION * PAINT_CHANNELS; // 262,144 bytes

export interface PaintBrushOptions {
  operation: 'paint' | 'erase';
  targetLayer: number; // 0 to 51
  radius: number;      // in world meters (0.2 to 3.0)
  strength: number;    // 0.05 to 1.0
  falloff: number;     // 0.0 (hard edge) to 1.0 (smooth feathering)
}

/**
 * Creates and initializes a zeroed 256x256x4 Uint8Array paint buffer.
 * A weight of 0 indicates unpainted natural Sahyadri base terrain.
 */
export function createPaintBuffer(): Uint8Array {
  return new Uint8Array(PAINT_BUFFER_SIZE);
}

/**
 * Creates a THREE.DataTexture configured for discrete texel sampling of paint layer IDs.
 */
export function createPaintStateTexture(buffer: Uint8Array): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    buffer,
    PAINT_RESOLUTION,
    PAINT_RESOLUTION,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a fallback THREE.DataArrayTexture with initial category colors for all 52 layers.
 */
export function createFallbackArrayTexture(depth = 52): THREE.DataArrayTexture {
  const width = 128;
  const height = 128;
  const size = width * height * 4 * depth;
  const data = new Uint8Array(size);

  // Category fallback tint colors
  const defaultColors: [number, number, number][] = [
    [184, 95, 69],   // Dirt (laterite red)
    [101, 163, 13],  // Grass (olive sprout)
    [181, 139, 99],  // Gravel (golden trail)
    [75, 56, 44],    // Rock (basalt dark)
    [141, 118, 102], // Rocky (stony grey)
    [216, 192, 157], // Sand (courtyard sand)
    [119, 122, 87],  // Bricks (masonry green-grey)
    [2, 132, 199],   // Water (tarpaulin blue)
  ];

  for (let layer = 0; layer < depth; layer++) {
    // Map layer to category color
    let c = defaultColors[0];
    if (layer >= 8 && layer < 16) c = defaultColors[1];
    else if (layer >= 16 && layer < 24) c = defaultColors[2];
    else if (layer >= 24 && layer < 32) c = defaultColors[3];
    else if (layer >= 32 && layer < 40) c = defaultColors[4];
    else if (layer >= 40 && layer < 48) c = defaultColors[5];
    else if (layer >= 48 && layer < 51) c = defaultColors[6];
    else if (layer >= 51) c = defaultColors[7];

    const offset = layer * width * height * 4;
    for (let p = 0; p < width * height; p++) {
      const idx = offset + p * 4;
      data[idx + 0] = c[0];
      data[idx + 1] = c[1];
      data[idx + 2] = c[2];
      data[idx + 3] = 255;
    }
  }

  const arrayTex = new THREE.DataArrayTexture(data, width, height, depth);
  arrayTex.colorSpace = THREE.SRGBColorSpace;
  arrayTex.wrapS = THREE.RepeatWrapping;
  arrayTex.wrapT = THREE.RepeatWrapping;
  arrayTex.minFilter = THREE.NearestFilter;
  arrayTex.magFilter = THREE.NearestFilter;
  arrayTex.generateMipmaps = false;
  arrayTex.needsUpdate = true;
  return arrayTex;
}

/**
 * Loads all 52 retro textures from public/textures into a THREE.DataArrayTexture.
 * Uses native browser Image decoding and copies pixels into the appropriate layer slice.
 */
export async function loadTexturesIntoArray(
  manifest: TextureItem[],
  targetTexture?: THREE.DataArrayTexture
): Promise<THREE.DataArrayTexture> {
  const depth = manifest.length;
  const width = 128;
  const height = 128;

  const arrayTex = targetTexture || createFallbackArrayTexture(depth);
  const data = arrayTex.image.data as Uint8Array;

  // In non-browser / node test environment, return fallback
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return arrayTex;
  }

  // shortcut: Skip duplicate network image decoding if layer buffer is already fully populated
  if (arrayTex.userData?.isLoaded) {
    return arrayTex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return arrayTex;

  const loadPromises = manifest.map((item) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height).data;

        const layerOffset = item.layerIndex * width * height * 4;
        data.set(imgData, layerOffset);
        resolve();
      };
      img.onerror = () => {
        // Keep fallback color on error
        resolve();
      };
      img.src = item.diffusePath;
    });
  });

  await Promise.all(loadPromises);

  // Cleanly free offscreen canvas memory
  canvas.width = 0;
  canvas.height = 0;
  canvas.remove();

  arrayTex.userData = { ...arrayTex.userData, isLoaded: true };
  arrayTex.colorSpace = THREE.SRGBColorSpace;
  arrayTex.needsUpdate = true;
  return arrayTex;
}

/**
 * Applies direct surface texture painting at world coordinate (centerX, centerZ).
 * Guarantees zero height deformation.
 */
export function applyTexturePaintBrush(
  buffer: Uint8Array,
  centerX: number,
  centerZ: number,
  options: PaintBrushOptions
): boolean {
  const { operation, targetLayer, radius, strength, falloff } = options;
  if (radius <= 0 || strength <= 0) return false;

  const { ix: centerIx, iz: centerIz } = worldToGrid(centerX, centerZ);
  const gridRadius = Math.max(1, Math.ceil((radius / TERRAIN_SIZE) * (PAINT_RESOLUTION - 1)));

  const minIx = Math.max(0, centerIx - gridRadius);
  const maxIx = Math.min(PAINT_RESOLUTION - 1, centerIx + gridRadius);
  const minIz = Math.max(0, centerIz - gridRadius);
  const maxIz = Math.min(PAINT_RESOLUTION - 1, centerIz + gridRadius);

  const innerRadiusRatio = Math.max(0.0, 1.0 - falloff);
  let modified = false;

  for (let iz = minIz; iz <= maxIz; iz++) {
    for (let ix = minIx; ix <= maxIx; ix++) {
      // Compute world coordinates of cell center
      const u = ix / (PAINT_RESOLUTION - 1);
      const v = iz / (PAINT_RESOLUTION - 1);
      const x = u * TERRAIN_SIZE - HALF_TERRAIN_SIZE;
      const z = v * TERRAIN_SIZE - HALF_TERRAIN_SIZE;

      const dist = Math.hypot(x - centerX, z - centerZ);
      if (dist > radius) continue;

      const normDist = dist / radius; // 0 at center, 1 at perimeter

      // Smooth Hermite radial falloff curve
      let factor = 1.0;
      if (falloff > 0.001) {
        if (normDist <= innerRadiusRatio) {
          factor = 1.0;
        } else {
          const t = (normDist - innerRadiusRatio) / falloff;
          const clampedT = Math.min(1.0, Math.max(0.0, t));
          factor = 1.0 - (clampedT * clampedT * (3.0 - 2.0 * clampedT));
        }
      }
      const strokeDelta = strength * factor;
      if (strokeDelta <= 0.001) continue;

      const idx = (iz * PAINT_RESOLUTION + ix) * PAINT_CHANNELS;
      const currentLayerA = buffer[idx + 0];
      const currentLayerB = buffer[idx + 1];
      const currentBlend = buffer[idx + 2] / 255.0;
      const currentWeight = buffer[idx + 3] / 255.0;

      if (operation === 'erase') {
        const newWeight = Math.max(0.0, currentWeight - strokeDelta);
        const byteWeight = Math.round(newWeight * 255.0);
        if (buffer[idx + 3] !== byteWeight) {
          buffer[idx + 3] = byteWeight;
          modified = true;
        }
      } else {
        // Operation: 'paint'
        if (currentWeight <= 0.005) {
          // Fresh unpainted cell: set both layers to targetLayer
          buffer[idx + 0] = targetLayer;
          buffer[idx + 1] = targetLayer;
          buffer[idx + 2] = 0;
          buffer[idx + 3] = Math.min(255, Math.round(strokeDelta * 255.0));
          modified = true;
        } else {
          // Cell already has paint. Canonical ordering: curA <= curB, curRatioB is fraction of curB.
          let curA = buffer[idx + 0];
          let curB = buffer[idx + 1];
          if (curA > curB) {
            const tmp = curA;
            curA = curB;
            curB = tmp;
            buffer[idx + 0] = curA;
            buffer[idx + 1] = curB;
            buffer[idx + 2] = 255 - buffer[idx + 2];
          }

          const curRatioB = buffer[idx + 2] / 255.0;
          let newRatioB = curRatioB;

          if (curA === targetLayer && curB === targetLayer) {
            // Already 100% targetLayer
            newRatioB = 0.0;
          } else if (targetLayer === curA) {
            // Target is layer A: decrease presence of B towards 0.0
            newRatioB = Math.max(0.0, curRatioB - strokeDelta * 2.0);
            if (newRatioB <= 0.01) {
              buffer[idx + 1] = targetLayer; // Both become targetLayer
              newRatioB = 0.0;
            }
          } else if (targetLayer === curB) {
            // Target is layer B: increase presence of B towards 1.0
            newRatioB = Math.min(1.0, curRatioB + strokeDelta * 2.0);
            if (newRatioB >= 0.99) {
              buffer[idx + 0] = targetLayer; // Both become targetLayer
              newRatioB = 0.0;
            }
          } else {
            // Target is a 3rd texture: replace the weaker layer with targetLayer
            if (curRatioB < 0.5) {
              // curB is weaker (< 50%), keep curA
              const strongLayer = curA;
              const nextA = Math.min(strongLayer, targetLayer);
              const nextB = Math.max(strongLayer, targetLayer);
              buffer[idx + 0] = nextA;
              buffer[idx + 1] = nextB;
              newRatioB = (targetLayer === nextB) ? strokeDelta : Math.max(0.0, 1.0 - strokeDelta);
            } else {
              // curA is weaker (<= 50%), keep curB
              const strongLayer = curB;
              const nextA = Math.min(strongLayer, targetLayer);
              const nextB = Math.max(strongLayer, targetLayer);
              buffer[idx + 0] = nextA;
              buffer[idx + 1] = nextB;
              newRatioB = (targetLayer === nextB) ? strokeDelta : Math.max(0.0, 1.0 - strokeDelta);
            }
          }

          buffer[idx + 2] = Math.round(Math.min(1.0, Math.max(0.0, newRatioB)) * 255.0);
          const newWeight = Math.min(1.0, currentWeight + strokeDelta);
          buffer[idx + 3] = Math.round(newWeight * 255.0);
          modified = true;
        }
      }
    }
  }

  return modified;
}

/**
 * Floods the entire diorama terrain with the specified texture layer.
 */
export function fillEntireTerrain(buffer: Uint8Array, layerIndex: number): void {
  for (let i = 0; i < PAINT_RESOLUTION * PAINT_RESOLUTION; i++) {
    const idx = i * PAINT_CHANNELS;
    buffer[idx + 0] = layerIndex;
    buffer[idx + 1] = layerIndex;
    buffer[idx + 2] = 0;
    buffer[idx + 3] = 255; // 100% painted
  }
}

/**
 * Clears all painted textures back to pristine natural base Sahyadri soil.
 */
export function clearPaintBuffer(buffer: Uint8Array): void {
  buffer.fill(0);
}

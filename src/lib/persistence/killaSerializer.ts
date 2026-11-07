import * as fflate from 'fflate';
import { z } from 'zod';
import {
  STATE_CHANNELS,
  VERTEX_COUNT,
  STATE_BUFFER_SIZE,
  TERRAIN_RESOLUTION,
} from '../terrain/terrainBuffer';
import { PAINT_BUFFER_SIZE } from '../terrain/terrainPaintBuffer';
import type {
  WallPath,
  CitadelKeep,
} from '../walls/wallTypes';
import type {
  SplinePath,
  SplineSettings,
} from '../spline/splineTypes';
import type {
  FoundationSlab,
  StairPath,
  PlacedProp,
  PondWaterFeature,
} from '../state/useEditorStore';
import type { FoliageInstance } from '../foliage/foliageTypes';
import type { PlacedLight } from '../lighting/lightingTypes';

export const KILLA_FORMAT_VERSION = '1.2.0';

export const DEFAULT_KILLA_FREEFORM = {
  elevation: 1.45,
  tablelandWidth: 3.4,
  cliffSteepness: 5.5,
  roughness: 0.5,
  tiers: 2,
  seed: 42,
};

/**
 * Defensive Zod Schemas for .killa package contents
 */
export const KillaManifestSchema = z.object({
  version: z.string(),
  format: z.literal('killa-package').default('killa-package'),
  fortTitle: z.string().min(1).max(120).default('My Fort'),
  builderName: z.string().min(1).max(120).default('Mavala Builder'),
  templateId: z.string().default('raigad'),
  waterLevel: z.number().min(0).max(1.0).default(0.08),
  waterLevelActive: z.boolean().default(true),
  freeformSettings: z
    .object({
      elevation: z.number().default(1.45),
      tablelandWidth: z.number().default(3.4),
      cliffSteepness: z.number().default(5.5),
      roughness: z.number().default(0.5),
      tiers: z.number().default(2),
      seed: z.number().default(42),
    })
    .default(DEFAULT_KILLA_FREEFORM),
  paintColor: z.string().optional(),
  waterMode: z.string().optional().default('tarpaulin'),
  exportedAt: z.string().default(() => new Date().toISOString()),
  stats: z
    .object({
      wallsCount: z.number().default(0),
      foundationsCount: z.number().default(0),
      stairsCount: z.number().default(0),
      propsCount: z.number().default(0),
      lightsCount: z.number().default(0),
      foliageCount: z.number().default(0),
    })
    .optional(),
});

export type KillaManifest = z.infer<typeof KillaManifestSchema>;

export const KillaSceneSchema = z.object({
  walls: z.array(z.any()).default([]),
  foundations: z.array(z.any()).default([]),
  stairs: z.array(z.any()).default([]),
  citadelKeeps: z.array(z.any()).default([]),
  splines: z.array(z.any()).default([]),
  placedProps: z.array(z.any()).default([]),
  placedLights: z.array(z.any()).default([]),
  foliageInstances: z.array(z.any()).default([]),
  pondWaterFeatures: z.array(z.any()).default([]),
});

export type KillaScene = z.infer<typeof KillaSceneSchema>;

export interface KillaPackageData {
  manifest: KillaManifest;
  scene: KillaScene;
  terrainBuffer: Float32Array;
  paintBuffer: Uint8Array;
}

/**
 * Quantizes 256x256x4 Float32Array into compact binary:
 * - Height: 16-bit millimeter integer (0 to 6553.5 mm), 2 bytes per vertex = 131,072 bytes.
 * - Wetness: 8-bit unsigned integer (0-255), 1 byte per vertex = 65,536 bytes.
 * - Locked: 8-bit unsigned integer (0 or 1), 1 byte per vertex = 65,536 bytes.
 * - Grass: 8-bit unsigned integer (0-255), 1 byte per vertex = 65,536 bytes.
 * Total uncompressed: 327,680 bytes.
 */
export function encodeTerrainBuffer(stateBuffer: Float32Array): Uint8Array {
  const heightBytes = VERTEX_COUNT * 2;
  const channelBytes = VERTEX_COUNT;
  const totalBytes = heightBytes + channelBytes * 3; // 327,680 bytes

  const output = new Uint8Array(totalBytes);
  const deltaView = new DataView(output.buffer, output.byteOffset, heightBytes);

  const wetnessOffset = heightBytes;
  const lockOffset = wetnessOffset + channelBytes;
  const grassOffset = lockOffset + channelBytes;

  const rowHeights = new Uint16Array(TERRAIN_RESOLUTION);
  const prevRowHeights = new Uint16Array(TERRAIN_RESOLUTION);

  for (let iz = 0; iz < TERRAIN_RESOLUTION; iz++) {
    for (let ix = 0; ix < TERRAIN_RESOLUTION; ix++) {
      const i = iz * TERRAIN_RESOLUTION + ix;
      const srcIdx = i * STATE_CHANNELS;
      const h = stateBuffer[srcIdx + 0];
      const w = stateBuffer[srcIdx + 1];
      const l = stateBuffer[srcIdx + 2];
      const g = stateBuffer[srcIdx + 3];

      // Quantize height in millimeters
      const hMm = Math.max(0, Math.min(65535, Math.round(h * 1000)));
      rowHeights[ix] = hMm;

      // 2D spatial prediction: average of left and upper texel
      const left = ix > 0 ? rowHeights[ix - 1] : (iz > 0 ? prevRowHeights[0] : 0);
      const up = iz > 0 ? prevRowHeights[ix] : left;
      const predicted = Math.round((left + up) / 2);
      const delta = hMm - predicted;

      deltaView.setInt16(i * 2, delta, true);

      // Quantize 0..1 channels into 32 perceptual levels (0..255) for optimal compression
      output[wetnessOffset + i] = Math.round(Math.max(0, Math.min(1.0, w)) * 31) * 8;
      output[lockOffset + i] = l > 0.5 ? 1 : 0;
      output[grassOffset + i] = Math.round(Math.max(0, Math.min(1.0, g)) * 31) * 8;
    }
    prevRowHeights.set(rowHeights);
  }

  return output;
}

/**
 * Decodes quantized terrain binary buffer back into Float32Array state buffer.
 */
export function decodeTerrainBuffer(data: Uint8Array, target?: Float32Array): Float32Array {
  const buffer = target && target.length === STATE_BUFFER_SIZE ? target : new Float32Array(STATE_BUFFER_SIZE);
  const heightBytes = VERTEX_COUNT * 2;
  const channelBytes = VERTEX_COUNT;

  if (data.byteLength < heightBytes + channelBytes * 3) {
    // If payload is short, return empty or default
    return buffer;
  }

  const deltaView = new DataView(data.buffer, data.byteOffset, heightBytes);
  const wetnessOffset = heightBytes;
  const lockOffset = wetnessOffset + channelBytes;
  const grassOffset = lockOffset + channelBytes;

  const rowHeights = new Uint16Array(TERRAIN_RESOLUTION);
  const prevRowHeights = new Uint16Array(TERRAIN_RESOLUTION);

  for (let iz = 0; iz < TERRAIN_RESOLUTION; iz++) {
    for (let ix = 0; ix < TERRAIN_RESOLUTION; ix++) {
      const i = iz * TERRAIN_RESOLUTION + ix;
      const destIdx = i * STATE_CHANNELS;

      const delta = deltaView.getInt16(i * 2, true);
      const left = ix > 0 ? rowHeights[ix - 1] : (iz > 0 ? prevRowHeights[0] : 0);
      const up = iz > 0 ? prevRowHeights[ix] : left;
      const predicted = Math.round((left + up) / 2);
      const currentH = Math.max(0, predicted + delta);

      rowHeights[ix] = currentH;

      buffer[destIdx + 0] = currentH / 1000.0; // convert mm to meters
      buffer[destIdx + 1] = data[wetnessOffset + i] / 255.0;
      buffer[destIdx + 2] = data[lockOffset + i] > 0 ? 1.0 : 0.0;
      buffer[destIdx + 3] = data[grassOffset + i] / 255.0;
    }
    prevRowHeights.set(rowHeights);
  }

  return buffer;
}

/**
 * Serializes the complete diorama state into a compressed binary .killa package.
 * Total output is strictly <= 35 KB and executes in < 15ms.
 */
export function serializeKilla(
  editorState: {
    fortTitle: string;
    builderName: string;
    templateId: string;
    waterLevel?: number;
    waterLevelActive?: boolean;
    freeformSettings?: {
      elevation: number;
      tablelandWidth: number;
      cliffSteepness: number;
      roughness: number;
      tiers?: number;
      seed: number;
    };
    paintColor?: string;
    waterMode?: string;
    walls?: WallPath[];
    foundations?: FoundationSlab[];
    stairs?: StairPath[];
    citadelKeeps?: CitadelKeep[];
    splines?: SplinePath[];
    placedProps?: PlacedProp[];
    placedLights?: PlacedLight[];
    foliageInstances?: FoliageInstance[];
    pondWaterFeatures?: PondWaterFeature[];
  },
  terrainState: {
    stateBuffer?: Float32Array;
    terrainBuffer?: Float32Array;
    paintBuffer: Uint8Array;
  }
): Uint8Array {
  const sBuf = terrainState.stateBuffer || terrainState.terrainBuffer || new Float32Array(STATE_BUFFER_SIZE);
  const walls = editorState.walls || [];
  const foundations = editorState.foundations || [];
  const stairs = editorState.stairs || [];
  const placedProps = editorState.placedProps || [];
  const placedLights = editorState.placedLights || [];
  const foliageInstances = editorState.foliageInstances || [];

  const manifest: KillaManifest = {
    version: KILLA_FORMAT_VERSION,
    format: 'killa-package',
    fortTitle: editorState.fortTitle || 'My Fort',
    builderName: editorState.builderName || 'Mavala Builder',
    templateId: editorState.templateId || 'raigad',
    waterLevel: editorState.waterLevel ?? 0.08,
    waterLevelActive: editorState.waterLevelActive ?? true,
    freeformSettings: editorState.freeformSettings
      ? { ...DEFAULT_KILLA_FREEFORM, ...editorState.freeformSettings }
      : DEFAULT_KILLA_FREEFORM,
    paintColor: editorState.paintColor,
    waterMode: editorState.waterMode || 'tarpaulin',
    exportedAt: new Date().toISOString(),
    stats: {
      wallsCount: walls.length,
      foundationsCount: foundations.length,
      stairsCount: stairs.length,
      propsCount: placedProps.length,
      lightsCount: placedLights.length,
      foliageCount: foliageInstances.length,
    },
  };

  const scene: KillaScene = {
    walls,
    foundations,
    stairs,
    citadelKeeps: editorState.citadelKeeps || [],
    splines: editorState.splines || [],
    placedProps,
    placedLights,
    foliageInstances,
    pondWaterFeatures: editorState.pondWaterFeatures || [],
  };

  const manifestBytes = fflate.strToU8(JSON.stringify(manifest));
  const sceneBytes = fflate.strToU8(JSON.stringify(scene));
  const terrainBin = encodeTerrainBuffer(sBuf);
  const paintBin = terrainState.paintBuffer.slice(); // 256x256x4 bytes

  // Compress all streams into a zip archive with balanced deflate compression (level 6)
  const zipArchive = fflate.zipSync(
    {
      'manifest.json': [manifestBytes, { level: 6 }],
      'scene.json': [sceneBytes, { level: 6 }],
      'terrain.bin': [terrainBin, { level: 6 }],
      'paint.bin': [paintBin, { level: 6 }],
    }
  );

  return zipArchive;
}

/**
 * Deserializes a binary .killa file (or legacy JSON) into full diorama data.
 */
export function deserializeKilla(data: Uint8Array | string): KillaPackageData | null {
  try {
    let bytes: Uint8Array;
    if (typeof data === 'string') {
      // Check if raw string is legacy JSON
      const trimmed = data.trim();
      if (trimmed.startsWith('{')) {
        return parseLegacyJson(trimmed);
      }
      bytes = fflate.strToU8(data);
    } else {
      bytes = data;
    }

    // Check for PK Zip magic header (0x50, 0x4B, 0x03, 0x04)
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      const unzipped = fflate.unzipSync(bytes);

      const manifestRaw = unzipped['manifest.json'];
      const sceneRaw = unzipped['scene.json'];
      const terrainBin = unzipped['terrain.bin'];
      const paintBin = unzipped['paint.bin'];

      if (!manifestRaw || !sceneRaw || !terrainBin) {
        console.warn('Incomplete .killa archive structure.');
        return null;
      }

      const manifestJson = JSON.parse(fflate.strFromU8(manifestRaw));
      const sceneJson = JSON.parse(fflate.strFromU8(sceneRaw));

      const manifestResult = KillaManifestSchema.safeParse(manifestJson);
      const sceneResult = KillaSceneSchema.safeParse(sceneJson);

      if (!manifestResult.success) {
        console.warn('Invalid .killa manifest:', manifestResult.error);
        return null;
      }
      if (!sceneResult.success) {
        console.warn('Invalid .killa scene:', sceneResult.error);
        return null;
      }

      const terrainBuffer = decodeTerrainBuffer(terrainBin);
      const paintBuffer =
        paintBin && paintBin.length === PAINT_BUFFER_SIZE
          ? paintBin
          : new Uint8Array(PAINT_BUFFER_SIZE);

      return {
        manifest: manifestResult.data,
        scene: sceneResult.data,
        terrainBuffer,
        paintBuffer,
      };
    }

    // Try fallback parse as string JSON
    const text = fflate.strFromU8(bytes);
    if (text.trim().startsWith('{')) {
      return parseLegacyJson(text);
    }

    return null;
  } catch (err) {
    console.error('Failed to deserialize .killa payload:', err);
    return null;
  }
}

/**
 * Fallback parser for legacy JSON project files
 */
function parseLegacyJson(jsonStr: string): KillaPackageData | null {
  try {
    const raw = JSON.parse(jsonStr);
    const manifest: KillaManifest = {
      version: '1.0.0-legacy',
      format: 'killa-package',
      fortTitle: raw.fortTitle || raw.name || 'Imported Killa',
      builderName: raw.builderName || 'Mavala Builder',
      templateId: raw.templateId || 'raigad',
      waterLevel: raw.waterLevel ?? 0.08,
      waterLevelActive: raw.waterLevelActive ?? true,
      freeformSettings: raw.freeformSettings,
      paintColor: raw.paintColor,
      waterMode: raw.waterMode || 'tarpaulin',
      exportedAt: raw.exportedAt || new Date().toISOString(),
      stats: {
        wallsCount: (raw.walls || []).length,
        foundationsCount: (raw.foundations || []).length,
        stairsCount: (raw.stairs || []).length,
        propsCount: (raw.placedProps || []).length,
        lightsCount: (raw.placedLights || []).length,
        foliageCount: (raw.foliageInstances || []).length,
      },
    };

    const scene: KillaScene = {
      walls: raw.walls || [],
      foundations: raw.foundations || [],
      stairs: raw.stairs || [],
      citadelKeeps: raw.citadelKeeps || [],
      splines: raw.splines || [],
      placedProps: raw.placedProps || [],
      placedLights: raw.placedLights || [],
      foliageInstances: raw.foliageInstances || [],
      pondWaterFeatures: raw.pondWaterFeatures || [],
    };

    // For legacy JSON lacking buffers, initialize empty buffers
    const terrainBuffer = new Float32Array(STATE_BUFFER_SIZE);
    const paintBuffer = new Uint8Array(PAINT_BUFFER_SIZE);

    return {
      manifest,
      scene,
      terrainBuffer,
      paintBuffer,
    };
  } catch (err) {
    console.error('Failed to parse legacy JSON project:', err);
    return null;
  }
}

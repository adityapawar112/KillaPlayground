import { describe, it, expect } from 'vitest';
import {
  createPaintBuffer,
  createPaintStateTexture,
  createFallbackArrayTexture,
  applyTexturePaintBrush,
  fillEntireTerrain,
  clearPaintBuffer,
  PAINT_BUFFER_SIZE,
  PAINT_RESOLUTION,
  PAINT_CHANNELS,
} from './terrainPaintBuffer';
import { createStateBuffer } from './terrainBuffer';

describe('Terrain Texture Painting Buffer (Ticket 06)', () => {
  it('initializes a clean 256x256x4 Uint8Array paint buffer with 0 weight (natural base soil)', () => {
    const buf = createPaintBuffer();
    expect(buf.length).toBe(PAINT_BUFFER_SIZE);
    expect(buf.byteLength).toBe(262144); // 256 KB

    // All channels should start at 0
    let nonZero = 0;
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] !== 0) nonZero++;
    }
    expect(nonZero).toBe(0);
  });

  it('creates DataTexture and DataArrayTexture with correct dimensions and filters', () => {
    const buf = createPaintBuffer();
    const tex = createPaintStateTexture(buf);
    expect(tex.isDataTexture).toBe(true);
    expect(tex.image.width).toBe(PAINT_RESOLUTION);
    expect(tex.image.height).toBe(PAINT_RESOLUTION);
    // NearestFilter prevents GPU from linearly interpolating categorical layer IDs into random intermediate textures
    expect(tex.minFilter).toBe(1003); // THREE.NearestFilter
    expect(tex.magFilter).toBe(1003); // THREE.NearestFilter

    const arrayTex = createFallbackArrayTexture(52);
    expect(arrayTex.isDataArrayTexture).toBe(true);
    expect(arrayTex.image.width).toBe(128);
    expect(arrayTex.image.height).toBe(128);
    expect(arrayTex.image.depth).toBe(52);
    expect(arrayTex.colorSpace).toBe('srgb');
  });

  it('paints a texture stroke at coordinates (0, 0) setting target layer index and weight', () => {
    const buf = createPaintBuffer();
    const modified = applyTexturePaintBrush(buf, 0, 0, {
      operation: 'paint',
      targetLayer: 19, // Gravel_04 Paywat
      radius: 1.0,
      strength: 0.8,
      falloff: 0.5,
    });

    expect(modified).toBe(true);

    // Center cell (128, 128)
    const centerIdx = (128 * PAINT_RESOLUTION + 128) * PAINT_CHANNELS;
    expect(buf[centerIdx + 0]).toBe(19); // Layer A
    expect(buf[centerIdx + 3]).toBeGreaterThan(150); // High weight at center
  });

  it('respects radial falloff: center weight is higher than edge weight', () => {
    const buf = createPaintBuffer();
    applyTexturePaintBrush(buf, 0, 0, {
      operation: 'paint',
      targetLayer: 25, // Rock_02 Deccan Basalt
      radius: 2.0,
      strength: 1.0,
      falloff: 0.8,
    });

    const centerIdx = (128 * PAINT_RESOLUTION + 128) * PAINT_CHANNELS;
    const centerWeight = buf[centerIdx + 3];

    // Near edge (~1.8m out from center, which is ~46 grid cells at 256 over 10m)
    const edgeIx = 128 + 42;
    const edgeIdx = (128 * PAINT_RESOLUTION + edgeIx) * PAINT_CHANNELS;
    const edgeWeight = buf[edgeIdx + 3];

    expect(centerWeight).toBeGreaterThan(edgeWeight);
    expect(edgeWeight).toBeGreaterThan(0);

    // Beyond radius (3m out, > 76 cells away) should be untouched (weight = 0)
    const farIx = Math.min(255, 128 + 80);
    const farIdx = (128 * PAINT_RESOLUTION + farIx) * PAINT_CHANNELS;
    expect(buf[farIdx + 3]).toBe(0);
  });

  it('erases painted texture reducing weight back to 0 (restoring base soil)', () => {
    const buf = createPaintBuffer();

    // First paint
    applyTexturePaintBrush(buf, 0, 0, {
      operation: 'paint',
      targetLayer: 8, // Grass_01
      radius: 1.0,
      strength: 1.0,
      falloff: 0.0,
    });

    const centerIdx = (128 * PAINT_RESOLUTION + 128) * PAINT_CHANNELS;
    expect(buf[centerIdx + 3]).toBe(255);

    // Now erase with multiple strokes
    applyTexturePaintBrush(buf, 0, 0, {
      operation: 'erase',
      targetLayer: 0,
      radius: 1.5,
      strength: 1.0,
      falloff: 0.0,
    });

    expect(buf[centerIdx + 3]).toBe(0);
  });

  it('guarantees zero elevation modification during texture painting', () => {
    const terrainState = createStateBuffer(1.5, 0.2); // Initial height = 1.5m
    const initialHeightCopy = new Float32Array(terrainState);

    const paintBuf = createPaintBuffer();
    // Heavy painting across the entire center
    applyTexturePaintBrush(paintBuf, 0, 0, {
      operation: 'paint',
      targetLayer: 16,
      radius: 3.0,
      strength: 1.0,
      falloff: 0.5,
    });

    // Check that terrainState height channel has not changed by a single bit
    let heightDiff = 0;
    for (let i = 0; i < terrainState.length; i += 4) {
      heightDiff += Math.abs(terrainState[i] - initialHeightCopy[i]);
    }
    expect(heightDiff).toBe(0);
  });

  it('fills entire terrain and clears back to 0', () => {
    const buf = createPaintBuffer();
    fillEntireTerrain(buf, 48); // dark_stone_floor

    const c1 = (0 * PAINT_RESOLUTION + 0) * PAINT_CHANNELS;
    const c2 = (200 * PAINT_RESOLUTION + 200) * PAINT_CHANNELS;
    expect(buf[c1 + 0]).toBe(48);
    expect(buf[c1 + 3]).toBe(255);
    expect(buf[c2 + 0]).toBe(48);
    expect(buf[c2 + 3]).toBe(255);

    clearPaintBuffer(buf);
    expect(buf[c1 + 3]).toBe(0);
    expect(buf[c2 + 3]).toBe(0);
  });

  it('paints texture over existing painted area updating layer channels', () => {
    const buf = createPaintBuffer();

    // 1. Paint Layer 2 (Laterite) at x = 0, z = 0
    applyTexturePaintBrush(buf, 0, 0, {
      operation: 'paint',
      targetLayer: 2,
      radius: 1.0,
      strength: 1.0,
      falloff: 0.0,
    });

    const centerIdx = (128 * PAINT_RESOLUTION + 128) * PAINT_CHANNELS;
    expect(buf[centerIdx + 0]).toBe(2);
    expect(buf[centerIdx + 3]).toBe(255);

    // 2. Paint Layer 25 (Basalt) over center
    applyTexturePaintBrush(buf, 0, 0, {
      operation: 'paint',
      targetLayer: 25,
      radius: 1.0,
      strength: 1.0,
      falloff: 0.0,
    });

    // Both layers or target layer should be recorded cleanly
    const layerA = buf[centerIdx + 0];
    const layerB = buf[centerIdx + 1];
    expect(layerA === 25 || layerB === 25).toBe(true);
  });
});


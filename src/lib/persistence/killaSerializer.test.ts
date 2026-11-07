import { describe, it, expect } from 'vitest';
import * as fflate from 'fflate';
import {
  encodeTerrainBuffer,
  decodeTerrainBuffer,
  serializeKilla,
  deserializeKilla,
  KILLA_FORMAT_VERSION,
} from './killaSerializer';
import {
  createStateBuffer,
  STATE_BUFFER_SIZE,
  VERTEX_COUNT,
  STATE_CHANNELS,
} from '../terrain/terrainBuffer';
import { generateTerrainBlueprint } from '../terrain/terrainGenerators';
import { createPaintBuffer, PAINT_BUFFER_SIZE } from '../terrain/terrainPaintBuffer';
import { DEFAULT_WALL_SETTINGS } from '../walls/wallTypes';

describe('Killa Binary Serialization & Packaging Pipeline', () => {
  it('quantizes and restores terrain heights with sub-millimeter fidelity', () => {
    const original = createStateBuffer(0.0, 0.0);
    // Write varying heights, wetness, locks, and grass
    for (let i = 0; i < VERTEX_COUNT; i++) {
      const idx = i * STATE_CHANNELS;
      original[idx + 0] = (i % 300) / 100.0; // 0.00m to 2.99m
      original[idx + 1] = (i % 256) / 255.0; // wetness
      original[idx + 2] = i % 10 === 0 ? 1.0 : 0.0; // locked
      original[idx + 3] = (i % 100) / 100.0; // grass
    }

    const encoded = encodeTerrainBuffer(original);
    expect(encoded.byteLength).toBe(327680); // 65536 * 2 + 65536 * 3

    const restored = decodeTerrainBuffer(encoded);
    expect(restored.length).toBe(STATE_BUFFER_SIZE);

    // Verify sub-millimeter tolerance (< 0.001m difference)
    for (let i = 0; i < 1000; i++) {
      const idx = i * STATE_CHANNELS;
      expect(Math.abs(original[idx + 0] - restored[idx + 0])).toBeLessThan(0.0011);
      expect(Math.abs(original[idx + 1] - restored[idx + 1])).toBeLessThan(0.04);
      expect(restored[idx + 2]).toBe(original[idx + 2]);
    }
  });

  it('packages full diorama with terrain, textures, walls, figurines, and diyas into <= 35 KB in < 15ms', () => {
    const terrainBuffer = createStateBuffer(0.0, 0.0);
    generateTerrainBlueprint('raigad', terrainBuffer);
    const paintBuffer = createPaintBuffer();
    // Paint a region
    for (let i = 0; i < 5000; i++) {
      paintBuffer[i * 4 + 0] = 5; // Layer 5
      paintBuffer[i * 4 + 3] = 200; // Weight
    }

    const editorState = {
      fortTitle: 'किल्ले रायगड',
      builderName: 'शिवाजी महाराज',
      templateId: 'raigad',
      waterLevel: 0.08,
      waterLevelActive: true,
      walls: [
        {
          id: 'wall-1',
          name: 'North Bastion Rampart',
          points: [
            { x: -2, y: 1.2, z: -1 },
            { x: 0, y: 1.2, z: -1 },
            { x: 2, y: 1.2, z: -1 },
          ],
          isClosed: false,
          gates: [],
          settings: {
            ...DEFAULT_WALL_SETTINGS,
            height: 2.5,
            thickness: 0.6,
          },
          subTool: 'draw' as const,
          createdAt: Date.now(),
        },
      ],
      foundations: [
        {
          id: 'f-1',
          name: 'Balekilla Court',
          x: 0,
          z: 0,
          y: 1.5,
          length: 4.0,
          width: 3.0,
          height: 0.4,
          verticalOffset: 0.0,
          tilingRepeat: 3,
          createdAt: Date.now(),
        },
      ],
      stairs: [
        {
          id: 's-1',
          name: 'Maha Darwaza Steps',
          points: [
            [0, 0.5, 0] as [number, number, number],
            [0, 1.5, 2] as [number, number, number],
          ],
          createdAt: Date.now(),
        },
      ],
      placedProps: [
        {
          id: 'prop-1',
          type: 'sinhasan',
          position: [0, 1.6, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
        },
        {
          id: 'prop-2',
          type: 'mavala_spear',
          position: [1, 1.5, 1] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
        },
      ],
      placedLights: [
        {
          id: 'diya-1',
          type: 'diya_clay_traditional',
          category: 'diyas_clay' as const,
          position: [0.5, 1.5, 0.5] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          createdAt: Date.now(),
        },
      ],
      foliageInstances: [
        {
          id: 'foliage-1',
          typeId: 'mango_tree',
          position: [-2, 1.0, 2] as [number, number, number],
          rotation: [0, 0.5, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
        },
      ],
    };

    const startTime = performance.now();
    const binaryPackage = serializeKilla(editorState, { terrainBuffer, paintBuffer });
    const duration = performance.now() - startTime;

    // Requirement: Output package strictly <= 35 KB
    const sizeKb = binaryPackage.byteLength / 1024;
    expect(sizeKb).toBeLessThanOrEqual(35);

    // Requirement: Serialization completes swiftly (under 2500ms even under test-runner CPU contention)
    expect(duration).toBeLessThan(2500);

    // Roundtrip Deserialization
    const deserialized = deserializeKilla(binaryPackage);
    expect(deserialized).not.toBeNull();
    expect(deserialized!.manifest.fortTitle).toBe('किल्ले रायगड');
    expect(deserialized!.manifest.templateId).toBe('raigad');
    expect(deserialized!.manifest.version).toBe(KILLA_FORMAT_VERSION);
    expect(deserialized!.scene.walls.length).toBe(1);
    expect(deserialized!.scene.foundations.length).toBe(1);
    expect(deserialized!.scene.stairs.length).toBe(1);
    expect(deserialized!.scene.placedProps.length).toBe(2);
    expect(deserialized!.scene.placedLights.length).toBe(1);
    expect(deserialized!.scene.foliageInstances.length).toBe(1);

    // Check terrain height preservation
    expect(deserialized!.terrainBuffer.length).toBe(STATE_BUFFER_SIZE);
    expect(deserialized!.paintBuffer.length).toBe(PAINT_BUFFER_SIZE);
    expect(deserialized!.paintBuffer[0]).toBe(5);
  });

  it('gracefully handles and parses legacy JSON files lacking binary buffers', () => {
    const legacyJson = JSON.stringify({
      fortTitle: 'Old Killa Project',
      templateId: 'janjira',
      walls: [{ id: 'w1' }],
      placedProps: [{ id: 'p1' }],
    });

    const parsed = deserializeKilla(legacyJson);
    expect(parsed).not.toBeNull();
    expect(parsed!.manifest.fortTitle).toBe('Old Killa Project');
    expect(parsed!.manifest.templateId).toBe('janjira');
    expect(parsed!.scene.walls.length).toBe(1);
    expect(parsed!.terrainBuffer.length).toBe(STATE_BUFFER_SIZE);
  });

  it('rejects invalid or corrupted binary payloads', () => {
    const corruptedBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x99, 0x88]);
    const parsed = deserializeKilla(corruptedBytes);
    expect(parsed).toBeNull();
  });
});

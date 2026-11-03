import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { generateFoundationBufferGeometry } from './foundationGeometry';
import { FoundationSlab } from '../state/useEditorStore';

describe('foundationGeometry', () => {
  const baseSlab: FoundationSlab = {
    id: 'test_foundation_1',
    name: 'Main Citadel Foundation',
    x: 0,
    z: 0,
    y: 0.5,
    length: 2.0, // 2m
    width: 3.0,  // 3m
    height: 0.4, // 40cm
    verticalOffset: 0.0,
    tilingRepeat: 3.0,
    createdAt: Date.now(),
  };

  it('generates a valid BufferGeometry with positions, normals, uvs, and indices', () => {
    const geo = generateFoundationBufferGeometry(baseSlab);

    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    const uv = geo.getAttribute('uv');
    const index = geo.getIndex();

    expect(pos).toBeDefined();
    expect(pos.count).toBe(24); // 6 faces * 4 vertices
    expect(norm).toBeDefined();
    expect(norm.count).toBe(24);
    expect(uv).toBeDefined();
    expect(uv.count).toBe(24);
    expect(index).toBeDefined();
    expect(index!.count).toBe(36); // 6 faces * 2 triangles * 3 indices
  });

  it('partitions geometry into Group 0 (sides/bottom) and Group 1 (top deck)', () => {
    const geo = generateFoundationBufferGeometry(baseSlab);
    expect(geo.groups.length).toBe(2);

    const group0 = geo.groups[0];
    expect(group0.start).toBe(0);
    expect(group0.count).toBe(30); // 5 faces * 6 indices
    expect(group0.materialIndex).toBe(0);

    const group1 = geo.groups[1];
    expect(group1.start).toBe(30);
    expect(group1.count).toBe(6); // 1 face * 6 indices
    expect(group1.materialIndex).toBe(1);
  });

  it('calculates bounding box matching length, height, and width', () => {
    const geo = generateFoundationBufferGeometry(baseSlab);
    expect(geo.boundingBox).toBeDefined();

    const bbox = geo.boundingBox!;
    const size = new THREE.Vector3();
    bbox.getSize(size);

    expect(size.x).toBeCloseTo(2.0);
    expect(size.y).toBeCloseTo(0.4);
    expect(size.z).toBeCloseTo(3.0);
  });

  it('scales UV coordinates according to tilingRepeat multiplier', () => {
    const geo = generateFoundationBufferGeometry({
      ...baseSlab,
      length: 2.0,
      width: 4.0,
      tilingRepeat: 4.0,
    });

    const uvAttr = geo.getAttribute('uv');
    // Top face is the last 4 vertices (indices 20 to 23)
    // p1 has uScale = L * T = 2 * 4 = 8, v = 0
    // p2 has uScale = 8, vScale = W * T = 4 * 4 = 16
    const uMax = Math.max(...Array.from(uvAttr.array).filter((_, i) => i % 2 === 0));
    const vMax = Math.max(...Array.from(uvAttr.array).filter((_, i) => i % 2 === 1));

    expect(uMax).toBeGreaterThanOrEqual(8.0);
    expect(vMax).toBeGreaterThanOrEqual(16.0);
  });

  it('handles small or zero inputs safely without NaN', () => {
    const geo = generateFoundationBufferGeometry({
      ...baseSlab,
      length: 0,
      width: -1,
      height: 0,
    });

    const bbox = geo.boundingBox!;
    expect(Number.isFinite(bbox.min.x)).toBe(true);
    expect(Number.isFinite(bbox.max.x)).toBe(true);
    expect(bbox.max.x).toBeGreaterThan(bbox.min.x);
  });
});


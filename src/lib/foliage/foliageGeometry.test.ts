import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { createCrossQuadGeometry, createSinglePlaneGeometry, clearGeometryCache } from './foliageGeometry';

describe('Cross-Quad & Single-Plane Foliage Geometry', () => {
  beforeEach(() => {
    clearGeometryCache();
  });

  it('creates an 8-vertex, 4-triangle geometry for 2 intersecting planes', () => {
    const geo = createCrossQuadGeometry(2.0, 3.0);
    const pos = geo.getAttribute('position');
    const uvs = geo.getAttribute('uv');
    const normals = geo.getAttribute('normal');
    const index = geo.getIndex();

    expect(pos.count).toBe(8);
    expect(uvs.count).toBe(8);
    expect(normals.count).toBe(8);
    expect(index?.count).toBe(12); // 4 triangles * 3 indices = 12
  });

  it('creates a 4-vertex, 2-triangle geometry for single planes', () => {
    const geo = createSinglePlaneGeometry(0.12, 0.10);
    const pos = geo.getAttribute('position');
    const uvs = geo.getAttribute('uv');
    const normals = geo.getAttribute('normal');
    const index = geo.getIndex();

    expect(pos.count).toBe(4);
    expect(uvs.count).toBe(4);
    expect(normals.count).toBe(4);
    expect(index?.count).toBe(6); // 2 triangles * 3 indices = 6
  });

  it('anchors the base exactly at y = 0 and height at y = H', () => {
    const geo = createCrossQuadGeometry(1.5, 2.5);
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    expect(box).toBeDefined();
    if (box) {
      expect(box.min.y).toBeCloseTo(0.0, 4);
      expect(box.max.y).toBeCloseTo(2.5, 4);
      expect(box.min.x).toBeCloseTo(-0.75, 4);
      expect(box.max.x).toBeCloseTo(0.75, 4);
      expect(box.min.z).toBeCloseTo(-0.75, 4);
      expect(box.max.z).toBeCloseTo(0.75, 4);
    }
  });

  it('uses geometry memoization for identical dimensions', () => {
    const geo1 = createCrossQuadGeometry(1.2, 1.8);
    const geo2 = createCrossQuadGeometry(1.2, 1.8);
    expect(geo1).toBe(geo2);

    const geo3 = createCrossQuadGeometry(1.5, 2.0);
    expect(geo1).not.toBe(geo3);

    const single1 = createSinglePlaneGeometry(0.1, 0.1);
    const single2 = createSinglePlaneGeometry(0.1, 0.1);
    expect(single1).toBe(single2);
  });
});


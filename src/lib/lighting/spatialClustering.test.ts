import { describe, it, expect } from 'vitest';
import {
  computeSpatialClusters,
  DIYA_LIGHT_ELEVATION,
  DIYA_POINT_LIGHT_BASE_INTENSITY,
  DIYA_POINT_LIGHT_DECAY,
} from './spatialClustering';
import { PlacedLight } from './lightingTypes';

function makeDiya(id: string, x: number, y: number, z: number): PlacedLight {
  return {
    id,
    type: 'diya_clay_01',
    category: 'diyas_clay',
    position: [x, y, z],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    createdAt: Date.now(),
  };
}

describe('Diya Spatial Clustering Solver', () => {
  it('returns empty array when no diyas exist', () => {
    expect(computeSpatialClusters([])).toEqual([]);
    expect(computeSpatialClusters([], 16)).toEqual([]);
  });

  it('allocates 1:1 point lights when diya count <= maxClusters with elevation offset', () => {
    const diyas: PlacedLight[] = [
      makeDiya('d1', 1.0, 0.5, 2.0),
      makeDiya('d2', -1.5, 0.8, -3.0),
      makeDiya('d3', 0.0, 1.2, 0.0),
    ];

    const clusters = computeSpatialClusters(diyas, 16);
    expect(clusters.length).toBe(3);

    // Verify elevation offset is applied to prevent ground surface light singularity
    expect(clusters[0].x).toBeCloseTo(1.0);
    expect(clusters[0].y).toBeCloseTo(0.5 + DIYA_LIGHT_ELEVATION);
    expect(clusters[0].z).toBeCloseTo(2.0);
    expect(clusters[0].count).toBe(1);

    expect(clusters[1].x).toBeCloseTo(-1.5);
    expect(clusters[1].y).toBeCloseTo(0.8 + DIYA_LIGHT_ELEVATION);
    expect(clusters[1].z).toBeCloseTo(-3.0);
    expect(clusters[1].count).toBe(1);
  });

  it('caps clusters strictly at maxClusters (16) when diya count exceeds limit', () => {
    // Generate 40 diyas spread across a 10x10 fort diorama
    const diyas: PlacedLight[] = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 3.0 + (i % 3) * 0.5;
      diyas.push(
        makeDiya(
          `diya_${String(i).padStart(3, '0')}`,
          Math.cos(angle) * radius,
          0.4 + (i % 4) * 0.2,
          Math.sin(angle) * radius
        )
      );
    }

    const clusters = computeSpatialClusters(diyas, 16);
    expect(clusters.length).toBeLessThanOrEqual(16);
    expect(clusters.length).toBe(16);

    // Total count across all clusters should equal total diyas (40)
    const totalDiyasCovered = clusters.reduce((acc, c) => acc + c.count, 0);
    expect(totalDiyasCovered).toBe(40);

    // Every cluster must have elevated y coordinate to prevent ground blowout
    for (const c of clusters) {
      expect(c.y).toBeGreaterThanOrEqual(0.4 + DIYA_LIGHT_ELEVATION);
      expect(c.radius).toBeGreaterThanOrEqual(3.0);
    }
  });

  it('is strictly deterministic: identical clusters regardless of array permutation', () => {
    const diyas: PlacedLight[] = [];
    for (let i = 0; i < 30; i++) {
      diyas.push(
        makeDiya(
          `diya_${String(i).padStart(2, '0')}`,
          (i * 1.7) % 7 - 3.5,
          (i * 0.3) % 2,
          (i * 2.3) % 7 - 3.5
        )
      );
    }

    const clustersA = computeSpatialClusters(diyas, 16);

    // Reverse and shuffle array order
    const shuffled = [...diyas].reverse();
    const clustersB = computeSpatialClusters(shuffled, 16);

    expect(clustersA.length).toBe(clustersB.length);
    for (let i = 0; i < clustersA.length; i++) {
      expect(clustersA[i].x).toBeCloseTo(clustersB[i].x, 3);
      expect(clustersA[i].y).toBeCloseTo(clustersB[i].y, 3);
      expect(clustersA[i].z).toBeCloseTo(clustersB[i].z, 3);
      expect(clustersA[i].count).toBe(clustersB[i].count);
      expect(clustersA[i].radius).toBeCloseTo(clustersB[i].radius, 3);
    }
  });

  it('guarantees calibrated physical parameters to eliminate white-hot bleaching', () => {
    expect(DIYA_LIGHT_ELEVATION).toBeGreaterThanOrEqual(0.25);
    expect(DIYA_POINT_LIGHT_DECAY).toBeLessThan(1.5);
    expect(DIYA_POINT_LIGHT_BASE_INTENSITY).toBeLessThan(0.75);
  });
});

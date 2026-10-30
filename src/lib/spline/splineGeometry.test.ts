import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  generateSplinePointsAlongTerrain,
  generateStoneStepsGeometry,
  generateFlagInstanceData,
  generateDiyaInstanceData,
} from './splineGeometry';
import {
  TERRAIN_RESOLUTION,
  STATE_CHANNELS,
  TERRAIN_SIZE,
  HALF_TERRAIN_SIZE,
} from '../terrain/terrainBuffer';

// Helper to create a mock terrain buffer with a simple slope
function createMockTerrainBuffer(slopeGradient = 0.5): Float32Array {
  const buffer = new Float32Array(TERRAIN_RESOLUTION * TERRAIN_RESOLUTION * STATE_CHANNELS);
  for (let z = 0; z < TERRAIN_RESOLUTION; z++) {
    for (let x = 0; x < TERRAIN_RESOLUTION; x++) {
      const worldZ = (z / (TERRAIN_RESOLUTION - 1)) * TERRAIN_SIZE - HALF_TERRAIN_SIZE;
      const idx = (z * TERRAIN_RESOLUTION + x) * STATE_CHANNELS;
      // Elevation increases along Z
      buffer[idx + 0] = Math.max(0, (worldZ + HALF_TERRAIN_SIZE) * slopeGradient);
    }
  }
  return buffer;
}

describe('splineGeometry', () => {
  describe('generateSplinePointsAlongTerrain', () => {
    it('returns empty array or single point unchanged', () => {
      expect(generateSplinePointsAlongTerrain([])).toEqual([]);
      const single: [number, number, number][] = [[0, 1, 0]];
      expect(generateSplinePointsAlongTerrain(single)).toEqual(single);
    });

    it('samples smooth intermediate points between control points', () => {
      const points: [number, number, number][] = [
        [0, 0, 0],
        [1, 0.5, 1],
        [2, 1.0, 2],
      ];
      const sampled = generateSplinePointsAlongTerrain(points, undefined, 0.5, 5);
      expect(sampled.length).toBeGreaterThan(points.length);
      // Start and end points match roughly the boundary
      expect(sampled[0][0]).toBeCloseTo(0, 1);
      expect(sampled[sampled.length - 1][0]).toBeCloseTo(2, 1);
    });

    it('conforms sampled heights to the terrain buffer when provided', () => {
      const buffer = createMockTerrainBuffer(0.5);
      const points: [number, number, number][] = [
        [0, 0, -2],
        [0, 0, 2],
      ];
      const sampled = generateSplinePointsAlongTerrain(points, buffer, 0.5, 10);
      expect(sampled.length).toBeGreaterThan(10);
      // Intermediate points should have sampled terrain elevation > 0
      for (const pt of sampled) {
        expect(pt[1]).toBeGreaterThanOrEqual(0);
      }
    });

    it('preserves elevation when placed on top of fort walls higher than terrain', () => {
      const buffer = createMockTerrainBuffer(0.1);
      // Terrain height at x=0, z=0 is around 0.35m. Wall top is at 1.2m
      const points: [number, number, number][] = [
        [0, 1.2, -1],
        [0, 1.2, 1],
      ];
      const sampled = generateSplinePointsAlongTerrain(points, buffer, 0.5, 5);
      for (const pt of sampled) {
        expect(pt[1]).toBeGreaterThanOrEqual(1.0);
      }
    });
  });

  describe('generateStoneStepsGeometry', () => {
    it('returns an empty geometry for < 2 points', () => {
      const geo = generateStoneStepsGeometry([]);
      expect(geo.getAttribute('position')).toBeUndefined();
    });

    it('generates stepped box geometry along an ascending slope', () => {
      const points: [number, number, number][] = [
        [0, 0.2, 0],
        [0, 0.8, 2],
      ];
      const geo = generateStoneStepsGeometry(points, undefined, {
        stepWidth: 0.6,
        stepRun: 0.2,
        stepRise: 0.08,
      });

      const posAttr = geo.getAttribute('position');
      expect(posAttr).toBeDefined();
      expect(posAttr.count).toBeGreaterThan(0);
      // Must have normals and UVs for PBR texturing
      expect(geo.getAttribute('normal')).toBeDefined();
      expect(geo.getAttribute('uv')).toBeDefined();

      // Check bounds
      geo.computeBoundingBox();
      const bbox = geo.boundingBox!;
      expect(bbox.max.y).toBeGreaterThan(bbox.min.y);
      expect(bbox.max.z).toBeGreaterThan(bbox.min.z);
    });

    it('respects stepWidth and terrain height sampling', () => {
      const buffer = createMockTerrainBuffer(0.4);
      const points: [number, number, number][] = [
        [-1, 0, -1],
        [1, 0, 1],
      ];
      const geo = generateStoneStepsGeometry(points, buffer, {
        stepWidth: 0.8,
        stepRun: 0.25,
      });
      geo.computeBoundingBox();
      const size = new THREE.Vector3();
      geo.boundingBox!.getSize(size);
      expect(size.x).toBeGreaterThan(0);
      expect(size.z).toBeGreaterThan(0);
    });

    it('applies lateral stepOffset shifting stairs perpendicular to tangent', () => {
      const points: [number, number, number][] = [
        [0, 0, 0],
        [0, 0, 2],
      ];
      // Tangent is along +Z, perpendicular is along -X / +X
      const geoCenter = generateStoneStepsGeometry(points, undefined, {
        stepWidth: 0.10,
        stepOffset: 0.0,
      });
      const geoShifted = generateStoneStepsGeometry(points, undefined, {
        stepWidth: 0.10,
        stepOffset: 0.15,
      });

      geoCenter.computeBoundingBox();
      geoShifted.computeBoundingBox();

      const centerMidX = (geoCenter.boundingBox!.min.x + geoCenter.boundingBox!.max.x) / 2;
      const shiftedMidX = (geoShifted.boundingBox!.min.x + geoShifted.boundingBox!.max.x) / 2;

      expect(Math.abs(shiftedMidX - centerMidX)).toBeGreaterThan(0.05);

      geoCenter.dispose();
      geoShifted.dispose();
    });
  });

  describe('generateFlagInstanceData', () => {
    it('returns empty array when fewer than 2 points are given', () => {
      const instances = generateFlagInstanceData([]);
      expect(instances).toEqual([]);
    });

    it('arranges flag instances at uniform spacing along the curve', () => {
      const points: [number, number, number][] = [
        [0, 0, 0],
        [0, 0, 3],
      ];
      // Total distance is 3m. Spacing 1.0m should generate ~3-4 flags
      const instances = generateFlagInstanceData(points, undefined, { spacing: 1.0, scale: 1.0 });
      expect(instances.length).toBeGreaterThanOrEqual(3);
      for (const inst of instances) {
        expect(inst.position.length).toBe(3);
        expect(inst.rotation.length).toBe(3);
        expect(inst.scale.length).toBe(3);
        expect(inst.scale[0]).toBeCloseTo(1.0);
      }
    });
  });

  describe('generateDiyaInstanceData', () => {
    it('returns empty array when fewer than 2 points are given', () => {
      const instances = generateDiyaInstanceData([]);
      expect(instances).toEqual([]);
    });

    it('arranges festive diya instances along the path curve', () => {
      const points: [number, number, number][] = [
        [0, 0, 0],
        [2, 0, 0],
      ];
      // 2m path with spacing 0.4m should yield ~5 diyas
      const instances = generateDiyaInstanceData(points, undefined, { spacing: 0.4, scale: 1.2 });
      expect(instances.length).toBeGreaterThanOrEqual(4);
      for (const inst of instances) {
        expect(inst.position.length).toBe(3);
        expect(inst.scale[0]).toBeCloseTo(1.2);
      }
    });
  });
});


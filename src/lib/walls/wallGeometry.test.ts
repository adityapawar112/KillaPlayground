import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  sampleBilinearHeight,
  computeCornerAngle,
  detectBastionLocations,
  resampleWallPointsAlongTerrain,
  generateWallBufferGeometry,
  generateCitadelKeepGeometry,
  calculateMagneticSnap,
  calculateWallTotalLength,
} from './wallGeometry';
import { createStateBuffer, TERRAIN_SIZE, HALF_TERRAIN_SIZE } from '../terrain/terrainBuffer';
import { WallPath, DEFAULT_WALL_SETTINGS } from './wallTypes';

describe('Wall Geometry & Algorithmic Pipeline', () => {
  describe('sampleBilinearHeight', () => {
    it('samples height accurately from flat terrain buffer', () => {
      const buffer = createStateBuffer(1.25, 0.0);
      const hCenter = sampleBilinearHeight(buffer, 0, 0);
      expect(hCenter).toBeCloseTo(1.25, 3);

      const hEdge = sampleBilinearHeight(buffer, -3.5, 2.5);
      expect(hEdge).toBeCloseTo(1.25, 3);
    });

    it('interpolates smoothly between varying height values', () => {
      const buffer = createStateBuffer(0.0, 0.0);
      // Set center point to 2.0
      const centerIdx = (128 * 256 + 128) * 4;
      buffer[centerIdx + 0] = 2.0;

      const hAtCenter = sampleBilinearHeight(buffer, 0, 0);
      expect(hAtCenter).toBeCloseTo(0.5, 3);

      // Height should safely clamp and not throw when query is outside terrain boundary
      const hOut = sampleBilinearHeight(buffer, 100, 100);
      expect(Number.isFinite(hOut)).toBe(true);
    });
  });

  describe('computeCornerAngle', () => {
    it('returns near 0 degrees for collinear straight line', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 2, y: 0, z: 0 };
      const p3 = { x: 4, y: 0, z: 0 };
      const angle = computeCornerAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(0, 1);
    });

    it('returns ~90 degrees for perpendicular right-angle turn', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 2, y: 0, z: 0 };
      const p3 = { x: 2, y: 0, z: 2 };
      const angle = computeCornerAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('handles duplicate or overlapping points gracefully without NaN', () => {
      const p1 = { x: 1, y: 0, z: 1 };
      const p2 = { x: 1, y: 0, z: 1 };
      const p3 = { x: 2, y: 0, z: 1 };
      const angle = computeCornerAngle(p1, p2, p3);
      expect(Number.isFinite(angle)).toBe(true);
    });
  });

  describe('detectBastionLocations', () => {
    it('identifies sharp corner bastions (>35 deg) on a polygonal wall loop', () => {
      // 4 corners forming a rectangle (all 90 degrees)
      const points = [
        { x: -2, y: 0, z: -2 },
        { x: 2, y: 0, z: -2 },
        { x: 2, y: 0, z: 2 },
        { x: -2, y: 0, z: 2 },
      ];
      const bastions = detectBastionLocations(points, true, true);
      // For a closed loop rectangle, all 4 corners are 90 deg (>35 deg)
      expect(bastions.length).toBe(4);
    });

    it('identifies terminal bastions at start and end of open wall path', () => {
      const points = [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 4, y: 0, z: 0 },
      ];
      const bastions = detectBastionLocations(points, false, true);
      // Open straight path: start and end should have terminal watchtowers / bastions
      expect(bastions).toContain(0);
      expect(bastions).toContain(2);
      expect(bastions).not.toContain(1); // middle point is straight (0 deg)
    });

    it('includes user manual bastions even if angle is <35 deg', () => {
      const points = [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 4, y: 0, z: 0 },
      ];
      const bastions = detectBastionLocations(points, false, false, [1]);
      expect(bastions).toContain(1);
    });

    it('suppresses bastions when included in excludedIndices', () => {
      const points = [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 4, y: 0, z: 0 },
      ];
      // Node 0 is normally a terminal bastion on open wall, but excluded
      const bastions = detectBastionLocations(points, false, true, [], [0]);
      expect(bastions).not.toContain(0);
      expect(bastions).toContain(2);
    });
  });

  describe('resampleWallPointsAlongTerrain', () => {
    it('subdivides long segments and updates ground elevation', () => {
      const buffer = createStateBuffer(0.5, 0.0);
      const points = [
        { x: -2, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
      ];
      const resampled = resampleWallPointsAlongTerrain(points, buffer, 0.25);
      expect(resampled.length).toBeGreaterThan(10);
      // All resampled points should sample ground height 0.5 from buffer
      for (const p of resampled) {
        expect(p.y).toBeCloseTo(0.5, 2);
      }
    });
  });

  describe('calculateWallTotalLength', () => {
    it('computes cumulative path length accurately', () => {
      const points = [
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 0, z: 0 },
        { x: 3, y: 0, z: 4 },
      ];
      const lengthOpen = calculateWallTotalLength(points, false);
      expect(lengthOpen).toBeCloseTo(7.0, 2);

      const lengthClosed = calculateWallTotalLength(points, true);
      // Closed loop adds hypotenuse from (3, 0, 4) back to (0, 0, 0) = 5.0 -> total 12.0
      expect(lengthClosed).toBeCloseTo(12.0, 2);
    });
  });

  describe('generateWallBufferGeometry', () => {
    it('generates valid BufferGeometry with position, normal, and uv', () => {
      const buffer = createStateBuffer(0.2, 0.0);
      const wall: WallPath = {
        id: 'test_wall_1',
        points: [
          { x: -1, y: 0.2, z: -1 },
          { x: 1, y: 0.2, z: -1 },
          { x: 1, y: 0.2, z: 1 },
        ],
        isClosed: false,
        gates: [],
        settings: { ...DEFAULT_WALL_SETTINGS },
        createdAt: Date.now(),
      };

      const geo = generateWallBufferGeometry(wall, buffer);
      expect(geo).toBeInstanceOf(THREE.BufferGeometry);

      const pos = geo.getAttribute('position');
      const nor = geo.getAttribute('normal');
      const uvs = geo.getAttribute('uv');

      expect(pos).toBeDefined();
      expect(nor).toBeDefined();
      expect(uvs).toBeDefined();
      expect(pos.count).toBeGreaterThan(0);

      // Check for finite, non-NaN values
      for (let i = 0; i < pos.count; i++) {
        expect(Number.isFinite(pos.getX(i))).toBe(true);
        expect(Number.isFinite(pos.getY(i))).toBe(true);
        expect(Number.isFinite(pos.getZ(i))).toBe(true);
      }

      // Check bounding box validity
      geo.computeBoundingBox();
      expect(geo.boundingBox).not.toBeNull();
      expect(geo.boundingBox!.min.y).toBeLessThan(geo.boundingBox!.max.y);

      // Clean disposal
      geo.dispose();
    });

    it('scales UV coordinates proportionally when uvScale is modified', () => {
      const buffer = createStateBuffer(0.0, 0.0);
      const wallA: WallPath = {
        id: 'wall_uv_1',
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 4, y: 0, z: 0 },
        ],
        isClosed: false,
        gates: [],
        settings: { ...DEFAULT_WALL_SETTINGS, uvScale: 1.0, crenellations: false, autoBastions: false },
        createdAt: Date.now(),
      };

      const wallB: WallPath = {
        ...wallA,
        settings: { ...wallA.settings, uvScale: 2.5 },
      };

      const geoA = generateWallBufferGeometry(wallA, buffer);
      const geoB = generateWallBufferGeometry(wallB, buffer);

      const uvA = geoA.getAttribute('uv');
      const uvB = geoB.getAttribute('uv');

      // Maximum U coordinate in B should be 2.5x that of A
      let maxU_A = 0;
      let maxU_B = 0;
      for (let i = 0; i < uvA.count; i++) {
        maxU_A = Math.max(maxU_A, uvA.getX(i));
      }
      for (let i = 0; i < uvB.count; i++) {
        maxU_B = Math.max(maxU_B, uvB.getX(i));
      }

      expect(maxU_B / maxU_A).toBeCloseTo(2.5, 1);

      geoA.dispose();
      geoB.dispose();
    });

    it('generates crenellations on top parapet when crenellations is enabled', () => {
      const buffer = createStateBuffer(0.0, 0.0);
      const baseWall: WallPath = {
        id: 'wall_cren',
        points: [
          { x: -3, y: 0, z: 0 },
          { x: 3, y: 0, z: 0 },
        ],
        isClosed: false,
        gates: [],
        settings: { ...DEFAULT_WALL_SETTINGS, autoBastions: false, crenellations: false },
        createdAt: Date.now(),
      };

      const geoNoCren = generateWallBufferGeometry(baseWall, buffer);
      const geoWithCren = generateWallBufferGeometry(
        { ...baseWall, settings: { ...baseWall.settings, crenellations: true } },
        buffer
      );

      // Crenellated wall should produce extra triangles for the battlements
      expect(geoWithCren.getAttribute('position').count).toBeGreaterThan(
        geoNoCren.getAttribute('position').count
      );

      geoNoCren.dispose();
      geoWithCren.dispose();
    });

    it('generates arched gateway and gatehouse bastions when a gate is present', () => {
      const buffer = createStateBuffer(0.0, 0.0);
      const wallWithGate: WallPath = {
        id: 'wall_gate',
        points: [
          { x: -4, y: 0, z: 0 },
          { x: 4, y: 0, z: 0 },
        ],
        isClosed: false,
        gates: [
          {
            id: 'maha_darwaza_1',
            segmentIndex: 0,
            t: 0.5,
            width: 0.35,
            height: 0.28,
            hasGatehouse: true,
          },
        ],
        settings: { ...DEFAULT_WALL_SETTINGS, autoBastions: false, crenellations: false },
        createdAt: Date.now(),
      };

      const geoGate = generateWallBufferGeometry(wallWithGate, buffer);
      expect(geoGate.getAttribute('position').count).toBeGreaterThan(0);

      // Bounding box should enclose the gatehouse height at 10cm-100cm scale
      geoGate.computeBoundingBox();
      expect(geoGate.boundingBox!.max.y).toBeGreaterThanOrEqual(0.30);
      expect(geoGate.boundingBox!.max.y).toBeLessThanOrEqual(0.70);

      geoGate.dispose();
    });

    it('generates capped bastions with crowning pointed kangare', () => {
      const buffer = createStateBuffer(0.0, 0.0);
      const wallWithBastions: WallPath = {
        id: 'wall_bastion_test',
        points: [
          { x: -2, y: 0, z: 0 },
          { x: 0, y: 0, z: 2 },
          { x: 2, y: 0, z: 0 },
        ],
        isClosed: true,
        gates: [],
        manualBastionIndices: [1],
        settings: { ...DEFAULT_WALL_SETTINGS, autoBastions: true, crenellations: true },
        createdAt: Date.now(),
      };

      const geo = generateWallBufferGeometry(wallWithBastions, buffer);
      expect(geo.getAttribute('position').count).toBeGreaterThan(0);

      // Verify upward facing normal [0, 1, 0] exists on top floor cap of bastion
      const normals = geo.getAttribute('normal');
      let foundUpwardNormal = false;
      for (let i = 0; i < normals.count; i++) {
        if (normals.getY(i) > 0.95 && Math.abs(normals.getX(i)) < 0.05 && Math.abs(normals.getZ(i)) < 0.05) {
          foundUpwardNormal = true;
          break;
        }
      }
      expect(foundUpwardNormal).toBe(true);

      // Verify multi-material geometry groups exist (Group 0: wall masonry, Group 1: gravel floor, Group 2: dark stone)
      expect(geo.groups.length).toBeGreaterThanOrEqual(2);
      const groupMatIndices = geo.groups.map((g) => g.materialIndex);
      expect(groupMatIndices).toContain(0);
      expect(groupMatIndices).toContain(1);

      geo.dispose();
    });

    it('respects custom bastion overrides for radius and heightOffset', () => {
      const buffer = createStateBuffer(0.5, 0.0);
      const wallWithCustomBastion: WallPath = {
        id: 'wall_custom_bastion',
        points: [
          { x: 0, y: 0.5, z: 0 },
          { x: 3, y: 0.5, z: 0 },
        ],
        isClosed: false,
        gates: [],
        settings: { ...DEFAULT_WALL_SETTINGS, crenellations: true },
        customBastions: {
          0: { radius: 0.45, heightOffset: 0.20 },
        },
        createdAt: Date.now(),
      };

      const geo = generateWallBufferGeometry(wallWithCustomBastion, buffer);
      expect(geo.getAttribute('position').count).toBeGreaterThan(0);
      expect(geo.groups.length).toBeGreaterThan(0);
      geo.dispose();
    });

    it('generates valid BufferGeometry for Balekilla Citadel Keep', () => {
      const buffer = createStateBuffer(0.5, 0.0);
      const keep = {
        id: 'citadel_test',
        x: 0,
        y: 0.5,
        z: 0,
        scale: 1.0,
        rotationY: 0,
        height: 0.40,
        createdAt: Date.now(),
      };

      const geo = generateCitadelKeepGeometry(keep, buffer);
      expect(geo.getAttribute('position')).toBeDefined();
      expect(geo.getAttribute('normal')).toBeDefined();
      expect(geo.getAttribute('uv')).toBeDefined();
      expect(geo.getAttribute('position').count).toBeGreaterThan(50);
      expect(geo.getIndex()).toBeDefined();

      geo.dispose();
    });
  });

  describe('calculateMagneticSnap', () => {
    const buffer = createStateBuffer(0.0, 0.0);
    const mockWall: WallPath = {
      id: 'snap_test_wall',
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 2, y: 0, z: 2 },
      ],
      isClosed: false,
      gates: [],
      settings: { ...DEFAULT_WALL_SETTINGS },
      createdAt: Date.now(),
    };

    it('snaps buruj to nearest wall node within 0.45m', () => {
      // Near node 1 (2, 0, 0): pointer at (2.1, 0, 0.05) -> dist ~0.11m
      const snap = calculateMagneticSnap('buruj', { x: 2.1, y: 0, z: 0.05 }, [mockWall], 'snap_test_wall', buffer);
      expect(snap.snapped).toBe(true);
      expect(snap.type).toBe('vertex');
      expect(snap.nodeIndex).toBe(1);
      expect(snap.position[0]).toBe(2);
      expect(snap.position[2]).toBe(0);
    });

    it('does not snap buruj when pointer is beyond 0.45m', () => {
      // Far from any node: pointer at (5.0, 0, 5.0)
      const snap = calculateMagneticSnap('buruj', { x: 5.0, y: 0, z: 5.0 }, [mockWall], 'snap_test_wall', buffer);
      expect(snap.snapped).toBe(false);
      expect(snap.type).toBe('terrain');
      expect(snap.position[0]).toBe(5.0);
    });

    it('snaps gate to nearest wall segment within 0.60m', () => {
      // Near segment 0 between (0,0,0) and (2,0,0): pointer at (1.0, 0, 0.2)
      const snap = calculateMagneticSnap('gate', { x: 1.0, y: 0, z: 0.2 }, [mockWall], 'snap_test_wall', buffer);
      expect(snap.snapped).toBe(true);
      expect(snap.type).toBe('segment');
      expect(snap.segmentIndex).toBe(0);
      expect(snap.t).toBeCloseTo(0.5, 1);
      expect(snap.tangent).toBeDefined();
      expect(snap.normal).toBeDefined();
    });

    it('snaps citadel freely to terrain', () => {
      const snap = calculateMagneticSnap('citadel', { x: 1.5, y: 0, z: -1.2 }, [mockWall], null, buffer);
      expect(snap.snapped).toBe(true);
      expect(snap.type).toBe('terrain');
      expect(snap.position[0]).toBe(1.5);
      expect(snap.position[2]).toBe(-1.2);
    });
  });
});

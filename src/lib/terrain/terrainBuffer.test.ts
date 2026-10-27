import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createStateBuffer,
  createStateTexture,
  worldToGrid,
  gridToWorld,
  uvToGrid,
  gridToUv,
  getTexel,
  setTexel,
  createBaseTerrainGeometry,
  syncStateToGeometry,
  TERRAIN_RESOLUTION,
  VERTEX_COUNT,
  STATE_BUFFER_SIZE,
} from './terrainBuffer';

describe('Terrain Buffer & State Management', () => {
  it('creates state buffer with correct dimensions and initial values', () => {
    const buffer = createStateBuffer(0.5, 0.2);
    expect(buffer.length).toBe(STATE_BUFFER_SIZE);
    expect(buffer[0]).toBeCloseTo(0.5); // R: height
    expect(buffer[1]).toBeCloseTo(0.2); // G: wetness
    expect(buffer[2]).toBe(0.0); // B: locked
    expect(buffer[3]).toBe(0.0); // A: grass
  });

  it('creates DataTexture with correct format and properties', () => {
    const buffer = createStateBuffer();
    const texture = createStateTexture(buffer);
    expect(texture.image.width).toBe(TERRAIN_RESOLUTION);
    expect(texture.image.height).toBe(TERRAIN_RESOLUTION);
    expect(texture.format).toBe(THREE.RGBAFormat);
    expect(texture.type).toBe(THREE.FloatType);
    expect(texture.version).toBeGreaterThan(0);
  });

  it('converts world coordinates to grid coordinates and back', () => {
    // Center of world (0, 0) -> grid center (128, 128)
    const center = worldToGrid(0, 0);
    expect(center.ix).toBe(128);
    expect(center.iz).toBe(128);

    const worldCenter = gridToWorld(128, 128);
    expect(worldCenter.x).toBeCloseTo(0.0196, 2);
    expect(worldCenter.z).toBeCloseTo(0.0196, 2);

    // Corner (-5, -5) -> grid (0, 0)
    const nwCorner = worldToGrid(-5, -5);
    expect(nwCorner.ix).toBe(0);
    expect(nwCorner.iz).toBe(0);

    const nwWorld = gridToWorld(0, 0);
    expect(nwWorld.x).toBe(-5);
    expect(nwWorld.z).toBe(-5);

    // Corner (+5, +5) -> grid (255, 255)
    const seCorner = worldToGrid(5, 5);
    expect(seCorner.ix).toBe(255);
    expect(seCorner.iz).toBe(255);

    const seWorld = gridToWorld(255, 255);
    expect(seWorld.x).toBe(5);
    expect(seWorld.z).toBe(5);
  });

  it('correctly reads and mutates state texels', () => {
    const buffer = createStateBuffer();
    setTexel(buffer, 50, 60, {
      height: 1.75,
      wetness: 0.8,
      locked: 1.0,
      grass: 0.5,
    });

    const texel = getTexel(buffer, 50, 60);
    expect(texel.height).toBeCloseTo(1.75);
    expect(texel.wetness).toBeCloseTo(0.8);
    expect(texel.locked).toBe(1.0);
    expect(texel.grass).toBeCloseTo(0.5);

    // Unmodified texel should remain 0
    const other = getTexel(buffer, 0, 0);
    expect(other.height).toBe(0.0);
    expect(other.wetness).toBe(0.0);
  });

  it('initializes horizontal PlaneGeometry with 65,536 vertices and syncs state', () => {
    const geo = createBaseTerrainGeometry();
    expect(geo.attributes.position.count).toBe(VERTEX_COUNT);
    expect(geo.attributes.uv.count).toBe(VERTEX_COUNT);

    const buffer = createStateBuffer();
    setTexel(buffer, 10, 10, { height: 2.2 });

    syncStateToGeometry(buffer, geo, { minX: 10, maxX: 10, minZ: 10, maxZ: 10 });

    const vIdx = 10 * TERRAIN_RESOLUTION + 10;
    const posY = geo.attributes.position.getY(vIdx);
    expect(posY).toBeCloseTo(2.2);
  });

  it('guarantees BVH accelerated raycasting under 0.2ms per raycast', async () => {
    const { computeBoundsTree, acceleratedRaycast } = await import('three-mesh-bvh');
    const geo = createBaseTerrainGeometry();
    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    THREE.Mesh.prototype.raycast = acceleratedRaycast;

    geo.computeBoundsTree();
    const mesh = new THREE.Mesh(geo);

    const raycaster = new THREE.Raycaster();
    raycaster.firstHitOnly = true;

    // Warm-up
    raycaster.set(new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, -1, 0));
    mesh.raycast(raycaster, []);

    // Perform 200 raycasts across different points on the terrain
    const start = performance.now();
    const rayCount = 200;
    for (let i = 0; i < rayCount; i++) {
      const rx = (Math.random() - 0.5) * 8.0;
      const rz = (Math.random() - 0.5) * 8.0;
      raycaster.set(new THREE.Vector3(rx, 10, rz), new THREE.Vector3(0, -1, 0));
      const intersects: THREE.Intersection[] = [];
      mesh.raycast(raycaster, intersects);
      expect(intersects.length).toBeGreaterThan(0);
    }
    const totalTimeMs = performance.now() - start;
    const avgTimePerRaycast = totalTimeMs / rayCount;

    // Assert that average raycast time is strictly under 0.2ms
    expect(avgTimePerRaycast).toBeLessThan(0.2);
  });

  it('generates 3D fort elevation profiles for scratch, raigad, sinhagad, and janjira', async () => {
    const { generateTerrainBlueprint } = await import('./terrainGenerators');

    // Scratch: produces hill peak > 0.8m and tapered edges ~ 0m
    const scratchBuffer = createStateBuffer();
    generateTerrainBlueprint('scratch', scratchBuffer);
    const centerTexel = getTexel(scratchBuffer, 128, 128);
    const edgeTexel = getTexel(scratchBuffer, 5, 5);
    expect(centerTexel.height).toBeGreaterThan(0.8);
    expect(edgeTexel.height).toBeLessThan(0.15);

    // Raigad: high plateau > 1.5m
    const raigadBuffer = createStateBuffer();
    generateTerrainBlueprint('raigad', raigadBuffer);
    const raigadCenter = getTexel(raigadBuffer, 138, 133);
    expect(raigadCenter.height).toBeGreaterThan(1.5);

    // Sinhagad: rugged mountain ridge
    const sinhagadBuffer = createStateBuffer();
    generateTerrainBlueprint('sinhagad', sinhagadBuffer);
    let maxH = 0;
    for (let i = 0; i < sinhagadBuffer.length; i += 4) {
      if (sinhagadBuffer[i] > maxH) maxH = sinhagadBuffer[i];
    }
    expect(maxH).toBeGreaterThan(1.6);

    // Janjira: coastal water moat with high wetness and central island
    const janjiraBuffer = createStateBuffer();
    generateTerrainBlueprint('janjira', janjiraBuffer);
    const janjiraCenter = getTexel(janjiraBuffer, 128, 128);
    const janjiraMoat = getTexel(janjiraBuffer, 220, 220);
    expect(janjiraCenter.height).toBeGreaterThan(0.7);
    expect(janjiraMoat.wetness).toBeGreaterThan(0.8);
  });
});

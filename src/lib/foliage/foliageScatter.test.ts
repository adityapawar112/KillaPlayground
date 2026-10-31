import { describe, it, expect } from 'vitest';
import {
  generateScatterCandidates,
  eraseFoliageInRadius,
  FoliageSpatialGrid,
} from './foliageScatter';
import { FoliageInstance } from './foliageTypes';

describe('Foliage Scatter & Spatial Pruning Algorithms', () => {
  it('generates candidates strictly within the specified brush radius', () => {
    const radius = 2.0;
    const candidates = generateScatterCandidates({
      centerX: 1.0,
      centerZ: 1.0,
      typeId: 'berry_scrub_bush',
      spacing: 0.2,
      options: {
        operation: 'scatter',
        radius,
        density: 10,
        scaleJitter: 0.2,
        normalAlign: 0.1,
      },
      existingInstances: [],
      getHeightAt: () => 0.5,
      getNormalAt: () => [0, 1, 0],
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.length).toBeLessThanOrEqual(10);

    for (const cand of candidates) {
      const dx = cand.position[0] - 1.0;
      const dz = cand.position[2] - 1.0;
      const dist = Math.sqrt(dx * dx + dz * dz);
      expect(dist).toBeLessThanOrEqual(radius + 0.001);
      expect(cand.position[1]).toBe(0.5);
    }
  });

  it('scatters across multiple selected species when typeIds are provided', () => {
    const selectedSpecies = ['banyan_broad_canopy', 'berry_scrub_bush', 'karvand_mountain_scrub'];
    const candidates = generateScatterCandidates({
      centerX: 0,
      centerZ: 0,
      typeIds: selectedSpecies,
      spacing: 0.1,
      options: {
        operation: 'scatter',
        radius: 2.0,
        density: 20,
        scaleJitter: 0.1,
        normalAlign: 0,
      },
      existingInstances: [],
      getHeightAt: () => 0,
      getNormalAt: () => [0, 1, 0],
    });

    expect(candidates.length).toBeGreaterThan(0);
    const usedTypes = new Set(candidates.map((c) => c.typeId));
    for (const t of usedTypes) {
      expect(selectedSpecies).toContain(t);
    }
    // With 20 candidates, multiple species from selected pool should be represented
    expect(usedTypes.size).toBeGreaterThan(1);
  });

  it('enforces Poisson-disk minimum distance between placed instances', () => {
    const spacing = 0.5;
    const candidates = generateScatterCandidates({
      centerX: 0,
      centerZ: 0,
      typeId: 'banyan_broad_canopy',
      spacing,
      options: {
        operation: 'scatter',
        radius: 1.5,
        density: 15,
        scaleJitter: 0.1,
        normalAlign: 0,
      },
      existingInstances: [],
      getHeightAt: () => 0,
      getNormalAt: () => [0, 1, 0],
    });

    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const dx = candidates[i].position[0] - candidates[j].position[0];
        const dz = candidates[i].position[2] - candidates[j].position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        expect(dist).toBeGreaterThanOrEqual(spacing - 0.001);
      }
    }
  });

  it('prunes/erases instances within the specified radius', () => {
    const mockInstances: FoliageInstance[] = [
      { id: '1', typeId: 'bush', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      { id: '2', typeId: 'bush', position: [0.5, 0, 0.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
      { id: '3', typeId: 'bush', position: [3.0, 0, 3.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    ];

    const { remaining, erased } = eraseFoliageInRadius(0, 0, 1.0, mockInstances);
    expect(erased.map((e) => e.id)).toEqual(['1', '2']);
    expect(remaining.map((r) => r.id)).toEqual(['3']);
  });

  it('detects proximity correctly using FoliageSpatialGrid', () => {
    const grid = new FoliageSpatialGrid(0.5);
    grid.insert({
      id: 'test',
      typeId: 'tree',
      position: [1.0, 0, 1.0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });

    expect(grid.isTooClose(1.1, 1.1, 0.3)).toBe(true);
    expect(grid.isTooClose(2.5, 2.5, 0.5)).toBe(false);
  });
});

import * as THREE from 'three';
import { FoliageInstance, FoliageBrushOptions } from './foliageTypes';

export interface ScatterContext {
  centerX: number;
  centerZ: number;
  typeId?: string;
  typeIds?: string[];
  spacing: number;
  options: FoliageBrushOptions;
  existingInstances: FoliageInstance[];
  getHeightAt: (x: number, z: number) => number;
  getNormalAt: (x: number, z: number) => [number, number, number];
  randomFn?: () => number;
}

/**
 * Spatial Grid for O(1) proximity lookups during scattering and erasing.
 */
export class FoliageSpatialGrid {
  private cellSize: number;
  private grid: Map<string, FoliageInstance[]> = new Map();

  constructor(cellSize = 1.0) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx}:${cz}`;
  }

  public insert(instance: FoliageInstance): void {
    const key = this.getKey(instance.position[0], instance.position[2]);
    let list = this.grid.get(key);
    if (!list) {
      list = [];
      this.grid.set(key, list);
    }
    list.push(instance);
  }

  public build(instances: FoliageInstance[]): void {
    this.grid.clear();
    for (const inst of instances) {
      this.insert(inst);
    }
  }

  public isTooClose(x: number, z: number, minDistance: number): boolean {
    const minSq = minDistance * minDistance;
    const cx = Math.floor(x / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    const neighborRadius = Math.ceil(minDistance / this.cellSize);

    for (let dx = -neighborRadius; dx <= neighborRadius; dx++) {
      for (let dz = -neighborRadius; dz <= neighborRadius; dz++) {
        const key = `${cx + dx}:${cz + dz}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (const item of cell) {
            const distSq =
              (item.position[0] - x) * (item.position[0] - x) +
              (item.position[2] - z) * (item.position[2] - z);
            if (distSq < minSq) return true;
          }
        }
      }
    }
    return false;
  }
}

/**
 * Generates candidate scattered foliage instances within brush radius using Poisson-disk thinning.
 */
export function generateScatterCandidates(ctx: ScatterContext): FoliageInstance[] {
  const {
    centerX,
    centerZ,
    typeId,
    typeIds,
    spacing,
    options,
    existingInstances,
    getHeightAt,
    getNormalAt,
    randomFn = Math.random,
  } = ctx;

  const candidates: FoliageInstance[] = [];
  const grid = new FoliageSpatialGrid(Math.max(0.05, spacing));

  // Populate grid with existing instances near brush area
  const searchRadius = options.radius + spacing;
  const searchRadiusSq = searchRadius * searchRadius;
  for (const inst of existingInstances) {
    const dSq =
      (inst.position[0] - centerX) * (inst.position[0] - centerX) +
      (inst.position[2] - centerZ) * (inst.position[2] - centerZ);
    if (dSq <= searchRadiusSq) {
      grid.insert(inst);
    }
  }

  const sampleCount = Math.max(1, Math.round(options.density));
  const maxAttempts = sampleCount * 4;
  let placedCount = 0;

  for (let attempt = 0; attempt < maxAttempts && placedCount < sampleCount; attempt++) {
    // Uniform random sampling within circular brush disk
    const r = options.radius * Math.sqrt(randomFn());
    const theta = randomFn() * Math.PI * 2;
    const candX = centerX + r * Math.cos(theta);
    const candZ = centerZ + r * Math.sin(theta);

    // Limit to diorama base dimensions [-7, 7]
    if (candX < -7.0 || candX > 7.0 || candZ < -7.0 || candZ > 7.0) {
      continue;
    }

    // Minimum distance / Poisson disk separation check
    if (grid.isTooClose(candX, candZ, spacing)) {
      continue;
    }

    const norm = getNormalAt(candX, candZ);
    // Slope limit: don't place vertical trees on extreme cliff faces (> 65 degrees) unless intended
    const slopeLimit = options.slopeLimit ?? 0.35;
    if (norm[1] < slopeLimit) {
      continue;
    }

    const candY = getHeightAt(candX, candZ);

    // Scale Jitter: (1 - jitter) to (1 + jitter)
    const jitterFactor = 1.0 + (randomFn() * 2 - 1) * options.scaleJitter;
    const finalScale: [number, number, number] = [jitterFactor, jitterFactor, jitterFactor];

    // Rotation: Random Y-rotation (0 to 2PI)
    const randomYaw = randomFn() * Math.PI * 2;

    // Normal alignment blending: blend upright Y-axis with terrain surface normal
    const quat = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const surfaceNorm = new THREE.Vector3(norm[0], norm[1], norm[2]).normalize();
    const blendedUp = up.clone().lerp(surfaceNorm, options.normalAlign).normalize();

    const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, blendedUp);
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomYaw);
    quat.multiplyQuaternions(alignQuat, yawQuat);

    const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');
    const rot: [number, number, number] = [euler.x, euler.y, euler.z];

    const assignedTypeId =
      typeIds && typeIds.length > 0
        ? typeIds[Math.floor(randomFn() * typeIds.length)]
        : (typeId || 'banyan_broad_canopy');

    const instance: FoliageInstance = {
      id: `foliage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      typeId: assignedTypeId,
      position: [candX, candY, candZ],
      rotation: rot,
      scale: finalScale,
    };

    candidates.push(instance);
    grid.insert(instance);
    placedCount++;
  }

  return candidates;
}

/**
 * Erases foliage instances within brush radius of (centerX, centerZ).
 */
export function eraseFoliageInRadius(
  centerX: number,
  centerZ: number,
  radius: number,
  instances: FoliageInstance[]
): { remaining: FoliageInstance[]; erased: FoliageInstance[] } {
  const radiusSq = radius * radius;
  const remaining: FoliageInstance[] = [];
  const erased: FoliageInstance[] = [];

  for (const inst of instances) {
    const distSq =
      (inst.position[0] - centerX) * (inst.position[0] - centerX) +
      (inst.position[2] - centerZ) * (inst.position[2] - centerZ);

    if (distSq <= radiusSq) {
      erased.push(inst);
    } else {
      remaining.push(inst);
    }
  }

  return { remaining, erased };
}


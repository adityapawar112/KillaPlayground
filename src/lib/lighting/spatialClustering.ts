import { PlacedLight } from './lightingTypes';

export interface DiyaSpatialCluster {
  x: number;
  y: number;
  z: number;
  count: number;
  radius: number;
}

/**
 * Height offset (in world units/meters) above terrain/bastion surface for cluster point lights.
 * Elevating the light (28 cm) eliminates surface singularity blowout (no white-hot ground bleached spots).
 */
export const DIYA_LIGHT_ELEVATION = 0.28;

/**
 * Base omnidirectional point light intensity and decay settings.
 * Calibrated for soft, warm ambient diya glow across stone and earth without blowout.
 */
export const DIYA_POINT_LIGHT_BASE_INTENSITY = 0.52;
export const DIYA_POINT_LIGHT_DECAY = 1.2;
export const DIYA_POINT_LIGHT_COLOR = '#FFA733';

/**
 * Computes deterministic, evenly distributed spatial clusters for 3D omnidirectional point lights.
 * Uses furthest-point sampling (K-Means++ initialization) followed by K-Means centroid convergence.
 * Invariant to selection, hover, or element order.
 */
export function computeSpatialClusters(
  diyas: PlacedLight[],
  maxClusters: number = 16
): DiyaSpatialCluster[] {
  if (diyas.length === 0 || maxClusters <= 0) return [];

  // When diya count is within budget, allocate 1:1 point lights
  if (diyas.length <= maxClusters) {
    return diyas.map((d) => ({
      x: d.position[0],
      y: d.position[1] + DIYA_LIGHT_ELEVATION,
      z: d.position[2],
      count: 1,
      radius: 3.5 * (d.scale[0] || 1.0),
    }));
  }

  // Sort stably by ID so clustering results are 100% deterministic regardless of input array order
  const sorted = [...diyas].sort((a, b) => a.id.localeCompare(b.id));

  // 1. Furthest-Point Sampling (Greedy K-Center) for spatially uniform initial cluster seeds
  const seedIndices: number[] = [0];
  const minDistSq = new Float32Array(sorted.length).fill(Infinity);

  for (let s = 1; s < maxClusters; s++) {
    const lastSeed = sorted[seedIndices[s - 1]];
    let bestIdx = 0;
    let maxDist = -1;

    for (let i = 0; i < sorted.length; i++) {
      const dx = sorted[i].position[0] - lastSeed.position[0];
      const dy = sorted[i].position[1] - lastSeed.position[1];
      const dz = sorted[i].position[2] - lastSeed.position[2];
      const dSq = dx * dx + dy * dy + dz * dz;

      if (dSq < minDistSq[i]) {
        minDistSq[i] = dSq;
      }

      if (minDistSq[i] > maxDist) {
        maxDist = minDistSq[i];
        bestIdx = i;
      }
    }

    seedIndices.push(bestIdx);
  }

  // Initialize centroids from seeds
  const centroids: { x: number; y: number; z: number; count: number; sumDist: number }[] =
    seedIndices.map((idx) => ({
      x: sorted[idx].position[0],
      y: sorted[idx].position[1],
      z: sorted[idx].position[2],
      count: 0,
      sumDist: 0,
    }));

  // 2. Three iterations of K-Means in 3D world coordinates (< 0.05ms)
  for (let iter = 0; iter < 3; iter++) {
    const sums = centroids.map(() => ({ x: 0, y: 0, z: 0, count: 0, sumDist: 0 }));

    for (const d of sorted) {
      let bestDistSq = Infinity;
      let bestIdx = 0;

      for (let c = 0; c < centroids.length; c++) {
        const dx = d.position[0] - centroids[c].x;
        const dy = d.position[1] - centroids[c].y;
        const dz = d.position[2] - centroids[c].z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          bestIdx = c;
        }
      }

      sums[bestIdx].x += d.position[0];
      sums[bestIdx].y += d.position[1];
      sums[bestIdx].z += d.position[2];
      sums[bestIdx].count += 1;
      sums[bestIdx].sumDist += Math.sqrt(bestDistSq);
    }

    for (let c = 0; c < centroids.length; c++) {
      if (sums[c].count > 0) {
        centroids[c].x = sums[c].x / sums[c].count;
        centroids[c].y = sums[c].y / sums[c].count;
        centroids[c].z = sums[c].z / sums[c].count;
        centroids[c].count = sums[c].count;
        centroids[c].sumDist = sums[c].sumDist;
      }
    }
  }

  return centroids
    .filter((c) => c.count > 0)
    .map((c) => {
      const avgSpread = c.count > 1 ? c.sumDist / c.count : 0.4;
      return {
        x: c.x,
        y: c.y + DIYA_LIGHT_ELEVATION,
        z: c.z,
        count: c.count,
        radius: Math.max(3.2, Math.min(5.2, 2.6 + avgSpread * 1.4)),
      };
    });
}


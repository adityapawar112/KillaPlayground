import * as THREE from 'three';
import {
  TERRAIN_SIZE,
  HALF_TERRAIN_SIZE,
  TERRAIN_RESOLUTION,
  STATE_CHANNELS,
} from '../terrain/terrainBuffer';
import { WallPath, WallPoint, WallSettings, WallGate } from './wallTypes';

/**
 * Miniature diorama stone masonry scale factor.
 * Since fort walls are miniature (20mm to 100mm height),
 * coordinates are in [0.02..0.10]. Multiplying by 22.0 maps each
 * stone brick course to ~10mm x 5mm miniature scale blocks.
 */
export const BRICK_UV_MULTIPLIER = 22.0;

/**
 * Foundation sink into terrain to guarantee rock-solid grounding on steep terrain slopes.
 */
export const WALL_EMBED_DEPTH = 0.012; // 12mm

/**
 * Samples terrain height at arbitrary continuous world coordinates (worldX, worldZ)
 * using smooth bilinear interpolation over the state heightmap buffer.
 */
export function sampleBilinearHeight(
  buffer: Float32Array,
  worldX: number,
  worldZ: number
): number {
  const u = (worldX + HALF_TERRAIN_SIZE) / TERRAIN_SIZE;
  const v = (worldZ + HALF_TERRAIN_SIZE) / TERRAIN_SIZE;

  const gx = Math.max(0, Math.min(TERRAIN_RESOLUTION - 1, u * (TERRAIN_RESOLUTION - 1)));
  const gz = Math.max(0, Math.min(TERRAIN_RESOLUTION - 1, v * (TERRAIN_RESOLUTION - 1)));

  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);
  const x1 = Math.min(TERRAIN_RESOLUTION - 1, x0 + 1);
  const z1 = Math.min(TERRAIN_RESOLUTION - 1, z0 + 1);

  const fx = gx - x0;
  const fz = gz - z0;

  const idx00 = (z0 * TERRAIN_RESOLUTION + x0) * STATE_CHANNELS;
  const idx10 = (z0 * TERRAIN_RESOLUTION + x1) * STATE_CHANNELS;
  const idx01 = (z1 * TERRAIN_RESOLUTION + x0) * STATE_CHANNELS;
  const idx11 = (z1 * TERRAIN_RESOLUTION + x1) * STATE_CHANNELS;

  const h00 = buffer[idx00 + 0] ?? 0;
  const h10 = buffer[idx10 + 0] ?? 0;
  const h01 = buffer[idx01 + 0] ?? 0;
  const h11 = buffer[idx11 + 0] ?? 0;

  const hTop = h00 * (1 - fx) + h10 * fx;
  const hBottom = h01 * (1 - fx) + h11 * fx;

  return hTop * (1 - fz) + hBottom * fz;
}

/**
 * Calculates the corner deviation angle (in degrees) between three consecutive path points.
 * Returns 0 for a straight line, ~90 for a perpendicular turn, ~180 for a reversal.
 */
export function computeCornerAngle(
  p1: WallPoint,
  p2: WallPoint,
  p3: WallPoint
): number {
  const v1x = p2.x - p1.x;
  const v1z = p2.z - p1.z;
  const v2x = p3.x - p2.x;
  const v2z = p3.z - p2.z;

  const len1 = Math.hypot(v1x, v1z);
  const len2 = Math.hypot(v2x, v2z);

  if (len1 < 1e-5 || len2 < 1e-5) return 0;

  const dot = (v1x * v2x + v1z * v2z) / (len1 * len2);
  const clampedDot = Math.max(-1, Math.min(1, dot));

  return (Math.acos(clampedDot) * 180) / Math.PI;
}

/**
 * Detects vertices where round bastions (buruj) should be placed:
 * - Automatically at sharp corner angles (> 35 deg)
 * - At start and end nodes of open paths (terminal watchtowers)
 * - User-designated manual bastion nodes
 */
export function detectBastionLocations(
  points: WallPoint[],
  isClosed: boolean,
  autoBastions: boolean,
  manualIndices: number[] = []
): number[] {
  const bastions = new Set<number>(manualIndices);
  const count = points.length;
  if (count < 2) return Array.from(bastions);

  if (!isClosed) {
    bastions.add(0);
    bastions.add(count - 1);
  }

  if (autoBastions && count >= 3) {
    if (isClosed) {
      for (let i = 0; i < count; i++) {
        const pPrev = points[(i - 1 + count) % count];
        const pCurr = points[i];
        const pNext = points[(i + 1) % count];
        if (computeCornerAngle(pPrev, pCurr, pNext) > 35) {
          bastions.add(i);
        }
      }
    } else {
      for (let i = 1; i < count - 1; i++) {
        const pPrev = points[i - 1];
        const pCurr = points[i];
        const pNext = points[i + 1];
        if (computeCornerAngle(pPrev, pCurr, pNext) > 35) {
          bastions.add(i);
        }
      }
    }
  }

  return Array.from(bastions).sort((a, b) => a - b);
}

/**
 * Subdivides long wall segments into smaller intervals (<= stepSize)
 * and snaps every sub-point's ground elevation to the terrain heightmap.
 * For closed loops, seamlessly closes from points[count-1] to points[0].
 */
export function resampleWallPointsAlongTerrain(
  points: WallPoint[],
  buffer: Float32Array,
  isClosed = false,
  stepSize = 0.04
): WallPoint[] {
  if (points.length < 2) {
    return points.map((p) => ({
      x: p.x,
      y: sampleBilinearHeight(buffer, p.x, p.z),
      z: p.z,
    }));
  }

  const resampled: WallPoint[] = [];
  const segCount = isClosed && points.length >= 3 ? points.length : points.length - 1;

  for (let i = 0; i < segCount; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const dist = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(dist / stepSize));

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const x = p1.x + dx * t;
      const z = p1.z + dz * t;
      const y = sampleBilinearHeight(buffer, x, z);
      resampled.push({ x, y, z });
    }
  }

  // End point / closing point
  const endRef = isClosed && points.length >= 3 ? points[0] : points[points.length - 1];
  resampled.push({
    x: endRef.x,
    y: sampleBilinearHeight(buffer, endRef.x, endRef.z),
    z: endRef.z,
  });

  return resampled;
}

/**
 * Calculates total cumulative horizontal length of a wall path.
 */
export function calculateWallTotalLength(
  points: WallPoint[],
  isClosed: boolean
): number {
  if (points.length < 2) return 0;
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].z - points[i].z);
  }
  if (isClosed && points.length >= 3) {
    const last = points[points.length - 1];
    const first = points[0];
    len += Math.hypot(first.x - last.x, first.z - last.z);
  }
  return len;
}

/**
 * Procedural geometry builder helper class to accumulate vertices, normals, UVs, and indices.
 */
class GeometryBuilder {
  positions: number[] = [];
  normals: number[] = [];
  uvs: number[] = [];
  indices: number[] = [];
  private vertCount = 0;

  addVertex(x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, v: number): number {
    this.positions.push(x, y, z);
    this.normals.push(nx, ny, nz);
    this.uvs.push(u, v);
    return this.vertCount++;
  }

  addTriangle(
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    norm: [number, number, number],
    uv0: [number, number],
    uv1: [number, number],
    uv2: [number, number]
  ) {
    const i0 = this.addVertex(p0[0], p0[1], p0[2], norm[0], norm[1], norm[2], uv0[0], uv0[1]);
    const i1 = this.addVertex(p1[0], p1[1], p1[2], norm[0], norm[1], norm[2], uv1[0], uv1[1]);
    const i2 = this.addVertex(p2[0], p2[1], p2[2], norm[0], norm[1], norm[2], uv2[0], uv2[1]);
    this.indices.push(i0, i1, i2);
  }

  addQuad(
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    norm: [number, number, number],
    uv0: [number, number],
    uv1: [number, number],
    uv2: [number, number],
    uv3: [number, number]
  ) {
    const i0 = this.addVertex(p0[0], p0[1], p0[2], norm[0], norm[1], norm[2], uv0[0], uv0[1]);
    const i1 = this.addVertex(p1[0], p1[1], p1[2], norm[0], norm[1], norm[2], uv1[0], uv1[1]);
    const i2 = this.addVertex(p2[0], p2[1], p2[2], norm[0], norm[1], norm[2], uv2[0], uv2[1]);
    const i3 = this.addVertex(p3[0], p3[1], p3[2], norm[0], norm[1], norm[2], uv3[0], uv3[1]);

    this.indices.push(i0, i1, i2);
    this.indices.push(i0, i2, i3);
  }

  build(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));
    geo.setIndex(this.indices);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  }
}

/**
 * Builds the complete parametric fort wall BufferGeometry for a single WallPath.
 * Integrates:
 * - 10x Miniature diorama scale (wall height 20mm to 100mm)
 * - Grounding foundation embedding (12mm)
 * - Authentic Murud-Janjira arched/pointed kangare along ramparts & bastion tops
 * - Watertight arched Maha Darwaza with solid flanking bastions and capped tops
 * - Multiplied miniature brick UV scale for crisp stone masonry
 */
export function generateWallBufferGeometry(
  wall: WallPath,
  buffer: Float32Array
): THREE.BufferGeometry {
  const { points, isClosed, settings, gates = [], manualBastionIndices = [] } = wall;
  if (points.length < 2) {
    return new THREE.BufferGeometry();
  }

  const builder = new GeometryBuilder();
  const halfThick = settings.thickness * 0.5;
  const wallH = settings.height;
  const effectiveUvScale = settings.uvScale * BRICK_UV_MULTIPLIER;
  const embedDepth = WALL_EMBED_DEPTH;

  // 1. Resample centerline points along terrain heightmap
  const resampled = resampleWallPointsAlongTerrain(points, buffer, isClosed, 0.04);
  const n = resampled.length;
  if (n < 2) return builder.build();

  // 2. Compute 2D lateral normals and cumulative arc length along path
  const lateralNormals: { x: number; z: number }[] = [];
  const cumulativeDist: number[] = [0];

  for (let i = 0; i < n; i++) {
    let tx = 0;
    let tz = 0;

    if (i === 0) {
      if (isClosed) {
        tx = resampled[1].x - resampled[n - 2].x;
        tz = resampled[1].z - resampled[n - 2].z;
      } else {
        tx = resampled[1].x - resampled[0].x;
        tz = resampled[1].z - resampled[0].z;
      }
    } else if (i === n - 1) {
      if (isClosed) {
        tx = resampled[1].x - resampled[n - 2].x;
        tz = resampled[1].z - resampled[n - 2].z;
      } else {
        tx = resampled[n - 1].x - resampled[n - 2].x;
        tz = resampled[n - 1].z - resampled[n - 2].z;
      }
    } else {
      tx = resampled[i + 1].x - resampled[i - 1].x;
      tz = resampled[i + 1].z - resampled[i - 1].z;
    }

    const tLen = Math.hypot(tx, tz) || 1;
    // Perpendicular normal: (-tz, tx)
    lateralNormals.push({ x: -tz / tLen, z: tx / tLen });

    if (i > 0) {
      const segLen = Math.hypot(
        resampled[i].x - resampled[i - 1].x,
        resampled[i].z - resampled[i - 1].z
      );
      cumulativeDist.push(cumulativeDist[i - 1] + segLen);
    }
  }

  // 3. Process Gates (Maha Darwaza)
  interface ActiveGateData {
    gate: WallGate;
    centerDist: number;
    halfWidth: number;
    centerX: number;
    centerZ: number;
    groundY: number;
    normal: { x: number; z: number };
    tangent: { x: number; z: number };
  }

  const activeGates: ActiveGateData[] = [];
  const hasGates = gates.length > 0;

  if (hasGates) {
    for (const g of gates) {
      // Find segment on original points
      const origCount = isClosed && points.length >= 3 ? points.length : points.length - 1;
      const segIdx = Math.max(0, Math.min(origCount - 1, g.segmentIndex));
      const pA = points[segIdx];
      const pB = points[(segIdx + 1) % points.length];
      const t = Math.max(0.15, Math.min(0.85, g.t || 0.5));
      const gx = pA.x + (pB.x - pA.x) * t;
      const gz = pA.z + (pB.z - pA.z) * t;

      // Find closest index in resampled
      let closestIdx = 0;
      let closestD = Infinity;
      for (let k = 0; k < n; k++) {
        const d = Math.hypot(resampled[k].x - gx, resampled[k].z - gz);
        if (d < closestD) {
          closestD = d;
          closestIdx = k;
        }
      }

      const centerDist = cumulativeDist[closestIdx];
      // Gate width scaled appropriately to wall thickness (e.g. 2.2x thickness)
      const gateWidth = Math.max(0.04, Math.min(0.12, (g.width && g.width <= 0.2 ? g.width : settings.thickness * 2.2)));
      const halfWidth = gateWidth * 0.5;
      const norm = lateralNormals[closestIdx];
      const tan = { x: -norm.z, z: norm.x };

      activeGates.push({
        gate: g,
        centerDist,
        halfWidth,
        centerX: gx,
        centerZ: gz,
        groundY: sampleBilinearHeight(buffer, gx, gz),
        normal: norm,
        tangent: tan,
      });
    }
  }

  // 4. Build Main Wall Ribbon
  for (let i = 0; i < n - 1; i++) {
    const pA = resampled[i];
    const pB = resampled[i + 1];
    const distA = cumulativeDist[i];
    const distB = cumulativeDist[i + 1];

    // Check if segment is completely inside a gate opening
    let isInsideGate = false;
    for (const ag of activeGates) {
      if (distA >= ag.centerDist - ag.halfWidth && distB <= ag.centerDist + ag.halfWidth) {
        isInsideGate = true;
        break;
      }
    }
    if (isInsideGate) continue; // Skip to leave portal opening

    const nA = lateralNormals[i];
    const nB = lateralNormals[i + 1];

    const yBotA = pA.y - embedDepth;
    const yTopA = pA.y + wallH;
    const yBotB = pB.y - embedDepth;
    const yTopB = pB.y + wallH;

    const lbA: [number, number, number] = [pA.x - nA.x * halfThick, yBotA, pA.z - nA.z * halfThick];
    const ltA: [number, number, number] = [pA.x - nA.x * halfThick, yTopA, pA.z - nA.z * halfThick];
    const rbA: [number, number, number] = [pA.x + nA.x * halfThick, yBotA, pA.z + nA.z * halfThick];
    const rtA: [number, number, number] = [pA.x + nA.x * halfThick, yTopA, pA.z + nA.z * halfThick];

    const lbB: [number, number, number] = [pB.x - nB.x * halfThick, yBotB, pB.z - nB.z * halfThick];
    const ltB: [number, number, number] = [pB.x - nB.x * halfThick, yTopB, pB.z - nB.z * halfThick];
    const rbB: [number, number, number] = [pB.x + nB.x * halfThick, yBotB, pB.z + nB.z * halfThick];
    const rtB: [number, number, number] = [pB.x + nB.x * halfThick, yTopB, pB.z + nB.z * halfThick];

    const uA = distA * effectiveUvScale;
    const uB = distB * effectiveUvScale;
    const vBotA = yBotA * effectiveUvScale;
    const vTopA = yTopA * effectiveUvScale;
    const vBotB = yBotB * effectiveUvScale;
    const vTopB = yTopB * effectiveUvScale;

    // Face 1: Left Outer Wall Face (facing -N)
    const normLeft: [number, number, number] = [-(nA.x + nB.x) * 0.5, 0, -(nA.z + nB.z) * 0.5];
    builder.addQuad(
      lbA, lbB, ltB, ltA,
      normLeft,
      [uA, vBotA], [uB, vBotB], [uB, vTopB], [uA, vTopA]
    );

    // Face 2: Right Inner Wall Face (facing +N)
    const normRight: [number, number, number] = [(nA.x + nB.x) * 0.5, 0, (nA.z + nB.z) * 0.5];
    builder.addQuad(
      rbB, rbA, rtA, rtB,
      normRight,
      [uB, vBotB], [uA, vBotA], [uA, vTopA], [uB, vTopB]
    );

    // Face 3: Top Walkway Rampart (facing Up +Y)
    builder.addQuad(
      ltA, ltB, rtB, rtA,
      [0, 1, 0],
      [uA, 0], [uB, 0], [uB, settings.thickness * effectiveUvScale], [uA, settings.thickness * effectiveUvScale]
    );
  }

  // End Caps for open walls
  if (!isClosed && n >= 2) {
    const p0 = resampled[0];
    const n0 = lateralNormals[0];
    const yB0 = p0.y - embedDepth;
    const yT0 = p0.y + wallH;
    const lb0: [number, number, number] = [p0.x - n0.x * halfThick, yB0, p0.z - n0.z * halfThick];
    const lt0: [number, number, number] = [p0.x - n0.x * halfThick, yT0, p0.z - n0.z * halfThick];
    const rb0: [number, number, number] = [p0.x + n0.x * halfThick, yB0, p0.z + n0.z * halfThick];
    const rt0: [number, number, number] = [p0.x + n0.x * halfThick, yT0, p0.z + n0.z * halfThick];

    const d0x = -(resampled[1].x - p0.x);
    const d0z = -(resampled[1].z - p0.z);
    const d0Len = Math.hypot(d0x, d0z) || 1;
    builder.addQuad(
      rb0, lb0, lt0, rt0,
      [d0x / d0Len, 0, d0z / d0Len],
      [0, yB0 * effectiveUvScale], [settings.thickness * effectiveUvScale, yB0 * effectiveUvScale],
      [settings.thickness * effectiveUvScale, yT0 * effectiveUvScale], [0, yT0 * effectiveUvScale]
    );

    const pEnd = resampled[n - 1];
    const nEnd = lateralNormals[n - 1];
    const yBEnd = pEnd.y - embedDepth;
    const yTEnd = pEnd.y + wallH;
    const lbEnd: [number, number, number] = [pEnd.x - nEnd.x * halfThick, yBEnd, pEnd.z - nEnd.z * halfThick];
    const ltEnd: [number, number, number] = [pEnd.x - nEnd.x * halfThick, yTEnd, pEnd.z - nEnd.z * halfThick];
    const rbEnd: [number, number, number] = [pEnd.x + nEnd.x * halfThick, yBEnd, pEnd.z + nEnd.z * halfThick];
    const rtEnd: [number, number, number] = [pEnd.x + nEnd.x * halfThick, yTEnd, pEnd.z + nEnd.z * halfThick];

    const dEndx = pEnd.x - resampled[n - 2].x;
    const dEndz = pEnd.z - resampled[n - 2].z;
    const dEndLen = Math.hypot(dEndx, dEndz) || 1;
    builder.addQuad(
      lbEnd, rbEnd, rtEnd, ltEnd,
      [dEndx / dEndLen, 0, dEndz / dEndLen],
      [0, yBEnd * effectiveUvScale], [settings.thickness * effectiveUvScale, yBEnd * effectiveUvScale],
      [settings.thickness * effectiveUvScale, yTEnd * effectiveUvScale], [0, yTEnd * effectiveUvScale]
    );
  }

  // 5. Authentic Murud-Janjira Pointed Arch Crenellations (Kangare)
  // Helper to add a single authentic pointed/ogival kangara
  const addPointedKangara = (
    cLeft: [number, number, number],
    cRight: [number, number, number],
    norm: [number, number, number],
    baseY: number,
    kHeight: number,
    kThick: number
  ) => {
    const hShoulder = kHeight * 0.62;
    const hPeak = kHeight;

    // Midpoint on outer rim
    const cMidX = (cLeft[0] + cRight[0]) * 0.5;
    const cMidZ = (cLeft[2] + cRight[2]) * 0.5;

    // 5 Outer Vertices: V0(left bot), V1(right bot), V2(right shoulder), V3(peak center), V4(left shoulder)
    const v0: [number, number, number] = [cLeft[0], baseY, cLeft[2]];
    const v1: [number, number, number] = [cRight[0], baseY, cRight[2]];
    const v2: [number, number, number] = [cRight[0], baseY + hShoulder, cRight[2]];
    const v3: [number, number, number] = [cMidX, baseY + hPeak, cMidZ];
    const v4: [number, number, number] = [cLeft[0], baseY + hShoulder, cLeft[2]];

    // 5 Inner Vertices (offset by inward normal)
    const inX = norm[0] * kThick;
    const inZ = norm[2] * kThick;
    const iv0: [number, number, number] = [v0[0] + inX, baseY, v0[2] + inZ];
    const iv1: [number, number, number] = [v1[0] + inX, baseY, v1[2] + inZ];
    const iv2: [number, number, number] = [v2[0] + inX, baseY + hShoulder, v2[2] + inZ];
    const iv3: [number, number, number] = [v3[0] + inX, baseY + hPeak, v3[2] + inZ];
    const iv4: [number, number, number] = [v4[0] + inX, baseY + hShoulder, v4[2] + inZ];

    const outNorm: [number, number, number] = [-norm[0], 0, -norm[2]];
    const inNorm: [number, number, number] = [norm[0], 0, norm[2]];

    // Outer Face: Quad base + Pointed Triangle Peak
    builder.addQuad(v0, v1, v2, v4, outNorm, [0, 0], [1, 0], [1, 0.6], [0, 0.6]);
    builder.addTriangle(v4, v2, v3, outNorm, [0, 0.6], [1, 0.6], [0.5, 1.0]);

    // Inner Face: Quad base + Pointed Triangle Peak (reversed winding)
    builder.addQuad(iv1, iv0, iv4, iv2, inNorm, [0, 0], [1, 0], [1, 0.6], [0, 0.6]);
    builder.addTriangle(iv2, iv4, iv3, inNorm, [1, 0.6], [0, 0.6], [0.5, 1.0]);

    // Left Side Quad
    builder.addQuad(v0, iv0, iv4, v4, [-norm[2], 0, norm[0]], [0, 0], [0.3, 0], [0.3, 0.6], [0, 0.6]);

    // Right Side Quad
    builder.addQuad(iv1, v1, v2, iv2, [norm[2], 0, -norm[0]], [0, 0], [0.3, 0], [0.3, 0.6], [0, 0.6]);

    // Sloping Peaked Roof (Left Slope & Right Slope)
    builder.addQuad(v4, v3, iv3, iv4, [-0.5, 0.8, 0], [0, 0], [0.5, 0], [0.5, 0.3], [0, 0.3]);
    builder.addQuad(v3, v2, iv2, iv3, [0.5, 0.8, 0], [0, 0], [0.5, 0], [0.5, 0.3], [0, 0.3]);
  };

  // Add Murud-Janjira Kangare along Ramparts
  if (settings.crenellations) {
    const crenH = Math.max(0.010, Math.min(0.025, settings.crenellationHeight));
    const merlonW = Math.max(0.012, Math.min(0.028, settings.crenellationWidth));
    const gapW = 0.012;
    const cycle = merlonW + gapW;
    const crenThick = halfThick * 0.65;

    for (let i = 0; i < n - 1; i++) {
      const pA = resampled[i];
      const pB = resampled[i + 1];
      const distA = cumulativeDist[i];
      const distB = cumulativeDist[i + 1];

      // Check if gate is here
      let isGate = false;
      for (const ag of activeGates) {
        if (distA >= ag.centerDist - ag.halfWidth && distB <= ag.centerDist + ag.halfWidth) {
          isGate = true;
          break;
        }
      }
      if (isGate) continue;

      const segLen = distB - distA;
      if (segLen < 1e-4) continue;

      const nA = lateralNormals[i];
      const nB = lateralNormals[i + 1];

      const numCycles = Math.max(1, Math.floor(segLen / cycle));
      for (let c = 0; c < numCycles; c++) {
        const tStart = (c * cycle) / segLen;
        const tEnd = Math.min(1.0, (c * cycle + merlonW) / segLen);
        if (tStart >= 1.0) break;

        const mAx = pA.x + (pB.x - pA.x) * tStart;
        const mAz = pA.z + (pB.z - pA.z) * tStart;
        const mAy = pA.y + (pB.y - pA.y) * tStart + wallH;

        const mBx = pA.x + (pB.x - pA.x) * tEnd;
        const mBz = pA.z + (pB.z - pA.z) * tEnd;

        const mNormX = nA.x + (nB.x - nA.x) * tStart;
        const mNormZ = nA.z + (nB.z - nA.z) * tStart;
        const normLen = Math.hypot(mNormX, mNormZ) || 1;
        const unitNorm: [number, number, number] = [mNormX / normLen, 0, mNormZ / normLen];

        const cL: [number, number, number] = [mAx - unitNorm[0] * halfThick, mAy, mAz - unitNorm[2] * halfThick];
        const cR: [number, number, number] = [mBx - unitNorm[0] * halfThick, mAy, mBz - unitNorm[2] * halfThick];

        addPointedKangara(cL, cR, unitNorm, mAy, crenH, crenThick);
      }
    }
  }

  // 6. Round Bastions (Buruj) with Solid Top Floors and Crowning Kangare Rings
  const bastionIndices = detectBastionLocations(
    points,
    isClosed,
    settings.autoBastions,
    manualBastionIndices
  );

  const bastionRadius = Math.max(0.03, Math.min(0.10, settings.bastionRadius));
  const radialSegments = 16;
  const crenH = Math.max(0.010, Math.min(0.025, settings.crenellationHeight));

  for (const bIdx of bastionIndices) {
    const pt = points[bIdx];
    if (!pt) continue;

    const groundY = sampleBilinearHeight(buffer, pt.x, pt.z);
    const bBotY = groundY - embedDepth;
    const bTopY = groundY + wallH + 0.012; // Stand slightly proud of wall

    // Cylinder side quads
    for (let r = 0; r < radialSegments; r++) {
      const a0 = (r / radialSegments) * Math.PI * 2;
      const a1 = ((r + 1) / radialSegments) * Math.PI * 2;

      const cos0 = Math.cos(a0);
      const sin0 = Math.sin(a0);
      const cos1 = Math.cos(a1);
      const sin1 = Math.sin(a1);

      const x0 = pt.x + cos0 * bastionRadius;
      const z0 = pt.z + sin0 * bastionRadius;
      const x1 = pt.x + cos1 * bastionRadius;
      const z1 = pt.z + sin1 * bastionRadius;

      const u0 = (a0 / (Math.PI * 2)) * (bastionRadius * Math.PI * 2) * effectiveUvScale;
      const u1 = (a1 / (Math.PI * 2)) * (bastionRadius * Math.PI * 2) * effectiveUvScale;

      const v0 = bBotY * effectiveUvScale;
      const v1 = bTopY * effectiveUvScale;

      const avgNorm: [number, number, number] = [(cos0 + cos1) * 0.5, 0, (sin0 + sin1) * 0.5];

      builder.addQuad(
        [x0, bBotY, z0],
        [x1, bBotY, z1],
        [x1, bTopY, z1],
        [x0, bTopY, z0],
        avgNorm,
        [u0, v0], [u1, v0], [u1, v1], [u0, v1]
      );
    }

    // SOLID BASTION TOP FLOOR DISC (Watertight top)
    const centerTopIdx = builder.addVertex(pt.x, bTopY, pt.z, 0, 1, 0, 0.5, 0.5);
    for (let r = 0; r < radialSegments; r++) {
      const a0 = (r / radialSegments) * Math.PI * 2;
      const a1 = ((r + 1) / radialSegments) * Math.PI * 2;
      const x0 = pt.x + Math.cos(a0) * bastionRadius;
      const z0 = pt.z + Math.sin(a0) * bastionRadius;
      const x1 = pt.x + Math.cos(a1) * bastionRadius;
      const z1 = pt.z + Math.sin(a1) * bastionRadius;

      const i0 = builder.addVertex(x0, bTopY, z0, 0, 1, 0, 0.5 + Math.cos(a0) * 0.5, 0.5 + Math.sin(a0) * 0.5);
      const i1 = builder.addVertex(x1, bTopY, z1, 0, 1, 0, 0.5 + Math.cos(a1) * 0.5, 0.5 + Math.sin(a1) * 0.5);
      builder.indices.push(centerTopIdx, i0, i1);
    }

    // MURUD-JANJIRA CROWNING KANGARE RING AROUND BASTION RIM
    if (settings.crenellations) {
      const numBastionKangare = 10;
      const bKThick = bastionRadius * 0.22;

      for (let k = 0; k < numBastionKangare; k++) {
        // Leave alternating small embrasure gaps
        const aStart = ((k + 0.15) / numBastionKangare) * Math.PI * 2;
        const aEnd = ((k + 0.85) / numBastionKangare) * Math.PI * 2;
        const aMid = (aStart + aEnd) * 0.5;

        const cL: [number, number, number] = [
          pt.x + Math.cos(aStart) * bastionRadius,
          bTopY,
          pt.z + Math.sin(aStart) * bastionRadius,
        ];
        const cR: [number, number, number] = [
          pt.x + Math.cos(aEnd) * bastionRadius,
          bTopY,
          pt.z + Math.sin(aEnd) * bastionRadius,
        ];

        // Inward pointing normal
        const unitInNorm: [number, number, number] = [-Math.cos(aMid), 0, -Math.sin(aMid)];

        addPointedKangara(cL, cR, unitInNorm, bTopY, crenH * 0.9, bKThick);
      }
    }
  }

  // 7. Maha Darwaza (Arched Gateway Portal & Flanking Round Bastions)
  for (const ag of activeGates) {
    const { centerX, centerZ, groundY, normal, tangent, halfWidth } = ag;
    const gWidth = halfWidth * 2;

    // Grounded Arch opening height fits completely within wall height
    const hArch = wallH * 0.70;
    const archBotY = groundY;
    const archTopY = groundY + hArch;
    const lintelTopY = groundY + wallH; // Seamlessly continuous with wall top!

    // Left and right jamb positions
    const jLeftX = centerX - tangent.x * halfWidth;
    const jLeftZ = centerZ - tangent.z * halfWidth;
    const jRightX = centerX + tangent.x * halfWidth;
    const jRightZ = centerZ + tangent.z * halfWidth;

    // A. SOLID LEFT JAMB FACE (Facing +T into portal)
    builder.addQuad(
      [jLeftX - normal.x * halfThick, archBotY, jLeftZ - normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archBotY, jLeftZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archTopY, jLeftZ + normal.z * halfThick],
      [jLeftX - normal.x * halfThick, archTopY, jLeftZ - normal.z * halfThick],
      [tangent.x, 0, tangent.z],
      [0, 0], [settings.thickness * effectiveUvScale, 0],
      [settings.thickness * effectiveUvScale, hArch * effectiveUvScale], [0, hArch * effectiveUvScale]
    );

    // B. SOLID RIGHT JAMB FACE (Facing -T into portal)
    builder.addQuad(
      [jRightX + normal.x * halfThick, archBotY, jRightZ + normal.z * halfThick],
      [jRightX - normal.x * halfThick, archBotY, jRightZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, archTopY, jRightZ - normal.z * halfThick],
      [jRightX + normal.x * halfThick, archTopY, jRightZ + normal.z * halfThick],
      [-tangent.x, 0, -tangent.z],
      [0, 0], [settings.thickness * effectiveUvScale, 0],
      [settings.thickness * effectiveUvScale, hArch * effectiveUvScale], [0, hArch * effectiveUvScale]
    );

    // C. ARCH SOFFIT / CEILING (Downward facing ceiling at archTopY)
    builder.addQuad(
      [jLeftX - normal.x * halfThick, archTopY, jLeftZ - normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archTopY, jLeftZ + normal.z * halfThick],
      [jRightX + normal.x * halfThick, archTopY, jRightZ + normal.z * halfThick],
      [jRightX - normal.x * halfThick, archTopY, jRightZ - normal.z * halfThick],
      [0, -1, 0],
      [0, 0], [settings.thickness * effectiveUvScale, 0],
      [settings.thickness * effectiveUvScale, gWidth * effectiveUvScale], [0, gWidth * effectiveUvScale]
    );

    // D. LINTEL FRONT FACE (Spans from archTopY to lintelTopY)
    builder.addQuad(
      [jLeftX - normal.x * halfThick, archTopY, jLeftZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, archTopY, jRightZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, lintelTopY, jRightZ - normal.z * halfThick],
      [jLeftX - normal.x * halfThick, lintelTopY, jLeftZ - normal.z * halfThick],
      [-normal.x, 0, -normal.z],
      [0, archTopY * effectiveUvScale], [gWidth * effectiveUvScale, archTopY * effectiveUvScale],
      [gWidth * effectiveUvScale, lintelTopY * effectiveUvScale], [0, lintelTopY * effectiveUvScale]
    );

    // E. LINTEL BACK FACE (Spans from archTopY to lintelTopY)
    builder.addQuad(
      [jRightX + normal.x * halfThick, archTopY, jRightZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archTopY, jLeftZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, lintelTopY, jLeftZ + normal.z * halfThick],
      [jRightX + normal.x * halfThick, lintelTopY, jRightZ + normal.z * halfThick],
      [normal.x, 0, normal.z],
      [0, archTopY * effectiveUvScale], [gWidth * effectiveUvScale, archTopY * effectiveUvScale],
      [gWidth * effectiveUvScale, lintelTopY * effectiveUvScale], [0, lintelTopY * effectiveUvScale]
    );

    // F. LINTEL TOP WALKWAY (Continuous rampart walk at lintelTopY)
    builder.addQuad(
      [jLeftX - normal.x * halfThick, lintelTopY, jLeftZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, lintelTopY, jRightZ - normal.z * halfThick],
      [jRightX + normal.x * halfThick, lintelTopY, jRightZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, lintelTopY, jLeftZ + normal.z * halfThick],
      [0, 1, 0],
      [0, 0], [gWidth * effectiveUvScale, 0],
      [gWidth * effectiveUvScale, settings.thickness * effectiveUvScale], [0, settings.thickness * effectiveUvScale]
    );

    // Crenellations over the gateway lintel
    if (settings.crenellations) {
      const cL: [number, number, number] = [jLeftX - normal.x * halfThick, lintelTopY, jLeftZ - normal.z * halfThick];
      const cR: [number, number, number] = [jRightX - normal.x * halfThick, lintelTopY, jRightZ - normal.z * halfThick];
      addPointedKangara(cL, cR, [normal.x, 0, normal.z], lintelTopY, crenH, halfThick * 0.65);
    }

    // G. FLANKING GATEHOUSE BASTIONS (with solid top floor & crowning kangare)
    if (ag.gate.hasGatehouse !== false) {
      const ghRadius = Math.max(0.025, Math.min(0.06, settings.thickness * 1.25));
      const ghTopY = lintelTopY + 0.012; // Flanking towers rise slightly above portal
      const flankOffsets = [-halfWidth - ghRadius * 0.8, halfWidth + ghRadius * 0.8];

      for (const off of flankOffsets) {
        const ghX = centerX + tangent.x * off;
        const ghZ = centerZ + tangent.z * off;
        const ghGroundY = sampleBilinearHeight(buffer, ghX, ghZ);
        const ghBotY = ghGroundY - embedDepth;

        // Side cylinder quads (12 segments)
        for (let r = 0; r < 12; r++) {
          const a0 = (r / 12) * Math.PI * 2;
          const a1 = ((r + 1) / 12) * Math.PI * 2;
          const x0 = ghX + Math.cos(a0) * ghRadius;
          const z0 = ghZ + Math.sin(a0) * ghRadius;
          const x1 = ghX + Math.cos(a1) * ghRadius;
          const z1 = ghZ + Math.sin(a1) * ghRadius;

          builder.addQuad(
            [x0, ghBotY, z0],
            [x1, ghBotY, z1],
            [x1, ghTopY, z1],
            [x0, ghTopY, z0],
            [(Math.cos(a0) + Math.cos(a1)) * 0.5, 0, (Math.sin(a0) + Math.sin(a1)) * 0.5],
            [0, ghBotY * effectiveUvScale],
            [0.3, ghBotY * effectiveUvScale],
            [0.3, ghTopY * effectiveUvScale],
            [0, ghTopY * effectiveUvScale]
          );
        }

        // SOLID TOP FLOOR DISC FOR FLANKING TOWERS (Solves missing tower top)
        const ghCenterTop = builder.addVertex(ghX, ghTopY, ghZ, 0, 1, 0, 0.5, 0.5);
        for (let r = 0; r < 12; r++) {
          const a0 = (r / 12) * Math.PI * 2;
          const a1 = ((r + 1) / 12) * Math.PI * 2;
          const x0 = ghX + Math.cos(a0) * ghRadius;
          const z0 = ghZ + Math.sin(a0) * ghRadius;
          const x1 = ghX + Math.cos(a1) * ghRadius;
          const z1 = ghZ + Math.sin(a1) * ghRadius;

          const i0 = builder.addVertex(x0, ghTopY, z0, 0, 1, 0, 0.5 + Math.cos(a0) * 0.5, 0.5 + Math.sin(a0) * 0.5);
          const i1 = builder.addVertex(x1, ghTopY, z1, 0, 1, 0, 0.5 + Math.cos(a1) * 0.5, 0.5 + Math.sin(a1) * 0.5);
          builder.indices.push(ghCenterTop, i0, i1);
        }

        // CROWNING KANGARE FOR FLANKING GATEHOUSE TOWERS
        if (settings.crenellations) {
          const numGHKangare = 8;
          const ghKThick = ghRadius * 0.25;
          for (let k = 0; k < numGHKangare; k++) {
            const aStart = ((k + 0.15) / numGHKangare) * Math.PI * 2;
            const aEnd = ((k + 0.85) / numGHKangare) * Math.PI * 2;
            const aMid = (aStart + aEnd) * 0.5;

            const cL: [number, number, number] = [
              ghX + Math.cos(aStart) * ghRadius,
              ghTopY,
              ghZ + Math.sin(aStart) * ghRadius,
            ];
            const cR: [number, number, number] = [
              ghX + Math.cos(aEnd) * ghRadius,
              ghTopY,
              ghZ + Math.sin(aEnd) * ghRadius,
            ];

            const unitInNorm: [number, number, number] = [-Math.cos(aMid), 0, -Math.sin(aMid)];
            addPointedKangara(cL, cR, unitInNorm, ghTopY, crenH * 0.85, ghKThick);
          }
        }
      }
    }
  }

  return builder.build();
}

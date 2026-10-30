import * as THREE from 'three';
import {
  TERRAIN_SIZE,
  HALF_TERRAIN_SIZE,
  TERRAIN_RESOLUTION,
  STATE_CHANNELS,
} from '../terrain/terrainBuffer';
import { WallPath, WallPoint, WallSettings, WallGate, CitadelKeep, FortStampType } from './wallTypes';

/**
 * Diorama stone masonry scale factor.
 * Wall heights range from 10cm to 100cm (0.10m to 1.0m).
 * Multiplying by 3.5 maps each stone brick course cleanly
 * across height and length.
 */
export const BRICK_UV_MULTIPLIER = 3.5;

/**
 * Foundation sink into terrain to guarantee rock-solid grounding on steep terrain slopes.
 */
export const WALL_EMBED_DEPTH = 0.03; // 3cm

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
 * - Excludes any vertices designated in excludedIndices
 */
export function detectBastionLocations(
  points: WallPoint[],
  isClosed: boolean,
  autoBastions: boolean,
  manualIndices: number[] = [],
  excludedIndices: number[] = []
): number[] {
  const bastions = new Set<number>(manualIndices);
  const excluded = new Set<number>(excludedIndices);
  const count = points.length;
  if (count < 2) return Array.from(bastions).filter((i) => !excluded.has(i));

  if (!isClosed) {
    if (!excluded.has(0)) bastions.add(0);
    if (!excluded.has(count - 1)) bastions.add(count - 1);
  }

  if (autoBastions && count >= 3) {
    if (isClosed) {
      for (let i = 0; i < count; i++) {
        if (excluded.has(i)) continue;
        const pPrev = points[(i - 1 + count) % count];
        const pCurr = points[i];
        const pNext = points[(i + 1) % count];
        if (computeCornerAngle(pPrev, pCurr, pNext) > 35) {
          bastions.add(i);
        }
      }
    } else {
      for (let i = 1; i < count - 1; i++) {
        if (excluded.has(i)) continue;
        const pPrev = points[i - 1];
        const pCurr = points[i];
        const pNext = points[i + 1];
        if (computeCornerAngle(pPrev, pCurr, pNext) > 35) {
          bastions.add(i);
        }
      }
    }
  }

  return Array.from(bastions).filter((i) => !excluded.has(i)).sort((a, b) => a - b);
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
  stepSize = 0.15
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
 * Procedural geometry builder helper class to accumulate vertices, normals, UVs, and indices
 * with multi-material group support.
 * Group 0: Stone Brick Masonry (mossy_stone_brick) - wall sides, towers, gate jambs
 * Group 1: Walkway & Tower Floor Dark Stone (dark_stone_floor) - wall top ramparts, tower floor discs
 * Group 2: Solid Dark Stone (dark_stone_texture) - crenellations (kangare), soffits, trims
 *
 * // shortcut: unindexed quad vertex emission (duplicated shared vertices), upgrade to spatial hash index map if fort vertex count exceeds 50,000 vertices
 */
class GeometryBuilder {
  positions: number[] = [];
  normals: number[] = [];
  uvs: number[] = [];
  groupIndices: number[][] = [[], [], []];
  private currentGroup = 0;
  private vertCount = 0;

  setGroup(groupIndex: number) {
    this.currentGroup = groupIndex;
    while (this.groupIndices.length <= groupIndex) {
      this.groupIndices.push([]);
    }
  }

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
    this.groupIndices[this.currentGroup].push(i0, i1, i2);
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

    this.groupIndices[this.currentGroup].push(i0, i1, i2);
    this.groupIndices[this.currentGroup].push(i0, i2, i3);
  }

  addTriangleIndices(i0: number, i1: number, i2: number) {
    this.groupIndices[this.currentGroup].push(i0, i1, i2);
  }

  build(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));

    const flatIndices: number[] = [];
    for (let g = 0; g < this.groupIndices.length; g++) {
      const gList = this.groupIndices[g];
      if (gList.length > 0) {
        const start = flatIndices.length;
        flatIndices.push(...gList);
        geo.addGroup(start, gList.length, g);
      }
    }
    geo.setIndex(flatIndices);
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
 * - Multi-material texturing: Wall masonry (Group 0), Dark stone floor walkway/floors (Group 1), Dark stone kangare (Group 2)
 * - Authentic outer-facing Murud-Janjira arched/pointed kangare along ramparts & bastion tops
 * - Tower exclusion zones preventing kangare from clipping into bastions and flanking towers
 * - Watertight arched Maha Darwaza with solid flanking bastions and capped tops
 * - Multiplied miniature brick UV scale for crisp stone masonry
 */
export function generateWallBufferGeometry(
  wall: WallPath,
  buffer: Float32Array
): THREE.BufferGeometry {
  const {
    points,
    isClosed,
    settings,
    gates = [],
    towers = [],
    boxBastions = [],
    manualBastionIndices = [],
    grandBastionIndices = [],
    excludedBastionIndices = [],
    customBastions = {},
  } = wall;
  const builder = new GeometryBuilder();
  if (points.length < 2) {
    return builder.build();
  }
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
      const gateWidth = Math.max(0.20, Math.min(0.80, (g.width && g.width >= 0.15 && g.width <= 1.2 ? g.width : settings.thickness * 2.2)));
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

    // Face 1: Left Outer Wall Face (facing -N) - GROUP 0: Stone Masonry
    builder.setGroup(0);
    const normLeft: [number, number, number] = [-(nA.x + nB.x) * 0.5, 0, -(nA.z + nB.z) * 0.5];
    builder.addQuad(
      lbA, lbB, ltB, ltA,
      normLeft,
      [uA, vBotA], [uB, vBotB], [uB, vTopB], [uA, vTopA]
    );

    // Face 2: Right Inner Wall Face (facing +N) - GROUP 0: Stone Masonry
    const normRight: [number, number, number] = [(nA.x + nB.x) * 0.5, 0, (nA.z + nB.z) * 0.5];
    builder.addQuad(
      rbB, rbA, rtA, rtB,
      normRight,
      [uB, vBotB], [uA, vBotA], [uA, vTopA], [uB, vTopB]
    );

    // Face 3: Top Walkway Rampart (facing Up +Y) - GROUP 1: Dark Stone Floor Walkway
    builder.setGroup(1);
    builder.addQuad(
      ltA, ltB, rtB, rtA,
      [0, 1, 0],
      [uA * 1.5, 0], [uB * 1.5, 0], [uB * 1.5, settings.thickness * effectiveUvScale * 1.5], [uA * 1.5, settings.thickness * effectiveUvScale * 1.5]
    );
  }

  // End Caps for open walls - GROUP 0: Stone Masonry
  builder.setGroup(0);
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
    // Kangare are made of solid dark stone (GROUP 2)
    builder.setGroup(2);
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

  // 6. Round Bastions (Buruj & Maha Buruj)
  const bastionIndices = detectBastionLocations(
    points,
    isClosed,
    settings.autoBastions,
    manualBastionIndices,
    excludedBastionIndices
  );

  const baseBastionRadius = Math.max(0.05, Math.min(0.35, settings.bastionRadius || 0.13));
  const radialSegments = 16;
  const baseCrenH = Math.max(0.02, Math.min(0.08, settings.crenellationHeight || 0.04));

  // Compute 2D polygon centroid for closed circuits to orient outer battlements outward
  let centroidX = 0;
  let centroidZ = 0;
  if (points.length > 0) {
    for (const p of points) {
      centroidX += p.x;
      centroidZ += p.z;
    }
    centroidX /= points.length;
    centroidZ /= points.length;
  }

  // Collect tower exclusion zones so wall kangare never cut or pierce into towers
  interface TowerExclusionZone {
    x: number;
    z: number;
    radius: number;
  }
  const towerExclusions: TowerExclusionZone[] = [];

  for (const bIdx of bastionIndices) {
    const pt = points[bIdx];
    if (!pt) continue;
    const custom = customBastions[bIdx];
    const isGrand = grandBastionIndices.includes(bIdx) || custom?.isGrand;
    const customR = custom?.radius;
    const bRadius = customR ?? (isGrand ? baseBastionRadius * 1.5 : baseBastionRadius);
    towerExclusions.push({ x: pt.x, z: pt.z, radius: bRadius });
  }

  for (const ag of activeGates) {
    if (ag.gate.hasGatehouse !== false) {
      const ghRadius = Math.max(0.08, Math.min(0.20, settings.thickness * 0.9));
      const flankOffsets = [-ag.halfWidth - ghRadius * 0.8, ag.halfWidth + ghRadius * 0.8];
      for (const off of flankOffsets) {
        towerExclusions.push({
          x: ag.centerX + ag.tangent.x * off,
          z: ag.centerZ + ag.tangent.z * off,
          radius: ghRadius,
        });
      }
    }
  }

  // Add exclusion zones for sliding round towers
  for (const tw of towers) {
    const origCount = isClosed && points.length >= 3 ? points.length : points.length - 1;
    const segIdx = Math.max(0, Math.min(origCount - 1, tw.segmentIndex));
    const pA = points[segIdx];
    const pB = points[(segIdx + 1) % points.length];
    if (!pA || !pB) continue;
    const t = Math.max(0.05, Math.min(0.95, tw.t || 0.5));
    const twX = pA.x + (pB.x - pA.x) * t;
    const twZ = pA.z + (pB.z - pA.z) * t;
    towerExclusions.push({ x: twX, z: twZ, radius: tw.radius || 0.13 });
  }

  // Note: Wall crenellations (kangare) are intentionally preserved where Rampart Platforms (boxBastions)
  // join the wall, ensuring the outer battlement parapet remains continuous and unpunctured.

  // Add Murud-Janjira Kangare along Ramparts
  if (settings.crenellations) {
    const crenH = Math.max(0.04, Math.min(0.15, settings.crenellationHeight));
    const merlonW = Math.max(0.06, Math.min(0.20, settings.crenellationWidth));
    const gapW = 0.05;
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

        const mMidX = (mAx + mBx) * 0.5;
        const mMidZ = (mAz + mBz) * 0.5;

        // Skip if kangara is inside or approaching any bastion or flanking tower
        let insideTower = false;
        for (const zone of towerExclusions) {
          if (Math.hypot(mMidX - zone.x, mMidZ - zone.z) < zone.radius + 0.035) {
            insideTower = true;
            break;
          }
        }
        if (insideTower) continue;

        const mNormX = nA.x + (nB.x - nA.x) * tStart;
        const mNormZ = nA.z + (nB.z - nA.z) * tStart;
        const normLen = Math.hypot(mNormX, mNormZ) || 1;
        const unitNorm: [number, number, number] = [mNormX / normLen, 0, mNormZ / normLen];

        // Determine authentic outer-facing direction
        // shortcut: 2D polygon centroid & downhill sampling for battlement orientation, upgrade to winding order mesh BVH if interior courtyards self-intersect
        let outwardDir = 1;
        if (isClosed && points.length >= 3) {
          const fromCenterX = mMidX - centroidX;
          const fromCenterZ = mMidZ - centroidZ;
          const dot = unitNorm[0] * fromCenterX + unitNorm[2] * fromCenterZ;
          outwardDir = dot >= 0 ? 1 : -1;
        } else {
          // Open wall: outer face is towards downhill slope / lower terrain elevation
          const hPlus = sampleBilinearHeight(buffer, mMidX + unitNorm[0] * 0.25, mMidZ + unitNorm[2] * 0.25);
          const hMinus = sampleBilinearHeight(buffer, mMidX - unitNorm[0] * 0.25, mMidZ - unitNorm[2] * 0.25);
          outwardDir = hPlus <= hMinus ? 1 : -1;
        }

        if (settings.flipCrenellations) {
          outwardDir = -outwardDir;
        }

        // Outer base coordinates placed along the outer rim of the wall
        const outOffX = unitNorm[0] * outwardDir * halfThick;
        const outOffZ = unitNorm[2] * outwardDir * halfThick;

        const cL: [number, number, number] = [mAx + outOffX, mAy, mAz + outOffZ];
        const cR: [number, number, number] = [mBx + outOffX, mAy, mBz + outOffZ];

        // Inward offset direction extends kangara thickness inward onto wall
        const inNorm: [number, number, number] = [-unitNorm[0] * outwardDir, 0, -unitNorm[2] * outwardDir];

        addPointedKangara(cL, cR, inNorm, mAy, crenH, crenThick);
      }
    }
  }

  // 6. Round Bastions (Buruj & Maha Buruj)
  for (const bIdx of bastionIndices) {
    const pt = points[bIdx];
    if (!pt) continue;

    const custom = customBastions[bIdx];
    const isGrand = grandBastionIndices.includes(bIdx) || custom?.isGrand;
    const customR = custom?.radius;
    const customHOffset = custom?.heightOffset || 0;

    const bastionRadius = customR ?? (isGrand ? baseBastionRadius * 1.5 : baseBastionRadius);
    const towerH = (isGrand ? wallH * 1.25 : wallH + 0.015) + customHOffset;
    const crenH = isGrand ? baseCrenH * 1.25 : baseCrenH;

    const groundY = sampleBilinearHeight(buffer, pt.x, pt.z);
    const bBotY = groundY - embedDepth;
    const bTopY = groundY + towerH; // Stands proud of wall

    // Cylinder side quads - GROUP 0: Stone Masonry
    builder.setGroup(0);
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

    // SOLID BASTION TOP FLOOR DISC (Watertight top) - GROUP 1: Dark Stone Floor
    builder.setGroup(1);
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
      builder.addTriangleIndices(centerTopIdx, i0, i1);
    }

    // MURUD-JANJIRA CROWNING KANGARE RING AROUND BASTION RIM - GROUP 2 (inside addPointedKangara)
    if (settings.crenellations) {
      const numBastionKangare = isGrand ? 14 : 10;
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

  // 6b. Sliding Round Towers (wall.towers)
  for (const tw of towers) {
    const origCount = isClosed && points.length >= 3 ? points.length : points.length - 1;
    const segIdx = Math.max(0, Math.min(origCount - 1, tw.segmentIndex));
    const pA = points[segIdx];
    const pB = points[(segIdx + 1) % points.length];
    if (!pA || !pB) continue;

    const t = Math.max(0.05, Math.min(0.95, tw.t || 0.5));
    const twX = pA.x + (pB.x - pA.x) * t;
    const twZ = pA.z + (pB.z - pA.z) * t;
    const twRadius = Math.max(0.06, Math.min(0.35, tw.radius || 0.13));
    const twH = wallH + (tw.heightOffset || 0.02);

    const groundY = sampleBilinearHeight(buffer, twX, twZ);
    const twBotY = groundY - embedDepth;
    const twTopY = groundY + twH;

    // Cylinder side quads - GROUP 0: Stone Masonry
    builder.setGroup(0);
    for (let r = 0; r < radialSegments; r++) {
      const a0 = (r / radialSegments) * Math.PI * 2;
      const a1 = ((r + 1) / radialSegments) * Math.PI * 2;

      const cos0 = Math.cos(a0);
      const sin0 = Math.sin(a0);
      const cos1 = Math.cos(a1);
      const sin1 = Math.sin(a1);

      const x0 = twX + cos0 * twRadius;
      const z0 = twZ + sin0 * twRadius;
      const x1 = twX + cos1 * twRadius;
      const z1 = twZ + sin1 * twRadius;

      const u0 = (a0 / (Math.PI * 2)) * (twRadius * Math.PI * 2) * effectiveUvScale;
      const u1 = (a1 / (Math.PI * 2)) * (twRadius * Math.PI * 2) * effectiveUvScale;

      const v0 = twBotY * effectiveUvScale;
      const v1 = twTopY * effectiveUvScale;

      const avgNorm: [number, number, number] = [(cos0 + cos1) * 0.5, 0, (sin0 + sin1) * 0.5];

      builder.addQuad(
        [x0, twBotY, z0],
        [x1, twBotY, z1],
        [x1, twTopY, z1],
        [x0, twTopY, z0],
        avgNorm,
        [u0, v0], [u1, v0], [u1, v1], [u0, v1]
      );
    }

    // SOLID TOP FLOOR DISC - GROUP 1: Dark Stone Floor
    builder.setGroup(1);
    const centerTopIdx = builder.addVertex(twX, twTopY, twZ, 0, 1, 0, 0.5, 0.5);
    for (let r = 0; r < radialSegments; r++) {
      const a0 = (r / radialSegments) * Math.PI * 2;
      const a1 = ((r + 1) / radialSegments) * Math.PI * 2;
      const x0 = twX + Math.cos(a0) * twRadius;
      const z0 = twZ + Math.sin(a0) * twRadius;
      const x1 = twX + Math.cos(a1) * twRadius;
      const z1 = twZ + Math.sin(a1) * twRadius;

      const i0 = builder.addVertex(x0, twTopY, z0, 0, 1, 0, 0.5 + Math.cos(a0) * 0.5, 0.5 + Math.sin(a0) * 0.5);
      const i1 = builder.addVertex(x1, twTopY, z1, 0, 1, 0, 0.5 + Math.cos(a1) * 0.5, 0.5 + Math.sin(a1) * 0.5);
      builder.addTriangleIndices(centerTopIdx, i0, i1);
    }

    // Crowning Pointed Kangare Rim - GROUP 2
    if (settings.crenellations) {
      const numKangare = 10;
      const kThick = twRadius * 0.22;
      for (let k = 0; k < numKangare; k++) {
        const aStart = ((k + 0.15) / numKangare) * Math.PI * 2;
        const aEnd = ((k + 0.85) / numKangare) * Math.PI * 2;
        const aMid = (aStart + aEnd) * 0.5;

        const cL: [number, number, number] = [
          twX + Math.cos(aStart) * twRadius,
          twTopY,
          twZ + Math.sin(aStart) * twRadius,
        ];
        const cR: [number, number, number] = [
          twX + Math.cos(aEnd) * twRadius,
          twTopY,
          twZ + Math.sin(aEnd) * twRadius,
        ];

        const unitInNorm: [number, number, number] = [-Math.cos(aMid), 0, -Math.sin(aMid)];
        addPointedKangara(cL, cR, unitInNorm, twTopY, baseCrenH * 0.9, kThick);
      }
    }
  }

  // 6c. Inward Box Bastions (wall.boxBastions)
  // Attached to the wall with the entire body extending inward into the castle courtyard
  for (const bx of boxBastions) {
    const origCount = isClosed && points.length >= 3 ? points.length : points.length - 1;
    const segIdx = Math.max(0, Math.min(origCount - 1, bx.segmentIndex));
    const pA = points[segIdx];
    const pB = points[(segIdx + 1) % points.length];
    if (!pA || !pB) continue;

    const t = Math.max(0.05, Math.min(0.95, bx.t || 0.5));
    const attachX = pA.x + (pB.x - pA.x) * t;
    const attachZ = pA.z + (pB.z - pA.z) * t;

    const dx = pB.x - pA.x;
    const dz = pB.z - pA.z;
    const len = Math.hypot(dx, dz) || 1;
    const tan = { x: dx / len, z: dz / len };
    const norm = { x: -tan.z, z: tan.x };

    // Determine inward normal (towards castle interior)
    let inDir = 1;
    if (isClosed && points.length >= 3) {
      const toCentroidX = centroidX - attachX;
      const toCentroidZ = centroidZ - attachZ;
      inDir = (norm.x * toCentroidX + norm.z * toCentroidZ) >= 0 ? 1 : -1;
    } else {
      const hPlus = sampleBilinearHeight(buffer, attachX + norm.x * 0.3, attachZ + norm.z * 0.3);
      const hMinus = sampleBilinearHeight(buffer, attachX - norm.x * 0.3, attachZ - norm.z * 0.3);
      inDir = hPlus >= hMinus ? 1 : -1;
    }

    if (bx.flipSide) {
      inDir = -inDir;
    }

    const inNorm = { x: norm.x * inDir, z: norm.z * inDir };
    const bWidth = Math.max(0.15, Math.min(0.80, bx.width || 0.30));
    const bDepth = Math.max(0.15, Math.min(0.80, bx.depth || 0.30));
    const halfW = bWidth * 0.5;

    // Attached to wall, extending inward by bDepth
    const boxCenterX = attachX + inNorm.x * (bDepth * 0.5);
    const boxCenterZ = attachZ + inNorm.z * (bDepth * 0.5);
    const groundY = sampleBilinearHeight(buffer, boxCenterX, boxCenterZ);

    const boxH = wallH + (bx.heightOffset || 0.04);
    const boxBotY = groundY - embedDepth;
    const boxTopY = groundY + boxH;

    // 4 base corners
    const c0: [number, number, number] = [attachX - tan.x * halfW, boxBotY, attachZ - tan.z * halfW];
    const c1: [number, number, number] = [attachX + tan.x * halfW, boxBotY, attachZ + tan.z * halfW];
    const c2: [number, number, number] = [attachX + tan.x * halfW + inNorm.x * bDepth, boxBotY, attachZ + tan.z * halfW + inNorm.z * bDepth];
    const c3: [number, number, number] = [attachX - tan.x * halfW + inNorm.x * bDepth, boxBotY, attachZ - tan.z * halfW + inNorm.z * bDepth];

    const tc0: [number, number, number] = [c0[0], boxTopY, c0[2]];
    const tc1: [number, number, number] = [c1[0], boxTopY, c1[2]];
    const tc2: [number, number, number] = [c2[0], boxTopY, c2[2]];
    const tc3: [number, number, number] = [c3[0], boxTopY, c3[2]];

    // GROUP 0: Vertical stone masonry side faces
    builder.setGroup(0);

    // Inner courtyard face (facing inward along inNorm)
    builder.addQuad(
      c2, c3, tc3, tc2,
      [inNorm.x, 0, inNorm.z],
      [0, boxBotY * effectiveUvScale], [bWidth * effectiveUvScale, boxBotY * effectiveUvScale],
      [bWidth * effectiveUvScale, boxTopY * effectiveUvScale], [0, boxTopY * effectiveUvScale]
    );

    // Left face (from attached to inward)
    builder.addQuad(
      c3, c0, tc0, tc3,
      [-tan.x, 0, -tan.z],
      [0, boxBotY * effectiveUvScale], [bDepth * effectiveUvScale, boxBotY * effectiveUvScale],
      [bDepth * effectiveUvScale, boxTopY * effectiveUvScale], [0, boxTopY * effectiveUvScale]
    );

    // Right face
    builder.addQuad(
      c1, c2, tc2, tc1,
      [tan.x, 0, tan.z],
      [0, boxBotY * effectiveUvScale], [bDepth * effectiveUvScale, boxBotY * effectiveUvScale],
      [bDepth * effectiveUvScale, boxTopY * effectiveUvScale], [0, boxTopY * effectiveUvScale]
    );

    // Attached front face
    builder.addQuad(
      c0, c1, tc1, tc0,
      [-inNorm.x, 0, -inNorm.z],
      [0, boxBotY * effectiveUvScale], [bWidth * effectiveUvScale, boxBotY * effectiveUvScale],
      [bWidth * effectiveUvScale, boxTopY * effectiveUvScale], [0, boxTopY * effectiveUvScale]
    );

    // GROUP 1: Top floor dark stone slab quad
    builder.setGroup(1);
    builder.addQuad(
      tc0, tc1, tc2, tc3,
      [0, 1, 0],
      [0, 0], [bWidth * effectiveUvScale, 0],
      [bWidth * effectiveUvScale, bDepth * effectiveUvScale], [0, bDepth * effectiveUvScale]
    );

    // Protective perimeter stone railing along the 3 exposed platform rims
    // The wall connection side (tc0 -> tc1) is left completely open for foot traffic
    builder.setGroup(0);
    const railHeight = 0.045; // 4.5cm railing height
    const railThick = 0.016;  // 1.6cm railing thickness

    // Helper to add an oriented rectangular railing beam (posts & handrails)
    const addRailingBar = (
      pStart: [number, number, number],
      pEnd: [number, number, number],
      yBottom: number,
      yTop: number,
      thickness: number,
      latDir: [number, number, number]
    ) => {
      const halfT = thickness * 0.5;
      const ox = latDir[0] * halfT;
      const oz = latDir[2] * halfT;

      const b0: [number, number, number] = [pStart[0] - ox, yBottom, pStart[2] - oz];
      const b1: [number, number, number] = [pStart[0] + ox, yBottom, pStart[2] + oz];
      const b2: [number, number, number] = [pEnd[0] + ox, yBottom, pEnd[2] + oz];
      const b3: [number, number, number] = [pEnd[0] - ox, yBottom, pEnd[2] - oz];

      const t0: [number, number, number] = [b0[0], yTop, b0[2]];
      const t1: [number, number, number] = [b1[0], yTop, b1[2]];
      const t2: [number, number, number] = [b2[0], yTop, b2[2]];
      const t3: [number, number, number] = [b3[0], yTop, b3[2]];

      // Top face
      builder.addQuad(t0, t1, t2, t3, [0, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1]);
      // Outer face
      builder.addQuad(b1, b2, t2, t1, [latDir[0], 0, latDir[2]], [0, 0], [1, 0], [1, 1], [0, 1]);
      // Inner face
      builder.addQuad(b3, b0, t0, t3, [-latDir[0], 0, -latDir[2]], [0, 0], [1, 0], [1, 1], [0, 1]);
    };

    // 3 Exposed Rims:
    // 1. Left rim: tc0 to tc3
    // 2. Inner courtyard rim: tc3 to tc2
    // 3. Right rim: tc2 to tc1
    const platformRims: { start: [number, number, number]; end: [number, number, number]; norm: [number, number, number]; length: number }[] = [
      { start: tc0, end: tc3, norm: [tan.x, 0, tan.z], length: bDepth },
      { start: tc3, end: tc2, norm: [-inNorm.x, 0, -inNorm.z], length: bWidth },
      { start: tc2, end: tc1, norm: [-tan.x, 0, -tan.z], length: bDepth },
    ];

    for (const rim of platformRims) {
      // Top handrail bar
      addRailingBar(rim.start, rim.end, boxTopY + railHeight * 0.72, boxTopY + railHeight, railThick, rim.norm);
      // Mid horizontal guard bar
      addRailingBar(rim.start, rim.end, boxTopY + railHeight * 0.28, boxTopY + railHeight * 0.44, railThick * 0.75, rim.norm);

      // Vertical baluster posts spaced along this rim
      const postCount = Math.max(2, Math.round(rim.length / 0.08));
      for (let p = 0; p <= postCount; p++) {
        const u = p / postCount;
        const px = rim.start[0] + (rim.end[0] - rim.start[0]) * u;
        const pz = rim.start[2] + (rim.end[2] - rim.start[2]) * u;
        const pLen = 0.016;
        const dirX = (rim.end[0] - rim.start[0]) / (rim.length || 1);
        const dirZ = (rim.end[2] - rim.start[2]) / (rim.length || 1);

        const pA: [number, number, number] = [px - dirX * (pLen * 0.5), boxTopY, pz - dirZ * (pLen * 0.5)];
        const pB: [number, number, number] = [px + dirX * (pLen * 0.5), boxTopY, pz + dirZ * (pLen * 0.5)];
        addRailingBar(pA, pB, boxTopY, boxTopY + railHeight, railThick, rim.norm);
      }
    }
  }

  // 7. Maha Darwaza (Arched Gateway Portal & Flanking Round Bastions)
  const gateCrenH = Math.max(0.04, Math.min(0.15, settings.crenellationHeight || 0.08));
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

    // A. SOLID LEFT JAMB FACE - GROUP 0: Stone Masonry
    builder.setGroup(0);
    builder.addQuad(
      [jLeftX - normal.x * halfThick, archBotY, jLeftZ - normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archBotY, jLeftZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archTopY, jLeftZ + normal.z * halfThick],
      [jLeftX - normal.x * halfThick, archTopY, jLeftZ - normal.z * halfThick],
      [tangent.x, 0, tangent.z],
      [0, 0], [settings.thickness * effectiveUvScale, 0],
      [settings.thickness * effectiveUvScale, hArch * effectiveUvScale], [0, hArch * effectiveUvScale]
    );

    // B. SOLID RIGHT JAMB FACE - GROUP 0: Stone Masonry
    builder.addQuad(
      [jRightX + normal.x * halfThick, archBotY, jRightZ + normal.z * halfThick],
      [jRightX - normal.x * halfThick, archBotY, jRightZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, archTopY, jRightZ - normal.z * halfThick],
      [jRightX + normal.x * halfThick, archTopY, jRightZ + normal.z * halfThick],
      [-tangent.x, 0, -tangent.z],
      [0, 0], [settings.thickness * effectiveUvScale, 0],
      [settings.thickness * effectiveUvScale, hArch * effectiveUvScale], [0, hArch * effectiveUvScale]
    );

    // C. ARCH SOFFIT / CEILING - GROUP 2: Dark Stone Ceiling
    builder.setGroup(2);
    builder.addQuad(
      [jLeftX - normal.x * halfThick, archTopY, jLeftZ - normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archTopY, jLeftZ + normal.z * halfThick],
      [jRightX + normal.x * halfThick, archTopY, jRightZ + normal.z * halfThick],
      [jRightX - normal.x * halfThick, archTopY, jRightZ - normal.z * halfThick],
      [0, -1, 0],
      [0, 0], [settings.thickness * effectiveUvScale, 0],
      [settings.thickness * effectiveUvScale, gWidth * effectiveUvScale], [0, gWidth * effectiveUvScale]
    );

    // D. LINTEL FRONT FACE - GROUP 0: Stone Masonry
    builder.setGroup(0);
    builder.addQuad(
      [jLeftX - normal.x * halfThick, archTopY, jLeftZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, archTopY, jRightZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, lintelTopY, jRightZ - normal.z * halfThick],
      [jLeftX - normal.x * halfThick, lintelTopY, jLeftZ - normal.z * halfThick],
      [-normal.x, 0, -normal.z],
      [0, archTopY * effectiveUvScale], [gWidth * effectiveUvScale, archTopY * effectiveUvScale],
      [gWidth * effectiveUvScale, lintelTopY * effectiveUvScale], [0, lintelTopY * effectiveUvScale]
    );

    // E. LINTEL BACK FACE - GROUP 0: Stone Masonry
    builder.addQuad(
      [jRightX + normal.x * halfThick, archTopY, jRightZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, archTopY, jLeftZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, lintelTopY, jLeftZ + normal.z * halfThick],
      [jRightX + normal.x * halfThick, lintelTopY, jRightZ + normal.z * halfThick],
      [normal.x, 0, normal.z],
      [0, archTopY * effectiveUvScale], [gWidth * effectiveUvScale, archTopY * effectiveUvScale],
      [gWidth * effectiveUvScale, lintelTopY * effectiveUvScale], [0, lintelTopY * effectiveUvScale]
    );

    // F. LINTEL TOP WALKWAY - GROUP 1: Dark Stone Floor Walkway
    builder.setGroup(1);
    builder.addQuad(
      [jLeftX - normal.x * halfThick, lintelTopY, jLeftZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, lintelTopY, jRightZ - normal.z * halfThick],
      [jRightX + normal.x * halfThick, lintelTopY, jRightZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, lintelTopY, jLeftZ + normal.z * halfThick],
      [0, 1, 0],
      [0, 0], [gWidth * effectiveUvScale * 1.5, 0],
      [gWidth * effectiveUvScale * 1.5, settings.thickness * effectiveUvScale * 1.5], [0, settings.thickness * effectiveUvScale * 1.5]
    );

    // Crenellations over the gateway lintel (outer facing)
    if (settings.crenellations) {
      let gOutwardDir = 1;
      if (isClosed && points.length >= 3) {
        const fromCenterX = ag.centerX - centroidX;
        const fromCenterZ = ag.centerZ - centroidZ;
        const dot = ag.normal.x * fromCenterX + ag.normal.z * fromCenterZ;
        gOutwardDir = dot >= 0 ? 1 : -1;
      }
      if (settings.flipCrenellations) {
        gOutwardDir = -gOutwardDir;
      }

      const outNormX = ag.normal.x * gOutwardDir;
      const outNormZ = ag.normal.z * gOutwardDir;

      const cL: [number, number, number] = [
        jLeftX + outNormX * halfThick,
        lintelTopY,
        jLeftZ + outNormZ * halfThick,
      ];
      const cR: [number, number, number] = [
        jRightX + outNormX * halfThick,
        lintelTopY,
        jRightZ + outNormZ * halfThick,
      ];
      addPointedKangara(cL, cR, [-outNormX, 0, -outNormZ], lintelTopY, gateCrenH, halfThick * 0.65);
    }

    // G. FLANKING GATEHOUSE BASTIONS (with solid top floor & crowning kangare)
    if (ag.gate.hasGatehouse !== false) {
      const ghRadius = Math.max(0.08, Math.min(0.20, settings.thickness * 0.9));
      const ghTopY = lintelTopY + 0.04; // Flanking towers rise slightly (4cm) above portal
      const flankOffsets = [-halfWidth - ghRadius * 0.8, halfWidth + ghRadius * 0.8];

      for (const off of flankOffsets) {
        const ghX = centerX + tangent.x * off;
        const ghZ = centerZ + tangent.z * off;
        const ghGroundY = sampleBilinearHeight(buffer, ghX, ghZ);
        const ghBotY = ghGroundY - embedDepth;

        // Side cylinder quads (12 segments) - GROUP 0: Stone Masonry
        builder.setGroup(0);
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

        // SOLID TOP FLOOR DISC FOR FLANKING TOWERS - GROUP 1: Dark Stone Floor
        builder.setGroup(1);
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
          builder.addTriangleIndices(ghCenterTop, i0, i1);
        }

        // CROWNING KANGARE FOR FLANKING GATEHOUSE TOWERS - GROUP 2 (inside addPointedKangara)
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
            addPointedKangara(cL, cR, unitInNorm, ghTopY, gateCrenH * 0.85, ghKThick);
          }
        }
      }
    }
  }

  return builder.build();
}

/**
 * Procedural geometry generator for Balekilla (Citadel Keep):
 * A majestic Maratha multi-tier stone fortress keep featuring:
 * - Stepped stone foundation plinth
 * - Main multi-tiered defensive stone keep body with arrow loop embrasures
 * - Overhanging corbelled rampart with authentic Murud-Janjira pointed kangare
 * - Upper watchtower sentry pavilion with four stone pillars and pyramidal roof
 * - Saffron Bhagwa Zenda flagpole at center top
 */
export function generateCitadelKeepGeometry(
  keep: CitadelKeep,
  buffer: Float32Array
): THREE.BufferGeometry {
  const builder = new GeometryBuilder();
  const scale = keep.scale || 1.0;
  const effectiveUvScale = 1.0 * BRICK_UV_MULTIPLIER;
  const embedDepth = WALL_EMBED_DEPTH * 1.5;

  const groundY = sampleBilinearHeight(buffer, keep.x, keep.z);
  const baseY = groundY - embedDepth;

  // Base dimensions (scaled by 0.5 for authentic 25cm diorama fort walls)
  const plinthHalfW = 0.18 * scale;
  const plinthH = 0.05 * scale;
  const towerHalfW = 0.14 * scale;
  const towerH = (keep.height || 0.20) * scale;
  const walkwayOverhang = 0.02 * scale;
  const walkwayHalfW = towerHalfW + walkwayOverhang;
  const walkwayH = 0.02 * scale;

  const plinthTopY = baseY + plinthH;
  const towerTopY = plinthTopY + towerH;
  const walkwayTopY = towerTopY + walkwayH;

  // Helper box with UV and normals
  const addBox = (
    cx: number,
    cz: number,
    halfX: number,
    halfZ: number,
    y0: number,
    y1: number,
    sideGroup = 0,
    topGroup = 0
  ) => {
    // 4 vertical side faces
    builder.setGroup(sideGroup);
    // Front (-Z)
    builder.addQuad(
      [cx - halfX, y0, cz - halfZ],
      [cx + halfX, y0, cz - halfZ],
      [cx + halfX, y1, cz - halfZ],
      [cx - halfX, y1, cz - halfZ],
      [0, 0, -1],
      [0, y0 * effectiveUvScale], [halfX * 2 * effectiveUvScale, y0 * effectiveUvScale],
      [halfX * 2 * effectiveUvScale, y1 * effectiveUvScale], [0, y1 * effectiveUvScale]
    );
    // Back (+Z)
    builder.addQuad(
      [cx + halfX, y0, cz + halfZ],
      [cx - halfX, y0, cz + halfZ],
      [cx - halfX, y1, cz + halfZ],
      [cx + halfX, y1, cz + halfZ],
      [0, 0, 1],
      [0, y0 * effectiveUvScale], [halfX * 2 * effectiveUvScale, y0 * effectiveUvScale],
      [halfX * 2 * effectiveUvScale, y1 * effectiveUvScale], [0, y1 * effectiveUvScale]
    );
    // Left (-X)
    builder.addQuad(
      [cx - halfX, y0, cz + halfZ],
      [cx - halfX, y0, cz - halfZ],
      [cx - halfX, y1, cz - halfZ],
      [cx - halfX, y1, cz + halfZ],
      [-1, 0, 0],
      [0, y0 * effectiveUvScale], [halfZ * 2 * effectiveUvScale, y0 * effectiveUvScale],
      [halfZ * 2 * effectiveUvScale, y1 * effectiveUvScale], [0, y1 * effectiveUvScale]
    );
    // Right (+X)
    builder.addQuad(
      [cx + halfX, y0, cz - halfZ],
      [cx + halfX, y0, cz + halfZ],
      [cx + halfX, y1, cz + halfZ],
      [cx + halfX, y1, cz - halfZ],
      [1, 0, 0],
      [0, y0 * effectiveUvScale], [halfZ * 2 * effectiveUvScale, y0 * effectiveUvScale],
      [halfZ * 2 * effectiveUvScale, y1 * effectiveUvScale], [0, y1 * effectiveUvScale]
    );
    // Top (+Y)
    builder.setGroup(topGroup);
    builder.addQuad(
      [cx - halfX, y1, cz - halfZ],
      [cx - halfX, y1, cz + halfZ],
      [cx + halfX, y1, cz + halfZ],
      [cx + halfX, y1, cz - halfZ],
      [0, 1, 0],
      [0, 0], [0, halfZ * 2 * effectiveUvScale],
      [halfX * 2 * effectiveUvScale, halfZ * 2 * effectiveUvScale], [halfX * 2 * effectiveUvScale, 0]
    );
  };

  // 1. Plinth Box (GROUP 0: Masonry)
  addBox(keep.x, keep.z, plinthHalfW, plinthHalfW, baseY, plinthTopY, 0, 0);

  // 2. Main Keep Tower Box (GROUP 0: Masonry)
  addBox(keep.x, keep.z, towerHalfW, towerHalfW, plinthTopY, towerTopY, 0, 0);

  // 3. Overhanging Corbelled Walkway (Sides: Group 0, Top Floor: Group 1 Dark Stone Floor)
  addBox(keep.x, keep.z, walkwayHalfW, walkwayHalfW, towerTopY, walkwayTopY, 0, 1);

  // 4. Kangare along Walkway Edge (GROUP 2: Dark Stone)
  const kHeight = 0.045 * scale;
  const kWidth = 0.05 * scale;
  const kThick = 0.02 * scale;
  const kangareCountPerSide = 5;

  const addKeepKangara = (
    vL: [number, number, number],
    vR: [number, number, number],
    norm: [number, number, number]
  ) => {
    builder.setGroup(2);
    const hShoulder = kHeight * 0.6;
    const hPeak = kHeight;
    const midX = (vL[0] + vR[0]) * 0.5;
    const midZ = (vL[2] + vR[2]) * 0.5;

    const v0: [number, number, number] = [vL[0], walkwayTopY, vL[2]];
    const v1: [number, number, number] = [vR[0], walkwayTopY, vR[2]];
    const v2: [number, number, number] = [vR[0], walkwayTopY + hShoulder, vR[2]];
    const v3: [number, number, number] = [midX, walkwayTopY + hPeak, midZ];
    const v4: [number, number, number] = [vL[0], walkwayTopY + hShoulder, vL[2]];

    builder.addQuad(v0, v1, v2, v4, norm, [0, 0], [1, 0], [1, 0.6], [0, 0.6]);
    builder.addTriangle(v4, v2, v3, norm, [0, 0.6], [1, 0.6], [0.5, 1.0]);
  };

  // Front & Back edges
  const stepX = (walkwayHalfW * 2) / kangareCountPerSide;
  for (let i = 0; i < kangareCountPerSide; i++) {
    const xL = keep.x - walkwayHalfW + i * stepX + 0.005;
    const xR = Math.min(keep.x + walkwayHalfW, xL + kWidth);
    // Front (-Z)
    addKeepKangara([xL, walkwayTopY, keep.z - walkwayHalfW], [xR, walkwayTopY, keep.z - walkwayHalfW], [0, 0, -1]);
    // Back (+Z)
    addKeepKangara([xR, walkwayTopY, keep.z + walkwayHalfW], [xL, walkwayTopY, keep.z + walkwayHalfW], [0, 0, 1]);
  }

  // Left & Right edges
  const stepZ = (walkwayHalfW * 2) / kangareCountPerSide;
  for (let i = 0; i < kangareCountPerSide; i++) {
    const zL = keep.z - walkwayHalfW + i * stepZ + 0.005;
    const zR = Math.min(keep.z + walkwayHalfW, zL + kWidth);
    // Left (-X)
    addKeepKangara([keep.x - walkwayHalfW, walkwayTopY, zR], [keep.x - walkwayHalfW, walkwayTopY, zL], [-1, 0, 0]);
    // Right (+X)
    addKeepKangara([keep.x + walkwayHalfW, walkwayTopY, zL], [keep.x + walkwayHalfW, walkwayTopY, zR], [1, 0, 0]);
  }

  // 5. Upper Sentry Pavilion with 4 Pillars and Pyramidal Roof
  const pavHalfW = 0.06 * scale;
  const pillarHalfW = 0.01 * scale;
  const pillarH = 0.06 * scale;
  const roofH = 0.05 * scale;
  const pavBaseY = walkwayTopY;
  const pavRoofBaseY = pavBaseY + pillarH;
  const pavApexY = pavRoofBaseY + roofH;

  // 4 Pillars (GROUP 0: Masonry)
  const offsets = [
    [-pavHalfW, -pavHalfW],
    [pavHalfW, -pavHalfW],
    [pavHalfW, pavHalfW],
    [-pavHalfW, pavHalfW],
  ];
  for (const [ox, oz] of offsets) {
    addBox(keep.x + ox, keep.z + oz, pillarHalfW, pillarHalfW, pavBaseY, pavRoofBaseY, 0, 0);
  }

  // Pyramidal Pavilion Roof (GROUP 2: Dark Stone)
  builder.setGroup(2);
  const apex: [number, number, number] = [keep.x, pavApexY, keep.z];
  const rV0: [number, number, number] = [keep.x - pavHalfW * 1.3, pavRoofBaseY, keep.z - pavHalfW * 1.3];
  const rV1: [number, number, number] = [keep.x + pavHalfW * 1.3, pavRoofBaseY, keep.z - pavHalfW * 1.3];
  const rV2: [number, number, number] = [keep.x + pavHalfW * 1.3, pavRoofBaseY, keep.z + pavHalfW * 1.3];
  const rV3: [number, number, number] = [keep.x - pavHalfW * 1.3, pavRoofBaseY, keep.z + pavHalfW * 1.3];

  // 4 triangular roof slopes
  builder.addTriangle(rV0, rV1, apex, [0, 0.7, -0.7], [0, 0], [1, 0], [0.5, 1]);
  builder.addTriangle(rV1, rV2, apex, [0.7, 0.7, 0], [0, 0], [1, 0], [0.5, 1]);
  builder.addTriangle(rV2, rV3, apex, [0, 0.7, 0.7], [0, 0], [1, 0], [0.5, 1]);
  builder.addTriangle(rV3, rV0, apex, [-0.7, 0.7, 0], [0, 0], [1, 0], [0.5, 1]);

  // 6. Central Saffron Flagpole & Bhagwa Zenda Pennant
  const poleBaseY = pavApexY;
  const poleTopY = poleBaseY + 0.08 * scale;
  const poleRadius = 0.003 * scale;
  addBox(keep.x, keep.z, poleRadius, poleRadius, poleBaseY, poleTopY, 2, 2);

  // Saffron flag pennant (swallowtail double-triangle Maratha Bhagwa Zenda)
  const flagW = 0.04 * scale;
  const flagTopY = poleTopY;
  const flagBotY = poleTopY - 0.03 * scale;
  const flagMidY = (flagTopY + flagBotY) * 0.5;

  const f0: [number, number, number] = [keep.x + poleRadius, flagTopY, keep.z];
  const f1: [number, number, number] = [keep.x + poleRadius + flagW, flagTopY - 0.015 * scale, keep.z];
  const fMid: [number, number, number] = [keep.x + poleRadius + flagW * 0.7, flagMidY, keep.z];
  const f2: [number, number, number] = [keep.x + poleRadius + flagW, flagBotY + 0.015 * scale, keep.z];
  const f3: [number, number, number] = [keep.x + poleRadius, flagBotY, keep.z];

  // Upper triangular tail
  builder.addTriangle(f0, f1, fMid, [0, 0, 1], [0, 1], [1, 1], [0.7, 0.5]);
  builder.addTriangle(fMid, f1, f0, [0, 0, -1], [0.7, 0.5], [1, 1], [0, 1]);
  // Lower triangular tail
  builder.addTriangle(f3, fMid, f2, [0, 0, 1], [0, 0], [0.7, 0.5], [1, 0]);
  builder.addTriangle(f2, fMid, f3, [0, 0, -1], [1, 0], [0.7, 0.5], [0, 0]);

  return builder.build();
}

export interface SnapResult {
  snapped: boolean;
  type: 'vertex' | 'segment' | 'terrain';
  position: [number, number, number];
  rotationY: number;
  wallId?: string;
  nodeIndex?: number;
  segmentIndex?: number;
  t?: number;
  normal?: { x: number; z: number };
  tangent?: { x: number; z: number };
  inwardNormal?: { x: number; z: number };
  outwardNormal?: { x: number; z: number };
}

/**
 * Computes magnetic snap targets along fort wall curves and vertices.
 * // shortcut: 0.45m buruj / 0.60m gate linear raycast scan, upgrade to KD-Tree spatial index if wall vertices exceed 1,000 nodes
 */
export function calculateMagneticSnap(
  stamp: FortStampType,
  pointerPos: { x: number; y: number; z: number },
  walls: WallPath[],
  activeWallId: string | null,
  buffer: Float32Array
): SnapResult {
  if (!stamp) {
    return {
      snapped: false,
      type: 'terrain',
      position: [pointerPos.x, pointerPos.y, pointerPos.z],
      rotationY: 0,
    };
  }

  // A. Citadel stamps anywhere on terrain
  if (stamp === 'citadel') {
    const gy = sampleBilinearHeight(buffer, pointerPos.x, pointerPos.z);
    return {
      snapped: true,
      type: 'terrain',
      position: [pointerPos.x, gy, pointerPos.z],
      rotationY: 0,
    };
  }

  // Sorted walls list: active wall first
  const targetWalls = activeWallId
    ? [...walls.filter((w) => w.id === activeWallId), ...walls.filter((w) => w.id !== activeWallId)]
    : walls;

  // The 3 Fortifications: Towers, The Box, and Gates ALL slide continuously along wall segments (threshold 0.35m)
  if (
    stamp === 'tower' ||
    stamp === 'box' ||
    stamp === 'gate' ||
    stamp === 'buruj' ||
    stamp === 'grand_buruj'
  ) {
    let closestDist = 0.35;
    let closestResult: SnapResult | null = null;

    for (const wall of targetWalls) {
      const segCount = wall.isClosed && wall.points.length >= 3 ? wall.points.length : wall.points.length - 1;
      for (let i = 0; i < segCount; i++) {
        const pA = wall.points[i];
        const pB = wall.points[(i + 1) % wall.points.length];
        const vx = pB.x - pA.x;
        const vz = pB.z - pA.z;
        const lenSq = vx * vx + vz * vz;
        if (lenSq < 1e-5) continue;

        const rawT = ((pointerPos.x - pA.x) * vx + (pointerPos.z - pA.z) * vz) / lenSq;
        const t = Math.max(0.05, Math.min(0.95, rawT));
        const projX = pA.x + vx * t;
        const projZ = pA.z + vz * t;
        const d = Math.hypot(projX - pointerPos.x, projZ - pointerPos.z);

        if (d < closestDist) {
          closestDist = d;
          const len = Math.sqrt(lenSq);
          const tan = { x: vx / len, z: vz / len };
          const norm = { x: -tan.z, z: tan.x };

          // Determine inward and outward normals
          let inDir = 1;
          if (wall.isClosed && wall.points.length >= 3) {
            let cX = 0, cZ = 0;
            for (const p of wall.points) { cX += p.x; cZ += p.z; }
            cX /= wall.points.length; cZ /= wall.points.length;
            inDir = (norm.x * (cX - projX) + norm.z * (cZ - projZ)) >= 0 ? 1 : -1;
          } else {
            const hPlus = sampleBilinearHeight(buffer, projX + norm.x * 0.3, projZ + norm.z * 0.3);
            const hMinus = sampleBilinearHeight(buffer, projX - norm.x * 0.3, projZ - norm.z * 0.3);
            inDir = hPlus >= hMinus ? 1 : -1;
          }
          const inNorm = { x: norm.x * inDir, z: norm.z * inDir };
          const outNorm = { x: -inNorm.x, z: -inNorm.z };

          // Compute rotationY matching user specifications:
          // Gate ghost rotation matches outward facing normal of the wall
          // Rampart Platform (box) ghost rotation matches inward facing normal into fort courtyard
          let rotY = Math.atan2(vx, vz);
          if (stamp === 'gate') {
            rotY = Math.atan2(outNorm.x, outNorm.z);
          } else if (stamp === 'box' || stamp === 'grand_buruj') {
            rotY = Math.atan2(inNorm.x, inNorm.z);
          }

          const gy = sampleBilinearHeight(buffer, projX, projZ);

          closestResult = {
            snapped: true,
            type: 'segment',
            position: [projX, gy, projZ],
            rotationY: rotY,
            wallId: wall.id,
            segmentIndex: i,
            t,
            normal: norm,
            tangent: tan,
            inwardNormal: inNorm,
            outwardNormal: outNorm,
          };
        }
      }
    }

    if (closestResult) return closestResult;
    const gy = sampleBilinearHeight(buffer, pointerPos.x, pointerPos.z);
    return {
      snapped: false,
      type: 'terrain',
      position: [pointerPos.x, gy, pointerPos.z],
      rotationY: 0,
    };
  }

  return {
    snapped: false,
    type: 'terrain',
    position: [pointerPos.x, pointerPos.y, pointerPos.z],
    rotationY: 0,
  };
}

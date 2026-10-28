import * as THREE from 'three';
import {
  TERRAIN_SIZE,
  HALF_TERRAIN_SIZE,
  TERRAIN_RESOLUTION,
  STATE_CHANNELS,
} from '../terrain/terrainBuffer';
import { WallPath, WallPoint, WallSettings, WallGate } from './wallTypes';

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
 */
export function resampleWallPointsAlongTerrain(
  points: WallPoint[],
  buffer: Float32Array,
  stepSize = 0.25
): WallPoint[] {
  if (points.length < 2) {
    return points.map((p) => ({
      x: p.x,
      y: sampleBilinearHeight(buffer, p.x, p.z),
      z: p.z,
    }));
  }

  const resampled: WallPoint[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
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

  const last = points[points.length - 1];
  resampled.push({
    x: last.x,
    y: sampleBilinearHeight(buffer, last.x, last.z),
    z: last.z,
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
 * - Terrain elevation conformity & foundation embedding
 * - Extruded wall ribbon (left face, right face, top rampart walk)
 * - Round bastions (buruj) at corners and path terminals
 * - Crenellations (kangare) along top ridge
 * - Maha Darwaza arched gateway openings & gatehouse bastions
 * - Proper UV tiling based on world meters * uvScale
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
  const uvScale = settings.uvScale;
  const embedDepth = 0.12; // Embed foundation slightly into soil to eliminate gaps on slopes

  // 1. Resample centerline points along terrain heightmap
  const resampled = resampleWallPointsAlongTerrain(points, buffer, 0.25);
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
        tx = resampled[1].x - resampled[n - 1].x;
        tz = resampled[1].z - resampled[n - 1].z;
      } else {
        tx = resampled[1].x - resampled[0].x;
        tz = resampled[1].z - resampled[0].z;
      }
    } else if (i === n - 1) {
      if (isClosed) {
        tx = resampled[0].x - resampled[n - 2].x;
        tz = resampled[0].z - resampled[n - 2].z;
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

  // Check if any gates exist
  const hasGates = gates.length > 0;
  // Compute approximate world ranges for gates so wall ribbon leaves arched portal openings
  interface GateRange {
    gate: WallGate;
    centerDist: number;
    halfWidth: number;
    centerX: number;
    centerZ: number;
    groundY: number;
    normal: { x: number; z: number };
  }

  const gateRanges: GateRange[] = [];
  if (hasGates) {
    const totalPathDist = cumulativeDist[n - 1];
    for (const g of gates) {
      // Find approximate distance along path for this gate
      const targetSeg = Math.min(points.length - 2, Math.max(0, g.segmentIndex));
      const pA = points[targetSeg];
      const pB = points[targetSeg + 1];
      const gx = pA.x + (pB.x - pA.x) * g.t;
      const gz = pA.z + (pB.z - pA.z) * g.t;

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
      const halfWidth = (g.width || 1.4) * 0.5;
      gateRanges.push({
        gate: g,
        centerDist,
        halfWidth,
        centerX: gx,
        centerZ: gz,
        groundY: sampleBilinearHeight(buffer, gx, gz),
        normal: lateralNormals[closestIdx],
      });
    }
  }

  // 3. Build wall ribbon faces between consecutive sample points
  for (let i = 0; i < n - 1; i++) {
    const pA = resampled[i];
    const pB = resampled[i + 1];
    const distA = cumulativeDist[i];
    const distB = cumulativeDist[i + 1];

    // Check if this segment is completely inside a gate opening
    let isInsideGate = false;
    for (const gr of gateRanges) {
      if (distA >= gr.centerDist - gr.halfWidth && distB <= gr.centerDist + gr.halfWidth) {
        isInsideGate = true;
        break;
      }
    }
    if (isInsideGate) continue; // Skip to leave portal opening

    const nA = lateralNormals[i];
    const nB = lateralNormals[i + 1];

    // Vertex positions: Left Bottom, Left Top, Right Bottom, Right Top
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

    const uA = distA * uvScale;
    const uB = distB * uvScale;
    const vBotA = yBotA * uvScale;
    const vTopA = yTopA * uvScale;
    const vBotB = yBotB * uvScale;
    const vTopB = yTopB * uvScale;

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
      [uA, 0], [uB, 0], [uB, settings.thickness * uvScale], [uA, settings.thickness * uvScale]
    );
  }

  // End Caps for open walls (start and end)
  if (!isClosed && n >= 2) {
    // Start Cap
    const p0 = resampled[0];
    const n0 = lateralNormals[0];
    const yB0 = p0.y - embedDepth;
    const yT0 = p0.y + wallH;
    const lb0: [number, number, number] = [p0.x - n0.x * halfThick, yB0, p0.z - n0.z * halfThick];
    const lt0: [number, number, number] = [p0.x - n0.x * halfThick, yT0, p0.z - n0.z * halfThick];
    const rb0: [number, number, number] = [p0.x + n0.x * halfThick, yB0, p0.z + n0.z * halfThick];
    const rt0: [number, number, number] = [p0.x + n0.x * halfThick, yT0, p0.z + n0.z * halfThick];

    // Outward facing tangent at start
    const d0x = -(resampled[1].x - p0.x);
    const d0z = -(resampled[1].z - p0.z);
    const d0Len = Math.hypot(d0x, d0z) || 1;
    builder.addQuad(
      rb0, lb0, lt0, rt0,
      [d0x / d0Len, 0, d0z / d0Len],
      [0, yB0 * uvScale], [settings.thickness * uvScale, yB0 * uvScale],
      [settings.thickness * uvScale, yT0 * uvScale], [0, yT0 * uvScale]
    );

    // End Cap
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
      [0, yBEnd * uvScale], [settings.thickness * uvScale, yBEnd * uvScale],
      [settings.thickness * uvScale, yTEnd * uvScale], [0, yTEnd * uvScale]
    );
  }

  // 4. Crenellations (Kangare) along top ridge
  if (settings.crenellations) {
    const crenH = settings.crenellationHeight;
    const merlonW = settings.crenellationWidth;
    const gapW = 0.22;
    const cycle = merlonW + gapW;
    const crenThick = halfThick * 0.55;

    for (let i = 0; i < n - 1; i++) {
      const pA = resampled[i];
      const pB = resampled[i + 1];
      const distA = cumulativeDist[i];
      const distB = cumulativeDist[i + 1];

      // Check if gate is here
      let isGate = false;
      for (const gr of gateRanges) {
        if (distA >= gr.centerDist - gr.halfWidth && distB <= gr.centerDist + gr.halfWidth) {
          isGate = true;
          break;
        }
      }
      if (isGate) continue;

      const segLen = distB - distA;
      if (segLen < 1e-4) continue;

      const nA = lateralNormals[i];
      const nB = lateralNormals[i + 1];

      // Merlon cycle count on this segment
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
        const mBy = pA.y + (pB.y - pA.y) * tEnd + wallH;

        const mNormX = nA.x + (nB.x - nA.x) * tStart;
        const mNormZ = nA.z + (nB.z - nA.z) * tStart;

        // Merlon Box
        const mb_lbA: [number, number, number] = [mAx - mNormX * halfThick, mAy, mAz - mNormZ * halfThick];
        const mb_ltA: [number, number, number] = [mAx - mNormX * halfThick, mAy + crenH, mAz - mNormZ * halfThick];
        const mb_rbA: [number, number, number] = [mAx - mNormX * (halfThick - crenThick), mAy, mAz - mNormZ * (halfThick - crenThick)];
        const mb_rtA: [number, number, number] = [mAx - mNormX * (halfThick - crenThick), mAy + crenH, mAz - mNormZ * (halfThick - crenThick)];

        const mb_lbB: [number, number, number] = [mBx - mNormX * halfThick, mBy, mBz - mNormZ * halfThick];
        const mb_ltB: [number, number, number] = [mBx - mNormX * halfThick, mBy + crenH, mBz - mNormZ * halfThick];
        const mb_rbB: [number, number, number] = [mBx - mNormX * (halfThick - crenThick), mBy, mBz - mNormZ * (halfThick - crenThick)];
        const mb_rtB: [number, number, number] = [mBx - mNormX * (halfThick - crenThick), mBy + crenH, mBz - mNormZ * (halfThick - crenThick)];

        // Outer face
        builder.addQuad(
          mb_lbA, mb_lbB, mb_ltB, mb_ltA,
          [-mNormX, 0, -mNormZ],
          [distA * uvScale, mAy * uvScale], [(distA + merlonW) * uvScale, mBy * uvScale],
          [(distA + merlonW) * uvScale, (mBy + crenH) * uvScale], [distA * uvScale, (mAy + crenH) * uvScale]
        );
        // Inner face
        builder.addQuad(
          mb_rbB, mb_rbA, mb_rtA, mb_rtB,
          [mNormX, 0, mNormZ],
          [(distA + merlonW) * uvScale, mBy * uvScale], [distA * uvScale, mAy * uvScale],
          [distA * uvScale, (mAy + crenH) * uvScale], [(distA + merlonW) * uvScale, (mBy + crenH) * uvScale]
        );
        // Top cap
        builder.addQuad(
          mb_ltA, mb_ltB, mb_rtB, mb_rtA,
          [0, 1, 0],
          [distA * uvScale, 0], [(distA + merlonW) * uvScale, 0],
          [(distA + merlonW) * uvScale, crenThick * uvScale], [distA * uvScale, crenThick * uvScale]
        );
      }
    }
  }

  // 5. Round Bastions (Buruj) at detected positions
  const bastionIndices = detectBastionLocations(
    points,
    isClosed,
    settings.autoBastions,
    manualBastionIndices
  );

  const bastionRadius = settings.bastionRadius;
  const radialSegments = 16;
  for (const bIdx of bastionIndices) {
    const pt = points[bIdx];
    if (!pt) continue;

    const groundY = sampleBilinearHeight(buffer, pt.x, pt.z);
    const bBotY = groundY - 0.2;
    const bTopY = groundY + wallH + 0.25; // Bastions stand proud above walls

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

      const u0 = (a0 / (Math.PI * 2)) * (bastionRadius * Math.PI * 2) * uvScale;
      const u1 = (a1 / (Math.PI * 2)) * (bastionRadius * Math.PI * 2) * uvScale;

      const v0 = bBotY * uvScale;
      const v1 = bTopY * uvScale;

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

    // Bastion top circle
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
  }

  // 6. Arched Gateways (Maha Darwaza) and Flanking Gatehouses
  for (const gr of gateRanges) {
    const { gate, centerX, centerZ, groundY, normal } = gr;
    const gWidth = gate.width || 1.4;
    const gHeight = gate.height || 2.2;
    const halfGW = gWidth * 0.5;

    // Tangent perpendicular to normal
    const tanX = -normal.z;
    const tanZ = normal.x;

    // Gate lintel arch beam connecting over the portal opening
    const lintelBotY = groundY + gHeight * 0.85;
    const lintelTopY = groundY + Math.max(wallH + 0.3, gHeight + 0.35);

    // Left and right opening jambs
    const jLeftX = centerX - tanX * halfGW;
    const jLeftZ = centerZ - tanZ * halfGW;
    const jRightX = centerX + tanX * halfGW;
    const jRightZ = centerZ + tanZ * halfGW;

    // Lintel Front Face
    builder.addQuad(
      [jLeftX - normal.x * halfThick, lintelBotY, jLeftZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, lintelBotY, jRightZ - normal.z * halfThick],
      [jRightX - normal.x * halfThick, lintelTopY, jRightZ - normal.z * halfThick],
      [jLeftX - normal.x * halfThick, lintelTopY, jLeftZ - normal.z * halfThick],
      [-normal.x, 0, -normal.z],
      [0, lintelBotY * uvScale], [gWidth * uvScale, lintelBotY * uvScale],
      [gWidth * uvScale, lintelTopY * uvScale], [0, lintelTopY * uvScale]
    );

    // Lintel Back Face
    builder.addQuad(
      [jRightX + normal.x * halfThick, lintelBotY, jRightZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, lintelBotY, jLeftZ + normal.z * halfThick],
      [jLeftX + normal.x * halfThick, lintelTopY, jLeftZ + normal.z * halfThick],
      [jRightX + normal.x * halfThick, lintelTopY, jRightZ + normal.z * halfThick],
      [normal.x, 0, normal.z],
      [0, lintelBotY * uvScale], [gWidth * uvScale, lintelBotY * uvScale],
      [gWidth * uvScale, lintelTopY * uvScale], [0, lintelTopY * uvScale]
    );

    // Lintel Under Arch Face (Soffic/Ceiling)
    builder.addQuad(
      [jLeftX - normal.x * halfThick, lintelBotY, jLeftZ - normal.z * halfThick],
      [jLeftX + normal.x * halfThick, lintelBotY, jLeftZ + normal.z * halfThick],
      [jRightX + normal.x * halfThick, lintelBotY, jRightZ + normal.z * halfThick],
      [jRightX - normal.x * halfThick, lintelBotY, jRightZ - normal.z * halfThick],
      [0, -1, 0],
      [0, 0], [settings.thickness * uvScale, 0],
      [settings.thickness * uvScale, gWidth * uvScale], [0, gWidth * uvScale]
    );

    // Flanking Gatehouse Bastions (if enabled)
    if (gate.hasGatehouse) {
      const ghRadius = 0.5;
      const ghTopY = groundY + wallH + 0.35;
      const flankOffsets = [-halfGW - ghRadius * 0.7, halfGW + ghRadius * 0.7];

      for (const off of flankOffsets) {
        const ghX = centerX + tanX * off;
        const ghZ = centerZ + tanZ * off;

        for (let r = 0; r < 12; r++) {
          const a0 = (r / 12) * Math.PI * 2;
          const a1 = ((r + 1) / 12) * Math.PI * 2;
          const x0 = ghX + Math.cos(a0) * ghRadius;
          const z0 = ghZ + Math.sin(a0) * ghRadius;
          const x1 = ghX + Math.cos(a1) * ghRadius;
          const z1 = ghZ + Math.sin(a1) * ghRadius;

          builder.addQuad(
            [x0, groundY - 0.2, z0],
            [x1, groundY - 0.2, z1],
            [x1, ghTopY, z1],
            [x0, ghTopY, z0],
            [(Math.cos(a0) + Math.cos(a1)) * 0.5, 0, (Math.sin(a0) + Math.sin(a1)) * 0.5],
            [0, 0], [0.3, 0], [0.3, ghTopY * uvScale], [0, ghTopY * uvScale]
          );
        }
      }
    }
  }

  return builder.build();
}


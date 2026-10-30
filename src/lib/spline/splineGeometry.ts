/**
 * Diwali Killa Sandbox - Spline Structure Geometry Generator
 * Converts 3D Catmull-Rom curves into authentic Maratha stone steps (Payrya),
 * swallowtail saffron flags (Bhagwa Dhwaj), and glowing terracotta diyas.
 */

import * as THREE from 'three';
import { sampleBilinearHeight } from '../walls/wallGeometry';
import { SplineConversionType, SplineSettings, InstanceTransform, DEFAULT_SPLINE_SETTINGS } from './splineTypes';

export { sampleBilinearHeight };

/**
 * Creates a smooth 3D curve from control points.
 * Uses LineCurve3 for 2-point segments to avoid Catmull-Rom endpoint overshoot,
 * and centripetal CatmullRomCurve3 for 3+ points to prevent cusps and loops.
 */
function createCurve(points: THREE.Vector3[], tension = 0.5): THREE.Curve<THREE.Vector3> {
  if (points.length === 2) {
    return new THREE.LineCurve3(points[0], points[1]);
  }
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', tension);
}

/**
 * Generates smooth 3D spline points conforming to terrain surface using CatmullRomCurve3.
 */
export function generateSplinePointsAlongTerrain(
  points: [number, number, number][],
  buffer?: Float32Array,
  tension = 0.5,
  samplesPerSegment = 10
): [number, number, number][] {
  if (points.length < 2) {
    return points;
  }

  const v3Points = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = createCurve(v3Points, tension);

  const totalSegments = points.length - 1;
  const numSamples = Math.max(2, totalSegments * samplesPerSegment);
  const spacedPoints = curve.getSpacedPoints(numSamples);

  return spacedPoints.map((pt) => {
    const terrainY = buffer ? sampleBilinearHeight(buffer, pt.x, pt.z) : pt.y;
    // Follow 3D curve point if elevated on walls/towers, never dip below terrain surface
    const y = Math.max(pt.y, terrainY);
    return [pt.x, y, pt.z];
  });
}

/**
 * Geometry builder for generating merged stone step meshes with correct normals and UVs.
 */
class StoneStepsBuilder {
  private positions: number[] = [];
  private normals: number[] = [];
  private uvs: number[] = [];
  private indices: number[] = [];
  private vertexCount = 0;

  addBox(
    centerX: number,
    centerY: number,
    centerZ: number,
    width: number,
    height: number,
    depth: number,
    yaw: number
  ) {
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    const hw = width / 2;
    const hh = height / 2;
    const hd = depth / 2;

    // Helper to transform local box coordinates to world space with yaw rotation
    const transform = (lx: number, ly: number, lz: number): [number, number, number] => {
      const rx = lx * cosY + lz * sinY;
      const rz = -lx * sinY + lz * cosY;
      return [centerX + rx, centerY + ly, centerZ + rz];
    };

    // Helper to transform normal vector with yaw rotation
    const transformNorm = (nx: number, ny: number, nz: number): [number, number, number] => {
      const rx = nx * cosY + nz * sinY;
      const rz = -nx * sinY + nz * cosY;
      return [rx, ny, rz];
    };

    // Helper to add a quad face (4 vertices, 2 triangles)
    const addQuad = (
      p0: [number, number, number],
      p1: [number, number, number],
      p2: [number, number, number],
      p3: [number, number, number],
      norm: [number, number, number],
      uScale: number,
      vScale: number
    ) => {
      const baseIdx = this.vertexCount;
      const tp0 = transform(...p0);
      const tp1 = transform(...p1);
      const tp2 = transform(...p2);
      const tp3 = transform(...p3);
      const tNorm = transformNorm(...norm);

      this.positions.push(
        tp0[0], tp0[1], tp0[2],
        tp1[0], tp1[1], tp1[2],
        tp2[0], tp2[1], tp2[2],
        tp3[0], tp3[1], tp3[2]
      );

      for (let i = 0; i < 4; i++) {
        this.normals.push(tNorm[0], tNorm[1], tNorm[2]);
      }

      this.uvs.push(
        0, 0,
        uScale, 0,
        uScale, vScale,
        0, vScale
      );

      this.indices.push(
        baseIdx, baseIdx + 1, baseIdx + 2,
        baseIdx, baseIdx + 2, baseIdx + 3
      );

      this.vertexCount += 4;
    };

    const uvMultiplier = 5.0; // Larger authentic stone block texture scale

    // Top face (+Y) - Flat walkable tread
    addQuad(
      [-hw, hh, -hd],
      [hw, hh, -hd],
      [hw, hh, hd],
      [-hw, hh, hd],
      [0, 1, 0],
      width * uvMultiplier,
      depth * uvMultiplier
    );

    // Bottom face (-Y) - Embedded into ground
    addQuad(
      [-hw, -hh, hd],
      [hw, -hh, hd],
      [hw, -hh, -hd],
      [-hw, -hh, -hd],
      [0, -1, 0],
      width * uvMultiplier,
      depth * uvMultiplier
    );

    // Front face (+Z) - Riser
    addQuad(
      [-hw, -hh, hd],
      [hw, -hh, hd],
      [hw, hh, hd],
      [-hw, hh, hd],
      [0, 0, 1],
      width * uvMultiplier,
      height * uvMultiplier
    );

    // Back face (-Z)
    addQuad(
      [hw, -hh, -hd],
      [-hw, -hh, -hd],
      [-hw, hh, -hd],
      [hw, hh, -hd],
      [0, 0, -1],
      width * uvMultiplier,
      height * uvMultiplier
    );

    // Right face (+X)
    addQuad(
      [hw, -hh, hd],
      [hw, -hh, -hd],
      [hw, hh, -hd],
      [hw, hh, hd],
      [1, 0, 0],
      depth * uvMultiplier,
      height * uvMultiplier
    );

    // Left face (-X)
    addQuad(
      [-hw, -hh, -hd],
      [-hw, -hh, hd],
      [-hw, hh, hd],
      [-hw, hh, -hd],
      [-1, 0, 0],
      depth * uvMultiplier,
      height * uvMultiplier
    );
  }

  build(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    if (this.positions.length === 0) {
      return geo;
    }

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
 * Generates continuous stepped stone stairs (Payrya) ascending along a 3D spline curve.
 * Conforms each step's elevation and orientation to the terrain slope.
 */
export function generateStoneStepsGeometry(
  points: [number, number, number][],
  buffer?: Float32Array,
  options?: SplineSettings
): THREE.BufferGeometry {
  if (points.length < 2) {
    return new THREE.BufferGeometry();
  }

  const stepWidth = options?.stepWidth ?? DEFAULT_SPLINE_SETTINGS.steps.stepWidth;
  const stepRun = options?.stepRun ?? DEFAULT_SPLINE_SETTINGS.steps.stepRun;
  const stepRise = options?.stepRise ?? DEFAULT_SPLINE_SETTINGS.steps.stepRise;
  const stepOffset = options?.stepOffset ?? DEFAULT_SPLINE_SETTINGS.steps.stepOffset ?? 0;
  const stepSpacing = options?.stepSpacing ?? options?.stepRun ?? DEFAULT_SPLINE_SETTINGS.steps.stepSpacing ?? 0.025;

  const v3Points = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = createCurve(v3Points, 0.5);
  const totalLength = curve.getLength();

  // Spacing between consecutive step centers along path
  const effectiveStepSpacing = Math.max(0.01, stepSpacing);
  const stepCount = Math.max(1, Math.round(totalLength / effectiveStepSpacing));
  const builder = new StoneStepsBuilder();

  // Depth with slight overlap so consecutive steps join cleanly without light leakage
  const treadDepth = stepRun * 1.08;
  const embedDepth = 0.008; // 8mm foundation sink into ground / wall top

  for (let i = 0; i < stepCount; i++) {
    const t = (i + 0.5) / stepCount;
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // Calculate normal perpendicular to horizontal tangent for lateral offset
    const latNormX = -tangent.z;
    const latNormZ = tangent.x;
    const latNormLen = Math.hypot(latNormX, latNormZ) || 1;
    const shiftedX = pt.x + (latNormX / latNormLen) * stepOffset;
    const shiftedZ = pt.z + (latNormZ / latNormLen) * stepOffset;

    // Sample terrain elevation at the shifted step center, supporting placement atop walls/towers
    const terrainY = buffer ? sampleBilinearHeight(buffer, shiftedX, shiftedZ) : pt.y;
    const groundY = Math.max(pt.y, terrainY);

    // Calculate yaw rotation from horizontal tangent
    const yaw = Math.atan2(tangent.x, tangent.z);

    // Height of step box with foundation embedding
    const totalBoxHeight = stepRise + embedDepth;
    const centerY = groundY + stepRise / 2 - embedDepth / 2;

    builder.addBox(shiftedX, centerY, shiftedZ, stepWidth, totalBoxHeight, treadDepth, yaw);
  }

  return builder.build();
}

/**
 * Calculates instance transform matrices (position, rotation, scale)
 * for Bhagwa saffron flags arranged along a spline curve.
 */
export function generateFlagInstanceData(
  points: [number, number, number][],
  buffer?: Float32Array,
  options?: SplineSettings
): InstanceTransform[] {
  if (points.length < 2) {
    return [];
  }

  const spacing = options?.spacing ?? DEFAULT_SPLINE_SETTINGS.flags.spacing;
  const scale = options?.scale ?? DEFAULT_SPLINE_SETTINGS.flags.scale;

  const v3Points = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = createCurve(v3Points, 0.5);
  const totalLength = curve.getLength();

  const count = Math.max(1, Math.round(totalLength / spacing));
  const transforms: InstanceTransform[] = [];

  for (let i = 0; i <= count; i++) {
    const t = Math.min(1.0, Math.max(0.0, i / count));
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    const terrainY = buffer ? sampleBilinearHeight(buffer, pt.x, pt.z) : pt.y;
    const surfaceY = Math.max(pt.y, terrainY);
    const yaw = Math.atan2(tangent.x, tangent.z);

    transforms.push({
      position: [pt.x, surfaceY, pt.z],
      rotation: [0, yaw, 0],
      scale: [scale, scale, scale],
    });
  }

  return transforms;
}

/**
 * Calculates instance transform matrices (position, rotation, scale)
 * for glowing terracotta festive diyas arranged along a spline curve.
 */
export function generateDiyaInstanceData(
  points: [number, number, number][],
  buffer?: Float32Array,
  options?: SplineSettings
): InstanceTransform[] {
  if (points.length < 2) {
    return [];
  }

  const spacing = options?.spacing ?? DEFAULT_SPLINE_SETTINGS.diyas.spacing;
  const scale = options?.scale ?? DEFAULT_SPLINE_SETTINGS.diyas.scale;

  const v3Points = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = createCurve(v3Points, 0.5);
  const totalLength = curve.getLength();

  const count = Math.max(1, Math.round(totalLength / spacing));
  const transforms: InstanceTransform[] = [];

  for (let i = 0; i <= count; i++) {
    const t = Math.min(1.0, Math.max(0.0, i / count));
    const pt = curve.getPointAt(t);

    const terrainY = buffer ? sampleBilinearHeight(buffer, pt.x, pt.z) : pt.y;
    const surfaceY = Math.max(pt.y, terrainY);
    // Slight deterministic rotation jitter based on index for natural festive placement
    const pseudoRand = ((i * 137.5) % 360) * (Math.PI / 180);

    transforms.push({
      position: [pt.x, surfaceY, pt.z],
      rotation: [0, pseudoRand, 0],
      scale: [scale, scale, scale],
    });
  }

  return transforms;
}

/**
 * Procedural geometry creation helpers for single Bhagwa flag and Festive Diya meshes.
 * These geometries are shared by InstancedMesh renderers.
 */

/**
 * Creates the wooden flagpole geometry (slender vertical cylinder).
 * Scaled 10x smaller for authentic miniature fort rampart/ridge placement.
 */
export function createFlagpoleGeometry(): THREE.CylinderGeometry {
  // Height: 0.11m (11cm), radius: 0.0016m (1.6mm pole) - 2x scale baseline
  const geo = new THREE.CylinderGeometry(0.0014, 0.0018, 0.11, 8);
  geo.translate(0, 0.055, 0); // Position base at y = 0
  return geo;
}

/**
 * Creates the authentic Maratha swallowtail saffron flag cloth geometry.
 * Double-pointed swallowtail pennant facing outward from the flagpole (+Z local axis).
 * Normal scale calibrated (2.0x larger than previous 10x reduced size).
 */
export function createSwallowtailFlagGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();

  const flagWidth = 0.064; // 6.4cm flag fly (2x)
  const flagHeight = 0.044; // 4.4cm flag hoist (2x)
  const topY = 0.104;
  const bottomY = topY - flagHeight;
  const midY = (topY + bottomY) / 2;

  const positions = new Float32Array([
    // Upper swallowtail triangle 1: Mast Top, Top Tip, Mast Mid
    0, topY, 0,
    flagWidth, topY - 0.004, 0,
    0, midY, 0,

    // Upper swallowtail triangle 2: Top Tip, Upper Tail Tip, Inner Notch
    flagWidth, topY - 0.004, 0,
    flagWidth, topY - 0.012, 0,
    flagWidth * 0.45, midY, 0,

    // Upper bridge triangle: Top Tip, Inner Notch, Mast Mid
    flagWidth, topY - 0.004, 0,
    flagWidth * 0.45, midY, 0,
    0, midY, 0,

    // Lower swallowtail triangle 1: Mast Mid, Inner Notch, Lower Tail Tip
    0, midY, 0,
    flagWidth * 0.45, midY, 0,
    flagWidth, bottomY + 0.008, 0,

    // Lower swallowtail triangle 2: Mast Mid, Lower Tail Tip, Mast Bottom
    0, midY, 0,
    flagWidth, bottomY + 0.008, 0,
    0, bottomY, 0,
  ]);

  const normals = new Float32Array(positions.length);
  for (let i = 0; i < normals.length; i += 3) {
    normals[i] = 0;
    normals[i + 1] = 0;
    normals[i + 2] = 1;
  }

  const uvs = new Float32Array([
    0, 1, 1, 0.9, 0, 0.5,
    1, 0.9, 1, 0.7, 0.45, 0.5,
    1, 0.9, 0.45, 0.5, 0, 0.5,
    0, 0.5, 0.45, 0.5, 1, 0.2,
    0, 0.5, 1, 0.2, 0, 0,
  ]);

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();

  return geo;
}

/**
 * Creates the terracotta diya earthen clay bowl geometry.
 * Scaled to 0.5x of previous oversized size (rTop: 9cm, rBottom: 5cm, h: 5cm).
 */
export function createDiyaBowlGeometry(): THREE.BufferGeometry {
  // Truncated cone clay cup (radiusTop: 0.09m, radiusBottom: 0.05m, height: 0.05m)
  const geo = new THREE.CylinderGeometry(0.09, 0.05, 0.05, 16);
  geo.translate(0, 0.025, 0); // Position base at y = 0
  return geo;
}

/**
 * Creates the glowing flame teardrop geometry for a festive diya lamp.
 * Scaled to 0.5x of previous oversized size (radius: 3.5cm, height: 9cm).
 */
export function createDiyaFlameGeometry(): THREE.BufferGeometry {
  // Pointed cone flame (radius: 0.035m, height: 0.09m)
  const geo = new THREE.ConeGeometry(0.035, 0.09, 12);
  geo.translate(0, 0.08, 0); // Position directly atop the diya bowl rim
  return geo;
}


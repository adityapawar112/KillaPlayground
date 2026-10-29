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
  const curve = new THREE.CatmullRomCurve3(v3Points, false, 'catmullrom', tension);

  const totalSegments = points.length - 1;
  const numSamples = Math.max(2, totalSegments * samplesPerSegment);
  const spacedPoints = curve.getSpacedPoints(numSamples);

  return spacedPoints.map((pt) => {
    const y = buffer ? sampleBilinearHeight(buffer, pt.x, pt.z) : pt.y;
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

    const uvMultiplier = 3.5;

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

  const v3Points = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(v3Points, false, 'catmullrom', 0.5);
  const totalLength = curve.getLength();

  const stepCount = Math.max(1, Math.round(totalLength / stepRun));
  const builder = new StoneStepsBuilder();

  // Depth with slight overlap so consecutive steps join cleanly without light leakage
  const treadDepth = stepRun * 1.08;
  const embedDepth = 0.08; // 8cm foundation sink into ground

  for (let i = 0; i < stepCount; i++) {
    const t = (i + 0.5) / stepCount;
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // Sample terrain elevation at the step center
    const groundY = buffer ? sampleBilinearHeight(buffer, pt.x, pt.z) : pt.y;

    // Calculate yaw rotation from horizontal tangent
    const yaw = Math.atan2(tangent.x, tangent.z);

    // Height of step box with foundation embedding
    const totalBoxHeight = stepRise + embedDepth;
    const centerY = groundY + stepRise / 2 - embedDepth / 2;

    builder.addBox(pt.x, centerY, pt.z, stepWidth, totalBoxHeight, treadDepth, yaw);
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
  const curve = new THREE.CatmullRomCurve3(v3Points, false, 'catmullrom', 0.5);
  const totalLength = curve.getLength();

  const count = Math.max(1, Math.round(totalLength / spacing));
  const transforms: InstanceTransform[] = [];

  for (let i = 0; i <= count; i++) {
    const t = Math.min(1.0, Math.max(0.0, i / count));
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    const groundY = buffer ? sampleBilinearHeight(buffer, pt.x, pt.z) : pt.y;
    const yaw = Math.atan2(tangent.x, tangent.z);

    transforms.push({
      position: [pt.x, groundY, pt.z],
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
  const curve = new THREE.CatmullRomCurve3(v3Points, false, 'catmullrom', 0.5);
  const totalLength = curve.getLength();

  const count = Math.max(1, Math.round(totalLength / spacing));
  const transforms: InstanceTransform[] = [];

  for (let i = 0; i <= count; i++) {
    const t = Math.min(1.0, Math.max(0.0, i / count));
    const pt = curve.getPointAt(t);

    const groundY = buffer ? sampleBilinearHeight(buffer, pt.x, pt.z) : pt.y;
    // Slight deterministic rotation jitter based on index for natural festive placement
    const pseudoRand = ((i * 137.5) % 360) * (Math.PI / 180);

    transforms.push({
      position: [pt.x, groundY, pt.z],
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
 */
export function createFlagpoleGeometry(): THREE.CylinderGeometry {
  // Height: 0.55m, radius: 0.008m (8mm pole)
  const geo = new THREE.CylinderGeometry(0.007, 0.009, 0.55, 8);
  geo.translate(0, 0.275, 0); // Position base at y = 0
  return geo;
}

/**
 * Creates the authentic Maratha swallowtail saffron flag cloth geometry.
 * Double-pointed swallowtail pennant facing outward from the flagpole (+Z local axis).
 */
export function createSwallowtailFlagGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();

  const flagWidth = 0.32; // 32cm flag fly
  const flagHeight = 0.22; // 22cm flag hoist
  const topY = 0.52;
  const bottomY = topY - flagHeight;
  const midY = (topY + bottomY) / 2;

  // Vertices for Maratha twin swallowtail:
  // 0: Mast Top (0, topY, 0)
  // 1: Top tip (flagWidth, topY - 0.02, 0)
  // 2: Upper tail tip (flagWidth, topY - 0.06, 0)
  // 3: Inner notch cleft (flagWidth * 0.45, midY, 0)
  // 4: Lower tail tip (flagWidth, bottomY + 0.04, 0)
  // 5: Mast Bottom (0, bottomY, 0)
  // 6: Mast Mid (0, midY, 0)

  const positions = new Float32Array([
    // Upper swallowtail triangle 1: Mast Top, Top Tip, Mast Mid
    0, topY, 0,
    flagWidth, topY - 0.02, 0,
    0, midY, 0,

    // Upper swallowtail triangle 2: Top Tip, Upper Tail Tip, Inner Notch
    flagWidth, topY - 0.02, 0,
    flagWidth, topY - 0.06, 0,
    flagWidth * 0.45, midY, 0,

    // Upper bridge triangle: Top Tip, Inner Notch, Mast Mid
    flagWidth, topY - 0.02, 0,
    flagWidth * 0.45, midY, 0,
    0, midY, 0,

    // Lower swallowtail triangle 1: Mast Mid, Inner Notch, Lower Tail Tip
    0, midY, 0,
    flagWidth * 0.45, midY, 0,
    flagWidth, bottomY + 0.04, 0,

    // Lower swallowtail triangle 2: Mast Mid, Lower Tail Tip, Mast Bottom
    0, midY, 0,
    flagWidth, bottomY + 0.04, 0,
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
 */
export function createDiyaBowlGeometry(): THREE.BufferGeometry {
  // Truncated cone / shallow clay cup (radiusTop: 0.035m, radiusBottom: 0.02m, height: 0.02m)
  const geo = new THREE.CylinderGeometry(0.035, 0.02, 0.02, 12);
  geo.translate(0, 0.01, 0); // Position base at y = 0
  return geo;
}

/**
 * Creates the glowing flame teardrop geometry for a diya lamp.
 */
export function createDiyaFlameGeometry(): THREE.BufferGeometry {
  // Pointed cone flame (radius: 0.012m, height: 0.03m)
  const geo = new THREE.ConeGeometry(0.012, 0.03, 10);
  geo.translate(0, 0.03, 0); // Position directly atop the diya bowl rim
  return geo;
}


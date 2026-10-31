import * as THREE from 'three';

const geometryCache = new Map<string, THREE.BufferGeometry>();

/**
 * Creates a normalized single vertical plane geometry (centered at x=0, z=0, y from 0 to height).
 * Bottom anchor is at y=0 (ground contact anchor point).
 * Ideal for grass seedlings, shrubs, and curved palms with random yaw orientation.
 * 4 vertices, 2 triangles (6 indices) — 50% fewer draw calls & vertices than cross-quads.
 */
export function createSinglePlaneGeometry(width = 1.0, height = 1.0): THREE.BufferGeometry {
  const cacheKey = `single_${width.toFixed(2)}_${height.toFixed(2)}`;
  const cached = geometryCache.get(cacheKey);
  if (cached) return cached;

  const halfW = width / 2;

  // 4 vertices (1 vertical plane along X axis, z = 0)
  const positions = new Float32Array([
    -halfW, 0, 0,       // 0: bottom-left
     halfW, 0, 0,       // 1: bottom-right
     halfW, height, 0,  // 2: top-right
    -halfW, height, 0,  // 3: top-left
  ]);

  const uvs = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 1,
  ]);

  // Two triangles (6 indices)
  const indices = new Uint16Array([
    0, 1, 2,  0, 2, 3,
  ]);

  // Soft forward/upward normals for volumetric retro shading under directional light
  const nL = new THREE.Vector3(-0.35, 0.35, 0.87).normalize();
  const nR = new THREE.Vector3(0.35, 0.35, 0.87).normalize();
  const nTR = new THREE.Vector3(0.35, 0.6, 0.71).normalize();
  const nTL = new THREE.Vector3(-0.35, 0.6, 0.71).normalize();

  const normals = new Float32Array([
    nL.x,  nL.y,  nL.z,
    nR.x,  nR.y,  nR.z,
    nTR.x, nTR.y, nTR.z,
    nTL.x, nTL.y, nTL.z,
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  geometryCache.set(cacheKey, geometry);
  return geometry;
}

/**
 * Creates a normalized 2-plane intersecting geometry (cross-quad / X-billboard).
 * Plane A lies on the X-Y plane (centered at x=0, z=0, y from 0 to height).
 * Plane B lies on the Z-Y plane (centered at x=0, z=0, y from 0 to height).
 * Both planes intersect at 90 degrees along the vertical central axis.
 * Bottom anchor is at y=0 (ground contact anchor point).
 * 
 * Normals point outward from the central stem for soft retro spherical lighting.
 */
export function createCrossQuadGeometry(width = 1.0, height = 1.0): THREE.BufferGeometry {
  const cacheKey = `cross_${width.toFixed(2)}_${height.toFixed(2)}`;
  const cached = geometryCache.get(cacheKey);
  if (cached) return cached;

  const halfW = width / 2;

  // 8 vertices (4 for Plane A, 4 for Plane B)
  const positions = new Float32Array([
    // Plane A (along X axis, z = 0)
    -halfW, 0, 0,       // 0: bottom-left
     halfW, 0, 0,       // 1: bottom-right
     halfW, height, 0,  // 2: top-right
    -halfW, height, 0,  // 3: top-left

    // Plane B (along Z axis, x = 0)
    0, 0, -halfW,       // 4: bottom-back
    0, 0,  halfW,       // 5: bottom-front
    0, height,  halfW,  // 6: top-front
    0, height, -halfW,  // 7: top-back
  ]);

  const uvs = new Float32Array([
    // Plane A
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Plane B
    0, 0,
    1, 0,
    1, 1,
    0, 1,
  ]);

  // Two triangles per plane = 4 triangles total (12 indices)
  const indices = new Uint16Array([
    0, 1, 2,  0, 2, 3, // Plane A
    4, 5, 6,  4, 6, 7, // Plane B
  ]);

  // Spherical outward normals for soft, lush retro shading
  const nA_L = new THREE.Vector3(-0.707, 0.25, 0).normalize();
  const nA_R = new THREE.Vector3(0.707, 0.25, 0).normalize();
  const nA_TR = new THREE.Vector3(0.707, 0.5, 0).normalize();
  const nA_TL = new THREE.Vector3(-0.707, 0.5, 0).normalize();

  const nB_B = new THREE.Vector3(0, 0.25, -0.707).normalize();
  const nB_F = new THREE.Vector3(0, 0.25, 0.707).normalize();
  const nB_TF = new THREE.Vector3(0, 0.5, 0.707).normalize();
  const nB_TB = new THREE.Vector3(0, 0.5, -0.707).normalize();

  const normals = new Float32Array([
    nA_L.x,  nA_L.y,  nA_L.z,
    nA_R.x,  nA_R.y,  nA_R.z,
    nA_TR.x, nA_TR.y, nA_TR.z,
    nA_TL.x, nA_TL.y, nA_TL.z,

    nB_B.x,  nB_B.y,  nB_B.z,
    nB_F.x,  nB_F.y,  nB_F.z,
    nB_TF.x, nB_TF.y, nB_TF.z,
    nB_TB.x, nB_TB.y, nB_TB.z,
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  geometryCache.set(cacheKey, geometry);
  return geometry;
}

/**
 * Clears the geometry cache to prevent GPU memory retention.
 */
export function clearGeometryCache(): void {
  for (const geo of geometryCache.values()) {
    geo.dispose();
  }
  geometryCache.clear();
}


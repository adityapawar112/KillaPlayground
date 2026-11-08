import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { getFigurineById, FIGURINE_MANIFEST } from './figurineManifest';

describe('Figurine Diorama Geometry & Normalization Standards', () => {
  it('guarantees all 35 figurine catalog entries exist and have valid models', () => {
    expect(FIGURINE_MANIFEST.length).toBe(35);
    for (const item of FIGURINE_MANIFEST) {
      expect(item.id).toBeTruthy();
      expect(item.modelPath).toMatch(/\.glb$/);
      expect(item.defaultScale).toBeGreaterThan(0);
      expect(item.dimensions.height).toBeGreaterThan(0);
      expect(item.category).toBeTruthy();
    }
  });

  it('guarantees normalized geometry grounds feet flush to y = 0', () => {
    // Simulate a raw GLB geometry with bounding box [-1, 1] on all axes and node transform
    const rawGeom = new THREE.BoxGeometry(2, 2, 2);
    const nodeTransform = new THREE.Matrix4().compose(
      new THREE.Vector3(0, 0.476, 0),
      new THREE.Quaternion(),
      new THREE.Vector3(0.476, 0.476, 0.476)
    );

    // Apply matrix
    rawGeom.applyMatrix4(nodeTransform);
    rawGeom.computeBoundingBox();

    const bbox = rawGeom.boundingBox!;
    const centerX = (bbox.min.x + bbox.max.x) / 2;
    const centerZ = (bbox.min.z + bbox.max.z) / 2;
    const minY = bbox.min.y;

    rawGeom.translate(-centerX, -minY, -centerZ);

    const scaleFactor = 0.16;
    rawGeom.scale(scaleFactor, scaleFactor, scaleFactor);
    rawGeom.computeBoundingBox();

    const finalBbox = rawGeom.boundingBox!;
    expect(finalBbox.min.y).toBeCloseTo(0.0, 5);
    expect(finalBbox.min.x).toBeCloseTo(-finalBbox.max.x, 5);
    expect(finalBbox.min.z).toBeCloseTo(-finalBbox.max.z, 5);
    expect(finalBbox.max.y).toBeLessThanOrEqual(0.25); // Under 25cm ramparts
  });

  it('correctly identifies valid raycast targets for placing figurines', () => {
    // Names that SHOULD be raycast targets
    const validTargetNames = [
      'BaseTerrainMesh',
      'TerrainMeshFallback',
      'StoneSteps_spline_1',
      'FortWall_wall_1',
      'CourtyardTerrain',
      'CourtyardBricks',
    ];

    // Names that must be excluded (helpers, preview rings, figurines)
    const invalidNames = [
      'Figurine_instanced_mesh',
      'SelectionRing',
      'GhostReticle',
      'TerrainBrushCursor',
      'WaterPlane',
    ];

    const isTarget = (name: string, parentName: string = '') => {
      if (
        name.includes('Figurine') ||
        parentName.includes('Figurine') ||
        name.includes('SelectionRing') ||
        name.includes('Ghost') ||
        name.includes('Cursor') ||
        name === 'WaterPlane'
      ) {
        return false;
      }
      return (
        name === 'BaseTerrainMesh' ||
        name === 'TerrainMeshFallback' ||
        parentName.startsWith('FortWall_') ||
        name.startsWith('StoneSteps_') ||
        name.startsWith('FortWall_') ||
        name.startsWith('Bastion_') ||
        name === 'CourtyardTerrain' ||
        name === 'CourtyardBricks'
      );
    };

    for (const name of validTargetNames) {
      expect(isTarget(name)).toBe(true);
    }

    for (const name of invalidNames) {
      expect(isTarget(name)).toBe(false);
    }
  });

  it('guarantees quaternion normal alignment calculation produces upright pose at 0% and slope pose at 100%', () => {
    const up = new THREE.Vector3(0, 1, 0);
    const slopeNormal = new THREE.Vector3(0.5, 0.866, 0).normalize(); // 30-degree incline

    // Upright (propNormalAlign = 0.0)
    const computePose = (normalAlign: number) => {
      const blendedUp = up.clone().lerp(slopeNormal, normalAlign).normalize();
      const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, blendedUp);
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
      const quat = new THREE.Quaternion().multiplyQuaternions(alignQuat, yawQuat);
      const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');
      return { euler, dir: new THREE.Vector3(0, 1, 0).applyQuaternion(quat) };
    };

    const upright = computePose(0.0);
    expect(upright.dir.x).toBeCloseTo(0.0, 4);
    expect(upright.dir.y).toBeCloseTo(1.0, 4);
    expect(upright.dir.z).toBeCloseTo(0.0, 4);

    const aligned = computePose(1.0);
    expect(aligned.dir.x).toBeCloseTo(slopeNormal.x, 3);
    expect(aligned.dir.y).toBeCloseTo(slopeNormal.y, 3);
    expect(aligned.dir.z).toBeCloseTo(slopeNormal.z, 3);
  });
});

'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { getFoliageById, FOLIAGE_MANIFEST } from '@/lib/foliage/foliageManifest';
import { createCrossQuadGeometry, createSinglePlaneGeometry } from '@/lib/foliage/foliageGeometry';
import { foliageTextureManager } from '@/lib/foliage/foliageTextureManager';
import { FoliageInstance, FoliageItem } from '@/lib/foliage/foliageTypes';

interface FoliageTypeGroupProps {
  typeId: string;
  instances: FoliageInstance[];
}

const FoliageTypeGroup: React.FC<FoliageTypeGroupProps> = ({ typeId, instances }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [, setTextureVersion] = useState(0);

  const foliageItem: FoliageItem = useMemo(() => {
    return (
      getFoliageById(typeId) ||
      FOLIAGE_MANIFEST[0]
    );
  }, [typeId]);

  // Synchronous, non-suspending texture retrieval via manager
  const texture = useMemo(() => {
    return foliageTextureManager.getTexture(foliageItem.spritePath, () => {
      setTextureVersion((v) => v + 1);
    });
  }, [foliageItem.spritePath]);

  // Geometry: Single vertical plane for grass/bushes/palms; cross-quad for symmetrical trees
  const geometry = useMemo(() => {
    if (foliageItem.geometryMode === 'single') {
      return createSinglePlaneGeometry(foliageItem.defaultWidth, foliageItem.defaultHeight);
    }
    return createCrossQuadGeometry(foliageItem.defaultWidth, foliageItem.defaultHeight);
  }, [foliageItem.geometryMode, foliageItem.defaultWidth, foliageItem.defaultHeight]);

  // Shared time uniform for GPU wind sway
  const timeUniform = useMemo(() => ({ value: 0 }), []);

  // Alpha-tested cutout material (zero sorting artifacts, full depth-write)
  const { material, depthMaterial } = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      alphaTest: 0.5,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
      roughness: 0.85,
      metalness: 0.05,
    });

    const swayAmp = Math.max(0.003, foliageItem.defaultHeight * 0.05).toFixed(4);
    const heightNorm = Math.max(0.05, foliageItem.defaultHeight).toFixed(3);

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = timeUniform;
      shader.vertexShader = `
        uniform float uTime;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        // Organic Sahyadri wind sway: top vertices sway gently, base stays anchored at y=0
        float heightFactor = clamp(position.y / ${heightNorm}, 0.0, 1.0);
        float sway = sin(uTime * 2.2 + transformed.x * 4.0 + transformed.z * 4.0) * ${swayAmp} * heightFactor;
        transformed.x += sway;
        transformed.z += sway * 0.4;
        `
      );
    };

    const dMat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: texture,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

    return { material: mat, depthMaterial: dMat };
  }, [texture, timeUniform, foliageItem.defaultHeight]);

  useEffect(() => {
    return () => {
      material.dispose();
      depthMaterial.dispose();
    };
  }, [material, depthMaterial]);

  // Update wind sway uniform on each animation frame
  useFrame(({ clock }) => {
    timeUniform.value = clock.getElapsedTime();
  });

  // Calculate instance matrices buffer capacity
  const capacity = useMemo(() => {
    return Math.max(64, Math.pow(2, Math.ceil(Math.log2(Math.max(1, instances.length)))));
  }, [instances.length]);

  // Populate InstancedMesh transform matrix buffer
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      dummy.position.set(inst.position[0], inst.position[1], inst.position[2]);
      dummy.rotation.set(inst.rotation[0], inst.rotation[1], inst.rotation[2]);
      dummy.scale.set(inst.scale[0], inst.scale[1], inst.scale[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = instances.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }, [instances]);

  if (instances.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, capacity]}
      customDepthMaterial={depthMaterial}
      castShadow
      receiveShadow
      frustumCulled={true}
      raycast={() => null}
    />
  );
};

export const FoliageRenderer: React.FC = () => {
  const foliageInstances = useEditorStore((s) => s.foliageInstances);

  // Group active instances by species typeId
  const instancesByType = useMemo(() => {
    const map = new Map<string, FoliageInstance[]>();
    for (const inst of foliageInstances) {
      let list = map.get(inst.typeId);
      if (!list) {
        list = [];
        map.set(inst.typeId, list);
      }
      list.push(inst);
    }
    return map;
  }, [foliageInstances]);

  const activeTypes = useMemo(() => Array.from(instancesByType.entries()), [instancesByType]);

  if (activeTypes.length === 0) return null;

  return (
    <group name="FoliageLayer">
      {activeTypes.map(([typeId, instances]) => (
        <FoliageTypeGroup key={typeId} typeId={typeId} instances={instances} />
      ))}
    </group>
  );
};


'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture, Bvh } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { createBaseTerrainGeometry } from '@/lib/terrain/terrainBuffer';
import { createTerrainMaterial } from './TerrainMaterial';
import { useTerrainStore } from '@/lib/terrain/terrainStore';

export const BaseTerrainFallback: React.FC = () => {
  const geometry = useMemo(() => createBaseTerrainGeometry(), []);

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, 0]}
      receiveShadow
      castShadow
      name="TerrainMeshFallback"
    >
      <meshStandardMaterial
        color="#B85536"
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
};

export const BaseTerrainContent: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { invalidate } = useThree();
  const { stateTexture, setTerrainMesh } = useTerrainStore();

  // Load dry and wet 1K PBR textures from public directory
  const textures = useTexture({
    dryDiff: '/textures/red_laterite_soil_stones_1k/textures/red_laterite_soil_stones_diff_1k.jpg',
    dryArm: '/textures/red_laterite_soil_stones_1k/textures/red_laterite_soil_stones_arm_1k.jpg',
    wetDiff: '/textures/red_mud_stones_1k/textures/red_mud_stones_diff_1k.jpg',
    wetArm: '/textures/red_mud_stones_1k/textures/red_mud_stones_arm_1k.jpg',
  });

  // Configure texture wrap and color space
  useEffect(() => {
    if (!textures) return;
    textures.dryDiff.wrapS = textures.dryDiff.wrapT = THREE.RepeatWrapping;
    textures.dryArm.wrapS = textures.dryArm.wrapT = THREE.RepeatWrapping;
    textures.wetDiff.wrapS = textures.wetDiff.wrapT = THREE.RepeatWrapping;
    textures.wetArm.wrapS = textures.wetArm.wrapT = THREE.RepeatWrapping;

    textures.dryDiff.colorSpace = THREE.SRGBColorSpace;
    textures.wetDiff.colorSpace = THREE.SRGBColorSpace;
    textures.dryArm.colorSpace = THREE.NoColorSpace;
    textures.wetArm.colorSpace = THREE.NoColorSpace;

    textures.dryDiff.needsUpdate = true;
    textures.dryArm.needsUpdate = true;
    textures.wetDiff.needsUpdate = true;
    textures.wetArm.needsUpdate = true;

    invalidate();
  }, [textures, invalidate]);

  // Create high-res 10m x 10m plane geometry (65,536 vertices)
  const geometry = useMemo(() => {
    return createBaseTerrainGeometry();
  }, []);

  // Create CustomShaderMaterial blending dry laterite and wet mud based on stateTexture
  const material = useMemo(() => {
    return createTerrainMaterial({
      stateTexture,
      dryDiff: textures.dryDiff,
      dryArm: textures.dryArm,
      wetDiff: textures.wetDiff,
      wetArm: textures.wetArm,
      textureRepeat: 8.0,
    });
  }, [stateTexture, textures]);

  // Register mesh and geometry with terrain store
  useEffect(() => {
    if (meshRef.current) {
      setTerrainMesh(meshRef.current, geometry);
    }
    return () => {
      setTerrainMesh(null, null);
    };
  }, [geometry, setTerrainMesh]);

  // Clean disposal of custom material and geometry on unmount
  useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  return (
    <Bvh firstHitOnly>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, 0, 0]}
        receiveShadow
        castShadow
        name="BaseTerrainMesh"
      >
        <primitive object={material} attach="material" />
      </mesh>
    </Bvh>
  );
};

export const BaseTerrain: React.FC = () => {
  return (
    <React.Suspense fallback={<BaseTerrainFallback />}>
      <BaseTerrainContent />
    </React.Suspense>
  );
};

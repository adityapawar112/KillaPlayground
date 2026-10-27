'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture, Bvh } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { createBaseTerrainGeometry, syncStateToGeometry } from '@/lib/terrain/terrainBuffer';
import { createTerrainMaterial } from './TerrainMaterial';
import { useTerrainStore } from '@/lib/terrain/terrainStore';

export const BaseTerrainFallback: React.FC = () => {
  const geometry = useMemo(() => {
    const geo = createBaseTerrainGeometry();
    const { stateBuffer } = useTerrainStore.getState();
    syncStateToGeometry(stateBuffer, geo);
    return geo;
  }, []);

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
  const { stateTexture, stateBuffer, lastUpdated, setTerrainMesh } = useTerrainStore();

  // Load PBR texture maps per user specifications:
  // - walkable: red_laterite_soil_stones_1k (flat/walkable surfaces)
  // - cliff: rocks_ground_06_1k (slopes steeper than walkable surface)
  // - cracked: cracked_red_ground_1k (wet soil / reshaped dry soil)
  // - path: muddy_tracks_1k (foliage paths)
  // - grass: rocky_terrain_02_1k (foliage grass / moss)
  const textures = useTexture({
    walkableDiff: '/textures/red_laterite_soil_stones_1k/textures/red_laterite_soil_stones_diff_1k.jpg',
    walkableArm: '/textures/red_laterite_soil_stones_1k/textures/red_laterite_soil_stones_arm_1k.jpg',
    walkableNor: '/textures/red_laterite_soil_stones_1k/textures/red_laterite_soil_stones_nor_gl_1k.png',
    cliffDiff: '/textures/rocks_ground_06_1k/textures/rocks_ground_06_diff_1k.jpg',
    cliffArm: '/textures/rocks_ground_06_1k/textures/rocks_ground_06_arm_1k.jpg',
    cliffNor: '/textures/rocks_ground_06_1k/textures/rocks_ground_06_nor_gl_1k.png',
    crackedDiff: '/textures/cracked_red_ground_1k/textures/cracked_red_ground_diff_1k.jpg',
    crackedArm: '/textures/cracked_red_ground_1k/textures/cracked_red_ground_arm_1k.jpg',
    crackedNor: '/textures/cracked_red_ground_1k/textures/cracked_red_ground_nor_gl_1k.png',
    pathDiff: '/textures/muddy_tracks_1k/textures/muddy_tracks_diff_1k.jpg',
    pathArm: '/textures/muddy_tracks_1k/textures/muddy_tracks_arm_1k.jpg',
    pathNor: '/textures/muddy_tracks_1k/textures/muddy_tracks_nor_gl_1k.png',
    grassDiff: '/textures/rocky_terrain_02_1k/textures/rocky_terrain_02_diff_1k.jpg',
    grassArm: '/textures/rocky_terrain_02_1k/textures/rocky_terrain_02_arm_1k.jpg',
    grassNor: '/textures/rocky_terrain_02_1k/textures/rocky_terrain_02_nor_gl_1k.png',
  });

  // Configure texture wrap and color space
  useEffect(() => {
    if (!textures) return;

    const diffMaps = [
      textures.walkableDiff,
      textures.cliffDiff,
      textures.crackedDiff,
      textures.pathDiff,
      textures.grassDiff,
    ];

    const linearMaps = [
      textures.walkableArm,
      textures.walkableNor,
      textures.cliffArm,
      textures.cliffNor,
      textures.crackedArm,
      textures.crackedNor,
      textures.pathArm,
      textures.pathNor,
      textures.grassArm,
      textures.grassNor,
    ];

    diffMaps.forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });

    linearMaps.forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.NoColorSpace;
      tex.needsUpdate = true;
    });

    invalidate();
  }, [textures, invalidate]);

  // Create high-res 10m x 10m plane geometry (65,536 vertices) initialized with current terrain height
  const geometry = useMemo(() => {
    const geo = createBaseTerrainGeometry();
    syncStateToGeometry(stateBuffer, geo);
    return geo;
  }, [stateBuffer]);

  // Sync geometry and refit BVH whenever state buffer changes (blueprint load or sculpt)
  useEffect(() => {
    syncStateToGeometry(stateBuffer, geometry);
    const bvh = (geometry as unknown as { boundsTree?: { refit: () => void } }).boundsTree;
    if (bvh) bvh.refit();
    invalidate();
  }, [lastUpdated, stateBuffer, geometry, invalidate]);

  // Create slope-aware CustomShaderMaterial
  const material = useMemo(() => {
    return createTerrainMaterial({
      stateTexture,
      walkableDiff: textures.walkableDiff,
      walkableArm: textures.walkableArm,
      walkableNor: textures.walkableNor,
      cliffDiff: textures.cliffDiff,
      cliffArm: textures.cliffArm,
      cliffNor: textures.cliffNor,
      crackedDiff: textures.crackedDiff,
      crackedArm: textures.crackedArm,
      crackedNor: textures.crackedNor,
      pathDiff: textures.pathDiff,
      pathArm: textures.pathArm,
      pathNor: textures.pathNor,
      grassDiff: textures.grassDiff,
      grassArm: textures.grassArm,
      grassNor: textures.grassNor,
      textureRepeat: 8.0,
      cliffRepeat: 6.0,
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

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
  const { gl, invalidate } = useThree();
  const { stateTexture, stateBuffer, lastUpdated, setTerrainMesh } = useTerrainStore();

  // Load retro pixel-art PBR texture maps (Flavor A: Crisp PS1 / Valheim modern retro diorama):
  // - walkable: Dirt_03 (chunky reddish-brown soil with pebbles)
  // - cliff: Rock_02 (Deccan basalt rock with blocky cliff escarpments)
  // - cracked: Dirt_02 (dark glistening wet mud when watered)
  // - path: Gravel_06 (stone gravel pathways)
  // - grass: Grass_01 (chunky sprouting mustard greens / halim)
  const textures = useTexture({
    walkableDiff: '/textures/Dirt/Dirt_03/Dirt_03_basecolor.png',
    walkableArm: '/textures/Dirt/Dirt_03/Dirt_03_arm.png',
    walkableNor: '/textures/Dirt/Dirt_03/Dirt_03_normal.png',
    walkableDisp: '/textures/Dirt/Dirt_03/Dirt_03_height.png',
    cliffDiff: '/textures/Rock/Rock_02/Rock_02_basecolor.png',
    cliffArm: '/textures/Rock/Rock_02/Rock_02_arm.png',
    cliffNor: '/textures/Rock/Rock_02/Rock_02_normal.png',
    cliffDisp: '/textures/Rock/Rock_02/Rock_02_height.png',
    crackedDiff: '/textures/Dirt/Dirt_02/Dirt_02_basecolor.png',
    crackedArm: '/textures/Dirt/Dirt_02/Dirt_02_arm.png',
    crackedNor: '/textures/Dirt/Dirt_02/Dirt_02_normal.png',
    pathDiff: '/textures/Gravel/Gravel_06/Gravel_06_basecolor.png',
    pathArm: '/textures/Gravel/Gravel_06/Gravel_06_arm.png',
    pathNor: '/textures/Gravel/Gravel_06/Gravel_06_normal.png',
    grassDiff: '/textures/Grass/Grass_01/Grass_01_basecolor.png',
    grassArm: '/textures/Grass/Grass_01/Grass_01_arm.png',
    grassNor: '/textures/Grass/Grass_01/Grass_01_normal.png',
  });

  // Configure retro texture filtering: NearestFilter + no mipmaps for crisp, pixel-perfect PS1/Valheim aesthetic
  useEffect(() => {
    if (!textures) return;

    const allTextures = [
      textures.walkableDiff,
      textures.walkableArm,
      textures.walkableNor,
      textures.walkableDisp,
      textures.cliffDiff,
      textures.cliffArm,
      textures.cliffNor,
      textures.cliffDisp,
      textures.crackedDiff,
      textures.crackedArm,
      textures.crackedNor,
      textures.pathDiff,
      textures.pathArm,
      textures.pathNor,
      textures.grassDiff,
      textures.grassArm,
      textures.grassNor,
    ];

    allTextures.forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
    });

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
      textures.walkableDisp,
      textures.cliffArm,
      textures.cliffNor,
      textures.cliffDisp,
      textures.crackedArm,
      textures.crackedNor,
      textures.pathArm,
      textures.pathNor,
      textures.grassArm,
      textures.grassNor,
    ];

    diffMaps.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });

    linearMaps.forEach((tex) => {
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

  // Create slope-aware CustomShaderMaterial with height blending and view-space normals
  const material = useMemo(() => {
    return createTerrainMaterial({
      stateTexture,
      walkableDiff: textures.walkableDiff,
      walkableArm: textures.walkableArm,
      walkableNor: textures.walkableNor,
      walkableDisp: textures.walkableDisp,
      cliffDiff: textures.cliffDiff,
      cliffArm: textures.cliffArm,
      cliffNor: textures.cliffNor,
      cliffDisp: textures.cliffDisp,
      crackedDiff: textures.crackedDiff,
      crackedArm: textures.crackedArm,
      crackedNor: textures.crackedNor,
      pathDiff: textures.pathDiff,
      pathArm: textures.pathArm,
      pathNor: textures.pathNor,
      grassDiff: textures.grassDiff,
      grassArm: textures.grassArm,
      grassNor: textures.grassNor,
      textureRepeat: 16.0,
      cliffRepeat: 12.0,
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

'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTexture, Bvh } from '@react-three/drei';
import { useThree, ThreeEvent } from '@react-three/fiber';
import {
  createBaseTerrainGeometry,
  syncStateToGeometry,
  TerrainBrushOptions,
} from '@/lib/terrain/terrainBuffer';
import { createTerrainMaterial } from './TerrainMaterial';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { useEditorStore } from '@/lib/state/useEditorStore';

/**
 * 3D Visual Brush Ring Cursor that tracks pointer raycast hit on the terrain surface.
 */
interface TerrainBrushCursorProps {
  position: [number, number, number];
  radius: number;
  subTool: 'elevate' | 'lower' | 'plateau' | 'smooth' | 'pond';
  visible: boolean;
}

const TerrainBrushCursor: React.FC<TerrainBrushCursorProps> = ({
  position,
  radius,
  subTool,
  visible,
}) => {
  const color = useMemo(() => {
    switch (subTool) {
      case 'elevate':
        return '#E85D04'; // Bhagwa saffron
      case 'lower':
        return '#8F4938'; // Burnt clay
      case 'plateau':
        return '#B58B63'; // Camel stone
      case 'smooth':
        return '#777A57'; // Olive sage
      case 'pond':
        return '#0284C7'; // Tarpaulin blue
      default:
        return '#E85D04';
    }
  }, [subTool]);

  if (!visible) return null;

  return (
    <group position={[position[0], position[1] + 0.02, position[2]]}>
      {/* Outer Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={999}>
        <ringGeometry args={[Math.max(0.05, radius - 0.04), radius, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.85}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Center Reticle Point */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={999}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const BaseTerrainFallback: React.FC = () => {
  const geometry = useMemo(() => {
    const geo = createBaseTerrainGeometry();
    const { stateBuffer } = useTerrainStore.getState();
    syncStateToGeometry(stateBuffer, geo);
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

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
  const isSculptingRef = useRef(false);
  const [cursorPos, setCursorPos] = useState<[number, number, number]>([0, 0, 0]);
  const [cursorVisible, setCursorVisible] = useState(false);

  const { gl, invalidate } = useThree();
  const rawControls = useThree((state) => state.controls);
  const controls = rawControls as unknown as { enabled: boolean } | null;

  const { stateTexture, lastUpdated, setTerrainMesh, sculptTerrain, pushUndo } = useTerrainStore();
  const activeTool = useEditorStore((s) => s.activeTool);
  const terrainSubTool = useEditorStore((s) => s.terrainSubTool);
  const brushRadius = useEditorStore((s) => s.brushRadius);

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
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
    });

    linearMaps.forEach((tex) => {
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
    });

    invalidate();
  }, [textures, invalidate]);

  // Create high-res 10m x 10m plane geometry (65,536 vertices) initialized with current terrain height
  const geometry = useMemo(() => {
    return createBaseTerrainGeometry();
  }, []);

  // Request render when terrain state updates (state sync and BVH refit are handled by terrainStore)
  useEffect(() => {
    invalidate();
  }, [lastUpdated, invalidate]);

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

  // Clean disposal of custom material on material swap / unmount
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  // Clean disposal of terrain geometry strictly on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Execute direct terrain sculpting with smooth radial falloff
  const executeSculpt = useCallback(
    (hitPoint: THREE.Vector3) => {
      const editor = useEditorStore.getState();
      if (editor.mudLocked) return;

      const opts: TerrainBrushOptions = {
        operation: editor.terrainSubTool,
        radius: editor.brushRadius,
        strength: editor.brushStrength * 0.15,
        targetHeight: editor.plateauHeight,
        maxHeight: 3.5,
        minHeight: 0.0,
      };

      const modified = sculptTerrain(hitPoint.x, hitPoint.z, opts);
      if (modified) {
        invalidate();
      }
    },
    [sculptTerrain, invalidate]
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const editor = useEditorStore.getState();
      if (editor.activeTool !== 'terrain' || e.button !== 0 || e.altKey) {
        return;
      }
      e.stopPropagation();

      // Push undo snapshot before applying the stroke
      pushUndo();
      isSculptingRef.current = true;

      // Disable camera orbit while dragging to sculpt
      if (controls) {
        controls.enabled = false;
      }

      setCursorPos([e.point.x, e.point.y, e.point.z]);
      setCursorVisible(true);
      executeSculpt(e.point);
    },
    [controls, executeSculpt, pushUndo]
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const editor = useEditorStore.getState();
      if (editor.activeTool !== 'terrain') {
        if (cursorVisible) setCursorVisible(false);
        return;
      }

      setCursorPos([e.point.x, e.point.y, e.point.z]);
      if (!cursorVisible) setCursorVisible(true);

      if (isSculptingRef.current) {
        e.stopPropagation();
        executeSculpt(e.point);
      }
    },
    [cursorVisible, executeSculpt]
  );

  const handlePointerUp = useCallback(() => {
    if (isSculptingRef.current) {
      isSculptingRef.current = false;
      if (controls) {
        controls.enabled = true;
      }
      invalidate();
    }
  }, [controls, invalidate]);

  const handlePointerLeave = useCallback(() => {
    if (!isSculptingRef.current) {
      setCursorVisible(false);
    }
  }, []);

  // Global window pointerup to catch pointer released outside mesh
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isSculptingRef.current) {
        isSculptingRef.current = false;
        if (controls) {
          controls.enabled = true;
        }
        invalidate();
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [controls, invalidate]);

  return (
    <>
      <Bvh firstHitOnly>
        <mesh
          ref={meshRef}
          geometry={geometry}
          position={[0, 0, 0]}
          receiveShadow
          castShadow
          name="BaseTerrainMesh"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <primitive object={material} attach="material" />
        </mesh>
      </Bvh>

      <TerrainBrushCursor
        position={cursorPos}
        radius={brushRadius}
        subTool={terrainSubTool}
        visible={cursorVisible && activeTool === 'terrain'}
      />
    </>
  );
};

export const BaseTerrain: React.FC = () => {
  return (
    <React.Suspense fallback={<BaseTerrainFallback />}>
      <BaseTerrainContent />
    </React.Suspense>
  );
};

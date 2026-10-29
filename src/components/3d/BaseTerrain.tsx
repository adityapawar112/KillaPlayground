'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTexture, Bvh } from '@react-three/drei';
import { useThree, ThreeEvent } from '@react-three/fiber';
import {
  createBaseTerrainGeometry,
  syncStateToGeometry,
  TerrainBrushOptions,
  getTerrainNormalAt,
} from '@/lib/terrain/terrainBuffer';
import { createTerrainMaterial } from './TerrainMaterial';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { useEditorStore, TerrainSubTool } from '@/lib/state/useEditorStore';
import { calculateMagneticSnap } from '@/lib/walls/wallGeometry';

/**
 * 3D Visual Brush Ring Cursor that tracks pointer raycast hit and aligns with the terrain surface normal.
 */
interface TerrainBrushCursorProps {
  position: [number, number, number];
  normal: [number, number, number];
  radius: number;
  subTool: TerrainSubTool;
  visible: boolean;
}

const TerrainBrushCursor: React.FC<TerrainBrushCursorProps> = ({
  position,
  normal,
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
      case 'slope':
        return '#D97706'; // Terracotta gold
      case 'soil':
        return '#4B382C'; // Natural Sahyadri soil
      default:
        return '#E85D04';
    }
  }, [subTool]);

  const { quat, offsetPos } = useMemo(() => {
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 0, 1);
    const n = new THREE.Vector3(normal[0], normal[1], normal[2]).normalize();
    if (n.lengthSq() < 0.001) n.set(0, 1, 0);
    q.setFromUnitVectors(up, n);

    // Offset along surface normal to completely eliminate z-fighting on slopes and cliffs
    const pos: [number, number, number] = [
      position[0] + n.x * 0.025,
      position[1] + n.y * 0.025,
      position[2] + n.z * 0.025,
    ];
    return { quat: q, offsetPos: pos };
  }, [position[0], position[1], position[2], normal[0], normal[1], normal[2]]);

  if (!visible) return null;

  return (
    <group position={offsetPos} quaternion={quat}>
      {/* Outer Ring */}
      <mesh renderOrder={999}>
        <ringGeometry args={[Math.max(0.05, radius - 0.04), radius, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.88}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Center Reticle Point */}
      <mesh renderOrder={999}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.92}
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
  const isDrawingWallRef = useRef(false);
  const lastWallPointRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const slopeAnchorRef = useRef<{ x: number; z: number; height: number } | null>(null);
  const pondOriginRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<[number, number, number]>([0, 0, 0]);
  const [cursorNormal, setCursorNormal] = useState<[number, number, number]>([0, 1, 0]);
  const [cursorVisible, setCursorVisible] = useState(false);

  const { camera, invalidate } = useThree();
  const rawControls = useThree((state) => state.controls);
  const controls = rawControls as unknown as { enabled: boolean } | null;

  const { stateBuffer, stateTexture, lastUpdated, setTerrainMesh, sculptTerrain, pushUndo } = useTerrainStore();
  const activeTool = useEditorStore((s) => s.activeTool);
  const terrainSubTool = useEditorStore((s) => s.terrainSubTool);
  const brushRadius = useEditorStore((s) => s.brushRadius);

  // Load retro pixel-art PBR texture maps (Flavor A: Crisp PS1 / Valheim modern retro diorama):
  // Load authentic Binbun Retroground PBR textures (10 essential maps, strictly <= 16 WebGL texture units budget):
  // - walkable: Dirt_03 (chunky reddish-brown soil with pebbles)
  // - cliff: Rock_02 (Deccan basalt rock with blocky cliff escarpments)
  // - cracked: Dirt_02 (dark glistening wet mud when watered)
  // - grass: Grass_01 (chunky sprouting mustard greens / halim)
  // - water: blue_tarp (authentic Diwali Killa blue plastic tarpaulin sheet lining)
  const textures = useTexture({
    walkableDiff: '/textures/Dirt/Dirt_03/Dirt_03_basecolor.png',
    walkableArm: '/textures/Dirt/Dirt_03/Dirt_03_arm.png',
    walkableNor: '/textures/Dirt/Dirt_03/Dirt_03_normal.png',
    cliffDiff: '/textures/Rock/Rock_02/Rock_02_basecolor.png',
    cliffArm: '/textures/Rock/Rock_02/Rock_02_arm.png',
    cliffNor: '/textures/Rock/Rock_02/Rock_02_normal.png',
    crackedDiff: '/textures/Dirt/Dirt_02/Dirt_02_basecolor.png',
    grassDiff: '/textures/Grass/Grass_01/Grass_01_basecolor.png',
    waterDiff: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_basecolor.png',
    waterNor: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_normal.png',
  });

  // Configure retro texture filtering: NearestFilter + no mipmaps for crisp, pixel-perfect PS1/Valheim aesthetic
  useEffect(() => {
    if (!textures) return;

    const allTextures = [
      textures.walkableDiff,
      textures.walkableArm,
      textures.walkableNor,
      textures.cliffDiff,
      textures.cliffArm,
      textures.cliffNor,
      textures.crackedDiff,
      textures.grassDiff,
      textures.waterDiff,
      textures.waterNor,
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
      textures.grassDiff,
      textures.waterDiff,
    ];

    const linearMaps = [
      textures.walkableArm,
      textures.walkableNor,
      textures.cliffArm,
      textures.cliffNor,
      textures.waterNor,
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
      cliffDiff: textures.cliffDiff,
      cliffArm: textures.cliffArm,
      cliffNor: textures.cliffNor,
      crackedDiff: textures.crackedDiff,
      grassDiff: textures.grassDiff,
      waterDiff: textures.waterDiff,
      waterNor: textures.waterNor,
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

  const getCameraHorizontalDir = useCallback(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const len = Math.hypot(dir.x, dir.z);
    if (len > 0.001) {
      return { x: dir.x / len, z: dir.z / len };
    }
    return { x: 0, z: -1 };
  }, [camera]);

  const getSlopeDirection = useCallback(
    (hitX: number, hitZ: number) => {
      const editor = useEditorStore.getState();

      // 1. If actively dragging beyond deadzone (0.05m), follow drag path
      if (slopeAnchorRef.current) {
        const dx = hitX - slopeAnchorRef.current.x;
        const dz = hitZ - slopeAnchorRef.current.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.05) {
          return { x: dx / dist, z: dz / dist };
        }
      }

      // 2. If alignment is set to terrain normal, align uphill along mountain gradient
      if (editor.slopeAlignment === 'terrain') {
        const norm = getTerrainNormalAt(hitX, hitZ, stateBuffer);
        const gradLen = Math.hypot(norm.x, norm.z);
        if (gradLen > 0.05) {
          // Surface normal points downhill; (-nx, -nz) points uphill
          return { x: -norm.x / gradLen, z: -norm.z / gradLen };
        }
      }

      // 3. Default: Align along the horizontal camera view direction (looking up the slope)
      return getCameraHorizontalDir();
    },
    [stateBuffer, getCameraHorizontalDir]
  );

  const getEffectiveSlopeAngle = useCallback(() => {
    const editor = useEditorStore.getState();
    return editor.slopeAngle * (editor.slopeIncline === 'decline' ? -1 : 1);
  }, []);

  const computeCursorNormal = useCallback(
    (hitPoint: THREE.Vector3, faceNormal?: THREE.Vector3) => {
      const editor = useEditorStore.getState();
      if (editor.activeTool === 'terrain' && editor.terrainSubTool === 'slope') {
        const sDir = getSlopeDirection(hitPoint.x, hitPoint.z);
        const angleDeg = getEffectiveSlopeAngle();
        const angleRad = (angleDeg * Math.PI) / 180;
        const tanA = Math.tan(angleRad);
        // Plane normal for slope ascending along sDir: (-tanA*dx, 1, -tanA*dz)
        const nx = -tanA * sDir.x;
        const ny = 1.0;
        const nz = -tanA * sDir.z;
        const invLen = 1.0 / Math.hypot(nx, ny, nz);
        return [nx * invLen, ny * invLen, nz * invLen] as [number, number, number];
      }

      const n = faceNormal
        ? faceNormal.clone().normalize()
        : getTerrainNormalAt(hitPoint.x, hitPoint.z, stateBuffer);
      return [n.x, n.y, n.z] as [number, number, number];
    },
    [getSlopeDirection, getEffectiveSlopeAngle, stateBuffer]
  );

  // Execute direct terrain sculpting with smooth radial falloff
  const executeSculpt = useCallback(
    (hitPoint: THREE.Vector3) => {
      const editor = useEditorStore.getState();
      if (editor.mudLocked) return;

      let slopeDir: { x: number; z: number } | undefined = undefined;
      let effectiveAngle = editor.slopeAngle;
      if (editor.terrainSubTool === 'slope') {
        slopeDir = getSlopeDirection(hitPoint.x, hitPoint.z);
        effectiveAngle = getEffectiveSlopeAngle();
      }

      const opts: TerrainBrushOptions = {
        operation: editor.terrainSubTool,
        radius: editor.brushRadius,
        strength:
          editor.terrainSubTool === 'smooth'
            ? editor.brushStrength * 0.7
            : editor.terrainSubTool === 'slope'
            ? editor.brushStrength * 0.4
            : editor.brushStrength * 0.15,
        targetHeight:
          editor.terrainSubTool === 'plateau'
            ? editor.plateauHeight
            : editor.terrainSubTool === 'pond' && pondOriginRef.current
            ? pondOriginRef.current.y
            : undefined,
        maxHeight: 3.5,
        minHeight: 0.0,
        slopeAngle: effectiveAngle,
        slopeDirection: slopeDir,
        slopeOrigin: slopeAnchorRef.current ?? { x: hitPoint.x, z: hitPoint.z, height: hitPoint.y },
      };

      const modified = sculptTerrain(hitPoint.x, hitPoint.z, opts);
      if (modified) {
        invalidate();
      }
    },
    [sculptTerrain, getSlopeDirection, getEffectiveSlopeAngle, invalidate]
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const editor = useEditorStore.getState();

      // Handle Walls Tool Drawing & Stamping
      if (editor.activeTool === 'walls') {
        if (e.button !== 0 || e.altKey) return;
        e.stopPropagation();

        // A. Magnetic Stamp placement
        if (editor.activeStamp) {
          const snap = calculateMagneticSnap(
            editor.activeStamp,
            e.point,
            editor.walls,
            editor.selectedWallId,
            stateBuffer
          );

          if (editor.activeStamp === 'buruj') {
            if (snap.snapped && snap.wallId && snap.nodeIndex !== undefined) {
              editor.toggleBastionOnNode(snap.wallId, snap.nodeIndex);
              editor.setActiveStamp(null);
              editor.setToastMessage('Round bastion watchtower placed!');
            } else {
              editor.setToastMessage('Hover closer to a wall vertex (<45cm) to stamp bastion.');
            }
          } else if (editor.activeStamp === 'grand_buruj') {
            if (snap.snapped && snap.wallId && snap.nodeIndex !== undefined) {
              editor.toggleGrandBastionOnNode(snap.wallId, snap.nodeIndex);
              editor.setActiveStamp(null);
              editor.setToastMessage('Maha Buruj (Grand Bastion) placed on corner vertex!');
            } else {
              editor.setToastMessage('Hover closer to a wall vertex (<45cm) to stamp grand bastion.');
            }
          } else if (editor.activeStamp === 'gate') {
            if (snap.snapped && snap.wallId && snap.segmentIndex !== undefined) {
              editor.addGateToWall(snap.wallId, snap.segmentIndex, snap.t);
              editor.setActiveStamp(null);
              editor.setToastMessage('Maha Darwaza arched gateway inserted!');
            } else {
              editor.setToastMessage('Hover closer to a fort wall segment (<60cm) to insert Maha Darwaza.');
            }
          } else if (editor.activeStamp === 'citadel') {
            editor.addCitadelKeep({
              x: snap.position[0],
              y: snap.position[1],
              z: snap.position[2],
              scale: 1.0,
              rotationY: 0,
              height: 0.40,
            });
            editor.setActiveStamp(null);
            editor.setToastMessage('Balekilla Citadel Keep placed on diorama!');
          }
          invalidate();
          return;
        }

        // B. Step 1 (Layout): Draw points / close loop
        if (editor.wallStep === 'layout') {
          const draft = editor.activeWallDraft;
          if (draft.length >= 3) {
            const dStart = Math.hypot(e.point.x - draft[0].x, e.point.z - draft[0].z);
            if (dStart < 0.35) {
              editor.proceedToFortify();
              editor.setToastMessage('Fort perimeter wall closed into defensive circuit!');
              invalidate();
              return;
            }
          }

          if (controls) {
            controls.enabled = false;
          }
          isDrawingWallRef.current = true;
          editor.addWallDraftPoint({ x: e.point.x, y: e.point.y, z: e.point.z });
          lastWallPointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
          invalidate();
          return;
        }

        // C. Step 2 or 3: Select wall if clicked nearby
        let closestDist = Infinity;
        let targetWallId: string | null = null;
        for (const wall of editor.walls) {
          for (const pt of wall.points) {
            const d = Math.hypot(e.point.x - pt.x, e.point.z - pt.z);
            if (d < closestDist) {
              closestDist = d;
              targetWallId = wall.id;
            }
          }
        }
        if (targetWallId && closestDist < 0.6) {
          editor.setSelectedWallId(targetWallId);
          if (editor.wallStep === 'solidified') {
            editor.setWallStep('fortify');
          }
          editor.setToastMessage('Fort wall selected.');
          invalidate();
        }
        return;
      }

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

      const norm = computeCursorNormal(e.point, e.face?.normal);
      setCursorPos([e.point.x, e.point.y, e.point.z]);
      setCursorNormal(norm);
      setCursorVisible(true);

      if (editor.terrainSubTool === 'slope') {
        slopeAnchorRef.current = { x: e.point.x, z: e.point.z, height: e.point.y };
      }
      if (editor.terrainSubTool === 'pond') {
        pondOriginRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
      }

      executeSculpt(e.point);
    },
    [controls, executeSculpt, pushUndo, computeCursorNormal, invalidate]
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const editor = useEditorStore.getState();

      if (editor.activeTool === 'walls') {
        if (cursorVisible) setCursorVisible(false);

        // Magnetic snap hologram tracking
        if (editor.activeStamp) {
          const snap = calculateMagneticSnap(
            editor.activeStamp,
            e.point,
            editor.walls,
            editor.selectedWallId,
            stateBuffer
          );
          editor.setWallSnapPreview(snap);
          invalidate();
          return;
        }

        if (editor.wallSnapPreview) {
          editor.setWallSnapPreview(null);
        }

        if (isDrawingWallRef.current && lastWallPointRef.current) {
          e.stopPropagation();
          const dx = e.point.x - lastWallPointRef.current.x;
          const dz = e.point.z - lastWallPointRef.current.z;
          const dist = Math.hypot(dx, dz);
          if (dist >= 0.15) {
            editor.addWallDraftPoint({ x: e.point.x, y: e.point.y, z: e.point.z });
            lastWallPointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
            invalidate();
          }
        }
        return;
      }

      if (editor.activeTool !== 'terrain') {
        if (cursorVisible) setCursorVisible(false);
        return;
      }

      const norm = computeCursorNormal(e.point, e.face?.normal);
      setCursorPos([e.point.x, e.point.y, e.point.z]);
      setCursorNormal(norm);
      if (!cursorVisible) setCursorVisible(true);

      if (isSculptingRef.current) {
        e.stopPropagation();
        executeSculpt(e.point);
      }
    },
    [cursorVisible, executeSculpt, computeCursorNormal, invalidate]
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawingWallRef.current) {
      isDrawingWallRef.current = false;
      lastWallPointRef.current = null;
      if (controls) {
        controls.enabled = true;
      }
      invalidate();
    }

    if (isSculptingRef.current) {
      pondOriginRef.current = null;
      slopeAnchorRef.current = null;
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
    const editor = useEditorStore.getState();
    if (editor.wallSnapPreview) {
      editor.setWallSnapPreview(null);
    }
  }, []);

  // Global window pointerup to catch pointer released outside mesh
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDrawingWallRef.current) {
        isDrawingWallRef.current = false;
        lastWallPointRef.current = null;
        if (controls) {
          controls.enabled = true;
        }
        invalidate();
      }

      if (isSculptingRef.current) {
        pondOriginRef.current = null;
        slopeAnchorRef.current = null;
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
        normal={cursorNormal}
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

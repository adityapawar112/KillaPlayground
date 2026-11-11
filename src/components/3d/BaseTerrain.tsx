'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTexture, Bvh } from '@react-three/drei';
import { useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import {
  createBaseTerrainGeometry,
  syncStateToGeometry,
  refitTerrainBVH,
  TerrainBrushOptions,
  getTerrainNormalAt,
  getTerrainHeightAt,
} from '@/lib/terrain/terrainBuffer';
import { createTerrainMaterial } from './TerrainMaterial';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { useEditorStore, TerrainSubTool } from '@/lib/state/useEditorStore';
import { calculateMagneticSnap, sampleBilinearHeight } from '@/lib/walls/wallGeometry';
import { TEXTURE_MANIFEST, getTextureById } from '@/lib/textures/textureManifest';
import { loadTexturesIntoArray } from '@/lib/terrain/terrainPaintBuffer';
import { FOLIAGE_MANIFEST, getFoliageById } from '@/lib/foliage/foliageManifest';
import { generateScatterCandidates, eraseFoliageInRadius } from '@/lib/foliage/foliageScatter';
import { FoliageInstance } from '@/lib/foliage/foliageTypes';
import { GestureController } from '@/lib/interaction/gestureController';

/**
 * 3D Visual Brush Ring Cursor that tracks pointer raycast hit and aligns with the terrain surface normal.
 */
export interface CursorStateRef {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  visible: boolean;
}

interface TerrainBrushCursorProps {
  cursorStateRef: React.MutableRefObject<CursorStateRef>;
  radius: number;
  subTool: string;
  toolActive: boolean;
  isPresentationMode?: boolean;
}

const TerrainBrushCursor: React.FC<TerrainBrushCursorProps> = ({
  cursorStateRef,
  radius,
  subTool,
  toolActive,
  isPresentationMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const upVec = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const normVec = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame(() => {
    const grp = groupRef.current;
    if (!grp) return;
    const st = cursorStateRef.current;
    if (!st.visible || !toolActive || isPresentationMode) {
      if (grp.visible) grp.visible = false;
      return;
    }
    if (!grp.visible) grp.visible = true;

    normVec.set(st.nx, st.ny, st.nz).normalize();
    if (normVec.lengthSq() < 0.001) normVec.set(0, 1, 0);
    quat.setFromUnitVectors(upVec, normVec);
    grp.quaternion.copy(quat);

    grp.position.set(
      st.x + normVec.x * 0.025,
      st.y + normVec.y * 0.025,
      st.z + normVec.z * 0.025
    );
  });

  // Ticket 16 Review Item 12: Refined anti-aliased terracotta rings (#B85F45) replacing neon orange
  const color = useMemo(() => {
    switch (subTool) {
      case 'elevate':
      case 'paint':
        return '#B85F45'; // Authentic terracotta
      case 'scatter':
      case 'single':
        return '#16A34A'; // Emerald forest green
      case 'lower':
      case 'erase':
        return '#DC2626'; // Burnt clay / crimson
      case 'plateau':
        return '#B58B63'; // Camel stone
      case 'smooth':
      case 'blend':
        return '#777A57'; // Olive sage
      case 'pond':
        return '#0284C7'; // Tarpaulin blue
      case 'slope':
        return '#D97706'; // Terracotta gold
      case 'soil':
        return '#4B382C'; // Natural Sahyadri soil
      default:
        return '#B85F45';
    }
  }, [subTool]);

  const isSinglePoint = subTool === 'single';
  const ringWidth = Math.max(0.012, Math.min(0.035, radius * 0.035));
  const innerR = Math.max(0.01, radius - ringWidth);

  return (
    <group ref={groupRef} visible={false}>
      {isSinglePoint ? (
        <>
          {/* Single Placement Pinpoint Target Reticle */}
          <mesh renderOrder={999}>
            <ringGeometry args={[0.04, 0.055, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.7}
              depthTest={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh renderOrder={999}>
            <circleGeometry args={[0.018, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.8}
              depthTest={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      ) : (
        <>
          {/* Outer Radius Ring with Subtle Anti-Aliasing & Terracotta Warmth */}
          <mesh renderOrder={999}>
            <ringGeometry args={[innerR, radius, 64]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.55}
              depthTest={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Center Reticle Point */}
          <mesh renderOrder={999}>
            <circleGeometry args={[Math.min(0.02, radius * 0.08), 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.70}
              depthTest={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
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
  const isPaintingRef = useRef(false);
  const isDrawingWallRef = useRef(false);
  const lastWallPointRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const isDraggingFoundationRef = useRef(false);
  const foundationAnchorRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const isDrawingStairsRef = useRef(false);
  const lastStairPointRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const isDrawingSplineRef = useRef(false);
  const lastSplinePointRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const slopeAnchorRef = useRef<{ x: number; z: number; height: number } | null>(null);
  const pondOriginRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const lastFoliagePointRef = useRef<{ x: number; z: number } | null>(null);
  const lastFoliageTimeRef = useRef<number>(0);
  const gestureControllerRef = useRef(new GestureController());
  const pendingTapHitRef = useRef<{ point: THREE.Vector3; normal?: THREE.Vector3 } | null>(null);
  const isContinuousToolDragRef = useRef(false);
  const isMousePanRef = useRef(false);
  const cursorStateRef = useRef<CursorStateRef>({
    x: 0,
    y: 0,
    z: 0,
    nx: 0,
    ny: 1,
    nz: 0,
    visible: false,
  });

  const { camera, invalidate } = useThree();
  const rawControls = useThree((state) => state.controls);
  const controls = rawControls as unknown as { enabled: boolean } | null;

  const stateBuffer = useTerrainStore((s) => s.stateBuffer);
  const stateTexture = useTerrainStore((s) => s.stateTexture);
  const paintTexture = useTerrainStore((s) => s.paintTexture);
  const paintArrayTexture = useTerrainStore((s) => s.paintArrayTexture);
  const setPaintArrayTexture = useTerrainStore((s) => s.setPaintArrayTexture);
  const setTerrainMesh = useTerrainStore((s) => s.setTerrainMesh);
  const sculptTerrain = useTerrainStore((s) => s.sculptTerrain);
  const applyPaintBrush = useTerrainStore((s) => s.applyPaintBrush);
  const pushUndo = useTerrainStore((s) => s.pushUndo);

  const activeTool = useEditorStore((s) => s.activeTool);
  const terrainSubTool = useEditorStore((s) => s.terrainSubTool);
  const brushRadius = useEditorStore((s) => s.brushRadius);
  const paintBrushRadius = useEditorStore((s) => s.paintBrushRadius);
  const paintSubTool = useEditorStore((s) => s.paintSubTool);
  const paintTextureRepeat = useEditorStore((s) => s.paintTextureRepeat);
  const foliageBrushRadius = useEditorStore((s) => s.foliageBrushRadius);
  const foliageSubTool = useEditorStore((s) => s.foliageSubTool);
  const propEraseRadius = useEditorStore((s) => s.propEraseRadius);
  const propSubTool = useEditorStore((s) => s.propSubTool);
  const lightEraseRadius = useEditorStore((s) => s.lightEraseRadius);
  const lightingSubTool = useEditorStore((s) => s.lightingSubTool);
  const showWireframe = useEditorStore((s) => s.showWireframe);
  const isPresentationMode = useEditorStore((s) => s.isPresentationMode);
  const isJoystickActive = useEditorStore((s) => s.isJoystickActive);

  // Load 52 retro textures into DataArrayTexture asynchronously on client once on mount
  useEffect(() => {
    loadTexturesIntoArray(TEXTURE_MANIFEST, paintArrayTexture).then((loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.needsUpdate = true;
      setPaintArrayTexture(loaded);
      invalidate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
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

  // Create slope-aware CustomShaderMaterial with height blending and view-space normals.
  // CRITICAL OPTIMIZATION: Instantiated ONCE for diorama lifetime.
  // Dynamic changes to textures/repeat are updated directly via uniforms to eliminate synchronous WebGL shader recompiles!
  const material = useMemo(() => {
    return createTerrainMaterial({
      stateTexture,
      paintStateTexture: paintTexture,
      paintAtlasTexture: paintArrayTexture,
      paintRepeat: paintTextureRepeat,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update uniforms in place without destroying or recreating the shader program
  useEffect(() => {
    if (!material.uniforms) return;
    if (paintArrayTexture && material.uniforms.uPaintAtlas) {
      material.uniforms.uPaintAtlas.value = paintArrayTexture;
    }
    if (material.uniforms.uPaintRepeat) {
      material.uniforms.uPaintRepeat.value = paintTextureRepeat;
    }
    if (material.uniforms.uPaintState) {
      material.uniforms.uPaintState.value = paintTexture;
    }
    if (textures) {
      if (material.uniforms.uWalkableDiff) material.uniforms.uWalkableDiff.value = textures.walkableDiff;
      if (material.uniforms.uWalkableArm) material.uniforms.uWalkableArm.value = textures.walkableArm;
      if (material.uniforms.uWalkableNor) material.uniforms.uWalkableNor.value = textures.walkableNor;
      if (material.uniforms.uCliffDiff) material.uniforms.uCliffDiff.value = textures.cliffDiff;
      if (material.uniforms.uCliffArm) material.uniforms.uCliffArm.value = textures.cliffArm;
      if (material.uniforms.uCliffNor) material.uniforms.uCliffNor.value = textures.cliffNor;
      if (material.uniforms.uCrackedDiff) material.uniforms.uCrackedDiff.value = textures.crackedDiff;
      if (material.uniforms.uGrassDiff) material.uniforms.uGrassDiff.value = textures.grassDiff;
      if (material.uniforms.uWaterDiff) material.uniforms.uWaterDiff.value = textures.waterDiff;
      if (material.uniforms.uWaterNor) material.uniforms.uWaterNor.value = textures.waterNor;
    }
    invalidate();
  }, [material, paintArrayTexture, paintTextureRepeat, paintTexture, textures, invalidate]);

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

  const updateCursor = useCallback(
    (point: THREE.Vector3, faceNormal?: THREE.Vector3) => {
      const norm = computeCursorNormal(point, faceNormal);
      cursorStateRef.current = {
        x: point.x,
        y: point.y,
        z: point.z,
        nx: norm[0],
        ny: norm[1],
        nz: norm[2],
        visible: true,
      };
      invalidate(); // Re-render frame immediately so brush ring tracks pointer smoothly at 60fps!
    },
    [computeCursorNormal, invalidate]
  );

  const hideCursor = useCallback(() => {
    if (cursorStateRef.current.visible) {
      cursorStateRef.current.visible = false;
      invalidate();
    }
  }, [invalidate]);

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

  // Execute Single Tap Action on Terrain Surface (Taps <= 8px, <= 350ms)
  const executeSingleTapAction = useCallback(
    (hitPoint: THREE.Vector3, faceNormal?: THREE.Vector3) => {
      const editor = useEditorStore.getState();
      if (editor.isPresentationMode || editor.activeTool === 'view' || editor.isJoystickActive) return;

      // 1. Building / Walls Tool Actions
      if (editor.activeTool === 'building' || editor.activeTool === 'walls') {
        // A. Magnetic Stamp placement (Fortifications mode)
        if ((editor.buildingMode === 'fortifications' || editor.wallMode === 'fortify') && editor.activeStamp) {
          const snap = calculateMagneticSnap(
            editor.activeStamp,
            hitPoint,
            editor.walls,
            editor.selectedWallId,
            stateBuffer
          );

          if (editor.activeStamp === 'tower' || editor.activeStamp === 'buruj') {
            if (snap.snapped && snap.wallId && snap.segmentIndex !== undefined) {
              editor.addTowerToWall(snap.wallId, snap.segmentIndex, snap.t);
              editor.setToastMessage('Watchtower placed! Click along wall to place another.');
            } else {
              editor.setToastMessage('Hover closer to a wall segment (<35cm) to place watchtower.');
            }
          } else if (editor.activeStamp === 'box') {
            if (snap.snapped && snap.wallId && snap.segmentIndex !== undefined) {
              editor.addBoxBastionToWall(snap.wallId, snap.segmentIndex, snap.t);
              editor.setToastMessage('Rampart Bastion placed! Click along wall to place another.');
            } else {
              editor.setToastMessage('Hover closer to a wall segment (<35cm) to place rampart bastion.');
            }
          } else if (editor.activeStamp === 'round_bastion') {
            if (snap.snapped && snap.wallId && snap.segmentIndex !== undefined) {
              editor.addRoundBastionToWall(snap.wallId, snap.segmentIndex, snap.t);
              editor.setToastMessage('Round Bastion placed! Click along wall to place another.');
            } else {
              editor.setToastMessage('Hover closer to a wall segment (<35cm) to place round bastion.');
            }
          } else if (editor.activeStamp === 'gate') {
            if (snap.snapped && snap.wallId && snap.segmentIndex !== undefined) {
              editor.addGateToWall(snap.wallId, snap.segmentIndex, snap.t);
              editor.setToastMessage('Arched Gateway inserted! Click along wall to place another.');
            } else {
              editor.setToastMessage('Hover closer to a wall segment (<35cm) to place arched gateway.');
            }
          }
          invalidate();
          return;
        }

        // B. Walls mode: Draw points / close loop
        if (editor.buildingMode === 'walls' || (editor.activeTool === 'walls' && editor.wallMode === 'draw')) {
          const draft = editor.activeWallDraft;
          if (draft.length >= 3) {
            const dStart = Math.hypot(hitPoint.x - draft[0].x, hitPoint.z - draft[0].z);
            if (dStart < 0.35) {
              editor.proceedToFortify();
              editor.setToastMessage('Fort perimeter wall closed into defensive circuit!');
              invalidate();
              return;
            }
          }

          editor.addWallDraftPoint({ x: hitPoint.x, y: hitPoint.y, z: hitPoint.z });
          lastWallPointRef.current = { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z };
          invalidate();
          return;
        }

        // C. Foundation mode:
        if (editor.buildingMode === 'foundation') {
          if (editor.activeFoundationDraft && editor.activeFoundationDraft.phase === 'height') {
            const draft = editor.activeFoundationDraft;
            const dx = Math.abs(draft.x2 - draft.x1);
            const dz = Math.abs(draft.z2 - draft.z1);
            if (dx >= 0.15 && dz >= 0.15) {
              const cx = (draft.x1 + draft.x2) / 2;
              const cz = (draft.z1 + draft.z2) / 2;
              const baseHeight = sampleBilinearHeight(stateBuffer, cx, cz);
              const rawHeight = draft.height ?? editor.defaultFoundationHeight ?? 0.40;
              const finalHeight = Math.max(-10.0, Math.min(25.0, Math.abs(rawHeight) < 0.05 ? (rawHeight < 0 ? -0.05 : 0.05) : rawHeight));
              editor.addFoundation({
                name: `Stone Foundation ${editor.foundations.length + 1}`,
                x: cx,
                z: cz,
                y: baseHeight,
                length: dx,
                width: dz,
                height: finalHeight,
                verticalOffset: editor.defaultFoundationOffset || 0.0,
                tilingRepeat: editor.defaultFoundationTiling || 3.0,
              });
              editor.setToastMessage(`Stone foundation slab constructed! Height: ${finalHeight.toFixed(2)}m`);
            }
            editor.setActiveFoundationDraft(null);
            isDraggingFoundationRef.current = false;
            foundationAnchorRef.current = null;
            if (controls) controls.enabled = true;
            invalidate();
            return;
          }

          // Single tap foundation: constructs standard 1.5m x 1.5m stone foundation slab
          const baseHeight = sampleBilinearHeight(stateBuffer, hitPoint.x, hitPoint.z);
          const rawHeight = editor.defaultFoundationHeight ?? 0.40;
          editor.addFoundation({
            name: `Stone Foundation ${editor.foundations.length + 1}`,
            x: hitPoint.x,
            z: hitPoint.z,
            y: baseHeight,
            length: 1.5,
            width: 1.5,
            height: rawHeight,
            verticalOffset: editor.defaultFoundationOffset || 0.0,
            tilingRepeat: editor.defaultFoundationTiling || 3.0,
          });
          editor.setToastMessage(`Stone foundation slab placed!`);
          invalidate();
          return;
        }

        // D. Stairs mode: add stair point
        if (editor.buildingMode === 'stairs') {
          if (!editor.isDrawingStairs) {
            editor.startStairs();
          }
          editor.addStairPoint([hitPoint.x, hitPoint.y, hitPoint.z]);
          lastStairPointRef.current = { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z };
          invalidate();
          return;
        }

        // E. Select mode: Select stairs or wall if tapped nearby
        if (editor.buildingMode === 'select' || editor.wallMode === 'select') {
          let closestStairDist = Infinity;
          let targetStairId: string | null = null;
          for (const s of editor.stairs) {
            for (const pt of s.points) {
              const d = Math.hypot(hitPoint.x - pt[0], hitPoint.z - pt[2]);
              if (d < closestStairDist) {
                closestStairDist = d;
                targetStairId = s.id;
              }
            }
          }
          if (targetStairId && closestStairDist < 0.35) {
            editor.setSelectedStairId(targetStairId);
            editor.setSelectedWallId(null);
            editor.setSelectedComponent(null);
            editor.setSelectedFoundationId(null);
            editor.setToastMessage('Stone staircase selected.');
            invalidate();
            return;
          }

          let closestDist = Infinity;
          let targetWallId: string | null = null;
          for (const wall of editor.walls) {
            for (const pt of wall.points) {
              const d = Math.hypot(hitPoint.x - pt.x, hitPoint.z - pt.z);
              if (d < closestDist) {
                closestDist = d;
                targetWallId = wall.id;
              }
            }
          }
          if (targetWallId && closestDist < 0.35) {
            editor.setSelectedWallId(targetWallId);
            editor.setSelectedComponent(null);
            editor.setSelectedFoundationId(null);
            editor.setSelectedStairId(null);
            editor.setToastMessage('Fort wall selected.');
            invalidate();
            return;
          }
        }
        return;
      }

      // 2. Spline Tool Drawing
      if (editor.activeTool === 'spline') {
        if (editor.splineMode !== 'draw') return;
        if (!editor.isDrawingSpline) {
          editor.startSpline();
        }
        editor.addSplinePoint([hitPoint.x, hitPoint.y, hitPoint.z]);
        lastSplinePointRef.current = { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z };
        invalidate();
        return;
      }

      // 3. Texture Tool Single Dab
      if (editor.activeTool === 'texture' || editor.activeTool === 'paint') {
        pushUndo();
        const texItem = getTextureById(editor.selectedTextureId) || TEXTURE_MANIFEST[0];
        applyPaintBrush(hitPoint.x, hitPoint.z, {
          operation: editor.paintSubTool,
          targetLayer: texItem.layerIndex,
          radius: editor.paintBrushRadius,
          strength: editor.paintBrushStrength,
          falloff: editor.paintBrushFalloff,
        });
        updateCursor(hitPoint, faceNormal);
        invalidate();
        return;
      }

      // 4. Foliage Tool Placement / Scatter / Erase on Tap
      if (editor.activeTool === 'foliage') {
        const foliageItem = getFoliageById(editor.selectedFoliageId) || FOLIAGE_MANIFEST[0];

        if (editor.foliageSubTool === 'single') {
          pushUndo();
          const norm = computeCursorNormal(hitPoint, faceNormal);
          const jitterFactor = 1.0 + (Math.random() * 2 - 1) * editor.foliageScaleJitter;
          const randomYaw = Math.random() * Math.PI * 2;

          const quat = new THREE.Quaternion();
          const up = new THREE.Vector3(0, 1, 0);
          const surfaceNorm = new THREE.Vector3(norm[0], norm[1], norm[2]).normalize();
          const blendedUp = up.clone().lerp(surfaceNorm, editor.foliageNormalAlign).normalize();
          const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, blendedUp);
          const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomYaw);
          quat.multiplyQuaternions(alignQuat, yawQuat);
          const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');

          const singleInstance: FoliageInstance = {
            id: `foliage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            typeId: foliageItem.id,
            position: [hitPoint.x, hitPoint.y, hitPoint.z],
            rotation: [euler.x, euler.y, euler.z],
            scale: [jitterFactor, jitterFactor, jitterFactor],
          };
          editor.addFoliageInstances([singleInstance]);
          updateCursor(hitPoint, faceNormal);
          invalidate();
          return;
        }

        pushUndo();
        if (editor.foliageSubTool === 'scatter') {
          const activeTypeIds =
            editor.foliageSelectMode === 'multi' && editor.selectedFoliageIds.length > 0
              ? editor.selectedFoliageIds
              : [editor.selectedFoliageId || FOLIAGE_MANIFEST[0].id];
          const activeItems = activeTypeIds.map((id) => getFoliageById(id) || FOLIAGE_MANIFEST[0]);
          const avgSpacing = activeItems.reduce((acc, item) => acc + item.spacing, 0) / activeItems.length;

          const candidates = generateScatterCandidates({
            centerX: hitPoint.x,
            centerZ: hitPoint.z,
            typeId: activeItems[0].id,
            typeIds: activeTypeIds,
            spacing: avgSpacing,
            options: {
              operation: 'scatter',
              radius: editor.foliageBrushRadius,
              density: editor.foliageBrushDensity,
              scaleJitter: editor.foliageScaleJitter,
              normalAlign: editor.foliageNormalAlign,
            },
            existingInstances: editor.foliageInstances,
            getHeightAt: (x, z) => getTerrainHeightAt(x, z, stateBuffer),
            getNormalAt: (x, z) => {
              const n = getTerrainNormalAt(x, z, stateBuffer);
              return [n.x, n.y, n.z];
            },
          });
          if (candidates.length > 0) {
            editor.addFoliageInstances(candidates);
          }
        } else if (editor.foliageSubTool === 'erase') {
          const { remaining } = eraseFoliageInRadius(
            hitPoint.x,
            hitPoint.z,
            editor.foliageBrushRadius,
            editor.foliageInstances
          );
          editor.setFoliageInstances(remaining);
        }
        updateCursor(hitPoint, faceNormal);
        invalidate();
        return;
      }

      // 5. Figurine Erase Brush on Tap
      if (editor.activeTool === 'prop' && editor.propSubTool === 'erase') {
        pushUndo();
        const toRemove = editor.placedProps.filter((p) => {
          const dx = p.position[0] - hitPoint.x;
          const dz = p.position[2] - hitPoint.z;
          return Math.hypot(dx, dz) <= editor.propEraseRadius;
        });
        if (toRemove.length > 0) {
          editor.removeProps(toRemove.map((p) => p.id));
        }
        updateCursor(hitPoint, faceNormal);
        invalidate();
        return;
      }

      // 6. Lighting Erase Brush on Tap
      if (editor.activeTool === 'lighting' && editor.lightingSubTool === 'erase') {
        pushUndo();
        const toRemove = editor.placedLights.filter((l) => {
          const dx = l.position[0] - hitPoint.x;
          const dz = l.position[2] - hitPoint.z;
          return Math.hypot(dx, dz) <= editor.lightEraseRadius;
        });
        if (toRemove.length > 0) {
          editor.removeLights(toRemove.map((l) => l.id));
        }
        updateCursor(hitPoint, faceNormal);
        invalidate();
        return;
      }

      // 7. Terrain Sculpting Dab on Tap
      if (editor.activeTool === 'terrain') {
        pushUndo();
        if (editor.terrainSubTool === 'slope') {
          slopeAnchorRef.current = { x: hitPoint.x, z: hitPoint.z, height: hitPoint.y };
        }
        if (editor.terrainSubTool === 'pond') {
          pondOriginRef.current = { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z };
        }
        executeSculpt(hitPoint);
        updateCursor(hitPoint, faceNormal);
        const geo = useTerrainStore.getState().terrainGeometry;
        if (geo) {
          refitTerrainBVH(geo);
        }
        useTerrainStore.setState({ lastUpdated: Date.now() });
        invalidate();
      }
    },
    [
      executeSculpt,
      pushUndo,
      applyPaintBrush,
      updateCursor,
      computeCursorNormal,
      stateBuffer,
      controls,
      invalidate,
    ]
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const editor = useEditorStore.getState();
      if (editor.isPresentationMode || editor.activeTool === 'view' || editor.isJoystickActive) return;

      const action = gestureControllerRef.current.onPointerDown(
        {
          x: e.clientX,
          y: e.clientY,
          pointerType: e.pointerType,
          pointerId: e.pointerId,
        },
        {
          isJoystickActive: editor.isJoystickActive,
          isAltPressed: e.altKey,
        }
      );

      pendingTapHitRef.current = {
        point: e.point.clone(),
        normal: e.face?.normal?.clone(),
      };

      if (action.type === 'continuous_tool_drag') {
        // Double-tap & drag on touch OR Alt+drag on mouse: disable OrbitControls to stop orbiting/panning!
        if (controls) {
          controls.enabled = false;
        }
        isContinuousToolDragRef.current = true;
        e.stopPropagation();

        if (editor.activeTool === 'terrain') {
          pushUndo();
          isSculptingRef.current = true;
          if (editor.terrainSubTool === 'slope') {
            slopeAnchorRef.current = { x: e.point.x, z: e.point.z, height: e.point.y };
          }
          if (editor.terrainSubTool === 'pond') {
            pondOriginRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
          }
          executeSculpt(e.point);
        } else if (editor.activeTool === 'texture' || editor.activeTool === 'paint') {
          pushUndo();
          isPaintingRef.current = true;
          const texItem = getTextureById(editor.selectedTextureId) || TEXTURE_MANIFEST[0];
          applyPaintBrush(e.point.x, e.point.z, {
            operation: editor.paintSubTool,
            targetLayer: texItem.layerIndex,
            radius: editor.paintBrushRadius,
            strength: editor.paintBrushStrength,
            falloff: editor.paintBrushFalloff,
          });
        } else if (editor.activeTool === 'foliage') {
          pushUndo();
          isPaintingRef.current = true;
        } else if (editor.activeTool === 'building' || editor.activeTool === 'walls') {
          if (editor.buildingMode === 'foundation') {
            isDraggingFoundationRef.current = true;
            foundationAnchorRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
            editor.setActiveFoundationDraft({
              x1: e.point.x,
              z1: e.point.z,
              x2: e.point.x,
              z2: e.point.z,
              y: e.point.y,
              phase: 'base',
            });
          } else if (editor.buildingMode === 'walls' || editor.wallMode === 'draw') {
            isDrawingWallRef.current = true;
            editor.addWallDraftPoint({ x: e.point.x, y: e.point.y, z: e.point.z });
            lastWallPointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
          } else if (editor.buildingMode === 'stairs') {
            isDrawingStairsRef.current = true;
            if (!editor.isDrawingStairs) {
              editor.startStairs();
            }
            editor.addStairPoint([e.point.x, e.point.y, e.point.z]);
            lastStairPointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
          }
        } else if (editor.activeTool === 'spline') {
          isDrawingSplineRef.current = true;
          if (!editor.isDrawingSpline) {
            editor.startSpline();
          }
          editor.addSplinePoint([e.point.x, e.point.y, e.point.z]);
          lastSplinePointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
        }
        updateCursor(e.point, e.face?.normal);
        invalidate();
      } else if (action.type === 'mouse_pan') {
        if (controls) {
          controls.enabled = false;
        }
        isMousePanRef.current = true;
      }
      // Note: for pending_tap_or_orbit, controls.enabled remains TRUE so dragging orbits camera!
    },
    [controls, executeSculpt, applyPaintBrush, pushUndo, updateCursor, invalidate]
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const editor = useEditorStore.getState();
      if (editor.isPresentationMode || editor.activeTool === 'view' || editor.isJoystickActive) {
        hideCursor();
        return;
      }

      const action = gestureControllerRef.current.onPointerMove(
        {
          x: e.clientX,
          y: e.clientY,
          pointerType: e.pointerType,
        },
        { isJoystickActive: editor.isJoystickActive }
      );

      // Trackpad / Mouse Pan on double-tap & drag
      if (action.type === 'mouse_pan') {
        if (controls) {
          const panSpeed = 0.008;
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          const right = new THREE.Vector3();
          right.crossVectors(camera.up, forward).normalize();
          const panOffset = new THREE.Vector3()
            .addScaledVector(right, -action.deltaX * panSpeed)
            .addScaledVector(forward, -action.deltaY * panSpeed);
          camera.position.add(panOffset);
          (controls as any).target?.add(panOffset);
          (controls as any).update?.();
          invalidate();
        }
        return;
      }

      // Continuous tool drag stroke (Touch double-tap drag or Alt+drag)
      if (action.type === 'continuous_tool_drag' || isContinuousToolDragRef.current) {
        if (editor.activeTool === 'building' || editor.activeTool === 'walls') {
          hideCursor();
          if (editor.buildingMode === 'foundation' && isDraggingFoundationRef.current && foundationAnchorRef.current) {
            e.stopPropagation();
            editor.setActiveFoundationDraft({
              x1: foundationAnchorRef.current.x,
              z1: foundationAnchorRef.current.z,
              x2: e.point.x,
              z2: e.point.z,
              y: foundationAnchorRef.current.y,
              phase: 'base',
            });
            invalidate();
            return;
          }
          if ((editor.buildingMode === 'walls' || editor.wallMode === 'draw') && isDrawingWallRef.current && lastWallPointRef.current) {
            e.stopPropagation();
            const dx = e.point.x - lastWallPointRef.current.x;
            const dz = e.point.z - lastWallPointRef.current.z;
            if (Math.hypot(dx, dz) >= 0.15) {
              editor.addWallDraftPoint({ x: e.point.x, y: e.point.y, z: e.point.z });
              lastWallPointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
              invalidate();
            }
            return;
          }
          if (editor.buildingMode === 'stairs' && isDrawingStairsRef.current && lastStairPointRef.current) {
            e.stopPropagation();
            const dx = e.point.x - lastStairPointRef.current.x;
            const dy = e.point.y - lastStairPointRef.current.y;
            const dz = e.point.z - lastStairPointRef.current.z;
            if (Math.hypot(dx, dy, dz) >= 0.15) {
              editor.addStairPoint([e.point.x, e.point.y, e.point.z]);
              lastStairPointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
              invalidate();
            }
            return;
          }
          return;
        }

        if (editor.activeTool === 'spline') {
          hideCursor();
          if (editor.splineMode === 'draw' && isDrawingSplineRef.current) {
            const pts = editor.currentSplinePoints;
            const last = lastSplinePointRef.current || (pts.length > 0 ? { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], z: pts[pts.length - 1][2] } : null);
            if (last) {
              const dx = e.point.x - last.x;
              const dy = e.point.y - last.y;
              const dz = e.point.z - last.z;
              if (Math.hypot(dx, dy, dz) >= 0.15) {
                e.stopPropagation();
                editor.addSplinePoint([e.point.x, e.point.y, e.point.z]);
                lastSplinePointRef.current = { x: e.point.x, y: e.point.y, z: e.point.z };
                invalidate();
              }
            }
          }
          return;
        }

        if (editor.activeTool === 'texture' || editor.activeTool === 'paint') {
          updateCursor(e.point, e.face?.normal);
          if (isPaintingRef.current) {
            e.stopPropagation();
            const texItem = getTextureById(editor.selectedTextureId) || TEXTURE_MANIFEST[0];
            applyPaintBrush(e.point.x, e.point.z, {
              operation: editor.paintSubTool,
              targetLayer: texItem.layerIndex,
              radius: editor.paintBrushRadius,
              strength: editor.paintBrushStrength,
              falloff: editor.paintBrushFalloff,
            });
            invalidate();
          }
          return;
        }

        if (editor.activeTool === 'foliage') {
          updateCursor(e.point, e.face?.normal);
          if (isPaintingRef.current) {
            e.stopPropagation();
            const now = performance.now();
            if (lastFoliagePointRef.current) {
              const dx = e.point.x - lastFoliagePointRef.current.x;
              const dz = e.point.z - lastFoliagePointRef.current.z;
              if (Math.hypot(dx, dz) < 0.05 && now - lastFoliageTimeRef.current < 35) {
                return;
              }
            }
            lastFoliagePointRef.current = { x: e.point.x, z: e.point.z };
            lastFoliageTimeRef.current = now;

            if (editor.foliageSubTool === 'scatter') {
              const activeTypeIds =
                editor.foliageSelectMode === 'multi' && editor.selectedFoliageIds.length > 0
                  ? editor.selectedFoliageIds
                  : [editor.selectedFoliageId || FOLIAGE_MANIFEST[0].id];
              const activeItems = activeTypeIds.map((id) => getFoliageById(id) || FOLIAGE_MANIFEST[0]);
              const avgSpacing = activeItems.reduce((acc, item) => acc + item.spacing, 0) / activeItems.length;

              const candidates = generateScatterCandidates({
                centerX: e.point.x,
                centerZ: e.point.z,
                typeId: activeItems[0].id,
                typeIds: activeTypeIds,
                spacing: avgSpacing,
                options: {
                  operation: 'scatter',
                  radius: editor.foliageBrushRadius,
                  density: editor.foliageBrushDensity,
                  scaleJitter: editor.foliageScaleJitter,
                  normalAlign: editor.foliageNormalAlign,
                },
                existingInstances: editor.foliageInstances,
                getHeightAt: (x, z) => getTerrainHeightAt(x, z, stateBuffer),
                getNormalAt: (x, z) => {
                  const n = getTerrainNormalAt(x, z, stateBuffer);
                  return [n.x, n.y, n.z];
                },
              });
              if (candidates.length > 0) {
                editor.addFoliageInstances(candidates);
              }
            } else if (editor.foliageSubTool === 'erase') {
              const { remaining } = eraseFoliageInRadius(
                e.point.x,
                e.point.z,
                editor.foliageBrushRadius,
                editor.foliageInstances
              );
              editor.setFoliageInstances(remaining);
            }
            invalidate();
          }
          return;
        }

        if (editor.activeTool === 'prop' && editor.propSubTool === 'erase') {
          updateCursor(e.point, e.face?.normal);
          if (isPaintingRef.current) {
            e.stopPropagation();
            const toRemove = editor.placedProps.filter((p) => {
              const dx = p.position[0] - e.point.x;
              const dz = p.position[2] - e.point.z;
              return Math.hypot(dx, dz) <= editor.propEraseRadius;
            });
            if (toRemove.length > 0) {
              editor.removeProps(toRemove.map((p) => p.id));
            }
            invalidate();
          }
          return;
        }

        if (editor.activeTool === 'lighting' && editor.lightingSubTool === 'erase') {
          updateCursor(e.point, e.face?.normal);
          if (isPaintingRef.current) {
            e.stopPropagation();
            const toRemove = editor.placedLights.filter((l) => {
              const dx = l.position[0] - e.point.x;
              const dz = l.position[2] - e.point.z;
              return Math.hypot(dx, dz) <= editor.lightEraseRadius;
            });
            if (toRemove.length > 0) {
              editor.removeLights(toRemove.map((l) => l.id));
            }
            invalidate();
          }
          return;
        }

        if (editor.activeTool === 'terrain') {
          updateCursor(e.point, e.face?.normal);
          if (isSculptingRef.current) {
            e.stopPropagation();
            executeSculpt(e.point);
          }
          return;
        }
      }

      // Default pointer move: updates visual cursor smoothly & previews magnetic snap or foundation height
      updateCursor(e.point, e.face?.normal);

      if (editor.activeTool === 'building' || editor.activeTool === 'walls') {
        if (editor.buildingMode === 'foundation' && editor.activeFoundationDraft?.phase === 'height') {
          e.stopPropagation();
          const clientY = (e.nativeEvent as MouseEvent)?.clientY ?? 0;
          const startY = editor.activeFoundationDraft.startPointerY ?? clientY;
          const delta = (startY - clientY) * 0.008;
          const baseH = editor.defaultFoundationHeight || 0.40;
          const newHeight = Math.max(-10.0, Math.min(25.0, +(baseH + delta).toFixed(2)));
          editor.setActiveFoundationDraft({
            ...editor.activeFoundationDraft,
            height: newHeight,
          });
          invalidate();
          return;
        }

        if ((editor.buildingMode === 'fortifications' || editor.wallMode === 'fortify') && editor.activeStamp) {
          if (e.buttons === 0) {
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
        } else if (editor.wallSnapPreview) {
          editor.setWallSnapPreview(null);
        }
      }
    },
    [
      executeSculpt,
      applyPaintBrush,
      updateCursor,
      hideCursor,
      camera,
      controls,
      stateBuffer,
      invalidate,
    ]
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const editor = useEditorStore.getState();
      if (editor.isPresentationMode || editor.activeTool === 'view' || editor.isJoystickActive) {
        gestureControllerRef.current.reset();
        isSculptingRef.current = false;
        isPaintingRef.current = false;
        isDrawingWallRef.current = false;
        isDraggingFoundationRef.current = false;
        isDrawingStairsRef.current = false;
        isDrawingSplineRef.current = false;
        isContinuousToolDragRef.current = false;
        isMousePanRef.current = false;
        pendingTapHitRef.current = null;
        return;
      }

      const action = gestureControllerRef.current.onPointerUp(
        {
          x: e.clientX,
          y: e.clientY,
          pointerType: e.pointerType,
        },
        { isJoystickActive: editor.isJoystickActive }
      );

      // 1. Single Tap Action Execution
      if (action.type === 'single_tap') {
        const hit = pendingTapHitRef.current || { point: e.point, normal: e.face?.normal };
        executeSingleTapAction(hit.point, hit.normal);
      }

      // 2. Continuous Drag Stroke Completion
      if (action.type === 'end_continuous_tool_drag' || isContinuousToolDragRef.current) {
        isContinuousToolDragRef.current = false;

        if (isDraggingFoundationRef.current && foundationAnchorRef.current) {
          const draft = editor.activeFoundationDraft;
          if (draft && draft.phase === 'base') {
            const dx = Math.abs(draft.x2 - draft.x1);
            const dz = Math.abs(draft.z2 - draft.z1);
            if (dx >= 0.15 && dz >= 0.15) {
              isDraggingFoundationRef.current = false;
              if (controls) {
                controls.enabled = false;
              }
              const clientY = (window.event as MouseEvent)?.clientY || window.innerHeight / 2;
              editor.setActiveFoundationDraft({
                ...draft,
                phase: 'height',
                height: editor.defaultFoundationHeight || 0.40,
                startPointerY: clientY,
              });
              editor.setToastMessage('Base locked! Move mouse up/down to adjust height, click to place.');
              invalidate();
              return;
            }
          }
          editor.setActiveFoundationDraft(null);
          isDraggingFoundationRef.current = false;
          foundationAnchorRef.current = null;
        }

        if (isDrawingStairsRef.current) {
          isDrawingStairsRef.current = false;
          lastStairPointRef.current = null;
        }

        if (isPaintingRef.current) {
          isPaintingRef.current = false;
          lastFoliagePointRef.current = null;
          useTerrainStore.setState({ lastUpdated: Date.now() });
        }

        if (isDrawingSplineRef.current) {
          isDrawingSplineRef.current = false;
          lastSplinePointRef.current = null;
        }

        if (isDrawingWallRef.current) {
          isDrawingWallRef.current = false;
          lastWallPointRef.current = null;
        }

        if (isSculptingRef.current) {
          pondOriginRef.current = null;
          slopeAnchorRef.current = null;
          isSculptingRef.current = false;
          const geo = useTerrainStore.getState().terrainGeometry;
          if (geo) {
            refitTerrainBVH(geo);
          }
          useTerrainStore.setState({ lastUpdated: Date.now() });
        }

        if (controls) {
          controls.enabled = true;
        }
        invalidate();
      }

      // 3. Mouse Pan Completion
      if (action.type === 'end_mouse_pan' || isMousePanRef.current) {
        isMousePanRef.current = false;
        if (controls) {
          controls.enabled = true;
        }
        invalidate();
      }

      pendingTapHitRef.current = null;
    },
    [controls, executeSingleTapAction, invalidate]
  );

  const handlePointerLeave = useCallback(() => {
    if (!isSculptingRef.current && !isPaintingRef.current && !isContinuousToolDragRef.current) {
      hideCursor();
    }
    const editor = useEditorStore.getState();
    if (editor.wallSnapPreview) {
      editor.setWallSnapPreview(null);
    }
  }, [hideCursor]);

  // Global window pointerup to catch pointer released outside mesh
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      gestureControllerRef.current.reset();
      isContinuousToolDragRef.current = false;
      isMousePanRef.current = false;

      if (isDraggingFoundationRef.current && foundationAnchorRef.current) {
        const editor = useEditorStore.getState();
        const draft = editor.activeFoundationDraft;
        if (draft && draft.phase === 'base') {
          const dx = Math.abs(draft.x2 - draft.x1);
          const dz = Math.abs(draft.z2 - draft.z1);
          if (dx >= 0.15 && dz >= 0.15) {
            isDraggingFoundationRef.current = false;
            if (controls) {
              controls.enabled = false;
            }
            const clientY = (window.event as MouseEvent)?.clientY || window.innerHeight / 2;
            editor.setActiveFoundationDraft({
              ...draft,
              phase: 'height',
              height: editor.defaultFoundationHeight || 0.40,
              startPointerY: clientY,
            });
            editor.setToastMessage('Base locked! Move mouse up/down to adjust height, click to place.');
            invalidate();
            return;
          }
        }
        editor.setActiveFoundationDraft(null);
        isDraggingFoundationRef.current = false;
        foundationAnchorRef.current = null;
        if (controls) {
          controls.enabled = true;
        }
        invalidate();
      }

      if (isDrawingStairsRef.current) {
        isDrawingStairsRef.current = false;
        lastStairPointRef.current = null;
        if (controls) {
          controls.enabled = true;
        }
        invalidate();
      }

      if (isPaintingRef.current) {
        isPaintingRef.current = false;
        lastFoliagePointRef.current = null;
        if (controls) {
          controls.enabled = true;
        }
        useTerrainStore.setState({ lastUpdated: Date.now() });
        invalidate();
      }

      if (isDrawingSplineRef.current) {
        isDrawingSplineRef.current = false;
        lastSplinePointRef.current = null;
        if (controls) {
          controls.enabled = true;
        }
        invalidate();
      }

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
        const geo = useTerrainStore.getState().terrainGeometry;
        if (geo) {
          refitTerrainBVH(geo);
        }
        useTerrainStore.setState({ lastUpdated: Date.now() });
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

      {/* Ticket 16 Review Item 12: Wireframe Overlay (Gated by showWireframe & suppressed in presentation) */}
      {showWireframe && !isPresentationMode && (
        <mesh
          geometry={geometry}
          position={[0, 0.003, 0]}
          name="BaseTerrainWireframe"
          raycast={() => null}
        >
          <meshBasicMaterial
            wireframe
            color="#B85F45"
            transparent
            opacity={0.35}
            depthTest={true}
          />
        </mesh>
      )}

      <TerrainBrushCursor
        cursorStateRef={cursorStateRef}
        isPresentationMode={isPresentationMode}
        radius={
          activeTool === 'foliage'
            ? foliageBrushRadius
            : activeTool === 'prop' && propSubTool === 'erase'
            ? propEraseRadius
            : activeTool === 'lighting' && lightingSubTool === 'erase'
            ? lightEraseRadius
            : activeTool === 'texture' || activeTool === 'paint'
            ? paintBrushRadius
            : brushRadius
        }
        subTool={
          activeTool === 'foliage'
            ? foliageSubTool
            : (activeTool === 'prop' && propSubTool === 'erase') ||
              (activeTool === 'lighting' && lightingSubTool === 'erase')
            ? 'erase'
            : activeTool === 'texture' || activeTool === 'paint'
            ? paintSubTool
            : terrainSubTool
        }
        toolActive={
          activeTool === 'terrain' ||
          activeTool === 'texture' ||
          activeTool === 'paint' ||
          activeTool === 'foliage' ||
          (activeTool === 'prop' && propSubTool === 'erase') ||
          (activeTool === 'lighting' && lightingSubTool === 'erase')
        }
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

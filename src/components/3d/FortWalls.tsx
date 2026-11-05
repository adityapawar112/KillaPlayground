'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useEditorStore, FoundationSlab } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import {
  generateWallBufferGeometry,
  detectBastionLocations,
  sampleBilinearHeight,
  calculateMagneticSnap,
} from '@/lib/walls/wallGeometry';
import { WallPath, WallPoint, DEFAULT_WALL_SETTINGS } from '@/lib/walls/wallTypes';
import { generateFoundationBufferGeometry } from '@/lib/foundations/foundationGeometry';
import { handleStructurePointerDown, handleStructurePointerMove } from '@/lib/interaction/surfaceToolInteraction';

/**
 * Draft wall preview line and node markers during construction.
 */
const WallDraftPreview: React.FC<{
  draftPoints: WallPoint[];
  nightMode: boolean;
}> = ({ draftPoints, nightMode }) => {
  const lineObject = useMemo(() => {
    if (draftPoints.length < 2) return null;
    const pts = draftPoints.map((p) => new THREE.Vector3(p.x, p.y + 0.04, p.z));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: nightMode ? '#f59e0b' : '#d97706',
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    });
    return new THREE.Line(geo, mat);
  }, [draftPoints, nightMode]);

  useEffect(() => {
    return () => {
      if (lineObject) {
        lineObject.geometry.dispose();
        (lineObject.material as THREE.Material).dispose();
      }
    };
  }, [lineObject]);

  if (draftPoints.length === 0) return null;

  return (
    <group name="WallDraftPreview">
      {/* Dynamic line connecting points */}
      {lineObject && <primitive object={lineObject} />}

      {/* Node Markers */}
      {draftPoints.map((p, idx) => {
        const isStart = idx === 0;
        const canClose = isStart && draftPoints.length >= 3;
        return (
          <mesh
            key={`node_${idx}`}
            position={[p.x, p.y + 0.03, p.z]}
          >
            <cylinderGeometry
              args={[
                canClose ? 0.08 : 0.05,
                canClose ? 0.08 : 0.05,
                0.04,
                16,
              ]}
            />
            <meshBasicMaterial
              color={canClose ? '#22c55e' : isStart ? '#eab308' : '#f97316'}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Interactive selection surface matching the exact top floor quad of a Rampart Platform.
 */
const BoxPlatformSelectionMesh: React.FC<{
  tc0: [number, number, number];
  tc1: [number, number, number];
  tc2: [number, number, number];
  tc3: [number, number, number];
  boxTopY: number;
  isSelected: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerDown?: (e: any) => void;
  onPointerMove?: (e: any) => void;
}> = ({ tc0, tc1, tc2, tc3, boxTopY, isSelected, onClick, onPointerDown, onPointerMove }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array([
      tc0[0], boxTopY + 0.005, tc0[2],
      tc1[0], boxTopY + 0.005, tc1[2],
      tc2[0], boxTopY + 0.005, tc2[2],
      tc3[0], boxTopY + 0.005, tc3[2],
    ]);
    const normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
    const indices = [0, 1, 2, 0, 2, 3];
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    g.setIndex(indices);
    return g;
  }, [tc0, tc1, tc2, tc3, boxTopY]);

  useEffect(() => {
    return () => geo.dispose();
  }, [geo]);

  return (
    <mesh
      geometry={geo}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerOver={(e) => {
        const editor = useEditorStore.getState();
        const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
        if (isSelect) {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <meshBasicMaterial
        color={isSelected ? '#10b981' : '#06b6d4'}
        transparent
        opacity={isSelected ? 0.70 : 0.25}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Single Wall Mesh rendering the procedural fort ramparts, bastions, and arched gates.
 */
const SingleWallMeshComponent: React.FC<{
  wall: WallPath;
  stateBuffer: Float32Array;
  terrainVersion?: number;
  materials: THREE.Material[];
}> = ({ wall, stateBuffer, terrainVersion, materials }) => {
  const { invalidate } = useThree();
  const geometry = useMemo(() => {
    // Wall geometry regenerates when wall settings change or terrain heightmap changes
    return generateWallBufferGeometry(wall, stateBuffer);
  }, [wall, terrainVersion, stateBuffer]);

  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 35);
  }, [geometry]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      edgesGeometry.dispose();
    };
  }, [geometry, edgesGeometry]);

  const hasValidGeometry = Boolean(geometry.attributes.position && geometry.attributes.position.count > 0);
  if (!hasValidGeometry) return null;

  const isSelected = useEditorStore((s) => s.selectedWallId === wall.id);
  const isHovered = useEditorStore((s) => s.hoveredElement?.type === 'wall' && s.hoveredElement.id === wall.id);
  const wallStep = useEditorStore((s) => s.wallStep);
  const activeStamp = useEditorStore((s) => s.activeStamp);
  const selectedComponent = useEditorStore((s) => s.selectedComponent);
  const activeTool = useEditorStore((s) => s.activeTool);
  const buildingMode = useEditorStore((s) => s.buildingMode);
  const wallMode = useEditorStore((s) => s.wallMode);

  const isWallSelectMode = (activeTool === 'building' && buildingMode === 'select') || (activeTool === 'walls' && wallMode === 'select');
  const isFortifyMode = (activeTool === 'building' && buildingMode === 'fortifications') || (activeTool === 'walls' && wallMode === 'fortify');
  const showHandles = isSelected && (isFortifyMode || isWallSelectMode || wallStep === 'fortify');

  const handleWallClick = (e: any) => {
    // Only LEFT click selects or stamps (Right click is reserved for camera navigation)
    if (e.button !== 0 && e.nativeEvent?.button !== 0) return;

    const editor = useEditorStore.getState();
    const isWallSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
    const isFortify = (editor.activeTool === 'building' && editor.buildingMode === 'fortifications') || (editor.activeTool === 'walls' && editor.wallMode === 'fortify');

    if (!isWallSelect && !isFortify) return;
    if (editor.activeWallDraft.length > 0) return;
    e.stopPropagation();

    // If in fortify mode with an active stamp, stamp on the wall at the raycast point
    if (isFortify && editor.activeStamp) {
      const snap = calculateMagneticSnap(
        editor.activeStamp,
        e.point,
        editor.walls,
        wall.id,
        stateBuffer
      );
      if (snap.snapped && snap.wallId && snap.segmentIndex !== undefined) {
        if (editor.activeStamp === 'tower' || editor.activeStamp === 'buruj') {
          editor.addTowerToWall(snap.wallId, snap.segmentIndex, snap.t);
          editor.setToastMessage('Watchtower placed! Click along wall to place another, or switch mode when done.');
        } else if (editor.activeStamp === 'box') {
          editor.addBoxBastionToWall(snap.wallId, snap.segmentIndex, snap.t);
          editor.setToastMessage('Rampart Bastion placed! Click along wall to place another, or switch mode when done.');
        } else if (editor.activeStamp === 'round_bastion') {
          editor.addRoundBastionToWall(snap.wallId, snap.segmentIndex, snap.t);
          editor.setToastMessage('Round Bastion placed! Click along wall to place another, or switch mode when done.');
        } else if (editor.activeStamp === 'gate') {
          editor.addGateToWall(snap.wallId, snap.segmentIndex, snap.t);
          editor.setToastMessage('Arched Gateway inserted! Click along wall to place another, or switch mode when done.');
        }
      }
      return;
    }

    editor.setSelectedWallId(wall.id);
    if (editor.wallStep === 'solidified') {
      editor.setWallStep('fortify');
      editor.setToastMessage('Wall selected in Fortify mode.');
    } else {
      editor.setToastMessage('Fort wall selected. Adjust properties or add bastions/gates.');
    }
  };

  const handleWallPointerDown = (e: any) => {
    if (handleStructurePointerDown(e, invalidate)) {
      return;
    }
  };

  const handleWallPointerMove = (e: any) => {
    if (handleStructurePointerMove(e, invalidate)) {
      return;
    }
    const editor = useEditorStore.getState();
    const isFortify = (editor.activeTool === 'building' && editor.buildingMode === 'fortifications') || (editor.activeTool === 'walls' && editor.wallMode === 'fortify');

    if (isFortify && editor.activeStamp) {
      const snap = calculateMagneticSnap(
        editor.activeStamp,
        e.point,
        editor.walls,
        wall.id,
        stateBuffer
      );
      editor.setWallSnapPreview(snap);
      return;
    } else if (editor.wallSnapPreview && !isFortify) {
      editor.setWallSnapPreview(null);
    }
  };

  const wallSettings = wall.settings || DEFAULT_WALL_SETTINGS;

  // Compute bastions on this wall for interactive 3D handles
  const bastionIndices = useMemo(() => {
    return detectBastionLocations(
      wall.points,
      wall.isClosed,
      wallSettings.autoBastions,
      wall.manualBastionIndices,
      wall.excludedBastionIndices
    );
  }, [wall.points, wall.isClosed, wallSettings.autoBastions, wall.manualBastionIndices, wall.excludedBastionIndices]);

  const baseBastionRadius = Math.max(0.08, Math.min(0.60, wallSettings.bastionRadius || 0.25));

  return (
    <group name={`FortWall_${wall.id}`}>
      <mesh
        geometry={geometry}
        material={materials}
        castShadow
        receiveShadow
        onClick={handleWallClick}
        onPointerDown={handleWallPointerDown}
        onPointerMove={handleWallPointerMove}
        onPointerOver={(e) => {
          const editor = useEditorStore.getState();
          const isSelectOrFortify =
            (editor.activeTool === 'building' && (editor.buildingMode === 'select' || editor.buildingMode === 'fortifications')) ||
            (editor.activeTool === 'walls' && (editor.wallMode === 'select' || editor.wallMode === 'fortify'));
          if (isSelectOrFortify) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            editor.setHoveredElement({ type: 'wall', id: wall.id });
          }
        }}
        onPointerOut={() => {
          const editor = useEditorStore.getState();
          if (editor.hoveredElement?.type === 'wall' && editor.hoveredElement.id === wall.id) {
            document.body.style.cursor = 'default';
            editor.setHoveredElement(null);
          }
        }}
      />
      {(isSelected || isHovered) && (
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color={isHovered && !isSelected ? '#E85D04' : '#F59E0B'} linewidth={2} />
        </lineSegments>
      )}
      {showHandles && (
        <group name={`VertexOverlay_${wall.id}`}>
          {/* Subtle amber wireframe highlight */}
          <mesh
            geometry={geometry}
            castShadow={false}
            receiveShadow={false}
          >
            <meshBasicMaterial
              color="#fbbf24"
              wireframe
              transparent
              opacity={0.25}
            />
          </mesh>

          {/* Interactive Bastion Top Discs (Auto Bastions) */}
          {bastionIndices.map((bIdx) => {
            const pt = wall.points[bIdx];
            if (!pt) return null;
            const custom = wall.customBastions?.[bIdx];
            const isGrand = wall.grandBastionIndices?.includes(bIdx) || custom?.isGrand;
            const customR = custom?.radius;
            const customHOffset = custom?.heightOffset || 0;
            const bastionRadius = customR ?? (isGrand ? baseBastionRadius * 1.5 : baseBastionRadius);
            const towerH = (isGrand ? wall.settings.height * 1.25 : wall.settings.height + 0.015) + customHOffset;
            const groundY = sampleBilinearHeight(stateBuffer, pt.x, pt.z);
            const bTopY = groundY + towerH;

            const isBastionSelected =
              selectedComponent?.type === 'bastion' &&
              selectedComponent.idOrIndex === bIdx &&
              selectedComponent.wallId === wall.id;

            return (
              <group key={`bastion_handle_${bIdx}`} position={[pt.x, bTopY, pt.z]}>
                {/* Generous Clickable Top Floor Disc */}
                <mesh
                  position={[0, 0.005, 0]}
                  onPointerDown={handleWallPointerDown}
                  onClick={(e) => {
                    if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (!isSelect) return;
                    e.stopPropagation();
                    editor.setSelectedComponent({ type: 'bastion', idOrIndex: bIdx, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                    editor.setToastMessage('Rampart Bastion selected.');
                  }}
                  onPointerOver={(e) => {
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (isSelect) {
                      e.stopPropagation();
                      document.body.style.cursor = 'pointer';
                    }
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = 'default';
                  }}
                >
                  <cylinderGeometry args={[bastionRadius * 0.95, bastionRadius * 0.95, 0.02, 16]} />
                  <meshBasicMaterial
                    color={isBastionSelected ? '#10b981' : '#3b82f6'}
                    transparent
                    opacity={isBastionSelected ? 0.75 : 0.35}
                  />
                </mesh>

                {/* Glowing Selection Rim Ring when active */}
                {isBastionSelected && (
                  <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[bastionRadius * 0.95, bastionRadius * 1.15, 32]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.9} side={THREE.DoubleSide} />
                  </mesh>
                )}
              </group>
            );
          })}

          {/* Interactive Sliding Round Towers (Blue selection plane on top) */}
          {wall.towers?.map((tw) => {
            const origCount = wall.isClosed && wall.points.length >= 3 ? wall.points.length : wall.points.length - 1;
            const segIdx = Math.max(0, Math.min(origCount - 1, tw.segmentIndex));
            const pA = wall.points[segIdx];
            const pB = wall.points[(segIdx + 1) % wall.points.length];
            if (!pA || !pB) return null;

            const t = Math.max(0.05, Math.min(0.95, tw.t || 0.5));
            const twX = pA.x + (pB.x - pA.x) * t;
            const twZ = pA.z + (pB.z - pA.z) * t;
            const twRadius = Math.max(0.06, Math.min(0.35, tw.radius || 0.13));
            const twH = wallSettings.height + (tw.heightOffset || 0.02);
            const groundY = sampleBilinearHeight(stateBuffer, twX, twZ);
            const twTopY = groundY + twH;

            const isTowerSelected =
              selectedComponent?.type === 'tower' &&
              selectedComponent.idOrIndex === tw.id &&
              selectedComponent.wallId === wall.id;

            return (
              <group key={`tower_handle_${tw.id}`} position={[twX, twTopY, twZ]}>
                {/* Generous Clickable Top Floor Disc */}
                <mesh
                  position={[0, 0.005, 0]}
                  onPointerDown={handleWallPointerDown}
                  onClick={(e) => {
                    if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (!isSelect) return;
                    e.stopPropagation();
                    editor.setSelectedComponent({ type: 'tower', idOrIndex: tw.id, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                    editor.setToastMessage('Watchtower selected.');
                  }}
                  onPointerOver={(e) => {
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (isSelect) {
                      e.stopPropagation();
                      document.body.style.cursor = 'pointer';
                    }
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = 'default';
                  }}
                >
                  <cylinderGeometry args={[twRadius * 0.95, twRadius * 0.95, 0.015, 16]} />
                  <meshBasicMaterial
                    color={isTowerSelected ? '#10b981' : '#3b82f6'}
                    transparent
                    opacity={isTowerSelected ? 0.75 : 0.35}
                  />
                </mesh>

                {/* Glowing Selection Rim Ring */}
                {isTowerSelected && (
                  <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[twRadius * 0.95, twRadius * 1.15, 32]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.9} side={THREE.DoubleSide} />
                  </mesh>
                )}
              </group>
            );
          })}

          {/* Interactive Rampart Platform Bastions (Box) */}
          {wall.boxBastions?.map((bx) => {
            const origCount = wall.isClosed && wall.points.length >= 3 ? wall.points.length : wall.points.length - 1;
            const segIdx = Math.max(0, Math.min(origCount - 1, bx.segmentIndex));
            const pA = wall.points[segIdx];
            const pB = wall.points[(segIdx + 1) % wall.points.length];
            if (!pA || !pB) return null;

            const t = Math.max(0.05, Math.min(0.95, bx.t || 0.5));
            const attachX = pA.x + (pB.x - pA.x) * t;
            const attachZ = pA.z + (pB.z - pA.z) * t;

            const dx = pB.x - pA.x;
            const dz = pB.z - pA.z;
            const len = Math.hypot(dx, dz) || 1;
            const tan = { x: dx / len, z: dz / len };
            const norm = { x: -tan.z, z: tan.x };

            let inDir = 1;
            if (wall.isClosed && wall.points.length >= 3) {
              let cX = 0, cZ = 0;
              for (const p of wall.points) { cX += p.x; cZ += p.z; }
              cX /= wall.points.length; cZ /= wall.points.length;
              inDir = (norm.x * (cX - attachX) + norm.z * (cZ - attachZ)) >= 0 ? 1 : -1;
            } else {
              const hPlus = sampleBilinearHeight(stateBuffer, attachX + norm.x * 0.3, attachZ + norm.z * 0.3);
              const hMinus = sampleBilinearHeight(stateBuffer, attachX - norm.x * 0.3, attachZ - norm.z * 0.3);
              inDir = hPlus >= hMinus ? 1 : -1;
            }
            if (bx.flipSide) inDir = -inDir;

            const inNorm = { x: norm.x * inDir, z: norm.z * inDir };
            const bWidth = Math.max(0.15, Math.min(0.80, bx.width || 0.30));
            const bDepth = Math.max(0.15, Math.min(0.80, bx.depth || 0.30));
            const halfW = bWidth * 0.5;

            const boxCenterX = attachX + inNorm.x * (bDepth * 0.5);
            const boxCenterZ = attachZ + inNorm.z * (bDepth * 0.5);
            const groundY = sampleBilinearHeight(stateBuffer, boxCenterX, boxCenterZ);
            const boxTopY = groundY + wallSettings.height + (bx.heightOffset || 0.04);

            // Exact 4 top corners matching the 3D geometry
            const tc0: [number, number, number] = [attachX - tan.x * halfW, boxTopY, attachZ - tan.z * halfW];
            const tc1: [number, number, number] = [attachX + tan.x * halfW, boxTopY, attachZ + tan.z * halfW];
            const tc2: [number, number, number] = [attachX + tan.x * halfW + inNorm.x * bDepth, boxTopY, attachZ + tan.z * halfW + inNorm.z * bDepth];
            const tc3: [number, number, number] = [attachX - tan.x * halfW + inNorm.x * bDepth, boxTopY, attachZ - tan.z * halfW + inNorm.z * bDepth];

            const isBoxSelected =
              selectedComponent?.type === 'box' &&
              selectedComponent.idOrIndex === bx.id &&
              selectedComponent.wallId === wall.id;

            return (
              <BoxPlatformSelectionMesh
                key={`box_handle_${bx.id}`}
                tc0={tc0}
                tc1={tc1}
                tc2={tc2}
                tc3={tc3}
                boxTopY={boxTopY}
                isSelected={isBoxSelected}
                onPointerDown={handleWallPointerDown}
                onClick={(e) => {
                  if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
                  const editor = useEditorStore.getState();
                  const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                  if (!isSelect) return;
                  e.stopPropagation();
                  editor.setSelectedComponent({ type: 'box', idOrIndex: bx.id, wallId: wall.id });
                  editor.setSelectedWallId(wall.id);
                  editor.setToastMessage('Rampart Platform selected.');
                }}
              />
            );
          })}

          {/* Interactive Semi-Circular Round Bastions */}
          {wall.roundBastions?.map((rb) => {
            const origCount = wall.isClosed && wall.points.length >= 3 ? wall.points.length : wall.points.length - 1;
            const segIdx = Math.max(0, Math.min(origCount - 1, rb.segmentIndex));
            const pA = wall.points[segIdx];
            const pB = wall.points[(segIdx + 1) % wall.points.length];
            if (!pA || !pB) return null;

            const t = Math.max(0.05, Math.min(0.95, rb.t || 0.5));
            const attachX = pA.x + (pB.x - pA.x) * t;
            const attachZ = pA.z + (pB.z - pA.z) * t;

            const dx = pB.x - pA.x;
            const dz = pB.z - pA.z;
            const len = Math.hypot(dx, dz) || 1;
            const tan = { x: dx / len, z: dz / len };
            const norm = { x: -tan.z, z: tan.x };

            let inDir = 1;
            if (wall.isClosed && wall.points.length >= 3) {
              let cX = 0, cZ = 0;
              for (const p of wall.points) { cX += p.x; cZ += p.z; }
              cX /= wall.points.length; cZ /= wall.points.length;
              inDir = (norm.x * (cX - attachX) + norm.z * (cZ - attachZ)) >= 0 ? 1 : -1;
            } else {
              const hPlus = sampleBilinearHeight(stateBuffer, attachX + norm.x * 0.3, attachZ + norm.z * 0.3);
              const hMinus = sampleBilinearHeight(stateBuffer, attachX - norm.x * 0.3, attachZ - norm.z * 0.3);
              inDir = hPlus >= hMinus ? 1 : -1;
            }
            let outDir = -inDir;
            if (rb.flipSide) outDir = -outDir;
            const outNorm = { x: norm.x * outDir, z: norm.z * outDir };

            const radius = Math.max(0.08, Math.min(0.60, rb.radius || 0.18));
            const edgeX = attachX + outNorm.x * (wallSettings.thickness * 0.5);
            const edgeZ = attachZ + outNorm.z * (wallSettings.thickness * 0.5);
            const bCenterX = edgeX + outNorm.x * (radius * 0.5);
            const bCenterZ = edgeZ + outNorm.z * (radius * 0.5);
            const groundY = sampleBilinearHeight(stateBuffer, bCenterX, bCenterZ);
            const bastionTopY = groundY + wallSettings.height + (rb.heightOffset || 0.04);
            const rotY = Math.atan2(outNorm.x, outNorm.z);

            const isRbSelected =
              selectedComponent?.type === 'round_bastion' &&
              selectedComponent.idOrIndex === rb.id &&
              selectedComponent.wallId === wall.id;

            return (
              <group key={`round_bastion_handle_${rb.id}`} position={[edgeX, bastionTopY + 0.005, edgeZ]} rotation={[0, rotY, 0]}>
                <mesh
                  position={[0, 0, 0]}
                  onPointerDown={handleWallPointerDown}
                  onClick={(e) => {
                    if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (!isSelect) return;
                    e.stopPropagation();
                    editor.setSelectedComponent({ type: 'round_bastion', idOrIndex: rb.id, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                    editor.setToastMessage('Round Bastion selected.');
                  }}
                  onPointerOver={(e) => {
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (isSelect) {
                      e.stopPropagation();
                      document.body.style.cursor = 'pointer';
                    }
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = 'default';
                  }}
                >
                  <cylinderGeometry args={[radius * 0.95, radius * 0.95, 0.015, 16, 1, false, -Math.PI / 2, Math.PI]} />
                  <meshBasicMaterial
                    color={isRbSelected ? '#10b981' : '#3b82f6'}
                    transparent
                    opacity={isRbSelected ? 0.75 : 0.35}
                  />
                </mesh>
              </group>
            );
          })}

          {/* Interactive Gate Handles (Portal Arch Volume) */}
          {wall.gates.map((g) => {
            const origCount = wall.isClosed && wall.points.length >= 3 ? wall.points.length : wall.points.length - 1;
            const segIdx = Math.max(0, Math.min(origCount - 1, g.segmentIndex));
            const pA = wall.points[segIdx];
            const pB = wall.points[(segIdx + 1) % wall.points.length];
            if (!pA || !pB) return null;

            const t = Math.max(0.15, Math.min(0.85, g.t || 0.5));
            const gx = pA.x + (pB.x - pA.x) * t;
            const gz = pA.z + (pB.z - pA.z) * t;
            const groundY = sampleBilinearHeight(stateBuffer, gx, gz);
            const gateW = Math.max(0.20, Math.min(0.80, g.width || wallSettings.thickness * 2.2));
            const gateH = wallSettings.height * 0.70;

            const dx = pB.x - pA.x;
            const dz = pB.z - pA.z;
            const rotY = Math.atan2(dx, dz);

            const isGateSelected =
              selectedComponent?.type === 'gate' &&
              selectedComponent.idOrIndex === g.id &&
              selectedComponent.wallId === wall.id;

            return (
              <group key={`gate_handle_${g.id}`} position={[gx, groundY + gateH * 0.5, gz]} rotation={[0, rotY, 0]}>
                <mesh
                  onPointerDown={handleWallPointerDown}
                  onClick={(e) => {
                    if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (!isSelect) return;
                    e.stopPropagation();
                    editor.setSelectedComponent({ type: 'gate', idOrIndex: g.id, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                    editor.setToastMessage('Arched Gateway selected.');
                  }}
                  onPointerOver={(e) => {
                    const editor = useEditorStore.getState();
                    const isSelect = (editor.activeTool === 'building' && editor.buildingMode === 'select') || (editor.activeTool === 'walls' && editor.wallMode === 'select');
                    if (isSelect) {
                      e.stopPropagation();
                      document.body.style.cursor = 'pointer';
                    }
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = 'default';
                  }}
                >
                  <boxGeometry args={[wallSettings.thickness * 1.5, gateH * 1.05, gateW * 1.05]} />
                  <meshBasicMaterial
                    color={isGateSelected ? '#10b981' : '#e85d04'}
                    transparent
                    opacity={isGateSelected ? 0.6 : 0.25}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
};

const SingleWallMesh = React.memo(SingleWallMeshComponent);

/**
 * Real-time Magnetic Snap Hologram Preview
 */
const SnapHologramPreview: React.FC = () => {
  const activeStamp = useEditorStore((s) => s.activeStamp);
  const snap = useEditorStore((s) => s.wallSnapPreview);

  if (!activeStamp || !snap) return null;

  const [x, y, z] = snap.position;
  const isSnapped = snap.snapped;
  const holoColor = isSnapped ? '#10b981' : '#f59e0b';

  return (
    <group position={[x, y + 0.01, z]} rotation={[0, snap.rotationY || 0, 0]}>
      {/* Magnetic Snap Ring Indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.24, 32]} />
        <meshBasicMaterial
          color={holoColor}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hologram 3D Silhouette: Tower (Sliding round cylinder) */}
      {(activeStamp === 'tower' || activeStamp === 'buruj') && (
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.30, 16]} />
          <meshBasicMaterial
            color={holoColor}
            wireframe
            transparent
            opacity={0.65}
          />
        </mesh>
      )}

      {/* Hologram 3D Silhouette: Rampart Bastion Platform (Face stuck to wall, extending inward into courtyard) */}
      {activeStamp === 'box' && (
        <mesh position={[0, 0.15, 0.15]}>
          <boxGeometry args={[0.30, 0.30, 0.30]} />
          <meshBasicMaterial
            color={holoColor}
            wireframe
            transparent
            opacity={0.65}
          />
        </mesh>
      )}

      {/* Hologram 3D Silhouette: Semi-Circular Round Bastion (Sits on outer side of wall) */}
      {activeStamp === 'round_bastion' && (
        <mesh position={[0, 0.15, 0.075]}>
          <cylinderGeometry args={[0.18, 0.18, 0.30, 16, 1, false, -Math.PI / 2, Math.PI]} />
          <meshBasicMaterial
            color={holoColor}
            wireframe
            transparent
            opacity={0.65}
          />
        </mesh>
      )}

      {/* Hologram 3D Silhouette: Gate (Rotation matches outward-facing normal of the wall) */}
      {activeStamp === 'gate' && (
        <group>
          {/* Left Flanking Tower along wall */}
          <mesh position={[-0.15, 0.14, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.28, 12]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
          {/* Right Flanking Tower along wall */}
          <mesh position={[0.15, 0.14, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.28, 12]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
          {/* Portal Arch Lintel spanning across gateway */}
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.22, 0.06, 0.12]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * Interactive solid stone foundation slab component.
 */
const FoundationMeshComponent: React.FC<{
  slab: FoundationSlab;
  materials: THREE.Material[];
}> = ({ slab, materials }) => {
  const { invalidate } = useThree();
  const geometry = useMemo(() => {
    return generateFoundationBufferGeometry(slab);
  }, [slab.length, slab.width, slab.height, slab.tilingRepeat]);

  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry);
  }, [geometry]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      edgesGeometry.dispose();
    };
  }, [geometry, edgesGeometry]);

  const isSelected = useEditorStore((s) => s.selectedFoundationId === slab.id);
  const isHovered = useEditorStore((s) => s.hoveredElement?.type === 'foundation' && s.hoveredElement.id === slab.id);

  const absH = Math.max(0.05, Math.abs(slab.height));
  const posY = slab.height < 0
    ? slab.y + (slab.verticalOffset || 0) - absH / 2
    : slab.y + (slab.verticalOffset || 0) + absH / 2;

  const handlePointerDown = (e: any) => {
    if (handleStructurePointerDown(e, invalidate)) {
      return;
    }
  };

  const handlePointerMove = (e: any) => {
    if (handleStructurePointerMove(e, invalidate)) {
      return;
    }
  };

  return (
    <group
      position={[slab.x, posY, slab.z]}
      rotation={[0, slab.rotationY || 0, 0]}
      onClick={(e) => {
        if (e.button !== 0 && e.nativeEvent?.button !== 0) return;
        const editor = useEditorStore.getState();
        // Foundation is ONLY selectable in select mode, never during foundation drawing or other tools
        const isSelectable =
          (editor.activeTool === 'building' && editor.buildingMode === 'select') ||
          (editor.activeTool === 'walls' && editor.wallMode === 'select');
        if (!isSelectable) return;
        e.stopPropagation();
        editor.setSelectedFoundationId(slab.id);
        editor.setToastMessage(`${slab.name || 'Stone Foundation'} selected.`);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        const editor = useEditorStore.getState();
        const isSelectable =
          (editor.activeTool === 'building' && editor.buildingMode === 'select') ||
          (editor.activeTool === 'walls' && editor.wallMode === 'select');
        if (isSelectable) {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          editor.setHoveredElement({ type: 'foundation', id: slab.id });
        }
      }}
      onPointerOut={() => {
        const editor = useEditorStore.getState();
        if (editor.hoveredElement?.type === 'foundation' && editor.hoveredElement.id === slab.id) {
          document.body.style.cursor = 'default';
          editor.setHoveredElement(null);
        }
      }}
    >
      <mesh
        geometry={geometry}
        material={materials}
        castShadow
        receiveShadow
        name={`Foundation_${slab.id}`}
      />
      {(isSelected || isHovered) && (
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial
            color={isHovered && !isSelected ? '#E85D04' : '#F59E0B'}
            linewidth={2}
          />
        </lineSegments>
      )}
    </group>
  );
};

const FoundationMesh = React.memo(FoundationMeshComponent);

/**
 * Real-time translucent ghost preview during foundation click-and-drag.
 */
const FoundationDraftGhost: React.FC<{
  draft: { x1: number; z1: number; x2: number; z2: number; y: number; height?: number; phase?: 'base' | 'height' };
  height: number;
  offset: number;
}> = ({ draft, height, offset }) => {
  const dx = Math.abs(draft.x2 - draft.x1);
  const dz = Math.abs(draft.z2 - draft.z1);
  const cx = (draft.x1 + draft.x2) / 2;
  const cz = (draft.z1 + draft.z2) / 2;
  const rawH = draft.height ?? height;
  const absH = Math.max(0.05, Math.abs(rawH));
  const cy = rawH < 0 ? draft.y + offset - absH / 2 : draft.y + offset + absH / 2;

  const geo = useMemo(() => {
    return new THREE.BoxGeometry(Math.max(0.05, dx), absH, Math.max(0.05, dz));
  }, [dx, absH, dz]);

  const edgesGeo = useMemo(() => {
    return new THREE.EdgesGeometry(geo);
  }, [geo]);

  useEffect(() => {
    return () => {
      geo.dispose();
      edgesGeo.dispose();
    };
  }, [geo, edgesGeo]);

  return (
    <group position={[cx, cy, cz]} name="FoundationDraftGhost">
      <mesh geometry={geo}>
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#E85D04" linewidth={2} />
      </lineSegments>
    </group>
  );
};

/**
 * Foundation Draft Layer - isolated from FortWalls re-renders
 */
const FoundationDraftLayer: React.FC = () => {
  const activeTool = useEditorStore((s) => s.activeTool);
  const buildingMode = useEditorStore((s) => s.buildingMode);
  const draft = useEditorStore((s) => s.activeFoundationDraft);
  const height = useEditorStore((s) => s.defaultFoundationHeight || 0.40);
  const offset = useEditorStore((s) => s.defaultFoundationOffset || 0.0);

  if ((activeTool !== 'building' && activeTool !== 'walls') || buildingMode !== 'foundation' || !draft) {
    return null;
  }
  return <FoundationDraftGhost draft={draft} height={height} offset={offset} />;
};

/**
 * Wall Construction Draft Layer - isolated from FortWalls re-renders
 */
const WallDraftLayer: React.FC = () => {
  const activeTool = useEditorStore((s) => s.activeTool);
  const buildingMode = useEditorStore((s) => s.buildingMode);
  const wallMode = useEditorStore((s) => s.wallMode);
  const draftPoints = useEditorStore((s) => s.activeWallDraft);
  const nightMode = useEditorStore((s) => s.nightMode);

  if ((activeTool !== 'building' && activeTool !== 'walls') || (wallMode !== 'draw' && buildingMode !== 'walls') || draftPoints.length === 0) {
    return null;
  }
  return <WallDraftPreview draftPoints={draftPoints} nightMode={nightMode} />;
};

/**
 * Fortifications Magnetic Snap Hologram Layer - isolated from FortWalls re-renders
 */
const FortificationsHologramLayer: React.FC = () => {
  const activeTool = useEditorStore((s) => s.activeTool);
  const buildingMode = useEditorStore((s) => s.buildingMode);
  const wallMode = useEditorStore((s) => s.wallMode);

  if ((activeTool !== 'building' && activeTool !== 'walls') || (wallMode !== 'fortify' && buildingMode !== 'fortifications')) {
    return null;
  }
  return <SnapHologramPreview />;
};

/**
 * FortWalls Container Component
 * Renders all completed fort walls, foundations, preview draft line, and manages textures/materials.
 */
export const FortWalls: React.FC = () => {
  const walls = useEditorStore((s) => s.walls);
  const foundations = useEditorStore((s) => s.foundations);
  const { stateBuffer, lastUpdated } = useTerrainStore();
  const { invalidate, scene } = useThree();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__threeScene = scene;
    }
  }, [scene]);

  useEffect(() => {
    invalidate();
  }, [walls, foundations, lastUpdated, invalidate]);

  // Cancel active stamp on Escape key & guarantee OrbitControls enabled on pointerup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const editor = useEditorStore.getState();
        if (editor.activeStamp) {
          editor.setActiveStamp(null);
          editor.setToastMessage('Stamp mode canceled.');
        }
      }
    };
    const handlePointerUp = () => {
      const rawControls = (window as any).__orbitControls;
      if (rawControls && !rawControls.enabled) {
        rawControls.enabled = true;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // 1. Load Retroground PBR mossy stone brick textures (GROUP 0: Wall and tower sides)
  const brickTextures = useTexture({
    diffuse: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_basecolor.png',
    normal: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_normal.png',
    roughness: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_roughness.png',
    ao: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_ao.png',
  });

  // 2. Load Dark Stone Floor PBR textures (GROUP 1: Rampart walkways and tower floor discs)
  const floorTextures = useTexture({
    diffuse: '/textures/Bricks/dark_stone_floor_128x128_pbr/dark_stone_floor_128x128_basecolor.png',
    normal: '/textures/Bricks/dark_stone_floor_128x128_pbr/dark_stone_floor_128x128_normal.png',
    roughness: '/textures/Bricks/dark_stone_floor_128x128_pbr/dark_stone_floor_128x128_roughness.png',
    ao: '/textures/Bricks/dark_stone_floor_128x128_pbr/dark_stone_floor_128x128_ao.png',
  });

  // 3. Load Dark Solid Stone PBR textures (GROUP 2: Pointed kangare battlements and soffits)
  const darkStoneTextures = useTexture({
    diffuse: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_basecolor.png',
    normal: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_normal.png',
    roughness: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_roughness.png',
    ao: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_ao.png',
  });

  // Configure original texture color spaces and clean linear filtering
  useEffect(() => {
    const diffMaps = [
      brickTextures.diffuse,
      floorTextures.diffuse,
      darkStoneTextures.diffuse,
    ];
    diffMaps.forEach((tex) => {
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
      }
    });

    const linearMaps = [
      brickTextures.normal, brickTextures.roughness, brickTextures.ao,
      floorTextures.normal, floorTextures.roughness, floorTextures.ao,
      darkStoneTextures.normal, darkStoneTextures.roughness, darkStoneTextures.ao,
    ];
    linearMaps.forEach((tex) => {
      if (tex) {
        tex.colorSpace = THREE.NoColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
      }
    });
  }, [brickTextures, floorTextures, darkStoneTextures]);

  // Multi-material set: [Group 0: Stone Wall, Group 1: Dark Stone Floor Walkway, Group 2: Dark Stone Kangare]
  // Stable material instances instantiated once to prevent continuous recreation during render cycles
  const wallMaterials = useMemo(() => {
    const mat0 = new THREE.MeshStandardMaterial({
      roughness: 0.90,
      metalness: 0.0,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    const mat1 = new THREE.MeshStandardMaterial({
      roughness: 0.90,
      metalness: 0.0,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    const mat2 = new THREE.MeshStandardMaterial({
      roughness: 0.92,
      metalness: 0.0,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    return [mat0, mat1, mat2];
  }, []);

  // Sync textures to materials cleanly without re-allocating WebGL program pipelines
  useEffect(() => {
    const [mat0, mat1, mat2] = wallMaterials;
    mat0.map = brickTextures.diffuse;
    mat0.normalMap = brickTextures.normal;
    mat0.roughnessMap = brickTextures.roughness;
    mat0.aoMap = brickTextures.ao;
    mat0.needsUpdate = true;

    mat1.map = floorTextures.diffuse;
    mat1.normalMap = floorTextures.normal;
    mat1.roughnessMap = floorTextures.roughness;
    mat1.aoMap = floorTextures.ao;
    mat1.needsUpdate = true;

    mat2.map = darkStoneTextures.diffuse;
    mat2.normalMap = darkStoneTextures.normal;
    mat2.roughnessMap = darkStoneTextures.roughness;
    mat2.aoMap = darkStoneTextures.ao;
    mat2.needsUpdate = true;
  }, [wallMaterials, brickTextures, floorTextures, darkStoneTextures]);

  useEffect(() => {
    return () => {
      wallMaterials.forEach((m) => m.dispose());
    };
  }, [wallMaterials]);

  return (
    <group name="FortWallsLayer">
      {/* Completed Fort Walls */}
      {walls.map((wall) => {
        return (
          <SingleWallMesh
            key={wall.id}
            wall={wall}
            stateBuffer={stateBuffer}
            terrainVersion={lastUpdated}
            materials={wallMaterials}
          />
        );
      })}

      {/* Placed Foundation Slabs (Ticket 09) */}
      {foundations.map((slab) => {
        return (
          <FoundationMesh
            key={`foundation_${slab.id}_${slab.length}_${slab.width}_${slab.height}_${slab.verticalOffset}_${slab.tilingRepeat}`}
            slab={slab}
            materials={wallMaterials}
          />
        );
      })}

      {/* Live Translucent Foundation Ghost Preview (Foundation Mode only) */}
      <FoundationDraftLayer />

      {/* Active Construction Draft Preview (Walls mode only) */}
      <WallDraftLayer />

      {/* Magnetic Snap Hologram Preview (Fortifications mode only) */}
      <FortificationsHologramLayer />
    </group>
  );
};

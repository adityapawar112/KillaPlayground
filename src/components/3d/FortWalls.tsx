'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import {
  generateWallBufferGeometry,
  generateCitadelKeepGeometry,
  SnapResult,
} from '@/lib/walls/wallGeometry';
import { WallPath, WallPoint, CitadelKeep, FortStampType } from '@/lib/walls/wallTypes';

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
 * Single Wall Mesh rendering the procedural fort ramparts, bastions, and arched gates.
 */
const SingleWallMesh: React.FC<{
  wall: WallPath;
  stateBuffer: Float32Array;
  material: THREE.Material;
  isSelected: boolean;
}> = ({ wall, stateBuffer, material, isSelected }) => {
  const geometry = useMemo(() => {
    return generateWallBufferGeometry(wall, stateBuffer);
  }, [wall, stateBuffer]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const handleWallClick = (e: any) => {
    const editor = useEditorStore.getState();
    if (editor.activeTool !== 'walls' || editor.activeWallDraft.length > 0) return;
    e.stopPropagation();
    editor.setSelectedWallId(wall.id);
    if (editor.wallStep === 'solidified') {
      editor.setWallStep('fortify');
      editor.setToastMessage('Wall selected in Fortify mode.');
    } else {
      editor.setToastMessage('Fort wall selected. Adjust properties or add bastions/gates.');
    }
  };

  const { wallStep, activeStamp, selectedComponent } = useEditorStore();
  const showHandles = isSelected && wallStep === 'fortify';

  return (
    <group name={`FortWall_${wall.id}`}>
      <mesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
        onClick={handleWallClick}
      />
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

          {/* Interactive Vertex Handles overlay */}
          {wall.points.map((pt, idx) => {
            const isManualBastion = wall.manualBastionIndices?.includes(idx);
            const isGrand = wall.grandBastionIndices?.includes(idx);
            return (
              <mesh
                key={`vert_${idx}`}
                position={[pt.x, pt.y + wall.settings.height + 0.05, pt.z]}
                onClick={(e) => {
                  e.stopPropagation();
                  const editor = useEditorStore.getState();
                  if (editor.activeStamp === 'buruj') {
                    editor.toggleBastionOnNode(wall.id, idx);
                    editor.setActiveStamp(null);
                    editor.setToastMessage('Round bastion toggled on node!');
                  } else if (editor.activeStamp === 'grand_buruj') {
                    editor.toggleGrandBastionOnNode(wall.id, idx);
                    editor.setActiveStamp(null);
                    editor.setToastMessage('Maha Buruj (Grand Bastion) placed on corner node!');
                  } else {
                    editor.setSelectedComponent({ type: 'bastion', idOrIndex: idx, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                  }
                }}
              >
                <sphereGeometry args={[isGrand ? 0.08 : isManualBastion ? 0.06 : 0.04, 16, 16]} />
                <meshStandardMaterial
                  color={isGrand ? '#d97706' : isManualBastion ? '#3b82f6' : '#f59e0b'}
                  emissive={isGrand ? '#b45309' : isManualBastion ? '#1d4ed8' : '#d97706'}
                  emissiveIntensity={0.8}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

/**
 * Single Citadel Keep Mesh component
 */
const SingleCitadelMesh: React.FC<{
  keep: CitadelKeep;
  stateBuffer: Float32Array;
  material: THREE.Material;
  isSelected: boolean;
}> = ({ keep, stateBuffer, material, isSelected }) => {
  const geometry = useMemo(() => {
    return generateCitadelKeepGeometry(keep, stateBuffer);
  }, [keep, stateBuffer]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const handleClick = (e: any) => {
    const editor = useEditorStore.getState();
    if (editor.activeTool !== 'walls') return;
    e.stopPropagation();
    editor.setSelectedComponent({ type: 'citadel', idOrIndex: keep.id });
    if (editor.wallStep === 'solidified') {
      editor.setWallStep('fortify');
    }
    editor.setToastMessage('Balekilla Citadel Keep selected.');
  };

  return (
    <group name={`CitadelKeep_${keep.id}`} onClick={handleClick}>
      <mesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
      {isSelected && (
        <mesh position={[keep.x, keep.y + 0.02, keep.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38 * keep.scale, 0.44 * keep.scale, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

/**
 * Real-time Magnetic Snap Hologram Preview
 */
const SnapHologramPreview: React.FC<{
  activeStamp: FortStampType;
  snap: SnapResult | null;
}> = ({ activeStamp, snap }) => {
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

      {/* Hologram 3D Silhouette */}
      {(activeStamp === 'buruj' || activeStamp === 'grand_buruj') && (
        <mesh position={[0, (activeStamp === 'grand_buruj' ? 0.35 : 0.25) * 0.5, 0]}>
          <cylinderGeometry
            args={[
              activeStamp === 'grand_buruj' ? 0.25 : 0.16,
              activeStamp === 'grand_buruj' ? 0.25 : 0.16,
              activeStamp === 'grand_buruj' ? 0.35 : 0.25,
              16,
            ]}
          />
          <meshBasicMaterial
            color={holoColor}
            wireframe
            transparent
            opacity={0.65}
          />
        </mesh>
      )}

      {activeStamp === 'gate' && (
        <group>
          {/* Left Flanking Tower */}
          <mesh position={[-0.20, 0.15, 0]}>
            <cylinderGeometry args={[0.10, 0.10, 0.30, 12]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
          {/* Right Flanking Tower */}
          <mesh position={[0.20, 0.15, 0]}>
            <cylinderGeometry args={[0.10, 0.10, 0.30, 12]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
          {/* Portal Arch Lintel */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.30, 0.08, 0.12]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {activeStamp === 'citadel' && (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.55, 0.50, 0.55]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
          <mesh position={[0, 0.58, 0]}>
            <coneGeometry args={[0.25, 0.18, 4]} />
            <meshBasicMaterial color={holoColor} wireframe transparent opacity={0.65} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * FortWalls Container Component
 * Renders all completed fort walls, preview draft line, and manages textures/materials.
 */
export const FortWalls: React.FC = () => {
  const {
    walls,
    activeWallDraft,
    selectedWallId,
    nightMode,
    citadelKeeps,
    activeStamp,
    wallSnapPreview,
    selectedComponent,
    setActiveStamp,
  } = useEditorStore();
  const { stateBuffer, lastUpdated } = useTerrainStore();
  const { invalidate, scene } = useThree();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__threeScene = scene;
    }
  }, [scene]);

  useEffect(() => {
    invalidate();
  }, [walls, activeWallDraft, selectedWallId, citadelKeeps, activeStamp, wallSnapPreview, invalidate]);

  // Cancel active stamp on Escape key
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Retroground PBR mossy stone brick textures
  const textures = useTexture({
    diffuse: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_basecolor.png',
    normal: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_normal.png',
    roughness: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_roughness.png',
    ao: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_ao.png',
  });

  // Configure NearestFilter for PS1 / modern retro pixel perfection
  useEffect(() => {
    if (!textures) return;
    const all = [textures.diffuse, textures.normal, textures.roughness, textures.ao];
    all.forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
    });
  }, [textures]);

  // Stone Wall Material
  const stoneMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: textures.diffuse,
      normalMap: textures.normal,
      roughnessMap: textures.roughness,
      aoMap: textures.ao,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    return mat;
  }, [textures]);

  useEffect(() => {
    return () => {
      stoneMaterial.dispose();
    };
  }, [stoneMaterial]);

  return (
    <group name="FortWallsLayer">
      {/* Completed Fort Walls */}
      {walls.map((wall) => (
        <SingleWallMesh
          key={`${wall.id}_${lastUpdated}_${wall.settings.uvScale}_${wall.settings.height}_${wall.settings.thickness}`}
          wall={wall}
          stateBuffer={stateBuffer}
          material={stoneMaterial}
          isSelected={selectedWallId === wall.id}
        />
      ))}

      {/* Freestanding Balekilla Citadel Keeps */}
      {citadelKeeps.map((keep) => (
        <SingleCitadelMesh
          key={`citadel_${keep.id}_${lastUpdated}_${keep.scale}`}
          keep={keep}
          stateBuffer={stateBuffer}
          material={stoneMaterial}
          isSelected={
            selectedComponent?.type === 'citadel' && selectedComponent.idOrIndex === keep.id
          }
        />
      ))}

      {/* Active Construction Draft Preview */}
      <WallDraftPreview
        draftPoints={activeWallDraft}
        nightMode={nightMode}
      />

      {/* Magnetic Snap Hologram Preview */}
      <SnapHologramPreview
        activeStamp={activeStamp}
        snap={wallSnapPreview}
      />
    </group>
  );
};


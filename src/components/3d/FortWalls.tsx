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
  detectBastionLocations,
  sampleBilinearHeight,
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
  materials: THREE.Material[];
  isSelected: boolean;
}> = ({ wall, stateBuffer, materials, isSelected }) => {
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

  // Compute bastions on this wall for interactive 3D handles
  const bastionIndices = useMemo(() => {
    return detectBastionLocations(
      wall.points,
      wall.isClosed,
      wall.settings.autoBastions,
      wall.manualBastionIndices,
      wall.excludedBastionIndices
    );
  }, [wall.points, wall.isClosed, wall.settings.autoBastions, wall.manualBastionIndices, wall.excludedBastionIndices]);

  const baseBastionRadius = Math.max(0.08, Math.min(0.60, wall.settings.bastionRadius || 0.25));

  return (
    <group name={`FortWall_${wall.id}`}>
      <mesh
        geometry={geometry}
        material={materials}
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

          {/* Interactive Bastion Top Discs & Badges */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    const editor = useEditorStore.getState();
                    editor.setSelectedComponent({ type: 'bastion', idOrIndex: bIdx, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                    editor.setToastMessage(`${isGrand ? 'Maha Buruj' : 'Buruj'} selected.`);
                  }}
                >
                  <cylinderGeometry args={[bastionRadius * 0.95, bastionRadius * 0.95, 0.02, 16]} />
                  <meshBasicMaterial
                    color={isBastionSelected ? '#10b981' : isGrand ? '#d97706' : '#3b82f6'}
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

                {/* Floating Tower Badge Pin */}
                <mesh
                  position={[0, 0.12, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    const editor = useEditorStore.getState();
                    editor.setSelectedComponent({ type: 'bastion', idOrIndex: bIdx, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                  }}
                >
                  <sphereGeometry args={[0.045, 12, 12]} />
                  <meshStandardMaterial
                    color={isBastionSelected ? '#10b981' : isGrand ? '#d97706' : '#2563eb'}
                    emissive={isBastionSelected ? '#059669' : isGrand ? '#b45309' : '#1d4ed8'}
                    emissiveIntensity={0.8}
                  />
                </mesh>
              </group>
            );
          })}

          {/* Interactive Gate Handles (Arch Volume & Badge) */}
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
            const gateW = Math.max(0.20, Math.min(0.80, g.width || wall.settings.thickness * 2.2));
            const gateH = wall.settings.height * 0.70;

            const dx = pB.x - pA.x;
            const dz = pB.z - pA.z;
            const rotY = Math.atan2(dx, dz);

            const isGateSelected =
              selectedComponent?.type === 'gate' &&
              selectedComponent.idOrIndex === g.id &&
              selectedComponent.wallId === wall.id;

            return (
              <group key={`gate_handle_${g.id}`} position={[gx, groundY + gateH * 0.5, gz]} rotation={[0, rotY, 0]}>
                {/* Generous Clickable Portal Arch Volume */}
                <mesh
                  onClick={(e) => {
                    e.stopPropagation();
                    const editor = useEditorStore.getState();
                    editor.setSelectedComponent({ type: 'gate', idOrIndex: g.id, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                    editor.setToastMessage('Maha Darwaza selected.');
                  }}
                >
                  <boxGeometry args={[gateW * 1.15, gateH * 1.1, wall.settings.thickness * 1.6]} />
                  <meshBasicMaterial
                    color={isGateSelected ? '#10b981' : '#e85d04'}
                    transparent
                    opacity={isGateSelected ? 0.6 : 0.25}
                  />
                </mesh>

                {/* Floating Gate Badge Pin */}
                <mesh
                  position={[0, gateH * 0.5 + 0.10, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    const editor = useEditorStore.getState();
                    editor.setSelectedComponent({ type: 'gate', idOrIndex: g.id, wallId: wall.id });
                    editor.setSelectedWallId(wall.id);
                  }}
                >
                  <boxGeometry args={[0.07, 0.07, 0.07]} />
                  <meshStandardMaterial
                    color={isGateSelected ? '#10b981' : '#e85d04'}
                    emissive={isGateSelected ? '#059669' : '#c2410c'}
                    emissiveIntensity={0.8}
                  />
                </mesh>
              </group>
            );
          })}

          {/* Interactive Vertex Handles overlay (for non-bastion vertices) */}
          {wall.points.map((pt, idx) => {
            const hasBastion = bastionIndices.includes(idx);
            if (hasBastion) return null; // Bastion top handles already rendered above

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
                    editor.toggleBastionOnNode(wall.id, idx);
                    editor.setToastMessage('Bastion added on vertex!');
                  }
                }}
              >
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#d97706"
                  emissiveIntensity={0.7}
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
  materials: THREE.Material[];
  isSelected: boolean;
}> = ({ keep, stateBuffer, materials, isSelected }) => {
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
        material={materials}
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

  // 1. Load Retroground PBR mossy stone brick textures (GROUP 0: Wall and tower sides)
  const brickTextures = useTexture({
    diffuse: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_basecolor.png',
    normal: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_normal.png',
    roughness: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_roughness.png',
    ao: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_ao.png',
  });

  // 2. Load Gravel PBR textures (GROUP 1: Rampart walkways and tower floor discs)
  const gravelTextures = useTexture({
    diffuse: '/textures/Gravel/Gravel_01/Gravel_01_basecolor.png',
    normal: '/textures/Gravel/Gravel_01/Gravel_01_normal.png',
    roughness: '/textures/Gravel/Gravel_01/Gravel_01_roughness.png',
    ao: '/textures/Gravel/Gravel_01/Gravel_01_ambientocclusion.png',
  });

  // 3. Load Dark Solid Stone PBR textures (GROUP 2: Pointed kangare battlements and soffits)
  const darkStoneTextures = useTexture({
    diffuse: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_basecolor.png',
    normal: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_normal.png',
    roughness: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_roughness.png',
    ao: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_ao.png',
  });

  // Configure NearestFilter for authentic retro pixel perfection across all textures
  useEffect(() => {
    const all = [
      brickTextures.diffuse, brickTextures.normal, brickTextures.roughness, brickTextures.ao,
      gravelTextures.diffuse, gravelTextures.normal, gravelTextures.roughness, gravelTextures.ao,
      darkStoneTextures.diffuse, darkStoneTextures.normal, darkStoneTextures.roughness, darkStoneTextures.ao,
    ];
    all.forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
      }
    });
  }, [brickTextures, gravelTextures, darkStoneTextures]);

  // Multi-material set: [Group 0: Stone Wall, Group 1: Gravel Walkway/Floor, Group 2: Dark Stone Kangare]
  const wallMaterials = useMemo(() => {
    const mat0 = new THREE.MeshStandardMaterial({
      map: brickTextures.diffuse,
      normalMap: brickTextures.normal,
      roughnessMap: brickTextures.roughness,
      aoMap: brickTextures.ao,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    const mat1 = new THREE.MeshStandardMaterial({
      map: gravelTextures.diffuse,
      normalMap: gravelTextures.normal,
      roughnessMap: gravelTextures.roughness,
      aoMap: gravelTextures.ao,
      roughness: 0.95,
      metalness: 0.02,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    const mat2 = new THREE.MeshStandardMaterial({
      map: darkStoneTextures.diffuse,
      normalMap: darkStoneTextures.normal,
      roughnessMap: darkStoneTextures.roughness,
      aoMap: darkStoneTextures.ao,
      roughness: 0.82,
      metalness: 0.06,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    return [mat0, mat1, mat2];
  }, [brickTextures, gravelTextures, darkStoneTextures]);

  useEffect(() => {
    return () => {
      wallMaterials.forEach((m) => m.dispose());
    };
  }, [wallMaterials]);

  return (
    <group name="FortWallsLayer">
      {/* Completed Fort Walls */}
      {walls.map((wall) => (
        <SingleWallMesh
          key={`${wall.id}_${lastUpdated}_${wall.settings.uvScale}_${wall.settings.height}_${wall.settings.thickness}_${wall.settings.flipCrenellations}`}
          wall={wall}
          stateBuffer={stateBuffer}
          materials={wallMaterials}
          isSelected={selectedWallId === wall.id}
        />
      ))}

      {/* Freestanding Balekilla Citadel Keeps */}
      {citadelKeeps.map((keep) => (
        <SingleCitadelMesh
          key={`citadel_${keep.id}_${lastUpdated}_${keep.scale}`}
          keep={keep}
          stateBuffer={stateBuffer}
          materials={wallMaterials}
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


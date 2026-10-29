'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { generateWallBufferGeometry } from '@/lib/walls/wallGeometry';
import { WallPath, WallPoint } from '@/lib/walls/wallTypes';

/**
 * Draft wall preview line and node markers during construction.
 */
const WallDraftPreview: React.FC<{
  draftPoints: WallPoint[];
  nightMode: boolean;
}> = ({ draftPoints, nightMode }) => {
  const lineObject = useMemo(() => {
    if (draftPoints.length < 2) return null;
    const pts = draftPoints.map((p) => new THREE.Vector3(p.x, p.y + 0.015, p.z));
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
            position={[p.x, p.y + 0.012, p.z]}
          >
            <cylinderGeometry
              args={[
                canClose ? 0.035 : 0.02,
                canClose ? 0.035 : 0.02,
                0.012,
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

  return (
    <group name={`FortWall_${wall.id}`}>
      <mesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
      {isSelected && (
        <mesh
          geometry={geometry}
          castShadow={false}
          receiveShadow={false}
        >
          <meshBasicMaterial
            color="#fbbf24"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * FortWalls Container Component
 * Renders all completed fort walls, preview draft line, and manages textures/materials.
 */
export const FortWalls: React.FC = () => {
  const { walls, activeWallDraft, selectedWallId, nightMode } = useEditorStore();
  const { stateBuffer, lastUpdated } = useTerrainStore();
  const { invalidate, scene } = useThree();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__threeScene = scene;
    }
  }, [scene]);

  useEffect(() => {
    invalidate();
  }, [walls, activeWallDraft, selectedWallId, invalidate]);

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

      {/* Active Construction Draft Preview */}
      <WallDraftPreview
        draftPoints={activeWallDraft}
        nightMode={nightMode}
      />
    </group>
  );
};


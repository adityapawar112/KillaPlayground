'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useEditorStore, PondWaterFeature } from '@/lib/state/useEditorStore';

interface WaterTextures {
  baseColor: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
  ao: THREE.Texture;
  metallic: THREE.Texture;
}

interface BaseWaterMeshProps {
  waterLevel: number;
  nightMode: boolean;
  textures: WaterTextures;
}

const BaseWaterMesh: React.FC<BaseWaterMeshProps> = ({ waterLevel, nightMode, textures }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={[0, waterLevel, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      name="DioramaBaseWaterPlane"
      receiveShadow
    >
      {/* 9.96m x 9.96m plane nestled just inside the courtyard brick retaining border */}
      <planeGeometry args={[9.96, 9.96, 32, 32]} />
      <meshStandardMaterial
        map={textures.baseColor}
        normalMap={textures.normal}
        roughnessMap={textures.roughness}
        aoMap={textures.ao}
        metalnessMap={textures.metallic}
        color={nightMode ? '#3A6073' : '#FFFFFF'}
        roughness={nightMode ? 0.2 : 0.35}
        metalness={0.08}
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
        depthWrite={true}
      />
    </mesh>
  );
};

interface LocalPondMeshProps {
  feature: PondWaterFeature;
  nightMode: boolean;
  textures: WaterTextures;
}

const LocalPondMesh: React.FC<LocalPondMeshProps> = ({ feature, nightMode, textures }) => {
  return (
    <mesh
      position={[feature.x, feature.y, feature.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      name={`PondWaterPlane_${feature.id}`}
      receiveShadow
    >
      <circleGeometry args={[feature.radius, 32]} />
      <meshStandardMaterial
        map={textures.baseColor}
        normalMap={textures.normal}
        roughnessMap={textures.roughness}
        aoMap={textures.ao}
        metalnessMap={textures.metallic}
        color={nightMode ? '#3A6073' : '#FFFFFF'}
        roughness={nightMode ? 0.2 : 0.35}
        metalness={0.08}
        transparent
        opacity={0.94}
        side={THREE.DoubleSide}
        depthWrite={true}
      />
    </mesh>
  );
};

export const WaterPlane: React.FC = () => {
  const waterLevel = useEditorStore((s) => s.waterLevel);
  const waterLevelActive = useEditorStore((s) => s.waterLevelActive);
  const nightMode = useEditorStore((s) => s.nightMode);
  const pondWaterFeatures = useEditorStore((s) => s.pondWaterFeatures);

  // Load authentic Diwali Killa blue plastic tarpaulin PBR textures for all water
  const rawTextures = useTexture({
    baseColor: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_basecolor.png',
    normal: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_normal.png',
    roughness: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_roughness.png',
    ao: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_ao.png',
    metallic: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_metallic.png',
  });

  // Setup Base Water textures (16x16 repeat over 10m plane)
  useEffect(() => {
    if (!rawTextures) return;
    const { baseColor, normal, roughness, ao, metallic } = rawTextures;
    [baseColor, normal, roughness, ao, metallic].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(16, 16);
      t.generateMipmaps = false;
    });
    baseColor.colorSpace = THREE.SRGBColorSpace;
    baseColor.minFilter = THREE.NearestFilter;
    baseColor.magFilter = THREE.NearestFilter;
    baseColor.needsUpdate = true;

    [normal, roughness, ao, metallic].forEach((t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.needsUpdate = true;
    });
  }, [rawTextures]);

  // Setup Pond Water textures (3x3 repeat over small pond disc)
  const pondTextures = useMemo(() => {
    if (!rawTextures) return null;
    const baseColor = rawTextures.baseColor.clone();
    const normal = rawTextures.normal.clone();
    const roughness = rawTextures.roughness.clone();
    const ao = rawTextures.ao.clone();
    const metallic = rawTextures.metallic.clone();

    [baseColor, normal, roughness, ao, metallic].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 3);
      t.generateMipmaps = false;
    });

    baseColor.colorSpace = THREE.SRGBColorSpace;
    baseColor.minFilter = THREE.NearestFilter;
    baseColor.magFilter = THREE.NearestFilter;
    baseColor.needsUpdate = true;

    [normal, roughness, ao, metallic].forEach((t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.needsUpdate = true;
    });

    return { baseColor, normal, roughness, ao, metallic };
  }, [rawTextures]);

  // Clean disposal of cloned textures on unmount
  useEffect(() => {
    return () => {
      if (pondTextures) {
        pondTextures.baseColor.dispose();
        pondTextures.normal.dispose();
        pondTextures.roughness.dispose();
        pondTextures.ao.dispose();
        pondTextures.metallic.dispose();
      }
    };
  }, [pondTextures]);

  const showBaseWater = waterLevelActive && waterLevel > 0.001;
  const hasPonds = pondWaterFeatures.length > 0;

  if (!showBaseWater && !hasPonds) return null;

  return (
    <group name="WaterSystem">
      {showBaseWater && (
        <BaseWaterMesh
          waterLevel={waterLevel}
          nightMode={nightMode}
          textures={rawTextures}
        />
      )}
      {hasPonds && pondTextures && pondWaterFeatures.map((pond) => (
        <LocalPondMesh
          key={pond.id}
          feature={pond}
          nightMode={nightMode}
          textures={pondTextures}
        />
      ))}
    </group>
  );
};

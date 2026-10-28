'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '@/lib/state/useEditorStore';

interface WaterMeshProps {
  waterLevel: number;
  nightMode: boolean;
}

const WaterMesh: React.FC<WaterMeshProps> = ({ waterLevel, nightMode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const waterColor = useMemo(() => {
    return nightMode ? '#072736' : '#146072';
  }, [nightMode]);

  return (
    <mesh
      ref={meshRef}
      position={[0, waterLevel, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      name="DioramaWaterPlane"
      receiveShadow
    >
      {/* 9.96m x 9.96m plane nestled just inside the courtyard brick retaining border */}
      <planeGeometry args={[9.96, 9.96, 32, 32]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color={waterColor}
        roughness={nightMode ? 0.04 : 0.08}
        metalness={0.06}
        transmission={0.68}
        thickness={0.8}
        ior={1.333}
        transparent
        opacity={nightMode ? 0.8 : 0.84}
        depthWrite={false}
      />
    </mesh>
  );
};

export const WaterPlane: React.FC = () => {
  const waterLevel = useEditorStore((s) => s.waterLevel);
  const waterLevelActive = useEditorStore((s) => s.waterLevelActive);
  const nightMode = useEditorStore((s) => s.nightMode);

  if (!waterLevelActive || waterLevel <= 0.001) return null;

  return <WaterMesh waterLevel={waterLevel} nightMode={nightMode} />;
};

'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEditorStore } from '@/lib/state/useEditorStore';

export const WaterPlane: React.FC = () => {
  const { waterLevel, waterLevelActive, nightMode } = useEditorStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Animate gentle water ripples
  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const t = clock.getElapsedTime();
    // Subtle opacity wave oscillation
    materialRef.current.opacity = (nightMode ? 0.78 : 0.82) + Math.sin(t * 1.5) * 0.03;
  });

  const waterColor = useMemo(() => {
    return nightMode ? '#072736' : '#146072';
  }, [nightMode]);

  if (!waterLevelActive || waterLevel <= 0.001) return null;

  return (
    <mesh
      ref={meshRef}
      position={[0, waterLevel, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      name="DioramaWaterPlane"
      receiveShadow
    >
      {/* 9.98m x 9.98m plane nestled just inside the courtyard brick retaining border */}
      <planeGeometry args={[9.96, 9.96, 64, 64]} />
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

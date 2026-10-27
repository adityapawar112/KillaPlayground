'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useEditorStore } from '@/lib/state/useEditorStore';

interface KillaCanvasProps {
  children?: React.ReactNode;
}

export const KillaCanvas: React.FC<KillaCanvasProps> = ({ children }) => {
  const { nightMode } = useEditorStore();

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true, // Needed for OffscreenCanvas poster generator
        }}
        className="w-full h-full block touch-none"
      >
        <PerspectiveCamera makeDefault position={[7, 7, 7]} fov={45} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2 - 0.05} // Do not allow orbiting beneath courtyard floor
          target={[0, 0.5, 0]}
        />

        {/* Ambient & Directional Lighting Rig */}
        <ambientLight intensity={nightMode ? 0.2 : 0.65} color={nightMode ? '#38bdf8' : '#fffbeb'} />
        <directionalLight
          position={nightMode ? [-8, 12, -6] : [10, 15, 8]}
          intensity={nightMode ? 0.35 : 1.4}
          color={nightMode ? '#93c5fd' : '#fef3c7'}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={35}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-bias={-0.0005}
        />

        {/* Courtyard warm ground bounce */}
        <hemisphereLight
          args={[
            nightMode ? '#1e293b' : '#fef08a',
            nightMode ? '#0f172a' : '#78350f',
            nightMode ? 0.25 : 0.45,
          ]}
        />

        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

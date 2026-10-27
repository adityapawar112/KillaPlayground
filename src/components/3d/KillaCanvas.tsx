'use client';

import React, { Suspense, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { ViewportGizmo } from './ViewportGizmo';

// Ground Axis Lines matching Blender (Red X-Axis & Green Y/Z-Depth Axis)
const BlenderAxisLines: React.FC<{ nightMode: boolean }> = ({ nightMode }) => {
  const lineMatX = new THREE.LineBasicMaterial({
    color: nightMode ? '#ef4444' : '#dc2626',
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7,
  });

  const lineMatZ = new THREE.LineBasicMaterial({
    color: nightMode ? '#22c55e' : '#16a34a',
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7,
  });

  const geoX = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-100, 0.001, 0),
    new THREE.Vector3(100, 0.001, 0),
  ]);

  const geoZ = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.001, -100),
    new THREE.Vector3(0, 0.001, 100),
  ]);

  return (
    <group>
      <primitive object={new THREE.Line(geoX, lineMatX)} />
      <primitive object={new THREE.Line(geoZ, lineMatZ)} />
    </group>
  );
};

// Keyboard Camera Navigation Handler
const CameraKeyboardController: React.FC<{
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}> = ({ controlsRef }) => {
  const { cameraResetTrigger } = useEditorStore();

  const resetCamera = useCallback(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    controls.target.set(0, 0.5, 0);
    controls.object.position.set(7, 7, 7);
    controls.update();
  }, [controlsRef]);

  // Respond to store reset trigger
  useEffect(() => {
    if (cameraResetTrigger > 0) {
      resetCamera();
    }
  }, [cameraResetTrigger, resetCamera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!controlsRef.current) return;
      const controls = controlsRef.current;
      const camera = controls.object as THREE.PerspectiveCamera;

      const ORBIT_STEP = 0.08;
      const PAN_STEP = 0.35;
      const ZOOM_STEP = 0.6;

      // Pan with Shift + Arrow keys
      if (e.shiftKey) {
        if (e.key === 'ArrowLeft') {
          controls.target.x -= PAN_STEP;
          camera.position.x -= PAN_STEP;
          controls.update();
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          controls.target.x += PAN_STEP;
          camera.position.x += PAN_STEP;
          controls.update();
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          controls.target.z -= PAN_STEP;
          camera.position.z -= PAN_STEP;
          controls.update();
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          controls.target.z += PAN_STEP;
          camera.position.z += PAN_STEP;
          controls.update();
          e.preventDefault();
        }
        return;
      }

      // Orbit with Arrow keys
      if (e.key === 'ArrowLeft') {
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -ORBIT_STEP);
        camera.position.addVectors(controls.target, offset);
        controls.update();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), ORBIT_STEP);
        camera.position.addVectors(controls.target, offset);
        controls.update();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.phi = Math.max(0.1, spherical.phi - ORBIT_STEP);
        offset.setFromSpherical(spherical);
        camera.position.addVectors(controls.target, offset);
        controls.update();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.phi = Math.min(Math.PI / 2 - 0.05, spherical.phi + ORBIT_STEP);
        offset.setFromSpherical(spherical);
        camera.position.addVectors(controls.target, offset);
        controls.update();
        e.preventDefault();
      }

      // Zoom with Q / E or + / -
      else if (e.key === '+' || e.key === '=' || e.key.toLowerCase() === 'e') {
        const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
        if (camera.position.distanceTo(controls.target) > 3) {
          camera.position.addScaledVector(dir, ZOOM_STEP);
          controls.update();
        }
        e.preventDefault();
      } else if (e.key === '-' || e.key === '_' || e.key.toLowerCase() === 'q') {
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
        if (camera.position.distanceTo(controls.target) < 25) {
          camera.position.addScaledVector(dir, ZOOM_STEP);
          controls.update();
        }
        e.preventDefault();
      }

      // Blender Numpad Presets: 7 (Top), 1 (Front), 3 (Side), Home/F (Center)
      else if (e.key === '7' || e.code === 'Numpad7') {
        camera.position.set(0, 14, 0.001);
        controls.target.set(0, 0, 0);
        controls.update();
      } else if (e.key === '1' || e.code === 'Numpad1') {
        camera.position.set(0, 3, 11);
        controls.target.set(0, 0.8, 0);
        controls.update();
      } else if (e.key === '3' || e.code === 'Numpad3') {
        camera.position.set(11, 3, 0);
        controls.target.set(0, 0.8, 0);
        controls.update();
      } else if (e.key === 'Home' || e.key.toLowerCase() === 'f') {
        resetCamera();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controlsRef, resetCamera]);

  return null;
};

interface KillaCanvasProps {
  children?: React.ReactNode;
}

export const KillaCanvas: React.FC<KillaCanvasProps> = ({ children }) => {
  const { nightMode } = useEditorStore();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Set preset camera view from gizmo
  const handleSetCameraView = useCallback((view: 'top' | 'front' | 'side' | 'reset') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = controls.object;

    if (view === 'top') {
      camera.position.set(0, 14, 0.001);
      controls.target.set(0, 0, 0);
    } else if (view === 'front') {
      camera.position.set(0, 3, 11);
      controls.target.set(0, 0.8, 0);
    } else if (view === 'side') {
      camera.position.set(11, 3, 0);
      controls.target.set(0, 0.8, 0);
    } else if (view === 'reset') {
      camera.position.set(7, 7, 7);
      controls.target.set(0, 0.5, 0);
    }
    controls.update();
  }, []);

  // Zoom delta handler from gizmo
  const handleZoom = useCallback((delta: number) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = controls.object;
    const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
    camera.position.addScaledVector(dir, -delta);
    controls.update();
  }, []);

  return (
    <div
      className="w-full h-full relative select-none"
      onContextMenu={(e) => e.preventDefault()} // CRITICAL: Prevent browser context menu so right-click orbits freely!
    >
      <Canvas
        shadows
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        className="w-full h-full block touch-none"
      >
        <PerspectiveCamera makeDefault position={[7, 7, 7]} fov={45} />

        {/* OrbitControls configured per exact prompt requirement:
            - RIGHT click to orbit
            - MIDDLE click to shift / pan
            - SCROLL wheel to zoom in / out
            - LEFT click for primary interaction (not intercepted by OrbitControls!)
        */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2.5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2 - 0.05} // Constrain polar angle above floor
          target={[0, 0.5, 0]}
          mouseButtons={{
            LEFT: undefined as unknown as THREE.MOUSE, // Left click is untouched for 3D drawing / sculpting / placing!
            MIDDLE: THREE.MOUSE.PAN,                   // Middle click to shift/pan
            RIGHT: THREE.MOUSE.ROTATE,                 // Right click to orbit
          }}
        />

        <CameraKeyboardController controlsRef={controlsRef} />

        {/* Lighting Rig */}
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
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0005}
        />
        <hemisphereLight
          args={[
            nightMode ? '#1e293b' : '#fef08a',
            nightMode ? '#0f172a' : '#78350f',
            nightMode ? 0.25 : 0.45,
          ]}
        />

        {/* Blender-Style Infinite Fading Grid */}
        <Grid
          position={[0, -0.001, 0]}
          infiniteGrid
          cellSize={0.5}
          cellThickness={0.6}
          cellColor={nightMode ? '#332c25' : '#e4d8c8'}
          sectionSize={2.5}
          sectionThickness={1.2}
          sectionColor={nightMode ? '#524438' : '#c8b8a4'}
          fadeDistance={40}
          fadeStrength={1.8}
        />

        {/* Blender Red X-Axis & Green Y/Z-Depth Axis */}
        <BlenderAxisLines nightMode={nightMode} />

        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>

      {/* Blender-Style Viewport Gizmo & Navigation Cluster */}
      <ViewportGizmo
        onSetCameraView={handleSetCameraView}
        onZoom={handleZoom}
      />
    </div>
  );
};

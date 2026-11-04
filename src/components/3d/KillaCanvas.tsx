'use client';

import React, { Suspense, useRef, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { getOrbitMouseButtons, CameraControlButtons } from '@/lib/interaction/cameraControls';
import { BaseTerrain } from './BaseTerrain';
import { CourtyardBricks } from './CourtyardBricks';
import { WaterPlane } from './WaterPlane';
import { FortWalls } from './FortWalls';
import { SplineStructures } from './SplineStructures';
import { FoliageRenderer } from './FoliageRenderer';
import { FigurineRenderer } from './FigurineRenderer';
import { LightingRenderer } from './LightingRenderer';
import { CelestialSkyRig } from './CelestialSkyRig';

// Ground Axis Lines matching Blender (Red X-Axis & Green Y/Z-Depth Axis)
const BlenderAxisLines: React.FC<{ nightMode: boolean }> = ({ nightMode }) => {
  const { lineX, lineZ, geoX, geoZ, matX, matZ } = useMemo(() => {
    const matX = new THREE.LineBasicMaterial({
      color: nightMode ? '#ef4444' : '#dc2626',
      linewidth: 1.5,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });

    const matZ = new THREE.LineBasicMaterial({
      color: nightMode ? '#22c55e' : '#16a34a',
      linewidth: 1.5,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });

    const geoX = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-100, -0.002, 0),
      new THREE.Vector3(100, -0.002, 0),
    ]);

    const geoZ = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.002, -100),
      new THREE.Vector3(0, -0.002, 100),
    ]);

    return {
      lineX: new THREE.Line(geoX, matX),
      lineZ: new THREE.Line(geoZ, matZ),
      geoX,
      geoZ,
      matX,
      matZ,
    };
  }, [nightMode]);

  useEffect(() => {
    return () => {
      geoX.dispose();
      geoZ.dispose();
      matX.dispose();
      matZ.dispose();
    };
  }, [geoX, geoZ, matX, matZ]);

  return (
    <group>
      <primitive object={lineX} />
      <primitive object={lineZ} />
    </group>
  );
};

// Keyboard Camera Navigation & Mouse Buttons Controller
const CameraKeyboardController: React.FC<{
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}> = ({ controlsRef }) => {
  const { cameraResetTrigger, activeTool, wallMode, splineMode } = useEditorStore();

  const resetCamera = useCallback(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    controls.target.set(0, 0.5, 0);
    controls.object.position.set(7, 7, 7);
    controls.update();
  }, [controlsRef]);

  useEffect(() => {
    if (typeof window !== 'undefined' && controlsRef.current) {
      (window as any).__orbitControls = controlsRef.current;
    }
  }, [controlsRef]);

  // Synchronize dynamic mouse buttons immediately whenever activeTool, wallMode, or splineMode changes
  useEffect(() => {
    if (!controlsRef.current) return;
    const buttons = getOrbitMouseButtons(activeTool, wallMode, splineMode);
    controlsRef.current.mouseButtons = buttons as any;
  }, [controlsRef, activeTool, wallMode, splineMode]);

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

      // Blender Numpad Presets: Numpad 7 (Top), Numpad 1 (Front), Numpad 3 (Side), Home/F (Center)
      // Note: Must check e.code === 'NumpadX' or Alt+X to avoid colliding with top-row tool keys (1 to 9)
      else if (e.code === 'Numpad7' || (e.altKey && e.key === '7')) {
        camera.position.set(0, 14, 0.001);
        controls.target.set(0, 0, 0);
        controls.update();
      } else if (e.code === 'Numpad1' || (e.altKey && e.key === '1')) {
        camera.position.set(0, 3, 11);
        controls.target.set(0, 0.8, 0);
        controls.update();
      } else if (e.code === 'Numpad3' || (e.altKey && e.key === '3')) {
        camera.position.set(11, 3, 0);
        controls.target.set(0, 0.8, 0);
        controls.update();
      } else if (e.key === 'Home' || e.key.toLowerCase() === 'f') {
        resetCamera();
        e.preventDefault();
      } else if (e.key === '[' || e.key === ']') {
        const editor = useEditorStore.getState();
        const step = e.key === ']' ? 0.1 : -0.1;
        if (editor.activeTool === 'prop' && editor.propSubTool === 'erase') {
          const newRadius = Math.max(0.2, Math.min(3.0, parseFloat((editor.propEraseRadius + step).toFixed(2))));
          editor.setPropEraseRadius(newRadius);
          e.preventDefault();
        } else if (editor.activeTool === 'lighting' && editor.lightingSubTool === 'erase') {
          const newRadius = Math.max(0.2, Math.min(3.0, parseFloat((editor.lightEraseRadius + step).toFixed(2))));
          editor.setLightEraseRadius(newRadius);
          e.preventDefault();
        } else if (editor.activeTool === 'foliage') {
          const newRadius = Math.max(0.2, Math.min(3.0, parseFloat((editor.foliageBrushRadius + step).toFixed(2))));
          editor.setFoliageBrushRadius(newRadius);
          e.preventDefault();
        } else if (editor.activeTool === 'texture' || editor.activeTool === 'paint') {
          const newRadius = Math.max(0.2, Math.min(3.0, parseFloat((editor.paintBrushRadius + step).toFixed(2))));
          editor.setPaintBrushRadius(newRadius);
          e.preventDefault();
        } else if (editor.activeTool === 'terrain') {
          const newRadius = Math.max(0.2, Math.min(2.5, parseFloat((editor.brushRadius + step).toFixed(2))));
          editor.setBrushRadius(newRadius);
          e.preventDefault();
        }
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
  const {
    nightMode,
    cameraViewPreset,
    setCameraViewPreset,
    activeTool,
    wallMode,
    splineMode,
    sunElevation,
    sunAzimuth,
  } = useEditorStore();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Sun / Moon directional vector computed from elevation & azimuth
  const sunPosition = useMemo((): [number, number, number] => {
    const phi = (sunElevation * Math.PI) / 180;
    const theta = (sunAzimuth * Math.PI) / 180;
    const r = 21.0;
    const x = r * Math.cos(phi) * Math.sin(theta);
    const y = Math.max(1.0, r * Math.sin(phi));
    const z = r * Math.cos(phi) * Math.cos(theta);
    return [x, y, z];
  }, [sunElevation, sunAzimuth]);

  const bouncePosition = useMemo((): [number, number, number] => {
    return [-sunPosition[0] * 0.7, 6, -sunPosition[2] * 0.7];
  }, [sunPosition]);

  // Dynamic mouse control scheme:
  // - In 'select' mode: Left Click orbits background; Right Click orbits; Middle Click pans.
  // - In ANY other tool mode: Left Click orbit completely removed (-1) to guarantee uninterrupted tool painting/drawing;
  //   Orbiting defaults strictly to Right Click.
  const orbitMouseButtons = useMemo(() => {
    return getOrbitMouseButtons(activeTool, wallMode, splineMode);
  }, [activeTool, wallMode, splineMode]);

  // Wheel shortcut handler: Shift+Scroll (Brush Size), Ctrl+Scroll (Speed/Secondary), Alt+Scroll (Height/Angle/Tertiary)
  // Crucial: { capture: true, passive: false } intercepts before OrbitControls and cancels default camera zoom!
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const delta = Math.sign(e.deltaY);
        const isUp = delta < 0; // scroll up = increase, scroll down = decrease
        const editor = useEditorStore.getState();
        const tool = editor.activeTool;

        if (e.shiftKey) {
          // PRIMARY SLIDER: Brush Size (0.2m to 3.0m in 0.1m increments) / Figurine Placement Scale
          const step = 0.1;
          if (tool === 'prop') {
            if (editor.propSubTool === 'erase') {
              const newRadius = Math.max(
                0.2,
                Math.min(3.0, parseFloat((editor.propEraseRadius + (isUp ? step : -step)).toFixed(2)))
              );
              editor.setPropEraseRadius(newRadius);
            } else {
              const newScale = Math.max(
                0.3,
                Math.min(2.5, parseFloat((editor.propPlacementScale + (isUp ? step : -step)).toFixed(1)))
              );
              editor.setPropPlacementScale(newScale);
            }
          } else if (tool === 'lighting') {
            if (editor.lightingSubTool === 'erase') {
              const newRadius = Math.max(
                0.2,
                Math.min(3.0, parseFloat((editor.lightEraseRadius + (isUp ? step : -step)).toFixed(2)))
              );
              editor.setLightEraseRadius(newRadius);
            } else {
              const newScale = Math.max(
                0.3,
                Math.min(2.5, parseFloat((editor.lightPlacementScale + (isUp ? step : -step)).toFixed(1)))
              );
              editor.setLightPlacementScale(newScale);
            }
          } else if (tool === 'foliage') {
            const newRadius = Math.max(
              0.2,
              Math.min(3.0, parseFloat((editor.foliageBrushRadius + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setFoliageBrushRadius(newRadius);
          } else if (tool === 'texture' || tool === 'paint') {
            const newRadius = Math.max(
              0.2,
              Math.min(3.0, parseFloat((editor.paintBrushRadius + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setPaintBrushRadius(newRadius);
          } else if (tool === 'view') {
            const step = 0.25;
            let newTime = editor.timeOfDay + (isUp ? step : -step);
            if (newTime < 0) newTime += 24;
            if (newTime >= 24) newTime -= 24;
            editor.setTimeOfDay(parseFloat(newTime.toFixed(2)));
          } else {
            const newRadius = Math.max(
              0.2,
              Math.min(3.0, parseFloat((editor.brushRadius + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setBrushRadius(newRadius);
          }
        } else if (e.ctrlKey) {
          // SECONDARY SLIDER: Strength / Opacity / Density / Rotation Heading
          if (tool === 'prop') {
            const step = 15;
            let newRot = editor.propPlacementRotation + (isUp ? step : -step);
            if (newRot < 0) newRot += 360;
            if (newRot >= 360) newRot -= 360;
            editor.setPropPlacementRotation(newRot);
          } else if (tool === 'lighting') {
            const step = 15;
            let newRot = editor.lightPlacementRotation + (isUp ? step : -step);
            if (newRot < 0) newRot += 360;
            if (newRot >= 360) newRot -= 360;
            editor.setLightPlacementRotation(newRot);
          } else if (tool === 'foliage') {
            const step = 1;
            const newDensity = Math.max(
              1,
              Math.min(20, editor.foliageBrushDensity + (isUp ? step : -step))
            );
            editor.setFoliageBrushDensity(newDensity);
          } else if (tool === 'texture' || tool === 'paint') {
            const step = 0.05;
            const newStrength = Math.max(
              0.05,
              Math.min(1.0, parseFloat((editor.paintBrushStrength + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setPaintBrushStrength(newStrength);
          } else if (tool === 'grass') {
            const step = 0.05;
            const newDensity = Math.max(
              0.1,
              Math.min(1.0, parseFloat((editor.grassDensity + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setGrassDensity(newDensity);
          } else if (tool === 'water') {
            const step = 0.02;
            const newLevel = Math.max(
              0.01,
              Math.min(0.45, parseFloat((editor.waterLevel + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setWaterLevel(newLevel);
          } else if (tool === 'view') {
            const step = 5;
            editor.setSunAzimuth(editor.sunAzimuth + (isUp ? step : -step));
          } else {
            // Speed / Strength slider (0.05 to 1.0 in 0.05 increments)
            const step = 0.05;
            const newStrength = Math.max(
              0.05,
              Math.min(1.0, parseFloat((editor.brushStrength + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setBrushStrength(newStrength);
          }
        } else if (e.altKey) {
          // TERTIARY SLIDER: Falloff / Height / Jitter / Elevation Offset
          if (tool === 'prop') {
            const step = 0.01;
            const newOffset = Math.max(
              -0.10,
              Math.min(0.30, parseFloat((editor.propElevationOffset + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setPropElevationOffset(newOffset);
          } else if (tool === 'lighting') {
            const step = 0.01;
            const newOffset = Math.max(
              -0.10,
              Math.min(0.30, parseFloat((editor.lightElevationOffset + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setLightElevationOffset(newOffset);
          } else if (tool === 'foliage') {
            const step = 0.05;
            const newJitter = Math.max(
              0.0,
              Math.min(0.5, parseFloat((editor.foliageScaleJitter + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setFoliageScaleJitter(newJitter);
          } else if (tool === 'texture' || tool === 'paint') {
            const step = 0.05;
            const newFalloff = Math.max(
              0.0,
              Math.min(1.0, parseFloat((editor.paintBrushFalloff + (isUp ? step : -step)).toFixed(2)))
            );
            editor.setPaintBrushFalloff(newFalloff);
          } else if (tool === 'view') {
            const step = 2;
            editor.setSunElevation(editor.sunElevation + (isUp ? step : -step));
          } else if (tool === 'terrain') {
            if (editor.terrainSubTool === 'plateau') {
              const step = 0.1;
              const newHeight = Math.max(
                0.1,
                Math.min(3.0, parseFloat((editor.plateauHeight + (isUp ? step : -step)).toFixed(2)))
              );
              editor.setPlateauHeight(newHeight);
            } else if (editor.terrainSubTool === 'slope') {
              const step = 5;
              const newAngle = Math.max(
                5,
                Math.min(75, editor.slopeAngle + (isUp ? step : -step))
              );
              editor.setSlopeAngle(newAngle);
            }
          }
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { capture: true, passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

  // Intercept pointerdown during spline and wall drawing to prevent camera orbit spin
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (e: PointerEvent) => {
      const editor = useEditorStore.getState();
      // If left-click without Alt while activeTool is spline or walls layout step:
      if (
        (editor.activeTool === 'spline' || (editor.activeTool === 'walls' && editor.wallStep === 'layout')) &&
        e.button === 0 &&
        !e.altKey
      ) {
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      }
    };

    const handlePointerUp = () => {
      if (controlsRef.current && !controlsRef.current.enabled) {
        controlsRef.current.enabled = true;
      }
    };

    container.addEventListener('pointerdown', handlePointerDown, { capture: true });
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      container.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Zoom delta handler
  const handleZoom = useCallback((delta: number) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = controls.object;
    const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
    camera.position.addScaledVector(dir, -delta);
    controls.update();
  }, []);

  // Set preset camera view from gizmo, sidebar, or menu bar
  const handleSetCameraView = useCallback((view: 'top' | 'front' | 'side' | 'reset' | 'zoom_in' | 'zoom_out') => {
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
    } else if (view === 'zoom_in') {
      handleZoom(-1.5);
    } else if (view === 'zoom_out') {
      handleZoom(1.5);
    }
    controls.update();
  }, [handleZoom]);

  // Listen for view changes from store (e.g. from LeftToolSidebar or AppMenuBar)
  useEffect(() => {
    if (cameraViewPreset) {
      handleSetCameraView(cameraViewPreset);
      setCameraViewPreset(null);
    }
  }, [cameraViewPreset, handleSetCameraView, setCameraViewPreset]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none"
      onContextMenu={(e) => e.preventDefault()} // CRITICAL: Prevent browser context menu so right-click orbits freely!
    >
      <Canvas
        shadows="percentage"
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

        {/* OrbitControls:
            - In 'select' mode: Left Click orbits background; Right Click orbits; Middle Click pans.
            - In any tool mode other than 'select' (Terrain, Wall Draw/Fortify, Spline Draw, Texture, Foliage, Prop):
              Left Click orbit is completely removed (-1) to dedicate left click strictly to tool interactions.
              Orbiting defaults to Right Click.
        */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={0.25}
          maxDistance={30}
          minPolarAngle={0.05} // Constrain camera from flipping over top
          maxPolarAngle={Math.PI / 2 - 0.05} // Constrain polar angle above floor
          target={[0, 0.5, 0]}
          mouseButtons={orbitMouseButtons as any}
        />

        <CameraKeyboardController controlsRef={controlsRef} />

        {/* Courtyard Lighting Rig with Calibrated NormalBias to Eliminate Shadow Acne */}
        <ambientLight intensity={nightMode ? 0.2 : 0.65} color={nightMode ? '#38bdf8' : '#fffbeb'} />
        <directionalLight
          position={sunPosition}
          intensity={nightMode ? 0.35 : 1.4}
          color={nightMode ? '#93c5fd' : '#fef3c7'}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1.0}
          shadow-camera-far={32}
          shadow-camera-left={-8.5}
          shadow-camera-right={8.5}
          shadow-camera-top={8.5}
          shadow-camera-bottom={-8.5}
          shadow-bias={-0.0001}
          shadow-normalBias={0.035}
        />
        {/* Secondary Warm Courtyard Ground Bounce Light */}
        <directionalLight
          position={bouncePosition}
          intensity={nightMode ? 0.15 : 0.4}
          color={nightMode ? '#1e3a8a' : '#fed7aa'}
        />
        <hemisphereLight
          args={[
            nightMode ? '#1e293b' : '#fef08a',
            nightMode ? '#0f172a' : '#78350f',
            nightMode ? 0.25 : 0.45,
          ]}
        />

        {/* 3D Celestial Sky Rig: Sun Disc / Corona & Moon Disc / Halo */}
        <CelestialSkyRig />

        {/* Blender-Style Infinite Fading Grid */}
        <Grid
          position={[0, -0.0025, 0]}
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

        {/* Retaining Courtyard Red Clay Brick Perimeter */}
        <CourtyardBricks nightMode={nightMode} />

        {/* Base Terrain with StateBuffer DataTexture & BVH Acceleration */}
        <BaseTerrain />

        {/* Parametric Fort Ramparts, Bastions & Arched Gates */}
        <FortWalls />

        {/* Spline Structures: Steps, Saffron Flags, Festive Diyas */}
        <SplineStructures />

        {/* 3D Foliage & Nature Scatter Layer (Enclosed in Suspense boundary to prevent viewport reloading) */}
        <Suspense fallback={null}>
          <FoliageRenderer />
        </Suspense>

        {/* 3D Historical Figurines & Architecture Layer */}
        <Suspense fallback={null}>
          <FigurineRenderer />
        </Suspense>

        {/* 3D Festive Lighting & Fireworks Layer (Ticket 10) */}
        <Suspense fallback={null}>
          <LightingRenderer />
        </Suspense>

        {/* 3D Base Water Level Plane for Coastal Moats & Excavated Ponds */}
        <WaterPlane />

        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

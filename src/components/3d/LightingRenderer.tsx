'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditorStore, PlacedLight } from '@/lib/state/useEditorStore';
import { getLightById, LIGHTING_MANIFEST } from '@/lib/lighting/lightingManifest';
import { figurineAssetManager, CachedFigurineAsset } from '@/lib/figurines/figurineAssetManager';
import {
  createAnaarConeGeometry,
  createAnaarBaseGeometry,
  createAnaarWickGeometry,
  createSkyShotTubeGeometry,
  createSkyShotBaseGeometry,
  createSkyShotCollarGeometry,
  createDiyaFlameGeometry,
  createDiyaFlameCoreGeometry,
  getFireworkCanvasTexture,
  disposeFireworkTextures,
} from '@/lib/lighting/lightingGeometry';
import { PyrotechnicsEngine, MAX_FIREWORK_PARTICLES } from '@/lib/lighting/pyrotechnicsEngine';
import { getDiyaLightStatus } from '@/lib/lighting/atmosphericLighting';
import {
  computeSpatialClusters,
  DIYA_POINT_LIGHT_BASE_INTENSITY,
  DIYA_POINT_LIGHT_DECAY,
  DIYA_POINT_LIGHT_COLOR,
} from '@/lib/lighting/spatialClustering';

// Maximum fixed 3D point lights compiled into WebGL shader (0ms recompile, 0 lag)
const MAX_3D_POINT_LIGHTS = 16;

// Cached circular spark texture for soft radiant firework embers (eliminates blocky square points)
let cachedSparkTexture: THREE.CanvasTexture | null = null;
function getFireworkSparkTexture(): THREE.CanvasTexture {
  if (cachedSparkTexture) return cachedSparkTexture;
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.25, 'rgba(255, 235, 180, 0.95)');
  grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.4)');
  grad.addColorStop(1.0, 'rgba(217, 119, 6, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  cachedSparkTexture = new THREE.CanvasTexture(canvas);
  return cachedSparkTexture;
}

// Cached camera-facing volumetric halo texture for diya flames
let cachedHaloTexture: THREE.CanvasTexture | null = null;
function getDiyaHaloTexture(): THREE.CanvasTexture {
  if (cachedHaloTexture) return cachedHaloTexture;
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0.0, 'rgba(255, 255, 230, 0.95)');
  grad.addColorStop(0.2, 'rgba(255, 180, 20, 0.80)');
  grad.addColorStop(0.55, 'rgba(235, 95, 0, 0.28)');
  grad.addColorStop(1.0, 'rgba(200, 40, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  cachedHaloTexture = new THREE.CanvasTexture(canvas);
  cachedHaloTexture.generateMipmaps = false;
  cachedHaloTexture.minFilter = THREE.LinearFilter;
  return cachedHaloTexture;
}

// ============================================================================
// 1. Procedural Diya Flame Component with Organic Flicker & White-Hot Core
// ============================================================================
const DiyaFlame: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  const nightMode = useEditorStore((s) => s.nightMode);
  const timeOfDay = useEditorStore((s) => s.timeOfDay);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const flameMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const spriteMatRef = useRef<THREE.SpriteMaterial>(null);
  const flameTimeRef = useRef<number>(Math.random() * 10);
  const flameGeo = useMemo(() => createDiyaFlameGeometry(), []);
  const coreGeo = useMemo(() => createDiyaFlameCoreGeometry(), []);
  const haloTex = useMemo(() => getDiyaHaloTexture(), []);

  const diyaStatus = useMemo(() => {
    return getDiyaLightStatus(timeOfDay, nightMode);
  }, [timeOfDay, nightMode]);

  useEffect(() => {
    return () => {
      flameGeo.dispose();
      coreGeo.dispose();
    };
  }, [flameGeo, coreGeo]);

  useFrame((_, delta) => {
    if (isPlaying) {
      flameTimeRef.current += delta;
    }
    const t = flameTimeRef.current;
    const isLit = diyaStatus.isLit;
    const factor = diyaStatus.intensityFactor;

    if (flameMatRef.current) {
      if (!isLit) {
        flameMatRef.current.emissiveIntensity = 0.05;
      } else {
        const flicker = 1.9 + 0.45 * Math.sin(t * 14.0) * Math.cos(t * 22.0);
        flameMatRef.current.emissiveIntensity = flicker * factor;
      }
    }
    if (spriteMatRef.current) {
      if (!isLit) {
        spriteMatRef.current.opacity = 0;
      } else {
        const flicker = 0.85 + 0.15 * Math.sin(t * 13.0);
        spriteMatRef.current.opacity = 0.80 * flicker * factor;
      }
    }
    if (flameMeshRef.current && isLit) {
      // Organic dancing flame sway in evening breeze
      const swayX = Math.sin(t * 5.2) * 0.05 + Math.sin(t * 11.5) * 0.025;
      const swayZ = Math.cos(t * 4.0) * 0.04;
      flameMeshRef.current.rotation.set(0.08 + swayX, 0, swayZ);
    }
  });

  return (
    <group position={position} raycast={() => null}>
      {/* Outer warm amber/golden flame teardrop */}
      <mesh ref={flameMeshRef} geometry={flameGeo}>
        <meshStandardMaterial
          ref={flameMatRef}
          color="#FFAA00"
          emissive="#FF7700"
          emissiveIntensity={2.2}
          roughness={0.2}
          metalness={0.0}
        />
        {/* Inner white-hot flame core */}
        <mesh geometry={coreGeo} position={[0, 0.002, 0]}>
          <meshBasicMaterial color="#FFFBEB" transparent opacity={0.95} />
        </mesh>
      </mesh>

      {/* Volumetric Radial Glow Halo Sprite (Camera-Facing Additive Bloom) */}
      <sprite position={[0, 0.012, 0]} scale={[0.16, 0.16, 0.16]}>
        <spriteMaterial
          ref={spriteMatRef}
          map={haloTex}
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
};

// ============================================================================
// 2. Procedural Anaar (Cone Fountain) Mesh
// ============================================================================
const AnaarModel: React.FC<{
  light: PlacedLight;
  onClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: (e: any) => void;
}> = ({ light, onClick, onPointerOver, onPointerOut }) => {
  const { coneGeo, baseGeo, wickGeo } = useMemo(() => {
    return {
      coneGeo: createAnaarConeGeometry(),
      baseGeo: createAnaarBaseGeometry(),
      wickGeo: createAnaarWickGeometry(),
    };
  }, []);

  const texture = useMemo(() => {
    return getFireworkCanvasTexture(light.colorTheme || 'saffron', 'anaar');
  }, [light.colorTheme]);

  useEffect(() => {
    return () => {
      coneGeo.dispose();
      baseGeo.dispose();
      wickGeo.dispose();
    };
  }, [coneGeo, baseGeo, wickGeo]);

  return (
    <group
      position={light.position}
      rotation={light.rotation}
      scale={light.scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      name={`PlacedLight_${light.id}`}
    >
      {/* Base Footing */}
      <mesh geometry={baseGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#8F4938" roughness={0.8} />
      </mesh>
      {/* Decorative Wrapped Conical Body */}
      <mesh geometry={coneGeo} castShadow receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Ignition Fuse Wick */}
      <mesh geometry={wickGeo}>
        <meshStandardMaterial color="#2B1E16" roughness={0.9} />
      </mesh>
    </group>
  );
};

// ============================================================================
// 3. Procedural Sky Shot (Aerial Shell Launcher) Mesh
// ============================================================================
const SkyShotModel: React.FC<{
  light: PlacedLight;
  onClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: (e: any) => void;
}> = ({ light, onClick, onPointerOver, onPointerOut }) => {
  const { tubeGeo, baseGeo, collarGeo } = useMemo(() => {
    return {
      tubeGeo: createSkyShotTubeGeometry(),
      baseGeo: createSkyShotBaseGeometry(),
      collarGeo: createSkyShotCollarGeometry(),
    };
  }, []);

  const texture = useMemo(() => {
    return getFireworkCanvasTexture(light.colorTheme || 'peony', 'skyshot');
  }, [light.colorTheme]);

  useEffect(() => {
    return () => {
      tubeGeo.dispose();
      baseGeo.dispose();
      collarGeo.dispose();
    };
  }, [tubeGeo, baseGeo, collarGeo]);

  return (
    <group
      position={light.position}
      rotation={light.rotation}
      scale={light.scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      name={`PlacedLight_${light.id}`}
    >
      {/* Wooden Base Stabilizer */}
      <mesh geometry={baseGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#5C4638" roughness={0.85} />
      </mesh>
      {/* Decorative Cylindrical Launcher Tube */}
      <mesh geometry={tubeGeo} castShadow receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.45} metalness={0.2} />
      </mesh>
      {/* Reinforced Metal Collar Ring */}
      <mesh geometry={collarGeo}>
        <meshStandardMaterial color="#D97706" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ============================================================================
// 4. Solid Diya Model (Loaded GLB with Flame)
// ============================================================================
const DiyaModel: React.FC<{
  light: PlacedLight;
  onClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: (e: any) => void;
}> = ({ light, onClick, onPointerOver, onPointerOut }) => {
  const meta = useMemo(() => getLightById(light.type) || LIGHTING_MANIFEST[0], [light.type]);
  const [asset, setAsset] = useState<CachedFigurineAsset | null>(() => {
    return meta.modelPath ? figurineAssetManager.getCached(meta.modelPath) || null : null;
  });

  useEffect(() => {
    if (!meta.modelPath) return;
    let active = true;
    figurineAssetManager.loadAsset(meta.modelPath).then((cached) => {
      if (active) setAsset(cached);
    }).catch((err) => {
      console.warn(`Failed to load diya GLB: ${meta.modelPath}`, err);
    });
    return () => {
      active = false;
    };
  }, [meta.modelPath]);

  if (!asset) return null;

  return (
    <group
      position={light.position}
      rotation={light.rotation}
      scale={light.scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      name={`PlacedLight_${light.id}`}
    >
      <mesh geometry={asset.geometry} material={asset.material} castShadow receiveShadow />
      {/* Animated 3D Flame seated authentically in diya wick spout */}
      <DiyaFlame position={[0, asset.dimensions.y * 0.85, asset.dimensions.z * 0.28]} />
    </group>
  );
};

// ============================================================================
// 5. Accurate Placement Hologram Ghost Preview
// ============================================================================
const LightingGhostPreview: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: string;
}> = ({ position, rotation, scale, type }) => {
  const meta = useMemo(() => getLightById(type) || LIGHTING_MANIFEST[0], [type]);
  const [diyaAsset, setDiyaAsset] = useState<CachedFigurineAsset | null>(() => {
    return meta.modelPath ? figurineAssetManager.getCached(meta.modelPath) || null : null;
  });

  useEffect(() => {
    if (!meta.modelPath) return;
    let active = true;
    figurineAssetManager
      .loadAsset(meta.modelPath)
      .then((cached) => {
        if (active) setDiyaAsset(cached);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [meta.modelPath]);

  const { anaarCone, anaarBase, skyTube, skyBase, flameGeo } = useMemo(() => {
    return {
      anaarCone: createAnaarConeGeometry(),
      anaarBase: createAnaarBaseGeometry(),
      skyTube: createSkyShotTubeGeometry(),
      skyBase: createSkyShotBaseGeometry(),
      flameGeo: createDiyaFlameGeometry(),
    };
  }, []);

  useEffect(() => {
    return () => {
      anaarCone.dispose();
      anaarBase.dispose();
      skyTube.dispose();
      skyBase.dispose();
      flameGeo.dispose();
    };
  }, [anaarCone, anaarBase, skyTube, skyBase, flameGeo]);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Ground alignment ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.06, 0.09, 32]} />
        <meshBasicMaterial color="#E85D04" side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>

      {meta.category === 'fireworks' ? (
        meta.fireworkType === 'skyshot' ? (
          <group>
            <mesh geometry={skyBase}>
              <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.65} />
            </mesh>
            <mesh geometry={skyTube}>
              <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.75} />
            </mesh>
          </group>
        ) : (
          <group>
            <mesh geometry={anaarBase}>
              <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.65} />
            </mesh>
            <mesh geometry={anaarCone}>
              <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.75} />
            </mesh>
          </group>
        )
      ) : diyaAsset ? (
        <group>
          <mesh geometry={diyaAsset.geometry}>
            <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.65} />
          </mesh>
          <mesh
            geometry={flameGeo}
            position={[0, diyaAsset.dimensions.y * 0.85, diyaAsset.dimensions.z * 0.28]}
          >
            <meshBasicMaterial color="#FFAA00" wireframe transparent opacity={0.85} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};



// ============================================================================
// 6. Main Lighting & Fireworks Studio Renderer
// ============================================================================
export const LightingRenderer: React.FC = () => {
  const activeTool = useEditorStore((s) => s.activeTool);
  const lightingSubTool = useEditorStore((s) => s.lightingSubTool);
  const placedLights = useEditorStore((s) => s.placedLights);
  const selectedLightType = useEditorStore((s) => s.selectedLightType);
  const selectedLightId = useEditorStore((s) => s.selectedLightId);
  const setSelectedLightId = useEditorStore((s) => s.setSelectedLightId);
  const lightPlacementScale = useEditorStore((s) => s.lightPlacementScale);
  const lightPlacementRotation = useEditorStore((s) => s.lightPlacementRotation);
  const lightRandomRotation = useEditorStore((s) => s.lightRandomRotation);
  const lightBurstHeight = useEditorStore((s) => s.lightBurstHeight);
  const lightRandomBurstHeight = useEditorStore((s) => s.lightRandomBurstHeight);
  const lightNormalAlign = useEditorStore((s) => s.lightNormalAlign);
  const lightElevationOffset = useEditorStore((s) => s.lightElevationOffset);
  const lightEraseRadius = useEditorStore((s) => s.lightEraseRadius);
  const addLight = useEditorStore((s) => s.addLight);
  const updateLightTransform = useEditorStore((s) => s.updateLightTransform);
  const removeLight = useEditorStore((s) => s.removeLight);
  const removeLights = useEditorStore((s) => s.removeLights);
  const hoveredElement = useEditorStore((s) => s.hoveredElement);
  const setHoveredElement = useEditorStore((s) => s.setHoveredElement);
  const nightMode = useEditorStore((s) => s.nightMode);
  const timeOfDay = useEditorStore((s) => s.timeOfDay);
  const testFireworkTrigger = useEditorStore((s) => s.testFireworkTrigger);
  const clearTestFireworkTrigger = useEditorStore((s) => s.clearTestFireworkTrigger);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const salvoTrigger = useEditorStore((s) => s.salvoTrigger);
  const fireworkSalvoEndTime = useEditorStore((s) => s.fireworkSalvoEndTime);
  const isJoystickActive = useEditorStore((s) => s.isJoystickActive);

  const { scene, camera, raycaster, gl, invalidate } = useThree();
  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);
  const [ghostRot, setGhostRot] = useState<[number, number, number]>([0, 0, 0]);
  const lightFlickerTimeRef = useRef<number>(0);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const pointerDownTimeRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  // Statically Pre-Allocated 3D Omnidirectional Point Lights (Strictly 16 lights, 0ms shader recompile)
  const pointLightRefs = useRef<Array<THREE.PointLight | null>>([]);

  // Pyrotechnics particle engine instance
  const pyrotechnics = useMemo(() => new PyrotechnicsEngine(), []);
  const pointsRef = useRef<THREE.Points>(null);

  // Pre-allocated Particle BufferGeometry
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pyrotechnics.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(pyrotechnics.colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(pyrotechnics.sizes, 1));
    return geo;
  }, [pyrotechnics]);

  const particleMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.055,
      map: getFireworkSparkTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      particleGeo.dispose();
      particleMat.dispose();
      disposeFireworkTextures();
      if (cachedSparkTexture) {
        cachedSparkTexture.dispose();
        cachedSparkTexture = null;
      }
      pyrotechnics.reset();
    };
  }, [particleGeo, particleMat, pyrotechnics]);

  const lastTriggerTimestampRef = useRef<number>(0);
  const lastSalvoTimestampRef = useRef<number>(0);

  // Respond to on-demand "Test Firework" action from store
  useEffect(() => {
    if (!testFireworkTrigger || testFireworkTrigger.timestamp <= lastTriggerTimestampRef.current) return;
    lastTriggerTimestampRef.current = testFireworkTrigger.timestamp;

    const currentLights = useEditorStore.getState().placedLights;
    const target = currentLights.find((l) => l.id === testFireworkTrigger.id);
    if (!target) return;
    const meta = getLightById(target.type);
    if (!meta || meta.category !== 'fireworks') return;

    pyrotechnics.triggerFirework(
      target.id,
      meta,
      target.position,
      target.scale[0],
      target.burstHeight
    );
    clearTestFireworkTrigger();
    invalidate();
  }, [testFireworkTrigger, pyrotechnics, invalidate, clearTestFireworkTrigger]);

  // Respond to Celebratory Salvo trigger (e.g. transitioning to Night mode)
  useEffect(() => {
    if (!salvoTrigger || salvoTrigger <= lastSalvoTimestampRef.current) return;
    lastSalvoTimestampRef.current = salvoTrigger;

    const currentLights = useEditorStore.getState().placedLights;
    const fireworks = currentLights.filter((l) => l.category === 'fireworks');
    if (fireworks.length === 0) return;

    fireworks.forEach((fw, idx) => {
      const meta = getLightById(fw.type);
      if (!meta) return;
      setTimeout(() => {
        pyrotechnics.triggerFirework(
          fw.id,
          meta,
          fw.position,
          fw.scale[0],
          fw.burstHeight
        );
        invalidate();
      }, idx * 140);
    });
  }, [salvoTrigger, pyrotechnics, invalidate]);

  const selectedLight = useMemo(() => {
    return placedLights.find((l) => l.id === selectedLightId) || null;
  }, [placedLights, selectedLightId]);

  const hoveredLightId = hoveredElement?.type === 'light' ? hoveredElement.id : null;
  const hoveredLight = useMemo(() => {
    return placedLights.find((l) => l.id === hoveredLightId) || null;
  }, [placedLights, hoveredLightId]);

  // 1. Memoized Diya List
  const diyas = useMemo(() => {
    return placedLights.filter((l) => l.category !== 'fireworks');
  }, [placedLights]);

  // 2. Deterministic Spatial Clusters (Memoized: Invariant to selection or hover, 0ms useFrame overhead)
  const clusters = useMemo(() => {
    return computeSpatialClusters(diyas, MAX_3D_POINT_LIGHTS);
  }, [diyas]);

  // Continuous nighttime loop & 5-second salvo scheduler
  const fireworkSchedulesRef = useRef<Map<string, { nextFireTime: number; isFiring: boolean; finishTime: number }>>(
    new Map()
  );
  const simTimeRef = useRef<number>(0);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 5-second pause countdown: After 5 seconds in paused state, clear frozen particles so they don't block building.
  // Crucially, this 5-second timer ONLY applies to the paused state (!isPlaying) and never to the play button.
  useEffect(() => {
    if (!isPlaying) {
      pauseTimerRef.current = setTimeout(() => {
        pyrotechnics.reset();
        if (pointsRef.current) {
          pointsRef.current.visible = false;
        }
        invalidate();
      }, 5000);
    } else {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
    }
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, [isPlaying, pyrotechnics, invalidate]);

  // Frame animation loop: Pyrotechnics particles & Zero-Recompile Key Lights Rig
  useFrame((_, delta) => {
    // 1. Pyrotechnics Particles Simulation (freezes physics when isPlaying is false and salvo not active)
    const isNightDark = nightMode || timeOfDay >= 17.5 || timeOfDay <= 6.0;
    const isSalvoActive = Date.now() < fireworkSalvoEndTime;
    const shouldSimulate = isPlaying || isSalvoActive;

    // Continuous nighttime firework looping & 5-second celebratory salvo
    if ((isPlaying && isNightDark) || isSalvoActive) {
      simTimeRef.current += delta;
      const simTime = simTimeRef.current;
      const fireworks = placedLights.filter((l) => l.category === 'fireworks');

      for (const fw of fireworks) {
        let sched = fireworkSchedulesRef.current.get(fw.id);
        if (!sched) {
          // Staggered initial delay so all fireworks never launch at the exact same moment
          const initialDelay = isSalvoActive ? Math.random() * 1.2 : 0.4 + Math.random() * 3.6;
          sched = { nextFireTime: simTime + initialDelay, isFiring: false, finishTime: 0 };
          fireworkSchedulesRef.current.set(fw.id, sched);
        }

        const meta = getLightById(fw.type);
        if (!meta) continue;
        const duration = meta.fireworkType === 'anaar' ? 3.8 : 2.8;

        if (!sched.isFiring && simTime >= sched.nextFireTime) {
          pyrotechnics.triggerFirework(
            fw.id,
            meta,
            fw.position,
            fw.scale[0],
            fw.burstHeight
          );
          sched.isFiring = true;
          sched.finishTime = simTime + duration;
          invalidate();
        } else if (sched.isFiring && simTime >= sched.finishTime) {
          sched.isFiring = false;
          // Organic pause whenever a firework finishes (0.4-1.2s in salvo, 1.4-3.5s in normal night play)
          const pause = isSalvoActive ? 0.4 + Math.random() * 0.8 : 1.4 + Math.random() * 2.8;
          sched.nextFireTime = simTime + pause;
        }
      }
    } else {
      if (fireworkSchedulesRef.current.size > 0) {
        fireworkSchedulesRef.current.clear();
      }
    }

    const hasActive = shouldSimulate ? pyrotechnics.update(delta) : pyrotechnics.activeCount > 0;
    if (hasActive) {
      if (pointsRef.current) {
        pointsRef.current.visible = true;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleGeo.attributes.color.needsUpdate = true;
      particleGeo.attributes.size.needsUpdate = true;
      invalidate();
    } else {
      if (pointsRef.current && pointsRef.current.visible) {
        pointsRef.current.visible = false;
        invalidate();
      }
    }

    // 2. Dynamic 3D Omnidirectional Point Lights (Strictly 16 lights, 0ms shader recompile)
    // Assigned via world-space spatial clustering so selection/hover NEVER causes popping or shifting
    const diyaStatus = getDiyaLightStatus(timeOfDay, nightMode);

    if (!diyaStatus.isLit || clusters.length === 0) {
      for (let i = 0; i < MAX_3D_POINT_LIGHTS; i++) {
        const light = pointLightRefs.current[i];
        if (light) light.intensity = 0;
      }
    } else {
      if (isPlaying) {
        lightFlickerTimeRef.current += delta;
      }
      const t = lightFlickerTimeRef.current;
      const flicker = 0.95 + 0.05 * Math.sin(t * 13.0) * Math.cos(t * 19.0);

      for (let i = 0; i < MAX_3D_POINT_LIGHTS; i++) {
        const lightRef = pointLightRefs.current[i];
        if (!lightRef) continue;

        if (i < clusters.length) {
          const c = clusters[i];
          lightRef.position.set(c.x, c.y, c.z);
          lightRef.distance = c.radius;
          const densityMultiplier = Math.min(1.4, 0.85 + 0.15 * Math.sqrt(c.count));
          lightRef.intensity =
            DIYA_POINT_LIGHT_BASE_INTENSITY * densityMultiplier * diyaStatus.intensityFactor * flicker;
        } else {
          lightRef.intensity = 0;
        }
      }
    }
  });

  // Raycast against mountain terrain and fort structures
  // OPTIMIZATION: Query pre-identified pickable root objects directly instead of traversing the whole scene graph every pointer move!
  const getSurfaceIntersection = useCallback(
    (clientX: number, clientY: number): { point: THREE.Vector3; normal: THREE.Vector3 } | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const targets: THREE.Object3D[] = [];
      const terrain = scene.getObjectByName('BaseTerrainMesh') || scene.getObjectByName('TerrainMeshFallback');
      if (terrain) targets.push(terrain);
      const fortLayer = scene.getObjectByName('FortWallsLayer');
      if (fortLayer) targets.push(fortLayer);
      const splineLayer = scene.getObjectByName('SplineStructuresContainer') || scene.getObjectByName('SplineStructures');
      if (splineLayer) targets.push(splineLayer);
      const bricks = scene.getObjectByName('CourtyardRetainingBricks') || scene.getObjectByName('CourtyardBricks');
      if (bricks) targets.push(bricks);

      if (targets.length > 0) {
        const intersects = raycaster.intersectObjects(targets, true);
        if (intersects.length > 0) {
          for (const hit of intersects) {
            const name = hit.object.name || '';
            const parentName = hit.object.parent?.name || '';
            if (
              name.includes('PlacedLight') ||
              parentName.includes('PlacedLight') ||
              name.includes('SelectionRing') ||
              name.includes('Ghost') ||
              name.includes('Cursor') ||
              name === 'WaterPlane'
            ) {
              continue;
            }
            const normal = hit.face
              ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
              : new THREE.Vector3(0, 1, 0);
            return { point: hit.point, normal };
          }
        }
      }

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pt = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, pt)) {
        return { point: pt, normal: new THREE.Vector3(0, 1, 0) };
      }

      return null;
    },
    [gl, raycaster, camera, scene]
  );

  // Pointer interaction for placement and ghost preview
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    const computeRotation = (baseYaw: number, normal: THREE.Vector3): [number, number, number] => {
      const safeNormal = normal.clone();
      if (safeNormal.y < 0.2) safeNormal.set(0, 1, 0);
      if (lightNormalAlign <= 0) return [0, baseYaw, 0];

      const up = new THREE.Vector3(0, 1, 0);
      const blendedUp = up.clone().lerp(safeNormal, lightNormalAlign).normalize();
      const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, blendedUp);
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseYaw);
      const quat = new THREE.Quaternion().multiplyQuaternions(alignQuat, yawQuat);
      const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');
      return [euler.x, euler.y, euler.z];
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (activeTool !== 'lighting') {
        if (ghostPos !== null) {
          setGhostPos(null);
          invalidate();
        }
        return;
      }

      if (lightingSubTool === 'place') {
        const hit = getSurfaceIntersection(e.clientX, e.clientY);
        if (hit) {
          const baseYaw = lightRandomRotation
            ? Math.random() * Math.PI * 2
            : (lightPlacementRotation * Math.PI) / 180;
          const rot = computeRotation(baseYaw, hit.normal);
          setGhostPos([hit.point.x, hit.point.y + lightElevationOffset, hit.point.z]);
          setGhostRot(rot);
          invalidate(); // Smoothly render ghost tracking mouse on demand frame-loop!
        } else {
          if (ghostPos !== null) {
            setGhostPos(null);
            invalidate();
          }
        }
      } else {
        if (ghostPos !== null) {
          setGhostPos(null);
          invalidate();
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const editor = useEditorStore.getState();
      if (editor.isJoystickActive || editor.activeTool !== 'lighting' || e.button !== 0 || e.altKey) return;

      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      pointerDownTimeRef.current = performance.now();
      hasDraggedRef.current = false;
    };

    const handlePointerUp = (e: PointerEvent) => {
      const editor = useEditorStore.getState();
      if (editor.isJoystickActive || editor.activeTool !== 'lighting') {
        pointerDownPosRef.current = null;
        return;
      }

      if (pointerDownPosRef.current) {
        const now = performance.now();
        const duration = now - pointerDownTimeRef.current;
        const dist = Math.hypot(
          e.clientX - pointerDownPosRef.current.x,
          e.clientY - pointerDownPosRef.current.y
        );

        if (!hasDraggedRef.current && dist <= 8 && duration <= 350) {
          if (editor.lightingSubTool === 'place') {
            const hit = getSurfaceIntersection(e.clientX, e.clientY);
            if (hit) {
              const type = selectedLightType || 'diya_clay_01';
              const meta = getLightById(type) || LIGHTING_MANIFEST[0];
              const baseYaw = lightRandomRotation
                ? Math.random() * Math.PI * 2
                : (lightPlacementRotation * Math.PI) / 180;
              const rot = computeRotation(baseYaw, hit.normal);
              const scaleVal = lightPlacementScale * meta.defaultScale;

              const isFirework = meta.category === 'fireworks';
              const burstHeightVal = isFirework
                ? (lightRandomBurstHeight
                    ? parseFloat((0.6 + Math.random() * 1.8).toFixed(2))
                    : lightBurstHeight)
                : undefined;

              addLight({
                type,
                category: meta.category,
                position: [hit.point.x, hit.point.y + lightElevationOffset, hit.point.z],
                rotation: rot,
                scale: [scaleVal, scaleVal, scaleVal],
                colorTheme: meta.colorTheme,
                burstHeight: burstHeightVal,
              });
              invalidate(); // Immediately render placed light!
            }
          } else if (lightingSubTool === 'erase') {
            // Erase brush deletion on tap
            const hit = getSurfaceIntersection(e.clientX, e.clientY);
            if (hit) {
              const radiusSq = lightEraseRadius * lightEraseRadius;
              const toRemove: string[] = [];
              for (const l of placedLights) {
                const dx = l.position[0] - hit.point.x;
                const dz = l.position[2] - hit.point.z;
                if (dx * dx + dz * dz <= radiusSq) {
                  toRemove.push(l.id);
                }
              }
              if (toRemove.length > 0) {
                removeLights(toRemove);
                invalidate();
              }
            }
          }
        }
      }

      pointerDownPosRef.current = null;
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    activeTool,
    lightingSubTool,
    selectedLightType,
    lightPlacementScale,
    lightPlacementRotation,
    lightRandomRotation,
    lightBurstHeight,
    lightRandomBurstHeight,
    lightNormalAlign,
    lightElevationOffset,
    lightEraseRadius,
    placedLights,
    addLight,
    removeLights,
    getSurfaceIntersection,
    gl,
  ]);

  const handleSelectLight = useCallback(
    (id: string) => {
      if (activeTool === 'lighting') {
        setSelectedLightId(id);
      }
    },
    [activeTool, setSelectedLightId]
  );

  return (
    <group name="LightingStudioLayer">
      {/* 1. Placed Lights and Fireworks Models */}
      {placedLights.map((light) => {
        const isInteractive = activeTool === 'lighting' && (lightingSubTool === 'select' || lightingSubTool === 'transform');

        if (light.category === 'fireworks') {
          const meta = getLightById(light.type);
          if (meta?.fireworkType === 'skyshot') {
            return (
              <SkyShotModel
                key={light.id}
                light={light}
                onClick={(e) => {
                  if (isInteractive) {
                    e.stopPropagation();
                    handleSelectLight(light.id);
                  }
                }}
                onPointerOver={(e) => {
                  if (isInteractive) {
                    e.stopPropagation();
                    setHoveredElement({ type: 'light', id: light.id });
                  }
                }}
                onPointerOut={(e) => {
                  if (isInteractive) {
                    e.stopPropagation();
                    setHoveredElement(null);
                  }
                }}
              />
            );
          }

          // Anaar cone fountain
          return (
            <AnaarModel
              key={light.id}
              light={light}
              onClick={(e) => {
                if (isInteractive) {
                  e.stopPropagation();
                  handleSelectLight(light.id);
                }
              }}
              onPointerOver={(e) => {
                if (isInteractive) {
                  e.stopPropagation();
                  setHoveredElement({ type: 'light', id: light.id });
                }
              }}
              onPointerOut={(e) => {
                if (isInteractive) {
                  e.stopPropagation();
                  setHoveredElement(null);
                }
              }}
            />
          );
        }

        // Diyas (Clay and Hand-Painted)
        return (
          <DiyaModel
            key={light.id}
            light={light}
            onClick={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                handleSelectLight(light.id);
              }
            }}
            onPointerOver={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setHoveredElement({ type: 'light', id: light.id });
              }
            }}
            onPointerOut={(e) => {
              if (isInteractive) {
                e.stopPropagation();
                setHoveredElement(null);
              }
            }}
          />
        );
      })}

      {/* 2. Statically Pre-Allocated 16 3D Omnidirectional Point Lights (Strictly 16 lights, 0ms shader recompile) */}
      {Array.from({ length: MAX_3D_POINT_LIGHTS }).map((_, i) => (
        <pointLight
          key={i}
          ref={(el) => {
            pointLightRefs.current[i] = el;
          }}
          color={DIYA_POINT_LIGHT_COLOR}
          distance={3.5}
          decay={DIYA_POINT_LIGHT_DECAY}
          intensity={0}
          castShadow={false}
        />
      ))}

      {/* 4. Pyrotechnics Particles Simulation */}
      <points ref={pointsRef} geometry={particleGeo} material={particleMat} visible={false} frustumCulled={false} />

      {/* 4. Selection Ring Gizmo */}
      {selectedLight && (lightingSubTool === 'select' || lightingSubTool === 'transform') && (
        <group position={[selectedLight.position[0], selectedLight.position[1] + 0.006, selectedLight.position[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08 * selectedLight.scale[0], 0.12 * selectedLight.scale[0], 32]} />
            <meshBasicMaterial color="#E85D04" side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12 * selectedLight.scale[0], 0.14 * selectedLight.scale[0], 32]} />
            <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} transparent opacity={0.35} />
          </mesh>
        </group>
      )}

      {/* 5. Hover Ring Gizmo */}
      {hoveredLight && hoveredLight.id !== selectedLightId && (
        <group position={[hoveredLight.position[0], hoveredLight.position[1] + 0.005, hoveredLight.position[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08 * hoveredLight.scale[0], 0.12 * hoveredLight.scale[0], 32]} />
            <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* 6. Ghost Placement Hologram */}
      {ghostPos && activeTool === 'lighting' && lightingSubTool === 'place' && (
        <LightingGhostPreview
          position={ghostPos}
          rotation={ghostRot}
          scale={lightPlacementScale}
          type={selectedLightType || 'diya_clay_01'}
        />
      )}
    </group>
  );
};


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

// Maximum fixed 3D point lights compiled into WebGL shader (0ms recompile, 0 lag)
const MAX_3D_POINT_LIGHTS = 16;

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
  const { nightMode, timeOfDay } = useEditorStore();
  const flameMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const spriteMatRef = useRef<THREE.SpriteMaterial>(null);
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

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
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
// Spatial Clustering Solver for Diya 3D Lighting (Zero Camera Dependency)
// ============================================================================
interface DiyaSpatialCluster {
  x: number;
  y: number;
  z: number;
  count: number;
  radius: number;
}

function computeSpatialClusters(diyas: PlacedLight[], maxClusters: number): DiyaSpatialCluster[] {
  if (diyas.length === 0) return [];
  if (diyas.length <= maxClusters) {
    return diyas.map((d) => ({
      x: d.position[0],
      y: d.position[1] + 0.12,
      z: d.position[2],
      count: 1,
      radius: 2.2 * (d.scale[0] || 1.0),
    }));
  }

  // Choose initial cluster seeds distributed across the diyas array
  const centroids: { x: number; y: number; z: number; count: number; sumDist: number }[] = [];
  const step = Math.floor(diyas.length / maxClusters);
  for (let i = 0; i < maxClusters; i++) {
    const idx = Math.min(diyas.length - 1, i * step);
    centroids.push({
      x: diyas[idx].position[0],
      y: diyas[idx].position[1] + 0.12,
      z: diyas[idx].position[2],
      count: 0,
      sumDist: 0,
    });
  }

  // 3 iterations of K-Means in 3D world coordinates (< 0.05ms)
  for (let iter = 0; iter < 3; iter++) {
    const sums = centroids.map(() => ({ x: 0, y: 0, z: 0, count: 0, sumDist: 0 }));

    for (const d of diyas) {
      let bestDistSq = Infinity;
      let bestIdx = 0;
      for (let c = 0; c < centroids.length; c++) {
        const dx = d.position[0] - centroids[c].x;
        const dy = (d.position[1] + 0.12) - centroids[c].y;
        const dz = d.position[2] - centroids[c].z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          bestIdx = c;
        }
      }
      sums[bestIdx].x += d.position[0];
      sums[bestIdx].y += (d.position[1] + 0.12);
      sums[bestIdx].z += d.position[2];
      sums[bestIdx].count += 1;
      sums[bestIdx].sumDist += Math.sqrt(bestDistSq);
    }

    for (let c = 0; c < centroids.length; c++) {
      if (sums[c].count > 0) {
        centroids[c].x = sums[c].x / sums[c].count;
        centroids[c].y = sums[c].y / sums[c].count;
        centroids[c].z = sums[c].z / sums[c].count;
        centroids[c].count = sums[c].count;
        centroids[c].sumDist = sums[c].sumDist;
      }
    }
  }

  return centroids
    .filter((c) => c.count > 0)
    .map((c) => {
      const avgSpread = c.count > 1 ? c.sumDist / c.count : 0.4;
      return {
        x: c.x,
        y: c.y,
        z: c.z,
        count: c.count,
        radius: Math.max(2.2, Math.min(4.8, 2.0 + avgSpread * 1.3)),
      };
    });
}

// ============================================================================
// 6. Main Lighting & Fireworks Studio Renderer
// ============================================================================
export const LightingRenderer: React.FC = () => {
  const {
    activeTool,
    lightingSubTool,
    placedLights,
    selectedLightType,
    selectedLightId,
    setSelectedLightId,
    lightPlacementScale,
    lightPlacementRotation,
    lightRandomRotation,
    lightNormalAlign,
    lightElevationOffset,
    lightEraseRadius,
    addLight,
    updateLightTransform,
    removeLight,
    removeLights,
    hoveredElement,
    setHoveredElement,
    nightMode,
    timeOfDay,
    testFireworkTrigger,
    clearTestFireworkTrigger,
  } = useEditorStore();

  const { scene, camera, raycaster, gl, invalidate } = useThree();
  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);
  const [ghostRot, setGhostRot] = useState<[number, number, number]>([0, 0, 0]);

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
      size: 0.08,
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
      pyrotechnics.reset();
    };
  }, [particleGeo, particleMat, pyrotechnics]);

  const lastTriggerTimestampRef = useRef<number>(0);

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

  const selectedLight = useMemo(() => {
    return placedLights.find((l) => l.id === selectedLightId) || null;
  }, [placedLights, selectedLightId]);

  const hoveredLightId = hoveredElement?.type === 'light' ? hoveredElement.id : null;
  const hoveredLight = useMemo(() => {
    return placedLights.find((l) => l.id === hoveredLightId) || null;
  }, [placedLights, hoveredLightId]);

  // Frame animation loop: Pyrotechnics particles & Zero-Recompile Key Lights Rig
  useFrame(({ clock }, delta) => {
    // 1. Pyrotechnics Particles Simulation
    const hasActive = pyrotechnics.update(delta);
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
    // Assigned via world-space spatial clustering so camera orbiting NEVER causes popping/jumping
    const diyas = placedLights.filter((l) => l.category !== 'fireworks');
    const diyaStatus = getDiyaLightStatus(timeOfDay, nightMode);

    if (!diyaStatus.isLit || diyas.length === 0) {
      for (let i = 0; i < MAX_3D_POINT_LIGHTS; i++) {
        const light = pointLightRefs.current[i];
        if (light) light.intensity = 0;
      }
    } else {
      const t = clock.getElapsedTime();
      const flicker = 0.95 + 0.05 * Math.sin(t * 13.0) * Math.cos(t * 19.0);
      const activeInspectLight = selectedLight || hoveredLight;

      let startIdx = 0;
      if (activeInspectLight && activeInspectLight.category !== 'fireworks') {
        const l0 = pointLightRefs.current[0];
        if (l0) {
          l0.position.set(
            activeInspectLight.position[0],
            activeInspectLight.position[1] + 0.12,
            activeInspectLight.position[2]
          );
          l0.distance = 2.8 * (activeInspectLight.scale[0] || 1.0);
          l0.intensity = 1.75 * diyaStatus.intensityFactor * flicker;
        }
        startIdx = 1;
      }

      const remainingDiyas = activeInspectLight
        ? diyas.filter((d) => d.id !== activeInspectLight.id)
        : diyas;
      const availableSlots = MAX_3D_POINT_LIGHTS - startIdx;
      const clusters = computeSpatialClusters(remainingDiyas, availableSlots);

      for (let i = 0; i < availableSlots; i++) {
        const lightRef = pointLightRefs.current[startIdx + i];
        if (!lightRef) continue;

        if (i < clusters.length) {
          const c = clusters[i];
          lightRef.position.set(c.x, c.y, c.z);
          lightRef.distance = c.radius;
          const densityBoost = Math.min(2.5, 1.35 + 0.20 * Math.sqrt(c.count));
          lightRef.intensity = densityBoost * diyaStatus.intensityFactor * flicker;
        } else {
          lightRef.intensity = 0;
        }
      }
    }
  });

  // Raycast against mountain terrain and fort structures
  const getSurfaceIntersection = useCallback(
    (clientX: number, clientY: number): { point: THREE.Vector3; normal: THREE.Vector3 } | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const targets: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          const name = mesh.name || '';
          const parentName = mesh.parent?.name || '';

          // Exclude lights layer, rings, ghost preview, cursors, water
          if (
            name.includes('PlacedLight') ||
            parentName.includes('PlacedLight') ||
            name.includes('SelectionRing') ||
            parentName.includes('SelectionRing') ||
            name.includes('Ghost') ||
            parentName.includes('Ghost') ||
            name.includes('Cursor') ||
            name.includes('Grid') ||
            name === 'WaterPlane'
          ) {
            return;
          }

          if (
            name === 'BaseTerrainMesh' ||
            name === 'TerrainMeshFallback' ||
            parentName.startsWith('FortWall_') ||
            name.startsWith('StoneSteps_') ||
            name.startsWith('FortWall_') ||
            name.startsWith('Bastion_') ||
            name.startsWith('Foundation_') ||
            name === 'CourtyardTerrain' ||
            name === 'CourtyardBricks'
          ) {
            targets.push(mesh);
          }
        }
      });

      if (targets.length > 0) {
        const intersects = raycaster.intersectObjects(targets, false);
        if (intersects.length > 0) {
          const hit = intersects[0];
          const normal = hit.face
            ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
            : new THREE.Vector3(0, 1, 0);
          return { point: hit.point, normal };
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
        setGhostPos(null);
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
        } else {
          setGhostPos(null);
        }
      } else {
        setGhostPos(null);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (activeTool !== 'lighting' || e.button !== 0 || e.altKey) return;

      if (lightingSubTool === 'place') {
        const hit = getSurfaceIntersection(e.clientX, e.clientY);
        if (hit) {
          const type = selectedLightType || 'diya_clay_01';
          const meta = getLightById(type) || LIGHTING_MANIFEST[0];
          const baseYaw = lightRandomRotation
            ? Math.random() * Math.PI * 2
            : (lightPlacementRotation * Math.PI) / 180;
          const rot = computeRotation(baseYaw, hit.normal);
          const scaleVal = lightPlacementScale * meta.defaultScale;

          addLight({
            type,
            category: meta.category,
            position: [hit.point.x, hit.point.y + lightElevationOffset, hit.point.z],
            rotation: rot,
            scale: [scaleVal, scaleVal, scaleVal],
            colorTheme: meta.colorTheme,
          });
        }
      } else if (lightingSubTool === 'erase') {
        // Erase brush deletion
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
          }
        }
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [
    activeTool,
    lightingSubTool,
    selectedLightType,
    lightPlacementScale,
    lightPlacementRotation,
    lightRandomRotation,
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
          color="#FFA533"
          distance={2.5}
          decay={2.0}
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


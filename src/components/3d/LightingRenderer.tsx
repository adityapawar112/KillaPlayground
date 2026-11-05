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
import { DiyaLightPools } from './DiyaLightPools';

// ============================================================================
// 1. Procedural Diya Flame Component with Organic Flicker & White-Hot Core
// ============================================================================
const DiyaFlame: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  const flameMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const flameGeo = useMemo(() => createDiyaFlameGeometry(), []);
  const coreGeo = useMemo(() => createDiyaFlameCoreGeometry(), []);

  useEffect(() => {
    return () => {
      flameGeo.dispose();
      coreGeo.dispose();
    };
  }, [flameGeo, coreGeo]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flameMatRef.current) {
      // Natural organic flame flicker formula
      const flicker = 1.9 + 0.45 * Math.sin(t * 14.0) * Math.cos(t * 22.0);
      flameMatRef.current.emissiveIntensity = flicker;
    }
    if (flameMeshRef.current) {
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
    testFireworkTrigger,
    clearTestFireworkTrigger,
  } = useEditorStore();

  const { scene, camera, raycaster, gl, invalidate } = useThree();
  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);
  const [ghostRot, setGhostRot] = useState<[number, number, number]>([0, 0, 0]);

  // Fixed Pre-Allocated Dynamic Key Lights (Zero-recompile, strictly 3 point lights)
  const keyLightRef1 = useRef<THREE.PointLight>(null);
  const keyLightRef2 = useRef<THREE.PointLight>(null);
  const keyLightRef3 = useRef<THREE.PointLight>(null);

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

    // 2. Dynamic Key Lights Spatial Allocation (Strictly 3 point lights, zero recompile)
    // Avoid blown-out camera-popping hot spots: Key lights are reserved for focused inspection of selected/hovered lights
    if (!nightMode) {
      if (keyLightRef1.current) keyLightRef1.current.intensity = 0;
      if (keyLightRef2.current) keyLightRef2.current.intensity = 0;
      if (keyLightRef3.current) keyLightRef3.current.intensity = 0;
    } else {
      const activeInspectLight = selectedLight || hoveredLight;
      if (activeInspectLight && keyLightRef1.current) {
        const t = clock.getElapsedTime();
        const flicker = 0.94 + 0.06 * Math.sin(t * 13.0);
        keyLightRef1.current.position.set(
          activeInspectLight.position[0],
          activeInspectLight.position[1] + 0.25,
          activeInspectLight.position[2]
        );
        keyLightRef1.current.distance = 2.2;
        keyLightRef1.current.intensity = 0.65 * flicker;
      } else if (keyLightRef1.current) {
        keyLightRef1.current.intensity = 0;
      }

      // Lights 2 & 3 remain at 0 during standard night mode so all diyas glow uniformly with DiyaLightPools
      if (keyLightRef2.current) keyLightRef2.current.intensity = 0;
      if (keyLightRef3.current) keyLightRef3.current.intensity = 0;
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

      {/* 2. Instanced Diya Ground Light Pools (1 Draw Call for all 250 diyas) */}
      <DiyaLightPools />

      {/* 3. Fixed Pre-Allocated Dynamic Key Lights (Strictly 3 lights, 0ms shader recompile) */}
      <pointLight
        ref={keyLightRef1}
        color="#F59E0B"
        distance={4.0}
        decay={2.0}
        intensity={0}
        castShadow={false}
      />
      <pointLight
        ref={keyLightRef2}
        color="#F59E0B"
        distance={3.5}
        decay={2.0}
        intensity={0}
        castShadow={false}
      />
      <pointLight
        ref={keyLightRef3}
        color="#F59E0B"
        distance={3.5}
        decay={2.0}
        intensity={0}
        castShadow={false}
      />

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


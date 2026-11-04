'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditorStore, PlacedProp } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { getFigurineById, FIGURINE_MANIFEST } from '@/lib/figurines/figurineManifest';
import { figurineAssetManager, CachedFigurineAsset } from '@/lib/figurines/figurineAssetManager';

interface FigurineTypeGroupProps {
  type: string;
  instances: PlacedProp[];
  selectedPropId: string | null;
  interactiveHover: boolean;
  onSelectInstance: (id: string) => void;
  onHoverInstance?: (id: string | null) => void;
}

const FigurineTypeGroup: React.FC<FigurineTypeGroupProps> = ({
  type,
  instances,
  selectedPropId,
  interactiveHover,
  onSelectInstance,
  onHoverInstance,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [asset, setAsset] = useState<CachedFigurineAsset | null>(() => {
    const meta = getFigurineById(type) || FIGURINE_MANIFEST[0];
    return figurineAssetManager.getCached(meta.modelPath) || null;
  });

  const figurineItem = useMemo(() => {
    return getFigurineById(type) || FIGURINE_MANIFEST[0];
  }, [type]);

  useEffect(() => {
    let active = true;
    figurineAssetManager.loadAsset(figurineItem.modelPath).then((cached) => {
      if (active) setAsset(cached);
    }).catch((err) => {
      console.warn(`Failed to load figurine model: ${figurineItem.modelPath}`, err);
    });
    return () => {
      active = false;
    };
  }, [figurineItem.modelPath]);

  const capacity = useMemo(() => {
    return Math.max(32, Math.pow(2, Math.ceil(Math.log2(Math.max(1, instances.length)))));
  }, [instances.length]);

  // Update instance matrix buffer
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !asset) return;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      dummy.position.set(inst.position[0], inst.position[1], inst.position[2]);
      dummy.rotation.set(inst.rotation[0], inst.rotation[1], inst.rotation[2]);
      dummy.scale.set(inst.scale[0], inst.scale[1], inst.scale[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = instances.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }, [instances, asset]);

  // Clean up pointer cursor if mode changes while hovering
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [interactiveHover]);

  if (!asset || instances.length === 0) return null;

  return (
    <instancedMesh
      key={`${type}_${capacity}`}
      ref={meshRef}
      args={[asset.geometry, asset.material, capacity]}
      castShadow
      receiveShadow
      frustumCulled={true}
      onClick={(e) => {
        // Only select when interactive hover/selection is active
        if (interactiveHover && e.instanceId !== undefined && e.instanceId < instances.length) {
          e.stopPropagation();
          onSelectInstance(instances[e.instanceId].id);
        }
      }}
      onPointerOver={(e) => {
        if (!interactiveHover) return;
        if (e.instanceId !== undefined && e.instanceId < instances.length) {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          onHoverInstance?.(instances[e.instanceId].id);
        }
      }}
      onPointerMove={(e) => {
        if (!interactiveHover) return;
        if (e.instanceId !== undefined && e.instanceId < instances.length) {
          onHoverInstance?.(instances[e.instanceId].id);
        }
      }}
      onPointerOut={(e) => {
        if (!interactiveHover) return;
        e.stopPropagation();
        document.body.style.cursor = 'default';
        onHoverInstance?.(null);
      }}
    />
  );
};

// Selection Ring Gizmo with subtle diorama glow
const SelectionRing: React.FC<{ position: [number, number, number]; scale: number }> = ({
  position,
  scale,
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  // Calibrated radius for 15cm miniature diorama figurine bases
  const radius = Math.max(0.08, scale * 0.12);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      const pulse = 1.0 + Math.sin(t * 3.5) * 0.08;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={[position[0], position[1] + 0.005, position[2]]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.88, radius * 1.06, 32]} />
        <meshBasicMaterial color="#E85D04" side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
      {/* Outer subtle glow rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.08, radius * 1.25, 32]} />
        <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

// Subtle Amber Hover Ring when hovering figurines in viewport or outliner
const HoverRing: React.FC<{ position: [number, number, number]; scale: number }> = ({
  position,
  scale,
}) => {
  const radius = Math.max(0.08, scale * 0.12);
  return (
    <group position={[position[0], position[1] + 0.006, position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.86, radius * 1.15, 32]} />
        <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.15, radius * 1.30, 32]} />
        <meshBasicMaterial color="#E85D04" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// Ghost Placement Reticle
const GhostReticle: React.FC<{
  position: [number, number, number] | null;
  rotation: [number, number, number];
  scale: [number, number, number];
  type: string;
}> = ({ position, rotation, scale, type }) => {
  const [asset, setAsset] = useState<CachedFigurineAsset | null>(() => {
    const meta = getFigurineById(type) || FIGURINE_MANIFEST[0];
    return figurineAssetManager.getCached(meta.modelPath) || null;
  });

  useEffect(() => {
    let active = true;
    const meta = getFigurineById(type) || FIGURINE_MANIFEST[0];
    figurineAssetManager.loadAsset(meta.modelPath).then((cached) => {
      if (active) setAsset(cached);
    }).catch(() => null);
    return () => { active = false; };
  }, [type]);

  const ghostMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#F59E0B',
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
  }, []);

  if (!position || !asset) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={asset.geometry} material={ghostMaterial} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[0.08 * scale[0], 0.12 * scale[0], 32]} />
        <meshBasicMaterial color="#E85D04" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

export const FigurineRenderer: React.FC = () => {
  const {
    activeTool,
    propSubTool,
    placedProps,
    selectedPropType,
    selectedPropId,
    setSelectedPropId,
    propPlacementScale,
    propPlacementRotation,
    propRandomRotation,
    propNormalAlign,
    propElevationOffset,
    propEraseRadius,
    addProp,
    updatePropTransform,
    removeProp,
    removeProps,
    hoveredElement,
    setHoveredElement,
  } = useEditorStore();

  const { scene, camera, raycaster, gl } = useThree();
  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);
  const [ghostRot, setGhostRot] = useState<[number, number, number]>([0, 0, 0]);
  const isDraggingProp = useRef(false);

  // Group active placed figurines by type
  const instancesByType = useMemo(() => {
    const map = new Map<string, PlacedProp[]>();
    for (const p of placedProps) {
      let list = map.get(p.type);
      if (!list) {
        list = [];
        map.set(p.type, list);
      }
      list.push(p);
    }
    return map;
  }, [placedProps]);

  const activeTypes = useMemo(() => Array.from(instancesByType.entries()), [instancesByType]);

  const selectedProp = useMemo(() => {
    return placedProps.find((p) => p.id === selectedPropId) || null;
  }, [placedProps, selectedPropId]);

  const hoveredPropId = hoveredElement?.type === 'prop' ? hoveredElement.id : null;
  const hoveredProp = useMemo(() => {
    return placedProps.find((p) => p.id === hoveredPropId) || null;
  }, [placedProps, hoveredPropId]);

  // Raycast against mountain terrain and fort structures (walls, bastions, stone steps)
  const getSurfaceIntersection = useCallback(
    (clientX: number, clientY: number): { point: THREE.Vector3; normal: THREE.Vector3 } | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Find targets: Terrain mesh, Fort walls, Bastions, and Stone steps
      const targets: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          const name = mesh.name || '';
          const parentName = mesh.parent?.name || '';

          // Exclude figurines layer, selection rings, ghost preview, brush cursors, water plane
          if (
            name.includes('Figurine') ||
            parentName.includes('Figurine') ||
            parentName.includes('FigurinesLayer') ||
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

          // Target terrain mountain, fort ramparts, bastions, stone steps, foundations, courtyard bricks
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

      // Fallback: raycast against plane at y = 0 (infinite grid)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pt = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, pt)) {
        return { point: pt, normal: new THREE.Vector3(0, 1, 0) };
      }

      return null;
    },
    [gl, raycaster, camera, scene]
  );

  // Viewport pointer interaction & keyboard shortcuts
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    const computeRotation = (baseYaw: number, normal: THREE.Vector3): [number, number, number] => {
      const safeNormal = normal.clone();
      if (safeNormal.y < 0.2) {
        safeNormal.set(0, 1, 0);
      }
      if (propNormalAlign <= 0) {
        return [0, baseYaw, 0];
      }
      const up = new THREE.Vector3(0, 1, 0);
      const blendedUp = up.clone().lerp(safeNormal, propNormalAlign).normalize();
      const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, blendedUp);
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseYaw);
      const quat = new THREE.Quaternion().multiplyQuaternions(alignQuat, yawQuat);
      const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');
      return [euler.x, euler.y, euler.z];
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (activeTool !== 'prop') return;

      const hit = getSurfaceIntersection(e.clientX, e.clientY);
      if (!hit) {
        setGhostPos(null);
        return;
      }

      const baseYaw = (propPlacementRotation * Math.PI) / 180;
      const rot = computeRotation(baseYaw, hit.normal);
      const finalY = hit.point.y + propElevationOffset;

      if (propSubTool === 'place') {
        setGhostPos([hit.point.x, finalY, hit.point.z]);
        setGhostRot(rot);
      } else if (propSubTool === 'transform' && isDraggingProp.current && selectedPropId) {
        updatePropTransform(selectedPropId, {
          position: [hit.point.x, finalY, hit.point.z],
          ...(propNormalAlign > 0 ? { rotation: rot } : {}),
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (activeTool !== 'prop' || e.button !== 0) return; // Only primary left-click

      if (propSubTool === 'place') {
        const hit = getSurfaceIntersection(e.clientX, e.clientY);
        if (hit) {
          useTerrainStore.getState().pushUndo();
          const baseYaw =
            propRandomRotation
              ? Math.random() * Math.PI * 2
              : (propPlacementRotation * Math.PI) / 180;

          const rot = computeRotation(baseYaw, hit.normal);
          const scaleVal = propPlacementScale;
          const finalY = hit.point.y + propElevationOffset;

          addProp({
            type: selectedPropType || 'warrior',
            position: [hit.point.x, finalY, hit.point.z],
            rotation: rot,
            scale: [scaleVal, scaleVal, scaleVal],
          });
        }
      } else if (propSubTool === 'transform' && selectedPropId) {
        isDraggingProp.current = true;
      }
    };

    const handlePointerUp = () => {
      isDraggingProp.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPropId) {
          removeProp(selectedPropId);
        }
      } else if (e.key === 'Escape') {
        setSelectedPropId(null);
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeTool,
    propSubTool,
    selectedPropType,
    selectedPropId,
    setSelectedPropId,
    propPlacementScale,
    propPlacementRotation,
    propRandomRotation,
    propNormalAlign,
    propElevationOffset,
    getSurfaceIntersection,
    addProp,
    updatePropTransform,
    removeProp,
    gl,
  ]);

  const isSelectableMode =
    activeTool === 'prop' && (propSubTool === 'select' || propSubTool === 'transform');

  return (
    <group name="FigurinesLayer">
      {/* Placed Figurine Groups */}
      {activeTypes.map(([type, instances]) => (
        <FigurineTypeGroup
          key={type}
          type={type}
          instances={instances}
          selectedPropId={selectedPropId}
          interactiveHover={isSelectableMode}
          onHoverInstance={(id) => {
            if (isSelectableMode || id === null) {
              setHoveredElement(id ? { type: 'prop', id } : null);
            }
          }}
          onSelectInstance={(id) => {
            if (isSelectableMode) {
              setSelectedPropId(id);
            }
          }}
        />
      ))}

      {/* Selected Figurine Diorama Selection Ring (Only in select / transform modes) */}
      {selectedProp && isSelectableMode && (
        <SelectionRing
          position={selectedProp.position}
          scale={selectedProp.scale[0]}
        />
      )}

      {/* Hovered Figurine Diorama Highlight Ring (Only in select / transform modes) */}
      {hoveredProp && hoveredProp.id !== selectedProp?.id && isSelectableMode && (
        <HoverRing
          position={hoveredProp.position}
          scale={hoveredProp.scale[0]}
        />
      )}

      {/* Ghost Reticle in Place Mode */}
      {activeTool === 'prop' && propSubTool === 'place' && ghostPos && (
        <GhostReticle
          position={ghostPos}
          rotation={ghostRot}
          scale={[propPlacementScale, propPlacementScale, propPlacementScale]}
          type={selectedPropType || 'warrior'}
        />
      )}
    </group>
  );
};


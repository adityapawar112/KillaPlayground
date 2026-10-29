'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import {
  generateSplinePointsAlongTerrain,
  generateStoneStepsGeometry,
  generateFlagInstanceData,
  generateDiyaInstanceData,
  createFlagpoleGeometry,
  createSwallowtailFlagGeometry,
  createDiyaBowlGeometry,
  createDiyaFlameGeometry,
} from '@/lib/spline/splineGeometry';
import { SplinePath } from '@/lib/spline/splineTypes';

// ============================================================================
// 1. DRAFT SPLINE CURVE & NODES PREVIEW COMPONENT
// ============================================================================
interface DraftSplinePreviewProps {
  points: [number, number, number][];
}

const DraftSplinePreview: React.FC<DraftSplinePreviewProps> = ({ points }) => {
  const { curveGeo, lineMat } = useMemo(() => {
    if (points.length < 2) {
      return { curveGeo: null, lineMat: null };
    }

    const sampled = generateSplinePointsAlongTerrain(points, undefined, 0.5, 8);
    const v3s = sampled.map((p) => new THREE.Vector3(p[0], p[1] + 0.03, p[2])); // 3cm float above ground
    const geo = new THREE.BufferGeometry().setFromPoints(v3s);

    const mat = new THREE.LineBasicMaterial({
      color: '#F59E0B', // Amber gold
      linewidth: 3,
      depthTest: true,
      transparent: true,
      opacity: 0.95,
    });

    return { curveGeo: geo, lineMat: mat };
  }, [points]);

  useEffect(() => {
    return () => {
      curveGeo?.dispose();
      lineMat?.dispose();
    };
  }, [curveGeo, lineMat]);

  if (points.length === 0) return null;

  return (
    <group name="DraftSplinePreview">
      {/* Intermediate Connecting Line */}
      {curveGeo && lineMat && (
        <primitive object={new THREE.Line(curveGeo, lineMat)} />
      )}

      {/* Node Markers */}
      {points.map((pt, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === points.length - 1 && points.length > 1;
        const pinColor = isStart ? '#10B981' : isEnd ? '#EF4444' : '#F59E0B';

        return (
          <group key={`draft_pin_${idx}`} position={[pt[0], pt[1] + 0.04, pt[2]]}>
            <mesh>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color={pinColor} depthTest={false} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.04, 8]} />
              <meshBasicMaterial color="#2B1E16" depthTest={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ============================================================================
// 2. STONE STEPS (PAYRYA) COMPONENT
// ============================================================================
interface StoneStepsMeshProps {
  spline: SplinePath;
  buffer: Float32Array;
  isSelected: boolean;
  onSelect: () => void;
  stoneMaterial: THREE.Material;
}

const StoneStepsMesh: React.FC<StoneStepsMeshProps> = ({
  spline,
  buffer,
  isSelected,
  onSelect,
  stoneMaterial,
}) => {
  const geometry = useMemo(() => {
    return generateStoneStepsGeometry(spline.points, buffer, spline.settings);
  }, [spline.points, buffer, spline.settings]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh
        geometry={geometry}
        material={stoneMaterial}
        castShadow
        receiveShadow
        name={`StoneSteps_${spline.id}`}
      />
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[geometry, 35]} />
          <lineBasicMaterial color="#F59E0B" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};

// ============================================================================
// 3. BHAGWA SAFFRON FLAGS (DHWAJ) COMPONENT
// ============================================================================
interface FlagInstancesProps {
  spline: SplinePath;
  buffer: Float32Array;
  isSelected: boolean;
  onSelect: () => void;
  poleGeo: THREE.CylinderGeometry;
  flagGeo: THREE.BufferGeometry;
  poleMaterial: THREE.Material;
  flagMaterial: THREE.Material;
}

const FlagInstances: React.FC<FlagInstancesProps> = ({
  spline,
  buffer,
  isSelected,
  onSelect,
  poleGeo,
  flagGeo,
  poleMaterial,
  flagMaterial,
}) => {
  const poleMeshRef = useRef<THREE.InstancedMesh>(null);
  const flagMeshRef = useRef<THREE.InstancedMesh>(null);

  const transforms = useMemo(() => {
    return generateFlagInstanceData(spline.points, buffer, spline.settings);
  }, [spline.points, buffer, spline.settings]);

  useEffect(() => {
    const poleMesh = poleMeshRef.current;
    const flagMesh = flagMeshRef.current;
    if (!poleMesh || !flagMesh || transforms.length === 0) return;

    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.set(t.position[0], t.position[1], t.position[2]);
      dummy.rotation.set(t.rotation[0], t.rotation[1], t.rotation[2]);
      dummy.scale.set(t.scale[0], t.scale[1], t.scale[2]);
      dummy.updateMatrix();

      poleMesh.setMatrixAt(i, dummy.matrix);
      flagMesh.setMatrixAt(i, dummy.matrix);
    });

    poleMesh.instanceMatrix.needsUpdate = true;
    flagMesh.instanceMatrix.needsUpdate = true;
    poleMesh.computeBoundingSphere();
    flagMesh.computeBoundingSphere();
  }, [transforms]);

  if (transforms.length === 0) return null;

  return (
    <group onClick={(e) => { e.stopPropagation(); onSelect(); }} name={`FlagGroup_${spline.id}`}>
      <instancedMesh
        ref={poleMeshRef}
        args={[poleGeo, poleMaterial, transforms.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={flagMeshRef}
        args={[flagGeo, flagMaterial, transforms.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

// ============================================================================
// 4. FESTIVE DIYAS (DIVAS) COMPONENT
// ============================================================================
interface DiyaInstancesProps {
  spline: SplinePath;
  buffer: Float32Array;
  isSelected: boolean;
  onSelect: () => void;
  bowlGeo: THREE.BufferGeometry;
  flameGeo: THREE.BufferGeometry;
  bowlMaterial: THREE.Material;
  flameMaterial: THREE.MeshStandardMaterial;
}

const DiyaInstances: React.FC<DiyaInstancesProps> = ({
  spline,
  buffer,
  isSelected,
  onSelect,
  bowlGeo,
  flameGeo,
  bowlMaterial,
  flameMaterial,
}) => {
  const bowlMeshRef = useRef<THREE.InstancedMesh>(null);
  const flameMeshRef = useRef<THREE.InstancedMesh>(null);

  const transforms = useMemo(() => {
    return generateDiyaInstanceData(spline.points, buffer, spline.settings);
  }, [spline.points, buffer, spline.settings]);

  useEffect(() => {
    const bowlMesh = bowlMeshRef.current;
    const flameMesh = flameMeshRef.current;
    if (!bowlMesh || !flameMesh || transforms.length === 0) return;

    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.set(t.position[0], t.position[1], t.position[2]);
      dummy.rotation.set(t.rotation[0], t.rotation[1], t.rotation[2]);
      dummy.scale.set(t.scale[0], t.scale[1], t.scale[2]);
      dummy.updateMatrix();

      bowlMesh.setMatrixAt(i, dummy.matrix);
      flameMesh.setMatrixAt(i, dummy.matrix);
    });

    bowlMesh.instanceMatrix.needsUpdate = true;
    flameMesh.instanceMatrix.needsUpdate = true;
    bowlMesh.computeBoundingSphere();
    flameMesh.computeBoundingSphere();
  }, [transforms]);

  if (transforms.length === 0) return null;

  return (
    <group onClick={(e) => { e.stopPropagation(); onSelect(); }} name={`DiyaGroup_${spline.id}`}>
      <instancedMesh
        ref={bowlMeshRef}
        args={[bowlGeo, bowlMaterial, transforms.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={flameMeshRef}
        args={[flameGeo, flameMaterial, transforms.length]}
      />
    </group>
  );
};

// ============================================================================
// 5. MAIN SPLINE STRUCTURES CONTAINER
// ============================================================================
export const SplineStructures: React.FC = () => {
  const {
    splines,
    currentSplinePoints,
    isDrawingSpline,
    selectedSplineId,
    setSelectedSplineId,
  } = useEditorStore();

  const stateBuffer = useTerrainStore((s) => s.stateBuffer);

  // Load Dark Basalt Stone PBR textures for authentic stone steps
  const darkStoneTextures = useTexture({
    diffuse: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_basecolor.png',
    normal: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_normal.png',
    roughness: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_roughness.png',
    ao: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_ao.png',
  });

  useEffect(() => {
    const all = [
      darkStoneTextures.diffuse,
      darkStoneTextures.normal,
      darkStoneTextures.roughness,
      darkStoneTextures.ao,
    ];
    all.forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
      }
    });
  }, [darkStoneTextures]);

  // Stable shared materials
  const {
    stoneMaterial,
    poleMaterial,
    flagMaterial,
    diyaBowlMaterial,
    diyaFlameMaterial,
  } = useMemo(() => {
    // 1. Stone Steps Material
    const stoneMat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    // 2. Flagpole Wood Material
    const poleMat = new THREE.MeshStandardMaterial({
      color: '#3B2414', // Dark seasoned teak / bamboo
      roughness: 0.75,
      metalness: 0.02,
    });

    // 3. Saffron Flag Cloth Material with Wind Sway Shader
    const flagMat = new THREE.MeshStandardMaterial({
      color: '#FF6600', // Vibrant Maratha Saffron
      roughness: 0.65,
      metalness: 0.02,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    flagMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      flagMat.userData.shader = shader;
      shader.vertexShader = `
        uniform float uTime;
      ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        // Saffron flag wind sway: displacement increases away from the flagpole
        float wave = sin(uTime * 4.5 + position.x * 7.0 + position.y * 3.0);
        transformed.z += wave * position.x * 0.22;
        transformed.y += sin(uTime * 3.2 + position.x * 5.0) * position.x * 0.05;
        `
      );
    };

    // 4. Terracotta Diya Clay Bowl Material
    const diyaBowlMat = new THREE.MeshStandardMaterial({
      color: '#B85536', // Terracotta reddish-brown clay
      roughness: 0.92,
      metalness: 0.0,
    });

    // 5. Glowing Amber Diya Flame Material
    const diyaFlameMat = new THREE.MeshStandardMaterial({
      color: '#FFAA00',
      emissive: '#FF8800',
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.0,
    });

    return {
      stoneMaterial: stoneMat,
      poleMaterial: poleMat,
      flagMaterial: flagMat,
      diyaBowlMaterial: diyaBowlMat,
      diyaFlameMaterial: diyaFlameMat,
    };
  }, []);

  // Update stone texture maps
  useEffect(() => {
    stoneMaterial.map = darkStoneTextures.diffuse;
    stoneMaterial.normalMap = darkStoneTextures.normal;
    stoneMaterial.roughnessMap = darkStoneTextures.roughness;
    stoneMaterial.aoMap = darkStoneTextures.ao;
    stoneMaterial.needsUpdate = true;
  }, [stoneMaterial, darkStoneTextures]);

  // Shared instanced geometries
  const { poleGeo, flagGeo, diyaBowlGeo, diyaFlameGeo } = useMemo(() => {
    return {
      poleGeo: createFlagpoleGeometry(),
      flagGeo: createSwallowtailFlagGeometry(),
      diyaBowlGeo: createDiyaBowlGeometry(),
      diyaFlameGeo: createDiyaFlameGeometry(),
    };
  }, []);

  // Dispose shared materials & geometries on unmount
  useEffect(() => {
    return () => {
      stoneMaterial.dispose();
      poleMaterial.dispose();
      flagMaterial.dispose();
      diyaBowlMaterial.dispose();
      diyaFlameMaterial.dispose();

      poleGeo.dispose();
      flagGeo.dispose();
      diyaBowlGeo.dispose();
      diyaFlameGeo.dispose();
    };
  }, [
    stoneMaterial,
    poleMaterial,
    flagMaterial,
    diyaBowlMaterial,
    diyaFlameMaterial,
    poleGeo,
    flagGeo,
    diyaBowlGeo,
    diyaFlameGeo,
  ]);

  // Per-frame animation for flag wind flutter and diya flame flicker
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // 1. Update Flag Wind Sway Shader Time Uniform
    if (flagMaterial.userData.shader) {
      flagMaterial.userData.shader.uniforms.uTime.value = time;
    }

    // 2. Subtle organic flicker for diya flame emission
    const flicker = 2.0 + 0.6 * Math.sin(time * 9.5) * Math.cos(time * 15.2);
    diyaFlameMaterial.emissiveIntensity = flicker;
  });

  return (
    <group name="SplineStructuresContainer">
      {/* 1. Interactive Draft Spline Curve & Nodes Preview */}
      {isDrawingSpline && currentSplinePoints.length > 0 && (
        <DraftSplinePreview points={currentSplinePoints} />
      )}

      {/* 2. Placed Spline Structures */}
      {splines.map((spline) => {
        const isSelected = selectedSplineId === spline.id;
        const handleSelect = () => setSelectedSplineId(spline.id);

        if (spline.type === 'steps') {
          return (
            <StoneStepsMesh
              key={spline.id}
              spline={spline}
              buffer={stateBuffer}
              isSelected={isSelected}
              onSelect={handleSelect}
              stoneMaterial={stoneMaterial}
            />
          );
        }

        if (spline.type === 'flags') {
          return (
            <FlagInstances
              key={spline.id}
              spline={spline}
              buffer={stateBuffer}
              isSelected={isSelected}
              onSelect={handleSelect}
              poleGeo={poleGeo}
              flagGeo={flagGeo}
              poleMaterial={poleMaterial}
              flagMaterial={flagMaterial}
            />
          );
        }

        if (spline.type === 'diyas') {
          return (
            <DiyaInstances
              key={spline.id}
              spline={spline}
              buffer={stateBuffer}
              isSelected={isSelected}
              onSelect={handleSelect}
              bowlGeo={diyaBowlGeo}
              flameGeo={diyaFlameGeo}
              bowlMaterial={diyaBowlMaterial}
              flameMaterial={diyaFlameMaterial}
            />
          );
        }

        return null;
      })}
    </group>
  );
};


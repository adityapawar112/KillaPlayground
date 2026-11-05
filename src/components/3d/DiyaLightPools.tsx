'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEditorStore } from '@/lib/state/useEditorStore';

const MAX_LIGHT_POOLS = 250;

/**
 * DiyaLightPools - High Performance Instanced Ground Illumination
 * Ticket 10 & Lighting Optimization Plan
 *
 * Renders soft, warm ambient light pools on the ground for up to 250 diyas
 * simultaneously in exactly 1 single draw call with 0ms shader recompile.
 */
export const DiyaLightPools: React.FC = () => {
  const { placedLights, nightMode } = useEditorStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // 1. Shared low-poly circle geometry (16 segments, unit radius)
  const circleGeo = useMemo(() => {
    const geo = new THREE.CircleGeometry(1.0, 16);
    // Rotate to lie flat on the horizontal XZ plane facing upward (+Y)
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // 2. Custom Additive Radial Falloff Shader Material with Organic Flicker
  const shaderMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#F59E0B') }, // Warm amber glow
        uIntensity: { value: 1.35 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;

        void main() {
          float dist = length(vUv - vec2(0.5)) * 2.0;
          if (dist > 1.0) discard;

          // Quadratic soft falloff
          float falloff = pow(clamp(1.0 - dist, 0.0, 1.0), 2.2);
          // Organic breathing flicker
          float flicker = 0.92 + 0.08 * sin(uTime * 14.0) * cos(uTime * 22.0);

          gl_FragColor = vec4(uColor * falloff * uIntensity * flicker, falloff);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -1.0,
      side: THREE.DoubleSide,
    });
  }, []);

  useEffect(() => {
    materialRef.current = shaderMat;
    return () => {
      circleGeo.dispose();
      shaderMat.dispose();
    };
  }, [circleGeo, shaderMat]);

  // 3. Update Instance Matrices whenever placedLights changes
  useEffect(() => {
    const instMesh = meshRef.current;
    if (!instMesh) return;

    const diyas = placedLights.filter((l) => l.category !== 'fireworks');
    const dummy = new THREE.Object3D();

    diyas.forEach((diya, i) => {
      if (i >= MAX_LIGHT_POOLS) return;

      // Position flush slightly above surface to prevent z-fighting
      dummy.position.set(
        diya.position[0],
        diya.position[1] + 0.008,
        diya.position[2]
      );

      // Light radius scaled by diya size (calibrated pool ~0.95m)
      const baseRadius = 0.95 * diya.scale[0];
      dummy.scale.set(baseRadius, 1.0, baseRadius);
      dummy.rotation.set(0, 0, 0);

      dummy.updateMatrix();
      instMesh.setMatrixAt(i, dummy.matrix);
    });

    instMesh.count = Math.min(diyas.length, MAX_LIGHT_POOLS);
    instMesh.instanceMatrix.needsUpdate = true;
    instMesh.visible = nightMode && diyas.length > 0;
  }, [placedLights, nightMode]);

  // 4. Animate organic flicker time uniform
  useFrame(({ clock }) => {
    if (materialRef.current && nightMode) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[circleGeo, shaderMat, MAX_LIGHT_POOLS]}
      frustumCulled={false}
      raycast={() => null} // Light pools are non-interactive visuals
    />
  );
};


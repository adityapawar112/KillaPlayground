'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditorStore } from '@/lib/state/useEditorStore';
import {
  AtmosphericLightingConfig,
  getAtmosphericLighting,
} from '@/lib/lighting/atmosphericLighting';

interface CelestialSkyRigProps {
  config?: AtmosphericLightingConfig;
}

/**
 * CelestialSkyRig - 3D Physical Celestial Sun & Moon Atmospheric Sky Rig
 * Ticket 10 & 11: Festive Lighting, Time of Day & Diorama Studio
 *
 * Renders:
 * 1. Day Mode: Tangible 3D glowing Sun sphere with camera-facing radial corona billboard (color-tinted by solar temperature).
 * 2. Night Mode: Luminous silver-blue Moon sphere with soft lunar halo billboard & twinkling starfield.
 * 3. Orbits dynamically in real time matching sunElevation and sunAzimuth.
 */
export const CelestialSkyRig: React.FC<CelestialSkyRigProps> = ({ config }) => {
  const { sunElevation, sunAzimuth, nightMode, timeOfDay } = useEditorStore();
  const { camera } = useThree();

  const activeConfig = useMemo(() => {
    return config || getAtmosphericLighting(timeOfDay, nightMode, sunElevation, sunAzimuth);
  }, [config, timeOfDay, nightMode, sunElevation, sunAzimuth]);

  const sunGroupRef = useRef<THREE.Group>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const sunCoronaRef = useRef<THREE.Mesh>(null);
  const moonHaloRef = useRef<THREE.Mesh>(null);
  const starMaterialRef = useRef<THREE.PointsMaterial>(null);

  // 1. Procedural Corona Radial Texture for Sun (Warm Golden Glow)
  const sunCoronaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0.0, 'rgba(255, 255, 240, 1.0)');
      gradient.addColorStop(0.2, 'rgba(254, 215, 170, 0.85)');
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
      gradient.addColorStop(0.8, 'rgba(217, 119, 6, 0.15)');
      gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // 2. Procedural Lunar Halo Texture for Moon (Soft Indigo / Cyan Aura)
  const moonHaloTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0.0, 'rgba(224, 242, 254, 0.95)');
      gradient.addColorStop(0.25, 'rgba(147, 197, 253, 0.65)');
      gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.25)');
      gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // 3. Night Starfield Particle Constellation (500 celestial stars on upper dome)
  const starfieldGeo = useMemo(() => {
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const radius = 42.0;

    for (let i = 0; i < starCount; i++) {
      // Random points on upper hemisphere (Y >= 4m)
      const u = Math.random();
      const v = Math.random() * 0.75 + 0.15; // constrain above horizon
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(v);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Realistic stellar spectral temperatures (white, pale cyan, amber)
      const tempType = Math.random();
      if (tempType < 0.6) {
        colors[i * 3 + 0] = 0.95;
        colors[i * 3 + 1] = 0.97;
        colors[i * 3 + 2] = 1.0;
      } else if (tempType < 0.85) {
        colors[i * 3 + 0] = 0.65;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 1.0; // Cool cyan star
      } else {
        colors[i * 3 + 0] = 1.0;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.55; // Warm golden star
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const starfieldMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    starMaterialRef.current = starfieldMat;
    return () => {
      sunCoronaTexture.dispose();
      moonHaloTexture.dispose();
      starfieldGeo.dispose();
      starfieldMat.dispose();
    };
  }, [sunCoronaTexture, moonHaloTexture, starfieldGeo, starfieldMat]);

  // Compute 3D celestial coordinates from elevation and azimuth
  const celestialPosition = useMemo((): [number, number, number] => {
    const phi = (sunElevation * Math.PI) / 180;
    const theta = (sunAzimuth * Math.PI) / 180;
    const r = 36.0;
    const x = r * Math.cos(phi) * Math.sin(theta);
    const y = Math.max(2.0, r * Math.sin(phi));
    const z = r * Math.cos(phi) * Math.cos(theta);
    return [x, y, z];
  }, [sunElevation, sunAzimuth]);

  // Billboard alignment loop (coronas face camera directly)
  useFrame(({ clock }) => {
    if (sunCoronaRef.current) {
      sunCoronaRef.current.quaternion.copy(camera.quaternion);
    }
    if (moonHaloRef.current) {
      moonHaloRef.current.quaternion.copy(camera.quaternion);
    }
    if (starMaterialRef.current && nightMode) {
      // Subtle atmospheric stellar twinkle
      const t = clock.getElapsedTime();
      starMaterialRef.current.opacity = 0.75 + 0.20 * Math.sin(t * 1.8);
    }
  });

  return (
    <group name="CelestialSkyRig" raycast={() => null}>
      {/* 1. DAYTIME 3D SUN RIG (Visible when !nightMode) */}
      {!nightMode && (
        <group ref={sunGroupRef} position={celestialPosition}>
          {/* Luminous Sun Disc Sphere */}
          <mesh>
            <sphereGeometry args={[1.25, 24, 24]} />
            <meshBasicMaterial color={activeConfig.sunDiscColor} />
          </mesh>

          {/* Camera-Facing Atmospheric Sun Corona Billboard */}
          <mesh ref={sunCoronaRef}>
            <planeGeometry args={[5.5, 5.5]} />
            <meshBasicMaterial
              map={sunCoronaTexture}
              color={activeConfig.sunCoronaColor}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 2. NIGHTTIME 3D MOON RIG & TWINKLING STARFIELD (Visible when nightMode) */}
      {nightMode && (
        <>
          {/* Luminous Silver-Blue Moon Disc */}
          <group ref={moonGroupRef} position={celestialPosition}>
            <mesh>
              <sphereGeometry args={[1.35, 24, 24]} />
              <meshBasicMaterial color={activeConfig.sunDiscColor} />
            </mesh>

            {/* Camera-Facing Soft Lunar Halo Billboard */}
            <mesh ref={moonHaloRef}>
              <planeGeometry args={[6.8, 6.8]} />
              <meshBasicMaterial
                map={moonHaloTexture}
                color={activeConfig.sunCoronaColor}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>

          {/* Deep Deccan Night Starfield Constellation */}
          <points geometry={starfieldGeo} material={starfieldMat} frustumCulled={false} />
        </>
      )}
    </group>
  );
};


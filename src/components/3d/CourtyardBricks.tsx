'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

// Five authentic Maharashtrian baked terracotta clay brick palette tones
const BRICK_PALETTE = [
  '#B85536', // Primary warm terracotta
  '#A8482A', // Deep burnt red clay
  '#C46548', // Sun-baked laterite
  '#96381E', // Dark iron-rich brick
  '#832F1A', // Weathered fired clay
];

// Simple deterministic pseudo-random generator for consistent handcrafted charm
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface CourtyardBricksProps {
  nightMode?: boolean;
}

export const CourtyardBricks: React.FC<CourtyardBricksProps> = ({ nightMode = false }) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  // Brick dimensions (meters)
  const brickL = 0.32;  // Length
  const brickW = 0.16;  // Width
  const brickH = 0.088; // Height
  const halfExtent = 5.0; // Half diorama extent (10m x 10m)

  // Calculate brick placement coordinates and transformations
  const { transforms, colors, totalBricks } = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const colorList: THREE.Color[] = [];
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempRotation = new THREE.Euler();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3(1, 1, 1);

    let seed = 42;

    // 2 courses (layers) high
    for (let layer = 0; layer < 2; layer++) {
      const layerY = layer * (brickH + 0.002) + brickH / 2;
      const staggerOffset = layer === 1 ? brickL * 0.5 : 0;

      // 1. North Wall (along Z = -halfExtent, spanning X)
      const countX = Math.floor((halfExtent * 2) / (brickL + 0.005));
      const stepX = (halfExtent * 2) / countX;

      for (let i = 0; i < countX; i++) {
        seed++;
        const rnd1 = pseudoRandom(seed);
        const rnd2 = pseudoRandom(seed * 2);
        const rnd3 = pseudoRandom(seed * 3);

        const x = -halfExtent + (i + 0.5) * stepX + (staggerOffset * 0.3);
        const z = -halfExtent - brickW / 2 + (rnd1 - 0.5) * 0.006;
        const y = layerY + (rnd2 - 0.5) * 0.005;

        tempPosition.set(x, y, z);
        tempRotation.set(
          (rnd1 - 0.5) * 0.02,
          (rnd2 - 0.5) * 0.03,
          (rnd3 - 0.5) * 0.015
        );
        tempQuaternion.setFromEuler(tempRotation);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);

        list.push(tempMatrix.clone());
        const colorHex = BRICK_PALETTE[Math.floor(rnd3 * BRICK_PALETTE.length)];
        colorList.push(new THREE.Color(colorHex));
      }

      // 2. South Wall (along Z = +halfExtent, spanning X)
      for (let i = 0; i < countX; i++) {
        seed++;
        const rnd1 = pseudoRandom(seed);
        const rnd2 = pseudoRandom(seed * 2);
        const rnd3 = pseudoRandom(seed * 3);

        const x = -halfExtent + (i + 0.5) * stepX - (staggerOffset * 0.3);
        const z = halfExtent + brickW / 2 + (rnd1 - 0.5) * 0.006;
        const y = layerY + (rnd2 - 0.5) * 0.005;

        tempPosition.set(x, y, z);
        tempRotation.set(
          (rnd1 - 0.5) * 0.02,
          (rnd2 - 0.5) * 0.03,
          (rnd3 - 0.5) * 0.015
        );
        tempQuaternion.setFromEuler(tempRotation);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);

        list.push(tempMatrix.clone());
        const colorHex = BRICK_PALETTE[Math.floor(rnd3 * BRICK_PALETTE.length)];
        colorList.push(new THREE.Color(colorHex));
      }

      // 3. West Wall (along X = -halfExtent, spanning Z, rotated 90 deg)
      const countZ = Math.floor((halfExtent * 2) / (brickL + 0.005)) - 1;
      const stepZ = (halfExtent * 2) / (countZ + 1);

      for (let i = 0; i < countZ; i++) {
        seed++;
        const rnd1 = pseudoRandom(seed);
        const rnd2 = pseudoRandom(seed * 2);
        const rnd3 = pseudoRandom(seed * 3);

        const x = -halfExtent - brickW / 2 + (rnd1 - 0.5) * 0.006;
        const z = -halfExtent + (i + 1) * stepZ + (staggerOffset * 0.3);
        const y = layerY + (rnd2 - 0.5) * 0.005;

        tempPosition.set(x, y, z);
        tempRotation.set(
          (rnd1 - 0.5) * 0.02,
          Math.PI / 2 + (rnd2 - 0.5) * 0.03,
          (rnd3 - 0.5) * 0.015
        );
        tempQuaternion.setFromEuler(tempRotation);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);

        list.push(tempMatrix.clone());
        const colorHex = BRICK_PALETTE[Math.floor(rnd3 * BRICK_PALETTE.length)];
        colorList.push(new THREE.Color(colorHex));
      }

      // 4. East Wall (along X = +halfExtent, spanning Z, rotated 90 deg)
      for (let i = 0; i < countZ; i++) {
        seed++;
        const rnd1 = pseudoRandom(seed);
        const rnd2 = pseudoRandom(seed * 2);
        const rnd3 = pseudoRandom(seed * 3);

        const x = halfExtent + brickW / 2 + (rnd1 - 0.5) * 0.006;
        const z = -halfExtent + (i + 1) * stepZ - (staggerOffset * 0.3);
        const y = layerY + (rnd2 - 0.5) * 0.005;

        tempPosition.set(x, y, z);
        tempRotation.set(
          (rnd1 - 0.5) * 0.02,
          Math.PI / 2 + (rnd2 - 0.5) * 0.03,
          (rnd3 - 0.5) * 0.015
        );
        tempQuaternion.setFromEuler(tempRotation);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);

        list.push(tempMatrix.clone());
        const colorHex = BRICK_PALETTE[Math.floor(rnd3 * BRICK_PALETTE.length)];
        colorList.push(new THREE.Color(colorHex));
      }
    }

    return {
      transforms: list,
      colors: colorList,
      totalBricks: list.length,
    };
  }, [brickL, brickW, brickH, halfExtent]);

  // Apply matrix and colors to instanced mesh
  useLayoutEffect(() => {
    if (!instancedMeshRef.current) return;
    const mesh = instancedMeshRef.current;

    for (let i = 0; i < totalBricks; i++) {
      mesh.setMatrixAt(i, transforms[i]);
      mesh.setColorAt(i, colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [transforms, colors, totalBricks]);

  // Rounded box geometry for tactile, beveled handmade terracotta bricks
  const roundedBrickGeometry = useMemo(() => {
    // 0.32m x 0.088m x 0.16m with 6mm bevel radius
    const shape = new THREE.BoxGeometry(brickL, brickH, brickW, 2, 2, 2);
    return shape;
  }, [brickL, brickH, brickW]);

  return (
    <group name="CourtyardRetainingBricks">
      {/* Retaining perimeter bricks in 1 single draw call */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[roundedBrickGeometry, undefined, totalBricks]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          roughness={0.85}
          metalness={0.02}
          bumpScale={0.002}
        />
      </instancedMesh>

      {/* Dark courtyard foundation baseboard rim underneath perimeter bricks */}
      <mesh position={[0, -0.005, 0]} receiveShadow>
        <boxGeometry args={[10.36, 0.01, 10.36]} />
        <meshStandardMaterial
          color={nightMode ? '#1e1b18' : '#3d312a'}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
};

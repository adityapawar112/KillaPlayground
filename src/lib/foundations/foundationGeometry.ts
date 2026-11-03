import * as THREE from 'three';
import { FoundationSlab } from '../state/useEditorStore';

/**
 * Procedural buffer geometry generator for rectangular stone foundation slabs.
 * Partitions geometry into:
 * - Group 0: Perimeter vertical faces (+X, -X, +Z, -Z) and bottom (-Y) face
 *   mapped to mossy_stone_brick_128x128_pbr (Material Index 0).
 * - Group 1: Horizontal top face (+Y) mapped to dark_stone_floor_128x128_pbr (Material Index 1).
 * UVs are scaled using the slab's tilingRepeat multiplier for crisp retro texture resolution.
 */
export function generateFoundationBufferGeometry(slab: FoundationSlab): THREE.BufferGeometry {
  const L = Math.max(0.05, slab.length);
  const W = Math.max(0.05, slab.width);
  const H = Math.max(0.05, slab.height);
  const T = Math.max(0.5, slab.tilingRepeat || 3.0);

  const hw = L / 2;
  const hh = H / 2;
  const hd = W / 2;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let vertexOffset = 0;

  const addFace = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    norm: [number, number, number],
    uScale: number,
    vScale: number
  ) => {
    positions.push(...p0, ...p1, ...p2, ...p3);
    for (let i = 0; i < 4; i++) {
      normals.push(...norm);
    }
    uvs.push(
      0, 0,
      uScale, 0,
      uScale, vScale,
      0, vScale
    );
    indices.push(
      vertexOffset, vertexOffset + 1, vertexOffset + 2,
      vertexOffset, vertexOffset + 2, vertexOffset + 3
    );
    vertexOffset += 4;
  };

  // 1. Group 0: Perimeter Side Faces (+X, -X, +Z, -Z) and Bottom Face (-Y)
  // Face +X (Right side)
  addFace([hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd], [1, 0, 0], W * T, H * T);
  // Face -X (Left side)
  addFace([-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd], [-1, 0, 0], W * T, H * T);
  // Face +Z (Front side)
  addFace([-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd], [0, 0, 1], L * T, H * T);
  // Face -Z (Back side)
  addFace([hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd], [0, 0, -1], L * T, H * T);
  // Face -Y (Bottom face)
  addFace([-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd], [0, -1, 0], L * T, W * T);

  const group0IndexCount = indices.length; // 5 faces * 6 indices = 30 indices

  // 2. Group 1: Top Face (+Y)
  // Face +Y (Top deck)
  addFace([-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd], [0, 1, 0], L * T, W * T);

  const group1IndexCount = indices.length - group0IndexCount; // 1 face * 6 indices = 6 indices

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  // Assign Multi-Material Groups: Group 0 (Sides/Bottom) & Group 1 (Top Deck)
  geometry.addGroup(0, group0IndexCount, 0);
  geometry.addGroup(group0IndexCount, group1IndexCount, 1);

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}


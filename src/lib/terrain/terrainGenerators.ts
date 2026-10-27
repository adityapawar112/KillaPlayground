import { createNoise2D } from 'simplex-noise';
import {
  TERRAIN_RESOLUTION,
  TERRAIN_SIZE,
  HALF_TERRAIN_SIZE,
  STATE_CHANNELS,
  gridToWorld,
} from './terrainBuffer';

export interface FreeformOptions {
  seed?: number;
  elevation?: number;        // peak elevation (0.5 to 2.5m)
  tablelandWidth?: number;   // summit plateau extent (2.0 to 7.5m)
  cliffSteepness?: number;   // cliff drop power (3.0 to 8.0)
  roughness?: number;        // surface crag strength (0.0 to 1.0)
  waterLevel?: number;       // base water level (0.0 to 0.45m)
}

// Simple seeded PRNG for simplex-noise
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Procedural Terrain Generators for Killa Playground Blueprints:
 * Expansive grand-scale tableland plateaus designed for building fort structures,
 * ramparts, bastions, figurines, and splines.
 *
 * - raigad: Vast Balekilla royal tableland plateau, Takmak Tok cliff spur, sheer rock faces
 * - sinhagad: Grand mountain tableland with wide bastionknolls, saddle pass, and broad building deck
 * - janjira: Expansive sea fortress island plateau with 19-bastion perimeter and coastal water moat
 * - pratapgad: Double-tiered hill fort with steep Jawali forest slopes
 * - vijaydurg: Triple naval ramparts on coastal Konkan sea
 * - scratch / freeform: Fully customizable procedural plateau with adjustable tableland, elevation & water
 */
export function generateTerrainBlueprint(
  templateId: string,
  buffer: Float32Array,
  freeformOpts?: FreeformOptions
): void {
  const seed = freeformOpts?.seed ?? 42;
  const prng = mulberry32(seed);
  const noise2D = createNoise2D(prng);

  for (let iz = 0; iz < TERRAIN_RESOLUTION; iz++) {
    for (let ix = 0; ix < TERRAIN_RESOLUTION; ix++) {
      const idx = (iz * TERRAIN_RESOLUTION + ix) * STATE_CHANNELS;
      const { x, z } = gridToWorld(ix, iz);

      // Distance from retaining brick boundary (5.0m half-extent)
      const distFromEdgeX = HALF_TERRAIN_SIZE - Math.abs(x);
      const distFromEdgeZ = HALF_TERRAIN_SIZE - Math.abs(z);
      const distFromEdge = Math.min(distFromEdgeX, distFromEdgeZ);

      // Smoothstep edge falloff over 0.55m hugging perimeter bricks
      const edgeT = Math.max(0, Math.min(1, distFromEdge / 0.55));
      const edgeMask = edgeT * edgeT * (3 - 2 * edgeT);

      const r = Math.sqrt(x * x + z * z);

      let height = 0.0;
      let wetness = 0.0;
      let locked = 0.0;
      let grass = 0.0;

      if (templateId === 'raigad') {
        // --- RAIGAD FORT: Vast Balekilla Royal Tableland Plateau + Takmak Tok Cliff ---
        const dx = x - 0.3;
        const dz = z - 0.1;
        const plateauBoxDist = Math.max(Math.abs(dx) / 3.2, Math.abs(dz) / 3.2);

        // Broad flat plateau with crisp cliff edges
        const plateauBase = 1.85 / (1.0 + Math.pow(plateauBoxDist, 6.0));

        // Takmak Tok spur extending dramatically to (-3.8, -1.8)
        const spurDx = x - -3.2;
        const spurDz = z - -1.6;
        const spurDist = Math.sqrt(spurDx * spurDx * 1.5 + spurDz * spurDz * 4.0);
        const spur = 1.4 * Math.exp(-spurDist * 0.95);

        // Subtle Sahyadri surface undulation
        const n1 = noise2D(x * 0.35, z * 0.35) * 0.18;
        const n2 = noise2D(x * 1.2, z * 1.2) * 0.06;

        let rawH = plateauBase + spur + n1 + n2;
        if (rawH > 1.5) {
          rawH = 1.5 + (rawH - 1.5) * 0.22;
        }

        height = Math.max(0.0, rawH * edgeMask);
        wetness = height > 1.3 ? 0.08 : Math.max(0.15, 0.55 - height * 0.3);
        grass = height > 0.4 && height < 1.3 && noise2D(x * 1.8, z * 1.8) > 0.3 ? 0.35 : 0.0;

      } else if (templateId === 'sinhagad') {
        // --- SINHAGAD FORT: Grand Mountain Tableland with Wide Bastionknolls ---
        const ridgeAxis = (x + z) * 0.7071;
        const ridgeCross = (x - z) * 0.7071;

        const ridgeDist = Math.abs(ridgeCross) / 2.8;
        const tableland = 1.95 / (1.0 + Math.pow(ridgeDist, 4.5));

        const saddle = 0.45 * Math.exp(-Math.pow(ridgeAxis / 1.6, 2.0));

        const n1 = noise2D(x * 0.4, z * 0.4) * 0.25;
        const n2 = noise2D(x * 1.5, z * 1.5) * 0.08;

        let rawH = tableland - saddle + n1 + n2;
        if (rawH > 1.45) {
          rawH = 1.45 + (rawH - 1.45) * 0.25;
        }

        height = Math.max(0.0, rawH * edgeMask);
        wetness = height > 1.3 ? 0.08 : Math.min(0.65, 0.25 + (1.3 - height) * 0.35);
        grass = height > 0.5 && height < 1.5 && noise2D(x * 1.6, z * 1.6) > 0.25 ? 0.4 : 0.0;

      } else if (templateId === 'janjira') {
        // --- MURUD-JANJIRA: Expansive Coastal Sea Island Fortress Plateau ---
        const islandAngle = Math.atan2(z, x);
        const bastionRipple = Math.sin(islandAngle * 19.0) * 0.16;
        const islandR = 3.4 + bastionRipple;

        const distToIslandEdge = islandR - r;
        const islandMask = 1.0 / (1.0 + Math.exp(-distToIslandEdge * 5.0));

        const n1 = noise2D(x * 0.5, z * 0.5) * 0.12;
        const islandHeight = 1.35 + n1;

        // Central water tank courtyard depression
        const centerTank = 0.55 * Math.exp(-r * r * 1.5);

        height = Math.max(0.02, (islandHeight - centerTank) * islandMask * edgeMask);
        wetness = r > 3.2 ? 0.95 : 0.18;
        grass = height > 0.6 && noise2D(x * 2.0, z * 2.0) > 0.35 ? 0.25 : 0.0;

      } else if (templateId === 'pratapgad') {
        // --- PRATAPGAD FORT: Double-Tiered Sahyadri Ridge Fort ---
        // Upper tier (Balekilla) + Lower tier (Bhavani temple spur)
        const upperDist = Math.sqrt((x - 0.5) ** 2 + (z + 0.5) ** 2) / 2.2;
        const upperTier = 2.0 / (1.0 + Math.pow(upperDist, 5.0));

        const lowerDist = Math.sqrt((x + 1.8) ** 2 + (z - 1.2) ** 2) / 1.8;
        const lowerTier = 1.1 / (1.0 + Math.pow(lowerDist, 4.0));

        const n1 = noise2D(x * 0.4, z * 0.4) * 0.2;
        let rawH = Math.max(upperTier, lowerTier) + n1;
        if (rawH > 1.6) rawH = 1.6 + (rawH - 1.6) * 0.2;

        height = Math.max(0.0, rawH * edgeMask);
        wetness = height > 1.3 ? 0.08 : 0.22;
        grass = height > 0.3 && height < 1.4 ? 0.3 : 0.0;

      } else if (templateId === 'vijaydurg') {
        // --- VIJAYDURG NAVAL FORT: Peninsula Fortress with Sea Ramparts ---
        const penDist = Math.max(Math.abs(x - 0.2) / 3.0, Math.abs(z) / 2.4);
        const penBase = 1.45 / (1.0 + Math.pow(penDist, 5.5));
        const seaMoat = r > 3.5 ? 0.05 : 1.0;

        const n1 = noise2D(x * 0.45, z * 0.45) * 0.15;
        let rawH = (penBase + n1) * seaMoat;
        if (rawH > 1.2) rawH = 1.2 + (rawH - 1.2) * 0.2;

        height = Math.max(0.02, rawH * edgeMask);
        wetness = r > 3.2 ? 0.9 : 0.15;
        grass = height > 0.5 && noise2D(x * 1.5, z * 1.5) > 0.3 ? 0.25 : 0.0;

      } else {
        // --- FREEFORM / SCRATCH: Fully Customizable Procedural Plateau ---
        const elevation = freeformOpts?.elevation ?? 1.45;
        const tablelandWidth = freeformOpts?.tablelandWidth ?? 3.4;
        const cliffSteepness = freeformOpts?.cliffSteepness ?? 5.5;
        const roughness = freeformOpts?.roughness ?? 0.5;

        const boxDist = Math.max(Math.abs(x) / tablelandWidth, Math.abs(z) / tablelandWidth);
        const broadPlateau = elevation / (1.0 + Math.pow(boxDist, cliffSteepness));

        const n1 = noise2D(x * 0.35, z * 0.35) * (0.28 * roughness);
        const n2 = noise2D(x * 1.2, z * 1.2) * (0.12 * roughness);

        let rawH = broadPlateau + n1 + n2;
        const plateauCap = elevation * 0.8;
        if (rawH > plateauCap) {
          rawH = plateauCap + (rawH - plateauCap) * 0.2;
        }

        height = Math.max(0.0, rawH * edgeMask);
        wetness = height > plateauCap ? 0.08 : Math.min(0.7, 0.2 + (plateauCap - height) * 0.3);
        grass = height > 0.4 && height < plateauCap && noise2D(x * 1.5, z * 1.5) > 0.25 ? 0.35 : 0.0;
      }

      buffer[idx + 0] = height;
      buffer[idx + 1] = wetness;
      buffer[idx + 2] = locked;
      buffer[idx + 3] = grass;
    }
  }
}

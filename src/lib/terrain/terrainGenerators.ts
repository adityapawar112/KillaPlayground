import { createNoise2D } from 'simplex-noise';
import {
  TERRAIN_RESOLUTION,
  TERRAIN_SIZE,
  HALF_TERRAIN_SIZE,
  STATE_CHANNELS,
  gridToWorld,
} from './terrainBuffer';

/**
 * Procedural Terrain Generators for Killa Playground Blueprints:
 * Expansive grand-scale tableland plateaus designed for building fort structures,
 * ramparts, bastions, figurines, and splines.
 *
 * - scratch: Broad terraced diorama building tableland (7m x 7m plateau area)
 * - raigad: Vast Balekilla royal tableland plateau, Takmak Tok cliff spur, sheer rock faces
 * - sinhagad: Grand mountain tableland with wide bastionknolls, saddle pass, and broad building deck
 * - janjira: Expansive sea fortress island plateau with 19-bastion perimeter and coastal water moat
 */

export function generateTerrainBlueprint(
  templateId: string,
  buffer: Float32Array
): void {
  const noise2D = createNoise2D();

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
        // Expansive tableland across X in [-2.5, 3.2], Z in [-3.0, 3.0]
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
        // Flatten the building tableland above 1.5m to give a vast flat walkable deck
        if (rawH > 1.5) {
          rawH = 1.5 + (rawH - 1.5) * 0.22;
        }

        height = Math.max(0.0, rawH * edgeMask);

        // Walkable plateau is sunbaked soil; lower gullies hold moisture
        wetness = height > 1.3 ? 0.1 : Math.max(0.2, 0.65 - height * 0.3);
        grass = height > 0.4 && height < 1.3 && noise2D(x * 1.8, z * 1.8) > 0.3 ? 0.35 : 0.0;

      } else if (templateId === 'sinhagad') {
        // --- SINHAGAD FORT: Grand Mountain Tableland with Wide Bastionknolls ---
        // Broad diagonal tableland across the diorama (width > 5.5 meters)
        const ridgeAxis = (x + z) * 0.7071;
        const ridgeCross = (x - z) * 0.7071;

        // Broad flat tableland top (using steep sigmoid curve instead of narrow cone)
        const ridgeDist = Math.abs(ridgeCross) / 2.8;
        const tableland = 1.95 / (1.0 + Math.pow(ridgeDist, 4.5));

        // Kalyan Darwaja gorge / saddle pass
        const saddle = 0.45 * Math.exp(-Math.pow(ridgeAxis / 1.6, 2.0));

        // Bastion hillocks and rocky crags
        const n1 = noise2D(x * 0.4, z * 0.4) * 0.25;
        const n2 = noise2D(x * 1.5, z * 1.5) * 0.08;

        let rawH = tableland - saddle + n1 + n2;
        // Flatten main plateau summit deck for extensive building space
        if (rawH > 1.45) {
          rawH = 1.45 + (rawH - 1.45) * 0.25;
        }

        height = Math.max(0.0, rawH * edgeMask);

        wetness = height > 1.3 ? 0.12 : Math.min(0.75, 0.35 + (1.3 - height) * 0.4);
        grass = height > 0.5 && height < 1.5 && noise2D(x * 1.6, z * 1.6) > 0.25 ? 0.4 : 0.0;

      } else if (templateId === 'janjira') {
        // --- MURUD-JANJIRA: Expansive Coastal Sea Island Fortress Plateau ---
        // Broad island deck covering radius up to 3.7 meters
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

        // Water moat wetness
        wetness = r > 3.2 ? 0.95 : 0.28;
        grass = height > 0.6 && noise2D(x * 2.0, z * 2.0) > 0.35 ? 0.3 : 0.0;

      } else {
        // --- SCRATCH / DEFAULT: Vast Terraced Building Tableland (7m x 7m Deck) ---
        // Broad plateau box distance covering 7m x 7m
        const boxDist = Math.max(Math.abs(x) / 3.4, Math.abs(z) / 3.4);
        const broadPlateau = 1.4 / (1.0 + Math.pow(boxDist, 5.0));

        // Natural terrain terraces
        const n1 = noise2D(x * 0.35, z * 0.35) * 0.22;
        const n2 = noise2D(x * 1.1, z * 1.1) * 0.08;

        let rawH = broadPlateau + n1 + n2;
        // Wide flat building deck between 1.0m and 1.35m
        if (rawH > 1.05) {
          rawH = 1.05 + (rawH - 1.05) * 0.2;
        }

        height = Math.max(0.0, rawH * edgeMask);

        wetness = height > 0.9 ? 0.18 : Math.min(0.8, 0.3 + (0.9 - height) * 0.5);
        grass = height > 0.4 && height < 1.0 && noise2D(x * 1.5, z * 1.5) > 0.3 ? 0.35 : 0.0;
      }

      buffer[idx + 0] = height;
      buffer[idx + 1] = wetness;
      buffer[idx + 2] = locked;
      buffer[idx + 3] = grass;
    }
  }
}

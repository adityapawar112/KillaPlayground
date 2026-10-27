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
 * - scratch: Natural starter mud diorama hill with building plateau & gullies
 * - raigad: High tableland plateau (Balekilla), Takmak Tok spur, and tiered cliffs
 * - sinhagad: Triangular high mountain ridge with crags, bastion knolls, and saddle pass
 * - janjira: Island fortress with surrounding coastal water moat
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

      // Smoothstep edge falloff over 0.75 meters to keep mud inside the retaining bricks
      const edgeT = Math.max(0, Math.min(1, distFromEdge / 0.75));
      const edgeMask = edgeT * edgeT * (3 - 2 * edgeT);

      const r = Math.sqrt(x * x + z * z);

      let height = 0.0;
      let wetness = 0.0;
      let locked = 0.0;
      let grass = 0.0;

      if (templateId === 'raigad') {
        // --- RAIGAD FORT: High flat Balekilla plateau + Takmak Tok spur ---
        // Plateau centered around (0.5, 0.2)
        const dx = x - 0.4;
        const dz = z - 0.2;
        const plateauDist = Math.sqrt(dx * dx * 0.9 + dz * dz * 1.3);

        // Broad high plateau
        const plateau = 1.95 / (1.0 + Math.pow(plateauDist / 2.2, 4.0));

        // Takmak Tok spur jutting towards (-2.8, -1.8)
        const spurDx = x - -2.5;
        const spurDz = z - -1.6;
        const spurDist = Math.sqrt(spurDx * spurDx + spurDz * spurDz * 3.0);
        const spur = 1.35 * Math.exp(-spurDist * 1.2);

        // Craggy cliff noise
        const n1 = noise2D(x * 0.5, z * 0.5) * 0.25;
        const n2 = noise2D(x * 1.4, z * 1.4) * 0.08;

        height = (plateau + spur + n1 + n2) * edgeMask;

        // Plateau is dry sunbaked soil; lower slopes and crevices have moist mud
        wetness = height > 1.3 ? 0.15 : Math.max(0.2, 0.7 - height * 0.35);
        grass = height > 0.4 && height < 1.2 && noise2D(x * 2.0, z * 2.0) > 0.35 ? 0.4 : 0.0;

      } else if (templateId === 'sinhagad') {
        // --- SINHAGAD FORT: High rugged mountain ridge & saddle ---
        // Diagonal ridge from south-west (-2.5, -2.5) to north-east (2.5, 2.5)
        const ridgeAxis = (x + z) * 0.7071;
        const ridgeCross = (x - z) * 0.7071;

        const ridgeBase = 2.15 * Math.exp(-Math.pow(ridgeCross / 1.5, 2.0));
        // Saddle pass dip in the middle
        const saddleDip = 0.65 * Math.exp(-Math.pow(ridgeAxis / 1.2, 2.0));

        // Rugged rocky noise
        const n1 = noise2D(x * 0.6, z * 0.6) * 0.35;
        const n2 = noise2D(x * 1.8, z * 1.8) * 0.12;

        height = Math.max(0, (ridgeBase - saddleDip + n1 + n2) * edgeMask);

        wetness = height > 1.4 ? 0.1 : Math.min(0.8, 0.4 + (1.4 - height) * 0.3);
        grass = height > 0.5 && height < 1.6 && noise2D(x * 1.5, z * 1.5) > 0.2 ? 0.45 : 0.0;

      } else if (templateId === 'janjira') {
        // --- MURUD-JANJIRA: Coastal water moat + 19-bastion island fortress ---
        // Outer water moat (r between 3.2 and 4.7) at height ~0.02
        // Central island (r < 2.8) rising to bastion deck
        const islandAngle = Math.atan2(z, x);
        // 19 bastion lobes around the perimeter
        const bastionRipple = Math.sin(islandAngle * 19.0) * 0.12;
        const islandR = 2.4 + bastionRipple;

        const distToIslandEdge = islandR - r;
        const islandMask = 1.0 / (1.0 + Math.exp(-distToIslandEdge * 4.0));

        const n1 = noise2D(x * 0.8, z * 0.8) * 0.15;
        const islandHeight = 1.25 + n1;

        // Island deck with slight dip in the courtyard tank
        const centerTank = 0.4 * Math.exp(-r * r * 1.8);

        height = Math.max(0.01, (islandHeight - centerTank) * islandMask * edgeMask);

        // High wetness in the moat and coastal wash
        wetness = r > 2.2 ? 0.95 : 0.35;
        grass = height > 0.6 && noise2D(x * 2.2, z * 2.2) > 0.4 ? 0.3 : 0.0;

      } else {
        // --- SCRATCH / DEFAULT: Natural organic starter mud mound & plateau ---
        // Central mound with gentle terraced slopes
        const mound = 1.45 * Math.exp(-r * r / 6.2);

        // 2-octave organic soil noise
        const n1 = noise2D(x * 0.45, z * 0.45) * 0.32;
        const n2 = noise2D(x * 1.2, z * 1.2) * 0.1;

        let rawH = mound + n1 + n2;
        // Upper building plateau flattening (between 0.85m and 1.35m)
        if (rawH > 0.85) {
          rawH = 0.85 + (rawH - 0.85) * 0.42;
        }

        height = Math.max(0.0, rawH * edgeMask);

        // Moisture in low gullies, drier laterite on top
        wetness = height > 0.8 ? 0.22 : Math.min(0.85, 0.35 + (0.8 - height) * 0.55);
        grass = height > 0.35 && height < 0.9 && noise2D(x * 1.6, z * 1.6) > 0.3 ? 0.35 : 0.0;
      }

      buffer[idx + 0] = height;
      buffer[idx + 1] = wetness;
      buffer[idx + 2] = locked;
      buffer[idx + 3] = grass;
    }
  }
}

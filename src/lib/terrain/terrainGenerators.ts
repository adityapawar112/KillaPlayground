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

// Simple seeded PRNG for reproducible simplex noise
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
 * Authentic Sahyadri hill & sea fort topography with organic geology,
 * stepped terraces (Machi), dramatic basalt cliffs (Kada), and expansive
 * flat tablelands (Sada / Balekilla) optimized for placing fort walls,
 * bastions, ramparts, and figurines.
 *
 * - raigad: Crescent Balekilla plateau, Takmak Tok cliff spur, Bhavani Tok, sheer basalt drops
 * - sinhagad: Massive organic mountain tableland with Kalyan Darwaja gorge and Zunjar Machi
 * - janjira: Oval marine island with 19 rounded bastions, dry matte soil/rock, and coastal moat
 * - pratapgad: Double-tiered hill fort with upper Balekilla peak and lower Bhavani temple spur
 * - vijaydurg: Triple-tiered marine peninsula fortress with concentric ramparts
 * - scratch / freeform: Multi-harmonic organic mountain with domain warping and stepped building decks
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

      // Smoothstep edge falloff over 0.5m hugging perimeter bricks
      const edgeT = Math.max(0, Math.min(1, distFromEdge / 0.50));
      const edgeMask = edgeT * edgeT * (3 - 2 * edgeT);

      const r = Math.sqrt(x * x + z * z);
      const theta = Math.atan2(z, x);

      let height = 0.0;
      let wetness = 0.0;
      let locked = 0.0;
      // All blueprints and generators start with bare, clean clay/rock (grass = 0.0).
      // Foliage grass is painted intentionally by the user using the Foliage Brush.
      const grass = 0.0;

      if (templateId === 'raigad') {
        // --- RAIGAD FORT: Organic Crescent Balekilla + Takmak Tok Cliff Spur ---
        const warpX = noise2D(x * 0.35 + 1.2, z * 0.35 - 1.8) * 0.45;
        const warpZ = noise2D(x * 0.35 - 2.4, z * 0.35 + 2.7) * 0.45;
        const wx = x + warpX;
        const wz = z + warpZ;

        const wAngle = Math.atan2(wz, wx);
        const wr = Math.sqrt(wx * wx + wz * wz);

        // Organic crescent shape with wide royal building tableland
        const crescentRadius = 2.7 * (1.0 + 0.22 * Math.cos(wAngle - 0.4) + 0.15 * Math.sin(2.0 * wAngle));
        const normDist = wr / Math.max(0.5, crescentRadius);

        // Broad flat Balekilla summit
        let balekilla = 1.95 / (1.0 + Math.pow(normDist, 5.0));
        if (balekilla > 1.65) {
          balekilla = 1.65 + (balekilla - 1.65) * 0.15; // Flatten summit for building
        }

        // Takmak Tok dramatic narrow rock execution spur pointing north-west to (-3.0, -1.6)
        const spurDx = x - -3.0;
        const spurDz = z - -1.6;
        const spurAxis = (-spurDx * 0.85 - spurDz * 0.52);
        const spurCross = (spurDx * 0.52 - spurDz * 0.85);
        let spur = 0.0;
        if (spurAxis >= -0.8 && spurAxis <= 2.2) {
          const alongFactor = Math.exp(-Math.pow(spurAxis / 1.8, 2.0));
          const crossFactor = Math.exp(-Math.pow(spurCross / 0.42, 2.0));
          spur = 1.55 * alongFactor * crossFactor;
        }

        // Holicha Mal lower assembly ground terrace extending east (1.25m elevation)
        const lowerDx = x - 1.8;
        const lowerDz = z - -0.6;
        const lowerDist = Math.sqrt(lowerDx * lowerDx * 0.8 + lowerDz * lowerDz * 1.4);
        const lowerTerrace = 1.25 / (1.0 + Math.pow(lowerDist / 1.5, 4.0));

        // Subtle Sahyadri crags
        const crags = noise2D(x * 0.8, z * 0.8) * 0.08;
        let rawH = Math.max(balekilla, Math.max(spur, lowerTerrace)) + crags;

        height = Math.max(0.0, rawH * edgeMask);
        wetness = 0.0; // Dry, authentic matte laterite soil

      } else if (templateId === 'sinhagad') {
        // --- SINHAGAD FORT: Triangular Mountain Tableland with Kalyan Darwaja Defile ---
        const warpX = noise2D(x * 0.32 + 2.1, z * 0.32 - 1.4) * 0.45;
        const warpZ = noise2D(x * 0.32 - 1.7, z * 0.32 + 3.1) * 0.45;
        const wx = x + warpX;
        const wz = z + warpZ;

        const wAngle = Math.atan2(wz, wx);
        const wr = Math.sqrt(wx * wx + wz * wz);

        // Triangular mountain profile with broad building deck
        const triRadius = 2.85 * (1.0 + 0.28 * Math.cos(3.0 * wAngle - 0.5) + 0.12 * Math.sin(wAngle));
        const normDist = wr / Math.max(0.5, triRadius);

        let tableland = 1.92 / (1.0 + Math.pow(normDist, 4.8));
        if (tableland > 1.62) {
          tableland = 1.62 + (tableland - 1.62) * 0.16; // Flatten summit plateau
        }

        // Zunjar Machi narrow finger ridge extending south to (0.2, 2.8)
        const machiDx = x - 0.2;
        const machiDz = z - 2.8;
        const machiDist = Math.sqrt(machiDx * machiDx * 3.5 + machiDz * machiDz * 0.7);
        const zunjarMachi = 1.35 * Math.exp(-machiDist * 1.1);

        // Kalyan Darwaja gorge notch (cleft in the cliff edge)
        const gorgeDx = x - -1.8;
        const gorgeDz = z - 1.1;
        const gorgeDist = Math.sqrt(gorgeDx * gorgeDx + gorgeDz * gorgeDz);
        const gorgeCleft = 0.45 * Math.exp(-gorgeDist * 2.2);

        const crags = noise2D(x * 0.75, z * 0.75) * 0.09;
        let rawH = Math.max(tableland, zunjarMachi) - gorgeCleft + crags;

        height = Math.max(0.0, rawH * edgeMask);
        wetness = 0.0; // Dry matte mountain soil

      } else if (templateId === 'janjira') {
        // --- MURUD-JANJIRA: Oval Marine Island with 19 Rounded Bastions ---
        const islandAngle = Math.atan2(z, x);
        // 19 rounded bastions projecting into the water
        const bastionRipple = Math.sin(islandAngle * 19.0) * 0.18;
        // Natural oval island perimeter
        const ovalRadius = 3.35 + Math.cos(islandAngle * 2.0) * 0.35 + bastionRipple;

        const distToIslandEdge = ovalRadius - r;
        const islandMask = 1.0 / (1.0 + Math.exp(-distToIslandEdge * 4.5));

        // Broad fortified interior tableland
        let islandHeight = 1.35 + noise2D(x * 0.4, z * 0.4) * 0.08;
        // Central sweet-water tank (Kasa) courtyard depression
        const centerTank = 0.42 * Math.exp(-r * r * 1.8);

        let rawH = (islandHeight - centerTank) * islandMask;
        height = Math.max(0.02, rawH * edgeMask);

        // Land is 100% dry and matte (wetness = 0.0), eliminating the glossy plastic look!
        // Sea water moat seabed (underwater beyond the island perimeter) is set to 1.0
        wetness = r > 3.6 ? 1.0 : 0.0;

      } else if (templateId === 'pratapgad') {
        // --- PRATAPGAD FORT: Double-Tiered Mountain Fort (Balekilla + Bhavani Machi) ---
        // Tier 1: Upper Balekilla peak perched at (0.4, -0.6)
        const upperDx = x - 0.4;
        const upperDz = z - -0.6;
        const upperAngle = Math.atan2(upperDz, upperDx);
        const upperR = Math.sqrt(upperDx * upperDx + upperDz * upperDz);
        const upperRadius = 1.8 * (1.0 + 0.18 * Math.cos(upperAngle * 2.0));
        let upperTier = 2.05 / (1.0 + Math.pow(upperR / upperRadius, 5.2));
        if (upperTier > 1.7) {
          upperTier = 1.7 + (upperTier - 1.7) * 0.15;
        }

        // Tier 2: Lower Bhavani Temple Spur / Machi at (-1.6, 1.2)
        const lowerDx = x - -1.6;
        const lowerDz = z - 1.2;
        const lowerDist = Math.sqrt(lowerDx * lowerDx * 0.9 + lowerDz * lowerDz * 1.2);
        let lowerTier = 1.28 / (1.0 + Math.pow(lowerDist / 1.6, 4.2));
        if (lowerTier > 1.1) {
          lowerTier = 1.1 + (lowerTier - 1.1) * 0.18;
        }

        // Connecting saddle ramp between tiers
        const rampDx = x - -0.5;
        const rampDz = z - 0.3;
        const rampDist = Math.sqrt(rampDx * rampDx * 1.8 + rampDz * rampDz * 1.8);
        const connectingRamp = 1.35 * Math.exp(-rampDist * 1.2);

        const crags = noise2D(x * 0.7, z * 0.7) * 0.08;
        let rawH = Math.max(upperTier, Math.max(lowerTier, connectingRamp)) + crags;

        height = Math.max(0.0, rawH * edgeMask);
        wetness = 0.0;

      } else if (templateId === 'vijaydurg') {
        // --- VIJAYDURG NAVAL FORT: Concentric Marine Peninsula Fortress ---
        const warpX = noise2D(x * 0.4 + 1.5, z * 0.4 - 2.0) * 0.4;
        const warpZ = noise2D(x * 0.4 - 1.8, z * 0.4 + 1.9) * 0.4;
        const wx = (x - 0.2) + warpX;
        const wz = z + warpZ;

        // Curved peninsula jutting out to sea
        const penRadius = 3.1 + Math.sin(Math.atan2(wz, wx) * 3.0) * 0.35;
        const penDist = Math.sqrt(wx * wx * 0.85 + wz * wz * 1.2) / penRadius;

        // Stepped triple rampart terraces
        let penBase = 1.45 / (1.0 + Math.pow(penDist, 5.0));
        if (penBase > 1.18) {
          penBase = 1.18 + (penBase - 1.18) * 0.15; // Broad building deck
        }

        // Sea moat cut off
        const seaMoat = r > 3.6 ? 0.05 : 1.0;
        let rawH = penBase * seaMoat;

        height = Math.max(0.02, rawH * edgeMask);
        wetness = r > 3.5 ? 1.0 : 0.0; // Dry land, submerged seabed

      } else {
        // --- FREEFORM / SCRATCH: Organic Multi-Harmonic Mountain with Stepped Decks ---
        const elevation = freeformOpts?.elevation ?? 1.45;
        const tablelandWidth = freeformOpts?.tablelandWidth ?? 3.4;
        const cliffSteepness = freeformOpts?.cliffSteepness ?? 5.5;
        const roughness = freeformOpts?.roughness ?? 0.5;

        // Seed-based phase angles for unique organic mountain shapes on every roll
        const phi1 = (seed * 0.137) % (Math.PI * 2);
        const phi2 = (seed * 0.293) % (Math.PI * 2);
        const phi3 = (seed * 0.471) % (Math.PI * 2);

        // Organic perimeter modulation (NO square box math!):
        // - Major mountain ridge elongation (2*theta)
        // - Triangular bastion / spur lobes (3*theta)
        // - Subtle natural crag undulations (5*theta + noise)
        const h1 = Math.sin(2.0 * theta + phi1) * 0.22;
        const h2 = Math.cos(3.0 * theta + phi2) * 0.14;
        const h3 = Math.sin(5.0 * theta + phi3) * 0.08;
        const nWarp = noise2D(x * 0.38 + phi1, z * 0.38 + phi2) * 0.14;

        // Target radius of the summit plateau (typically 1.6m to 2.6m)
        const organicRadius = (tablelandWidth * 0.62) * (1.0 + h1 + h2 + h3 + nWarp);
        const t = r / Math.max(0.6, organicRadius);

        // Smooth plateau dropoff:
        // When t < 0.85: On the summit tableland!
        // When t between 0.85 and 1.35: Steep cliff drop!
        // When t > 1.4: Base level (0)!
        const cliffPower = cliffSteepness * 0.9;
        let mountainH = elevation / (1.0 + Math.pow(Math.max(0.0, (t - 0.2) / 0.8), cliffPower));

        // Broad flat building deck on the summit plateau
        const flatCap = elevation * 0.82;
        if (mountainH > flatCap) {
          mountainH = flatCap + (mountainH - flatCap) * 0.15;
        }

        // Secondary Machi terrace spur:
        // Extends an organic lower shelf (52% elevation) along one flank for stepped fortification building
        const machiAngle = Math.sin(theta + phi2);
        if (machiAngle > 0.20 && t >= 0.70 && t <= 1.42) {
          const machiDist = Math.abs(t - 1.05) / 0.36;
          const machiH = (elevation * 0.52) / (1.0 + Math.pow(machiDist, 4.0));
          mountainH = Math.max(mountainH, machiH);
        }

        // Natural basalt rock crags on slopes; flat decks remain smooth and buildable
        const slopeMask = Math.min(1.0, Math.max(0.0, (1.0 - mountainH / elevation) * 2.0));
        const crags =
          (noise2D(x * 0.8, z * 0.8) * 0.10 + noise2D(x * 2.0, z * 2.0) * 0.04) *
          roughness *
          slopeMask;

        let rawH = mountainH + crags;
        height = Math.max(0.0, rawH * edgeMask);
        wetness = 0.0; // Dry, authentic matte laterite soil
      }

      buffer[idx + 0] = height;
      buffer[idx + 1] = wetness;
      buffer[idx + 2] = locked;
      buffer[idx + 3] = grass;
    }
  }
}

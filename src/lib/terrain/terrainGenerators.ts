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
  tiers?: number;            // stepped mountain terraces: 1, 2, or 3 (default: 2)
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
        // --- RAIGAD FORT: Organic Crescent Balekilla + Natural Takmak Tok Spur ---
        const warpX = noise2D(x * 0.35 + 1.2, z * 0.35 - 1.8) * 0.45;
        const warpZ = noise2D(x * 0.35 - 2.4, z * 0.35 + 2.7) * 0.45;
        const wx = x + warpX;
        const wz = z + warpZ;

        const wAngle = Math.atan2(wz, wx);
        const wr = Math.sqrt(wx * wx + wz * wz);

        // Organic crescent shape with wide royal building tableland
        const crescentRadius = 2.75 * (1.0 + 0.20 * Math.cos(wAngle - 0.4) + 0.12 * Math.sin(2.0 * wAngle));
        const normDist = wr / Math.max(0.5, crescentRadius);

        // Broad flat Balekilla summit
        let balekilla = 1.90 / (1.0 + Math.pow(normDist, 4.8));
        if (balekilla > 1.62) {
          balekilla = 1.62 + (balekilla - 1.62) * 0.12; // Flat buildable summit
        }

        // Takmak Tok: natural continuous spur extending north-westward
        const spurDot = (-x * 0.85 - z * 0.52);
        const spurDistAlong = spurDot - 1.2;
        const spurCross = Math.abs(x * 0.52 - z * 0.85);
        let spur = 0.0;
        if (spurDistAlong > -0.5 && spurDistAlong < 2.4 && spurCross < 1.0) {
          const taper = Math.max(0.0, 1.0 - spurDistAlong / 2.5);
          const widthTaper = 0.65 * (0.8 + 0.2 * taper);
          const crossFalloff = Math.exp(-Math.pow(spurCross / widthTaper, 2.5));
          const spurH = (1.60 - spurDistAlong * 0.14) * crossFalloff * taper;
          spur = Math.max(0.0, spurH);
        }

        // Holicha Mal lower assembly ground terrace extending east (1.20m elevation)
        const lowerDx = x - 1.8;
        const lowerDz = z - -0.5;
        const lowerDist = Math.sqrt(lowerDx * lowerDx * 0.9 + lowerDz * lowerDz * 1.3);
        const lowerTerrace = 1.22 / (1.0 + Math.pow(lowerDist / 1.5, 4.0));

        // Subtle Sahyadri rock crags
        const crags = noise2D(x * 0.8, z * 0.8) * 0.07;
        let rawH = Math.max(balekilla, Math.max(spur, lowerTerrace)) + crags;

        height = Math.max(0.0, rawH * edgeMask);
        wetness = 0.0; // Clean dry soil and basalt substrate (no blue water paint)

      } else if (templateId === 'sinhagad') {
        // --- SINHAGAD FORT: Triangular Mountain Tableland with Kalyan Darwaja Saddle ---
        const warpX = noise2D(x * 0.32 + 2.1, z * 0.32 - 1.4) * 0.45;
        const warpZ = noise2D(x * 0.32 - 1.7, z * 0.32 + 3.1) * 0.45;
        const wx = x + warpX;
        const wz = z + warpZ;

        const wAngle = Math.atan2(wz, wx);
        const wr = Math.sqrt(wx * wx + wz * wz);

        // Triangular mountain profile with broad building deck
        const triRadius = 2.80 * (1.0 + 0.24 * Math.cos(3.0 * wAngle - 0.5) + 0.10 * Math.sin(wAngle));
        const normDist = wr / Math.max(0.5, triRadius);

        let tableland = 1.90 / (1.0 + Math.pow(normDist, 4.8));
        if (tableland > 1.62) {
          tableland = 1.62 + (tableland - 1.62) * 0.14; // Flatten summit plateau
        }

        // Zunjar Machi narrow defensive finger ridge extending south to (0.2, 2.6)
        const machiDx = x - 0.2;
        const machiDz = z - 2.6;
        const machiDist = Math.sqrt(machiDx * machiDx * 3.0 + machiDz * machiDz * 0.8);
        const zunjarMachi = 1.35 * Math.exp(-machiDist * 1.0);

        // Kalyan Darwaja: smooth, natural U-shaped pass / saddle on the west ridge (NO sharp clefts!)
        const passDx = x - -1.8;
        const passDz = z - 1.0;
        const passDist = Math.sqrt(passDx * passDx + passDz * passDz);
        const passDip = 0.22 * Math.exp(-Math.pow(passDist / 0.85, 2.0));

        const crags = noise2D(x * 0.75, z * 0.75) * 0.07;
        let rawH = Math.max(tableland - passDip, zunjarMachi) + crags;

        height = Math.max(0.0, rawH * edgeMask);
        wetness = 0.0; // Clean dry soil and basalt substrate (no blue water paint)

      } else if (templateId === 'janjira') {
        // --- MURUD-JANJIRA: Oval Marine Island Fortress (100% Dry Rock/Soil, No Inbuilt Water) ---
        const islandAngle = Math.atan2(z, x);
        // Low-frequency harmonic bastion perimeter bulges (no high-frequency jagged aliasing)
        const bastionBulge = Math.cos(islandAngle * 8.0) * 0.08 + Math.sin(islandAngle * 4.0) * 0.06;
        const ovalRadius = 3.20 + Math.cos(islandAngle * 2.0) * 0.35 + bastionBulge;

        // Smooth sigmoidal cliff drop into sea moat
        const distFromCenter = r / ovalRadius;
        let islandDeck = 1.25 / (1.0 + Math.pow(distFromCenter, 6.0));
        if (islandDeck > 1.05) {
          islandDeck = 1.05 + (islandDeck - 1.05) * 0.10; // Flat fortified interior court
        }

        // Central sweet-water cistern (Kasa) courtyard depression
        const centerTank = 0.28 * Math.exp(-r * r * 1.4);

        // Smooth seabed slope under the 3D water plane (waterLevel = 0.22m)
        const seabed = 0.06;
        let rawH = Math.max(seabed, islandDeck - centerTank);

        height = Math.max(0.02, rawH * edgeMask);
        wetness = 0.0; // Submerged terrain is natural earth/sand, 3D WaterPlane provides water

      } else if (templateId === 'pratapgad') {
        // --- PRATAPGAD FORT: Double-Tiered Mountain Fort (Balekilla + Bhavani Machi) ---
        // Tier 1: Upper Balekilla peak perched at (0.4, -0.6)
        const upperDx = x - 0.4;
        const upperDz = z - -0.6;
        const upperAngle = Math.atan2(upperDz, upperDx);
        const upperR = Math.sqrt(upperDx * upperDx + upperDz * upperDz);
        const upperRadius = 1.8 * (1.0 + 0.15 * Math.cos(upperAngle * 2.0));
        let upperTier = 2.00 / (1.0 + Math.pow(upperR / upperRadius, 5.0));
        if (upperTier > 1.68) {
          upperTier = 1.68 + (upperTier - 1.68) * 0.14;
        }

        // Tier 2: Lower Bhavani Temple Spur / Machi at (-1.6, 1.2)
        const lowerDx = x - -1.6;
        const lowerDz = z - 1.2;
        const lowerDist = Math.sqrt(lowerDx * lowerDx * 0.9 + lowerDz * lowerDz * 1.2);
        let lowerTier = 1.25 / (1.0 + Math.pow(lowerDist / 1.6, 4.2));
        if (lowerTier > 1.08) {
          lowerTier = 1.08 + (lowerTier - 1.08) * 0.15;
        }

        // Smooth connecting saddle ramp between tiers
        const rampDx = x - -0.5;
        const rampDz = z - 0.3;
        const rampDist = Math.sqrt(rampDx * rampDx * 1.5 + rampDz * rampDz * 1.5);
        const connectingRamp = 1.30 * Math.exp(-rampDist * 1.2);

        const crags = noise2D(x * 0.7, z * 0.7) * 0.07;
        let rawH = Math.max(upperTier, Math.max(lowerTier, connectingRamp)) + crags;

        height = Math.max(0.0, rawH * edgeMask);
        wetness = 0.0; // Dry matte mountain soil

      } else if (templateId === 'vijaydurg') {
        // --- VIJAYDURG NAVAL FORT: Concentric Marine Peninsula (No Cliff Cuts, No Inbuilt Water) ---
        const warpX = noise2D(x * 0.35 + 1.5, z * 0.35 - 2.0) * 0.35;
        const warpZ = noise2D(x * 0.35 - 1.8, z * 0.35 + 1.9) * 0.35;
        const wx = (x - 0.2) + warpX;
        const wz = z + warpZ;

        // Curved peninsula projecting out into the Arabian Sea
        const penRadius = 3.20 + Math.sin(Math.atan2(wz, wx) * 2.0) * 0.28;
        const penDist = Math.sqrt(wx * wx * 0.80 + wz * wz * 1.15) / penRadius;

        // Smooth stepped triple rampart terraces dipping into the sea:
        let penBase = 1.35 / (1.0 + Math.pow(penDist, 4.5));
        if (penBase > 1.15) {
          penBase = 1.15 + (penBase - 1.15) * 0.12; // Flat building deck
        }

        // Smooth seabed slope under the 3D water plane (waterLevel = 0.20m), NO sudden cookie-cutter cut!
        const seabed = 0.06;
        let rawH = Math.max(seabed, penBase);

        height = Math.max(0.02, rawH * edgeMask);
        wetness = 0.0; // Submerged terrain is natural earth/sand, 3D WaterPlane provides water

      } else {
        // --- FREEFORM / SCRATCH: Organic Multi-Harmonic Mountain with Stepped Decks ---
        const elevation = freeformOpts?.elevation ?? 1.45;
        const tablelandWidth = freeformOpts?.tablelandWidth ?? 3.4;
        const cliffSteepness = freeformOpts?.cliffSteepness ?? 5.5;
        const roughness = freeformOpts?.roughness ?? 0.5;
        const tiers = Math.max(1, Math.min(3, Math.round(freeformOpts?.tiers ?? 2)));

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

        const cliffPower = cliffSteepness * 0.9;
        let mountainH = 0.0;

        if (tiers === 1) {
          // Single-Tier Summit: One grand central tableland sloping down to courtyard
          mountainH = elevation / (1.0 + Math.pow(Math.max(0.0, (t - 0.20) / 0.80), cliffPower));
        } else if (tiers === 2) {
          // Dual-Tier Fort: High royal Balekilla peak + expansive lower Machi terrace shelf
          // Upper Balekilla drops at t ~ 0.55
          const step1 = (elevation * 0.48) / (1.0 + Math.pow(Math.max(0.0, (t - 0.15) / 0.52), cliffPower));
          // Lower Machi terrace extends outward organically along theta
          const machiMod = 1.0 + 0.22 * Math.cos(theta + phi2);
          const tLower = 1.18 * machiMod;
          const step2 = (elevation * 0.52) / (1.0 + Math.pow(Math.max(0.0, (t - 0.30) / Math.max(0.2, tLower - 0.30)), cliffPower * 0.9));
          mountainH = step1 + step2;
        } else {
          // Triple-Tier Fort: Royal Balekilla + Middle Machi shelf + Lower concentric defensive terrace
          const step1 = (elevation * 0.34) / (1.0 + Math.pow(Math.max(0.0, (t - 0.12) / 0.38), cliffPower));
          const step2 = (elevation * 0.33) / (1.0 + Math.pow(Math.max(0.0, (t - 0.25) / 0.70), cliffPower * 0.9));
          const machiMod = 1.0 + 0.20 * Math.cos(theta + phi2);
          const tLower = 1.35 * machiMod;
          const step3 = (elevation * 0.33) / (1.0 + Math.pow(Math.max(0.0, (t - 0.40) / Math.max(0.2, tLower - 0.40)), cliffPower * 0.85));
          mountainH = step1 + step2 + step3;
        }

        // Broad flat building deck on the summit plateau
        const flatCap = elevation * 0.82;
        if (mountainH > flatCap) {
          mountainH = flatCap + (mountainH - flatCap) * 0.15;
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

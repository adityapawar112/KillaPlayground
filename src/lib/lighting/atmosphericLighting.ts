/**
 * Atmospheric Lighting & Solar Cycle Engine
 * Ticket 10 & 11: Festive Lighting Studio & Viewport Atmosphere
 *
 * Implements 5 high-fidelity, zero-cost lighting & atmospheric techniques:
 * 1. Dynamic Color Temperature Grading across 24-hr solar arc (Dawn, Noon, Golden Hour, Night).
 * 2. Dynamic Atmospheric Sky Dome & Gradient (CSS backdrop + 3D Horizon Haze).
 * 3. ACESFilmic Tone Mapping & Exposure Calibration (prevents color burn, enriches mud & flame).
 * 4. Mud Ground Bounce Indirect Radiance (Zero-Cost GI from reddish laterite clay).
 * 5. Deccan Plateau Atmospheric Mist / Depth Fog (Exp2 fog blending diorama horizon).
 */

export interface AtmosphericLightingConfig {
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  bounceColor: string;
  bounceIntensity: number;
  bouncePosition: [number, number, number];
  ambientColor: string;
  ambientIntensity: number;
  hemisphereSkyColor: string;
  hemisphereGroundColor: string;
  hemisphereIntensity: number;
  fogColor: string;
  fogDensity: number;
  toneMappingExposure: number;
  skyGradient: string;
  sunDiscColor: string;
  sunCoronaColor: string;
  gridCellColor: string;
  gridSectionColor: string;
  isNight: boolean;
  phaseName: 'Dawn' | 'Noon' | 'Golden Hour' | 'Dusk' | 'Diwali Night';
}

interface LightingKeyframe {
  hour: number;
  sunColor: string;
  sunIntensity: number;
  bounceColor: string;
  bounceIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  fogColor: string;
  fogDensity: number;
  exposure: number;
  skyGradient: string;
  sunDiscColor: string;
  sunCoronaColor: string;
  gridCell: string;
  gridSection: string;
  isNight: boolean;
  phaseName: 'Dawn' | 'Noon' | 'Golden Hour' | 'Dusk' | 'Diwali Night';
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clampR = Math.max(0, Math.min(255, Math.round(r)));
  const clampG = Math.max(0, Math.min(255, Math.round(g)));
  const clampB = Math.max(0, Math.min(255, Math.round(b)));
  return `#${((1 << 24) + (clampR << 16) + (clampG << 8) + clampB).toString(16).slice(1)}`;
}

export function lerpColor(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// 7 Master Keyframes across the 24-hour Diurnal Cycle
const KEYFRAMES: LightingKeyframe[] = [
  // 00:00 - Midnight
  {
    hour: 0.0,
    sunColor: '#93C5FD',
    sunIntensity: 0.35,
    bounceColor: '#1E1B4B',
    bounceIntensity: 0.12,
    ambientColor: '#080D1A',
    ambientIntensity: 0.22,
    hemiSky: '#0F172A',
    hemiGround: '#050814',
    hemiIntensity: 0.22,
    fogColor: '#050814',
    fogDensity: 0.010,
    exposure: 1.10,
    skyGradient: 'radial-gradient(ellipse at 50% 10%, #0B132B 0%, #070B19 45%, #020617 80%, #000000 100%)',
    sunDiscColor: '#E0F2FE',
    sunCoronaColor: '#93C5FD',
    gridCell: '#1E2438',
    gridSection: '#2F3B58',
    isNight: true,
    phaseName: 'Diwali Night',
  },
  // 05:00 - Pre-Dawn Twilight
  {
    hour: 5.0,
    sunColor: '#A5B4FC',
    sunIntensity: 0.45,
    bounceColor: '#312E81',
    bounceIntensity: 0.18,
    ambientColor: '#1E1B4B',
    ambientIntensity: 0.28,
    hemiSky: '#1E293B',
    hemiGround: '#0F172A',
    hemiIntensity: 0.28,
    fogColor: '#0F172A',
    fogDensity: 0.011,
    exposure: 1.12,
    skyGradient: 'radial-gradient(ellipse at 50% 100%, #312E81 0%, #1E1B4B 35%, #0F172A 70%, #020617 100%)',
    sunDiscColor: '#C7D2FE',
    sunCoronaColor: '#818CF8',
    gridCell: '#232A42',
    gridSection: '#374151',
    isNight: true,
    phaseName: 'Diwali Night',
  },
  // 06:00 - Dawn (Soft Rose-Gold Morning Sunlight & Long Ethereal Shadows)
  {
    hour: 6.0,
    sunColor: '#FDBA74', // Warm peach rose-gold
    sunIntensity: 1.45,
    bounceColor: '#FDBA74', // Warm morning fill
    bounceIntensity: 0.45,
    ambientColor: '#475569', // Cool slate morning sky
    ambientIntensity: 0.55,
    hemiSky: '#94A3B8',
    hemiGround: '#B45309', // Warm laterite mud
    hemiIntensity: 0.55,
    fogColor: '#FED7AA', // Peach dawn horizon mist
    fogDensity: 0.005,
    exposure: 1.18,
    skyGradient: 'radial-gradient(ellipse at 50% 100%, #FED7AA 0%, #FCA5A5 25%, #475569 65%, #1E293B 100%)',
    sunDiscColor: '#FFF3E0',
    sunCoronaColor: '#FDBA74',
    gridCell: '#D8C09D',
    gridSection: '#B58B63',
    isNight: false,
    phaseName: 'Dawn',
  },
  // 12:00 - Solar Noon (Crisp White-Gold Sunlight & Maximum Clarity)
  {
    hour: 12.0,
    sunColor: '#FFFDF0', // Crisp solar white-gold
    sunIntensity: 1.60,
    bounceColor: '#FED7AA', // Warm courtyard mud radiance
    bounceIntensity: 0.45,
    ambientColor: '#E0F2FE', // Open airy blue sky ambient
    ambientIntensity: 0.65,
    hemiSky: '#BAE6FD',
    hemiGround: '#9A3412',
    hemiIntensity: 0.55,
    fogColor: '#F1F5F9', // Pale sunlit mist
    fogDensity: 0.003,
    exposure: 1.20,
    skyGradient: 'radial-gradient(ellipse at 50% 0%, #7DD3FC 0%, #BAE6FD 35%, #E0F2FE 70%, #F9F6F0 100%)',
    sunDiscColor: '#FFFDF5',
    sunCoronaColor: '#FEF3C7',
    gridCell: '#E4D8C8',
    gridSection: '#C8B8A4',
    isNight: false,
    phaseName: 'Noon',
  },
  // 17:30 - Golden Hour (Blazing Saffron/Orange Sunlight & Twilight Indigo Shadows)
  {
    hour: 17.5,
    sunColor: '#FB923C', // Fiery sunset saffron
    sunIntensity: 1.85,
    bounceColor: '#EA580C', // Saturated laterite clay upward GI
    bounceIntensity: 0.60,
    ambientColor: '#3730A3', // Complementary twilight indigo ambient
    ambientIntensity: 0.50,
    hemiSky: '#4338CA', // Indigo sky
    hemiGround: '#C2410C', // Terracotta earth
    hemiIntensity: 0.60,
    fogColor: '#9A3412', // Fiery Deccan sunset dust
    fogDensity: 0.006,
    exposure: 1.25,
    skyGradient: 'radial-gradient(ellipse at 50% 100%, #EA580C 0%, #C2410C 30%, #4338CA 65%, #1E1B4B 85%, #0F172A 100%)',
    sunDiscColor: '#FF9A3C',
    sunCoronaColor: '#EA580C',
    gridCell: '#8C583F',
    gridSection: '#5C3826',
    isNight: false,
    phaseName: 'Golden Hour',
  },
  // 18.8 - Dusk / Sunset Afterglow
  {
    hour: 18.8,
    sunColor: '#C084FC', // Violet-rose afterglow
    sunIntensity: 0.85,
    bounceColor: '#9A3412',
    bounceIntensity: 0.28,
    ambientColor: '#1E1B4B',
    ambientIntensity: 0.32,
    hemiSky: '#312E81',
    hemiGround: '#431407',
    hemiIntensity: 0.35,
    fogColor: '#1E1B4B',
    fogDensity: 0.010,
    exposure: 1.15,
    skyGradient: 'radial-gradient(ellipse at 50% 100%, #9A3412 0%, #4338CA 40%, #1E1B4B 70%, #080D1A 100%)',
    sunDiscColor: '#E879F9',
    sunCoronaColor: '#C084FC',
    gridCell: '#3B2F4C',
    gridSection: '#4F3E66',
    isNight: false,
    phaseName: 'Dusk',
  },
  // 21:00 - Diwali Night (Silver-Blue Moonlight, Indigo Sky & Glowing Diyas)
  {
    hour: 21.0,
    sunColor: '#93C5FD', // Luminous silver-blue moonlight
    sunIntensity: 0.38,
    bounceColor: '#1E1B4B',
    bounceIntensity: 0.14,
    ambientColor: '#080D1A',
    ambientIntensity: 0.22,
    hemiSky: '#0F172A',
    hemiGround: '#050814',
    hemiIntensity: 0.24,
    fogColor: '#050814',
    fogDensity: 0.010,
    exposure: 1.10,
    skyGradient: 'radial-gradient(ellipse at 50% 0%, #0B132B 0%, #070B19 45%, #020617 80%, #000000 100%)',
    sunDiscColor: '#E0F2FE',
    sunCoronaColor: '#93C5FD',
    gridCell: '#1E2438',
    gridSection: '#2F3B58',
    isNight: true,
    phaseName: 'Diwali Night',
  },
  // 24:00 - Midnight (wraps seamlessly to hour 0.0)
  {
    hour: 24.0,
    sunColor: '#93C5FD',
    sunIntensity: 0.35,
    bounceColor: '#1E1B4B',
    bounceIntensity: 0.12,
    ambientColor: '#080D1A',
    ambientIntensity: 0.22,
    hemiSky: '#0F172A',
    hemiGround: '#050814',
    hemiIntensity: 0.22,
    fogColor: '#050814',
    fogDensity: 0.010,
    exposure: 1.10,
    skyGradient: 'radial-gradient(ellipse at 50% 10%, #0B132B 0%, #070B19 45%, #020617 80%, #000000 100%)',
    sunDiscColor: '#E0F2FE',
    sunCoronaColor: '#93C5FD',
    gridCell: '#1E2438',
    gridSection: '#2F3B58',
    isNight: true,
    phaseName: 'Diwali Night',
  },
];

/**
 * Computes dynamic atmospheric lighting parameters interpolated continuously
 * across time-of-day and respects explicit nightMode state.
 */
export function getAtmosphericLighting(
  timeOfDay: number,
  nightMode: boolean,
  sunElevationDeg = 48,
  sunAzimuthDeg = 55
): AtmosphericLightingConfig {
  // If nightMode is explicitly toggled true but time is daytime, clamp evaluation to Diwali Night (21.0)
  let effectiveHour = timeOfDay;
  if (nightMode && effectiveHour >= 6.0 && effectiveHour < 19.5) {
    effectiveHour = 21.0;
  } else if (!nightMode && (effectiveHour >= 19.5 || effectiveHour < 5.5)) {
    effectiveHour = 12.0;
  }

  // Find bounding keyframes
  let kf1 = KEYFRAMES[0];
  let kf2 = KEYFRAMES[1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (effectiveHour >= KEYFRAMES[i].hour && effectiveHour <= KEYFRAMES[i + 1].hour) {
      kf1 = KEYFRAMES[i];
      kf2 = KEYFRAMES[i + 1];
      break;
    }
  }

  const span = Math.max(0.001, kf2.hour - kf1.hour);
  const t = Math.max(0, Math.min(1, (effectiveHour - kf1.hour) / span));

  // Compute 3D Solar / Lunar directional coordinates
  const phi = (sunElevationDeg * Math.PI) / 180;
  const theta = (sunAzimuthDeg * Math.PI) / 180;
  const r = 21.0;
  const sunX = r * Math.cos(phi) * Math.sin(theta);
  const sunY = Math.max(1.0, r * Math.sin(phi));
  const sunZ = r * Math.cos(phi) * Math.cos(theta);
  const sunPosition: [number, number, number] = [sunX, sunY, sunZ];

  // Upward terracotta ground bounce position (Zero-cost GI fill)
  const bouncePosition: [number, number, number] = [-sunX * 0.65, 5.5, -sunZ * 0.65];

  const isNight = effectiveHour >= 19.5 || effectiveHour < 5.5 || nightMode;
  const currentPhase: 'Dawn' | 'Noon' | 'Golden Hour' | 'Dusk' | 'Diwali Night' =
    isNight
      ? 'Diwali Night'
      : effectiveHour >= 18.0
      ? 'Dusk'
      : effectiveHour >= 16.0
      ? 'Golden Hour'
      : effectiveHour >= 7.5
      ? 'Noon'
      : 'Dawn';

  // Use kf2's sky gradient if past half, or kf1's
  const skyGradient = t > 0.5 ? kf2.skyGradient : kf1.skyGradient;

  return {
    sunColor: lerpColor(kf1.sunColor, kf2.sunColor, t),
    sunIntensity: lerpNum(kf1.sunIntensity, kf2.sunIntensity, t),
    sunPosition,
    bounceColor: lerpColor(kf1.bounceColor, kf2.bounceColor, t),
    bounceIntensity: lerpNum(kf1.bounceIntensity, kf2.bounceIntensity, t),
    bouncePosition,
    ambientColor: lerpColor(kf1.ambientColor, kf2.ambientColor, t),
    ambientIntensity: lerpNum(kf1.ambientIntensity, kf2.ambientIntensity, t),
    hemisphereSkyColor: lerpColor(kf1.hemiSky, kf2.hemiSky, t),
    hemisphereGroundColor: lerpColor(kf1.hemiGround, kf2.hemiGround, t),
    hemisphereIntensity: lerpNum(kf1.hemiIntensity, kf2.hemiIntensity, t),
    fogColor: lerpColor(kf1.fogColor, kf2.fogColor, t),
    fogDensity: lerpNum(kf1.fogDensity, kf2.fogDensity, t),
    toneMappingExposure: lerpNum(kf1.exposure, kf2.exposure, t),
    skyGradient,
    sunDiscColor: lerpColor(kf1.sunDiscColor, kf2.sunDiscColor, t),
    sunCoronaColor: lerpColor(kf1.sunCoronaColor, kf2.sunCoronaColor, t),
    gridCellColor: lerpColor(kf1.gridCell, kf2.gridCell, t),
    gridSectionColor: lerpColor(kf1.gridSection, kf2.gridSection, t),
    isNight,
    phaseName: currentPhase,
  };
}

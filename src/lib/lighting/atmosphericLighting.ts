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
  // 00:00 - Midnight (Luminous Full Moon Plain)
  {
    hour: 0.0,
    sunColor: '#E0F2FE', // Luminous silvery-white moonlight
    sunIntensity: 1.35,
    bounceColor: '#38BDF8', // Cyan-blue celestial atmospheric fill
    bounceIntensity: 0.50,
    ambientColor: '#475569', // Slate/indigo ambient fill - makes cliffs, terrain, and shadows clearly visible
    ambientIntensity: 0.85,
    hemiSky: '#93C5FD', // Luminous sky radiance
    hemiGround: '#1E293B', // Cool slate shadow fill
    hemiIntensity: 0.80,
    fogColor: '#0F172A', // Clear night horizon mist
    fogDensity: 0.0025,
    exposure: 1.28,
    skyGradient: 'radial-gradient(ellipse at 50% 25%, #1E3A8A 0%, #172554 35%, #0F172A 70%, #030712 100%)',
    sunDiscColor: '#F8FAFC',
    sunCoronaColor: '#93C5FD',
    gridCell: '#2A3655',
    gridSection: '#3D4F7C',
    isNight: true,
    phaseName: 'Diwali Night',
  },
  // 05:00 - Pre-Dawn Twilight
  {
    hour: 5.0,
    sunColor: '#D8E4FF',
    sunIntensity: 0.95,
    bounceColor: '#38BDF8',
    bounceIntensity: 0.38,
    ambientColor: '#3B4A6B',
    ambientIntensity: 0.65,
    hemiSky: '#60A5FA',
    hemiGround: '#293548',
    hemiIntensity: 0.58,
    fogColor: '#0F172A',
    fogDensity: 0.003,
    exposure: 1.22,
    skyGradient: 'radial-gradient(ellipse at 50% 100%, #312E81 0%, #1E1B4B 35%, #0F172A 70%, #020617 100%)',
    sunDiscColor: '#E0F2FE',
    sunCoronaColor: '#818CF8',
    gridCell: '#2A3655',
    gridSection: '#3D4F7C',
    isNight: true,
    phaseName: 'Diwali Night',
  },
  // 06:00 - Dawn (Soft Rose-Gold Morning Sunlight & Long Ethereal Shadows)
  {
    hour: 6.0,
    sunColor: '#FDBA74', // Warm peach rose-gold
    sunIntensity: 1.55,
    bounceColor: '#FDBA74', // Warm morning fill
    bounceIntensity: 0.50,
    ambientColor: '#64748B', // Cool slate morning sky
    ambientIntensity: 0.60,
    hemiSky: '#94A3B8',
    hemiGround: '#B45309', // Warm laterite mud
    hemiIntensity: 0.60,
    fogColor: '#FED7AA', // Peach dawn horizon mist
    fogDensity: 0.004,
    exposure: 1.20,
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
    sunIntensity: 1.65,
    bounceColor: '#FED7AA', // Warm courtyard mud radiance
    bounceIntensity: 0.50,
    ambientColor: '#E0F2FE', // Open airy blue sky ambient
    ambientIntensity: 0.68,
    hemiSky: '#BAE6FD',
    hemiGround: '#9A3412',
    hemiIntensity: 0.58,
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
  // 17:30 - Golden Hour (Brilliant Saffron Sun 30 Mins Before Sunset)
  {
    hour: 17.5,
    sunColor: '#F59E0B', // Radiant golden amber
    sunIntensity: 2.80, // Bright, vibrant solar intensity
    bounceColor: '#EA580C', // Saturated laterite clay upward GI
    bounceIntensity: 0.90,
    ambientColor: '#FB923C', // Warm golden ambient fill (eliminates pitch dark shadows)
    ambientIntensity: 0.85,
    hemiSky: '#FDBA74', // Golden sky
    hemiGround: '#C2410C', // Terracotta earth
    hemiIntensity: 0.80,
    fogColor: '#9A3412', // Fiery Deccan sunset dust
    fogDensity: 0.0035,
    exposure: 1.30,
    skyGradient: 'radial-gradient(ellipse at 50% 100%, #FB923C 0%, #EA580C 30%, #9A3412 60%, #312E81 85%, #0F172A 100%)',
    sunDiscColor: '#FFFBEB',
    sunCoronaColor: '#F59E0B',
    gridCell: '#9A6247',
    gridSection: '#6B412D',
    isNight: false,
    phaseName: 'Golden Hour',
  },
  // 18.8 - Dusk / Sunset Afterglow
  {
    hour: 18.8,
    sunColor: '#FB7185', // Warm rose-gold afterglow
    sunIntensity: 1.35,
    bounceColor: '#9A3412',
    bounceIntensity: 0.45,
    ambientColor: '#4338CA',
    ambientIntensity: 0.55,
    hemiSky: '#6366F1',
    hemiGround: '#7C2D12',
    hemiIntensity: 0.52,
    fogColor: '#1E1B4B',
    fogDensity: 0.004,
    exposure: 1.22,
    skyGradient: 'radial-gradient(ellipse at 50% 100%, #9A3412 0%, #4338CA 40%, #1E1B4B 70%, #080D1A 100%)',
    sunDiscColor: '#F472B6',
    sunCoronaColor: '#C084FC',
    gridCell: '#423554',
    gridSection: '#584670',
    isNight: false,
    phaseName: 'Dusk',
  },
  // 21:00 - Diwali Night (Full Moon Visibility, Silver-Blue Landscape & Glowing Diyas)
  {
    hour: 21.0,
    sunColor: '#E0F2FE', // Luminous silvery-white moonlight
    sunIntensity: 1.35,
    bounceColor: '#38BDF8', // Cyan-blue celestial atmospheric fill
    bounceIntensity: 0.50,
    ambientColor: '#475569', // Slate/indigo ambient fill - makes cliffs, terrain, and shadows clearly visible
    ambientIntensity: 0.85,
    hemiSky: '#93C5FD', // Luminous sky radiance
    hemiGround: '#1E293B', // Cool slate shadow fill
    hemiIntensity: 0.80,
    fogColor: '#0F172A', // Clear night horizon mist
    fogDensity: 0.0025,
    exposure: 1.28,
    skyGradient: 'radial-gradient(ellipse at 50% 25%, #1E3A8A 0%, #172554 35%, #0F172A 70%, #030712 100%)',
    sunDiscColor: '#F8FAFC',
    sunCoronaColor: '#93C5FD',
    gridCell: '#2A3655',
    gridSection: '#3D4F7C',
    isNight: true,
    phaseName: 'Diwali Night',
  },
  // 24:00 - Midnight (wraps seamlessly to hour 0.0)
  {
    hour: 24.0,
    sunColor: '#E0F2FE',
    sunIntensity: 1.35,
    bounceColor: '#38BDF8',
    bounceIntensity: 0.50,
    ambientColor: '#475569',
    ambientIntensity: 0.85,
    hemiSky: '#93C5FD',
    hemiGround: '#1E293B',
    hemiIntensity: 0.80,
    fogColor: '#0F172A',
    fogDensity: 0.0025,
    exposure: 1.28,
    skyGradient: 'radial-gradient(ellipse at 50% 25%, #1E3A8A 0%, #172554 35%, #0F172A 70%, #030712 100%)',
    sunDiscColor: '#F8FAFC',
    sunCoronaColor: '#93C5FD',
    gridCell: '#2A3655',
    gridSection: '#3D4F7C',
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
  if (nightMode && effectiveHour >= 6.5 && effectiveHour < 18.5) {
    effectiveHour = 21.0;
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

/**
 * Calculates whether festive diyas should be lit and their visual intensity factor.
 * Diyas are lit throughout Golden Hour (~16:30), Dusk, Night, and early Dawn (~06:30),
 * as well as whenever nightMode is explicitly active.
 */
export function getDiyaLightStatus(
  timeOfDay: number,
  nightMode: boolean
): {
  isLit: boolean;
  intensityFactor: number;
} {
  if (nightMode) {
    return { isLit: true, intensityFactor: 1.0 };
  }

  // Golden Hour starts ~16.5h (4:30 PM), night lasts through dawn until 06.5h (6:30 AM)
  if (timeOfDay >= 16.5 || timeOfDay <= 6.5) {
    if (timeOfDay >= 19.0 || timeOfDay <= 5.0) {
      return { isLit: true, intensityFactor: 1.0 }; // Full night
    }
    if (timeOfDay >= 16.5 && timeOfDay < 19.0) {
      // Golden Hour to Dusk: 0.70 to 1.0
      const t = (timeOfDay - 16.5) / 2.5;
      return { isLit: true, intensityFactor: 0.70 + 0.30 * t };
    }
    // Pre-dawn to early morning (5.0 to 6.5): 1.0 down to 0.65
    const t = (timeOfDay - 5.0) / 1.5;
    return { isLit: true, intensityFactor: 1.0 - 0.35 * t };
  }

  return { isLit: false, intensityFactor: 0.0 };
}

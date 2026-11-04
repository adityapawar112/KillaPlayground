/**
 * Lighting & Fireworks Studio Types
 * Ticket 10: Festive Lighting & Fireworks Studio
 */

export type LightingCategory = 'diyas_clay' | 'diyas_color' | 'fireworks';

export type LightingSubTool = 'place' | 'select' | 'transform' | 'erase';

export type FireworkType = 'anaar' | 'skyshot';

export interface LightingCategoryInfo {
  id: LightingCategory;
  name: string;
  devanagari: string;
  description: string;
  accentColor: string;
}

export interface LightingItemDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface LightingItem {
  id: string;
  name: string;
  devanagariName: string;
  category: LightingCategory;
  modelType: 'diya_glb' | 'anaar_procedural' | 'skyshot_procedural';
  modelPath?: string;       // GLB path for existing diyas in /public/figurines/
  previewPath?: string;     // Preview thumbnail
  defaultScale: number;
  dimensions: LightingItemDimensions;
  culturalLore: string;
  fireworkType?: FireworkType;
  colorTheme?: string;      // Saffron, Emerald, Violet, Crimson, Gold, Peony, Willow, Palm, Comet, Ring
  primaryColor?: string;
  accentColor?: string;
  faceCount?: number;
  burstAltitude?: number;   // Default burst height in meters (e.g. 1.0m / 100cm)
  sprayHeight?: number;     // Default fountain spray height in meters
}

export interface PlacedLight {
  id: string;
  type: string;             // Item ID matching LightingItem.id
  category: LightingCategory;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  colorTheme?: string;
  burstHeight?: number;     // Custom adjustable burst/spray height in meters
  createdAt: number;
}

export interface FireworkParticleConfig {
  type: FireworkType;
  colorTheme: string;
  primaryColor: string;
  accentColor: string;
  durationSeconds: number;
  velocity: number;
  spread: number;
  particleCount: number;
  burstRadius?: number;
  gravity?: number;
  flickerRate?: number;
}


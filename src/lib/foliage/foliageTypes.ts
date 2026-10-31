/**
 * 3D Foliage & Nature Scatter Types
 * Ticket 07: 3D Foliage Paint & Nature Scatter System
 */

export type FoliageCategory =
  | 'canopy_broadleaf'
  | 'bushes'
  | 'flowering'
  | 'dry_cliff'
  | 'acacia_savannah'
  | 'columnar_cypress'
  | 'palms';

export interface FoliageCategoryInfo {
  id: FoliageCategory;
  name: string;
  devanagari: string;
  description: string;
  accentColor: string;
  defaultWidth?: number;
  defaultHeight?: number;
  spacing?: number;
  geometryMode?: 'single' | 'cross';
}

export interface FoliageItem {
  id: string;
  name: string;
  category: FoliageCategory;
  spritePath: string;
  previewPath: string;
  defaultWidth: number;
  defaultHeight: number;
  spacing: number;
  geometryMode?: 'single' | 'cross';
  description: string;
  culturalLore?: string;
}

export interface FoliageInstance {
  id: string;
  typeId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export type FoliageSubTool = 'scatter' | 'single' | 'erase';

export interface FoliageBrushOptions {
  operation: FoliageSubTool;
  radius: number;
  density: number;
  scaleJitter: number;
  normalAlign: number;
  slopeLimit?: number;
}

/**
 * Figurine & Architecture Types
 * Ticket 08: Figurine & Architecture Asset Browser
 */

export type FigurineCategory =
  | 'royalty'
  | 'mavale'
  | 'musicians'
  | 'diyas_clay'
  | 'diyas_color'
  | 'yard_props'
  | 'architecture'
  | 'artillery';

export interface FigurineCategoryInfo {
  id: FigurineCategory;
  name: string;
  devanagari: string;
  description: string;
  accentColor: string;
}

export interface FigurineItem {
  id: string;
  name: string;
  devanagariName: string;
  category: FigurineCategory;
  modelPath: string;
  previewPath: string;
  faceCount: number;
  defaultScale: number;
  dimensions: { width: number; height: number; depth: number };
  culturalLore: string;
}

export type PropSubTool = 'place' | 'select' | 'transform' | 'erase';

export interface PropPlacementSettings {
  scale: number;
  rotationYaw: number;
  randomRotation: boolean;
  normalAlign: number;
  elevationOffset: number;
}


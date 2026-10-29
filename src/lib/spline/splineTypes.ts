/**
 * Diwali Killa Sandbox - Spline Structure Placement Types
 * Authentic Maratha fort linear architectural features & festive diorama elements.
 */

export type SplineConversionType = 'steps' | 'flags' | 'diyas';

export interface SplineSettings {
  // Steps parameters
  stepWidth?: number; // width perpendicular to path (default: 0.6m)
  stepRun?: number;   // horizontal tread length (default: 0.22m)
  stepRise?: number;  // vertical rise per step (default: 0.08m)

  // Flags & Diyas parameters
  spacing?: number;   // distance between instances along curve (default: 0.8m for flags, 0.4m for diyas)
  scale?: number;     // scale multiplier (default: 1.0)
}

export interface SplinePath {
  id: string;
  points: [number, number, number][];
  type: SplineConversionType;
  settings?: SplineSettings;
}

export interface InstanceTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export const DEFAULT_SPLINE_SETTINGS: Record<SplineConversionType, Required<SplineSettings>> = {
  steps: {
    stepWidth: 0.6,
    stepRun: 0.22,
    stepRise: 0.08,
    spacing: 0.22,
    scale: 1.0,
  },
  flags: {
    stepWidth: 0.6,
    stepRun: 0.22,
    stepRise: 0.08,
    spacing: 0.8,
    scale: 1.0,
  },
  diyas: {
    stepWidth: 0.6,
    stepRun: 0.22,
    stepRise: 0.08,
    spacing: 0.35,
    scale: 1.0,
  },
};


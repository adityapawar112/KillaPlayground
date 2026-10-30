/**
 * Diwali Killa Sandbox - Spline Structure Placement Types
 * Authentic Maratha fort linear architectural features & festive diorama elements.
 */

export type SplineConversionType = 'steps' | 'flags' | 'diyas';

export interface SplineSettings {
  // Steps parameters
  stepWidth?: number;   // width perpendicular to path in meters (default: 0.06m = 6cm)
  stepRun?: number;     // horizontal tread length in meters (default: 0.025m = 2.5cm)
  stepRise?: number;    // vertical rise per step in meters (default: 0.01m = 1cm)
  stepOffset?: number;  // lateral shift left/right from path center in meters (default: 0.0m)
  stepSpacing?: number; // spacing between consecutive steps in meters (default: 0.025m = 2.5cm)

  // Flags & Diyas parameters
  spacing?: number;     // distance between instances along curve (default: 0.20m for flags, 0.35m for diyas)
  scale?: number;       // scale multiplier (default: 1.0)
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
    stepWidth: 0.06,   // 6cm width
    stepRun: 0.025,    // 2.5cm tread depth
    stepRise: 0.01,    // 1cm riser height
    stepOffset: 0.0,   // centered on path
    stepSpacing: 0.025,// 2.5cm between steps
    spacing: 0.025,
    scale: 1.0,
  },
  flags: {
    stepWidth: 0.06,
    stepRun: 0.025,
    stepRise: 0.01,
    stepOffset: 0.0,
    stepSpacing: 0.025,
    spacing: 0.20,     // 20cm spacing between flags
    scale: 1.0,
  },
  diyas: {
    stepWidth: 0.06,
    stepRun: 0.025,
    stepRise: 0.01,
    stepOffset: 0.0,
    stepSpacing: 0.025,
    spacing: 0.35,     // 35cm spacing between diyas
    scale: 1.0,
  },
};


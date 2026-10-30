export interface WallPoint {
  x: number;
  y: number;
  z: number;
}

export interface WallGate {
  id: string;
  segmentIndex: number; // segment between points[i] and points[i+1]
  t: number;            // 0.0 to 1.0 along the segment (default 0.5)
  width: number;        // gate width in meters (default 0.18m = 18cm)
  height: number;       // arch opening height in meters (default 0.18m = 18cm)
  hasGatehouse?: boolean; // flanking round bastion towers
}

export interface WallSettings {
  height: number;             // 0.10m to 0.60m (10cm to 60cm, default 0.25m = 25cm)
  thickness: number;          // 0.05m to 0.30m (5cm to 30cm, default 0.15m = 15cm)
  uvScale: number;            // 0.5 to 3.0 (default 1.0)
  autoBastions: boolean;      // spawn bastions at sharp corner angles (> 35 deg)
  bastionRadius: number;      // radius of cylindrical tower (0.06m to 0.35m, default 0.13m = 13cm)
  crenellations: boolean;     // alternating notched battlements (kangare)
  crenellationHeight: number; // height of merlon (0.02m to 0.08m, default 0.04m = 4cm)
  crenellationWidth: number;  // width of merlon (default 0.05m = 5cm)
  flipCrenellations?: boolean;// flip kangare between outer and inner wall rim
}

export const DEFAULT_WALL_SETTINGS: WallSettings = {
  height: 0.25,
  thickness: 0.15,
  uvScale: 1.0,
  autoBastions: true,
  bastionRadius: 0.13,
  crenellations: true,
  crenellationHeight: 0.04,
  crenellationWidth: 0.05,
  flipCrenellations: false,
};

export interface CustomBastionProps {
  radius?: number;       // radius of tower in meters (0.06m to 0.35m)
  heightOffset?: number; // extra height above wall in meters (0.0m to 0.20m)
  isGrand?: boolean;     // whether this is a Maha Buruj
}

/**
 * Procedural Round Tower placed along wall segment.
 * Slides continuously along any wall segment.
 */
export interface WallTower {
  id: string;
  segmentIndex: number; // segment between points[i] and points[i+1]
  t: number;            // 0.0 to 1.0 along the segment (default 0.5)
  radius: number;       // radius of cylinder in meters (default: 0.13m = 13cm)
  heightOffset: number; // extra height above wall in meters (default: 0.02m = 2cm)
}

/**
 * Procedural Box Bastion placed along wall segment.
 * Attached to the wall with its entire body extending inward into the castle.
 */
export interface WallBoxBastion {
  id: string;
  segmentIndex: number; // segment between points[i] and points[i+1]
  t: number;            // 0.0 to 1.0 along the segment (default 0.5)
  width: number;        // width along the wall in meters (default: 0.30m = 30cm)
  depth: number;        // inward depth into castle in meters (default: 0.30m = 30cm)
  heightOffset: number; // extra height above wall in meters (default: 0.04m = 4cm)
  flipSide?: boolean;   // invert inside/outside orientation
}

export interface WallPath {
  id: string;
  points: WallPoint[];
  isClosed: boolean;
  towers?: WallTower[];             // Round towers placed along segments
  boxBastions?: WallBoxBastion[];   // Box bastions attached to wall
  gates: WallGate[];                // Arched gateways
  manualBastionIndices?: number[];  // indices of points with manual bastions
  grandBastionIndices?: number[];   // indices of points with grand bastions
  excludedBastionIndices?: number[];// indices of vertices where bastions are suppressed
  customBastions?: Record<number, CustomBastionProps>; // per-node bastion overrides
  settings: WallSettings;
  createdAt: number;
}

export type WallSubTool = 'draw' | 'select' | 'gate' | 'bastion';

export type WallStepperStep = 'layout' | 'fortify' | 'solidified';

export type FortStampType = 'tower' | 'box' | 'gate' | 'buruj' | 'grand_buruj' | 'citadel' | null;

export interface CitadelKeep {
  id: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
  height: number;
  createdAt: number;
}

export interface SelectedComponentRef {
  type: 'gate' | 'bastion' | 'tower' | 'box' | 'citadel';
  idOrIndex: string | number;
  wallId?: string;
}


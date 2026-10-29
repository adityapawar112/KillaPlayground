export interface WallPoint {
  x: number;
  y: number;
  z: number;
}

export interface WallGate {
  id: string;
  segmentIndex: number; // segment between points[i] and points[i+1]
  t: number;            // 0.0 to 1.0 along the segment (default 0.5)
  width: number;        // gate width in meters (default 0.35m = 35cm)
  height: number;       // arch opening height in meters (default 0.28m = 28cm)
  hasGatehouse?: boolean; // flanking round bastion towers
}

export interface WallSettings {
  height: number;             // 0.10m to 1.0m (10cm to 100cm, default 0.40m = 40cm)
  thickness: number;          // 0.05m to 0.40m (5cm to 40cm, default 0.15m = 15cm)
  uvScale: number;            // 0.5 to 3.0 (default 1.0)
  autoBastions: boolean;      // spawn bastions at sharp corner angles (> 35 deg)
  bastionRadius: number;      // radius of cylindrical tower (0.10m to 0.60m, default 0.25m = 25cm)
  crenellations: boolean;     // alternating notched battlements (kangare)
  crenellationHeight: number; // height of merlon (0.04m to 0.15m, default 0.08m = 8cm)
  crenellationWidth: number;  // width of merlon (default 0.10m = 10cm)
  flipCrenellations?: boolean;// flip kangare between outer and inner wall rim
}

export const DEFAULT_WALL_SETTINGS: WallSettings = {
  height: 0.40,
  thickness: 0.15,
  uvScale: 1.0,
  autoBastions: true,
  bastionRadius: 0.25,
  crenellations: true,
  crenellationHeight: 0.08,
  crenellationWidth: 0.10,
  flipCrenellations: false,
};

export interface CustomBastionProps {
  radius?: number;       // radius of tower in meters (0.10m to 0.60m)
  heightOffset?: number; // extra height above wall in meters (0.0m to 0.35m)
  isGrand?: boolean;     // whether this is a Maha Buruj (Grand Bastion)
}

export interface WallPath {
  id: string;
  points: WallPoint[];
  isClosed: boolean;
  manualBastionIndices?: number[]; // indices of points with manual bastions
  grandBastionIndices?: number[];  // indices of points with grand bastions (Maha Buruj)
  excludedBastionIndices?: number[]; // indices of vertices where bastions are suppressed
  customBastions?: Record<number, CustomBastionProps>; // per-node bastion overrides
  gates: WallGate[];
  settings: WallSettings;
  createdAt: number;
}

export type WallSubTool = 'draw' | 'select' | 'gate' | 'bastion';

export type WallStepperStep = 'layout' | 'fortify' | 'solidified';

export type FortStampType = 'buruj' | 'grand_buruj' | 'gate' | 'citadel' | null;

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
  type: 'gate' | 'bastion' | 'citadel';
  idOrIndex: string | number;
  wallId?: string;
}


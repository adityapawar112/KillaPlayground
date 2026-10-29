export interface WallPoint {
  x: number;
  y: number;
  z: number;
}

export interface WallGate {
  id: string;
  segmentIndex: number; // segment between points[i] and points[i+1]
  t: number;            // 0.0 to 1.0 along the segment (default 0.5)
  width: number;        // gate width in meters (default 0.08m = 80mm)
  height: number;       // arch opening height in meters (default 0.04m = 40mm)
  hasGatehouse?: boolean; // flanking round bastion towers
}

export interface WallSettings {
  height: number;             // 0.02m to 0.10m (20mm to 100mm, default 0.05m = 50mm)
  thickness: number;          // 0.015m to 0.06m (15mm to 60mm, default 0.03m = 30mm)
  uvScale: number;            // 0.5 to 3.0 (default 1.0, scaled to miniature masonry courses)
  autoBastions: boolean;      // spawn bastions at sharp corner angles (> 35 deg)
  bastionRadius: number;      // radius of cylindrical tower (0.03m to 0.10m, default 0.055m = 55mm)
  crenellations: boolean;     // alternating notched battlements (kangare)
  crenellationHeight: number; // height of merlon (0.010m to 0.025m, default 0.016m = 16mm)
  crenellationWidth: number;  // width of merlon (default 0.02m = 20mm)
}

export const DEFAULT_WALL_SETTINGS: WallSettings = {
  height: 0.05,
  thickness: 0.03,
  uvScale: 1.0,
  autoBastions: true,
  bastionRadius: 0.055,
  crenellations: true,
  crenellationHeight: 0.016,
  crenellationWidth: 0.02,
};

export interface WallPath {
  id: string;
  points: WallPoint[];
  isClosed: boolean;
  manualBastionIndices?: number[]; // indices of points with manual bastions
  gates: WallGate[];
  settings: WallSettings;
  createdAt: number;
}

export type WallSubTool = 'draw' | 'gate' | 'bastion';


export interface WallPoint {
  x: number;
  y: number;
  z: number;
}

export interface WallGate {
  id: string;
  segmentIndex: number; // segment between points[i] and points[i+1]
  t: number;            // 0.0 to 1.0 along the segment (default 0.5)
  width: number;        // gate width in meters (default 1.2m)
  height: number;       // arch height in meters (default 2.0m)
  hasGatehouse?: boolean; // flanking chambers/towers
}

export interface WallSettings {
  height: number;             // 0.5m to 4.0m (default 1.8m)
  thickness: number;          // 0.2m to 0.8m (default 0.4m)
  uvScale: number;            // 0.5 to 3.0 (default 1.0)
  autoBastions: boolean;      // spawn bastions at sharp corner angles (> 35 deg)
  bastionRadius: number;      // radius of cylindrical tower (0.4m to 1.2m, default 0.6m)
  crenellations: boolean;     // alternating notched battlements (kangare)
  crenellationHeight: number; // height of merlon (default 0.35m)
  crenellationWidth: number;  // width of merlon (default 0.3m)
}

export const DEFAULT_WALL_SETTINGS: WallSettings = {
  height: 1.8,
  thickness: 0.4,
  uvScale: 1.0,
  autoBastions: true,
  bastionRadius: 0.6,
  crenellations: true,
  crenellationHeight: 0.35,
  crenellationWidth: 0.3,
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


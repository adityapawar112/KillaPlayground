/**
 * Camera Navigation & OrbitControls Mouse Button Configuration
 * Enforces:
 * - Left-click is permanently dedicated as the primary action for the active tool and mode
 *   (sculpting, drafting wall paths, placing bastions/towers, painting textures, scattering nature flora, selecting elements).
 * - Left-click orbit in OrbitControls is permanently disabled (-1) across all tools and modes.
 * - Camera Orbiting defaults strictly to Right-Click Drag.
 * - Camera Panning defaults to Middle-Click Drag.
 * - Camera Zooming defaults to Scroll Wheel.
 */

import * as THREE from 'three';
import { ToolType, WallMode, SplineMode } from '../state/useEditorStore';

export interface CameraControlButtons {
  LEFT: THREE.MOUSE | -1;
  MIDDLE: THREE.MOUSE;
  RIGHT: THREE.MOUSE;
}

/**
 * Returns OrbitControls mouseButtons configuration.
 * Left-click is permanently -1 (disabled in OrbitControls) so left-click is exclusively
 * reserved for primary tool and selection actions.
 * Right-click is permanently ROTATE (0).
 * Middle-click is permanently PAN (2).
 */
export function getOrbitMouseButtons(
  _tool?: ToolType,
  _wallMode?: WallMode,
  _splineMode?: SplineMode
): CameraControlButtons {
  return {
    LEFT: -1 as unknown as THREE.MOUSE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,
  };
}

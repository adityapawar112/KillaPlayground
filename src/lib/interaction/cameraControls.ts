/**
 * Camera Navigation & OrbitControls Mouse Button Configuration
 * Enforces:
 * - Left-click drag & touch drag: Orbit around the diorama.
 * - Single click / tap without drag (<= 8px, <= 350ms): Execute active tool action.
 * - Double-tap and drag: Initiates continuous tool drag action (sculpting/painting), pausing orbit/pan.
 * - Right-click drag: Camera Orbiting.
 * - Middle-click drag: Camera Panning.
 * - Two-finger drag on touch: Camera Panning.
 * - Pinch-to-zoom: Camera Zooming.
 */

import * as THREE from 'three';
import { ToolType, WallMode, SplineMode } from '../state/useEditorStore';

export interface CameraControlButtons {
  LEFT: THREE.MOUSE | -1;
  MIDDLE: THREE.MOUSE;
  RIGHT: THREE.MOUSE;
}

export function getOrbitMouseButtons(
  _tool?: ToolType,
  _wallMode?: WallMode,
  _splineMode?: SplineMode
): CameraControlButtons {
  return {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,
  };
}

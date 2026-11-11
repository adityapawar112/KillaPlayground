/**
 * Diwali Killa Sandbox - Diorama Gesture & Trackpad Interaction Controller
 *
 * Implements unified gesture state machine for both touch screens and trackpads/mouse:
 * 1. Single Drag (touch or mouse): Orbit camera around diorama.
 * 2. Single Tap / Click: Perform active tool action (sculpt dab, wall node, figurine placement, etc.).
 * 3. Double-Tap & Drag:
 *    - On Touch: Continuous tool drag action (continuous sculpt stroke, paint, wall draw) with camera orbit/pan stopped.
 *    - On Mouse / Trackpad: Camera pan.
 * 4. Pinch in/out: Zoom in and out.
 * 5. Two-finger drag: Camera pan.
 * 6. Joystick coordination: Completely disable canvas gestures when joystick is active.
 */

export interface PointerCoords {
  x: number;
  y: number;
  time?: number;
  pointerType?: string;
  pointerId?: number;
}

export type GestureAction =
  | { type: 'none' }
  | { type: 'pending_tap_or_orbit' }
  | { type: 'single_tap'; x: number; y: number }
  | { type: 'continuous_tool_drag'; x: number; y: number }
  | { type: 'end_continuous_tool_drag' }
  | { type: 'mouse_pan'; deltaX: number; deltaY: number }
  | { type: 'end_mouse_pan' }
  | { type: 'orbit' }
  | { type: 'end_orbit' };

export const GESTURE_CONFIG = {
  TAP_MAX_DISTANCE: 8, // pixels
  TAP_MAX_DURATION: 350, // ms
  DOUBLE_TAP_MAX_DELAY: 350, // ms
  DOUBLE_TAP_MAX_DISTANCE: 35, // pixels
};

export class GestureController {
  private lastTap: { x: number; y: number; time: number } | null = null;
  private pointerDownState: {
    x: number;
    y: number;
    time: number;
    pointerType: string;
    pointerId: number;
  } | null = null;
  private hasDragged: boolean = false;
  private isContinuousToolDrag: boolean = false;
  private isMousePan: boolean = false;
  private lastPanPos: { x: number; y: number } | null = null;

  public onPointerDown(
    e: PointerCoords,
    options?: { isJoystickActive?: boolean; isAltPressed?: boolean }
  ): GestureAction {
    if (options?.isJoystickActive) {
      this.reset();
      return { type: 'none' };
    }

    const now = e.time ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const pointerType = e.pointerType || 'mouse';
    const pointerId = e.pointerId ?? 0;

    // Check for double tap
    const isDoubleTap =
      this.lastTap !== null &&
      now - this.lastTap.time <= GESTURE_CONFIG.DOUBLE_TAP_MAX_DELAY &&
      Math.hypot(e.x - this.lastTap.x, e.y - this.lastTap.y) <= GESTURE_CONFIG.DOUBLE_TAP_MAX_DISTANCE;

    this.pointerDownState = {
      x: e.x,
      y: e.y,
      time: now,
      pointerType,
      pointerId,
    };
    this.hasDragged = false;

    // Alt+drag on mouse desktop triggers continuous tool drag directly
    if (options?.isAltPressed && pointerType === 'mouse') {
      this.isContinuousToolDrag = true;
      this.isMousePan = false;
      return { type: 'continuous_tool_drag', x: e.x, y: e.y };
    }

    if (isDoubleTap) {
      if (pointerType === 'touch') {
        // Double tap on touch screen: continuous tool stroke (stops orbiting / panning)
        this.isContinuousToolDrag = true;
        this.isMousePan = false;
        return { type: 'continuous_tool_drag', x: e.x, y: e.y };
      } else {
        // Double tap / click on mouse pad: pan camera
        this.isMousePan = true;
        this.isContinuousToolDrag = false;
        this.lastPanPos = { x: e.x, y: e.y };
        return { type: 'mouse_pan', deltaX: 0, deltaY: 0 };
      }
    }

    // Single pointer down: keep OrbitControls enabled so user can drag to orbit, or release for tap
    this.isContinuousToolDrag = false;
    this.isMousePan = false;
    return { type: 'pending_tap_or_orbit' };
  }

  public onPointerMove(
    e: PointerCoords,
    options?: { isJoystickActive?: boolean }
  ): GestureAction {
    if (options?.isJoystickActive || !this.pointerDownState) {
      return { type: 'none' };
    }

    // In mouse pan mode
    if (this.isMousePan && this.lastPanPos) {
      const deltaX = e.x - this.lastPanPos.x;
      const deltaY = e.y - this.lastPanPos.y;
      this.lastPanPos = { x: e.x, y: e.y };
      return { type: 'mouse_pan', deltaX, deltaY };
    }

    // In continuous tool drag mode
    if (this.isContinuousToolDrag) {
      return { type: 'continuous_tool_drag', x: e.x, y: e.y };
    }

    // Check if user is dragging to orbit
    const dist = Math.hypot(e.x - this.pointerDownState.x, e.y - this.pointerDownState.y);
    if (dist > GESTURE_CONFIG.TAP_MAX_DISTANCE) {
      this.hasDragged = true;
      return { type: 'orbit' };
    }

    return { type: 'none' };
  }

  public onPointerUp(
    e: PointerCoords,
    options?: { isJoystickActive?: boolean }
  ): GestureAction {
    if (options?.isJoystickActive) {
      this.reset();
      return { type: 'none' };
    }

    if (this.isMousePan) {
      this.isMousePan = false;
      this.lastPanPos = null;
      this.pointerDownState = null;
      return { type: 'end_mouse_pan' };
    }

    if (this.isContinuousToolDrag) {
      this.isContinuousToolDrag = false;
      this.pointerDownState = null;
      return { type: 'end_continuous_tool_drag' };
    }

    const state = this.pointerDownState;
    this.pointerDownState = null;

    if (!state) {
      return { type: 'none' };
    }

    const now = e.time ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const duration = now - state.time;
    const dist = Math.hypot(e.x - state.x, e.y - state.y);

    if (!this.hasDragged && dist <= GESTURE_CONFIG.TAP_MAX_DISTANCE && duration <= GESTURE_CONFIG.TAP_MAX_DURATION) {
      // Valid tap / click
      this.lastTap = { x: e.x, y: e.y, time: now };
      return { type: 'single_tap', x: e.x, y: e.y };
    }

    if (this.hasDragged) {
      return { type: 'end_orbit' };
    }

    return { type: 'none' };
  }

  public reset(): void {
    this.pointerDownState = null;
    this.hasDragged = false;
    this.isContinuousToolDrag = false;
    this.isMousePan = false;
    this.lastPanPos = null;
  }

  public getLastTap() {
    return this.lastTap;
  }

  public clearLastTap() {
    this.lastTap = null;
  }

  public getIsActive(): boolean {
    return this.isContinuousToolDrag || this.isMousePan;
  }
}


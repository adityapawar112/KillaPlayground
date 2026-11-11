import { describe, it, expect, beforeEach } from 'vitest';
import { GestureController, GESTURE_CONFIG } from './gestureController';

describe('GestureController', () => {
  let controller: GestureController;

  beforeEach(() => {
    controller = new GestureController();
  });

  describe('Single Tap / Click vs Orbit', () => {
    it('recognizes a quick stationary release as a single tap', () => {
      const down = controller.onPointerDown({ x: 100, y: 100, time: 1000 });
      expect(down.type).toBe('pending_tap_or_orbit');

      const move = controller.onPointerMove({ x: 102, y: 102, time: 1050 });
      expect(move.type).toBe('none');

      const up = controller.onPointerUp({ x: 102, y: 102, time: 1150 });
      expect(up.type).toBe('single_tap');
      if (up.type === 'single_tap') {
        expect(up.x).toBe(102);
        expect(up.y).toBe(102);
      }
    });

    it('recognizes a drag > 8px as an orbit and suppresses tap action on release', () => {
      controller.onPointerDown({ x: 100, y: 100, time: 1000 });

      // Move 15px (exceeds 8px threshold)
      const move = controller.onPointerMove({ x: 115, y: 100, time: 1050 });
      expect(move.type).toBe('orbit');

      const up = controller.onPointerUp({ x: 115, y: 100, time: 1150 });
      expect(up.type).toBe('end_orbit');
    });

    it('suppresses tap action if held longer than 350ms without moving', () => {
      controller.onPointerDown({ x: 100, y: 100, time: 1000 });
      const up = controller.onPointerUp({ x: 100, y: 100, time: 1400 }); // 400ms duration
      expect(up.type).toBe('none');
    });
  });

  describe('Double-Tap & Drag on Touch', () => {
    it('initiates continuous tool drag on touch double tap and ends on release', () => {
      // First tap
      controller.onPointerDown({ x: 100, y: 100, time: 1000, pointerType: 'touch' });
      const up1 = controller.onPointerUp({ x: 100, y: 100, time: 1100, pointerType: 'touch' });
      expect(up1.type).toBe('single_tap');

      // Second tap within 200ms (< 350ms) and 10px (< 35px)
      const down2 = controller.onPointerDown({ x: 105, y: 100, time: 1300, pointerType: 'touch' });
      expect(down2.type).toBe('continuous_tool_drag');

      const move2 = controller.onPointerMove({ x: 150, y: 120, time: 1350, pointerType: 'touch' });
      expect(move2.type).toBe('continuous_tool_drag');

      const up2 = controller.onPointerUp({ x: 150, y: 120, time: 1500, pointerType: 'touch' });
      expect(up2.type).toBe('end_continuous_tool_drag');
    });

    it('does not trigger double tap if second tap is delayed > 350ms', () => {
      // First tap
      controller.onPointerDown({ x: 100, y: 100, time: 1000, pointerType: 'touch' });
      controller.onPointerUp({ x: 100, y: 100, time: 1100, pointerType: 'touch' });

      // Second tap after 400ms (> 350ms)
      const down2 = controller.onPointerDown({ x: 100, y: 100, time: 1501, pointerType: 'touch' });
      expect(down2.type).toBe('pending_tap_or_orbit');
    });
  });

  describe('Double-Tap & Drag on Mousepad / Mouse', () => {
    it('initiates camera pan on mouse double click/tap and yields deltas during drag', () => {
      // First click
      controller.onPointerDown({ x: 200, y: 200, time: 1000, pointerType: 'mouse' });
      controller.onPointerUp({ x: 200, y: 200, time: 1100, pointerType: 'mouse' });

      // Second click within 200ms
      const down2 = controller.onPointerDown({ x: 202, y: 200, time: 1250, pointerType: 'mouse' });
      expect(down2.type).toBe('mouse_pan');

      // Drag to pan
      const move1 = controller.onPointerMove({ x: 215, y: 190, time: 1300, pointerType: 'mouse' });
      expect(move1.type).toBe('mouse_pan');
      if (move1.type === 'mouse_pan') {
        expect(move1.deltaX).toBe(13); // 215 - 202
        expect(move1.deltaY).toBe(-10); // 190 - 200
      }

      const up2 = controller.onPointerUp({ x: 215, y: 190, time: 1400, pointerType: 'mouse' });
      expect(up2.type).toBe('end_mouse_pan');
    });
  });

  describe('Joystick Coordination', () => {
    it('ignores all canvas gestures when isJoystickActive is true', () => {
      const down = controller.onPointerDown(
        { x: 100, y: 100, time: 1000 },
        { isJoystickActive: true }
      );
      expect(down.type).toBe('none');

      const move = controller.onPointerMove(
        { x: 150, y: 150, time: 1050 },
        { isJoystickActive: true }
      );
      expect(move.type).toBe('none');

      const up = controller.onPointerUp(
        { x: 150, y: 150, time: 1100 },
        { isJoystickActive: true }
      );
      expect(up.type).toBe('none');
    });
  });
});


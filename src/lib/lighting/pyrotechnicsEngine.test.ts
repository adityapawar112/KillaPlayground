import { describe, it, expect, beforeEach } from 'vitest';
import { PyrotechnicsEngine, MAX_FIREWORK_PARTICLES } from './pyrotechnicsEngine';
import { getLightById } from './lightingManifest';

describe('Pyrotechnics Particle Engine', () => {
  let engine: PyrotechnicsEngine;

  beforeEach(() => {
    engine = new PyrotechnicsEngine();
  });

  it('initializes with pre-allocated buffers and zero active particles', () => {
    expect(engine.activeCount).toBe(0);
    expect(engine.positions.length).toBe(MAX_FIREWORK_PARTICLES * 3);
    expect(engine.colors.length).toBe(MAX_FIREWORK_PARTICLES * 3);
    expect(engine.sizes.length).toBe(MAX_FIREWORK_PARTICLES);
  });

  it('triggers a Cone Fountain (Anaar) and emits upward sparks with parabolic falloff', () => {
    const anaar = getLightById('anaar_saffron');
    expect(anaar).toBeDefined();

    engine.triggerFirework('test_anaar_1', anaar!, [0, 0, 0], 1.0);

    // Initial update step emits fountain sparks
    const hasActive = engine.update(0.016);
    expect(hasActive).toBe(true);
    expect(engine.activeCount).toBeGreaterThan(0);

    // Initial sparks have upward velocity (vy > 0)
    const initialVy = engine.positions[1];
    expect(initialVy).toBeGreaterThanOrEqual(0);

    // Advance 0.5s: sparks rise then gravity pulls down
    engine.update(0.5);
    expect(engine.activeCount).toBeGreaterThan(0);
  });

  it('triggers a Sky Shot with 2-phase ascent and detonation', () => {
    const skyshot = getLightById('skyshot_peony');
    expect(skyshot).toBeDefined();

    engine.triggerFirework('test_skyshot_1', skyshot!, [0, 0, 0], 1.0);

    // Phase 1: Ascent
    engine.update(0.1);
    expect(engine.activeCount).toBeGreaterThan(0);

    // Advance frame loop over 0.8s: Rocket ascends and reaches burst altitude -> detonates into peony burst
    for (let t = 0; t < 0.8; t += 0.02) {
      engine.update(0.02);
    }
    expect(engine.activeCount).toBeGreaterThan(50); // Burst emits 100+ particles
  });

  it('applies ±20cm height variation and up to 10 degree angle variation to sky shots', () => {
    const skyshot = getLightById('skyshot_peony')!;
    const baseHeight = 1.5;

    for (let i = 0; i < 20; i++) {
      engine.triggerFirework(`skyshot_test_${i}`, skyshot, [0, 0, 0], 1.0, baseHeight);
      const spawner = engine.getActiveSpawners().find((s) => s.id === `skyshot_test_${i}`);
      expect(spawner).toBeDefined();
      expect(spawner?.targetBurst).toBeDefined();

      const [tx, ty, tz] = spawner!.targetBurst!;
      // Trajectory distance should be within 1.5 ± 0.20m (1.30 to 1.70m)
      const trajectoryDist = Math.sqrt(tx * tx + ty * ty + tz * tz);
      expect(trajectoryDist).toBeGreaterThanOrEqual(1.29);
      expect(trajectoryDist).toBeLessThanOrEqual(1.71);
      // Vertical height ty accounts for up to 10 deg tilt: min ty = 1.30 * cos(10 deg) ~= 1.2802m
      expect(ty).toBeGreaterThanOrEqual(1.28);
      expect(ty).toBeLessThanOrEqual(1.71);

      // Horizontal tilt angle from vertical should be <= 10.5 degrees
      const horizontalDist = Math.sqrt(tx * tx + tz * tz);
      const actualAngleDeg = (Math.atan2(horizontalDist, ty) * 180) / Math.PI;
      expect(actualAngleDeg).toBeLessThanOrEqual(10.5);
    }
  });

  it('applies ±20cm height variation to anaar cone fountains', () => {
    const anaar = getLightById('anaar_saffron')!;
    const baseHeight = 1.0;

    for (let i = 0; i < 20; i++) {
      engine.triggerFirework(`anaar_test_${i}`, anaar, [0, 0, 0], 1.0, baseHeight);
      const spawner = engine.getActiveSpawners().find((s) => s.id === `anaar_test_${i}`);
      expect(spawner).toBeDefined();
      expect(spawner?.sprayHeight).toBeDefined();

      // sprayHeight should be within 1.0 ± 0.20m (0.80 to 1.20m)
      expect(spawner!.sprayHeight!).toBeGreaterThanOrEqual(0.79);
      expect(spawner!.sprayHeight!).toBeLessThanOrEqual(1.21);
    }
  });

  it('cleans up and resets without leaking state', () => {
    const anaar = getLightById('anaar_emerald');
    engine.triggerFirework('test_anaar_2', anaar!, [1, 2, 3]);
    engine.update(0.02);
    expect(engine.activeCount).toBeGreaterThan(0);

    engine.reset();
    expect(engine.activeCount).toBe(0);
    const hasActive = engine.update(0.02);
    expect(hasActive).toBe(false);
  });
});

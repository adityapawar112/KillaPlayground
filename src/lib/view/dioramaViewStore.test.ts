import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../state/useEditorStore';

describe('Diorama View & Animation Engine Store', () => {
  beforeEach(() => {
    const store = useEditorStore.getState();
    store.setIsPlaying(true);
    store.setViewMode('orbit');
    store.setTurntableSpeed(1.5);
    store.setCameraFov(45);
    store.resetAtmosphericModifiers();
    store.setIsCapturingScreenshot(false);
  });

  it('manages isPlaying toggle and explicit setting', () => {
    const store = useEditorStore.getState();
    expect(store.isPlaying).toBe(true);

    store.togglePlay();
    expect(useEditorStore.getState().isPlaying).toBe(false);

    store.togglePlay();
    expect(useEditorStore.getState().isPlaying).toBe(true);

    store.setIsPlaying(false);
    expect(useEditorStore.getState().isPlaying).toBe(false);
  });

  it('switches viewMode between orbit and turntable', () => {
    const store = useEditorStore.getState();
    expect(store.viewMode).toBe('orbit');

    store.setViewMode('turntable');
    expect(useEditorStore.getState().viewMode).toBe('turntable');

    store.setViewMode('orbit');
    expect(useEditorStore.getState().viewMode).toBe('orbit');
  });

  it('triggers 5-second celebratory firework salvo', () => {
    const store = useEditorStore.getState();
    expect(store.fireworkSalvoEndTime).toBe(0);

    const now = Date.now();
    store.triggerFiveSecondSalvo();
    expect(useEditorStore.getState().fireworkSalvoEndTime).toBeGreaterThanOrEqual(now + 4900);
    expect(useEditorStore.getState().fireworkSalvoEndTime).toBeLessThanOrEqual(now + 5100);
  });

  it('clamps turntableSpeed and cameraFov to safe boundaries', () => {
    const store = useEditorStore.getState();

    // Turntable speed clamped between 0.2 and 5.0 rpm
    store.setTurntableSpeed(10.0);
    expect(useEditorStore.getState().turntableSpeed).toBe(5.0);
    store.setTurntableSpeed(-2.0);
    expect(useEditorStore.getState().turntableSpeed).toBe(0.2);
    store.setTurntableSpeed(2.5);
    expect(useEditorStore.getState().turntableSpeed).toBe(2.5);

    // Camera FOV clamped between 20 and 80 degrees
    store.setCameraFov(100);
    expect(useEditorStore.getState().cameraFov).toBe(80);
    store.setCameraFov(10);
    expect(useEditorStore.getState().cameraFov).toBe(20);
    store.setCameraFov(55);
    expect(useEditorStore.getState().cameraFov).toBe(55);
  });

  it('manages atmospheric modifiers and resets them cleanly', () => {
    const store = useEditorStore.getState();
    expect(store.fogDensityMultiplier).toBe(1.0);
    expect(store.bounceIntensityMultiplier).toBe(1.0);
    expect(store.exposureMultiplier).toBe(1.0);

    store.setFogDensityMultiplier(2.2);
    store.setBounceIntensityMultiplier(1.8);
    store.setExposureMultiplier(1.3);

    expect(useEditorStore.getState().fogDensityMultiplier).toBe(2.2);
    expect(useEditorStore.getState().bounceIntensityMultiplier).toBe(1.8);
    expect(useEditorStore.getState().exposureMultiplier).toBe(1.3);

    store.resetAtmosphericModifiers();
    expect(useEditorStore.getState().fogDensityMultiplier).toBe(1.0);
    expect(useEditorStore.getState().bounceIntensityMultiplier).toBe(1.0);
    expect(useEditorStore.getState().exposureMultiplier).toBe(1.0);
  });

  it('dispatches celebration salvo on trigger and night mode transition', () => {
    const store = useEditorStore.getState();
    const prevTrigger = store.salvoTrigger;

    store.triggerCelebrationSalvo();
    expect(useEditorStore.getState().salvoTrigger).toBeGreaterThan(prevTrigger);

    const afterManual = useEditorStore.getState().salvoTrigger;
    // Transitioning to night mode triggers salvo
    store.setNightMode(true);
    expect(useEditorStore.getState().salvoTrigger).toBeGreaterThanOrEqual(afterManual);
    expect(useEditorStore.getState().nightMode).toBe(true);
  });

  it('tracks isCapturingScreenshot state for HUD suppression', () => {
    const store = useEditorStore.getState();
    expect(store.isCapturingScreenshot).toBe(false);

    store.setIsCapturingScreenshot(true);
    expect(useEditorStore.getState().isCapturingScreenshot).toBe(true);

    store.setIsCapturingScreenshot(false);
    expect(useEditorStore.getState().isCapturingScreenshot).toBe(false);
  });
});


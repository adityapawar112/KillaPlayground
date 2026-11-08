import { describe, it, expect } from 'vitest';
import {
  getAtmosphericConfigForPreset,
  drawAtmosphericSkyToCanvas,
  captureHeadlessSnapshot,
  captureHeadlessDioramaSnapshot,
  CAMERA_PERSPECTIVES,
} from './posterSnapshotEngine';

describe('Poster Snapshot Engine & Atmospheric Sky Pipeline', () => {
  it('resolves authentic atmospheric configurations for all 4 diurnal time presets', () => {
    const dawn = getAtmosphericConfigForPreset('dawn');
    expect(dawn.phaseName).toBe('Dawn');
    expect(dawn.isNight).toBe(false);

    const noon = getAtmosphericConfigForPreset('noon');
    expect(noon.phaseName).toBe('Noon');
    expect(noon.isNight).toBe(false);

    const sunset = getAtmosphericConfigForPreset('sunset');
    expect(sunset.phaseName).toBe('Golden Hour');
    expect(sunset.isNight).toBe(false);

    const night = getAtmosphericConfigForPreset('night');
    expect(night.phaseName).toBe('Diwali Night');
    expect(night.isNight).toBe(true);
  });

  it('draws atmospheric sky gradient on a canvas context mock without throwing', () => {
    const mockGradient = {
      addColorStop: () => {},
    };
    const mockCtx = {
      createRadialGradient: () => mockGradient,
      createLinearGradient: () => mockGradient,
      fillStyle: '',
      fillRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
    } as unknown as CanvasRenderingContext2D;

    for (const preset of ['dawn', 'noon', 'sunset', 'night'] as const) {
      const config = getAtmosphericConfigForPreset(preset);
      expect(() => drawAtmosphericSkyToCanvas(mockCtx, 400, 300, config)).not.toThrow();
    }
  });

  it('captures headless snapshots with requested camera perspectives and time presets', async () => {
    for (const pKey of Object.keys(CAMERA_PERSPECTIVES) as (keyof typeof CAMERA_PERSPECTIVES)[]) {
      const canvas = await captureHeadlessSnapshot({
        perspective: pKey,
        timePreset: 'sunset',
        width: 320,
        height: 180,
      });
      expect(canvas.width).toBe(320);
      expect(canvas.height).toBe(180);
    }
  });

  it('captures headless diorama snapshot at full HD 1920x1080', async () => {
    const shot = await captureHeadlessDioramaSnapshot(1920, 1080);
    expect(shot.canvas.width).toBe(1920);
    expect(shot.canvas.height).toBe(1080);
    expect(typeof shot.dataUrl).toBe('string');
  });
});

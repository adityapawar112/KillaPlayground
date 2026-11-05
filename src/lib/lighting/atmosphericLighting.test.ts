import { describe, it, expect } from 'vitest';
import {
  getAtmosphericLighting,
  lerpColor,
  lerpNum,
} from './atmosphericLighting';

describe('Atmospheric Lighting & Diurnal Solar Arc Engine', () => {
  it('correctly interpolates numbers and hex colors', () => {
    expect(lerpNum(10, 20, 0.5)).toBe(15);
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(lerpColor('#ff0000', '#00ff00', 1.0)).toBe('#00ff00');
  });

  it('computes authentic Dawn atmospheric properties at 06:00', () => {
    const dawn = getAtmosphericLighting(6.0, false, 12, 90);
    expect(dawn.phaseName).toBe('Dawn');
    expect(dawn.isNight).toBe(false);
    expect(dawn.sunColor.toLowerCase()).toBe('#fdba74');
    expect(dawn.sunIntensity).toBeCloseTo(1.45, 1);
    expect(dawn.ambientColor.toLowerCase()).toBe('#475569');
    expect(dawn.toneMappingExposure).toBeCloseTo(1.18, 2);
    expect(dawn.fogDensity).toBeCloseTo(0.005, 3);
  });

  it('computes crisp Solar Noon atmospheric properties at 12:00', () => {
    const noon = getAtmosphericLighting(12.0, false, 75, 180);
    expect(noon.phaseName).toBe('Noon');
    expect(noon.isNight).toBe(false);
    expect(noon.sunColor.toLowerCase()).toBe('#fffdf0');
    expect(noon.sunIntensity).toBeCloseTo(1.60, 1);
    expect(noon.ambientColor.toLowerCase()).toBe('#e0f2fe');
    expect(noon.toneMappingExposure).toBeCloseTo(1.20, 2);
    expect(noon.fogDensity).toBeCloseTo(0.003, 3);
  });

  it('computes dramatic Golden Hour properties with complementary indigo shadows at 17:30', () => {
    const golden = getAtmosphericLighting(17.5, false, 10, 270);
    expect(golden.phaseName).toBe('Golden Hour');
    expect(golden.isNight).toBe(false);
    expect(golden.sunColor.toLowerCase()).toBe('#fb923c');
    expect(golden.sunIntensity).toBeCloseTo(1.85, 1);
    expect(golden.ambientColor.toLowerCase()).toBe('#3730a3'); // Indigo shadows
    expect(golden.bounceColor.toLowerCase()).toBe('#ea580c'); // Terracotta GI
    expect(golden.bounceIntensity).toBeCloseTo(0.60, 1);
    expect(golden.toneMappingExposure).toBeCloseTo(1.25, 2);
  });

  it('computes mystical Diwali Night with silver-blue moonlight at 21:00', () => {
    const night = getAtmosphericLighting(21.0, true, 52, 230);
    expect(night.phaseName).toBe('Diwali Night');
    expect(night.isNight).toBe(true);
    expect(night.sunColor.toLowerCase()).toBe('#93c5fd'); // Moonlight
    expect(night.sunIntensity).toBeCloseTo(0.38, 1);
    expect(night.ambientColor.toLowerCase()).toBe('#080d1a');
    expect(night.fogColor.toLowerCase()).toBe('#050814');
    expect(night.toneMappingExposure).toBeCloseTo(1.10, 2);
  });

  it('honors explicit nightMode flag even if timeOfDay was daytime', () => {
    const forcedNight = getAtmosphericLighting(12.0, true, 52, 230);
    expect(forcedNight.isNight).toBe(true);
    expect(forcedNight.phaseName).toBe('Diwali Night');
    expect(forcedNight.sunColor.toLowerCase()).toBe('#93c5fd');
  });
});

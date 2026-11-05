import { describe, it, expect } from 'vitest';
import {
  getAtmosphericLighting,
  getDiyaLightStatus,
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
    expect(dawn.sunIntensity).toBeCloseTo(1.55, 1);
    expect(dawn.ambientColor.toLowerCase()).toBe('#64748b');
    expect(dawn.toneMappingExposure).toBeCloseTo(1.20, 2);
    expect(dawn.fogDensity).toBeCloseTo(0.004, 3);
  });

  it('computes crisp Solar Noon atmospheric properties at 12:00', () => {
    const noon = getAtmosphericLighting(12.0, false, 75, 180);
    expect(noon.phaseName).toBe('Noon');
    expect(noon.isNight).toBe(false);
    expect(noon.sunColor.toLowerCase()).toBe('#fffdf0');
    expect(noon.sunIntensity).toBeCloseTo(1.65, 1);
    expect(noon.ambientColor.toLowerCase()).toBe('#e0f2fe');
    expect(noon.toneMappingExposure).toBeCloseTo(1.20, 2);
    expect(noon.fogDensity).toBeCloseTo(0.003, 3);
  });

  it('computes radiant Golden Hour properties 30 mins before sunset at 17:30', () => {
    const golden = getAtmosphericLighting(17.5, false, 20, 255);
    expect(golden.phaseName).toBe('Golden Hour');
    expect(golden.isNight).toBe(false);
    expect(golden.sunColor.toLowerCase()).toBe('#f59e0b');
    expect(golden.sunIntensity).toBeCloseTo(2.80, 1);
    expect(golden.ambientColor.toLowerCase()).toBe('#fb923c'); // Warm golden ambient
    expect(golden.bounceColor.toLowerCase()).toBe('#ea580c'); // Terracotta GI
    expect(golden.bounceIntensity).toBeCloseTo(0.90, 1);
    expect(golden.toneMappingExposure).toBeCloseTo(1.30, 2);
  });

  it('computes luminous Full Moon Diwali Night with silver-blue landscape at 21:00', () => {
    const night = getAtmosphericLighting(21.0, true, 52, 230);
    expect(night.phaseName).toBe('Diwali Night');
    expect(night.isNight).toBe(true);
    expect(night.sunColor.toLowerCase()).toBe('#e0f2fe'); // Full moonlight
    expect(night.sunIntensity).toBeCloseTo(1.35, 1);
    expect(night.ambientColor.toLowerCase()).toBe('#475569'); // Visible slate/indigo ambient fill
    expect(night.fogColor.toLowerCase()).toBe('#0f172a');
    expect(night.toneMappingExposure).toBeCloseTo(1.28, 2);
  });

  it('honors explicit nightMode flag even if timeOfDay was daytime', () => {
    const forcedNight = getAtmosphericLighting(12.0, true, 52, 230);
    expect(forcedNight.isNight).toBe(true);
    expect(forcedNight.phaseName).toBe('Diwali Night');
    expect(forcedNight.sunColor.toLowerCase()).toBe('#e0f2fe');
  });

  it('computes correct diya light status across diurnal arc', () => {
    // Solar Noon: diyas dormant
    expect(getDiyaLightStatus(12.0, false).isLit).toBe(false);
    // Golden hour: diyas lit and glowing warmly
    const golden = getDiyaLightStatus(17.5, false);
    expect(golden.isLit).toBe(true);
    expect(golden.intensityFactor).toBeGreaterThan(0.7);
    // Diwali night: diyas fully lit
    const night = getDiyaLightStatus(21.0, false);
    expect(night.isLit).toBe(true);
    expect(night.intensityFactor).toBe(1.0);
    // Pre-dawn / dawn: diyas lit
    const dawn = getDiyaLightStatus(6.0, false);
    expect(dawn.isLit).toBe(true);
    // Explicit nightMode
    expect(getDiyaLightStatus(12.0, true).isLit).toBe(true);
  });
});

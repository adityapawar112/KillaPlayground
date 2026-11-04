import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  LIGHTING_MANIFEST,
  LIGHTING_CATEGORIES,
  getLightById,
  getLightsByCategory,
  searchLights,
} from './lightingManifest';

describe('Lighting & Fireworks Manifest Registry', () => {
  it('registers all 28 solid models and pyrotechnics', () => {
    expect(LIGHTING_MANIFEST.length).toBe(28);
  });

  it('contains the 3 required categories (diyas_clay, diyas_color, fireworks)', () => {
    expect(LIGHTING_CATEGORIES.length).toBe(3);
    const categoryIds = LIGHTING_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('diyas_clay');
    expect(categoryIds).toContain('diyas_color');
    expect(categoryIds).toContain('fireworks');
  });

  it('partitions models correctly into categories', () => {
    expect(getLightsByCategory('diyas_clay').length).toBe(9);
    expect(getLightsByCategory('diyas_color').length).toBe(9);
    expect(getLightsByCategory('fireworks').length).toBe(10);
  });

  it('ensures all 18 Diya GLB model files exist on disk in public/figurines/', () => {
    const diyas = LIGHTING_MANIFEST.filter((item) => item.category !== 'fireworks');
    expect(diyas.length).toBe(18);

    for (const diya of diyas) {
      expect(diya.modelPath).toBeDefined();
      const fullPath = path.join(process.cwd(), 'public', diya.modelPath!.replace(/^\//, ''));
      expect(fs.existsSync(fullPath), `Missing GLB: ${fullPath}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(1000);
    }
  });

  it('indexes all 5 Cone Fountains (Anaar) in distinct festive themes', () => {
    const anaars = LIGHTING_MANIFEST.filter((item) => item.fireworkType === 'anaar');
    expect(anaars.length).toBe(5);

    const themes = anaars.map((a) => a.colorTheme);
    expect(themes).toContain('saffron');
    expect(themes).toContain('emerald');
    expect(themes).toContain('violet');
    expect(themes).toContain('crimson');
    expect(themes).toContain('gold');
  });

  it('indexes all 5 Sky Shots (Aerial Shells) in authentic Diwali themes', () => {
    const skyShots = LIGHTING_MANIFEST.filter((item) => item.fireworkType === 'skyshot');
    expect(skyShots.length).toBe(5);

    const themes = skyShots.map((s) => s.colorTheme);
    expect(themes).toContain('peony');
    expect(themes).toContain('willow');
    expect(themes).toContain('palm');
    expect(themes).toContain('comet');
    expect(themes).toContain('ring');
  });

  it('ensures all 10 Firework preview thumbnail PNGs exist on disk in public/lighting/previews/', () => {
    const fireworks = LIGHTING_MANIFEST.filter((item) => item.category === 'fireworks');
    expect(fireworks.length).toBe(10);

    for (const fw of fireworks) {
      expect(fw.previewPath).toBeDefined();
      const fullPath = path.join(process.cwd(), 'public', fw.previewPath!.replace(/^\//, ''));
      expect(fs.existsSync(fullPath), `Missing preview thumbnail: ${fullPath}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(1000);
    }
  });

  it('retrieves items by ID', () => {
    const clay = getLightById('diya_clay_01');
    expect(clay).toBeDefined();
    expect(clay?.name).toBe('Clay Panati');

    const anaar = getLightById('anaar_saffron');
    expect(anaar).toBeDefined();
    expect(anaar?.fireworkType).toBe('anaar');

    const skyshot = getLightById('skyshot_peony');
    expect(skyshot).toBeDefined();
    expect(skyshot?.fireworkType).toBe('skyshot');

    expect(getLightById('non_existent')).toBeUndefined();
  });

  it('searches items by text query and category filter', () => {
    const anaarSearch = searchLights('fountain');
    expect(anaarSearch.length).toBe(5);

    const willowSearch = searchLights('willow');
    expect(willowSearch.length).toBe(1);
    expect(willowSearch[0].id).toBe('skyshot_willow');

    const paintedSearch = searchLights('', 'diyas_color');
    expect(paintedSearch.length).toBe(9);
  });
});


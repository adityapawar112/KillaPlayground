import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  FOLIAGE_CATEGORIES,
  FOLIAGE_MANIFEST,
  getFoliageById,
  getFoliageByCategory,
  searchFoliage,
} from './foliageManifest';

describe('Foliage Manifest & Catalog', () => {
  it('contains exactly 117 foliage items across 7 categories (grass excluded)', () => {
    expect(FOLIAGE_CATEGORIES.length).toBe(7);
    expect(FOLIAGE_MANIFEST.length).toBe(117);
  });

  it('validates that all foliage sprite files physically exist on disk', () => {
    for (const item of FOLIAGE_MANIFEST) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.defaultWidth).toBeGreaterThan(0);
      expect(item.defaultHeight).toBeGreaterThan(0);
      expect(item.spacing).toBeGreaterThan(0);

      const filePath = path.join(process.cwd(), 'public', item.spritePath);
      const exists = fs.existsSync(filePath);
      expect(exists).toBe(true);
    }
  });

  it('retrieves foliage items by ID', () => {
    const item = getFoliageById('banyan_broad_canopy');
    expect(item).toBeDefined();
    expect(item?.name).toBe('Banyan Broad Canopy');
    expect(item?.category).toBe('canopy_broadleaf');
  });

  it('filters foliage items by category', () => {
    const canopyItems = getFoliageByCategory('canopy_broadleaf');
    expect(canopyItems.length).toBe(50);
    for (const item of canopyItems) {
      expect(item.category).toBe('canopy_broadleaf');
    }

    const bushItems = getFoliageByCategory('bushes');
    expect(bushItems.length).toBe(11);
  });

  it('searches foliage items by keyword and category filter', () => {
    const banyans = searchFoliage('banyan');
    expect(banyans.length).toBeGreaterThan(0);
    for (const item of banyans) {
      expect(item.name.toLowerCase()).toContain('banyan');
    }

    const filteredBushes = searchFoliage('scrub', 'bushes');
    expect(filteredBushes.length).toBeGreaterThan(0);
    for (const item of filteredBushes) {
      expect(item.category).toBe('bushes');
    }
  });

  it('validates miniature diorama scale calibration (trees <= 0.6m, bushes <= 0.2m)', () => {
    for (const item of FOLIAGE_MANIFEST) {
      if (item.category === 'canopy_broadleaf') {
        expect(item.defaultHeight).toBeLessThanOrEqual(0.6);
        expect(item.defaultHeight).toBeGreaterThanOrEqual(0.2);
        expect(item.geometryMode).toBe('cross');
      }
      if (item.category === 'bushes') {
        expect(item.defaultHeight).toBeLessThanOrEqual(0.2);
        expect(item.geometryMode).toBe('single');
      }
    }
  });
});

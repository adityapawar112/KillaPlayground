import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  FIGURINE_MANIFEST,
  FIGURINE_CATEGORIES,
  getFigurineById,
  getFigurinesByCategory,
  searchFigurines,
} from './figurineManifest';

describe('Figurine Manifest & Asset Registry', () => {
  it('registers all 40 solid 3D models', () => {
    expect(FIGURINE_MANIFEST.length).toBe(40);
  });

  it('contains all 8 required categories', () => {
    expect(FIGURINE_CATEGORIES.length).toBe(8);
    const categoryIds = FIGURINE_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('royalty');
    expect(categoryIds).toContain('mavale');
    expect(categoryIds).toContain('musicians');
    expect(categoryIds).toContain('diyas_clay');
    expect(categoryIds).toContain('diyas_color');
    expect(categoryIds).toContain('yard_props');
    expect(categoryIds).toContain('architecture');
    expect(categoryIds).toContain('artillery');
  });

  it('ensures every model file exists in public/figurines/', () => {
    for (const item of FIGURINE_MANIFEST) {
      const fullPath = path.join(process.cwd(), 'public', item.modelPath.replace(/^\//, ''));
      expect(fs.existsSync(fullPath), `File missing: ${fullPath}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(1000); // Must be a valid non-empty file
    }
  });

  it('correctly partitions items by category', () => {
    expect(getFigurinesByCategory('royalty').length).toBe(4);
    expect(getFigurinesByCategory('mavale').length).toBe(4);
    expect(getFigurinesByCategory('musicians').length).toBe(2);
    expect(getFigurinesByCategory('diyas_clay').length).toBe(9);
    expect(getFigurinesByCategory('diyas_color').length).toBe(9);
    expect(getFigurinesByCategory('yard_props').length).toBe(2);
    expect(getFigurinesByCategory('architecture').length).toBe(7);
    expect(getFigurinesByCategory('artillery').length).toBe(3);
  });

  it('retrieves figurines by ID', () => {
    const king = getFigurineById('king_throne');
    expect(king).toBeDefined();
    expect(king?.name).toBe('King on Throne');

    const cannon = getFigurineById('cannon');
    expect(cannon).toBeDefined();
    expect(cannon?.name).toBe('Bastion Cannon');

    const unknown = getFigurineById('non_existent_id');
    expect(unknown).toBeUndefined();
  });

  it('searches figurines by query and category filter', () => {
    const tutariSearch = searchFigurines('tutari');
    expect(tutariSearch.length).toBeGreaterThanOrEqual(1);
    expect(tutariSearch[0].id).toBe('horn_blower');

    const claySearch = searchFigurines('', 'diyas_clay');
    expect(claySearch.length).toBe(9);

    const filteredSearch = searchFigurines('lotus', 'diyas_color');
    expect(filteredSearch.length).toBe(1);
    expect(filteredSearch[0].id).toBe('diya_color_06');

    const archSearch = searchFigurines('granary', 'architecture');
    expect(archSearch.length).toBe(1);
    expect(archSearch[0].id).toBe('granary');
  });

  it('has calibrated bounding dimensions and face counts for diorama scale', () => {
    for (const item of FIGURINE_MANIFEST) {
      expect(item.faceCount).toBeGreaterThan(50);
      expect(item.faceCount).toBeLessThan(6000);
      expect(item.dimensions.width).toBeGreaterThan(0.05);
      expect(item.dimensions.height).toBeGreaterThan(0.05);
      expect(item.dimensions.depth).toBeGreaterThan(0.05);
    }
  });
});


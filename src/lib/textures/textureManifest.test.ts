import { describe, it, expect } from 'vitest';
import {
  TEXTURE_MANIFEST,
  TEXTURE_CATEGORIES,
  getTextureById,
  getTextureByLayerIndex,
  getTexturesByCategory,
  searchTextures,
} from './textureManifest';

describe('Texture Manifest & Catalog (Ticket 06)', () => {
  it('contains exactly 52 textures', () => {
    expect(TEXTURE_MANIFEST.length).toBe(52);
  });

  it('contains all 8 authentic categories', () => {
    expect(TEXTURE_CATEGORIES.length).toBe(8);
    const categoryIds = TEXTURE_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toEqual([
      'Dirt',
      'Grass',
      'Gravel',
      'Rock',
      'Rocky',
      'Sand',
      'Bricks',
      'Water',
    ]);
  });

  it('verifies exact category counts matching public/textures directory', () => {
    expect(getTexturesByCategory('Dirt').length).toBe(8);
    expect(getTexturesByCategory('Grass').length).toBe(8);
    expect(getTexturesByCategory('Gravel').length).toBe(8);
    expect(getTexturesByCategory('Rock').length).toBe(8);
    expect(getTexturesByCategory('Rocky').length).toBe(8);
    expect(getTexturesByCategory('Sand').length).toBe(8);
    expect(getTexturesByCategory('Bricks').length).toBe(3);
    expect(getTexturesByCategory('Water').length).toBe(1);
  });

  it('assigns unique, consecutive layer indices from 0 to 51', () => {
    const indices = TEXTURE_MANIFEST.map((t) => t.layerIndex).sort((a, b) => a - b);
    expect(indices[0]).toBe(0);
    expect(indices[indices.length - 1]).toBe(51);
    const uniqueIndices = new Set(indices);
    expect(uniqueIndices.size).toBe(52);
  });

  it('looks up textures correctly by ID and layer index', () => {
    const dirt03 = getTextureById('dirt_03');
    expect(dirt03).toBeDefined();
    expect(dirt03?.name).toBe('Red Laterite');
    expect(dirt03?.category).toBe('Dirt');

    const byIdx = getTextureByLayerIndex(dirt03!.layerIndex);
    expect(byIdx?.id).toBe('dirt_03');

    const water = getTextureById('water_blue_tarp');
    expect(water).toBeDefined();
    expect(water?.layerIndex).toBe(51);
    expect(water?.category).toBe('Water');
  });

  it('searches textures by query and category filter', () => {
    const searchRes = searchTextures('laterite');
    expect(searchRes.length).toBeGreaterThanOrEqual(1);
    expect(searchRes[0].id).toBe('dirt_03');

    const gravelRes = searchTextures('', 'Gravel');
    expect(gravelRes.length).toBe(8);
  });
});


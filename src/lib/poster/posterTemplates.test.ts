import { describe, it, expect } from 'vitest';
import {
  POSTER_TEMPLATES,
  PosterTemplateId,
  getAvailableGridLayouts,
  calculateGridSlotRects,
  GridLayoutType,
  ImageCount,
} from './posterTemplates';

describe('Poster Templates Manifest & Config', () => {
  const templateIds: PosterTemplateId[] = [
    'archway_cannon',
    'cream_maratha_ensemble',
    'maroon_horseback',
    'saffron_flag_bearer',
  ];

  it('declares all 4 required festival templates with appropriate architectural names', () => {
    templateIds.forEach((id) => {
      const template = POSTER_TEMPLATES[id];
      expect(template).toBeDefined();
      expect(template.id).toBe(id);
      expect(template.baseSvg).toBeTruthy();
      expect(template.previewUrl).toBeTruthy();
      expect(template.overlaySvgs.length).toBeGreaterThanOrEqual(1);

      // Verify no warrior or chhatrapati naming
      expect(template.name.toLowerCase()).not.toContain('warrior');
      expect(template.name.toLowerCase()).not.toContain('chatrapati');
      expect(template.name.toLowerCase()).not.toContain('chhatrapati');
    });

    expect(POSTER_TEMPLATES.archway_cannon.name).toBe('Citadel Archway');
    expect(POSTER_TEMPLATES.cream_maratha_ensemble.name).toBe('Royal Courtyard');
    expect(POSTER_TEMPLATES.maroon_horseback.name).toBe('Moonlit Fortress');
    expect(POSTER_TEMPLATES.saffron_flag_bearer.name).toBe('Sahyadri Sunrise');

    // Verify saffron_flag_bearer only has layer_03 (layer_02 removed)
    expect(POSTER_TEMPLATES.saffron_flag_bearer.overlaySvgs).toEqual([
      '/posters/saffron_flag_bearer/layer_03_flag_bearer_foreground.svg',
    ]);
  });

  it('validates normalized grid bounds within [0, 1]', () => {
    templateIds.forEach((id) => {
      const bounds = POSTER_TEMPLATES[id].gridBounds;
      expect(bounds.x).toBeGreaterThan(0);
      expect(bounds.x).toBeLessThan(1);
      expect(bounds.y).toBeGreaterThan(0);
      expect(bounds.y).toBeLessThan(1);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(1);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(1);
    });
  });
});

describe('Dynamic Grid Layout Calculator', () => {
  const sampleBounds = {
    x: 0.2,
    y: 0.25,
    width: 0.6,
    height: 0.5,
    defaultGap: 6,
    borderRadius: 4,
  };

  it('returns appropriate grid layouts for image counts 1 to 4', () => {
    const count1 = getAvailableGridLayouts(1);
    expect(count1.some((g) => g.id === 'single')).toBe(true);

    const count2 = getAvailableGridLayouts(2);
    expect(count2.some((g) => g.id === 'stack-2')).toBe(true);
    expect(count2.some((g) => g.id === 'cols-2')).toBe(true);

    const count3 = getAvailableGridLayouts(3);
    expect(count3.some((g) => g.id === 'stack-3')).toBe(true);
    expect(count3.some((g) => g.id === 'hero-top-2-bottom')).toBe(true);

    const count4 = getAvailableGridLayouts(4);
    expect(count4.some((g) => g.id === 'stack-4')).toBe(true);
    expect(count4.some((g) => g.id === 'quad-4')).toBe(true);
  });

  const testLayouts: { count: ImageCount; layout: GridLayoutType; expectedSlots: number }[] = [
    { count: 1, layout: 'single', expectedSlots: 1 },
    { count: 2, layout: 'stack-2', expectedSlots: 2 },
    { count: 2, layout: 'cols-2', expectedSlots: 2 },
    { count: 3, layout: 'stack-3', expectedSlots: 3 },
    { count: 3, layout: 'hero-top-2-bottom', expectedSlots: 3 },
    { count: 3, layout: 'hero-bottom-2-top', expectedSlots: 3 },
    { count: 4, layout: 'stack-4', expectedSlots: 4 },
    { count: 4, layout: 'quad-4', expectedSlots: 4 },
    { count: 4, layout: 'hero-top-3-stack', expectedSlots: 4 },
  ];

  testLayouts.forEach(({ layout, expectedSlots }) => {
    it(`calculates valid slot rects for layout: ${layout}`, () => {
      const canvasW = 1080;
      const canvasH = 1350;
      const slots = calculateGridSlotRects(sampleBounds, layout, canvasW, canvasH);

      expect(slots.length).toBe(expectedSlots);

      slots.forEach((slot, i) => {
        expect(slot.slotIndex).toBe(i);
        expect(slot.width).toBeGreaterThan(0);
        expect(slot.height).toBeGreaterThan(0);

        // Slot must sit within the outer bounding box
        const boxX = sampleBounds.x * canvasW;
        const boxY = sampleBounds.y * canvasH;
        const boxW = sampleBounds.width * canvasW;
        const boxH = sampleBounds.height * canvasH;

        expect(slot.x).toBeGreaterThanOrEqual(boxX - 0.1);
        expect(slot.y).toBeGreaterThanOrEqual(boxY - 0.1);
        expect(slot.x + slot.width).toBeLessThanOrEqual(boxX + boxW + 0.1);
        expect(slot.y + slot.height).toBeLessThanOrEqual(boxY + boxH + 0.1);
      });
    });
  });
});


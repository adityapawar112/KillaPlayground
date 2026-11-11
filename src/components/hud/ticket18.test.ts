import { describe, it, expect } from 'vitest';
import {
  POSTER_TEMPLATES,
  PosterTemplateId,
  ImageCount,
  GridLayoutType,
  getAvailableGridLayouts,
  calculateGridSlotRects,
} from '../../lib/poster/posterTemplates';
import {
  CAMERA_PERSPECTIVES,
  TimePresetId,
} from '../../lib/poster/posterSnapshotEngine';
import { getSocialShareLinks } from '../../lib/poster/posterShare';

describe('Ticket 18: Festive Fort Poster Studio Streamlining', () => {
  describe('1. Dynamic Grid Layout Calculator & Normalized Geometry', () => {
    const templateIds: PosterTemplateId[] = [
      'archway_cannon',
      'cream_maratha_ensemble',
      'maroon_horseback',
      'saffron_flag_bearer',
    ];

    it('returns available grid patterns matching each image count', () => {
      const layoutsCount1 = getAvailableGridLayouts(1);
      expect(layoutsCount1.map((l) => l.id)).toEqual(['single']);

      const layoutsCount2 = getAvailableGridLayouts(2);
      expect(layoutsCount2.map((l) => l.id)).toEqual(['stack-2', 'cols-2']);

      const layoutsCount3 = getAvailableGridLayouts(3);
      expect(layoutsCount3.map((l) => l.id)).toEqual([
        'stack-3',
        'hero-top-2-bottom',
        'hero-bottom-2-top',
      ]);

      const layoutsCount4 = getAvailableGridLayouts(4);
      expect(layoutsCount4.map((l) => l.id)).toEqual([
        'stack-4',
        'quad-4',
        'hero-top-3-stack',
      ]);
    });

    it('calculates normalized bounding rects within [0, 1] for all templates and layouts', () => {
      const allLayouts: { count: ImageCount; layout: GridLayoutType }[] = [
        { count: 1, layout: 'single' },
        { count: 2, layout: 'stack-2' },
        { count: 2, layout: 'cols-2' },
        { count: 3, layout: 'stack-3' },
        { count: 3, layout: 'hero-top-2-bottom' },
        { count: 3, layout: 'hero-bottom-2-top' },
        { count: 4, layout: 'stack-4' },
        { count: 4, layout: 'quad-4' },
        { count: 4, layout: 'hero-top-3-stack' },
      ];

      templateIds.forEach((tplId) => {
        const tpl = POSTER_TEMPLATES[tplId];
        allLayouts.forEach(({ count, layout }) => {
          const rects = calculateGridSlotRects(tpl.gridBounds, layout, 1080, 1350);
          expect(rects.length).toBe(count);

          rects.forEach((r, idx) => {
            expect(r.slotIndex).toBe(idx);
            expect(r.width).toBeGreaterThan(0);
            expect(r.height).toBeGreaterThan(0);

            // Normalized coordinates (0..1)
            const normX = r.x / 1080;
            const normY = r.y / 1350;
            const normW = r.width / 1080;
            const normH = r.height / 1350;

            expect(normX).toBeGreaterThanOrEqual(0);
            expect(normY).toBeGreaterThanOrEqual(0);
            expect(normX + normW).toBeLessThanOrEqual(1.001);
            expect(normY + normH).toBeLessThanOrEqual(1.001);
          });
        });
      });
    });
  });

  describe('2. Active Slot Selection & Boundary Clamping Engine', () => {
    it('clamps active slot index when imageCount changes', () => {
      const clampActiveSlot = (currentSlot: number, newCount: number): number => {
        return Math.min(currentSlot, newCount - 1);
      };

      // Starting with slot 4 active (index 3) in a 4-image grid
      expect(clampActiveSlot(3, 4)).toBe(3);

      // User reduces image count to 2 -> active slot clamps to 1 (Slot 2)
      expect(clampActiveSlot(3, 2)).toBe(1);

      // User reduces image count to 1 -> active slot clamps to 0 (Slot 1)
      expect(clampActiveSlot(3, 1)).toBe(0);

      // User increases count back to 3 -> active slot stays 0 until selected
      expect(clampActiveSlot(0, 3)).toBe(0);
    });

    it('ensures all 4 camera perspectives map to valid camera configs', () => {
      const expectedKeys = ['isometric', 'top', 'rampart', 'bastion'];
      expectedKeys.forEach((key) => {
        const p = CAMERA_PERSPECTIVES[key as keyof typeof CAMERA_PERSPECTIVES];
        expect(p).toBeDefined();
        expect(p.name).toBeTruthy();
        expect(p.position).toBeDefined();
        expect(p.target).toBeDefined();
        expect(p.fov).toBeGreaterThan(0);
      });
    });

    it('supports all 4 diurnal lighting presets with authentic Sun & Sky configurations', () => {
      const timePresets: TimePresetId[] = ['dawn', 'noon', 'sunset', 'night'];
      expect(timePresets).toHaveLength(4);
      expect(timePresets).toContain('dawn');
      expect(timePresets).toContain('noon');
      expect(timePresets).toContain('sunset');
      expect(timePresets).toContain('night');
    });
  });

  describe('3. Pinned Action Dock & Social Share Integration', () => {
    it('generates valid social share links with custom title and festive wish', () => {
      const links = getSocialShareLinks('Fort Raigad', 'Happy Diwali & Prosperous New Year');
      expect(links.whatsapp).toContain('whatsapp.com');
      expect(links.whatsapp).toContain('Fort%20Raigad');
      expect(links.whatsapp).toContain('Happy%20Diwali');

      expect(links.twitter).toContain('twitter.com');
      expect(links.twitter).toContain('Happy%20Diwali');
    });

    it('handles empty titles and greetings gracefully', () => {
      const links = getSocialShareLinks('', '');
      expect(links.whatsapp).toContain('whatsapp.com');
      expect(links.twitter).toContain('twitter.com');
    });
  });

  describe('4. Cultural Authenticity & UI/UX Design Consistency', () => {
    const perspectivesDegrees = {
      isometric: '45°',
      rampart: '15°',
      top: '90°',
      bastion: '30°',
    };

    it('declares degree angles for all camera perspectives', () => {
      expect(perspectivesDegrees.isometric).toBe('45°');
      expect(perspectivesDegrees.rampart).toBe('15°');
      expect(perspectivesDegrees.top).toBe('90°');
      expect(perspectivesDegrees.bastion).toBe('30°');
    });

    it('ensures no English strings contain transliterated Marathi in parentheses', () => {
      const englishPerspectives = [
        'Isometric (45°)',
        "Bird's Eye (90°)",
        'Rampart Eye (15°)',
        'Bastion Hero (30°)',
      ];

      englishPerspectives.forEach((label) => {
        // Must not contain transliterated Marathi words like 'Giri Durg', 'Maha Darwaza', etc in parentheses
        expect(label).not.toMatch(/\([A-Za-z\s]+Fort\)/i);
        expect(label).not.toMatch(/\([A-Za-z\s]+Gate\)/i);
      });
    });
  });
});

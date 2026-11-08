/**
 * posterTemplates.ts
 * Template configurations and dynamic grid geometry for the Festive Poster Studio.
 * Supports the 4 festival vector templates with multi-layer overlays and 1 to 4 images.
 */

export type PosterTemplateId =
  | 'archway_cannon'
  | 'cream_maratha_ensemble'
  | 'maroon_horseback'
  | 'saffron_flag_bearer';

export type ImageCount = 1 | 2 | 3 | 4;

export type GridLayoutType =
  | 'single'
  | 'stack-2'
  | 'cols-2'
  | 'stack-3'
  | 'hero-top-2-bottom'
  | 'hero-bottom-2-top'
  | 'stack-4'
  | 'quad-4'
  | 'hero-top-3-stack';

export interface GridSlotRect {
  slotIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PosterTemplateConfig {
  id: PosterTemplateId;
  name: string;
  marathiName: string;
  description: string;
  previewUrl: string;
  baseSvg: string;
  overlaySvgs: string[];
  gridBounds: {
    x: number;      // Normalized 0..1
    y: number;      // Normalized 0..1
    width: number;  // Normalized 0..1
    height: number; // Normalized 0..1
    defaultGap: number;
    borderRadius: number;
  };
  textColor: string;
  accentColor: string;
}

export const POSTER_TEMPLATES: Record<PosterTemplateId, PosterTemplateConfig> = {
  archway_cannon: {
    id: 'archway_cannon',
    name: 'Citadel Archway',
    marathiName: 'किल्ला महाद्वार',
    description: 'Stone bastion archway with decorative lanterns, cannon foreground, and celebratory diyas.',
    previewUrl: '/posters/archway_cannon.png',
    baseSvg: '/posters/archway_cannon/design_01_archway_cannon.svg',
    overlaySvgs: [
      '/posters/archway_cannon/layer_02_header_badge.svg',
      '/posters/archway_cannon/layer_03_cannon_terrain_base.svg',
    ],
    gridBounds: {
      x: 0.205,
      y: 0.265,
      width: 0.590,
      height: 0.535,
      defaultGap: 6,
      borderRadius: 4,
    },
    textColor: '#FAF8F5',
    accentColor: '#E85D04',
  },

  cream_maratha_ensemble: {
    id: 'cream_maratha_ensemble',
    name: 'Royal Courtyard',
    marathiName: 'राजदरबार उत्सव',
    description: 'Traditional courtyard celebration with fanfare horn and festive diorama assembly.',
    previewUrl: '/posters/cream_maratha_ensemble.png',
    baseSvg: '/posters/cream_maratha_ensemble/design_04_cream_maratha_ensemble.svg',
    overlaySvgs: [
      '/posters/cream_maratha_ensemble/layer_02_maratha_ensemble_foreground.svg',
    ],
    gridBounds: {
      x: 0.170,
      y: 0.220,
      width: 0.660,
      height: 0.520,
      defaultGap: 6,
      borderRadius: 4,
    },
    textColor: '#4B382C',
    accentColor: '#B85F45',
  },

  maroon_horseback: {
    id: 'maroon_horseback',
    name: 'Moonlit Fortress',
    marathiName: 'चंद्रप्रकाशित किल्ला',
    description: 'Twilight mountain fortress under a radiant full moon and Diwali night fireworks.',
    previewUrl: '/posters/maroon_horseback.png',
    baseSvg: '/posters/maroon_horseback/design_02_maroon_horseback.svg',
    overlaySvgs: [
      '/posters/maroon_horseback/layer_02_sky_fireworks_moon.svg',
      '/posters/maroon_horseback/layer_03_horseback_rider_foreground.svg',
    ],
    gridBounds: {
      x: 0.240,
      y: 0.210,
      width: 0.640,
      height: 0.530,
      defaultGap: 6,
      borderRadius: 4,
    },
    textColor: '#FFFBEB',
    accentColor: '#F59E0B',
  },

  saffron_flag_bearer: {
    id: 'saffron_flag_bearer',
    name: 'Sahyadri Sunrise',
    marathiName: 'सह्याद्री सूर्योदय',
    description: 'Golden sunrise dawn overlooking misty Sahyadri fortress ramparts.',
    previewUrl: '/posters/saffron_flag_bearer.png',
    baseSvg: '/posters/saffron_flag_bearer/design_03_saffron_flag_bearer.svg',
    overlaySvgs: [
      '/posters/saffron_flag_bearer/layer_03_flag_bearer_foreground.svg',
    ],
    gridBounds: {
      x: 0.210,
      y: 0.220,
      width: 0.630,
      height: 0.540,
      defaultGap: 6,
      borderRadius: 4,
    },
    textColor: '#FAF8F5',
    accentColor: '#E85D04',
  },
};

/**
 * Returns the available grid layout options for a given image count
 */
export function getAvailableGridLayouts(count: ImageCount): { id: GridLayoutType; label: string; iconLabel: string }[] {
  switch (count) {
    case 1:
      return [
        { id: 'single', label: 'Full Hero View', iconLabel: '1 Frame' },
      ];
    case 2:
      return [
        { id: 'stack-2', label: '2-Strip Stack', iconLabel: '2 Rows' },
        { id: 'cols-2', label: 'Side-by-Side', iconLabel: '2 Cols' },
      ];
    case 3:
      return [
        { id: 'stack-3', label: '3-Strip Stack', iconLabel: '3 Rows' },
        { id: 'hero-top-2-bottom', label: 'Hero Top + 2 Split', iconLabel: '1 + 2' },
        { id: 'hero-bottom-2-top', label: '2 Split + Hero Bottom', iconLabel: '2 + 1' },
      ];
    case 4:
    default:
      return [
        { id: 'stack-4', label: '4-Strip Stack (Default)', iconLabel: '4 Rows' },
        { id: 'quad-4', label: '2×2 Quad Grid', iconLabel: '2 × 2' },
        { id: 'hero-top-3-stack', label: 'Hero Top + 3 Strips', iconLabel: '1 + 3' },
      ];
  }
}

/**
 * Calculates pixel rects for each grid slot inside the template window
 */
export function calculateGridSlotRects(
  gridBounds: PosterTemplateConfig['gridBounds'],
  gridType: GridLayoutType,
  canvasWidth: number = 1080,
  canvasHeight: number = 1350,
  gapOverride?: number
): GridSlotRect[] {
  const boxX = gridBounds.x * canvasWidth;
  const boxY = gridBounds.y * canvasHeight;
  const boxW = gridBounds.width * canvasWidth;
  const boxH = gridBounds.height * canvasHeight;
  const gap = gapOverride ?? gridBounds.defaultGap;

  switch (gridType) {
    case 'single': {
      return [{ slotIndex: 0, x: boxX, y: boxY, width: boxW, height: boxH }];
    }

    case 'stack-2': {
      const h = (boxH - gap) / 2;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: boxW, height: h },
        { slotIndex: 1, x: boxX, y: boxY + h + gap, width: boxW, height: h },
      ];
    }

    case 'cols-2': {
      const w = (boxW - gap) / 2;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: w, height: boxH },
        { slotIndex: 1, x: boxX + w + gap, y: boxY, width: w, height: boxH },
      ];
    }

    case 'stack-3': {
      const h = (boxH - 2 * gap) / 3;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: boxW, height: h },
        { slotIndex: 1, x: boxX, y: boxY + h + gap, width: boxW, height: h },
        { slotIndex: 2, x: boxX, y: boxY + 2 * (h + gap), width: boxW, height: h },
      ];
    }

    case 'hero-top-2-bottom': {
      const heroH = (boxH - gap) * 0.55;
      const subH = (boxH - gap) - heroH;
      const subW = (boxW - gap) / 2;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: boxW, height: heroH },
        { slotIndex: 1, x: boxX, y: boxY + heroH + gap, width: subW, height: subH },
        { slotIndex: 2, x: boxX + subW + gap, y: boxY + heroH + gap, width: subW, height: subH },
      ];
    }

    case 'hero-bottom-2-top': {
      const heroH = (boxH - gap) * 0.55;
      const subH = (boxH - gap) - heroH;
      const subW = (boxW - gap) / 2;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: subW, height: subH },
        { slotIndex: 1, x: boxX + subW + gap, y: boxY, width: subW, height: subH },
        { slotIndex: 2, x: boxX, y: boxY + subH + gap, width: boxW, height: heroH },
      ];
    }

    case 'quad-4': {
      const w = (boxW - gap) / 2;
      const h = (boxH - gap) / 2;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: w, height: h },
        { slotIndex: 1, x: boxX + w + gap, y: boxY, width: w, height: h },
        { slotIndex: 2, x: boxX, y: boxY + h + gap, width: w, height: h },
        { slotIndex: 3, x: boxX + w + gap, y: boxY + h + gap, width: w, height: h },
      ];
    }

    case 'hero-top-3-stack': {
      const heroH = (boxH - 3 * gap) * 0.40;
      const subH = ((boxH - 3 * gap) - heroH) / 3;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: boxW, height: heroH },
        { slotIndex: 1, x: boxX, y: boxY + heroH + gap, width: boxW, height: subH },
        { slotIndex: 2, x: boxX, y: boxY + heroH + gap + (subH + gap), width: boxW, height: subH },
        { slotIndex: 3, x: boxX, y: boxY + heroH + gap + 2 * (subH + gap), width: boxW, height: subH },
      ];
    }

    case 'stack-4':
    default: {
      const h = (boxH - 3 * gap) / 4;
      return [
        { slotIndex: 0, x: boxX, y: boxY, width: boxW, height: h },
        { slotIndex: 1, x: boxX, y: boxY + h + gap, width: boxW, height: h },
        { slotIndex: 2, x: boxX, y: boxY + 2 * (h + gap), width: boxW, height: h },
        { slotIndex: 3, x: boxX, y: boxY + 3 * (h + gap), width: boxW, height: h },
      ];
    }
  }
}


/**
 * posterCompositor.ts
 * 5-Layer 2D canvas compositor for the Festive Poster Studio.
 * Composites the vector SVG background, diorama grid view slots,
 * foreground overlay SVGs, and festive Devanagari typography.
 */

import {
  PosterTemplateConfig,
  GridLayoutType,
  calculateGridSlotRects,
} from './posterTemplates';

export interface PosterTextOptions {
  fortTitle?: string;
  builderName?: string;
  builderCreditLine?: string;
  festiveGreeting?: string;
  stampStyle?: 'traditional-banner' | 'minimal-stamp' | 'royal-plaque' | 'none';
  fontFamily?: 'Yatra One' | 'Modak' | 'Inter';
  showBuilderCredit?: boolean;
}

export interface ComposePosterParams {
  template: PosterTemplateConfig;
  gridType: GridLayoutType;
  slotCanvases: (HTMLCanvasElement | null)[];
  textOptions?: PosterTextOptions;
  canvasWidth?: number;
  canvasHeight?: number;
}

const svgImageCache = new Map<string, HTMLImageElement>();

/**
 * Loads and caches an SVG image as an HTMLImageElement
 */
export function loadSvgImage(url: string): Promise<HTMLImageElement> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot load SVG in non-browser environment'));
  }

  if (svgImageCache.has(url)) {
    return Promise.resolve(svgImageCache.get(url)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      svgImageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn(`Failed to load SVG asset: ${url}`, err);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Preloads all SVGs for a given template
 */
export async function preloadTemplateAssets(template: PosterTemplateConfig): Promise<void> {
  const urls = [template.baseSvg, ...template.overlaySvgs];
  await Promise.all(urls.map((url) => loadSvgImage(url).catch(() => null)));
}

/**
 * Draws an image with object-fit: cover into a destination rectangle
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement | HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgW = img.width || 1;
  const imgH = img.height || 1;
  const scale = Math.max(dw / imgW, dh / imgH);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (imgW - sw) / 2;
  const sy = (imgH - sh) / 2;

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * Ensures Google Font is loaded before measuring or drawing text
 */
async function ensureFont(family: string, size: number = 36): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.load(`${size}px "${family}"`);
    } catch {
      // Graceful fallback to default sans-serif
    }
  }
}

/**
 * Main 5-Layer Poster Compositor Function
 */
export async function composeFestivePoster(params: ComposePosterParams): Promise<HTMLCanvasElement> {
  const {
    template,
    gridType,
    slotCanvases,
    textOptions = {},
    canvasWidth = 1080,
    canvasHeight = 1350,
  } = params;

  const {
    fortTitle = 'The Killa Playground',
    builderName = 'Mavala',
    builderCreditLine,
    festiveGreeting = 'Happy Diwali & Prosperous New Year',
    stampStyle = 'traditional-banner',
    fontFamily = 'Yatra One',
    showBuilderCredit = true,
  } = textOptions;

  const creditText = builderCreditLine || `Crafted by: ${builderName} • 2026`;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // -------------------------------------------------------------
  // LAYER 1: Base Vector SVG Background
  // -------------------------------------------------------------
  try {
    const baseImg = await loadSvgImage(template.baseSvg);
    ctx.drawImage(baseImg, 0, 0, canvasWidth, canvasHeight);
  } catch (err) {
    console.warn('Falling back to earthen gradient for base layer:', err);
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#5A3D28');
    grad.addColorStop(1, '#1A1410');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // -------------------------------------------------------------
  // LAYER 2: Multi-Angle Diorama Grid Slots
  // -------------------------------------------------------------
  const slots = calculateGridSlotRects(
    template.gridBounds,
    gridType,
    canvasWidth,
    canvasHeight
  );

  const radius = template.gridBounds.borderRadius || 4;

  slots.forEach((slot, index) => {
    const slotImg = slotCanvases[index];

    ctx.save();

    // Clip rounded rectangle for each photo slot without outer borders or shadow bleed
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(slot.x, slot.y, slot.width, slot.height, radius);
    } else {
      ctx.rect(slot.x, slot.y, slot.width, slot.height);
    }
    ctx.clip();

    // Draw 3D view image with object-fit: cover
    if (slotImg) {
      drawCover(ctx, slotImg, slot.x, slot.y, slot.width, slot.height);
    } else {
      // Subtle translucent placeholder while slot is unassigned / loading
      ctx.fillStyle = 'rgba(35, 33, 30, 0.45)';
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
      ctx.fillStyle = '#D9C9B4';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Slot ${index + 1}`, slot.x + slot.width / 2, slot.y + slot.height / 2);
    }

    ctx.restore();
  });

  // -------------------------------------------------------------
  // LAYER 3 & 4: Overlay Vector SVGs (Badge, Foreground Cannon, Figures)
  // -------------------------------------------------------------
  for (const overlayUrl of template.overlaySvgs) {
    try {
      const overlayImg = await loadSvgImage(overlayUrl);
      ctx.drawImage(overlayImg, 0, 0, canvasWidth, canvasHeight);
    } catch (err) {
      console.warn(`Could not render overlay SVG: ${overlayUrl}`, err);
    }
  }

  // -------------------------------------------------------------
  // LAYER 5: Customizable Text, Watermark & Festive Stamp Presets
  // -------------------------------------------------------------
  if (stampStyle !== 'none' && showBuilderCredit) {
    await ensureFont(fontFamily, 36);

    ctx.save();

    if (stampStyle === 'traditional-banner') {
      // Elegant bottom banner strip
      const bannerH = 68;
      const bannerY = canvasHeight - bannerH - 18;
      const bannerW = canvasWidth * 0.72;
      const bannerX = (canvasWidth - bannerW) / 2;

      // Soft banner background
      ctx.fillStyle = 'rgba(250, 248, 245, 0.94)';
      ctx.strokeStyle = template.accentColor || '#E85D04';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(bannerX, bannerY, bannerW, bannerH, 12);
      } else {
        ctx.rect(bannerX, bannerY, bannerW, bannerH);
      }
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();

      // Top line: Fort Title & Festive Greeting
      ctx.fillStyle = '#4B382C';
      ctx.font = `bold 22px "${fontFamily}", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const mainText = festiveGreeting ? `${fortTitle} • ${festiveGreeting}` : fortTitle;
      ctx.fillText(mainText, canvasWidth / 2, bannerY + 22);

      // Bottom line: Builder Credit
      ctx.fillStyle = '#B85F45';
      ctx.font = `600 15px "${fontFamily}", sans-serif`;
      ctx.fillText(creditText, canvasWidth / 2, bannerY + 47);
    } else if (stampStyle === 'minimal-stamp') {
      // Subtle corner watermark seal
      const stampX = canvasWidth - 28;
      const stampY = canvasHeight - 28;

      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      ctx.fillStyle = 'rgba(250, 248, 245, 0.92)';
      ctx.font = `bold 18px "${fontFamily}", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText(fortTitle, stampX, stampY - 22);

      ctx.fillStyle = 'rgba(253, 230, 138, 0.95)';
      ctx.font = `600 14px "${fontFamily}", sans-serif`;
      ctx.fillText(creditText, stampX, stampY);
    } else if (stampStyle === 'royal-plaque') {
      // Royal Basalt Plaque / Shilalekh Inscription Cartouche
      const plaqueH = 64;
      const rawY = (template.gridBounds.y + template.gridBounds.height) * canvasHeight + 14;
      const maxY = canvasHeight - plaqueH - 24;
      const plaqueY = Math.min(rawY, maxY);
      const plaqueW = Math.min(canvasWidth * 0.72, 760);
      const plaqueX = (canvasWidth - plaqueW) / 2;

      // 1. Plaque Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;

      // 2. Deep Basalt Stone Background with Gradient
      const stoneGrad = ctx.createLinearGradient(plaqueX, plaqueY, plaqueX, plaqueY + plaqueH);
      stoneGrad.addColorStop(0, '#26201B');
      stoneGrad.addColorStop(0.5, '#1B1714');
      stoneGrad.addColorStop(1, '#151210');

      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(plaqueX, plaqueY, plaqueW, plaqueH, 8);
      } else {
        ctx.rect(plaqueX, plaqueY, plaqueW, plaqueH);
      }
      ctx.fill();

      // Clear shadow
      ctx.shadowColor = 'transparent';

      // 3. Ornate Double Gold Trim
      // Outer gold trim
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner hairline gold inlay
      const inset = 3.5;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(plaqueX + inset, plaqueY + inset, plaqueW - 2 * inset, plaqueH - 2 * inset, 6);
      } else {
        ctx.rect(plaqueX + inset, plaqueY + inset, plaqueW - 2 * inset, plaqueH - 2 * inset);
      }
      ctx.stroke();

      // 4. Inscription Typography
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const hasGreetingOrCredit = Boolean(festiveGreeting || creditText);
      if (hasGreetingOrCredit) {
        // Line 1: Fort Title flanked by ornamental diamonds
        ctx.fillStyle = '#FFFBEB';
        ctx.font = `bold 19px "${fontFamily}", sans-serif`;
        const titleLine = `✦  ${fortTitle}  ✦`;
        ctx.fillText(titleLine, canvasWidth / 2, plaqueY + 22);

        // Line 2: Festive wish / builder credit line in antique gold
        ctx.fillStyle = '#E5C378';
        ctx.font = `600 13px "${fontFamily}", sans-serif`;
        const subLine = festiveGreeting
          ? `${festiveGreeting}${builderName ? ` • ${builderName}` : ''}`
          : creditText;
        ctx.fillText(subLine, canvasWidth / 2, plaqueY + 45);
      } else {
        // Single centered line
        ctx.fillStyle = '#FFFBEB';
        ctx.font = `bold 22px "${fontFamily}", sans-serif`;
        ctx.fillText(`✦  ${fortTitle}  ✦`, canvasWidth / 2, plaqueY + plaqueH / 2);
      }
    }

    ctx.restore();
  }

  return canvas;
}


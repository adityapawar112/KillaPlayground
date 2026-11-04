/**
 * Lighting & Fireworks Procedural Geometry & Texture Generators
 * Ticket 10: Festive Lighting & Fireworks Studio
 */

import * as THREE from 'three';

// Module-level texture cache to prevent duplicate canvas allocations
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Procedural Geometry for Cone Fountain (Anaar)
 * Sized authentically to physical Diwali Killa toys (~10cm height)
 */
export function createAnaarConeGeometry(): THREE.BufferGeometry {
  // Conical body with apex at top (+Y)
  // Height = 0.09m, radius = 0.038m (3.8cm base radius)
  const geo = new THREE.ConeGeometry(0.038, 0.09, 24);
  geo.translate(0, 0.045 + 0.010, 0); // elevate base to sit flush above base plate
  return geo;
}

export function createAnaarBaseGeometry(): THREE.BufferGeometry {
  // Thin terracotta/earthen base pedestal plate
  const geo = new THREE.CylinderGeometry(0.042, 0.042, 0.010, 24);
  geo.translate(0, 0.005, 0);
  return geo;
}

export function createAnaarWickGeometry(): THREE.BufferGeometry {
  // Top sparkler fuse wick
  const geo = new THREE.CylinderGeometry(0.002, 0.002, 0.015, 8);
  geo.translate(0, 0.09 + 0.010 + 0.0075, 0);
  return geo;
}

/**
 * Procedural Geometry for Sky Shot (Aerial Shell Launcher)
 * Sized authentically to physical Diwali Killa toys (~13cm height)
 */
export function createSkyShotTubeGeometry(): THREE.BufferGeometry {
  // Cylindrical launcher tube: radius = 0.025m (5cm dia), height = 0.12m
  const geo = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 24);
  geo.translate(0, 0.06 + 0.012, 0); // elevate above base plate
  return geo;
}

export function createSkyShotBaseGeometry(): THREE.BufferGeometry {
  // Wooden stabilizer square firing base plate: 0.07 x 0.012 x 0.07m
  const geo = new THREE.BoxGeometry(0.07, 0.012, 0.07);
  geo.translate(0, 0.006, 0);
  return geo;
}

export function createSkyShotCollarGeometry(): THREE.BufferGeometry {
  // Reinforced collar ring for launcher top
  const geo = new THREE.TorusGeometry(0.026, 0.003, 8, 24);
  geo.rotateX(Math.PI / 2);
  geo.translate(0, 0.132, 0);
  return geo;
}

/**
 * Procedural Geometry for Authentic Diya Teardrop Flame (Outer Flame)
 * Generated via LatheGeometry revolving an organic teardrop candle profile.
 */
export function createDiyaFlameGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.0005, 0.0),       // Wick contact base
    new THREE.Vector2(0.004, 0.003),      // Lower rim
    new THREE.Vector2(0.009, 0.009),      // Bulbous expansion
    new THREE.Vector2(0.0105, 0.016),     // Widest teardrop belly
    new THREE.Vector2(0.0085, 0.025),     // Inward taper
    new THREE.Vector2(0.005, 0.034),      // Slender flame plume
    new THREE.Vector2(0.0018, 0.042),     // Tapered neck
    new THREE.Vector2(0.0002, 0.048),     // Pinched apex tip
  ];
  return new THREE.LatheGeometry(points, 24);
}

/**
 * Procedural Geometry for Inner Diya Flame Core (White-Hot Core)
 */
export function createDiyaFlameCoreGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.0004, 0.0),
    new THREE.Vector2(0.003, 0.003),
    new THREE.Vector2(0.006, 0.010),
    new THREE.Vector2(0.004, 0.019),
    new THREE.Vector2(0.001, 0.026),
    new THREE.Vector2(0.0002, 0.030),
  ];
  return new THREE.LatheGeometry(points, 20);
}

/**
 * Generate high-resolution retro Indian Diwali decorative paper wrap textures.
 * Uses native OffscreenCanvas/HTMLCanvasElement with ₹0 client-side compute.
 */
export function getFireworkCanvasTexture(theme: string, type: 'anaar' | 'skyshot'): THREE.CanvasTexture {
  const cacheKey = `${type}_${theme}`;
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  // Render on 256x256 canvas
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, fallback);
    return fallback;
  }

  // Base background palette by theme
  const palettes: Record<string, { bg1: string; bg2: string; gold: string; accent: string }> = {
    saffron: { bg1: '#C2410C', bg2: '#F97316', gold: '#FDE047', accent: '#7C2D12' },
    emerald: { bg1: '#065F46', bg2: '#10B981', gold: '#FDE047', accent: '#022C22' },
    violet: { bg1: '#5B21B6', bg2: '#8B5CF6', gold: '#FDE047', accent: '#2E1065' },
    crimson: { bg1: '#991B1B', bg2: '#EF4444', gold: '#FEF08A', accent: '#450A0A' },
    gold: { bg1: '#854D0E', bg2: '#EAB308', gold: '#FEF9C3', accent: '#422006' },
    peony: { bg1: '#831843', bg2: '#EC4899', gold: '#38BDF8', accent: '#1E1B4B' },
    willow: { bg1: '#78350F', bg2: '#D97706', gold: '#FDE68A', accent: '#451A03' },
    palm: { bg1: '#334155', bg2: '#64748B', gold: '#F8FAFC', accent: '#0F172A' },
    comet: { bg1: '#7F1D1D', bg2: '#DC2626', gold: '#FBBF24', accent: '#1C1917' },
    ring: { bg1: '#9A3412', bg2: '#EA580C', gold: '#FDE047', accent: '#431407' },
  };

  const p = palettes[theme] || palettes.saffron;

  // 1. Festive Gradient Background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, p.bg1);
  grad.addColorStop(0.5, p.bg2);
  grad.addColorStop(1, p.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Gold Foil Diagonal & Zig-Zag Bands
  ctx.strokeStyle = p.gold;
  ctx.lineWidth = 4;
  for (let y = 16; y < size; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();

    // Subtle diamond / chevron lattice
    ctx.lineWidth = 2;
    for (let x = 0; x < size; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x + 16, y);
      ctx.lineTo(x, y + 8);
      ctx.stroke();
    }
    ctx.lineWidth = 4;
  }

  // 3. Central Festive Diwali Starburst / Mandala Motif
  ctx.fillStyle = p.gold;
  const cx = size / 2;
  const cy = size / 2;
  const numRays = 12;
  for (let i = 0; i < numRays; i++) {
    const angle = (i * Math.PI * 2) / numRays;
    const r1 = 12;
    const r2 = 32;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle - 0.15) * r1, cy + Math.sin(angle - 0.15) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.lineTo(cx + Math.cos(angle + 0.15) * r1, cy + Math.sin(angle + 0.15) * r1);
    ctx.closePath();
    ctx.fill();
  }

  // Center gem / diya icon
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = p.accent;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = p.gold;
  ctx.fill();

  // 4. Retro Print Texture Border
  ctx.strokeStyle = p.gold;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, size - 8, size - 8);
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, size - 20, size - 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Dispose all cached canvas textures to eliminate GPU memory leaks on diorama reset.
 */
export function disposeFireworkTextures(): void {
  for (const tex of textureCache.values()) {
    tex.dispose();
  }
  textureCache.clear();
}


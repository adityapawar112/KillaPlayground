/**
 * Pyrotechnics Particle Engine for Diwali Fireworks
 * Ticket 10: Festive Lighting & Fireworks Studio
 *
 * High-performance, zero-allocation client-side particle engine.
 * Pre-allocates Float32Array buffers and manages particle pools
 * for Anaar upward fountain sprays and Sky Shot 2-phase aerial bursts.
 */

import * as THREE from 'three';
import { LightingItem } from './lightingTypes';

export const MAX_FIREWORK_PARTICLES = 3000;

export interface ActiveFireworkSpawner {
  id: string;
  type: 'anaar' | 'skyshot';
  colorTheme: string;
  primaryColor: THREE.Color;
  accentColor: THREE.Color;
  origin: [number, number, number];
  elapsed: number;
  duration: number;
  scale: number;
  // For skyshot state machine
  phase?: 'ascent' | 'detonated' | 'finished';
  rocketY?: number;
  burstY?: number;
  ascentSpeed?: number;
  sprayHeight?: number;
}

export class PyrotechnicsEngine {
  readonly maxParticles = MAX_FIREWORK_PARTICLES;
  activeCount = 0;

  // Pre-allocated particle attribute buffers
  readonly positions = new Float32Array(this.maxParticles * 3);
  readonly colors = new Float32Array(this.maxParticles * 3);
  readonly sizes = new Float32Array(this.maxParticles);

  // Parallel physics state buffers (zero per-frame memory allocation)
  private readonly vx = new Float32Array(this.maxParticles);
  private readonly vy = new Float32Array(this.maxParticles);
  private readonly vz = new Float32Array(this.maxParticles);
  private readonly gy = new Float32Array(this.maxParticles);
  private readonly drag = new Float32Array(this.maxParticles);
  private readonly life = new Float32Array(this.maxParticles);
  private readonly maxLife = new Float32Array(this.maxParticles);
  private readonly baseSize = new Float32Array(this.maxParticles);
  private readonly pType = new Uint8Array(this.maxParticles); // 0: spark, 1: tracer, 2: burst

  // Active firework triggers
  private activeSpawners: ActiveFireworkSpawner[] = [];

  /**
   * Spawn a new particle from pre-allocated pool
   */
  private spawnParticle(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    color: THREE.Color,
    maxLife: number,
    baseSize: number,
    gravity: number = -4.5,
    drag: number = 0.98,
    type: number = 0
  ): void {
    if (this.activeCount >= this.maxParticles) {
      // Recycle earliest particle if capacity reached
      this.activeCount = this.maxParticles - 1;
    }

    const idx = this.activeCount;
    const i3 = idx * 3;

    this.positions[i3] = x;
    this.positions[i3 + 1] = y;
    this.positions[i3 + 2] = z;

    this.colors[i3] = color.r;
    this.colors[i3 + 1] = color.g;
    this.colors[i3 + 2] = color.b;

    this.sizes[idx] = baseSize;

    this.vx[idx] = vx;
    this.vy[idx] = vy;
    this.vz[idx] = vz;
    this.gy[idx] = gravity;
    this.drag[idx] = drag;
    this.life[idx] = 0;
    this.maxLife[idx] = maxLife;
    this.baseSize[idx] = baseSize;
    this.pType[idx] = type;

    this.activeCount++;
  }

  /**
   * Trigger an on-demand firework test from a placed instance
   */
  triggerFirework(
    instanceId: string,
    meta: LightingItem,
    position: [number, number, number],
    scale: number = 1.0,
    burstHeight?: number
  ): void {
    const primary = new THREE.Color(meta.primaryColor || '#F59E0B');
    const accent = new THREE.Color(meta.accentColor || '#D97706');
    const fireworkType = meta.fireworkType || 'anaar';
    const theme = meta.colorTheme || 'saffron';

    // Remove any existing active spawner for this instance
    this.activeSpawners = this.activeSpawners.filter((s) => s.id !== instanceId);

    if (fireworkType === 'anaar') {
      const spray = (burstHeight ?? meta.sprayHeight ?? 0.9) * scale;
      this.activeSpawners.push({
        id: instanceId,
        type: 'anaar',
        colorTheme: theme,
        primaryColor: primary,
        accentColor: accent,
        origin: [position[0], position[1], position[2]],
        elapsed: 0,
        duration: 3.8, // 3.8 second sparkling fountain duration
        scale,
        sprayHeight: spray,
      });
    } else {
      // Sky shot aerial rocket launcher (default low burst altitude ~100cm / 1.0m from launcher)
      const altitude = (burstHeight ?? meta.burstAltitude ?? 1.0) * scale;
      const burstY = position[1] + altitude;
      const ascentSpeed = Math.max(1.8, altitude / 0.45); // Ascends over ~0.45 seconds
      this.activeSpawners.push({
        id: instanceId,
        type: 'skyshot',
        colorTheme: theme,
        primaryColor: primary,
        accentColor: accent,
        origin: [position[0], position[1], position[2]],
        elapsed: 0,
        duration: 2.8,
        scale,
        phase: 'ascent',
        rocketY: position[1] + 0.15 * scale,
        burstY,
        ascentSpeed,
      });
    }
  }

  /**
   * Advance simulation time step
   * Returns true if there are active particles or spawners.
   */
  update(delta: number): boolean {
    const dt = Math.min(0.05, Math.max(0.001, delta));

    // 1. Advance Active Spawners
    for (let s = this.activeSpawners.length - 1; s >= 0; s--) {
      const spawner = this.activeSpawners[s];
      spawner.elapsed += dt;

      if (spawner.type === 'anaar') {
        // Continuous upward sparkling fountain spray from cone apex
        if (spawner.elapsed < spawner.duration) {
          const spawnCount = Math.floor(18 * (dt / 0.016)); // ~18 sparks per frame at 60fps
          const apexY = spawner.origin[1] + 0.105 * spawner.scale;
          const speedMult = Math.sqrt((spawner.sprayHeight || 0.9) / 0.9);

          for (let i = 0; i < spawnCount; i++) {
            // Cone spray angle with upward bias
            const angle = Math.random() * Math.PI * 2;
            const spreadRad = Math.random() * 0.35;
            const speed = (2.2 + Math.random() * 2.2) * spawner.scale * speedMult;

            const vx = Math.cos(angle) * spreadRad * speed;
            const vz = Math.sin(angle) * spreadRad * speed;
            const vy = speed;

            // Blend primary with golden crackle
            const isGold = Math.random() < 0.4;
            const sparkCol = isGold ? new THREE.Color('#FFFBEB') : spawner.primaryColor;

            this.spawnParticle(
              spawner.origin[0] + (Math.random() - 0.5) * 0.02,
              apexY,
              spawner.origin[2] + (Math.random() - 0.5) * 0.02,
              vx,
              vy,
              vz,
              sparkCol,
              0.6 + Math.random() * 0.5, // 0.6 to 1.1s life
              0.055 * spawner.scale,
              -4.8, // gravity
              0.97, // drag
              0 // spark type
            );
          }
        } else {
          // Fountain finished
          this.activeSpawners.splice(s, 1);
        }
      } else if (spawner.type === 'skyshot') {
        // Two-phase aerial launcher
        if (spawner.phase === 'ascent') {
          // Phase 1: Rapid rocket ascent leaving smoke/tracer trail
          const ascentSpeed = spawner.ascentSpeed || Math.max(1.8, 4.0 * spawner.scale);
          spawner.rocketY = (spawner.rocketY || spawner.origin[1]) + ascentSpeed * dt;

          // Spawn tracer particles along the rocket path
          const tracerCount = Math.floor(4 * (dt / 0.016));
          for (let i = 0; i < tracerCount; i++) {
            const tracerColor = Math.random() < 0.5 ? spawner.accentColor : new THREE.Color('#FFFFFF');
            this.spawnParticle(
              spawner.origin[0] + (Math.random() - 0.5) * 0.04,
              spawner.rocketY - Math.random() * 0.1,
              spawner.origin[2] + (Math.random() - 0.5) * 0.04,
              (Math.random() - 0.5) * 0.2,
              -0.5,
              (Math.random() - 0.5) * 0.2,
              tracerColor,
              0.35,
              0.045 * spawner.scale,
              -1.0,
              0.95,
              1 // tracer
            );
          }

          // Check if reached burst altitude
          if (spawner.rocketY >= (spawner.burstY || spawner.origin[1] + 1.0)) {
            spawner.phase = 'detonated';
            this.detonateSkyShot(spawner);
          }
        } else if (spawner.phase === 'detonated') {
          if (spawner.elapsed >= spawner.duration) {
            this.activeSpawners.splice(s, 1);
          }
        }
      }
    }

    // 2. Advance Existing Particles
    let alive = 0;
    for (let i = 0; i < this.activeCount; i++) {
      this.life[i] += dt;

      if (this.life[i] < this.maxLife[i]) {
        // Physics update
        this.vy[i] += this.gy[i] * dt;
        this.vx[i] *= Math.pow(this.drag[i], dt * 60);
        this.vy[i] *= Math.pow(this.drag[i], dt * 60);
        this.vz[i] *= Math.pow(this.drag[i], dt * 60);

        const i3 = i * 3;
        this.positions[i3] += this.vx[i] * dt;
        this.positions[i3 + 1] += this.vy[i] * dt;
        this.positions[i3 + 2] += this.vz[i] * dt;

        // Sparkle / flicker modulation
        const progress = this.life[i] / this.maxLife[i];
        const fade = 1.0 - progress;
        const flicker = 0.8 + 0.4 * Math.sin(this.life[i] * 35.0);

        this.sizes[i] = Math.max(0.005, this.baseSize[i] * fade * flicker);

        if (alive !== i) {
          // Compact active array
          this.copyParticle(i, alive);
        }
        alive++;
      }
    }

    this.activeCount = alive;
    return this.activeCount > 0 || this.activeSpawners.length > 0;
  }

  /**
   * Detonate Sky Shot high-altitude burst pattern
   */
  private detonateSkyShot(spawner: ActiveFireworkSpawner): void {
    const cx = spawner.origin[0];
    const cy = spawner.burstY || spawner.origin[1] + 1.0;
    const cz = spawner.origin[2];
    const theme = spawner.colorTheme;
    const count = 140;

    // Multi-color palette for peony burst
    const peonyColors = [
      new THREE.Color('#EC4899'), // pink
      new THREE.Color('#38BDF8'), // blue
      new THREE.Color('#F59E0B'), // gold
      new THREE.Color('#10B981'), // emerald
      new THREE.Color('#A855F7'), // violet
    ];

    for (let i = 0; i < count; i++) {
      let vx = 0;
      let vy = 0;
      let vz = 0;
      let col = spawner.primaryColor;
      let maxLife = 1.2 + Math.random() * 0.4;
      let gravity = -2.2;
      let drag = 0.94;
      let size = 0.075 * spawner.scale;

      if (theme === 'peony') {
        // Spherical explosion with rainbow palette
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const speed = (2.5 + Math.random() * 1.5) * spawner.scale;

        vx = Math.sin(phi) * Math.cos(theta) * speed;
        vy = Math.sin(phi) * Math.sin(theta) * speed;
        vz = Math.cos(phi) * speed;
        col = peonyColors[i % peonyColors.length];
        drag = 0.93;
      } else if (theme === 'willow') {
        // Weeping golden cascading branches with low drag & long life
        const angle = Math.random() * Math.PI * 2;
        const speed = (1.8 + Math.random() * 1.2) * spawner.scale;
        vx = Math.cos(angle) * speed;
        vy = (0.5 + Math.random() * 1.2) * speed;
        vz = Math.sin(angle) * speed;
        col = new THREE.Color(Math.random() < 0.6 ? '#F59E0B' : '#FEF08A');
        gravity = -3.2;
        drag = 0.96;
        maxLife = 1.6 + Math.random() * 0.5;
        size = 0.085 * spawner.scale;
      } else if (theme === 'palm') {
        // Radiating silver-white palm frond branches
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() * 0.5 + 0.25) * Math.PI; // mostly upward/outward
        const speed = (3.2 + Math.random() * 1.2) * spawner.scale;
        vx = Math.sin(phi) * Math.cos(theta) * speed;
        vy = Math.cos(phi) * speed;
        vz = Math.sin(phi) * Math.sin(theta) * speed;
        col = new THREE.Color(Math.random() < 0.7 ? '#FFFFFF' : '#E2E8F0');
        gravity = -2.0;
        drag = 0.94;
      } else if (theme === 'comet') {
        // Fiery vermilion trails with crackling micro-bursts
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2.0 - 1.0);
        const speed = (2.8 + Math.random() * 2.0) * spawner.scale;
        vx = Math.sin(phi) * Math.cos(theta) * speed;
        vy = Math.sin(phi) * Math.sin(theta) * speed;
        vz = Math.cos(phi) * speed;
        col = new THREE.Color(Math.random() < 0.5 ? '#EF4444' : '#F97316');
        gravity = -2.5;
        drag = 0.92;
      } else if (theme === 'ring') {
        // Expanding 2D/3D circular halo ring
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
        const speed = (2.6 + Math.random() * 0.4) * spawner.scale;
        vx = Math.cos(angle) * speed;
        vy = (Math.random() - 0.5) * 0.3 * speed;
        vz = Math.sin(angle) * speed;
        col = spawner.primaryColor;
        gravity = -1.5;
        drag = 0.95;
      }

      this.spawnParticle(cx, cy, cz, vx, vy, vz, col, maxLife, size, gravity, drag, 2);
    }
  }

  /**
   * Compact particle array by copying from source index to target index
   */
  private copyParticle(from: number, to: number): void {
    const f3 = from * 3;
    const t3 = to * 3;

    this.positions[t3] = this.positions[f3];
    this.positions[t3 + 1] = this.positions[f3 + 1];
    this.positions[t3 + 2] = this.positions[f3 + 2];

    this.colors[t3] = this.colors[f3];
    this.colors[t3 + 1] = this.colors[f3 + 1];
    this.colors[t3 + 2] = this.colors[f3 + 2];

    this.sizes[to] = this.sizes[from];
    this.vx[to] = this.vx[from];
    this.vy[to] = this.vy[from];
    this.vz[to] = this.vz[from];
    this.gy[to] = this.gy[from];
    this.drag[to] = this.drag[from];
    this.life[to] = this.life[from];
    this.maxLife[to] = this.maxLife[from];
    this.baseSize[to] = this.baseSize[from];
    this.pType[to] = this.pType[from];
  }

  /**
   * Reset all active particles and triggers
   */
  reset(): void {
    this.activeCount = 0;
    this.activeSpawners = [];
  }
}


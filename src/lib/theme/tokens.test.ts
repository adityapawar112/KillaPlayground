import { describe, it, expect } from 'vitest';
import {
  SURFACE_TIERS,
  ACCENT_COLORS,
  SEMANTIC_COLORS,
  RADIUS_TIERS,
  TYPE_SCALE,
  ICON_CONFIG,
  INTERACTION_CLASSES,
} from './tokens';

describe('Studio Design System Tokens', () => {
  it('defines valid 3-tier surface hierarchy', () => {
    // Level 1: Canvas foundation
    expect(SURFACE_TIERS.level1.canvas).toBe('#F4F1EA');
    expect(SURFACE_TIERS.level1.card).toBe('#FAF8F5');

    // Level 2: Raised panels and docks
    expect(SURFACE_TIERS.level2.panel).toBe('#EBE6DC');
    expect(SURFACE_TIERS.level2.divider).toBe('#D8D1C5');
    expect(SURFACE_TIERS.level2.sliderTrack).toBe('#D8D1C5');

    // Level 3: Basalt dark stone active surfaces
    expect(SURFACE_TIERS.level3.activeSurface).toBe('#2B2621');
    expect(SURFACE_TIERS.level3.activeText).toBe('#FAF8F5');
  });

  it('reserves burnt terracotta as primary interaction accent', () => {
    expect(ACCENT_COLORS.terracotta).toBe('#B85F45');
    expect(ACCENT_COLORS.terracottaHover).toBe('#A3523B');
    expect(ACCENT_COLORS.terracottaActive).toBe('#8F4938');
  });

  it('defines standard semantic feedback colors', () => {
    expect(SEMANTIC_COLORS.success).toBe('#15803D');
    expect(SEMANTIC_COLORS.warning).toBe('#D97706');
    expect(SEMANTIC_COLORS.destructive).toBe('#DC2626');
  });

  it('normalizes radius tiers to 8px / 12px / 16px / 20px', () => {
    expect(RADIUS_TIERS.control).toBe('rounded-md');
    expect(RADIUS_TIERS.card).toBe('rounded-lg');
    expect(RADIUS_TIERS.panel).toBe('rounded-xl');
    expect(RADIUS_TIERS.modal).toBe('rounded-2xl');
  });

  it('standardizes type scale and icon specifications', () => {
    expect(TYPE_SCALE.panelTitle).toContain('text-sm');
    expect(TYPE_SCALE.sectionHeader).toContain('text-xs');
    expect(TYPE_SCALE.controlLabel).toContain('text-[11px]');
    expect(TYPE_SCALE.readoutValue).toContain('tabular-nums');
    expect(TYPE_SCALE.helperText).toContain('text-[10px]');

    expect(ICON_CONFIG.defaultSize).toBe(16);
    expect(ICON_CONFIG.prominentSize).toBe(18);
    expect(ICON_CONFIG.strokeWidth).toBe(1.75);
  });

  it('standardizes universal interaction states and accessible focus rings', () => {
    expect(INTERACTION_CLASSES.focusRing).toContain('focus-visible:ring-[#B85F45]');
    expect(INTERACTION_CLASSES.touchHitTarget).toContain('min-w-[44px]');
    expect(INTERACTION_CLASSES.touchHitTarget).toContain('min-h-[44px]');
    expect(INTERACTION_CLASSES.buttonDefault).toContain('bg-[#FAF8F5]');
    expect(INTERACTION_CLASSES.buttonSelected).toContain('bg-[#2B2621]');
    expect(INTERACTION_CLASSES.buttonDisabled).toContain('opacity-40');
  });
});


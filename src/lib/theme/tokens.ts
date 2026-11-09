/**
 * Studio Design System Tokens
 *
 * Grounded in the Sahyadri fort visual world (basalt, neutral stone, laterite)
 * and engineered for professional DCC workstation ergonomics (Blender, Unreal 5, ZBrush).
 */

export const SURFACE_TIERS = {
  level1: {
    name: 'Neutral Warm Stone Foundation',
    canvas: '#F4F1EA',
    card: '#FAF8F5',
    cardBorder: '#D8D1C5',
  },
  level2: {
    name: 'Warm Grey Raised Panels & Docks',
    panel: '#EBE6DC',
    panelSubtle: '#E4DFD5',
    divider: '#D8D1C5',
    dividerSubtle: '#E2DBD0',
    sliderTrack: '#D8D1C5',
    hover: 'rgba(216, 209, 197, 0.5)',
  },
  level3: {
    name: 'Basalt Dark Stone Active Surfaces',
    activeSurface: '#2B2621',
    activeText: '#FAF8F5',
    activeSubtle: '#38322B',
    activeRing: '#1C1815',
  },
} as const;

export const ACCENT_COLORS = {
  terracotta: '#B85F45',
  terracottaHover: '#A3523B',
  terracottaActive: '#8F4938',
  terracottaSubtle: 'rgba(184, 95, 69, 0.12)',
} as const;

export const SEMANTIC_COLORS = {
  success: '#15803D',
  warning: '#D97706',
  destructive: '#DC2626',
} as const;

export const RADIUS_TIERS = {
  control: 'rounded-md', // 8px: Buttons, inputs, sliders, segmented pills
  card: 'rounded-lg',    // 12px: Asset cards, preset tiles, popovers
  panel: 'rounded-xl',   // 16px: Docks, sidebars, modal shells
  modal: 'rounded-2xl',  // 20px: Floating modal window dialogs
} as const;

export const TYPE_SCALE = {
  heroDisplay: 'font-yatra text-2xl sm:text-3xl tracking-wide', // Display titles & hero impact
  panelTitle: 'text-sm font-semibold tracking-tight',           // 14px Semi-Bold
  sectionHeader: 'text-xs font-medium tracking-normal',         // 12px Medium (sentence case)
  controlLabel: 'text-[11px] font-medium tracking-normal',      // 11px Medium
  readoutValue: 'text-[11px] font-mono tabular-nums',           // 11px Tabular Numbers
  helperText: 'text-[10px] text-[#7C7267] font-normal',         // 10px Muted
} as const;

export const ICON_CONFIG = {
  defaultSize: 16,
  prominentSize: 18,
  strokeWidth: 1.75,
} as const;


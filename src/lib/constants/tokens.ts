export const COLORS = {
  // Application Floor & Surfaces
  canvas: '#F9F6F0',
  surfaceSoft: '#F2EBE1',
  surfaceCard: '#EADECF',
  surfaceStrong: '#DFCDBD',
  surfaceDark: '#23211E',
  surfaceDarkElevated: '#322E2A',
  hairline: '#D9C9B4',
  hairlineStrong: '#BFA892',

  // 6-Color Brand Earth-Tone Palette
  terracotta: '#B85F45',
  burntClay: '#8F4938',
  sand: '#D8C09D',
  camel: '#B58B63',
  olive: '#777A57',
  darkBrown: '#4B382C',

  // Cultural & Festive Accents
  bhagwa: '#E85D04',
  bhagwaGlow: '#FF7722',
  chuna: '#FAF8F5',
  basalt: '#23211E',
  halim: '#65A30D',
  seaBlue: '#0284C7',
  diyaAmber: '#F59E0B',
  marigoldYellow: '#FBBF24',

  // Text / Typography Ink
  ink: '#2B1E16',
  bodyStrong: '#4B382C',
  body: '#634E40',
  muted: '#8D7666',
  mutedSoft: '#B29E8E',
  onPrimary: '#FFFFFF',
  onDark: '#FAF8F5',

  // Semantic Status
  success: '#588157',
  warning: '#D97706',
  error: '#B91C1C',
  info: '#0284C7',
} as const;

export const PAINT_COLORS = [
  { id: 'basalt', name: 'Basalt Charcoal', hex: COLORS.basalt, role: 'Stone & rampart base coat' },
  { id: 'chuna', name: 'Chuna White', hex: COLORS.chuna, role: 'Mortar lines & chalk guide' },
  { id: 'geru', name: 'Geru Terracotta', hex: COLORS.terracotta, role: 'Pathways & shrine roofs' },
  { id: 'tarpaulin', name: 'Tarpaulin Blue', hex: COLORS.seaBlue, role: 'Water tanks & sea tint' },
  { id: 'camel', name: 'Mud Stone', hex: COLORS.camel, role: 'Dry soil & weathered rock' },
  { id: 'marigold', name: 'Marigold Yellow', hex: COLORS.marigoldYellow, role: 'Festive highlights' },
] as const;

export const FONTS = {
  display: 'var(--font-yatra)',
  festive: 'var(--font-modak)',
  sans: 'var(--font-inter)',
} as const;

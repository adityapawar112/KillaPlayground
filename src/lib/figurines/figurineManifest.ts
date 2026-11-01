/**
 * Figurine & Architecture Manifest
 * Indexes all 29 solid 3D models for Diwali Killa Sandbox.
 */

import { FigurineCategory, FigurineCategoryInfo, FigurineItem } from './figurineTypes';

export const FIGURINE_CATEGORIES: FigurineCategoryInfo[] = [
  {
    id: 'royalty',
    name: 'Royalty & Sinhasan',
    devanagari: 'शाही दरबारी व सिंहासन',
    description: 'Chhatrapati Shivaji Maharaj on the royal throne (Sinhasan), royal attendants, and commanders.',
    accentColor: '#B85F45',
  },
  {
    id: 'mavale',
    name: 'Mavale Garrison',
    devanagari: 'मावळे व पहारेकरी',
    description: 'Brave Maratha infantry, spearmen, swordsmen, flag bearers, and cliffside defenders.',
    accentColor: '#E85D04',
  },
  {
    id: 'musicians',
    name: 'Festive Musicians',
    devanagari: 'पारंपरिक वादक',
    description: 'Tutari horn blowers sounding victory and energetic Dhol-Tasha festive drummers.',
    accentColor: '#D97706',
  },
  {
    id: 'diyas_clay',
    name: 'Terracotta Diyas',
    devanagari: 'मातीचे दिवे',
    description: 'Traditional earthen terracotta clay panatis and oil lamps illuminating the bastions.',
    accentColor: '#8F4938',
  },
  {
    id: 'diyas_color',
    name: 'Painted Diyas',
    devanagari: 'रंगबेरंगी दिवे',
    description: 'Hand-painted festive Diwali diyas decorated with vivid traditional folk colors.',
    accentColor: '#F59E0B',
  },
  {
    id: 'yard_props',
    name: 'Yard & Fort Props',
    devanagari: 'किल्ल्याचे सामान',
    description: 'Deccan bullock carts, saffron swallowtail banners, and camp gear.',
    accentColor: '#777A57',
  },
  {
    id: 'architecture',
    name: 'Fort Architecture',
    devanagari: 'किल्ले वास्तुकला',
    description: 'Pre-built watchtowers, bastions, temple shrines, and stone archways.',
    accentColor: '#4B382C',
  },
  {
    id: 'artillery',
    name: 'Artillery & Cannons',
    devanagari: 'तोफखाना व दारूगोळा',
    description: 'Heavy bronze cannons, iron swivel guns, cannonballs, and powder kegs.',
    accentColor: '#23211E',
  },
];

export const FIGURINE_MANIFEST: FigurineItem[] = [
  // 1. Royalty & Sinhasan
  {
    id: 'king_throne',
    name: 'King on Throne',
    devanagariName: 'सिंहासनाधिष्ठित छत्रपती शिवराय',
    category: 'royalty',
    modelPath: '/figurines/king_throne.glb',
    previewPath: '/figurines/previews/king_throne.png',
    faceCount: 1050,
    defaultScale: 1.0,
    dimensions: { width: 0.65, height: 0.85, depth: 0.65 },
    culturalLore: 'Chhatrapati Shivaji Maharaj seated upon the golden Sinhasan, centerpiece of the Raigad court.',
  },
  {
    id: 'horse_rider',
    name: 'Cavalry Commander',
    devanagariName: 'मराठा घोडदळ सरदार',
    category: 'royalty',
    modelPath: '/figurines/horse_rider.glb',
    previewPath: '/figurines/previews/horse_rider.png',
    faceCount: 1058,
    defaultScale: 1.0,
    dimensions: { width: 0.60, height: 0.95, depth: 0.90 },
    culturalLore: 'A swift Maratha cavalryman commanding the rocky Deccan plains with legendary mobility.',
  },
  {
    id: 'fan_blower',
    name: 'Royal Attendant',
    devanagariName: 'मोरचेलधारी सेवक',
    category: 'royalty',
    modelPath: '/figurines/fan_blower.glb',
    previewPath: '/figurines/previews/fan_blower.png',
    faceCount: 1054,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 0.80, depth: 0.45 },
    culturalLore: 'Attendant bearing the peacock-feather Morchel beside the throne during court proceedings.',
  },

  // 2. Mavale Garrison
  {
    id: 'warrior',
    name: 'Maratha Swordsman',
    devanagariName: 'तलवारधारी मावळा',
    category: 'mavale',
    modelPath: '/figurines/warrior.glb',
    previewPath: '/figurines/previews/warrior.png',
    faceCount: 1052,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 0.75, depth: 0.45 },
    culturalLore: 'Dauntless warrior in traditional festive angarkha wielding a curved talwar sword.',
  },
  {
    id: 'spearman',
    name: 'Fort Sentry Spearman',
    devanagariName: 'भालाधारी पहारेकरी',
    category: 'mavale',
    modelPath: '/figurines/spearman.glb',
    previewPath: '/figurines/previews/spearman.png',
    faceCount: 1056,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 0.85, depth: 0.45 },
    culturalLore: 'Sentry standing guard with a long spear upon the fort bastions and cliff ramparts.',
  },
  {
    id: 'flag_bearer',
    name: 'Bhagwa Flag Bearer',
    devanagariName: 'भगवा ध्वजधारक',
    category: 'mavale',
    modelPath: '/figurines/flag_bearer.glb',
    previewPath: '/figurines/previews/flag_bearer.png',
    faceCount: 1042,
    defaultScale: 1.0,
    dimensions: { width: 0.50, height: 0.95, depth: 0.50 },
    culturalLore: 'Loyal standard-bearer hoisting the sacred saffron Bhagwa Zenda over the citadel.',
  },
  {
    id: 'rock_thrower',
    name: 'Cliff Defender',
    devanagariName: 'कड्यावरील दगडफेक रक्षक',
    category: 'mavale',
    modelPath: '/figurines/rock_thrower.glb',
    previewPath: '/figurines/previews/rock_thrower.png',
    faceCount: 1060,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 0.75, depth: 0.45 },
    culturalLore: 'Fort defender poised to roll heavy rocks down the steep mountain slopes against attackers.',
  },

  // 3. Festive Musicians
  {
    id: 'horn_blower',
    name: 'Tutari Horn Blower',
    devanagariName: 'तुतारी वादक',
    category: 'musicians',
    modelPath: '/figurines/horn_blower.glb',
    previewPath: '/figurines/previews/horn_blower.png',
    faceCount: 1060,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 0.80, depth: 0.45 },
    culturalLore: 'Musician sounding the resplendent curved brass Tutari horn to announce arrival of royalty.',
  },
  {
    id: 'dhol_drummer',
    name: 'Dhol Tasha Drummer',
    devanagariName: 'ढोल ताशा वादक',
    category: 'musicians',
    modelPath: '/figurines/dhol_drummer.glb',
    previewPath: '/figurines/previews/dhol_drummer.png',
    faceCount: 1052,
    defaultScale: 1.0,
    dimensions: { width: 0.50, height: 0.75, depth: 0.50 },
    culturalLore: 'Festive drummer setting the spirited rhythm of Diwali celebrations across the courtyard.',
  },

  // 4. Terracotta Clay Diyas (9 Models)
  {
    id: 'diya_clay_01',
    name: 'Classic Clay Diya',
    devanagariName: 'पारंपरिक मातीची पणती १',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_01.glb',
    previewPath: '/figurines/previews/diya_clay_01.png',
    faceCount: 126,
    defaultScale: 1.0,
    dimensions: { width: 0.29, height: 0.10, depth: 0.27 },
    culturalLore: 'Handcrafted terracotta clay oil lamp with a rounded oil basin and pinched wick spout.',
  },
  {
    id: 'diya_clay_02',
    name: 'Fluted Clay Diya',
    devanagariName: 'पारंपरिक मातीची पणती २',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_02.glb',
    previewPath: '/figurines/previews/diya_clay_02.png',
    faceCount: 98,
    defaultScale: 1.0,
    dimensions: { width: 0.27, height: 0.09, depth: 0.31 },
    culturalLore: 'Terracotta panati molded with gentle rim ridges typical of village potters.',
  },
  {
    id: 'diya_clay_03',
    name: 'Broad Terracotta Lamp',
    devanagariName: 'पारंपरिक मातीची पणती ३',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_03.glb',
    previewPath: '/figurines/previews/diya_clay_03.png',
    faceCount: 96,
    defaultScale: 1.0,
    dimensions: { width: 0.31, height: 0.09, depth: 0.29 },
    culturalLore: 'Broad-base earthen diya offering steady, long-lasting glow on windy parapets.',
  },
  {
    id: 'diya_clay_04',
    name: 'Petal Rim Diya',
    devanagariName: 'पारंपरिक मातीची पणती ४',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_04.glb',
    previewPath: '/figurines/previews/diya_clay_04.png',
    faceCount: 132,
    defaultScale: 1.0,
    dimensions: { width: 0.26, height: 0.10, depth: 0.28 },
    culturalLore: 'Terracotta diya with petal-carved edge reflecting flickering festive shadows.',
  },
  {
    id: 'diya_clay_05',
    name: 'Deep Basin Diya',
    devanagariName: 'पारंपरिक मातीची पणती ५',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_05.glb',
    previewPath: '/figurines/previews/diya_clay_05.png',
    faceCount: 140,
    defaultScale: 1.0,
    dimensions: { width: 0.27, height: 0.11, depth: 0.26 },
    culturalLore: 'Deep earthen reservoir designed for all-night festive illumination during Laxmi Pujan.',
  },
  {
    id: 'diya_clay_06',
    name: 'Oval Sunbaked Panati',
    devanagariName: 'पारंपरिक मातीची पणती ६',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_06.glb',
    previewPath: '/figurines/previews/diya_clay_06.png',
    faceCount: 98,
    defaultScale: 1.0,
    dimensions: { width: 0.30, height: 0.09, depth: 0.28 },
    culturalLore: 'Oval clay panati shaped by hand from red Laterite soil.',
  },
  {
    id: 'diya_clay_07',
    name: 'Star Wick Diya',
    devanagariName: 'पारंपरिक मातीची पणती ७',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_07.glb',
    previewPath: '/figurines/previews/diya_clay_07.png',
    faceCount: 122,
    defaultScale: 1.0,
    dimensions: { width: 0.28, height: 0.09, depth: 0.25 },
    culturalLore: 'Star-crested clay diya popular for lining entrance steps and bastion merlons.',
  },
  {
    id: 'diya_clay_08',
    name: 'Pedestal Clay Diya',
    devanagariName: 'पारंपरिक मातीची पणती ८',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_08.glb',
    previewPath: '/figurines/previews/diya_clay_08.png',
    faceCount: 94,
    defaultScale: 1.0,
    dimensions: { width: 0.29, height: 0.09, depth: 0.26 },
    culturalLore: 'Elevated clay panati with sturdy molded foot for courtyard paving.',
  },
  {
    id: 'diya_clay_09',
    name: 'Temple Oil Panati',
    devanagariName: 'पारंपरिक मातीची पणती ९',
    category: 'diyas_clay',
    modelPath: '/figurines/diya_clay_09.glb',
    previewPath: '/figurines/previews/diya_clay_09.png',
    faceCount: 106,
    defaultScale: 1.0,
    dimensions: { width: 0.26, height: 0.09, depth: 0.24 },
    culturalLore: 'Sacred terracotta lamp traditionally placed at fort temple shrines.',
  },

  // 5. Painted Festive Diyas (9 Models)
  {
    id: 'diya_color_01',
    name: 'Marigold Painted Diya',
    devanagariName: 'झेंडू रंगाचा दिवा १',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_01.glb',
    previewPath: '/figurines/previews/diya_color_01.png',
    faceCount: 102,
    defaultScale: 1.0,
    dimensions: { width: 0.27, height: 0.09, depth: 0.25 },
    culturalLore: 'Decorated with vibrant yellow and vermilion motifs reminiscent of marigold garlands.',
  },
  {
    id: 'diya_color_02',
    name: 'Peacock Trim Diya',
    devanagariName: 'मोरपंखी दिवा २',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_02.glb',
    previewPath: '/figurines/previews/diya_color_02.png',
    faceCount: 102,
    defaultScale: 1.0,
    dimensions: { width: 0.27, height: 0.11, depth: 0.28 },
    culturalLore: 'Adorned with peacock-blue enamel and golden foil accents celebrating festive lights.',
  },
  {
    id: 'diya_color_03',
    name: 'Emerald Blossom Diya',
    devanagariName: 'हिरवा सुशोभित दिवा ३',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_03.glb',
    previewPath: '/figurines/previews/diya_color_03.png',
    faceCount: 118,
    defaultScale: 1.0,
    dimensions: { width: 0.26, height: 0.08, depth: 0.25 },
    culturalLore: 'Painted with botanical green patterns symbolizing prosperity and abundant harvest.',
  },
  {
    id: 'diya_color_04',
    name: 'Saffron Swirl Diya',
    devanagariName: 'केसरी नक्षीदार दिवा ४',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_04.glb',
    previewPath: '/figurines/previews/diya_color_04.png',
    faceCount: 116,
    defaultScale: 1.0,
    dimensions: { width: 0.25, height: 0.07, depth: 0.25 },
    culturalLore: 'Hand-painted saffron swirl pattern paying homage to Maratha heritage.',
  },
  {
    id: 'diya_color_05',
    name: 'Royal Purple Diya',
    devanagariName: 'जांभळा कलाकुसर दिवा ५',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_05.glb',
    previewPath: '/figurines/previews/diya_color_05.png',
    faceCount: 124,
    defaultScale: 1.0,
    dimensions: { width: 0.26, height: 0.11, depth: 0.26 },
    culturalLore: 'Lustrous festive diya with intricate silver rim dots for grand celebrations.',
  },
  {
    id: 'diya_color_06',
    name: 'Turquoise Lotus Diya',
    devanagariName: 'कमळ पाकळी दिवा ६',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_06.glb',
    previewPath: '/figurines/previews/diya_color_06.png',
    faceCount: 126,
    defaultScale: 1.0,
    dimensions: { width: 0.25, height: 0.06, depth: 0.24 },
    culturalLore: 'Lotus petal shape finished in bright turquoise and white chalk line accents.',
  },
  {
    id: 'diya_color_07',
    name: 'Ruby Terracotta Diya',
    devanagariName: 'माणिक लाल दिवा ७',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_07.glb',
    previewPath: '/figurines/previews/diya_color_07.png',
    faceCount: 116,
    defaultScale: 1.0,
    dimensions: { width: 0.26, height: 0.08, depth: 0.26 },
    culturalLore: 'Rich crimson lacquer finish catching the golden warmth of the oil wick flame.',
  },
  {
    id: 'diya_color_08',
    name: 'Golden Crest Diya',
    devanagariName: 'सुवर्ण किनारी दिवा ८',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_08.glb',
    previewPath: '/figurines/previews/diya_color_08.png',
    faceCount: 114,
    defaultScale: 1.0,
    dimensions: { width: 0.26, height: 0.08, depth: 0.27 },
    culturalLore: 'Gold-leaf bordered diya illuminating the royal Maha Darwaza entrance arch.',
  },
  {
    id: 'diya_color_09',
    name: 'Rangoli Pattern Diya',
    devanagariName: 'रांगोळी नक्षी दिवा ९',
    category: 'diyas_color',
    modelPath: '/figurines/diya_color_09.glb',
    previewPath: '/figurines/previews/diya_color_09.png',
    faceCount: 94,
    defaultScale: 1.0,
    dimensions: { width: 0.28, height: 0.09, depth: 0.27 },
    culturalLore: 'Traditional floral rangoli geometric design for festive courtyard corners.',
  },

  // 6. Yard & Fort Props
  {
    id: 'bullock_cart',
    name: 'Deccan Bullock Cart',
    devanagariName: 'बैलगाडी',
    category: 'yard_props',
    modelPath: '/figurines/bullock_cart.glb',
    previewPath: '/figurines/previews/bullock_cart.png',
    faceCount: 997,
    defaultScale: 1.0,
    dimensions: { width: 0.85, height: 0.70, depth: 1.40 },
    culturalLore: 'Timber cart with wooden spoked wheels used across the Sahyadri ranges to haul stones and grain.',
  },
  {
    id: 'saffron_flag',
    name: 'Bhagwa Zenda Mast',
    devanagariName: 'भगवा ध्वजस्तंभ',
    category: 'yard_props',
    modelPath: '/figurines/saffron_flag.glb',
    previewPath: '/figurines/previews/saffron_flag.png',
    faceCount: 996,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 1.40, depth: 0.45 },
    culturalLore: 'The revered swallowtail Bhagwa standard mounted upon a tall wooden sentry pole.',
  },
];

/**
 * Retrieve a figurine definition by its unique identifier.
 */
export function getFigurineById(id: string): FigurineItem | undefined {
  return FIGURINE_MANIFEST.find((item) => item.id === id);
}

/**
 * Filter figurines by category.
 */
export function getFigurinesByCategory(category: FigurineCategory): FigurineItem[] {
  return FIGURINE_MANIFEST.filter((item) => item.category === category);
}

/**
 * Search figurines by query across English name, Devanagari name, lore, and category.
 */
export function searchFigurines(query: string, categoryFilter?: string): FigurineItem[] {
  let list = FIGURINE_MANIFEST;

  if (categoryFilter && categoryFilter !== 'all') {
    list = list.filter((item) => item.category === categoryFilter);
  }

  if (!query || query.trim() === '') {
    return list;
  }

  const cleanQuery = query.toLowerCase().trim();
  return list.filter(
    (item) =>
      item.name.toLowerCase().includes(cleanQuery) ||
      item.devanagariName.toLowerCase().includes(cleanQuery) ||
      item.culturalLore.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery)
  );
}


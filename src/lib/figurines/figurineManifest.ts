/**
 * Figurine & Architecture Manifest
 * Indexes all 22 solid 3D models for Diwali Killa Sandbox.
 */

import { FigurineCategory, FigurineCategoryInfo, FigurineItem } from './figurineTypes';

export const FIGURINE_CATEGORIES: FigurineCategoryInfo[] = [
  {
    id: 'royalty',
    name: 'Royalty & Court',
    devanagari: 'शाही दरबारी व सिंहासन',
    description: 'Chhatrapati Shivaji Maharaj on the royal throne, royal attendants, and commanders.',
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
    id: 'citizens',
    name: 'Folk & Citizens',
    devanagari: 'गावकरी व लोकजीवन',
    description: 'Deccan village potters, woodcutters, and women grinding grain sustaining the mountain fort.',
    accentColor: '#9C6644',
  },
  {
    id: 'musicians',
    name: 'Festive Musicians',
    devanagari: 'पारंपरिक वादक',
    description: 'Tutari horn blowers sounding victory and energetic Dhol-Tasha festive drummers.',
    accentColor: '#D97706',
  },
  {
    id: 'navy',
    name: 'Navy',
    devanagari: 'आरमार',
    description: 'Swift Galbat and heavy Gurab warships commanding the Konkan coast and sea forts.',
    accentColor: '#2B6CB0',
  },
  {
    id: 'wildlife',
    name: 'Sahyadri Wildlife',
    devanagari: 'सह्याद्री वन्यजीव',
    description: 'Fierce Bengal tigers and agile langurs indigenous to the rugged Sahyadri jungles.',
    accentColor: '#38A169',
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
    description: 'Pre-built temples, administrative courts, commander wadas, stables, and dungeons.',
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
    modelPath: '/figurines/royalty/king_throne.glb',
    previewPath: '/figurines/royalty/king_throne.png',
    faceCount: 1050,
    defaultScale: 1.0,
    dimensions: { width: 0.65, height: 0.85, depth: 0.65 },
    culturalLore: 'Chhatrapati Shivaji Maharaj seated upon the golden throne, centerpiece of the Raigad court.',
  },
  {
    id: 'horse_rider',
    name: 'Cavalry Commander',
    devanagariName: 'मराठा घोडदळ सरदार',
    category: 'royalty',
    modelPath: '/figurines/royalty/horse_rider.glb',
    previewPath: '/figurines/royalty/horse_rider.png',
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
    modelPath: '/figurines/royalty/fan_blower.glb',
    previewPath: '/figurines/royalty/fan_blower.png',
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
    modelPath: '/figurines/mavale/warrior.glb',
    previewPath: '/figurines/mavale/warrior.png',
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
    modelPath: '/figurines/mavale/spearman.glb',
    previewPath: '/figurines/mavale/spearman.png',
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
    modelPath: '/figurines/mavale/flag_bearer.glb',
    previewPath: '/figurines/mavale/flag_bearer.png',
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
    modelPath: '/figurines/mavale/rock_thrower.glb',
    previewPath: '/figurines/mavale/rock_thrower.png',
    faceCount: 1060,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 0.75, depth: 0.45 },
    culturalLore: 'Fort defender poised to roll heavy rocks down the steep mountain slopes against attackers.',
  },

  // 3. Folk & Citizens
  {
    id: 'potter',
    name: 'Village Potter',
    devanagariName: 'कुंभार व चाक',
    category: 'citizens',
    modelPath: '/figurines/citizens/potter.glb',
    previewPath: '/figurines/citizens/potter.png',
    faceCount: 1042,
    defaultScale: 1.0,
    dimensions: { width: 0.15, height: 0.10, depth: 0.14 },
    culturalLore: 'Traditional village craftsman shaping festive terracotta diyas and storage urns upon the potter wheel.',
  },
  {
    id: 'woodcutter',
    name: 'Village Woodcutter',
    devanagariName: 'लाकूडतोड्या',
    category: 'citizens',
    modelPath: '/figurines/citizens/woodcutter.glb',
    previewPath: '/figurines/citizens/woodcutter.png',
    faceCount: 1020,
    defaultScale: 1.0,
    dimensions: { width: 0.12, height: 0.15, depth: 0.08 },
    culturalLore: 'Hardy Deccan villager gathering timber and firewood to supply fort hearths and rampart braziers.',
  },
  {
    id: 'woman_harvest_basket',
    name: 'Woman with Harvest Basket',
    devanagariName: 'धान्य टोपली घेतलेली महिला',
    category: 'citizens',
    modelPath: '/figurines/citizens/woman_harvest_basket.glb',
    previewPath: '/figurines/citizens/woman_harvest_basket.png',
    faceCount: 1052,
    defaultScale: 1.0,
    dimensions: { width: 0.05, height: 0.15, depth: 0.05 },
    culturalLore: 'Village woman carrying freshly harvested grain and festive flowers up to the fort citadel.',
  },
  {
    id: 'woman_with_pots',
    name: 'Woman with Water Pots',
    devanagariName: 'पाणपोई महिला',
    category: 'citizens',
    modelPath: '/figurines/citizens/woman_with_pots.glb',
    previewPath: '/figurines/citizens/woman_with_pots.png',
    faceCount: 1044,
    defaultScale: 1.0,
    dimensions: { width: 0.07, height: 0.15, depth: 0.05 },
    culturalLore: 'Village woman carrying earthen water pots filled from the crystal rock-cut hillfort cisterns.',
  },
  {
    id: 'women_grinding_wheat',
    name: 'Women at Millstone',
    devanagariName: 'जात्यावर दळणाऱ्या महिला',
    category: 'citizens',
    modelPath: '/figurines/citizens/women_grinding_wheat.glb',
    previewPath: '/figurines/citizens/women_grinding_wheat.png',
    faceCount: 1042,
    defaultScale: 1.0,
    dimensions: { width: 0.15, height: 0.14, depth: 0.15 },
    culturalLore: 'Women grinding wheat flour upon the traditional rotary stone quern while singing Ovi verses.',
  },
  {
    id: 'women_mortar_pestle',
    name: 'Women with Mortar & Pestle',
    devanagariName: 'उखळ-पाखळ धान्य कांडणारी महिला',
    category: 'citizens',
    modelPath: '/figurines/citizens/women_mortar_pestle.glb',
    previewPath: '/figurines/citizens/women_mortar_pestle.png',
    faceCount: 1052,
    defaultScale: 1.0,
    dimensions: { width: 0.05, height: 0.15, depth: 0.08 },
    culturalLore: 'Village woman rhythmically pounding grain and spices in the wooden stone mortar.',
  },

  // 4. Festive Musicians
  {
    id: 'horn_blower',
    name: 'Tutari Horn Blower',
    devanagariName: 'तुतारी वादक',
    category: 'musicians',
    modelPath: '/figurines/musicians/horn_blower.glb',
    previewPath: '/figurines/musicians/horn_blower.png',
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
    modelPath: '/figurines/musicians/dhol_drummer.glb',
    previewPath: '/figurines/musicians/dhol_drummer.png',
    faceCount: 1052,
    defaultScale: 1.0,
    dimensions: { width: 0.50, height: 0.75, depth: 0.50 },
    culturalLore: 'Festive drummer setting the spirited rhythm of Diwali celebrations across the courtyard.',
  },

  // 4. Yard & Fort Props
  {
    id: 'bullock_cart',
    name: 'Deccan Bullock Cart',
    devanagariName: 'बैलगाडी',
    category: 'yard_props',
    modelPath: '/figurines/yard_props/bullock_cart.glb',
    previewPath: '/figurines/yard_props/bullock_cart.png',
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
    modelPath: '/figurines/yard_props/saffron_flag.glb',
    previewPath: '/figurines/yard_props/saffron_flag.png',
    faceCount: 996,
    defaultScale: 1.0,
    dimensions: { width: 0.45, height: 1.40, depth: 0.45 },
    culturalLore: 'The revered swallowtail Bhagwa standard mounted upon a tall wooden sentry pole.',
  },

  // 7. Fort Architecture
  {
    id: 'arms_depot',
    name: 'Arms Depot',
    devanagariName: 'शस्त्रागार',
    category: 'architecture',
    modelPath: '/figurines/architecture/arms_depot.glb',
    previewPath: '/figurines/architecture/arms_depot.png',
    faceCount: 4459,
    defaultScale: 1.0,
    dimensions: { width: 0.48, height: 0.25, depth: 0.24 },
    culturalLore: 'Fort armory storehouse safeguarding swords, muskets, and protective armor.',
  },
  {
    id: 'elephant_stables',
    name: 'Elephant Stables',
    devanagariName: 'हत्तीखाना',
    category: 'architecture',
    modelPath: '/figurines/architecture/elephant_stables.glb',
    previewPath: '/figurines/architecture/elephant_stables.png',
    faceCount: 4877,
    defaultScale: 1.0,
    dimensions: { width: 0.58, height: 0.26, depth: 0.58 },
    culturalLore: 'Grand stone pavilion providing shelter and feeding troughs for fort war elephants.',
  },
  {
    id: 'granary',
    name: 'Fort Granary',
    devanagariName: 'अंबरखाना व धान्य कोठार',
    category: 'architecture',
    modelPath: '/figurines/architecture/granary.glb',
    previewPath: '/figurines/architecture/granary.png',
    faceCount: 4629,
    defaultScale: 1.0,
    dimensions: { width: 0.43, height: 0.30, depth: 0.28 },
    culturalLore: 'Massive Amberkhana storehouse stocked with grain to sustain prolonged mountain sieges.',
  },
  {
    id: 'horse_stables',
    name: 'Cavalry Stables',
    devanagariName: 'पागा व घोड्यांचे तबेले',
    category: 'architecture',
    modelPath: '/figurines/architecture/horse_stables.glb',
    previewPath: '/figurines/architecture/horse_stables.png',
    faceCount: 5102,
    defaultScale: 1.0,
    dimensions: { width: 0.52, height: 0.28, depth: 0.25 },
    culturalLore: 'Paga stables for the swift Deccan Bhimthadi horses and cavalry commanders.',
  },
  {
    id: 'jail',
    name: 'Fort Dungeon',
    devanagariName: 'बंदीखाना व तुरुंग',
    category: 'architecture',
    modelPath: '/figurines/architecture/jail.glb',
    previewPath: '/figurines/architecture/jail.png',
    faceCount: 4789,
    defaultScale: 1.0,
    dimensions: { width: 0.43, height: 0.26, depth: 0.24 },
    culturalLore: 'Subterranean stone dungeon guarded day and night along the inner citadel wall.',
  },
  {
    id: 'kitchen',
    name: 'Royal Kitchen',
    devanagariName: 'पाकशाळा व स्वयंपाकघर',
    category: 'architecture',
    modelPath: '/figurines/architecture/kitchen.glb',
    previewPath: '/figurines/architecture/kitchen.png',
    faceCount: 4866,
    defaultScale: 1.0,
    dimensions: { width: 0.43, height: 0.29, depth: 0.25 },
    culturalLore: 'Fort hearth and Pakshala cooking festive meals for the court and garrison.',
  },
  {
    id: 'soldier_quarters',
    name: 'Soldier Quarters',
    devanagariName: 'सदर व सैनिकांची घरे',
    category: 'architecture',
    modelPath: '/figurines/architecture/soldier_quarters.glb',
    previewPath: '/figurines/architecture/soldier_quarters.png',
    faceCount: 4665,
    defaultScale: 1.0,
    dimensions: { width: 0.46, height: 0.30, depth: 0.31 },
    culturalLore: 'Stone barracks housing garrison soldiers beside the citadel ramparts.',
  },
  {
    id: 'admin_building',
    name: 'Administrative Court',
    devanagariName: 'प्रशासकीय कचेरी व सदर',
    category: 'architecture',
    modelPath: '/figurines/architecture/admin_building.glb',
    previewPath: '/figurines/architecture/admin_building.png',
    faceCount: 5548,
    defaultScale: 1.0,
    dimensions: { width: 0.48, height: 0.35, depth: 0.37 },
    culturalLore: 'Stone citadel kacheri where royal edicts, revenue ledgers, and garrison decrees were administered.',
  },
  {
    id: 'commander_quarters',
    name: 'Commander Quarters',
    devanagariName: 'किल्लेदार वाडा व निवासस्थान',
    category: 'architecture',
    modelPath: '/figurines/architecture/commander_quarters.glb',
    previewPath: '/figurines/architecture/commander_quarters.png',
    faceCount: 9281,
    defaultScale: 1.0,
    dimensions: { width: 0.48, height: 0.42, depth: 0.32 },
    culturalLore: 'Multi-tiered stone wada serving as the residential citadel for fort killedars and high sirdars.',
  },
  {
    id: 'temple',
    name: 'Fort Temple Shrine',
    devanagariName: 'भवानी माता मंदिर',
    category: 'architecture',
    modelPath: '/figurines/architecture/temple.glb',
    previewPath: '/figurines/architecture/temple.png',
    faceCount: 5480,
    defaultScale: 1.0,
    dimensions: { width: 0.28, height: 0.43, depth: 0.38 },
    culturalLore: 'Sacred stone shrine dedicated to Goddess Bhavani, blessing the fort and safeguarding the garrison.',
  },

  // 8. Artillery & Cannons
  {
    id: 'cannon',
    name: 'Bastion Cannon',
    devanagariName: 'तोफ',
    category: 'artillery',
    modelPath: '/figurines/artillery/cannon.glb',
    previewPath: '/figurines/artillery/cannon.png',
    faceCount: 1038,
    defaultScale: 1.0,
    dimensions: { width: 0.15, height: 0.09, depth: 0.09 },
    culturalLore: 'Heavy bronze cannon mounted on a wooden carriage commanding the valley approach.',
  },
  {
    id: 'cannonball_crate',
    name: 'Cannonball Crate',
    devanagariName: 'तोफेचे गोळे',
    category: 'artillery',
    modelPath: '/figurines/artillery/cannonball_crate.glb',
    previewPath: '/figurines/artillery/cannonball_crate.png',
    faceCount: 956,
    defaultScale: 1.0,
    dimensions: { width: 0.09, height: 0.08, depth: 0.06 },
    culturalLore: 'Wooden crate stacked with solid iron cannonballs ready for bastion artillery.',
  },
  {
    id: 'gunpowder_depot',
    name: 'Gunpowder Magazine',
    devanagariName: 'दारूचे कोठार',
    category: 'artillery',
    modelPath: '/figurines/artillery/gunpowder_depot.glb',
    previewPath: '/figurines/artillery/gunpowder_depot.png',
    faceCount: 4780,
    defaultScale: 1.0,
    dimensions: { width: 0.43, height: 0.33, depth: 0.28 },
    culturalLore: 'Reinforced blast-resistant stone vault housing barrels of explosive black powder.',
  },

  // 9. Royal Mounts
  {
    id: 'elephant_rider',
    name: 'Royal War Elephant',
    devanagariName: 'हत्ती व अंबारी',
    category: 'royalty',
    modelPath: '/figurines/royalty/elephant_rider.glb',
    previewPath: '/figurines/royalty/elephant_rider.png',
    faceCount: 1048,
    defaultScale: 1.0,
    dimensions: { width: 0.14, height: 0.29, depth: 0.31 },
    culturalLore: 'Majestic Deccan tusker adorned in festive ceremonial armor bearing a golden royal howdah.',
  },

  // 10. Maratha Navy
  {
    id: 'maratha_navy_gallivat',
    name: 'Maratha Galbat Warship',
    devanagariName: 'मराठा आरमार गलबात',
    category: 'navy',
    modelPath: '/figurines/navy/maratha_navy_gallivat.glb',
    previewPath: '/figurines/navy/maratha_navy_gallivat.png',
    faceCount: 4619,
    defaultScale: 1.0,
    dimensions: { width: 0.41, height: 0.53, depth: 0.81 },
    culturalLore: 'Fast rowing and sailing coastal warship with lateen sails guarding the Konkan sea forts.',
  },
  {
    id: 'maratha_navy_gurab',
    name: 'Maratha Gurab Flagship',
    devanagariName: 'मराठा आरमार गुराब',
    category: 'navy',
    modelPath: '/figurines/navy/maratha_navy_gurab.glb',
    previewPath: '/figurines/navy/maratha_navy_gurab.png',
    faceCount: 5103,
    defaultScale: 1.0,
    dimensions: { width: 0.27, height: 0.51, depth: 0.91 },
    culturalLore: 'Heavy two-masted Maratha gunship armed with prow cannons, the pride of the Konkan fleet.',
  },

  // 11. Sahyadri Wildlife
  {
    id: 'tiger',
    name: 'Sahyadri Tiger',
    devanagariName: 'सह्याद्रीचा वाघ',
    category: 'wildlife',
    modelPath: '/figurines/wildlife/tiger.glb',
    previewPath: '/figurines/wildlife/tiger.png',
    faceCount: 1052,
    defaultScale: 1.0,
    dimensions: { width: 0.17, height: 0.11, depth: 0.10 },
    culturalLore: 'Majestic Royal Bengal tiger prowling the dense ravines and mist-clad slopes of the Western Ghats.',
  },
  {
    id: 'monkey',
    name: 'Sahyadri Langur',
    devanagariName: 'सह्याद्री वानर',
    category: 'wildlife',
    modelPath: '/figurines/wildlife/monkey.glb',
    previewPath: '/figurines/wildlife/monkey.png',
    faceCount: 1034,
    defaultScale: 1.0,
    dimensions: { width: 0.09, height: 0.08, depth: 0.12 },
    culturalLore: 'Playful black-faced langur leaping across fortress ramparts and watchtower canopies.',
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


/**
 * Texture Catalog & Manifest for Diwali Killa Sandbox
 * Indexes all 52 authentic 128x128 retro textures across 8 categories.
 */

export type TextureCategory =
  | 'Dirt'
  | 'Grass'
  | 'Gravel'
  | 'Rock'
  | 'Rocky'
  | 'Sand'
  | 'Bricks'
  | 'Water';

export interface CategoryInfo {
  id: TextureCategory;
  name: string;
  devanagari: string;
  description: string;
  accentColor: string;
}

export interface TextureItem {
  id: string;
  layerIndex: number; // 0 to 51 in THREE.DataArrayTexture
  name: string;
  category: TextureCategory;
  folder: string;
  diffusePath: string;
  previewPath: string;
  description: string;
  culturalLore?: string;
}

export const TEXTURE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Dirt',
    name: 'Dirt & Soil',
    devanagari: 'तांबडी माती',
    description: 'Classic red laterite soil, compacted clay, and moist courtyard earth.',
    accentColor: '#B85F45',
  },
  {
    id: 'Grass',
    name: 'Grass & Flora',
    devanagari: 'मोहरी व हिरवळ',
    description: 'Lush sprouted mustard seedlings, alpine turf, and meadow grass.',
    accentColor: '#65A30D',
  },
  {
    id: 'Gravel',
    name: 'Gravel & Paths',
    devanagari: 'पायवाट व खडी',
    description: 'Crushed basalt scree, worn foothill walking trails, and ballast stones.',
    accentColor: '#B58B63',
  },
  {
    id: 'Rock',
    name: 'Deccan Basalt',
    devanagari: 'दख्खन कातळ',
    description: 'Rugged cliff escarpments, chiseled rampart stones, and bedrock tors.',
    accentColor: '#4B382C',
  },
  {
    id: 'Rocky',
    name: 'Rocky Ground',
    devanagari: 'दगड-माती',
    description: 'Mixed pebble hillside slopes, boulder fields, and craggy terraces.',
    accentColor: '#8D7666',
  },
  {
    id: 'Sand',
    name: 'Courtyard Sand',
    devanagari: 'वाळू व गाळ',
    description: 'Fine river silt, courtyard beach sand, and sun-baked grit.',
    accentColor: '#D8C09D',
  },
  {
    id: 'Bricks',
    name: 'Masonry & Paving',
    devanagari: 'दगडी चिरे',
    description: 'Dressed dark stone walkways, battlements, and mossy fort wall blocks.',
    accentColor: '#777A57',
  },
  {
    id: 'Water',
    name: 'Tarpaulin Water',
    devanagari: 'तळे व ताडपत्री',
    description: 'Nostalgic crinkled blue plastic sheet water basin for festive tanks.',
    accentColor: '#0284C7',
  },
];

export const TEXTURE_MANIFEST: TextureItem[] = [
  // 1. Dirt (8 textures: layers 0 to 7)
  {
    id: 'dirt_01',
    layerIndex: 0,
    name: 'Compacted Mud',
    category: 'Dirt',
    folder: 'Dirt_01',
    diffusePath: '/textures/Dirt/Dirt_01/Dirt_01_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_01/Dirt_01_basecolor.png',
    description: 'Dense earthen foundation soil patted smooth with hand trowels.',
    culturalLore: 'Patted foundation soil.',
  },
  {
    id: 'dirt_02',
    layerIndex: 1,
    name: 'Hydrated Wet Mud',
    category: 'Dirt',
    folder: 'Dirt_02',
    diffusePath: '/textures/Dirt/Dirt_02/Dirt_02_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_02/Dirt_02_basecolor.png',
    description: 'Rich dark hydrated mud with glistening sheen around water channels.',
    culturalLore: 'Hydrated wet clay foundation.',
  },
  {
    id: 'dirt_03',
    layerIndex: 2,
    name: 'Red Laterite',
    category: 'Dirt',
    folder: 'Dirt_03',
    diffusePath: '/textures/Dirt/Dirt_03/Dirt_03_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_03/Dirt_03_basecolor.png',
    description: 'Classic red laterite courtyard soil from hill ranges.',
    culturalLore: 'Authentic red laterite soil.',
  },
  {
    id: 'dirt_04',
    layerIndex: 3,
    name: 'Clay Silt',
    category: 'Dirt',
    folder: 'Dirt_04',
    diffusePath: '/textures/Dirt/Dirt_04/Dirt_04_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_04/Dirt_04_basecolor.png',
    description: 'Fine powdered brick clay for molding bastions and parapets.',
  },
  {
    id: 'dirt_05',
    layerIndex: 4,
    name: 'Valley Loam',
    category: 'Dirt',
    folder: 'Dirt_05',
    diffusePath: '/textures/Dirt/Dirt_05/Dirt_05_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_05/Dirt_05_basecolor.png',
    description: 'Rich organic valley silt found at fort foothills.',
  },
  {
    id: 'dirt_06',
    layerIndex: 5,
    name: 'Root Earth',
    category: 'Dirt',
    folder: 'Dirt_06',
    diffusePath: '/textures/Dirt/Dirt_06/Dirt_06_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_06/Dirt_06_basecolor.png',
    description: 'Earth interwoven with wild hill roots and dry foliage fibers.',
  },
  {
    id: 'dirt_07',
    layerIndex: 6,
    name: 'Terrace Clay',
    category: 'Dirt',
    folder: 'Dirt_07',
    diffusePath: '/textures/Dirt/Dirt_07/Dirt_07_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_07/Dirt_07_basecolor.png',
    description: 'Stepped terrace ground layer for agricultural fort plateaus.',
  },
  {
    id: 'dirt_08',
    layerIndex: 7,
    name: 'Sun-Baked Silt',
    category: 'Dirt',
    folder: 'Dirt_08',
    diffusePath: '/textures/Dirt/Dirt_08/Dirt_08_basecolor.png',
    previewPath: '/textures/Dirt/Dirt_08/Dirt_08_basecolor.png',
    description: 'Dry afternoon baked mud with subtle natural surface cracks.',
  },

  // 2. Grass (8 textures: layers 8 to 15)
  {
    id: 'grass_01',
    layerIndex: 8,
    name: 'Mustard Sprout',
    category: 'Grass',
    folder: 'Grass_01',
    diffusePath: '/textures/Grass/Grass_01/Grass_01_basecolor.png',
    previewPath: '/textures/Grass/Grass_01/Grass_01_basecolor.png',
    description: 'Vibrant freshly sprouted mustard and garden cress seedlings.',
    culturalLore: 'Fresh festive seedlings.',
  },
  {
    id: 'grass_02',
    layerIndex: 9,
    name: 'Wild Hillside Meadow',
    category: 'Grass',
    folder: 'Grass_02',
    diffusePath: '/textures/Grass/Grass_02/Grass_02_basecolor.png',
    previewPath: '/textures/Grass/Grass_02/Grass_02_basecolor.png',
    description: 'Hardy mountain blades surviving post-monsoon Sahyadri winds.',
  },
  {
    id: 'grass_03',
    layerIndex: 10,
    name: 'Deep Plateau Turf',
    category: 'Grass',
    folder: 'Grass_03',
    diffusePath: '/textures/Grass/Grass_03/Grass_03_basecolor.png',
    previewPath: '/textures/Grass/Grass_03/Grass_03_basecolor.png',
    description: 'Rich dark green grassy cover thriving on high citadel plateaus.',
  },
  {
    id: 'grass_04',
    layerIndex: 11,
    name: 'Alpine Pasture',
    category: 'Grass',
    folder: 'Grass_04',
    diffusePath: '/textures/Grass/Grass_04/Grass_04_basecolor.png',
    previewPath: '/textures/Grass/Grass_04/Grass_04_basecolor.png',
    description: 'Soft grazing slopes below fort gates.',
  },
  {
    id: 'grass_05',
    layerIndex: 12,
    name: 'Patchy Ridge Turf',
    category: 'Grass',
    folder: 'Grass_05',
    diffusePath: '/textures/Grass/Grass_05/Grass_05_basecolor.png',
    previewPath: '/textures/Grass/Grass_05/Grass_05_basecolor.png',
    description: 'Scattered tufts emerging through rocky gravel trails.',
  },
  {
    id: 'grass_06',
    layerIndex: 13,
    name: 'Mossy Escarpment',
    category: 'Grass',
    folder: 'Grass_06',
    diffusePath: '/textures/Grass/Grass_06/Grass_06_basecolor.png',
    previewPath: '/textures/Grass/Grass_06/Grass_06_basecolor.png',
    description: 'Velvet green moss clinging to damp fort stone ramparts.',
  },
  {
    id: 'grass_07',
    layerIndex: 14,
    name: 'Dry Winter Grass',
    category: 'Grass',
    folder: 'Grass_07',
    diffusePath: '/textures/Grass/Grass_07/Grass_07_basecolor.png',
    previewPath: '/textures/Grass/Grass_07/Grass_07_basecolor.png',
    description: 'Golden-tan seasonal grasses typical of November Diwali weeks.',
  },
  {
    id: 'grass_08',
    layerIndex: 15,
    name: 'Lush Overgrowth',
    category: 'Grass',
    folder: 'Grass_08',
    diffusePath: '/textures/Grass/Grass_08/Grass_08_basecolor.png',
    previewPath: '/textures/Grass/Grass_08/Grass_08_basecolor.png',
    description: 'Dense wild foliage covering abandoned ruins and outposts.',
  },

  // 3. Gravel (8 textures: layers 16 to 23)
  {
    id: 'gravel_01',
    layerIndex: 16,
    name: 'Basalt Scree',
    category: 'Gravel',
    folder: 'Gravel_01',
    diffusePath: '/textures/Gravel/Gravel_01/Gravel_01_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_01/Gravel_01_basecolor.png',
    description: 'Crushed basalt rocks and chips from fort wall masonry work.',
  },
  {
    id: 'gravel_02',
    layerIndex: 17,
    name: 'Courtyard Pathway',
    category: 'Gravel',
    folder: 'Gravel_02',
    diffusePath: '/textures/Gravel/Gravel_02/Gravel_02_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_02/Gravel_02_basecolor.png',
    description: 'Small rounded pebbles creating walking lanes inside the diorama.',
  },
  {
    id: 'gravel_03',
    layerIndex: 18,
    name: 'River Silt Pebbles',
    category: 'Gravel',
    folder: 'Gravel_03',
    diffusePath: '/textures/Gravel/Gravel_03/Gravel_03_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_03/Gravel_03_basecolor.png',
    description: 'Smooth river stones washed down mountain streams.',
  },
  {
    id: 'gravel_04',
    layerIndex: 19,
    name: 'Worn Hill Trail',
    category: 'Gravel',
    folder: 'Gravel_04',
    diffusePath: '/textures/Gravel/Gravel_04/Gravel_04_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_04/Gravel_04_basecolor.png',
    description: 'Traditional trodden dirt and gravel footpath leading to fort gateways.',
    culturalLore: 'Worn footpath up the hill.',
  },
  {
    id: 'gravel_05',
    layerIndex: 20,
    name: 'Chipped Stone Trail',
    category: 'Gravel',
    folder: 'Gravel_05',
    diffusePath: '/textures/Gravel/Gravel_05/Gravel_05_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_05/Gravel_05_basecolor.png',
    description: 'Firm footing trail packed with gravel and decomposed granite.',
  },
  {
    id: 'gravel_06',
    layerIndex: 21,
    name: 'Causeway Ballast',
    category: 'Gravel',
    folder: 'Gravel_06',
    diffusePath: '/textures/Gravel/Gravel_06/Gravel_06_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_06/Gravel_06_basecolor.png',
    description: 'Medium stone chips underpinning rampart foundations.',
  },
  {
    id: 'gravel_07',
    layerIndex: 22,
    name: 'Mixed Gravel & Earth',
    category: 'Gravel',
    folder: 'Gravel_07',
    diffusePath: '/textures/Gravel/Gravel_07/Gravel_07_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_07/Gravel_07_basecolor.png',
    description: 'Earthy gravel blend with natural red soil speckles.',
  },
  {
    id: 'gravel_08',
    layerIndex: 23,
    name: 'Desert Gravel Path',
    category: 'Gravel',
    folder: 'Gravel_08',
    diffusePath: '/textures/Gravel/Gravel_08/Gravel_08_basecolor.png',
    previewPath: '/textures/Gravel/Gravel_08/Gravel_08_basecolor.png',
    description: 'Sun-warmed light gravel trail for bright contrast.',
  },

  // 4. Rock (8 textures: layers 24 to 31)
  {
    id: 'rock_01',
    layerIndex: 24,
    name: 'Weathered Cliff Rock',
    category: 'Rock',
    folder: 'Rock_01',
    diffusePath: '/textures/Rock/Rock_01/Rock_01_basecolor.png',
    previewPath: '/textures/Rock/Rock_01/Rock_01_basecolor.png',
    description: 'Deep grey ancient rock faces exposed to the elements.',
  },
  {
    id: 'rock_02',
    layerIndex: 25,
    name: 'Deccan Basalt',
    category: 'Rock',
    folder: 'Rock_02',
    diffusePath: '/textures/Rock/Rock_02/Rock_02_basecolor.png',
    previewPath: '/textures/Rock/Rock_02/Rock_02_basecolor.png',
    description: 'Dark volcanic basalt forming sheer cliff escarpments.',
    culturalLore: 'Classic vertical Deccan cliff.',
  },
  {
    id: 'rock_03',
    layerIndex: 26,
    name: 'Chiseled Bedrock',
    category: 'Rock',
    folder: 'Rock_03',
    diffusePath: '/textures/Rock/Rock_03/Rock_03_basecolor.png',
    previewPath: '/textures/Rock/Rock_03/Rock_03_basecolor.png',
    description: 'Natural solid rock sculpted into natural defense bastions.',
  },
  {
    id: 'rock_04',
    layerIndex: 27,
    name: 'Jagged Mountain Tor',
    category: 'Rock',
    folder: 'Rock_04',
    diffusePath: '/textures/Rock/Rock_04/Rock_04_basecolor.png',
    previewPath: '/textures/Rock/Rock_04/Rock_04_basecolor.png',
    description: 'Sharp pinnacle rocks ideal for isolated watchtower peaks.',
  },
  {
    id: 'rock_05',
    layerIndex: 28,
    name: 'Charcoal Basalt Crag',
    category: 'Rock',
    folder: 'Rock_05',
    diffusePath: '/textures/Rock/Rock_05/Rock_05_basecolor.png',
    previewPath: '/textures/Rock/Rock_05/Rock_05_basecolor.png',
    description: 'Dark mineral basalt rock with deep cavity crevices.',
  },
  {
    id: 'rock_06',
    layerIndex: 29,
    name: 'Lichen-Covered Rock',
    category: 'Rock',
    folder: 'Rock_06',
    diffusePath: '/textures/Rock/Rock_06/Rock_06_basecolor.png',
    previewPath: '/textures/Rock/Rock_06/Rock_06_basecolor.png',
    description: 'Weathered stone spotted with pale mountain lichen rings.',
  },
  {
    id: 'rock_07',
    layerIndex: 30,
    name: 'Massive Monolith',
    category: 'Rock',
    folder: 'Rock_07',
    diffusePath: '/textures/Rock/Rock_07/Rock_07_basecolor.png',
    previewPath: '/textures/Rock/Rock_07/Rock_07_basecolor.png',
    description: 'Unbroken solid granite and basalt boulder masses.',
  },
  {
    id: 'rock_08',
    layerIndex: 31,
    name: 'Steep Ravine Cliff',
    category: 'Rock',
    folder: 'Rock_08',
    diffusePath: '/textures/Rock/Rock_08/Rock_08_basecolor.png',
    previewPath: '/textures/Rock/Rock_08/Rock_08_basecolor.png',
    description: 'Vertical drop cliff face suitable for natural moat walls.',
  },

  // 5. Rocky Ground (8 textures: layers 32 to 39)
  {
    id: 'rocky_01',
    layerIndex: 32,
    name: 'Pebble Hillside',
    category: 'Rocky',
    folder: 'Rocky_01',
    diffusePath: '/textures/Rocky/Rocky_01/Rocky_01_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_01/Rocky_01_basecolor.png',
    description: 'Hillside ground speckled with scattered surface pebbles.',
  },
  {
    id: 'rocky_02',
    layerIndex: 33,
    name: 'Stony Plateau',
    category: 'Rocky',
    folder: 'Rocky_02',
    diffusePath: '/textures/Rocky/Rocky_02/Rocky_02_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_02/Rocky_02_basecolor.png',
    description: 'Flat highland plateau where stone outcrops pierce red soil.',
  },
  {
    id: 'rocky_03',
    layerIndex: 34,
    name: 'Boulder Field Soil',
    category: 'Rocky',
    folder: 'Rocky_03',
    diffusePath: '/textures/Rocky/Rocky_03/Rocky_03_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_03/Rocky_03_basecolor.png',
    description: 'Rough terrain packed with stones of diverse sizes.',
  },
  {
    id: 'rocky_04',
    layerIndex: 35,
    name: 'Scree Mountain Slope',
    category: 'Rocky',
    folder: 'Rocky_04',
    diffusePath: '/textures/Rocky/Rocky_04/Rocky_04_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_04/Rocky_04_basecolor.png',
    description: 'Shifting stone chips on steep natural defenses.',
  },
  {
    id: 'rocky_05',
    layerIndex: 36,
    name: 'Rocky Red Outcrop',
    category: 'Rocky',
    folder: 'Rocky_05',
    diffusePath: '/textures/Rocky/Rocky_05/Rocky_05_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_05/Rocky_05_basecolor.png',
    description: 'Warm red laterite ground filled with weathered basalt fragments.',
  },
  {
    id: 'rocky_06',
    layerIndex: 37,
    name: 'Dry Ravine Bed',
    category: 'Rocky',
    folder: 'Rocky_06',
    diffusePath: '/textures/Rocky/Rocky_06/Rocky_06_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_06/Rocky_06_basecolor.png',
    description: 'Stony dry seasonal river channel with exposed bedrock.',
  },
  {
    id: 'rocky_07',
    layerIndex: 38,
    name: 'Craggy Terrace Slope',
    category: 'Rocky',
    folder: 'Rocky_07',
    diffusePath: '/textures/Rocky/Rocky_07/Rocky_07_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_07/Rocky_07_basecolor.png',
    description: 'Natural terraced steps created by layered basalt strata.',
  },
  {
    id: 'rocky_08',
    layerIndex: 39,
    name: 'Escarpment Debris',
    category: 'Rocky',
    folder: 'Rocky_08',
    diffusePath: '/textures/Rocky/Rocky_08/Rocky_08_basecolor.png',
    previewPath: '/textures/Rocky/Rocky_08/Rocky_08_basecolor.png',
    description: 'Loose rocks collected at the base of fort walls.',
  },

  // 6. Sand (8 textures: layers 40 to 47)
  {
    id: 'sand_01',
    layerIndex: 40,
    name: 'Courtyard Silt',
    category: 'Sand',
    folder: 'Sand_01',
    diffusePath: '/textures/Sand/Sand_01/Sand_01_basecolor.png',
    previewPath: '/textures/Sand/Sand_01/Sand_01_basecolor.png',
    description: 'Soft, fine silt spread across courtyard festival areas.',
  },
  {
    id: 'sand_02',
    layerIndex: 41,
    name: 'Dune Sand',
    category: 'Sand',
    folder: 'Sand_02',
    diffusePath: '/textures/Sand/Sand_02/Sand_02_basecolor.png',
    previewPath: '/textures/Sand/Sand_02/Sand_02_basecolor.png',
    description: 'Wind-blown desert silt with gentle ripple waves.',
  },
  {
    id: 'sand_03',
    layerIndex: 42,
    name: 'Riverbank Clay Sand',
    category: 'Sand',
    folder: 'Sand_03',
    diffusePath: '/textures/Sand/Sand_03/Sand_03_basecolor.png',
    previewPath: '/textures/Sand/Sand_03/Sand_03_basecolor.png',
    description: 'Moist alluvial sand along mountain water tanks.',
  },
  {
    id: 'sand_04',
    layerIndex: 43,
    name: 'Coarse Courtyard Grit',
    category: 'Sand',
    folder: 'Sand_04',
    diffusePath: '/textures/Sand/Sand_04/Sand_04_basecolor.png',
    previewPath: '/textures/Sand/Sand_04/Sand_04_basecolor.png',
    description: 'Firm granular sand used for leveling diorama bases.',
  },
  {
    id: 'sand_05',
    layerIndex: 44,
    name: 'Packed Pathway Sand',
    category: 'Sand',
    folder: 'Sand_05',
    diffusePath: '/textures/Sand/Sand_05/Sand_05_basecolor.png',
    previewPath: '/textures/Sand/Sand_05/Sand_05_basecolor.png',
    description: 'Firmly trodden light-colored courtyard sand trail.',
  },
  {
    id: 'sand_06',
    layerIndex: 45,
    name: 'Coastal Beach Sand',
    category: 'Sand',
    folder: 'Sand_06',
    diffusePath: '/textures/Sand/Sand_06/Sand_06_basecolor.png',
    previewPath: '/textures/Sand/Sand_06/Sand_06_basecolor.png',
    description: 'Coastal island sea fort sand.',
  },
  {
    id: 'sand_07',
    layerIndex: 46,
    name: 'Sun-Bleached Grit',
    category: 'Sand',
    folder: 'Sand_07',
    diffusePath: '/textures/Sand/Sand_07/Sand_07_basecolor.png',
    previewPath: '/textures/Sand/Sand_07/Sand_07_basecolor.png',
    description: 'Pale sandstone grit for bright reflective courtyard patches.',
  },
  {
    id: 'sand_08',
    layerIndex: 47,
    name: 'Golden Courtyard Sand',
    category: 'Sand',
    folder: 'Sand_08',
    diffusePath: '/textures/Sand/Sand_08/Sand_08_basecolor.png',
    previewPath: '/textures/Sand/Sand_08/Sand_08_basecolor.png',
    description: 'Warm golden tan sand evoking festive Diwali mornings.',
  },

  // 7. Bricks & Masonry (3 textures: layers 48 to 50)
  {
    id: 'bricks_dark_stone_floor',
    layerIndex: 48,
    name: 'Dark Stone Paving',
    category: 'Bricks',
    folder: 'dark_stone_floor_128x128_pbr',
    diffusePath: '/textures/Bricks/dark_stone_floor_128x128_pbr/dark_stone_floor_128x128_basecolor.png',
    previewPath: '/textures/Bricks/dark_stone_floor_128x128_pbr/dark_stone_floor_128x128_basecolor.png',
    description: 'Dressed dark stone flagstone paving for ramparts, citadels, and stairs.',
    culturalLore: 'Rampart walkway stone slabs.',
  },
  {
    id: 'bricks_dark_stone_texture',
    layerIndex: 49,
    name: 'Basalt Hewn Stone',
    category: 'Bricks',
    folder: 'dark_stone_texture_128x128_pbr',
    diffusePath: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_basecolor.png',
    previewPath: '/textures/Bricks/dark_stone_texture_128x128_pbr/dark_stone_texture_128x128_basecolor.png',
    description: 'Solid dark basalt hewn blocks for crenellations, bastions, and lintels.',
    culturalLore: 'Solid dark basalt blocks.',
  },
  {
    id: 'bricks_mossy_stone_brick',
    layerIndex: 50,
    name: 'Mossy Fort Masonry',
    category: 'Bricks',
    folder: 'mossy_stone_brick_128x128_pbr',
    diffusePath: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_basecolor.png',
    previewPath: '/textures/Bricks/mossy_stone_brick_128x128_pbr/mossy_stone_brick_128x128_basecolor.png',
    description: 'Authentic Sahyadri fort perimeter wall blocks with weathered moss joints.',
    culturalLore: 'Mossy fort wall masonry.',
  },

  // 8. Water (1 texture: layer 51)
  {
    id: 'water_blue_tarp',
    layerIndex: 51,
    name: 'Blue Tarpaulin Liner',
    category: 'Water',
    folder: 'blue_tarp_texture_128x128_pbr',
    diffusePath: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_basecolor.png',
    previewPath: '/textures/Water/blue_tarp_texture_128x128_pbr/blue_tarp_texture_128x128_basecolor.png',
    description: 'Nostalgic blue plastic sheet liner traditionally used in Diwali mud fort water tanks.',
    culturalLore: 'Festive diorama water tank liner.',
  },
];

/**
 * Finds texture by unique ID.
 */
export function getTextureById(id: string): TextureItem | undefined {
  return TEXTURE_MANIFEST.find((t) => t.id === id);
}

/**
 * Finds texture by layer index (0..51).
 */
export function getTextureByLayerIndex(index: number): TextureItem | undefined {
  return TEXTURE_MANIFEST.find((t) => t.layerIndex === index);
}

/**
 * Filters textures by category or returns all.
 */
export function getTexturesByCategory(cat: TextureCategory | 'all'): TextureItem[] {
  if (cat === 'all') return TEXTURE_MANIFEST;
  return TEXTURE_MANIFEST.filter((t) => t.category === cat);
}

/**
 * Searches textures by name, category, or description keywords.
 */
export function searchTextures(query: string, category?: string): TextureItem[] {
  const q = query.trim().toLowerCase();
  return TEXTURE_MANIFEST.filter((t) => {
    if (category && category !== 'all' && t.category !== category) {
      return false;
    }
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.culturalLore && t.culturalLore.toLowerCase().includes(q))
    );
  });
}


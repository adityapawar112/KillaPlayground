# Product Specification: Diwali Killa Sandbox

## 1. Product Vision & Overview
**Diwali Killa Sandbox** is an interactive, tactile 3D browser experience that lets anyone participate in the traditional Maharashtrian Diwali custom of building miniature mud forts (*Diwali Killa*)[cite: 1, 2]. 

Rather than requiring tedious, complex soil physics just to get started, the product offers a fast, creative **Killa-First** toolset: sculpt terrain, build modular stone fortresses (parametric walls, foundations, stairs, and fortifications), paint ground textures (dirt, sand, grass, gravel, rock), scatter 3D trees and shrubs, place historical figurines and architecture, illuminate the ramparts with glowing diyas and colorful Diwali fireworks (cone fountains and sky shots), and inspect the creation through a cinematic free-fly viewer. 

For purists seeking the authentic backyard craft experience, an organic **Tactile Soil Pipeline** is available as an advanced simulation layer (dumping raw soil, pouring water to turn it into workable wet mud, hand-shaping walls, and drying/locking mud).

It is designed for both nostalgic adults who never got to build a killa growing up (or now live in apartments without access to soil and courtyard space) and younger players who want to craft, paint, and share their own tribute fort with friends and family.

---

## 2. Target Audience & Core Value Proposition
* **First-Time & Nostalgic Builders:** Adults who watched neighborhood kids build killas and want to experience the tactile joy of shaping mud and decorating a fort from their browser[cite: 1].
* **Apartment & Diaspora Families:** People who want to celebrate the tradition during Diwali without hauling sacks of red soil and bricks up an elevator.
* **Instant Fort Creation for Busy Users:** Pre-built fort buildings, parametric walls, and multi-texture brushes allow completing an entire killa in minutes.
* **Zero-Friction Creative Play:** No sign-ups, no complex CAD controls, and no interior architectural headaches—just pure exterior diorama sculpting, hand-painting, and festive staging.

---

## 3. End-to-End User Journey

```
[1. Project Hub & Mode Selection]
├── A. Historical Fort Blueprints (Raigad, Murud-Janjira, Sinhagad, Vijaydurg, Shivneri)
├── B. Procedural Terrain Studio (Seed, Tableland, Elevation, Stepped Tiers 1-3, Water Toggle)
├── C. Saved Dioramas Vault (Browser IndexedDB Storage with Instant Re-open & Delete)
└── D. Portable File Import (.killa v1.2.0 binary package or legacy JSON)
│
▼
[2. Base Terrain Sculpting]
└── Elevate Hills -> Carve Valleys -> Flatten Plateaus -> Smooth Slopes -> Dig Ponds (Instant drag feedback via history decoupling)
│
▼
[3. Unified Building Construction Tool]
├── Walls: Click-to-draft perimeter ramparts with pointed crenellations & loop closing
├── Foundation: 2-phase drag-and-extrude stone plinths with negative depth & cancel CTA
├── Stairs: Continuous drag-drawn or point-by-point stone staircases ascending slopes (Sub-0.2ms BVH raycasting)
└── Fortifications: Watchtowers, inward rampart bastions, round bastions, Maha Darwaza gates (Single-click 60ms debounced & orbit-isolated)
│
▼
[4. Terrain Painting Studio]
└── Multi-Texture Brush: Dirt (Tambdi Maati), Sand, Grass, Gravel (Walkways), Rock (Basalt), Rocky (Zero-latency material singleton)
│
▼
[5. Foliage Paint & 3D Nature Scatter]
└── 3D Nature Scatter: Trees, Rocks, Shrubs, Grass Clumps (Cadence-throttled smooth drag scatter & erase)
│
▼
[6. Figurine & Architecture Asset Browser]
└── Place & Rotate: Warriors (Mavale), Shivaji Maharaj Throne, Musicians, Buildings, Carts, Cannons (Instant preview sync & zero-queue placement)
│
▼
[7. Festive Lighting & Fireworks Studio]
├── 18 Diyas: Terracotta & painted lamps with 16 3D point lights, volumetric halo flames & diurnal lighting
└── 10 Fireworks: Cone fountains (Anaar) & sky shots with burst height adjustments, test pyrotechnics & 5s pause timer
│
▼
[8. Time-of-Day, Atmospheric Engine & Diorama Viewing Studio]
├── 24-hr Solar Arc Engine: Luminous Full Moon Night, Radiant Golden Hour, Dawn & Noon Presets
├── Camera Perspectives & Lens FOV: Isometric (45°), Bird's Eye, Rampart Eye, Bastion Hero & FOV Slider
├── Continuous 360° Turntable Mode & Free Orbit Spectator with zero-modification viewport guard
├── 5-Second Celebratory Fireworks Salvo Test Action
├── 5-Button Quick-Action Diorama Bar: Day | Play | Pause | Screenshot | Night with continuous festive night pyrotechnics
├── Mobile Studio Experience & Universal Gestures: Thumb-Corner FOBs, Touch Gestures, Bottom Drawer Tabs & Mobile Poster Studio
└── Demand Frameloop & Auto-Pause: Tool switching automatically stops playback to ensure responsive demand rendering
│
▼
[9. Showcase, Multi-Angle Poster Studio & Share]
└── Multi-Template Festive Poster Studio (4 Curated Themes, 1-4 Views Grid, Atmospheric Sky Gradients, 4-Tile Diurnal Lighting Toggle, Screenshot Vault & Multi-Channel Share)
│
▼
[10. State Serialization, Local Persistence & Portable Packaging]
├── Local IndexedDB Vault: Automatic multi-slot project persistence surviving page refreshes
└── Export .killa Archive: Zero-cost fflate-compressed package saving heights, textures & props
│
▼
[11. Optional / Advanced: Tactile Soil Crafting Pipeline]
└── Dump Dry Soil -> Pour Water -> Push/Flatten from Top & Sides -> Dry/Lock Mud -> Freehand Mud Paint
```

---

## 4. Detailed Feature Specifications

### Phase 1: Project Hub & Terrain Studio

Upon opening the tool (or selecting `File -> Open / Switch Fort`), the user is greeted by the **Project Hub Modal** (`ProjectHubModal.tsx`), a modern tactile studio launchpad with 4 primary workflows:

#### 1. Historical Fort Blueprints
* **Authentic Fortress Selection:** User chooses from iconic Maratha forts (*Raigad*, *Murud-Janjira*, *Sinhagad*, *Vijaydurg*, *Shivneri*).
* **Calibrated Topography:** Each fort features a faithfully remade elevation profile:
  * *Raigad Fort:* High Sahyadri tableland with sheer Takmak Tok rock drops and Ganga Sagar water tank basin.
  * *Murud-Janjira Sea Fort:* Oval island fortress sitting gracefully inside the Arabian Sea with authentic defensive perimeter.
  * *Sinhagad Fort:* High-altitude triangular mountain saddle and Kalyan Darwaza ridge.
* **Pure Water Plane Architecture:** Sea forts feature clean, procedural water plane simulation rather than baked ground water textures, allowing the builder to toggle water planes on or off freely.
* **Guided Wall Outlines:** Faint white chalk/rangoli-style footprint lines show where outer ramparts (*tatbandi*), round bastions (*buruj*), gates (*Maha Darwaza*), and water cisterns (*taki*) belong.

#### 2. Procedural Mountain Terrain Studio
* **Tactile Topography Sliders:**
  * *Tableland Width (1.0m to 12.0m):* Width of the flat summit plateau where ramparts and figurines are erected.
  * *Peak Elevation (0.5m to 4.0m):* Vertical height of the hillfort mountain.
  * *Cliff Face Steepness (Gentle, Moderate, Sheer Escarpment):* Governs slope gradients.
  * *Crags & Roughness (0% to 100%):* Fractal rocky crevices and surface displacement.
  * *Stepped Mountain Tiers (1 to 3 Tiers):* Configures single-summit mountains, dual-tier plateaus, or triple-tiered hillforts with smooth continuous analytical sigmoid transitions, completely eliminating cliff tears or polygonal deformities.
* **Roll New Seed Dice Button:** Instantaneously reshuffles the deterministic PRNG seed, generating a completely fresh organic mountain layout while preserving chosen slider dimensions.

#### 3. Saved Dioramas Vault
* **Local Browser Vault (IndexedDB):** Lists all killas saved in the browser with timestamps, thumbnail previews, and fort blueprints.
* **One-Click Re-open & Delete:** Reopen past projects instantly or prune unwanted drafts without requiring server sync or login accounts.

#### 4. Portable File Import / Open
* **Direct File Drop & Picker:** Supports importing portable `.killa` v1.2.0 binary packages (with full heightmaps, painted textures, and placed structures) as well as legacy `.json` diorama state files.

#### 5. Terrain Studio Drawer (`TerrainStudioDrawer.tsx`)
* **Live Viewport Preview:** When sculpting or tuning procedural terrain, users can open the docked left Terrain Studio drawer. Unlike modal dialogs that obscure the 3D scene, the drawer lets users see real-time geometry updates directly in the diorama as sliders move.
* **Dedicated Sliding Water Plane Toggle:** An intuitive, sliding iOS-style toggle switch (`bg-[#15803D]` green when active, `bg-[#D9C9B4]` when off) clearly indicates whether the diorama water plane is enabled, preventing accidental oversight for inland vs. coastal forts.

#### 6. Terrain Change Confirmation Guard (`TerrainChangeConfirmModal.tsx`)
* Whenever a builder changes the base fort terrain (switching blueprints or rolling a new procedural seed) while walls, foundations, stairs, foliage, figurines, or lights already exist, a modal alert prompts the user with an itemized count of placed objects, requiring explicit confirmation before clearing or transforming the scene to prevent accidental floating props.

---

### Phase 2: Base Terrain Sculpting (Mountain & Ponds)
Directly manipulates the base diorama mesh (`65,536` vertices) with instantaneous GPU-accelerated feedback:
* **Elevate Tool:** Raises organic hills, mountain crests, and ridges with adjustable brush radius and height flow rate.
* **Lower Tool:** Depresses terrain to carve defensive ditches, moats, and natural valleys.
* **Plateau / Leveling Tool:** Flattens sampled vertices to a target plane height $H_{target}$, creating flat fort building decks, courtyards, and bastion foundations.
* **Smooth Tool:** Applies a 3x3 box blur filter to soften rugged peaks and create natural rolling terrain.
* **Pond / Water Body Sub-Tool:** Shader-integrated basin excavation carving depressions directly in the terrain heightmap and rendering authentic blue tarpaulin PBR water on the flat floor with glistening wet mud (*chikhal*) on crater banks up to the rim edge, restoring cleanly on undo.
* **Decoupled Undo History & Zero-Latency Drag:** Vertex deformations directly mutate the `Float32Array` heightmap buffer with zero initial drag jitter. Undo/redo history snapshots are emitted on stroke completion via decoupled `historyVersion`, preventing costly React state updates from interrupting continuous mouse dragging.

---

### Phase 3: Unified Building Construction Tool (Walls, Foundations, Stairs, Fortifications)

The standalone Wall and Spline tools are consolidated into a single high-velocity **Building** tool (`building`), eliminating redundant flag and diya splines (which now exist as authentic solid 3D models) while integrating stone steps directly alongside fort masonry:

* **5 Unified Operational Modes in `ToolModeSidebar.tsx`**:
  * **Select Mode**: Physical raycasting isolates fort ramparts, round watchtowers, bastions, gates, foundations, and stairs. Foundation slabs are strictly interactive in Select mode, preventing selection hijacking during active drafting.
  * **Walls Mode**: Click on terrain to draft perimeter wall curves with automatic pointed Murud-Janjira battlements, continuous elevation adherence, and Close Loop / Cancel Draft actions. Sub-0.2ms BVH raycasting against targeted pickables guarantees zero drafting lag on initial and intermediate nodes.
  * **Foundation Mode**: 2-phase drag-and-extrude rectangular stone foundation plinth builder:
    * *Phase 1 (Footprint):* Pointer down anchors first corner $(x_1, z_1)$ on terrain; dragging renders a real-time translucent amber ghost bounding box to opposite corner $(x_2, z_2)$.
    * *Phase 2 (Normalized Height):* Pointer up locks the base footprint and transitions to vertical height extrusion. Mouse movement dynamically adjusts height via normalized sensitivity (`0.008`). Primary click confirms and creates the slab.
    * *Negative Height Extrusion:* Supports negative height values down to `-10.0m` (extending below the terrain mesh for sunken courtyards, cistern pits, and deep plinths) up to `+25.0m`.
    * *Cancel Draft CTA:* Left properties panel features a dedicated "Cancel Draft" button (`TbX`) allowing builders to abort active drafts cleanly.
    * *Adjustable parameters:* Length, Width, Height (-10.0m to +25.0m), Vertical Offset (-0.5m to +2.0m), and Texture Tiling (1x to 10x UV multiplier).
    * Textured with `mossy_stone_brick_128x128_pbr` (perimeter sides) and `dark_stone_floor_128x128_pbr` (top deck).
  * **Stairs Mode**: Continuous drag-drawing or multi-point slope click path utilizing centripetal `THREE.CatmullRomCurve3` that extrudes walkable stepped horizontal stone masonry boxes conforming to slope gradients, with lateral offset slider (-15cm to +15cm), 2x default stair scale multiplier, and stair spacing slider. Targeted pickable raycasting ensures smooth point dragging without initial point latency.
  * **Fortifications Mode**: Continuous magnetic snap hologram placement along walls for 4 authentic fortification types:
    * *Sliding Round Watchtowers (`tower` / `buruj`):* Sliding cylindrical towers centered along the rampart.
    * *Rampart Bastion Platforms (`box`):* Inward-facing rectangular fighting platforms extending into the fort courtyard.
    * *Semicircular Round Bastions (`round_bastion`):* Semicircular bastions protruding outward from the fort wall with flat base centered flush on the outer wall edge, crowned with authentic 3D pointed Murud-Janjira Kangare battlements with shoulders matching towers.
    * *Arched Gateways (`gate` / `Maha Darwaza`):* Watertight portals flanked by twin towers with continuous rampart walkways above.
    * *Single-Click Placement Guarantee:* Event bubbling is cleanly halted (`e.stopPropagation()`) with a calibrated 60ms throttle guard in state management, ensuring exactly one fortification is placed per click without queuing delays or duplicate placements.
    * *Camera Orbit Isolation:* When camera orbit or pan is engaged (`e.buttons !== 0`), magnetic wall projection and snap preview calculations are completely bypassed, guaranteeing 60 FPS camera rotation.
    * *Sub-Centimeter Snap Deduplication:* State preview updates are suppressed if position delta is $< 0.005\text{m}$, eliminating redundant React re-renders.
    * *Static Shared Hologram Geometries:* Uses pre-allocated module-level wireframes (`holoRingGeo`, `holoTowerGeo`, `holoBoxGeo`), avoiding per-frame garbage collection.
* **Miniature Tabletop Diorama Calibration**:
  * Scaled to realistic miniature diorama measurements (default 25cm height, 15cm thickness; range 10cm to 100cm height, 5cm to 40cm thickness) with 12mm ground embedding.
  * Sliders dynamically display physical units in centimeters (`cm`).
* **Multi-Material PBR Texturing**:
  * Wall, Tower & Foundation Facings: Mossy stone brick masonry (`mossy_stone_brick_128x128_pbr`).
  * Rampart Walkways, Tower Decks & Foundation Top: Dressed dark basalt stone floor paving slabs (`dark_stone_floor_128x128_pbr`).
  * Battlements & Trims: Solid dark basalt stone (`dark_stone_texture_128x128_pbr`).
* **Authentic Murud-Janjira Pointed Battlements**:
  * Pointed stone merlons modeled after coastal and Deccan hill forts.
  * Outer-facing battlements automatically oriented via 2D centroid polygon calculations and downhill terrain slope gradient sampling, with manual flip toggle.
* **Watertight Maha Darwaza Arched Gateway**:
  * Formed with solid stone jambs, carved archway opening, and flush upper walkway connecting the fort ramparts across the entrance. Flanked by twin defensive stone towers.

---

### Phase 4: Terrain Texture Painting Studio (Tool 4)
Enables direct surface texturing on the terrain diorama without modifying mountain elevation or affecting placed walls, splines, or figurines:
* **52 Authentic Retro Textures across 8 Categories:**
  * **Dirt & Soil (8):** Compacted Mud, Hydrated Wet Mud, Red Laterite, Clay Silt, Loam Soil, Dry Dirt, Fine Earth, Crumbled Mud.
  * **Grass & Foliage (8):** Sprouted Mustard Grass, Lush Lawn, Dry Meadow, Olive Turf, Mossy Ground, High Grass, Sprouting Seeds, Dense Field.
  * **Gravel & Paths (8):** Trail Gravel, Fine Grit, Coarse Pebbles, Mountain Path, Crushed Stone, River Shingle, Worn Trail, Cobbled Dirt.
  * **Rock & Basalt (8):** Deccan Basalt, Rugged Slate, Quarry Stone, Weathered Basalt, Sharp Crag, Volcanic Slab, Dark Ledge, Rough Boulder.
  * **Rocky Ground (8):** Scree Field, Rocky Dirt, Mountain Slag, Pebble Soil, Shaly Terrain, Stony Mud, Chipped Rock, Grit Soil.
  * **Sand (8):** Sun-Baked Sand, Courtyard Silt, River Dune, Fine Sand, Coarse Dune, Muddy Sand, Beach Soil, Dry Silt.
  * **Bricks & Masonry (3):** Mossy Stone Brick, Dark Stone Floor, Dark Carved Stone.
  * **Water & Ice (1):** Blue Tarpaulin Water Sheet.
* **Original Texture Color Fidelity:** Textures render in their true original pixel-art colors without artificial warm or cool color filters.
* **Material Singleton Lifecycle & Zero-Latency Painting:** `CustomShaderMaterial` maintains a single persistent GPU pipeline across stroke cycles with in-place uniform updates (`uTexturePaint.value = currentTexture`). This eliminates dynamic shader reconstruction and garbage collection delays, ensuring texture strokes apply instantaneously on the very first drag pixel.
* **Interactive Tool Controls:**
  * **Brush Radius (0.2m–3.0m):** Controlled via slider, `Shift + Scroll Wheel`, or `[` / `]` keys.
  * **Strength (5%–100%):** Calibrated opacity/flow rate controlled via slider or `Ctrl + Scroll Wheel`.
  * **Edge Falloff (0%–100%):** Smooth Hermite falloff curve controlled via slider or `Alt + Scroll Wheel`.
  * **Tiling Repeat (4x–32x):** Real-time UV repeat adjustment.
  * **Flood Terrain & Clear Paint:** One-click whole-diorama flood or reset back to base Sahyadri soil.
* **2 Dedicated Operational Modes:**
  * **Paint:** Direct texture application with adjustable radius, strength, falloff, and tiling.
  * **Erase:** Smooth restoration of natural underlying base terrain.
* **Tool Separation:** Tool 4 is **`Texture`**; the name `paint` is reserved for Tool 7 (color painting on sculpted mud in the soil pipeline).

---

### Phase 5: 3D Foliage Paint & Nature Scatter
Interactive nature paint studio that populates the diorama landscape with authentic Deccan flora using high-performance retro Doom/PS1 cross-quad and single-plane billboard meshes:
* **Asset Library (117 Authentic Species across 7 Categories):**
  * **Canopy Broadleaf (50):** Ancient banyans, sacred peepals, shaded neems, giant mangoes, tamarinds, and hardwoods.
  * **Shrubs & Bushes (11):** Karvand mountain scrub, jaswand, bougainvillea, and defensive fort hedges.
  * **Flowering Trees (10):** Flame of the forest (*Palas*), scarlet gulmohar, golden amaltas, and sacred parijat.
  * **Dry Cliff & Escarpment (16):** Sun-baked thorn trees, arid cliff succulents, and weathered ridge flora.
  * **Acacia Savannah (15):** Flat-top babool, umbrella thorns, and Deccan scrub.
  * **Columnar Cypress (11):** Slender sentry cypress and ashoka sentinels.
  * **Coastal Palms (4):** Sea-fort coconut palms and wild cluster palms.
  *(Note: Grass turf is handled natively via Tool 4 Texture Painting, keeping 3D billboard scatter lightweight and performance-optimal).*
* **Billboard Rendering Engine:**
  * Double-sided cross-quad (2 intersecting quads) and single-plane cutouts with `alphaTest: 0.5` and `depthWrite: true`.
  * Soft spherical outward normals for volumetric 3D shading; custom depth material for crisp terrain shadow casting.
  * Real-time GPU vertex wind flutter and sway.
  * **Instanced Buffer Architecture:** `InstancedMesh` maintains a 512 minimum capacity, `frustumCulled = false`, and module-level reusable `tempFoliageObject`, eliminating per-drag bounding sphere recalculations and GC allocations.
* **Tri-Mode Operational Workflow & Smooth Drag Ergonomics:**
  * **Scatter Mode:** Drag across terrain to paint clusters with 35ms / 0.05m movement cadence throttling, eliminating CPU stalls during fast mouse sweeps.
  * **Single Mode:** Click anywhere to place hero specimen trees with precise randomized yaw and scale jitter.
  * **Erase Mode:** Drag to prune nature flora along brush stroke; directly updates the remaining instance array without secondary Set filtering loops, ensuring fluid and instantaneous plant clearing.
* **Selection Modes:**
  * **Single Select:** Focus on one specific flora species.
  * **Multi-Select:** Select multiple species in the Foliage Browser; scatter randomly picks from the selected set for rich, diverse woodland clusters. Includes one-click "Deselect All".

---

### Navigation & Interaction Scheme
A unified, consistent control paradigm applies across all tools:
* **Left Click:** Permanently dedicated to the active tool's primary action (sculpting terrain, drafting wall paths, placing bastions, painting textures, scattering foliage, selecting structures). Left-click orbit is permanently disabled in OrbitControls.
* **Right-Click Drag:** Permanently dedicated to OrbitControls camera rotation / orbit around the killa.
* **Middle-Click Drag:** Pan and shift camera target.
* **Zero-Interference Orbit Isolation:** Active tool dragging, snap previews, and raycast calculations are immediately suppressed when right-click or middle-click camera manipulation is active (`e.buttons !== 0`), guaranteeing 60 FPS camera navigation.
* **Scroll Wheel:** Zoom / dolly in and out.
* **Shift + Scroll:** Brush radius slider adjustment across all 3D tools.
* **Ctrl + Scroll:** Secondary slider adjustment (brush strength, foliage density).
* **Alt + Scroll:** Tertiary slider adjustment (plateau height, slope angle).
* **Collapse / Expand All:** Header menu bar buttons allow instant one-click collapse/expansion of all sidebars and floating HUD panels into minimal chips.
* **Focused 6-Tool Suite:** The 6 primary construction tools (Terrain, Walls, Spline, Texture, Foliage, Figurines) are active on the primary toolbar; the experimental soil simulation pipeline (tools 7-0) is temporarily hidden to keep the user journey streamlined.

---

### Phase 6: Figurine & Architecture Asset Browser
A categorized visual drawer lets users place, select, transform, and erase 40 solid 3D models across 7 authentic categories, complete with calibrated relative scaling, real-time instancing, and dual-pane outliner inspection:

1. **Royalty & Leadership (4 Models):**
   * **Chhatrapati Shivaji Maharaj on the Royal Throne (*Sinhasan*):** Seated on the ornate golden throne under a royal canopy (*Meghdambari*).
   * **Cavalry Commander:** Maratha cavalry commander on foot in formal armor.
   * **Royal Attendant:** Court attendant bearing the ceremonial peacock feather fan (*Morchel*).
   * **War Elephant:** Armored war elephant adorned with ceremonial headgear.
2. **Garrison & Citizens (*Mavale* Figurines - 4 Models):**
   * **Maratha Swordsman:** Foot soldier with raised talwar and dhal shield.
   * **Fort Sentry Spearman:** Sentry standing guard with a long spear.
   * **Bhagwa Flag Bearer:** Mavala carrying the sacred saffron swallowtail banner.
   * **Cliff Defender:** Hillfort defender poised to roll boulder projectiles down escarpments.
3. **Festive Musicians (2 Models):**
   * **Tutari Horn Blower:** Ceremonial musician sounding the curved brass fanfare horn.
   * **Dhol-Tasha Drummer:** Traditional percussionist with marching dhol drum.
4. **Yard & Props (2 Models):**
   * **Deccan Bullock Cart:** Traditional wooden transport cart with twin wheels and yoke.
   * **Bhagwa Flag:** Ground-mounted swallowtail saffron fort banner.
5. **Fort Architecture (7 Pre-Built Buildings):**
   * **Arms Depot (*Shastragar*):** Fort armory building for weapons storage.
   * **Elephant Stables (*Hattishala*):** Circular fortified stables with feeding troughs.
   * **Fort Granary (*Amberkhana*):** Fortified provisions depot with red-tile hip roof.
   * **Cavalry Stables (*Paga*):** Open pillared horse stables (calibrated to match garrison building scale).
   * **Fort Dungeon (*Bandikhana*):** Iron-barred holding jail and cell.
   * **Royal Kitchen (*Pakshala*):** Multi-hearth palace cooking house.
   * **Soldier Quarters (*Sadare*):** Stone barrack quarters for the garrison guard.
6. **Artillery & Ordnance (3 Models):**
   * **Bastion Cannon (*Toph*):** Heavy black iron cannon mounted on an authentic wooden field carriage.
   * **Cannonball Crate:** Wooden ammunition crate with pyramid-stacked iron cannonballs.
   * **Gunpowder Magazine (*Darukhana*):** Reinforced vault crate for propellant charges.

*(Note: The 18 terracotta and hand-painted festive diyas are consolidated into the dedicated Festive Lighting & Fireworks Studio).*

* **4 Operational Workflow Modes:**
  * **Place Mode:** Right-side Figurine Vault asset browser with category pills and search; real-time surface-snapping ghost reticle with placement scale, rotation heading, random heading, normal align, and elevation offset sliders. Switching selected assets in the Vault updates the 3D ghost reticle and shadow outline immediately. Placement executes instantaneously on pointer click with zero delay or click accumulation.
  * **Select Mode:** Scene Outliner tree with element counts, instant search, and unified Element Properties inspector (scale, heading, duplicate, snap surface, focus camera, delete).
  * **Transform Mode:** Camera-relative 3D nudge pad (Up/Forward/Down/Left/Backward/Right), heading rotation wheel with quick-angle snaps, uniform scale slider, and surface snapping.
  * **Erase Mode:** Left Sidebar brush radius slider, crimson diorama brush circle GUI on terrain/structures, stroke drag erasing, and outliner deletion.
* **Ergonomics & Hover Behavior:**
  * Two-way hover highlighting in Select and Transform modes: diorama hover triggers amber glow ring (`HoverRing`) and highlights outliner row; outliner hover highlights diorama figurine.
  * Hover rings and pointer cursor changes disabled in Place and Erase modes to eliminate visual clutter.

---

### Phase 7: Festive Lighting & Fireworks Studio
Dedicated pyrotechnic illumination studio bringing traditional Diwali celebration to the fort ramparts:
* **Catalog Assets (28 Total):**
  * **Terracotta Clay Diyas (9 Unique Models):** Standalone clay oil lamps (`diya_clay_01` to `diya_clay_09`) with authentic earthen clay textures.
  * **Hand-Painted Festive Diyas (9 Unique Models):** Standalone colorful painted lamps (`diya_color_01` to `diya_color_09`).
  * **Diwali Cone Fountains / Anaar (5 Variations):** 3D inverted cone models with decorative retro paper casings in Saffron Amber, Emerald Green, Royal Violet, Ruby Crimson, and Golden Sparkle.
  * **Diwali Sky Shots / Aerial Shells (5 Variations):** 3D cylinder launcher models in Multicolored Peony, Golden Willow, Silver Palm, Crackling Comet, and Saffron Ring.
* **3D Diya Illumination Engine:**
  * Procedural 3D teardrop flames with organic breeze sway, white-hot inner core, and camera-facing volumetric halo sprites for glowing visibility from any viewing angle.
  * **16 Statically Pre-Allocated 3D Omnidirectional PointLights** (`#FFA533`, `decay: 2.0`, `distance: 2.2m–4.8m`) in JSX. Guarantees **0ms shader recompilation freezes** when placing, moving, or deleting lights.
  * **Camera-Independent Spatial Clustering** (`computeSpatialClusters`): K-Means clustering in world coordinates ensures 360° camera orbiting causes **zero light popping, jumping, or white-hot bleaching**.
  * **True 3D Illumination**: Completely eliminates flat 2D decal pools, illuminating vertical fort walls, ramparts, bastions, figurines, stone steps, and slopes in authentic PBR light.
  * **Diurnal Diya Availability (`getDiyaLightStatus`)**: Diyas automatically ignite during Golden Hour (~16:30 onwards), reach full radiance throughout Diwali Night, and stay lit until morning Dawn (~06:30).
* **Pyrotechnics Particle Engine:**
  * Cone fountains emit continuous sparkling upward showers with parabolic spray and crackling embers. Fountain plume height automatically varies by $\pm 20\text{ cm}$ ($\pm 0.20\text{m}$) on each ignition for organic, realistic spray dynamics.
  * Sky shots launch ascending tracer rockets that detonate into radial burst patterns in the night sky. Detonation altitude automatically varies by $\pm 20\text{ cm}$ ($\pm 0.20\text{m}$) with a $10^\circ$ launch angle variation for authentic aerial physics.
  * Configurable particle parameters: color hue, velocity, spray height/spread, burst radius, gravity, and flicker rate.
  * **Adjustable Burst Height**: Slider in properties inspector allows setting the detonation altitude with a low default burst (~100cm from launcher).
  * **Randomize Burst Height Toggle**: Switch in Place mode automatically assigns randomized burst heights ($0.60\text{m}$ to $2.40\text{m}$) to newly placed fireworks.
  * **Continuous Festive Night Playback**: During dark hours (sunset through early morning), fireworks cycle continuously with staggered launches and natural pauses between bursts.
  * **Isolated Test Pipeline**: Timestamped trigger in store ensures fireworks detonate exclusively when the "Test Firework Burst" button is clicked, preventing accidental triggers during slider edits.
  * **5-Second Pause Countdown Timer**: Pausing the diorama freezes fireworks in a striking sculptural particle display. A 5-second countdown timer initiates: after 5 seconds, the frozen burst particles cleanly extinguish and reset, leaving the diorama completely clear for subsequent building and editing. Resuming Play mode restarts the celebration immediately without waiting for or being affected by the timer.
* **4 Operational Workflow Modes:**
  * **Place Mode**: Left properties panel (Scale, Heading, Randomize Heading, Align to Normal, Elevation Offset, Burst Height, and Randomize Burst Height toggle); Right panel renders Lighting Vault Asset Browser with Clay Diyas (9), Painted Diyas (9), and Fireworks (10).
  * **Select Mode**: Left panel renders selected item card, transform sliders, Surface Snap, "Test Firework Burst" button, and Duplicate/Delete; Right panel renders Placed Lights Outliner (upper) + Element Properties Inspector (lower) with Burst Height slider.
  * **Transform Mode**: Left panel renders camera-relative 3D nudge pad and heading rotation; Right panel renders Outliner + Inspector.
  * **Erase Mode**: Left panel renders Erase Radius slider directly on `bg-[#F3EBE0]` + crimson diorama brush circle GUI + Clear All Lights button; Right panel renders Outliner + Inspector.

---

### Phase 8: Time-of-Day, Atmospheric Engine & Diorama Viewing Studio
Comprehensive spectator and presentation studio designed for pure diorama admiration, time-of-day progression, and cinematic inspection:
* **Zero Accidental Edits & Clean Display:**
  * Object selection, raycast drafting, and brush rings are completely disabled.
  * Viewport clicks and drags are dedicated 100% to camera navigation.
  * Infinite white grid is permanently removed across all tools for a clean tabletop courtyard diorama aesthetic.
* **Atmospheric Lighting Engine (`atmosphericLighting.ts`):**
  * **Luminous Full Moon Diwali Night**: Silver-white moonlight (`#E0F2FE`, 1.35x), indigo shadow fill (`#475569`, 0.85x), dual-radiance hemisphere light (`#93C5FD` sky / `#1E293B` ground, 0.80x), and exposure `1.28`. Eliminates pitch-black voids, rendering terrain, water, cliffs, and fort walls clearly visible matching real full-moon landscapes.
  * **Vibrant Golden Hour**: Sun 30 minutes before sunset (elevation `20°`, azimuth `255°`, radiant saffron `#F59E0B` 2.80x, courtyard terracotta upward GI bounce `#EA580C` 0.90x, exposure `1.30`).
  * **Deccan Plateau Horizon Mist**: Exponential squared fog blending distant terrain smoothly into the diorama backdrop.
  * **ACESFilmic Tone Mapping**: Natural color grading preventing specular blowout on stone while enhancing flame vibrancy.
  * **Time-of-Day Controls**: 24-hr slider (0:00 to 24:00) with quick presets: Dawn (06:00), Noon (12:00), Golden Hour (17:30), and Diwali Night (21:00).
  * **Sun / Moon Directional Sliders**: Elevation (-10° to 90°) and Azimuth (0° to 360°) for sweeping dynamic shadows.
* **Camera Perspectives & Exhibition Rig:**
  * **Presets**: Isometric (45°), Bird's Eye (90° Top-Down), Rampart Eye (15° Low Hero View), Bastion Hero (30° Citadel Corner), and Home Reset.
  * **Lens FOV Slider**: 20° Telephoto to 80° Wide-Angle (45° Standard default).
  * **Turntable Exhibition Mode**: 360° continuous auto-spin exhibition mode.
  * **Orbit Spectator Mode**: Free 360° orbital rotation, panning, and zooming.
* **Celebratory 5-Second Fireworks Salvo**:
  * Dedicated "Test Fireworks (5s)" action button in the View tool that fires all placed fireworks across the diorama for 5 seconds regardless of the current time of day, with a 5-second disable cooldown.
* **5-Button Quick-Action Diorama Bar (`DioramaQuickBar.tsx`):**
  * `☀️ Day`: Transitions diorama to daylight courtyard lighting.
  * `▶ Play`: Starts continuous 60 FPS animation loop for trees, particle effects, and continuous night fireworks.
  * `⏸ Pause`: Freezes all wind sway and particle motion; returns canvas to on-demand rendering.
  * `📷 Screenshot`: Captures a clean headless 1920 × 1080 WebGL snapshot with diurnal sky gradient and physical scene lighting, dual-saving directly to user disk (`killa-diorama-<timestamp>.png`) and persisting to the local IndexedDB Screenshot Vault for instant reuse in the Poster Studio.
  * `🌙 Night`: Transitions to night mode, igniting all placed diyas and firing a celebratory simultaneous fireworks salvo.
* **Decoupled Ambient Animation & Auto-Pause on Tool Switch:**
  * Foliage wind sway is decoupled from mouse movement; animation progression is strictly governed by the `isPlaying` state.
  * Switching between primary tools (e.g., from Terrain to Building, Texture, Foliage, Figurine, or Lighting) automatically stops animation playback (`isPlaying: false`), returning the Three.js viewport to `<Canvas frameloop="demand">` for maximum UI responsiveness and battery efficiency.
  * Switching subtools or operational modes within the active tool preserves playback continuity without interruption.

---

### Phase 9: Showcase, Multi-Angle Poster Studio & Sharing
Once the user clicks **"Finish Killa"** (or selects `File -> Export Festive Poster`), the diorama transitions into the streamlined **Festive Killa Poster Studio** (`PosterStudioModal.tsx`):

#### 1. 2-Tab Studio Workspace & Pinned Export Dock
* **Tab 1: Slots & Layout:**
  * Controls image count (1 to 4 views) and layout grid variations (`4 Rows`, `2×2 Quad Grid`, `1 Hero + 3 Rows`, `3 Rows`, `2 Rows`, `2 Columns`, `Single Frame`).
  * **Compact Horizontal 4-Slot Navigator Strip:** Fast 1-click slot switcher (`Slot 1 45°`, `Slot 2 15°`, `Slot 3 30°`, `Slot 4 90°`) displaying live diurnal lighting icons and camera perspective badges, eliminating repetitive vertical scrolling lists.
  * **Focused Single-Slot Inspector:** Dedicated configuration panel scoped strictly to the selected slot (Image Source, Camera Perspective presets, Diurnal Lighting, and Screenshot Vault assignment). Includes an individual "Recapture Slot" action alongside the global "Recapture All".
* **Tab 2: Poster Style:**
  * Curated vector festival themes, Royal Shilalekh Plaque watermark styles, fort title, builder team credit, festive greetings, and builder credit toggle.
* **Pinned Bottom Export Action Dock:**
  * Permanently pinned and accessible at the bottom of the studio panel across all tabs and screen heights:
    * *Export Format Toggle:* Lossless PNG (1080 × 1350) or compact JPG for messaging apps.
    * *Download CTA:* High-resolution festival poster download button.
    * *One-Tap Secondary Actions:* Native Web Share API (`navigator.share`) and direct Clipboard copy (`navigator.clipboard.write`).
    * *Social Web Intents:* Direct share links for WhatsApp and X (Twitter).

#### 2. Synchronized Canvas Feedback & Clean Export Guarantee
* **Active Slot Visual Feedback:** The active slot is highlighted both on the horizontal navigator strip and on the 4:5 live poster preview with subtle terracotta corner brackets (`┌ ┐ └ ┘`) and an active `SLOT X` badge.
* **Direct Canvas Click-to-Select:** Clicking any quadrant or panoramic strip directly on the 4:5 poster preview instantly focuses that slot in the inspector.
* **Zero Export Contamination:** Slot brackets and interactive hotzones are rendered via a responsive CSS/DOM overlay above the canvas. The underlying 1080 × 1350 canvas remains 100% pristine and clean, ensuring that downloaded and shared poster graphics never contain editor UI elements.

#### 3. 4 Curated Historical Festival Themes
* **Citadel Archway (किल्ला महाद्वार):** Ornate stone gate archway with battlements, hanging brass lanterns, artillery cannon, and glowing terracotta diyas overlooking rolling Sahyadri valleys.
* **Royal Courtyard (राजदरबार उत्सव):** Maratha soldiers, cavalry commander, bugle herald, and cannon assembled before a sun-drenched hillfort escarpment with traditional geometric borders.
* **Moonlit Fortress (चंद्रप्रकाशित किल्ला):** Twilight mountain fortress under a radiant full moon and Diwali night fireworks.
* **Sahyadri Sunrise (सह्याद्री सूर्योदय):** Golden sunrise dawn overlooking misty Sahyadri fortress ramparts with saffron flag bearer standing guard.

#### 4. 5-Layer Sandwich Compositor & Transparent Grid Framing
* **Layer 1 (Base Vector Art):** High-resolution theme background SVG (`design_01` to `design_04`).
* **Layer 2 (Multi-Angle Diorama Grid):** 1 to 4 images arranged in responsive layout grids:
  * *4-Row Panoramic Strips (Default):* Widescreen strips matching the central archway opening.
  * *2×2 Quad Grid:* 4 square views balancing topographical and close-up angles.
  * *Hero Top + 3 Strips:* Large upper hero view with 3 panoramic context strips below.
  * *3-Row, 2-Row, 2-Columns, & Single View:* Automatically tailored to the chosen image count (1 to 4).
  * *Transparent Grid Gaps:* Completely borderless photo grid (`border: none`, transparent gaps) allowing the warm background artwork to shine through without dark container fills or heavy drop shadows.
* **Layer 3 (Overlay 1):** Foreground architectural badges, sky fireworks, or mountain elements (`layer_02_...`).
* **Layer 4 (Overlay 2):** Foreground figurines, cannon carriage, and terrain base (`layer_03_...`), producing a rich 3D layered parallax depth effect.
* **Layer 5 (Typography & Royal Plaque):** Authentic Devanagari display typography (`Yatra One`) and custom branding watermarks.

#### 5. Standard Camera Perspectives & Diurnal Snapshot Pipeline
* **4 Pre-Configured Perspectives:**
  * *Isometric (45°):* Full fort overview showing perimeter ramparts, tableland, and courtyard bricks.
  * *Bird's Eye (90° Top-Down):* Blueprint layout of mountain tiers and defensive walls.
  * *Rampart Eye (15° Low Hero View):* Dramatic upward entrance view looking at the Maha Darwaza and bastions.
  * *Bastion Hero (30° Citadel Corner):* Intimate angle focusing on royal throne, waving flags, and glowing diyas.
  * *Live Camera & Gallery:* Ability to assign the current interactive viewport view or pick from locally saved screenshots.
* **Diurnal Atmospheric Sky & Scene Lighting Overrides:**
  * Snapshots are rendered offscreen via `THREE.WebGLRenderTarget` at fixed dimensions independent of client screen size.
  * Automatically composites the diurnal sky background (Dawn peach-rose, Noon daylight blue, Golden Hour sunset amber, and Diwali Night deep indigo with twinkling stars).
  * Overrides physical scene lights (sun, ambient, bounce, hemisphere, point lights, and fog) to match the chosen time-of-day before cleanly restoring viewport lights.
* **4-Tile Time-of-Day Selector Per Slot:**
  * Each slot provides a 4-tile time toggle (Dawn, Noon, Golden Hour, Night).
  * Automatically assigns randomized diurnal defaults on initialization for diverse atmospheric variation across poster frames.
* **Atomic Monotonic Request Tracking:**
  * Monotonically incrementing request versions (`slotRequestVersions[slotIndex] = ++lastRequestId`) discard stale asynchronous renders, eliminating flickering or angle-reverting bugs.

#### 6. Screenshot Vault & In-App Deletion Safety
* Dedicated local IndexedDB gallery vault (`killa_screenshots_db`, store `screenshots`).
* Quick-action screenshot button dual-saves: downloads directly to disk and stores a copy in the vault for immediate use in poster slots.
* Custom in-app confirmation modal replaces invasive browser popups for deleting individual shots or clearing the entire vault.

#### 7. Devanagari Typography, Royal Stone Plaque & Multi-Channel Sharing
* **Royal Stone Plaque (*Shilalekh* / राजकीय शिलालेख):** Basalt stone cartouche (`#26201B` to `#151210`) with polished gold trim (`#D4AF37`), gold diamond accents (`✦`), and gold Devanagari typography (`#FDE68A`).
* **Strict Multilingual Locale Isolation:** Top-bar language switcher (`EN` | `म` | `हि`) controls all presets and labels; English mode displays clean titles and greetings without bracketed Marathi text.
* **Export & Sharing Options:**
  * *Download Poster (PNG / JPG):* Crisp, lossless PNG (1080 × 1350) or compact JPG for messaging apps.
  * *Native Web Share API:* One-tap mobile/desktop sheet sharing directly to Instagram Stories, WhatsApp, and social feeds.
  * *Copy Image:* Direct clipboard copy for pasting into WhatsApp Web or Discord.
  * *Social Web Intents:* Direct share links for WhatsApp and X (Twitter).

---

### Phase 10: State Serialization, Local Persistence Adapter & Project Hub
Provides robust, zero-cost state management and project packaging entirely within the client browser:
* **Local Browser Vault (IndexedDB `killaVault.ts`):**
  * Automatically saves and updates diorama changes locally.
  * Refreshing or reopening the browser instantly restores the exact terrain heights, painted textures, walls, structures, figurines, and lights.
  * Multi-slot project library displays saved dioramas with live timestamps, fort tags, and one-click open and delete controls.
* **Portable Binary `.killa` v1.2.0 File Package:**
  * Compresses the entire project state into a tiny `~25–45 KB` binary archive using `fflate` in $< 15\text{ms}$.
  * Captures full topographical precision across all 65,536 elevation points (`terrain.bin`), 256×256×4 painted texture splat buffers (`texture_paint.bin`), and complete Zod-validated scene graph metadata (`manifest.json`).
  * Enables seamless offline sharing of complete diorama files via WhatsApp, Discord, or drive links.
* **Legacy Compatibility & Import Resilience:**
  * Ingests previous JSON diorama files seamlessly, migrating legacy structures and filling in modern defaults without errors.

---

### Phase 11: Advanced Tactile Soil Crafting Pipeline (Deferred Simulation)
For builders desiring the authentic organic mud craft simulation:
* **Soil Pour Tool:** Dumps loose dry soil mounds onto the terrain with simplex noise roughness.
* **Water Sprinkler Tool:** Hydrates soil, turning it dark and malleable with specular wet sheen (`cracked_red_ground_1k`).
* **Hand Shaper Tool:**
  * *Top Patting:* Levels mounds into smooth horizontal plateaus.
  * *Side Pushing:* Compresses wet mud into vertical wall faces.
* **Drying & Mud Locking:** Sets lock state to 1.0, protecting finished structures from accidental brush deformation.
* **Freehand Mud Paint:** Detail liner brush with `lazy-brush` stabilizer for hand-painting dark basalt base coats and white lime (*chuna*) brick divider lines over dried mud masses[cite: 1, 2].

---

### Phase 12: Mobile Studio Experience & Universal Interaction Architecture

To bring the tactile joy of building Diwali mud forts to mobile phones, tablets, and touchscreens at ₹0 additional cost, the application implements a dedicated mobile studio layout (< 1024px) paired with a universal gesture engine:

#### 1. Two-Row Mobile Navigation Bar (`MobileTopNav.tsx`)
* **Row 1 (38px Primary Utility Bar):**
  * *Hamburger Menu (`☰`):* Opens an accessible slide-over sheet hosting Project Hub (File / Open / Switch Fort), Festive Fort Poster Studio CTA, 1-Tap Presentation View, Grid/Water Overlays, Trilingual Language Switcher (`EN` | `म` | `हि`), and Interactive Guide.
  * *Camera Perspective Cycle Button (`Iso`):* Compact pill cycling sequentially through `Isometric (45°)` -> `Bird's Eye (90°)` -> `Rampart Hero (15°)` -> `Home Reset` with synchronized dynamic icons and labels.
  * *Axis Snap Cycle (`Z`):* Cycles camera orientation along `Z-Axis` -> `Y-Axis` -> `X-Axis`.
  * *History Cluster:* Instant one-tap `Undo` (`TbRotateCcw`), `Redo` (`TbRotateClockwise`), and `Reset` (`TbTrash`) actions.
  * *Zoom Controls:* High-precision `Zoom In (+)` and `Zoom Out (-)` touch targets.
  * *Festive Poster Studio CTA:* Prominent amber button (`Poster` with `Sparkles`) launching the full Festive Fort Poster Studio directly from the top bar.
* **Row 2 (28px Diurnal & Playback Bar):**
  * *Animation Loop:* One-tap `Play` / `Pause` simulation toggle.
  * *360° Turntable Spin:* Smooth continuous diorama auto-rotation.
  * *1-Tap Present Button:* Instantly enters fullscreen presentation exhibition mode, hiding all toolbars and drawers.
  * *Snapshot Camera:* Captures a clean headless 1920 × 1080 screenshot with physical diurnal sky and scene lighting, dual-saving to disk and the local IndexedDB vault.
  * *Day / Night Diurnal Toggle:* Shifts between daylight courtyard radiance and luminous full-moon Diwali night with festive diyas and pyrotechnic volleys.

#### 2. Thumb-Corner Floating Action Buttons & Individual Radial Menus (`VirtualJoystick.tsx`)
* **Diorama Viewport Clearance:**
  * To maximize diorama visibility on mobile screens (< 1024px), the central 140px virtual joystick was removed in favor of native multi-touch viewport gestures (1-finger orbit, 2-finger pan, pinch zoom, single tap tool action, double-tap drag for continuous sculpt/paint), leaving the central diorama completely unobstructed.
* **Dual Thumb-Corner Floating Action Buttons (FOBs):**
  * **Left FOB (`fixed left-4 sm:left-6 z-30`):** 44×44px Sub-Tool Mode Selector button (`#FAF8F5`, `#B85F45` border & icon) displaying the active mode icon. Tapping opens an individual SVG Radial Donut Wheel (`wheelSize: 156px`, inner $r=28\text{px}$, outer $r=76\text{px}$) with mode slices.
  * **Right FOB (`fixed right-4 sm:right-6 z-30`):** 44×44px Primary Tool Selector button (`#2B2621`, `#D8D1C5` border & `#FAF8F5` icon) displaying the active tool icon. Tapping opens an individual SVG Radial Donut Wheel (`wheelSize: 156px`) with the 7 primary construction tools.
  * **Seamless 1-Tap Interaction:** Tapping any slice selects the item, updates the corresponding FOB icon, and closes the menu immediately. Includes a dimmed backdrop overlay (`bg-black/20 backdrop-blur-[1px]`) for 1-tap dismiss on outside click.
  * **Drawer Elevation:** Both FOBs glide upward to `bottom: calc(50vh + 14px)` when the bottom drawer opens, remaining comfortably accessible above the drawer.

#### 3. Universal Gesture Engine (`gestureController.ts`)
* **Multi-Touch Viewport Controls:**
  * *Single-Finger Drag:* Smoothly orbits the diorama camera.
  * *Discrete Single Tap ($<8\text{px}$ travel, $<350\text{ms}$ duration):* Performs primary tool action (placing a prop, stamping a bastion, selecting a wall).
  * *Double-Tap and Drag:* Initiates continuous tool action strokes (sculpting mountain terrain, painting texture splats, scattering trees) while suppressing camera orbit and pan.
  * *Two-Finger Drag:* Panning the viewport across the courtyard diorama.
  * *Pinch Gesture:* Two-finger continuous zooming in and out.
  * *Hardware Volume Button Integration:* Listening to hardware volume keys dynamically adjusts the active tool's primary property (e.g. brush radius or sculpt strength).
* **Trackpad & Mouse Controls:**
  * Primary click executes tool action; left-click drag orbits; double-tap drag pans; pinch gesture zooms.
  * Keyboard shortcuts provide instant property adjustments (`Shift + Scroll` for brush size, `Ctrl + Scroll` for brush strength).
* **Input Isolation Guard:**
  * Any pointer activity originating within the Floating Action Buttons, Radial Menus, Bottom Drawer, or Top Navigation Bar automatically mutes viewport gestures, preventing conflicting double-actions.

#### 4. Single-Stage Mobile Bottom Drawer (`MobileBottomDrawer.tsx`)
* **Single-Stage Drawer Elevation:**
  * Glides between a collapsed $44\text{px}$ grab handle peek and a single open height of $50\text{vh}$, completely eliminating multi-stage jump bugs.
  * Pulling up the drawer automatically shifts the thumb-corner Left and Right FOBs to `bottom: calc(50vh + 14px)`, keeping navigation controls permanently accessible floating above the drawer.
* **Direct Desktop Panel Reuse (Zero Code Duplication):**
  * Directly embeds desktop `<LeftToolSidebar isDrawer />` and `<RightToolSidebar isDrawer />` components into touch-friendly tabbed views, ensuring 100% feature and state parity with desktop mode.
* **4 Dynamic Tabs Adapted Per Tool & Mode:**
  * `[ Properties ]`: Universal Left Sidebar properties (brush size, strength, elevation, foundation extrusion, stair spacing).
  * `[ Assets ]`: Asset Vault browsers (Texture Swatches, Foliage nature library, Figurine 3D models, Festive Diyas & Fireworks).
  * `[ Outliner ]`: Placed scene tree (walls, towers, bastions, figurines, lights).
  * `[ Element ]`: Inspector for the currently selected object.
  * *Contextual Routing:* Tabs dynamically adapt per tool mode (e.g. Figurine Place displays `Properties` and `Assets`; Figurine Select displays `Properties`, `Outliner`, and `Element`). Selecting any item in the Outliner tab automatically routes the drawer to `[ Element ]`.

#### 5. Mobile-Optimized Festive Fort Poster Studio (`PosterStudioModal.tsx`)
* **Responsive Vertical Split Layout:**
  * *Upper Half (`h-[40vh]`):* Features a dedicated 4:5 aspect ratio viewing frame (`aspectRatio: 1080/1350`, `height: 100%`, `maxWidth: 100%`) displaying the entire festive poster collage clearly without vertical scrolling or aspect distortion.
  * *Lower Half (`flex-1`):* Hosts the desktop-identical segmented tabs (`[ Slots & Layout ]`, `[ Poster Style ]`) and scrollable controls.
  * *Consolidated Mobile Export Action Dock:* On smaller devices (< 768px), the tall pinned export dock is streamlined into a single high-impact button (`Export & Share Poster [PNG/JPG]`) occupying just 52px height, doubling the scrollable properties space. Tapping opens a dedicated, compact Export & Share Pop-up Dialog (`max-w-sm max-h-[90vh]`) containing all settings: PNG/JPG format toggle, primary download CTA, Web Share API trigger, clipboard copy, and direct WhatsApp / X links. The desktop view retains the full side dock.

#### 6. Mobile Vertical Presentation Glass Bar (`PresentationGlassBar.tsx`)
* On viewports < 1024px, the floating presentation glass capsule is pinned vertically along the left viewport edge (`left-3 top-1/2 -translate-y-1/2`), preventing horizontal cutoff.
* Features camera perspective cycling (persisting `activeCameraPreset`), 360° turntable, day/night lighting, snapshot capture, poster studio launch, and exit button.

---

## 5. Scope Boundaries & Non-Goals
* **No Building Interiors:** All forts, palaces, and towers are solid exterior mud forms. Users never enter rooms or manage indoor furniture.
* **No Combat or RTS Gameplay:** This is a creative festive diorama and craft sandbox, not a tower-defense or strategy battle game.
* **No Mandatory Account Creation:** Users can sculpt, paint, generate their multi-angle poster, and share a link without hitting a login wall.

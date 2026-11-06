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
[1. Mode Selection]
├── A. Historical Killa Blueprint (Pre-made Terrain + Chalk Wall Outlines)
└── B. Freeform / From Scratch (Random Terrain Generator + Blank Ground)
│
▼
[2. Base Terrain Sculpting]
└── Elevate Hills -> Carve Valleys -> Flatten Plateaus -> Smooth Slopes -> Dig Ponds
│
▼
[3. Unified Building Construction Tool]
├── Walls: Click-to-draft perimeter ramparts with pointed crenellations & loop closing
├── Foundation: 2-phase drag-and-extrude stone plinths with negative depth & cancel CTA
├── Stairs: Continuous drag-drawn or point-by-point stone staircases ascending slopes
└── Fortifications: Watchtowers, inward rampart bastions, round bastions, Maha Darwaza gates
│
▼
[4. Terrain Painting Studio]
└── Multi-Texture Brush: Dirt (Tambdi Maati), Sand, Grass, Gravel (Walkways), Rock (Basalt), Rocky
│
▼
[5. Foliage Paint & 3D Nature Scatter]
└── 3D Nature Scatter: Trees, Rocks, Shrubs, Grass Clumps with Radius & Density Controls
│
▼
[6. Figurine & Architecture Asset Browser]
└── Place & Rotate: Warriors (Mavale), Shivaji Maharaj Throne, Musicians, Buildings, Carts, Cannons
│
▼
[7. Festive Lighting & Fireworks Studio]
├── 18 Diyas: Terracotta & painted lamps with 16 3D point lights, volumetric halo flames & diurnal lighting
└── 10 Fireworks: Cone fountains (Anaar) & sky shots with burst height adjustments & test pyrotechnics
│
▼
[8. Time-of-Day, Atmospheric Engine & Diorama Bar]
├── 24-hr Solar Arc Engine: Luminous Full Moon Night, Radiant Golden Hour, Dawn & Noon Presets
└── Quick-Action Pill: Day | Play | Pause | Screenshot | Night with automatic celebration salvo
│
▼
[9. Free-Fly Spectator & Viewing Studio]
└── Clean HUD-free diorama viewing with Orbit Spectator and WASD Free-Fly flight navigation
│
▼
[10. Showcase, Multi-Angle Poster & Share]
└── Interactive 3D Link OR Auto-Captured Multi-Angle Festive Poster with Marathi/English Title Header
│
▼
[11. Optional / Advanced: Tactile Soil Crafting Pipeline]
└── Dump Dry Soil -> Pour Water -> Push/Flatten from Top & Sides -> Dry/Lock Mud -> Freehand Mud Paint
```

---

## 4. Detailed Feature Specifications

### Phase 1: Foundation & Mode Selection
Upon opening the tool, the user starts inside a cozy backyard/courtyard diorama workspace (bordered by red clay bricks or a corner wall, just like a real society courtyard build)[cite: 1, 2] and chooses one of two starting modes:

#### Option A: Historical Killa Blueprint Mode
* **Curated Fort Selection:** User selects from iconic Maratha forts (e.g., *Raigad*, *Pratapgad*, *Sinhagad*, *Shivneri*, *Murud-Janjira*, *Vijaydurg*)[cite: 2].
* **Pre-Molded Topography:** The base hill or coastal island terrain is already sculpted to match the real fort's elevation profile (e.g., an oval island surrounded by shallow water for *Murud-Janjira*[cite: 2], or a steep multi-tiered ridge for *Raigad*).
* **Guided Wall Outlines:** Faint white chalk/rangoli-style footprint lines are drawn directly onto the terrain showing exactly where the outer ramparts (*tatbandi*), round bastions (*buruj*), gates (*Maha Darwaza*), and water cisterns (*taki*) belong.
* **Reference Card:** A toggleable corner photo card shows how neighborhood builders traditionally style that specific fort[cite: 1, 2].

#### Option B: Blank / Custom Killa Mode
* **Random Terrain Generator:** Users click a **"Roll New Terrain"** button to generate organic base landscapes with a single click, along with simple sliders for:
  * *Flat Courtyard vs. Steep Mountain Ridge*
  * *Coastal/Island Setting vs. Inland Hilltop*
  * *Base Perimeter Brick Border* (toggles the classic row of red construction bricks holding the mud pile together at the base)[cite: 1].
* **No Guidelines:** Completely open canvas with zero pre-drawn wall outlines, allowing pure improvisation.

---

### Phase 2: Base Terrain Sculpting (Mountain & Ponds)
Directly manipulates the base diorama mesh (`65,536` vertices) with instantaneous GPU-accelerated feedback:
* **Elevate Tool:** Raises organic hills, mountain crests, and ridges with adjustable brush radius and height flow rate.
* **Lower Tool:** Depresses terrain to carve defensive ditches, moats, and natural valleys.
* **Plateau / Leveling Tool:** Flattens sampled vertices to a target plane height $H_{target}$, creating flat fort building decks, courtyards, and bastion foundations.
* **Smooth Tool:** Applies a 3x3 box blur filter to soften rugged peaks and create natural rolling terrain.
* **Pond / Water Body Sub-Tool:** Shader-integrated basin excavation carving depressions directly in the terrain heightmap and rendering authentic blue tarpaulin PBR water on the flat floor with glistening wet mud (*chikhal*) on crater banks up to the rim edge, restoring cleanly on undo.

---

### Phase 3: Unified Building Construction Tool (Walls, Foundations, Stairs, Fortifications)

The standalone Wall and Spline tools are consolidated into a single high-velocity **Building** tool (`building`), eliminating redundant flag and diya splines (which now exist as authentic solid 3D models) while integrating stone steps directly alongside fort masonry:

* **5 Unified Operational Modes in `ToolModeSidebar.tsx`**:
  * **Select Mode**: Physical raycasting isolates fort ramparts, round watchtowers, bastions, gates, foundations, and stairs. Foundation slabs are strictly interactive in Select mode, preventing selection hijacking during active drafting.
  * **Walls Mode**: Click on terrain to draft perimeter wall curves with automatic pointed Murud-Janjira battlements, continuous elevation adherence, and Close Loop / Cancel Draft actions.
  * **Foundation Mode**: 2-phase drag-and-extrude rectangular stone foundation plinth builder:
    * *Phase 1 (Footprint):* Pointer down anchors first corner $(x_1, z_1)$ on terrain; dragging renders a real-time translucent amber ghost bounding box to opposite corner $(x_2, z_2)$.
    * *Phase 2 (Normalized Height):* Pointer up locks the base footprint and transitions to vertical height extrusion. Mouse movement dynamically adjusts height via normalized sensitivity (`0.008`). Primary click confirms and creates the slab.
    * *Negative Height Extrusion:* Supports negative height values down to `-10.0m` (extending below the terrain mesh for sunken courtyards, cistern pits, and deep plinths) up to `+25.0m`.
    * *Cancel Draft CTA:* Left properties panel features a dedicated "Cancel Draft" button (`TbX`) allowing builders to abort active drafts cleanly.
    * *Adjustable parameters:* Length, Width, Height (-10.0m to +25.0m), Vertical Offset (-0.5m to +2.0m), and Texture Tiling (1x to 10x UV multiplier).
    * Textured with `mossy_stone_brick_128x128_pbr` (perimeter sides) and `dark_stone_floor_128x128_pbr` (top deck).
  * **Stairs Mode**: Continuous drag-drawing or multi-point slope click path utilizing centripetal `THREE.CatmullRomCurve3` that extrudes walkable stepped horizontal stone masonry boxes conforming to slope gradients, with lateral offset slider (-15cm to +15cm), 2x default stair scale multiplier, and stair spacing slider.
  * **Fortifications Mode**: Continuous magnetic snap hologram placement along walls for 4 authentic fortification types:
    * *Sliding Round Watchtowers (`tower` / `buruj`):* Sliding cylindrical towers centered along the rampart.
    * *Rampart Bastion Platforms (`box`):* Inward-facing rectangular fighting platforms extending into the fort courtyard.
    * *Semicircular Round Bastions (`round_bastion`):* Semicircular bastions protruding outward from the fort wall with flat base centered flush on the outer wall edge, crowned with authentic 3D pointed Murud-Janjira Kangare battlements with shoulders matching towers.
    * *Arched Gateways (`gate` / `Maha Darwaza`):* Watertight portals flanked by twin towers with continuous rampart walkways above.
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
* **Tri-Mode Operational Workflow:**
  * **Scatter Mode:** Drag across terrain to paint clusters of nature flora using Poisson-disk candidate thinning.
  * **Single Mode:** Click anywhere to place hero specimen trees with precise randomized yaw and scale jitter.
  * **Erase Mode:** Prune nature flora in a radius via sub-millisecond spatial hash queries.
* **Selection Modes:**
  * **Single Select:** Focus on one specific flora species.
  * **Multi-Select:** Select multiple species in the Foliage Browser; scatter randomly picks from the selected set for rich, diverse woodland clusters. Includes one-click "Deselect All".

---

### Navigation & Interaction Scheme
A unified, consistent control paradigm applies across all tools:
* **Left Click:** Permanently dedicated to the active tool's primary action (sculpting terrain, drafting wall paths, placing bastions, painting textures, scattering foliage, selecting structures). Left-click orbit is permanently disabled in OrbitControls.
* **Right-Click Drag:** Permanently dedicated to OrbitControls camera rotation / orbit around the killa.
* **Middle-Click Drag:** Pan and shift camera target.
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
  * **Place Mode:** Right-side Figurine Vault asset browser with category pills and search; real-time surface-snapping ghost reticle with placement scale, rotation heading, random heading, normal align, and elevation offset sliders.
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
  * Cone fountains emit continuous sparkling upward showers with parabolic spray and crackling embers.
  * Sky shots launch ascending tracer rockets that detonate into radial burst patterns in the night sky.
  * Configurable particle parameters: color hue, velocity, spray height/spread, burst radius, gravity, and flicker rate.
  * **Adjustable Burst Height**: Slider in properties inspector allows setting the detonation altitude with a low default burst (~100cm from launcher).
  * **Isolated Test Pipeline**: Timestamped trigger in store ensures fireworks detonate exclusively when the "Test Firework Burst" button is clicked, preventing accidental triggers during slider edits.
* **4 Operational Workflow Modes:**
  * **Place Mode**: Left properties panel (Scale, Heading, Randomize, Normal Align, Elevation Offset); Right panel renders Lighting Vault Asset Browser.
  * **Select Mode**: Left panel renders selected item card, transform sliders, Surface Snap, "Test Firework Burst" button, and Duplicate/Delete; Right panel renders Placed Lights Outliner (upper) + Element Properties Inspector (lower) with Burst Height slider.
  * **Transform Mode**: Left panel renders camera-relative 3D nudge pad and heading rotation; Right panel renders Outliner + Inspector.
  * **Erase Mode**: Left panel renders Erase Radius slider directly on `bg-[#F3EBE0]` + crimson diorama brush circle GUI + Clear All Lights button; Right panel renders Outliner + Inspector.

---

### Phase 8: Time-of-Day, Atmospheric Engine & Quick-Action Diorama Bar
Tactile diorama controls and 24-hr diurnal lighting engine:
* **Atmospheric Lighting Engine (`atmosphericLighting.ts`):**
  * **Luminous Full Moon Diwali Night**: Silver-white moonlight (`#E0F2FE`, 1.35x), indigo shadow fill (`#475569`, 0.85x), dual-radiance hemisphere light (`#93C5FD` sky / `#1E293B` ground, 0.80x), and exposure `1.28`. Eliminates pitch-black voids, rendering terrain, water, cliffs, and fort walls clearly visible matching real full-moon landscapes.
  * **Vibrant Golden Hour**: Sun 30 minutes before sunset (elevation `20°`, azimuth `255°`, radiant saffron `#F59E0B` 2.80x, courtyard terracotta upward GI bounce `#EA580C` 0.90x, exposure `1.30`).
  * **Deccan Plateau Horizon Mist**: Exponential squared fog blending distant terrain smoothly into the diorama backdrop.
  * **ACESFilmic Tone Mapping**: Natural color grading preventing specular blowout on stone while enhancing flame vibrancy.
* **5-Button Quick-Action Pill:**
  * `☀️ Day`: Transitions diorama to daylight courtyard lighting.
  * `▶ Play`: Starts continuous 60 FPS animation loop for trees, particle effects, and continuous night fireworks.
  * `⏸ Pause`: Freezes all wind sway and particle motion; returns canvas to on-demand rendering.
  * `📷 Screenshot`: Hides all HUD chrome, captures the full-resolution WebGL canvas buffer to PNG, triggers direct browser download (`killa-diorama-<timestamp>.png`), and restores the HUD.
  * `🌙 Night`: Transitions to night mode, igniting all placed diyas and firing a celebratory simultaneous fireworks salvo.
* **Decoupled Ambient Animation:**
  * Foliage wind sway is decoupled from mouse movement; animation progression is strictly governed by the `isPlaying` state.

---

### Phase 9: Free-Fly Spectator & Diorama Viewing Studio
Unobstructed cinematic presentation mode:
* **Zero Accidental Edits:**
  * Object selection, raycast drafting, and brush rings are completely disabled.
  * Viewport clicks and drags are dedicated 100% to camera navigation.
* **Clean Canvas Display:**
  * ToolModeSidebar and Right Scene Outliner are automatically hidden.
* **Dual Camera Controls:**
  * **Orbit Spectator:** Smooth 360° orbital rotation, panning, and zooming.
  * **Free-Fly Mode:** First-person flight through gateways and over bastions using `WASD` (forward/strafe/backward), `Q`/`E` (fly down/up), mouse look, and adjustable flying speed slider (0.5 m/s to 15.0 m/s with `Shift` 2x turbo boost).

---

### Phase 10: Showcase, Multi-Angle Poster Studio & Sharing
Once the user clicks **"Finish Killa"**, the tool transitions into the **Showcase & Poster Studio**:

#### 1. Automated Multi-Angle Poster Generator
Captures high-resolution snapshots of the user's finished killa from **4 cinematic angles** in $< 400\text{ms}$[cite: 1, 2]:
* **Hero Bird's-Eye Overview:** Full isometric view showing the entire fort layout, lawns, and walls[cite: 1, 2].
* **The *Maha Darwaza* & Bastion Low-Angle:** Looking up at the stone ramparts, cannons, and guards[cite: 1, 2].
* **The *Balekilla* Throne & Buildings Close-Up:** Focusing on Chhatrapati Shivaji Maharaj, the saffron flag, and courtyard buildings[cite: 2].
* **Golden-Hour / Diwali Night Diya View:** Warm festive lighting with glowing diyas along the battlements.

#### 2. Custom Poster Composition & Typography
* Consolidates the multi-angle views into a single, ready-to-share **Festive Collage Poster** (**9:16 Instagram Story / WhatsApp Status** and **4:5 Social Feed** aspect ratios)[cite: 2].
* **Custom Calligraphic Header:** Custom fort name and builder name styled with Marathi decorative typography (`Yatra One`) and festive greeting (`Modak`): *"दिवाळीच्या हार्दिक शुभेच्छा"*[cite: 2].

#### 3. Instant Sharing Options
* **Download Festive Poster (PNG/JPG):** One-tap download for WhatsApp family groups, Instagram Stories, X, and LinkedIn.
* **Share Interactive 3D Link:** Generates a permanent, zero-login view-only link for friends to inspect in 3D.

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

## 5. Scope Boundaries & Non-Goals
* **No Building Interiors:** All forts, palaces, and towers are solid exterior mud forms. Users never enter rooms or manage indoor furniture.
* **No Combat or RTS Gameplay:** This is a creative festive diorama and craft sandbox, not a tower-defense or strategy battle game.
* **No Mandatory Account Creation:** Users can sculpt, paint, generate their multi-angle poster, and share a link without hitting a login wall.

# Product Specification: Diwali Killa Sandbox

## 1. Product Vision & Overview
**Diwali Killa Sandbox** is an interactive, tactile 3D browser experience that lets anyone participate in the traditional Maharashtrian Diwali custom of building miniature mud forts (*Diwali Killa*)[cite: 1, 2]. 

Rather than requiring tedious, complex soil physics just to get started, the product offers a fast, creative **Killa-First** toolset: sculpt terrain, draw customizable fort walls with towers and gates, place stone steps and flag lines with splines, paint ground textures (dirt, sand, grass, gravel, rock), scatter 3D trees and shrubs, and place clay figurines and pre-built fort buildings. 

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
[3. Walls & Spline Structures]
├── Parametric Walls: Height, Thickness, Bastions/Towers, Gates, Crenellations
└── Spline Structures: Stone Steps, Saffron Flag Lines, Glowing Diya Rows
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
└── Place & Rotate: Warriors (Mavale), Shivaji Maharaj Throne, Musicians, Buildings, Carts, Barrels, Cannons
│
▼
[7. Showcase, Multi-Angle Poster & Share]
└── Interactive 3D Link OR Auto-Captured Multi-Angle Festive Poster with Marathi/English Title Header
│
▼
[8. Optional / Advanced: Tactile Soil Crafting Pipeline]
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

### Phase 3: Parametric Fort Walls & Spline Placement Tools

#### 3.1 Parametric Walls Tool
Enables users to draw continuous wall curves or multi-segment fort ramparts conforming directly to the underlying terrain elevation. This provides an express path to building fortified killas without requiring manual soil sculpting:
* **Decoupled 3-Mode Interaction**:
  * **Select Mode**: Click any wall, bastion, or gate to inspect its properties in the Right Sidebar, rename it, delete it, or highlight hovered components in 3D.
  * **Draw Mode**: Click on terrain to draft rampart curves. Start closing node rendered in green, intermediate points in yellow. Features direct "Finish Wall" or "Cancel Draft" actions.
  * **Fortify Mode**: Allows continuous placement of the 3 authentic fortification types via magnetic snap holograms:
    * **Watchtowers**: Sliding continuous round towers snapping to any point along wall segments.
    * **Rampart Bastions**: Inward rectangular stone platforms attached flush to the wall, featuring 3D perimeter protective railings while keeping the outer wall crenellations uninterrupted.
    * **Arched Gateways**: Arched entrances with flanking towers and continuous upper rampart walkways.
* **Miniature Tabletop Diorama Calibration**:
  * Scaled to realistic miniature diorama measurements (default 25cm height, 15cm thickness; range 10cm to 100cm height, 5cm to 40cm thickness) with 12mm ground embedding.
  * Sliders dynamically display physical units in centimeters (`cm`).
* **Multi-Material PBR Texturing**:
  * Wall & Tower Facings: Mossy stone brick masonry (`mossy_stone_brick_128x128_pbr`).
  * Rampart Walkways & Tower Floor Decks: Dressed dark basalt stone floor paving slabs (`dark_stone_floor_128x128_pbr`).
  * Battlements & Trims: Solid dark basalt stone (`dark_stone_texture_128x128_pbr`).
* **Authentic Murud-Janjira Pointed Battlements**:
  * Pointed stone merlons modeled after coastal and Deccan hill forts.
  * Outer-facing battlements automatically oriented via 2D centroid polygon calculations and downhill terrain slope gradient sampling, with manual flip toggle.
  * Preserved continuously along outer ramparts where Rampart Bastions connect.
* **Watertight Maha Darwaza Arched Gateway**:
  * Formed with solid stone jambs, carved archway opening, and flush upper walkway connecting the fort ramparts across the entrance.
  * Flanked by twin defensive stone towers with solid floors.
* **Magnetic Snap Holograms**:
  * Real-time cursor holograms oriented with outward-facing wall normal for gates, and inward-facing normal for rampart bastions.

#### 3.2 Spline Structure Placement Tool
Draws smooth 3D curves across terrain slopes and atop fort ramparts/structures using `THREE.CatmullRomCurve3` (and `LineCurve3` for 2-point segments) and places specialized features along the drawn path:
* **Decoupled 3-Mode Interaction**:
  * **Select Mode**: Direct physical mesh raycast selection of steps, flags, or diyas without coarse terrain proximity interference.
  * **Draw Mode**: Draft path lines with real-time length readouts and "Finish Path" action.
  * **Transform Mode**: Move paths in camera-relative directions (Forward, Backward, Left, Right, Up, Down), rotate curves, or adjust individual feature scale.
* **Feature Conversions**:
  * **Stone Steps:** Generates stepped horizontal stone boxes ascending slopes or terraced plateaus with 7x larger authentic stone masonry texture scale, lateral offset slider, and stair spacing slider.
  * **Bhagwa Saffron Flags:** Plants fluttering swallowtail saffron flags at uniform intervals along paths, ridges, or wall ramparts.
  * **Festive Diyas:** Arranges warm glowing terracotta oil lamps along path curves for evening illumination.
* **Surface Occlusion Guard:** Prevents pointer events from falling through elevated fort structures to the terrain below, ensuring splines drawn on walls stay strictly on the structures.

---

### Phase 4: Terrain Painting Studio
Allows painting surface textures directly onto the terrain mesh without affecting walls, splines, or placed figurines:
* **Authentic Texture Palette:**
  * **Dirt (*Tambdi Maati*):** Rich red laterite soil characteristic of Deccan hill forts.
  * **Sand:** Courtyard silt and beach sand for coastal forts like *Murud-Janjira*.
  * **Grass:** Lush green ground cover on slopes.
  * **Gravel:** Crushed stone and dirt trails for walking paths and roads.
  * **Rock:** Dark Deccan Basalt escarpments and crags.
  * **Rocky Ground:** Mixed gravelly hillside texture.
* **Brush Controls:** Variable brush radius, opacity/strength, and soft falloff edge.

---

### Phase 5: 3D Foliage Paint & Nature Scatter
Interactive scatter brush that populates the diorama landscape with stylized 3D nature props in batched draw calls:
* **Asset Library:**
  * **Trees:** Deccan banyan, neem, and mountain acacia trees.
  * **Rocks:** Scattered basalt boulders and pebbles.
  * **Shrubs:** Hardy mountain bushes and scrub.
  * **Grass Models:** 3D sprouted mustard/*halim* seedling sprout clusters.
* **Scatter Controls:**
  * Scatter radius slider.
  * Density slider (instances placed per second/drag).
  * Scale and rotation jitter for natural, organic distribution.

---

### Phase 6: Figurine & Architecture Asset Browser
A categorized visual drawer lets users drag, drop, rotate, and scale miniature clay figurines, festive props, and pre-built fort buildings:

1. **Royalty & Leadership:**
   * **Chhatrapati Shivaji Maharaj on the Royal Throne (*Sinhasan*):** Complete with ornate golden/red canopy (*Meghdambari*), steps, and pedestal[cite: 1, 2].
   * **Equestrian Statue:** Maharaj on horseback.
2. **Garrison & Citizens (*Mavale* Figurines):**
   * Standing spearman and swordsman guards in colorful bright tunics (yellow, green, blue, orange, red) and traditional *pagdis*[cite: 1, 2].
   * Sentries aiming muskets/bows along the bastion walls[cite: 1, 2].
   * Traditional village citizens and flag bearers.
3. **Musicians:**
   * Horn/Tutari blowers sounding the royal fanfare.
   * Dhol/Tasha drummers standing near the main gate.
4. **Buildings & Fort Architecture (Instant Architecture):**
   * Pre-built **Watchtowers**, **Stone Bastions**, **Temple Shrines** (Bhavani Mata / Shiva Lingam), **Fort Houses**, and **Stone Archways**.
   * *Purpose:* Enables users with limited time to immediately place iconic fort buildings without sculpting soil from scratch.
5. **Artillery, Carts & Yard Props:**
   * Black iron cannons (*Toph*) mounted on wheeled carriages[cite: 2].
   * Bullock carts, wooden barrels, and supply crates.
   * Tall swaying saffron flags (*Bhagwa Dhwaj*)[cite: 1, 2].
   * Origami paper boats (*Hodi*) for water cisterns or sea areas[cite: 2].
   * Terracotta diyas (oil lamps) with warm amber flames.

---

### Phase 7: Showcase, Multi-Angle Poster Studio & Sharing
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

### Phase 8: Advanced Tactile Soil Crafting Pipeline (Deferred Simulation)
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

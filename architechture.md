# Technical Architecture & System Design: Diwali Killa Sandbox

## 1. Ponytail Engineering Philosophy (The 7-Rung Audit)
Every architectural choice in this document climbs the **7-Rung Ladder of Laziness** to eliminate custom boilerplate, server costs, and 3 AM debugging:

1. **YAGNI (Cut completely):** No user authentication, no server-side 3D rendering, no custom voxel/marching-cubes engine, no WebSockets, and no backend image-processing queues.
2. **Standard Library / Native Platform First:**
   * Poster generation uses the browser's native `OffscreenCanvas` + `CanvasRenderingContext2D` + `navigator.share()` instead of a Node.js Puppeteer server.
   * Multi-texture terrain painting uses splat weight maps projected directly across the terrain rather than costly dynamic render-target ping-pong pipelines.
   * Undo/Redo stores compressed `Uint8Array` snapshots in a 15-slot circular array in memory.
3. **Existing Libraries Over Custom Math:**
   * Raycasting acceleration uses `three-mesh-bvh` (3 lines of setup) instead of custom quadtrees.
   * Shader blending uses `three-custom-shader-material` on top of `THREE.MeshStandardMaterial` instead of writing PBR lighting from scratch.
   * Foliage and nature scatter uses `@react-three/drei` `<Instances>` instead of custom GPU compute shaders.

---

## 2. Zero-Cost Tech Stack

| Layer | Technology / Library | Why This Exists (Ponytail Justification) | Cost |
| :--- | :--- | :--- | :--- |
| **App Framework** | **Next.js 15 (App Router, Static + Edge)** or **Vite + React 19** | Static shell for the editor (`/build`) + dynamic OpenGraph metadata route (`/killa/[id]`) for shared links. | ₹0 |
| **3D Engine** | **Three.js + `@react-three/fiber` + `@react-three/drei`** | Declarative scene graph, built-in `<OrbitControls>`, `<Instances>`, `<Decal>`, `<Extrude>`, and GLTF loader caching. | ₹0 |
| **Raycasting** | **`three-mesh-bvh` + `@react-three/drei` (`<Bvh>`)** | Wraps the terrain mesh in a Bounding Volume Hierarchy so pointer raycasts take `< 0.2ms` instead of `14ms`. | ₹0 |
| **Shader Extension** | **`three-custom-shader-material` (CSM)** | Injects multi-texture blending (dirt, sand, grass, gravel, rock), wetness gloss, and retro pixel-art sampling without rewriting shadows or lights. | ₹0 |
| **UI & Toolbar** | **Tailwind CSS + Radix UI / Shadcn UI + `react-icons/tb`** | Zero-effort accessible sliders, resizable docks, outliner file tree, and tactile control strips. | ₹0 |
| **Client State** | **Zustand** (UI/Tool state ONLY) | Holds active tool, modes, selection IDs, panel widths, and placed object metadata. Never holds 60Hz vertex data. | ₹0 |
| **Payload Compression** | **`fflate`** | Compresses raw heightmap + paint weights + prop JSON by ~85% in `< 8ms` on the client so we don't need file-storage buckets for every small fort. | ₹0 |
| **Validation** | **Zod** | Validates incoming JSON/binary payloads on the save API route to prevent malformed data or oversized payload attacks. | ₹0 |
| **Database & Storage** | **Supabase (Free Tier: Postgres + Storage)** | 500MB Postgres database + 1GB Object Storage for compressed killa states and shared poster thumbnails. | ₹0 |
| **Hosting & CDN** | **Vercel (Hobby Free) or Cloudflare Pages** | Global edge caching for static `.glb` models, basis-compressed `.ktx2` textures, and fort heightmaps. | ₹0 |
| **Testing & Judges** | **Vitest + Playwright + `r3f-perf`** | Deterministic unit tests for buffer compression and automated headless WebGL frame-time/memory assertions. | ₹0 |

---

## 3. High-Level Design (HLD) & Data Flow

The system is 95% client-computed. The backend is a lightweight persistence pipe that only wakes up when a user clicks **"Share Killa"** or opens a friend's shared link.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT (WebGL2)                          │
│                                                                         │
│  ┌─────────────────────┐      ┌──────────────────────────────────────┐  │
│  │ Static CDN Assets   │      │ GPU / TypedArray Memory (60 FPS)     │  │
│  │ • 6 Fort DEM PNGs   │─────▶│ 1. Terrain Height Buffer (256x256)   │  │
│  │ • Retro Textures    │      │ 2. Texture Splat Weight Buffer       │  │
│  │ • 15 Draco .glb     │      │ 3. Parametric Walls & Spline Geometry│  │
│  │ • PBR Brick Textures│      │ 4. Foliage & Prop Transform Arrays   │  │
│  └─────────────────────┘      └──────────────┬───────────────────────┘  │
│                                              │                          │
│  ┌───────────────────────────────────────────▼───────────────────────┐  │
│  │                     On "Finish & Share" Click                     │  │
│  │  • Path A (Poster): 4-Camera Render -> OffscreenCanvas -> PNG     │  │
│  │  • Path B (3D Link): Buffers -> fflate.zipSync (~25 KB)           │  │
│  └───────────────────────────────────────────┬───────────────────────┘  │
└──────────────────────────────────────────────┼──────────────────────────┘
                                               │ POST /api/killa (Zod Guard)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE FREE TIER (Persistence)                     │
│  • Table `killas`: id (nanoid 8-char), title, fort_template,            │
│    props_json (JSONB), state_blob_url, created_at                       │
│  • Bucket `killa-blobs`: Stores the 25 KB compressed binary buffer      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Low-Level Design (LLD) — Architecture & Tool Breakdown

### 4.1 Slope-Aware Terrain Material & Dual-Level Geometry Architecture
The diorama is structured into two complementary geometric layers:

1. **The Base Terrain Layer (Mountain & Courtyard):**
   * A single high-resolution `THREE.PlaneGeometry(10, 10, 255, 255)` (`65,536` vertices) wrapped in `<Bvh firstHitOnly>`.
   * **Procedural Multi-Tier Continuous Terrain Generation (`terrainGenerators.ts`):**
     * Generates organic Sahyadri topography from deterministic PRNG seeds with customizable parameters: Tableland Width, Peak Elevation, Cliff Steepness, Crags & Roughness, and Stepped Mountain Tiers (1 to 3 tiers).
     * **Continuous Analytical Multi-Sigmoid Radial Profile ($C^1/C^2$ Continuity):**
       To eliminate cliff tears, vertical edge flipping, and mesh folding artifacts caused by piecewise step cutoffs, multi-tier mountains utilize a smooth sum of analytical generalized logistic sigmoids:
       $$H(r) = H_{base} + \sum_{i=1}^{N_{tiers}} \frac{\Delta h_i}{1 + \exp\left( -k_i \cdot (R_i(\theta) - r) \right)}$$
       where $R_i(\theta)$ represents the perturbed radial threshold at tier $i$ modulated by harmonic Simplex noise frequencies. This guarantees unbroken continuous gradients across all slope faces and flat plateaus.
     * **Remade Preset Fort Terrains:** Historical presets (*Raigad*, *Murud-Janjira*, *Sinhagad*, *Vijaydurg*, *Shivneri*) are calibrated to authentic Deccan basalt plateaus and coastal islands, removing baked water textures in favor of the procedural water shader.
   * **Multi-Texture Splat Blending (`three-custom-shader-material`):**
     * Multi-texture blending maps **Dirt** (*Tambdi Maati*), **Sand**, **Grass**, **Gravel**, **Rock** (Deccan Basalt), and **Rocky** textures across the mesh.
     * Steep slope escarpments ($N_y < 0.78$) automatically transition into rock cliff faces via triplanar projection to prevent vertical UV stretching.
     * Brush strokes from the **Texture Tool (Studio)** write into discrete texture splat buffers (`terrainPaintBuffer.ts`) to paint authentic retro surface textures, pathways, grass greens, and ponds without affecting geometry.

2. **The Structure & Prop Layer (Walls, Splines, Foliage & Figurines):**
   * Structures exist as discrete meshes positioned atop the terrain surface.
   * Walls and splines conform to terrain elevation dynamically via bilinear height sampling.
   * Figurines, pre-built buildings, and foliage instances calculate their base Y-coordinates and ground normal alignment via BVH raycasting.

---

### 4.2 Tool Taxonomy: Primary Fort Construction Suite vs. Deferred Soil Pipeline

To give users the fastest, most joyful path to crafting a complete fort, tools are divided into the **Primary Killa Suite** (implemented first) and the **Tactile Soil Pipeline** (deferred advanced simulation).

#### A. Primary Fort Construction Suite (7 High-Velocity Tools)

1. **Terrain Tool (Base Mesh Manipulation):**
   * Directly sculpts the mountain terrain mesh:
     * *Peak:* Raises organic mountain mounds and ridges with smooth radial falloff.
     * *Plateau:* Flattens sampled vertices to $H_{target}$ for building platforms and courtyards.
     * *Ramp:* Carves linear graded slopes conforming to set angles.
     * *Gorge:* Excavates valleys and ravines.
     * *Trench:* Cuts narrow defensive moat channels.
     * *Smooth:* Softens steep edges using an adaptive kernel blur filter.
     * *Pond Excavation:* Shader-integrated crater basin carving depression height and rendering authentic blue tarpaulin water on flat floors (`wetness > 0.68`) with glistening dark wet mud on crater banks.
     * *Retexture:* Restores natural soil and basalt surface coats.

2. **Building Tool (Consolidated Fort Architecture & Foundations):**
   * Consolidates the former Wall and Spline tools into a unified fortress masonry suite. Retires obsolete flag and diya spline generation (which now exist as authentic solid 3D models), while migrating stepped stone stairs into the fortress tool.
   * **5 Operational Modes in `ToolModeSidebar.tsx`:**
     * `Select`: Direct physical mesh picking of walls, towers, bastions, gates, foundations, and stairs. Foundation slabs are strictly interactive in `Select` mode, preventing accidental selection during drafting.
     * `Walls`: Continuous click-to-draft perimeter ramparts with automatic pointed battlements, elevation tracing, and Close Loop (`TbRefresh`) / Cancel Draft (`TbX`) controls.
     * `Foundation`: 2-phase drag-and-extrude rectangular stone foundation plinth builder on terrain:
       * *Phase 1 (Base footprint):* Pointer down anchors first corner $(x_1, z_1)$ on terrain surface; dragging renders a real-time translucent ghost box to opposite corner $(x_2, z_2)$.
       * *Phase 2 (Height extrusion):* Pointer up locks the base footprint and transitions to vertical height extrusion. Mouse movement dynamically adjusts height via a normalized scaling factor (`0.008`). Left-click confirms and builds the solid slab.
       * *Negative Height Extrusion:* Supports negative height values down to `-10.0m` (extending below the terrain mesh for sunken courtyards, cistern pits, and deep plinths) up to `+25.0m`.
       * *Cancel Draft CTA:* Left properties panel features a dedicated "Cancel Draft" button (`TbX`) allowing builders to abort active drafts cleanly.
       * *Multi-material geometry partitioning:* Perimeter sides mapped to `mossy_stone_brick_128x128_pbr` (Group 0) and top horizontal deck mapped to `dark_stone_floor_128x128_pbr` (Group 1).
       * *Interactive parameters:* Length ($dx$), Width ($dz$), Height (-10.0m to +25.0m, default 0.40m), Vertical Offset (-0.5m to +2.0m, default 0.0m), and Texture Tiling (1x–10x UV multiplier).
     * `Stairs`: Continuous drag-drawing or multi-point slope click path utilizing centripetal `THREE.CatmullRomCurve3` that extrudes walkable stepped horizontal stone masonry boxes conforming to slope gradients, with lateral offset slider (-15cm to +15cm), stair scale multiplier (2x default baseline), and stair spacing slider.
     * `Fortifications`: Continuous magnetic snap hologram placement along walls for 4 authentic fortification types:
       * *Sliding Round Watchtowers (`tower` / `buruj`):* Sliding cylindrical towers centered along the rampart.
       * *Rampart Bastion Platforms (`box`):* Inward-facing rectangular fighting platforms extending into the fort courtyard.
       * *Semicircular Round Bastions (`round_bastion`):* Semicircular bastions protruding outward from the fort wall. The flat diameter is centered flush on the outer wall edge (`edgeX = attachX + outNorm.x * halfThick`), preserving the interior walkway, and crowned with authentic 3D pointed Murud-Janjira Kangare battlements with shoulders.
       * *Arched Gateways (`gate` / `Maha Darwaza`):* Watertight portals flanked by twin towers with continuous rampart walkways above.
       * *Single-Placement Debounce Guard:* Pointer events halt bubbling via `e.stopPropagation()` in `handleWallPointerDown`, coupled with a 300ms throttle guard (`lastFortificationPlacementTime`) in `useEditorStore.ts`. Completely eliminates duplicate / double-placement stamps on a single click.
   * **Procedural Geometry Engine & Performance Architecture (`wallGeometry.ts`, `FortWalls.tsx`):**
     * *Decoupled Zustand Subscriptions:* Hologram snaps (`wallSnapPreview`), draft states (`activeFoundationDraft`, `activeWallDraft`), and element hovers (`hoveredElement`) are isolated to dedicated child layers (`SnapHologramPreview`, `FoundationDraftLayer`, `WallDraftLayer`). The root `FortWalls` container only re-renders when the wall/foundation array changes.
     * *Memoized EdgesGeometry:* Selection outlines across walls, foundations, and stairs pre-compute `THREE.EdgesGeometry` once via `useMemo` and dispose on unmount, completely eliminating 20–50ms per-frame CPU stalls during mouse movements.
     * *Component Memoization:* `SingleWallMesh` and `FoundationMesh` are wrapped in `React.memo` with fine-grained state selectors.
     * *Texture Color Fidelity & PBR Setup:* Diffuse basecolor maps (`brickTextures`, `floorTextures`, `darkStoneTextures`) explicitly enforce `colorSpace = THREE.SRGBColorSpace` with linear mipmapping (`THREE.LinearMipmapLinearFilter`), eliminating washed-out bleached white textures. Normal, roughness, and AO maps use `THREE.NoColorSpace` with `metalness: 0.0` and `roughness: 0.90` for authentic matte basalt stone.

3. **Texture Tool (Terrain Texture Painting Studio):**
   * Directly paints retro pixel-art textures onto the terrain mesh without deforming elevation or affecting placed structures/walls.
   * **52 Retro Textures across 8 Categories:** Dirt & Soil (8), Grass & Foliage (8), Gravel & Paths (8), Rock & Basalt (8), Rocky Ground (8), Sand (8), Bricks & Masonry (3), and Water & Ice (1).
   * **Technical Architecture (`terrainPaintBuffer.ts`):**
     * Single 256x256x4 `Uint8Array` buffer (262,144 bytes). R: LayerA (0-51), G: LayerB (0-51), B: Blend (0-255), A: Weight (0-255).
     * `THREE.DataTexture` configured with `THREE.NearestFilter` on minFilter/magFilter, combined with discrete `texelFetch` in the fragment shader. Completely eliminates intermediate integer rounding seams and cross-layer contour bands.
     * Manual bilinear interpolation in GLSL exclusively on continuous float channels (`paintWeight` and same-layer `blendFactor`), ensuring smooth feathered stroke edges.
     * Canonical layer sorting (`layerA <= layerB`) across painting and blending algorithms for stable two-layer transitions.
     * All 52 textures loaded into a single `THREE.DataArrayTexture` (128x128x52) in `THREE.SRGBColorSpace`.
   * **Interactive Controls:** Brush Radius (0.2m–3.0m), Strength (5%–100%), Edge Falloff (0%–100%), Tiling Repeat (4x–32x), Flood Terrain, Clear Paint.
   * **2 Operational Sub-Modes:** `Paint` (apply texture) and `Erase` (restore base terrain).
   * **Tool Role Separation:** Tool 4 is **`Texture`**; the name `paint` is reserved for Tool 7 in the deferred soil crafting pipeline for painting raw color pigments onto mud shapes.

5. **Foliage Paint Tool (3D Nature Scatter System):**
   * High-performance retro Doom/PS1 billboard foliage system combining intersecting cross-quad (X-shape) and single-plane meshes anchored at base $y = 0$.
   * **117 Authentic Deccan Flora Species across 7 Categories:** Canopy Broadleaf (50), Shrubs & Bushes (11), Flowering Trees (10), Dry Cliff & Escarpment (16), Acacia Savannah (15), Columnar Cypress (11), Coastal Palms (4).
   * **Rendering Engine:**
     * Soft spherical outward normals for uniform, 3D-volumetric lighting on 2D cutout quads.
     * Double-sided materials with `alphaTest: 0.5` and `depthWrite: true` for zero Three.js sorting artifacts and crisp pixel-art silhouettes.
     * Custom depth material with `alphaTest: 0.5` casting accurate cross-quad shadow maps onto terrain and walls.
     * Real-time GPU vertex wind sway via material `onBeforeCompile` vertex shader injection.
   * **Algorithmic Candidate Generation & Eraser:**
     * Uniform disk polar candidate generation with Poisson-disk minimum distance thinning preventing visual clutter.
     * Bilinear terrain height sampling and surface normal orientation (`getTerrainHeightAt`, `getTerrainNormalAt`).
     * $O(1)$ spatial hash grid (`FoliageSpatialGrid`) for sub-millisecond radius queries during brush erasing and candidate thinning.
   * **Tri-Mode Workflow:** `Scatter` (drag to paint clusters), `Single` (click-to-plant hero specimen), and `Erase` (radius pruning).
   * **Selection Flexibility:** Single-species focus or Multi-Select mode with random scatter selection and one-click "Deselect All".

5. **Figurines & Architecture Tool (3D Asset Browser & Outliner Inspector):**
   * High-performance 3D prop placement, inspection, and manipulation engine supporting **22 solid 3D assets** across 6 authentic categories (with festive diyas migrated to the dedicated Lighting Studio):
     * *Royalty & Sinhasan (4)*: Chhatrapati Shivaji Maharaj on throne, cavalry commander, royal attendant, war elephant.
     * *Mavale Garrison (4)*: Maratha swordsman, fort sentry spearman, bhagwa flag bearer, cliff defender.
     * *Festive Musicians (2)*: Tutari fanfare horn blower, Dhol-Tasha drummer.
     * *Yard & Props (2)*: Deccan bullock cart, fluttering saffron fort banner.
     * *Fort Architecture (7)*: Arms depot, elephant stables, fort granary, cavalry stables, fort dungeon/jail, royal kitchen, soldier quarters.
     * *Artillery & Ordnance (3)*: Bastion cannon, cannonball crate, gunpowder magazine.
   * **Instanced Batching & Singleton Asset Cache (`figurineAssetManager.ts` & `FigurineInstances.tsx`)**:
     * Instanced rendering via `THREE.InstancedMesh` grouped by figurine type (1 draw call per distinct active asset) supporting 250+ solid 3D models at 60+ FPS.
     * Singleton GLTF geometry and material cache with automatic base grounding (`y = 0`) using model bounding boxes.
     * Normalized baseline scaling: human figurines (0.9m), buildings (3.0m - 4.2m), artillery (1.2m), props (0.5m - 2.5m).
   * **4 Operational Modes (`Place`, `Select`, `Transform`, `Erase`)**:
     * *Place Mode:* Real-time ghost hologram raycast snapping to terrain/walls with placement scale, rotation heading, randomize yaw, surface normal alignment, and elevation offset sliders; lower pane renders Figurine Vault asset drawer with category pills and search.
     * *Select Mode:* Upper pane lists Placed Figurines outliner; lower pane renders unified Element Properties inspector (scale slider, heading rotation slider, duplicate, snap surface, focus camera, delete).
     * *Transform Mode:* Placed Figurines outliner + Element Properties inspector featuring a camera-relative 3D nudge pad (Up/Forward/Down/Left/Backward/Right), heading rotation wheel with quick-angle snaps, uniform scale slider, and surface snapping.
     * *Erase Mode:* Left Sidebar brush radius slider, crimson diorama brush circle GUI on terrain/structures, stroke drag erasing, and outliner deletion.
   * **Two-Way Hover Highlighting & Ergonomics**:
     * Select and Transform modes feature bidirectional hover feedback: diorama hover renders amber glow ring (`HoverRing`) and highlights outliner row; outliner hover highlights the 3D figurine in viewport.
     * Hover highlighting and pointer cursor changes are disabled during Place and Erase modes to eliminate visual clutter.

6. **Lighting & Fireworks Studio (Festive Diyas & Pyrotechnics):**
   * Dedicated illumination and celebration tool in the secondary Top ToolBar (`lighting`):
   * **28 Total Lighting Assets Across 3 Categories:**
     * *Terracotta Clay Diyas (9)*: Standalone earthen lamps (`diya_clay_01` to `diya_clay_09`).
     * *Hand-Painted Festive Diyas (9)*: Colorful painted lamps (`diya_color_01` to `diya_color_09`).
     * *Diwali Cone Fountains / Anaar (5)*: 3D inverted cone models with decorative retro paper casings in Saffron Amber, Emerald Green, Royal Violet, Ruby Crimson, and Golden Sparkle.
     * *Diwali Sky Shots / Aerial Shells (5)*: 3D cylinder launcher models in Multicolored Peony, Golden Willow, Silver Palm, Crackling Comet, and Saffron Ring.
   * **3D Diya Illumination Engine (Zero Flat Decals & Zero Shader Recompiles):**
     * Eliminates flat 2D decal ground disks completely, replacing them with authentic 3D PBR illumination that lights up vertical fort walls, ramparts, bastions, figurines, stone steps, and slopes.
     * **16 Statically Pre-Allocated 3D Omnidirectional PointLights** (`#FFA533`, `decay: 2.0`, `distance: 2.2m–4.8m`) compiled statically in JSX. Guarantees **0ms shader recompilation freezes** when placing, moving, or deleting lights.
     * **Camera-Independent 3D World-Coordinate Spatial Clustering** (`computeSpatialClusters`): K-Means clustering in fixed world coordinates ensures that orbiting the camera 360° produces **zero light popping, zero jumping, and zero white-hot bleaching**.
     * **Volumetric Flame Halos**: Procedural 3D flame teardrop with emissive sway, white-hot inner core, and camera-facing volumetric halo sprite (`<sprite>`) for bloom and visibility at any viewing angle.
     * **Diurnal Diya Availability (`getDiyaLightStatus`)**: Diyas automatically ignite during Golden Hour (~16:30 onwards), reach full radiance throughout Diwali Night, and stay lit until morning Dawn (~06:30), or whenever `nightMode` is explicitly enabled.
   * **Interactive Pyrotechnics Particle Engine (`pyrotechnicsEngine.ts`):**
     * High-performance native Three.js particle engine (`THREE.Points`) using pre-allocated `Float32Array` buffers with zero per-frame garbage collection.
     * **Cone Fountains (*Anaar*):** Continuous upward sparkling shower with parabolic spray, crackling embers, and automatic ±20 cm (±0.20m) randomized plume height variation on each ignition.
     * **Sky Shots (*Aerial Shells*):** Ascending tracer rockets with smoke trails that detonate into radial bursts with automatic ±20 cm (±0.20m) altitude variation and up to 10° organic launch angle variation.
     * Configurable parameters matching fireworks standards: color hue, particle velocity, spray height/spread, burst radius, gravity, and flicker rate.
     * **Adjustable Burst Height**: Slider in properties inspector allows setting the detonation altitude with a low default burst (~100cm from launcher).
     * **Randomize Burst Height Placement Toggle**: Switch in Place mode automatically assigns randomized burst heights (0.60m to 2.40m) to newly placed fireworks.
     * **Continuous Festive Night Playback**: During dark hours (sunset through early morning), fireworks cycle continuously with staggered launches and natural pauses between bursts.
     * **Isolated Test Pipeline**: Timestamped trigger in store (`testFireworkTrigger`) ensures fireworks detonate exclusively when the "Test Firework Burst" button is clicked, preventing accidental triggers during slider edits.
     * **5-Second Pause Countdown Timer (`LightingRenderer.tsx`)**: When diorama playback is paused (`isPlaying: false`), fireworks particles freeze in a stunning sculptural burst. A dedicated 5-second countdown timer initiates upon pausing: after 5 seconds, the frozen particle instances gently extinguish and clear, ensuring the viewport remains clean and unhindered for subsequent fort construction or wall drafting. Resuming playback instantly cancels the timer and restores continuous simulation without delay.
   * **4 Operational Workflow Modes (`Place`, `Select`, `Transform`, `Erase`):**
     * *Place Mode:* Left panel renders preview card and plain text sliders directly on `bg-[#F3EBE0]` (Scale, Heading, Randomize, Normal Align, Elevation Offset); Right panel renders Lighting Vault Asset Browser.
     * *Select Mode:* Left panel renders selected item card, transform sliders, Surface Snap, "Test Firework Burst" button, and Duplicate/Delete; Right panel renders Placed Lights Outliner (upper) + Element Properties Inspector (lower) with Burst Height slider.
     * *Transform Mode:* Left panel renders camera-relative 3D nudge pad and heading rotation; Right panel renders Outliner + Inspector.
     * *Erase Mode:* Left panel renders Erase Radius slider directly on `bg-[#F3EBE0]` + crimson diorama brush circle GUI + Clear All Lights button; Right panel renders Outliner + Inspector.
   * Switching from Day to Night automatically triggers all placed fireworks in the diorama once in a coordinated festive volley.

7. **Viewing Tool & Atmospheric Lighting Engine (`atmosphericLighting.ts`):**
   * Dedicated spectator and presentation tool in the secondary Top ToolBar (`view`):
   * **Atmospheric Lighting & 24-hr Diurnal Solar Arc Engine:**
     * **Dynamic Color Temperature Grading**: 7 calibrated diurnal keyframes (Midnight 00:00, Dawn 06:00, Noon 12:00, Golden Hour 17:30, Dusk 18:48, Diwali Night 21:00, 24:00).
     * **Luminous Full Moon Night Calibration**: Silver-white moonlight (`#E0F2FE`, 1.35x), indigo shadow fill (`#475569`, 0.85x), dual-radiance hemisphere light (`#93C5FD` sky / `#1E293B` ground, 0.80x), and exposure `1.28`. Eliminates pitch-black voids, rendering terrain, water, cliffs, and fort walls clearly visible matching real full-moon landscapes.
     * **Vibrant Golden Hour**: Sun 30 minutes before sunset (elevation `20°`, azimuth `255°`, radiant saffron `#F59E0B` 2.80x, courtyard terracotta upward GI bounce `#EA580C` 0.90x, exposure `1.30`).
     * **Zero-Cost Mud GI Bounce Radiance**: Directional light positioned upward from laterite clay simulating secondary bounce illumination.
     * **Deccan Plateau Horizon Mist / Depth Fog**: Exponential squared (`Exp2`) fog blending distant terrain smoothly into the diorama backdrop.
     * **ACESFilmic Tone Mapping & Exposure Calibration**: Prevents specular blowouts on stone and enriches mud and flame saturation.
   * **Zero-Modification Viewport Guard:**
     * Disables all object selection, raycast drafting, brush rings, hover outlines, and hologram ghosts.
     * Clicks and drags anywhere on the viewport are strictly dedicated to camera navigation.
     * **24-hr Time of Day & Shadow Controls**: Continuous slider (0:00 to 24:00) with quick presets: Dawn (06:00), Noon (12:00), Golden Hour (17:30), and Diwali Night (21:00); Sun Elevation (-10° to 90°) and Sun Azimuth (0° to 360°) for real-time shadow direction sweeps.
   * **Zero-Modification Viewport Guard:**
     * Disables all object selection, raycast drafting, brush rings, hover outlines, and hologram ghosts.
     * Clicks and drags anywhere on the viewport are strictly dedicated to camera navigation.
     * Infinite white grid `<Grid infiniteGrid />` permanently removed across all tools for a clean tabletop courtyard diorama feel.
   * **Camera Perspectives, Lens FOV & Exhibition Modes:**
     * **Camera Perspective Presets:** Quick angle buttons: Isometric (45°), Bird's Eye (90° Top-Down), Rampart Eye (15° Low Hero View), Bastion Hero (30° Citadel Corner), and Home Reset.
     * **Camera Lens FOV Slider:** 20° Telephoto to 80° Wide-Angle (45° Standard default).
     * **Dual Navigation Modes:** Free Orbit Spectator Mode (`orbit`) and Continuous 360° Turntable Exhibition Mode (`spin`).
     * **Celebration Fireworks 5s Salvo:** Dedicated test button that triggers all placed fireworks across the diorama for 5 seconds regardless of time, with a 5-second disable cooldown.
   * **Centered Quick-Action Diorama Bar (`DioramaQuickBar.tsx`):**
     * Floating 5-button dock mounted centered directly above status bar (`[ ☀️ Day | ▶ Play | ⏸ Pause | 📷 Screenshot | 🌙 Night ]`).
     * Governs decoupled ambient 60 FPS animation loop (tree wind sway, particle progression) and instant high-res viewport screenshot capture.

---

### 4.3 Decoupled 5-Zone HUD Layout & Resizing Engine
The user interface is architected into 6 independent, decoupled modules to provide full desktop/mobile responsiveness without clutter:

1. **`AppMenuBar.tsx`**: Pinned top header (`top-0`, 41px height). Hosts branding, fort selector, menus, language switcher, undo/redo, night diya mode, auto-dismissing toast notifications, and **Collapse All / Expand All** pill buttons (`TbArrowsMinimize` / `TbArrowsMaximize`).
2. **`TopToolBar.tsx`**: Secondary top bar (`top-[41px]`). Hosts the 7 primary fort construction tools (Terrain, Building, Texture, Foliage, Figurines, Lighting, View) and camera preset view controls. Soil pipeline tools are safely hidden in the toolbar to focus the user experience. Minimizes into a dynamic hanging folder guide tab (`[⛰️ Tools & Views ▾]`).
3. **`LeftToolSidebar.tsx`**: Universal properties drawer (`left-0`, `bottom-0`). Resizable from 250px to 480px with tactile 6-dot grip handle. Persists width to `localStorage`. Minimizes into `[⚙️ Properties ▾]`.
4. **`ToolModeSidebar.tsx`**: Vertical mode strip (width: 68px) attached to right edge of Left Sidebar. Shows icon + label mode buttons for Building (`Select`, `Walls`, `Foundation`, `Stairs`, `Fortifications`), Lighting (`Place`, `Select`, `Transform`, `Erase`), Figurines (`Place`, `Select`, `Transform`, `Erase`), Terrain (8 sculpting modes), Texture (`Paint`, `Erase`), and Foliage (`Scatter`, `Single`, `Erase`). Automatically hidden during `View` tool. Minimizes into `[🎯 Modes ▾]`.
5. **`RightToolSidebar.tsx`**: Scene Outliner and Contextual Inspector (`right-0`, `bottom-0`). Resizable from 260px to 460px with tactile grip. Upper pane shows `DIORAMA ELEMENTS` tree with child counts and focus/delete actions (or texture / foliage / figurine / lighting vault browser); lower pane shows `ELEMENT PROPERTIES` inspector when an object is selected. Automatically hidden during `View` tool. Minimizes into `[🏰 Outliner ▾]`.
6. **`QuickActionBar.tsx` & `BottomStatusBar.tsx`**:
   - `QuickActionBar.tsx`: Centered floating 5-button control dock mounted directly above `BottomStatusBar.tsx` (`[ ☀️ Day | ▶ Play | ⏸ Pause | 📷 Screenshot | 🌙 Night ]`). Governs ambient animation loops and instant high-res viewport screenshot capture.
   - `BottomStatusBar.tsx`: Viewport navigation and tool guide pill centered at bottom screen. Contextually detects active tool and subtool to display exact primary action (`Left Click: [Action] • Right Drag: Orbit • Middle Drag: Pan • Scroll: Zoom`).

#### Anti-Collision Minimized Guide Tab Positioning Logic
To prevent hanging folder guide tabs from colliding under any permutation of open and minimized states:
- **Left Edge Positioning**:
  - Both Left & Modes minimized: `Properties ▾` at `8px`, `Modes ▾` at `114px`.
  - Modes strip open + Left minimized: `Properties ▾` at `76px` (clearing 68px mode strip).
  - Left open + Modes minimized: `Modes ▾` at `${leftSidebarWidth + 8}px`.
- **Right Edge Positioning**:
  - Both Outliner & TopBar minimized: `Outliner ▾` at `8px`, `Tools & Views ▾` at `104px`.
  - Outliner open + TopBar minimized: `Tools & Views ▾` at `${rightSidebarWidth + 8}px`.
  - Terrain tool active (no Outliner): `Tools & Views ▾` at `8px`.
- **Vertical Top Alignment**:
  - Secondary Top Bar open: `top-[112px] xl:top-[81px]`
  - Secondary Top Bar minimized: `top-[41px]`

---

### 4.4 Pointer Raycast Architecture, Structure Interaction & Control Scheme
1. **Permanent Left-Click Tool Action & Right-Click Orbit Scheme (`cameraControls.ts`)**:
   - `OrbitControls.mouseButtons.LEFT = -1` is permanently enforced across all tools and modes.
   - Left-click is strictly dedicated as the primary action of the active tool/subtool (sculpting terrain, drafting wall paths, inserting bastions, painting texture splats, scattering nature flora, selecting fort structures). OrbitControls never intercepts left-click drags.
   - Camera rotation/orbit is permanently dedicated to **Right-Click Drag** (`mouseButtons.RIGHT = THREE.MOUSE.ROTATE`).
   - Camera panning is dedicated to **Middle-Click Drag** (`mouseButtons.MIDDLE = THREE.MOUSE.PAN`).
   - Camera zoom is dedicated to the **Scroll Wheel**.
2. **Direct 3D Structure Tool Interaction Engine (`surfaceToolInteraction.ts`)**:
   - Extruded wall meshes, bastion handles, gate portals, box platforms, stone steps, saffron flags, and festive diyas intercept pointer events via `handleStructurePointerDown` and `handleStructurePointerMove`.
   - Halts R3F event bubbling via `e.stopPropagation()` and temporarily disables OrbitControls during active drag strokes, preventing camera viewport orbiting leaks when painting or drawing on top of fort structures.
   - Accurately routes texture splats, hero specimen planting, foliage candidate generation, and spline node additions directly onto structural surface coordinates.
   - Decorative non-interactive meshes (billboard foliage quads, water plane, courtyard bricks) are marked with `raycast={() => null}` to prevent invisible raycast hit hijacking.
3. **Selection Retention on Mode Switches**:
   - Switching from `select` to `fortify` preserves `selectedWallId` and auto-activates the default `tower` stamp.
   - Switching from `select` to `stairs` or `walls` isolates the drafting pipeline.
4. **Zero-Modification Viewport Guard (`View` Tool)**:
   - When `activeTool === 'view'`, all raycasting, stamp ghosts, selection rings, and bounding gizmos are disengaged.
   - All pointer clicks and drags are dedicated 100% to camera orbit and free-flight navigation.
5. **Decoupled Ambient Animation Engine**:
   - Foliage vertex sway, diya flame particles, and fireworks particle loops attach their clock updates strictly to the `isPlaying` state.
   - Canvas dynamically switches between `frameloop="always"` (when `isPlaying: true`) and `frameloop="demand"` (when `isPlaying: false`), eliminating CPU/GPU idling overhead when paused.
6. **Direct High-Resolution Viewport Screenshot Capture**:
   - The screenshot action temporarily suppresses all HUD overlays, captures the WebGL canvas using `preserveDrawingBuffer`, triggers an immediate browser file download (`killa-diorama-<timestamp>.png`), and restores the HUD.

---

### 4.5 Deferred Tactile Soil Pipeline (Advanced Organic Simulation)
An optional authentic simulation layer to be implemented in a subsequent phase:
1. **Soil Tool:** Adds loose dry soil mounds onto the diorama base.
2. **Water Tool:** Pours water over soil mounds, increasing wetness and specular gloss.
3. **Shaping Tool:** Hand trowel pushing (left/right vertical walls) and top patting (horizontal plateaus).
4. **Drying & Mud Locking Tool:** Hardens wet mud into immutable stone (`lockState = 1.0`).
5. **Freehand Mud Paint Tool:** Large/medium/fine brush with `lazy-brush` stabilizer for hand-painting dark basalt base coats and white lime (*chuna*) mortar lines over dried mud masses.

---

### 4.6 Client-Side 4-Angle Festive Poster Generator (₹0 Server Cost)
Do not send screenshots to a backend server. Generate the entire high-res collage inside the user's browser in `< 400ms`:

```typescript
// ponytail: reuse the active WebGLRenderer + a single OffscreenCanvas(1080, 1920)
async function generateKillaPoster(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  killaTitle: string,
  builderName: string
): Promise<Blob> {
  const poster = new OffscreenCanvas(1080, 1920);
  const ctx = poster.getContext('2d')!;
  const snapCam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

  // 4 preset cinematic camera matrices: [Bird's-Eye, Maha Darwaza Low, Throne Close-Up, Night Angle]
  const shots = [
    { pos: [8, 9, 8], look: [0, 1, 0], rect: [40, 260, 1000, 680] },   // Hero Top
    { pos: [3, 1.2, 4], look: [0, 1.5, 0], rect: [40, 960, 490, 490] }, // Low Gate
    { pos: [0, 3.2, 2.2], look: [0, 2.5, 0], rect: [550, 960, 490, 490] }, // Maharaj Throne
    { pos: [-5, 3, 5], look: [0, 1, 0], rect: [40, 1470, 1000, 320] }   // Wide Ramparts
  ];

  // Fill festive parchment/dark-gold background
  ctx.fillStyle = '#1c140d';
  ctx.fillRect(0, 0, 1080, 1920);

  for (const shot of shots) {
    snapCam.position.set(...(shot.pos as [number, number, number]));
    snapCam.lookAt(...(shot.look as [number, number, number]));
    gl.render(scene, snapCam);
    ctx.drawImage(gl.domElement, ...shot.rect);
  }

  // Draw Marathi / English calligraphic header using preloaded Google Font (Yatra One / Modak)
  await document.fonts.load('72px "Yatra One"');
  ctx.fillStyle = '#f59e0b';
  ctx.font = '72px "Yatra One"';
  ctx.textAlign = 'center';
  ctx.fillText(killaTitle || 'आमचा दिवाळी किल्ला', 540, 130);

  ctx.fillStyle = '#fde68a';
  ctx.font = '32px sans-serif';
  ctx.fillText(`निर्मिती: ${builderName} • दिवाळीच्या हार्दिक शुभेच्छा`, 540, 195);

  return poster.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
}
```

---

## 5. Database Schema, State Serialization & Local Persistence

### 5.1 Portable Binary `.killa` v1.2.0 Package Specification (`killaSerializer.ts`)
Rather than storing hundreds of thousands of raw JSON numbers, the diorama state serializes into a high-performance, zero-cost `.killa` binary archive compressed client-side using `fflate`:

1. **Package Architecture (Standard Compressed Archive):**
   * **`manifest.json`**: Structured metadata and scene graph validated strictly by Zod schemas (`KillaManifestSchema`). Declares format version `"1.2.0"`, project metadata (id, title, fortTemplate, createdAt, updatedAt), camera position and target, custom freeform settings (seed, tableland width, peak elevation, cliff steepness, crags roughness, stepped mountain tiers), walls (with child watchtowers, bastions, gates), foundations, stairs, foliage instances, figurines, diyas, and fireworks.
   * **`terrain.bin`**: Raw 256×256 binary height buffer (`Float32Array` / 262,144 bytes) preserving continuous elevation across all 65,536 vertices. Guarantees 100% topographical fidelity on import without precision loss.
   * **`texture_paint.bin`**: Raw 256×256×4 binary texture splat buffer (`Uint8Array` / 262,144 bytes) encoding discrete multi-texture splat weights (layerA, layerB, blendFactor, paintWeight).
2. **Compression Performance:**
   * Serialization and compression run in `< 15ms` on standard hardware.
   * The complete diorama package compresses by **~92%**, resulting in a compact **`~25–45 KB`** `.killa` file easily exportable or shareable over chat/WhatsApp.

### 5.2 Local IndexedDB Persistence Vault (`killaVault.ts`)
To eliminate server roundtrips and ensure projects persist reliably across browser refreshes:
* **Storage Engine:** Native browser `indexedDB` (`killa_sandbox_db`, object store `projects`).
* **Vault Schema:** Each record contains `{ id, title, fortTemplate, lastSaved, thumbnail, data: Uint8Array, manifest }`.
* **Operations:**
  * `saveProject(project)`: Writes the compressed `.killa` binary buffer, manifest, and canvas thumbnail data URL.
  * `getProject(id)`: Reads and deserializes project buffers into active memory.
  * `listProjects()`: Returns all stored diorama headers for outliner and hub rendering.
  * `deleteProject(id)`: Prunes unneeded projects from IndexedDB storage.
* **Auto-Persistence Protocol:** Saving a project anchors its UUID in `activeProjectId`. Subsequent saves or auto-checkpoints update the active vault entry, guaranteeing full state restoration on browser refresh.

### 5.3 Project Hub & Terrain Studio Drawer
1. **Project Hub Modal (`ProjectHubModal.tsx`):**
   * Central launchpad accessible from the top menu bar (`File -> Open / Switch Fort`).
   * **Tabbed Interface:**
     * *Historical Fort Blueprints:* Curated Maratha fortress models with remade terrains and procedural water plane.
     * *Procedural Terrain:* Deterministic mountain terrain generator with random seed generator, dimension sliders, and Stepped Mountain Tiers (1 to 3 tiers).
     * *Saved Dioramas:* Local IndexedDB vault listing saved user projects with last-saved timestamps, fort tags, and one-click open/delete.
     * *Open / Import File:* Drag-and-drop or picker support for `.killa` v1.2.0 binary packages and legacy `.json` schemas.
2. **Terrain Studio Drawer (`TerrainStudioDrawer.tsx`):**
   * Docked side-drawer allowing real-time parameter tweaking with immediate 3D viewport feedback.
   * Controls include Tableland Width, Peak Elevation, Cliff Steepness, Crags & Roughness, Stepped Mountain Tiers slider, Roll New Seed dice button, and dedicated Water Plane toggle switch.
3. **Terrain Change Confirmation Guard (`TerrainChangeConfirmModal.tsx`):**
   * Prevents accidental asset loss when switching fort blueprints or regenerating base terrain.
   * If existing walls, foundations, stairs, foliage, figurines, or lights are present, displays a confirmation dialog itemizing placed elements, requiring builder approval before clearing or resetting the diorama.

### 5.4 Supabase SQL Schema (1 Table + 1 Storage Bucket)

```sql
CREATE TABLE public.killas (
  id TEXT PRIMARY KEY CHECK (char_length(id) = 8), -- nanoid(8)
  title TEXT NOT NULL DEFAULT 'माझा किल्ला',
  builder_name TEXT NOT NULL DEFAULT 'मावळा',
  template_id TEXT NOT NULL, -- 'raigad', 'janjira', 'sinhagad', 'scratch'
  blob_path TEXT NOT NULL,   -- path in Supabase Storage bucket 'killa-packs'
  props_count INT NOT NULL DEFAULT 0 CHECK (props_count <= 250),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ponytail security: Public read, insert-only via Next.js Route Handler with rate limit
ALTER TABLE public.killas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read killas" ON public.killas FOR SELECT USING (true);
```

---

## 6. Performance & Optimization Techniques

1. **Single Draw-Call Instancing (`<Instances>`):**
   * All placed *Mavale* guards, trees, rocks, shrubs, cannons, and diyas render via `@react-three/drei`'s `<Instances>` per asset type.
2. **Statically Pre-Allocated 16 3D Point Lights (0ms Shader Recompile & Zero Popping):**
   * Pre-allocates strictly 16 omnidirectional `<pointLight>`s in JSX. Three.js compiles the PBR lighting shader once on startup; adding, moving, or deleting diyas adjusts numeric uniform intensities and positions rather than modifying the Three.js scene graph, guaranteeing **0ms shader recompilation freezes**.
   * Camera-independent 3D world-coordinate spatial clustering (`computeSpatialClusters`) anchors lights to physical fort locations, completely eliminating camera-orbit popping and white-hot over-illumination.
3. **Decoupled Brush Cursor Transform & Throttled BVH Refits:**
   * Moves the 3D terrain brush cursor positioning to `cursorStateRef` and `useFrame`, decoupling 120Hz pointer moves from React component state. This eliminates 65,536-vertex React re-renders during mouse movement.
   * Throttles `refitTerrainBVH` and `lastUpdated` store broadcasts to 120ms intervals during continuous drag, reducing pointer latency to **< 0.6ms per event** (steady 60+ FPS).
4. **Dynamic Frame Loop (`frameloop={isPlaying ? "always" : "demand"}`):**
   * Continuous 60 FPS animation when `isPlaying: true` drives foliage wind sway, diya flames, and fireworks particles; drops back to `frameloop="demand"` on pause to reduce idle CPU/GPU load to 0%.
5. **Debounced Fortification Stamping Guard:**
   * Stops R3F pointer bubbling via `e.stopPropagation()` in `FortWalls.tsx` and applies a 300ms throttle guard (`lastFortificationPlacementTime`) in `useEditorStore.ts`. Prevents double-firing pointer down/up events from stacking duplicate bastion and tower meshes on the same wall vertex.
6. **Pyrotechnics Pause Timer Optimization:**
   * Pyrotechnics particle engine freezes simulation on pause, maintaining visual burst aesthetics for 5 seconds before gently extinguishing paused particle instances. Eliminates continuous particle calculations when inactive while keeping the diorama viewport completely unobstructed for subsequent construction and editing.
7. **Zero-Copy TypedArray Binary Serialization:**
   * Heightmap and texture splat data serialize directly from pre-existing TypedArrays (`Float32Array`, `Uint8Array`) into `fflate.zipSync`, avoiding intermediate JavaScript object allocation and garbage collection spikes during save/export.

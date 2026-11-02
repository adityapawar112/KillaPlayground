import { execSync } from 'node:child_process';

const credOut = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n',
}).toString();

const tokenMatch = credOut.match(/^password=(.*)$/m);
if (!tokenMatch) {
  console.error('Failed to retrieve GitHub token from git credential manager');
  process.exit(1);
}
const token = tokenMatch[1].trim();

const REPO = 'adityapawar112/KillaPlayground';
const API_BASE = `https://api.github.com/repos/${REPO}`;

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'KillaPlayground-Automation',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

const tickets = [
  {
    ticketNumber: 1,
    title: 'Ticket 01: Project Foundation, Design System Tokens & Responsive Shell',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Master foundation ticket establishing Next.js 15, Three.js/R3F rendering core, cultural design tokens, and comprehensive responsive HUD ergonomics.

- **Status**: \`completed\`
- **Blocked by**: None (can start immediately)

## Delivers
- **Stack & Dependencies**:
  - Next.js 15 (App Router) + TypeScript + Tailwind CSS.
  - Complete 3D stack: \`three\`, \`@react-three/fiber\`, \`@react-three/drei\`, \`three-mesh-bvh\`, \`three-custom-shader-material\`, \`fflate\`, \`zustand\`, \`zod\`, \`lucide-react\`, \`lazy-brush\`, \`canvas-confetti\`.
- **Cultural Design Tokens (\`design.md\`)**:
  - Sun-baked canvas (\`#F9F6F0\`), Dark Brown mineral ink (\`#4B382C\`).
  - 6-Color Earth Palette: Terracotta (\`#B85F45\`), Burnt Clay (\`#8F4938\`), Sand (\`#D8C09D\`), Camel (\`#B58B63\`), Olive (\`#777A57\`), Basalt Charcoal (\`#23211E\`).
  - Festive Accents: Bhagwa Saffron (\`#E85D04\`), Chuna White (\`#FAF8F5\`), Sprouted Halim Green (\`#65A30D\`), Crinkled Sea Blue (\`#0284C7\`), Diya Amber (\`#F59E0B\`).
  - Google Fonts preloaded in \`<head>\`: \`Yatra One\`, \`Modak\`, and \`Inter\`.
- **Responsive HUD & Viewport Ergonomics**:
  - **In-Flow Branding**: Brand title placed in natural flex flow beside the shield logo to prevent dropdown overlap.
  - **Responsive Hamburger Navigation Drawer**: On screens \`< 1280px\` (\`< xl\`), collapses horizontal menus into a hamburger button with slide-over drawer below the top bar (\`top-[41px]\`), with dynamic hamburger-to-X toggle.
  - **Camera Viewport Relocation**: Top (Z), Front (Y), Side (X), Center (Home), and Zoom In/Out controls relocated to secondary toolbar.
  - **2-Row Symbols-Only Secondary Toolbar**: On \`< xl\` viewports (mobile, tablet, windowed desktop), renders 2 rows of symbol buttons (Row 1: 10 Tools; Row 2: Camera presets & zoom), preventing cutoffs and horizontal scrollbars.
  - **Symmetric Minimized HUD Toggles**: "Tools & Views" minimized toggle button on the right edge (\`right-2\`); "Properties" minimized toggle button on the left edge (\`left-2\`) hanging off the toolbar when expanded.
  - **100% Properties-Dedicated Sidebar**: Tool properties and sliders have full vertical scrolling space without camera clutter.
  - **Bottom Instructions Auto-Hide**: Viewport navigation tip strip hidden on smaller screens (\`hidden md:flex\`).
  - **Decluttering**: Stripped verbose info cards, guidance blurbs, and redundant labels across tool properties, terrain drawer, and startup modals.

## Acceptance Criteria
- [x] Application compiles and runs with \`npm run dev\` at \`http://localhost:3000\`.
- [x] Canvas viewport expands to 100vw × 100vh with \`#F9F6F0\` foundation.
- [x] Fonts \`Yatra One\`, \`Modak\`, and \`Inter\` load cleanly with zero FOUT.
- [x] Tailwind tokens configured and verified with test elements.
- [x] Responsive layout adapts cleanly across mobile (375px/390px), tablet/windowed (820px/1032px), and wide desktop (1280px+) with zero visual overlaps or clipped toolbars.
- [x] Camera controls relocated to secondary toolbar, leaving left sidebar 100% for tool properties.`,
  },
  {
    ticketNumber: 2,
    title: 'Ticket 02: 3D Scene Core, Camera Rig, Courtyard Bricks & Base Terrain',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Establishes the foundational Three.js diorama scene, camera rig, courtyard lighting, brick perimeter border, and base terrain heightmap.

- **Status**: \`completed\`
- **Blocked by**: #1

## Delivers
- **3D Scene Graph**:
  - Three.js \`<Canvas frameloop="demand">\` with \`<OrbitControls>\` (bounded polar angles, smooth damping).
  - Courtyard lighting: warm directional sunlight + ambient bounce + night mode moonlight rig.
- **Diorama Base & Brick Border**:
  - 3D ring of red clay masonry bricks encircling the mud diorama base.
- **Base Terrain Geometry**:
  - \`THREE.PlaneGeometry(10, 10, 255, 255)\` (\`65,536\` vertices) with \`<Bvh>\` acceleration (< 0.2ms raycasting).
- **GPU State Buffer**:
  - Synchronized \`stateBuffer\` (\`Float32Array\` of size \`256 x 256 x 4\` in \`THREE.DataTexture\`) storing Elevation (R), Wetness (G), Lock (B), and Grass Density (A).
- **PBR Textures**:
  - PBR texture loading pipeline connecting Binbun retro textures and mossy stone brick textures.

## Acceptance Criteria
- [x] Diorama canvas displays ground plane with courtyard lighting and brick perimeter border.
- [x] OrbitControls allow smooth 360° orbiting and zooming without clipping beneath the floor.
- [x] Raycaster intersection against terrain mesh executes in \`< 0.2ms\` via BVH.
- [x] \`stateBuffer\` initialized and bound to terrain shader pipeline.`,
  },
  {
    ticketNumber: 3,
    title: 'Ticket 03: Base Terrain Manipulation Tool',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Implements direct vertex terrain sculpting tools (Elevate, Lower, Plateau, Smooth, Slope, and Pond Basin Excavation) with surface normal orientation, wheel ergonomics, and undo/redo history.

- **Status**: \`completed\`
- **Blocked by**: #2

## Delivers
- **Direct Terrain Mesh Sculpting**:
  - **Elevate**: Raises mountain mounds, ridges, and hillocks with smooth radial falloff.
  - **Lower**: Digs terrain down to carve moat beds, trenches, and valleys.
  - **Plateau / Level**: Flattens sampled vertices to a target plane height $H_{target}$, creating flat courtyards and fort hilltops.
  - **Smooth**: Multi-tap adaptive kernel blur that effectively softens sharp terraces and jagged spikes into rolling earthen curves.
  - **Slope / Ramps**: Calibrated inclination subtool with angle presets (15°, 30°, 45°, 60°) and angle slider for grading smooth ghat paths and fort ascents.
  - **Pond Excavation (Shader-Integrated)**: Excavates crater basins directly in the terrain heightmap and renders authentic blue tarpaulin PBR water with specular ripples directly on the flat basin floor (\`wetness > 0.68\`), surrounded by dark glistening wet mud (*chikhal*) on crater banks (\`wetness\` tapering from 0.70 to 0.02) all the way up to the depression rim edge. Eliminates separate meshes, prevents cliff leaks, and restores 100% cleanly on undo.
- **3D Surface Normal Indicator**: Brush cursor reticle ring dynamically aligns with the exact surface normal of the terrain under the cursor, eliminating z-fighting and rendering flush across hillsides and cliffs.
- **Authentic Blue Tarpaulin Water Pipeline**: Uses PBR textures (\`basecolor\`, \`normal\`, \`roughness\`, \`ao\`, \`metallic\`) from \`/textures/Water/blue_tarp_texture_128x128_pbr\` for all water (diorama moat + pond basin floors).
- **Ergonomic Wheel Shortcuts**:
  - \`Shift + Scroll Wheel\`: Increase / decrease brush size.
  - \`Ctrl + Scroll Wheel\`: Adjust sculpt speed / secondary slider.
  - \`Alt + Scroll Wheel\`: Adjust plateau height / slope angle (tertiary slider).
  - Intercepted in capture phase with complete suppression of camera zoom.
- **Pond Basin Undo/Redo Engine**:
  - Synchronized with 15-slot circular history (\`Ctrl+Z\` / \`Ctrl+Y\`).
  - Dedicated "Undo Pond" button in Contextual Dock restores both terrain elevation and clears wet mud/water texels without residual artifacts.

## Acceptance Criteria
- [x] Elevating terrain smoothly raises organic hills and hilltops.
- [x] Lowering terrain excavates depressions that reveal the underlying water plane.
- [x] Plateau tool flattens elevated peaks into level fort construction decks.
- [x] Smoothing tool removes jagged vertices without resetting height.
- [x] Slope tool creates clean graded ramps at 15°, 30°, 45°, 60° presets.
- [x] Brush cursor ring orients flush to terrain surface normal without z-fighting.
- [x] Shift/Ctrl/Alt + Wheel adjust sliders and prevent OrbitControls zoom.
- [x] Excavating ponds renders shader-integrated blue tarpaulin water on basin floors and dark wet mud along banks with full undo/redo support.
- [x] Vertex modifications execute in dirty bounding box ranges without full geometry reallocations.`,
  },
  {
    ticketNumber: 4,
    title: 'Ticket 04: Parametric Fort Walls Construction Tool',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Provides interactive fort rampart drawing conforming directly to the underlying terrain elevation with parametric bastions, gates, crenellations, multi-material texturing, and magnetic snap holograms.

- **Status**: \`completed\`
- **Blocked by**: #3

## Delivers
- **3-Step Fort Crafting Stepper**:
  - **Step 1 (Layout & Tracing)**: Click or drag on terrain to draft wall circuits. Start closing node in green, intermediate points in yellow, with direct "Proceed to Fortify" and "Cancel Draft" actions.
  - **Step 2 (Fortify & Decorate)**: Interactive editing mode with magnetic snap holograms for placing standard Bastions (*Buruj*), corner Grand Bastions (*Maha Buruj*), arched fortified gates (*Maha Darwaza*), and freestanding Balekilla Citadel Keeps. Features visual 3D selection rings, top badge pins, and dedicated inspectors with deletion and dimension controls.
  - **Step 3 (Diorama Solidified)**: Seamlessly locks fort walls into the diorama presentation without editing handles, wireframe overlays, or placement badges.
- **Miniature Diorama Tabletop Calibration**:
  - Re-calibrated scale from oversized meters to realistic miniature diorama dimensions: wall height from 10cm to 100cm (0.10m to 1.0m) with 12mm ground foundation embedding.
  - Wall thickness calibrated from 5cm to 40cm (0.05m to 0.40m).
  - Slider readouts dynamically formatted in centimeters (\`cm\`).
- **Multi-Material PBR Texture Grouping**:
  - Procedural \`BufferGeometry\` segmented into 3 distinct material groups (\`geo.addGroup\`):
    - **Group 0 (Wall & Tower Sides)**: \`mossy_stone_brick_128x128_pbr\` (basecolor, normal, roughness, AO).
    - **Group 1 (Walkways & Tower Floors)**: \`Gravel_01\` PBR gravel for rampart walkways and circular bastion floor decks.
    - **Group 2 (Battlements & Stone Trims)**: \`dark_stone_texture_128x128_pbr\` solid dark stone for crenellations (*kangare*), gate soffits, lintel trims, and plinths.
- **Authentic Murud-Janjira Pointed Crenellations (*Kangare*)**:
  - Outer-facing battlements automatically oriented using 2D polygon centroid testing for closed fort circuits and downhill terrain slope gradient sampling for open wall runs, with manual flip override.
  - Automatic exclusion zones prevent crenellations from clipping through bastions or gatehouse flanking towers.
- **Watertight Maha Darwaza Arched Gateway**:
  - Procedurally carved arched entrance with solid jambs, extruded arch soffit, and continuous top walkway flush with the fort rampart path.
  - Flanked by twin stone bastions with capped walkway floors.
- **Real-Time Magnetic Snap Hologram Engine**:
  - Real-time raycast snapping with generous Euclidean thresholds (0.45m for buruj vertex snapping, 0.60m for arched gate segment snapping).
  - Clamped segment interpolation ($t \\in [0.15, 0.85]$) ensuring gates never intersect bastion nodes.
- **Synchronous Undo/Redo Engine**:
  - Integrated with the diorama's 15-slot circular history (\`Ctrl+Z\` / \`Ctrl+Y\`), capturing pre-mutation state synchronously to guarantee 100% reliable state rollback across all wall, bastion, gate, and citadel operations.

## Acceptance Criteria
- [x] User can click and drag to draw a wall that follows terrain contours.
- [x] Wall height updates interactively via slider in miniature centimeters (10cm - 100cm).
- [x] Round bastions (*buruj*) automatically spawn at corners or snap to vertices via magnetic hologram.
- [x] Fort gates (*Maha Darwaza*) insert cleanly along wall segments with continuous top walkway.
- [x] Crenellations (*kangare*) render outer-facing pointed battlements with tower exclusion zones.
- [x] Multi-material PBR texturing applies stone brick, gravel, and dark stone across geometry groups.
- [x] 3-Step stepper (\`Layout\` -> \`Fortify\` -> \`Solidified\`) isolates editing handles from final diorama.`,
  },
  {
    ticketNumber: 5,
    title: 'Ticket 05: Spline Structure Placement Tool',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Interactive 3D spline curve drawing across terrain slopes with procedural conversion to stone stairs, spaced saffron flags, and glowing diyas.

- **Status**: \`completed\`
- **Blocked by**: #3

## Delivers
- **Interactive 3D Curve Drawing**:
  - Draws smooth 3D spline paths across terrain surfaces using \`THREE.CatmullRomCurve3\`.
- **Linear Structure Conversions**:
  - **Stone Steps (*Payrya*)**: Generates stepped horizontal mud/stone boxes ascending slopes from lower courtyards to high fort plateaus.
  - **Bhagwa Saffron Flags**: Automatically arranges waving swallowtail saffron flags at uniform intervals along the path.
  - **Festive Divas (Diyas)**: Places glowing terracotta oil lamps along drawn curves for festive illumination.
- *(Note: Walkway paths are handled via the Terrain Paint Tool rather than splines).*

## Acceptance Criteria
- [x] Spline curve drawing cleanly samples 3D surface points across slopes.
- [x] Converting to Stone Steps produces walkable stepped terracing conforming to slope gradient.
- [x] Converting to Flags places spaced saffron flags with wind sway vertex shader.
- [x] Converting to Divas arranges warm glowing oil lamps along the drawn path.`,
  },
  {
    ticketNumber: 6,
    title: 'Ticket 06: Terrain Texture Painting Studio',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Direct multi-texture painting onto diorama terrain without altering elevation, offering 52 authentic retro pixel-art ground textures across 8 categories with discrete layer sampling and feathered blend borders.

- **Status**: \`completed\` (Verified in Browser & Unit Tests)
- **Blocked by**: #3

## Delivers
- **Direct Terrain Texture Painting**:
  - Paints retro pixel-art textures directly onto the diorama terrain surface without deforming vertex heights or affecting placed walls, splines, or figurines.
- **Complete 52-Texture Library Across 8 Categories**:
  - **Dirt & Soil (8)**: Compacted Mud, Hydrated Wet Mud, Red Laterite, Clay Silt, Loam Soil, Dry Dirt, Fine Earth, Crumbled Mud.
  - **Grass & Foliage (8)**: Sprouted Mustard Grass, Lush Lawn, Dry Meadow, Olive Turf, Mossy Ground, High Grass, Sprouting Seeds, Dense Field.
  - **Gravel & Paths (8)**: Trail Gravel, Fine Grit, Course Pebbles, Mountain Path, Crushed Stone, River Shingle, Worn Trail, Cobbled Dirt.
  - **Rock & Basalt (8)**: Deccan Basalt, Rugged Slate, Quarry Stone, Weathered Basalt, Sharp Crag, Volcanic Slab, Dark Ledge, Rough Boulder.
  - **Rocky Ground (8)**: Scree Field, Rocky Dirt, Mountain Slag, Pebble Soil, Shaly Terrain, Stony Mud, Chipped Rock, Grit Soil.
  - **Sand (8)**: Sun-Baked Sand, Courtyard Silt, River Dune, Fine Sand, Coarse Dune, Muddy Sand, Beach Soil, Dry Silt.
  - **Bricks & Masonry (3)**: Mossy Stone Brick, Dark Stone Floor, Dark Carved Stone.
  - **Water & Ice (1)**: Blue Tarpaulin Water Sheet.
- **Technical Architecture & Data Pipeline (\`terrainPaintBuffer.ts\` & \`TerrainMaterial.ts\`)**:
  - High-density 256x256x4 \`Uint8Array\` buffer (262,144 bytes) bound to \`THREE.DataTexture\`.
  - Channels: R: Layer A (0-51), G: Layer B (0-51), B: Blend Factor (0-255), A: Paint Weight (0-255).
  - \`THREE.NearestFilter\` on minFilter/magFilter + GLSL \`texelFetch\` on discrete integer grid coordinates: completely eliminates cross-layer interpolation and seam contour rings.
  - Manual bilinear interpolation in GLSL on continuous float channels (\`paintWeight\` and same-layer \`blendFactor\`) for soft feathered edges.
  - Canonical layer ordering (\`layerA <= layerB\`) across paint and blend brush algorithms for stable gradient transitions.
  - All 52 textures loaded into a single \`THREE.DataArrayTexture\` (128x128x52) in \`THREE.SRGBColorSpace\`.
- **UI/UX & Ergonomics**:
  - Tool renamed to **\`Texture\`** (key \`4\`), reserving \`paint\` for the future soil structure color pipeline.
  - Sliders (Brush Radius, Strength, Edge Falloff, Tiling Repeat) sit directly on the panel background (\`bg-[#F3EBE0]\`) without enclosing card boxes.
  - Mode selector lives exclusively in the floating \`ToolModeSidebar.tsx\` strip.
  - Mode-scoped controls: \`Paint\` (radius, strength, falloff, tiling, flood, clear), \`Erase\` (radius, strength, clear).
  - Shortcuts: \`Shift + Wheel\` (Radius), \`Ctrl + Wheel\` (Strength), \`Alt + Wheel\` (Falloff), \`[\` / \`]\` (Radius step).
  - Dedicated right-side Texture Asset Browser with category pills, dividers, search, and layer index indicators.

## Acceptance Criteria
- [x] User can select any of the 52 textures across 8 categories and paint directly onto terrain.
- [x] Painting produces zero height deformation and does not bleed onto walls, splines, or props.
- [x] Seam border lines (brown, white, gray contour bands) completely eliminated via discrete layer sampling.
- [x] Erase tool smoothly restores unpainted natural base terrain.
- [x] UI respects design guidelines: plain text sliders, mode-specific controls, "Strength" naming, and no parenthetical transliterations.
- [x] 100% client-side compute (₹0 cost) with zero WebGL texture allocation leaks.`,
  },
  {
    ticketNumber: 7,
    title: 'Ticket 07: 3D Foliage Paint & Nature Scatter System',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Interactive nature paint studio that populates the diorama landscape with authentic Deccan flora using high-performance retro Doom/PS1 cross-quad and single-plane billboard meshes with GPU wind sway and sub-millisecond spatial eraser.

- **Status**: \`completed\` (Verified in Browser & Unit Tests)
- **Blocked by**: #3

## Delivers
- **Retro Doom/PS1 Cross-Quad & Single-Plane Billboard Engine**:
  - High-performance hybrid geometry: 2 intersecting vertical planes (8 vertices, 4 triangles, 12 indices) for volumetric trees/bushes, and single-plane quads for sprawling ground cover, all anchored at ground base y = 0.
  - Soft spherical outward normals for uniform, 3D-volumetric lighting on 2D cutout quads.
  - Double-sided rendering with \`alphaTest: 0.5\` and \`depthWrite: true\` for zero Three.js sorting artifacts and crisp pixel-art silhouettes.
  - Custom depth material with \`alphaTest: 0.5\` casting accurate shadow maps onto terrain and walls.
  - Real-time GPU vertex wind sway via material \`onBeforeCompile\` vertex shader injection.
- **117 Authentic Pixel-Art Foliage Species (7 Categories)**:
  - 117 curated and sanitized 128x128 pixel-art cutout PNG sprites indexed across 7 authentic categories:
    - **Canopy Broadleaf (50)**: Banyan, peepal, mango, neem, tamarind, teak, and deodar trees.
    - **Shrubs & Bushes (11)**: Bougainvillea, berry scrub, courtyard hedges, flowering lantana.
    - **Flowering Plants (10)**: Marigold (*gendaphool*), hibiscus, jasmine, periwinkle.
    - **Dry Cliff & Succulents (16)**: Mountain agave, prickly pear, rock crevices, dry thorny brush.
    - **Acacia Savannah (15)**: Spiny acacia, umbrella thorn trees.
    - **Columnar Cypress & Conifers (11)**: Slender Italian cypress, fort sentry conifers.
    - **Coastal Palms (4)**: Coconut palms, date palms, palmyra fan palms.
- **High-Performance Batched Instancing, Multi-Select Scatter & Spatial Eraser**:
  - Batched rendering via \`THREE.InstancedMesh\` (exactly 1 draw call per active species) scaling smoothly to 5,000+ instances at 60+ FPS.
  - Uniform disk polar candidate generation with Poisson-disk minimum distance thinning preventing clutter.
  - Bilinear terrain height sampling and surface normal orientation, plus direct raycast scattering on fort walls and spline ramparts.
  - **Single Select & Multi-Select Scatter Modes**: Toggle between scattering a single chosen species or randomly picking from multiple selected species with a "Deselect All" convenience button.
  - O(1) spatial hash grid (\`FoliageSpatialGrid\`) for sub-millisecond radius queries during brush erasing.
- **Tri-Mode Workflow & UI/UX Consistency**:
  - **Scatter Mode**: Continuous brush drag painting nature flora across mountain terrain and structures.
  - **Single Mode**: Click-to-place hero specimens with single-point placement reticle.
  - **Erase Mode**: Prune/erase foliage in a radius without affecting underlying terrain or walls.
  - Sliders sit directly on panel background (\`bg-[#F3EBE0]\`) without enclosing cards.
  - Mode selector lives exclusively in \`ToolModeSidebar.tsx\`.
  - Dedicated right-side Foliage Asset Browser with search, category pills, counts, and 128x128 preview cards.
  - Permanent Left-Click Action & Right-Click Orbit Control Scheme.
  - Full undo/redo integration with \`terrainStore\` snapshot history and JSON serialization.

## Acceptance Criteria
- [x] Foliage scatter brush places trees, rocks, and shrubs across terrain, walls, and ramparts.
- [x] Scatter radius and density sliders control brush distribution with single and multi-select support.
- [x] Objects automatically orient to terrain/surface normal or upright Y-axis.
- [x] Rendering 1,000+ scattered instances maintains 60 FPS in single batched draw calls.`,
  },
  {
    ticketNumber: 8,
    title: 'Ticket 08: Figurine & Architecture Asset Browser',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Comprehensive 3D asset browser with categorized drawer for Shivaji Maharaj, Mavale garrison, musicians, 18 diyas, pre-built fort buildings, artillery, and yard props with instanced batching, 4 operational modes, 2-way hover highlighting, and full undo/redo.

- **Status**: \`completed\` (Verified in Browser & Unit Tests)
- **Blocked by**: #3

## Delivers
- **40 Solid 3D Models Across 7 Authentic Categories**:
  - Sliding right-side drawer with visual preview cards, category filters, counts, and search:
    1. *Royalty & Sinhasan (4)*: Chhatrapati Shivaji Maharaj on the royal throne (*Sinhasan*), cavalry commander, royal attendant, and war elephant.
    2. *Mavale Garrison (4)*: Maratha swordsman, fort sentry spearman, bhagwa flag bearer, and cliff defender.
    3. *Festive Musicians (2)*: Tutari fanfare horn blower, Dhol-Tasha drummer.
    4. *Terracotta Clay Diyas (9)*: 9 unique standalone clay lamp designs (\`diya_clay_01\` to \`diya_clay_09\`).
    5. *Hand-Painted Diyas (9)*: 9 vibrant painted color schemes (\`diya_color_01\` to \`diya_color_09\`).
    6. *Yard & Props (2)*: Deccan bullock cart and fluttering saffron fort banner.
    7. *Fort Architecture (7)*: Arms depot, elephant stables, fort granary, cavalry stables (with calibrated scale matching fort buildings), fort dungeon/jail, royal kitchen, and soldier quarters.
    8. *Artillery & Ordnance (3)*: Bastion cannon, cannonball crate, and gunpowder magazine.
- **High-Performance Instanced Batching & Scale Calibration**:
  - Batched rendering via \`THREE.InstancedMesh\` grouped by figurine type (1 draw call per distinct active type) effortlessly handling 250+ solid 3D figurines at 60+ FPS.
  - Singleton geometry and material cache (\`figurineAssetManager\`) with automatic base grounding (\`y = 0\`) and normalized baseline bounding-box scales for humans (0.9m), buildings (3.0m - 4.2m), and artillery (1.2m).
- **4-Mode Workflow & Right Panel Dual Architecture**:
  - **Place Mode**: Displays Placed Figurines summary and lower Figurine Vault asset browser with live ghost reticle snapping to terrain/wall surfaces, placement scale slider, rotation heading slider, randomize yaw toggle, surface normal alignment, and elevation offset.
  - **Select Mode**: Displays Placed Figurines outliner alongside dedicated Element Properties inspector (scale slider, heading rotation slider, duplicate, snap surface, focus camera, delete) styled consistently with Walls and Spline tools.
  - **Transform Mode**: Displays Placed Figurines outliner and Element Properties inspector with camera-relative 3D nudge pad (Up/Forward/Down/Left/Backward/Right), heading rotation wheel and quick angles, uniform scale slider, and surface snapping.
  - **Erase Mode**: Brush-based radius erasing with \`Brush Radius\` slider in Left Sidebar, crimson diorama brush ring GUI on terrain/structures, stroke drag erasing, and outliner single/batch deletion.
- **Ergonomics & Hover Refinements**:
  - Two-way hover highlighting active during Select and Transform modes: hovering a figurine in diorama renders an amber glow ring (\`HoverRing\`) and highlights the outliner row; hovering an outliner row highlights the 3D figurine in viewport.
  - Hover highlights and pointer cursor changes disabled during Place and Erase modes to eliminate visual clutter and tool confusion.
- **Processed Transparent Thumbnails & Clean English UI**:
  - Transparent-background WebP/PNG thumbnails for all 40 models (3x3 diya grid cleanly separated into individual icons; corner text and white backgrounds removed).
  - Clean English UI labels with zero redundant parenthetical Marathi transliterations.
- **Undo / Redo & Secondary Toolbar Header Fixes**:
  - Fixed undo/redo state restoration for both Figurines and Spline tools in \`terrainStore.ts\`.
  - Fixed \`collapseAllPanels\` in \`useEditorStore.ts\` so the secondary toolbar hanging guide tab (\`[⛰️ Tools & Views ▾]\`) remains visible and clickable alongside \`[⚙️ Properties ▾]\`, \`[🎯 Modes ▾]\`, and \`[🏰 Outliner ▾]\`.

## Acceptance Criteria
- [x] Asset drawer opens smoothly with tabs for Royalty, Mavale, Musicians, Diyas, Props, Architecture, and Artillery.
- [x] All 40 solid 3D models load cleanly with correct relative scale and ground alignment.
- [x] Pre-built buildings, artillery, and figurines can be placed directly onto terrain or fort decks.
- [x] Figurines and props can be dragged, dropped, rotated, transformed, and erased cleanly.
- [x] Placed items persist their transform coordinates in the editor store with working undo/redo.
- [x] "Minimize All" cleanly retains all four hanging guide tabs for quick restoration.`,
  },
  {
    ticketNumber: 9,
    title: 'Ticket 09: Unified Building Construction Tool & Foundation Builder',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Consolidates the standalone Wall and Spline tools into a unified Building tool (retiring flag and diya splines, preserving stairs) and introduces an interactive drag-to-build rectangular stone foundation builder.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #4, #5, #8

## Delivers
- **Tool Consolidation & Spline Retirement**:
  - Renames Walls tool to **\`Building\`** (Key 2) in the secondary toolbar.
  - Retires standalone Spline tool from top toolbar and mode strip. Flag and diya splines are deprecated in favor of solid 3D models in Figurine and Lighting catalogs.
  - Stone steps are integrated directly into the Building tool as **\`Stairs\` Mode**.
- **5 Unified Operational Modes in \`ToolModeSidebar.tsx\`**:
  - \`Select\`: Direct physical mesh raycasting on walls, towers, bastions, gates, foundations, and stairs with glowing hover outlines (#E85D04).
  - \`Walls\`: Click on terrain to draft perimeter wall curves with automatic pointed Murud-Janjira battlements and elevation tracing.
  - \`Foundation\`: Drag-to-build rectangular stone plinth builder on terrain:
    - Pointer down anchors first corner (x1, z1) on terrain.
    - Pointer move renders a real-time translucent ghost bounding box.
    - Pointer up finalizes opposite corner (x2, z2), instantiating a solid stone foundation slab.
    - Multi-material buffer geometry: Perimeter sides mapped to \`mossy_stone_brick_128x128_pbr\` (Group 0) and top deck mapped to \`dark_stone_floor_128x128_pbr\` (Group 1).
    - Interactive sliders: Length, Width, Height (10cm–300cm), Vertical Offset (-50cm to +200cm), and Texture Tiling (1x–10x UV multiplier).
  - \`Stairs\`: Multi-point slope click path utilizing centripetal \`THREE.CatmullRomCurve3\` extruding walkable stepped stone masonry boxes conforming to slope gradients, with lateral offset and step spacing sliders.
  - \`Fortifications\`: Continuous magnetic snap hologram placement for sliding round watchtowers, inward rampart bastions, and Maha Darwaza gates along walls.
- **Unified Outliner & Inspector**:
  - Right Tool Sidebar displays consolidated structures tree under \`FORT ARCHITECTURE\`: Walls (with nested bastions/towers/gates), Foundations, and Stairs.
  - Contextual Inspector allows real-time dimension, offset, elevation, and tiling adjustments for selected foundations and stairs.

## Acceptance Criteria
- [ ] Top toolbar features "Building" tool; standalone Spline tool is completely removed.
- [ ] ToolModeSidebar renders the 5 operational modes: Select, Walls, Foundation, Stairs, Fortifications.
- [ ] In Foundation mode, dragging across terrain displays a live translucent rectangular ghost box.
- [ ] Releasing mouse builds a solid foundation slab textured with stone bricks on sides and dark stone floor on top.
- [ ] Foundation height, vertical offset, length, width, and tiling repeat adjust interactively via sliders.
- [ ] In Stairs mode, clicking along slopes creates walkable stone staircases with adjustable offset and spacing.
- [ ] Wall drafting and magnetic snap fortifications function without regression.
- [ ] All building components can be selected, inspected, renamed, and deleted in the Right Outliner.`,
  },
  {
    ticketNumber: 10,
    title: 'Ticket 10: Festive Lighting & Fireworks Studio',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Dedicated festive pyrotechnic illumination studio featuring 18 migrated Diyas with active flame particles and warm amber night PointLights, plus 10 Diwali fireworks (5 Cone Fountains + 5 Sky Shots) powered by an interactive pyrotechnics engine with test triggers.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #8, #9

## Delivers
- **Dedicated Lighting Tool**:
  - New dedicated **\`Lighting\`** tool in the secondary Top ToolBar.
  - Migrates all 18 Diyas (9 terracotta clay + 9 hand-painted) out of the Figurine tool and into the Lighting Studio. Figurine tool is refined strictly to historical royalty, garrisons, architecture, and ordnance.
- **Authentic Diwali Pyrotechnics (10 Fireworks Models)**:
  - **5 Cone Fountains (*Anaar*)**: 3D inverted cone models (\`ConeGeometry\`) with decorative retro Diwali paper wrap textures in 5 vibrant color themes: Saffron Amber, Emerald Green, Royal Violet, Ruby Crimson, and Golden Sparkle.
  - **5 Sky Shots (*Aerial Shells*)**: 3D cylinder launcher models (\`CylinderGeometry\`) with retro casing textures in 5 festive themes: Multicolored Peony, Golden Willow, Silver Palm, Crackling Comet, and Saffron Ring.
- **Interactive Pyrotechnics Engine**:
  - Lightweight, ₹0 client-side particle engine driving realistic Diwali pyrotechnic effects.
  - Cone Fountains emit a continuous sparkling upward spray with parabolic falloff and crackling embers.
  - Sky Shots launch an ascending smoke/flare tracer that detonates into a dazzling spherical/willow burst in the night sky.
  - Fully configurable parameters matching fireworks standards: color hue, particle velocity, spray height/spread, burst radius, gravity, and flicker rate.
- **Tri-Mode Workflow**:
  - \`Place\`: Real-time surface snap hologram reticle with rotation heading and elevation offset; lower pane renders Lighting Vault with category tabs (Clay Diyas, Painted Diyas, Fireworks).
  - \`Select\`: Placed lights outliner in upper pane; lower pane renders Element Properties inspector (scale, heading, snap surface, color variation selector, test firework action, delete).
  - \`Delete\`: Single/batch deletion of placed lights and fireworks.
- **Night Diya Glow & PointLights**:
  - Diyas feature active flickering 3D flame particles with emissive bloom.
  - In night mode, diyas cast warm amber \`PointLight\` illumination (#F59E0B, radius: 3.5m, decay: 2.0) casting soft shadows on nearby mud slopes and fort masonry.
- **"Test Firework" Action**:
  - Inspector features a prominent "Test Firework" button allowing builders to detonate and preview the selected firework once on demand.

## Acceptance Criteria
- [ ] Lighting tool appears in Top ToolBar; Figurine tool no longer contains diya items.
- [ ] Lighting Vault drawer displays 3 tabs: Clay Diyas (9), Painted Diyas (9), and Fireworks (10).
- [ ] Placed diyas illuminate in warm amber point lighting and display animated flames during night mode.
- [ ] Cone fountains sit upright on terrain/decks and spray sparkling fountain effects on test.
- [ ] Sky shots launch upward rockets that explode in the night sky with colorful particle bursts.
- [ ] "Test Firework" button triggers the pyrotechnic effect cleanly without frame drops.
- [ ] Placed lights and fireworks can be selected, moved, duplicated, and deleted with full undo/redo.`,
  },
  {
    ticketNumber: 11,
    title: 'Ticket 11: Time-of-Day, Play/Pause Animation Engine & Quick-Action Diorama Bar',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Centered floating Quick-Action Bar mounted above the bottom status bar (Day, Play, Pause, Screenshot, Night), decoupled continuous ambient animation engine for trees and pyrotechnics, day-to-night fireworks celebration salvo, and instant direct viewport screenshot download.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #7, #10

## Delivers
- **Centered Quick-Action Diorama Bar**:
  - Tactile, floating 5-button control dock mounted centered directly above \`BottomStatusBar.tsx\`:
    - \`☀️ Day\`: Transitions diorama to warm daylight courtyard lighting.
    - \`▶ Play\`: Starts continuous 60 FPS animation loop for trees, particle effects, and continuous night fireworks.
    - \`⏸ Pause\`: Freezes all wind sway and particle motion; returns canvas to on-demand rendering.
    - \`📷 Screenshot\`: Hides all HUD chrome, captures the full-resolution WebGL canvas buffer to PNG, triggers direct browser download (\`killa-diorama-<timestamp>.png\`), and restores the HUD.
    - \`🌙 Night\`: Transitions to night mode, igniting all placed diyas and firing a celebratory simultaneous fireworks salvo.
- **Decoupled Animation Engine**:
  - Tree vertex wind sway and foliage fluttering are decoupled from mouse movement; animation progression is strictly governed by the \`isPlaying\` state.
  - When \`isPlaying\` is true: R3F Canvas runs in continuous frameloop (\`frameloop="always"\`), driving steady tree fluttering, flickering flame particles, and ambient diorama life.
  - When \`isPlaying\` is false: R3F Canvas pauses animation time clock (\`frameloop="demand"\`), eliminating unnecessary background CPU/GPU cycles.
- **Day-to-Night Celebration Salvo**:
  - Switching from Day to Night automatically triggers all placed fireworks in the diorama once in a coordinated festive volley.
- **Instant High-Res Viewport Screenshot**:
  - Screenshot button temporarily suppresses all HUD overlays (toolbars, sidebars, dock, minimizers), captures the WebGL canvas using \`preserveDrawingBuffer\`, triggers an immediate browser file download, and cleanly restores UI visibility with a success toast.

## Acceptance Criteria
- [ ] Quick-action diorama bar sits centered above the bottom status bar with Day, Play, Pause, Screenshot, and Night buttons.
- [ ] Ambient tree fluttering and wind sway progress smoothly when Play is active without requiring mouse moves.
- [ ] Clicking Pause immediately halts animation clock and freezes movement.
- [ ] Switching to Night mode ignites all diyas and fires all placed fireworks once in celebration.
- [ ] Clicking Screenshot captures an unobstructed, high-resolution PNG image directly to browser Downloads.`,
  },
  {
    ticketNumber: 12,
    title: 'Ticket 12: Free-Fly Spectator & Diorama Viewing Studio',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Dedicated viewing and presentation tool with zero-modification viewport guards, automatic HUD sidebar collapse, and dual camera navigation (Orbit Spectator and WASD/QE Free-Fly flight mode with dynamic speed controls).

- **Status**: \`ready-for-agent\`
- **Blocked by**: #2, #9, #11

## Delivers
- **Dedicated Viewing Tool**:
  - New **\`View\`** tool (\`view\`) in the secondary Top ToolBar.
  - Pure spectator mode designed for unobstructed diorama admiration and presentation without risk of accidental edits.
- **Zero-Modification Viewport Guard**:
  - Disables all object selection, raycast drafting, brush rings, hover outlines, and hologram ghosts.
  - Clicks and drags anywhere on the viewport are strictly dedicated to camera navigation.
- **Streamlined HUD Presentation**:
  - Automatically collapses and hides the Left Properties Sidebar, ToolModeSidebar, and Right Scene Outliner upon entering View tool, giving builders maximum screen real estate.
- **Dual Navigation Camera Rig (Orbit & Free-Fly)**:
  - **Orbit Spectator Mode**: Smooth, bounded 360° orbital rotation, panning, and zooming.
  - **Free-Fly Mode**: First-person fly camera allowing users to glide through gateways, soar over bastions, and swoop down into courtyards:
    - \`WASD\`: Fly forward, strafe left, fly backward, strafe right.
    - \`Q\` / \`E\`: Elevate down / up.
    - \`Mouse Drag\`: Smooth pitch and yaw camera look.
    - \`Fly Speed\`: Slider in a minimal floating HUD pill adjusting velocity from 0.5 m/s to 15.0 m/s with \`Shift\` 2x turbo boost.

## Acceptance Criteria
- [ ] Selecting View tool hides tool mode and outliner sidebars for clean diorama display.
- [ ] Clicking or dragging anywhere in the viewport does not select or stamp components.
- [ ] User can switch between Orbit Spectator and Free-Fly camera modes.
- [ ] Free-Fly mode smoothly translates camera via WASD/QE and mouse look.
- [ ] Flying speed slider dynamically adjusts flight velocity.`,
  },
  {
    ticketNumber: 13,
    title: 'Ticket 13: State Serialization, Local Persistence Adapter & Project Hub',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Complete project state serialization to compact \`.killa\` binary format (< 35 KB), 15-slot circular undo/redo buffer, local storage persistence vault, and desktop import/export supporting foundations, stairs, and pyrotechnics.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #6, #9, #10, #11

## Delivers
- **Undo / Redo Buffer**:
  - 15-slot in-memory circular buffer tracking terrain edits, building structures (walls, bastions, foundations, stairs), texture paint, foliage instances, figurines, and placed lights/fireworks.
- **Binary Serialization (\`.killa\` format)**:
  - Quantize terrain heightmap and paint weight buffers to \`Uint8Array\`.
  - Package terrain, building foundations, stairs, walls, fortifications, foliage, figurines, and fireworks with \`fflate.zipSync\` into a compact \`< 35 KB\` binary package.
- **Persistence Adapter & Local Vault**:
  - Local storage / IndexedDB implementation (\`killa_saved_projects_v1\`) persisting named projects with timestamp (\`updatedAt\`), template type, and diorama payload.
  - Startup modal hub displaying recent locally saved projects with relative time elapsed and one-click loading.
- **Project File Import & Export**:
  - Desktop file download of \`.killa\` diorama packages.
  - Native file picker upload to import and restore \`.killa\` files directly into the 3D canvas.
- **Defensive Zod Schema**:
  - Validates inbound project payloads, sanitizing coordinates and rejecting malformed files.

## Acceptance Criteria
- [ ] Undo and redo reliably revert and restore sculpting, foundations, stairs, walls, painting, and firework placements.
- [ ] \`serializeKilla()\` packages complete killa state into <= 35 KB in < 15ms.
- [ ] Projects save to local storage and appear in the startup hub with last-saved timestamps.
- [ ] \`.killa\` files can be exported and re-imported cleanly with identical visual reproduction.
- [ ] Inbound payload schema validates types and rejects corrupted payloads.`,
  },
  {
    ticketNumber: 14,
    title: 'Ticket 14: Showcase, Multi-Angle Festive Poster Studio & Share',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Multi-angle festive poster generation (1080x1920) in < 400ms with Marathi typography, historical templates (Raigad, Murud-Janjira, Sinhagad), and read-only 3D diorama viewer.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #13

## Delivers
- **Historical Blueprint Presets & Random Terrain**:
  - Raigad, Murud-Janjira, and Sinhagad pre-molded terrains with faint chalk outlines, plus "Roll New Terrain".
- **Automated 4-Angle Poster Generator**:
  - Client-side \`OffscreenCanvas(1080, 1920)\` rendering 4 cinematic camera angles in < 400ms:
    1. *Hero Bird's-Eye Overview*.
    2. *Maha Darwaza & Bastion Low-Angle*.
    3. *Balekilla Throne & Buildings Close-Up*.
    4. *Golden-Hour / Diwali Night Diya Angle*.
  - Traditional Marathi calligraphic header (\`Yatra One\`) and festive greeting (\`Modak\`): *"दिवाळीच्या हार्दिक शुभेच्छा"*.
  - Builder name and fort title customization.
  - Instant high-res PNG/JPG download + \`navigator.share()\` / clipboard link integration.
- **Shared 3D Viewer Route**:
  - Read-only diorama viewer at \`/killa/[id]\`.

## Acceptance Criteria
- [ ] "Finish Killa" opens the Poster Studio Modal and generates the 4-angle festive collage.
- [ ] Poster includes placed foundations, stairs, buildings, and glowing diyas.
- [ ] User can customize fort title and builder name in Devanagari or English.
- [ ] "Download Poster" produces a crisp, high-resolution PNG file.
- [ ] Shared link route \`/killa/[id]\` renders the 3D diorama in read-only orbit mode.`,
  },
  {
    ticketNumber: 15,
    title: 'Ticket 15: Tactile Soil & Mud Crafting Pipeline (Deferred / Advanced Phase)',
    labels: ['tracer-bullet', 'enhancement', 'deferred'],
    state: 'open',
    body: `## Overview
Deferred advanced organic soil simulation pipeline: loose soil dumping, water saturation, hand-patting, drying & hardening, and freehand mud paint.

- **Status**: \`deferred\`
- **Blocked by**: #3

## Delivers
- **Organic Soil Simulation Layer**:
  - **Tool 1: Dump Dry Soil**: Adds Gaussian elevation mound with simplex noise roughness; wetness set to 0.0.
  - **Tool 2: Pour Water**: Smooths height noise with 3x3 box blur, darkens soil, and increases wetness (+0.15), reducing material roughness from 0.95 to 0.2 (\`cracked_red_ground_1k\`).
  - **Tool 3: Hand Shaper (Push & Pat)**:
    - *Top Patting*: Levels wet mud to sampled plane height $H_{target}$.
    - *Side Pushing*: Compresses wet mud along pointer drag vector into steep vertical wall faces.
  - **Tool 4: Drying & Mud Locking**: Writes 1.0 to lock state, hardening mud into immutable stone.
  - **Tool 5: Freehand Mud Paint**: XL/Medium/Fine brush with \`lazy-brush\` stabilizer for hand-painting dark basalt base coats and white lime (*chuna*) brick divider lines over dried mud masses.

## Acceptance Criteria
- [ ] Soil dumping raises loose crumbly mounds.
- [ ] Pouring water darkens soil and adds glossy specular sheen.
- [ ] Hand shaper tools mold wet mud into plateaus and vertical wall faces.
- [ ] Drying tool locks mud to prevent unwanted brush deformation.
- [ ] Freehand paint applies mortar lines with steady-hand stabilization.`,
  },
  {
    ticketNumber: 16,
    title: 'Ticket 16: Verification Judges, Testing & Deployment Readiness',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Verification test harness, Vitest test suites, GPU resource leak audit, 60 FPS performance benchmarks, and deployment documentation.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #14

## Delivers
- **Vitest Unit Tests**:
  - Serialization/deserialization byte-size check (<= 35 KB).
  - Zod schema defensive boundaries (NaN rejection, prop limit <= 250).
  - Building foundation geometry bounds and stairs path extrusion tests.
  - Lighting manifest integrity and pyrotechnic variation checks.
- **GPU Resource Disposal Audit**:
  - Verify clean \`.dispose()\` on all textures, materials, and geometries on unmount.
- **Performance Benchmarks**:
  - 60 FPS maintained under 1,000 foliage instances, 50 props/fireworks, 20 foundations, and 100 wall segments.
- **Documentation**:
  - \`README.md\` with setup and build instructions.
  - Complete asset manifest for textures, models, pyrotechnics, and audio.

## Acceptance Criteria
- [ ] \`npm run test\` executes all Vitest suites with 100% pass rate.
- [ ] Zero GPU memory leaks on repeated terrain regeneration or scene resets.
- [ ] \`npm run build\` succeeds without TypeScript or bundling errors.
- [ ] Setup instructions for deployment documented in \`README.md\`.`,
  },
];

async function run() {
  console.log('Fetching existing issues...');
  const res = await fetch(`${API_BASE}/issues?state=all&per_page=100`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch issues: ${res.status} ${await res.text()}`);
  }
  const existingIssues = await res.json();
  const existingByNumber = new Map(existingIssues.map((i) => [i.number, i]));
  console.log(`Found ${existingIssues.length} existing issues.`);

  for (const ticket of tickets) {
    const num = ticket.ticketNumber;
    const existing = existingByNumber.get(num);

    const payload = {
      title: ticket.title,
      body: ticket.body,
      labels: ticket.labels,
      state: ticket.state,
      state_reason: ticket.state === 'closed' ? 'completed' : undefined,
    };

    if (existing) {
      console.log(`Updating Issue #${num} (${ticket.title})...`);
      const patchRes = await fetch(`${API_BASE}/issues/${num}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      if (!patchRes.ok) {
        throw new Error(`Failed to update issue #${num}: ${patchRes.status} ${await patchRes.text()}`);
      }
      const data = await patchRes.json();
      console.log(`Updated Issue #${num}: ${data.html_url} [${data.state}]`);
    } else {
      console.log(`Creating Issue #${num} (${ticket.title})...`);
      const postRes = await fetch(`${API_BASE}/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: ticket.title,
          body: ticket.body,
          labels: ticket.labels,
        }),
      });
      if (!postRes.ok) {
        throw new Error(`Failed to create issue #${num}: ${postRes.status} ${await postRes.text()}`);
      }
      const data = await postRes.json();
      console.log(`Created Issue #${data.number}: ${data.html_url} [${data.state}]`);

      if (ticket.state === 'closed') {
        const closeRes = await fetch(`${API_BASE}/issues/${data.number}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ state: 'closed', state_reason: 'completed' }),
        });
        const closedData = await closeRes.json();
        console.log(`Closed Issue #${closedData.number}: [${closedData.state}]`);
      }
    }

    // Gentle delay between API calls to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  console.log('\n--- Final Verification ---');
  const finalRes = await fetch(`${API_BASE}/issues?state=all&per_page=100`, { headers });
  const finalIssues = await finalRes.json();
  finalIssues.sort((a, b) => a.number - b.number);
  for (const i of finalIssues) {
    const labels = i.labels.map((l) => l.name).join(', ');
    console.log(`#${i.number} [${i.state}] ${i.title} (labels: ${labels})`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


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
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Consolidates the standalone Wall and Spline tools into a unified Building tool (retiring flag and diya splines, preserving stairs) and introduces an interactive 2-phase drag-to-build rectangular stone foundation builder on terrain.

- **Status**: \`completed\` (Verified in Browser & Unit Tests)
- **Blocked by**: #4, #5, #8

## Delivers
- **Tool Consolidation & Spline Retirement**:
  - Renames Walls tool to **\`Building\`** (Key 2) in the secondary toolbar.
  - Retires standalone Spline tool from top toolbar and mode strip. Flag and diya splines are deprecated in favor of solid 3D models in Figurine and Lighting catalogs.
  - Stone steps are integrated directly into the Building tool as **\`Stairs\` Mode**.
- **5 Unified Operational Modes in \`ToolModeSidebar.tsx\`**:
  - \`Select\`: Direct physical mesh raycasting on walls, towers, bastions, gates, foundations, and stairs with glowing hover outlines (#E85D04). Foundation slabs are strictly interactive in Select mode.
  - \`Walls\`: Click on terrain to draft perimeter wall curves with automatic pointed Murud-Janjira battlements, continuous elevation tracing, Close Loop (\`TbRefresh\`), and cancel draft CTA.
  - \`Foundation\`: 2-phase drag-to-build rectangular stone plinth builder on terrain:
    - Phase 1 (Base footprint): Pointer down anchors (x1, z1); dragging renders live translucent rectangular ghost box to (x2, z2).
    - Phase 2 (Height extrusion): Pointer up locks base footprint and switches to vertical height extrusion with normalized sensitivity (0.008). Left-click confirms and builds solid slab.
    - Negative Depth: Supports negative heights down to -10.0m up to +25.0m.
    - Cancel CTA: Dedicated Cancel Draft button (\`TbX\`) in Left Properties Panel.
    - Multi-material buffer geometry: Perimeter sides mapped to \`mossy_stone_brick_128x128_pbr\` (Group 0) and top deck mapped to \`dark_stone_floor_128x128_pbr\` (Group 1).
    - Interactive sliders: Length, Width, Height, Vertical Offset, and Texture Tiling (1x–10x UV multiplier).
  - \`Stairs\`: Continuous drag-drawing or multi-point slope click path utilizing centripetal \`THREE.CatmullRomCurve3\` extruding walkable stepped stone masonry boxes conforming to slope gradients, with lateral offset slider, 2x default scale multiplier, and stair spacing slider.
  - \`Fortifications\`: Continuous magnetic snap hologram placement for sliding round watchtowers, inward rampart bastions, round bastions flush on outer wall edge with pointed Kangare crenellations, and Maha Darwaza gates along walls.
- **Performance Optimization & Zero GPU/CPU Stalls**:
  - Decoupled snap and draft subscriptions into dedicated child layers.
  - Memoized \`EdgesGeometry\` across walls, foundations, and stairs.
  - Strict \`THREE.SRGBColorSpace\` and linear mipmapping on diffuse textures eliminating bleached white stone.
- **Unified Outliner & Inspector**:
  - Right Tool Sidebar displays consolidated structures tree under \`FORT ARCHITECTURE\`: Walls (with nested bastions/towers/gates), Foundations, and Stairs.
  - Contextual Inspector allows real-time dimension, offset, elevation, and tiling adjustments for selected foundations and stairs.

## Acceptance Criteria
- [x] Top toolbar features "Building" tool; standalone Spline tool is completely removed.
- [x] ToolModeSidebar renders the 5 operational modes: Select, Walls, Foundation, Stairs, Fortifications.
- [x] In Foundation mode, 2-phase drag-to-base and normalized height extrusion functions with negative elevation support and cancel draft CTA.
- [x] Releasing mouse and clicking builds a solid foundation slab textured with stone bricks on sides and dark stone floor on top.
- [x] Foundation height, vertical offset, length, width, and tiling repeat adjust interactively via sliders.
- [x] In Stairs mode, continuous dragging or clicking creates walkable stone staircases with 2x default scale and adjustable spacing.
- [x] Round bastions center flush on outer wall edge with pointed Kangare crenellations matching watchtowers.
- [x] Moving mouse over terrain or structures causes zero frame rate stalls (memoized edges geometry, isolated snap/draft subscriptions).
- [x] Stone brick and basalt textures display authentic dark earthen tones without bleached/white artifacts.
- [x] All building components can be selected, inspected, renamed, and deleted in the Right Outliner.`,
  },
  {
    ticketNumber: 10,
    title: 'Ticket 10: Festive Lighting & Fireworks Studio',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Dedicated festive pyrotechnic illumination studio featuring 18 migrated Diyas with active flame particles and 16 3D point lights with deterministic spatial clustering, plus 10 Diwali fireworks (5 Cone Fountains + 5 Sky Shots) powered by an interactive pyrotechnics engine with test triggers.

- **Status**: \`completed\` (Verified in Browser & Unit Tests)
- **Blocked by**: #8, #9

## Delivers
- **Dedicated Lighting Tool**:
  - New dedicated **\`Lighting\`** tool (Key 6) in the secondary Top ToolBar.
  - Migrates all 18 Diyas (9 terracotta clay + 9 hand-painted) out of the Figurine tool and into the Lighting Studio. Figurine tool is refined strictly to 22 historical royalty, garrisons, architecture, and ordnance models.
- **Authentic Diwali Pyrotechnics (10 Fireworks Models)**:
  - **5 Cone Fountains (*Anaar*)**: 3D inverted cone models with decorative retro paper casings in Saffron Amber, Emerald Green, Royal Violet, Ruby Crimson, and Golden Sparkle.
  - **5 Sky Shots (*Aerial Shells*)**: 3D cylinder launcher models in Multicolored Peony, Golden Willow, Silver Palm, Crackling Comet, and Saffron Ring.
- **Interactive 3D Pyrotechnics Engine**:
  - Native Three.js particle engine (\`THREE.Points\`) using pre-allocated \`Float32Array\` buffers with zero per-frame garbage collection.
  - Cone Fountains emit a continuous sparkling upward spray with parabolic gravity falloff and crackling embers.
  - Sky Shots launch an ascending rocket flare tracer with smoke trail that detonates at burst altitude into a dazzling spherical/willow particle burst.
- **3D Diya Illumination Engine (Zero Flat Decals & Zero Recompile Freeze)**:
  - **16 Statically Pre-Allocated 3D Omnidirectional PointLights** (#FFA533, decay: 2.0, distance: 2.2m–4.8m) in JSX with zero shader recompilation freezes (0ms).
  - **Camera-Independent 3D World-Coordinate Spatial Clustering** (\`computeSpatialClusters\`): K-Means clustering in fixed world coordinates guarantees that orbiting the camera 360° causes zero light popping, zero jumping, and zero white-hot bleaching.
  - Procedural 3D teardrop flames with organic evening breeze sway and camera-facing volumetric halo sprites.
- **Diurnal Diya Availability (\`getDiyaLightStatus\`)**:
  - Diyas automatically ignite during Golden Hour (~16:30 onwards), reach full radiance throughout Diwali Night, and stay lit until morning Dawn (~06:30), or whenever \`nightMode\` is explicitly enabled.
- **"Test Firework" Action & Isolated Trigger Pipeline**:
  - Dedicated test trigger in store ensures fireworks detonate exclusively upon clicking the "Test Firework Burst" button without accidental re-triggers during slider adjustments.
  - Burst height slider for fireworks with calibrated low default burst (~100cm from launcher).

## Acceptance Criteria
- [x] Lighting tool appears in Top ToolBar as Key 6; Figurine tool no longer contains diya items.
- [x] Lighting Vault drawer displays 3 tabs: Clay Diyas (9), Painted Diyas (9), and Fireworks (10).
- [x] Placed diyas illuminate in 16 pre-allocated 3D point lights with volumetric halo flames, casting authentic light on vertical fort walls, ramparts, and figurines without flat 2D decal artifacts.
- [x] Camera orbiting 360° produces zero popping or jumping of diya lights.
- [x] Placing and deleting diyas causes zero WebGL shader recompilation freezes (0ms).
- [x] Cone fountains sit upright on terrain/decks and spray sparkling fountain effects on test.
- [x] Sky shots launch upward rockets that explode at adjustable burst heights with colorful particle bursts.
- [x] "Test Firework" button triggers pyrotechnic effects on demand without triggering on property slider edits.
- [x] Placed lights and fireworks can be selected, moved, duplicated, and deleted with full undo/redo.`,
  },
  {
    ticketNumber: 11,
    title: 'Ticket 11: Time-of-Day, Play/Pause Animation Engine & Quick-Action Diorama Bar',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Centered floating Quick-Action Bar mounted above the bottom status bar (Day, Play, Pause, Screenshot, Night), decoupled continuous ambient animation engine for trees and pyrotechnics, day-to-night fireworks celebration salvo, dedicated View tool with orbit/turntable spectator modes, camera perspective presets, lens FOV slider, and instant direct viewport screenshot download.

- **Status**: \`completed\` (Verified in Browser & Unit Tests)
- **Blocked by**: #7, #10

## Delivers
- **Dedicated Diorama & Sun View Tool (\`view\`)**:
  - Primary toolbar **\`View\`** tool (Key 7) designed for pure diorama presentation, inspection, and celestial lighting control with full zero-modification viewport guard.
  - 24-hr Time of Day slider (0:00 to 24:00) with quick presets: Dawn (06:00), Noon (12:00), Golden Hour (17:30), and Diwali Night (21:00).
  - Sun Elevation (-10° to 90°) and Sun Azimuth (0° to 360°) sliders for real-time shadow direction sweeps.
  - Camera Perspectives Presets: Isometric (45°), Bird's Eye (90° Top-Down), Rampart Eye (15° Low Hero View), Bastion Hero (30° Citadel Corner), and Home Reset.
  - Camera Lens FOV Slider (20° Telephoto to 80° Wide-Angle, 45° Standard default).
  - Dual Navigation Modes: Free Orbit Spectator Mode (\`orbit\`) and Continuous 360° Turntable Exhibition Mode (\`spin\`).
  - Celebration Fireworks 5s Salvo: Dedicated test button that triggers all placed fireworks across the diorama for 5 seconds regardless of time, with a 5-second disable cooldown.
- **Atmospheric Lighting & 24-hr Diurnal Solar Arc Engine (\`atmosphericLighting.ts\`)**:
  - Dynamic Color Temperature Grading across 7 calibrated diurnal keyframes.
  - Luminous Full Moon Night Calibration: Silver-white moonlight (#E0F2FE, 1.35x), indigo shadow fill (#475569, 0.85x), dual-radiance hemisphere light, and exposure 1.28.
  - Vibrant Golden Hour: Sun 30 minutes before sunset (elevation 20°, azimuth 255°, radiant saffron #F59E0B 2.80x, courtyard terracotta upward GI bounce #EA580C 0.90x, exposure 1.30).
  - Deccan Plateau Horizon Mist / Depth Fog and ACESFilmic Tone Mapping.
- **Centered Quick-Action Diorama Bar (\`DioramaQuickBar.tsx\`)**:
  - Tactile floating 5-button dock: [ ☀️ Day | ▶ Play | ⏸ Pause | 📷 Screenshot | 🌙 Night ].
  - Governs decoupled ambient 60 FPS animation loop and instant high-res viewport screenshot capture.
- **Decoupled Animation Engine & Realistic Fireworks Dynamics**:
  - Continuous nighttime fireworks playback during dark hours with staggered launches and natural pauses.
  - Cone fountains (*Anaar*) and sky shots feature automatic ±20 cm (±0.20m) height variation and 10° launch angle variation.
  - "Randomize Burst Height" placement toggle switch in Left Tool Sidebar.
  - Infinite white grid removed across all tools.
  - Left panel tool headers and controls updated to Tabler React icons (\`react-icons/tb\`).

## Acceptance Criteria
- [x] Atmospheric lighting engine interpolates 24-hr solar arc with luminous full moon night and vibrant golden hour keyframes.
- [x] Sun/moon direction, elevation, and azimuth sliders sweep dynamic shadows across fort walls and courtyards.
- [x] Diyas automatically ignite during Golden Hour, Dusk, and Night, and remain lit through Dawn.
- [x] Quick-action diorama bar sits centered above the bottom status bar with Day, Play, Pause, Screenshot, and Night buttons.
- [x] Ambient tree fluttering and wind sway progress smoothly when Play is active without requiring mouse moves.
- [x] Clicking Pause immediately halts animation clock and freezes movement.
- [x] Switching to Night mode ignites all diyas and fires all placed fireworks once in celebration.
- [x] Clicking Screenshot captures an unobstructed, high-resolution PNG image directly to browser Downloads.
- [x] Viewport infinite white grid removed across all tools.
- [x] View tool Left Sidebar enriched with camera presets, lens FOV slider, turntable controls, and 5-second fireworks salvo.
- [x] Tool modes provide Orbit Spectator and 360° Turntable Exhibition modes with full raycast drafting suppression.`,
  },
  {
    ticketNumber: 12,
    title: 'Ticket 12: State Serialization, Local Persistence Adapter & Project Hub',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Complete project state serialization to compact \`.killa\` binary format (< 35 KB), 15-slot circular undo/redo buffer, local storage persistence vault, interactive terrain drawer, and desktop import/export supporting foundations, stairs, and pyrotechnics.

- **Status**: \`completed\`
- **Blocked by**: #6, #9, #10, #11

## Delivers
- **Undo / Redo Buffer**:
  - 15-slot in-memory circular buffer tracking terrain edits, building structures (walls, bastions, foundations, stairs), texture paint, foliage instances, figurines, and placed lights/fireworks.
  - Decoupled \`historyVersion\` from continuous stroke \`lastUpdated\` timestamp, preventing React tree re-renders during high-frequency mouse dragging.
- **Viewport & Tool Performance Optimizations**:
  - Direct TypedArray vertex manipulation with zero initial drag jitter.
  - Material singleton lifecycle for \`CustomShaderMaterial\` with in-place uniform updates (\`uTexturePaint.value = currentTexture\`), eliminating 1-2s stroke compilation freezes.
  - Fortifications & magnetic snap camera orbit/pan bypass (\`e.buttons !== 0\`), sub-centimeter position deduplication guard (\`Math.abs(delta) < 0.005\`), 60ms click debounce, and static shared wireframe geometries.
  - Sub-0.2ms BVH raycasting against targeted pickable root containers with static shared markers.
  - Foliage scatter & erase cadence throttling (35ms / 0.05m), 512 minimum \`InstancedMesh\` capacity, \`frustumCulled={false}\`, and module-level temporary objects.
  - Instantaneous shadow reticle synchronization on vault item switch and instantaneous placement without click queuing.
  - Auto-stop playback on primary tool switch, returning viewport to \`<Canvas frameloop="demand">\` for maximum responsiveness.
- **Binary Serialization (\`.killa\` format v1.2.0)**:
  - Quantize terrain heightmap via 2D spatial prediction into delta-encoded 16-bit integers and perceptual channels into compact \`Uint8Array\` buffers.
  - Package terrain, building foundations, stairs, walls, fortifications, foliage, figurines, and fireworks with \`fflate.zipSync\` into a compact \`< 35 KB\` binary package.
- **Persistence Adapter & Local Vault**:
  - IndexedDB implementation (\`killaVault.ts\`) persisting named projects with timestamp (\`updatedAt\`), template type, diorama statistics, and binary package payload.
  - Two-tab Project Hub Modal (\`ProjectHubModal.tsx\`) displaying historical fort blueprints, procedural generator, and saved projects with relative time elapsed, one-click loading, and project deletion.
- **Interactive Terrain Studio Drawer**:
  - Non-blocking top-sliding drawer (\`TerrainStudioDrawer.tsx\`) allowing real-time inspection of terrain alterations behind controls.
  - Real sliding toggle switch for base water plane (moat / sea).
  - "Roll New Terrain" seed randomizer dice button with instant regeneration.
  - "Stepped Mountain Tiers" slider (1 to 3 tiers) with smooth, tear-free Sahyadri stepped terraces (Balekilla and Machi).
  - Destructive terrain change confirmation popup (\`TerrainChangeConfirmModal.tsx\`) with itemized object counters protecting placed structures.
- **Pyrotechnic Pause Timer**:
  - 5-second countdown timer for fireworks in the paused state: keeps particles frozen for 5 seconds for visual admiration, then cleans them up so they do not obstruct building. Normal playback remains unaffected.
- **Project File Import & Export**:
  - Desktop file download of \`.killa\` diorama packages and backward-compatible JSON payloads.
  - Native file picker upload to import and restore \`.killa\` files directly into the 3D canvas with full terrain and texture reproduction.
- **Defensive Zod Schema**:
  - Validates inbound project payloads, sanitizing coordinates and rejecting malformed files.

## Acceptance Criteria
- [x] Undo and redo reliably revert and restore sculpting, foundations, stairs, walls, painting, and firework placements.
- [x] \`serializeKilla()\` packages complete killa state into <= 35 KB in < 15ms.
- [x] Projects save to local storage and appear in the startup hub with last-saved timestamps.
- [x] \`.killa\` files can be exported and re-imported cleanly with identical visual reproduction.
- [x] Inbound payload schema validates types and rejects corrupted payloads.
- [x] Sculpting, texture painting, and foliage brushing maintain 60 FPS without initial stroke drag hesitation.
- [x] Fortify mode camera orbiting runs at 60 FPS without magnetic snap calculation stalls.
- [x] Primary tool switching automatically returns canvas to demand rendering.`,
  },
  {
    ticketNumber: 13,
    title: 'Ticket 13: Showcase, Multi-Angle Festive Poster Studio & Share',
    labels: ['tracer-bullet', 'enhancement', 'verified'],
    state: 'closed',
    body: `## Overview
Multi-layer SVG sandwich poster generator (1080x1350 / 4:5 portrait) with 4-perspective diurnal snapshot engine, local IndexedDB screenshot vault, and multi-channel social sharing.

- **Status**: \`completed\`
- **Blocked by**: #12

## Delivers
- **SVG Multi-Layer Sandwich Compositor (1080 x 1350 px / 4:5 Portrait)**:
  - Layer 1 (Base): High-fidelity vector festival backgrounds (\`design_01\` to \`design_04\`) across 4 curated historical themes (*Archway Citadel*, *Maratha Vanguard*, *Sahyadri Sunset*, and *Fortress Bastion*).
  - Layer 2 (3D Views Grid): 1 to 4 images with dynamic grid layouts (4-stacked widescreen horizontal strips matching authentic diorama arch framing, 2x2 quad grid, 3-stacked, 2-stacked, 2-columns, and single full view). Transparent photo grid gaps allow the background artwork to shine through cleanly without heavy borders or dark box fills.
  - Layer 3 (Overlay 1): Foreground architectural badges, sky fireworks, or mountain elements (\`layer_02_...\`). Unused cliff backgrounds pruned for crisp framing.
  - Layer 4 (Overlay 2): Foreground figures, artillery cannon, and terrain base (\`layer_03_...\`), producing a rich 3D layered parallax depth effect.
  - Layer 5 (Typography & Royal Plaque): Authentic Devanagari display typography (\`Yatra One\`) with strict locale isolation (no Marathi text leakage in English mode). Supports Royal Stone Plaque (*Shilalekh* / राजकीय शिलालेख with dark basalt gradient, double gold trim, and gold diamond accents), Traditional Bottom Banner, Corner Stamp, and Pure Artwork.
- **4 Standard Camera Perspectives & Diurnal Snapshot Pipeline**:
  - Isometric (45°), Bird's Eye (Top-Down), Rampart Eye (15° Low Hero View), and Bastion Hero (30° Citadel Corner).
  - Live viewport angle support + one-click angle reassignment.
  - Diurnal Atmospheric Sky & Scene Lighting Overrides: Automatically composites diurnal sky gradient (Dawn peach-rose, Noon sky blue, Golden Hour fiery amber, Diwali Night deep indigo with twinkling stars) and physical scene lighting overrides matching the chosen time-of-day. Cleanly restores interactive scene lighting post-render.
  - 4-Tile Time-of-Day Selector Per Slot: Dawn, Noon, Golden Hour, and Night with randomized initial defaults.
  - Atomic Monotonic Request Versioning: Discards stale asynchronous renders, eliminating flickering and angle-reverting bugs.
- **Local Screenshot Gallery Vault (\`screenshotVault.ts\` & \`ConfirmDialog.tsx\`)**:
  - Browser IndexedDB storage (\`killa_screenshots_db\`, store \`screenshots\`) for diorama snapshots with slot assignment, inline per-slot gallery picker, and single/batch deletion.
  - Viewport screenshot button in \`DioramaQuickBar.tsx\` captures headless 1920 x 1080 snapshots and dual-saves: direct file download + local IndexedDB gallery.
  - Custom in-app confirmation modal (\`ConfirmDialog.tsx\`) replaces native browser \`window.confirm()\` popups.
- **Foliage Texture Manager Lifecycle Hardening**:
  - Event-driven texture subscription with mount guards eliminating state update warnings.
- **Instant Export & Multi-Channel Social Sharing (\`posterShare.ts\`)**:
  - Lossless PNG and compact JPG downloads with clean sanitized filenames.
  - Native Web Share API (\`navigator.share\`) on mobile/desktop for 1-tap sharing to WhatsApp, Instagram Stories, Facebook, Twitter, and AirDrop.
  - One-click image copy to system clipboard (\`ClipboardItem\`) for WhatsApp Web and Discord.
  - Direct social share links for WhatsApp and X (Twitter).

## Acceptance Criteria
- [x] "Finish Killa" and \`File -> Export Festive Poster\` open the Poster Studio Modal.
- [x] Poster renders the 5-layer composite sandwich with Layer 2 and Layer 3 overlapping the 3D views.
- [x] Users can select between 1 to 4 images and choose tailored grid layouts with transparent gaps.
- [x] Headless snapshots capture atmospheric sky gradients and physical scene lighting matching slot diurnal time.
- [x] Viewport screenshot button captures headless offscreen snapshots and saves 2 copies (browser download + local gallery).
- [x] Local screenshots can be picked and assigned into poster slots and deleted via custom in-app confirmation popups.
- [x] Presets for titles, greetings, builder names, banner styles, and fonts update live in the canvas preview with strict locale isolation.
- [x] "Download Poster" produces a crisp, high-resolution PNG/JPG file.
- [x] "Share" triggers Web Share API on supported devices, and "Copy Image" copies the PNG to clipboard.`,
  },
  {
    ticketNumber: 14,
    title: 'Ticket 14: Studio Design System Tokens, Surface Hierarchy & Iconography',
    labels: ['tracer-bullet', 'enhancement', 'ready-for-agent'],
    state: 'open',
    body: `## Overview
Establish the visual foundation of "The Digital Killa Workshop": 3-tier neutral stone surface hierarchy, burnt terracotta accent restraint, Inter typography scale with tabular numerals, 16-18px Lucide icon standardization, and normalized 8px/12px/16px border radius system.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #13

## Mandatory Pre-Execution Visual Audit & Ticket Refinement Protocol
> [!IMPORTANT]
> The initial UI/UX review was based on a selective set of 9 static screenshots and did not capture all in-app panels, subtool modes, dialog states, or responsive edge cases.
> Before writing code, the executing agent must:
> 1. Spin up the local development server and capture comprehensive Playwright/browser screenshots of **all** toolbars, panels, docks, dropdowns, and modals in both default and active states across desktop, tablet, and mobile breakpoints.
> 2. Audit the captures against this ticket's deliverables, identify any uncaptured sub-states, color conflicts, or missing tokens, and update \`roadmap.md\` with refined acceptance criteria before authoring changes.
> 3. Capture post-execution comparison screenshots documenting every modified surface and token.

## Delivers (Review Items 1, 2, 3, 4, 5)
- **3-Tier Surface Hierarchy (De-beiging Overhaul - Review Item 1)**:
  - Eliminate the uniform beige wash across panels, docks, and modals.
  - Establish 3 clear visual surface tiers:
    - *Level 1 (Base Viewport Canvas & Floor):* Neutral warm stone foundation (\`#F4F1EA\`).
    - *Level 2 (Raised Panels & Dock Shells):* Warm grey/stone (\`#EBE6DC\`) with 1px hairline dividers (\`#D8D1C5\`).
    - *Level 3 (Dark Active & Selected Surfaces):* Basalt dark stone (\`#2B2621\`) for high-contrast active items, with crisp off-white labels (\`#FAF8F5\`).
  - Keep terracotta (\`#B85F45\`) strictly reserved for meaningful actions and active selections; remove competing brown/orange washes.
- **Typography System & Micro-Copy Standardization (Review Item 2)**:
  - Standardize interface font entirely on \`Inter\` with tabular numerals (\`tabular-nums\`) for numeric measurements, degrees, coordinates, and scale readouts.
  - Strict 5-tier type scale:
    - *Panel Titles:* 14px Semi-Bold (\`font-semibold\`).
    - *Section Headers:* 12px Medium (\`font-medium\`) in sentence case.
    - *Control Labels:* 11px Regular/Medium (\`font-normal\` / \`font-medium\`).
    - *Readout Values:* 11px Tabular Numbers (\`tabular-nums font-mono\` or \`font-sans\`).
    - *Helper Text:* 10px Muted (\`text-[#7C7267]\`).
  - Reserve display typeface \`Yatra One\` strictly for brand display voice, fort title plaques, and poster typography.
- **Lucide Icon Standardization (Review Item 3)**:
  - Replace inconsistent, ad-hoc icon sizes and mixed stroke weights across all toolbars, panels, and modals with unified **Lucide** icons.
  - Standardize bounding boxes to 16–18px with consistent 1.5px/1.75px stroke width.
  - All icons inherit parent label text color (\`currentColor\`) by default; reserve colored status icons strictly for semantic states (success, warning, error), never decoration.
- **Normalized Border Radius & Hairline Divider System (Review Item 4)**:
  - Establish strict 3-tier radius system:
    - \`8px\` (\`rounded-md\`): Buttons, inputs, sliders, and segmented pills.
    - \`12px\` (\`rounded-lg\`): Asset cards, preset tiles, and contextual popovers.
    - \`16px\` (\`rounded-xl\`): Major sidebars, docks, and modal shells.
  - Replace nested card-inside-card boxes with clean structural whitespace and subtle 1px dividers (\`border-[#D8D1C5]\`).
- **Quieter Interface Restraint (Review Item 5)**:
  - Unify interaction colors around a single primary accent: Burnt Terracotta (\`#B85F45\`).
  - Remove conflicting dark brown active buttons, bright orange highlights, and neon green selection rings.
  - Clear semantic colors reserved strictly for: Success (\`#15803D\`), Warning (\`#D97706\`), and Error/Destructive (\`#DC2626\`).

## Acceptance Criteria
- [ ] Live UI visual audit completed and documented with screenshots before code modifications begin.
- [ ] Ticket 14 deliverables updated in \`roadmap.md\` if the audit discovers uncaptured components or tokens.
- [ ] 3-tier surface hierarchy applied across all toolbars, sidebars, and modals without flat beige wash.
- [ ] Typography scale implemented with \`Inter\`, sentence case headings, and tabular numerals on all numeric readouts.
- [ ] Lucide icons standardized to 16-18px with uniform stroke and color inheritance.
- [ ] Border radius normalized to 8px / 12px / 16px, eliminating nested-card syndrome.
- [ ] Accent color unified to burnt terracotta with reserved semantic states.`,
  },
  {
    ticketNumber: 15,
    title: 'Ticket 15: Two-Row Studio Header, Compact Tool Rail & Contextual Panels',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Streamline navigation into a professional two-row creative studio header (Row 1 global/menus, Row 2 workspace tabs), build a compact vertical tool rail with shortcuts, reorganize left tool properties into contextual groups with collapsible advanced accordions, and align right panel shell layout.

- **Status**: \`pending\`
- **Blocked by**: #14

## Mandatory Pre-Execution Visual Audit & Ticket Refinement Protocol
> [!IMPORTANT]
> Before writing code:
> 1. Capture screenshots of the top navigation bar (\`AppMenuBar.tsx\`, \`TopToolBar.tsx\`), vertical mode rail (\`ToolModeSidebar.tsx\`), left properties sidebar (\`LeftToolSidebar.tsx\`), and right outliner (\`RightToolSidebar.tsx\`) across all 10 tools and their individual sub-modes.
> 2. Verify every tool property layout and outliner pane; document any hidden sliders, mode-specific controls, or layout collisions before touching code.
> 3. Refine and update \`roadmap.md\` with any newly identified criteria before implementation.
> 4. Capture before/after layout screenshots verifying vertical space savings and clean two-row alignment.

## Delivers (Review Items 6, 8, 9 & Right Panel Alignment)
- **Two-Row Studio Navigation Hierarchy (Review Item 6)**:
  - Consolidate multi-layer horizontal bars into a streamlined two-row creative studio header:
    - *Row 1 (Global Brand & Document Bar):* Killa Playground shield logo, project title, document state (unsaved dot), undo/redo, global actions (New, Open, Save, Export Poster), and clean dropdown menus (\`File\`, \`Edit\`, \`View\`, \`Settings\`, \`Help\`).
    - *Row 2 (Workspace Tool Tabs):* Dedicated horizontal tab strip organizing tools into logical studio workspaces (*Terrain*, *Walls*, *Spline*, *Texture*, *Foliage*, *Architecture*, *Lighting/View*).
  - Relocate secondary actions (Language switch, Help guide, Debug toggles) into Row 1 dropdown menus to eliminate top-bar clutter.
  - Remove repeated decorative badges, redundant separators, and filler text.
- **Compact Vertical Tool Rail (Review Item 8)**:
  - Redesign \`ToolModeSidebar.tsx\` into a high-density, professional tool rail docked to the canvas edge.
  - Group tools logically: *Sculpt* (Elevate, Plateau, Smooth, Basin), *Build* (Walls, Towers, Stairs, Foundations), *Paint* (Textures, Surface Mud), and *Place* (Foliage, Figurines, Fireworks).
  - Distinct burnt terracotta active indicator badge with high-contrast icon.
  - Hover tooltips displaying tool name and keyboard shortcuts (\`1\`–\`8\`, \`B\`, \`E\`, \`R\`).
  - Icon-only compact mode toggle with smooth expand/collapse.
- **Contextual Left Properties Panel (Review Item 9)**:
  - Reorganize continuous unorganized slider lists in \`LeftToolSidebar.tsx\` into standardized contextual groupings: \`Geometry\`, \`Placement\`, \`Appearance\`, and \`Behavior\`.
  - Frequently used controls mounted at the top directly on the panel background (\`bg-[#EBE6DC]\`) without enclosing cards.
  - Collapsible \`Advanced Settings\` accordion for secondary parameters, preventing vertical scrolling fatigue.
- **Right Panel Shell Alignment & Coordination (Review & User Feedback)**:
  - Align \`RightToolSidebar.tsx\` with the two-row header and Level 2 surface styling.
  - Dual-pane layout: upper *Scene Outliner* (tree view) and lower *Element Inspector* (selected object transforms/properties) with collapsible headers and hairline dividers.
  - Symmetrical minimized toggle tabs (\`[🏰 Outliner ▾]\`) coordinated with the left properties panel.

## Acceptance Criteria
- [ ] Pre-execution screenshot audit completed across all 10 tools, left panel states, and right outliner.
- [ ] Top navigation consolidated into two clean rows: Row 1 global/menus, Row 2 workspace tabs.
- [ ] Vertical tool rail features grouped tools, keyboard shortcuts, tooltips, and compact icon-only mode.
- [ ] Left property panels organized into \`Geometry\`, \`Placement\`, \`Appearance\`, and \`Behavior\` with collapsible advanced accordions.
- [ ] Right sidebar aligned to studio shell with dual-pane outliner and inspector.
- [ ] All sliders mount directly on panel background without white container cards.`,
  },
  {
    ticketNumber: 16,
    title: 'Ticket 16: Viewport Ergonomics, Celestial Lighting & Presentation Mode',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Unify viewport controls into a single floating bottom toolbar, add subtle toggleable guides and cleaner brush reticles, create a 1-click distraction-free Diorama Presentation Mode, promote 4 celestial lighting presets first, and display contextual shortcut feedback.

- **Status**: \`pending\`
- **Blocked by**: #15

## Mandatory Pre-Execution Visual Audit & Ticket Refinement Protocol
> [!IMPORTANT]
> Before writing code:
> 1. Capture screenshots of \`DioramaQuickBar.tsx\`, bottom status bar, viewport axes, grid overlays, brush reticles, and the lighting tool panel during Day, Golden Hour, Dusk, and Night modes.
> 2. Document existing button hit-boxes, tooltips, and overlay opacity values; update ticket criteria with exact coordinates and responsive rules before starting implementation.
> 3. Capture side-by-side screenshots demonstrating uncluttered viewport and presentation mode.

## Delivers (Review Items 11, 12, 13, 14, 15)
- **Unified Bottom Viewport Toolbar (Review Item 11)**:
  - Consolidate floating Day/Play/Screenshot/Night pill and floating navigation instruction pill into a single, cohesive, floating viewport toolbar anchored at bottom-center.
  - Decouple camera viewpoint controls (Isometric 45°, Rampart Eye, Bird's Eye, Home) from environmental controls (Play/Pause, Day/Night toggle, Headless Snapshot).
  - Clear icon labels with micro-tooltips showing keyboard shortcuts (\`Space\` for Play/Pause, \`N\` for Day/Night, \`F12\` for Snapshot).
- **Subtle & Toggleable Viewport Guides (Review Item 12)**:
  - Reduce opacity of red/green world axes and ground perimeter guides by 50% for a cleaner diorama focus.
  - Provide View menu toggles (\`View -> Show Guides\`, \`View -> Show Wireframe\`, \`View -> Show Brick Retaining Ring\`) allowing builders to customize viewport visibility.
  - Refine 3D brush hover reticle: replace thick bright orange rings with subtle anti-aliased terracotta rings that scale cleanly with brush radius.
- **Dedicated Diorama Presentation Mode (Review Item 13)**:
  - 1-click exhibition presentation mode (Key \`P\` or View menu):
    - Smoothly collapses left properties, vertical mode rail, right outliner, and top workspace tabs.
    - Hides all 3D editing guides, brush reticles, wireframes, and coordinate axes.
    - Retains only a minimalist translucent glass bar: Camera Presets + Turntable, Day/Night toggle, Screenshot button, and an Exit Presentation button (\`Esc\`).
  - Allows builders to admire and showcase their finished Killa with zero software distractions.
- **Preset-First Celestial Lighting Studio (Review Item 14)**:
  - Reorganize Lighting tool panel to lead with 4 prominent celestial presets:
    - 🌅 *Dawn*: Soft rose-gold morning light, long mountain shadows.
    - ☀️ *Noon*: Crisp high-angle sun, vibrant earthen textures.
    - 🌇 *Golden Hour*: Warm amber sunset, blazing bastion silhouettes.
    - 🌙 *Diwali Night*: Deep star-lit indigo sky, glowing diyas, and celebratory fireworks.
  - Move granular sliders (Sun Azimuth, Elevation, Moon Azimuth, Light Bounce, Diya Radius) into an expandable \`Advanced Lighting & Atmosphere\` accordion.
  - Add a 1-click "Reset to Preset Defaults" action and clear numeric degree/lux readouts.
- **Contextual In-Canvas Tool Instructions (Review Item 15)**:
  - Replace the permanent static bottom instruction bar with contextual, transient floating keycap badges that adapt dynamically to the active tool:
    - *Rampart Drafting:* \`[Click] Add Node\` • \`[Enter] Finish Wall\` • \`[Esc] Cancel\`
    - *Foliage Scatter:* \`[Drag] Scatter\` • \`[Alt + Drag] Erase\` • \`[Shift + Scroll] Radius\`
    - *Sculpting:* \`[Drag] Elevate\` • \`[Ctrl + Drag] Lower\` • \`[Shift + Scroll] Radius\`

## Acceptance Criteria
- [ ] Pre-execution screenshot audit completed for viewport overlays, quick-action bar, and lighting controls.
- [ ] Single consolidated bottom viewport toolbar replaces multiple floating control pills.
- [ ] Viewport guides feature reduced opacity and are individually toggleable via the View menu.
- [ ] Presentation mode hides all sidebars, rails, and guides with 1-click entry and \`Esc\` exit.
- [ ] Lighting panel promotes 4 celestial presets first, housing granular sliders in an advanced accordion.
- [ ] Contextual keycaps and instructions dynamically reflect active tool state.`,
  },
  {
    ticketNumber: 17,
    title: 'Ticket 17: Tactile Asset Browser & Fort Blueprints Studio',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Transform the right sidebar into a Substance/Unreal-grade tactile 3D asset browser with categories, search, grid/list toggle, dual-preview material spheres, and overhaul the Fort Blueprints dialog with authentic 3D terrain profile silhouettes and click-anywhere cards.

- **Status**: \`pending\`
- **Blocked by**: #15

## Mandatory Pre-Execution Visual Audit & Ticket Refinement Protocol
> [!IMPORTANT]
> Before writing code:
> 1. Capture screenshots of the texture picker, foliage library, figurine catalog, lighting props, and \`StartupModal\` / \`ProjectHubModal\` fort blueprint cards.
> 2. Document existing asset thumbnail resolutions, missing descriptions, and card selection states; update ticket criteria before implementing asset browser components.
> 3. Capture screenshots demonstrating tactile material sphere previews, foliage thumbnails, and blueprint terrain silhouettes.

## Delivers (Review Items 10 & 18)
- **Tactile 3D Asset Browser (Review Items 10 & 18)**:
  - Upgrade \`RightToolSidebar.tsx\` into a studio-grade asset browser inspired by Substance 3D and Unreal Bridge.
  - Categorized filter tabs with live text search: *All*, *Stone & Basalt*, *Earth & Mud*, *Foliage*, *Architecture*, *Figurines*, *Lanterns*.
  - View mode toggle: Rich Visual Grid vs Compact List View.
  - Standardized asset card previews:
    - *Textures:* Dual-preview featuring flat procedural tile swatch alongside lit 3D material sphere showing surface roughness.
    - *Foliage & Figurines:* Clean renders of actual 3D models against neutral studio backgrounds at normalized comparative scale.
  - Clean selection state: terracotta border ring and subtle dark stone elevation, eliminating heavy neon green outlines.
  - Hover inspector badge displaying asset technical metadata (source texture, polygon budget, historical cultural lore).
- **Fort Blueprints Selection Studio Redesign (Review Item 16)**:
  - Overhaul \`StartupModal.tsx\` and \`ProjectHubModal.tsx\` fort selection cards:
    - Replace generic icons with recognizable miniature 3D terrain profile silhouettes for iconic forts (*Raigad*, *Pratapgad*, *Sinhagad*, *Murud-Janjira*, *Sindhudurg*).
    - Punchy, concise architectural summaries replacing long text paragraphs.
    - Distinct architectural attribute badges: Elevation (High/Sea-Level), Rampart Type (Giri Durg / Jala Durg), Water Source (Moat / Cistern).
    - Entire card surface is clickable with instant visual focus and selected indicator.

## Acceptance Criteria
- [ ] Pre-execution screenshot audit completed for all asset catalogs and blueprint modal cards.
- [ ] Right sidebar functions as a full tactile asset browser with categories, search, and grid/list view toggle.
- [ ] Texture cards display dual preview (tile swatch + lit material sphere); foliage/figurines display normalized previews.
- [ ] Asset selection uses refined terracotta framing without heavy green borders.
- [ ] Fort blueprint dialog cards display recognizable terrain silhouettes, concise attribute badges, and full-card clickability.`,
  },
  {
    ticketNumber: 18,
    title: 'Ticket 18: Festive Fort Poster Studio Streamlining',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Streamline the Festive Fort Poster Studio into a dedicated, responsive poster workstation featuring a compact 4-slot visual navigator, synchronized selection indicators, categorized settings accordions, and a pinned 4:5 preview canvas and export dock.

- **Status**: \`pending\`
- **Blocked by**: #14, #16

## Mandatory Pre-Execution Visual Audit & Ticket Refinement Protocol
> [!IMPORTANT]
> Before writing code:
> 1. Open the Poster Studio modal (\`PosterStudioModal.tsx\`) and capture screenshots of all 4 photo slot configurations, background theme selection, plaque text inputs, and export dropdowns.
> 2. Document repetitive slot parameters, scrolling behavior, and live preview latency; update ticket criteria before restructuring the modal layout.
> 3. Capture screenshots verifying compact slot navigator, live synchronized selection, and pinned action dock.

## Delivers (Review Item 17)
- **Compact 4-Slot Navigator (Review Item 17)**:
  - Replace the long, repetitive vertical scrolling list for Slots 1–4 with a clean, horizontal slot navigator strip (\`Slot 1\` • \`Slot 2\` • \`Slot 3\` • \`Slot 4\`).
  - Clicking a slot activates its settings in a focused slot inspector, displaying its current camera perspective, time of day, and image source.
- **Synchronized Slot Selection Feedback**:
  - The active slot is visually emphasized in both the 4:5 poster preview canvas (subtle corner bracket highlight) and the slot navigator strip.
- **Logical Parameter Grouping & Sticky Dock**:
  - Slot parameters organized into clean collapsible accordions:
    - *Image Source:* Live Viewport vs Local Screenshot Vault thumbnail picker.
    - *Camera Perspective:* Isometric (45°), Rampart Eye (15°), Bird's Eye (90°), Bastion Hero (30°).
    - *Diurnal Lighting:* Dawn, Noon, Golden Hour, Diwali Night.
  - Global poster parameters (Royal Shilalekh Plaque text, typography, festival theme) separated into a dedicated *Poster Style* tab.
  - Sticky layout: the live 1080x1350 poster preview and export action dock (\`Download PNG\`, \`Download JPG\`, \`Share\`, \`Copy Image\`) remain pinned and accessible while scrolling through slot settings.

## Acceptance Criteria
- [ ] Pre-execution screenshot audit completed across all poster modal tabs and slot settings.
- [ ] Compact 4-slot navigator replaces repetitive vertical scrolling lists.
- [ ] Active slot visually syncs between canvas preview highlight and inspector controls.
- [ ] Global styling and per-slot controls cleanly separated into tabs.
- [ ] Live preview and export action dock remain sticky and fully accessible during editing.`,
  },
  {
    ticketNumber: 19,
    title: 'Ticket 19: Universal Interaction States, Responsive Drawers & Workspaces',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Implement 3 persistent workspace layouts (Standard, Focus, Presentation), standardize universal interaction states with high-contrast accessible keyboard focus rings across all UI components, and transition sidebars into touch-friendly slide-over drawers on tablet and mobile viewports.

- **Status**: \`pending\`
- **Blocked by**: #15, #16, #17, #18

## Mandatory Pre-Execution Visual Audit & Ticket Refinement Protocol
> [!IMPORTANT]
> Before writing code:
> 1. Capture screenshots across mobile (375px/390px), tablet (820px/1032px), and desktop (1440px+) viewports; capture focus states, keyboard navigation, and destructive confirmation modals.
> 2. Document keyboard focus gaps, touch target clipping, and drawer transitions; update ticket criteria before implementing layout engines.
> 3. Capture multi-viewport screenshots demonstrating responsive drawer collapse and keyboard focus rings.

## Delivers (Review Items 7, 19, 20)
- **3 Persistent Workspace Layout Configurations (Review Item 7)**:
  - *Standard Studio:* Left Properties + 3D Viewport + Right Asset Browser.
  - *Focus Crafting:* Maximized Viewport + single contextual panel (Left or Right).
  - *Presentation Exhibition:* Full-canvas diorama with floating minimal controls.
  - Workspace layout switcher integrated into the View menu and top global bar; user's preferred layout and custom sidebar widths persist in \`localStorage\`.
- **Universal Interaction State Engine (Review Item 19)**:
  - Standardize interaction states across every button, card, tab, slider, list item, and modal button:
    - \`Default\`: Restrained stone surface with subtle contrast.
    - \`Hover\`: Gentle surface elevation (\`#E0D9CE\`) with 150ms transition.
    - \`Selected\`: Basalt dark stone surface (\`#2B2621\`) or crisp terracotta border (\`#B85F45\`).
    - \`Focused\`: High-visibility accessible keyboard focus ring (\`focus-visible:ring-2 focus-visible:ring-[#B85F45] focus-visible:outline-none\`).
    - \`Disabled\`: 40% opacity with cursor not-allowed.
    - \`Loading\`: Subtle spinning loader preserving layout dimensions.
  - Standardize destructive action confirmations (Reset Terrain, Delete Object, Clear Diorama) using consistent modal styling.
- **Responsive Slide-Over Drawers & Touch Targets (Review Item 20)**:
  - On tablets and mobile screens (\`< 1024px\`), docked sidebars automatically convert to slide-over bottom/side drawers with tactile grab handles.
  - Minimum 44x44px touch hit targets on mobile controls.
  - Sliders and numeric steppers remain fully operable on touch devices without accidental canvas orbiting.

## Acceptance Criteria
- [ ] Pre-execution screenshot audit completed across mobile, tablet, and desktop breakpoints.
- [ ] 3 workspace layouts (Standard, Focus, Presentation) switch seamlessly and persist in \`localStorage\`.
- [ ] Universal interaction states (Default, Hover, Selected, Focused, Disabled) verified across all components.
- [ ] Accessible keyboard navigation with visible focus rings verified on all controls.
- [ ] Mobile and tablet layouts transition sidebars into touch-friendly slide-over drawers.`,
  },
  {
    ticketNumber: 20,
    title: 'Ticket 20: Verification Judges, Visual Regression & Production Readiness',
    labels: ['tracer-bullet', 'enhancement', 'ready-for-agent'],
    state: 'open',
    body: `## Overview
Final verification gate for the complete digital fort crafting diorama studio: full Vitest suites, Playwright visual regression across breakpoints, GPU memory disposal audit, 60 FPS performance benchmark, and deployment documentation.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #19

## Mandatory Pre-Execution Visual Audit & Ticket Refinement Protocol
> [!IMPORTANT]
> Run headless test passes and capture full automated screenshots of all primary workflows (Blueprints -> Sculpting -> Walls -> Spline -> Texture -> Foliage -> Poster Studio) prior to final sign-off.

## Delivers (Updated from former Ticket 15)
- **Vitest Unit & Integration Suites**:
  - Serialization/deserialization byte-size check (<= 35 KB).
  - Zod schema defensive boundaries (NaN rejection, prop limit <= 250).
  - Building foundation geometry bounds and stairs path extrusion tests.
  - Lighting manifest integrity and pyrotechnic variation checks.
  - Poster SVG multi-layer sandwich compositing and diurnal snapshot tests.
- **GPU Resource Disposal Audit**:
  - Verify clean \`.dispose()\` on all textures, materials, and geometries on unmount and tool switching.
  - Zero WebGL memory leaks during repeated terrain regeneration, preset switching, or presentation mode toggles.
- **Performance & Frame Rate Benchmarks**:
  - 60 FPS maintained under 1,000 foliage instances, 50 props/fireworks, 20 foundations, and 100 wall segments.
  - Lighthouse performance score >= 90 with zero layout shift (CLS <= 0.05).
- **Documentation & Deployment**:
  - \`README.md\` updated with comprehensive setup, build, and architecture documentation.
  - Complete asset manifest for retro textures, models, pyrotechnics, and audio.

## Acceptance Criteria
- [ ] \`npm run test\` executes all Vitest suites with 100% pass rate.
- [ ] Playwright visual regression tests pass across desktop, tablet, and mobile viewports.
- [ ] Zero GPU memory leaks on repeated terrain regeneration or scene resets.
- [ ] 60 FPS frame rate maintained under heavy diorama load.
- [ ] \`npm run build\` succeeds without TypeScript or bundling errors.
- [ ] Setup instructions for deployment documented in \`README.md\`.`,
  },
  {
    ticketNumber: 21,
    title: 'Ticket 21: Tactile Soil & Mud Crafting Pipeline (Deferred / Advanced Phase)',
    labels: ['tracer-bullet', 'enhancement', 'deferred'],
    state: 'open',
    body: `## Overview
Deferred advanced organic soil simulation pipeline: loose soil dumping, water saturation, hand-patting, drying & hardening, and freehand mud paint.

- **Status**: \`deferred\`
- **Blocked by**: #3

## Delivers (Updated from former Ticket 14)
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


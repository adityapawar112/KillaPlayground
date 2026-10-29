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
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Interactive 3D spline curve drawing across terrain slopes with procedural conversion to stone stairs, spaced saffron flags, and glowing diyas.

- **Status**: \`ready-for-agent\`
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
- [ ] Spline curve drawing cleanly samples 3D surface points across slopes.
- [ ] Converting to Stone Steps produces walkable stepped terracing conforming to slope gradient.
- [ ] Converting to Flags places spaced saffron flags with wind sway vertex shader.
- [ ] Converting to Divas arranges warm glowing oil lamps along the drawn path.`,
  },
  {
    ticketNumber: 6,
    title: 'Ticket 06: Terrain Texture Painting Studio',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Direct multi-texture painting onto terrain without altering elevation, offering 6 authentic ground textures and smooth weight-map blending.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #3

## Delivers
- **Direct Terrain Texture Painting**:
  - Paints surface textures directly onto the terrain mesh without deforming elevation or affecting placed structures/walls.
- **Authentic Texture Palette**:
  - **Dirt**: Classic red laterite courtyard soil (*Tambdi Maati*).
  - **Sand**: Courtyard silt and beach sand.
  - **Grass**: Lush green ground cover.
  - **Gravel**: Crushed rock and worn pathway trails.
  - **Rock**: Rugged Deccan Basalt cliff escarpments.
  - **Rocky Ground**: Mixed pebble and mountain dirt.
- **Brush Controls**:
  - Adjustable brush radius, opacity/strength, and smooth falloff.
- **Splat / Blend Pipeline**:
  - Multi-texture blending implemented via weight maps in custom terrain shader.

## Acceptance Criteria
- [ ] User can select any texture (Dirt, Sand, Grass, Gravel, Rock, Rocky) and paint onto terrain.
- [ ] Painting gravel cleanly creates natural pathways without modifying terrain height.
- [ ] Painting does not bleed onto or distort walls, splines, or placed figurines.
- [ ] Texture blending transitions smoothly at brush borders.`,
  },
  {
    ticketNumber: 7,
    title: 'Ticket 07: 3D Foliage Paint & Nature Scatter System',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Interactive scatter brush placing low-poly 3D nature props (trees, boulders, shrubs, sprouted mustard/halim seedling clumps) using instanced rendering.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #3

## Delivers
- **3D Asset Scatter Brush**:
  - Interactive scatter brush placing low-poly 3D nature props onto the terrain surface.
- **Asset Selection Library**:
  - **Trees**: Stylized Deccan banyan, neem, and mountain acacia trees.
  - **Rocks**: Scattered basalt boulders and pebbles.
  - **Shrubs**: Hardy mountain scrub and bushes.
  - **Grass Clumps**: 3D sprouted mustard/*halim* seedling models.
- **Scatter Parameters**:
  - Scatter radius slider.
  - Density slider (instances per stroke).
  - Random scale jitter (0.8x to 1.3x) and random Y-axis rotation.
- **Performance Optimization**:
  - Batched rendering via \`<Instances>\` or \`THREE.InstancedMesh\` (1 draw call per asset type).

## Acceptance Criteria
- [ ] Foliage scatter brush places trees, rocks, shrubs, and 3D grass models across the terrain.
- [ ] Scatter radius and density sliders control brush distribution.
- [ ] Objects automatically orient to terrain normal or upright Y-axis.
- [ ] Rendering 1,000+ scattered instances maintains 60 FPS in single batched draw calls.`,
  },
  {
    ticketNumber: 8,
    title: 'Ticket 08: Figurine & Architecture Asset Browser',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Comprehensive 3D asset browser with categorized drawer for Shivaji Maharaj, Mavale, musicians, pre-built fort buildings, artillery, and yard props with raycast placement and transform controls.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #3

## Delivers
- **Categorized Asset Drawer**:
  - Sliding right-side drawer with visual preview cards:
    1. *Royalty & Sinhasan*: Chhatrapati Shivaji Maharaj on the royal throne (*Sinhasan*), ornate canopy (*Meghdambari*).
    2. *Mavale*: Standing spearmen, swordsmen in traditional festive attire.
    3. *Musicians*: Tutari horn blowers, Dhol-Tasha drummers.
    4. *Buildings & Fort Architecture*: Pre-built watchtowers, bastions, temple shrines, fort houses, stone arches (allowing instant architectural staging for time-constrained users).
    5. *Artillery & Yard Props*: Cannons, cannonballs, bullock carts, wooden barrels, paper boats, terracotta diyas.
- **Placement & Transform Controls**:
  - Raycast drag-and-drop onto terrain, walls, or plateau tops.
  - Interactive rotation ring/gizmo to face figurines in any direction.
  - Ground snapping ensuring props sit flush on surfaces.

## Acceptance Criteria
- [ ] Asset drawer opens smoothly with tabs for Royalty, Mavale, Musicians, Buildings, and Props.
- [ ] Pre-built buildings can be placed directly onto terrain or fort decks.
- [ ] Figurines and props can be dragged, dropped, rotated, and positioned accurately.
- [ ] Placed items persist their transform coordinates in the editor store.`,
  },
  {
    ticketNumber: 9,
    title: 'Ticket 09: State Serialization, Local Persistence Adapter & Project Hub',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Complete project state serialization to compact \`.killa\` binary format (< 35 KB), 15-slot undo/redo buffer, local storage persistence vault, and desktop import/export.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #4, #5, #6, #7, #8

## Delivers
- **Undo / Redo Buffer**:
  - 15-slot in-memory circular buffer tracking terrain edits, walls, splines, paint textures, foliage, and placed figurines.
- **Binary Serialization (\`.killa\` format)**:
  - Quantize terrain heightmap and paint weight buffers to \`Uint8Array\`.
  - Package terrain, walls, splines, foliage instances, and figurine transforms with \`fflate.zipSync\` into a compact \`< 35 KB\` binary package.
- **Persistence Adapter & Local Vault**:
  - Local storage / IndexedDB implementation (\`killa_saved_projects_v1\`) persisting named projects with timestamp (\`updatedAt\`), template type, and diorama payload.
  - Startup modal hub displaying recent locally saved projects with relative time elapsed and one-click loading.
- **Project File Import & Export**:
  - Desktop file download of \`.killa\` diorama packages.
  - Native file picker upload to import and restore \`.killa\` files directly into the 3D canvas.
- **Defensive Zod Schema**:
  - Validates inbound project payloads, sanitizing coordinates and rejecting malformed files.

## Acceptance Criteria
- [ ] Undo and redo reliably revert and restore sculpting, wall changes, painting, and prop placements.
- [ ] \`serializeKilla()\` packages complete killa state into <= 35 KB in < 15ms.
- [ ] Projects save to local storage and appear in the startup hub with last-saved timestamps.
- [ ] \`.killa\` files can be exported and re-imported cleanly with identical visual reproduction.
- [ ] Inbound payload schema validates types and rejects corrupted payloads.`,
  },
  {
    ticketNumber: 10,
    title: 'Ticket 10: Showcase, Multi-Angle Festive Poster Studio & Share',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Multi-angle festive poster generation (1080x1920) in < 400ms with Marathi typography, historical templates (Raigad, Murud-Janjira, Sinhagad), and read-only 3D diorama viewer.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #9

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
- [ ] User can customize fort title and builder name in Devanagari or English.
- [ ] "Download Poster" produces a crisp, high-resolution PNG file.
- [ ] Shared link route \`/killa/[id]\` renders the 3D diorama in read-only orbit mode.`,
  },
  {
    ticketNumber: 11,
    title: 'Ticket 11: Tactile Soil & Mud Crafting Pipeline (Deferred / Advanced Phase)',
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
    ticketNumber: 12,
    title: 'Ticket 12: Verification Judges, Testing & Deployment Readiness',
    labels: ['tracer-bullet', 'enhancement'],
    state: 'open',
    body: `## Overview
Verification test harness, Vitest test suites, GPU resource leak audit, 60 FPS performance benchmarks, and deployment documentation.

- **Status**: \`ready-for-agent\`
- **Blocked by**: #10

## Delivers
- **Vitest Unit Tests**:
  - Serialization/deserialization byte-size check (<= 35 KB).
  - Zod schema defensive boundaries (NaN rejection, prop limit <= 250).
  - Terrain height clamping and dirty bounding box arithmetic.
- **GPU Resource Disposal Audit**:
  - Verify clean \`.dispose()\` on all textures, materials, and geometries on unmount.
- **Performance Benchmarks**:
  - 60 FPS maintained under 1,000 foliage instances, 50 props, and 100 wall segments.
- **Documentation**:
  - \`README.md\` with setup and build instructions.
  - Complete asset manifest for textures, models, and audio.

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


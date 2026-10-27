# Killa Playground — Project Roadmap & Tracer Bullet Tickets

This document serves as the master roadmap and tracker for building **Killa Playground**, decomposing the implementation into 8 dependency-ordered tracer-bullet tickets.

---

## Dependency Graph

```
[01-scaffold-tokens] ──▶ [02-3d-scene-terrain] ──▶ [03-sculpting-tools]
                                                            │
    ┌───────────────────────────────────────────────────────┴───────────────────────┐
    ▼                                                                               ▼
[04-paint-studio-splines]                                                [05-props-grass-water]
    │                                                                               │
    └───────────────────────────────────────┬───────────────────────────────────────┘
                                            ▼
                               [06-serialization-local]
                                            │
                                            ▼
                               [07-poster-studio-export]
                                            │
                                            ▼
                               [08-verification-judges]
```

---

## Ticket 01: Project Foundation, Design System Tokens & Responsive Shell

- **Status**: `completed`
- **Blocked by**: None (can start immediately)
- **Delivers**:
  - Initialized Next.js 15 (App Router) + TypeScript + Tailwind CSS application.
  - Complete 3D dependencies (`three`, `@react-three/fiber`, `@react-three/drei`, `three-mesh-bvh`, `three-custom-shader-material`, `fflate`, `zustand`, `zod`, `lucide-react`, `lazy-brush`, `canvas-confetti`).
  - Integrated design tokens from `design.md`:
    - Sun-baked canvas (`#F9F6F0`), Dark Brown mineral ink (`#4B382C`).
    - 6-Color Earth Palette: Terracotta (`#B85F45`), Burnt Clay (`#8F4938`), Sand (`#D8C09D`), Camel (`#B58B63`), Olive (`#777A57`), Basalt Charcoal (`#23211E`).
    - Festive Accents: Bhagwa Saffron (`#E85D04`), Chuna White (`#FAF8F5`), Sprouted Halim Green (`#65A30D`), Crinkled Sea Blue (`#0284C7`), Diya Amber (`#F59E0B`).
  - Google Fonts preloaded in `<head>`: `Yatra One`, `Modak`, and `Inter`.
  - Full-bleed responsive diorama canvas shell with non-blocking floating HUD mounts.

### Acceptance Criteria
- [x] Application compiles and runs with `npm run dev` at `http://localhost:3000`.
- [x] Canvas viewport expands to 100vw × 100vh with `#F9F6F0` foundation.
- [x] Fonts `Yatra One`, `Modak`, and `Inter` load cleanly with zero FOUT.
- [x] Tailwind tokens configured and verified with test elements.

---

## Ticket 02: 3D Scene Core, Camera Rig, Courtyard Bricks & Base Terrain

- **Status**: `ready-for-agent`
- **Blocked by**: `Ticket 01`
- **Delivers**:
  - Three.js `<Canvas frameloop="demand">` with `<OrbitControls>` (bounded polar angles, smooth damping).
  - Courtyard lighting: warm directional sunlight + ambient bounce + night mode moonlight rig.
  - Base Retaining Brick Border: 3D ring of red clay masonry bricks encircling the mud diorama base.
  - Base Terrain: `THREE.PlaneGeometry(10, 10, 255, 255)` (`65,536` vertices) with `<Bvh>` acceleration (< 0.2ms raycasting).
  - Synchronized `stateBuffer` (`Float32Array` of size `256 x 256 x 4` in `THREE.DataTexture`) storing Elevation (R), Wetness (G), Lock (B), and Grass Density (A).
  - PBR texture loading pipeline connecting the supplied PolyHaven textures in `public/textures/`.

### Acceptance Criteria
- [ ] Diorama canvas displays ground plane with courtyard lighting and brick perimeter border.
- [ ] OrbitControls allow smooth 360° orbiting and zooming without clipping beneath the floor.
- [ ] Raycaster intersection against terrain mesh executes in `< 0.2ms` via BVH.
- [ ] `stateBuffer` initialized and bound to terrain shader pipeline.

---

## Ticket 03: Tactile Mud Sculpting State Machine (4 Core Tools)

- **Status**: `ready-for-agent`
- **Blocked by**: `Ticket 02`
- **Delivers**:
  - **Tool 1: Dump Dry Soil**: Adds Gaussian elevation mound with simplex noise roughness to R channel; G wetness set to 0.0.
  - **Tool 2: Pour Water**: Smooths height noise with 3x3 box blur, darkens soil, and increases G channel wetness (+0.15), reducing material roughness from 0.95 to 0.2.
  - **Tool 3: Top Patting**: Levels wet mud ($G > 0.5$) to sampled plane height $H_{target}$, creating flat plateaus, bastion tops, and courtyards.
  - **Tool 4: Side Pushing**: Compresses wet mud ($G > 0.5$) along pointer drag vector into crisp sheer vertical wall faces.
  - **Let Mud Set (Locking)**: Writes 1.0 to B channel, protecting architectural walls from accidental nearby brush deformation.
  - **Partial Dirty-Box Updates**: Updates `PlaneGeometry.attributes.position` strictly inside `[minX..maxX, minY..maxY]`, calling `addUpdateRange` and `bvh.refit()`.

### Acceptance Criteria
- [ ] Dumping soil raises crumbly matte brown mounds.
- [ ] Pouring water visibly softens soil, darkens to rich red wet mud, and adds specular shine.
- [ ] Top patting flattens mounds into smooth horizontal plateaus.
- [ ] Side pushing creates steep vertical wall and bastion profiles.
- [ ] "Let Mud Set" prevents deformation on locked sections.
- [ ] Vertex updates are constrained to dirty bounds without full geometry reallocations.

---

## Ticket 04: Freehand Paint Studio & Spline Extrusion System

- **Status**: `ready-for-agent`
- **Blocked by**: `Ticket 03`
- **Delivers**:
  - **Paint Studio**:
    - Dedicated `1024 x 1024` offscreen paint canvas wrapped in `THREE.CanvasTexture` projected via triplanar mapping.
    - 6 authentic colors: Basalt Charcoal (`#23211E`), Chuna White (`#FAF8F5`), Geru Red-Ochre (`#B85F45`), Tarpaulin Blue (`#0284C7`), Mud Stone (`#B58B63`), Marigold Yellow (`#FBBF24`).
    - 3 brush sizes (XL Base Coat, Medium, Fine Detail Liner).
    - `lazy-brush` steady-hand stabilizer with 12px virtual string for drawing straight white brick divider lines.
  - **Spline Builder**:
    - Interactive 3D point drawing across terrain using `THREE.CatmullRomCurve3`.
    - 1-Click floating conversion context menu:
      1. *Walkway Path*: stamps height flat ribbon + paints Geru red-ochre.
      2. *Stone Steps (Payrya)*: generates horizontal stepped terraced mud boxes climbing the slope.
      3. *Rampart Wall*: extrudes mud wall with automatic round bastions spawned at corners $> 35^\circ$.
      4. *Crenellated Battlements*: alternating merlons along the top ridge.

### Acceptance Criteria
- [ ] Painting with Basalt Charcoal gives an authentic dark stone base coat.
- [ ] Fine white liner brush with steady-hand stabilizer allows drawing straight mortar lines without trackpad jitter.
- [ ] Spline path drawing samples 3D points smoothly across the mud surface.
- [ ] Spline conversion generates extruded rampart walls, stepped mud terraces, and walkways.

---

## Ticket 05: Nature, Water Bodies & Figurine Asset Browser

- **Status**: `ready-for-agent`
- **Blocked by**: `Ticket 03`
- **Delivers**:
  - **Sprouted Halim Grass**:
    - Paints Channel A of `stateBuffer`.
    - Single `THREE.InstancedMesh` rendering 15,000 tiny two-leaf sprout crosses in **1 draw call**.
  - **Water Cisterns & Blue Plastic Sea**:
    - Water plane at $Y = 0.08$. Digging terrain below 0.08 exposes water.
    - Toggle between realistic reflective water and nostalgic crinkled blue plastic tarpaulin sheet.
  - **Figurine & Prop Browser**:
    - Right-side sliding drawer with category tabs: *Royalty & Sinhasan*, *Mavale*, *Artillery*, *Flags & Insignia*, *Festive Props*.
    - Stylized clay diorama models: Chhatrapati Shivaji Maharaj throne, spearman, swordsman, tutari blower, cannons, Bhagwa Dhwaj with swaying vertex shader, paper boats, terracotta diyas.
    - Single draw-call batching per figurine type via `<Instances>`.
    - Drag-and-drop raycast placement, rotation handle, and ground alignment.
    - Night Mode Diya glow: warm additive flame decals at 0.1ms GPU cost.

### Acceptance Criteria
- [ ] Halim grass brush scatters sprouted two-leaf seedlings at 60 FPS in a single draw call.
- [ ] Water plane appears in depressions with functional blue plastic sheet toggle.
- [ ] Figurine drawer opens smoothly; props can be placed, moved, and rotated onto fort surfaces.
- [ ] Toggling Night Diya Mode dims diorama and renders glowing oil lamps along battlements.

---

## Ticket 06: State Serialization, Local Persistence Adapter & Project Hub

- **Status**: `ready-for-agent`
- **Blocked by**: `Ticket 04`, `Ticket 05`
- **Delivers**:
  - **Undo / Redo**: 15-slot in-memory circular buffer storing compressed snapshots of `stateBuffer` + `paintCanvas` + props.
  - **Binary Serialization**:
    - Quantize `stateBuffer` to `Uint8Array`.
    - Export `paintCanvas` as WebP buffer.
    - Compress state + paint + props JSON with `fflate.zipSync` into a compact `< 35 KB` binary package (`.killa` file format).
  - **Persistence Adapter & Local Vault**:
    - Local storage / IndexedDB implementation (`killa_saved_projects_v1`) persisting named projects with timestamp of last save (`updatedAt`), blueprint type, and diorama data.
    - Full project lifecycle methods: `saveProjectLocally()`, `loadProjectLocally()`, `deleteProjectLocally()`.
    - Blender-style startup modal hub displaying recent locally saved projects with relative time elapsed (`Just now`, `5 mins ago`, etc.) and one-click loading.
  - **Project File Import & Export**:
    - Direct desktop file download of `.killa` / `.json` diorama project packages.
    - Native file picker upload to import external or backed-up `.killa` project files directly into the 3D canvas without an active database.
  - **Validation & Future Supabase Bridge**:
    - Defensive Zod validation schema for inbound payloads.
    - Pluggable adapter interface ready for cloud sync and read-only shareable links (`/killa/[id]`).

### Acceptance Criteria
- [ ] Undo and redo reliably revert and restore sculpting, painting, and prop placement operations.
- [ ] `serializeKilla()` packages dirty state + paint + 50 props into $\le 35\text{ KB}$ in $< 15\text{ms}$.
- [ ] Killa state is persisted to local storage and listed in the startup modal with last-saved timestamp.
- [ ] `.killa` / `.json` project files can be downloaded and imported cleanly through the desktop application menu.
- [ ] Inbound payload schema validates types and rejects malformed data.

---

## Ticket 07: Showcase, Multi-Angle Festive Poster Studio & Share

- **Status**: `ready-for-agent`
- **Blocked by**: `Ticket 06`
- **Delivers**:
  - Mode Selection & Blueprints: Raigad, Murud-Janjira, Sinhagad pre-molded terrains with faint chalk outlines, plus Freeform Random Terrain Generator ("Roll New Terrain").
  - **Automated 4-Angle Poster Generator**:
    - Client-side `OffscreenCanvas(1080, 1920)` rendering 4 camera angles:
      1. *Hero Bird's-Eye Overview*.
      2. *Maha Darwaza & Bastion Low-Angle*.
      3. *Balekilla Throne Close-Up*.
      4. *Golden-Hour / Diwali Night Diya Angle*.
    - Traditional Marathi calligraphic header (`Yatra One`) and festive greeting (`Modak`): *"दिवाळीच्या हार्दिक शुभेच्छा"*.
    - Customizable fort name and builder name.
    - Instant high-res PNG/JPG download + `navigator.share()` integration.
  - Shared 3D diorama viewer route `/killa/[id]` (reads serialized state from local store or mock link).

### Acceptance Criteria
- [ ] Mode selection launches historical blueprint scenes (Raigad, Janjira, Sinhagad) or random terrain.
- [ ] "Finish Killa" opens the Poster Studio Modal and generates the 4-angle festive collage in $< 400\text{ms}$.
- [ ] User can customize fort title and builder name in Devanagari or English.
- [ ] "Download Poster" produces a crisp, high-resolution PNG file.
- [ ] Shared link route `/killa/[id]` renders the 3D diorama in read-only orbit mode.

---

## Ticket 08: Verification Judges, Testing & Deployment Readiness

- **Status**: `ready-for-agent`
- **Blocked by**: `Ticket 07`
- **Delivers**:
  - **Vitest Unit Tests**:
    - Serialization/deserialization byte-size check ($\le 35\text{ KB}$).
    - Zod schema defensive boundaries ($NaN$ rejection, prop limit $\le 250$).
    - Terrain height clamping and bounding box arithmetic.
  - **GPU Resource Disposal Audit**:
    - Verify clean `.dispose()` on all textures, materials, and geometries on unmount.
  - Documentation:
    - `README.md` with setup and build instructions.
    - Asset manifest specifying required formats and paths.
    - `External Dependencies and Setup` guide for Vercel and Supabase.

### Acceptance Criteria
- [ ] `npm run test` executes all Vitest suites with 100% pass rate.
- [ ] Zero GPU memory leaks on repeated terrain regeneration or scene resets.
- [ ] `npm run build` succeeds without TypeScript or bundling errors.
- [ ] All external setup instructions for Supabase and Vercel are documented in `README.md`.

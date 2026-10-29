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
| **UI & Toolbar** | **Tailwind CSS + Radix UI / Shadcn UI + `lucide-react`** | Zero-effort accessible sliders (brush size), popovers (texture picker), and drawers (figurine browser). | ₹0 |
| **Client State** | **Zustand** (UI/Tool state ONLY) | Holds active tool (`terrain`, `walls`, `spline`, `terrain_paint`, `foliage_paint`, `figurines`, and deferred soil tools), brush size, and placed figurine array. Never holds 60Hz vertex data. | ₹0 |
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
   * **Multi-Texture Splat Blending (`three-custom-shader-material`):**
     * Multi-texture blending maps **Dirt** (*Tambdi Maati*), **Sand**, **Grass**, **Gravel**, **Rock** (Deccan Basalt), and **Rocky** textures across the mesh.
     * Steep slope escarpments ($N_y < 0.78$) automatically transition into rock cliff faces via triplanar projection to prevent vertical UV stretching.
     * Brush strokes from the **Terrain Paint Tool** write into texture splat weight maps to paint gravel paths, grass greens, or sandy courtyards without affecting geometry.

2. **The Structure & Prop Layer (Walls, Splines, Foliage & Figurines):**
   * Structures exist as discrete meshes positioned atop the terrain surface.
   * Walls and splines conform to terrain elevation dynamically.
   * Figurines, pre-built buildings, and foliage instances calculate their base Y-coordinates and ground normal alignment via BVH raycasting.

---

### 4.2 Tool Taxonomy: Primary Killa Suite vs. Deferred Soil Pipeline

To give users the fastest, most joyful path to crafting a complete fort, tools are divided into the **Primary Killa Suite** (implement first) and the **Tactile Soil Pipeline** (deferred advanced simulation).

#### A. Primary Fort Construction Suite (6 High-Velocity Tools)

1. **Terrain Tool (Base Mesh Manipulation):**
   * Directly sculpts the mountain terrain mesh:
     * *Elevate:* Raises organic hillocks and ridges.
     * *Lower:* Depresses valleys and defensive moats.
     * *Plateau / Level:* Flattens sampled vertices to $H_{target}$ for building platforms and courtyards.
     * *Smooth:* Softens steep edges using a 3x3 box blur filter.
     * *Pond Excavation:* Depresses terrain below $Y < 0.08$ to automatically uncover the water plane.

2. **Walls Tool (Parametric Fort Ramparts & Bastions):**
   * Spline/segment-driven parametric procedural geometry pipeline conforming directly to terrain elevation.
   * Built specifically for builders who want fort ramparts immediately without soil sculpting.
   * **Procedural Geometry Engine (`wallGeometry.ts` & `GeometryBuilder`):**
     * *Resampling & Bilinear Height Sampling:* Resamples centerline wall vertices uniformly at 0.04m intervals, computing bilinear heights (`sampleBilinearHeight`) from `stateBuffer` with continuous elevation adherence.
     * *Multi-Material Group Partitioning (`BufferGeometry.addGroup`):*
       * **Group 0 (Wall & Tower Sides):** Mossy stone brick masonry (`mossy_stone_brick_128x128_pbr`) with retro pixel `NearestFilter` and repeat wrapping.
       * **Group 1 (Walkways & Tower Floors):** Crushed gravel (`Gravel_01`) for rampart walkway strips and circular tower floor disks.
       * **Group 2 (Battlements & Trims):** Solid dark basalt stone (`dark_stone_texture_128x128_pbr`) for pointed crenellations (*kangare*), gateway soffits, and plinths.
     * *Authentic Murud-Janjira Pointed Crenellations:* Custom procedural merlons with pointed tops and arrow slit embrasures, oriented outward using 2D polygon centroid testing (closed paths) and downhill terrain gradient sampling (open paths).
     * *Tower Exclusion Zones:* Automatically excludes wall crenellations within the cylindrical footprint of bastions ($r = \text{bastionRadius}$) and flanking gatehouse towers ($r = 0.20\text{m}$), preventing internal geometry clipping.
     * *Watertight Maha Darwaza Arched Gate:* Procedurally cuts wall ribbons, constructs solid side jambs and arched soffits, and builds a continuous upper walkway over the lintel connecting to flanking stone towers.
     * *Miniature Tabletop Scaling:* 10x miniature scaling (wall height: 10cm to 100cm, thickness: 5cm to 40cm, foundation embedding: 12mm).
   * **Magnetic Snap Hologram Engine (`calculateMagneticSnap`):**
     * Linear raycast snapping algorithm with Euclidean thresholds: 0.45m for Buruj vertex snapping and 0.60m for arched gate segment snapping.
     * Interpolation parameter $t$ is clamped to $[0.15, 0.85]$ along the segment, preventing gates from colliding with corner bastions.
     * Renders real-time holographic snap previews with green/amber rings, arch volumes, and orientation indicators.
   * **State Machine & Synchronous Undo Architecture:**
     * 3-Step Stepper: `layout` (drawing) $\rightarrow$ `fortify` (interactive editing & magnetic placement) $\rightarrow$ `solidified` (clean diorama presentation).
     * `useEditorStore` integrates top-level synchronous `pushUndoSnapshot()` directly preceding store mutations, capturing pre-mutation states synchronously and eliminating microtask race conditions with `terrainStore`.

3. **Spline Tool (Linear Structure Placement):**
   * Draws 3D curves along the terrain surface using `THREE.CatmullRomCurve3`.
   * **Conversion Options:**
     * *Stone Steps (*Payrya*):* Generates stepped horizontal terraces ascending slopes.
     * *Bhagwa Flag Lines:* Arranges waving swallowtail saffron flags at uniform intervals.
     * *Divas / Diyas:* Places glowing terracotta oil lamps along path curves for evening illumination.
   * *(Note: Walking paths are painted using the Terrain Paint Tool).*

4. **Terrain Paint Tool (Surface Texture Brush):**
   * Directly paints textures onto the terrain mesh without affecting structures, walls, or figurines.
   * **Selectable Textures:** Dirt (*Tambdi Maati*), Sand, Grass, Gravel (paths), Rock (Basalt cliff), Rocky Ground.
   * **Controls:** Brush radius, opacity/strength, falloff edge.

5. **Foliage Paint Tool (3D Nature Scatter Brush):**
   * Scatter brush that places low-poly 3D nature props directly onto terrain.
   * **Selectable Assets:** Trees (banyan, neem, acacia), Rocks (basalt boulders, pebbles), Shrubs (mountain bushes), 3D Grass Sprout Models (*Halim* seedlings).
   * **Controls:** Scatter radius, density slider, random scale jitter, random rotation.
   * **Performance:** Single draw call per asset type via `<Instances>`.

6. **Figurines & Architecture Tool (3D Asset Browser):**
   * Sliding visual catalog for placing and rotating 3D diorama props:
     * *Royalty & Sinhasan:* Shivaji Maharaj on the royal throne (*Sinhasan*), canopy (*Meghdambari*).
     * *Mavale:* Spearmen, swordsmen, sentries.
     * *Musicians:* Tutari horn blowers, Dhol-Tasha drummers.
     * *Buildings & Fort Architecture:* Pre-built watchtowers, bastions, temple shrines, fort houses, stone arches. (Allows instant architectural staging for time-constrained users).
     * *Artillery & Yard Props:* Cannons, carts, barrels, paper boats, terracotta diyas.
   * Raycast drag-and-drop placement, rotation handle, and ground alignment.

---

#### B. Deferred Tactile Soil Pipeline (Advanced Organic Simulation)
An optional authentic simulation layer to be implemented in a subsequent phase:
1. **Soil Tool:** Adds loose dry soil mounds onto the diorama base.
2. **Water Tool:** Pours water over soil mounds, increasing wetness and specular gloss (`cracked_red_ground_1k`).
3. **Shaping Tool:** Hand trowel pushing (left/right vertical walls) and top patting (horizontal plateaus).
4. **Drying & Mud Locking Tool:** Hardens wet mud into immutable stone (`lockState = 1.0`).
5. **Freehand Mud Paint Tool:** Large/medium/fine brush with `lazy-brush` stabilizer for hand-painting dark basalt base coats and white lime (*chuna*) mortar lines over dried mud masses.

---

### 4.3 Client-Side 4-Angle Festive Poster Generator (₹0 Server Cost)
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

## 5. Database Schema & Binary Serialization (`fflate`)

### Binary Packing Architecture
Rather than storing hundreds of thousands of raw JSON numbers:
1. Quantize terrain heightmap and texture splat weights into compact `Uint8Array` buffers.
2. Compress terrain, walls, splines, foliage instances, and figurine JSON with **`fflate.zipSync`** into a single `.killa` binary package of **`~18–30 KB`**.

### Supabase SQL Schema (1 Table + 1 Storage Bucket)

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
2. **Fake Clustered Glow for Diyas (Night Mode):**
   * Use 1 global directional moonlight + warm ambient fill, rendering Diya flames with unlit emissive materials and distance-attenuated decal glows at **0.1ms GPU cost**.
3. **On-Demand Frame Loop (`frameloop="demand"`):**
   * Invalidate frames only on pointer interaction, camera orbit, or festive flame animation to reduce idle CPU/GPU load to 0%.

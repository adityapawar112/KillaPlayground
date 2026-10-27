# Technical Architecture & System Design: Diwali Killa Sandbox

## 1. Ponytail Engineering Philosophy (The 7-Rung Audit)
Every architectural choice in this document climbs the **7-Rung Ladder of Laziness** to eliminate custom boilerplate, server costs, and 3 AM debugging:

1. **YAGNI (Cut completely):** No user authentication, no server-side 3D rendering, no custom voxel/marching-cubes engine, no WebSockets, and no backend image-processing queues.
2. **Standard Library / Native Platform First:**
   * Poster generation uses the browser's native `OffscreenCanvas` + `CanvasRenderingContext2D` + `navigator.share()` instead of a Node.js Puppeteer server.
   * Surface painting uses an offscreen HTML5 `<canvas>` wrapped in `THREE.CanvasTexture` rather than a custom WebGL render-target ping-pong pipeline.
   * Undo/Redo stores compressed `Uint8Array` snapshots in a 15-slot circular array in memory.
3. **Existing Libraries Over Custom Math:**
   * Raycasting acceleration uses `three-mesh-bvh` (3 lines of setup) instead of custom quadtrees.
   * Shader blending uses `three-custom-shader-material` on top of `THREE.MeshStandardMaterial` instead of writing PBR lighting from scratch.
   * Grass distribution uses `@react-three/drei` `<Instances>` / `<Sampler>` instead of custom GPU compute shaders.

---

## 2. Zero-Cost Tech Stack

| Layer | Technology / Library | Why This Exists (Ponytail Justification) | Cost |
| :--- | :--- | :--- | :--- |
| **App Framework** | **Next.js 15 (App Router, Static + Edge)** or **Vite + React 19** | Static shell for the editor (`/build`) + dynamic OpenGraph metadata route (`/killa/[id]`) for shared links. | ₹0 |
| **3D Engine** | **Three.js + `@react-three/fiber` + `@react-three/drei`** | Declarative scene graph, built-in `<OrbitControls>`, `<Instances>`, `<Decal>`, `<Extrude>`, and GLTF loader caching. | ₹0 |
| **Raycasting** | **`three-mesh-bvh` + `@react-three/drei` (`<Bvh>`)** | Wraps the terrain mesh in a Bounding Volume Hierarchy so pointer raycasts take `< 0.2ms` instead of `14ms`. | ₹0 |
| **Shader Extension** | **`three-custom-shader-material` (CSM)** | Injects wetness gloss, triplanar mud/cliff textures, and user paint layers into standard Three.js materials without rewriting shadows or lights. | ₹0 |
| **UI & Toolbar** | **Tailwind CSS + Radix UI / Shadcn UI + `lucide-react`** | Zero-effort accessible sliders (brush size), popovers (color picker), and drawers (figurine browser). | ₹0 |
| **Client State** | **Zustand** (UI/Tool state ONLY) | Holds active tool (`soil`, `water`, `push_side`, `push_top`, `spline`, `paint`, `grass`, `prop`), brush size, and placed figurine array. Never holds 60Hz vertex data. | ₹0 |
| **Payload Compression** | **`fflate`** | Compresses raw heightmap + paint canvas buffers by ~85% in `< 8ms` on the client so we don't need file-storage buckets for every small fort. | ₹0 |
| **Validation** | **Zod** | Validates incoming JSON/binary payloads on the save API route to prevent malformed data or oversized payload attacks. | ₹0 |
| **Database & Storage** | **Supabase (Free Tier: Postgres + Storage)** | 500MB Postgres database + 1GB Object Storage for compressed killa states and shared poster thumbnails. | ₹0 |
| **Hosting & CDN** | **Vercel (Hobby Free) or Cloudflare Pages** | Global edge caching for static `.glb` models, basis-compressed `.ktx2` textures, and fort heightmaps. | ₹0 |
| **Testing & Judges** | **Vitest + Playwright + `r3f-perf`** | Deterministic unit tests for buffer compression and automated headless WebGL frame-time/memory assertions. | ₹0 |

---

## 3. High-Level Design (HLD) & Data Flow

The system is 95% client-computed. The backend is a dumb persistence pipe that only wakes up when a user clicks **"Share Killa"** or opens a friend's shared link.


```

┌─────────────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT (WebGL2)                          │
│                                                                         │
│  ┌─────────────────────┐      ┌──────────────────────────────────────┐  │
│  │ Static CDN Assets   │      │ GPU / TypedArray Memory (60 FPS)     │  │
│  │ • 6 Fort DEM PNGs   │─────▶│ 1. State DataTexture (256x256 RGBA)  │  │
│  │ • 15 Draco .glb     │      │    R: Height | G: Wetness            │  │
│  │ • KTX2 Mud Textures │      │    B: Locked | A: Halim Grass        │  │
│  └─────────────────────┘      │ 2. Paint CanvasTexture (1024x1024)   │  │
│                               │ 3. Spline & Prop Transform Array     │  │
│                               └──────────────┬───────────────────────┘  │
│                                              │                          │
│  ┌───────────────────────────────────────────▼───────────────────────┐  │
│  │                     On "Finish & Share" Click                     │  │
│  │  • Path A (Poster): 4-Camera Render -> OffscreenCanvas -> PNG     │  │
│  │  • Path B (3D Link): State Buffers -> fflate.zlibSync (~25 KB)    │  │
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

## 4. Low-Level Design (LLD) — How Every Mechanics Feature Works

### 4.1 The Terrain & Mud Physics State Machine (No Voxels Needed)
Instead of complex 3D voxel chunks, the terrain is a single `THREE.PlaneGeometry(10, 10, 255, 255)` (`65,536` vertices) backed by two CPU/GPU synchronized buffers:

1. **`stateBuffer` (`Float32Array` of size `256 * 256 * 4` wrapped in `THREE.DataTexture`):**
   * **Channel R (`height`):** Current elevation of the mud at `(u, v)`.
   * **Channel G (`wetness`):** `0.0` (dry crumbly soil) to `1.0` (wet glossy malleable mud).
   * **Channel B (`lockState`):** `0.0` (active mud) or `1.0` ("Let Mud Set" locked architectural mass).
   * **Channel A (`grassDensity`):** `0.0` to `1.0` density of sprouted *halim* seeds.
2. **`paintCanvas` (`HTMLCanvasElement` of size `1024 x 1024` wrapped in `THREE.CanvasTexture`):**
   * Stores all user brushwork (black charcoal walls, white brick lines, red-ochre paths, blue plastic pond tint).

#### How the 4 Mud-Building Tools Mutate `stateBuffer`
When the user drags the mouse, `<Bvh>` raycasting returns the exact `uv` intersection `(u, v)` and `face.normal` in `< 0.2ms`. We iterate over a circular brush radius $r$ around `(u * 256, v * 256)`:

| Active Tool | Mathematical Operation on `stateBuffer` at `(x, y)` | Visual Result |
| :--- | :--- | :--- |
| **1. Dump Dry Soil** | If `B (lock) == 0`: Add Gaussian falloff $\Delta h$ to `R (height)` and set `G (wetness) = 0.0` + add high-frequency Simplex noise (`simplex-noise` package). | Pours a rough, bumpy mound of matte light-brown dry soil. |
| **2. Pour Water** | Set `G (wetness) = clamp(G + 0.15, 0, 1)` and apply a $3\times3$ box-blur to `R (height)` to melt away the dry soil noise. | Soil visibly darkens to rich wet *tambdi maati*, gains specular shine (`roughness: mix(0.95, 0.2, wetness)`), and softens. |
| **3. Top Patting (Level Plane)** | **Requires `G (wetness) > 0.5`.** On `pointerDown`, sample target height $H_{target} = R(u_0, v_0)$. While dragging, `R(x,y) = lerp(R(x,y), H_target, 0.4)`. | Flattens uneven wet mud mounds from above into crisp horizontal plateaus, roofs, and bastion decks. |
| **4. Side Pushing (Walls & Blocks)** | **Requires `G (wetness) > 0.5`.** Compute pointer drag vector $\vec{d}$. For pixels ahead of $\vec{d}$ inside a rectangular box kernel, clamp elevation to a step function (`R(x,y) = max(R(x,y), H_ridge)`) and zero out the slope gradient behind $\vec{d}$. | Compresses sloped mud walls from the side into sheer vertical faces and solid rectangular/cylindrical blocks. |

> `// ponytail: After mutating stateBuffer inside the brush radius, update PlaneGeometry.attributes.position.array ONLY for indices inside the dirty bounding box [minX..maxX, minY..maxY], then call position.addUpdateRange(offset, count) and computeVertexNormals() before recomputing BVH refit().`

---

### 4.2 Triplanar Material & Freehand Brick Painting
Wait—if we push a heightmap into a vertical $90^\circ$ wall, won't the top-down `1024x1024` paint canvas stretch vertically along the wall face?
* **The Fix (2 Policies Combined):**
  1. **For Terrain & Sloped Ramparts:** The `1024x1024` `CanvasTexture` projects with **Triplanar Mapping** inside `three-custom-shader-material` (blending X, Y, and Z planar projections based on `abs(vNormal)`).
  2. **For Crisp Vertical Walls, Bridges & Spline Blocks:** Every solid block or spline wall created by the user is a distinct low-poly `THREE.Mesh` (box, cylinder bastion, or extruded spline) with automatic non-overlapping box UV unwrapping (`THREE.BoxGeometry` / `ExtrudeGeometry` native UVs).
  * When the user enters **Paint Mode** and selects a wall or block, `<Bvh>` raycasting returns `intersection.uv` on that mesh's dedicated `512x512` `OffscreenCanvas` texture.
  * **Steady-Hand Brick Line Stabilizer:** Instead of writing custom bezier smoothing, wrap pointer coordinates in the tiny **`perfect-freehand`** or **`lazy-brush`** npm package (3 KB). When the user drags the fine white brush with "Steady Hand" enabled, `lazy-brush` trails the cursor with a virtual string length of `12px`, producing dead-straight horizontal and vertical white *chuna* mortar lines even with a shaky laptop trackpad.

---

### 4.3 The Spline Builder (Walkways, Stone Steps & Battlements)
We use Three.js's built-in `THREE.CatmullRomCurve3` so we write zero curve math:

1. **Drawing the Line:** As the user drags across the mud with the **Spline Tool**, we sample a 3D point every `0.25` world units from the raycaster and feed the points into `new THREE.CatmullRomCurve3(points)`.
2. **Converting the Curve (1-Click Menu):**
   * **Option A: Walkway Path:** Iterate along `curve.getSpacedPoints(100)`. Stamp the underlying `stateBuffer` height to match the curve's $Y$ coordinate (flattening a ribbon into the mud) and draw a base coat of *Geru* red-ochre onto `paintCanvas`.
   * **Option B: Stone Steps (*Payrya*):** Sample the curve length $L$. Divide $L$ by step depth $d = 0.15$. Spawn an `<Instances>` group of beveled rectangular mud-step boxes at each parameter $t_i = i / N$, where position is `curve.getPointAt(t_i)` and Y-rotation is `Math.atan2(tangent.x, tangent.z)`.
   * **Option C: Rampart Wall + Auto-Bastions:** Pass a rectangular wall cross-section `THREE.Shape` into `<Extrude args={[wallShape, { extrudePath: curve, steps: 64 }]} />`. Calculate angle deltas between consecutive tangents; wherever $\Delta\theta > 35^\circ$, automatically spawn a cylindrical bastion (`THREE.CylinderGeometry`) at that vertex.
   * **Option D: Crenellated Battlements:** Same as Option B, placing alternating merlon blocks along the top ridge of any spline curve at fixed intervals.

---

### 4.4 Sprouted *Halim* Grass & Blue Plastic Sheet Water
* **Greenery (*Halim* Sprouts):**
  * Pre-allocate a single `THREE.InstancedMesh` of `15,000` tiny two-leaf sprout crosses (4 triangles per sprout = 60k triangles total, rendered in **1 draw call**).
  * When the user paints with the **Greenery Brush**, we increment `Channel A (grassDensity)` in `stateBuffer` and append an instance transformation matrix at `(x, height, z)` with random Y-rotation and scale `[0.8..1.3]`.
* **Water Tanks (*Taki*) & Coastal Sea:**
  * Add a single flat water plane at $Y = 0.08$. Where the user digs terrain below $Y = 0.08$, water naturally appears in the pit.
  * **"Blue Plastic Sheet" Toggle:** Switches the water plane's `MeshStandardMaterial` between normal reflective water (`roughness: 0.1, color: '#0ea5e9'`) and crinkled blue tarpaulin (`roughness: 0.4, color: '#0284c7'`, normalMap: procedurally crumpled noise texture).

---

### 4.5 Client-Side 4-Angle Festive Poster Generator (₹0 Server Cost)
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

### Why Binary Packing Instead of JSON?

Storing `65,536` height floats as a JSON array takes ~600 KB per fort (hitting Supabase's 500 MB database limit in just 800 forts). Instead:

1. Quantize `stateBuffer` (`256x256x4`) to `Uint8Array` (`262 KB` raw).
2. Export user paint layers as WebP data buffers (`~15 KB`).
3. Pack both + the JSON array of placed figurines/splines into a single binary payload using **`fflate.zipSync({ state, paint, meta })`** — shrinking the entire fort to **`~18–28 KB`**.

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

1. **Draco & Meshopt Geometry Compression (`gltf-transform`):**
* Run `npx @gltf-transform/cli optimize input.glb output.glb --compress meshopt --texture-compress webp` once during build time. Reduces a 15 MB *Sinhasan* / *Mavala* pack down to **< 700 KB total**.


2. **Single Draw-Call Figurine Batching:**
* All placed *Mavale* guards, cannons, diyas, and paper boats use `@react-three/drei`'s `<Instances limit={100}>` per figurine type. Placing 50 guards costs **1 draw call**, not 50.


3. **Fake Clustered Glow for Diyas (Night Mode):**
* Creating 40 real `THREE.PointLight` objects with shadow maps will crash mobile WebGL shaders (`MAX_FRAGMENT_UNIFORM_VECTORS`).
* **The Fix:** Use **1 global Moon `DirectionalLight**` + **1 warm `HemisphereLight**`, and give every placed Diya an unlit orange emissive flame sprite + a projected radial orange additive `<Decal>` (or distance-attenuated point glow inside the terrain CSM fragment shader). Looks identical to 40 point lights at **0.1ms GPU cost**.


4. **On-Demand Frame Loop (`frameloop="demand"`):**
* Set `<Canvas frameloop="demand">` when the user isn't actively dragging a brush or orbiting the camera (with a subtle `useFrame` invalidation only when Night Mode diya flicker is toggled on). Drops laptop battery drain and idle GPU usage to 0%.



---

## 7. Complete Free Asset Directory (Where to Get Everything)

### A. Real Killa Topologies (Raw DEM Heightmaps)

Do not sculpt historical forts by hand. Extract their real 30-meter satellite elevation in 15 minutes using **QGIS** (or the browser plugin **Heightmap.skydark.pl** / **Tangram Heightmapper**):

| Fort Name | Exact Lat / Long Bounding Box | Source for Raw 16-bit Heightmap | Source for Chalk Wall Footprint |
| --- | --- | --- | --- |
| **Raigad** | `18.2347° N, 73.4463° E` | **OpenTopography SRTM GL1 (30m)** or `elevationapi.com` free DEM crop | OpenStreetMap Overpass: `way["historic"="castle"](18.22,73.43,18.25,73.46);` |
| **Murud-Janjira** | `18.2999° N, 72.9644° E` | Coastal island contour via **OSM Coastline + SRTM** | OSM Way ID `156934821` (exact oval bastion perimeter with 19 buruj nodes) |
| **Pratapgad** | `17.9339° N, 73.5806° E` | **OpenTopography NASADEM** | OSM Way ID `239104212` (Upper Balekilla & Machi walls) |
| **Sinhagad** | `18.3663° N, 73.7559° E` | **USGS EarthExplorer / SRTM** or **Bhuvan NRSC CartoDEM (ISRO Open Data)** | OSM Overpass query on Sinhagad plateau cliff boundary |
| **Vijaydurg** | `16.5606° N, 73.3333° E` | **OpenTopography SRTM** | OSM triple-layered coastal rampart polygon |

### B. 3D Models (`.glb` Figurines, Thrones, Cannons & Props)

* **Ready-to-Download Sketchfab CC-Attribution Models:**
* **Raigad Meghdambari & Throne (*Sinhasan*):** Search Sketchfab tag `#raigad` or `#shivajimaharajhistory` (includes downloadable low-poly *Meghdambari - Raigad*, *Nagarkhana*, and *Jagadishwar Temple* blocks).
* **Cannons (*Toph*) & Paper Boats:** **Poly Pizza (`poly.pizza`)** — search `"cannon"` (CC0 low-poly naval/fort cannon by Quaternius) and `"paper boat"` (CC0 origami boat).
* **Terracotta Diyas:** **Sketchfab CC0 / Poly Pizza** — search `"diya"` or generate a 64-vertex lathe geometry directly in Three.js (`new THREE.LatheGeometry(points, 16)` — 0 KB external asset needed!).


* **Generating Cohesive "Kumbharwada Clay Toy" Mavale Figurines (Free):**
* Use **Meshy.ai (Free Tier: 200 credits/month)** or **Tripo3D (Free Tier)** with the prompt:
> *"Miniature hand-painted glossy terracotta clay toy figurine of an 17th-century Maratha soldier Mavala wearing bright yellow angarkha tunic and red pagdi turban, holding a spear, standing on a tiny flat clay base, Indian Diwali killa toy style, low-poly"*


* Export as `.glb` with vertex colors / single `512x512` diffuse texture. You only need **5 static poses** (Maharaj seated, Maharaj standing, Spearman, Swordsman, Tutari Horn Blower).



### C. PBR Mud, Brick & Stone Textures (100% CC0 Public Domain)

* **Dry Red Laterite Soil (*Tambdi Maati*):** **PolyHaven (`polyhaven.com/textures`)** — *Red Mud Stones* or *Brown Mud Dry 01* (download `1K` JPG/WebP diffuse + normal map).
* **Wet Glossy Clay:** Same texture—just drive `roughness` down from `0.9` to `0.15` and darken `color` by `40%` inside the shader using the `wetness` channel! (Saves downloading a second texture).
* **Base Courtyard Red Bricks:** **AmbientCG (`ambientcg.com`)** — *Bricks075* or *Clay002* (for the perimeter containment bricks around the mud pile).
* **Marathi Festive Display Fonts:** **Google Fonts (100% Free OFL):**
* **`Yatra One`** and **`Modak`** for bold, traditional Marathi/Devanagari fort titles on the generated poster.



---

## 8. External Verification Judges (Definition of Done)

Before deploying, run these three deterministic checks (do not self-grade):

1. **Frame-Time Judge (`r3f-perf` + Playwright CPU/GPU Throttling):**
* Run an automated Playwright script that drags the `Water` and `Side Push` brushes across the canvas for 120 frames with 10,000 *Halim* grass instances active.
* **Pass Criterion:** `window.__R3F_PERF__.fps >= 55` and max frame delta `< 20ms`.


2. **Binary Compression & Security Judge (Vitest):**
* Feed a dirty `256x256x4` state buffer + `1024x1024` painted brick canvas + 100 prop transforms into `serializeKilla()`.
* **Pass Criterion:** Output `Uint8Array.byteLength <= 35_000` (35 KB), decompression takes `< 15ms`, and Zod rejects any payload with `props.length > 250` or out-of-bounds NaN coordinates.


3. **Zero GPU Leak Judge:**
* Trigger **"Roll New Terrain"**, **Spline Extrude**, and **"Generate Poster"** 20 times in a loop.
* **Pass Criterion:** `gl.info.memory.textures` and `gl.info.memory.geometries` return to their exact baseline integer after each reset (`dispose()` verified).


